# KRONOS — Briefing Completo para Claude Code

## O QUE É O PROJETO

Sistema de gestão de hardware agrícola chamado **KRONOS**.
Dois usuários distintos, dois HTMLs distintos, uma base de dados compartilhada (Google Sheets).

- **Analista de escritório** → `fleet-hardware.html` (painel desktop)
- **Técnico de campo** → `tecnico-campo.html` (app mobile, offline-first)
- **Backend** → Google Apps Script (`Code.gs`) publicado como Web App
- **Banco de dados** → Google Sheets com 3 abas: `maquinas`, `hardwares`, `registros`

---

## ARQUIVOS DO PROJETO

```
kronos/
├── fleet-hardware.html     ← painel do analista (desktop)
├── tecnico-campo.html      ← app do técnico (mobile)
├── Code.gs                 ← backend Google Apps Script
└── SETUP.md                ← guia de configuração
```

Todos os arquivos já existem e estão funcionais. O trabalho no Claude Code é:
1. Receber esses arquivos
2. Implementar melhorias e correções descritas abaixo
3. Manter a arquitetura existente (sem frameworks, HTML puro + JS vanilla)

---

## ARQUITETURA

```
[tecnico-campo.html]          [fleet-hardware.html]
    |                               |
    | POST (registro)               | GET (leitura)
    |                               |
    └──────── Apps Script URL ──────┘
                    |
             Google Sheets
          ┌──────────────────┐
          │ aba: maquinas    │  cadastro de máquinas
          │ aba: hardwares   │  cadastro de hw + maquinaAtual
          │ aba: registros   │  log de serviços do técnico
          └──────────────────┘
```

**Regra central:** quando o técnico registra um serviço, o Apps Script:
1. Grava na aba `registros` (log imutável)
2. Atualiza `maquinaAtual` na aba `hardwares` (estado atual)

---

## STACK TÉCNICA

- HTML5 + CSS3 + JavaScript vanilla (sem frameworks, sem build tools)
- Google Apps Script (JavaScript server-side do Google)
- Google Sheets como banco de dados
- `localStorage` para offline-first no mobile
- Fonte: JetBrains Mono (Google Fonts, pesos 300–800) — diferenciação por peso, tamanho e tom de cor

---

## DESIGN SYSTEM

```css
/* Cores principais */
--bg: #0a0c0f
--surface: #111318
--surface2: #181c24
--surface3: #1e2330
--border: #252b38
--border2: #2e3648
--accent: #f5a623        /* laranja — cor primária do KRONOS */
--accent2: #e8870a
--green: #2ecc8a
--red: #e05252
--blue: #4a9eff
--text: #e8ecf4
--text2: #8a94a8
--text3: #4a5468
--trator: #f5a623
--motoniveladora: #4a9eff
--colhedora: #2ecc8a
--estoque: #4a9eff
--manutencao: #e05252

/* Tipografia */
font-family: 'JetBrains Mono', monospace   /* única fonte — diferenciação por peso/tamanho/cor */
font-family: 'JetBrains Mono', monospace  /* IDs, S/N, dados técnicos */
```

---

## DADOS — MÁQUINAS

111 máquinas ativas na frota + 2 destinos virtuais:

**Tipos reais:**
- `trator` — 79 máquinas (JD, Case, Valtra, Fendt)
- `colhedora` — 26 máquinas (JD, Case)
- `motoniveladora` — 6 máquinas (JD 620G)

**Destinos virtuais (sem hardware instalável, só recebem transferências):**
- `estoque` — ID: `ESTOQUE`
- `manutencao` — ID: `MANUTENCAO`

**Campos de máquina:**
```
id | nome | tipo | ano | unidade | chassi | patrimonio | centroCusto | criadoEm
```

**Unidades existentes:** PEDRA, CEDRO, BURITI, IPÊ, PEDRA/LOCAÇÃO

---

## DADOS — HARDWARES

5 tipos com seus modelos:

| tipo | label | emoji | modelos disponíveis |
|------|-------|-------|---------------------|
| `monitor` | MONITOR | 🖥️ | RAVEN, CFX 750, EZ GUIDE, OMNI, PRO 700, GS3, GS4, XCN 1050, XCN 1060 |
| `receptor` | RECEPTOR | 📡 | StarFire 3000, StarFire 6000, StarFire 7000 |
| `radio` | RÁDIO | 📻 | 450 |
| `tela` | TELA | 📱 | S7, SOL7 |
| `bordo` | BORDO | 🔧 | MAG 100, MAG X |

**Campos de hardware:**
```
id | nome | tipo | modelo | numeroDeSerie | patrimonio | fabricante | firmware | maquinaAtual | instaladoEm
```

**Agrupamento por sistema:**
- Piloto Automático: monitor, receptor, radio
- Solinftec: tela, bordo

---

## AÇÕES DO TÉCNICO

```
install   → instala hardware numa máquina
            maquinaAtual = machineId

remove    → remove hardware de uma máquina
            maquinaAtual = '' (vai para estoque implicitamente)

transfer  → move hardware de uma máquina para outra
            maquinaAtual = machineDestId
            destinos válidos: qualquer máquina + ESTOQUE + MANUTENCAO
```

---

## ESTRUTURA DO REGISTRO (POST para o Apps Script)

```javascript
{
  id: 'REG-1234567890',        // timestamp
  action: 'install|remove|transfer',
  techName: 'Nome do Técnico',
  machineId: '55804',
  machineName: 'TRATOR JD (7230J)',
  machineDestId: '',           // só em transfer
  machineDestName: '',         // só em transfer
  hwId: 'MON-001',
  hwSn: 'SN-123456',
  hwName: 'GS3',
  hwType: 'monitor',
  hwModelo: 'GS3',
  hwPatrimonio: '12345',
  gpsLat: '-21.123456',
  gpsLng: '-47.654321',
  gpsAcc: '5',
  dateTime: '2025-06-01T14:30',
  notes: 'Observações...',
  synced: false,
  createdAt: '2025-06-01T14:30:00.000Z'
}
```

---

## CONFIGURAÇÃO

Em ambos os HTMLs existe esta linha que precisa ser preenchida com a URL do Apps Script:

```javascript
const APPS_SCRIPT_URL = 'COLE_SUA_URL_AQUI';
```

A URL tem formato:
```
https://script.google.com/macros/s/AKfycbx.../exec
```

---

## PLANILHA GOOGLE SHEETS

- **ID da planilha:** `1foNe3qL7Kr8zTk2qltqAxNYA2bcMM3q_Bm5kDPq9dpY`
- **Nome:** KRONOS
- **URL:** https://docs.google.com/spreadsheets/d/1foNe3qL7Kr8zTk2qltqAxNYA2bcMM3q_Bm5kDPq9dpY/edit

**Aba `maquinas`** — colunas:
`id | nome | tipo | ano | unidade | chassi | patrimonio | centroCusto | criadoEm`

**Aba `hardwares`** — colunas:
`id | nome | tipo | modelo | numeroDeSerie | patrimonio | fabricante | firmware | maquinaAtual | instaladoEm`

**Aba `registros`** — colunas:
`id | acao | tecnico | maquinaId | maquinaNome | maquinaDestinoId | maquinaDestinoNome | hardwareId | hardwareSN | hardwareNome | hardwareTipo | hardwareModelo | hardwarePatrimonio | gpsLat | gpsLng | gpsAcc | dataHora | observacoes | sincronizadoEm`

---

## STATUS ATUAL DO PROJETO

### ✅ Funcionando
- Painel do analista com lista de máquinas, busca avançada, filtros por tipo
- Detalhe da máquina com grid de hardware
- Transferência de hardware entre máquinas no painel
- Formulário mobile offline-first com sincronização automática
- Apps Script com GET (leitura) e POST (gravação + atualização de maquinaAtual)
- Estoque e Manutenção como destinos virtuais
- 111 máquinas reais no Code.gs prontas para popular a planilha
- Design system dark/industrial consistente nos dois HTMLs

### 🔧 PENDENTE / MELHORIAS DESEJADAS

#### Alta prioridade
1. **Conectar a URL do Apps Script** — após o deploy, colar a URL gerada nos dois HTMLs
2. **Rodar `setupPlanilha()`** — popular a planilha com as 111 máquinas reais
3. **Testar fluxo completo** — técnico registra → planilha atualiza → analista vê

#### Funcionalidades a implementar
4. **Aba de Histórico no painel do analista** — ver log de todos os registros da aba `registros`, com filtros por máquina, técnico, tipo de ação, período
5. **Busca por chassi/patrimônio** no painel — o chassi já está no dado mas não aparece na busca
6. **Filtro por unidade** no painel (PEDRA, CEDRO, BURITI, IPÊ)
7. **Adicionar máquina via painel** — o botão "+ Máquina" existe mas só funciona localmente, precisa salvar na planilha via POST
8. **Adicionar hardware via painel** — mesmo caso do "+ Hardware"
9. **Página de relatório** — quantos hardwares por tipo, quais máquinas sem hardware, histórico de movimentações

#### Melhorias UX
10. **No formulário do técnico** — ao selecionar a máquina origem em "Transferir", filtrar os hardwares disponíveis mostrando apenas os que estão nela (`maquinaAtual === machineId`)
11. **Confirmação visual** antes de registrar no formulário do técnico — resumo do que será registrado
12. **Campo de busca de máquina** no formulário do técnico — com 111 máquinas a lista fica longa, precisa de um filtro rápido

---

## CONVENÇÕES DE CÓDIGO

```javascript
// Nomenclatura em português para dados do domínio
// Nomenclatura em inglês para variáveis de UI/lógica

// Dados da planilha usam snake_case em português:
// nome, tipo, maquinaAtual, numeroDeSerie, centroCusto

// Dados mapeados para o JS usam camelCase em inglês:
// name, type, currentMachine, serialNumber, costCenter

// Funções principais:
loadFromSheets()      // carrega dados do Apps Script
renderAll()           // re-renderiza toda a UI
renderDetail(id)      // renderiza detalhe de uma máquina
showToast(type, icon, title, sub)  // notificações
openModal(id) / closeModal(id)     // modais
```

---

## COMO TESTAR SEM A PLANILHA

Ambos os HTMLs funcionam com dados demo quando `APPS_SCRIPT_URL === 'COLE_SUA_URL_AQUI'`.
Basta abrir o arquivo no navegador diretamente — nenhum servidor necessário.

Para testar o `tecnico-campo.html` em mobile:
- Abrir no Chrome DevTools → modo responsivo → iPhone 14 Pro
- Ou servir via `npx serve .` e acessar pelo celular na mesma rede

---

## OBSERVAÇÕES IMPORTANTES

1. **Sem frameworks** — o projeto inteiro é HTML/CSS/JS vanilla por escolha. Não introduzir React, Vue, etc.
2. **Sem build tools** — arquivos abertos diretamente no navegador
3. **CORS no Apps Script** — o `doPost` e `doGet` já retornam com `ContentService`, o que resolve CORS automaticamente
4. **Offline-first obrigatório** no mobile — técnico pode estar sem sinal. O `localStorage` é a fila de sincronização
5. **Uma planilha, dois clientes** — nunca duplicar dados. A planilha é a fonte da verdade
6. **O `setupPlanilha()` limpa e recria** as abas — rodar só uma vez na configuração inicial ou quando quiser resetar
