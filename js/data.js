const TEAM = [
  { mat:"16831071", name:"THABATTA SOARES DE MORAES",   short:"THABATTA",  cargo:"Técnico Administrativo", carga:40, seniority:1, filhos:true,
    cats:["MATMED","OPME","Odonto","Laboratório","Nutrição","Judicial","Troca de Marca"] },
  { mat:"16888650", name:"RUBINALDO COELHO",            short:"RUBINALDO", cargo:"Técnico Administrativo", carga:40, seniority:2, filhos:false,
    cats:["MATMED","OPME","Odonto","Laboratório","Nutrição","Judicial","Troca de Marca"] },
  { mat:"14430320", name:"SERGIO CHAVES ROCHA LIMA",    short:"SERGIO",    cargo:"Técnico Administrativo", carga:20, seniority:3, filhos:false,
    cats:["Medicamento","Judicial","Troca de Marca"] },
  { mat:"17006325", name:"JANDUHY VIEIRA CARNEIRO",     short:"JANDUHY",   cargo:"Técnico Administrativo", carga:40, seniority:4, filhos:false,
    cats:["Medicamento","MATMED","OPME","Judicial","Troca de Marca"] },
  { mat:"16934040", name:"DANIELLE DE SOUZA RODRIGUES", short:"DANIELLE",  cargo:"Técnico Administrativo", carga:40, seniority:5, filhos:true,
    cats:["MATMED","OPME","Odonto","Laboratório","Nutrição","Judicial","Troca de Marca"] },
  { mat:"17092566", name:"FLAVIA RODRIGUES SILVA",      short:"FLAVIA",    cargo:"Gerente",                carga:40, seniority:6, filhos:true,
    cats:["Medicamento","MATMED","Odonto","Laboratório","Nutrição","OPME","Renovação","Serviços","Troca de Marca","Judicial","Hotelaria","Equipamento"] },
  { mat:"17090369", name:"THIAGO PACHECO ANTUNES",      short:"THIAGO",    cargo:"Especialista - Administrador", carga:40, seniority:7, filhos:true,
    cats:["Medicamento","MATMED","Renovação","Serviços","Judicial","Equipamento"] },
  { mat:"17093570", name:"YURI BARROS BRANDANI",        short:"YURI",      cargo:"Especialista - Administrador", carga:40, seniority:8, filhos:true,
    cats:["Medicamento","MATMED","Renovação","Serviços","Judicial","Equipamento"] },
  { mat:"17112176", name:"RICARDO ANTUNES DE ALMEIDA",  short:"RICARDO",   cargo:"Especialista - Contador", carga:40, seniority:9, filhos:true,
    cats:["Medicamento","MATMED","Renovação","Serviços","Judicial","Equipamento"] },
  { mat:"16865472", name:"ERIVALDO MARQUES CAVALCANTE", short:"ERIVALDO",  cargo:"Técnico Administrativo", carga:20, seniority:10, filhos:false,
    cats:["Medicamento"] },
];

const CATS = ["Medicamento","MATMED","Odonto","Laboratório","Nutrição","OPME",
              "Renovação","Serviços","Troca de Marca","Judicial","Hotelaria","Equipamento"];

const SENHA_GERENCIA = "gepp2026";

const LS_KEY = "gepp_ferias_v2";

function loadSolicitacoes() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return [
    { id:1, mat:"17092566", inicio:"2026-06-30", fim:"2026-07-14", parcela:"1/3", obs:"", status:"Aprovado",  parecer:"Aprovado.", dataParec:"2026-04-01" },
    { id:2, mat:"16888650", inicio:"2026-07-09", fim:"2026-07-23", parcela:"1/3", obs:"", status:"Aprovado",  parecer:"Aprovado.", dataParec:"2026-04-01" },
    { id:3, mat:"16865472", inicio:"2026-07-31", fim:"2026-08-14", parcela:"1/3", obs:"", status:"Pendente",  parecer:"",          dataParec:"" },
    { id:4, mat:"16831071", inicio:"2026-12-14", fim:"2026-12-29", parcela:"1/3", obs:"Natal com família", status:"Aprovado", parecer:"Ok.", dataParec:"2026-10-01" },
  ];
}

function saveSolicitacoes(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

let solicitacoes = loadSolicitacoes();
let nextId = Math.max(...solicitacoes.map(s => s.id), 0) + 1;

function getTeam(mat) { return TEAM.find(t => t.mat === mat); }

function diffDays(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000) + 1;
}

function fmtDate(d) {
  if (!d) return "—";
  const [y,m,dd] = d.split("-");
  return `${dd}/${m}/${y}`;
}

function todayStr() { return new Date().toISOString().slice(0,10); }

function statusTag(s) {
  const map = { Aprovado:"tag-aprov", Pendente:"tag-pend", Reprovado:"tag-repr", Cancelado:"tag-canc" };
  return `<span class="tag ${map[s]||'tag-canc'}">${s}</span>`;
}

function checkConflitos(sol) {
  const t = getTeam(sol.mat);
  const aprov = solicitacoes.filter(s => s.status === "Aprovado" && s.id !== sol.id);
  const warnings = [];

  let d = new Date(sol.inicio);
  const end = new Date(sol.fim);
  while (d <= end) {
    const k = d.toISOString().slice(0,10);
    const sim = aprov.filter(x => k >= x.inicio && k <= x.fim).length + 1;
    if (sim > 3) { warnings.push(`Dia ${fmtDate(k)}: ${sim} servidores simultâneos (máx 3).`); break; }
    d.setDate(d.getDate() + 1);
  }

  const overlap = aprov.filter(x => x.inicio <= sol.fim && x.fim >= sol.inicio);
  const catsEmRisco = [];
  for (const cat of t.cats) {
    const cobertura = TEAM.filter(x => x.mat !== t.mat && x.cats.includes(cat));
    const disponiveis = cobertura.filter(x => !overlap.find(o => o.mat === x.mat));
    if (disponiveis.length === 0) catsEmRisco.push(cat);
  }
  if (catsEmRisco.length) warnings.push(`Categorias sem cobertura: ${catsEmRisco.join(", ")}.`);

  return warnings;
}
