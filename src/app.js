(function(){
"use strict";
const SEED = JSON.parse(document.getElementById('seed').textContent);
let _sellMap = null;                                       // prix de revente PNJ (or), relevés dans l'API Blizzard
const npcSell = n => { if (!_sellMap) { _sellMap = new Map(Object.entries(SEED.sell || {}).map(([k, v]) => [norm(k), v])); } const v = _sellMap.get(norm(n)); return v === undefined ? null : v; };
// ---------- Recettes de Cuisine WoW Forever (liste bêta 1.60.1 + recettes de poisson des guides) ----------
// sk = compétence pour apprendre (poisson : début de palier du guide). Campement : recettes listées, pas de craft chiffré.
const COOK = [{"n": "Feu de camp basique", "sk": 1, "cat": "Campement", "q": 1, "r": [["Bois simple", 1]]}, {"n": "Feu de camp de compagnon", "sk": 90, "cat": "Campement", "q": 1, "r": [["Bois d'étoile", 1]]}, {"n": "Festin de Macaron", "sk": 140, "cat": "Campement", "q": 1, "r": [["Viande mystère", 2], ["Viande de kodo épaisse", 1], ["Épices apaisantes", 1]]}, {"n": "Feu de camp de spécialiste", "sk": 200, "cat": "Campement", "q": 1, "r": [["Bûches épaisses", 1]]}, {"n": "Four en fer", "sk": 300, "cat": "Campement", "q": 1, "r": [["Farine simple", 10], ["Eau de source", 5], ["Épices apaisantes", 4]]}, {"n": "Viande de loup grillée", "sk": 1, "cat": "Plats courants", "q": 1, "r": [["Viande de loup maigre", 1]]}, {"n": "Kébab d'araignée kaldorei", "sk": 10, "cat": "Plats courants", "q": 1, "r": [["Petite patte d'araignée", 1]]}, {"n": "Palourdes bouillies", "sk": 50, "cat": "Plats courants", "q": 1, "r": [["Chair de palourde", 1], ["Eau de source", 1]]}, {"n": "Brouet de rat", "sk": 90, "cat": "Plats courants", "q": 2, "r": [["Rat fouisseur", 1]]}, {"n": "Soupe de palourdes", "sk": 90, "cat": "Plats courants", "q": 1, "r": [["Chair de palourde", 1], ["Lait glacé", 1], ["Épices douces", 1]]}, {"n": "Palourdes gobelines", "sk": 125, "cat": "Plats courants", "q": 1, "r": [["Chair de palourde relevée", 1], ["Épices fortes", 1]]}, {"n": "Ardeur de palourde géante", "sk": 175, "cat": "Plats courants", "q": 1, "r": [["Chair de palourde géante", 1], ["Épices fortes", 1]]}, {"n": "Bisque de tortue apaisante", "sk": 175, "cat": "Plats courants", "q": 1, "r": [["Viande de tortue", 1], ["Épices apaisantes", 1]]}, {"n": "Ragoût mystère", "sk": 175, "cat": "Plats courants", "q": 1, "r": [["Viande mystère", 1], ["Outre de bière naine", 1]]}, {"n": "Tourte surprise", "sk": 175, "cat": "Plats courants", "q": 1, "r": [["Viande mystère", 1], ["Épices fortes", 1]]}, {"n": "Chili de souffle de dragon", "sk": 200, "cat": "Plats courants", "q": 1, "r": [["Viande mystère", 1], ["Petit sac de flammes", 1], ["Épices fortes", 1]]}, {"n": "Saucisse d'araignée", "sk": 200, "cat": "Plats courants", "q": 1, "r": [["Viande d'araignée blanche", 2]]}, {"n": "Soupe de palourdes d'Undermine", "sk": 225, "cat": "Plats courants", "q": 2, "r": [["Chair de palourde piquante", 2], ["Épices fortes", 1], ["Lait glacé", 1]]}, {"n": "Linguines aux palourdes", "sk": 275, "cat": "Plats courants", "q": 1, "r": [["Chair de palourde piquante", 3], ["Épices apaisantes", 4]]}, {"n": "Œufs aux herbes", "sk": 1, "cat": "Endurance", "q": 1, "r": [["Petit œuf", 1], ["Épices douces", 1]]}, {"n": "Soufflé de Mur-Céleste", "sk": 25, "cat": "Endurance", "q": 1, "r": [["Petit œuf", 2], ["Farine simple", 1]]}, {"n": "Viande de kodo rôtie", "sk": 35, "cat": "Endurance", "q": 2, "r": [["Viande de kodo", 1], ["Épices douces", 1]]}, {"n": "Omelette de petit déjeuner", "sk": 75, "cat": "Endurance", "q": 1, "r": [["Petit œuf", 1], ["Épices douces", 4]]}, {"n": "Soupe aux ailerons de murloc", "sk": 90, "cat": "Endurance", "q": 1, "r": [["Aileron de murloc", 2], ["Épices fortes", 1]]}, {"n": "Queue de lézard croquante", "sk": 100, "cat": "Endurance", "q": 2, "r": [["Queue de lézard-tonnerre", 1], ["Épices fortes", 1]]}, {"n": "Tourte d'araignée fondante", "sk": 110, "cat": "Endurance", "q": 1, "r": [["Patte d'araignée fondante", 2], ["Épices fortes", 1]]}, {"n": "Omelette au goût étrange", "sk": 130, "cat": "Endurance", "q": 1, "r": [["Œuf de raptor", 1], ["Épices fortes", 1]]}, {"n": "Œufs brouillés géants", "sk": 175, "cat": "Endurance", "q": 1, "r": [["Œuf géant", 2], ["Épices fortes", 4]]}, {"n": "Ragoût épais de kodo", "sk": 200, "cat": "Endurance", "q": 2, "r": [["Viande de kodo épaisse", 2], ["Épices apaisantes", 1], ["Eau de source", 1]]}, {"n": "Omelette monstrueuse", "sk": 225, "cat": "Endurance", "q": 1, "r": [["Œuf géant", 1], ["Épices apaisantes", 2]]}, {"n": "Ragoût de tortue savoureux", "sk": 275, "cat": "Endurance", "q": 1, "r": [["Viande de tortue", 3], ["Épices apaisantes", 3]]}, {"n": "Viande de sanglier rôtie", "sk": 1, "cat": "Force", "q": 1, "r": [["Morceau de viande de sanglier", 1]]}, {"n": "Côtes de sanglier à la bière", "sk": 25, "cat": "Force", "q": 1, "r": [["Côtes de sanglier des rochers", 1], ["Bière au malt Rhapsody", 1]]}, {"n": "Viande d'ours fumée", "sk": 40, "cat": "Force", "q": 1, "r": [["Viande d'ours", 1]]}, {"n": "Tourte au foie de Broche-tripes", "sk": 50, "cat": "Force", "q": 1, "r": [["Foie de Broche-tripes", 1], ["Épices douces", 1]]}, {"n": "Boudin", "sk": 60, "cat": "Force", "q": 2, "r": [["Viande d'ours", 1], ["Tripes de sanglier", 1], ["Ichor d'araignée", 1]]}, {"n": "Côtes de porc séchées", "sk": 80, "cat": "Force", "q": 1, "r": [["Côtes de sanglier", 1], ["Épices douces", 1]]}, {"n": "Côtes de porc aux herbes", "sk": 110, "cat": "Force", "q": 1, "r": [["Côtes de sanglier", 2], ["Épices fortes", 1]]}, {"n": "Steak de grand ours", "sk": 110, "cat": "Force", "q": 1, "r": [["Viande de grand ours", 1], ["Épices fortes", 1]]}, {"n": "Venaison dégraissée", "sk": 110, "cat": "Force", "q": 2, "r": [["Viande de cerf", 1], ["Épices douces", 4]]}, {"n": "Poitrine d'ours", "sk": 175, "cat": "Force", "q": 1, "r": [["Viande de grand ours", 2], ["Épices fortes", 3]]}, {"n": "Bonne vieille viande de brochepâle", "sk": 185, "cat": "Force", "q": 1, "r": [["Morceau de viande de sanglier", 2], ["Épices douces", 1]]}, {"n": "Mini-burgers de cerf savoureux", "sk": 225, "cat": "Force", "q": 1, "r": [["Viande de cerf", 2], ["Épices fortes", 3]]}, {"n": "Bruscitt d'ours", "sk": 275, "cat": "Force", "q": 1, "r": [["Viande de grand ours", 3], ["Épices apaisantes", 3]]}, {"n": "Steak de cerf fumant", "sk": 275, "cat": "Force", "q": 1, "r": [["Viande de cerf", 3], ["Épices apaisantes", 4]]}, {"n": "Boulettes fumées du désert", "sk": 325, "cat": "Force", "q": 1, "r": [["Chair de ver des sables", 1], ["Épices apaisantes", 1]]}, {"n": "Viande de loup épicée", "sk": 10, "cat": "Agilité", "q": 1, "r": [["Viande de loup maigre", 1], ["Épices douces", 1]]}, {"n": "Steak de coyote", "sk": 50, "cat": "Agilité", "q": 1, "r": [["Viande de coyote", 1]]}, {"n": "Steak de crocilisque", "sk": 80, "cat": "Agilité", "q": 1, "r": [["Viande de crocilisque", 1], ["Épices douces", 1]]}, {"n": "Kébab de loup assaisonné", "sk": 100, "cat": "Agilité", "q": 3, "r": [["Steak de loup", 2], ["Épices douces", 1]]}, {"n": "Gombo de crocilisque", "sk": 120, "cat": "Agilité", "q": 1, "r": [["Viande de crocilisque tendre", 1], ["Épices fortes", 1]]}, {"n": "Côtelettes de lion épicées", "sk": 125, "cat": "Agilité", "q": 1, "r": [["Viande de lion", 1], ["Épices fortes", 1]]}, {"n": "Steak de loup", "sk": 125, "cat": "Agilité", "q": 1, "r": [["Steak de loup", 1], ["Épices douces", 1]]}, {"n": "Délicieux steak de lion", "sk": 150, "cat": "Agilité", "q": 1, "r": [["Viande de lion", 2], ["Épices apaisantes", 1]]}, {"n": "Ragoût épais de crocilisque", "sk": 150, "cat": "Agilité", "q": 1, "r": [["Viande de crocilisque tendre", 2], ["Épices apaisantes", 1]]}, {"n": "Côtes de loup épicées", "sk": 175, "cat": "Agilité", "q": 1, "r": [["Viande de loup rouge", 1], ["Épices fortes", 1]]}, {"n": "Ragoût de la jungle", "sk": 175, "cat": "Agilité", "q": 2, "r": [["Viande de tigre", 1], ["Eau de source", 1], ["Pomme rouge brillante", 2]]}, {"n": "Steak de loup tendre", "sk": 225, "cat": "Agilité", "q": 1, "r": [["Viande de loup tendre", 1], ["Épices apaisantes", 1]]}, {"n": "Flanchet au poivre", "sk": 275, "cat": "Agilité", "q": 1, "r": [["Viande de loup rouge", 3], ["Épices apaisantes", 3]]}, {"n": "Steak de frappe rapide", "sk": 275, "cat": "Agilité", "q": 1, "r": [["Viande de tigre", 3], ["Épices apaisantes", 2]]}, {"n": "Aile de chauve-souris croustillante", "sk": 1, "cat": "Intelligence", "q": 1, "r": [["Aile de chauve-souris charnue", 1], ["Épices douces", 1]]}, {"n": "Délicieuses bouchées au raptor", "sk": 25, "cat": "Intelligence", "q": 1, "r": [["Œuf de raptor", 1], ["Épices douces", 4]]}, {"n": "Brouet de trotteur", "sk": 50, "cat": "Intelligence", "q": 2, "r": [["Viande de trotteur", 1], ["Pomme rouge brillante", 1]]}, {"n": "Beignet de crabe", "sk": 75, "cat": "Intelligence", "q": 1, "r": [["Chair de clampant", 1], ["Épices douces", 1]]}, {"n": "Émincé de raptor aux deux épices", "sk": 75, "cat": "Intelligence", "q": 1, "r": [["Chair de raptor", 1], ["Épices douces", 2]]}, {"n": "Pince de crabe farcie", "sk": 85, "cat": "Intelligence", "q": 1, "r": [["Pince de clampant", 1], ["Épices douces", 1]]}, {"n": "Goulash des Carmines", "sk": 100, "cat": "Intelligence", "q": 1, "r": [["Chair croustillante d'araignée", 1], ["Viande de condor coriace", 1]]}, {"n": "Rôti de raptor", "sk": 175, "cat": "Intelligence", "q": 1, "r": [["Chair de raptor", 1], ["Épices fortes", 1]]}, {"n": "Aile de busard grillée", "sk": 175, "cat": "Intelligence", "q": 1, "r": [["Aile de busard", 1], ["Épices fortes", 1]]}, {"n": "Côtelettes de raptor bouillantes", "sk": 180, "cat": "Intelligence", "q": 1, "r": [["Chair de raptor", 2], ["Épices fortes", 3]]}, {"n": "Chili de crabe épicé", "sk": 225, "cat": "Intelligence", "q": 1, "r": [["Viande de crabe tendre", 1], ["Épices fortes", 2]]}, {"n": "Paupiette de raptor", "sk": 225, "cat": "Intelligence", "q": 1, "r": [["Chair de raptor", 2], ["Épices fortes", 4]]}, {"n": "Courante-surprise", "sk": 275, "cat": "Intelligence", "q": 1, "r": [["Racine de Courante", 1], ["Épices apaisantes", 1]]}, {"n": "Frappé gélatineux", "sk": 100, "cat": "Boissons & autres", "q": 1, "r": [["Lait glacé", 1], ["Épices douces", 2], ["Ichor d'araignée", 1]]}, {"n": "Frappé épicé", "sk": 200, "cat": "Boissons & autres", "q": 1, "r": [["Jus de baie lunaire", 1], ["Épices apaisantes", 3], ["Petit sac de flammes", 1]]}, {"n": "Thé de triage", "sk": 180, "cat": "Boissons & autres", "q": 1, "r": [["Nectar sucré", 1], ["Pâlerette", 2]]}, {"n": "Thé du soleil", "sk": 200, "cat": "Boissons & autres", "q": 1, "r": [["Jus de baie lunaire", 1], ["Soleillette", 2]]}, {"n": "Pyro-côtelettes de chimaerok à la Dirge", "sk": 300, "cat": "Boissons & autres", "q": 1, "r": [["Épices fortes", 1], ["Carburant de fusée des gobelins", 1], ["Sel de Fonderoc", 1], ["Filet de chimaerok", 1]]}, {"n": "Goujon brillant", "sk": 1, "cat": "Poisson", "q": 1, "r": [["Goujon brillant cru", 1]], "g": 1}, {"n": "Maquereau ombré", "sk": 1, "cat": "Poisson", "q": 1, "r": [["Maquereau ombré cru", 1]], "g": 1}, {"n": "Lutjan à longue mâchoire", "sk": 50, "cat": "Poisson", "q": 1, "r": [["Lutjan à longue mâchoire cru", 1]], "g": 1}, {"n": "Thon arc-en-ciel", "sk": 50, "cat": "Poisson", "q": 1, "r": [["Thon arc-en-ciel cru", 1]], "g": 1}, {"n": "Poisson-chat moustachu", "sk": 100, "cat": "Poisson", "q": 1, "r": [["Poisson-chat moustachu cru", 1]], "g": 1}, {"n": "Truite tête-mithril", "sk": 175, "cat": "Poisson", "q": 1, "r": [["Truite tête-mithril crue", 1]], "g": 1}, {"n": "Jaune-queue tacheté", "sk": 225, "cat": "Poisson", "q": 1, "r": [["Jaune-queue tacheté cru", 1]], "g": 1}, {"n": "Filet de rouget", "sk": 225, "cat": "Poisson", "q": 1, "r": [["Rouget cru", 1]], "g": 1}, {"n": "Saumon solécaille poché", "sk": 275, "cat": "Poisson", "q": 1, "r": [["Saumon solécaille cru", 1]], "g": 1}, {"n": "Soupe de lutjan nagenuit", "sk": 275, "cat": "Poisson", "q": 1, "r": [["Lutjan nagenuit cru", 1], ["Eau de source", 1]], "g": 1}];
COOK.forEach(c => {
  if (SEED.recipes.some(r => r.job==="Cuisine" && norm(r.n)===norm(c.n))) return;
  const camp = c.cat==="Campement";
  SEED.recipes.push({n:c.n, k:"craft", job:"Cuisine", sk:c.sk, src: c.g ? "Guide de montée" : "Liste Forever (bêta)", z:"—",
    d: camp ? "Campement (outil)" : c.cat + (c.q>1 ? ` · produit ×${c.q}` : ""), l:true, t:!camp, nc:camp});
  if (!camp) SEED.crafts.push({n:c.n, r:c.r, l:true, qty:c.q});
});
const DAYS = ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
const LS_KEY = "wowf-pilotage-v1";

// ---------- Utilitaires ----------
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function norm(s){
  const c = norm.c || (norm.c = new Map());                 // mémorisation : 92 appels sur les mêmes noms
  let r = c.get(s); if (r !== undefined) return r;
  r = String(s||"").replace(/[’‘`]/g,"'").replace(/\u00a0/g," ").replace(/œ/g,"oe").replace(/Œ/g,"oe")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\s+/g," ").trim();
  if (c.size > 40000) c.clear();
  c.set(s, r); return r;
}
// Montant en or (décimal) -> "12g 34s 56c" avec couleurs de pièces
function money(v, opt){
  if (v === null || v === undefined || !isFinite(v)) return '<span class="muted">—</span>';
  const neg = v < 0; let c = Math.round(Math.abs(v)*10000);
  const g = Math.floor(c/10000); c -= g*10000; const s = Math.floor(c/100); c -= s*100;
  const parts = [];
  if (g) parts.push(`<b class="g">${g.toLocaleString("fr-FR")}</b><i>g</i>`);
  if (s || (g && c && g < 100)) parts.push(`<b class="s">${s}</b><i>s</i>`);
  if ((c || (!g && !s)) && !(g >= 100)) parts.push(`<b class="c">${c}</b><i>c</i>`);
  return `<span class="m${neg?" neg":""}">${neg?"−":""}${parts.join("")}</span>`;
}
const roiTxt = v => (v!==null && isFinite(v) && v > 5) ? "> 500 %" : pct(v);   // ROI plafonné à l'affichage : un coût dérisoire donne des pourcentages sans sens
const pct = v => (v===null||!isFinite(v)) ? "—" : (v*100).toLocaleString("fr-FR",{maximumFractionDigits: Math.abs(v)<0.1?1:0})+" %";
const median = a => { const b=a.filter(x=>x!==null&&isFinite(x)).sort((x,y)=>x-y); if(!b.length) return null; const m=b.length>>1; return b.length%2?b[m]:(b[m-1]+b[m])/2; };
const today = () => { const d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); };
const fmtDate = iso => { if (!iso) return "—"; const [y,m,d]=iso.split("-"); return `${d}/${m}/${y}`; };
function askConfirm(msg, ok){
  const o=document.createElement("div");
  o.setAttribute("role","alertdialog"); o.setAttribute("aria-modal","true");
  o.style.cssText="position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:rgba(0,0,0,.55)";
  o.innerHTML='<div style="max-width:420px;margin:16px;background:var(--panel);color:var(--ink);border:1px solid var(--line);border-radius:10px;padding:18px 20px"><p style="margin:0 0 16px">'+esc(msg)+'</p><div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" data-no>Annuler</button><button class="btn" data-yes style="background:var(--badbg);color:var(--bad);border-color:var(--bad)">Confirmer</button></div></div>';
  const close=()=>{o.remove();document.removeEventListener("keydown",onKey);};
  const onKey=e=>{ if(e.key==="Escape") close(); };
  o.addEventListener("click",e=>{ if(e.target===o||e.target.hasAttribute("data-no")) close(); else if(e.target.hasAttribute("data-yes")){ close(); ok(); } });
  document.addEventListener("keydown",onKey);
  document.body.appendChild(o); o.querySelector("[data-no]").focus();
}
function toast(msg){ const t=document.getElementById("toast"); t.textContent=msg; t.classList.add("on"); clearTimeout(toast._t); toast._t=setTimeout(()=>t.classList.remove("on"),2200); }

// ---------- État (persisté) ----------
const DEFAULT_SETTINGS = { cut:0.05, roiOk:0.15, basis:"prudent", buyTh:0.15, defTarget:100, staleH:24, enchMarkup:0.20, enchRound:"or",
  minNet:1, slots:200, depth:20, horizon:7, keepDays:90, minWeeks:3, minHist:7, fPnj:0.25, fCraft:0.5, fFarm:0.5, fHv:1, stacks:{}, faction:"Alliance", staleDays:3 };
const DEFAULT_DESIM = () => [{type:"Armure", br:10, q:"vert", price:null},{type:"Arme", br:10, q:"vert", price:null}];
// Version du schéma : 1 = historique en clair ; 2 = imports en colonnes, historique compacté, dépôts, réglages d'écoulement.
// Chaque migration est une fonction idempotente (v -> v+1) ; un état plus récent que le code est lu tel quel mais signalé.
const SCHEMA = 2;
const MIGRATIONS = {1: s => { s.deposits = s.deposits || {}; s.compacted = s.compacted || {}; }};
let schemaNewer = false;
function migrate(s){
  if (!s || typeof s !== "object") return s;
  let v = +s.v || 1;
  if (v > SCHEMA) { schemaNewer = true; return s; }
  for (; v < SCHEMA; v++) if (MIGRATIONS[v]) MIGRATIONS[v](s);
  s.v = SCHEMA; return s;
}
const freshState = () => ({ v:SCHEMA, imports:{}, stock:{}, pnjStock:{}, target:{}, manual:{}, learned:{}, priceReset:false, stockZero:false, deSim:DEFAULT_DESIM(), settings:{...DEFAULT_SETTINGS} });
let state = freshState();
// ----- Stockage compact : les imports sont écrits en colonnes (noms une seule fois, prix par jour) -----
function packImports(imps){
  const dates = Object.keys(imps).sort(), idx = new Map(), names = [], rows = {};
  dates.forEach(d => { const row = []; Object.entries(imps[d]).forEach(([n,p]) => { let i = idx.get(n); if (i===undefined) { i = names.length; idx.set(n, i); names.push(n); } row[i] = p; }); rows[d] = row; });
  return {n:names, d:rows};
}
function unpackImports(c){
  const out = {}; Object.entries(c.d||{}).forEach(([d,row]) => { const o = {}; for (let i=0; i<row.length; i++) { const p = row[i]; if (p!==null && p!==undefined) o[c.n[i]] = p; } out[d] = o; });
  return out;
}
const _oid = new WeakMap(); let _oidN = 0;
const objId = o => { let i = _oid.get(o); if (i===undefined) { i = ++_oidN; _oid.set(o, i); } return i; };
const importsSig = imps => Object.keys(imps).sort().map(d => d+"#"+objId(imps[d])).join(",");
let _packC = null;
function serialize(){                       // état complet, imports en colonnes (mis en cache tant que les imports ne changent pas)
  const {imports, ...rest} = state, sig = importsSig(imports);
  if (!_packC || _packC.sig !== sig) _packC = {sig, packed: packImports(imports)};
  return JSON.stringify({...rest, imports_c: _packC.packed});
}
function parseStored(raw){                  // lit l'ancien format (imports en clair) comme le nouveau
  const s = JSON.parse(raw); if (s && s.imports_c) { s.imports = unpackImports(s.imports_c); delete s.imports_c; } return migrate(s);
}
const wkStart = d => { const n = Math.round(Date.parse(d+"T00:00:00Z")/864e5), dow = (4+n)%7; return n - ((dow-3+7)%7); };   // mercredi de la semaine de reset
// Historique : détail sur keepDays jours, puis un point par semaine (médiane de chaque objet). Sans effet sur la médiane 30 j.
function compactImports(){
  const ds = Object.keys(state.imports).sort(); if (ds.length < 2) return false;
  const last = Date.parse(ds[ds.length-1]+"T00:00:00Z")/864e5, keep = (state.settings && state.settings.keepDays) || 90;
  const groups = {};
  ds.forEach(d => { if (last - Date.parse(d+"T00:00:00Z")/864e5 > keep) (groups[wkStart(d)] = groups[wkStart(d)] || []).push(d); });
  let changed = false; state.compacted = state.compacted || {};
  Object.values(groups).forEach(g => { if (g.length < 2) return;
    const merged = {}, vals = {};
    g.forEach(d => Object.entries(state.imports[d]).forEach(([n,p]) => (vals[n] = vals[n] || []).push(p)));
    Object.entries(vals).forEach(([n,v]) => merged[n] = +median(v).toFixed(4));
    const keepD = g[g.length-1];
    g.forEach(d => { if (d !== keepD) { delete state.imports[d]; delete state.compacted[d]; } dirtyImports.add(d); });
    state.imports[keepD] = merged; state.compacted[keepD] = true; changed = true; });
  return changed;
}
try { const raw = localStorage.getItem(LS_KEY); if (raw) { const s = parseStored(raw); state = {...state, ...s, settings:{...DEFAULT_SETTINGS, ...(s.settings||{})}}; } } catch(e) {}
// Un export addon déjà reçu = données réelles : l'historique de test ne doit plus compter (migration des états existants)
if (state.addonLast || state.priceAge) state.priceReset = true;
// Relevés d'or à 0 isolés (bug de lecture à la connexion/déconnexion) : un 0 encadré par des jours positifs est faux
function cleanGold(G){
  Object.keys(G||{}).forEach(w => { const ds = Object.keys(G[w]).sort();
    ds.forEach((d, i) => { if (G[w][d] === 0 && ds.slice(0,i).some(x => G[w][x] > 0) && ds.slice(i+1).some(x => G[w][x] > 0)) delete G[w][d]; }); });
}
if (state.gold) cleanGold(state.gold);

let dirtyImports = new Set();
let storageFail = null;            // erreur d'écriture du stockage local (quota navigateur), affichée en haut de page
let writeT = null;
function writeLocal(){
  writeT = null;
  try { localStorage.setItem(LS_KEY, serialize()); if (storageFail) { storageFail = null; if (typeof render==="function") setTimeout(render, 0); } }
  catch(e) { const first = !storageFail; storageFail = e; if (first && typeof toast==="function") toast("Sauvegarde locale impossible"); }
}
function persist(){                 // écriture locale différée (300 ms)
  state.savedAt = Date.now();
  clearTimeout(writeT); writeT = setTimeout(writeLocal, 300);
}
const flushLocal = () => { if (writeT) { clearTimeout(writeT); writeLocal(); } };
addEventListener("pagehide", flushLocal);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flushLocal(); });
compactImports();
// ---------- Recettes apprises ----------
const recKey = (kind, n) => kind+":"+norm(n);
const RECIPE_DEFAULT = {}; SEED.recipes.forEach(r => RECIPE_DEFAULT[recKey(r.k, r.n)] = r.l);
// Libellés renommés (bracelets → brassards…) : on reporte les cases déjà cochées sur le nouveau nom
function migrateState(){ const RN = SEED.renames || {}; Object.keys(state.learned||{}).forEach(k => { if (RN[k]) { if (state.learned[RN[k]]===undefined) state.learned[RN[k]] = state.learned[k]; delete state.learned[k]; } }); }
migrateState();
// ---------- Plans de montée (guides WoW Forever, 08/10/2026) ----------
// Étape : de → à, voies (la 1re = voie principale du guide). Partie : recette, crafts estimés,
// composants PAR CRAFT, produit [nom, qté par craft], revente PNJ par craft, outil (fabriqué une fois).
const PP = (n, c, r, x={}) => ({n, c, r, ...x});
const PLANS = {
  "Alchimie": {
    milestones: [
      {at:50, cap:75, lbl:"Compagnon (compétence 50, niveau 10) — formateur de capitale"},
      {at:125, cap:150, lbl:"Expert (compétence 125, niveau 20) — Dr Herbert Halsey (Fossoyeuse) / Ainethil (Darnassus), 50 pa"},
      {at:200, cap:225, lbl:"Artisan (compétence 200, niveau 35) — Rogvar (Stonard) / Kylanna Windwhisper (Féralas)"},
    ],
    steps: [
      {from:1, to:10, opts:[{parts:[PP("Élixir des arcanes mineur", 9, [["Pacifique",1],["Fiole vide",1]])]},
                            {parts:[PP("Élixir de Force mineure", 9, [["Feuillargent",1],["Fiole vide",1]])]}]},
      {from:10, to:55, opts:[{parts:[PP("Elixir de défense mineure", 45, [["Feuillargent",1],["Pacifique",1],["Fiole vide",1]])]}]},
      {from:55, to:65, opts:[{parts:[PP("Potion de mana mineure", 10, [["Mage royal",1],["Pacifique",1],["Fiole vide",1]])]}]},
      {from:65, to:90, note:"Jaune vers 80 : prévoir quelques crafts de plus.",
       opts:[{parts:[PP("Elixir de Robustesse mineure", 27, [["Terrestrine",2],["Pacifique",1],["Fiole vide",1]])]}]},
      {from:90, to:120, opts:[{parts:[PP("Elixir de Sagesse", 30, [["Mage royal",1],["Églantine",2],["Fiole vide",1]])]}]},
      {from:120, to:130, opts:[{parts:[PP("Potion de mana inférieure", 10, [["Mage royal",1],["Étouffante",1],["Fiole vide",1]])]}]},
      {from:130, to:150, note:"Chaque craft donne 2 Huiles de feu : en garder 30 pour 150-165.",
       opts:[{parts:[PP("Huile de feu", 20, [["Lutjan de nagefeu",2],["Fiole vide",1]], {out:["Huile de feu",2]})]},
             {parts:[PP("Potion de mana inférieure", 20, [["Mage royal",1],["Étouffante",1],["Fiole vide",1]])]}]},
      {from:150, to:165, opts:[{parts:[PP("Élixir de puissance du feu", 15, [["Huile de feu",2],["Sang-royal",1],["Fiole plombée",1]])]},
                               {parts:[PP("Potion de mana inférieure", 22, [["Mage royal",1],["Étouffante",1],["Fiole vide",1]])]}]},
      {from:165, to:180, opts:[{parts:[PP("Potion de mana", 15, [["Étouffante",1],["Sang-royal",1],["Fiole plombée",1]])]}]},
      {from:180, to:195, opts:[{parts:[PP("Élixir de robustesse inférieure", 15, [["Aciérite sauvage",1],["Dorépine",1],["Fiole plombée",1]])]}]},
      {from:195, to:215, note:"Recette Protection Nature : Bronk & Logannas (Féralas), Glyx Brewright (Strangleronce), Pilonzugg (Tanaris). Jaune à 210.",
       opts:[{parts:[PP("Élixir de défense", 20, [["Aciérite sauvage",1],["Dorépine",1],["Fiole plombée",1]])]},
             {parts:[PP("Potion de protection contre la Nature", 20, [["Vietérule",1],["Étouffante",1],["Fiole plombée",1]])]}]},
      {from:215, to:230, note:"Jaune à 220 : prévoir 1-2 crafts de marge.",
       opts:[{parts:[PP("Potion de mana supérieure", 17, [["Moustache de Khadgar",1],["Dorépine",1],["Fiole plombée",1]])]}]},
      {from:230, to:265, note:"Jaune à 245 : quantité estimée.",
       opts:[{parts:[PP("Breuvage de détection des morts-vivants", 45, [["Larmes d'Arthas",1],["Fiole de cristal",1]])]}]},
      {from:265, to:275, note:"Recette : Algernon (Fossoyeuse) / Ulthir (Darnassus).",
       opts:[{parts:[PP("Potion de mana excellente", 10, [["Soleillette",2],["Aveuglette",2],["Fiole de cristal",1]])]}]},
      {from:275, to:290, opts:[{parts:[PP("Potion de mana excellente", 20, [["Soleillette",2],["Aveuglette",2],["Fiole de cristal",1]])]},
                               {parts:[PP("Élixir de défense supérieure", 17, [["Huile de pierre-écaille",2],["Soleillette",1],["Fiole de cristal",1]])]},
                               {parts:[PP("Elixir de Puissance de l'ombre", 27, [["Champignon fantôme",3],["Fiole de cristal",1]])]}]},
      {from:290, to:300, note:"Recette via quêtes de faction ; jaune à 295. Alternatives : recettes de butin (Elixir des Sages, Mangouste, Mana majeure…).",
       opts:[{parts:[PP("Potion de frénésie majeure", 17, [["Fleur de peste",3],["Aveuglette",2],["Fiole imprégnée",1]])]}]},
    ]
  },
  "Enchantement": {
    milestones: [
      {at:50, cap:75, lbl:"Compagnon (compétence 50, niveau 10) — formateur de capitale"},
      {at:125, cap:150, lbl:"Expert (compétence 125, niveau 20) — Hgarth (Serres-Rocheuses) / Kitta Firewind (Tour d'Azora)"},
      {at:140, cap:151, lbl:"Acheter Formule : Ench. de brassards (Force inférieure) — Kulwia (Serres-Rocheuses) / Dalria (Orneval)"},
      {at:200, cap:225, lbl:"Artisan (compétence 200, niveau 35) — Annora (Uldaman) : apprendre ses recettes 230-250 en une fois"},
    ],
    steps: [
      {from:1, to:2, opts:[{parts:[PP("Bâtonnet runique en cuivre", 1, [["Bâtonnet en cuivre",1],["Granule de magie",1]], {tool:true})]}]},
      {from:2, to:20, opts:[{parts:[PP("Ench. de brassards (Endurance médiocre)", 18, [["Granule de magie",1]])]}]},
      {from:20, to:70, opts:[{parts:[PP("Ench. de plastron (Endurance médiocre)", 50, [["Poussière étrange",1]])]}]},
      {from:70, to:131, note:"Baguettes : jaune à 110, revendables ~15 pa au PNJ.",
       opts:[{lbl:"Voie baguettes", parts:[PP("Baguette magique supérieure", 67, [["Bois simple",1],["Essence de magie inférieure",2]], {vendor:0.15}),
                                           PP("Bâtonnet runique en argent", 1, [["Bâtonnet en argent",1],["Poussière étrange",3],["Essence de magie inférieure",4],["Œil ténébreux",1]], {tool:true})]},
             {lbl:"Voie Poussière étrange", parts:[PP("Ench. de brassards (Endurance mineure)", 30, [["Poussière étrange",2]]),
                                           PP("Bâtonnet runique en argent", 1, [["Bâtonnet en argent",1],["Poussière étrange",3],["Essence de magie inférieure",4],["Œil ténébreux",1]], {tool:true}),
                                           PP("Ench. de cape (Protection mineure)", 10, [["Poussière étrange",2]]),
                                           PP("Ench. de cape (Agilité mineure)", 20, [["Essence astrale inférieure",1]])]}]},
      {from:131, to:150, opts:[{parts:[PP("Ench. de brassards (Endurance inférieure)", 19, [["Poussière d'âme",1]])]},
                               {parts:[PP("Ench. de bottes (Endurance mineure)", 19, [["Poussière étrange",4]])]}]},
      {from:150, to:151, opts:[{parts:[PP("Bâtonnet runique en or", 1, [["Bâtonnet doré",1],["Perle iridescente",1],["Essence astrale supérieure",1],["Poussière d'âme",1]], {tool:true})]}]},
      {from:151, to:165, opts:[{parts:[PP("Ench. de brassards (Force inférieure)", 14, [["Poussière d'âme",1]])]}]},
      {from:165, to:185, note:"Jaune à 180.",
       opts:[{parts:[PP("Ench. de bottes (Agilité inférieure)", 22, [["Poussière d'âme",1]])]},
             {parts:[PP("Ench. de brassards (Esprit)", 22, [["Essence mystique inférieure",1]])]}]},
      {from:185, to:200, opts:[{parts:[PP("Ench. de brassards (Force)", 15, [["Poussière de vision",1]])]}]},
      {from:200, to:201, opts:[{parts:[PP("Bâtonnet runique en vrai-argent", 1, [["Bâtonnet en vrai-argent",1],["Perle noire",1],["Essence mystique supérieure",1],["Poussière de vision",1]], {tool:true})]}]},
      {from:201, to:220, opts:[{parts:[PP("Ench. de brassards (Force)", 35, [["Poussière de vision",1]])]}]},
      {from:220, to:225, opts:[{parts:[PP("Ench. de cape (Défense supérieure)", 5, [["Poussière de vision",1]])]}]},
      {from:225, to:230, opts:[{parts:[PP("Ench. de gants (Agilité)", 5, [["Poussière de vision",1]])]}]},
      {from:230, to:235, opts:[{parts:[PP("Ench. de bottes (Endurance)", 5, [["Poussière de vision",2]])]}]},
      {from:235, to:250, note:"Jaune à 240.",
       opts:[{parts:[PP("Ench. de plastron (Endurance excellente)", 20, [["Poussière de vision",3]])]}]},
      {from:250, to:265, note:"Formule Huile de mana inférieure : Kania (Silithus).",
       opts:[{parts:[PP("Huile de mana inférieure", 20, [["Poussière de rêve",1],["Lotus pourpre",1],["Fiole de cristal",1]], {out:["Huile de mana inférieure",1]})]},
             {parts:[PP("Ench. de brassards (Force supérieure)", 20, [])]}]},
      {from:265, to:294, note:"Formule : Daniel Bartlett (Fossoyeuse) / Mythrin'dir (Darnassus). Jaune à 285.",
       opts:[{parts:[PP("Ench. de bouclier (Endurance supérieure)", 32, [["Poussière de rêve",6]])]}]},
      {from:294, to:295, note:"Formule : Lorelae Wintersong (Reflet-de-Lune).",
       opts:[{parts:[PP("Bâtonnet runique en arcanite", 1, [["Bâtonnet en arcanite",1],["Perle dorée",1],["Poudre d'illusion",10],["Essence éternelle supérieure",4],["Petit éclat brillant",4],["Grand éclat brillant",2]], {tool:true})]}]},
      {from:295, to:300, note:"Formule : Lorelae Wintersong. Quantité du guide : ~40 Poudre d'illusion.",
       opts:[{parts:[PP("Ench. de cape (Défense excellente)", 8, [["Poudre d'illusion",5]])]},
             {parts:[PP("Ench. de bouclier (Endurance supérieure)", 6, [["Poussière de rêve",6]])]}]},
    ]
  },
  "Cuisine": {
    milestones: [
      {at:50, cap:75, lbl:"Compagnon (compétence 50, niveau 10) — maître cuisinier de base"},
      {at:125, cap:150, lbl:"Livre de cuisine pour expert (compétence 125, niveau 20) — Wulan (Désolace) / Shandrina (Orneval), aussi à l'HV"},
      {at:225, cap:226, lbl:"Quête « Surprise de palourdes » (niveau 35) — Dirge Quikcleave, Gadgetzan", r:[["Œuf géant",12],["Chair de palourde piquante",10],["Emmental d'Alterac",20]]},
    ],
    steps: [
      {from:1, to:50, opts:[{parts:[PP("Goujon brillant", 55, [["Goujon brillant cru",1]])]},
                            {parts:[PP("Maquereau ombré", 55, [["Maquereau ombré cru",1]])]},
                            {parts:[PP("Viande de loup grillée", 55, [["Viande de loup maigre",1]])]},
                            {parts:[PP("Viande de sanglier rôtie", 55, [["Morceau de viande de sanglier",1]])]},
                            {parts:[PP("Œufs aux herbes", 55, [["Petit œuf",1],["Épices douces",1]])]}]},
      {from:50, to:100, opts:[{parts:[PP("Lutjan à longue mâchoire", 55, [["Lutjan à longue mâchoire cru",1]])]},
                              {parts:[PP("Thon arc-en-ciel", 55, [["Thon arc-en-ciel cru",1]])]},
                              {parts:[PP("Viande d'ours fumée", 70, [["Viande d'ours",1]])]},
                              {parts:[PP("Palourdes bouillies", 55, [["Chair de palourde",1],["Eau de source",1]])]},
                              {parts:[PP("Steak de coyote", 55, [["Viande de coyote",1]])]},
                              {parts:[PP("Brouet de trotteur", 55, [["Viande de trotteur",1],["Pomme rouge brillante",1]])]}]},
      {from:100, to:130, opts:[{parts:[PP("Poisson-chat moustachu", 30, [["Poisson-chat moustachu cru",1]])]},
                               {parts:[PP("Beignet de crabe", 40, [["Chair de clampant",1],["Épices douces",1]])]},
                               {parts:[PP("Côtes de porc séchées", 35, [["Côtes de sanglier",1],["Épices douces",1]])]},
                               {parts:[PP("Pince de crabe farcie", 35, [["Pince de clampant",1],["Épices douces",1]])], lbl:"Alliance"}]},
      {from:130, to:150, opts:[{parts:[PP("Poisson-chat moustachu", 25, [["Poisson-chat moustachu cru",1]])]},
                               {parts:[PP("Omelette au goût étrange", 20, [["Œuf de raptor",1],["Épices fortes",1]])]},
                               {parts:[PP("Palourdes gobelines", 25, [["Chair de palourde relevée",1],["Épices fortes",1]])]},
                               {parts:[PP("Côtelettes de lion épicées", 25, [["Viande de lion",1],["Épices fortes",1]])], lbl:"Horde"}]},
      {from:150, to:175, note:"Jaune à 170.",
       opts:[{parts:[PP("Omelette au goût étrange", 25, [["Œuf de raptor",1],["Épices fortes",1]])]},
             {parts:[PP("Côtelettes de lion épicées", 25, [["Viande de lion",1],["Épices fortes",1]])], lbl:"Horde"}]},
      {from:175, to:225, opts:[{parts:[PP("Truite tête-mithril", 50, [["Truite tête-mithril crue",1]])]},
                               {parts:[PP("Rôti de raptor", 50, [["Chair de raptor",1],["Épices fortes",1]])]},
                               {parts:[PP("Bisque de tortue apaisante", 50, [["Viande de tortue",1],["Épices apaisantes",1]])]}]},
      {from:225, to:275, note:"Recettes à Tanaris (Gikkix, Jabbey, Dirge) et Strangleronce (Kelsey Yance).",
       opts:[{parts:[PP("Jaune-queue tacheté", 65, [["Jaune-queue tacheté cru",1]])]},
             {parts:[PP("Filet de rouget", 65, [["Rouget cru",1]])]},
             {parts:[PP("Soupe de palourdes d'Undermine", 65, [["Chair de palourde piquante",2],["Épices fortes",1],["Lait glacé",1]])]},
             {parts:[PP("Omelette monstrueuse", 65, [["Œuf géant",1],["Épices apaisantes",2]])]},
             {parts:[PP("Steak de loup tendre", 65, [["Viande de loup tendre",1],["Épices apaisantes",1]])]}]},
      {from:275, to:300, note:"Recettes : Gikkix (Tanaris).",
       opts:[{parts:[PP("Saumon solécaille poché", 35, [["Saumon solécaille cru",1]])]},
             {parts:[PP("Soupe de lutjan nagenuit", 35, [["Lutjan nagenuit cru",1],["Eau de source",1]])]},
             {parts:[PP("Boulettes fumées du désert", 15, [["Chair de ver des sables",1],["Épices apaisantes",1]])]}]},
    ]
  }
};

// ---------- Stock cible : mode d'obtention et taille de pile ----------
const HERBS = new Set(["Pacifique","Feuillargent","Mage royal","Terrestrine","Églantine","Étouffante","Sang-royal","Aciérite sauvage","Dorépine",
  "Moustache de Khadgar","Larmes d'Arthas","Soleillette","Aveuglette","Fleur de peste","Vietérule","Pâlerette","Tombeline","Champignon fantôme",
  "Gromsang","Hivernale","Feuillerêve","Calot de glace","Sauge-argent des montagnes","Sansam doré","Lotus pourpre","Hantefeuille","Fleur de feu",
  "Doulourante","Chaperose","Sauvageonne","Chardonnier","Stranglevigne","Bouche-noire huileux","Anguille pierre-écaille","Lutjan de nagefeu","Poisson déviant"].map(norm));
const VENDOR_RE = /^(épices|eau de source|lait glacé|farine simple|bois simple|bois d'étoile|bûches épaisses|granule de magie|bâtonnet en |fiole|silex|outre de bière|bière au malt|jus de baie|nectar sucré|emmental|pomme rouge brillante|sel de fonderoc|teinture|parchemin)/i;
const RARE_RE = /^(lotus noir|perle|cristal|gangrecristal|orbe|diamant|écaille d'onyxia|ecaille d'onyxia|index de liche|sang des héros|cœur de fauve|coeur de fauve|œil|oeil|pierre de gardien|cristal des arcanes)/i;
const STACK_GROUPS = [
  ["herb", "Herbes", 20], ["ore", "Minerais", 20], ["bar", "Barres, pierres, huiles", 20], ["skin", "Cuirs & peaux", 20],
  ["meat", "Viandes & œufs", 20], ["fish", "Poissons", 20], ["dust", "Poussières, éclats, poudres", 20],
  ["ess", "Essences & éléments", 20], ["vendor", "Fournitures PNJ", 20], ["other", "Autres", 20]];
function stackGroup(n){
  const k = norm(n);
  if (HERBS.has(k) || /^(lichen|champignon|sauge|lotus)/.test(k)) return "herb";
  if (/^minerai/.test(k)) return "ore";
  if (/^(barre|pierre|huile)/.test(k)) return "bar";
  if (/^(cuir|peau|ecaille)/.test(k)) return "skin";
  if (/ crue?$/.test(k)) return "fish";
  if (/^(viande|chair|oeuf|petit oeuf|cotes|morceau|foie|tripes|aile|aileron|pince|patte|queue|rat |filet|racine)/.test(k)) return "meat";
  if (/^(poussiere|poudre|granule)|eclat/.test(k)) return "dust";
  if (/^(essence|coeur|noyau|globe|souffle|ichor|sang de la montagne)|elementaire$/.test(k)) return "ess";
  if (VENDOR_RE.test(n)) return "vendor";
  return "other";
}
const stackSize = (n, S) => { const g = stackGroup(n); const d = STACK_GROUPS.find(x => x[0]===g); return +(S.stacks||{})[g] || d[2]; };
const OBT = {pnj:"PNJ", craft:"Craft", farm:"Farm", hv:"HV / rare"};
function obtention(n, craftOuts){
  const k = norm(n);
  if (SEED.pnj.some(p => norm(p.n)===k) || (state.vendor||{})[k] || VENDOR_RE.test(n)) return "pnj";
  if (craftOuts.has(k)) return "craft";
  if (RARE_RE.test(n) || k==="lotus noir") return "hv";
  const g = stackGroup(n);
  if (["herb","ore","skin","fish","meat"].includes(g)) return "farm";
  return "hv";
}

// ---------- Recettes ajoutées par l'export Gringotts (composants lus en jeu) ----------
let _allc = {};                                             // cache des listes fusionnées, vidé à chaque recalcul ou changement des recettes auto
const invalidateAll = () => { _allc = {}; };
const extList = () => Object.values((state.ext && state.ext.recipes) || {});
const ALL_RECIPES = () => _allc.recipes ||= SEED.recipes.concat(extList().map(x => ({n:x.n, k:x.k, job:x.job, sk:null, src:"Export Gringotts", z:"—",
  d: x.out && norm(x.out)!==norm(x.n) ? "Produit : "+x.out : "", l:true, t:x.r.length>0, nc:!x.r.length, auto:true})));
const ALL_CRAFTS = () => _allc.crafts ||= SEED.crafts.concat(extList().filter(x => x.k==="craft" && x.r.length).map(x => ({n:x.n, r:x.r, out:x.out||x.n, outUnknown:!x.out, qty:x.q||1, l:true, auto:true})));
const ALL_ENCH = () => _allc.ench ||= SEED.ench.concat(extList().filter(x => x.k==="ench" && x.r.length).map(x => ({n:x.n, cat:"Auto (export)", price:null, r:x.r, l:true, auto:true})));
const ALL_HV = () => _allc.hv ||= (() => { const seen = new Set(SEED.hvStock.map(x => norm(x.n))); SEED.pnj.forEach(x => seen.add(norm(x.n)));
  const extra = []; extList().forEach(x => x.r.map(r => r[0]).forEach(n => { const k = norm(n); if (!seen.has(k)) { seen.add(k); extra.push({n, stock:0}); } }));
  return SEED.hvStock.concat(extra); })();
const CRAFT_BY_NAME = () => _allc.craftBy ||= new Map(ALL_CRAFTS().map(c => [c.n, c]));
// Sans relevé de l'addon, toute recette est considérée non apprise
const isLearned = (kind, n) => { const k = recKey(kind, n); return state.learned[k] !== undefined ? !!state.learned[k] : false; };   // par défaut non apprise : le premier export de l'addon renseigne les vraies recettes

// ---------- Cycle hebdomadaire (reset du mercredi) ----------
const WEEK_ORDER = [3,4,5,6,0,1,2]; // mercredi → mardi
const cap = s => s ? s.charAt(0).toUpperCase()+s.slice(1) : s;
const todayIdx = () => new Date().getDay();
const dayLbl = i => i===null||i===undefined ? "—" : i==="flat" ? "Indifférent" : (i===todayIdx() ? "TODAY" : cap(DAYS[i]));
const dayOrd = i => i===null||i===undefined ? 99 : i==="flat" ? 98 : (i===todayIdx() ? -1 : WEEK_ORDER.indexOf(i));
// Meilleur jour seulement si l'écart entre jours dépasse 1 % ; sinon le jour n'a pas d'importance
const pickDay = (prof, dir) => !prof ? null : (Math.max(...prof)-Math.min(...prof) < 0.01 ? "flat" : argBest(prof, dir));
const argBest = (arr, dir) => { let b=null; arr.forEach((v,i)=>{ if (v!==null && (b===null || (dir==="min" ? v<arr[b] : v>arr[b]))) b=i; }); return b; };
// Profil de prix par jour de semaine : uniquement des semaines complètes mercredi→mardi,
// chaque semaine normalisée par sa moyenne pour neutraliser la tendance de fond.
function weekProfile(h, dd){
  if (!h) return null;
  const acc = Array.from({length:7},()=>[]); let weeks = 0;
  for (let i=0; i+6<dd.num.length; i++){
    if (dd.dow[i]!==3) continue;                       // semaine de reset : mercredi → mardi
    if (dd.num[i+6]-dd.num[i]!==6) continue;
    const seg = h.slice(i,i+7); if (seg.some(v=>v===null||!(v>0))) continue;
    const mean = seg.reduce((a,b)=>a+b,0)/7;
    seg.forEach((v,j)=>acc[(3+j)%7].push(v/mean)); weeks++;
  }
  if (!weeks) return null;
  return {weeks, prof: acc.map(a=>a.reduce((x,y)=>x+y,0)/a.length)};
}

// ---------- Modèle de prix ----------
// ---------- Étage 1 : modèle de prix (historique, prix courants, médianes, profils) ----------
// Coûteux (proportionnel au nombre de jours d'historique) mais ne dépend que des imports : recalculé seulement quand ils changent.
let PMc = null;
function priceModel(){
  const sig = (state.priceReset ? "R" : "S") + "|" + importsSig(state.imports);
  if (PMc && PMc.sig === sig) return PMc;
  const impDates = Object.keys(state.imports).sort();
  // Après « Effacer l'historique des prix », les données de test du classeur sont ignorées
  const B = state.priceReset ? {dates:[], hist:{}, auc:{}} : {dates:SEED.dates, hist:SEED.hist, auc:SEED.auc};
  const dates = [...new Set([...B.dates, ...impDates])].sort();
  const hist = {};
  const baseIdx = Object.fromEntries(B.dates.map((d,i)=>[d,i]));
  const names = new Set([...Object.keys(B.hist), ...Object.keys(B.auc)]);
  impDates.forEach(d => Object.keys(state.imports[d]).forEach(n => names.add(n)));
  const keys = new Set([...names].map(norm));
  const seedHistN = {}; Object.entries(B.hist).forEach(([n,v]) => seedHistN[norm(n)] = v);
  const impN = {}; impDates.forEach(d => { impN[d] = {}; Object.entries(state.imports[d]).forEach(([n,p]) => impN[d][norm(n)] = p); });
  keys.forEach(k => {
    hist[k] = dates.map(d => {
      if (impN[d] && impN[d][k] !== undefined) return impN[d][k];
      const i = baseIdx[d]; return (i !== undefined && seedHistN[k]) ? seedHistN[k][i] : null;
    });
  });
  const cur = {}; Object.entries(B.auc).forEach(([n,p]) => cur[norm(n)] = p);
  impDates.forEach(d => Object.assign(cur, impN[d]));
  const lastDate = impDates.length ? impDates[impDates.length-1] : (B.dates.length ? B.dates[B.dates.length-1] : null);
  const lastD = dates.length ? new Date(dates[dates.length-1]+"T00:00:00") : null;
  // Dates converties une seule fois : âge en jours, jour de la semaine, numéro de jour
  const dd = {age: [], dow: [], num: []};
  dates.forEach(d => { const t = new Date(d+"T00:00:00"), u = Date.parse(d+"T00:00:00Z")/864e5;
    dd.age.push(lastD ? (lastD - t)/864e5 : 0); dd.dow.push(new Date(u*864e5).getUTCDay()); dd.num.push(Math.round(u)); });
  const med30c = new Map();
  const med30 = k => { if (med30c.has(k)) return med30c.get(k); const h = hist[k];
    const r = (!h || !lastD) ? null : median(h.filter((v,i)=> dd.age[i] < 30)); med30c.set(k, r); return r; };
  const profCache = {};
  const profOf = k => (k in profCache) ? profCache[k] : (profCache[k] = weekProfile(hist[k], dd));
  return PMc = {sig, dates, hist, cur, lastDate, lastD, dd, med30, profOf};
}

// ---------- Étage 2 : décisions (stock, cibles, marges, plans) — rapide, recalculé à chaque saisie ----------
const NODOT = t => `<span class="nodot" role="img" aria-label="Prix non relevé" title="${t}"></span>`;
let M = {};
function rebuild(){
  invalidateAll();
  const S = state.settings;
  const PM = priceModel(), {dates, hist, cur, lastDate, med30} = PM;
  // Meilleur jour : seulement avec assez de semaines complètes
  const profOf = k => { const p = PM.profOf(k); return p && p.weeks >= (S.minWeeks||3) ? p : null; };
  const histDays = dates.length;
  const depPerUnit = k => { const a = (state.deposits||{})[k]; return a && a.length ? a.reduce((x,y) => x + y.u, 0)/a.length : null; };
  const pnj = {}; SEED.pnj.forEach(p => pnj[norm(p.n)] = p.p);
  const manual = {"pierre dense":0.01, "pierre lourde":0.0025};
  Object.entries(state.manual).forEach(([n,p]) => { if (p!==null && p!=="" && isFinite(p)) manual[norm(n)] = +p; });
  // Coût d'achat d'un composant : manuel > PNJ > prix HV actuel
  const VEND = state.vendor || {}, VSELL = state.vsell || {};
  // Coût d'achat : prix marchand relevé > manuel > liste PNJ > HV
  const buyPrice = n => { const k = norm(n); if (VEND[k]) return {p:VEND[k].p,src:"PNJ"}; if (manual[k]!==undefined) return {p:manual[k],src:"manuel"}; if (pnj[k]!==undefined) return {p:pnj[k],src:"PNJ"}; if (cur[k]!==undefined) return {p:cur[k],src:"HV"}; return {p:null,src:"manquant"}; };
  const sellRef = n => { const k = norm(n); const c = cur[k] ?? null, m = med30(k);
    let p = c; if (S.basis==="prudent") p = (c!==null && m!==null) ? Math.min(c,m) : (c ?? m); else if (S.basis==="mediane") p = m ?? c;
    return {p, cur:c, med:m}; };
  const hvStockN = {}; SEED.hvStock.forEach(s => hvStockN[norm(s.n)] = s.stock);
  const pnjStockN = {}; SEED.pnj.forEach(s => pnjStockN[norm(s.n)] = s.stock);
  const stockOf = n => { const k = norm(n);
    if (state.stock[k] !== undefined) return +state.stock[k];
    if (state.pnjStock[k] !== undefined) return +state.pnjStock[k];
    if (state.stockZero) return 0;
    if (hvStockN[k] !== undefined) return hvStockN[k]; if (pnjStockN[k] !== undefined) return pnjStockN[k]; return 0; };
  const status = (net, roi) => net===null ? "mute" : net < 0 ? "bad" : roi < S.roiOk ? "warn" : "ok";
  const mkLines = r => r.map(([n,q]) => { const b = buyPrice(n); return {n,q,p:b.p,src:b.src,tot:b.p===null?null:b.p*q,stock:stockOf(n)}; });
  // Profil du panier de composants : jours pondérés par le poids de chaque composant dans le coût
  const basketProfile = (lines, cost) => {
    if (cost===null || !cost) return null; const p = Array(7).fill(0); let any = false;
    lines.forEach(l => { const pr = l.src==="HV" ? profOf(norm(l.n)) : null; if (pr) any = true; for (let d=0; d<7; d++) p[d] += l.tot*(pr ? pr.prof[d] : 1); });
    return any ? p.map(v=>v/cost) : null;
  };

  // ---------- Ventes HV (30 j) et âge des prix ----------
  const sales = {}, now = Date.now()/1000;
  (state.trades||[]).filter(x => x.t >= now - 30*86400).forEach(x => { const k = norm(x.n); const e = sales[k] = sales[k] || {sold:0, rev:0, listed:0, exp:0, bought:0, spent:0, last:0};
    if (x.k==="V") { e.sold += x.q; e.rev += x.c; e.last = Math.max(e.last, x.t); if (x.t >= now - 7*86400) e.sold7 = (e.sold7||0) + x.q; } else if (x.k==="L") e.listed += x.q; else if (x.k==="E") e.exp += x.q;
    else if (x.k==="A") { e.bought += x.q; e.spent += x.c; } });
  Object.values(sales).forEach(e => { e.avg = e.sold ? e.rev/e.sold : null; e.thru = (e.sold + e.exp) ? e.sold/(e.sold + e.exp) : null; });
  const PA = state.priceAge || {t:0, a:{}};
  const AP = state.apiAge || {t:0, k:{}};
  const ageOf = k => { if (AP.k[k]) return Math.max(0, Math.floor((now - AP.t)/86400)); const a = PA.a[k]; return a===undefined ? null : a + Math.max(0, Math.floor((now - PA.t)/86400)); };
  const stale = k => { const a = ageOf(k); return a!==null && a > S.staleDays ? a : null; };
  // ---------- Plans de montée : étape courante, voie la moins chère, réserve de compos ----------
  const plans = {}, reserve = {}, produced = {};
  const recipeR = n => { const k = norm(n); const x = [...ALL_ENCH(), ...ALL_CRAFTS()].find(e => norm(e.n)===k); return x ? x.r : null; };
  Object.entries(PLANS).forEach(([job, PL]) => {
    const sk = skillOf(job), manualLvl = (state.planLvl||{})[job] || 0;
    const lvl = Math.max(sk ? sk.l : 1, manualLvl);           // « Étape terminée » fait avancer le plan sans attendre l'export
    const known = !!sk || manualLvl > 0;                      // métier non relevé par l'addon : le plan est affiché mais ne réserve ni n'achète rien
    const steps = PL.steps.map(st => {
      const status = lvl >= st.to ? "done" : lvl >= st.from ? "current" : "todo";
      const frac = status==="done" ? 0 : status==="current" ? (st.to - lvl)/(st.to - st.from) : 1;
      const opts = st.opts.filter(o => !(o.lbl && /^(Horde|Alliance)$/.test(o.lbl) && o.lbl !== S.faction)).map((o, i) => {
        let cost = 0, resale = 0; const miss = [];
        const parts = o.parts.map(pt => {
          const r = pt.r.length ? pt.r : (recipeR(pt.n) || []);
          if (!r.length) miss.push("composants de « "+pt.n+" »");
          const crafts = status==="done" ? 0 : pt.tool ? (stockOf(pt.n) > 0 ? 0 : 1) : Math.ceil(pt.c*frac);
          r.forEach(([n,q]) => { const b = buyPrice(n); if (b.p===null) miss.push(n); else cost += b.p*q*crafts; });
          const out = pt.out || (!pt.tool && !pt.vendor && job!=="Enchantement" ? [pt.n,1] : null);
          if (out) { const sp = sellRef(out[0]).p; if (sp!==null) resale += sp*out[1]*crafts*(1-S.cut); }
          if (pt.vendor) resale += pt.vendor*crafts;
          return {...pt, r, crafts, out};
        });
        return {...o, i, lbl: o.lbl || parts.map(x => x.n).join(" + "), parts, cost, resale, net: cost - resale, miss:[...new Set(miss)]};
      });
      const ok = opts.filter(o => !o.miss.length && !(o.lbl && /^(Horde|Alliance)$/.test(o.lbl) && o.lbl !== S.faction));
      const forcedI = (state.planChoice||{})[`${job}|${st.from}`];
      const forced = forcedI!==undefined ? opts.find(o => o.i === +forcedI) : null;
      const chosen = forced || (ok.length ? ok.reduce((a,b) => b.net < a.net ? b : a) : opts[0]);
      return {...st, status, frac, opts, chosen, forced: !!forced};
    });
    const ms = PL.milestones.map(m => ({...m, open: lvl < m.cap}));
    // Réserve totale (jusqu'à 300) + réserve proche (étape en cours + suivante) : seule la proche est achetée et stockée
    const add = (n, q, why, near) => { if (!q) return; const k = norm(n); const e = reserve[k] = reserve[k] || {n, need:0, near:0, why:new Set()}; e.need += q; if (near) e.near += q; e.why.add(why); };
    if (known) steps.filter(s => s.status!=="done").forEach((s, i) => s.chosen.parts.forEach(pt => {
      pt.r.forEach(([n,q]) => add(n, q*pt.crafts, `${job} ${s.from}-${s.to}`, i < 2));
      if (pt.out) { const k = norm(pt.out[0]); const pr = produced[k] = produced[k] || {all:0, near:0}; pr.all += pt.out[1]*pt.crafts; if (i < 2) pr.near += pt.out[1]*pt.crafts; }
    }));
    const horizon = (steps.filter(s => s.status!=="done")[1] || steps.filter(s => s.status!=="done")[0] || {to:0}).to;
    if (known) ms.filter(m => m.open && m.r).forEach(m => m.r.forEach(([n,q]) => add(n, q, `${job} ${m.at}`, m.at <= horizon)));
    const left = steps.filter(s => s.status!=="done");
    plans[job] = {job, lvl, known, manual: manualLvl > (sk ? sk.l : 1), realLvl: sk ? sk.l : null, max: sk ? sk.m : 300, steps, ms,
      cur: left[0] || null, next: left[1] || null,
      costLeft: left.reduce((a,s) => a + s.chosen.cost, 0), netLeft: left.reduce((a,s) => a + s.chosen.net, 0),
      missLeft: [...new Set(left.flatMap(s => s.chosen.miss))]};
  });
  // Besoin net = réservé − production prévue par le plan
  Object.entries(reserve).forEach(([k, e]) => { const pr = produced[k] || {all:0, near:0};
    e.prod = pr.all; e.net = Math.max(0, e.need - pr.all); e.nearNet = Math.max(0, e.near - pr.near); });
  const crafts = ALL_CRAFTS().filter(c => isLearned("craft", c.n)).map(c => {
    const out = c.out || c.n;
    const lines = mkLines(c.r);
    const missing = lines.filter(l => l.p===null).map(l => l.n);
    const cost = missing.length ? null : lines.reduce((a,l)=>a+l.tot,0);
    const sr = sellRef(out);
    const vend = VSELL[norm(out)] ? VSELL[norm(out)]*(c.qty||1) : null;            // revente au marchand (pas de taxe)
    const hvNet = sr.p===null ? null : sr.p*(c.qty||1)*(1-S.cut);
    const toVendor = vend!==null && (hvNet===null || vend > hvNet);
    const gross = toVendor ? vend/(1-S.cut) : (sr.p===null ? null : sr.p*(c.qty||1)), netRaw = (gross===null||cost===null) ? null : gross*(1-S.cut) - cost;
    // Marge attendue : un invendu fait perdre le dépôt ; sans écoulement parfait, il faut en moyenne 1/écoulement mises en vente par vente
    const slo = sales[norm(out)] || null, depU = depPerUnit(norm(out));
    const adj = (netRaw!==null && slo && slo.thru!==null && slo.sold+slo.exp >= 3 && slo.thru < 1 && depU!==null) ? depU*(c.qty||1)*(1/Math.max(slo.thru,0.2) - 1) : 0;
    const net = netRaw===null ? null : netRaw - adj;
    const roi = (net===null||!cost) ? null : net/cost;
    const possible = lines.length ? Math.min(...lines.map(l => Math.floor(l.stock/l.q))) : 0;
    const flags = [];
    if (missing.length) flags.push("Prix composant manquant : "+missing.join(", "));
    if (gross===null) flags.push("Aucun prix de vente pour « "+out+" »");
    if (toVendor) flags.push(hvNet===null ? `Revente au marchand : ${(vend).toFixed(4)} po (pas de prix HV)` : `Vendre au marchand rapporte plus que l'HV (${(vend).toFixed(4)} po contre ${(hvNet).toFixed(4)} po net)`);
    if (gross!==null && cost) { const r = gross/cost; if (r > 4) flags.push(`Prix de vente ${r.toFixed(1)}× le coût : à vérifier`); }
    if (sr.cur!==null && sr.med!==null && sr.cur < sr.med*0.6) flags.push("Prix HV actuel à −"+Math.round((1-sr.cur/sr.med)*100)+" % de la médiane : marché cassé ?");
    const prodProf = profOf(norm(out));
    const basket = basketProfile(lines, cost);
    const sellDay = pickDay(prodProf && prodProf.prof, "max");
    const buyDay = pickDay(basket, "min");
    const compSellDay = pickDay(basket, "max");
    // Décision : perte → vendre les compos ; rentable + stock → produire ; rentable sans stock → acheter
    const staleL = [...lines.map(l => l.n), out].filter(n => stale(norm(n))!==null).map(n => `${n} (${stale(norm(n))} j)`);
    if (staleL.length) flags.push("Prix ancien : " + staleL.join(", "));
    const sl = sales[norm(out)] || null;
    if (sl && sl.exp > sl.sold) flags.push(`Écoulement faible : ${sl.sold} vendus, ${sl.exp} expirés en 30 j`);
    const resComps = lines.filter(l => reserve[norm(l.n)]).map(l => l.n);
    if (resComps.length) flags.push("Réservé pour la montée : "+resComps.join(", ")+" — ne pas tout vendre");
    if (reserve[norm(out)]) flags.push(`Produit réservé pour la montée : garder ${reserve[norm(out)].need}`);
    let act, day;
    if (net===null) { act = "check"; day = null; }
    else if (net < 0) { act = "sell"; day = compSellDay; }
    else if (possible > 0) { act = "craft"; day = sellDay; }
    else { act = "buy"; day = buyDay; }
    return {n:c.n, out, learned:true, lines, cost, gross, toVendor, vend, netRaw, adj, thru: slo ? slo.thru : null, sales: sl, soldN: sl ? sl.sold : -1, cur:sr.cur, med:sr.med, net, roi, possible, flags,
      st: flags.length && net===null ? "mute" : status(net,roi), hist: hist[norm(out)]||[],
      prodProf, basket, sellDay, buyDay, compSellDay, act, actLbl: ACTIONS[act].lbl, day, dayLbl: dayLbl(day), dayOrd: dayOrd(day)};
  });
  const ench = ALL_ENCH().filter(e => isLearned("ench", e.n)).map(e => {
    const lines = mkLines(e.r);
    const missing = lines.filter(l => l.p===null).map(l => l.n);
    const cost = missing.length ? null : lines.reduce((a,l)=>a+l.tot,0);
    // Prix de vente = coût des compos au prix HV + marge (20 %), arrondi comme le classeur (or supérieur)
    let price = cost===null ? null : cost*(1+S.enchMarkup);
    if (price!==null && S.enchRound==="or") price = Math.ceil(price - 1e-9);
    const net = (price===null||cost===null) ? null : price - cost; // service en /w : pas de taxe HV
    const roi = (net===null||!cost) ? null : net/cost;
    const possible = lines.length ? Math.min(...lines.map(l => Math.floor(l.stock/l.q))) : 0;
    const flags = missing.length ? ["Prix composant manquant : "+missing.join(", ")] : [];
    return {n:e.n, cat:e.cat, learned:true, lines, cost, price, net, roi, possible, flags, st: status(net,roi)};
  });
  const used = new Set(), maxQ = {}, nUse = {};
  [...crafts, ...ench].forEach(r => r.lines.forEach(l => { const k = norm(l.n); used.add(k); maxQ[k] = Math.max(maxQ[k]||0, l.q); nUse[k] = (nUse[k]||0) + 1; }));
  // ---------- Cibles auto pilotées par les ventes ----------
  // Craft vendu : composants = ventes/jour × horizon ÷ qté produite × qté par craft ; produit fini = ventes/jour × horizon.
  // Craft sans historique : règle profondeur × facteur d'obtention, réduite de moitié. Craft à perte ou qui s'écoule mal : 0.
  // Place : quand elle manque, on retire d'abord les piles qui rapportent le moins d'or par jour et par emplacement.
  const craftOuts = new Set(ALL_CRAFTS().map(c => norm(c.out || c.n)));
  const FACT = {pnj:S.fPnj, craft:S.fCraft, farm:S.fFarm, hv:S.fHv};
  const H = S.horizon || 7;
  const qtyOf = n => (CRAFT_BY_NAME().get(n) || {}).qty || 1;
  const auto = {}, prodT = {};
  const slot = (k, n) => auto[k] = auto[k] || {n, k, ob: obtention(n, craftOuts), st: stackSize(n, S), want:0, value:0, min:0, why:new Set()};
  crafts.forEach(c => {
    const sl = sales[norm(c.out)], q = qtyOf(c.n);
    const bad = (c.net!==null && c.net < 0) || (sl && sl.exp > sl.sold);
    const perDay = sl && sl.sold ? sl.sold / 30 : 0;
    const mode = bad ? "bad" : perDay ? "sales" : "new";
    const craftsH = mode==="sales" ? Math.ceil(perDay * H / q) : 0;
    c.mode = mode; c.perDay = perDay;
    if (mode==="sales") prodT[norm(c.out)] = {n:c.out, units: Math.ceil(perDay * H), perDay, value: (c.net||0) * craftsH / H};
    c.lines.forEach(l => { const a = slot(norm(l.n), l.n);
      if (mode==="sales") { a.want += l.q * craftsH * (a.ob==="pnj" ? Math.max(S.fPnj, 0.25) * 2 : 1); a.value += Math.max(0, c.net||0) * craftsH / H; a.min = 1; a.why.add("ventes"); }
      else if (mode==="new") { a.want += S.depth * l.q * (FACT[a.ob] ?? 1) / 2; a.min = 1; a.why.add("sans historique"); }
      else a.why.add("craft à perte / écoulement faible");
    });
  });
  // Enchantements (service en /w, pas de ventes HV relevées) : règle de profondeur
  const enchW = {};
  ench.forEach(e => e.lines.forEach(l => { const a = slot(norm(l.n), l.n); enchW[a.k] = Math.max(enchW[a.k]||0, S.depth * l.q * (FACT[a.ob] ?? 1)); a.min = 1; a.why.add("enchantements"); }));
  Object.entries(enchW).forEach(([k, w]) => auto[k].want += w);
  const items = [...Object.values(auto).map(a => ({...a, kind:"comp"})),
    ...Object.entries(prodT).map(([k, p]) => ({k, n:p.n, kind:"prod", st: stackSize(p.n, S), want:p.units, value:p.value, min:1, ob:"craft"}))];
  items.forEach(x => x.stacks = x.want > 0 ? Math.max(x.min, Math.ceil(x.want / x.st)) : 0);
  const OBR = {pnj:0, craft:1, farm:2, hv:3};
  let total = items.reduce((a,x) => a + x.stacks, 0);
  while (total > S.slots) {           // or/jour par pile le plus faible d'abord ; à valeur nulle : PNJ, craft, farm puis HV
    const c = items.filter(x => x.stacks > x.min).sort((a,b) => (a.value/a.stacks - b.value/b.stacks) || (OBR[a.ob] - OBR[b.ob]) || (b.stacks - a.stacks))[0];
    if (!c) break; c.stacks--; total--;
  }
  // Cible = besoin réel arrondi à l'unité, plafonné par les piles accordées (une pile entamée occupe quand même un emplacement)
  items.forEach(x => { x.target = Math.min(x.stacks*x.st, Math.ceil(x.want));
    if (x.kind==="comp") Object.assign(auto[x.k], {stacks:x.stacks, target:x.target}); else prodT[x.k].target = x.target; });
  Object.values(auto).forEach(a => a.reason = [...a.why].join(", "));
  const autoSlots = Object.values(auto).reduce((a,x) => a + Math.ceil(x.target / x.st), 0);
  const hvList = ALL_HV(); { const seen = new Set(hvList.map(x => norm(x.n))); SEED.pnj.forEach(x => seen.add(norm(x.n)));
    Object.values(reserve).forEach(e => { const k = norm(e.n); if (!seen.has(k)) { seen.add(k); hvList.push({n:e.n, stock:0, plan:true}); } });
    [...ALL_CRAFTS(), ...ALL_ENCH()].forEach(c => c.r.forEach(([n]) => { const k = norm(n); if (!seen.has(k)) { seen.add(k); hvList.push({n, stock:0}); } })); }
  const comps = hvList.map(s => {
    const vp = VEND[norm(s.n)];
    const k = norm(s.n); const c = cur[k] ?? null; const m = med30(k);
    const delta = (c!==null && m) ? c/m - 1 : null;
    const sig = delta===null ? "mute" : delta <= -S.buyTh ? "ok" : delta >= S.buyTh ? "bad" : "warn";
    const sigTxt = delta===null ? "Pas de donnée" : delta <= -S.buyTh ? "Acheter" : delta >= S.buyTh ? "Trop cher" : "Neutre";
    const pr = profOf(k); const best = pickDay(pr && pr.prof, "min");
    const stock = stockOf(s.n); const a = auto[k]; const manualT = state.target[k] !== undefined;
    const target = manualT ? +state.target[k] : (a ? a.target : 0);
    const res = reserve[k] || null;
    const toBuy = Math.max(0, target - stock, res ? res.nearNet - stock : 0);
    return {n:s.n, k, npc: npcSell(s.n), used: used.has(k) || !!res, res, why: a ? a.reason : "", vend: vp ? vp.p : null, age: ageOf(k), stale: stale(k), ob: obtention(s.n, craftOuts), st: stackSize(s.n, S), manualT, autoT: a ? a.target : 0, cur:c, med:m, delta, sig, sigTxt, best, bestDay: dayLbl(best), bestOrd: dayOrd(best), stock, target, toBuy, refill: (vp ? vp.p : c)===null?null:toBuy*(vp ? vp.p : c), value: c===null?(vp ? stock*vp.p : null):stock*c, hist:hist[k]||[]};
  });
  const pnjRows = SEED.pnj.map(p => { const k = norm(p.n); const stock = state.pnjStock[k] !== undefined ? +state.pnjStock[k] : (state.stockZero ? 0 : p.stock);
    const a = auto[k]; const manualT = state.target[k] !== undefined;
    const target = manualT ? +state.target[k] : (a ? a.target : 0); const res = reserve[k] || null;
    const toBuy = Math.max(0, target-stock, res ? res.nearNet - stock : 0);
    const rel = VEND[k] && isFinite(VEND[k].p) ? VEND[k].p : null, pr = rel !== null ? rel : p.p;
    return {n:p.n, k, used: used.has(k) || !!res, res, st: stackSize(p.n, S), manualT, autoT: a ? a.target : 0, vendor:p.vendor, p:pr, rel: rel !== null, stock, target, toBuy, refill: toBuy*pr, value: stock*pr}; });
  // Coût par craft de toutes les recettes (apprises ou non) pour la progression des métiers
  const recCost = {};
  ALL_CRAFTS().forEach(c => { const lines = mkLines(c.r); const cost = lines.some(l=>l.p===null) ? null : lines.reduce((a,l)=>a+l.tot,0);
    const gross = sellRef(c.out || c.n).p; recCost[recKey("craft", c.n)] = {cost, resale: gross===null ? 0 : gross*(c.qty||1)*(1-S.cut)}; });
  ALL_ENCH().forEach(e => { const lines = mkLines(e.r); const cost = lines.some(l=>l.p===null) ? null : lines.reduce((a,l)=>a+l.tot,0);
    recCost[recKey("ench", e.n)] = {cost, resale: 0}; });
  const prodRows = Object.entries(prodT).map(([k, p]) => { const stock = stockOf(p.n), cr = crafts.find(c => norm(c.out)===k); const q = qtyOf(cr ? cr.n : p.n);
    return {k, n:p.n, st: stackSize(p.n, S), stock, target:p.target||0, perDay:p.perDay, toCraft: Math.max(0, Math.ceil(((p.target||0) - stock) / q)), recipe: cr ? cr.n : p.n}; }).sort((a,b) => b.perDay - a.perDay);
  // ---------- Conseil de quantité par craft : taux de vente 30 j corrigé de la tendance 7 j, sur l'horizon de stock ----------
  // taux = ventes 30 j / 30 ; tendance = (ventes 7 j / 7) / taux (bornée à 0,5-1,5, seulement si ≥ 5 ventes en 30 j) ; besoin = taux × tendance × horizon ;
  // à faire = (besoin − stock du produit) / quantité par craft. Sans historique : profondeur / 2 crafts (test prudent).
  const compBy = new Map(comps.map(x => [norm(x.n), x]));
  crafts.forEach(c => {
    const q = qtyOf(c.n), sl = sales[norm(c.out)], have = stockOf(c.out), sold30 = sl ? sl.sold : 0, sold7 = sl ? (sl.sold7 || 0) : 0, r30 = sold30/30;
    const trend = sold30 >= 5 ? Math.min(1.5, Math.max(0.5, (sold7/7)/r30)) : null, rate = trend!==null ? r30*trend : r30;
    const units = c.mode==="sales" ? Math.ceil(rate*H) : c.mode==="new" ? Math.ceil(S.depth/2)*q : 0;
    const make = Math.max(0, Math.ceil((units - have)/q));
    const adv = {act:c.act, rate, trend, units, have, make, mode:c.mode, qty:null, head:"", note:"", cost:null, items:[]};
    if (c.act==="craft" || c.act==="buy") {
      if (c.mode==="bad") { adv.qty = 0; adv.head = "Attendre"; adv.note = "écoulement faible"; }
      else if (c.act==="craft") { const n = Math.min(c.possible, make); adv.qty = n;
        adv.head = make===0 ? "Rien à produire" : `Produire ${n}`; adv.note = make===0 ? "stock du produit suffisant" : n < make ? `sur ${make} conseillés (compos limités)` : ""; }
      else { adv.qty = make; adv.head = make===0 ? "Rien à acheter" : `Acheter pour ${make}`;
        if (make) { let cost = 0; c.lines.forEach(l => { const need = Math.max(0, l.q*make - stockOf(l.n)); if (need && l.p!==null) { cost += need*l.p; adv.items.push([l.n, need]); } }); adv.cost = cost; } }
    } else if (c.act==="sell") {
      c.lines.forEach(l => { const cp = compBy.get(norm(l.n)); const surplus = cp ? cp.stock - Math.max(cp.target, cp.res ? cp.res.nearNet : 0) : 0; if (surplus > 0) adv.items.push([l.n, surplus, cp.cur]); });
      adv.qty = adv.items.reduce((a,x) => a + x[1], 0); adv.cost = adv.items.reduce((a,x) => a + (x[2]!==null ? x[1]*x[2] : 0), 0);
      adv.head = adv.items.length ? `Vendre ${adv.qty} compos` : "Ne pas produire"; adv.note = adv.items.length ? adv.items.slice(0,2).map(x => `${x[1]} ${x[0]}`).join(", ") + (adv.items.length>2 ? ` +${adv.items.length-2}` : "") : "pas de surplus à vendre";
    } else { adv.head = "—"; }
    // Prix : mise en vente 1 % sous le marché ; plancher = prix unitaire qui garde le ROI au seuil ; panier maxi = coût des compos qui garde le ROI au seuil
    const adjC = c.adj || 0;
    adv.listUnit = c.cur!==null ? c.cur*0.99 : null;
    adv.floorUnit = c.cost ? (c.cost*(1 + S.roiOk) + adjC)/(1 - S.cut)/q : null;
    adv.maxCost = c.gross!==null ? (c.gross*(1 - S.cut) - adjC)/(1 + S.roiOk) : null;
    if (c.act==="sell" && adv.items.length) { const top = adv.items.slice().sort((a,b) => b[1]*(b[2]||0) - a[1]*(a[2]||0))[0]; adv.sellItem = top[2]!==null && top[2]!==undefined ? [top[0], top[2]*0.99] : null; }
    c.adv = adv; c.advQty = adv.qty;
  });
  const slotsUsed = [...comps, ...pnjRows, ...prodRows].reduce((a,c) => { const q = Math.max(c.target, c.res ? c.res.nearNet : 0); return a + (q ? Math.ceil(q / c.st) : 0); }, 0);
  // ---------- Conseil par composant : cible (pilotée par les ventes) corrigée du signal de prix et de la direction à 7 j ----------
  // acheter = manque jusqu'à la cible ; prix bas (≥ seuil sous la médiane 30 j) et pas en chute : + 50 % de la cible (ou la moyenne achetée sur l'horizon) si la place le permet ;
  // prix trop haut : reporter l'achat et vendre le surplus ; prix neutre : vendre le surplus seulement s'il est important.
  const slotsFull = slotsUsed > S.slots;
  // Prix d'achat maxi : le plus haut prix unitaire qui garde au moins une recette rentable (ROI ≥ seuil) à ce seuil ; plafonné à médiane 30 j × (1 + seuil du signal d'achat)
  const payCap = new Map();
  crafts.forEach(c => { if (!c.learned || c.st!=="ok" || c.net===null) return; const room = (c.net + c.cost)/(1 + S.roiOk) - c.cost;
    c.lines.forEach(l => { if (l.p===null || !l.q) return; const k = norm(l.n), v = l.p + room/l.q; if (!(payCap.get(k) >= v)) payCap.set(k, v); }); });
  comps.forEach(c => {
    const sl = sales[norm(c.n)], m7 = median((c.hist || []).filter((v,i) => PM.dd.age[i] < 7)), r7 = c.cur!==null && m7 ? c.cur/m7 - 1 : null;
    const falling = r7!==null && r7 <= -0.05, keep = Math.max(c.target, c.res ? c.res.nearNet : 0), need = Math.max(0, c.toBuy), surplus = Math.max(0, c.stock - keep);
    const unit = c.vend ?? c.cur, buyRate = sl ? sl.bought/30 : 0;
    let buy = 0, sell = 0, extra = 0, kind = "keep", note = "";
    if (unit===null) { kind = "none"; note = "prix inconnu"; }
    else if (c.sig==="bad") { sell = surplus; if (sell) kind = "sell"; else if (need) { kind = "wait"; note = "prix trop haut"; } }
    else { if (c.sig==="ok" && c.used && !falling && !slotsFull) extra = Math.max(Math.ceil(keep*0.5), Math.ceil(buyRate*H));
      buy = need + extra; if (buy) kind = "buy";
      else if (surplus >= Math.max(10, Math.ceil(keep*0.5))) { sell = surplus; kind = "sell"; } }
    let maxBuy = null;
    if (c.vend===null && c.med!==null) { const cap = payCap.get(norm(c.n)); maxBuy = Math.min(cap ?? Infinity, c.med*(1 + S.buyTh)); }
    if (kind==="buy" && maxBuy!==null && c.cur > maxBuy*1.0001) { kind = "wait"; note = "au-dessus du prix maxi"; buy = 0; extra = 0; }
    const sellPrice = kind==="sell" && c.cur!==null ? c.cur*0.99 : null, sellFloor = c.med!==null ? c.med*(1 - S.buyTh) : null;
    c.adv = {kind, buy, sell, extra, note, r7, falling, unit, buyRate, maxBuy, sellPrice, sellFloor};
    c.advQty = kind==="buy" ? buy : kind==="sell" ? -sell : 0;
  });
  M = {histDays, dates, hist, cur, lastDate, crafts, ench, comps, pnjRows, prodRows, buyPrice, sellRef, recCost, plans, reserve, slotsUsed, sales, ageOf, stale};
}
const ACTIONS = {
  craft:{lbl:"Produire", cls:"ok", tip:"Rentable et compos en stock : produire, mettre en vente le jour indiqué"},
  buy:{lbl:"Acheter", cls:"info", tip:"Rentable mais compos manquants : les acheter le jour indiqué"},
  sell:{lbl:"Vendre", cls:"bad", tip:"Craft à perte : vendre les compos plutôt que produire, le jour indiqué"},
  check:{lbl:"À vérifier", cls:"mute", tip:"Prix manquant : décision impossible"}
};

// ---------- Désenchantement ----------
// Tranches d'ilvl, quantités moyennes des fourchettes du classeur
const DE_BRACKETS = [
  {lo:5, hi:10, dust:"Poussière étrange", dq:1.5, ess:"Essence de magie inférieure", eq:1.5, shard:null},
  {lo:11,hi:15, dust:"Poussière étrange", dq:2.5, ess:"Essence de magie supérieure", eq:1.5, shard:null},
  {lo:16,hi:20, dust:"Poussière étrange", dq:5,   ess:"Essence astrale inférieure", eq:1.5, shard:"Petit éclat scintillant"},
  {lo:21,hi:25, dust:"Poussière d'âme", dq:1.5, ess:"Essence astrale supérieure", eq:1.5, shard:"Petit éclat scintillant"},
  {lo:26,hi:30, dust:"Poussière d'âme", dq:3.5, ess:"Essence mystique inférieure", eq:1.5, shard:"Gros éclat scintillant"},
  {lo:31,hi:35, dust:"Poussière de vision", dq:1.5, ess:"Essence mystique supérieure", eq:1.5, shard:"Petit éclat luminescent"},
  {lo:36,hi:40, dust:"Poussière de vision", dq:3.5, ess:"Essence du néant inférieure", eq:1.5, shard:"Gros éclat luminescent"},
  {lo:41,hi:45, dust:"Poussière de rêve", dq:1.5, ess:"Essence du néant supérieure", eq:1.5, shard:"Petit éclat irradiant"},
  {lo:46,hi:50, dust:"Poussière de rêve", dq:3.5, ess:"Essence éternelle inférieure", eq:1.5, shard:"Gros éclat irradiant"},
  {lo:51,hi:55, dust:"Poudre d'illusion", dq:1.5, ess:"Essence éternelle supérieure", eq:1.5, shard:"Petit éclat brillant"},
  {lo:56,hi:999,dust:"Poudre d'illusion", dq:3.5, ess:"Essence éternelle supérieure", eq:2, shard:"Grand éclat brillant"}
];
const brLbl = b => `${b.lo}–${b.hi===999?"65+":b.hi}`;
const QUALITIES = {vert:"Vert", bleu:"Bleu", epique:"Épique"};
// Vert : armure 75 % poussière / 20 % essence / 5 % éclat ; arme 20 / 75 / 5.
const DE_RATES = { Armure:{dust:.75, ess:.20, shard:.05}, Arme:{dust:.20, ess:.75, shard:.05} };
function deEval(type, brIdx, q){
  const b = DE_BRACKETS[brIdx]; if (!b) return {err:"Tranche inconnue"};
  let detail;
  if (q==="bleu") {
    if (!b.shard) return {err:"Pas d'éclat sous l'ilvl 16"};
    detail = [{n:b.shard, prob:1, q:1}];
  } else if (q==="epique") {
    if (b.lo < 36) return {err:"Pas de donnée épique sous l'ilvl 36"};
    detail = b.lo >= 56 ? [{n:"Cristal de nexus", prob:1, q:1}] : [{n:b.shard, prob:1, q:3}];
  } else {
    const r = {...(DE_RATES[type] || DE_RATES.Armure)};
    if (!b.shard) { if (type==="Arme") r.ess += r.shard; else r.dust += r.shard; r.shard = 0; }
    detail = [{n:b.dust,prob:r.dust,q:b.dq},{n:b.ess,prob:r.ess,q:b.eq}];
    if (r.shard) detail.push({n:b.shard,prob:r.shard,q:1});
  }
  detail.forEach(d => d.p = M.sellRef(d.n).p);
  const missing = detail.filter(d => d.p===null).map(d=>d.n);
  if (missing.length) return {detail, err:"Prix manquant : "+missing.join(", ")};
  const gross = detail.reduce((a,d)=>a+d.prob*d.q*d.p,0);
  return {detail, gross, net: gross*(1-state.settings.cut)};
}

// ---------- Rendu ----------
const views = {};
let current = "controle";
const sortState = {};
const filters = {crafts:{q:"",st:"all",act:"all"}, enchant:{q:"",cat:"all",st:"all"}, stock:{q:"",sig:"all",used:true,have:false}, recettes:{q:"",kind:"all",l:"all"}};

function stPill(st, txt){ const t = txt || ({ok:"Rentable",warn:"Marge faible",bad:"Perte",mute:"À vérifier"})[st]; return `<span class="st ${st}">${esc(t)}</span>`; }
function sortRows(view, rows, defKey, defDir){
  const s = sortState[view] || {k:defKey, d:defDir}; sortState[view] = s;
  return rows.slice().sort((a,b) => { const x=a[s.k], y=b[s.k];
    if (x===null||x===undefined) return 1; if (y===null||y===undefined) return -1;
    const r = typeof x === "string" ? x.localeCompare(y,"fr") : x - y; return s.d==="asc" ? r : -r; });
}
function th(view, k, label, cls){ const s = sortState[view]||{}; const on = s.k===k;
  return `<th data-k="${k}" class="${cls||""}${on?" sorted"+(s.d==="asc"?" asc":""):""}" tabindex="0" aria-sort="${on?(s.d==="asc"?"ascending":"descending"):"none"}">${label}</th>`; }

views.controle = () => {
  const cr = M.crafts.filter(c => c.learned);
  const ok = cr.filter(c => c.st==="ok").length, warn = cr.filter(c=>c.st==="warn").length, bad = cr.filter(c=>c.st==="bad").length;
  const flagged = M.crafts.filter(c => c.flags.length);
  const stockVal = M.comps.filter(c=>c.used).reduce((a,c)=>a+(c.value||0),0) + M.pnjRows.filter(c=>c.used).reduce((a,c)=>a+c.value,0);
  const refill = M.comps.filter(c=>c.used).reduce((a,c)=>a+(c.refill||0),0) + M.pnjRows.filter(c=>c.used).reduce((a,c)=>a+c.refill,0);
  const top = cr.filter(c => c.net!==null && c.net>=(state.settings.minNet||0)).sort((a,b)=>b.net-a.net).slice(0,5);
  const maxNet = top.length ? top[0].net : 1;
  const topE = M.ench.filter(e => e.learned && e.net!==null && e.net>=(state.settings.minNet||0)).sort((a,b)=>b.net-a.net).slice(0,5);
  const maxE = topE.length ? topE[0].net : 1;
  const lim7 = Date.now()/1000 - 7*86400;
  const sales7 = (state.trades||[]).filter(x => x.t >= lim7).reduce((a,x) => { if (x.k==="V") { a.rev += x.c; a.n += x.q; } else if (x.k==="A") a.spent += x.c; return a; }, {rev:0, n:0, spent:0});
  const staleN = M.comps.filter(c => c.used && c.stale!==null).length;
  // 3 priorités : premiers blocs de décision non vides, dans l'ordre d'urgence
  const blocks = decisionBlocks();
  const prio = ["À corriger","Temps de recharge","Produire","Acheter","Prix à surveiller","Arrêter","Envois","Montée"]
    .map(id => { const i = blocks.findIndex(t => t.id===id); return i<0 ? null : {...blocks[i], i}; }).filter(t => t && t.n > 0).slice(0, 3);
  return `
  <h1>Tour de contrôle</h1>
  <p class="lede">Marges calculées sur le prix HV réel (${({prudent:"le plus bas entre prix actuel et médiane 30 j",actuel:"prix actuel",mediane:"médiane 30 j"})[state.settings.basis]}), taxe HV de ${pct(state.settings.cut)} déduite. ${M.lastDate ? "Prix du "+fmtDate(M.lastDate)+"." : ""}</p>
  ${histNote()}
  ${M.lastDate ? "" : `<div class="note warn">Aucun prix enregistré. Collez votre premier export dans le <a href="#import">Comptoir</a>.</div>`}
  <div class="kpis">
    ${goldTile()}
    <div class="kpi"><div class="v ok">${ok}</div><div class="l">crafts rentables (ROI ≥ ${pct(state.settings.roiOk)})</div><div style="font-size:13px;margin-top:2px"><span style="color:var(--warn)">${warn} marge faible</span> · <span style="color:var(--bad)">${bad} en perte</span></div></div>
    <div class="kpi"><div class="v">${money(stockVal)}</div><div class="l">valeur du stock de composants</div></div>
    <div class="kpi"><div class="v">${money(refill)}</div><div class="l">coût du réassort aux stocks cibles</div></div>
    <div class="kpi"><div class="v ${M.slotsUsed > state.settings.slots ? "warn" : ""}">${M.slotsUsed} <span class="muted" style="font-size:16px">/ ${state.settings.slots}</span></div><div class="l">emplacements occupés par les cibles</div></div>
    <div class="kpi"><div class="v ok">${money(sales7.rev*(1-state.settings.cut))}</div><div class="l">ventes HV 7 j (net de taxe) · ${sales7.n} objets</div></div>
    <div class="kpi"><div class="v">${money(sales7.spent)}</div><div class="l">achats HV 7 j</div></div>
    <div class="kpi"><div class="v ${staleN ? "warn" : ""}">${staleN}</div><div class="l">prix anciens (&gt; ${state.settings.staleDays} j)</div></div>
  </div>
  <h2>Priorités</h2>
  ${prio.length ? `<div class="prios">${prio.map(t => `<div class="tw prio"><div class="prh"><span class="st ${t.prio}">${t.n}</span><b>${t.title}</b></div><div class="prs">${t.sum}</div><div><button class="btn" data-goto-dec="${t.i}">Détail au Comptoir →</button></div></div>`).join("")}</div>`
    : `<div class="tw empty">Rien d'urgent : aucune action en attente.</div>`}
  <p class="muted" style="margin:8px 0 0">Toutes les décisions : <a href="#import" data-goto-dec="">Comptoir, étape 3</a>.${flagged.length ? ` ${flagged.length} craft${flagged.length>1?"s ont":" a"} une alerte de données (⚠) : <a href="#crafts">Crafts</a>.` : ""}</p>
  <div class="cols">
    <section><h2>Top 5 crafts — bénéfice net par craft</h2>
      ${top.length ? `<div class="tw" style="padding:14px 16px 6px">${top.map(c => `
        <div class="bar click" data-craft="${esc(c.n)}" role="button" tabindex="0" style="cursor:pointer">
          <span class="nm">${esc(c.n)} <span class="muted">· ROI ${roiTxt(c.roi)}</span></span><span class="vv">${money(c.net)}</span>
          <span class="track"><span class="fill" style="display:block;width:${Math.max(2,c.net/maxNet*100)}%;${c.st==="warn"?"background:var(--warn)":""}"></span></span>
        </div>`).join("")}</div>` : `<div class="tw empty">Aucun craft rentable avec les prix actuels.</div>`}
    </section>
    <section><h2>Top 5 enchantements — service en /w</h2>
      ${topE.length ? `<div class="tw" style="padding:14px 16px 6px">${topE.map(e => `
        <div class="bar"><span class="nm">${esc(e.n)} <span class="muted">· ROI ${roiTxt(e.roi)}</span></span><span class="vv">${money(e.net)}</span>
        <span class="track"><span class="fill" style="display:block;width:${Math.max(2,e.net/maxE*100)}%;${e.st==="warn"?"background:var(--warn)":""}"></span></span></div>`).join("")}</div>` : `<div class="tw empty">Aucun enchantement rentable.</div>`}
    </section>
  </div>`;
};

function actPill(c){ const a = ACTIONS[c.act]; return `<span class="st ${a.cls}" title="${esc(a.tip)}">${a.lbl}</span>`; }
function dayCell(lbl){ return lbl==="TODAY" ? `<span class="today">TODAY</span>` : esc(lbl); }
// Cellule « Conseil de quantité » : ordre de grandeur + base de calcul (taux de vente, tendance, cible, stock)
function advCell(c){
  const a = c.adv; if (!a || a.head==="—") return `<td class="muted">—</td>`;
  const tr = a.trend===null ? "" : ` <span style="color:var(--${a.trend>1.05?"ok":a.trend<0.95?"bad":"muted"})" title="Ventes des 7 derniers jours comparées à la moyenne 30 j">${a.trend>1.05?"▲":a.trend<0.95?"▼":"■"} ${a.trend>=1?"+":"−"}${Math.round(Math.abs(a.trend-1)*100)} %</span>`;
  const rt = a.rate ? `${a.rate < 1 ? a.rate.toFixed(2) : a.rate.toFixed(1)} / j${tr}` : `<span class="muted">sans historique</span>`;
  const base = a.act==="sell" ? (a.cost ? `≈ ${money(a.cost)}` : "") : `${rt} · cible ${a.units} · stock ${a.have}`;
  const tip = a.act==="sell" ? "Surplus de composants au-dessus de la cible, à vendre à l'HV : un craft à perte ne se produit pas." :
    `Taux de vente 30 j × tendance 7 j × ${state.settings.horizon||7} j − stock du produit, divisé par la quantité par craft.${a.mode==="new" ? ` Sans historique de ventes : ${Math.ceil(state.settings.depth/2)} crafts de test (profondeur ÷ 2).` : ""}${a.items.length && a.act==="buy" ? " À acheter : " + a.items.slice(0,6).map(x => x[1]+" "+x[0]).join(", ") + "." : ""}`;
  const px = a.mode==="bad" ? "" : a.act==="craft" && a.listUnit!==null ? `<div style="white-space:nowrap">Vendre à : <b>${money(a.listUnit)}</b>${a.floorUnit!==null ? ` <span class="muted">· plancher ${money(a.floorUnit)}</span>` : ""}</div>` :
    a.act==="buy" && a.maxCost!==null ? `<div style="white-space:nowrap">Panier maxi : <b>${money(a.maxCost)}</b> <span class="muted">/ craft (actuel ${money(c.cost)})</span></div>` :
    a.act==="sell" && a.sellItem ? `<div style="white-space:nowrap">Mettre à : <b>${money(a.sellItem[1])}</b> <span class="muted">(${esc(a.sellItem[0])})</span></div>` : "";
  const tip2 = tip + (a.mode==="bad" ? "" : a.act==="craft" ? " Prix de vente conseillé : 1 % sous le prix HV du produit ; plancher : prix unitaire en dessous duquel le ROI passe sous le seuil de rentabilité." : a.act==="buy" ? " Panier maxi : coût des composants par craft au-delà duquel le ROI passe sous le seuil de rentabilité." : "");
  return `<td title="${esc(tip2)}" style="min-width:210px"><b>${esc(a.head)}</b>${a.act==="buy" && a.cost ? ` <span class="muted">≈ ${money(a.cost)}</span>` : ""}${a.note ? `<div class="muted small">${esc(a.note)}</div>` : ""}${px}${base && a.head!=="Attendre" ? `<div class="muted small">${base}</div>` : ""}</td>`;
}
views.crafts = () => {
  const f = filters.crafts;
  let rows = M.crafts.filter(c => (!f.q || norm(c.n).includes(norm(f.q)))
    && (f.st==="all" || (f.st==="flag" ? c.flags.length : c.st===f.st)) && (f.act==="all" || c.act===f.act));
  rows = sortRows("crafts", rows, "net", "desc");
  const cnt = a => M.crafts.filter(c => c.act===a).length;
  return `
  <h1>Crafts</h1>
  ${M.crafts.length ? "" : `<div class="note warn">Aucune recette de craft apprise. Faites un export Gringotts après avoir ouvert vos fenêtres de métier (onglet <a href="#import">Comptoir</a>).</div>`}
  <p class="lede">Ventes 30 j = quantités vendues (et taux d'écoulement vendus / (vendus + expirés)) relevées par Gringotts dans le courrier. Bénéfice net = prix de vente retenu × (1 − ${pct(state.settings.cut)}) − coût des composants. Le jour recommandé vient des semaines complètes de reset (mercredi → mardi) de l'historique. Cliquez une ligne pour le détail.</p>
  <div class="actsum">
    <button class="actcard${f.act==="craft"?" on":""}" data-act="craft"><span class="st ok">Produire</span><b>${cnt("craft")}</b><small>rentable, compos en stock</small></button>
    <button class="actcard${f.act==="buy"?" on":""}" data-act="buy"><span class="st info">Acheter</span><b>${cnt("buy")}</b><small>rentable, compos à acheter</small></button>
    <button class="actcard${f.act==="sell"?" on":""}" data-act="sell"><span class="st bad">Vendre</span><b>${cnt("sell")}</b><small>à perte : vendre les compos</small></button>
  </div>
  <div class="toolbar">
    <input type="search" data-f="crafts.q" value="${esc(f.q)}" placeholder="Rechercher une recette" aria-label="Rechercher une recette">
    <select data-f="crafts.st" aria-label="Statut">
      ${[["all","Tous les statuts"],["ok","Rentables"],["warn","Marge faible"],["bad","En perte"],["flag","À vérifier"]].map(([v,l])=>`<option value="${v}"${f.st===v?" selected":""}>${l}</option>`).join("")}
    </select>
    <select data-f="crafts.act" aria-label="Action">
      ${[["all","Toutes les actions"],["craft","Produire"],["buy","Acheter"],["sell","Vendre"],["check","À vérifier"]].map(([v,l])=>`<option value="${v}"${f.act===v?" selected":""}>${l}</option>`).join("")}
    </select>
    <span class="count">${rows.length} recettes</span>
  </div>
  <div class="tw scroll"><table><thead><tr>
    ${th("crafts","n","Recette")}${th("crafts","actLbl","Action")}${th("crafts","advQty","Conseil de quantité")}${th("crafts","dayOrd","Jour recommandé")}${th("crafts","cur","Prix HV","r")}${th("crafts","med","Médiane 30 j","r")}${th("crafts","cost","Coût","r")}${th("crafts","net","Bénéfice net","r")}${th("crafts","roi","ROI","r")}${th("crafts","possible","Faisables","r")}${th("crafts","soldN","Ventes 30 j","r")}<th>Marge</th>
  </tr></thead><tbody>
  ${rows.map(c => `<tr class="click" data-craft="${esc(c.n)}"><td>${esc(c.n)}${c.flags.length?` <span title="${esc(c.flags.join(" · "))}" style="color:var(--warn)">⚠</span>`:""}</td>
    <td>${actPill(c)}</td>${advCell(c)}<td>${dayCell(c.dayLbl)}</td>
    <td class="r">${money(c.cur)}</td><td class="r">${money(c.med)}</td><td class="r">${money(c.cost)}</td><td class="r">${money(c.net)}${c.adj>0 ? ` <span title="Marge brute ${c.netRaw.toFixed(4)} po − dépôts perdus ${c.adj.toFixed(4)} po (écoulement ${Math.round(c.thru*100)} %)" style="color:var(--warn);cursor:help">◐</span>` : ""}</td><td class="r">${roiTxt(c.roi)}</td><td class="r">${c.possible}</td>
    <td class="r">${c.sales ? `<span title="Vendus / expirés en 30 j · prix moyen ${c.sales.avg!==null ? (c.sales.avg).toFixed(4)+" po" : "—"}">${c.sales.sold}${c.sales.thru!==null ? ` <span class="muted">· ${pct(c.sales.thru)}</span>` : ""}</span>` : `<span class="muted">—</span>`}</td><td>${stPill(c.st)}</td></tr>`).join("") || `<tr><td colspan="11" class="empty">Aucune recette ne correspond.</td></tr>`}
  </tbody></table></div>`;
};

// Annonce : les 5 enchantements appris, faisables avec le stock, au plus gros bénéfice
function announcePick(){ return M.ench.filter(e => e.learned && e.possible >= 1 && e.net!==null && e.net > 0).sort((a,b)=>b.net-a.net).slice(0,5); }
function announce(){
  const list = announcePick();
  if (!list.length) return "";
  return "Enchantement disponible (go /w pour d'autres besoins) : " + list.map(e => `${e.n} ${Math.round(e.price)}g`).join(", ") + ". Bon jeu!";
}
views.enchant = () => {
  const f = filters.enchant; const S = state.settings;
  const cats = [...new Set(M.ench.map(e=>e.cat).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"fr"));
  let rows = M.ench.filter(e => (!f.q || norm(e.n).includes(norm(f.q))) && (f.cat==="all"||e.cat===f.cat) && (f.st==="all"||e.st===f.st));
  rows = sortRows("enchant", rows, "net", "desc");
  const pick = announcePick();
  return `
  <h1>Enchantements</h1>
  ${M.ench.length ? "" : `<div class="note warn">Aucun enchantement appris. Faites un export Gringotts après avoir ouvert votre fenêtre d'enchantement (onglet <a href="#import">Comptoir</a>) : le statut des formules se met à jour tout seul.</div>`}
  <p class="lede">Coût = Σ (quantité × prix unitaire du composant au prix HV actuel ; prix PNJ pour les fournitures marchand). Prix de vente = coût × ${String(1+S.enchMarkup).replace(".",",")}${S.enchRound==="or"?", arrondi à la pièce d'or supérieure":""}. Service en /w : pas de taxe HV.</p>
  <h2>Annonce prête à copier</h2>
  <p class="muted" style="margin-top:-4px">Recalculée à chaque mise à jour des prix ou du stock : les ${pick.length} enchantements appris et faisables avec ton stock qui rapportent le plus.</p>
  ${pick.length ? `<div class="copybox"><textarea id="annonce" readonly aria-label="Annonce">${esc(announce())}</textarea><button class="btn" data-copy="annonce">Copier</button></div>`
    : `<div class="note warn">Aucun enchantement rentable n'est faisable avec le stock actuel. Mettez à jour vos stocks dans Stock &amp; achats.</div>`}
  <div class="toolbar" style="margin-top:18px">
    <input type="search" data-f="enchant.q" value="${esc(f.q)}" placeholder="Rechercher un enchantement" aria-label="Rechercher un enchantement">
    <select data-f="enchant.cat" aria-label="Emplacement"><option value="all">Tous les emplacements</option>${cats.map(c=>`<option${f.cat===c?" selected":""}>${esc(c)}</option>`).join("")}</select>
    <select data-f="enchant.st" aria-label="Statut">${[["all","Tous les statuts"],["ok","Rentables"],["warn","Marge faible"],["bad","En perte"]].map(([v,l])=>`<option value="${v}"${f.st===v?" selected":""}>${l}</option>`).join("")}</select>
    <span class="count">${rows.length} enchantements</span>
  </div>
  <div class="tw scroll"><table><thead><tr>
    ${th("enchant","n","Enchantement")}${th("enchant","cat","Emplacement")}${th("enchant","cost","Coût compos HV","r")}${th("enchant","price","Prix de vente","r")}${th("enchant","net","Bénéfice","r")}${th("enchant","roi","ROI","r")}${th("enchant","possible","Faisables","r")}<th>Statut</th>
  </tr></thead><tbody>
  ${rows.map(e => `<tr class="click" data-ench="${esc(e.n)}"><td>${esc(e.n)}${pick.includes(e)?` <span class="st info">Annonce</span>`:""}</td><td class="muted">${esc(e.cat)}</td><td class="r">${money(e.cost)}</td>
    <td class="r">${money(e.price)}</td><td class="r">${money(e.net)}</td><td class="r">${roiTxt(e.roi)}</td><td class="r">${e.possible}</td><td>${stPill(e.st)}</td></tr>`).join("") || `<tr><td colspan="8" class="empty">Aucun enchantement ne correspond.</td></tr>`}
  </tbody></table></div>`;
};

// Tous les objets à surveiller à l'HV : composants (hors fournitures PNJ) + produits des crafts
const trackList = () => { const pnj = new Set(SEED.pnj.map(x => norm(x.n))), seen = new Set(), out = [];
  const add = n => { const k = norm(n); if (!n || pnj.has(k) || seen.has(k)) return; seen.add(k); out.push(n); };
  M.comps.forEach(c => add(c.n)); ALL_CRAFTS().forEach(c => { if (!c.outUnknown) add(c.out || c.n); });
  return out.sort((a,b) => a.localeCompare(b, "fr")); };
const auctionatorList = (name, items) => name + "^" + items.map(n => `"${n}"`).join("^");
// Cellule « Conseil » du stock : quantité à acheter ou à vendre, selon le signal de prix et la direction à 7 jours
function compAdvCell(c){
  const a = c.adv; if (!a) return `<td>—</td>`;
  const cut = state.settings.cut, dir = a.r7===null ? "" : ` <span style="color:var(--${a.falling?"ok":a.r7>=0.05?"warn":"muted"})" title="Prix actuel comparé à la médiane des 7 derniers jours">${a.falling?"↘":a.r7>=0.05?"↗":"→"}</span>`;
  let head = "Garder", sub = "", cls = "muted", tip = "Stock proche de la cible : rien à faire.";
  if (a.kind==="buy") { head = `Acheter ${a.buy}`; cls = "ok"; sub = `≈ ${money(a.buy*a.unit)}` + (a.extra ? ` <span class="muted">dont ${a.extra} (prix bas)</span>` : "") + (a.maxBuy!==null ? `<div>Prix maxi : <b>${money(a.maxBuy)}</b></div>` : "");
    tip = `Manque jusqu'à la cible : ${Math.max(0,c.toBuy)}.` + (a.extra ? ` Prix ${pct(Math.abs(c.delta))} sous la médiane 30 j, pas en chute : on en prend ${a.extra} de plus (50 % de la cible ou les achats moyens de ${state.settings.horizon||7} j).` : "") + (a.maxBuy!==null ? ` Prix maxi : le plus haut prix qui garde une de vos recettes au seuil de rentabilité (ROI ${pct(state.settings.roiOk)}), plafonné à ${pct(state.settings.buyTh)} au-dessus de la médiane 30 j.` : ""); }
  else if (a.kind==="sell") { head = `Vendre ${a.sell}`; cls = "warn"; sub = (a.unit!==null ? `≈ ${money(a.sell*a.unit*(1-cut))} net` : "") + (a.sellPrice!==null ? `<div>Mettre à : <b>${money(a.sellPrice)}</b></div>` : "") + (a.sellFloor!==null ? `<div class="muted">Plancher : ${money(a.sellFloor)}</div>` : "");
    tip = `Surplus au-dessus de la cible (${Math.max(c.target, c.res ? c.res.nearNet : 0)}).` + (c.sig==="bad" ? " Prix haut : bon moment pour vendre." : " Surplus important : à vendre.") + " Prix conseillé : 1 % sous le prix HV actuel (pour passer en tête). Plancher : médiane 30 j moins " + pct(state.settings.buyTh) + ", en dessous duquel il vaut mieux attendre."; }
  else if (a.kind==="wait") { head = "Reporter"; cls = "warn"; sub = a.note + (a.maxBuy!==null ? `<div>Reprendre sous <b>${money(a.maxBuy)}</b></div>` : ""); tip = "Il en manque mais le prix est trop haut : attendre un retour sous le prix maxi (ou la médiane 30 j)."; }
  else if (a.kind==="none") { head = "—"; sub = a.note; }
  return `<td title="${esc(tip)}" style="min-width:150px"><b class="${cls==="muted"?"muted":""}" style="${cls!=="muted"?`color:var(--${cls})`:""}">${head}</b>${dir}${sub ? `<div class="muted small">${sub}</div>` : ""}</td>`;
}
views.stock = () => {
  const f = filters.stock;
  const anyUsed = M.comps.some(c => c.used) || M.pnjRows.some(p => p.used), useF = f.used && anyUsed && !f.have;   // sans recette apprise, le filtre ne laisserait rien : on affiche tout
  let rows = M.comps.filter(c => (!useF || c.used) && (!f.have || c.stock > 0) && (!f.q || norm(c.n).includes(norm(f.q))) && (f.sig==="all" || c.sig===f.sig || (f.sig==="buy" && c.toBuy>0)));
  rows = sortRows("stock", rows, "delta", "asc");
  const toBuy = M.comps.filter(c=>c.used && c.toBuy>0);
  const pnjShown = M.pnjRows.filter(p => !useF || p.used);
  return `
  <h1>Stock &amp; achats</h1>
  <p class="lede">Signal d'achat : prix actuel comparé à la médiane 30 j (seuil ±${pct(state.settings.buyTh)}). Le meilleur jour d'achat est le jour le moins cher en moyenne sur les semaines complètes de reset (mercredi → mardi). Stock et cibles sont modifiables. Priorité du prix d'achat : prix marchand relevé par Gringotts &gt; liste PNJ &gt; HV. <span class="nodot"></span>Pastille rouge : objet absent du dernier export, son prix n'est pas un relevé réel. Le conseil croise la cible (pilotée par les ventes), le signal de prix et la direction du prix sur 7 jours (↘ en baisse, ↗ en hausse). Tag <span class="st" style="color:var(--info);border-color:var(--info)">Montée</span> : composant réservé par un plan de montée (le réassort achète le manque ; vous pouvez quand même vendre).</p>
  <div class="toolbar">
    <input type="search" data-f="stock.q" value="${esc(f.q)}" placeholder="Rechercher un composant" aria-label="Rechercher un composant">
    <select data-f="stock.sig" aria-label="Signal">${[["all","Tous les signaux"],["ok","Acheter"],["warn","Neutre"],["bad","Trop cher"],["buy","À réassortir"]].map(([v,l])=>`<option value="${v}"${f.sig===v?" selected":""}>${l}</option>`).join("")}</select>
    <label title="Objets dont le stock exporté est supérieur à 0 (sacs, banque, tous persos) : compare le prix HV pour décider de revendre ou non. Désactive le filtre « compos de mes recettes »."><input type="checkbox" data-f="stock.have"${f.have?" checked":""}> Seulement ce que j'ai en stock</label>
    <label><input type="checkbox" data-f="stock.used"${f.used?" checked":""}${f.have?" disabled":""}> Seulement les compos de mes recettes</label>${f.used && !anyUsed ? ` <span class="muted small">(aucune recette apprise relevée : tous les composants sont affichés)</span>` : ""}
    <span class="count">${rows.length} composants</span>
  </div>
  <div class="note ${M.slotsUsed > state.settings.slots ? "warn" : "ok"}">Place occupée par les stocks cibles : <b>${M.slotsUsed}</b> / ${state.settings.slots} emplacements. Cible auto pilotée par les ventes : crafts qui se vendent → ventes/jour × ${state.settings.horizon||7} j ; crafts sans historique → ${state.settings.depth/2} crafts × facteur d'obtention ; crafts à perte ou qui s'écoulent mal → 0. En piles pleines ; si la place manque, les piles qui rapportent le moins d'or par jour sont retirées d'abord. Survolez une cible pour sa raison. Champ vide = auto ; bordure orange = cible manuelle. Tag Montée « A / B » : A = besoin des 2 prochaines étapes de montée (acheté et compté dans la place), B = besoin total jusqu'à 300 (info, pas stocké d'avance). <a href="#reglages">Réglages</a></div>
  <p class="muted">Listes Auctionator (suivi et réassort) : onglet <a href="#import">Comptoir</a>.</p>
  <div class="tw scroll"><table><thead><tr>
    ${th("stock","n","Composant")}${th("stock","cur","Prix actuel","r")}${th("stock","advQty","Conseil")}${th("stock","med","Médiane 30 j","r")}${th("stock","delta","Écart","r")}<th>Signal</th>${th("stock","bestOrd","Meilleur jour d'achat")}<th>Obtention</th><th class="r">Stock</th>${th("stock","value","Valeur du stock","r")}${th("stock","npc","Revente PNJ","r")}<th class="r" title="Vide = cible auto ; saisie = cible manuelle">Cible</th><th class="r" title="Emplacements occupés par la cible (taille de pile)">Piles</th>${th("stock","toBuy","À acheter","r")}${th("stock","refill","Coût réassort","r")}
  </tr></thead><tbody>
  ${rows.map(c => `<tr><td class="click" data-comp="${esc(c.n)}" role="button" tabindex="0" style="cursor:pointer" title="Voir l'évolution du prix">${esc(c.n)}${c.age===null && c.vend===null ? NODOT("Absent du dernier export : prix de la liste de départ ou de test, pas un relevé réel") : ""}${c.res ? ` <span class="st" style="color:var(--info);border-color:var(--info)" title="Réservé : ${esc([...c.res.why].join(", "))}${c.res.prod?` · ${c.res.prod} produits par le plan`:""}">Montée ${c.res.nearNet}${c.res.net > c.res.nearNet ? ` / ${c.res.net}` : ""}</span>` : ""}</td><td class="r">${c.vend!==null ? `<span title="Prix marchand PNJ relevé par Gringotts, utilisé comme prix d'achat">PNJ ${money(c.vend)}</span>` : money(c.cur)}${c.stale!==null ? ` <span class="st warn" title="Dernier relevé Auctionator il y a ${c.stale} jours">${c.stale} j</span>` : ""}</td>${compAdvCell(c)}<td class="r">${money(c.med)}</td><td class="r">${pct(c.delta)}</td><td>${stPill(c.sig,c.sigTxt)}</td><td>${dayCell(c.bestDay)}</td><td class="muted">${OBT[c.ob]||"—"}</td>
    <td class="r"><input class="num" type="number" min="0" step="1" data-stock="${esc(c.n)}" value="${c.stock}" aria-label="Stock ${esc(c.n)}"></td>
    <td class="r">${c.stock > 0 ? money(c.value) : "—"}</td>
    <td class="r" title="Prix de revente chez un marchand PNJ (par unité). Rouge : le PNJ paie plus que l'HV après taxe (${pct(state.settings.cut)}).">${c.npc===null ? "—" : (c.cur!==null && c.vend===null && c.npc > c.cur*(1-state.settings.cut)) ? `<span style="color:var(--bad);font-weight:600">${money(c.npc)} ▲</span>` : money(c.npc)}</td>
    <td class="r"><input class="num" type="number" min="0" step="1" data-target="${esc(c.n)}" value="${c.manualT ? c.target : ""}" placeholder="${c.autoT}" aria-label="Cible ${esc(c.n)}" title="${c.manualT ? "Cible manuelle (videz pour revenir à l'auto : "+c.autoT+")" : "Cible auto" + (c.why ? " — " + c.why : "")}" style="${c.manualT?"border-color:var(--warn)":""}"></td>
    <td class="r muted">${c.target ? `${Math.ceil(c.target/c.st)} × ${c.st}` : "—"}</td>
    <td class="r">${c.toBuy}</td><td class="r">${money(c.refill)}</td></tr>`).join("") || `<tr><td colspan="15" class="empty">Aucun composant ne correspond.</td></tr>`}
  </tbody></table></div>
  <h2>Produits finis à garder en stock (${M.prodRows.length})</h2>
  ${M.prodRows.length ? `<div class="tw scroll"><table><thead><tr><th>Produit</th><th class="r">Ventes / jour (30 j)</th><th class="r">Stock</th><th class="r">Cible (${state.settings.horizon||7} j)</th><th class="r">Piles</th><th class="r">Crafts à lancer</th></tr></thead><tbody>
  ${M.prodRows.map(p => `<tr class="click" data-craft="${esc(p.recipe)}"><td>${esc(p.n)}</td><td class="r">${p.perDay.toFixed(1)}</td><td class="r">${p.stock}</td><td class="r">${p.target}</td><td class="r muted">${p.target ? `${Math.ceil(p.target/p.st)} × ${p.st}` : "—"}</td><td class="r">${p.toCraft || "—"}</td></tr>`).join("")}
  </tbody></table></div>` : `<div class="tw empty">Aucune vente relevée sur 30 j : la cible des produits finis apparaîtra avec les premières ventes (boîte aux lettres + export).</div>`}
  <h2>Fournitures PNJ</h2>
  <div class="tw scroll"><table><thead><tr><th>Article</th><th>Vendeur</th><th class="r">Prix PNJ</th><th class="r">Stock</th><th class="r" title="Vide = cible auto ; saisie = cible manuelle">Cible</th><th class="r">Piles</th><th class="r">À acheter</th><th class="r">Coût réassort</th></tr></thead><tbody>
  ${pnjShown.map(p => `<tr><td>${esc(p.n)}${p.rel ? "" : NODOT("Marchand pas encore visité : prix de la liste de départ, pas un relevé réel")}${p.res ? ` <span class="st" style="color:var(--info);border-color:var(--info)" title="Réservé : ${esc([...p.res.why].join(", "))}${p.res.prod?` · ${p.res.prod} produits par le plan`:""}">Montée ${p.res.nearNet}${p.res.net > p.res.nearNet ? ` / ${p.res.net}` : ""}</span>` : ""}</td><td class="muted">${esc(p.vendor)}</td><td class="r">${money(p.p)} <span class="st ${p.rel?"ok":"warn"}" title="${p.rel?"Prix relevé chez le marchand par Gringotts":"Prix de la liste de départ : pas encore relevé en jeu"}">${p.rel?"relevé":"liste"}</span></td>
    <td class="r"><input class="num" type="number" min="0" step="1" data-pstock="${esc(p.n)}" value="${p.stock}" aria-label="Stock ${esc(p.n)}"></td>
    <td class="r"><input class="num" type="number" min="0" step="1" data-target="${esc(p.n)}" value="${p.manualT ? p.target : ""}" placeholder="${p.autoT}" aria-label="Cible ${esc(p.n)}" style="${p.manualT?"border-color:var(--warn)":""}"></td>
    <td class="r muted">${p.target ? `${Math.ceil(p.target/p.st)} × ${p.st}` : "—"}</td>
    <td class="r">${p.toBuy}</td><td class="r">${money(p.refill)}</td></tr>`).join("")}
  </tbody></table></div>`;
};

function compsTxt(r){
  if (!r.detail) return `<span class="muted">${esc(r.err)}</span>`;
  return r.detail.map(d => `<div class="cl"><span class="muted">${pct(d.prob)}</span> ${String(d.q).replace(".",",")} × ${esc(d.n)} <span class="muted">à</span> ${money(d.p)}</div>`).join("");
}
// Objets désenchantables relevés par l'addon : désenchanter, vendre au marchand ou à l'HV
function deStockBlock(){
  const E = state.equip || [];
  if (!E.length) return `<h2>Objets désenchantables en stock</h2><div class="tw empty">Aucun objet relevé : il faut l'addon ${MIN_ADDON} ou plus et un export (les objets verts, bleus et violets des sacs et banques sont relevés automatiquement).</div>`;
  const QL = {2:"vert", 3:"bleu", 4:"epique"};
  const rows = E.map(e => {
    const br = DE_BRACKETS.findIndex(b => e.l >= b.lo && e.l <= b.hi);
    const r = br >= 0 ? deEval(e.c===2 ? "Arme" : "Armure", br, QL[e.q] || "vert") : {err:"ilvl hors table"};
    const de = r.net ?? null, ahNet = e.ah!==null ? e.ah*(1-state.settings.cut) : null;
    const opts = [["Marchand", e.s], ["Désenchanter", de], ["HV", ahNet]].filter(x => x[1]!==null && x[1] > 0).sort((a,b) => b[1]-a[1]);
    return {...e, de, ahNet, best: opts[0] ? opts[0][0] : "—", gain: opts[0] ? opts[0][1] : 0, err: r.err};
  }).sort((a,b) => b.gain - a.gain);
  const tot = k => rows.filter(r => r.best===k).reduce((a,r) => a + r.gain, 0);
  return `<h2>Objets désenchantables en stock (${rows.length})</h2>
  <p class="muted" style="margin-top:0">Relevés par Gringotts dans les sacs et banques. Valeur DE = composants au prix HV, taxe déduite ; HV = prix Auctionator de l'objet, taxe déduite (connu seulement pour le perso qui a exporté). Désenchanter : ${money(tot("Désenchanter"))} · Marchand : ${money(tot("Marchand"))} · HV : ${money(tot("HV"))}.</p>
  <div class="tw scroll"><table><thead><tr><th>Objet</th><th>Perso</th><th class="r">ilvl</th><th>Qualité</th><th class="r">Désenchanter</th><th class="r">Marchand</th><th class="r">HV (net)</th><th>Meilleur choix</th></tr></thead><tbody>
  ${rows.map(r => `<tr><td>${esc(r.n)}</td><td class="muted">${esc(r.char)}</td><td class="r">${r.l}</td><td>${({2:"Vert",3:"Bleu",4:"Épique"})[r.q]||"—"} ${r.c===2?"arme":"armure"}</td>
    <td class="r">${r.de!==null ? money(r.de) : `<span class="muted" title="${esc(r.err||"prix manquant")}">—</span>`}</td><td class="r">${money(r.s)}</td><td class="r">${money(r.ahNet)}</td>
    <td>${r.best==="—" ? "—" : `<span class="st ${r.best==="Désenchanter"?"info":r.best==="HV"?"ok":"mute"}">${r.best}</span>`}</td></tr>`).join("")}
  </tbody></table></div>`;
}
views.desench = () => {
  const S = state.settings;
  const kpiCell = (type, i, q) => { const r = deEval(type, i, q); if (r.net===undefined) return `<td class="r muted">—</td>`;
    return `<td class="r"><div>${money(r.net)}</div><div class="muted small">ROI ${pct(S.roiOk)} : ${money(r.net/(1+S.roiOk))}</div></td>`; };
  return `
  <h1>Désenchantement</h1>
  ${deStockBlock()}
  <h2>Référence : prix d'achat maximal pour désenchanter</h2>
  <p class="muted" style="margin-top:-4px">Pour repérer les bonnes affaires à l'HV sans survoler chaque objet. Au-dessus de ce prix, l'objet désenchanté rapporte moins qu'il ne coûte ; la seconde ligne donne le prix maximal pour garder un ROI de ${pct(S.roiOk)}. Valeur = Σ (probabilité × quantité moyenne × prix HV des composants), taxe HV de ${pct(S.cut)} déduite.</p>
  <div class="tw"><table class="kpimatrix"><thead><tr><th>Tranche ilvl</th><th class="r">Armure verte</th><th class="r">Arme verte</th><th class="r">Bleu (arme ou armure)</th><th class="r">Épique (arme ou armure)</th></tr></thead><tbody>
  ${DE_BRACKETS.map((b,i)=>`<tr><td><b>${brLbl(b)}</b></td>${kpiCell("Armure",i,"vert")}${kpiCell("Arme",i,"vert")}${kpiCell("Armure",i,"bleu")}${kpiCell("Armure",i,"epique")}</tr>`).join("")}
  </tbody></table></div>
  <p class="muted">Vert : armure 75 % poussière / 20 % essence / 5 % éclat ; arme 20 % / 75 % / 5 % (sans éclat sous l'ilvl 16). Bleu : 1 éclat. Épique : 2 à 4 éclats (moyenne 3), 1 Cristal de nexus à partir de l'ilvl 56. Taux du jeu Classic, à confirmer sur WoW Forever.</p>`;
};

const DIFF = [["Orange","#e8833a"],["Jaune","#d9b934"],["Vert","#4fc68d"],["Gris","#8d97a7"]];
const diffPill = d => d===undefined||d===null||!DIFF[d] ? "" : `<span class="st" style="color:${DIFF[d][1]};border-color:${DIFF[d][1]}" title="Couleur de la recette en jeu">${DIFF[d][0]}</span>`;
const skillOf = job => (state.skills||{})[job] || null;
const learnableNow = r => { const s = skillOf(r.job); return !!s && !isLearned(r.k, r.n) && r.sk != null && r.sk <= s.l; };
// ---------- Plan de montée : affichage ----------
const netTxt = v => v < 0 ? `gain ${money(-v)}` : money(v);
const sumReag = parts => { const t = {}; parts.forEach(p => p.r.forEach(([n,q]) => { if (p.crafts) t[n] = (t[n]||0) + q*p.crafts; })); return Object.entries(t); };
function stepBox(st, current){
  const c = st.chosen;
  return `<div style="border-left:3px solid ${current?"var(--gold)":"var(--line)"};padding:4px 10px;margin-bottom:8px">
    <div style="display:flex;justify-content:space-between;gap:8px"><b>${st.from} → ${st.to}</b>${current?`<span class="st ok">En cours</span>`:`<span class="muted">Ensuite</span>`}</div>
    <div>${c.parts.filter(p => p.crafts).map(p => `${esc(p.n)} <b>×${p.crafts}</b>`).join(" + ") || `<span class="muted">Outil déjà en stock</span>`}</div>
    <div class="muted" style="font-size:13px">${sumReag(c.parts).map(([n,q]) => `${q} ${esc(n)}`).join(" · ")}</div>
    <div style="font-size:13px">${c.miss.length && !c.cost ? "Coût inconnu" : `Coût ${c.miss.length?"≥ ":""}${money(c.cost)} · net ${netTxt(c.net)}`}${st.opts.length>1?` · <span class="muted">${st.opts.length} voies, la moins chère retenue</span>`:""}</div>
    ${c.miss.length ? `<div class="st warn" style="display:inline-block;margin-top:4px" title="Recherchez l'objet à l'HV puis refaites un export">Prix manquant : ${c.miss.map(esc).join(", ")}</div>` : ""}
    ${st.note ? `<div class="muted" style="font-size:12px;margin-top:2px">${esc(st.note)}</div>` : ""}
  </div>`;
}
function planTile(job){
  const pl = M.plans && M.plans[job]; if (!pl) return "";
  const horizon = pl.next ? pl.next.to : pl.cur ? pl.cur.to : 0;
  const ms = pl.ms.filter(m => m.open && m.at <= horizon);
  return `<div class="muted" style="font-size:13px;margin-bottom:6px">Plan de montée (guide)${pl.manual ? ` · avancé à la main jusqu'à ${pl.lvl}` : pl.known ? "" : " · niveau inconnu, départ à 1"}</div>
    ${ms.map(m => `<div class="note warn" style="margin:0 0 8px;padding:6px 10px">⚑ ${m.at} : ${esc(m.lbl)}${m.r?` — ${m.r.map(([n,q]) => `${q} ${esc(n)}`).join(", ")}`:""}</div>`).join("")}
    ${pl.cur ? stepBox(pl.cur, true) + `<div class="toolbar" style="margin:-2px 0 10px"><button class="btn primary" data-stepdone="${esc(job)}|${pl.cur.to}">Étape terminée → passer au palier ${pl.cur.to}</button>${pl.manual ? `<button class="btn" data-stepreset="${esc(job)}" title="Revenir au niveau relevé par l'addon">Annuler (niveau réel ${pl.realLvl ?? "inconnu"})</button>` : ""}</div>` + (pl.next ? stepBox(pl.next, false) : "") : `<p style="margin:0 0 8px">Plan terminé.</p>${pl.manual ? `<div class="toolbar"><button class="btn" data-stepreset="${esc(job)}">Annuler (niveau réel ${pl.realLvl ?? "inconnu"})</button></div>` : ""}`}
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin:4px 0 14px">
      <span>Reste jusqu'à ${pl.steps[pl.steps.length-1].to} : <b>${pl.missLeft.length?"≥ ":""}${netTxt(pl.netLeft)}</b> après revente${pl.missLeft.length ? ` <span class="st warn" title="${esc(pl.missLeft.join(", "))}">${pl.missLeft.length} prix manquant(s)</span>` : ""}</span>
      <button class="btn" data-plan="${esc(job)}">Plan complet</button></div>`;
}
function planDrawer(job){
  const pl = M.plans[job];
  const res = Object.values(M.reserve).filter(e => [...e.why].some(w => w.startsWith(job+" ")));
  return `<h3 id="dTitle">Plan de montée — ${esc(job)}</h3>
    <p class="muted" style="margin:0 0 10px">Niveau ${pl.known ? pl.lvl+" / "+pl.max : "inconnu : en attente du premier export, aucun besoin réservé"} · reste ${money(pl.costLeft)} de composants, ${netTxt(pl.netLeft)} après revente${pl.missLeft.length?" (prix manquants exclus)":""}. Quantités du guide : estimations, les recettes jaunes ne donnent pas toujours un point.</p>
    <h2>Jalons</h2>
    ${pl.ms.map(m => `<div class="note ${m.open?"warn":""}" style="padding:6px 10px">${m.open?"⚑":"✓"} <b>${m.at}</b> : ${esc(m.lbl)}${m.r?` — ${m.r.map(([n,q]) => `${q} ${esc(n)}`).join(", ")}`:""}</div>`).join("")}
    <h2>Étapes</h2>
    <p class="muted" style="margin:0 0 6px">Sur un palier à plusieurs voies, le menu permet d'imposer une voie (ex. composants déjà en stock) au lieu du choix automatique.</p>
    <div class="tw"><table><thead><tr><th>Palier</th><th>Voie retenue</th><th class="r">Coût</th><th class="r">Net</th><th>Alternatives (net)</th></tr></thead><tbody>
    ${pl.steps.map(st => `<tr style="${st.status==="current"?"background:color-mix(in srgb,var(--gold) 12%,transparent)":""}${st.status==="done"?";opacity:.5":""}">
      <td><b>${st.from}→${st.to}</b><br><span class="muted">${st.status==="done"?"fait":st.status==="current"?"en cours":"à venir"}</span></td>
      <td>${st.status!=="done" && st.opts.length > 1 ? `<select data-planchoice="${esc(job)}|${st.from}" aria-label="Voie du palier ${st.from}-${st.to}" style="margin-bottom:4px;max-width:100%"><option value="auto"${st.forced?"":" selected"}>Auto (la moins chère)</option>${st.opts.map(o => `<option value="${o.i}"${st.forced && o===st.chosen ? " selected" : ""}>${esc(o.lbl)}</option>`).join("")}</select><br>` : ""}${st.chosen.parts.map(p => `${esc(p.n)} ×${st.status==="done"?p.c:p.crafts}`).join("<br>")}${st.chosen.miss.length?`<br><span class="st warn">Prix manquant : ${st.chosen.miss.map(esc).join(", ")}</span>`:""}${st.note?`<br><span class="muted" style="font-size:12px">${esc(st.note)}</span>`:""}</td>
      <td class="r">${st.status==="done"?"—":money(st.chosen.cost)}</td><td class="r">${st.status==="done"?"—":netTxt(st.chosen.net)}</td>
      <td>${st.opts.filter(o => o!==st.chosen).map(o => `${esc(o.lbl)} : ${o.miss.length?`<span class="muted">prix manquant</span>`:netTxt(o.net)}`).join("<br>") || `<span class="muted">—</span>`}</td></tr>`).join("")}
    </tbody></table></div>
    <h2>Composants réservés</h2>
    ${res.length ? `<div class="tw"><table><thead><tr><th>Composant</th><th class="r">Besoin total</th><th class="r">2 prochaines étapes</th><th class="r">Produit par le plan</th><th class="r">Stock</th><th class="r">À acheter maintenant</th></tr></thead><tbody>
    ${res.sort((a,b) => a.n.localeCompare(b.n)).map(e => { const st = M.comps.concat(M.pnjRows).find(c => c.k===norm(e.n)); const stock = st ? st.stock : 0;
      return `<tr><td>${esc(e.n)}</td><td class="r">${e.need}</td><td class="r">${e.nearNet}</td><td class="r">${e.prod||"—"}</td><td class="r">${stock}</td><td class="r">${Math.max(0, e.nearNet - stock)}</td></tr>`; }).join("")}
    </tbody></table></div><p class="muted">Besoin cumulé de tous les métiers pour un même composant.</p>` : `<p class="muted">Aucun composant réservé.</p>`}`;
}
const GATHER_DEFAULT = ["Herboristerie", "Minage", "Dépeçage", "Pêche"];
function gatherCard(){
  const G = {...state.gather};
  if (skillOf("Minage / divers")) G["Minage"] = skillOf("Minage / divers"); GATHER_DEFAULT.forEach(p => { if (!Object.keys(G).some(k => norm(k)===norm(p))) G[p] = null; });
  const g = Object.entries(G);
  return `<div class="tw" style="padding:14px 16px"><b>Récolte & secondaires</b>${g.sort((a,b)=>a[0].localeCompare(b[0])).map(([p, s]) => !s ? `
    <div style="margin-top:10px;display:flex;justify-content:space-between;gap:8px"><span>${esc(p)}</span><span class="muted">en attente du premier export</span></div>` : `
    <div style="margin-top:10px"><div style="display:flex;justify-content:space-between;gap:8px"><span>${esc(p)}</span><span><b>${s.l}</b> <span class="muted">/ ${s.m} · ${esc(s.char)}</span></span></div>
    <div style="height:6px;background:var(--panel2);border-radius:3px;margin-top:6px"><div style="height:100%;width:${Math.min(100,Math.round(s.l/s.m*100))}%;background:var(--silver);border-radius:3px"></div></div></div>`).join("")}</div>`;
}
function progressionBlock(){
  const jobs = jobsAll().filter(j => j !== "Minage / divers");   // le minage est affiché avec la récolte
  return `<h2>Progression des métiers</h2><div class="prog">${jobs.map(job => {
    const s = skillOf(job), rec = ALL_RECIPES().filter(r => r.job===job), noSk = rec.length && rec.every(r => r.sk==null);
    if (!s) return `<div class="tw" style="padding:14px 16px"><b>${esc(job)}</b><p class="muted" style="margin:6px 0 12px">Niveau inconnu : faites un export Gringotts après vous être connecté avec le perso qui a ce métier.</p>${planTile(job)}</div>`;
    const pct = Math.min(100, Math.round(s.l/s.m*100));
    const up = rec.filter(r => isLearned(r.k, r.n) && [0,1].includes((state.recDiff||{})[recKey(r.k,r.n)]))
      .map(r => { const c = M.recCost[recKey(r.k,r.n)] || {}; return {...r, d:state.recDiff[recKey(r.k,r.n)], cost:c.cost ?? null, net:c.cost==null ? null : c.cost - (c.resale||0)}; })
      .sort((a,b) => (a.net ?? 1e9) - (b.net ?? 1e9));
    const hasDiff = rec.some(r => (state.recDiff||{})[recKey(r.k,r.n)] !== undefined);
    const now = rec.filter(learnableNow).sort((a,b) => b.sk - a.sk);
    const next = rec.filter(r => !isLearned(r.k, r.n) && r.sk != null && r.sk > s.l).sort((a,b) => a.sk - b.sk);
    const nextSk = next.length ? next[0].sk : null, nextN = next.filter(r => r.sk===nextSk).length;
    return `<div class="tw" style="padding:14px 16px">
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px"><b>${esc(job)}</b><span><b>${s.l}</b> <span class="muted">/ ${s.m} · ${esc(s.char)}</span></span></div>
      <div style="height:6px;background:var(--panel2);border-radius:3px;margin:8px 0 12px"><div style="height:100%;width:${pct}%;background:var(--gold);border-radius:3px"></div></div>
      ${planTile(job)}
      <div class="muted" style="font-size:13px;margin-bottom:4px">Monter au moindre coût (recettes orange/jaune, coût net = compos − revente)</div>
      ${!hasDiff ? `<p class="muted" style="margin:0 0 10px">Ouvrez la fenêtre de métier en jeu puis réexportez pour connaître la couleur des recettes.</p>`
        : up.length ? `<table style="margin-bottom:10px"><tbody>${up.slice(0,5).map(r => `<tr><td>${esc(r.n)}</td><td>${diffPill(r.d)}</td><td class="r" title="Coût des composants">${money(r.cost)}</td><td class="r" title="Coût net après revente">${money(r.net)}</td></tr>`).join("")}</tbody></table>`
        : `<p style="margin:0 0 10px">Aucune recette apprise ne rapporte encore de point : apprenez-en une nouvelle.</p>`}
      ${noSk ? (() => { const nl = rec.filter(r => !isLearned(r.k, r.n)); return `<div class="muted" style="font-size:13px;margin-bottom:4px">Vues en jeu, non apprises (${nl.length}) · compétence requise inconnue</div>
      ${nl.length ? `<table style="margin-bottom:10px"><tbody>${nl.slice(0,5).map(r => { const c = M.recCost[recKey(r.k,r.n)] || {}; return `<tr><td>${esc(r.n)}</td><td class="r" title="Coût des composants">${money(c.cost ?? null)}</td></tr>`; }).join("")}</tbody></table>` : `<p style="margin:0 0 10px">Toutes les recettes vues sont apprises.</p>`}`; })() : `
      <div class="muted" style="font-size:13px;margin-bottom:4px">À apprendre maintenant (${now.length})</div>
      ${now.length ? `<table style="margin-bottom:10px"><tbody>${now.slice(0,5).map(r => `<tr><td>${esc(r.n)}</td><td class="r">${r.sk}</td><td class="muted">${esc(r.src||"—")}</td></tr>`).join("")}</tbody></table>${now.length>5?`<button class="btn" data-f-learnable="${esc(job)}">Voir les ${now.length}</button>`:""}` : `<p style="margin:0 0 10px">Rien à apprendre à ce niveau.</p>`}
`}
      ${noSk ? "" : `<div style="margin-top:8px">${nextSk!==null ? `Prochain palier : <b>${nextSk}</b> (${nextN} recette${nextN>1?"s":""}, encore ${nextSk - s.l} point${nextSk-s.l>1?"s":""})` : `<span class="muted">Toutes les recettes du dashboard sont accessibles.</span>`}</div>`}
    </div>`; }).join("")}${gatherCard()}</div>`;
}
views.recettes = () => {
  const f = filters.recettes;
  const all = ALL_RECIPES().map(r => ({...r, key: recKey(r.k, r.n), learned: isLearned(r.k, r.n), kindLbl: r.k==="craft" ? "Craft" : "Enchantement"}));
  const unk = Object.entries(state.unknownRecipes||{}).flatMap(([job, list]) => list.map(n => ({n, job, k: job==="Enchantement" ? "ench" : "craft", sk:null, src:"Export Gringotts", z:"", d:"Absente de la liste du dashboard", key:"unk:"+job+":"+norm(n), learned:true, unknown:true})));
  // Filtre par métier (ancienne valeur « craft » / « ench » ramenée à « tous »)
  if (!["all", ...jobsAll()].includes(f.kind)) f.kind = "all";
  let rows = [...all, ...unk].filter(r => (f.kind==="all" || r.job===f.kind) && (f.l==="all" || (f.l==="inconnue" ? r.unknown : f.l==="dispo" ? learnableNow(r) : !r.unknown && (f.l==="oui") === r.learned)) && (!f.q || norm(r.n+" "+(r.src||"")+" "+(r.z||"")).includes(norm(f.q))));
  rows = sortRows("recettes", rows, "sk", "asc");
  const nL = k => all.filter(r => r.k===k && r.learned).length, nT = k => all.filter(r => r.k===k).length;
  window.__recRows = rows;
  const showList = f.kind!=="all" || f.l==="inconnue";   // liste affichée seulement après clic sur une tuile métier (ou sur « inconnues »)
  return `
  <h1>Recettes</h1>
  <p class="lede">Statut synchronisé par l'export Gringotts : <span class="st ok">Apprise</span> <span class="st warn">Non apprise</span> <span class="st bad">Inconnue</span> (vue en jeu mais absente de la liste du dashboard : à traiter). Sans relevé, une recette est considérée non apprise. Seules les recettes apprises apparaissent dans la tour de contrôle, les crafts, les enchantements, l'annonce et le réassort.</p>
  <div class="kpis" style="margin-bottom:18px">
    ${jobsAll().map(j => { const t = all.filter(r => r.job===j), l = t.filter(r => r.learned).length;
      const on = f.kind===j;
      return `<button class="kpi" data-recjob="${esc(j)}" aria-pressed="${on}" title="${on ? "Masquer" : "Afficher"} les recettes · ${esc(j)}" style="text-align:left;cursor:pointer;font:inherit;color:inherit${on ? ";border-color:var(--gold);box-shadow:inset 0 0 0 1px var(--gold)" : ""}"><div class="v">${l} <span class="muted" style="font-size:16px">/ ${t.length}</span></div><div class="l">recettes apprises · ${esc(j)} ${on ? "▾" : "▸"}</div></button>`; }).join("")}
    ${unk.length ? `<button class="kpi" data-recfilter="inconnue" style="text-align:left;cursor:pointer;font:inherit;color:inherit" title="Afficher ces recettes"><div class="v" style="color:var(--bad)">${unk.length}</div><div class="l">recettes inconnues à traiter</div></button>` : ""}
  </div>
  ${progressionBlock()}
  ${showList ? `<h2>Recettes · ${f.kind==="all" ? "à traiter" : esc(f.kind)}</h2>
  <div class="toolbar">
    <input type="search" data-f="recettes.q" value="${esc(f.q)}" placeholder="Recette, source ou zone" aria-label="Rechercher une recette">
    <select data-f="recettes.kind" aria-label="Métier">${[...(f.kind==="all" ? [["all","Tous les métiers"]] : []), ...jobsAll().map(j => [j, j])].map(([v,l])=>`<option value="${esc(v)}"${f.kind===v?" selected":""}>${esc(l)}</option>`).join("")}</select>
    <select data-f="recettes.l" aria-label="Apprise">${[["all","Toutes"],["oui","Apprises"],["non","Non apprises"],["dispo","Apprenables maintenant"],["inconnue","Inconnues (à traiter)"]].map(([v,l])=>`<option value="${v}"${f.l===v?" selected":""}>${l}</option>`).join("")}</select>
    <button class="btn" id="recReset" style="color:var(--bad);border-color:var(--bad)">Reset des recettes</button>
    <span class="count">${rows.length} recettes</span>
  </div>
  <div class="tw scroll"><table><thead><tr>
    ${th("recettes","learned","Statut")}${th("recettes","n","Recette")}${th("recettes","job","Métier")}${th("recettes","sk","Compétence","r")}${th("recettes","src","Source")}${th("recettes","z","Zone")}<th>Précisions</th><th>Suivi</th>
  </tr></thead><tbody>
  ${rows.map(r => `<tr><td>${r.unknown ? `<span class="st bad">Inconnue</span>` : r.learned ? `<span class="st ok">Apprise</span>` : `<span class="st warn">Non apprise</span>`}</td>
    <td>${esc(r.n)}</td><td class="muted">${esc(r.job)}</td><td class="r">${r.learned ? diffPill((state.recDiff||{})[r.key]) : learnableNow(r) ? `<span class="st ok">Apprenable</span>` : ""} ${r.sk ?? "—"}</td><td>${esc(r.src||"—")}</td><td class="muted">${esc(r.z||"—")}</td><td class="muted">${esc(r.d||"")}</td>
    <td>${r.unknown ? `<span class="st bad">À traiter</span>` : r.auto ? `<span class="st" style="color:var(--info);border-color:var(--info)" title="Recette et composants lus en jeu par Gringotts">Auto</span>` : r.t ? `<span class="st ${r.learned?"ok":"mute"}">${r.learned?"Suivie":"Masquée"}</span>` : r.nc ? `<span class="st mute" title="Formule sans composants : rien à chiffrer">Sans composants</span>` : `<span class="st mute" title="Aucune liste de composants : la recette ne peut pas être chiffrée">Compos non renseignés</span>`}</td></tr>`).join("") || `<tr><td colspan="8" class="empty">Aucune recette ne correspond.</td></tr>`}
  </tbody></table></div>` : `<div class="toolbar"><span class="muted">Cliquez sur la tuile d'un métier pour afficher ses recettes.</span><button class="btn" id="recReset" style="color:var(--bad);border-color:var(--bad)">Reset des recettes</button></div>`}`;
};

// Historique trop court : médiane 30 j et meilleur jour pas encore fiables
const histNote = () => M.lastDate && M.histDays < (state.settings.minHist||7) ? `<div class="note warn">Historique de prix : <b>${M.histDays} jour${M.histDays>1?"s":""}</b>. La médiane 30 j et le meilleur jour ne sont pas encore fiables (${state.settings.minHist||7} jours minimum pour la médiane, ${state.settings.minWeeks||3} semaines complètes pour le meilleur jour) : les marges « prudentes » reposent surtout sur le prix du jour.</div>` : "";
// ---------- Finances : graphiques et blocs ----------
// Texte brut d'un montant d'or pour les axes SVG : « 1 200g », « 12g 50s », « 3s 40c » (l'ancien arrondi à l'unité affichait 0 pour tout montant < 1 or)
const fnum = v => {
  let c = Math.round(Math.abs(v)*10000); if (!c) return "0";
  const g = Math.floor(c/10000); c -= g*10000; const sv = Math.floor(c/100), cv = c - sv*100, sg = v < 0 ? "−" : "", out = [];
  if (g) out.push(g.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + "g");
  if (sv && g < 100) out.push(sv + "s");
  if (cv && !g) out.push(cv + "c");
  return sg + out.join(" ");
};
const sgnMoney = v => v===null || v===undefined ? "—" : `<span style="color:var(--${v>=0?"ok":"bad"})">${v>=0?"+":"−"}</span>${money(Math.abs(v))}`;
// Graduations « rondes » (1, 2, 5 × 10^n) couvrant [min, max], sans forcer le zéro
function niceTicks(min, max, n){
  const span = (max - min) || Math.max(1, Math.abs(max)*0.1), raw = span/n, mag = Math.pow(10, Math.floor(Math.log10(raw))), f = raw/mag, step = (f<=1 ? 1 : f<=2 ? 2 : f<=5 ? 5 : 10)*mag;
  const lo = Math.floor(min/step)*step, hi = Math.ceil(max/step)*step, t = [];
  for (let v = lo; v <= hi + step/2; v += step) t.push(+v.toFixed(6));
  return t;
}
const CH = {W:900, L:62, R:14, T:12, B:26};
// Axe X commun : dates de début, milieu et fin
function xLabels(R, x, H){
  return [0, Math.floor((R.length-1)/2), R.length-1].filter((v,i,a) => a.indexOf(v)===i).map(i =>
    `<text x="${x(i)}" y="${H-7}" text-anchor="${i===0?"start":i===R.length-1?"end":"middle"}" font-size="12" fill="var(--muted)">${fmtDate(R[i].d)}</text>`).join("");
}
// Courbe à axe resserré avec aire légère ; tip(r) donne l'infobulle de chaque jour
function lineChart(R, key, col, tip, label, W=900){
  const pts = R.map((r,i) => [i, r[key]]).filter(p => p[1]!==null && p[1]!==undefined);
  if (pts.length < 2) return `<p class="muted" style="padding:6px 0">Pas encore assez de relevés.</p>`;
  const {L, R:RR, T, B} = CH, H = 150, vals = pts.map(p => p[1]);
  const tk = niceTicks(Math.min(...vals), Math.max(...vals), 3), lo = tk[0], hi = tk[tk.length-1], span = (hi-lo) || 1;
  const x = i => L + (R.length>1 ? i*(W-L-RR)/(R.length-1) : (W-L)/2), y = v => T + (H-T-B)*(1 - (v-lo)/span);
  const line = pts.map((p,k) => (k?"L":"M") + x(p[0]).toFixed(1) + " " + y(p[1]).toFixed(1)).join(" ");
  const area = `${line} L${x(pts[pts.length-1][0]).toFixed(1)} ${y(lo)} L${x(pts[0][0]).toFixed(1)} ${y(lo)} Z`;
  const grid = tk.map(v => `<line x1="${L}" x2="${W-RR}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${L-8}" y="${y(v)+4}" text-anchor="end" font-size="12" fill="var(--muted)">${fnum(v)}</text>`).join("");
  const w = (W-L-RR)/Math.max(1,R.length), dots = R.length <= 45;
  const hov = R.map((r,i) => r[key]===null||r[key]===undefined ? "" : `<g><title>${esc(tip(r))}</title><rect x="${x(i)-w/2}" y="${T}" width="${w}" height="${H-T-B}" fill="transparent"/>${dots ? `<circle cx="${x(i)}" cy="${y(r[key])}" r="3" fill="${col}"/>` : ""}</g>`).join("");
  const last = pts[pts.length-1];
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto" role="img" aria-label="${esc(label)}">${grid}
    <path d="${area}" fill="${col}" fill-opacity=".13"/><path d="${line}" fill="none" stroke="${col}" stroke-width="2.4" stroke-linejoin="round"/>${hov}
    <circle cx="${x(last[0])}" cy="${y(last[1])}" r="5.5" fill="${col}" stroke="var(--panel)" stroke-width="2"/>${xLabels(R, x, H)}</svg>`;
}
// Gain d'or par jour : barres vertes/rouges + moyenne mobile sur 7 jours
function gainChart(R, W=900){
  const D = R.map(r => r.delta);
  if (D.filter(v => v!==null).length < 2) return `<p class="muted" style="padding:6px 0">Pas encore assez de relevés.</p>`;
  const ma = D.map((v,i) => { const s = D.slice(Math.max(0,i-6), i+1).filter(u => u!==null); return v===null || !s.length ? null : s.reduce((a,b)=>a+b,0)/s.length; });
  const {L, R:RR, T, B} = CH, H = 150, vals = D.filter(v => v!==null);
  const tk = niceTicks(Math.min(0, ...vals), Math.max(0, ...vals), 3), lo = tk[0], hi = tk[tk.length-1], span = (hi-lo) || 1;
  const x = i => L + (R.length>1 ? i*(W-L-RR)/(R.length-1) : (W-L)/2), y = v => T + (H-T-B)*(1 - (v-lo)/span);
  const gw = (W-L-RR)/Math.max(1,R.length), bw = Math.max(2, Math.min(22, gw*0.68));
  const grid = tk.map(v => `<line x1="${L}" x2="${W-RR}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"${v===0?' stroke-width="1.6"':""}/><text x="${L-8}" y="${y(v)+4}" text-anchor="end" font-size="12" fill="var(--muted)">${v>0?"+":""}${fnum(v)}</text>`).join("");
  const bars = R.map((r,i) => { const v = r.delta; if (v===null) return "";
    const other = v - r.sold + r.bought, y0 = y(0), y1 = y(v);
    return `<g><title>${esc(fmtDate(r.d))}\nGain : ${v>=0?"+":""}${v.toFixed(2)} po\nVentes HV nettes : ${r.sold.toFixed(2)} po\nAchats HV : ${r.bought.toFixed(2)} po\nAutres : ${other>=0?"+":""}${other.toFixed(2)} po</title>
      <rect x="${x(i)-gw/2}" y="${T}" width="${gw}" height="${H-T-B}" fill="transparent"/>
      <rect x="${x(i)-bw/2}" y="${Math.min(y0,y1)}" width="${bw}" height="${Math.max(1,Math.abs(y1-y0))}" rx="2" fill="var(--${v>=0?"ok":"bad"})" fill-opacity=".85"/></g>`; }).join("");
  const mp = ma.map((v,i) => v===null ? null : `${x(i).toFixed(1)} ${y(v).toFixed(1)}`).filter(Boolean);
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto" role="img" aria-label="Gain d'or par jour">${grid}${bars}
    ${mp.length>1 ? `<path d="M${mp.join(" L")}" fill="none" stroke="var(--gold)" stroke-width="2.4" stroke-linejoin="round"/>` : ""}${xLabels(R, x, H)}</svg>`;
}
const legendDot = (c, t, line) => `<span style="display:inline-flex;align-items:center;gap:6px"><span style="display:inline-block;${line ? `width:16px;height:0;border-top:2.4px solid ${c}` : `width:10px;height:10px;border-radius:2px;background:${c}`}"></span>${t}</span>`;
// Ventes nettes et achats par semaine de reset (mercredi → mardi), pleine largeur, résultat net au-dessus de chaque semaine
function resultBlock(W=900, wide=true){
  const T = state.trades || [], cut = state.settings.cut;
  const wk = t => { const d = new Date(t*1000); d.setHours(0,0,0,0); d.setDate(d.getDate() - ((d.getDay() - 3 + 7) % 7)); return d.toISOString().slice(0,10); };   // semaine mercredi → mardi
  const Wk = {};
  T.forEach(x => { if (x.k!=="V" && x.k!=="A") return; const w = Wk[wk(x.t)] = Wk[wk(x.t)] || {v:0, a:0}; if (x.k==="V") w.v += x.c*(1-cut); else w.a += x.c; });
  const weeks = Object.keys(Wk).sort().slice(-12);
  if (!weeks.length) return `<h2>Ventes et achats par semaine</h2><div class="tw empty">Pas encore assez de données : ventes et achats relevés par la boîte aux lettres.</div>`;
  const {L, R:RR} = CH, H = wide ? 160 : 150, TT = 24, BB = 24, vmax = Math.max(1e-9, ...weeks.flatMap(w => [Wk[w].v, Wk[w].a]));
  const tk = niceTicks(0, vmax, 3), hi = tk[tk.length-1], y = v => TT + (H-TT-BB)*(1 - v/hi), gw = (W-L-RR)/weeks.length, bw = Math.min(40, gw*0.3);
  const grid = tk.map(v => `<line x1="${L}" x2="${W-RR}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${L-8}" y="${y(v)+4}" text-anchor="end" font-size="12" fill="var(--muted)">${fnum(v)}</text>`).join("");
  const bars = weeks.map((w, i) => { const cx = L + gw*(i+0.5), net = Wk[w].v - Wk[w].a, hv = y(0)-y(Wk[w].v), ha = y(0)-y(Wk[w].a);
    return `<g><title>Semaine du ${esc(fmtDate(w))}\nVentes nettes de taxe : ${Wk[w].v.toFixed(2)} po\nAchats : ${Wk[w].a.toFixed(2)} po\nRésultat : ${net>=0?"+":""}${net.toFixed(2)} po</title>
      <rect x="${cx-gw/2}" y="${TT-14}" width="${gw}" height="${H-TT-BB+14}" fill="transparent"/>
      <rect x="${cx-bw-2}" y="${y(Wk[w].v)}" width="${bw}" height="${Math.max(0,hv)}" rx="3" fill="var(--gold)"/><rect x="${cx+2}" y="${y(Wk[w].a)}" width="${bw}" height="${Math.max(0,ha)}" rx="3" fill="var(--silver)"/>
      <text x="${cx}" y="${TT-8}" text-anchor="middle" font-size="12.5" font-weight="700" fill="var(--${net>=0?"ok":"bad"})">${net>=0?"+":"−"}${fnum(Math.abs(net))}</text>
      <text x="${cx}" y="${H-8}" text-anchor="middle" font-size="12" fill="var(--muted)">${w.slice(8,10)}/${w.slice(5,7)}</text></g>`; }).join("");
  const totV = weeks.reduce((a,w) => a + Wk[w].v, 0), totA = weeks.reduce((a,w) => a + Wk[w].a, 0);
  return `<section><h2>Ventes et achats par semaine</h2><div class="tw" style="padding:10px 14px">
    <div class="fleg">${legendDot("var(--gold)","Ventes nettes de taxe")}${legendDot("var(--silver)","Achats HV")}<span class="muted">Mercredi → mardi · résultat net au-dessus · en po</span></div>
    <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto" role="img" aria-label="Ventes nettes et achats par semaine">${grid}${bars}</svg>
    <p style="margin:6px 0 0">Sur ${weeks.length} semaine(s) : ventes ${money(totV)} − achats ${money(totA)} = <b>${sgnMoney(totV - totA)}</b></p>
    <details style="margin-top:8px"><summary class="muted" style="cursor:pointer">Tableau</summary><table><thead><tr><th>Semaine du</th><th class="r">Ventes nettes</th><th class="r">Achats</th><th class="r">Résultat</th></tr></thead><tbody>${weeks.slice().reverse().map(w => `<tr><td>${fmtDate(w)}</td><td class="r">${money(Wk[w].v)}</td><td class="r">${money(Wk[w].a)}</td><td class="r">${sgnMoney(Wk[w].v - Wk[w].a)}</td></tr>`).join("")}</tbody></table></details>
  </div></section>`;
}
// ---------- Onglet Or : évolution par jour ----------
const ymd = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;   // date locale
function goldSeries(){
  const G = state.gold || {}, who = Object.keys(G).sort((a,b) => a==="Banque de guilde" ? 1 : b==="Banque de guilde" ? -1 : a.localeCompare(b));
  const all = [...new Set(who.flatMap(w => Object.keys(G[w])))].sort();
  if (!all.length) return null;
  const days = []; for (let d = new Date(all[0]+"T00:00:00"), end = new Date(today()+"T00:00:00"); d <= end; d.setDate(d.getDate()+1)) days.push(ymd(d));
  const last = {}, VH = state.valueHist || {}; let lastV = null;
  const sales = {}; (state.trades||[]).forEach(x => { const d = ymd(new Date(x.t*1000)); const e = sales[d] = sales[d] || {v:0, a:0}; if (x.k==="V") e.v += x.c*(1-state.settings.cut); else if (x.k==="A") e.a += x.c; });
  const rows = days.map(d => { const per = {};
    who.forEach(w => { if (G[w][d]!==undefined) last[w] = G[w][d]; if (last[w]!==undefined) per[w] = last[w]; });   // dernier montant connu
    if (VH[d]!==undefined) lastV = VH[d];
    const total = Object.values(per).reduce((a,b) => a+b, 0);
    return {d, per, total, stock: lastV, wealth: lastV!==null ? total + lastV : null, sold:(sales[d]||{}).v||0, bought:(sales[d]||{}).a||0}; });
  rows.forEach((r, i) => r.delta = i ? r.total - rows[i-1].total : null);
  return {who, rows};
}
// Tuile « Or détenu » de la tour de contrôle : total + évolution sur 7 jours (ou depuis le premier relevé)
function goldTile(){
  const GS = goldSeries();
  if (!GS) return `<a class="kpi" href="#finances" style="text-decoration:none;color:inherit"><div class="v muted">—</div><div class="l">or détenu (en attente du premier export)</div></a>`;
  const R = GS.rows, cur = R[R.length-1], n = Math.min(7, R.length-1), ref = n ? R[R.length-1-n].total : null, d = ref===null ? null : cur.total - ref;
  const trend = d===null ? "" : `<div style="font-size:14px;margin-top:2px;color:var(--${d>0?"ok":d<0?"bad":"muted"})">${d>0?"▲":d<0?"▼":"■"} ${d<0?"−":d>0?"+":""}${money(Math.abs(d))} <span class="muted">sur ${n} j${ref ? ` (${d>=0?"+":"−"}${pct(Math.abs(d)/ref)})` : ""}</span></div>`;
  return `<a class="kpi" href="#finances" style="text-decoration:none;color:inherit" title="Voir l'onglet Finances"><div class="v">${money(cur.total)}</div>${trend}<div class="l">or détenu (persos + banque de guilde)</div></a>`;
}
views.finances = () => {
  const GS = goldSeries();
  if (!GS) return `<h1>Finances</h1><div class="tw empty">Aucun relevé d'or : il faut l'addon 1.8.0 ou plus. L'or de chaque perso est relevé à la connexion, à chaque changement et à la déconnexion ; celui de la banque de guilde à son ouverture. Faites ensuite un export.</div>${resultBlock()}`;
  const R = GS.rows, cur = R[R.length-1], V = R.slice(-60);
  const at = n => R.length > n ? R[R.length-1-n].total : null;
  const dlt = n => { const p = at(n); return p===null ? null : cur.total - p; };
  const w0 = dlt(7), w1 = at(14)!==null ? at(7) - at(14) : null, avg7 = w0===null ? null : w0/7;
  const vs = w0!==null && w1!==null && w1>0 ? (w0-w1)/w1 : null;
  const tone = w0===null ? "" : w0>=0 ? "ok" : "bad";
  const mini = (v, l, signed) => `<div class="fmini"><div class="v">${v===null ? "—" : signed ? sgnMoney(v) : money(v)}</div><div class="l">${l}</div></div>`;
  const sum30 = k => R.slice(-30).reduce((a,r) => a + r[k], 0);
  const palette = ["var(--gold)", "var(--silver)", "var(--info)", "var(--ok)", "var(--warn)"];
  const per = GS.who.map(w => ({w, v: cur.per[w] ?? 0, p7: R.length > 7 ? (R[R.length-8].per[w] ?? null) : null}));
  return `
  <h1>Finances</h1>
  <p class="lede">Or de chaque perso et de la banque de guilde par jour (dernier montant connu, reporté les jours sans connexion). Patrimoine = or + valeur du stock de composants au prix HV. Ventes et achats HV relevés par Gringotts.</p>
  <div class="fhero">
    <div class="fcard ${tone}">
      <div class="l">Or gagné sur 7 jours</div>
      <div class="big">${w0===null ? "—" : sgnMoney(w0)}</div>
      <div class="sub">${avg7===null ? "" : `soit ${sgnMoney(avg7)} par jour`}${vs===null ? "" : ` · <span style="color:var(--${vs>=0?"ok":"bad"})">${vs>=0?"▲":"▼"} ${pct(Math.abs(vs))}</span> vs semaine précédente`}</div>
    </div>
    <div class="fminis">
      ${mini(cur.total, "or total aujourd'hui")}
      ${mini(cur.wealth, "patrimoine (or + stock)")}
      ${mini(dlt(1), "variation sur 1 jour", true)}
      ${dlt(30)!==null ? mini(dlt(30), "variation sur 30 jours", true) : mini(R.length>1 ? cur.total - R[0].total : null, `variation depuis le 1er relevé (${R.length-1} j)`, true)}
      ${mini(sum30("sold"), "ventes HV nettes, 30 j")}
      ${mini(sum30("bought"), "achats HV, 30 j")}
    </div>
  </div>
  <div class="fgrid2">
    <section><h2>Gain d'or par jour</h2>
    <div class="tw" style="padding:10px 14px">
      <div class="fleg">${legendDot("var(--ok)","Gain")}${legendDot("var(--bad)","Perte")}${legendDot("var(--gold)","Moyenne 7 j",true)}<span class="muted">${V.length} derniers jours · survol pour le détail</span></div>
      ${gainChart(V, 480)}
    </div></section>
    ${resultBlock(480, false)}
  </div>
  <div class="fgrid2">
    <section><h2>Or détenu</h2><div class="tw" style="padding:10px 14px">
      <div class="fleg">${legendDot("var(--gold)","Or total (persos + banque de guilde)",true)}</div>
      ${lineChart(V, "total", "var(--gold)", r => `${fmtDate(r.d)}\nOr : ${r.total.toFixed(2)} po${r.delta!==null ? `\nVariation : ${r.delta>=0?"+":""}${r.delta.toFixed(2)} po` : ""}`, "Or total par jour", 480)}
    </div></section>
    <section><h2>Patrimoine</h2><div class="tw" style="padding:10px 14px">
      <div class="fleg">${legendDot("var(--silver)","Or + valeur du stock de composants",true)}</div>
      ${lineChart(V, "wealth", "var(--silver)", r => `${fmtDate(r.d)}\nPatrimoine : ${r.wealth.toFixed(2)} po\ndont stock : ${(r.wealth-r.total).toFixed(2)} po`, "Patrimoine par jour", 480)}
    </div></section>
  </div>
  <h2>Répartition par perso</h2>
  <div class="tw" style="padding:10px 14px">
    <div class="fsplit" role="img" aria-label="Répartition de l'or par perso">${per.map((p,i) => p.v>0 ? `<span style="width:${(p.v/cur.total*100).toFixed(2)}%;background:${palette[i%palette.length]}" title="${esc(p.w)} : ${p.v.toFixed(2)} po"></span>` : "").join("")}</div>
    <table class="fper"><thead><tr><th>Perso</th><th class="r">Or</th><th class="r">Part</th><th class="r">Variation 7 j</th></tr></thead><tbody>
    ${per.map((p,i) => `<tr><td><span class="fdot" style="background:${palette[i%palette.length]}"></span>${esc(p.w)}</td><td class="r">${money(p.v)}</td><td class="r">${pct(cur.total ? p.v/cur.total : null)}</td><td class="r">${p.p7===null ? "—" : sgnMoney(p.v-p.p7)}</td></tr>`).join("")}
    </tbody></table>
  </div>
  <h2>Explication des variations, jour par jour</h2>
  <p class="muted" style="margin:-4px 0 8px">Ventes nettes de taxe et achats HV relevés par Gringotts ; le reste (butin, quêtes, réparations, PNJ, formateurs…) est dans « Autres ».</p>
  <div class="tw scroll" style="max-height:440px"><table><thead><tr><th>Jour</th><th class="r">Or total</th><th class="r">Variation</th><th class="r">Ventes HV</th><th class="r">Achats HV</th><th class="r">Autres</th></tr></thead><tbody>
  ${R.slice().reverse().slice(0,60).map(r => { const other = r.delta===null ? null : r.delta - r.sold + r.bought;
    return `<tr><td>${fmtDate(r.d)}</td><td class="r">${money(r.total)}</td><td class="r">${r.delta===null ? "—" : sgnMoney(r.delta)}</td><td class="r">${r.sold ? money(r.sold) : "—"}</td><td class="r">${r.bought ? money(r.bought) : "—"}</td><td class="r">${other===null ? "—" : sgnMoney(other)}</td></tr>`; }).join("")}
  </tbody></table></div>`;
};
views.or = views.finances;   // ancien lien #or
// ---------- « Envoyer au jeu » : décisions du dashboard pour l'addon (/gt import) ----------
const cu = v => Math.round((v||0)*10000);
function gameText(){
  const L = [`GTI1;${Math.floor(Date.now()/1000)};2`];
  const rows = [...M.comps, ...M.pnjRows];
  Object.values(M.reserve).filter(e => e.net > 0).forEach(e => L.push(`R;${e.n};${e.net}`));
  rows.forEach(c => { if (c.target || c.toBuy) L.push(`C;${c.n};${c.target||0};${c.toBuy||0}`); });
  M.comps.forEach(c => { const mx = c.med ?? c.cur; if (mx) L.push(`M;${c.n};${cu(mx)}`); });
  M.crafts.forEach(c => { if (c.net!==null) L.push(`N;${c.out};${cu(c.net)};${c.roi!==null ? Math.round(c.roi*100) : ""}`); });
  M.comps.filter(c => c.toBuy > 0).forEach(c => { const mx = c.med ?? c.cur; L.push(`B;${c.n};${c.toBuy};${mx ? cu(mx) : ""}`); });
  // Prix plancher par unité vendue : coût du craft ÷ quantité ÷ (1 − taxe HV)
  M.crafts.forEach(c => { if (c.cost) L.push(`F;${c.out};${cu(c.cost / (ALL_CRAFTS().find(x => x.n===c.n)?.qty || 1) / (1 - state.settings.cut))}`); });
  logistics().moves.forEach(m => L.push(`LG;${m.from};${m.to};${m.n};${m.q}`));
  return L.join("\n");
}
function gameBox(){
  return `<div class="note"><p style="margin:0 0 8px">En jeu : <code>/gt import</code>, collez ce texte, puis « Importer ». Contenu : composants réservés (contour rouge), cibles et achats, prix d'achat max, marges et prix plancher (infobulle), envois entre persos, liste Auctionator « Gringotts - Réassort ».</p>
    <div class="copybox"><textarea id="gameTxt" readonly></textarea><button class="btn" data-copy="gameTxt">Copier</button></div></div>`;
}
let pending = null, pendingAddon = null;
// ---------- Logistique : ce que chaque perso doit envoyer au perso qui craft ----------
function logistics(){
  const SB = state.stockBy, GS = state.guildStock || {};
  if (!SB) return {moves:[], need:[], ok:false};
  const jobOfCraft = n => (ALL_RECIPES().find(r => norm(r.n)===norm(n)) || {}).job;
  const need = {};   // perso -> {clé: {n, q}}
  const add = (who, n, q) => { if (!who || !q) return; const k = norm(n); const t = need[who] = need[who] || {}; t[k] = t[k] || {n, q:0}; t[k].q += q; };
  M.crafts.filter(c => c.act==="craft" && c.net > 0 && c.possible > 0).forEach(c => {
    const who = (skillOf(jobOfCraft(c.n)) || {}).char; c.lines.forEach(l => add(who, l.n, l.q * c.possible)); });
  Object.values(M.plans).forEach(pl => { if (!pl.cur) return; const who = (skillOf(pl.job) || {}).char;
    pl.cur.chosen.parts.forEach(pt => pt.r.forEach(([n,q]) => add(who, n, q * pt.crafts))); });
  const moves = [], short = [];
  Object.entries(need).forEach(([who, items]) => Object.entries(items).forEach(([k, it]) => {
    let miss = it.q - ((SB[who]||{})[k] || 0); if (miss <= 0) return;
    const src = Object.entries(SB).filter(([c]) => c !== who).map(([c, st]) => [c, st[k]||0]).filter(x => x[1] > 0).sort((a,b) => b[1]-a[1]);
    if (GS[k]) src.push(["Guilde", GS[k]]);
    for (const [from, have] of src) { if (miss <= 0) break; const q = Math.min(have, miss); moves.push({from, to:who, n:it.n, q}); miss -= q; }
    if (miss > 0) short.push({to:who, n:it.n, q:miss});
  }));
  return {moves, short, ok:true};
}
// ---------- Rapport de décisions (étape 3 de la session) ----------
let decOpen = null;   // tuile de décision ouverte (étape 3)
// Composants des recettes rentables dont le prix s'écarte de la médiane 30 j d'au moins le seuil du signal d'achat
function priceWatch(){
  const used = new Set(); M.crafts.filter(c => c.learned && c.st==="ok").forEach(c => c.lines.forEach(l => used.add(norm(l.n))));
  const rows = M.comps.filter(c => c.delta!==null && used.has(norm(c.n)) && (c.sig==="ok" || c.sig==="bad")).sort((a,b) => Math.abs(b.delta) - Math.abs(a.delta));
  return {rows, low: rows.filter(c => c.sig==="ok"), high: rows.filter(c => c.sig==="bad")};
}
function decisionBlocks(){
  const S = state.settings, nowS = Date.now()/1000;
  const T = [];   // blocs du rapport : rendus en tuiles cliquables
  const sec = (prio, title, n, body, link) => { T.push({prio, title, n, body, link}); return ""; };
  const tbl = (head, rows) => `<table><thead><tr>${head.map(h => `<th${h.startsWith(">") ? ' class="r"' : ""}>${h.replace(/^>/,"")}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table>`;
  const cr = M.crafts;

  // 1. Données à corriger : prix manquants (agrégés par objet), recettes inconnues, place
  const miss = {}; cr.forEach(c => { c.lines.filter(l => l.p===null).forEach(l => { (miss[l.n] = miss[l.n] || new Set()).add(c.n); });
    if (c.gross===null) (miss[c.out] = miss[c.out] || new Set()).add(c.n+" (vente)"); });
  const missL = Object.entries(miss).sort((a,b) => b[1].size - a[1].size);
  const unk = Object.values(state.unknownRecipes||{}).flat();
  const staleL = M.comps.filter(c => c.used && c.stale!==null).sort((a,b) => b.stale - a.stale);
  const overSlots = M.slotsUsed > S.slots;
  const fixN = missL.length + unk.length + staleL.length + (overSlots ? 1 : 0);
  const fixBody = [
    missL.length ? `<p style="margin:0 0 4px"><b>Prix manquants</b> : rechercher l'objet à l'HV avec Auctionator, puis refaire un export (les prix marchands PNJ sont relevés automatiquement).</p>` +
      tbl(["Objet", ">Recettes bloquées"], missL.slice(0,10).map(([n, set]) => `<tr><td>${esc(n)}</td><td class="r" title="${esc([...set].join(", "))}">${set.size}</td></tr>`)) + (missL.length>10 ? `<p class="muted">… et ${missL.length-10} autres.</p>` : "") : "",
    staleL.length ? `<p style="margin:10px 0 4px"><b>Prix anciens</b> (&gt; ${S.staleDays} j) : rechercher ces objets avant de décider sur leurs marges.</p><p class="muted" style="margin:0">${staleL.slice(0,15).map(c => `${esc(c.n)} (${c.stale} j)`).join(", ")}${staleL.length>15 ? "…" : ""}</p>` : "",
    unk.length ? `<p style="margin:10px 0 4px"><b>Recettes inconnues</b> à me transmettre : ${unk.slice(0,10).map(esc).join(", ")}${unk.length>10 ? "…" : ""}</p>` : "",
    overSlots ? `<p style="margin:10px 0 0"><b>Place dépassée</b> : ${M.slotsUsed} / ${S.slots} emplacements. Baisser des cibles ou la profondeur dans Réglages.</p>` : ""
  ].join("");

  // 2. Temps de recharge prêts
  const cds = (state.cds||[]).map(c => { const x = cr.find(k => norm(k.n)===norm(c.n)); return {...c, left: c.r - nowS, net: x ? x.net : null}; }).filter(c => c.left <= 0);

  // 3. Produire (rentable + stock) : bénéfice total possible
  const prod = cr.filter(c => c.act==="craft" && c.net > 0).map(c => ({...c, tot: c.net * c.possible})).sort((a,b) => b.tot - a.tot);
  // 4. Acheter : réassort + opportunités sous la médiane
  const buy = M.comps.filter(c => c.used && c.toBuy > 0).sort((a,b) => (b.refill||0) - (a.refill||0));
  const refill = buy.reduce((a,c) => a + (c.refill||0), 0);
  const opp = M.comps.filter(c => c.used && c.sig==="ok").sort((a,b) => a.delta - b.delta);
  const dear = buy.filter(c => c.sig==="bad");
  // 5. Arrêter / vendre les compos
  const loss = cr.filter(c => c.act==="sell").sort((a,b) => a.net - b.net);
  const slow = cr.filter(c => c.sales && c.sales.exp > c.sales.sold);
  // 6. Montée
  const plans = Object.values(M.plans).filter(pl => pl.cur && pl.known);
  const msSoon = plans.flatMap(pl => pl.ms.filter(m => m.open && m.at - pl.lvl <= 10).map(m => ({job: pl.job, ...m})));

  void `
  ${sec("bad", "À corriger avant de décider", fixN, fixBody, "stock")}
  ${sec("ok", "Temps de recharge prêts", cds.length, tbl(["Perso","Recette",">Bénéfice net"], cds.map(c => `<tr><td>${esc(c.char)}</td><td>${esc(c.n)}</td><td class="r">${c.net!==null ? money(c.net) : "—"}</td></tr>`)))}
  ${sec("ok", "Produire (rentable, composants en stock)", prod.length,
     tbl(["Recette",">Faisables",">Pour la cible",">Net / craft",">Net total","Vendre"], prod.slice(0,10).map(c => `<tr class="click" data-craft="${esc(c.n)}"><td>${esc(c.n)}${c.flags.length ? ` <span title="${esc(c.flags.join(" · "))}" style="color:var(--warn)">⚠</span>` : ""}</td><td class="r">${c.possible}</td><td class="r">${(() => { const pr = M.prodRows.find(p => p.recipe===c.n); return pr ? pr.toCraft : `<span class="muted" title="Pas de ventes relevées">—</span>`; })()}</td><td class="r">${money(c.net)}</td><td class="r">${money(c.tot)}</td><td>${c.toVendor ? `<span class="st info">Marchand</span>` : dayCell(c.dayLbl)}</td></tr>`)) +
     `<p class="muted" style="margin:6px 0 0">Bénéfice total si tout est produit et vendu : <b>${money(prod.reduce((a,c) => a + c.tot, 0))}</b>.</p>`, "crafts")}
  ${(() => { const LG = logistics(); return sec("info", "Envois entre persos", LG.moves.length,
     !LG.ok ? `<span class="muted">Stock par perso inconnu : il faut l'addon ${MIN_ADDON} ou plus.</span>` :
     tbl(["De","À","Objet",">Qté"], LG.moves.map(m => `<tr><td>${esc(m.from)}</td><td>${esc(m.to)}</td><td>${esc(m.n)}</td><td class="r">${m.q}</td></tr>`)) +
     `<p class="muted" style="margin:6px 0 0">Composants nécessaires au perso qui craft (crafts à produire + étape de montée en cours). Après l'étape 4 : bouton « Gringotts : préparer l'envoi » à la boîte aux lettres du perso expéditeur ; rappel des retraits à l'ouverture de la banque de guilde.${LG.short.length ? ` Manquants partout (à acheter) : ${LG.short.slice(0,8).map(x => `${esc(x.n)} ×${x.q}`).join(", ")}.` : ""}</p>`); })()}
  ${sec("info", "Acheter", buy.length + opp.filter(c => !c.toBuy).length,
     (buy.length ? `<p style="margin:0 0 4px">Réassort : <b>${buy.length}</b> composants pour <b>${money(refill)}</b> (liste « Gringotts - Réassort » après l'étape 4).${dear.length ? ` <span class="st warn">${dear.length} trop cher(s) : à reporter</span>` : ""}</p>` +
       tbl(["Composant",">Qté",">Prix actuel","Signal",">Coût"], buy.slice(0,10).map(c => `<tr><td>${esc(c.n)}${c.res ? ` <span class="muted">· montée</span>` : ""}</td><td class="r">${c.toBuy}</td><td class="r">${money(c.cur)}</td><td>${stPill(c.sig,c.sigTxt)}</td><td class="r">${money(c.refill)}</td></tr>`)) : "") +
     (opp.length ? `<p style="margin:10px 0 4px"><b>Opportunités</b> (≥ ${pct(S.buyTh)} sous la médiane 30 j) : acheter au-delà de la cible si la place le permet.</p><p class="muted" style="margin:0">${opp.slice(0,10).map(c => `${esc(c.n)} ${pct(c.delta)}`).join(", ")}</p>` : ""), "stock")}
  ${(() => { const W = priceWatch(); return sec("info", "Prix à surveiller", W.rows.length,
     `<p style="margin:0 0 4px">Composants de vos recettes rentables dont le prix s'écarte d'au moins ${pct(S.buyTh)} de la médiane 30 j : <span style="color:var(--ok)">${W.low.length} en baisse</span> (acheter), <span style="color:var(--warn)">${W.high.length} en hausse</span> (reporter ou vendre le stock).</p>` +
     tbl(["Composant",">Prix actuel",">Médiane 30 j",">Écart",">Stock / cible","Lecture"], W.rows.slice(0,15).map(c => `<tr><td>${esc(c.n)}</td><td class="r">${money(c.cur)}</td><td class="r">${money(c.med)}</td><td class="r" style="white-space:nowrap"><span style="color:var(--${c.sig==="ok"?"ok":"warn"})">${c.delta>0?"+":""}${pct(c.delta)}</span></td><td class="r">${c.stock} / ${c.target}</td><td>${c.sig==="ok" ? `<span class="st ok">Acheter</span>` : `<span class="st warn">Reporter</span>`}</td></tr>`)) +
     (W.rows.length>15 ? `<p class="muted" style="margin:6px 0 0">… et ${W.rows.length-15} autres : onglet Stock &amp; achats, filtre « Signal ».</p>` : ""), "stock"); })()}
  ${sec("warn", "Arrêter ou revoir", loss.length + slow.length,
     (loss.length ? `<p style="margin:0 0 4px"><b>Crafts à perte</b> : ne pas produire ; vendre les composants plutôt que le produit.</p>` + tbl(["Recette",">Net / craft"], loss.slice(0,8).map(c => `<tr class="click" data-craft="${esc(c.n)}"><td>${esc(c.n)}</td><td class="r">${money(c.net)}</td></tr>`)) : "") +
     (slow.length ? `<p style="margin:10px 0 4px"><b>Écoulement faible</b> (plus d'expirés que de ventes en 30 j) : produire moins ou baisser le prix.</p>` + tbl(["Produit",">Vendus",">Expirés"], slow.map(c => `<tr><td>${esc(c.out)}</td><td class="r">${c.sales.sold}</td><td class="r">${c.sales.exp}</td></tr>`)) : ""), "crafts")}
  ${sec("info", "Montée des métiers", plans.length,
     tbl(["Métier","Palier","À faire",">Net"], plans.map(pl => `<tr class="click" data-plan="${esc(pl.job)}"><td>${esc(pl.job)} <span class="muted">${pl.known ? pl.lvl : "?"}</span></td><td>${pl.cur.from}→${pl.cur.to}</td><td>${pl.cur.chosen.parts.filter(p => p.crafts).map(p => `${esc(p.n)} ×${p.crafts}`).join(" + ")}${pl.cur.chosen.miss.length ? ` <span class="st warn">prix manquant</span>` : ""}</td><td class="r">${netTxt(pl.cur.chosen.net)}</td></tr>`)) +
     (msSoon.length ? `<p style="margin:8px 0 0">${msSoon.map(m => `⚑ <b>${esc(m.job)} ${m.at}</b> : ${esc(m.lbl)}`).join("<br>")}</p>` : ""), "recettes")}`;
  // Résumés d'une ligne (Tour de contrôle) : repérés par le début du titre
  const LGs = logistics(), pl_ = (n, a, b) => `${n} ${n>1 ? b : a}`;
  const SUM = {
    "À corriger": [missL.length && pl_(missL.length,"prix manquant","prix manquants"), staleL.length && pl_(staleL.length,"prix ancien","prix anciens"), unk.length && pl_(unk.length,"recette inconnue","recettes inconnues"), overSlots && "place dépassée"].filter(Boolean).join(" · "),
    "Temps de recharge": cds.length ? esc(cds[0].n) + (cds.length>1 ? ` et ${cds.length-1} autre${cds.length>2?"s":""}` : "") + " : prêt" : "",
    "Produire": prod.length ? `${esc(prod[0].n)} ×${prod[0].possible}${prod.length>1 ? ` et ${prod.length-1} autre${prod.length>2?"s":""}` : ""} · net total ${money(prod.reduce((a,c) => a + c.tot, 0))}` : "",
    "Envois": LGs.moves.length ? `${esc(LGs.moves[0].from)} → ${esc(LGs.moves[0].to)} : ${LGs.moves[0].q} ${esc(LGs.moves[0].n)}${LGs.moves.length>1 ? ` (+${LGs.moves.length-1})` : ""}` : "",
    "Acheter": `${pl_(buy.length,"composant","composants")} à acheter · ${money(refill)}${opp.length ? ` · ${pl_(opp.length,"opportunité","opportunités")}` : ""}`,
    "Prix à surveiller": (() => { const W = priceWatch(); return W.rows.length ? `${W.low.length} en baisse · ${W.high.length} en hausse (≥ ${pct(S.buyTh)})` : ""; })(),
    "Arrêter": [loss.length && pl_(loss.length,"craft à perte","crafts à perte"), slow.length && `${pl_(slow.length,"produit","produits")} qui s'écoule${slow.length>1?"nt":""} mal`].filter(Boolean).join(" · "),
    "Montée": plans.slice(0,3).map(pl => `${esc(pl.job)} ${pl.cur.from}→${pl.cur.to}`).join(" · "),
  };
  T.forEach(t => { const id = Object.keys(SUM).find(k => t.title.startsWith(k)); t.id = id; t.sum = id ? SUM[id] : ""; });
  return T;
}
// Tuiles : compteur + titre ; un clic ouvre le détail sous la grille, un autre clic le referme ou le remplace
function decisionReport(){
  const T = decisionBlocks();
  return `<div class="dtiles">${T.map((t, i) => `<button class="dtile${decOpen===i ? " on" : ""}" data-dtile="${i}" aria-expanded="${decOpen===i}">
      <span class="st ${t.n ? t.prio : "mute"}">${t.n}</span><span>${t.title}</span></button>`).join("")}</div>
    ${T.map((t, i) => `<div class="tw dpanel" data-dpanel="${i}" style="padding:12px 14px;margin-top:10px${decOpen===i ? "" : ";display:none"}">
      <div style="display:flex;justify-content:space-between;gap:10px;margin-bottom:8px"><b>${t.title}</b>${t.link ? `<a href="#${t.link}" class="muted">ouvrir l'onglet →</a>` : ""}</div>
      ${t.n ? t.body : `<span class="muted">Rien à faire.</span>`}</div>`).join("")}`;
}
const stepH = (n, t) => `<h2 style="display:flex;align-items:center;gap:10px"><span style="display:inline-grid;place-items:center;width:26px;height:26px;border-radius:50%;background:var(--gold);color:var(--bg);font-size:14px">${n}</span>${t}</h2>`;
views.import = () => { const toBuyN = M.comps.filter(c => c.used && c.toBuy > 0).length; return `
  <h1>Comptoir <span class="muted" style="font-size:.6em;font-weight:400">· Routine de session</span></h1>
  <p class="lede">Routine du jour, dans l'ordre : envoi des données et des prix → synchro → décisions → fichier pour le jeu → jouer. Le jeu doit être fermé (ou le dernier perso déconnecté) au moment de l'envoi : l'addon écrit les données à la déconnexion, le dernier perso déconnecté exporte tous les persos (addon 1.12.5 ou plus). Aucune commande en jeu.</p>

  <div class="impgrid">
  <div class="impcol">
  ${stepH(1, "Bureau : Envoyer.bat")}
  <p class="muted" style="margin-top:0">Double-clique <b>Envoyer.bat</b> (stock, or, recettes, niveaux et ventes de ta dernière session, tous persos), chiffré vers GitHub. « Export inchangé » = rien de nouveau depuis le dernier envoi. Les <b>prix de l'HV</b> sont récupérés automatiquement par GitHub à <b>8 h, 12 h et 19 h</b> (heure de Paris), sans PC allumé. Pour les avoir tout de suite : bouton <b>⟳ Prix HV</b> du menu (jeton GitHub à enregistrer dans Réglages). <b>Routine.bat</b> / <b>Prix-API.bat</b> restent un secours manuel.</p>

  ${stepH(2, "Dashboard : synchroniser")}
  <p class="muted" style="margin-top:0">Le bouton <b>↻ Synchroniser</b> (menu de gauche) récupère le dernier export (stock total, recettes, niveaux, ventes, or, temps de recharge) et les derniers prix API. Il se lance aussi tout seul à l'ouverture. Vérifie que l'heure de l'export ci-dessous est celle de ta dernière session.</p>
  ${(() => { const c = readSync(); return c.report ? `<details open><summary>Dernier export reçu (synchronisation du ${new Date(c.lastOk).toLocaleString("fr-FR")})</summary>${c.report}</details>` : `<div class="note">Aucun export reçu par synchronisation sur cet appareil.</div>`; })()}
  ${state.apiLast ? `<div class="note ok">Prix API (HV ${esc(state.apiLast.ah)}) : ${state.apiLast.n} prix du ${new Date(state.apiLast.t*1000).toLocaleString("fr-FR")}.</div>` : `<div class="note">Aucun prix API reçu : attends le prochain passage (8 h / 12 h / 19 h) ou lance <b>Prix-API.bat</b> sur le PC.</div>`}
  <details style="margin-top:8px"><summary class="muted" style="cursor:pointer">Secours : coller un export à la main (<code>/gt export</code> ou CSV Auctionator)</summary>
  <textarea id="impText" placeholder="WFC1;…  (export Gringotts)"></textarea>
  <div class="toolbar" style="margin-top:10px"><button class="btn" id="impParse">Analyser</button><button class="btn primary" id="impApply" disabled>Enregistrer les prix du ${fmtDate(today())}</button></div>
  <div id="impOut"></div></details>

  </div>
  <div class="impcol">
  ${stepH(3, "Décider")}
  <p class="muted" style="margin-top:0">Rapport du dernier import, par priorité : cliquez une tuile pour son détail. Les corrections (cibles, stocks) se font dans <a href="#stock">Stock &amp; achats</a> et changent le fichier de l'étape 4.</p>
  ${histNote()}${decisionReport()}

  ${stepH(4, "Fichier pour le jeu : Dash.lua")}
  <p class="muted" style="margin-top:0">Clique <b>Télécharger Dash.lua</b>. Avec <b>Appliquer-Auto.bat</b> (à lancer une seule fois), le fichier est copié dans l'addon en 2 secondes ; sans lui, lance <b>Appliquer.bat</b> après le téléchargement. Le jeu lit le fichier à la connexion : <b>plus de <code>/reload</code></b> si le jeu était fermé (s'il tournait déjà, <code>/reload</code> sur le perso en cours). Le chat affiche « Décisions du dashboard détectées… ». Contour rouge sur les composants réservés, infobulle (stock, cible, prix max, marge, ventes) et liste Auctionator « Gringotts - Réassort » créées automatiquement.</p>
  <div class="toolbar"><button class="btn primary" id="dashDl" title="Télécharge Dash.lua ; Appliquer-Auto.bat (ou Appliquer.bat) le copie dans Interface\\AddOns\\Gringotts">Télécharger Dash.lua</button></div>
  <details style="margin-top:8px"><summary class="muted" style="cursor:pointer">Secours : texte à coller en jeu (<code>/gt import</code>)</summary>
    <div class="toolbar" style="margin-top:8px">${CAN_FS ? `<button class="btn" id="dashBtn" title="Écriture directe dans le dossier de l'addon : refusée par Chrome si WoW est dans Program Files">→ Envoyer à l'addon (si Chrome accepte le dossier)</button>` : ""}<button class="btn" id="gameBtn">Générer le texte pour le jeu</button></div>
    <div id="gameOut"></div></details>

  ${stepH(5, "Jouer : achats, crafts, ventes")}
  <p class="muted" style="margin-top:0">Se connecter, rechercher « Gringotts - Réassort » dans Auctionator (${toBuyN} composant${toBuyN>1?"s":""} à acheter), crafter, mettre en vente. Ouvrir les <b>fenêtres de métier</b> (recettes, temps de recharge, niveaux), la <b>banque</b>, la <b>banque de guilde</b> et la <b>boîte aux lettres</b> pour qu'elles soient relevées ; attendre environ une minute après la connexion avant de se déconnecter. Ce que tu gagnes après ta déconnexion sera dans la routine suivante. Un perso sans changement reste déconnecté.</p>
  <details><summary class="muted" style="cursor:pointer">Secours : l'addon ne crée pas la liste « Gringotts - Réassort »</summary>
    <div class="toolbar" style="margin-top:8px"><button class="btn" id="shopBtn"${toBuyN?"":" disabled"}>Générer la liste du réassort (${toBuyN})</button></div>
    <div id="shopOut"></div></details>
  <details style="margin-top:8px"><summary class="muted" style="cursor:pointer">Secours : l'addon ne crée pas la liste « Gringotts - Suivi » (${trackList().length} objets)</summary>
    <div class="toolbar" style="margin-top:8px"><button class="btn" id="trackBtn">Générer la liste de suivi</button></div>
    <div id="trackOut"></div></details>

  </div>
  </div>
  <details class="impmore"><summary class="muted" style="cursor:pointer">Historique des imports et remise à zéro</summary>
  <h2>Historique des imports</h2>
  ${Object.keys(state.imports).length ? `<div class="tw"><table><thead><tr><th>Date</th><th class="r">Articles</th><th></th></tr></thead><tbody>
  ${Object.keys(state.imports).sort().reverse().map(d=>`<tr><td>${fmtDate(d)}${(state.compacted||{})[d] ? ` <span class="st mute" title="Médiane des relevés de la semaine de reset (historique ancien regroupé)">semaine</span>` : ""}</td><td class="r">${Object.keys(state.imports[d]).length}</td><td class="r"><button class="btn" data-delimp="${d}">Supprimer</button></td></tr>`).join("")}
  </tbody></table></div>` : `<div class="tw empty">${state.priceReset ? "Aucun prix enregistré. Collez votre premier export à l'étape 2 (secours)." : `Aucun import pour l'instant : les prix affichés sont les données de test du classeur (${SEED.dates.length} jours, jusqu'au ${fmtDate(SEED.dates[SEED.dates.length-1])}).`}</div>`}
  <h2>Repartir de zéro</h2>
  ${state.priceReset
    ? `<div class="note ok">Historique remis à zéro : seuls vos imports comptent. Les prix PNJ restent appliqués.</div>
`
    : `<div class="note warn">Les prix actuels et leur historique sont des données de test. Le jour du lancement, effacez-les pour que marges, médianes et jours recommandés ne reposent que sur vos scans. Les recettes apprises, réglages et prix PNJ sont conservés.</div>
       <div class="toolbar"><label><input type="checkbox" id="rstStock" checked> Remettre aussi tous les stocks à 0</label>
       <button class="btn" id="priceReset" style="color:var(--bad);border-color:var(--bad)">Effacer l'historique des prix</button></div>`}
  </details>`; };

views.reglages = () => { const S = state.settings; return `
  <h1>Réglages</h1>
  <p class="lede">Ces paramètres s'appliquent à tous les calculs.</p>
  <div class="tw"><table><tbody>
    <tr><td>Taxe HV</td><td><input class="num" type="number" step="0.5" min="0" max="50" data-set="cut" data-pct value="${(S.cut*100).toFixed(1)}"> %</td><td class="muted">Commission prélevée sur chaque vente.</td></tr>
    <tr><td>Gain minimal du Top 5</td><td><input class="num" type="number" step="0.5" min="0" data-set="minNet" value="${S.minNet ?? 1}"> po</td><td class="muted">Les crafts et enchantements qui rapportent moins par unité sont exclus du Top 5 de la Tour de contrôle (évite les recettes de bas niveau à ROI énorme).</td></tr>
    <tr><td>Seuil « rentable »</td><td><input class="num" type="number" step="1" min="0" data-set="roiOk" data-pct value="${(S.roiOk*100).toFixed(0)}"> %</td><td class="muted">ROI minimal pour le vert. Entre 0 et ce seuil : orange. Négatif : rouge.</td></tr>
    <tr><td>Prix de vente retenu</td><td><select data-set="basis">${[["prudent","Le plus bas (actuel / médiane)"],["actuel","Prix actuel"],["mediane","Médiane 30 j"]].map(([v,l])=>`<option value="${v}"${S.basis===v?" selected":""}>${l}</option>`).join("")}</select></td><td class="muted">« Le plus bas » évite de surestimer une marge sur un prix gonflé.</td></tr>
    <tr><td>Signal d'achat</td><td><input class="num" type="number" step="1" min="1" data-set="buyTh" data-pct value="${(S.buyTh*100).toFixed(0)}"> %</td><td class="muted">Écart à la médiane 30 j pour « Acheter » ou « Trop cher ».</td></tr>
    <tr><td>Faction</td><td><select data-set="faction">${["Alliance","Horde"].map(v=>`<option${S.faction===v?" selected":""}>${v}</option>`).join("")}</select></td><td class="muted">Exclut les recettes et voies de montée de l'autre faction.</td></tr>
    <tr><td>Prix ancien au-delà de</td><td><input class="num" type="number" step="1" min="1" data-set="staleDays" value="${S.staleDays}"> jours</td><td class="muted">Âge du dernier relevé Auctionator d'un objet ; signalé dans Crafts, Stock et la tour de contrôle.</td></tr>
    <tr><td>Place pour les composants</td><td><input class="num" type="number" step="10" min="10" data-set="slots" value="${S.slots}"> empl.</td><td class="muted">Sacs + banques + banque de guilde. Les cibles auto sont réduites (PNJ, puis crafts, farm, HV) pour tenir dedans.</td></tr>
    <tr><td>Semaines minimum pour le « meilleur jour »</td><td><input class="num" type="number" step="1" min="1" max="12" data-set="minWeeks" value="${S.minWeeks||3}"> sem.</td><td class="muted">Sous ce nombre de semaines complètes (mercredi → mardi), aucun jour n'est recommandé : le profil n'est pas fiable.</td></tr>
    <tr><td>Historique de prix détaillé</td><td><input class="num" type="number" step="10" min="30" max="365" data-set="keepDays" value="${S.keepDays||90}"> jours</td><td class="muted">Au-delà, les imports quotidiens sont regroupés en un point par semaine (médiane) : la médiane 30 j et le meilleur jour ne changent pas, le stockage reste petit.</td></tr>
    <tr><td>Horizon de ventes</td><td><input class="num" type="number" step="1" min="1" data-set="horizon" value="${S.horizon||7}"> jours</td><td class="muted">Jours de ventes couverts par le stock (crafts qui se vendent : ventes/jour sur 30 j × horizon).</td></tr>
    <tr><td>Profondeur de stock</td><td><input class="num" type="number" step="5" min="1" data-set="depth" value="${S.depth}"> crafts</td><td class="muted">Crafts sans historique de ventes : composants pour la moitié de cette profondeur. Sert aussi aux enchantements.</td></tr>
    <tr><td>Facteur PNJ</td><td><input class="num" type="number" step="5" min="0" data-set="fPnj" data-pct value="${(S.fPnj*100).toFixed(0)}"> %</td><td class="muted">Fournitures achetées à la demande.</td></tr>
    <tr><td>Facteur craft</td><td><input class="num" type="number" step="5" min="0" data-set="fCraft" data-pct value="${(S.fCraft*100).toFixed(0)}"> %</td><td class="muted">Intermédiaires que vous fabriquez (barres, huiles…).</td></tr>
    <tr><td>Facteur farm</td><td><input class="num" type="number" step="5" min="0" data-set="fFarm" data-pct value="${(S.fFarm*100).toFixed(0)}"> %</td><td class="muted">Herbes, minerais, peaux, viandes, poissons récoltés par vos persos.</td></tr>
    <tr><td>Facteur HV / rare</td><td><input class="num" type="number" step="5" min="0" data-set="fHv" data-pct value="${(S.fHv*100).toFixed(0)}"> %</td><td class="muted">Poussières, essences, éclats, éléments, perles, lotus noir…</td></tr>
    <tr><td>Marge des enchantements</td><td><input class="num" type="number" step="1" min="0" data-set="enchMarkup" data-pct value="${(S.enchMarkup*100).toFixed(0)}"> %</td><td class="muted">Prix de vente = coût des compos HV + cette marge.</td></tr>
    <tr><td>Arrondi des enchantements</td><td><select data-set="enchRound">${[["or","À l'or supérieur"],["aucun","Aucun"]].map(([v,l])=>`<option value="${v}"${S.enchRound===v?" selected":""}>${l}</option>`).join("")}</select></td><td class="muted">L'arrondi à l'or met les petits enchantements à 1 po minimum.</td></tr>
  </tbody></table></div>
  <h2>Tailles de pile</h2>
  <div class="tw"><table><tbody>${STACK_GROUPS.map(([g,l,d]) => `<tr><td>${esc(l)}</td><td><input class="num" type="number" step="1" min="1" data-stack="${g}" value="${(S.stacks||{})[g] || d}"></td><td class="muted">Défaut Classic : ${d}</td></tr>`).join("")}</tbody></table></div>
  <div class="toolbar" style="margin-top:10px"><button class="btn" id="targetsReset">Revenir aux cibles auto (${Object.keys(state.target).length} manuelle(s))</button></div>
  <h2>Rafraîchir les prix à la demande</h2>
  <p class="muted">Le bouton « ⟳ Prix HV » (menu de gauche) lance la récupération des prix sur GitHub sans attendre 8 h / 12 h / 19 h. Il demande un jeton GitHub « fine-grained » limité à ce dépôt, avec la seule permission <b>Actions : Read and write</b> (GitHub → Settings → Developer settings → Fine-grained tokens). Le jeton reste sur cet appareil.</p>
  <div class="toolbar"><input type="password" id="ghTok" placeholder="${ghTok() ? "Jeton enregistré (••••)" : "github_pat_…"}" autocomplete="off" style="min-width:260px"><button class="btn" id="ghTokSave">Enregistrer</button>${ghTok() ? `<button class="btn" id="ghTokDel">Supprimer le jeton</button>` : ""}</div>
  <h2>Sauvegarde</h2>
  <p class="muted">Vos données sont enregistrées sur cet appareil. Le bouton « Synchroniser » (menu de gauche) les met à jour depuis le jeu ; une sauvegarde permet de les transférer.</p>
  <div class="toolbar"><button class="btn" id="bkExport">Exporter une sauvegarde</button><button class="btn" id="bkShow">Restaurer une sauvegarde</button><button class="btn" id="resetData" style="color:var(--bad)" title="Efface prix (y compris ceux de test), stocks, recettes apprises, niveaux, or et ventes : tableau vierge. Garde les réglages et les frais de dépôt mesurés.">Réinitialiser mes données</button><button class="btn" id="reset" style="color:var(--bad)" title="Retour à l'état d'origine : réglages effacés, prix et stocks de test du 29/10 remis">Tout effacer</button></div>
  <div id="bkOut"></div>`; };

// ===================== Vue smartphone (≤ 700 px) : résumé simplifié, sans toucher à l'affichage PC =====================
const MOBQ = window.matchMedia("(max-width:700px)");
const deskForced = () => { try { return localStorage.getItem("gringotts-desk")==="1"; } catch(e) { return false; } };
const mobOn = () => MOBQ.matches && !deskForced();
let mobTab = "resume", mobCraft = "ok", mobStock = "buy";
function openGold(){
  const GS = goldSeries(); if (!GS) return;
  const R = GS.rows, cur = R[R.length-1], at = n => R.length > n ? R[R.length-1-n].total : null;
  const dl = n => { const p = at(n); return p===null ? null : cur.total - p; };
  const sg = d => d===null ? `<span class="muted">—</span>` : `<b style="color:var(--${d>0?"ok":d<0?"bad":"muted"})">${d>0?"+":d<0?"−":""}${money(Math.abs(d))}</b>`;
  const fd = d => new Date(d+"T00:00:00").toLocaleDateString("fr-FR", {day:"2-digit", month:"2-digit"});
  const tot = (k) => R.slice(-14).reduce((a,r) => a + (r[k]||0), 0);
  openDrawer(`<h3>Suivi des finances</h3>
    <div class="kpis" style="grid-template-columns:repeat(3,1fr);margin-bottom:12px"><div class="kpi"><div class="v" style="font-size:18px">${sg(dl(1))}</div><div class="l">24 h</div></div><div class="kpi"><div class="v" style="font-size:18px">${sg(dl(7))}</div><div class="l">7 jours</div></div><div class="kpi"><div class="v" style="font-size:18px">${sg(dl(30))}</div><div class="l">30 jours</div></div></div>
    <div class="tw"><table style="font-size:14px"><thead><tr><th>Perso</th><th class="num">Or</th></tr></thead><tbody>${GS.who.map(w => `<tr><td>${esc(w)}</td><td class="num">${money(cur.per[w] ?? 0)}</td></tr>`).join("")}<tr><td><b>Total</b></td><td class="num"><b>${money(cur.total)}</b></td></tr></tbody></table></div>
    <h3 style="margin-top:18px">14 derniers jours</h3>
    <div class="tw"><table style="font-size:13px;white-space:nowrap"><thead><tr><th>Jour</th><th class="num">Total</th><th class="num">Δ</th><th class="num">Vendu</th><th class="num">Acheté</th></tr></thead><tbody>${R.slice(-14).reverse().map(r => `<tr><td>${fd(r.d)}</td><td class="num">${money(r.total)}</td><td class="num">${sg(r.delta)}</td><td class="num">${r.sold ? money(r.sold) : "—"}</td><td class="num">${r.bought ? money(r.bought) : "—"}</td></tr>`).join("")}</tbody></table></div>
    <p class="muted small">Ventes nettes de taxe et achats relevés à l'HV. Détail complet et graphique : version PC, onglet Finances.</p>`);
}
function renderMob(){
  let host = document.getElementById("mob");
  if (!host) { host = document.createElement("div"); host.id = "mob"; document.body.appendChild(host); host.addEventListener("click", mobClick); }
  const GS = goldSeries(), cur = GS ? GS.rows[GS.rows.length-1] : null;
  const n7 = GS ? Math.min(7, GS.rows.length-1) : 0, ref = GS && n7 ? GS.rows[GS.rows.length-1-n7].total : null, d7 = ref===null || !cur ? null : cur.total - ref;
  const learned = M.crafts.filter(c => c.learned), minNet = state.settings.minNet || 0;
  const rentables = learned.filter(c => c.st==="ok" && c.net!==null && c.net >= minNet).sort((a,b) => b.net - a.net);
  const loss = learned.filter(c => c.st==="bad").length;
  const toProduce = learned.filter(c => c.act==="craft").length;
  const buys = M.comps.filter(c => c.adv && c.adv.kind==="buy").sort((a,b) => b.adv.buy*(b.adv.unit||0) - a.adv.buy*(a.adv.unit||0));
  const sells = M.comps.filter(c => c.adv && c.adv.kind==="sell" && c.stock > 0).sort((a,b) => b.adv.sell*(b.adv.unit||0) - a.adv.sell*(a.adv.unit||0));
  const stockVal = M.comps.filter(c => c.stock > 0).reduce((a,c) => a + (c.value||0), 0) + M.pnjRows.reduce((a,c) => a + (c.value||0), 0);
  const nStock = M.comps.filter(c => c.stock > 0).length;
  const buyCost = buys.reduce((a,c) => a + c.adv.buy*(c.adv.unit||0), 0), sellNet = sells.reduce((a,c) => a + c.adv.sell*(c.adv.unit||0)*(1-state.settings.cut), 0);
  const apiT = state.apiLast && state.apiLast.t ? state.apiLast.t*1000 : 0;
  const ago = t => { if (!t) return "—"; const m = Math.round((Date.now()-t)/60000); return m < 60 ? "il y a "+Math.max(1,m)+" min" : m < 2880 ? "il y a "+Math.round(m/60)+" h" : "il y a "+Math.round(m/1440)+" j"; };
  const row = (nm, sub, val, attr) => `<div class="mrow" ${attr||""}><div class="ml"><b>${esc(nm)}</b>${sub ? `<div class="muted small">${sub}</div>` : ""}</div><div class="mr">${val}</div></div>`;
  const craftRow = c => row(c.n, `ROI ${roiTxt(c.roi)} · ${actPill(c)}`, `<b class="${c.st==="bad"?"bad":""}">${money(c.net)}</b>`, `data-craft="${esc(c.n)}" role="button" tabindex="0"`);
  const buyRow = c => row(c.n, `${money(c.adv.unit)} l'unité${c.adv.maxBuy!==null ? ` · max ${money(c.adv.maxBuy)}` : ""} · stock ${c.stock}`, `<b style="color:var(--ok)">Acheter ${c.adv.buy}</b><div class="muted small">≈ ${money(c.adv.buy*(c.adv.unit||0))}</div>`, `data-comp="${esc(c.n)}" role="button" tabindex="0"`);
  const sellRow = c => row(c.n, `${money(c.adv.unit)} l'unité${c.adv.sellPrice!==null ? ` · mettre à ${money(c.adv.sellPrice)}` : ""} · stock ${c.stock}`, `<b style="color:var(--warn)">Vendre ${c.adv.sell}</b><div class="muted small">≈ ${money(c.adv.sell*(c.adv.unit||0)*(1-state.settings.cut))} net</div>`, `data-comp="${esc(c.n)}" role="button" tabindex="0"`);
  const none = t => `<div class="mnone">${t}</div>`;
  let body = "";
  if (mobTab==="resume") body = `
    <div class="mcard big" data-act="gold" role="button" tabindex="0" style="cursor:pointer"><div class="ml">Or détenu <span class="muted small">· détail ›</span></div><div class="mv">${cur ? money(cur.total) : "—"}</div>
      ${d7!==null ? `<div class="small" style="color:var(--${d7>0?"ok":d7<0?"bad":"muted"})">${d7>0?"▲ +":d7<0?"▼ −":"■ "}${money(Math.abs(d7))} <span class="muted">sur ${n7} j</span></div>` : ""}
      ${GS && cur ? `<div class="mper">${GS.who.map(w => `<span>${esc(w)} <b>${money(cur.per[w] ?? 0)}</b></span>`).join("")}</div>` : `<div class="muted small">En attente du premier export.</div>`}</div>
    <div class="mgrid">
      <div class="mcard"><div class="ml">Valeur du stock</div><div class="mv">${money(stockVal)}</div><div class="muted small">${nStock} objets</div></div>
      <div class="mcard"><div class="ml">Crafts rentables</div><div class="mv" style="color:var(--ok)">${rentables.length}</div><div class="small" style="color:var(--bad)">${loss} en perte</div></div>
    </div>
    <div class="mcard"><div class="ml">À faire</div>
      <a class="mact" data-tab="stock" data-sub="buy"><span>À acheter</span><b>${buys.length}</b><span class="muted small">${buys.length ? "≈ "+money(buyCost) : ""}</span></a>
      <a class="mact" data-tab="stock" data-sub="sell"><span>À vendre</span><b>${sells.length}</b><span class="muted small">${sells.length ? "≈ "+money(sellNet)+" net" : ""}</span></a>
      <a class="mact" data-tab="crafts" data-sub="craft"><span>À produire</span><b>${toProduce}</b><span class="muted small">composants en stock</span></a></div>
    <h2 class="mh">Top crafts</h2>
    <div class="mlist">${rentables.slice(0,5).map(craftRow).join("") || none("Aucun craft rentable avec les prix actuels.")}</div>`;
  else if (mobTab==="crafts") {
    const list = mobCraft==="ok" ? rentables : mobCraft==="craft" ? learned.filter(c => c.act==="craft").sort((a,b) => (b.net??-1e9) - (a.net??-1e9)) : learned.filter(c => c.st==="bad").sort((a,b) => (a.net??0) - (b.net??0));
    body = `<div class="mseg">${[["ok","Rentables"],["craft","À produire"],["bad","Pertes"]].map(([k,l]) => `<a data-sub="${k}" data-tab="crafts" class="${mobCraft===k?"on":""}">${l}</a>`).join("")}</div>
      <div class="mlist">${list.slice(0,40).map(craftRow).join("") || none("Rien dans cette liste.")}</div>${list.length>40 ? `<p class="muted small" style="text-align:center">${list.length-40} autres sur la version PC.</p>` : ""}`;
  } else {
    const list = mobStock==="buy" ? buys : sells;
    body = `<div class="mseg">${[["buy","À acheter ("+buys.length+")"],["sell","À vendre ("+sells.length+")"]].map(([k,l]) => `<a data-sub="${k}" data-tab="stock" class="${mobStock===k?"on":""}">${l}</a>`).join("")}</div>
      <div class="mlist">${list.slice(0,40).map(mobStock==="buy" ? buyRow : sellRow).join("") || none(mobStock==="buy" ? "Rien à acheter pour l'instant." : "Aucun surplus à vendre.")}</div>${list.length>40 ? `<p class="muted small" style="text-align:center">${list.length-40} autres sur la version PC.</p>` : ""}`;
  }
  host.innerHTML = `<header class="mtop"><div class="mbrand"><span class="seal" role="img" aria-label="Sceau de la banque"></span><div><b>Gringotts</b><div class="muted small" id="mobSt">${syncLabel()}</div></div></div>
      <div class="mbtns"><button class="btn sm" data-act="prix" type="button" title="Récupérer les prix de l'HV">⟳ Prix</button><button class="btn sm" data-act="sync" type="button" title="Synchroniser">↻</button></div></header>
    <main class="mmain">${body}<p class="mfoot"><a href="#" data-act="desk">Version PC</a></p></main>
    <nav class="mbar">${[["resume","Résumé"],["crafts","Crafts"],["stock","Stock"]].map(([k,l]) => `<a data-tab="${k}" class="${mobTab===k?"on":""}">${l}</a>`).join("")}</nav>`;
}
function mobClick(e){
  const t = e.target.closest("[data-tab],[data-act],[data-craft],[data-comp]"); if (!t) return;
  if (t.dataset.act==="gold") { openGold(); return; }
  if (t.dataset.act==="prix") { e.preventDefault(); refreshPrices(); return; }
  if (t.dataset.act==="sync") { e.preventDefault(); document.getElementById("syncBtn").click(); return; }
  if (t.dataset.act==="desk") { e.preventDefault(); try { localStorage.setItem("gringotts-desk","1"); } catch(x) {} render(); return; }
  if (t.dataset.craft) { openCraft(t.dataset.craft); return; }
  if (t.dataset.comp) { openComp(t.dataset.comp); return; }
  if (t.dataset.tab) { mobTab = t.dataset.tab; if (t.dataset.sub) { if (mobTab==="crafts") mobCraft = t.dataset.sub; else if (mobTab==="stock") mobStock = t.dataset.sub; } e.preventDefault(); renderMob(); window.scrollTo(0,0); }
}
MOBQ.addEventListener("change", () => render());
function ensureMobBack(){
  let b = document.getElementById("mobBack");
  if (!b) { b = document.createElement("a"); b.id = "mobBack"; b.href = "#"; b.textContent = "Version mobile"; b.addEventListener("click", e => { e.preventDefault(); try { localStorage.removeItem("gringotts-desk"); } catch(x) {} render(); }); document.body.appendChild(b); }
}
function render(){
  document.body.classList.toggle("mobmode", mobOn());
  if (MOBQ.matches) ensureMobBack();
  if (mobOn()) { renderMob(); return; }
  const main = document.getElementById("main");
  const v = views[current] ? current : "controle";
  main.innerHTML = (schemaNewer ? `<div class="note warn" role="alert"><b>Données plus récentes que cette version du tableau de bord.</b> Elles sont lues telles quelles ; mettez le tableau de bord à jour avant de modifier quoi que ce soit.</div>` : "") + (storageFail ? `<div class="note bad" role="alert"><b>Sauvegarde locale impossible</b> (espace du navigateur saturé). ${db ? "Vos données restent enregistrées sur votre compte." : "Exportez une sauvegarde dans Réglages avant de continuer."} Réduisez l'historique des imports (Comptoir → Historique) pour libérer de la place.</div>` : "") + views[v]();
  document.querySelectorAll("#nav a").forEach(a => { if (a.dataset.view===v) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); });
  const loss = M.crafts.filter(c => c.st==="bad").length;
  const pill = document.getElementById("pillLoss"); pill.hidden = !loss; pill.textContent = loss; pill.title = loss+" crafts en perte";
  { const W = priceWatch(); [["pillLow",W.low,"en baisse (≥ seuil sous la médiane 30 j) : à acheter"],["pillHigh",W.high,"en hausse (≥ seuil au-dessus de la médiane 30 j) : à reporter"]].forEach(([id,l,t]) => { const el = document.getElementById(id); el.hidden = !l.length; el.textContent = l.length; el.title = l.length+" composants de vos recettes rentables "+t; }); }
  [["pillBuy","buy","à acheter (rentable, composants à acheter)"],["pillMake","craft","à produire (rentable, composants en stock)"]].forEach(([id,a,t]) => { const n = M.crafts.filter(c => c.act===a).length, el = document.getElementById(id); el.hidden = !n; el.textContent = n; el.title = n+" crafts "+t; });
  const fr = document.getElementById("fresh");
  if (!M.lastDate) { fr.className = "freshness stale"; fr.innerHTML = "<b>Aucun prix</b> · importez un scan"; }
  else { const ageH = (Date.now() - new Date(M.lastDate+"T12:00:00"))/36e5;
    fr.className = "freshness"+(ageH > state.settings.staleH+12 ? " stale":"");
    fr.innerHTML = `Prix du <b>${fmtDate(M.lastDate)}</b>${ageH > state.settings.staleH+12 ? " · à mettre à jour" : ""}`; }
  bindView(v);
}

function rerender(keepFocusSel){
  const ae = document.activeElement; const sel = keepFocusSel || (ae && ae.dataset && ae.dataset.f ? `[data-f="${ae.dataset.f}"]` : null);
  const pos = ae && ae.selectionStart;
  render();
  if (sel) { const el = document.querySelector(sel); if (el) { el.focus(); if (pos!==undefined && el.setSelectionRange) try { el.setSelectionRange(pos,pos); } catch(e){} } }
}

function bindView(v){
  const main = document.getElementById("main");
  main.querySelectorAll("[data-f]").forEach(el => {
    const [view,key] = el.dataset.f.split(".");
    el.addEventListener(el.type==="search" ? "input" : "change", () => { filters[view][key] = el.type==="checkbox" ? el.checked : el.value; rerender(); });
  });
  main.querySelectorAll("[data-act]").forEach(b => b.addEventListener("click", () => { filters.crafts.act = filters.crafts.act===b.dataset.act ? "all" : b.dataset.act; rerender(); }));
  main.querySelectorAll("th[data-k]").forEach(h => {
    const go = () => { const s = sortState[v]; const k = h.dataset.k; if (s.k===k) s.d = s.d==="asc"?"desc":"asc"; else { s.k=k; s.d = ["n","cat","type","rar","actLbl","dayOrd","bestOrd","sk","src","z","job"].includes(k) ? "asc" : "desc"; } rerender(); };
    h.addEventListener("click", go); h.addEventListener("keydown", e => { if (e.key==="Enter"||e.key===" ") { e.preventDefault(); go(); } });
  });
  main.querySelectorAll("[data-comp]").forEach(el => { const go = () => openComp(el.dataset.comp); el.addEventListener("click", go); el.addEventListener("keydown", e => { if (e.key==="Enter") go(); }); });
  main.querySelectorAll("[data-craft]").forEach(el => { const go = () => openCraft(el.dataset.craft); el.addEventListener("click", go); el.addEventListener("keydown", e=>{ if(e.key==="Enter") go(); }); });
  main.querySelectorAll("[data-ench]").forEach(el => el.addEventListener("click", () => openEnch(el.dataset.ench)));
  const numInput = (attr, store) => main.querySelectorAll(`[${attr}]`).forEach(el => el.addEventListener("change", () => {
    const k = norm(el.getAttribute(attr)); const val = el.value === "" ? undefined : Math.max(0, +el.value);
    if (val === undefined) delete state[store][k]; else state[store][k] = val;
    persist(); rebuild(); rerender(`[${attr}="${CSS.escape(el.getAttribute(attr))}"]`);
  }));
  numInput("data-stock","stock"); numInput("data-pstock","pnjStock"); numInput("data-target","target"); numInput("data-manual","manual");
  main.querySelectorAll("[data-copy]").forEach(b => b.addEventListener("click", () => copyFrom(document.getElementById(b.dataset.copy))));
  main.querySelectorAll("[data-set]").forEach(el => el.addEventListener("change", () => {
    let val = el.tagName==="SELECT" ? el.value : +el.value; if (el.hasAttribute("data-pct")) val = val/100;
    if (el.tagName!=="SELECT" && !isFinite(val)) return;
    state.settings[el.dataset.set] = val; persist(); rebuild(); render(); toast("Réglage enregistré");
  }));
  main.querySelectorAll("[data-stack]").forEach(el => el.addEventListener("change", () => {
    const v2 = Math.max(1, Math.round(+el.value)); if (!isFinite(v2)) return;
    state.settings.stacks = {...(state.settings.stacks||{}), [el.dataset.stack]: v2}; persist(); rebuild(); render(); toast("Taille de pile enregistrée");
  }));
  const tr = document.getElementById("targetsReset");
  if (tr) tr.addEventListener("click", () => askConfirm("Effacer toutes les cibles saisies à la main et revenir aux cibles auto ?", () => { state.target = {}; persist(); rebuild(); render(); toast("Cibles auto rétablies"); }));
  if (v==="import") {
    main.querySelectorAll("[data-dtile]").forEach(b => b.addEventListener("click", () => {
      const i = +b.dataset.dtile; decOpen = decOpen===i ? null : i;
      main.querySelectorAll("[data-dtile]").forEach(x => { const on = +x.dataset.dtile===decOpen; x.classList.toggle("on", on); x.setAttribute("aria-expanded", on); });
      main.querySelectorAll("[data-dpanel]").forEach(x => x.style.display = +x.dataset.dpanel===decOpen ? "" : "none");
    }));
    main.querySelectorAll("[data-plan]").forEach(b => b.addEventListener("click", () => openDrawer(planDrawer(b.dataset.plan))));
    const listBox = (outId, txtId, msg, txt) => { const o = document.getElementById(outId);
      o.innerHTML = `<div class="note"><p style="margin:0 0 8px">${msg}</p><div class="copybox"><textarea id="${txtId}" readonly></textarea><button class="btn" data-copy="${txtId}">Copier</button></div></div>`;
      const ta = document.getElementById(txtId); ta.value = txt; o.querySelector("[data-copy]").addEventListener("click", () => copyFrom(ta)); };
    document.getElementById("trackBtn").addEventListener("click", () => { const items = trackList();
      listBox("trackOut", "trackTxt", `Dans Auctionator : Achats → Importer, puis collez ce texte. Liste « Gringotts - Suivi » : ${items.length} objets (composants + produits, hors fournitures PNJ).`, auctionatorList("Gringotts - Suivi", items)); });
    document.getElementById("shopBtn").addEventListener("click", () => { const items = M.comps.filter(c => c.used && c.toBuy > 0).map(c => c.n);
      listBox("shopOut", "shopTxt", "Dans Auctionator : Achats → Importer, puis collez ce texte (sans quantités ni prix max : utilisez de préférence la liste créée par <code>/gt import</code>).", auctionatorList("Gringotts - Réassort", items)); });
  }

  if (v==="recettes") {
    main.querySelectorAll("[data-recjob]").forEach(b => b.addEventListener("click", () => {
      const f = filters.recettes, j = b.dataset.recjob;
      if (f.kind===j) f.kind = "all"; else { f.kind = j; if (f.l==="inconnue") f.l = "oui"; }
      render(); const t = main.querySelector(`[data-recjob="${j}"]`); if (t) t.focus(); }));
    main.querySelectorAll("[data-recfilter]").forEach(b => b.addEventListener("click", () => { filters.recettes.l = b.dataset.recfilter; filters.recettes.kind = "all"; render(); }));
    main.querySelectorAll("[data-stepdone]").forEach(b => b.addEventListener("click", () => {
      const [job, to] = b.dataset.stepdone.split("|"); state.planLvl = {...(state.planLvl||{}), [job]: +to};
      persist(); rebuild(); render(); toast(`${job} : étape validée, palier ${to}`); }));
    main.querySelectorAll("[data-stepreset]").forEach(b => b.addEventListener("click", () => {
      const job = b.dataset.stepreset; if (state.planLvl) delete state.planLvl[job];
      persist(); rebuild(); render(); toast(`${job} : retour au niveau relevé par l'addon`); }));
    main.querySelectorAll("[data-plan]").forEach(b => b.addEventListener("click", () => openDrawer(planDrawer(b.dataset.plan))));
    main.querySelectorAll("[data-f-learnable]").forEach(b => b.addEventListener("click", () => {
      filters.recettes.l = "dispo"; filters.recettes.kind = b.dataset.fLearnable; render();
    }));
    const rr = document.getElementById("recReset");
    if (rr) rr.addEventListener("click", () => askConfirm("Effacer la mémoire des recettes (statuts appris, couleurs, recettes inconnues et recettes « Auto » ajoutées par l'export) ? Toutes les recettes du dashboard redeviennent « non apprises » jusqu'au prochain export Gringotts. Les niveaux de métier sont conservés.", () => {
      state.learned = {}; state.recDiff = {}; state.unknownRecipes = {}; state.ext = {recipes:{}}; invalidateAll(); persist(); rebuild(); render(); toast("Mémoire des recettes effacée");
    }));
  }
  if (v==="controle") main.querySelectorAll("[data-goto-dec]").forEach(b => b.addEventListener("click", e => { e.preventDefault(); if (b.dataset.gotoDec !== "") decOpen = +b.dataset.gotoDec; location.hash = "#import"; }));
  if (v==="import") {
    const db1 = document.getElementById("dashBtn"); if (db1) db1.addEventListener("click", sendToAddon);
    const db2 = document.getElementById("dashDl"); if (db2) db2.addEventListener("click", downloadDash);
    const gb = document.getElementById("gameBtn");
    if (gb) gb.addEventListener("click", () => { const o = document.getElementById("gameOut"); o.innerHTML = gameBox(); const ta = document.getElementById("gameTxt"); ta.value = gameText(); copyFrom(ta);
      o.querySelector("[data-copy]").addEventListener("click", () => copyFrom(ta)); });
  }
  if (v==="import") {
    bindImport();
    const pr = document.getElementById("priceReset");
    if (pr) pr.addEventListener("click", () => {
      const zero = document.getElementById("rstStock").checked;
      askConfirm("Effacer tous les prix de test et vos imports"+(zero?", et remettre les stocks à 0":"")+" ? Les recettes apprises et les réglages sont conservés.", () => {
      Object.keys(state.imports).forEach(d => dirtyImports.add(d));
      state.imports = {}; state.priceReset = true;
      if (zero) { state.stock = {}; state.pnjStock = {}; state.stockZero = true; }
      persist(); rebuild(); render(); toast("Historique des prix effacé");
      });
    });
    const rs = document.getElementById("seedRestore");
    if (rs) rs.addEventListener("click", () => { state.priceReset = false; state.stockZero = false; persist(); rebuild(); render(); toast("Données de test restaurées"); });
  }
  if (v==="reglages") bindBackup();
}

function copyFrom(ta){
  ta.select();
  const done = () => toast("Copié");
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ta.value).then(done, () => { try { document.execCommand("copy"); done(); } catch(e){ toast("Sélectionné : copiez avec Ctrl+C"); } });
  else { try { document.execCommand("copy"); done(); } catch(e){ toast("Sélectionné : copiez avec Ctrl+C"); } }
}

// Import Auctionator : lignes « prixEnCuivre,"Nom",... »
function parseAuctionator(text){
  const out = {}; let bad = 0;
  text.split(/\r?\n/).forEach(line => {
    const l = line.trim(); if (!l) return;
    let m = l.match(/^(\d+)\s*,\s*"([^"]+)"/);
    if (m) { out[m[2].trim()] = +m[1]/10000; return; }
    m = l.match(/^"?([^";\t]+)"?\s*[;\t]\s*([\d.,]+)\s*$/); // repli : Nom;prix_en_or
    if (m) { const p = parseFloat(m[2].replace(",", ".")); if (isFinite(p)) { out[m[1].trim()] = p; return; } }
    bad++;
  });
  return {prices: out, bad};
}
// ---------- Import de l'addon Gringotts (format WFC1) ----------
// Prix de l'API Blizzard (HV), fichier data/api.json : « WFA1;horodatage;HV;n » puis lignes P;nom;cuivre;;id
function parseApi(text){
  const L = String(text||"").replace(/\r/g,"").split("\n"), h = L[0].split(";");
  if (h[0] !== "WFA1") return null;
  const o = {t:+h[1]||0, ah:h[2]||"", prices:{}, ids:{}};
  L.slice(1).forEach(l => { const f = l.split(";"); if (f[0]==="P" && +f[2] > 0) { o.prices[f[1]] = (+f[2])/10000; if (+f[4] > 0) o.ids[norm(f[1])] = +f[4]; } });
  return o;
}
function applyApi(pa){
  const d = localDay(pa.t);
  state.priceReset = true;                                   // des prix réels : plus d'historique de test
  state.imports[d] = {...(state.imports[d]||{}), ...pa.prices}; dirtyImports.add(d);
  const k = {}; Object.keys(pa.prices).forEach(n => k[norm(n)] = 1);
  state.apiAge = {t:pa.t, k};
  state.itemIds = {...(state.itemIds||{}), ...pa.ids};
  state.apiLast = {t:pa.t, n:Object.keys(pa.prices).length, ah:pa.ah};
  invalidateAll();
}
function parseAddon(text){
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!/^WFC1;/.test(lines[0]||"")) return null;
  const o = {exported:0, realm:"", version:"", chars:[], guild:null, prices:{}, ages:{}, vendor:{}, vsell:{}, stockBy:{}, guildStock:{}, equip:[], gold:{}, deposits:[], stock:{}, recipes:{}, diff:{}, skills:[], xrec:[], trades:[], cds:[], unresolved:[]};
  lines.forEach(l => { const f = l.split(";");
    if (f[0]==="WFC1") { o.exported = +f[1]||0; o.realm = f[2]||""; o.version = f[3]||""; }
    else if (f[0]==="SC") { const c = o.stockBy[f[1]] = o.stockBy[f[1]] || {}; c[norm(f[2])] = (c[norm(f[2])]||0) + (+f[3]||0); }
    else if (f[0]==="GD") { const who = f[2], d = f[1]; (o.gold[who] = o.gold[who] || {})[d] = (+f[3]||0)/10000; }
    else if (f[0]==="SG") o.guildStock[norm(f[1])] = (o.guildStock[norm(f[1])]||0) + (+f[2]||0);
    else if (f[0]==="E") o.equip.push({char:f[1], l:+f[2]||0, q:+f[3]||2, c:+f[4]||4, s:(+f[5]||0)/10000, ah:f[6]!=="" ? (+f[6])/10000 : null, n:f.slice(7).join(";")});
    else if (f[0]==="C") o.chars.push({n:f[1], bags:+f[2]||0, bank:+f[3]||0});
    else if (f[0]==="G") o.guild = {n:f[1], t:+f[2]||0, tabs:f[3]||""};
    else if (f[0]==="P") { const c = +f[2]; if (c>0) { o.prices[f[1]] = c/10000; if (f[3]!=="" && f[3]!==undefined) o.ages[norm(f[1])] = +f[3]; if (+f[4] > 0) (o.itemIds = o.itemIds || {})[norm(f[1])] = +f[4]; } }
    else if (f[0]==="T") o.trades.push({k:f[1], t:+f[2]||0, q:+f[3]||1, c:(+f[4]||0)/10000, n:f.slice(5).join(";")});
    else if (f[0]==="V") { const c = parseFloat(f[2]); if (c>0) o.vendor[norm(f[1])] = {n:f[1], p:c/10000}; }
    else if (f[0]==="W") { const c = parseFloat(f[2]); if (c>0) o.vsell[norm(f[1])] = c/10000; }
    else if (f[0]==="DP") o.deposits.push({t:+f[1]||0, q:+f[2]||1, d:(+f[3]||0)/10000, n:f.slice(4).join(";")});
    else if (f[0]==="D") o.cds.push({char:f[1], r:+f[2]||0, n:f.slice(3).join(";")});
    else if (f[0]==="S") { const k = norm(f[1]); o.stock[k] = (o.stock[k]||0) + (+f[2]||0); }
    else if (f[0]==="R") (o.recipes[f[1]] = o.recipes[f[1]] || []).push(f.slice(2).join(";"));
    else if (f[0]==="Q") { const n = f.slice(3).join(";"); (o.recipes[f[1]] = o.recipes[f[1]] || []).push(n);
      if (f[2]!=="") (o.diff[f[1]] = o.diff[f[1]] || {})[n] = +f[2]; }
    else if (f[0]==="X") o.xrec.push({prof:f[1], learned:f[2]==="1", d:f[3]==="" ? null : +f[3], n:f[4], out:f[5]||"", q:+f[6]||1,
      r:(f[7]||"").split("+").filter(Boolean).map(x => { const i = x.lastIndexOf("*"); return i>0 ? [x.slice(0,i), +x.slice(i+1)||1] : [x, 1]; })});
    else if (f[0]==="K") o.skills.push({char:f[1], prof:f[2], l:+f[3]||0, m:+f[4]||0});
    else if (f[0]==="U") o.unresolved.push(f[1]);
  });
  return o;
}
// Nom de recette du jeu -> clé du dashboard (« Enchantement de X - Y » -> « Ench. de X (Y) »)
const SEED_KEYS = new Set(SEED.recipes.map(r => recKey(r.k, r.n)));
// Recherche d'abord dans la liste du dashboard, puis (sauf seedOnly) dans les recettes auto déjà connues
function matchRecipe(name, seedOnly){
  const RECIPE_KEYS = seedOnly ? SEED_KEYS : new Set([...SEED_KEYS, ...Object.keys((state.ext && state.ext.recipes) || {})]);
  const c = [name];
  let m = name.match(/^Enchantement (d(?:e |'|’))(.+?)\s+[-–:]\s+(.+)$/i); if (m) c.push(`Ench. ${m[1]}${m[2]} (${m[3]})`);
  m = name.match(/^Enchantement (d(?:e |'|’))(.+)$/i); if (m) c.push(`Ench. ${m[1]}${m[2]}`);
  const RN = SEED.renames || {};
  for (const n of c) for (const k of ["craft","ench"]) {
    let key = recKey(k, n); if (RN[key]) key = RN[key];
    if (RECIPE_KEYS.has(key)) return key;
    const k2 = key.replace(/bracelets/g, "brassards"); if (RECIPE_KEYS.has(k2)) return k2;
  }
  return null;
}
const JOBS = [...new Set(SEED.recipes.map(r => r.job)), "Cuisine"];
const jobsAll = () => [...new Set([...JOBS, ...extList().map(x => x.job)])];
const jobOf = prof => JOBS.find(j => norm(j).startsWith(norm(prof))) || null;
function addonPlan(o){
  // Recettes vues en jeu absentes du dashboard : ajoutées avec leurs composants (remplacent les auto du même métier)
  const ext = {}, xJobs = new Set();
  o.xrec.forEach(x => { const job = jobOf(x.prof); if (!job) return; xJobs.add(job);
    if (matchRecipe(x.n, true)) return;
    const k = job==="Enchantement" ? "ench" : "craft";
    ext[recKey(k, x.n)] = {n:x.n, job, k, out:x.out, q:x.q, r:x.r}; });
  const extByName = {}; Object.keys(ext).forEach(key => extByName[norm(ext[key].n)] = key);
  const profs = Object.keys(o.recipes).map(p => {
    const job = jobOf(p), keys = new Set(), miss = [], diff = {};
    o.recipes[p].forEach(n => { const k = matchRecipe(n, true) || extByName[norm(n)] || (xJobs.has(job) ? null : matchRecipe(n));
      if (k) { keys.add(k); const d = (o.diff[p]||{})[n]; if (d!==undefined) diff[k] = d; } else miss.push(n); });
    return {prof:p, job, keys, miss, diff};
  });
  return {o, profs, ext, xJobs};
}
function applyAddon(plan){
  const {o, profs, ext, xJobs} = plan, d = plan.dateKey || today();
  state.ext = state.ext || {recipes:{}};
  Object.keys(state.ext.recipes).forEach(k => { if (xJobs.has(state.ext.recipes[k].job)) delete state.ext.recipes[k]; });
  Object.assign(state.ext.recipes, ext); invalidateAll();
  if (o.itemIds) state.itemIds = {...(state.itemIds||{}), ...o.itemIds};
  // Un export réel remplace définitivement les données de test : plus d'historique fictif (médiane 30 j, stocks de départ)
  state.priceReset = true;
  if (Object.keys(o.prices).length) { state.imports[d] = {...(state.imports[d]||{}), ...o.prices}; dirtyImports.add(d); }
  // Stock = total exporté ; un objet suivi absent de l'export vaut 0
  ALL_HV().forEach(x => { const k = norm(x.n); state.stock[k] = o.stock[k] || 0; });
  SEED.pnj.forEach(x => { const k = norm(x.n); state.pnjStock[k] = o.stock[k] || 0; delete state.stock[k]; });
  const pnjK = new Set(SEED.pnj.map(x => norm(x.n)));
  Object.keys(o.stock).forEach(k => { if (!pnjK.has(k)) state.stock[k] = o.stock[k]; });
  state.stockZero = false;
  // Recettes : pour chaque métier relevé, coché = appris en jeu
  state.recDiff = state.recDiff || {};
  profs.forEach(p => { if (!p.job || !p.keys.size) return;
    ALL_RECIPES().filter(r => r.job === p.job).forEach(r => { const k = recKey(r.k, r.n); state.learned[k] = p.keys.has(k); delete state.recDiff[k]; });
    Object.assign(state.recDiff, p.diff);
    state.unknownRecipes = state.unknownRecipes || {};
    state.unknownRecipes[p.job] = p.miss.slice();
  });
  // Niveaux : meilleur perso par métier du dashboard
  const sk = {};
  const ga = {};
  o.skills.forEach(x => { const job = jobOf(x.prof), tgt = job ? sk : ga, key = job || x.prof;
    if (!tgt[key] || x.l > tgt[key].l) tgt[key] = {l:x.l, m:x.m, char:x.char, t:o.exported}; });
  if (Object.keys(sk).length) state.skills = {...(state.skills||{}), ...sk};
  Object.entries(state.planLvl||{}).forEach(([job, l]) => { if (sk[job] && sk[job].l >= l) delete state.planLvl[job]; });
  if (Object.keys(ga).length) state.gather = {...(state.gather||{}), ...ga};
  // Âge des prix (jours depuis le dernier relevé Auctionator), au moment de l'export
  if (Object.keys(o.ages).length) state.priceAge = {t:o.exported, a:o.ages};
  // Transactions HV : fusion sans doublon, 60 jours
  const tr = {}; (state.trades||[]).concat(o.trades).forEach(x => tr[`${x.k}|${x.t}|${x.q}|${x.c}|${x.n}`] = x);
  const lim = Date.now()/1000 - 60*86400; state.trades = Object.values(tr).filter(x => x.t >= lim);
  if (o.cds.length) state.cds = o.cds;
  if (Object.keys(o.stockBy).length) { state.stockBy = o.stockBy; state.guildStock = o.guildStock; }
  state.equip = o.equip;
  // Dépôts relevés à la mise en vente : dépôt par unité, 12 derniers par objet, 90 jours
  state.deposits = state.deposits || {}; const lim90 = Date.now()/1000 - 90*86400;
  o.deposits.forEach(x => { const k = norm(x.n), a = state.deposits[k] = state.deposits[k] || [];
    if (!a.some(y => y.t===x.t && y.q===x.q)) a.push({t:x.t, q:x.q, u:x.d/x.q}); });
  Object.keys(state.deposits).forEach(k => { state.deposits[k] = state.deposits[k].filter(y => y.t >= lim90).sort((a,b) => b.t-a.t).slice(0,12); if (!state.deposits[k].length) delete state.deposits[k]; });
  // Or par jour et par perso : fusion (l'addon renvoie jusqu'à 180 jours)
  state.gold = state.gold || {};
  Object.entries(o.gold).forEach(([who, days]) => { state.gold[who] = {...(state.gold[who]||{}), ...days}; });
  cleanGold(state.gold);
  state.addonVersion = o.version;
  // Prix marchands PNJ relevés (achat) et prix de revente au marchand
  if (Object.keys(o.vendor).length) state.vendor = {...(state.vendor||{}), ...o.vendor};
  if (Object.keys(o.vsell).length) state.vsell = {...(state.vsell||{}), ...o.vsell};
  state.addonLast = {t:o.exported, chars:o.chars, guild:o.guild};
}
const MIN_ADDON = "1.8.0";
const verLt = (a, b) => { const x = String(a||"0").split(".").map(Number), y = String(b).split(".").map(Number); for (let i=0;i<3;i++){ if ((x[i]||0) < (y[i]||0)) return true; if ((x[i]||0) > (y[i]||0)) return false; } return false; };
function addonReport(plan){
  const {o, profs} = plan, now = Date.now()/1000, staleS = (state.settings.staleH||24)*3600;
  const age = t => !t ? `<span class="st bad">jamais</span>` : (() => { const s = now - t, txt = s<3600 ? Math.max(1,Math.round(s/60))+" min" : s<86400 ? Math.round(s/3600)+" h" : Math.round(s/86400)+" j";
    return s > staleS ? `<span class="st warn">${txt}</span>` : txt; })();
  const nP = Object.keys(o.prices).length, nS = Object.keys(o.stock).length;
  return `${verLt(o.version, MIN_ADDON) ? `<div class="note bad">Addon Gringotts ${esc(o.version||"ancien")} : le dashboard attend la version ${MIN_ADDON} ou plus. Certaines données manquent (stock par perso, désenchantement…). Installez la dernière version de l'addon.</div>` : ""}
  <div class="note ok">Export du ${new Date(o.exported*1000).toLocaleString("fr-FR")} · ${esc(o.realm)} : <b>${nP}</b> prix · <b>${nS}</b> objets en stock · ${profs.length} métier(s).</div>
  <div class="tw"><table><thead><tr><th>Source</th><th class="r">Sacs</th><th class="r">Banque</th></tr></thead><tbody>
  ${o.chars.map(c => `<tr><td>${esc(c.n)}</td><td class="r">${age(c.bags)}</td><td class="r">${age(c.bank)}</td></tr>`).join("")}
  <tr><td>Banque de guilde ${o.guild ? esc(o.guild.n)+` <span class="muted">(${esc(o.guild.tabs)} onglets)</span>` : ""}</td><td class="r">—</td><td class="r">${age(o.guild && o.guild.t)}</td></tr>
  </tbody></table></div>
  ${o.skills.length ? `<div class="note ok">Niveaux : ${o.skills.map(x => `${esc(x.char)} · ${esc(x.prof)} <b>${x.l}</b>/${x.m}${jobOf(x.prof)?"":` <span class="muted">(non suivi)</span>`}`).join(" — ")}</div>` : ""}
  ${profs.map(p => `<div class="note ${!p.job||p.miss.length?"warn":"ok"}"><b>${esc(p.prof)}</b>${p.job?` → ${esc(p.job)}`:" : métier absent du dashboard, ignoré"} · ${p.keys.size} recette(s) reconnue(s)${p.miss.length?`, ${p.miss.length} non reconnue(s), ajoutée(s) en rouge dans Recettes : ${p.miss.slice(0,8).map(esc).join(", ")}${p.miss.length>8?"…":""}`:""}</div>`).join("")}
  ${Object.keys(plan.ext).length ? `<div class="note ok">${Object.keys(plan.ext).length} recette(s) absente(s) du dashboard ajoutée(s) automatiquement avec leurs composants (tag « Auto ») : ${Object.values(plan.ext).slice(0,8).map(x => esc(x.n)).join(", ")}${Object.keys(plan.ext).length>8?"…":""}.</div>` : ""}
  ${Object.keys(o.gold).length ? `<div class="note ok">Or relevé : ${Object.keys(o.gold).map(w => { const ds = Object.keys(o.gold[w]).sort(), v = o.gold[w][ds[ds.length-1]]; return esc(w) + " " + money(v); }).join(", ")}.</div>` : ""}
  ${Object.keys(o.vendor).length ? `<div class="note ok">${Object.keys(o.vendor).length} prix de marchand PNJ relevés (utilisés comme prix d'achat).</div>` : ""}
  ${o.deposits.length ? `<div class="note ok">${o.deposits.length} dépôt(s) de mise en vente relevé(s) (utilisés pour estimer le coût des invendus).</div>` : ""}
  ${o.trades.length || o.cds.length ? `<div class="note ok">${o.trades.length} transaction(s) HV (ventes, achats, annonces, expirées) · ${o.cds.length} temps de recharge.</div>` : ""}
  ${o.unresolved.length ? `<div class="note warn">${o.unresolved.length} objet(s) jamais vus par l'addon (pas de prix) : ${o.unresolved.slice(0,10).map(esc).join(", ")}${o.unresolved.length>10?"…":""}. Ils seront identifiés après un scan Auctionator où ils apparaissent.</div>` : ""}
  <div class="note">Enregistrer : les prix deviennent l'import du ${fmtDate(today())}, le stock est remplacé par le total exporté (objets absents = 0), les recettes et niveaux des métiers relevés sont synchronisés.</div>`;
}
function bindImport(){
  const ta = document.getElementById("impText"), btnA = document.getElementById("impApply"), outEl = document.getElementById("impOut");
  document.getElementById("impParse").addEventListener("click", () => {
    const ao = parseAddon(ta.value);
    if (ao) { pendingAddon = addonPlan(ao); pending = null; btnA.disabled = false; btnA.textContent = "Enregistrer l'export addon"; outEl.innerHTML = addonReport(pendingAddon); return; }
    pendingAddon = null;
    const {prices, bad} = parseAuctionator(ta.value);
    const names = Object.keys(prices);
    if (!names.length) { pending = null; btnA.disabled = true; outEl.innerHTML = `<div class="note bad">Aucune ligne reconnue. Format attendu : <code>prixEnCuivre,"Nom de l'objet",…</code> (export CSV Auctionator).</div>`; return; }
    const known = new Set(Object.keys(M.cur));
    const fresh = names.filter(n => !known.has(norm(n)));
    const jumps = names.filter(n => { const o = M.cur[norm(n)]; return o && (prices[n]/o > 1.5 || prices[n]/o < 0.5); });
    pending = prices; btnA.disabled = false;
    outEl.innerHTML = `<div class="note ok"><b>${names.length}</b> prix reconnus${bad?`, ${bad} ligne(s) ignorée(s)`:""}. ${fresh.length?`${fresh.length} nouvel(s) article(s).`:""}</div>
      ${jumps.length ? `<div class="note warn">Variation de plus de 50 % sur ${jumps.length} article(s) : ${jumps.slice(0,8).map(esc).join(", ")}${jumps.length>8?"…":""}. Vérifiez avant d'enregistrer.</div>`:""}`;
  });
  btnA.addEventListener("click", () => {
    if (pendingAddon) { applyAddon(pendingAddon); pendingAddon = null; compactImports(); rebuild();
      const val = M.comps.reduce((a,c) => a + (c.value||0), 0) + M.pnjRows.reduce((a,c) => a + (c.value||0), 0);
      state.valueHist = {...(state.valueHist||{}), [today()]: Math.round(val*10000)/10000}; persist(); render(); toast("Export addon enregistré : prix, stock et recettes"); return; }
    if (!pending) return; const d = today();
    state.imports[d] = pending; dirtyImports.add(d); pending = null; compactImports();
    persist(); rebuild(); render(); toast("Prix du "+fmtDate(d)+" enregistrés");
  });
  document.querySelectorAll("[data-delimp]").forEach(b => b.addEventListener("click", () => {
    const d = b.dataset.delimp; askConfirm("Supprimer l'import du "+fmtDate(d)+" ?", () => {
    delete state.imports[d]; dirtyImports.add(d); persist(); rebuild(); render(); toast("Import supprimé"); });
  }));
}
function bindBackup(){
  const out = document.getElementById("bkOut");
  document.getElementById("bkExport").addEventListener("click", async () => {
    const data = serialize();
    let dl = null; try { dl = window.claude && window.claude.use ? await window.claude.use("downloads") : null; } catch(e) {}
    if (dl) { try { await dl.save({filename:`gringotts-${today()}.json`, data}); toast("Sauvegarde exportée"); return; } catch(e) { if (e && e.code && /declin|cancel/i.test(e.code)) return; } }
    out.innerHTML = `<div class="note"><p style="margin:0 0 8px">Copiez ce texte et gardez-le dans un fichier.</p><div class="copybox"><textarea id="bkTxt" readonly></textarea><button class="btn" id="bkCopy">Copier</button></div></div>`;
    document.getElementById("bkTxt").value = data; document.getElementById("bkCopy").addEventListener("click", () => copyFrom(document.getElementById("bkTxt")));
  });
  document.getElementById("bkShow").addEventListener("click", () => {
    out.innerHTML = `<div class="note"><p style="margin:0 0 8px">Collez une sauvegarde exportée. Elle remplace les données actuelles.</p><textarea id="bkIn"></textarea><div class="toolbar" style="margin-top:8px"><button class="btn primary" id="bkApply">Restaurer</button></div></div>`;
    document.getElementById("bkApply").addEventListener("click", () => {
      try { const s = parseStored(document.getElementById("bkIn").value); if (!s || typeof s!=="object" || !s.settings) throw 0;
        Object.keys(state.imports).forEach(d=>dirtyImports.add(d));
        state = {...freshState(), ...s, settings:{...DEFAULT_SETTINGS, ...s.settings}};
        Object.keys(state.imports).forEach(d=>dirtyImports.add(d)); persist(); rebuild(); render(); toast("Sauvegarde restaurée");
      } catch(e) { toast("Sauvegarde illisible : vérifiez le texte collé"); }
    });
  });
  document.getElementById("resetData").addEventListener("click", () => {
    askConfirm("Réinitialiser vos données : prix (y compris les prix de test du 29/10), stocks, cibles, recettes apprises, niveaux, or, ventes et achats seront effacés. Le tableau repart vierge jusqu'au prochain export. Vos réglages (taxe, faction, seuils, emplacements, tailles de pile) et les frais de dépôt mesurés sont conservés. Cette action est définitive : exportez d'abord une sauvegarde si besoin.", () => {
    Object.keys(state.imports).forEach(d=>dirtyImports.add(d));
    const keep = {settings: state.settings, deposits: state.deposits};
    state = {...freshState(), priceReset:true, stockZero:true, noHistoryBefore: today(), settings: keep.settings, ...(keep.deposits ? {deposits: keep.deposits} : {})};
    persist(); rebuild(); render(); toast("Données réinitialisées, réglages conservés"); });
  });
  document.getElementById("reset").addEventListener("click", () => {
    askConfirm("Tout effacer, réglages compris : imports, stocks, cibles, recettes apprises, simulateur et réglages ? Cette action est définitive.", () => {
    Object.keys(state.imports).forEach(d=>dirtyImports.add(d));
    state = {...freshState(), noHistoryBefore: today()};
    persist(); rebuild(); render(); toast("Données réinitialisées"); });
  });
}

// ---------- Panneau détail ----------
function spark(h){
  const pts = h.map((v,i)=>[i,v]).filter(p=>p[1]!==null);
  if (pts.length < 2) return `<p class="muted">Historique insuffisant.</p>`;
  const W=520,H=120,P=6; const ys = pts.map(p=>p[1]); const lo=Math.min(...ys), hi=Math.max(...ys); const n=h.length-1||1;
  const x = i => P + i/n*(W-2*P), y = v => hi===lo ? H/2 : H-P - (v-lo)/(hi-lo)*(H-2*P);
  const d = pts.map((p,i)=>(i?"L":"M")+x(p[0]).toFixed(1)+" "+y(p[1]).toFixed(1)).join(" ");
  const m = median(ys);
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" width="100%" preserveAspectRatio="none" role="img" aria-label="Évolution du prix">
    <line x1="${P}" x2="${W-P}" y1="${y(m)}" y2="${y(m)}" stroke="var(--muted)" stroke-dasharray="4 4" stroke-width="1"/>
    <path d="${d}" fill="none" stroke="var(--accent)" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>
    <div class="legend">${fmtDate(M.dates[0])} → ${fmtDate(M.dates[M.dates.length-1])} · min ${money(lo)} · max ${money(hi)} · pointillé = médiane</div>`;
}
function linesTable(lines){
  return `<table class="steps"><thead><tr><th>Composant</th><th class="r">Qté</th><th class="r">Prix unit.</th><th>Source</th><th class="r">Total</th></tr></thead><tbody>
  ${lines.map(l=>`<tr><td>${esc(l.n)}</td><td class="r">${l.q}</td><td class="r">${money(l.p)}</td><td class="muted">${l.src}</td><td class="r">${money(l.tot)}</td></tr>`).join("")}</tbody></table>`;
}
function openDrawer(html){ const d = document.getElementById("drawer"); document.getElementById("dBody").innerHTML = html;
  d.querySelectorAll("[data-craft],[data-ench]").forEach(el => el.addEventListener("click", e => { e.preventDefault(); if (el.dataset.craft) openCraft(el.dataset.craft); else openEnch(el.dataset.ench); }));
  d.querySelectorAll("[data-planchoice]").forEach(el => el.addEventListener("change", () => {
    const [job, from] = el.dataset.planchoice.split("|"); state.planChoice = state.planChoice || {};
    if (el.value === "auto") delete state.planChoice[`${job}|${from}`]; else state.planChoice[`${job}|${from}`] = +el.value;
    persist(); rebuild(); render(); openDrawer(planDrawer(job)); toast("Voie de montée enregistrée"); })); d.classList.add("open"); d.setAttribute("aria-hidden","false"); d.querySelector(".x").focus(); }
function closeDrawer(){ const d = document.getElementById("drawer"); d.classList.remove("open"); d.setAttribute("aria-hidden","true"); }
document.getElementById("drawer").addEventListener("click", e => { if (e.target.hasAttribute("data-close")) closeDrawer(); });
document.addEventListener("keydown", e => { if (e.key==="Escape") closeDrawer(); });

function weekStrip(prof, mode, title){
  if (!prof) return `<p class="muted">${esc(title)} : historique insuffisant (aucune semaine mercredi → mardi complète).</p>`;
  const best = pickDay(prof, mode);
  return `<div class="wk"><div class="wkt">${esc(title)}${best==="flat"?' <span class="muted small">· écart de moins de 1 % : jour indifférent</span>':""}</div><div class="wkrow">${WEEK_ORDER.map(d => {
    const v = prof[d]-1; const on = d===best;
    return `<div class="wkd${on?" on":""}${d===todayIdx()?" now":""}"><span>${cap(DAYS[d]).slice(0,3)}</span><b style="color:${v<0?"var(--ok)":v>0?"var(--bad)":"var(--muted)"}">${v>0?"+":""}${(v*100).toFixed(1).replace(".",",")} %</b></div>`; }).join("")}</div></div>`;
}
function openCraft(name){
  const c = M.crafts.find(x => x.n===name); if (!c) return; const S = state.settings;
  const tax = c.gross===null ? null : c.gross*S.cut;
  const a = ACTIONS[c.act];
  const when = c.dayLbl==="TODAY" ? "jour même (TODAY)" : c.dayLbl==="Indifférent" ? "jour de votre choix (pas d'écart de prix notable entre jours)" : c.dayLbl.toLowerCase();
  const why = {craft:`Mettre en vente le ${when}, jour où le produit se vend le plus cher.`,
    buy:`Acheter les compos le ${when}, jour où le panier coûte le moins.`,
    sell:`Le craft perd de l'argent : vendre les compos le ${when}, jour où ils se vendent le plus cher.`,
    check:"Prix manquant : impossible de décider."}[c.act];
  openDrawer(`<h3 id="dTitle">${esc(c.n)}</h3>${c.out!==c.n?`<p class="muted" style="margin:0">Produit : ${esc(c.out)}</p>`:""}
    <p style="margin:6px 0 0">${stPill(c.st)} <span class="muted">· ${c.possible} faisable(s) avec le stock</span></p>
    <div class="note ${a.cls==="info"?"":a.cls}"><span class="st ${a.cls}">${a.lbl}</span> <b>${dayCell(c.dayLbl)}</b> · ${esc(why)}</div>
    ${c.flags.map(f=>`<div class="note warn">${esc(f)}</div>`).join("")}
    <h2>Calcul pas à pas</h2>
    <table class="steps"><tbody>
      <tr><td>1. Coût brut des composants</td><td class="r">${money(c.cost)}</td></tr>
      <tr><td>2. Prix de vente retenu <span class="muted">(actuel ${money(c.cur)}, médiane ${money(c.med)})</span></td><td class="r">${money(c.gross)}</td></tr>
      <tr><td>3. Taxe HV (${pct(S.cut)})</td><td class="r">${money(tax===null?null:-tax)}</td></tr>
      <tr><td>4. Revenu net de taxe</td><td class="r">${money(c.gross===null?null:c.gross-tax)}</td></tr>
      ${c.adj>0 ? `<tr><td>5. Dépôts perdus sur invendus <span class="muted">(écoulement ${Math.round(c.thru*100)} % : ${(1/Math.max(c.thru,0.2)-1).toFixed(1)} dépôt perdu par vente)</span></td><td class="r">${money(-c.adj)}</td></tr>` : ""}
      <tr class="total"><td>Bénéfice net${c.adj>0 ? " attendu" : ""} · ROI ${roiTxt(c.roi)}</td><td class="r">${money(c.net)}</td></tr>
    </tbody></table>
    <h2>Semaine type (mercredi → mardi)</h2>
    <p class="muted" style="margin-top:-4px">Écart moyen au prix moyen de la semaine. Encadré : meilleur jour.</p>
    ${weekStrip(c.prodProf ? c.prodProf.prof : null, "max", "Vente du produit")}
    ${weekStrip(c.basket, "min", "Achat du panier de compos")}
    <h2>Composants</h2>${linesTable(c.lines)}
    <h2>Prix de vente sur la période</h2>${spark(c.hist)}`);
}
function usedBy(name){
  const k = norm(name), out = [], un = [];
  M.crafts.forEach(c => { const l = c.lines.find(x => norm(x.n)===k); if (l) out.push({kind:"craft", n:c.n, q:l.q, st:c.st, net:c.net, roi:c.roi}); });
  M.ench.forEach(e => { const l = e.lines.find(x => norm(x.n)===k); if (l) out.push({kind:"ench", n:e.n, q:l.q, st:e.st, net:e.net, roi:e.roi}); });
  ALL_CRAFTS().forEach(c => { if (isLearned("craft", c.n)) return; const r = c.r.find(x => norm(x[0])===k); if (r) un.push({kind:"craft", n:c.n, q:r[1]}); });
  ALL_ENCH().forEach(e => { if (isLearned("ench", e.n)) return; const r = e.r.find(x => norm(x[0])===k); if (r) un.push({kind:"ench", n:e.n, q:r[1]}); });
  out.sort((a, b) => (b.net===null)-(a.net===null) || (b.net||0)-(a.net||0)); un.sort((a, b) => a.n.localeCompare(b.n, "fr"));
  return {learned: out, unlearned: un};
}
function usedByTable(u){
  if (!u.learned.length && !u.unlearned.length) return `<p class="muted">Aucune recette connue n'utilise ce composant.</p>`;
  const lnk = x => `<a href="#" data-${x.kind}="${esc(x.n)}">${esc(x.n)}</a>${x.kind==="ench" ? ` <span class="muted">(enchant.)</span>` : ""}`;
  return (u.learned.length ? `<table class="steps"><thead><tr><th>Craft appris</th><th class="r">Qté</th><th>Statut</th><th class="r">Bénéfice net</th><th class="r">ROI</th></tr></thead><tbody>
  ${u.learned.map(x => `<tr><td>${lnk(x)}</td><td class="r">${x.q}</td><td>${stPill(x.st)}</td><td class="r">${money(x.net)}</td><td class="r">${roiTxt(x.roi)}</td></tr>`).join("")}</tbody></table>` : `<p class="muted">Aucune recette apprise ne l'utilise.</p>`)
  + (u.unlearned.length ? `<p class="muted" style="margin:10px 0 4px">Recettes non apprises</p><table class="steps" style="opacity:.7"><tbody>
  ${u.unlearned.map(x => `<tr><td>${x.kind==="craft" ? esc(x.n) : esc(x.n) + ` <span class="muted">(enchant.)</span>`}</td><td class="r">${x.q}</td></tr>`).join("")}</tbody></table>` : "");
}
function openComp(name){
  const c = M.comps.find(x => x.n===name); if (!c) return;
  const PM = priceModel(), k = norm(c.n), h = c.hist || [], dates = PM.dates;
  const pr = PM.profOf(k), prof = pr && pr.weeks >= (state.settings.minWeeks||3) ? pr : null;
  const vals = h.map((v,i) => [dates[i], v]).filter(x => x[1] !== null && x[1] !== undefined);
  const last30 = h.filter((v,i) => v !== null && PM.dd.age[i] < 30);
  const lo = last30.length ? Math.min(...last30) : null, hi = last30.length ? Math.max(...last30) : null;
  const recent = vals.slice(-14).reverse();
  const UB = usedBy(c.n);
  const dlt = c.delta===null || c.delta===undefined ? "—" : (c.delta>0?"+":"") + pct(c.delta);
  openDrawer(`<h3 id="dTitle">${esc(c.n)}</h3>
    <p style="margin:6px 0 0">${c.sigTxt ? `<span class="st ${c.sig}">${esc(c.sigTxt)}</span> ` : ""}<span class="muted">· ${c.used ? "utilisé par mes recettes" : "hors de mes recettes"}${c.vend!==null ? " · prix marchand" : ""}</span></p>
    ${c.stale!==null ? `<div class="note warn">Prix ancien : dernier relevé il y a ${c.age} j.</div>` : ""}
    <h2>Prix</h2>
    <table class="steps"><tbody>
      <tr><td>Prix actuel</td><td class="r">${money(c.cur)}</td></tr>
      <tr><td>Médiane 30 j</td><td class="r">${money(c.med)}</td></tr>
      <tr><td>Écart actuel / médiane</td><td class="r">${dlt}</td></tr>
      <tr><td>Min / max sur 30 j</td><td class="r">${money(lo)} / ${money(hi)}</td></tr>
      ${c.vend!==null ? `<tr><td>Prix marchand (prioritaire)</td><td class="r">${money(c.vend)}</td></tr>` : ""}
      <tr class="total"><td>Meilleur jour d'achat</td><td class="r">${c.bestDay ? dayCell(c.bestDay) : "—"}</td></tr>
    </tbody></table>
    <h2>Évolution du prix</h2>${spark(h)}
    <h2>Semaine type (mercredi → mardi)</h2>
    ${prof ? `<p class="muted" style="margin-top:-4px">Écart moyen au prix moyen de la semaine, sur ${prof.weeks} semaine(s). Encadré : jour le moins cher.</p>${weekStrip(prof.prof, "min", "Achat du composant")}` : `<p class="muted">Pas assez de semaines complètes (minimum ${state.settings.minWeeks||3}).</p>`}
    <h2>Crafts qui l'utilisent (${UB.learned.length}${UB.unlearned.length ? ` + ${UB.unlearned.length} non appris` : ""})</h2>${usedByTable(UB)}
    <h2>Stock</h2>
    <table class="steps"><tbody>
      <tr><td>En stock / cible</td><td class="r">${c.stock} / ${c.target}</td></tr>
      <tr><td>À acheter</td><td class="r">${c.toBuy}</td></tr>
      <tr class="total"><td>Coût du réassort</td><td class="r">${money(c.refill)}</td></tr>
    </tbody></table>
    <h2>Derniers relevés</h2>
    ${recent.length ? `<table class="steps"><tbody>${recent.map(([d,v]) => `<tr><td>${fmtDate(d)}</td><td class="r">${money(v)}</td></tr>`).join("")}</tbody></table>` : `<p class="muted">Aucun relevé.</p>`}`);
}
function openEnch(name){
  const e = M.ench.find(x => x.n===name); if (!e) return; const S = state.settings;
  const raw = e.cost===null ? null : e.cost*(1+S.enchMarkup);
  openDrawer(`<h3 id="dTitle">${esc(e.n)}</h3><p style="margin:6px 0 0">${stPill(e.st)} <span class="muted">· ${esc(e.cat)} · ${e.possible} faisable(s)</span></p>
    ${e.flags.map(f=>`<div class="note warn">${esc(f)}</div>`).join("")}
    <h2>Calcul</h2><table class="steps"><tbody>
      <tr><td>1. Coût des composants (Σ qté × prix unitaire)</td><td class="r">${money(e.cost)}</td></tr>
      <tr><td>2. + ${pct(S.enchMarkup)} de marge</td><td class="r">${money(raw)}</td></tr>
      ${S.enchRound==="or"?`<tr><td>3. Arrondi à l'or supérieur = prix de vente</td><td class="r">${money(e.price)}</td></tr>`:""}
      <tr class="total"><td>Bénéfice (sans taxe, service /w) · ROI ${roiTxt(e.roi)}</td><td class="r">${money(e.net)}</td></tr></tbody></table>
    <h2>Composants</h2>${linesTable(e.lines)}`);
}

// ---------- Envoi des décisions à l'addon : fichier Dash.lua écrit dans Interface\AddOns\Gringotts ----------
// Chrome/Edge sur PC : l'accès au dossier est demandé une fois puis retenu. Ailleurs : téléchargement du fichier.
const CAN_FS = typeof window.showDirectoryPicker === "function";
const idbOpen = () => new Promise((res, rej) => { const r = indexedDB.open("gringotts-fs", 1); r.onupgradeneeded = () => r.result.createObjectStore("h"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
async function idbGet(k){ const d = await idbOpen(); return new Promise((res, rej) => { const q = d.transaction("h").objectStore("h").get(k); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); }
async function idbSet(k, v){ const d = await idbOpen(); return new Promise((res, rej) => { const t = d.transaction("h", "readwrite"); t.objectStore("h").put(v, k); t.oncomplete = () => res(); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); }); }
function dashLua(text){
  let n = 0; while (text.includes("]" + "=".repeat(n) + "]")) n++;
  const eq = "=".repeat(n);
  return `-- Écrit par le dashboard Gringotts le ${new Date().toLocaleString("fr-FR")}\nlocal ADDON, ns = ...\nns.DASH_TEXT = [${eq}[\n${text}\n]${eq}]\n`;
}
async function sendToAddon(){
  try {
    let dir = null; try { dir = await idbGet("addonDir"); } catch(e) {}
    if (dir) { let perm = await dir.queryPermission({mode:"readwrite"}); if (perm !== "granted") perm = await dir.requestPermission({mode:"readwrite"}); if (perm !== "granted") dir = null; }
    if (!dir) {
      toast("Choisis le dossier Interface\\AddOns\\Gringotts de WoW");
      dir = await window.showDirectoryPicker({id:"gringotts-addon", mode:"readwrite"});
      try { await dir.getFileHandle("Gringotts.toc"); } catch(e) { toast("Ce n'est pas le dossier de l'addon : choisis le dossier « Gringotts » dans AddOns"); return {ok:false, code:"BADDIR"}; }
      try { await idbSet("addonDir", dir); } catch(e) {}
    }
    const fh = await dir.getFileHandle("Dash.lua", {create:true}), w = await fh.createWritable();
    await w.write(dashLua(gameText())); await w.close();
    toast("Décisions écrites dans l'addon : tape /reload en jeu"); return {ok:true};
  } catch(e) {
    if (e && e.name === "AbortError") { downloadDash(); return {ok:false, code:"ABORT"}; }   // dossier refusé par Chrome (ex. Program Files) ou annulé : on télécharge le fichier
    toast("Écriture impossible (" + (e && e.name || "erreur") + ") : utilise « Télécharger Dash.lua »"); return {ok:false, code:"ERR"};
  }
}
function downloadDash(){
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([dashLua(gameText())], {type:"text/plain"})); a.download = "Dash.lua";
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast("Dash.lua téléchargé : copié dans l'addon par Appliquer-Auto (ou lance Appliquer.bat), puis /reload en jeu");
}

// ---------- Synchronisation GitHub (données chiffrées par le script Windows) ----------
// Le repo est public : les fichiers data/*.json sont chiffrés (gzip, AES-256-CBC + HMAC-SHA256, clé PBKDF2-SHA256).
// Le mot de passe ne quitte jamais l'appareil ; il est retenu en local si la case est cochée.
const GH = {repo:"Zazahkel-Gringotts/Gringotts", branch:"main"};
const SYNC_LS = "gringotts-sync-v1";
const readSync = () => { try { return JSON.parse(localStorage.getItem(SYNC_LS) || "{}") || {}; } catch(e) { return {}; } };
const writeSync = o => { try { localStorage.setItem(SYNC_LS, JSON.stringify(o)); } catch(e) {} };
const sessGet = k => { try { return sessionStorage.getItem(k) || ""; } catch(e) { return ""; } };
const sessSet = (k, v) => { try { sessionStorage.setItem(k, v); } catch(e) {} };
const syncPass = () => readSync().pass || sessGet(SYNC_LS+"-pass");
const b64d = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const localDay = t => { const d = new Date(t*1000); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); };
const syncErr = (code, msg) => Object.assign(new Error(msg || code), {code});
let syncKeys = null, syncBusy = false, syncReportHtml = "";

async function ghGet(path){                        // API « contents » en brut : toujours à jour (pas de cache CDN)
  const r = await fetch(`https://api.github.com/repos/${GH.repo}/contents/${path}?ref=${GH.branch}`, {headers:{Accept:"application/vnd.github.raw+json"}, cache:"no-store"});
  if (r.status === 404) return null;
  if (!r.ok) throw syncErr(r.status === 403 || r.status === 429 ? "RATE" : "NET", "GitHub " + r.status);
  return r.text();
}
async function siteGet(path){ const r = await fetch(path, {cache:"no-cache"}); return r.ok ? r.text() : null; }
async function deriveKeys(pass, meta){
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveBits"]);
  const bits = new Uint8Array(await crypto.subtle.deriveBits({name:"PBKDF2", hash:"SHA-256", salt:b64d(meta.salt), iterations:meta.it}, base, 512));
  return {sig: pass+"|"+meta.salt+"|"+meta.it,
    enc: await crypto.subtle.importKey("raw", bits.slice(0, 32), "AES-CBC", false, ["decrypt"]),
    mac: await crypto.subtle.importKey("raw", bits.slice(32), {name:"HMAC", hash:"SHA-256"}, false, ["verify"])};
}
async function decryptFile(txt, keys){
  if (typeof DecompressionStream === "undefined") throw syncErr("OLD", "Navigateur trop ancien");
  const o = JSON.parse(txt), iv = b64d(o.iv), ct = b64d(o.ct);
  const both = new Uint8Array(iv.length + ct.length); both.set(iv); both.set(ct, iv.length);
  if (!(await crypto.subtle.verify("HMAC", keys.mac, b64d(o.mac), both))) throw syncErr("BADPASS", "Mot de passe incorrect");
  const zipped = await crypto.subtle.decrypt({name:"AES-CBC", iv}, keys.enc, ct);
  return new Response(new Blob([zipped]).stream().pipeThrough(new DecompressionStream("gzip"))).text();
}
function setSyncSt(msg){ const el = document.getElementById("syncSt"); if (el) el.textContent = msg; const m = document.getElementById("mobSt"); if (m) m.textContent = msg; }
function syncLabel(){
  const t = state.apiLast && state.apiLast.t ? state.apiLast.t*1000 : 0;
  if (!t) return syncPass() ? "Prix HV : pas encore reçus" : "Non connecté";
  const m = Math.max(0, Math.round((Date.now() - t)/60000));
  return `Prix HV du ${new Date(t).toLocaleString("fr-FR", {day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit"})} · il y a ${m < 1 ? "moins d'1 min" : m < 60 ? m+" min" : m < 2880 ? Math.round(m/60)+" h" : Math.round(m/1440)+" j"}`;
}
function refreshSyncSt(){ if (syncBusy) return; setSyncSt(syncLabel()); }
const SYNC_MSG = {BADPASS:"Mot de passe incorrect.", NODATA:"Aucune donnée publiée : lance un scan puis /reload en jeu.", RATE:"Limite GitHub atteinte, réessaie dans quelques minutes.", NET:"GitHub injoignable (réseau).", OLD:"Navigateur trop ancien pour le déchiffrement.", FORMAT:"Export illisible (version de l'addon ?)."};

async function syncNow(opts = {}){
  if (syncBusy) return {ok:false, skipped:true};
  const pass = opts.pass || syncPass(); if (!pass) { showLock(); return {ok:false, skipped:true}; }
  syncBusy = true; setSyncSt("Synchronisation…"); writeSync({...readSync(), lastTry: Date.now()});
  try {
    let meta = readSync().meta;
    const open = async () => {
      if (!meta) { const t = await ghGet("data/meta.json"); if (!t) throw syncErr("NODATA"); meta = JSON.parse(t); }
      if (!syncKeys || syncKeys.sig !== pass+"|"+meta.salt+"|"+meta.it) syncKeys = await deriveKeys(pass, meta);
    };
    await open();
    const [lt, it, at, ap] = await Promise.all([ghGet("data/latest.json"), ghGet("data/index.json"), ghGet("data/api.json").catch(() => null), ghGet("data/api-public.json").catch(() => null)]);
    if (!lt) throw syncErr("NODATA");
    let text;
    try { text = await decryptFile(lt, syncKeys); }
    catch(e) {                                     // sel changé (nouveau mot de passe côté script) : relire meta une fois
      if (e.code !== "BADPASS" || !readSync().meta) throw e;
      const t = await ghGet("data/meta.json"), m2 = t && JSON.parse(t);
      if (!m2 || m2.salt === meta.salt) throw e;
      meta = m2; syncKeys = null; await open(); text = await decryptFile(lt, syncKeys);
    }
    const ao = parseAddon(text); if (!ao) throw syncErr("FORMAT");
    const dateKey = localDay(ao.exported); let changed = false; syncReportHtml = addonReport(addonPlan(ao));
    if (!(state.addonLast && state.addonLast.t >= ao.exported)) {
      const plan = addonPlan(ao); plan.dateKey = dateKey;
      applyAddon(plan); compactImports(); rebuild();
      const val = M.comps.reduce((a,c) => a + (c.value||0), 0) + M.pnjRows.reduce((a,c) => a + (c.value||0), 0);
      state.valueHist = {...(state.valueHist||{}), [dateKey]: Math.round(val*10000)/10000}; changed = true;
    }
    // Prix de l'API Blizzard : plus récents que l'export, ils l'emportent
    // Deux sources : api.json (chiffré, Windows) et api-public.json (GitHub Actions) ; la plus ancienne d'abord, la plus récente l'emporte
    const apis = [];
    if (at) { try { const pa = parseApi(await decryptFile(at, syncKeys)); if (pa) apis.push(pa); } catch(e) {} }
    if (ap) { try { const pa = parseApi(ap); if (pa) apis.push(pa); } catch(e) {} }
    apis.sort((a, b) => a.t - b.t).forEach(pa => {
      if (Object.keys(pa.prices).length && !(state.apiLast && state.apiLast.t >= pa.t)) { applyApi(pa); compactImports(); rebuild(); changed = true; } });
    // Jours manquants (appareil neuf, ou pas ouvert depuis longtemps) : prix seuls, fichiers p-AAAA-MM-JJ.json
    const idx = it ? JSON.parse(it) : {days:[]}, lim = localDay(Date.now()/1000 - (state.settings.keepDays||90)*86400), floor = state.noHistoryBefore || "";
    const todo = (idx.days || []).filter(d => d >= lim && d >= floor && d !== dateKey && !state.imports[d]);
    for (let i = 0; i < todo.length; i += 5) await Promise.all(todo.slice(i, i+5).map(async d => {
      try { let pr = {};
        try { const tx = await siteGet(`data/p-${d}.json`); if (tx) { const pa = parseAddon(await decryptFile(tx, syncKeys)); if (pa) pr = pa.prices; } } catch(e) {}
        try { const tp = await siteGet(`data/pp-${d}.json`); if (tp) { const pa = parseAddon(tp); if (pa) pr = {...pr, ...pa.prices}; } } catch(e) {}
        if (Object.keys(pr).length) { state.imports[d] = pr; changed = true; } } catch(e) {} }));
    if (changed) { compactImports(); rebuild(); persist(); render(); }
    writeSync({...readSync(), meta, lastOk: Date.now(), exp: ao.exported, ...(syncReportHtml ? {report: syncReportHtml} : {})});
    refreshSyncSt(); if (opts.manual) toast(changed ? "Synchronisé : données mises à jour" : "Déjà à jour");
    return {ok:true, changed};
  } catch(e) {
    const code = e && e.code || "NET", msg = SYNC_MSG[code] || ("Échec : " + (e && e.message));
    if (code === "BADPASS") { const c = readSync(); delete c.pass; writeSync(c); sessSet(SYNC_LS+"-pass", ""); syncKeys = null; showLock(msg); }
    setSyncSt(msg); if (opts.manual && code !== "BADPASS") toast(msg);
    return {ok:false, code, msg};
  } finally { syncBusy = false; }
}
function showLock(msg){ const el = document.getElementById("lock"); if (!el) return; el.hidden = false; document.getElementById("lockMsg").textContent = msg || ""; setTimeout(() => { try { document.getElementById("lockPw").focus(); } catch(e) {} }, 50); }
function hideLock(){ const el = document.getElementById("lock"); if (el) el.hidden = true; }
const GH_TOK_LS = "gringotts-ghtok";
const ghTok = () => { try { return localStorage.getItem(GH_TOK_LS) || ""; } catch(e) { return ""; } };
function refreshRefBtn(){ const b = document.getElementById("refBtn"); if (b) b.hidden = !ghTok(); }
let refBusy = false;
async function refreshPrices(){
  if (refBusy) return; const tok = ghTok(); if (!tok) { toast("Ajoute d'abord un jeton GitHub dans Réglages"); return; }
  refBusy = true; const b = document.getElementById("refBtn"); if (b) b.disabled = true;
  try {
    const prev = (state.apiLast && state.apiLast.t) || 0;
    setSyncSt("Prix : lancement sur GitHub…");
    const r = await fetch(`https://api.github.com/repos/${GH.repo}/actions/workflows/prix-hv.yml/dispatches`, {method:"POST",
      headers:{"Authorization":"Bearer "+tok, "Accept":"application/vnd.github+json", "X-GitHub-Api-Version":"2022-11-28"}, body: JSON.stringify({ref: GH.branch})});
    if (r.status !== 204) {
      const m = r.status===401 ? "jeton invalide ou expiré" : r.status===403 || r.status===404 ? "jeton sans accès à ce dépôt ou sans la permission Actions : écriture" : r.status===422 ? "workflow introuvable ou non déclenchable" : "HTTP "+r.status;
      toast("Échec du lancement : " + m); setSyncSt("Échec du lancement des prix"); return; }
    const t0 = Date.now();
    while (Date.now() - t0 < 300000) {
      await new Promise(res => setTimeout(res, 12000));
      setSyncSt("Prix : récupération en cours… " + Math.round((Date.now()-t0)/1000) + " s");
      let pa = null; try { pa = parseApi(await ghGet("data/api-public.json")); } catch(e) {}
      if (pa && pa.t > prev) { syncBusy = false; const res = await syncNow({manual:true}); if (res && res.ok) toast("Prix HV mis à jour (" + Object.keys(pa.prices).length + " prix)"); return; }
    }
    toast("Pas de nouveaux prix après 5 min : vérifie l'onglet Actions sur GitHub"); setSyncSt("Prix : délai dépassé");
  } catch(e) { toast("Échec : " + (e && e.message || "réseau")); setSyncSt("Échec du lancement des prix"); }
  finally { refBusy = false; if (b) b.disabled = false; }
}
function initSync(){
  refreshRefBtn(); document.getElementById("refBtn").addEventListener("click", refreshPrices);
  document.addEventListener("click", e => {
    const t = e.target && e.target.id;
    if (t === "ghTokSave") { const v = (document.getElementById("ghTok").value || "").trim(); if (!v) return; try { localStorage.setItem(GH_TOK_LS, v); } catch(x) {} refreshRefBtn(); toast("Jeton enregistré"); render(); }
    if (t === "ghTokDel") { try { localStorage.removeItem(GH_TOK_LS); } catch(x) {} refreshRefBtn(); toast("Jeton supprimé"); render(); }
  });
  document.getElementById("syncBtn").addEventListener("click", () => syncNow({manual:true}));
  document.getElementById("lockSkip").addEventListener("click", e => { e.preventDefault(); sessSet(SYNC_LS+"-skip", "1"); hideLock(); });
  document.getElementById("lockForm").addEventListener("submit", async e => {
    e.preventDefault(); const pw = document.getElementById("lockPw").value; if (!pw) return;
    const btn = document.getElementById("lockGo"); btn.disabled = true; document.getElementById("lockMsg").textContent = "Vérification…";
    const r = await syncNow({pass:pw, manual:false}); btn.disabled = false;
    if (r.ok) { if (document.getElementById("lockRem").checked) writeSync({...readSync(), pass: pw}); else sessSet(SYNC_LS+"-pass", pw);
      document.getElementById("lockPw").value = ""; hideLock(); refreshSyncSt(); }
    else if (!r.skipped) document.getElementById("lockMsg").textContent = r.msg || "";
  });
  refreshSyncSt();
  if (syncPass()) syncNow({}); else if (!sessGet(SYNC_LS+"-skip")) showLock();
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") { refreshSyncSt(); if (syncPass() && Date.now() - (readSync().lastTry||0) > 120000) syncNow({}); } });
  setInterval(() => { if (document.visibilityState === "visible" && syncPass()) syncNow({}); }, 300000);
  setInterval(refreshSyncSt, 30000);
}

// ---------- Navigation ----------
function route(){ const h = location.hash.replace("#",""); current = views[h] ? h : "controle"; closeDrawer(); render(); window.scrollTo(0,0); }
window.addEventListener("hashchange", route);
rebuild(); route();
initSync();
})();
if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register("sw.js").catch(() => {});
