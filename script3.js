
// ============================================
// 🔥 FIREBASE CONFIG - REMPLACEZ PAR VOS VALEURS
// ============================================
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_PROJECT.firebaseapp.com",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_PROJECT.appspot.com",
  messagingSenderId: "VOTRE_SENDER_ID",
  appId: "VOTRE_APP_ID"
};
// ============================================

var FIREBASE_READY=false,db=null,storage=null;
if(hasFirebaseConfig()){
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  storage = firebase.storage();
  FIREBASE_READY=true;
  db.enablePersistence().catch(function(err) { console.log("Persistence error:", err); });
}

(function(){
var RUB=[{id:"mobilier",n:"Mobilier",i:"🪑",c:"#6366f1"},{id:"accessoires",n:"Accessoires",i:"🎭",c:"#ec4899"},{id:"regie",n:"Régie",i:"🏢",c:"#14b8a6"},{id:"luminaires",n:"Luminaires",i:"💡",c:"#f59e0b"},{id:"deco",n:"Déco",i:"🖼️",c:"#8b5cf6"},{id:"textiles",n:"Textiles",i:"🧵",c:"#ef4444"},{id:"graphiques",n:"Graphiques",i:"📋",c:"#06b6d4"},{id:"consommables",n:"Consommables",i:"📦",c:"#64748b"}];
var STAT=[{id:"a_sourcer",l:"À sourcer",c:"#64748b"},{id:"en_recherche",l:"En recherche",c:"#f59e0b"},{id:"valide",l:"Validé",c:"#3b82f6"},{id:"reserve",l:"Réservé",c:"#6366f1"},{id:"loue",l:"Loué",c:"#ec4899"},{id:"livre",l:"Livré",c:"#14b8a6"},{id:"installe",l:"Installé",c:"#10b981"},{id:"restitue",l:"Restitué",c:"#22c55e"}];
var STATD=[{id:"a_preparer",l:"À préparer",c:"#64748b"},{id:"en_cours",l:"En cours",c:"#f59e0b"},{id:"pret",l:"Prêt",c:"#10b981"},{id:"en_tournage",l:"En tournage",c:"#6366f1"},{id:"termine",l:"Terminé",c:"#22c55e"}];
var TPROJ=[{id:"film",l:"Film",i:"🎬"},{id:"serie",l:"Série",i:"📺"},{id:"pub",l:"Pub",i:"📢"},{id:"clip",l:"Clip",i:"🎵"},{id:"autre",l:"Autre",i:"📁"}];
var TDEP=[{id:"location",l:"Location"},{id:"achat",l:"Achat"},{id:"transport",l:"Transport"},{id:"fabrication",l:"Fabrication"},{id:"autre",l:"Autre"}];

// State
var CODE = localStorage.getItem("dp_code") || null;
var D = {projets:[],loueurs:[],depenses:[]};
var V="home",P=null,DC=null,EL=null,LO=null,RB=null,M=null,MN=false,TB="rub",VW=null,VWC=null,VWI=0,SQ="",GSQ="",PHS=[],EDIT=null,MORE=false;
var ONLINE = navigator.onLine;
var SYNCING = false;
var UNSUB = null;
var LTAB = "join";
var RENTTAB="decor",PORTFOLIO_FILTER="all";

window.addEventListener("online", function(){ONLINE=true;R();});
window.addEventListener("offline", function(){ONLINE=false;R();});

function gs(id){for(var i=0;i<STAT.length;i++)if(STAT[i].id===id)return STAT[i];return STAT[0]}
function gsd(id){for(var i=0;i<STATD.length;i++)if(STATD[i].id===id)return STATD[i];return STATD[0]}
function gr(id){for(var i=0;i<RUB.length;i++)if(RUB[i].id===id)return RUB[i];return null}
function gt(id){for(var i=0;i<TPROJ.length;i++)if(TPROJ[i].id===id)return TPROJ[i];return TPROJ[0]}
function gl(id){for(var i=0;i<D.loueurs.length;i++)if(D.loueurs[i].id===id)return D.loueurs[i];return null}
function fd(d){return d?new Date(d).toLocaleDateString("fr-FR",{day:"numeric",month:"short"}):"-"}
function fm(n){return new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR"}).format(n||0)}
function uid(){return Date.now().toString(36)+Math.random().toString(36).substr(2,5)}
function genCode(){var c="";var chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";for(var i=0;i<6;i++)c+=chars[Math.floor(Math.random()*chars.length)];return c}
function hasFirebaseConfig(){return firebaseConfig&&firebaseConfig.projectId&&firebaseConfig.projectId.indexOf("VOTRE_")!==0}
function num(v){var n=parseFloat(v);return isNaN(n)?0:n}
function getRentalItems(){var items=[];for(var i=0;i<D.projets.length;i++){var p=D.projets[i];if(!p.decors)continue;for(var j=0;j<p.decors.length;j++){var d=p.decors[j];if(!d.elements)continue;for(var k=0;k<d.elements.length;k++){var e=d.elements[k];var isRental=!!(e.loueurId||e.coutLocation||e.coutReel||e.dateDepart||e.dateRetour||e.statut==="loue"||e.statut==="reserve"||e.statut==="livre"||e.statut==="restitue");if(isRental)items.push({e:e,d:d,p:p,lo:e.loueurId?gl(e.loueurId):null});}}}return items;}
function getDecorPortfolio(decor){var groups=[];for(var i=0;i<RUB.length;i++){var r=RUB[i],photos=[],items=[];if(decor&&decor.elements)for(var j=0;j<decor.elements.length;j++){var e=decor.elements[j];if(e.rubrique===r.id){items.push(e);if(e.photos)for(var k=0;k<e.photos.length;k++)photos.push({data:e.photos[k],nom:e.nom,elementId:e.id});}}if(items.length||photos.length)groups.push({rubrique:r,photos:photos,items:items});}return groups;}

// Firebase sync
function subscribeToProject(code){
  if(!FIREBASE_READY){var local=localStorage.getItem("decorpro_local_"+code);if(local){try{D=JSON.parse(local);}catch(e){D={projets:[],loueurs:[],depenses:[]};}}R();return;}
  if(UNSUB)UNSUB();
  SYNCING=true;R();
  
  UNSUB = db.collection("projects").doc(code).onSnapshot(function(doc){
    SYNCING=false;
    if(doc.exists){
      var data = doc.data();
      D.projets = data.projets || [];
      D.loueurs = data.loueurs || [];
      D.depenses = data.depenses || [];
      // Restore references
      if(P){var pid=P.id;P=null;for(var i=0;i<D.projets.length;i++)if(D.projets[i].id===pid){P=D.projets[i];break}}
      if(DC&&P&&P.decors){var did=DC.id;DC=null;for(var i=0;i<P.decors.length;i++)if(P.decors[i].id===did){DC=P.decors[i];break}}
      if(EL&&DC&&DC.elements){var eid=EL.id;EL=null;for(var i=0;i<DC.elements.length;i++)if(DC.elements[i].id===eid){EL=DC.elements[i];break}}
      R();
    }
  }, function(err){
    console.error("Firestore error:", err);
    SYNCING=false;R();
  });
}

function saveToFirebase(){
  if(!CODE)return;
  localStorage.setItem("decorpro_local_"+CODE,JSON.stringify(D));
  if(!FIREBASE_READY)return;
  SYNCING=true;R();
  db.collection("projects").doc(CODE).set({
    projets: D.projets,
    loueurs: D.loueurs,
    depenses: D.depenses,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(function(){
    SYNCING=false;R();
  }).catch(function(err){
    console.error("Save error:", err);
    SYNCING=false;R();
  });
}

function sv(){saveToFirebase();}

// Photo upload to Firebase Storage
function uploadPhoto(file, callback){
  var path = "projects/"+CODE+"/photos/"+uid()+"_"+file.name;
  var ref = storage.ref(path);
  var task = ref.put(file);
  
  task.on("state_changed", 
    function(snapshot){
      var pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      if(window.updateUploadProgress)window.updateUploadProgress(pct);
    },
    function(err){console.error("Upload error:",err);callback(null);},
    function(){
      task.snapshot.ref.getDownloadURL().then(function(url){
        callback(url);
      });
    }
  );
}

function getAlerts(){
  var today=new Date();today.setHours(0,0,0,0);
  var tomorrow=new Date(today);tomorrow.setDate(tomorrow.getDate()+1);
  var a={urgents:[],retards:[],nonPrets:[],aujourdhui:[],demain:[]};
  for(var i=0;i<D.projets.length;i++){var p=D.projets[i];if(!p.decors)continue;
    for(var j=0;j<p.decors.length;j++){var d=p.decors[j];if(!d.elements)continue;
      for(var k=0;k<d.elements.length;k++){var e=d.elements[k];
        if(e.urgent)a.urgents.push({e:e,d:d,p:p});
        if(e.dateJeu){var dj=new Date(e.dateJeu);dj.setHours(0,0,0,0);
          if(dj.getTime()===today.getTime())a.aujourdhui.push({e:e,d:d,p:p});
          else if(dj.getTime()===tomorrow.getTime())a.demain.push({e:e,d:d,p:p});
          if(dj<=tomorrow&&e.statut!=="installe"&&e.statut!=="livre")a.nonPrets.push({e:e,d:d,p:p});}
        if(e.dateRetour){var dr=new Date(e.dateRetour);dr.setHours(0,0,0,0);
          if(dr<today&&e.statut!=="restitue")a.retards.push({e:e,d:d,p:p});}}}}
  return a;
}

function search(q){
  if(!q||q.length<2)return[];q=q.toLowerCase();var r=[];
  for(var i=0;i<D.projets.length;i++){var p=D.projets[i];
    if(p.nom.toLowerCase().indexOf(q)>=0)r.push({t:"projet",item:p});
    if(p.decors)for(var j=0;j<p.decors.length;j++){var d=p.decors[j];
      if(d.nom.toLowerCase().indexOf(q)>=0)r.push({t:"decor",item:d,p:p});
      if(d.elements)for(var k=0;k<d.elements.length;k++){var e=d.elements[k];
        if(e.nom.toLowerCase().indexOf(q)>=0||(e.tags&&e.tags.toLowerCase().indexOf(q)>=0))r.push({t:"element",item:e,d:d,p:p});}}}
  for(var i=0;i<D.loueurs.length;i++)if(D.loueurs[i].nom.toLowerCase().indexOf(q)>=0)r.push({t:"loueur",item:D.loueurs[i]});
  return r.slice(0,15);
}

// Navigation
window.go=function(v,id){
  VW=null;VWC=null;GSQ="";
  if(v==="home"){V="home";P=null;DC=null;EL=null}
  else if(v==="proj"){for(var i=0;i<D.projets.length;i++)if(D.projets[i].id===id){P=D.projets[i];break}V="proj";DC=null;EL=null}
  else if(v==="dec"){if(P&&P.decors)for(var i=0;i<P.decors.length;i++)if(P.decors[i].id===id){DC=P.decors[i];break}V="dec";EL=null;TB="rub"}
  else if(v==="el"){if(DC&&DC.elements)for(var i=0;i<DC.elements.length;i++)if(DC.elements[i].id===id){EL=DC.elements[i];break}V="el"}
  else if(v==="lou"){V="lou";LO=null}
  else if(v==="contacts"){V="contacts";LO=null}
  else if(v==="loud"){for(var i=0;i<D.loueurs.length;i++)if(D.loueurs[i].id===id){LO=D.loueurs[i];break}V="loud"}
  else if(v==="dep"){V="dep"}
  else if(v==="acc"){V="acc";SQ=""}
  else if(v==="search"){V="search"}
  R();
};
window.goTo=function(pId,dId,eId){
  for(var i=0;i<D.projets.length;i++)if(D.projets[i].id===pId){P=D.projets[i];break}
  if(dId&&P.decors)for(var i=0;i<P.decors.length;i++)if(P.decors[i].id===dId){DC=P.decors[i];break}
  if(eId&&DC&&DC.elements)for(var i=0;i<DC.elements.length;i++)if(DC.elements[i].id===eId){EL=DC.elements[i];break}
  V=eId?"el":(dId?"dec":"proj");R();
};
window.modal=function(m,id){M=m;RB=id||null;PHS=[];EDIT=null;MORE=false;R()};
window.edit=function(t,o){M="edit_"+t;EDIT=o;MORE=true;R()};
window.menu=function(v){MN=v;R()};
window.setTab=function(t){TB=t;R()};
window.setGSQ=function(q){GSQ=q;R()};
window.setSQ=function(q){SQ=q;R()};
window.toggleMore=function(){MORE=!MORE;R()};
window.openPh=function(c,i){VWC=c;VWI=i;VW=true;R()};
window.closePh=function(){VW=null;VWC=null;R()};
window.navPh=function(d){if(VWC){VWI+=d;if(VWI<0)VWI=VWC.length-1;if(VWI>=VWC.length)VWI=0;R();}};
window.setStat=function(s){if(EL){EL.statut=s;sv();R();}};
window.toggleUrg=function(){if(EL){EL.urgent=!EL.urgent;sv();R();}};
window.setLTab=function(t){LTAB=t;R()};

// Login/Join
window.joinProject=function(){
  var code = document.getElementById("join-code").value.toUpperCase().trim();
  if(code.length!==6)return alert("Le code doit contenir 6 caractères");
  if(!FIREBASE_READY){CODE=code;localStorage.setItem("dp_code",CODE);subscribeToProject(CODE);return;}
  db.collection("projects").doc(code).get().then(function(doc){
    if(doc.exists){CODE=code;localStorage.setItem("dp_code",CODE);subscribeToProject(CODE);}else{alert("Projet introuvable. Vérifiez le code.");}
  });
};

window.createProject=function(){
  var code = genCode();
  CODE=code;
  localStorage.setItem("dp_code",CODE);
  D={projets:[],loueurs:[],depenses:[]};
  localStorage.setItem("decorpro_local_"+CODE,JSON.stringify(D));
  if(!FIREBASE_READY){subscribeToProject(CODE);return;}
  db.collection("projects").doc(code).set({
    projets:[],loueurs:[],depenses:[],
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(function(){subscribeToProject(CODE);});
};

window.leaveProject=function(){
  if(!confirm("Quitter ce projet ? Vous pourrez le rejoindre à nouveau avec le code."))return;
  if(UNSUB)UNSUB();
  CODE=null;
  localStorage.removeItem("dp_code");
  D={projets:[],loueurs:[],depenses:[]};
  MN=false;
  R();
};

// Render
function R(){
  if(!CODE){
    document.getElementById("app").innerHTML = rLogin();
    return;
  }
  
  var h=rHeader();
  h+='<main class="cnt">';
  if(V==="home")h+=rHome();
  else if(V==="proj")h+=rProj();
  else if(V==="dec")h+=rDec();
  else if(V==="el")h+=rEl();
  else if(V==="lou")h+=rLouer();
  else if(V==="contacts")h+=rLou();
  else if(V==="loud")h+=rLouD();
  else if(V==="dep")h+=rDep();
  else if(V==="acc")h+=rAcc();
  else if(V==="search")h+=rSearch();
  h+='</main>';
  h+=rNavbar();
  if(M)h+=rModal();
  if(MN)h+=rMenu();
  if(VW&&VWC)h+=rViewer();
  document.getElementById("app").innerHTML=h;
}

function rLogin(){
  var h='<div class="login-screen">';
  h+='<div class="login-logo">🎬</div>';
  h+='<div class="login-title">Décor Pro</div>';
  h+='<div class="login-sub">Gestion de décors collaborative'+(!FIREBASE_READY?' • mode local':'')+'</div>';
  h+='<div class="login-box">';
  h+='<div class="login-tabs">';
  h+='<div class="login-tab'+(LTAB==="join"?" on":"")+'" onclick="setLTab(\'join\')">Rejoindre</div>';
  h+='<div class="login-tab'+(LTAB==="create"?" on":"")+'" onclick="setLTab(\'create\')">Créer</div>';
  h+='</div>';
  
  if(LTAB==="join"){
    h+='<p style="font-size:13px;color:#94a3b8;margin-bottom:16px">Entrez le code projet partagé par votre équipe</p>';
    h+='<div class="fld"><input id="join-code" class="code-input" placeholder="ABC123" maxlength="6" autocapitalize="characters"></div>';
    h+='<button class="btn p" onclick="joinProject()">Rejoindre le projet</button>';
  }else{
    h+='<p style="font-size:13px;color:#94a3b8;margin-bottom:16px">Créez un nouveau projet et partagez le code avec votre équipe</p>';
    h+='<button class="btn p" onclick="createProject()">🚀 Créer un projet</button>';
    h+='<div class="team-info">Un code unique sera généré. Partagez-le avec vos collaborateurs pour qu\'ils puissent rejoindre le projet.</div>';
  }
  h+='</div></div>';
  return h;
}

function rHeader(){
  var syncClass = SYNCING?"syncing":(ONLINE?"online":"offline");
  var syncText = !FIREBASE_READY?"Local":(SYNCING?"Sync...":(ONLINE?"Connecté":"Hors-ligne"));
  
  var h='<header class="hdr"><div class="hdr-top">';
  h+='<div class="logo"><em>🎬</em>Décor Pro</div>';
  h+='<div style="display:flex;align-items:center;gap:8px">';
  h+='<div class="sync-status '+syncClass+'"><div class="sync-dot"></div>'+syncText+'</div>';
  h+='<button onclick="menu(true)" style="font-size:20px;padding:6px">☰</button>';
  h+='</div></div>';
  h+='<div class="hdr-search"><input placeholder="Rechercher..." value="'+GSQ+'" oninput="setGSQ(this.value)" onfocus="go(\'search\')"></div></header>';
  if(V!=="home"&&V!=="search")h+=rBread();
  return h;
}

function rBread(){
  var h='<div class="bread">';
  h+='<span onclick="go(\'home\')">🏠</span><i>›</i>';
  if(P){h+='<span onclick="go(\'proj\',\''+P.id+'\')"'+(V==="proj"?' class="current"':'')+'>'+P.nom+'</span>';}
  if(DC){h+='<i>›</i><span onclick="go(\'dec\',\''+DC.id+'\')"'+(V==="dec"?' class="current"':'')+'>'+DC.nom+'</span>';}
  if(EL){h+='<i>›</i><span class="current">'+EL.nom+'</span>';}
  if(V==="lou"){h+='<span class="current">Louer</span>';}
  if(V==="contacts"||V==="loud"){h+='<span class="current">Loueurs</span>';}
  if(V==="dep"){h+='<span class="current">Dépenses</span>';}
  if(V==="acc"){h+='<span class="current">Accessoires</span>';}
  h+='</div>';
  return h;
}

function rNavbar(){
  var h='<nav class="navbar">';
  h+='<div class="nav-item'+(V==="home"?" active":"")+'" onclick="go(\'home\')"><span class="icon">🏠</span><span class="label">Accueil</span></div>';
  h+='<div class="nav-item'+(V==="acc"?" active":"")+'" onclick="go(\'acc\')"><span class="icon">🎭</span><span class="label">Accessoires</span></div>';
  h+='<div class="nav-item'+(V==="dep"?" active":"")+'" onclick="go(\'dep\')"><span class="icon">💰</span><span class="label">Budget</span></div>';
  h+='<div class="nav-item'+(V==="lou"?" active":"")+'" onclick="go(\'lou\')"><span class="icon">📦</span><span class="label">Louer</span></div>';
  h+='</nav>';
  return h;
}

function rHome(){
  var np=D.projets.length,nd=0,ne=0,td=0;
  for(var i=0;i<D.projets.length;i++){var p=D.projets[i];nd+=p.decors?p.decors.length:0;if(p.decors)for(var j=0;j<p.decors.length;j++)ne+=p.decors[j].elements?p.decors[j].elements.length:0;}
  for(var i=0;i<D.depenses.length;i++)td+=parseFloat(D.depenses[i].montant)||0;
  var al=getAlerts();
  
  var h='<div class="box" style="background:linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.2));margin-bottom:16px">';
  h+='<div style="display:flex;justify-content:space-between;align-items:center">';
  h+='<div><div style="font-size:11px;color:#a5b4fc;margin-bottom:4px">CODE PROJET</div>';
  h+='<div style="font-size:24px;font-weight:700;letter-spacing:3px">'+CODE+'</div></div>';
  h+='<button class="abtn" onclick="copyCode()" style="font-size:11px">📋 Copier</button>';
  h+='</div></div>';
  
  var h2='<div class="stats">';
  h2+='<div class="stat"><strong>'+np+'</strong><small>Projets</small></div>';
  h2+='<div class="stat"><strong>'+nd+'</strong><small>Décors</small></div>';
  h2+='<div class="stat"><strong>'+ne+'</strong><small>Éléments</small></div>';
  h2+='<div class="stat"><strong>'+fm(td).replace("€","")+'</strong><small>Budget</small></div>';
  h2+='</div>';
  h+=h2;
  
  if(al.urgents.length||al.retards.length||al.nonPrets.length||al.aujourdhui.length||al.demain.length){
    h+='<div class="alerts">';
    if(al.urgents.length)h+='<div class="alert-chip red" onclick="go(\'acc\')">🚨 '+al.urgents.length+' urgent</div>';
    if(al.retards.length)h+='<div class="alert-chip red" onclick="go(\'acc\')">⚠️ '+al.retards.length+' retard</div>';
    if(al.nonPrets.length)h+='<div class="alert-chip orange" onclick="go(\'acc\')">📦 '+al.nonPrets.length+' non prêts</div>';
    if(al.aujourdhui.length)h+='<div class="alert-chip pink" onclick="go(\'acc\')">🎬 '+al.aujourdhui.length+' aujourd\'hui</div>';
    if(al.demain.length)h+='<div class="alert-chip blue" onclick="go(\'acc\')">📅 '+al.demain.length+' demain</div>';
    h+='</div>';
  }
  
  h+='<div class="stit">Mes projets <button onclick="modal(\'np\')">+ Nouveau</button></div>';
  
  if(!D.projets.length){
    h+='<div class="empty"><div class="icon">🎬</div><p>Aucun projet</p><p style="font-size:12px">Créez votre premier projet</p></div>';
  }else{
    for(var i=0;i<D.projets.length;i++){
      var p=D.projets[i],t=gt(p.type),ndc=p.decors?p.decors.length:0;
      h+='<div class="card" onclick="go(\'proj\',\''+p.id+'\')">';
      h+='<div class="card-icon">'+t.i+'</div>';
      h+='<div class="card-info"><h3>'+p.nom+'</h3><p>'+ndc+' décors'+(p.production?' • '+p.production:'')+'</p></div>';
      h+='<div class="card-actions"><div class="card-act edit" onclick="event.stopPropagation();edit(\'projet\',D.projets['+i+'])">✏️</div></div>';
      h+='</div>';
    }
  }
  h+='<button class="fab" onclick="modal(\'np\')">+</button>';
  return h;
}

window.copyCode=function(){
  navigator.clipboard.writeText(CODE).then(function(){
    alert("Code copié: "+CODE);
  });
};
