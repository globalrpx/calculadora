import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const port = Number(process.env.PORT ?? 3000);
const internalExchangeRateFactor = 1.03;

const mockUsers = [
  { email: "cliente1@gmail.com", name: "Cliente 1", role: "client", company: "Cliente 1 Importadora" },
  { email: "cliente2@gmail.com", name: "Cliente 2", role: "client", company: "Cliente 2 Comercio" },
  { email: "admin@globalrpx.com", name: "Admin RPX", role: "admin", company: "Global RPX" }
];

const clientNav = [
  ["/app", "Resumo"],
  ["/app/calculadora", "Calculadora"],
  ["/app/simulacoes", "Simulacoes"]
];

const adminNav = [
  ["/admin/dashboard", "Dashboard"],
  ["/admin/clientes", "Clientes"],
  ["/admin/fornecedores", "Fornecedores"],
  ["/admin/despachantes", "Despachantes"],
  ["/admin/usuarios", "Usuarios"],
  ["/admin/parametros", "Parametros"],
  ["/admin/cotacoes", "Cotacoes"],
  ["/admin/simulacoes", "Simulacoes"]
];

function css() {
  return `
    :root{--blue:#123f8c;--navy:#0b244f;--red:#d7282f;--ink:#172033;--mist:#f5f7fb;--sky:#eaf1ff}
    *{box-sizing:border-box}body{margin:0;min-height:100vh;font-family:Arial,Helvetica,sans-serif;color:var(--ink);background:radial-gradient(circle at top left,rgba(18,63,140,.12),transparent 34rem),linear-gradient(180deg,#fff 0%,#f5f7fb 42%,#eef3fb 100%)}a{text-decoration:none;color:inherit}
    .wrap{max-width:1180px;margin:0 auto;padding:24px}.top{display:flex;align-items:center;justify-content:space-between;gap:20px}.logo{height:52px;width:auto;max-width:190px}.btn{display:inline-flex;min-height:44px;align-items:center;justify-content:center;border-radius:6px;padding:10px 16px;font-weight:700;font-size:14px;background:var(--blue);color:#fff;border:0}.btn.secondary{background:#fff;color:var(--blue);border:1px solid rgba(18,63,140,.2)}
    .hero{display:grid;grid-template-columns:1.05fr .95fr;gap:44px;align-items:center;padding-top:64px}.eyebrow{text-transform:uppercase;color:var(--red);font-weight:800;font-size:13px}.hero h1{font-size:52px;line-height:1.05;margin:16px 0;color:var(--navy);max-width:780px}.lead{font-size:18px;line-height:1.65;color:#526176;max-width:690px}.panel,.card{background:#fff;border:1px solid #dfe5ef;border-radius:8px;box-shadow:0 18px 50px rgba(23,32,51,.08)}.panel{padding:24px}.tile{border:1px solid #dfe5ef;border-radius:6px;padding:18px;margin-top:14px}.tile h2{font-size:17px;color:var(--blue);margin:0 0 8px}.tile p{margin:0;color:#5f6b7d;line-height:1.55}
    .app{min-height:100vh;background:var(--mist)}.bar{position:sticky;top:0;background:rgba(255,255,255,.96);border-bottom:1px solid #dfe5ef;z-index:1}.bar-inner{max-width:1180px;margin:0 auto;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;gap:20px}.user{text-align:right;font-size:14px}.user b{display:block}.grid{max-width:1180px;margin:0 auto;padding:26px 24px;display:grid;grid-template-columns:248px minmax(0,1fr);gap:24px}.side{background:#fff;border:1px solid #dfe5ef;border-radius:8px;padding:12px;box-shadow:0 18px 50px rgba(23,32,51,.08)}.side a{display:block;border-radius:6px;padding:13px 12px;font-size:14px;font-weight:700;color:#354055}.side a:hover,.side a.active{background:var(--sky);color:var(--blue)}.main{min-width:0}.main h1{font-size:34px;margin:8px 0}.desc{color:#647082;line-height:1.6;max-width:720px}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:24px}.card{padding:22px}.card small{display:block;color:#687386;text-transform:uppercase;font-weight:800}.card strong{display:block;font-size:32px;margin-top:12px}.card p{color:#657287;line-height:1.55}.table{overflow:auto;background:#fff;border:1px solid #dfe5ef;border-radius:8px;margin-top:22px}.row{display:grid;grid-template-columns:repeat(4,1fr);min-width:680px}.row span{padding:14px;border-bottom:1px solid #edf1f6;color:#647082}.head span{background:#f8fafc;font-weight:800;color:#4c586b}.param{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-top:22px}
    .form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.field{display:grid;min-width:0;align-self:start;align-content:start;gap:7px;font-size:13px;font-weight:800;color:#354055}.field input{height:44px;width:100%;min-width:0;border:1px solid #cfd7e3;border-radius:6px;padding:0 12px;font-size:14px}.field small{font-weight:400;color:#647082;line-height:1.45}.calc-layout{display:grid;gap:22px;margin-top:22px}.result-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.result-card{border:1px solid #dfe5ef;border-radius:8px;background:#fff;padding:20px}.result-card small{display:block;color:#687386;text-transform:uppercase;font-weight:800}.result-card strong{display:block;font-size:24px;margin-top:12px}.result-card p{color:#657287;line-height:1.55}.section-head{border-bottom:1px solid #dfe5ef;padding-bottom:14px;margin-bottom:18px}.section-head h2{font-size:20px;margin:4px 0 0}.result-head{display:flex;align-items:center;justify-content:space-between;gap:16px;border-bottom:1px solid #dfe5ef;padding-bottom:14px}.result-head h2{font-size:20px;margin:4px 0 0}.result-actions{display:flex;flex-wrap:wrap;gap:8px}.form-note{margin-top:20px;border:1px solid rgba(18,63,140,.15);background:#eaf1ff;color:#123f8c;border-radius:6px;padding:14px;font-size:14px;line-height:1.55}.error-box{margin-top:14px;border:1px solid #fecaca;background:#fef2f2;color:#b91c1c;border-radius:6px;padding:12px 14px;font-size:14px;font-weight:800}.form-action{display:flex;justify-content:flex-end;margin-top:18px}.step-panel{animation:rpx-slide-down .24s ease-out}.step-panel.closing{animation:rpx-slide-up .18s ease-in forwards}.tabs{display:flex;flex-wrap:wrap;gap:8px;background:#fff;border:1px solid #dfe5ef;border-radius:8px;padding:8px;box-shadow:0 18px 50px rgba(23,32,51,.08)}.tab{border:0;background:transparent;border-radius:6px;min-height:40px;padding:0 16px;font-weight:800;color:#5a6677}.tab.active{background:var(--blue);color:#fff}.notice{border:1px solid #f4d18b;background:#fff8e8;color:#8a5b0a;border-radius:8px;padding:14px;font-size:14px;line-height:1.55}.pill{display:inline-flex;border-radius:6px;background:#eef3fb;padding:7px 10px;font-size:12px;font-weight:800;color:#526176;margin:8px 8px 0 0}.pill.supplier{background:#eaf1ff;color:#123f8c}.savings-card{border:1px solid #a7f3d0;background:#ecfdf5;color:#064e3b;border-radius:8px;padding:20px}.savings-card small{display:block;color:#047857;text-transform:uppercase;font-weight:900}.savings-card strong{display:block;font-size:24px;margin-top:12px}.savings-card p{color:#065f46;line-height:1.55}.actions{display:flex;flex-wrap:wrap;gap:10px}.linkbtn{border:0;background:transparent;color:var(--blue);font-weight:800;cursor:pointer}.hidden{display:none!important}@keyframes rpx-slide-down{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}@keyframes rpx-slide-up{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-12px)}}
    @media(max-width:1100px){.form-grid{grid-template-columns:1fr 1fr}.result-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:980px){.hero,.grid,.cards,.param{grid-template-columns:1fr}.grid{padding-top:18px}.hero h1{font-size:38px}.side{display:grid;grid-template-columns:repeat(2,1fr)}.user{display:none}}
    @media(max-width:640px){.form-grid,.result-grid{grid-template-columns:1fr}.side{grid-template-columns:1fr}.bar-inner{align-items:flex-start}.logo{height:44px}.main h1{font-size:28px}}
  `;
}

function page(title, body) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} - Global RPX</title><style>${css()}</style></head><body>${body}</body></html>`;
}

function logo() {
  return `<img class="logo" src="/logo-global-rpx-horizontal.png" alt="Global RPX">`;
}

function landing() {
  return page("Home", `<main><header class="wrap top">${logo()}<a class="btn secondary" href="/login">Entrar</a></header><section class="wrap hero"><div><p class="eyebrow">Plataforma Global RPX</p><h1>Cotacoes preliminares e simulacoes de importacao em um unico ambiente.</h1><p class="lead">Centralize relacionamento com clientes, organize simulacoes internas e prepare a operacao para evoluir com dados, parametros e historico.</p><p><a class="btn" href="/login">Entrar na plataforma</a></p></div><div class="panel"><div class="tile"><h2>Clientes</h2><p>Area autenticada para cotacoes e simulacoes publicadas.</p></div><div class="tile"><h2>RPX Admin</h2><p>Painel interno para cadastros, parametros e acompanhamento.</p></div><div class="tile"><h2>Proxima etapa</h2><p>Calculadora com historico, imagens e economia estimada.</p></div></div></section></main>`);
}

function login() {
  return page("Login", `<main style="display:grid;min-height:100vh;place-items:center;padding:24px"><section class="panel" style="width:100%;max-width:460px">${logo()}<p class="eyebrow" style="margin-top:34px">Acesso mock</p><h1 style="font-size:34px;margin:8px 0">Entrar na plataforma</h1><p class="desc">Nesta fase o login usa cookie local e usuarios ficticios, sem banco de dados.</p><form method="post" action="/login" style="display:grid;gap:14px;margin-top:24px"><input name="email" value="cliente1@gmail.com" style="min-height:44px;border:1px solid #cfd7e3;border-radius:6px;padding:0 12px"><input name="password" value="mock" type="password" style="min-height:44px;border:1px solid #cfd7e3;border-radius:6px;padding:0 12px"><button class="btn">Entrar</button></form><div style="display:grid;gap:10px;margin-top:18px">${mockUsers.map((user) => `<form method="post" action="/login"><input type="hidden" name="email" value="${user.email}"><button class="btn secondary" style="width:100%;justify-content:flex-start">${user.email}</button></form>`).join("")}</div></section></main>`);
}

function shell(kind, title, desc, content, user) {
  const nav = kind === "admin" ? adminNav : clientNav;
  return page(title, `<div class="app"><header class="bar"><div class="bar-inner">${logo()}<div class="user"><b>${user.name}</b><span>${user.email}</span><form method="post" action="/logout" style="margin-top:6px"><button class="linkbtn">Sair</button></form></div></div></header><div class="grid"><aside class="side">${nav.map(([href, label]) => `<a class="${href === currentPath ? "active" : ""}" href="${href}">${label}</a>`).join("")}</aside><main class="main"><p class="eyebrow">${kind === "admin" ? "Painel administrativo" : "Area do cliente"}</p><h1>${title}</h1><p class="desc">${desc}</p>${content}</main></div></div>`);
}

function cards(items) {
  return `<div class="cards">${items.map(([a, b, c]) => `<section class="card"><small>${a}</small><strong>${b}</strong><p>${c}</p></section>`).join("")}</div>`;
}

function table(cols) {
  return `<div class="table"><div class="row head">${cols.map((c) => `<span>${c}</span>`).join("")}</div>${[1, 2, 3].map(() => `<div class="row">${cols.map((_, i) => `<span>${i === 0 ? "Aguardando dados" : "-"}</span>`).join("")}</div>`).join("")}</div>`;
}

function calculator(user) {
  return `
    <div class="tabs"><button class="tab active" data-tab="new">Nova cotacao</button><button class="tab" data-tab="history">Historico</button></div>
    <section id="new-tab" class="calc-layout">
      <div id="calculation-form" class="panel step-panel">
        <div class="section-head"><p class="eyebrow">Etapa 1</p><h2>Produto e fornecedor</h2></div>
        <div class="form-grid">
          <label class="field">Nome do produto<input id="productName" placeholder="Ex: Garrafa termica inox"></label>
          <label class="field">HS Code ou NCM sugerido<input id="hsCode" placeholder="Ex: 9617.00.10"><small>Classificacao preliminar, sujeita a validacao fiscal.</small><div id="ncm-suggestions"></div><div id="ncm-selected"></div></label>
          <label class="field">FOB unitario USD<input id="fobUnitUsd" type="number" step="0.01" value="12"></label>
          <label class="field">Quantidade<input id="quantity" type="number" step="1" value="1000"></label>
          <label class="field">Nome do fornecedor<input id="supplierName" placeholder="Ex: Shenzhen ABC Trading"></label>
          <label class="field">E-mail do fornecedor<input id="supplierEmail" type="email" placeholder="contato@fornecedor.com"></label>
          <label class="field">Telefone do fornecedor<input id="supplierPhone" type="tel" placeholder="+86 138 0000 0000"></label>
          <label class="field">Imagens do produto<input id="images" type="file" multiple accept="image/png,image/jpeg,image/webp"><small>Voce pode selecionar ate 5 imagens para compor a cotacao.</small></label>
          <label class="field">Foto do cartao ou contato do fornecedor<input id="supplierContactImages" type="file" multiple accept="image/png,image/jpeg,image/webp"><small>Anexe cartao de visita, anotacao ou outra referencia de contato recebida do fornecedor.</small></label>
        </div>
        <div id="image-list"></div>
        <div id="supplier-contact-image-list"></div>
        <div class="form-note">Para identificar o fornecedor, preencha nome, e-mail e telefone ou anexe uma foto do cartao de visitas.</div>
        <div id="calculation-error" class="error-box hidden"></div>
        <div class="form-action"><button class="btn" id="calculateQuote">Fazer calculo</button></div>
      </div>
      <section id="calculation-results" class="panel step-panel hidden" style="display:grid;gap:16px">
        <div class="result-head"><div><p class="eyebrow">Etapa 2</p><h2>Resultado da cotacao</h2></div><div class="result-actions"><button class="btn secondary" id="redoCalculation">Refazer calculo</button><button class="btn" id="saveQuote">Salvar cotacao</button></div></div>
        <div class="result-grid">
          <section class="result-card"><small>Estimativa com a RPX</small><strong id="totalRpx">R$ 0,00</strong><p id="unitRpx"></p></section>
          <section class="result-card"><small>Referencia de importacao direta</small><strong id="directValue">R$ 0,00</strong><p id="directTotal"></p></section>
          <section class="savings-card"><small>Diferenca estimada com a RPX</small><strong id="savings">R$ 0,00</strong><p id="savingsPercent"></p></section>
          <section class="result-card"><small>Valor FOB informado</small><strong id="fobTotal">US$ 0,00</strong><p>Base utilizada para esta estimativa preliminar.</p></section>
        </div>
        <div class="notice">Estimativa preliminar sujeita à validação fiscal, logística e operacional.</div>
      </section>
    </section>
    <section id="history-tab" class="hidden" style="margin-top:22px">
      <div id="history"></div>
      <div id="detail"></div>
    </section>
    <script>
      window.RPX_USER_EMAIL = ${JSON.stringify(user.email)};
      const key = "global-rpx-quotes:" + window.RPX_USER_EMAIL;
      const money = (value, currency) => new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(Number.isFinite(value) ? value : 0);
      const percent = (value) => new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 }).format(Number.isFinite(value) ? value : 0);
      const fields = ["productName","hsCode","fobUnitUsd","quantity","supplierName","supplierEmail","supplierPhone"];
      let images = [];
      let supplierContactImages = [];
      let ncmOptions = [];
      let selectedNcm = null;
      let calculatedResult = null;
      function input(){
        return {
          productName: document.getElementById("productName").value,
          hsCode: document.getElementById("hsCode").value,
          fobUnitUsd: Number(document.getElementById("fobUnitUsd").value),
          quantity: Number(document.getElementById("quantity").value),
          usedDollar: 0,
          rpxFactor: 1.8,
          directImportFactor: 2.2,
          supplierName: document.getElementById("supplierName").value.trim(),
          supplierEmail: document.getElementById("supplierEmail").value.trim(),
          supplierPhone: document.getElementById("supplierPhone").value.trim()
        };
      }
      function calc(data){
        const fobTotalUsd = data.fobUnitUsd * data.quantity;
        const unitCostRpxBrl = data.fobUnitUsd * data.usedDollar * data.rpxFactor;
        const totalCostRpxBrl = unitCostRpxBrl * data.quantity;
        const unitCostDirectBrl = data.fobUnitUsd * data.usedDollar * data.directImportFactor;
        const totalCostDirectBrl = unitCostDirectBrl * data.quantity;
        const savingsBrl = totalCostDirectBrl - totalCostRpxBrl;
        const savingsPercent = totalCostDirectBrl > 0 ? savingsBrl / totalCostDirectBrl : 0;
        return { fobTotalUsd, unitCostRpxBrl, totalCostRpxBrl, unitCostDirectBrl, totalCostDirectBrl, savingsBrl, savingsPercent };
      }
      function hideResults(){
        calculatedResult = null;
        document.getElementById("calculation-results").classList.add("hidden");
        document.getElementById("calculation-form").classList.remove("hidden");
        document.getElementById("calculation-error").classList.add("hidden");
      }
      function validate(data){
        if (!data.productName || !data.hsCode) return "Informe o nome do produto e o HS Code ou NCM sugerido.";
        if (data.fobUnitUsd <= 0 || data.quantity <= 0) return "Informe valores maiores que zero para FOB e quantidade.";
        const hasDetails = data.supplierName && data.supplierEmail && data.supplierPhone;
        if (!hasDetails && supplierContactImages.length === 0) return "Informe nome, e-mail e telefone do fornecedor ou anexe uma foto do cartao de visitas.";
        if (hasDetails && !/^\\S+@\\S+\\.\\S+$/.test(data.supplierEmail)) return "Informe um e-mail valido para o fornecedor.";
        return "";
      }
      function renderCalc(result){
        document.getElementById("totalRpx").textContent = money(result.totalCostRpxBrl, "BRL");
        document.getElementById("unitRpx").textContent = "Unitario estimado: " + money(result.unitCostRpxBrl, "BRL");
        document.getElementById("directValue").textContent = money(result.totalCostDirectBrl, "BRL");
        document.getElementById("directTotal").textContent = "Unitario estimado: " + money(result.unitCostDirectBrl, "BRL");
        document.getElementById("savings").textContent = money(result.savingsBrl, "BRL");
        document.getElementById("savingsPercent").textContent = result.savingsBrl > 0 ? "Economia estimada de " + percent(result.savingsPercent) + " em relacao a referencia direta." : "Resultado neutro. Validar condicoes comerciais.";
        document.getElementById("fobTotal").textContent = money(result.fobTotalUsd, "USD");
        document.getElementById("calculation-form").classList.add("hidden");
        document.getElementById("calculation-results").classList.remove("hidden");
      }
      function renderNcmSuggestions(){
        const query = document.getElementById("hsCode").value.trim().toLowerCase();
        const digits = query.replace(/\\D/g, "");
        const box = document.getElementById("ncm-suggestions");
        const selected = document.getElementById("ncm-selected");
        if (selectedNcm && selectedNcm.code === document.getElementById("hsCode").value) {
          selected.innerHTML = '<div style="border-radius:6px;background:#eaf1ff;color:#123f8c;padding:8px 10px;font-size:12px;line-height:1.5">'+selectedNcm.description+'</div>';
        } else {
          selected.innerHTML = "";
        }
        if (query.length < 2) {
          box.innerHTML = "";
          return;
        }
        const rows = ncmOptions.filter((item) => item.code.replace(/\\D/g, "").includes(digits) || item.description.toLowerCase().includes(query)).slice(0, 8);
        box.innerHTML = rows.length ? '<div style="overflow:hidden;border:1px solid #dfe5ef;border-radius:6px;background:#fff;box-shadow:0 10px 24px rgba(23,32,51,.08)">'+rows.map((item, index) => '<button type="button" data-ncm="'+index+'" style="display:block;width:100%;border:0;border-bottom:1px solid #edf1f6;background:#fff;text-align:left;padding:10px 12px;cursor:pointer"><b style="color:#123f8c">'+item.code+'</b> <span style="color:#526176">'+item.description+'</span></button>').join("")+'</div>' : "";
        document.querySelectorAll("[data-ncm]").forEach((btn) => btn.addEventListener("click", () => {
          const item = rows[Number(btn.dataset.ncm)];
          selectedNcm = item;
          document.getElementById("hsCode").value = item.code;
          box.innerHTML = "";
          renderNcmSuggestions();
          hideResults();
        }));
      }
      function quotes(){ return JSON.parse(localStorage.getItem(key) || "[]"); }
      function setQuotes(rows){ localStorage.setItem(key, JSON.stringify(rows)); }
      function renderHistory(){
        const rows = quotes();
        if (!rows.length) {
          document.getElementById("history").innerHTML = '<div class="panel" style="text-align:center"><b>Nenhuma cotacao salva para este usuario</b><p class="desc" style="margin:8px auto 0">Salve uma cotacao para ver a separacao entre cliente1 e cliente2.</p></div>';
          document.getElementById("detail").innerHTML = "";
          return;
        }
        document.getElementById("history").innerHTML = '<div class="table"><div class="row head"><span>Data</span><span>Produto</span><span>HS/NCM</span><span>Acoes</span></div>' + rows.map((q, i) => '<div class="row"><span>'+new Date(q.createdAt).toLocaleDateString("pt-BR")+'</span><span>'+q.productName+'</span><span>'+q.hsCode+'</span><span class="actions"><button class="linkbtn" data-open="'+i+'">Abrir</button><button class="linkbtn" data-copy="'+i+'">Copiar</button></span></div>').join("") + '</div>';
        document.querySelectorAll("[data-open]").forEach(btn => btn.addEventListener("click", () => openDetail(rows[Number(btn.dataset.open)])));
        document.querySelectorAll("[data-copy]").forEach(btn => btn.addEventListener("click", () => copyQuote(rows[Number(btn.dataset.copy)])));
      }
      function openDetail(q){
        document.getElementById("detail").innerHTML = '<section class="panel" style="margin-top:18px"><h2>Detalhe da cotacao</h2><p><b>Produto:</b> '+q.productName+'</p><p><b>HS/NCM:</b> '+q.hsCode+'</p><p><b>Fornecedor:</b> '+(q.supplierName || "Identificado por cartao anexado")+'</p><p><b>E-mail:</b> '+(q.supplierEmail || "-")+'</p><p><b>Telefone:</b> '+(q.supplierPhone || "-")+'</p><p><b>FOB total:</b> '+money(q.fobTotalUsd,"USD")+'</p><p><b>Valor fazendo via RPX:</b> '+money(q.totalCostRpxBrl,"BRL")+'</p><p><b>Valor importacao direta:</b> '+money(q.totalCostDirectBrl,"BRL")+'</p><p><b>Diferenca via RPX:</b> '+money(q.savingsBrl,"BRL")+' ('+percent(q.savingsPercent)+')</p><p class="notice">Estimativa preliminar sujeita à validação fiscal, logística e operacional.</p></section>';
      }
      function copyQuote(q){
        navigator.clipboard.writeText(["Produto: "+q.productName, "HS/NCM: "+q.hsCode, "FOB unitario: "+money(q.fobUnitUsd,"USD"), "Quantidade: "+q.quantity, "FOB total: "+money(q.fobTotalUsd,"USD"), "Fornecedor: "+(q.supplierName || "Cartao de visitas anexado"), q.supplierEmail ? "E-mail do fornecedor: "+q.supplierEmail : "", q.supplierPhone ? "Telefone do fornecedor: "+q.supplierPhone : "", "", "Estimativa com a RPX: "+money(q.totalCostRpxBrl,"BRL"), "Referencia de importacao direta: "+money(q.totalCostDirectBrl,"BRL"), "Diferenca estimada com a RPX: "+money(q.savingsBrl,"BRL")+" ("+percent(q.savingsPercent)+")", "", "Estimativa preliminar sujeita à validação fiscal, logística e operacional."].filter(Boolean).join("\\n"));
      }
      fields.forEach(id => document.getElementById(id).addEventListener("input", hideResults));
      document.getElementById("hsCode").addEventListener("input", () => {
        selectedNcm = null;
        renderNcmSuggestions();
      });
      document.getElementById("images").addEventListener("change", (event) => {
        images = Array.from(event.target.files || []).slice(0, 5).map(file => file.name);
        document.getElementById("image-list").innerHTML = images.map(name => '<span class="pill">Produto: '+name+'</span>').join("");
        hideResults();
      });
      document.getElementById("supplierContactImages").addEventListener("change", (event) => {
        supplierContactImages = Array.from(event.target.files || []).slice(0, 3).map(file => file.name);
        document.getElementById("supplier-contact-image-list").innerHTML = supplierContactImages.map(name => '<span class="pill supplier">Fornecedor: '+name+'</span>').join("");
        hideResults();
      });
      document.getElementById("calculateQuote").addEventListener("click", async () => {
        const data = input();
        const message = validate(data);
        const errorBox = document.getElementById("calculation-error");
        if (message) {
          hideResults();
          errorBox.textContent = message;
          errorBox.classList.remove("hidden");
          return;
        }
        errorBox.classList.add("hidden");
        const calculateButton = document.getElementById("calculateQuote");
        calculateButton.disabled = true;
        calculateButton.textContent = "Atualizando cotacao...";
        try {
          const response = await fetch("/api/exchange-rate", { cache: "no-store" });
          if (!response.ok) throw new Error("exchange rate unavailable");
          const exchangeRate = await response.json();
          if (!exchangeRate.rate || exchangeRate.rate <= 0) throw new Error("invalid exchange rate");
          data.usedDollar = exchangeRate.rate;
          calculatedResult = calc(data);
        } catch {
          errorBox.textContent = "Nao foi possivel atualizar os parametros da cotacao. Tente novamente em instantes.";
          errorBox.classList.remove("hidden");
          return;
        } finally {
          calculateButton.disabled = false;
          calculateButton.textContent = "Fazer calculo";
        }
        const form = document.getElementById("calculation-form");
        form.classList.add("closing");
        window.setTimeout(() => {
          form.classList.remove("closing");
          renderCalc(calculatedResult);
        }, 180);
      });
      document.getElementById("redoCalculation").addEventListener("click", () => {
        const results = document.getElementById("calculation-results");
        results.classList.add("closing");
        window.setTimeout(() => {
          results.classList.remove("closing");
          hideResults();
        }, 180);
      });
      document.getElementById("saveQuote").addEventListener("click", () => {
        if (!calculatedResult) return;
        const data = input();
        const record = { ...data, ...calculatedResult, id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: "submitted", images, supplierContactImages };
        setQuotes([record, ...quotes()]);
        document.querySelector('[data-tab="history"]').click();
        openDetail(record);
      });
      document.querySelectorAll("[data-tab]").forEach(btn => btn.addEventListener("click", () => {
        document.querySelectorAll("[data-tab]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById("new-tab").classList.toggle("hidden", btn.dataset.tab !== "new");
        document.getElementById("history-tab").classList.toggle("hidden", btn.dataset.tab !== "history");
        if (btn.dataset.tab === "history") renderHistory();
      }));
      fetch("/data/ncm.json").then(r => r.json()).then(data => { ncmOptions = data; }).catch(() => { ncmOptions = []; });
    </script>
  `;
}

function parseCookies(req) {
  return Object.fromEntries((req.headers.cookie ?? "").split(";").filter(Boolean).map((part) => {
    const [key, ...value] = part.trim().split("=");
    return [key, decodeURIComponent(value.join("="))];
  }));
}

function currentUser(req) {
  const email = parseCookies(req).global_rpx_mock_user;
  return mockUsers.find((user) => user.email === email) ?? null;
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

function formatPtaxDate(date) {
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${month}-${day}-${date.getUTCFullYear()}`;
}

async function getCurrentExchangeRate() {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - 10);
  const response = await fetch(
    "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/" +
      "CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)" +
      `?@dataInicial='${formatPtaxDate(startDate)}'` +
      `&@dataFinalCotacao='${formatPtaxDate(endDate)}'` +
      "&$top=1&$orderby=dataHoraCotacao%20desc" +
      "&$format=json&$select=cotacaoVenda,dataHoraCotacao",
    { headers: { accept: "application/json" } }
  );
  if (!response.ok) throw new Error(`PTAX request failed with status ${response.status}`);
  const data = await response.json();
  const latestQuote = data.value?.[0];
  if (!latestQuote?.cotacaoVenda || !latestQuote.dataHoraCotacao) {
    throw new Error("PTAX response did not include a valid selling rate");
  }
  return {
    rate: latestQuote.cotacaoVenda * internalExchangeRateFactor,
    quotedAt: latestQuote.dataHoraCotacao
  };
}

let currentPath = "/";

const server = http.createServer(async (req, res) => {
  currentPath = new URL(req.url ?? "/", `http://localhost:${port}`).pathname;

  if (req.method === "POST" && currentPath === "/login") {
    const body = new URLSearchParams(await readBody(req));
    const user = mockUsers.find((item) => item.email === body.get("email"));
    if (!user) {
      res.writeHead(302, { location: "/login?error=mock-user-not-found" });
      res.end();
      return;
    }
    res.writeHead(302, {
      location: user.role === "admin" ? "/admin/dashboard" : "/app",
      "set-cookie": `global_rpx_mock_user=${encodeURIComponent(user.email)}; Path=/; SameSite=Lax; Max-Age=604800`
    });
    res.end();
    return;
  }

  if (req.method === "POST" && currentPath === "/logout") {
    res.writeHead(302, {
      location: "/login",
      "set-cookie": "global_rpx_mock_user=; Path=/; Max-Age=0"
    });
    res.end();
    return;
  }

  if (currentPath === "/logo-global-rpx-horizontal.png") {
    const logoPath = path.join(root, "public", "logo-global-rpx-horizontal.png");
    res.writeHead(200, { "content-type": "image/png" });
    res.end(fs.readFileSync(logoPath));
    return;
  }

  if (currentPath === "/data/ncm.json") {
    const ncmPath = path.join(root, "public", "data", "ncm.json");
    res.writeHead(200, { "content-type": "application/json" });
    res.end(fs.readFileSync(ncmPath));
    return;
  }

  if (currentPath === "/api/exchange-rate") {
    try {
      const exchangeRate = await getCurrentExchangeRate();
      res.writeHead(200, {
        "content-type": "application/json",
        "cache-control": "no-store"
      });
      res.end(JSON.stringify(exchangeRate));
    } catch (error) {
      console.error("PTAX preview request failed:", error);
      res.writeHead(503, {
        "content-type": "application/json",
        "cache-control": "no-store"
      });
      res.end(JSON.stringify({ error: "exchange_rate_unavailable" }));
    }
    return;
  }

  const user = currentUser(req);
  const isInternal = currentPath === "/app" || currentPath.startsWith("/app/") || currentPath === "/admin" || currentPath.startsWith("/admin/");

  if (isInternal && !user) {
    res.writeHead(302, { location: "/login" });
    res.end();
    return;
  }

  if (user?.role === "client" && currentPath.startsWith("/admin")) {
    res.writeHead(302, { location: "/app" });
    res.end();
    return;
  }

  if (user?.role === "admin" && currentPath.startsWith("/app")) {
    res.writeHead(302, { location: "/admin/dashboard" });
    res.end();
    return;
  }

  const routes = {
    "/": landing,
    "/login": login,
    "/app": () => shell("client", "Bem-vindo a Global RPX", "Acompanhe suas cotacoes preliminares e simulacoes preparadas pelo time RPX.", cards([["Sessao atual", user.email, user.company], ["Simulacoes disponiveis", "0", "Resultados publicados pela RPX aparecerao aqui."], ["Proxima acao", "Calculadora", "Criar uma cotacao preliminar."]]), user),
    "/app/calculadora": () => shell("client", "Calculadora", "Crie cotacoes preliminares e compare o valor de importacao direta com o valor comprando via RPX.", calculator(user), user),
    "/app/simulacoes": () => shell("client", "Modulo Simulacoes", "Aqui o cliente vera simulacoes publicadas pelo time RPX.", `<section class="card"><p>As simulacoes reais serao conectadas ao Supabase em uma etapa posterior.</p></section>`, user),
    "/admin": () => shell("admin", "Dashboard RPX", "Visao inicial estatica para validar a fundacao administrativa.", cards([["Clientes cadastrados", "2", "Clientes mock disponiveis."], ["Cotacoes recebidas", "mock", "Cotacoes estao em localStorage por usuario."], ["Simulacoes em aberto", "0", "Fluxo interno futuro."], ["Simulacoes publicadas", "0", "Historico do cliente futuro."]]), user),
    "/admin/dashboard": () => routes["/admin"](),
    "/admin/clientes": () => shell("admin", "Clientes", "Cadastro de clientes da RPX.", table(["Empresa", "Contato", "E-mail", "Status"]), user),
    "/admin/fornecedores": () => shell("admin", "Fornecedores", "Cadastro de fornecedores.", table(["Nome", "Pais", "Cidade", "Contato"]), user),
    "/admin/despachantes": () => shell("admin", "Despachantes", "Cadastro de despachantes.", table(["Empresa", "Documento", "E-mail", "Telefone"]), user),
    "/admin/usuarios": () => shell("admin", "Usuarios", "Usuarios administrativos e clientes.", table(["Nome", "E-mail", "Perfil", "Cliente"]), user),
    "/admin/parametros": () => shell("admin", "Parametros", "Parametros comerciais e operacionais futuros.", `<div class="param">${[["Fator RPX padrao", "1.8"], ["Fator importacao direta padrao", "2.2"], ["Maximo de imagens por cotacao", "5"], ["Fonte do dolar", "PTAX venda"]].map(([a, b]) => `<section class="card"><small>${a}</small><strong>${b}</strong></section>`).join("")}</div>`, user),
    "/admin/cotacoes": () => shell("admin", "Cotacoes", "Cotacoes dos clientes serao listadas apos a implementacao da calculadora.", table(["Data", "Cliente", "Produto", "Status"]), user),
    "/admin/simulacoes": () => shell("admin", "Simulacoes", "Simulacoes preparadas pelo time RPX.", table(["Titulo", "Cliente", "Status", "Publicado em"]), user)
  };

  const render = routes[currentPath] ?? routes["/"];
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(render());
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Global RPX preview running at http://127.0.0.1:${port}`);
});
