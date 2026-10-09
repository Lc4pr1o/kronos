-- ══════════════════════════════════════════════════════════════════
-- KRONOS — Segurança, etapa 2 de 2: tabelas só com sessão
-- Rodar SÓ depois que todos os celulares estiverem na versão nova do app
-- (a etapa 1 + o app novo publicados há alguns dias). Para conferir antes:
--
--   select "tecnico", max("sincronizadoEm") as ultimo_envio_app_antigo
--     from registros
--    where "enviadoPor" is null and "sincronizadoEm" > (now() - interval '3 days')::text
--    group by 1;
--
-- Se aparecer alguém, essa pessoa ainda está com o app antigo aberto: peça
-- para fechar e abrir de novo o app de campo antes de rodar este arquivo.
--
-- Depois desta etapa a chave pública sozinha não lê nem grava nada: só a
-- lista de técnicos (nome, cargo, ativo, tem PIN) para a tela de login.
-- ══════════════════════════════════════════════════════════════════

begin;

-- O PIN em texto deixa de existir de vez.
drop trigger if exists kronos_tecnicos_pin on public.tecnicos;
drop function if exists public.kronos_tecnicos_pin();
alter table public.tecnicos drop column if exists pin;

-- Tabelas de dados: tudo exige sessão válida (cabeçalho x-kronos-sessao).
do $$
declare
  t   text;
  pol record;
begin
  foreach t in array array['maquinas', 'hardwares', 'registros', 'hw_tipos', 'maq_tipos', 'unidades', 'fabricantes'] loop
    if to_regclass('public.' || t) is null then continue; end if;
    execute format('alter table public.%I enable row level security', t);
    for pol in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy %I on public.%I', pol.policyname, t);
    end loop;
    execute format('create policy kronos_sessao on public.%I for all to anon, authenticated
                      using ((select public.kronos_sessao_atual()) is not null)
                      with check ((select public.kronos_sessao_atual()) is not null)', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select, insert, update, delete on public.%I to anon, authenticated', t);
  end loop;
end $$;

-- Técnicos: leitura livre (é a lista do login, sem segredo); escrita só pelas
-- funções do painel (kronos_tecnico_salvar / kronos_tecnico_remover).
alter table public.tecnicos enable row level security;
do $$
declare pol record;
begin
  for pol in select policyname from pg_policies where schemaname = 'public' and tablename = 'tecnicos' loop
    execute format('drop policy %I on public.tecnicos', pol.policyname);
  end loop;
end $$;
create policy kronos_lista_login on public.tecnicos for select to anon, authenticated using (true);
revoke all on public.tecnicos from anon, authenticated;
grant select on public.tecnicos to anon, authenticated;

commit;
