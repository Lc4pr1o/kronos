-- ══════════════════════════════════════════════════════════════════
-- KRONOS — Segurança, etapa 3: permite excluir máquinas
-- Rodar uma vez no SQL Editor do Supabase.
--
-- A tabela `hardwares` já tinha uma regra de RLS que permite excluir
-- (por isso "Remover hardware" sempre funcionou). A tabela `maquinas`
-- já tinha RLS antes do KRONOS existir, mas sem regra de exclusão —
-- por isso excluir uma máquina sempre falhava silenciosamente (a API
-- respondia 204 OK, mas não apagava nada). A exigência de sessão
-- (public.kronos_sessao_atual() is not null) continua valendo por
-- cima, via a regra restritiva kronos_exige_sessao já existente.
-- ══════════════════════════════════════════════════════════════════

begin;

drop policy if exists kronos_excluir_maquinas on public.maquinas;
create policy kronos_excluir_maquinas on public.maquinas
  for delete to anon, authenticated using (true);

-- limpeza: registro de teste criado durante o diagnóstico
delete from public.maquinas where id = 'DELTEST1';

commit;
