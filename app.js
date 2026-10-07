const STORAGE_KEY = "klascode.demo.v1";
const MICROBIT_URL = "https://makecode.microbit.org/";
const seeded = {
  activity: "Micro:bit Magic",
  roomName: "Groep 7 · Maaklab",
  joinCode: "BLOEM-ROBOT-PAARS",
  pin: "482 193",
  paused: false,
  activeTab: "dashboard",
  selectedStudent: "s1",
  students: [
    {id:"s1",name:"Noor",status:"In de klas",feeling:"",lastSeen:"Net actief",code:"Hartje laten zien",project:null},
    {id:"s2",name:"Milan",status:"In de klas",feeling:"",lastSeen:"Net actief",code:"Knop A gebruiken",project:null},
    {id:"s3",name:"Sofia",status:"Klaar",feeling:"🙂",lastSeen:"1 min geleden",code:"Dobbelsteen",project:null},
    {id:"s4",name:"Daan",status:"Offline",feeling:"",lastSeen:"3 min geleden",code:"Hartje laten zien",project:null},
    {id:"s5",name:"Lina",status:"In de klas",feeling:"",lastSeen:"Net actief",code:"Temperatuur meten",project:null}
  ],
  startedAt: new Date().toISOString(),
  starterCode: "Bij start\n  toon patroon: hartje\n\nAltijd\n  pauzeer (ms): 500",
  starterProject: null,
  version: 1
};

let state = loadState();
let toastTimer;
let editorContext = null;
let editorFrame = null;
const app = document.querySelector("#app");
const toastNode = document.querySelector("#toast");

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? {...structuredClone(seeded), ...saved} : structuredClone(seeded);
  } catch { return structuredClone(seeded); }
}
function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function esc(value="") { return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;", "'":"&#39;"}[c])); }
function initials(name) { return name.trim().split(/\s+/).map(s=>s[0]).join("").slice(0,2).toUpperCase(); }
function notify(message) {
  toastNode.textContent=message; toastNode.classList.add("show");
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>toastNode.classList.remove("show"),2600);
}
function setState(patch) { state={...state,...patch}; persist(); render(); }
window.addEventListener("storage", event=>{
  if(event.key!==STORAGE_KEY)return;
  const studentId=sessionStorage.getItem("klascode.student");
  const previous=studentId?state.students.find(s=>s.id===studentId)?.project:null;
  state=loadState();
  if(studentId){
    const student=state.students.find(s=>s.id===studentId);
    if(student?.incomingProject) showSharedProjectPrompt(student.id,student.incomingProject);
    else if(student?.project && JSON.stringify(previous)!==JSON.stringify(student.project)) importProject(student.project);
    const status=document.querySelector(".student-view .status");
    if(status){status.textContent=state.paused?"Gepauzeerd":"In de klas";status.className=`status ${state.paused?"paused":""}`;}
    return;
  }
  render();
});
function statusClass(s) { return s === "Offline" ? "offline" : s === "Klaar" ? "finished" : state.paused ? "paused" : ""; }
function selected() { return state.students.find(s=>s.id===state.selectedStudent) || state.students[0]; }
function heading(kicker,title,sub) { return `<div class="toolbar"><div><div class="eyebrow">${kicker}</div><h1>${title}</h1><p class="subtitle">${sub}</p></div><div class="spacer"></div><button class="button secondary" data-action="save-session">Bewaar klas</button></div>`; }
function nav() {
  const tabs=[["dashboard","Klasoverzicht"],["code","Code bekijken"],["editor","Startcode"]];
  return `<nav class="tabs" aria-label="Klasnavigatie">${tabs.map(([id,label])=>`<button class="tab" data-tab="${id}" aria-selected="${state.activeTab===id}">${label}</button>`).join("")}</nav>`;
}
function studentRows() {
  if(!state.students.length) return `<div class="empty">Er zijn nog geen leerlingen. Deel de klascode om te beginnen.</div>`;
  return `<div class="student-list">${state.students.map(s=>`<div class="student ${s.id===state.selectedStudent?"selected":""}" data-select="${s.id}">
    <input type="checkbox" aria-label="Selecteer ${esc(s.name)}" data-check="${s.id}" ${s.id===state.selectedStudent?"checked":""}>
    <div class="student-main"><div class="avatar">${esc(initials(s.name))}</div><div><div class="student-name">${esc(s.name)}</div><div class="student-meta">${esc(s.lastSeen)}${s.feeling?` · Gevoel: ${s.feeling}`:""}</div></div></div>
    <span class="status ${statusClass(s.status)}">${state.paused&&s.status!=="Offline"?"Gepauzeerd":esc(s.status)}</span>
    <button class="icon-button" data-action="edit-student" data-id="${s.id}" aria-label="Bewerk ${esc(s.name)}">⋯</button>
  </div>`).join("")}</div>`;
}
function dashboard() {
  const active=state.students.filter(s=>s.status!=="Offline").length;
  const finished=state.students.filter(s=>s.status==="Klaar").length;
  return `${heading("DOCENT · LIVE KLAS",state.activity,"Volg het werk van je leerlingen en help wanneer dat nodig is.")}${nav()}
  <div class="layout"><section class="stack">
    <article class="card"><div class="card-heading"><div><h2>Leerlingen</h2><p class="subtitle">${active} actief · ${finished} klaar</p></div><div class="actions"><button class="button secondary small" data-action="pause">${state.paused?"Hervat klas":"Pauzeer klas"}</button><button class="button small" data-tab="editor">Deel startcode</button></div></div>
      <div class="stats"><div class="stat"><strong>${state.students.length}</strong><span>Leerlingen</span></div><div class="stat"><strong>${active}</strong><span>In de klas</span></div><div class="stat"><strong>${finished}</strong><span>Hebben afgerond</span></div></div>
      ${studentRows()}<div class="notice-line">Klik op een leerling om de code te bekijken. Je kunt leerlingen ook selecteren om startcode te delen.</div>
    </article>
    <article class="card"><div class="card-heading"><div><h2>Wat gebeurt er nu?</h2><p class="subtitle">Een kort overzicht voor jou als docent.</p></div></div>
      <div class="notice"><span>●</span><div><strong>${state.paused?"De klas is gepauzeerd.":"De klas is open."}</strong><br>${state.paused?"Leerlingen kunnen tijdelijk niet verder werken.":"Leerlingen kunnen met hun eigen code aan de slag."}</div></div>
      <div class="invite-box"><div class="invite-value"><span>Klascode</span><strong class="join-code">${esc(state.joinCode)}</strong></div><div class="invite-value"><span>Toegangscode</span><strong class="pin">${esc(state.pin)}</strong></div></div>
    </article>
  </section><aside class="stack">
    <article class="card"><div class="card-heading"><div><h2>Leerling uitnodigen</h2><p class="subtitle">Deel deze gegevens met de klas.</p></div></div><div class="field"><label for="join-link">Deellink</label><input id="join-link" readonly value="${esc(location.origin+location.pathname)}?join=${esc(state.joinCode)}"></div><div class="actions"><button class="button secondary" data-action="copy-link">Kopieer link</button><button class="button secondary" data-action="copy-code">Kopieer klascode</button></div><div class="notice-line">In deze eerste demo werkt de klas op dit apparaat. Online samen werken komt in de serverversie.</div></article>
    <article class="card"><div class="card-heading"><div><h2>Bewaren en terugkijken</h2><p class="subtitle">Houd werk en voortgang bij.</p></div></div><div class="stack"><button class="button secondary" data-action="save-session">Download klasbestand</button><button class="button secondary" data-action="restore">Open klasbestand</button><button class="button secondary" data-action="report">Download voortgangsrapport</button><button class="button danger" data-action="end-session">Beëindig deze klas</button></div></article>
  </aside></div>`;
}
function codeTab() {
 const s=selected();
 if(!s) return `${heading("DOCENT","Code bekijken","Selecteer een leerling in het klasoverzicht.")}${nav()}<div class="empty">Er is nog geen leerling geselecteerd.</div>`;
 return `${heading("DOCENT · LEERLINGWERK",s.name,`Laatste activiteit: ${esc(s.lastSeen)}${s.feeling?` · Gevoel: ${s.feeling}`:""}`)}${nav()}
 <div class="layout"><section class="stack"><article class="card"><div class="card-heading"><div><h2>Werk van ${esc(s.name)}</h2><p class="subtitle">${esc(s.code)} · Laatste opslaan ${esc(s.lastSeen)}</p></div><span class="status ${statusClass(s.status)}">${esc(s.status)}</span></div>
  <div class="makecode-host"><iframe id="makecode-editor" title="MakeCode-editor van ${esc(s.name)}" src="https://makecode.microbit.org/?controller=1" allow="usb; serial; clipboard-read; clipboard-write"></iframe></div>
  <div class="actions" style="margin-top:16px"><button class="button" data-action="share-to-student" data-id="${s.id}">Deel startcode met ${esc(s.name)}</button><a class="button secondary" href="${MICROBIT_URL}" target="_blank" rel="noopener">Open MakeCode ↗</a></div></article></section>
 <aside class="stack"><article class="card"><h2>Leerlingcode sturen</h2><p class="subtitle">Kies leerlingen die deze startcode moeten krijgen.</p><div class="student-list" style="margin:14px 0">${state.students.map(x=>`<label class="student"><input type="checkbox" data-send-select="${x.id}" ${x.id===s.id?"checked":""}><span class="student-name">${esc(x.name)}</span><span class="status ${statusClass(x.status)}">${esc(x.status)}</span></label>`).join("")}</div><button class="button" data-action="share-selected">Deel met geselecteerden</button></article>
 <article class="card"><h2>Leerling aanpassen</h2><div class="actions"><button class="button secondary" data-action="mark-progress" data-id="${s.id}">Zet op ‘In de klas’</button><button class="button secondary" data-action="mark-finished" data-id="${s.id}">Zet op ‘Klaar’</button><button class="button danger" data-action="remove-student" data-id="${s.id}">Verwijder leerling</button></div></article></aside></div>`;
}
function editorTab() {
 return `${heading("DOCENT · STARTCODE","Wat zien leerlingen als ze starten?","Zet een eerste stap klaar die de klas verder kan onderzoeken.")}${nav()}
 <div class="layout"><section class="stack"><article class="card"><div class="card-heading"><div><h2>Startcode voor de klas</h2><p class="subtitle">Gebruik de MakeCode-blokken om de eerste opdracht klaar te zetten.</p></div></div><div class="makecode-host"><iframe id="makecode-editor" title="MakeCode-editor voor de startcode" src="https://makecode.microbit.org/?controller=1" allow="usb; serial; clipboard-read; clipboard-write"></iframe></div></article>
 <article class="card"><h2>Deel de startcode</h2><div class="field"><label for="starter-code">Korte uitleg voor leerlingen</label><textarea id="starter-code">${esc(state.starterCode)}</textarea><small>De echte blokken worden met geselecteerde leerlingen gedeeld. Zij kunnen de code eerst bekijken en verder aanpassen.</small></div><div class="actions"><button class="button" data-action="save-starter">Bewaar startcode</button><button class="button teal" data-action="share-all">Deel met alle leerlingen</button><button class="button secondary" data-action="share-selected">Deel met geselecteerden</button></div></article></section>
 <aside class="stack"><article class="card"><h2>Deel met leerlingen</h2><p class="subtitle">Kies wie de startcode mag ontvangen.</p><div class="student-list" style="margin:14px 0">${state.students.map(x=>`<label class="student"><input type="checkbox" data-send-select="${x.id}"><span class="student-name">${esc(x.name)}</span><span class="status ${statusClass(x.status)}">${esc(x.status)}</span></label>`).join("")}</div><div class="field"><label>Activiteit</label><input value="${esc(state.activity)}" readonly></div><button class="button secondary" data-action="share-selected">Deel met geselecteerden</button></article><article class="card"><h2>Over deze demo</h2><p class="subtitle">Projecten worden lokaal opgeslagen. De volgende bouwstap voegt synchronisatie tussen apparaten toe.</p></article></aside></div>`;
}
function joinView() {
 return `<div class="student-view">${heading("LEERLING","Doe mee met de klas","Vul je naam in zodat de docent je werk kan volgen.")}<article class="card"><div class="field"><label for="student-name-input">Jouw naam</label><input id="student-name-input" autocomplete="given-name" maxlength="40" placeholder="Bijvoorbeeld Sam"></div><button class="button" data-action="join-class">Ga naar de klas</button><p class="help" style="margin-top:14px">Klascode: <strong>${esc(state.joinCode)}</strong></p></article></div>`;
}
function studentWorkspace() {
 const studentId=sessionStorage.getItem("klascode.student");
 const s=state.students.find(item=>item.id===studentId) || selected();
 const label=`LEERLING · ${esc(s?.name||"")}`;
 return `<div class="student-view">${heading(label,state.activity,"Je werkt in de klas van je docent.")}
 <article class="card"><div class="card-heading"><div><h2>Jouw werk</h2><p class="subtitle">${state.paused?"De docent heeft de klas tijdelijk gepauzeerd.":"Probeer de startcode uit en maak er iets van jezelf van."}</p></div><span class="status ${state.paused?"paused":""}">${state.paused?"Gepauzeerd":"In de klas"}</span></div>
 <div class="progress"><span></span></div><div class="makecode-host"><iframe id="makecode-editor" title="MakeCode-editor voor ${esc(s?.name||"leerling")}" src="https://makecode.microbit.org/?controller=1" allow="usb; serial; clipboard-read; clipboard-write"></iframe></div>
 <div class="actions" style="margin-top:16px"><button class="button" data-action="finish">Ik ben klaar</button><button class="button secondary" data-action="leave">Verlaat de klas</button></div><p class="help" style="margin-top:12px">Als je klaar bent, geef je aan hoe de opdracht ging. Alleen jouw docent ziet dit antwoord.</p></article></div>`;
}
function render() {
 const params=new URLSearchParams(location.search);
 if(params.has("join") && !sessionStorage.getItem("klascode.student")) { app.innerHTML=joinView(); return; }
 if(sessionStorage.getItem("klascode.student")) app.innerHTML=studentWorkspace();
 else app.innerHTML=state.activeTab==="code"?codeTab():state.activeTab==="editor"?editorTab():dashboard();
 const frame=document.querySelector("#makecode-editor");
 if(frame){
   editorFrame=frame;
   const studentId=sessionStorage.getItem("klascode.student");
   editorContext=studentId?{kind:"student",id:studentId}:state.activeTab==="code"?{kind:"student",id:state.selectedStudent}:{kind:"teacher"};
   frame.addEventListener("load",()=>{
     if(editorContext?.kind==="student"){
       const current=state.students.find(s=>s.id===editorContext.id);
       importProject(current?.project || state.starterProject || null);
     }else importProject(state.starterProject || null);
   },{once:true});
 }
 const studentId=sessionStorage.getItem("klascode.student");
 const incoming=studentId&&state.students.find(s=>s.id===studentId)?.incomingProject;
 if(incoming)setTimeout(()=>showSharedProjectPrompt(studentId,incoming),0);
}
function download(name,content,type="application/json") {
 const blob=new Blob([content],{type}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function selectIds(attr) { return [...document.querySelectorAll(`[${attr}]:checked`)].map(el=>el.getAttribute(attr)); }
function baseProject() {
 const header={target:"microbit",name:"KlasCode",editor:"blocksprj",id:crypto.randomUUID(),recentUse:Date.now(),modificationTime:Date.now(),meta:{}};
 const text={"main.blocks":"<xml xmlns=\"http://www.w3.org/1999/xhtml\"><block type=\"pxt-on-start\" id=\"klascode-start\" x=\"30\" y=\"30\"></block></xml>","main.ts":"\n","README.md":"KlasCode-startcode","pxt.json":JSON.stringify({name:"klascode",dependencies:{core:"*"},files:["main.blocks","main.ts","README.md"]},null,2)};
 return {header,text};
}
function importProject(project) {
 if(!editorFrame?.contentWindow)return;
 const message={type:"pxteditor",id:crypto.randomUUID(),action:"importexternalproject",project:project||baseProject(),response:true};
 editorFrame.contentWindow.postMessage(message,"https://makecode.microbit.org");
}
function persistProject(project) {
 if(!project)return;
 if(editorContext?.kind==="student"){
   state.students=state.students.map(s=>s.id===editorContext.id?{...s,project,code:"MakeCode-project",lastSeen:"Net opgeslagen",status:state.paused?"Gepauzeerd":"In de klas"}:s);
 }else state.starterProject=project;
 localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
}
window.addEventListener("message",event=>{
 if(event.origin!=="https://makecode.microbit.org" || event.source!==editorFrame?.contentWindow)return;
 const msg=event.data||{};
 if(msg.type==="pxthost"&&msg.action==="workspacesync"){
   const project=editorContext?.kind==="student"?state.students.find(s=>s.id===editorContext.id)?.project:state.starterProject;
   const projects=project?[project]:[];
   event.source.postMessage({type:"pxthost",action:"workspacesync",projects},event.origin);
 }
 if(msg.type==="pxthost"&&msg.action==="workspacesave"&&msg.project)persistProject(msg.project);
 if(msg.download){const blob=new Blob([msg.download],{type:"application/octet-stream"});const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download=`${msg.name||"KlasCode"}.hex`;link.click();URL.revokeObjectURL(url);}
});
function share(ids) {
 if(!ids.length){notify("Selecteer eerst een leerling.");return;}
 const source=editorContext?.kind==="student"?state.students.find(s=>s.id===editorContext.id)?.project:state.starterProject;
 if(!source){notify("Maak eerst een project in MakeCode en wacht tot het is opgeslagen.");return;}
 state.students=state.students.map(s=>ids.includes(s.id)?{...s,incomingProject:source,code:"Nieuwe startcode",lastSeen:"Startcode klaar"}:s);
  persist();notify(`MakeCode-project gedeeld met ${ids.length} leerling${ids.length===1?"":"en"}.`);
}
function showSharedProjectPrompt(studentId,project) {
 if(document.querySelector("[data-share-prompt]"))return;
 const wrap=document.createElement("div");wrap.className="modal-backdrop";wrap.dataset.sharePrompt="true";
 wrap.innerHTML=`<section class="modal" role="dialog" aria-modal="true" aria-labelledby="shared-project-title"><h2 id="shared-project-title">Je docent deelt nieuwe code</h2><p class="subtitle">Als je de code opent, vervangt die wat nu in jouw werkruimte staat.</p><div class="modal-actions"><button class="button secondary" data-share-decline>Nu niet</button><button class="button" data-share-accept>Open de startcode</button></div></section>`;
 document.body.append(wrap);
 wrap.addEventListener("click",event=>{
   if(event.target===wrap||event.target.closest("[data-share-decline]")){
     state.students=state.students.map(s=>s.id===studentId?{...s,incomingProject:null}:s);persist();wrap.remove();return;
   }
   if(event.target.closest("[data-share-accept]")){
     state.students=state.students.map(s=>s.id===studentId?{...s,project,incomingProject:null,code:"Startcode geopend",lastSeen:"Net actief"}:s);persist();importProject(project);wrap.remove();notify("De startcode staat in je werkruimte.");
   }
 });
}
function report() {
 const rows=state.students.map(s=>`<tr><td>${esc(s.name)}</td><td>${esc(s.status)}</td><td>${esc(s.code)}</td><td>${esc(s.feeling||"—")}</td><td>${esc(s.lastSeen)}</td></tr>`).join("");
 const html=`<!doctype html><html><head><meta charset="utf-8"><title>Voortgang ${esc(state.activity)}</title><style>body{font:14px Arial;color:#261f2c}h1{color:#4c325b}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f7f6f9}</style></head><body><h1>${esc(state.activity)} · Voortgang</h1><p>3Dindeklas · ${new Date().toLocaleDateString("nl-NL")}</p><table><thead><tr><th>Leerling</th><th>Status</th><th>Werk</th><th>Gevoel</th><th>Actief</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
 download(`KlasCode-rapport-${new Date().toISOString().slice(0,10)}.doc`,html,"application/msword");
}
app.addEventListener("click", async event=>{
 const tab=event.target.closest("[data-tab]");
 if(tab){ if(tab.dataset.tab==="code"&&!state.selectedStudent&&state.students[0]) state.selectedStudent=state.students[0].id; setState({activeTab:tab.dataset.tab}); return; }
 const item=event.target.closest("[data-select]"); if(item&&!event.target.matches("input,button")){state.selectedStudent=item.dataset.select;state.activeTab="code";persist();render();return;}
 const btn=event.target.closest("[data-action]"); if(!btn)return;
 const id=btn.dataset.id;
 switch(btn.dataset.action){
 case "pause": {const paused=!state.paused;setState({paused});notify(paused?"De klas is gepauzeerd.":"De klas is hervat.");break;}
 case "save-session": download(`KlasCode-${state.activity.replace(/[^a-z0-9]+/gi,"-")}.json`,JSON.stringify(state,null,2));notify("Je klasbestand is gedownload.");break;
 case "restore": document.querySelector("#restore-file").click();break;
 case "report": report();break;
 case "end-session": if(confirm("Beëindig je deze klas? Je kunt eerst een klasbestand downloaden.")){download(`KlasCode-${state.activity}.json`,JSON.stringify(state,null,2));state=structuredClone(seeded);persist();render();notify("De klas is beëindigd.");}break;
 case "copy-link": await navigator.clipboard?.writeText(document.querySelector("#join-link")?.value||location.href);notify("De deellink is gekopieerd.");break;
 case "copy-code": await navigator.clipboard?.writeText(state.joinCode);notify("De klascode is gekopieerd.");break;
 case "save-starter": state.starterCode=document.querySelector("#starter-code").value;persist();notify("Je startidee is bewaard.");break;
 case "share-all": share(state.students.map(s=>s.id));break;
 case "share-selected": share(selectIds("data-send-select"));break;
 case "share-to-student": share([id]);break;
 case "mark-progress": state.students=state.students.map(s=>s.id===id?{...s,status:"In de klas"}:s);persist();render();notify("Status aangepast.");break;
 case "mark-finished": state.students=state.students.map(s=>s.id===id?{...s,status:"Klaar"}:s);persist();render();notify("Status aangepast.");break;
 case "remove-student": if(confirm("Deze leerling uit de klas verwijderen?")){state.students=state.students.filter(s=>s.id!==id);state.selectedStudent=state.students[0]?.id||null;persist();render();notify("Leerling verwijderd.");}break;
 case "edit-student": {const s=state.students.find(x=>x.id===id);const name=prompt("Pas de naam aan",s?.name||"");if(name?.trim()){state.students=state.students.map(x=>x.id===id?{...x,name:name.trim()}:x);persist();render();notify("Naam aangepast.");}break;}
 case "join-class": {const name=document.querySelector("#student-name-input").value.trim();if(!name){notify("Vul eerst je naam in.");return;}let s=state.students.find(x=>x.name.toLowerCase()===name.toLowerCase());if(!s){s={id:crypto.randomUUID(),name,status:"In de klas",feeling:"",lastSeen:"Net actief",code:"Startcode ontvangen",project:state.starterProject};state.students=[...state.students,s];persist();}sessionStorage.setItem("klascode.student",s.id);history.replaceState({},"",location.pathname);render();break;}
 case "finish": showFinishDialog();break;
 case "leave": sessionStorage.removeItem("klascode.student");render();break;
 }
});
document.querySelector("#restore-file").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;try{const loaded=JSON.parse(await file.text());if(!Array.isArray(loaded.students))throw new Error("Onjuist bestand");state={...structuredClone(seeded),...loaded,joinCode:"KLAAR-MAAN-ROBOT",pin:String(Math.floor(100000+Math.random()*900000)).replace(/(\d{3})(\d{3})/,"$1 $2"),paused:false};persist();render();notify("Klas hervat. De nieuwe klascode staat klaar.");}catch{notify("Dit klasbestand kan niet worden geopend.");}e.target.value="";});
function showFinishDialog(){const wrap=document.createElement("div");wrap.className="modal-backdrop";wrap.innerHTML=`<section class="modal" role="dialog" aria-modal="true" aria-labelledby="finish-title"><h2 id="finish-title">Hoe ging de opdracht?</h2><p class="subtitle">Kies het gezicht dat het beste bij jou past.</p><div class="range" role="group" aria-label="Geef aan hoe de opdracht ging"><button data-feel="😕" aria-pressed="false">😕</button><button data-feel="😐" aria-pressed="false">😐</button><button data-feel="🙂" aria-pressed="true">🙂</button></div><div class="modal-actions"><button class="button secondary" data-close>Terug</button><button class="button" data-submit-feeling>Verstuur</button></div></section>`;document.body.append(wrap);let feeling="🙂";wrap.addEventListener("click",e=>{const feel=e.target.closest("[data-feel]");if(feel){feeling=feel.dataset.feel;wrap.querySelectorAll("[data-feel]").forEach(b=>b.setAttribute("aria-pressed",String(b===feel)));}if(e.target.closest("[data-close]")||e.target===wrap)wrap.remove();if(e.target.closest("[data-submit-feeling]")){const id=sessionStorage.getItem("klascode.student");state.students=state.students.map(s=>s.id===id?{...s,status:"Klaar",feeling}:s);persist();sessionStorage.removeItem("klascode.student");wrap.remove();render();notify("Je werk is ingeleverd. Bedankt!");}});}

render();
