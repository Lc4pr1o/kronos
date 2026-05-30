// ══════════════════════════════════════════════════════════════════
// KRONOS — Google Apps Script (Backend)
// Cole este código em: Extensions → Apps Script → Code.gs
// Depois: Deploy → New Deployment → Web App → Anyone → Deploy
// ══════════════════════════════════════════════════════════════════

const SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

const ABA_MAQUINAS  = 'maquinas';
const ABA_HARDWARES = 'hardwares';
const ABA_REGISTROS = 'registros';

// ══════════════════════════════════════════════════════════════════
// SETUP INICIAL — rode esta função UMA vez para criar as abas
// ⚠️  ATENÇÃO: clearContents() apaga TODOS os dados existentes.
//     Execute apenas na primeira configuração do sistema.
//     Para recriar os dados demo, use setupPlanilhaDemoApenas().
// ══════════════════════════════════════════════════════════════════
function setupPlanilha() {
  const ui = SpreadsheetApp.getUi();
  const resp = ui.alert(
    '⚠️ ATENÇÃO — Operação destrutiva',
    'Esta função apaga TODOS os dados das abas maquinas, hardwares e registros e recria com dados iniciais.\n\nContinuar?',
    ui.ButtonSet.OK_CANCEL
  );
  if (resp !== ui.Button.OK) { Logger.log('setupPlanilha cancelado pelo usuário'); return; }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  function getOrCreate(nome) {
    return ss.getSheetByName(nome) || ss.insertSheet(nome);
  }

  // ── ABA MAQUINAS ──
  const shMaq = getOrCreate(ABA_MAQUINAS);
  shMaq.clearContents();
  shMaq.appendRow(['id','nome','tipo','ano','unidade','chassi','patrimonio','centroCusto','criadoEm']);

  const maquinas = [
    ['50461','COLHEDORA JD (3520)','colhedora','2010','PEDRA','1NW3520TTA0090862','50461','13.01.08.14',''],
    ['50486','TRATOR JD (7815)','trator','2010','PEDRA','1BM7815XAAH090806','50486','13.01.03.13',''],
    ['50501','TRATOR JD (7205J)','trator','2010','PEDRA','1BM7205JTAH000102','50501','13.01.03.14',''],
    ['50724','COLHEDORA JD (3520)','colhedora','2010','PEDRA','1NW3520TJB0091385','50724','13.01.07.22',''],
    ['50728','COLHEDORA JD (3520)','colhedora','2010','PEDRA','1NW3520TPB0091397','50728','',''],
    ['50729','COLHEDORA JD (3520)','colhedora','2010','PEDRA','1NW3520TVB0091423','50729','13.01.08.14',''],
    ['50748','COLHEDORA JD (3520)','colhedora','2010','PEDRA','1NW3520TCB0091381','50748','13.01.08.14',''],
    ['51028','TRATOR JD (7210J)','trator','2012','PEDRA','1BM7210JVCH000267','51028','13.01.03.16',''],
    ['51120','COLHEDORA JD (3520)','colhedora','2013','PEDRA','1NW3520TLCT120759','51120','13.01.07.26',''],
    ['51121','COLHEDORA JD (3520)','colhedora','2012','PEDRA','1NW3520TCCT120765','51121','13.01.07.26',''],
    ['51122','COLHEDORA JD (3520)','colhedora','2013','PEDRA','1NW3520THCT120763','51122','13.01.07.26',''],
    ['51199','TRATOR JD (6130J)','trator','2013','PEDRA','1BM6130JAD0000636','51199','13.01.03.17',''],
    ['51212','TRATOR JD (8335R)','trator','2013','PEDRA','1RW8335RVCP057808','51212','13.01.06.01',''],
    ['51874','COLHEDORA CASE (A-8800)','colhedora','2016','PEDRA','PRCY8800HGPA02634','51874','13.01.07.31',''],
    ['52215','TRATOR JD (7225J)','trator','2016','PEDRA','1BM7225JKGH004920','52215','13.01.03.24',''],
    ['52217','TRATOR JD (7230J)','trator','2016','PEDRA','1BM7225JTGH004929','52217','13.01.03.24',''],
    ['52218','TRATOR JD (7225J)','trator','2016','PEDRA','1BM7225JJGH004921','52218','13.01.03.24',''],
    ['52221','TRATOR JD (7225J)','trator','2016','PEDRA','1BM7225JEGH004930','52221','13.01.03.24',''],
    ['52294','COLHEDORA JD (CH570)','colhedora','2016','PEDRA','1NWC570HCGT160262','52294','13.01.07.32',''],
    ['52296','COLHEDORA JD (CH570)','colhedora','2016','PEDRA','1NWC570HEGT160261','52296','13.01.07.32',''],
    ['52454','TRATOR JD (7225J)','trator','2017','PEDRA','1BM7225JJGH005650','52454','13.01.03.25',''],
    ['52456','TRATOR JD (7225J)','trator','2017','PEDRA','1BM7225JJGH005647','52456','13.01.03.25',''],
    ['53725','COLHEDORA CASE (A-8800)','colhedora','2016','PEDRA','PRCY8800JGPA02819','53725','13.01.07.31',''],
    ['53729','COLHEDORA CASE (A-8800)','colhedora','2016','PEDRA','PRCY8800JGPA02757','53729','13.01.07.31',''],
    ['53730','COLHEDORA CASE (A-8800)','colhedora','2016','PEDRA','PRCY8800EGPA02759','53730','13.01.07.31',''],
    ['54035','COLHEDORA CASE (A-8810)','colhedora','2018','PEDRA','PRCY8810AJPA03832','54035','13.01.07.37',''],
    ['54045','TRATOR JD (6135J)','trator','2018','PEDRA','1BM6135JLJD000523','54045','13.01.03.29',''],
    ['54047','TRATOR JD (6135J)','trator','2018','PEDRA','1BM6135JPJD000528','54047','13.01.03.29',''],
    ['55405','COLHEDORA CASE (A-8800)','colhedora','2017','PEDRA','8800DC05428','55405','13.01.07.33',''],
    ['55406','COLHEDORA CASE (A-8800)','colhedora','2017','PEDRA','8800DC05092','55406','13.01.07.33',''],
    ['55407','COLHEDORA CASE (A-8800)','colhedora','2017','PEDRA','8800DC05086','55407','13.01.07.33',''],
    ['55408','COLHEDORA CASE (A-8800)','colhedora','2017','PEDRA','8800DC05087','55408','13.01.07.33',''],
    ['55409','COLHEDORA CASE (A-8800)','colhedora','2017','PEDRA','8800DC05124','55409','13.01.07.33',''],
    ['55424','TRATOR JD (7230J)','trator','2017','PEDRA','1BM7230JJHH000771','55424','13.01.03.27',''],
    ['55432','TRATOR JD (7225J)','trator','2017','PEDRA','1BM7230JLHH000775','55432','13.01.03.27',''],
    ['55449','TRATOR JD (7230J)','trator','2017','CEDRO','1BM7230JEHH000794','55449','13.01.03.27',''],
    ['55561','TRATOR JD (7225J)','trator','2011','PEDRA','1BM7225JPBH000504','55561','13.01.03.15',''],
    ['55795','COLHEDORA JD (CH570)','colhedora','2018','PEDRA','1NWC570HEJT180243','55795','13.01.07.36',''],
    ['55796','COLHEDORA JD (CH570)','colhedora','2018','PEDRA','1NWC570HHJT180242','55796','13.01.07.36',''],
    ['55797','COLHEDORA JD (CH570)','colhedora','2018','PEDRA','1NWC570HKJT180281','55797','13.01.07.36',''],
    ['55798','COLHEDORA JD (CH570)','colhedora','2018','PEDRA','1NWC570HVJT180267','55798','13.01.07.36',''],
    ['55799','COLHEDORA JD (CH570)','colhedora','2018','PEDRA','1NWC570HAJT180268','55799','13.01.07.36',''],
    ['55800','COLHEDORA JD (CH570)','colhedora','2018','PEDRA','1NWC570HLJT180241','55800','13.01.07.36',''],
    ['55804','TRATOR JD (7230J)','trator','2018','PEDRA','1BM7230JHJH002226','55804','13.01.03.28',''],
    ['55805','TRATOR JD (7230J)','trator','2018','PEDRA','1BM7230JCJH002231','55805','13.01.03.28',''],
    ['55806','TRATOR JD (8335R)','trator','2018','PEDRA','1BM8345RAJS100260','55806','13.01.06.05',''],
    ['55808','TRATOR JD (7230J)','trator','2018','PEDRA','1BM7230JLJH002225','55808','13.01.03.28',''],
    ['55814','TRATOR JD (6135J)','trator','2018','PEDRA','1BM6135JHJD000510','55814','13.01.03.29',''],
    ['55817','TRATOR JD (6135J)','trator','2018','PEDRA','1BM6135JEJD000508','55817','13.01.03.29',''],
    ['55818','TRATOR JD (6135J)','trator','2018','PEDRA','1BM6135JPJD000514','55818','13.01.03.29',''],
    ['55819','TRATOR JD (6135J)','trator','2018','PEDRA','1BM6135JEJD000511','55819','13.01.03.29',''],
    ['55828','TRATOR JD (6135J)','trator','2018','PEDRA','1BM6135JCJD000509','55828','13.01.03.29',''],
    ['56042','TRATOR CASE (PUMA140)','trator','2019','PEDRA','HCCZ3C40TJCF83293','56042','13.01.03.98',''],
    ['56043','TRATOR CASE (PUMA140)','trator','2019','PEDRA','HCCZ3C40AKCF84183','56043','13.01.03.98',''],
    ['56044','TRATOR CASE (PUMA140)','trator','2019','PEDRA','HCCZ3C40AJCF82862','56044','13.01.03.98',''],
    ['56045','TRATOR CASE (PUMA140)','trator','2019','PEDRA','HCCZ3C40AKCF85712','56045','13.01.03.98',''],
    ['56046','TRATOR CASE (PUMA140)','trator','2019','PEDRA','HCCZ3C40AJCF83575','56046','13.01.03.98',''],
    ['56245','TRATOR JD (7230J)','trator','2019','PEDRA','1BM7230JLKH003599','56245','13.01.03.32',''],
    ['56252','TRATOR JD (6115J)','trator','2019','PEDRA','1BM6115JAKD001563','56252','13.01.03.98',''],
    ['56253','TRATOR JD (6115J)','trator','2019','PEDRA','1BM6115JHKD001565','56253','13.01.03.98',''],
    ['56254','TRATOR JD (6115J)','trator','2019','PEDRA','1BM6115JKKD001556','56254','13.01.03.98',''],
    ['56291','COLHEDORA JD (CH570)','colhedora','2019','PEDRA','1NWC570HLKT190057','56291','13.01.07.38',''],
    ['56310','COLHEDORA JD (CH570)','colhedora','2019','PEDRA','1NWC570HAKT200049','56310','13.01.07.38',''],
    ['56311','COLHEDORA JD (CH570)','colhedora','2019','PEDRA','1NWC570HCKT200047','56311','13.01.07.38',''],
    ['56312','TRATOR JD (7230J)','trator','2019','IPÊ','1BM7230JJKH003760','56312','13.01.03.32',''],
    ['56313','TRATOR JD (7230J)','trator','2019','PEDRA','1BM7230JCKH003761','56313','13.01.03.32',''],
    ['56315','COLHEDORA JD (CH570)','colhedora','2019','PEDRA','1NWC570HVKT200048','56315','13.01.07.38',''],
    ['56318','TRATOR JD (8335R)','trator','2019','PEDRA','1BM8345REKS100507','56318','13.01.06.06',''],
    ['56757','COLHEDORA JD (CH950)','colhedora','2020','PEDRA','1NWC950HELT210112','56757','13.01.07.41',''],
    ['58385','TRATOR JD (7225J)','trator','2015','PEDRA','1BM7225JJFH003962','58385','13.01.03.21',''],
    ['59020','COLHEDORA JD (CH570)','colhedora','2017','PEDRA','1NWC570HHHT170157','59020','13.01.07.34',''],
    ['59475','TRATOR JD (7230J)','trator','2019','IPÊ','1BM7230JEKH003587','59475','13.01.03.32',''],
    ['61006','COLHEDORA JD (CH570)','colhedora','2020','PEDRA','1NWC570HVLT210032','61006','13.01.07.40',''],
    ['61007','COLHEDORA JD (CH570)','colhedora','2020','PEDRA','1NWC570HLLT210034','61007','13.01.07.40',''],
    ['61008','COLHEDORA JD (CH570)','colhedora','2020','PEDRA','1NWC570HALT210033','61008','13.01.07.40',''],
    ['62231','TRATOR JD (6150J)','trator','2021','PEDRA','1BM6150JLMD003557','62231','13.01.03.98',''],
    ['62232','TRATOR JD (6150J)','trator','2021','PEDRA','1BM6150JLMD003592','62232','13.01.03.98',''],
    ['62566','TRATOR JD (7230J)','trator','2022','CEDRO','1BM7230JHNH007688','62566','13.01.03.96',''],
    ['62571','TRATOR JD (7230J)','trator','2022','BURITI','1BM7230JLNH007706','62571','13.01.03.96',''],
    ['62572','TRATOR JD (7230J)','trator','2022','CEDRO','1BM7230JHNH007710','62572','13.01.03.96',''],
    ['64078','TRATOR JD (7230J)','trator','2022','CEDRO','1BM7230JENH007126','64078','13.01.03.96',''],
    ['64086','TRATOR JD (7230J)','trator','2022','CEDRO','1BM7230JENH007238','64086','13.01.03.96',''],
    ['64088','TRATOR JD (7230J)','trator','2022','CEDRO','1BM7230JCNH007233','64088','13.01.03.96',''],
    ['64089','TRATOR JD (7230J)','trator','2022','CEDRO','1BM7230JCNH007290','64089','13.01.03.96',''],
    ['66296','TRATOR JD (7230J)','trator','2022','PEDRA/LOCAÇÃO','1BM7230JJNH007733','66296','13.01.03.96',''],
    ['66297','TRATOR JD (7230J)','trator','2022','PEDRA/LOCAÇÃO','1BM7230JHNH007755','66297','13.01.03.96',''],
    ['66298','TRATOR JD (7230J)','trator','2022','PEDRA/LOCAÇÃO','1BM7230JHNH007724','66298','13.01.03.96',''],
    ['66299','TRATOR JD (7230J)','trator','2022','PEDRA/LOCAÇÃO','1BM7230JVNH007735','66299','13.01.03.96',''],
    ['66328','TRATOR JD (7230J)','trator','2022','PEDRA','1BM7230JCNH007287','66328','13.01.03.35',''],
    ['66329','TRATOR JD (7230J)','trator','2022','PEDRA','1BM7230JHNH007464','66329','13.01.03.35',''],
    ['66330','TRATOR JD (7230J)','trator','2022','PEDRA','1BM7230JANH007445','66330','13.01.03.35',''],
    ['66331','TRATOR JD (7230J)','trator','2022','PEDRA','1BM7230JJNH007456','66331','13.01.03.35',''],
    ['66348','COLHEDORA JD (CH950)','colhedora','2022','PEDRA','1NWC950HCNT220313','66348','13.01.07.44',''],
    ['66441','TRATOR JD (6190J)','trator','2022','PEDRA/LOCAÇÃO','1BM6190JAND600246','66441','13.01.03.98',''],
    ['66442','TRATOR JD (6190J)','trator','2022','PEDRA/LOCAÇÃO','1BM6190JPND600241','66442','13.01.03.98',''],
    ['66444','TRATOR JD (6190J)','trator','2022','PEDRA/LOCAÇÃO','1BM6190JVND600245','66444','13.01.03.98',''],
    ['66446','TRATOR VALTRA (T230)','trator','2022','PEDRA','9AGT2020TNM001520','66446','13.01.03.36',''],
    ['66447','TRATOR VALTRA (T230)','trator','2022','PEDRA/LOCAÇÃO','9AGT2020CNM001516','66447','13.01.03.36',''],
    ['66472','TRATOR JD (6190J)','trator','2022','PEDRA/LOCAÇÃO','1BM6190JVND600259','66472','13.01.03.98',''],
    ['66473','TRATOR JD (6190J)','trator','2022','PEDRA/LOCAÇÃO','1BM6190JCND600289','66473','13.01.03.98',''],
    ['66474','TRATOR JD (6190J)','trator','2022','PEDRA/LOCAÇÃO','1BM6190JJND600307','66474','13.01.03.98',''],
    ['66475','TRATOR JD (6190J)','trator','2022','PEDRA/LOCAÇÃO','1BM6190JCND600311','66475','13.01.03.98',''],
    ['66476','TRATOR JD (6190J)','trator','2022','PEDRA/LOCAÇÃO','1BM6190JTND600321','66476','13.01.03.98',''],
    ['66527','TRATOR JD (8335R)','trator','2022','PEDRA','1BM8345RKNS100906','66527','13.01.06.08',''],
    ['66589','MOTONIVELADORA JD (620 G)','motoniveladora','2022','PEDRA/LOCAÇÃO','1BZ620GAVND000365','66589','13.01.09.98',''],
    ['66631','TRATOR JD (7230J)','trator','2022','PEDRA/LOCAÇÃO','1BM7230JCNH008382','66631','13.01.03.96',''],
    ['66632','TRATOR JD (7230J)','trator','2022','PEDRA/LOCAÇÃO','1BM7230JHNH008405','66632','13.01.03.96',''],
    ['66633','TRATOR JD (7230J)','trator','2022','PEDRA/LOCAÇÃO','1BM7230JPNH008393','66633','13.01.03.96',''],
    ['66634','TRATOR JD (7230J)','trator','2022','PEDRA/LOCAÇÃO','1BM7230JENH008390','66634','13.01.03.96',''],
    ['66635','TRATOR JD (7230J)','trator','2022','PEDRA/LOCAÇÃO','1BM7230JJNH008395','66635','13.01.03.96',''],
    ['66661','MOTONIVELADORA JD (620 G)','motoniveladora','2022','PEDRA','1BZ620GACND000535','66661','13.01.09.98',''],
    ['66662','MOTONIVELADORA JD (620 G)','motoniveladora','2022','PEDRA','1BZ620GAEND000534','66662','13.01.09.98',''],
    ['66663','MOTONIVELADORA JD (620 G)','motoniveladora','2022','PEDRA','1BZ620GAKND000541','66663','13.01.09.98',''],
    ['66719','COLHEDORA CASE (A-9900)','colhedora','2023','PEDRA/LOCAÇÃO','PRCY9900CNPA06097','66719','13.01.07.97',''],
    ['66720','COLHEDORA CASE (A-9900)','colhedora','2023','PEDRA/LOCAÇÃO','PRCY9900JNPA06087','66720','13.01.07.97',''],
    ['66721','COLHEDORA CASE (A-9900)','colhedora','2023','PEDRA/LOCAÇÃO','PRCY9900KNPA06153','66721','13.01.07.97',''],
    ['66732','TRATOR JD (6190J)','trator','2023','PEDRA/LOCAÇÃO','1BM6190JEPD660437','66732','13.01.03.98',''],
    ['66733','TRATOR JD (6190J)','trator','2023','PEDRA/LOCAÇÃO','1BM6190JVPD660433','66733','13.01.03.98',''],
    ['66734','TRATOR JD (6190J)','trator','2023','PEDRA/LOCAÇÃO','1BM6190JJPD660428','66734','13.01.03.98',''],
    ['66735','TRATOR JD (6190J)','trator','2023','PEDRA/LOCAÇÃO','1BM6190JEPD660423','66735','13.01.03.98',''],
    ['66736','TRATOR JD (6190J)','trator','2023','PEDRA/LOCAÇÃO','1BM6190JLPD660418','66736','13.01.03.98',''],
    ['67092','MOTONIVELADORA JD (620 G)','motoniveladora','2022','PEDRA','1BZ620GAAND000366','67092','13.01.09.98',''],
    ['67120','MOTONIVELADORA JD (620 G)','motoniveladora','2022','PEDRA','1BZ620GANVD000365','67120','13.01.09.98',''],
    ['67206','TRATOR FENDT (VARIO 942)','trator','2024','PEDRA','WAM97226E00F04331','67206','13.01.06.09',''],
    ['DIOVANI','TRATOR JD (7230J)','trator','','PEDRA','','DIOVANI','',''],
    // destinos virtuais
    ['ESTOQUE',    'Estoque',    'estoque',   '','','','','',''],
    ['MANUTENCAO', 'Manutenção', 'manutencao','','','','','',''],
    ['INATIVO',  'Inativo',  'inativo', '','','','','',''],
  ];

  maquinas.forEach(row => shMaq.appendRow(row));

  // ── ABA HARDWARES ──
  const shHw = getOrCreate(ABA_HARDWARES);
  shHw.clearContents();
  shHw.appendRow(['id','nome','tipo','modelo','numeroDeSerie','patrimonio','fabricante','firmware','maquinaAtual','instaladoEm']);
  // Tipos: monitor | receptor | radio | tela | bordo
  // Modelos monitor: RAVEN / CFX 750 / EZ GUIDE / OMNI / PRO 700 / GS3 / GS4 / XCN 1050 / XCN 1060
  // Modelos receptor: StarFire 3000 / 6000 / 7000
  // Modelos radio: 450
  // Modelos tela: S7 / SOL7
  // Modelos bordo: MAG 100 / MAG X

  // ── ABA REGISTROS ──
  const shReg = getOrCreate(ABA_REGISTROS);
  shReg.clearContents();
  shReg.appendRow([
    'id','acao','tecnico',
    'maquinaId','maquinaNome',
    'maquinaDestinoId','maquinaDestinoNome',
    'hardwareId','hardwareSN','hardwareNome','hardwareTipo','hardwareModelo','hardwarePatrimonio',
    'gpsLat','gpsLng','gpsAcc',
    'dataHora','observacoes','sincronizadoEm'
  ]);

  Logger.log('✅ KRONOS — Planilha configurada com sucesso! ' + maquinas.length + ' máquinas cadastradas.');
}

// ══════════════════════════════════════════════════════════════════
// GET
// ══════════════════════════════════════════════════════════════════
function doGet(e) {
  const action = e?.parameter?.action || 'getData';
  if (action === 'getData') return jsonResponse(getData());
  return jsonResponse({ error: 'Ação não reconhecida' });
}

function getData() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  return {
    machines:  sheetToObjects(ss.getSheetByName(ABA_MAQUINAS)),
    hardwares: sheetToObjects(ss.getSheetByName(ABA_HARDWARES)),
    registros: sheetToObjects(ss.getSheetByName(ABA_REGISTROS)),
  };
}

// ══════════════════════════════════════════════════════════════════
// POST
// ══════════════════════════════════════════════════════════════════
function doPost(e) {
  try {
    const body   = JSON.parse(e.postData.contents);
    const action = body.action;
    if (action === 'addRecord') return jsonResponse(addRecord(body.record));
    return jsonResponse({ success: false, error: 'Ação não reconhecida' });
  } catch(err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

const HW_HEADERS = ['id','nome','tipo','modelo','numeroDeSerie','patrimonio','fabricante','firmware','maquinaAtual','instaladoEm'];

function getOrCreateSheet(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
  }
  return sh;
}

function addRecord(record) {
  const ss = SpreadsheetApp.openById(SHEET_ID);

  // 1. Grava na aba REGISTROS (cria se não existir)
  const shReg = getOrCreateSheet(ss, ABA_REGISTROS, [
    'id','acao','tecnico','maquinaId','maquinaNome',
    'maquinaDestinoId','maquinaDestinoNome',
    'hardwareId','hardwareSN','hardwareNome','hardwareTipo','hardwareModelo','hardwarePatrimonio',
    'gpsLat','gpsLng','gpsAcc','dataHora','observacoes','sincronizadoEm'
  ]);
  shReg.appendRow([
    record.id, record.action, record.techName,
    record.machineId     || '', record.machineName    || '',
    record.machineDestId || '', record.machineDestName || '',
    record.hwId || '', record.hwSn || '', record.hwName || '', record.hwType || '',
    record.hwModelo || '', record.hwPatrimonio || '',
    record.gpsLat  || '', record.gpsLng || '', record.gpsAcc || '',
    record.dateTime || '', record.notes || '',
    new Date().toISOString(),
  ]);

  // 2. Atualiza maquinaAtual na aba HARDWARES (cria se não existir)
  const shHw = getOrCreateSheet(ss, ABA_HARDWARES, HW_HEADERS);
  const hwRows = shHw.getDataRange().getValues();
  const hdrs  = hwRows[0];
  const cId   = hdrs.indexOf('id');
  const cSN   = hdrs.indexOf('numeroDeSerie');
  const cPat  = hdrs.indexOf('patrimonio');
  const cMaq  = hdrs.indexOf('maquinaAtual');
  const cInst = hdrs.indexOf('instaladoEm');

  const match = (row) =>
    (record.hwId         && String(row[cId])  === String(record.hwId))  ||
    (record.hwSn         && String(row[cSN])  === String(record.hwSn))  ||
    (record.hwPatrimonio && String(row[cPat]) === String(record.hwPatrimonio));

  const destId = record.machineDestId || '';
  let found = false;

  for (let i = 1; i < hwRows.length; i++) {
    if (match(hwRows[i])) {
      shHw.getRange(i+1, cMaq+1).setValue(destId);
      if (destId) shHw.getRange(i+1, cInst+1).setValue(record.dateTime || new Date().toISOString());
      found = true;
      break;
    }
  }

  // Hardware novo: cria linha se não existia e tem destino
  const hasIdentifier = record.hwId || record.hwSn || record.hwPatrimonio;
  if (!found && hasIdentifier && destId) {
    const newId = record.hwId || record.hwPatrimonio || record.hwSn;
    shHw.appendRow([
      newId, record.hwName || '', record.hwType || '', record.hwModelo || '',
      record.hwSn || '', record.hwPatrimonio || '', record.hwManuf || '', '',
      destId, record.dateTime || new Date().toISOString()
    ]);
  }

  return { success: true };
}

// ══════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════
function sheetToObjects(sheet) {
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return [];
  const headers = rows[0];
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
