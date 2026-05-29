# KRONOS — Guia de Setup
## Como conectar os dois HTMLs ao Google Sheets em ~15 minutos

---

## O QUE VOCÊ VAI TER NO FINAL

```
Google Sheets (banco de dados)
    │
    ├── aba: maquinas       ← cadastro de máquinas
    ├── aba: hardwares      ← cadastro de hardwares + qual máquina está
    └── aba: registros      ← log de tudo que o técnico registrou
    │
    ▼
Apps Script (servidor gratuito dentro do Google)
    │
    ├── fleet-hub.html      ← painel do analista lê daqui
    └── tecnico-campo.html  ← formulário do técnico envia pra cá
```

---

## PASSO 1 — Criar a planilha Google Sheets

1. Acesse [sheets.google.com](https://sheets.google.com)
2. Clique em **+ Em branco** para criar uma nova planilha
3. Renomeie para **KRONOS — Dados** (clique no título no topo)
4. Deixe a planilha aberta — você vai precisar dela no próximo passo

---

## PASSO 2 — Colar o Apps Script

1. Com a planilha aberta, clique em **Extensions → Apps Script**
   (ou **Extensões → Apps Script** se estiver em português)
2. Uma nova aba vai abrir com o editor de código
3. **Apague** todo o código que aparece (o `function myFunction() {}`)
4. **Cole** todo o conteúdo do arquivo `Code.gs` que foi gerado
5. Clique no ícone de **salvar** 💾 (ou Ctrl+S)

---

## PASSO 3 — Criar as abas e dados iniciais

1. Ainda no Apps Script, no menu de funções no topo, selecione `setupPlanilha`
2. Clique no botão **▶ Executar**
3. Na primeira vez, o Google vai pedir permissão — clique em:
   - **Review permissions**
   - Escolha sua conta Google
   - Clique em **Advanced** → **Go to KRONOS (unsafe)**
   - Clique em **Allow**
4. Aguarde a execução. No log embaixo vai aparecer:
   `✅ Planilha configurada com sucesso!`
5. Volte na planilha — as 3 abas já estarão criadas com os dados demo

---

## PASSO 4 — Publicar como Web App (gera a URL)

1. No Apps Script, clique em **Deploy → New deployment**
2. Clique no ícone de engrenagem ⚙️ ao lado de "Select type" e escolha **Web app**
3. Preencha assim:
   - **Description:** KRONOS v1
   - **Execute as:** Me (seu e-mail)
   - **Who has access:** Anyone
4. Clique em **Deploy**
5. Autorize novamente se pedir (mesmos passos do Passo 3)
6. **Copie a URL** que aparecer — ela vai ser algo como:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```
   > ⚠️ Guarde essa URL. É ela que conecta tudo.

---

## PASSO 5 — Colar a URL nos dois HTMLs

Abra os dois arquivos no VS Code e substitua a linha:

```javascript
const APPS_SCRIPT_URL = 'COLE_SUA_URL_AQUI';
```

Pela URL que você copiou:

```javascript
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx.../exec';
```

Faça isso nos dois arquivos:
- `fleet-hub.html` (painel do analista)
- `tecnico-campo.html` (formulário do técnico)

---

## PASSO 6 — Testar

1. Abra o `tecnico-campo.html` no celular (ou no navegador em modo mobile)
2. Selecione **Instalar**, escolha uma máquina e um hardware
3. Clique em **Registrar Serviço**
4. Abra a planilha — uma nova linha deve aparecer na aba **registros**
5. Abra o `fleet-hub.html` — o hardware deve aparecer na máquina correta

---

## FLUXO DO DIA A DIA

```
TÉCNICO EM CAMPO
  └── Abre tecnico-campo.html no celular
  └── Preenche: tipo de serviço + máquina + hardware
  └── Registra → salva localmente (funciona offline)
  └── Quando tiver internet → sincroniza automaticamente

ANALISTA NO ESCRITÓRIO
  └── Abre fleet-hub.html no computador
  └── Clica em "Atualizar" para buscar dados da planilha
  └── Vê todas as máquinas e hardwares atualizados
  └── Pode auditar o histórico direto no Google Sheets
```

---

## DÚVIDAS COMUNS

**O técnico não tem internet no campo — o que acontece?**
O formulário salva tudo no celular. Quando ele chegar numa área com sinal,
os registros pendentes sincronizam automaticamente em segundo plano.
O ícone no topo do app muda de 🔴 Offline para 🟢 Online.

**Posso adicionar mais técnicos?**
Sim. Basta enviar o arquivo `tecnico-campo.html` para cada um.
Cada registro vai incluir o nome do técnico que informou.

**E se eu precisar adicionar mais tipos de máquina ou hardware?**
Edite diretamente na aba `maquinas` ou `hardwares` da planilha.
Os dois HTMLs vão puxar os dados atualizados automaticamente.

**Como atualizo os dados sem recarregar a página inteira?**
No painel do analista há um botão de atualizar. No formulário do técnico,
os dados são carregados ao abrir o app.

**Preciso redeployar o Apps Script toda vez que mudar o código?**
Sim. Após qualquer alteração no `Code.gs`:
Deploy → Manage deployments → edite o deployment existente → salve.

---

## ESTRUTURA DA PLANILHA

### Aba `maquinas`
| id | nome | tipo | ano | patrimonio | criadoEm |
|----|------|------|-----|-----------|---------|

### Aba `hardwares`
| id | nome | tipo | numeroDeSerie | firmware | fabricante | maquinaAtual | instaladoEm |
|----|------|------|---------------|----------|-----------|-------------|------------|

### Aba `registros`
| id | acao | tecnico | maquinaId | maquinaNome | maquinaDestinoId | maquinaDestinoNome | hardwareId | hardwareSN | hardwareNome | hardwareTipo | gpsLat | gpsLng | gpsAcc | dataHora | observacoes | sincronizadoEm |
|----|------|---------|-----------|-------------|-----------------|-------------------|-----------|-----------|-------------|-------------|--------|--------|--------|---------|------------|----------------|
