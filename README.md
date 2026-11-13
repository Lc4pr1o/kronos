# KRONOS

Controle de hardware embarcado (pilotos automáticos, rádios, telas Solinftec) da frota agrícola: em que máquina cada equipamento está, quem instalou ou removeu, e quando.

São duas páginas HTML estáticas que falam direto com um banco Supabase. Não tem servidor próprio, build nem dependência de pacote.

| Quem usa | Página | Como usa |
|---|---|---|
| Analista de escritório | `fleet-hardware.html` | Desktop. Cadastra máquinas, hardwares, técnicos e catálogos, consulta histórico, exporta `.xlsx` |
| Técnico de campo | `tecnico-campo.html` | Celular. Registra instalação, remoção e transferência; funciona offline e envia quando volta a ter sinal |

`index.html` é só a página de entrada com os dois links. Arquitetura, tabelas, domínio e design system estão em [KRONOS_BRIEFING.md](KRONOS_BRIEFING.md).

## Onde cada coisa está

| Peça | Local | Dono |
|---|---|---|
| Código | GitHub `lmalerbo/kronos` | conta corporativa |
| Site publicado | GitHub Pages: `https://lmalerbo.github.io/kronos/` (branch `main`, raiz) | conta corporativa |
| Banco | Supabase, projeto `fevzqjeybsnjznespplr` | organização Supabase corporativa |

Publicar é dar push no `main`: o GitHub Pages republica sozinho em um ou dois minutos.

A URL do Supabase e a chave pública (`sb_publishable_…`) ficam no começo do `<script>` de cada HTML (`SUPABASE_URL` e `SUPABASE_KEY`). Essa chave é pública por desenho: quem protege os dados são as regras de RLS e as funções do banco. **Nunca coloque a chave `service_role` em nenhum HTML.**

## Banco

Os scripts SQL foram rodados à mão no SQL Editor do Supabase, nesta ordem:

1. [supabase-setup.sql](supabase-setup.sql): tabelas, RLS e dados iniciais.
2. [seguranca/01-pin-e-sessoes.sql](seguranca/01-pin-e-sessoes.sql): PIN dos técnicos criptografado (bcrypt) e login por sessão no banco.
3. [seguranca/02-trava-tabelas.sql](seguranca/02-trava-tabelas.sql): tabelas só aceitam escrita com sessão válida. O próprio arquivo explica como conferir se já foi aplicado.
4. [seguranca/03-excluir-maquinas.sql](seguranca/03-excluir-maquinas.sql): permite excluir máquinas pelo painel.

Não existe ferramenta de migração. Mudança de schema é um novo arquivo SQL numerado em `seguranca/` (ou pasta equivalente), rodado no SQL Editor e commitado aqui.

## Rodar local

Qualquer servidor estático serve. No Windows, [iniciar-kronos.bat](iniciar-kronos.bat) sobe `python -m http.server 3000`, libera a porta no firewall e mostra o endereço para abrir no celular na mesma rede. Local ou publicado, as páginas usam o mesmo banco de produção.

## Cuidados

- **Os registros offline ficam no navegador do técnico** (`localStorage`, chave `fleetRegistros`), presos ao endereço do site. Antes de mudar o endereço (domínio, hospedagem, nome do repositório), peça a todos os técnicos que abram o app com internet e confirmem que o contador de "registros pendentes" está em zero. O que não foi enviado não aparece no endereço novo.
- **Login:** painel e app do técnico entram com nome + PIN, conferido no banco. O PIN de um técnico se define ao editá-lo na tela Técnicos do painel.
- **Plano gratuito do Supabase:** projeto parado por 7 dias sem acesso é pausado e precisa ser reativado no painel.
- **Repositório público:** o GitHub Pages gratuito só publica repositório público. Para tornar o repositório privado é preciso um plano pago do GitHub ou outra hospedagem.
- `proposta-a.html` e `proposta-b.html` são estudos visuais antigos; podem ser apagados.

## Pendências conhecidas

- A tabela `maquinas` ainda não tem a coluna `modelo`, que o painel já usa localmente.
- Histórico com filtros por máquina, técnico e período.
- Confirmação visual antes de registrar, no app do técnico.
- Busca de máquina no formulário do técnico (são cerca de 111).

## Histórico

A primeira versão usava Google Sheets + Apps Script (`Code.gs`, `SETUP.md`). Foi substituída pelo Supabase e removida do repositório; está no histórico do git se alguém precisar consultar.
