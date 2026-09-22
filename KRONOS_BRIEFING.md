# KRONOS — Briefing

## O que é

Sistema de gestão de hardware agrícola. Dois usuários, dois HTMLs, uma base Supabase.

- **Analista de escritório** → `fleet-hardware.html` (desktop, leitura + gestão)
- **Técnico de campo** → `tecnico-campo.html` (mobile, offline-first, registra ações)

---

## Arquitetura

```
[tecnico-campo.html]          [fleet-hardware.html]
    |                               |
    | POST registros                | GET maquinas/hardwares/registros
    |                               |
    └──────────── Supabase REST API ─┘
                      |
              Supabase (PostgreSQL)
```

**Convenções de código:**
- Nomes de domínio em português (`maquinaAtual`, `numeroDeSerie`, `centroCusto`)
- Nomes de variáveis de UI em inglês camelCase (`currentMachine`, `serialNumber`)
- Sem frameworks, sem build tools — HTML/CSS/JS vanilla puro
- `localStorage` para offline-first no mobile

---

## Backend — Supabase

**URL:** `https://fevzqjeybsnjznespplr.supabase.co`  
**Chave pública (anon):** `sb_publishable_DIYe_vM9kLVk05PGjGrq9Q_Rr6n-mr9`  
**RLS:** deve estar ativo. Nunca usar `service_role` no frontend.

### Tabelas

| Tabela | Descrição |
|--------|-----------|
| `maquinas` | Cadastro de máquinas (`id, nome, tipo, ano, unidade, chassi, patrimonio, centroCusto, criadoEm`) |
| `hardwares` | Cadastro de hw (`id, nome, tipo, modelo, numeroDeSerie, patrimonio, fabricante, firmware, maquinaAtual, instaladoEm`) |
| `registros` | Log imutável de ações do técnico (`id, acao, tecnico, maquinaId, maquinaNome, maquinaDestinoId, maquinaDestinoNome, hardwareId, hardwareSN, hardwareNome, hardwareTipo, hardwareModelo, hardwarePatrimonio, gpsLat, gpsLng, gpsAcc, dataHora, observacoes, sincronizadoEm`) |
| `hw_tipos` | Catálogo de tipos de hardware (id, label, cor, modelos[]) |
| `maq_tipos` | Catálogo de tipos de máquina (id, label, cor, modelos[], fabricantes[]) |
| `unidades` | Unidades da fazenda (nome) |
| `fabricantes` | Fabricantes de hardware (nome) |
| `tecnicos` | Técnicos de campo (nome, role, ativo) |

**Regra central:** quando o técnico registra um serviço (`install / remove / transfer`):
1. Grava na tabela `registros` (log imutável)
2. Atualiza `maquinaAtual` na tabela `hardwares` (estado atual)

---

## Domínio

**Máquinas:** ~111 ativas em 5 unidades (PEDRA, CEDRO, BURITI, IPÊ, PEDRA/LOCAÇÃO)

| Tipo | Qtd | Cor |
|------|-----|-----|
| trator | ~79 | `#f5a623` |
| colhedora | ~26 | `#2ecc8a` |
| motoniveladora | ~6 | `#4a9eff` |

**Destinos virtuais** (recebem transferências, não instalam hardware):
- `estoque` — ID: `ESTOQUE`
- `manutencao` — ID: `MANUTENCAO`

**Hardwares — 5 tipos:**

| Tipo | Sistema | Modelos |
|------|---------|---------|
| monitor | Piloto Automático | RAVEN, CFX 750, GS3, GS4, XCN 1050/1060… |
| receptor | Piloto Automático | StarFire 3000/6000/7000 |
| radio | Piloto Automático | 450 |
| tela | Solinftec | S7, SOL7 |
| bordo | Solinftec | MAG 100, MAG X |

---

## Design system

```css
/* Paleta — 3 tons de azul-escuro como níveis de profundidade */
--bg: #1e2130           /* fundo principal */
--sidebar-bg: #242739   /* sidebar */
--surface: #2b2f45      /* cards/painéis */
--text: #f3f5fb
--text2: #9599b3
--text3: #5c6280
--gradient: linear-gradient(135deg, #f5a623, #e8870a 45%, #2ecc8a)   /* laranja→verde */
--gradient-blue: linear-gradient(135deg, #4fd1ff, #8b9dff)
--radius: 18px

/* Tipografia */
Poppins — base (títulos, labels, botões)
JetBrains Mono — IDs, S/N, dados técnicos, rótulos de tipo nos cards
```

---

## Estrutura de navegação (fleet-hardware.html)

Sidebar colapsável (76px ↔ 232px) com 6 views:

1. **Dashboard** — KPIs + barra de hardwares por tipo + timeline de movimentações
2. **Frota** — chips de filtro por tipo → grid de cards → detalhe com grid de hardware instalado + histórico da máquina
3. **Hardwares** — chips de filtro por tipo → grid de cards → detalhe + transferência; seção separada para Estoque/Manutenção
4. **Histórico** — log de registros
5. **Técnicos** — CRUD de técnicos
6. **Configurações** — CRUD de tipos de hw/máquina, unidades, fabricantes

---

## Status atual

### Funcionando
- Painel do analista completo (CRUD de hw, máquinas, tipos, técnicos)
- Busca global (máquinas, hardwares individualmente, S/N, chassi)
- Transferência de hardware entre máquinas
- Export `.xlsx` com 3 abas (Hardwares / Frotas / Frotas+Hardwares)
- Formulário do técnico mobile offline-first

### Pendente / melhorias desejadas
- `modelo` de máquina individual: existe localmente mas a tabela `maquinas` no Supabase ainda não tem a coluna
- Histórico com filtros (por máquina, técnico, período) na view Histórico
- Confirmação visual antes de registrar no formulário do técnico
- Campo de busca de máquina no formulário do técnico (111 máquinas = lista longa)
