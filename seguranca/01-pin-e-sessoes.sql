-- ══════════════════════════════════════════════════════════════════
-- KRONOS — Segurança, etapa 1 de 2: PIN protegido e login no banco
-- Rodar uma vez no SQL Editor do Supabase (nova query).
--
-- Antes: o PIN ficava em texto aberto na tabela tecnicos, legível pela chave
-- pública, e era conferido no navegador — qualquer um entrava como qualquer
-- técnico.
-- Depois desta etapa:
--   · o PIN só existe criptografado (bcrypt) em kronos_pins, que a chave
--     pública não lê; a coluna tecnicos.pin fica sempre vazia (um gatilho
--     criptografa o que chegar nela, para versões antigas abertas do painel);
--   · o login é conferido no banco (kronos_entrar), com limite de 5 tentativas
--     erradas a cada 15 minutos por técnico, e devolve uma sessão de 90 dias
--     (renovada a cada uso) que o app manda no cabeçalho x-kronos-sessao;
--   · cadastro de técnicos e PIN só pelo painel (kronos_tecnico_salvar /
--     kronos_tecnico_remover), com sessão do painel;
--   · cada registro grava em "enviadoPor" quem estava logado ao enviar.
-- As tabelas continuam abertas nesta etapa (as versões antigas dos apps que
-- estiverem abertas nos celulares não podem perder registro). A etapa 2
-- (02-trava-tabelas.sql) fecha as tabelas para quem não tem sessão.
-- ══════════════════════════════════════════════════════════════════

begin;

create extension if not exists pgcrypto with schema extensions;

-- ── PIN criptografado ────────────────────────────────────────────
create table if not exists public.kronos_pins (
  nome          text primary key,
  hash          text not null,
  atualizado_em timestamptz not null default now()
);

alter table public.tecnicos add column if not exists tem_pin boolean not null default false;

insert into public.kronos_pins (nome, hash)
select nome, extensions.crypt(pin, extensions.gen_salt('bf', 8))
  from public.tecnicos
 where coalesce(pin, '') <> ''
on conflict (nome) do update set hash = excluded.hash, atualizado_em = now();

update public.tecnicos t
   set tem_pin = exists (select 1 from public.kronos_pins p where p.nome = t.nome),
       pin = null;

-- Versões antigas do painel ainda gravam "pin" em texto: criptografa e apaga.
create or replace function public.kronos_tecnicos_pin()
returns trigger language plpgsql security definer set search_path = public, extensions as $$
begin
  if coalesce(new.pin, '') <> '' then
    insert into public.kronos_pins (nome, hash)
    values (new.nome, extensions.crypt(new.pin, extensions.gen_salt('bf', 8)))
    on conflict (nome) do update set hash = excluded.hash, atualizado_em = now();
    new.tem_pin := true;
  end if;
  new.pin := null;
  return new;
end $$;
drop trigger if exists kronos_tecnicos_pin on public.tecnicos;
create trigger kronos_tecnicos_pin before insert or update on public.tecnicos
  for each row execute function public.kronos_tecnicos_pin();

-- ── Sessões e tentativas ─────────────────────────────────────────
create table if not exists public.kronos_sessoes (
  token     uuid primary key default gen_random_uuid(),
  tecnico   text not null,
  app       text not null check (app in ('campo', 'painel')),
  criada_em timestamptz not null default now(),
  expira_em timestamptz not null default now() + interval '90 days'
);
create index if not exists kronos_sessoes_tecnico on public.kronos_sessoes (tecnico);

create table if not exists public.kronos_tentativas (
  nome text not null,
  em   timestamptz not null default now(),
  ok   boolean not null
);
create index if not exists kronos_tentativas_nome on public.kronos_tentativas (nome, em);

-- Token do cabeçalho x-kronos-sessao (nulo se ausente ou malformado).
create or replace function public.kronos_token()
returns uuid language plpgsql stable as $$
declare v text;
begin
  v := current_setting('request.headers', true)::json ->> 'x-kronos-sessao';
  if v ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then return v::uuid; end if;
  return null;
exception when others then
  return null;
end $$;

-- Quem está logado nesta requisição (nulo = sem sessão válida).
create or replace function public.kronos_sessao_atual()
returns text language sql stable security definer set search_path = public as $$
  select s.tecnico
    from public.kronos_sessoes s
    join public.tecnicos t on t.nome = s.tecnico and t.ativo is not false
   where s.token = public.kronos_token() and s.expira_em > now();
$$;

create or replace function public.kronos_sessao_painel()
returns text language sql stable security definer set search_path = public as $$
  select s.tecnico
    from public.kronos_sessoes s
    join public.tecnicos t on t.nome = s.tecnico and t.ativo is not false
   where s.token = public.kronos_token() and s.expira_em > now() and s.app = 'painel';
$$;

-- Login: devolve {"token","nome"} ou {"erro"}. PIN errado não levanta exceção
-- (senão a tentativa registrada seria desfeita junto).
create or replace function public.kronos_entrar(p_nome text, p_pin text, p_app text default 'campo')
returns json language plpgsql security definer set search_path = public, extensions as $$
declare
  v_hash  text;
  v_token uuid;
begin
  if p_app not in ('campo', 'painel') then return json_build_object('erro', 'Aplicativo inválido.'); end if;
  delete from public.kronos_tentativas where em < now() - interval '1 day';
  delete from public.kronos_sessoes where expira_em < now();
  if (select count(*) from public.kronos_tentativas
       where nome = p_nome and not ok and em > now() - interval '15 minutes') >= 5 then
    return json_build_object('erro', 'Muitas tentativas erradas. Aguarde 15 minutos e tente de novo.');
  end if;
  select p.hash into v_hash
    from public.kronos_pins p
    join public.tecnicos t on t.nome = p.nome and t.ativo is not false
   where p.nome = p_nome;
  if v_hash is null or coalesce(p_pin, '') = '' or extensions.crypt(p_pin, v_hash) <> v_hash then
    insert into public.kronos_tentativas (nome, ok) values (coalesce(p_nome, ''), false);
    return json_build_object('erro', 'PIN incorreto.');
  end if;
  insert into public.kronos_tentativas (nome, ok) values (p_nome, true);
  insert into public.kronos_sessoes (tecnico, app) values (p_nome, p_app) returning token into v_token;
  return json_build_object('token', v_token, 'nome', p_nome);
end $$;

-- Confere a sessão do cabeçalho e renova por mais 90 dias. Nulo = refazer login.
create or replace function public.kronos_validar()
returns text language plpgsql security definer set search_path = public as $$
declare v_nome text;
begin
  v_nome := public.kronos_sessao_atual();
  if v_nome is not null then
    update public.kronos_sessoes set expira_em = now() + interval '90 days' where token = public.kronos_token();
  end if;
  return v_nome;
end $$;

create or replace function public.kronos_sair()
returns void language sql security definer set search_path = public as $$
  delete from public.kronos_sessoes where token = public.kronos_token();
$$;

-- Cadastro de técnico pelo painel. Parâmetro nulo = mantém o valor atual.
-- Trocar o PIN ou desativar derruba as sessões abertas daquela pessoa.
create or replace function public.kronos_tecnico_salvar(
  p_nome text, p_cargo text default null, p_pin text default null,
  p_ativo boolean default null, p_novo boolean default false)
returns void language plpgsql security definer set search_path = public, extensions as $$
declare
  v_quem text := public.kronos_sessao_painel();
  v_nome text := trim(coalesce(p_nome, ''));
begin
  if v_quem is null then raise exception 'Faça login no painel para alterar técnicos.'; end if;
  if v_nome = '' then raise exception 'Informe o nome.'; end if;
  if coalesce(p_pin, '') <> '' and p_pin !~ '^\d{4}$' then raise exception 'O PIN precisa ter exatamente 4 dígitos.'; end if;
  if p_novo then
    if exists (select 1 from public.tecnicos where nome = v_nome) then
      raise exception 'Já existe um técnico com esse nome.';
    end if;
    insert into public.tecnicos (nome, cargo, ativo) values (v_nome, coalesce(p_cargo, ''), coalesce(p_ativo, true));
  else
    if not exists (select 1 from public.tecnicos where nome = v_nome) then raise exception 'Técnico não encontrado.'; end if;
    if v_nome = v_quem and p_ativo is false then raise exception 'Você não pode desativar o seu próprio acesso.'; end if;
    update public.tecnicos
       set cargo = coalesce(p_cargo, cargo), ativo = coalesce(p_ativo, ativo)
     where nome = v_nome;
  end if;
  if coalesce(p_pin, '') <> '' then
    insert into public.kronos_pins (nome, hash) values (v_nome, extensions.crypt(p_pin, extensions.gen_salt('bf', 8)))
    on conflict (nome) do update set hash = excluded.hash, atualizado_em = now();
    update public.tecnicos set tem_pin = true where nome = v_nome;
    delete from public.kronos_sessoes where tecnico = v_nome and token is distinct from public.kronos_token();
  end if;
  if p_ativo is false then
    delete from public.kronos_sessoes where tecnico = v_nome;
  end if;
end $$;

create or replace function public.kronos_tecnico_remover(p_nome text)
returns void language plpgsql security definer set search_path = public as $$
declare v_quem text := public.kronos_sessao_painel();
begin
  if v_quem is null then raise exception 'Faça login no painel para alterar técnicos.'; end if;
  if p_nome = v_quem then raise exception 'Você não pode remover o seu próprio cadastro.'; end if;
  delete from public.tecnicos where nome = p_nome;
  delete from public.kronos_pins where nome = p_nome;
  delete from public.kronos_sessoes where tecnico = p_nome;
end $$;

-- ── Quem enviou cada registro ────────────────────────────────────
alter table public.registros add column if not exists "enviadoPor" text;

create or replace function public.kronos_registro_enviado_por()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new."enviadoPor" := public.kronos_sessao_atual();
  return new;
end $$;
drop trigger if exists kronos_registro_enviado_por on public.registros;
create trigger kronos_registro_enviado_por before insert on public.registros
  for each row execute function public.kronos_registro_enviado_por();

-- ── Permissões ───────────────────────────────────────────────────
alter table public.kronos_pins       enable row level security;
alter table public.kronos_sessoes    enable row level security;
alter table public.kronos_tentativas enable row level security;
revoke all on public.kronos_pins, public.kronos_sessoes, public.kronos_tentativas from anon, authenticated;

revoke all on function public.kronos_tecnicos_pin()            from public, anon, authenticated;
revoke all on function public.kronos_registro_enviado_por()    from public, anon, authenticated;
grant execute on function public.kronos_token()                to anon, authenticated;
grant execute on function public.kronos_sessao_atual()         to anon, authenticated;
grant execute on function public.kronos_sessao_painel()        to anon, authenticated;
grant execute on function public.kronos_entrar(text, text, text) to anon, authenticated;
grant execute on function public.kronos_validar()              to anon, authenticated;
grant execute on function public.kronos_sair()                 to anon, authenticated;
grant execute on function public.kronos_tecnico_salvar(text, text, text, boolean, boolean) to anon, authenticated;
grant execute on function public.kronos_tecnico_remover(text)  to anon, authenticated;

commit;

-- Conferência (deve mostrar 0 PINs em texto e os técnicos com PIN):
-- select count(*) filter (where coalesce(pin,'') <> '') as pins_em_texto,
--        count(*) filter (where tem_pin) as com_pin, count(*) as tecnicos from tecnicos;
