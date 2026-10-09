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
--
-- As regras que já existem no banco (ex.: registros não podem ser apagados)
-- são mantidas: a exigência de sessão entra como regra RESTRITIVA, somada às
-- atuais. Tabela que estava sem RLS ganha uma regra que libera tudo para quem
-- tem sessão (o mesmo que valia antes, agora só com login).
-- ══════════════════════════════════════════════════════════════════

begin;

-- O PIN em texto deixa de existir de vez.
drop trigger if exists kronos_tecnicos_pin on public.tecnicos;
drop function if exists public.kronos_tecnicos_pin();
alter table public.tecnicos drop column if exists pin;

do $$
declare
  t      text;
  com_rls boolean;
begin
  foreach t in array array['maquinas', 'hardwares', 'registros', 'hw_tipos', 'maq_tipos', 'unidades', 'fabricantes'] loop
    if to_regclass('public.' || t) is null then continue; end if;
    select relrowsecurity into com_rls from pg_class where oid = ('public.' || t)::regclass;
    if not com_rls then
      execute format('alter table public.%I enable row level security', t);
      execute format('drop policy if exists kronos_sessao on public.%I', t);
      execute format('create policy kronos_sessao on public.%I for all to anon, authenticated
                        using (true) with check (true)', t);
    end if;
    execute format('drop policy if exists kronos_exige_sessao on public.%I', t);
    execute format('create policy kronos_exige_sessao on public.%I as restrictive for all to anon, authenticated
                      using ((select public.kronos_sessao_atual()) is not null)
                      with check ((select public.kronos_sessao_atual()) is not null)', t);
  end loop;
end $$;

-- Técnicos: leitura livre (é a lista do login, sem segredo); escrita só pelas
-- funções do painel (kronos_tecnico_salvar / kronos_tecnico_remover).
revoke insert, update, delete, truncate on public.tecnicos from anon, authenticated;

commit;
