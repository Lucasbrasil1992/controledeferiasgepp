function renderDashboard() {
  const today = todayStr();
  const d = new Date();
  document.getElementById("hero-date").textContent =
    "Dados baseados em " + d.toLocaleDateString("pt-BR");

  const hoje = solicitacoes.filter(s => s.status === "Aprovado" && today >= s.inicio && today <= s.fim).length;
  const cap  = Math.round((10 - hoje) / 10 * 100);
  const prox = solicitacoes.filter(s => {
    if (s.status !== "Aprovado") return false;
    const diff = (new Date(s.inicio) - d) / 86400000;
    return diff >= 0 && diff <= 30;
  }).length;
  const pend = solicitacoes.filter(s => s.status === "Pendente").length;

  document.getElementById("m-hoje").textContent = `${hoje} / 10`;
  document.getElementById("m-cap").textContent  = `${cap}%`;
  document.getElementById("m-prox").textContent = prox;
  document.getElementById("m-pend").innerHTML   = `${pend} <span style="font-size:14px;font-weight:400">Na fila</span>`;

  const tbody = document.getElementById("sol-tbody");
  if (!solicitacoes.length) { tbody.innerHTML = `<tr><td colspan="5" class="empty-row">Nenhuma solicitação registrada.</td></tr>`; return; }

  tbody.innerHTML = solicitacoes.map(s => {
    const t = getTeam(s.mat);
    const dias = diffDays(s.inicio, s.fim);
    return `<tr>
      <td><strong>${t.name}</strong></td>
      <td>${fmtDate(s.inicio)}</td>
      <td>${fmtDate(s.fim)}</td>
      <td>${dias}</td>
      <td>${statusTag(s.status)}</td>
    </tr>`;
  }).join("");
}

function renderCalendario() {
  const container = document.getElementById("cal-container");
  const today = todayStr();
  const now   = new Date();
  const monthNames = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
                      "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const dowNames   = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

  let html = "";
  for (let m = 0; m < 12; m++) {
    const year = 2026;
    const monthDate = new Date(year, m, 1);
    const lastDay = new Date(year, m + 1, 0);
    if (lastDay < now && lastDay.toISOString().slice(0,10) < today) continue;

    const daysInMonth = lastDay.getDate();
    const firstDow    = monthDate.getDay();
    const monthLabel  = `${monthNames[m]} / ${year}`;

    const monthStart = `${year}-${String(m+1).padStart(2,"0")}-01`;
    const monthEnd   = `${year}-${String(m+1).padStart(2,"0")}-${String(daysInMonth).padStart(2,"0")}`;
    const activeSols = solicitacoes.filter(s =>
      s.status === "Aprovado" && s.inicio <= monthEnd && s.fim >= monthStart
    );

    let sideItems = activeSols.length
      ? activeSols.map(s => {
          const t = getTeam(s.mat);
          return `<div class="cal-side-item">
            <div class="cal-side-name">${t.name}</div>
            <div class="cal-side-period">${fmtDate(s.inicio)} até ${fmtDate(s.fim)}</div>
          </div>`;
        }).join("")
      : `<p class="cal-empty">Nenhuma saída programada.</p>`;

    let cells = "";
    const dowRow = dowNames.map((d,i) =>
      `<div class="cal-dow${i===0||i===6?" weekend":""}">${d}</div>`).join("");

    for (let e = 0; e < firstDow; e++) {
      cells += `<div class="cal-day other-month weekend"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(m+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
      const dow     = new Date(year, m, day).getDay();
      const isWknd  = dow === 0 || dow === 6;
      const isToday = dateStr === today;

      const chips = activeSols
        .filter(s => dateStr >= s.inicio && dateStr <= s.fim)
        .map(s => {
          const t = getTeam(s.mat);
          return `<span class="cal-chip" title="${t.name}">${t.short}</span>`;
        }).join("");

      cells += `<div class="cal-day${isWknd?" weekend":""}${isToday?" today":""}">
        <div class="day-num">${day}</div>
        ${chips}
      </div>`;
    }

    const totalCells = firstDow + daysInMonth;
    const trailing   = (7 - (totalCells % 7)) % 7;
    for (let t = 0; t < trailing; t++) {
      cells += `<div class="cal-day other-month weekend"></div>`;
    }

    html += `
    <div class="cal-month-block">
      <div class="cal-month-header"><i class="fa-solid fa-calendar-days"></i> ${monthLabel}</div>
      <div class="cal-grid-wrapper">
        <div class="cal-grid">
          ${dowRow}
          ${cells}
        </div>
        <div class="cal-sidebar">
          <div class="cal-sidebar-title">Aprovados no Mês</div>
          ${sideItems}
        </div>
      </div>
    </div>`;
  }

  container.innerHTML = html || `<div class="card"><p class="empty-row">Nenhum mês futuro a exibir.</p></div>`;
}

function initPedidoPage() {
  const sel = document.getElementById("f-nome");
  TEAM.forEach(t => {
    const o = document.createElement("option");
    o.value = t.mat; o.textContent = t.name;
    sel.appendChild(o);
  });
  sel.addEventListener("change", () => renderMySols(sel.value));
}

function renderMySols(mat) {
  const tbody = document.getElementById("my-sol-tbody");
  const mine  = solicitacoes.filter(s => s.mat === mat);
  if (!mine.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-row">Nenhuma solicitação encontrada.</td></tr>`;
    return;
  }
  tbody.innerHTML = mine.map(s => `<tr>
    <td>${fmtDate(s.inicio)} → ${fmtDate(s.fim)}</td>
    <td>${diffDays(s.inicio,s.fim)}</td>
    <td>${s.parcela}</td>
    <td>${statusTag(s.status)}</td>
    <td style="font-size:12px;color:#6b7280">${s.parecer||"—"}</td>
  </tr>`).join("");
}

function submitPedido() {
  const mat    = document.getElementById("f-nome").value;
  const inicio = document.getElementById("f-inicio").value;
  const fim    = document.getElementById("f-fim").value;
  const parcela= document.getElementById("f-parcela").value;
  const obs    = document.getElementById("f-obs").value.trim();
  const alertEl= document.getElementById("f-alert");
  const succEl = document.getElementById("f-success");

  alertEl.style.display = "none";
  succEl.style.display  = "none";

  if (!mat)    { showAlert(alertEl, "Selecione seu nome."); return; }
  if (!inicio) { showAlert(alertEl, "Informe a data de início."); return; }
  if (!fim)    { showAlert(alertEl, "Informe a data de fim."); return; }
  if (fim < inicio) { showAlert(alertEl, "A data de fim deve ser após o início."); return; }

  const dias = diffDays(inicio, fim);
  if (dias < 5) { showAlert(alertEl, "Período mínimo: 5 dias corridos."); return; }

  const novo = { id: nextId++, mat, inicio, fim, parcela, obs, status: "Pendente", parecer: "", dataParec: "" };
  solicitacoes.push(novo);
  saveSolicitacoes(solicitacoes);

  document.getElementById("f-inicio").value = "";
  document.getElementById("f-fim").value    = "";
  document.getElementById("f-obs").value    = "";
  succEl.style.display = "flex";
  renderMySols(mat);
}

function showAlert(el, msg) {
  el.className = "alert-box error";
  el.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${msg}`;
  el.style.display = "flex";
}

let currentSolId = null;

function doLogin() {
  const pwd = document.getElementById("login-pwd").value;
  if (pwd === SENHA_GERENCIA) {
    document.getElementById("login-gate").style.display  = "none";
    document.getElementById("aprov-panel").style.display = "block";
    renderAprovacoes();
  } else {
    document.getElementById("login-err").style.display = "block";
  }
}

function initAprovPage() {}

function renderAprovacoes() {
  const pend  = solicitacoes.filter(s => s.status === "Pendente").length;
  const aprov = solicitacoes.filter(s => s.status === "Aprovado").length;
  const repr  = solicitacoes.filter(s => s.status === "Reprovado").length;

  document.getElementById("ap-pend").textContent  = pend;
  document.getElementById("ap-aprov").textContent = aprov;
  document.getElementById("ap-repr").textContent  = repr;

  const tbody = document.getElementById("aprov-tbody");
  if (!solicitacoes.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-row">Nenhuma solicitação.</td></tr>`;
  } else {
    tbody.innerHTML = solicitacoes.map(s => {
      const t  = getTeam(s.mat);
      const d  = diffDays(s.inicio, s.fim);
      const prio = `${t.seniority}º${t.filhos?" ★":""}`;
      const acoes = s.status === "Pendente"
        ? `<button class="btn-icon approve" onclick="openParecer(${s.id})"><i class="fa-solid fa-gavel"></i> Analisar</button>`
        : `<span style="font-size:12px;color:#9ca3af">Concluído</span>`;
      return `<tr>
        <td><strong>${t.name}</strong></td>
        <td><span style="font-size:12px">${t.cargo}</span></td>
        <td>${fmtDate(s.inicio)} → ${fmtDate(s.fim)}</td>
        <td>${d}</td>
        <td>${s.parcela}</td>
        <td><span class="prio-badge"><i class="fa-solid fa-star" style="font-size:10px"></i>${prio}</span></td>
        <td>${statusTag(s.status)}</td>
        <td>${acoes}</td>
      </tr>`;
    }).join("");
  }
  renderConflitos();
}

function renderConflitos() {
  const area  = document.getElementById("conflict-area");
  const aprov = solicitacoes.filter(s => s.status === "Aprovado");
  const warns = [];

  const dayMap = {};
  aprov.forEach(s => {
    let d = new Date(s.inicio);
    while (d <= new Date(s.fim)) {
      const k = d.toISOString().slice(0,10);
      if (!dayMap[k]) dayMap[k] = [];
      dayMap[k].push(s.mat);
      d.setDate(d.getDate() + 1);
    }
  });
  Object.entries(dayMap).forEach(([day, mats]) => {
    if (mats.length > 3) warns.push(`${fmtDate(day)}: ${mats.length} servidores aprovados simultaneamente (limite 3).`);
  });

  if (!warns.length) {
    area.innerHTML = `<p style="color:#6b7280;font-size:13px">Nenhum conflito detectado.</p>`;
  } else {
    area.innerHTML = warns.map(w =>
      `<div class="alert-box warn"><i class="fa-solid fa-triangle-exclamation"></i>${w}</div>`).join("");
  }
}

function openParecer(id) {
  currentSolId = id;
  const s = solicitacoes.find(x => x.id === id);
  const t = getTeam(s.mat);
  const warns = checkConflitos(s);

  document.getElementById("parecer-title").textContent = `Parecer: ${t.name}`;
  document.getElementById("parecer-info").textContent  =
    `Período: ${fmtDate(s.inicio)} a ${fmtDate(s.fim)} (${diffDays(s.inicio,s.fim)} dias) · ${s.parcela}`;
  document.getElementById("parecer-obs").value = "";

  const palert = document.getElementById("parecer-alert");
  if (warns.length) {
    palert.className = "alert-box warn";
    palert.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i><div>${warns.map(w=>`• ${w}`).join("<br>")}</div>`;
    palert.style.display = "flex";
  } else {
    palert.style.display = "none";
  }
  document.getElementById("parecer-overlay").style.display = "flex";
}

function closeParecer() {
  document.getElementById("parecer-overlay").style.display = "none";
  currentSolId = null;
}

function decidir(status) {
  const s = solicitacoes.find(x => x.id === currentSolId);
  const obs = document.getElementById("parecer-obs").value.trim();
  s.status   = status;
  s.parecer  = obs || (status === "Aprovado" ? "Aprovado pela gerência." : "Reprovado pela gerência.");
  s.dataParec = todayStr();
  saveSolicitacoes(solicitacoes);
  closeParecer();
  renderAprovacoes();
}

function renderEquipe() {
  const tbody = document.getElementById("equipe-tbody");
  tbody.innerHTML = TEAM.map(t => `
    <tr>
      <td style="text-align:center;font-weight:700;color:#6b7280">#${t.seniority}</td>
      <td><div class="server-name">${t.name}</div></td>
      <td>
        <div class="cargo-badge">${t.cargo}</div><br>
        <span class="ch-badge">${t.carga}h</span>
      </td>
      <td>
        ${t.filhos
          ? `<span class="filhos-sim"><i class="fa-solid fa-children"></i> Sim</span>`
          : `<span style="color:#9ca3af">Não</span>`}
      </td>
      <td>
        <div class="chip-wrap">
          ${t.cats.map(c => `<span class="chip">${c}</span>`).join("")}
        </div>
      </td>
    </tr>`).join("");
}
