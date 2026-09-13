// 💀 La Guardia — Centro de Mando
// Portafolio de proyectos. Datos base embebidos + actualización en vivo desde la API de GitHub.

const GH_USER = "vonpilzenCC";
const AVATAR = "https://avatars.githubusercontent.com/u/256563922?v=4";

const BASE_DATA = [
  {
    name: "satelite-radar-osint",
    description: "Catálogo OSINT de 97 proyectos de código abierto sobre satélites y radares: rastreo orbital, SDR, procesamiento de radar, imaginería satelital, ADS-B, SAR, GNSS y vigilancia espacial. Incluye sitio web con filtros y búsqueda.",
    language: "CSS",
    topics: ["osint", "satellite", "radar", "sdr", "catalog", "ads-b", "sar", "gnss"],
    stars: 0, forks: 0, updated: "2026-09-13", license: "MIT",
    homepage: "https://vonpilzencc.github.io/satelite-radar-osint/"
  },
  {
    name: "satellite-security-toolkit",
    description: "Compendio de herramientas de código abierto para investigación en seguridad espacial y comunicaciones satelitales: SDR (gr-satellites), ingeniería inversa de firmware (F Prime), protocolos CCSDS y retos Hack-a-Sat.",
    language: "C++",
    topics: ["satellite", "security", "sdr", "firmware", "ccsds", "hack-a-sat", "space"],
    stars: 0, forks: 0, updated: "2026-04-11", license: null, homepage: null
  },
  {
    name: "router-sim-security",
    description: "Entorno de emulación de firmware de routers en laboratorio virtualizado y seguro. Soporte para Firmadyne y QEMU con imagen OpenWrt x86_64, más análisis con binwalk, Radare2 y Nmap.",
    language: "Assembly",
    topics: ["firmware", "emulation", "qemu", "security", "iot", "reverse-engineering", "openwrt"],
    stars: 0, forks: 0, updated: "2026-04-11", license: null, homepage: null
  },
  {
    name: "cubecat-sim-security",
    description: "Entorno de emulación de alta fidelidad para satélites CubeSat usando el software de vuelo oficial (NASA cFS) y QEMU. Scripts de estación terrena para pruebas de protocolos CCSDS e inyección de comandos.",
    language: "Python",
    topics: ["cubesat", "cfs", "qemu", "satellite", "security", "ccsds", "space"],
    stars: 0, forks: 0, updated: "2026-04-11", license: null, homepage: null
  }
];

let PROJECTS = [];
let activeLang = "Todos";
let query = "";

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function(c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function fmtDate(iso) {
  if (!iso) return "—";
  var d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "2-digit" });
}

function fmtNum(n) {
  if (n == null) return "0";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "k";
  return String(n);
}

async function loadRepos() {
  var liveMap = {};
  try {
    var res = await fetch("https://api.github.com/users/" + GH_USER + "/repos?per_page=100&sort=updated");
    if (res.ok) {
      var data = await res.json();
      data.forEach(function(r) {
        liveMap[r.name] = {
          stars: r.stargazers_count, forks: r.forks_count, updated: r.updated_at,
          description: r.description, language: r.language, homepage: r.homepage,
          topics: r.topics, license: r.license ? r.license.spdx_id : null
        };
      });
    }
  } catch (e) {}

  PROJECTS = BASE_DATA.map(function(p) {
    var live = liveMap[p.name];
    if (!live) return p;
    return {
      name: p.name, description: p.description, language: p.language, license: p.license,
      stars: live.stars != null ? live.stars : p.stars,
      forks: live.forks != null ? live.forks : p.forks,
      updated: live.updated ? live.updated.slice(0, 10) : p.updated,
      homepage: live.homepage || p.homepage,
      topics: (live.topics && live.topics.length) ? live.topics : p.topics
    };
  });

  Object.keys(liveMap).forEach(function(name) {
    if (name === "vonpilzenCC.github.io") return;
    if (!PROJECTS.find(function(p) { return p.name === name; })) {
      var l = liveMap[name];
      PROJECTS.push({
        name: name, description: l.description || "Proyecto de código abierto.",
        language: l.language || "Otros", topics: l.topics || [],
        stars: l.stars || 0, forks: l.forks || 0,
        updated: l.updated ? l.updated.slice(0, 10) : "—",
        license: l.license, homepage: l.homepage
      });
    }
  });

  PROJECTS.sort(function(a, b) { return new Date(b.updated) - new Date(a.updated); });
}

function renderStats() {
  document.getElementById("stat-repos").textContent = PROJECTS.length;
  var langSet = new Set(PROJECTS.map(function(p) { return p.language; }).filter(Boolean));
  document.getElementById("stat-langs").textContent = langSet.size;
  var stars = PROJECTS.reduce(function(s, p) { return s + (p.stars || 0); }, 0);
  document.getElementById("stat-stars").textContent = fmtNum(stars);
  var latest = PROJECTS[0] ? PROJECTS[0].updated : "—";
  document.getElementById("stat-updated").textContent = fmtDate(latest);
}

function renderPills() {
  var langArr = PROJECTS.map(function(p) { return p.language; }).filter(Boolean);
  var langSet = new Set(langArr);
  var langs = ["Todos"].concat(Array.from(langSet).sort());
  var pills = document.getElementById("pills");
  pills.innerHTML = langs.map(function(l) {
    return '<button class="pill ' + (l === activeLang ? "active" : "") + '" data-lang="' + escapeHtml(l) + '">' + escapeHtml(l) + '</button>';
  }).join("");
  pills.querySelectorAll(".pill").forEach(function(btn) {
    btn.addEventListener("click", function() {
      activeLang = btn.dataset.lang;
      renderPills();
      renderGrid();
    });
  });
}

function renderGrid() {
  var grid = document.getElementById("grid");
  var empty = document.getElementById("empty");
  var count = document.getElementById("count");

  var filtered = PROJECTS.filter(function(p) {
    var matchLang = activeLang === "Todos" || p.language === activeLang;
    var q = query.trim().toLowerCase();
    var hay = (p.name + " " + p.description + " " + (p.topics || []).join(" ")).toLowerCase();
    var matchQ = !q || hay.indexOf(q) !== -1;
    return matchLang && matchQ;
  });

  count.textContent = "▸ " + filtered.length + " / " + PROJECTS.length + " PROYECTOS";
  empty.hidden = filtered.length > 0;

  grid.innerHTML = filtered.map(function(p) {
    var url = "https://github.com/" + GH_USER + "/" + p.name;
    var topics = (p.topics || []).slice(0, 5).map(function(t) {
      return '<span class="topic">' + escapeHtml(t) + '</span>';
    }).join("");
    var lic = p.license && p.license !== "NOASSERT" ? " · " + escapeHtml(p.license) : "";
    var home = p.homepage ? '<a href="' + escapeHtml(p.homepage) + '" target="_blank" rel="noopener">▸ DEMO</a>' : "";
    return '<article class="card">' +
      '<div class="card-head">' +
        '<a class="card-title" href="' + url + '" target="_blank" rel="noopener">' + escapeHtml(p.name) + '</a>' +
        (p.language ? '<span class="lang">' + escapeHtml(p.language) + '</span>' : '') +
      '</div>' +
      '<p class="card-desc">' + escapeHtml(p.description) + '</p>' +
      (topics ? '<div class="topics">' + topics + '</div>' : '') +
      '<div class="card-foot">' +
        '<span class="meta">⭐ ' + fmtNum(p.stars) + ' · ⑂ ' + fmtNum(p.forks) + ' · ' + fmtDate(p.updated) + lic + '</span>' +
        home +
      '</div>' +
    '</article>';
  }).join("");
}

function init() {
  document.getElementById("year").textContent = new Date().getFullYear();
  var av = document.querySelector(".avatar");
  if (av) av.src = AVATAR;
  var search = document.getElementById("search");
  search.addEventListener("input", function() { query = search.value; renderGrid(); });
  loadRepos().then(function() { renderStats(); renderPills(); renderGrid(); });
}

init();
