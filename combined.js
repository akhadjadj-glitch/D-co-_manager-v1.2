
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

function rProj(){
  if(!P)return"";
  var t=gt(P.type),nd=P.decors?P.decors.length:0;
  var td=0;for(var i=0;i<D.depenses.length;i++)if(D.depenses[i].projetId===P.id)td+=parseFloat(D.depenses[i].montant)||0;
  
  var h='<div class="page-title">'+t.i+' '+P.nom+'</div>';
  h+='<div class="page-sub">'+(P.production||t.l)+' • '+nd+' décors</div>';
  
  if(td>0)h+='<div class="total-box"><span>Budget projet</span><strong>'+fm(td)+'</strong></div>';
  
  h+='<div class="acts">';
  h+='<div class="abtn p" onclick="modal(\'nd\')">+ Décor</div>';
  h+='<div class="abtn" onclick="edit(\'projet\',P)">✏️ Modifier</div>';
  h+='<div class="abtn d" onclick="delP()">🗑️</div>';
  h+='</div>';
  
  h+='<div class="stit">Décors</div>';
  if(!P.decors||!P.decors.length){
    h+='<div class="empty"><div class="icon">🎭</div><p>Aucun décor</p></div>';
  }else{
    for(var i=0;i<P.decors.length;i++){
      var d=P.decors[i],st=gsd(d.statut),nel=d.elements?d.elements.length:0;
      h+='<div class="card" onclick="go(\'dec\',\''+d.id+'\')">';
      h+='<div class="card-icon">'+(d.interieur?'🏠':'🌳')+'</div>';
      h+='<div class="card-info"><h3>'+d.nom+'</h3><p><span class="badge" style="background:'+st.c+'30;color:'+st.c+'">'+st.l+'</span> '+nel+' él.</p></div>';
      h+='<div class="card-actions"><div class="card-act edit" onclick="event.stopPropagation();DC=P.decors['+i+'];edit(\'decor\',DC)">✏️</div></div>';
      h+='</div>';
    }
  }
  h+='<button class="fab" onclick="modal(\'nd\')">+</button>';
  return h;
}

function rDec(){
  if(!DC)return"";
  var st=gsd(DC.statut);
  var h='<div class="page-title">'+DC.nom+'</div>';
  h+='<div class="page-sub"><span class="badge" style="background:'+st.c+'30;color:'+st.c+'">'+st.l+'</span>'+(DC.adresse?' • 📍'+DC.adresse:'')+'</div>';
  h+='<div class="tabs"><div class="tab'+(TB==="rub"?" on":"")+'" onclick="setTab(\'rub\')">Rubriques</div><div class="tab'+(TB==="info"?" on":"")+'" onclick="setTab(\'info\')">Infos</div><div class="tab'+(TB==="ph"?" on":"")+'" onclick="setTab(\'ph\')">Photos</div><div class="tab'+(TB==="portfolio"?" on":"")+'" onclick="setTab(\'portfolio\')">Portfolio</div></div>';
  if(TB==="rub"){
    h+='<div class="rub-grid">';
    for(var i=0;i<RUB.length;i++){var r=RUB[i],cnt=0,urg=0,phs=0;if(DC.elements)for(var j=0;j<DC.elements.length;j++){if(DC.elements[j].rubrique===r.id){cnt++;if(DC.elements[j].urgent)urg++;if(DC.elements[j].photos)phs+=DC.elements[j].photos.length;}}h+='<div class="rub-card'+(urg?' urgent':'')+'" onclick="modal(\'rub\',\''+r.id+'\')" style="border-left:3px solid '+r.c+'"><div class="icon">'+r.i+'</div><h4>'+r.n+'</h4><p>'+cnt+' él.'+(phs?' • '+phs+' 📷':'')+'</p>'+(cnt?'<div class="count">'+cnt+'</div>':'')+'</div>';}
    h+='</div>';
  }else if(TB==="info"){
    h+='<div class="box"><div class="row"><span>Type</span><span>'+(DC.interieur?'Intérieur':'Extérieur')+' • '+(DC.studio?'Studio':'Naturel')+'</span></div>';
    if(DC.dateInstallation)h+='<div class="row"><span>Installation</span><span>'+fd(DC.dateInstallation)+'</span></div>';
    if(DC.dateTournage)h+='<div class="row"><span>Tournage</span><span>'+fd(DC.dateTournage)+'</span></div>';
    if(DC.notes)h+='<div class="row"><span>Notes</span><span>'+DC.notes+'</span></div>';
    h+='</div><div class="acts"><div class="abtn p" onclick="edit(\'decor\',DC)">✏️ Modifier</div><div class="abtn d" onclick="delD()">🗑️ Supprimer</div></div>';
  }else if(TB==="ph"){
    var phs=[];if(DC.elements)for(var i=0;i<DC.elements.length;i++){var e=DC.elements[i];if(e.photos)for(var j=0;j<e.photos.length;j++)phs.push({data:e.photos[j],nom:e.nom});}
    if(phs.length){h+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">';for(var i=0;i<phs.length;i++)h+='<img src="'+phs[i].data+'" onclick="openPh(getDecPhs(),'+i+')" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;cursor:pointer">';h+='</div>';}else{h+='<div class="empty"><div class="icon">📷</div><p>Aucune photo</p></div>';}
  }else if(TB==="portfolio"){
    var allGroups=getDecorPortfolio(DC),groups=allGroups.slice();if(PORTFOLIO_FILTER!=="all")groups=groups.filter(function(g){return g.rubrique.id===PORTFOLIO_FILTER;});
    h+='<div class="acts" style="margin-bottom:10px"><div class="abtn'+(PORTFOLIO_FILTER==="all"?' p':'')+'" onclick="setPortfolioFilter(\'all\')">Toutes</div>';for(var gi=0;gi<allGroups.length;gi++)h+='<div class="abtn'+(PORTFOLIO_FILTER===allGroups[gi].rubrique.id?' p':'')+'" onclick="setPortfolioFilter(\''+allGroups[gi].rubrique.id+'\')">'+allGroups[gi].rubrique.i+' '+allGroups[gi].rubrique.n+'</div>';h+='</div>';
    if(!groups.length){h+='<div class="empty"><div class="icon">🖼️</div><p>Aucun portfolio pour ce décor</p><p style="font-size:12px">Ajoutez des photos sur les éléments</p></div>';}
    else{h+='<div class="gallery-grid">';for(var g=0;g<groups.length;g++){var grp=groups[g],cover=grp.photos[0];h+='<div class="gallery-card" onclick="openPortfolioGroup(\''+grp.rubrique.id+'\')"><div class="gallery-cover">'+(cover?'<img src="'+cover.data+'">':'<span style="font-size:32px">'+grp.rubrique.i+'</span>')+'</div><div class="gallery-info"><h4>'+grp.rubrique.n+'</h4><p>'+grp.items.length+' objet(s) • '+grp.photos.length+' photo(s)</p></div></div>'; }h+='</div>';}
  }
  h+='<button class="fab" onclick="modal(\'ne\')">+</button>';
  return h;
}

window.getDecPhs=function(){var phs=[];if(DC&&DC.elements)for(var i=0;i<DC.elements.length;i++){var e=DC.elements[i];if(e.photos)for(var j=0;j<e.photos.length;j++)phs.push({data:e.photos[j],nom:e.nom});}return phs;};
window.setPortfolioFilter=function(v){PORTFOLIO_FILTER=v;R();};
window.openPortfolioGroup=function(rubId){var phs=[];if(DC&&DC.elements)for(var i=0;i<DC.elements.length;i++){var e=DC.elements[i];if(e.rubrique===rubId&&e.photos)for(var j=0;j<e.photos.length;j++)phs.push({data:e.photos[j],nom:e.nom});}if(phs.length)openPh(phs,0);};

function rEl(){
  if(!EL)return"";
  var st=gs(EL.statut),rb=gr(EL.rubrique);
  
  var h='';
  if(EL.photos&&EL.photos.length){
    h+='<div class="photo-main" onclick="openPh(EL.photos.map(function(p){return{data:p}}),0)"><img src="'+EL.photos[0]+'"></div>';
    h+='<div class="photo-row">';
    for(var i=0;i<EL.photos.length;i++)h+='<div class="photo-thumb'+(i===0?' active':'')+'" onclick="openPh(EL.photos.map(function(p){return{data:p}}),'+i+')"><img src="'+EL.photos[i]+'"></div>';
    h+='<div class="photo-thumb photo-add" onclick="addPh()">+</div>';
    h+='</div>';
  }else{
    h+='<div class="photo-main" onclick="addPh()" style="display:flex;align-items:center;justify-content:center;flex-direction:column;color:#64748b"><span style="font-size:32px">📷</span><span style="font-size:12px;margin-top:4px">Ajouter photos</span></div>';
  }
  
  h+='<div class="page-title">'+EL.nom+(EL.urgent?' 🚨':'')+'</div>';
  
  h+='<div class="chips">';
  if(rb)h+='<div class="chip purple">'+rb.i+' '+rb.n+'</div>';
  if(EL.scene)h+='<div class="chip">🎬 Sc.'+EL.scene+'</div>';
  if(EL.role)h+='<div class="chip pink">👤 '+EL.role+'</div>';
  if(EL.dateJeu)h+='<div class="chip">📅 '+fd(EL.dateJeu)+'</div>';
  h+='</div>';
  
  h+='<div class="acts">';
  h+='<div class="abtn p" onclick="edit(\'element\',EL)">✏️ Modifier</div>';
  h+='<div class="abtn'+(EL.urgent?' d':'')+'" onclick="toggleUrg()">'+(EL.urgent?'🚨 Urgent':'⚡ Urgent')+'</div>';
  h+='<div class="abtn" onclick="dupEl()">📋</div>';
  h+='<div class="abtn d" onclick="delE()">🗑️</div>';
  h+='</div>';
  
  h+='<div class="fld"><label>Statut</label><select onchange="setStat(this.value)" style="background:'+st.c+'20;color:'+st.c+';border-color:'+st.c+'">';
  for(var i=0;i<STAT.length;i++)h+='<option value="'+STAT[i].id+'"'+(STAT[i].id===EL.statut?' selected':'')+'>'+STAT[i].l+'</option>';
  h+='</select></div>';
  
  h+='<div class="box">';
  if(EL.description)h+='<p style="margin-bottom:8px;font-size:13px">'+EL.description+'</p>';
  if(EL.dimensions)h+='<div class="row"><span>Dimensions</span><span>'+EL.dimensions+'</span></div>';
  if(EL.couleur)h+='<div class="row"><span>Couleur</span><span>'+EL.couleur+'</span></div>';
  if(EL.matiere)h+='<div class="row"><span>Matière</span><span>'+EL.matiere+'</span></div>';
  if(EL.quantite&&EL.quantite>1)h+='<div class="row"><span>Quantité</span><span>'+EL.quantite+'</span></div>';
  h+='</div>';
  
  var lo=EL.loueurId?gl(EL.loueurId):null;
  if(lo){
    h+='<div class="box" style="background:rgba(99,102,241,0.1)">';
    h+='<div style="display:flex;align-items:center;gap:10px">';
    h+='<span style="font-size:20px">🏪</span>';
    h+='<div><strong style="color:#a5b4fc">'+lo.nom+'</strong>';
    if(lo.telephone)h+='<br><a href="tel:'+lo.telephone+'" style="color:#64748b;font-size:12px">📞 '+lo.telephone+'</a>';
    h+='</div></div></div>';
  }
  
  if(EL.coutLocation||EL.coutReel||EL.dateDepart||EL.dateRetour){
    h+='<div class="box"><div style="font-weight:600;margin-bottom:6px;font-size:13px">📦 Location</div>';
    if(EL.dateDepart)h+='<div class="row"><span>Départ</span><span>'+fd(EL.dateDepart)+'</span></div>';
    if(EL.dateRetour)h+='<div class="row"><span>Retour</span><span>'+fd(EL.dateRetour)+'</span></div>';
    if(EL.coutLocation)h+='<div class="row"><span>Estimé</span><span>'+fm(EL.coutLocation)+'</span></div>';
    if(EL.coutReel)h+='<div class="row"><span>Réel</span><span style="color:#10b981">'+fm(EL.coutReel)+'</span></div>';
    h+='</div>';
  }
  return h;
}

function rLouer(){
  var items=getRentalItems();items.sort(function(a,b){return new Date(b.e.dateDepart||b.e.dateJeu||0)-new Date(a.e.dateDepart||a.e.dateJeu||0)});
  var q=SQ?SQ.toLowerCase():"";if(q)items=items.filter(function(x){return x.e.nom.toLowerCase().indexOf(q)>=0||(x.d.nom||"").toLowerCase().indexOf(q)>=0||(x.p.nom||"").toLowerCase().indexOf(q)>=0||(x.lo&&x.lo.nom&&x.lo.nom.toLowerCase().indexOf(q)>=0);});
  var total=items.length,totalCost=0,totalReturned=0;for(var i=0;i<items.length;i++){totalCost+=num(items[i].e.coutReel||items[i].e.coutLocation);if(items[i].e.statut==="restitue")totalReturned++;}
  var h='<div class="page-title">📦 Louer</div><div class="page-sub">Objets loués par décor et par loueur</div>';
  h+='<div class="acts"><div class="abtn" onclick="go(\'contacts\')">🏪 Voir les loueurs</div></div>';
  h+='<div class="kpi-row"><div class="kpi"><strong>'+total+'</strong><span>Objets</span></div><div class="kpi"><strong>'+fm(totalCost)+'</strong><span>Montant</span></div><div class="kpi"><strong>'+totalReturned+'</strong><span>Restitués</span></div></div>';
  h+='<div class="hdr-search" style="margin-bottom:12px"><input placeholder="Rechercher un objet, décor ou loueur..." value="'+SQ+'" oninput="setSQ(this.value)"></div>';
  h+='<div class="segment"><button class="'+(RENTTAB==="decor"?'on':'')+'" onclick="setRentTab(\'decor\')">Par décor</button><button class="'+(RENTTAB==="loueur"?'on':'')+'" onclick="setRentTab(\'loueur\')">Par loueur</button></div>';
  if(!items.length){h+='<div class="empty"><div class="icon">📦</div><p>Aucun objet loué</p><p style="font-size:12px">Renseignez un loueur ou une période de location sur vos éléments</p></div>';return h;}
  if(RENTTAB==="decor"){
    var groups={};for(var i=0;i<items.length;i++){var key=items[i].p.id+'__'+items[i].d.id;if(!groups[key])groups[key]={p:items[i].p,d:items[i].d,items:[]};groups[key].items.push(items[i]);}
    for(var key in groups){var g=groups[key],sub=0;for(var j=0;j<g.items.length;j++)sub+=num(g.items[j].e.coutReel||g.items[j].e.coutLocation);h+='<div class="group-head"><span>'+g.p.nom+' › '+g.d.nom+'</span><strong style="color:#a5b4fc">'+g.items.length+' objet(s)</strong></div><div class="list-mini">';for(var j=0;j<g.items.length;j++){var x=g.items[j],st=gs(x.e.statut);h+='<div class="mini-row" onclick="goTo(\''+x.p.id+'\',\''+x.d.id+'\',\''+x.e.id+'\')"><div><h4>'+x.e.nom+'</h4><p>'+(x.lo?('🏪 '+x.lo.nom+' • '):'')+(x.e.dateRetour?('↩ '+fd(x.e.dateRetour)+' • '):'')+'<span style="color:'+st.c+'">'+st.l+'</span></p></div><strong>'+fm(num(x.e.coutReel||x.e.coutLocation))+'</strong></div>';}h+='</div><div class="box" style="margin-top:8px;font-size:12px;color:#94a3b8">Sous-total '+fm(sub)+'</div>';}
  }else{
    var groups2={};for(var i=0;i<items.length;i++){var name=items[i].lo&&items[i].lo.nom?items[i].lo.nom:'Sans loueur';if(!groups2[name])groups2[name]={lo:items[i].lo,items:[]};groups2[name].items.push(items[i]);}
    var names=Object.keys(groups2).sort();for(var ni=0;ni<names.length;ni++){var nm=names[ni],g2=groups2[nm],sub2=0;for(var j=0;j<g2.items.length;j++)sub2+=num(g2.items[j].e.coutReel||g2.items[j].e.coutLocation);h+='<div class="group-head"><span>'+(g2.lo?g2.lo.nom:'Sans loueur')+'</span><strong style="color:#a5b4fc">'+g2.items.length+' objet(s)</strong></div><div class="list-mini">';for(var j=0;j<g2.items.length;j++){var y=g2.items[j],sty=gs(y.e.statut);h+='<div class="mini-row" onclick="goTo(\''+y.p.id+'\',\''+y.d.id+'\',\''+y.e.id+'\')"><div><h4>'+y.e.nom+'</h4><p>'+y.p.nom+' › '+y.d.nom+(y.e.dateRetour?(' • ↩ '+fd(y.e.dateRetour)):'')+' • <span style="color:'+sty.c+'">'+sty.l+'</span></p></div><strong>'+fm(num(y.e.coutReel||y.e.coutLocation))+'</strong></div>';}h+='</div><div class="box" style="margin-top:8px;font-size:12px;color:#94a3b8">Sous-total '+fm(sub2)+'</div>';}
  }
  return h;
}
window.setRentTab=function(v){RENTTAB=v;R();};

function rLou(){
  var h='<div class="page-title">🏪 Répertoire des loueurs</div>';
  h+='<div class="page-sub">'+D.loueurs.length+' contacts</div>';
  if(!D.loueurs.length){h+='<div class="empty"><div class="icon">🏪</div><p>Aucun loueur</p></div>';}
  else{for(var i=0;i<D.loueurs.length;i++){var l=D.loueurs[i];h+='<div class="card" onclick="go(\'loud\',\''+l.id+'\')"><div class="card-icon">🏪</div><div class="card-info"><h3>'+l.nom+'</h3><p>'+(l.specialite||'Loueur')+'</p></div><div class="card-actions">';if(l.telephone)h+='<a href="tel:'+l.telephone+'" class="card-act view" onclick="event.stopPropagation()">📞</a>';h+='<div class="card-act edit" onclick="event.stopPropagation();edit(\'loueur\',D.loueurs['+i+'])">✏️</div></div></div>';}}
  h+='<button class="fab" onclick="modal(\'nl\')">+</button>';
  return h;
}

function rLouD(){
  if(!LO)return"";
  var h='<div class="page-title">🏪 '+LO.nom+'</div>';
  if(LO.specialite)h+='<div class="page-sub">'+LO.specialite+'</div>';
  h+='<div class="acts">';if(LO.telephone)h+='<a href="tel:'+LO.telephone+'" class="abtn p" style="text-decoration:none">📞 Appeler</a>';if(LO.email)h+='<a href="mailto:'+LO.email+'" class="abtn" style="text-decoration:none">✉️ Email</a>';h+='<div class="abtn" onclick="edit(\'loueur\',LO)">✏️</div></div>';
  h+='<div class="box">';if(LO.contact)h+='<div class="row"><span>Contact</span><span>'+LO.contact+'</span></div>';if(LO.telephone)h+='<div class="row"><span>Téléphone</span><span>'+LO.telephone+'</span></div>';if(LO.adresse)h+='<div class="row"><span>Adresse</span><span>'+LO.adresse+'</span></div>';if(LO.notes)h+='<div class="row"><span>Notes</span><span>'+LO.notes+'</span></div>';h+='</div>';var rented=getRentalItems().filter(function(x){return x.lo&&x.lo.id===LO.id});if(rented.length){h+='<div class="stit">Objets loués</div><div class="list-mini">';for(var ri=0;ri<rented.length;ri++){var x=rented[ri],stx=gs(x.e.statut);h+='<div class="mini-row" onclick="goTo(\''+x.p.id+'\',\''+x.d.id+'\',\''+x.e.id+'\')"><div><h4>'+x.e.nom+'</h4><p>'+x.p.nom+' › '+x.d.nom+' • <span style="color:'+stx.c+'">'+stx.l+'</span></p></div><strong>'+fm(num(x.e.coutReel||x.e.coutLocation))+'</strong></div>';}h+='</div>';}
  h+='<div class="abtn d" style="width:100%" onclick="delL()">🗑️ Supprimer</div>';
  return h;
}

function rDep(){
  var deps=D.depenses.slice();if(P)deps=deps.filter(function(d){return d.projetId===P.id});deps.sort(function(a,b){return new Date(b.date||0)-new Date(a.date||0)});
  var total=0,estim=0;for(var i=0;i<deps.length;i++){total+=parseFloat(deps[i].montant)||0;estim+=parseFloat(deps[i].estime)||0;}
  var h='<div class="page-title">💰 '+(P?'Budget '+P.nom:'Toutes les dépenses')+'</div><div class="page-sub">'+deps.length+' dépenses</div>';
  h+='<div class="total-box"><span>Total</span><strong>'+fm(total)+'</strong></div>';
  if(estim>0){var diff=total-estim;h+='<div class="box" style="display:flex;justify-content:space-between;font-size:13px"><span>Estimé: '+fm(estim)+'</span><span style="color:'+(diff>0?'#ef4444':'#10b981')+'">Écart: '+fm(diff)+'</span></div>';}
  if(!deps.length){h+='<div class="empty"><div class="icon">💰</div><p>Aucune dépense</p></div>';}else{for(var i=0;i<deps.length;i++){var d=deps[i];h+='<div class="dep-item" onclick="editDep(\''+d.id+'\')"><div><h4>'+(d.description||'Dépense')+'</h4><p>'+fd(d.date)+(d.fournisseur?' • '+d.fournisseur:'')+'</p></div><strong>'+fm(d.montant)+'</strong></div>';}}
  h+='<button class="fab" onclick="modal(\'ndep\')">+</button>';
  return h;
}

window.editDep=function(id){for(var i=0;i<D.depenses.length;i++)if(D.depenses[i].id===id){EDIT=D.depenses[i];M="edit_depense";R();break;}};

function rAcc(){
  var items=[];for(var i=0;i<D.projets.length;i++){var p=D.projets[i];if(!p.decors)continue;for(var j=0;j<p.decors.length;j++){var d=p.decors[j];if(!d.elements)continue;for(var k=0;k<d.elements.length;k++){var e=d.elements[k];if(e.rubrique==="accessoires")items.push({e:e,d:d,p:p});}}}
  if(SQ){var q=SQ.toLowerCase();items=items.filter(function(x){return x.e.nom.toLowerCase().indexOf(q)>=0||(x.e.role&&x.e.role.toLowerCase().indexOf(q)>=0);});}
  var h='<div class="page-title">🎭 Accessoires de jeu</div><div class="page-sub">'+items.length+' accessoires</div>';
  h+='<div class="hdr-search" style="margin-bottom:12px"><input placeholder="Rechercher..." value="'+SQ+'" oninput="setSQ(this.value)"></div>';
  if(!items.length){h+='<div class="empty"><div class="icon">🎭</div><p>Aucun accessoire</p></div>';}else{for(var i=0;i<items.length;i++){var x=items[i],e=x.e,st=gs(e.statut);h+='<div class="card'+(e.urgent?' urgent':'')+'" onclick="goTo(\''+x.p.id+'\',\''+x.d.id+'\',\''+e.id+'\')">';if(e.photos&&e.photos.length)h+='<img src="'+e.photos[0]+'" style="width:44px;height:44px;object-fit:cover;border-radius:8px">';else h+='<div class="card-icon">🎭</div>';h+='<div class="card-info"><h3>'+e.nom+(e.urgent?' 🚨':'')+'</h3><p>'+(e.role?'👤 '+e.role+' • ':'')+(e.dateJeu?'📅 '+fd(e.dateJeu):'')+'</p></div><span class="badge" style="background:'+st.c+'30;color:'+st.c+'">'+st.l+'</span></div>';}}
  return h;
}

function rSearch(){
  var results=search(GSQ);var h='<div class="page-title">🔍 Recherche</div>';
  if(!GSQ||GSQ.length<2){h+='<div class="empty"><div class="icon">🔍</div><p>Tapez au moins 2 caractères</p></div>';}else if(!results.length){h+='<div class="empty"><div class="icon">😕</div><p>Aucun résultat pour "'+GSQ+'"</p></div>';}else{h+='<div class="page-sub">'+results.length+' résultat(s)</div>';for(var i=0;i<results.length;i++){var r=results[i];if(r.t==="projet")h+='<div class="card" onclick="go(\'proj\',\''+r.item.id+'\')"><div class="card-icon">📁</div><div class="card-info"><h3>'+r.item.nom+'</h3><p>Projet</p></div></div>';else if(r.t==="decor")h+='<div class="card" onclick="goTo(\''+r.p.id+'\',\''+r.item.id+'\')"><div class="card-icon">🎭</div><div class="card-info"><h3>'+r.item.nom+'</h3><p>Décor • '+r.p.nom+'</p></div></div>';else if(r.t==="element"){h+='<div class="card" onclick="goTo(\''+r.p.id+'\',\''+r.d.id+'\',\''+r.item.id+'\')">';if(r.item.photos&&r.item.photos.length)h+='<img src="'+r.item.photos[0]+'" style="width:40px;height:40px;object-fit:cover;border-radius:8px">';else h+='<div class="card-icon">📦</div>';h+='<div class="card-info"><h3>'+r.item.nom+'</h3><p>'+r.d.nom+' • '+r.p.nom+'</p></div></div>';}else if(r.t==="loueur")h+='<div class="card" onclick="go(\'loud\',\''+r.item.id+'\')"><div class="card-icon">🏪</div><div class="card-info"><h3>'+r.item.nom+'</h3><p>Loueur</p></div></div>';}}
  return h;
}

function rViewer(){
  if(!VWC||!VWC.length)return"";var ph=VWC[VWI];
  var h='<div class="viewer"><div class="viewer-hdr"><button onclick="closePh()">✕ Fermer</button><span style="color:#94a3b8">'+(VWI+1)+'/'+VWC.length+'</span><button onclick="delPh()" style="color:#ef4444">🗑️</button></div>';
  if(VWC.length>1){h+='<button class="viewer-nav l" onclick="navPh(-1)">‹</button><button class="viewer-nav r" onclick="navPh(1)">›</button>';}
  h+='<div class="viewer-body"><img src="'+(ph.data||ph)+'"></div>';if(ph.nom)h+='<div class="viewer-ftr">'+ph.nom+'</div>';h+='</div>';
  return h;
}

window.delPh=function(){if(!confirm("Supprimer cette photo?"))return;if(EL&&EL.photos){EL.photos.splice(VWI,1);sv();if(VWI>=EL.photos.length)VWI=Math.max(0,EL.photos.length-1);if(!EL.photos.length){VW=null;VWC=null;}R();}else{VW=null;VWC=null;R();}};

function rMenu(){
  var h='<div class="menu"><div class="menu-bg" onclick="menu(false)"></div><div class="menu-panel">';
  h+='<div style="font-size:18px;font-weight:700;margin-bottom:20px">⚙️ Menu</div>';
  h+='<div class="box" style="margin-bottom:20px"><div style="font-size:11px;color:#64748b;margin-bottom:4px">Code projet</div><div style="font-size:20px;font-weight:700;letter-spacing:2px">'+CODE+'</div></div>';
  h+='<div class="menu-item" onclick="go(\'home\');menu(false)">🏠 Accueil</div>';
  h+='<div class="menu-item" onclick="go(\'acc\');menu(false)">🎭 Accessoires</div>';
  h+='<div class="menu-item" onclick="go(\'dep\');menu(false)">💰 Dépenses</div>';
  h+='<div class="menu-item" onclick="go(\'lou\');menu(false)">🏪 Loueurs</div>';
  h+='<div style="border-top:1px solid rgba(255,255,255,0.1);margin:16px 0"></div>';
  h+='<div class="menu-item" style="color:#ef4444" onclick="leaveProject()">🚪 Quitter le projet</div>';
  h+='<div style="margin-top:20px;font-size:11px;color:#64748b"><p>Décor Pro v8.0 Cloud</p><p>'+D.projets.length+' projets • Synchronisé</p></div>';
  h+='</div></div>';
  return h;
}

function rModal(){
  var c="";
  
  if(M==="np"){
    c='<div class="mbar"></div><div class="mtit">🎬 Nouveau projet</div>';
    c+='<div class="fld"><label>Nom du projet *</label><input id="f1" placeholder="Ex: Mon Film"></div>';
    c+='<div class="fld"><label>Type</label><select id="f2">';for(var i=0;i<TPROJ.length;i++)c+='<option value="'+TPROJ[i].id+'">'+TPROJ[i].i+' '+TPROJ[i].l+'</option>';c+='</select></div>';
    c+='<div class="toggle-more" onclick="toggleMore()">'+(MORE?'▲ Moins':'▼ Plus d\'options')+'</div>';
    c+='<div class="form-section'+(MORE?'':' hidden')+'">';
    c+='<div class="fld"><label>Production</label><input id="f3"></div>';
    c+='<div class="fld-row"><div class="fld"><label>Réalisateur</label><input id="f4"></div><div class="fld"><label>Chef déco</label><input id="f5"></div></div>';
    c+='<div class="fld"><label>Notes</label><textarea id="f6"></textarea></div></div>';
    c+='<button class="btn p" onclick="saveP()">Créer</button><button class="btn s" onclick="modal(null)">Annuler</button>';
  }
  else if(M==="edit_projet"&&EDIT){
    c='<div class="mbar"></div><div class="mtit">✏️ Modifier projet</div>';
    c+='<div class="fld"><label>Nom *</label><input id="f1" value="'+EDIT.nom+'"></div>';
    c+='<div class="fld"><label>Type</label><select id="f2">';for(var i=0;i<TPROJ.length;i++)c+='<option value="'+TPROJ[i].id+'"'+(TPROJ[i].id===EDIT.type?' selected':'')+'>'+TPROJ[i].i+' '+TPROJ[i].l+'</option>';c+='</select></div>';
    c+='<div class="fld"><label>Production</label><input id="f3" value="'+(EDIT.production||"")+'"></div>';
    c+='<div class="fld-row"><div class="fld"><label>Réalisateur</label><input id="f4" value="'+(EDIT.realisateur||"")+'"></div><div class="fld"><label>Chef déco</label><input id="f5" value="'+(EDIT.chefDeco||"")+'"></div></div>';
    c+='<div class="fld"><label>Notes</label><textarea id="f6">'+(EDIT.notes||"")+'</textarea></div>';
    c+='<button class="btn p" onclick="updateP()">Enregistrer</button><button class="btn s" onclick="modal(null)">Annuler</button>';
  }
  else if(M==="nd"){
    c='<div class="mbar"></div><div class="mtit">🎭 Nouveau décor</div>';
    c+='<div class="fld"><label>Nom *</label><input id="f1" placeholder="Ex: Appartement Marie"></div>';
    c+='<div class="fld-row"><div class="fld"><label>Type</label><select id="f3"><option value="1">🏠 Int.</option><option value="0">🌳 Ext.</option></select></div><div class="fld"><label>Nature</label><select id="f4"><option value="0">Naturel</option><option value="1">Studio</option></select></div></div>';
    c+='<div class="toggle-more" onclick="toggleMore()">'+(MORE?'▲':'▼ Plus')+'</div>';
    c+='<div class="form-section'+(MORE?'':' hidden')+'"><div class="fld"><label>Adresse</label><input id="f2"></div><div class="fld"><label>Statut</label><select id="f5">';for(var i=0;i<STATD.length;i++)c+='<option value="'+STATD[i].id+'">'+STATD[i].l+'</option>';c+='</select></div><div class="fld-row"><div class="fld"><label>Installation</label><input type="date" id="f6"></div><div class="fld"><label>Tournage</label><input type="date" id="f7"></div></div><div class="fld"><label>Notes</label><textarea id="f8"></textarea></div></div>';
    c+='<button class="btn p" onclick="saveDC()">Créer</button><button class="btn s" onclick="modal(null)">Annuler</button>';
  }
  else if(M==="edit_decor"&&EDIT){
    c='<div class="mbar"></div><div class="mtit">✏️ Modifier décor</div>';
    c+='<div class="fld"><label>Nom *</label><input id="f1" value="'+EDIT.nom+'"></div>';
    c+='<div class="fld"><label>Adresse</label><input id="f2" value="'+(EDIT.adresse||"")+'"></div>';
    c+='<div class="fld-row"><div class="fld"><label>Type</label><select id="f3"><option value="1"'+(EDIT.interieur?' selected':'')+'>🏠 Int.</option><option value="0"'+(!EDIT.interieur?' selected':'')+'>🌳 Ext.</option></select></div><div class="fld"><label>Nature</label><select id="f4"><option value="0"'+(!EDIT.studio?' selected':'')+'>Naturel</option><option value="1"'+(EDIT.studio?' selected':'')+'>Studio</option></select></div></div>';
    c+='<div class="fld"><label>Statut</label><select id="f5">';for(var i=0;i<STATD.length;i++)c+='<option value="'+STATD[i].id+'"'+(STATD[i].id===EDIT.statut?' selected':'')+'>'+STATD[i].l+'</option>';c+='</select></div>';
    c+='<div class="fld-row"><div class="fld"><label>Installation</label><input type="date" id="f6" value="'+(EDIT.dateInstallation||"")+'"></div><div class="fld"><label>Tournage</label><input type="date" id="f7" value="'+(EDIT.dateTournage||"")+'"></div></div>';
    c+='<div class="fld"><label>Notes</label><textarea id="f8">'+(EDIT.notes||"")+'</textarea></div>';
    c+='<button class="btn p" onclick="updateDC()">Enregistrer</button><button class="btn s" onclick="modal(null)">Annuler</button>';
  }
  else if(M==="ne"){
    var rb=RB?gr(RB):null;
    c='<div class="mbar"></div><div class="mtit">📦 Nouvel élément</div>';
    c+='<div class="drop" onclick="document.getElementById(\'phi\').click()"><div id="phpr"></div><div id="phpl"><span class="icon">📸</span><p>Ajouter photos</p></div><input type="file" accept="image/*" multiple id="phi" style="display:none" onchange="prvPh(event)"></div>';
    c+='<div id="upload-status"></div>';
    c+='<div class="fld"><label>Nom *</label><input id="f1" placeholder="Ex: Vase bleu"></div>';
    c+='<div class="fld-row"><div class="fld"><label>Rubrique</label><select id="f2">';for(var i=0;i<RUB.length;i++)c+='<option value="'+RUB[i].id+'"'+(rb&&rb.id===RUB[i].id?' selected':'')+'>'+RUB[i].i+' '+RUB[i].n+'</option>';c+='</select></div><div class="fld"><label>Statut</label><select id="f3">';for(var i=0;i<STAT.length;i++)c+='<option value="'+STAT[i].id+'">'+STAT[i].l+'</option>';c+='</select></div></div>';
    c+='<div class="toggle-more" onclick="toggleMore()">'+(MORE?'▲ Moins':'▼ Plus d\'options')+'</div>';
    c+='<div class="form-section'+(MORE?'':' hidden')+'">';
    c+='<div class="fld"><label>Description</label><textarea id="f4"></textarea></div>';
    c+='<div class="fld-row"><div class="fld"><label>Dimensions</label><input id="f5"></div><div class="fld"><label>Quantité</label><input type="number" id="f6" value="1"></div></div>';
    c+='<div class="fld-row"><div class="fld"><label>Couleur</label><input id="f7"></div><div class="fld"><label>Matière</label><input id="f8"></div></div>';
    c+='<div class="fld"><label>Tags</label><input id="f9" placeholder="vintage, bois..."></div>';
    c+='<div style="background:rgba(236,72,153,0.1);border-radius:10px;padding:10px;margin-bottom:12px"><div style="color:#ec4899;font-size:12px;font-weight:600;margin-bottom:8px">🎭 Accessoire</div><div class="fld-row"><div class="fld"><label>Scène</label><input id="f10"></div><div class="fld"><label>Personnage</label><input id="f11"></div></div><div class="fld"><label>Date jeu</label><input type="date" id="f12"></div><div class="fld"><label>Continuité</label><input id="f13"></div></div>';
    if(D.loueurs.length){c+='<div class="fld"><label>Loueur</label><select id="f14"><option value="">Aucun</option>';for(var i=0;i<D.loueurs.length;i++)c+='<option value="'+D.loueurs[i].id+'">'+D.loueurs[i].nom+'</option>';c+='</select></div>';}
    c+='<div class="fld-row"><div class="fld"><label>Estimé €</label><input type="number" id="f15"></div><div class="fld"><label>Réel €</label><input type="number" id="f16"></div></div>';
    c+='<div class="fld-row"><div class="fld"><label>Départ</label><input type="date" id="f17"></div><div class="fld"><label>Retour</label><input type="date" id="f18"></div></div></div>';
    c+='<button class="btn p" id="save-el-btn" onclick="saveEl()">Ajouter</button><button class="btn s" onclick="modal(null)">Annuler</button>';
  }
  else if(M==="edit_element"&&EDIT){
    c='<div class="mbar"></div><div class="mtit">✏️ Modifier élément</div>';
    c+='<div class="fld"><label>Nom *</label><input id="f1" value="'+EDIT.nom+'"></div>';
    c+='<div class="fld-row"><div class="fld"><label>Rubrique</label><select id="f2">';for(var i=0;i<RUB.length;i++)c+='<option value="'+RUB[i].id+'"'+(RUB[i].id===EDIT.rubrique?' selected':'')+'>'+RUB[i].i+' '+RUB[i].n+'</option>';c+='</select></div><div class="fld"><label>Statut</label><select id="f3">';for(var i=0;i<STAT.length;i++)c+='<option value="'+STAT[i].id+'"'+(STAT[i].id===EDIT.statut?' selected':'')+'>'+STAT[i].l+'</option>';c+='</select></div></div>';
    c+='<div class="fld"><label>Description</label><textarea id="f4">'+(EDIT.description||"")+'</textarea></div>';
    c+='<div class="fld-row"><div class="fld"><label>Dimensions</label><input id="f5" value="'+(EDIT.dimensions||"")+'"></div><div class="fld"><label>Quantité</label><input type="number" id="f6" value="'+(EDIT.quantite||1)+'"></div></div>';
    c+='<div class="fld-row"><div class="fld"><label>Couleur</label><input id="f7" value="'+(EDIT.couleur||"")+'"></div><div class="fld"><label>Matière</label><input id="f8" value="'+(EDIT.matiere||"")+'"></div></div>';
    c+='<div class="fld"><label>Tags</label><input id="f9" value="'+(EDIT.tags||"")+'"></div>';
    c+='<div style="background:rgba(236,72,153,0.1);border-radius:10px;padding:10px;margin-bottom:12px"><div style="color:#ec4899;font-size:12px;font-weight:600;margin-bottom:8px">🎭 Accessoire</div><div class="fld-row"><div class="fld"><label>Scène</label><input id="f10" value="'+(EDIT.scene||"")+'"></div><div class="fld"><label>Personnage</label><input id="f11" value="'+(EDIT.role||"")+'"></div></div><div class="fld"><label>Date jeu</label><input type="date" id="f12" value="'+(EDIT.dateJeu||"")+'"></div><div class="fld"><label>Continuité</label><input id="f13" value="'+(EDIT.continuity||"")+'"></div></div>';
    if(D.loueurs.length){c+='<div class="fld"><label>Loueur</label><select id="f14"><option value="">Aucun</option>';for(var i=0;i<D.loueurs.length;i++)c+='<option value="'+D.loueurs[i].id+'"'+(D.loueurs[i].id===EDIT.loueurId?' selected':'')+'>'+D.loueurs[i].nom+'</option>';c+='</select></div>';}
    c+='<div class="fld-row"><div class="fld"><label>Estimé €</label><input type="number" id="f15" value="'+(EDIT.coutLocation||"")+'"></div><div class="fld"><label>Réel €</label><input type="number" id="f16" value="'+(EDIT.coutReel||"")+'"></div></div>';
    c+='<div class="fld-row"><div class="fld"><label>Départ</label><input type="date" id="f17" value="'+(EDIT.dateDepart||"")+'"></div><div class="fld"><label>Retour</label><input type="date" id="f18" value="'+(EDIT.dateRetour||"")+'"></div></div>';
    c+='<button class="btn p" onclick="updateEl()">Enregistrer</button><button class="btn s" onclick="modal(null)">Annuler</button>';
  }
  else if(M==="nl"){
    c='<div class="mbar"></div><div class="mtit">🏪 Nouveau loueur</div>';
    c+='<div class="fld"><label>Nom *</label><input id="f1"></div>';
    c+='<div class="fld"><label>Spécialité</label><input id="f2"></div>';
    c+='<div class="fld-row"><div class="fld"><label>Contact</label><input id="f3"></div><div class="fld"><label>Téléphone</label><input type="tel" id="f4"></div></div>';
    c+='<div class="fld"><label>Email</label><input type="email" id="f5"></div>';
    c+='<div class="toggle-more" onclick="toggleMore()">'+(MORE?'▲':'▼ Plus')+'</div>';
    c+='<div class="form-section'+(MORE?'':' hidden')+'"><div class="fld"><label>Adresse</label><input id="f6"></div><div class="fld"><label>Notes</label><textarea id="f7"></textarea></div></div>';
    c+='<button class="btn p" onclick="saveLo()">Ajouter</button><button class="btn s" onclick="modal(null)">Annuler</button>';
  }
  else if(M==="edit_loueur"&&EDIT){
    c='<div class="mbar"></div><div class="mtit">✏️ Modifier loueur</div>';
    c+='<div class="fld"><label>Nom *</label><input id="f1" value="'+EDIT.nom+'"></div>';
    c+='<div class="fld"><label>Spécialité</label><input id="f2" value="'+(EDIT.specialite||"")+'"></div>';
    c+='<div class="fld-row"><div class="fld"><label>Contact</label><input id="f3" value="'+(EDIT.contact||"")+'"></div><div class="fld"><label>Téléphone</label><input type="tel" id="f4" value="'+(EDIT.telephone||"")+'"></div></div>';
    c+='<div class="fld"><label>Email</label><input type="email" id="f5" value="'+(EDIT.email||"")+'"></div>';
    c+='<div class="fld"><label>Adresse</label><input id="f6" value="'+(EDIT.adresse||"")+'"></div>';
    c+='<div class="fld"><label>Notes</label><textarea id="f7">'+(EDIT.notes||"")+'</textarea></div>';
    c+='<button class="btn p" onclick="updateLo()">Enregistrer</button><button class="btn s" onclick="modal(null)">Annuler</button>';
  }
  else if(M==="ndep"){
    c='<div class="mbar"></div><div class="mtit">💰 Nouvelle dépense</div>';
    c+='<div class="fld"><label>Description *</label><input id="f2"></div>';
    c+='<div class="fld-row"><div class="fld"><label>Montant € *</label><input type="number" step="0.01" id="f4"></div><div class="fld"><label>Type</label><select id="f1">';for(var i=0;i<TDEP.length;i++)c+='<option value="'+TDEP[i].id+'">'+TDEP[i].l+'</option>';c+='</select></div></div>';
    c+='<div class="fld-row"><div class="fld"><label>Date</label><input type="date" id="f5" value="'+new Date().toISOString().split("T")[0]+'"></div><div class="fld"><label>Fournisseur</label><input id="f6"></div></div>';
    c+='<div class="toggle-more" onclick="toggleMore()">'+(MORE?'▲':'▼ Estimé')+'</div>';
    c+='<div class="fld'+(MORE?'':' hidden')+'"><label>Estimé €</label><input type="number" step="0.01" id="f3"></div>';
    c+='<button class="btn p" onclick="saveDep()">Ajouter</button><button class="btn s" onclick="modal(null)">Annuler</button>';
  }
  else if(M==="edit_depense"&&EDIT){
    c='<div class="mbar"></div><div class="mtit">✏️ Modifier dépense</div>';
    c+='<div class="fld"><label>Description</label><input id="f2" value="'+(EDIT.description||"")+'"></div>';
    c+='<div class="fld-row"><div class="fld"><label>Montant €</label><input type="number" step="0.01" id="f4" value="'+(EDIT.montant||"")+'"></div><div class="fld"><label>Type</label><select id="f1">';for(var i=0;i<TDEP.length;i++)c+='<option value="'+TDEP[i].id+'"'+(TDEP[i].id===EDIT.type?' selected':'')+'>'+TDEP[i].l+'</option>';c+='</select></div></div>';
    c+='<div class="fld-row"><div class="fld"><label>Date</label><input type="date" id="f5" value="'+(EDIT.date||"")+'"></div><div class="fld"><label>Fournisseur</label><input id="f6" value="'+(EDIT.fournisseur||"")+'"></div></div>';
    c+='<div class="fld"><label>Estimé €</label><input type="number" step="0.01" id="f3" value="'+(EDIT.estime||"")+'"></div>';
    c+='<button class="btn p" onclick="updateDep()">Enregistrer</button><button class="btn d" onclick="delDep()">Supprimer</button><button class="btn s" onclick="modal(null)">Annuler</button>';
  }
  else if(M==="rub"){
    var rb=gr(RB);if(!rb)return"";
    var els=[];if(DC&&DC.elements)for(var i=0;i<DC.elements.length;i++)if(DC.elements[i].rubrique===rb.id)els.push(DC.elements[i]);
    c='<div class="mbar"></div><div style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><div style="width:40px;height:40px;background:'+rb.c+'20;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px">'+rb.i+'</div><div><div style="font-size:16px;font-weight:600">'+rb.n+'</div><div style="font-size:12px;color:#64748b">'+els.length+' éléments</div></div></div>';
    var phs=[];for(var i=0;i<els.length;i++)if(els[i].photos)for(var j=0;j<els[i].photos.length;j++)phs.push({data:els[i].photos[j],nom:els[i].nom});
    if(phs.length){c+='<div style="display:flex;gap:6px;overflow-x:auto;margin-bottom:12px;padding-bottom:4px">';for(var i=0;i<phs.length;i++)c+='<img src="'+phs[i].data+'" onclick="event.stopPropagation();openRubPh(\''+RB+'\','+i+')" style="width:70px;height:70px;object-fit:cover;border-radius:8px;flex-shrink:0;cursor:pointer">';c+='</div>';}
    if(!els.length){c+='<div class="empty"><div class="icon">📦</div><p>Aucun élément</p></div>';}else{c+='<div style="max-height:45vh;overflow-y:auto">';for(var i=0;i<els.length;i++){var e=els[i],st=gs(e.statut);c+='<div class="card'+(e.urgent?' urgent':'')+'" onclick="goToRubEl(\''+e.id+'\')"><div class="card-icon" style="width:40px;height:40px;font-size:18px">';if(e.photos&&e.photos.length)c+='<img src="'+e.photos[0]+'" style="width:40px;height:40px;object-fit:cover;border-radius:8px">';else c+='📦';c+='</div><div class="card-info"><h3>'+e.nom+(e.urgent?' 🚨':'')+'</h3><span class="badge" style="background:'+st.c+'30;color:'+st.c+'">'+st.l+'</span></div></div>';}c+='</div>';}
    c+='<button class="btn p" style="margin-top:12px" onclick="modal(\'ne\')">+ Ajouter</button>';
  }
  return '<div class="modal" onclick="modal(null)"><div class="mpan" onclick="event.stopPropagation()">'+c+'</div></div>';
}

window.goToRubEl=function(eId){for(var i=0;i<DC.elements.length;i++)if(DC.elements[i].id===eId){EL=DC.elements[i];break}M=null;V="el";R();};
window.openRubPh=function(rubId,idx){var phs=[];if(DC&&DC.elements)for(var i=0;i<DC.elements.length;i++){var e=DC.elements[i];if(e.rubrique===rubId&&e.photos)for(var j=0;j<e.photos.length;j++)phs.push({data:e.photos[j],nom:e.nom});}if(phs.length)openPh(phs,idx);};

var PENDING_FILES=[];
window.prvPh=function(e){
  var files=e.target.files;PENDING_FILES=[];
  var pr=document.getElementById("phpr"),pl=document.getElementById("phpl");
  for(var i=0;i<files.length;i++)PENDING_FILES.push(files[i]);
  if(pr&&pl&&PENDING_FILES.length){pr.innerHTML='<div style="color:#a5b4fc;font-size:12px">'+PENDING_FILES.length+' photo(s) sélectionnée(s)</div>';pl.style.display="none";}
};

window.addPh=function(){
  var i=document.createElement("input");i.type="file";i.accept="image/*";i.multiple=true;
  i.onchange=function(e){
    var files=e.target.files;var uploaded=0;var total=files.length;
    for(var j=0;j<files.length;j++){
      uploadPhoto(files[j],function(url){
        if(url){if(!EL.photos)EL.photos=[];EL.photos.push(url);}
        uploaded++;if(uploaded===total){sv();R();}
      });
    }
  };i.click();
};

function gv(id){var el=document.getElementById(id);return el?el.value.trim():"";}

window.saveP=function(){var n=gv("f1");if(!n)return alert("Nom requis");D.projets.push({id:uid(),nom:n,type:gv("f2")||"film",production:gv("f3"),realisateur:gv("f4"),chefDeco:gv("f5"),notes:gv("f6"),decors:[]});sv();M=null;R();};
window.updateP=function(){var n=gv("f1");if(!n)return alert("Nom requis");EDIT.nom=n;EDIT.type=gv("f2");EDIT.production=gv("f3");EDIT.realisateur=gv("f4");EDIT.chefDeco=gv("f5");EDIT.notes=gv("f6");sv();M=null;R();};
window.saveDC=function(){var n=gv("f1");if(!n)return alert("Nom requis");if(!P.decors)P.decors=[];P.decors.push({id:uid(),nom:n,adresse:gv("f2"),interieur:gv("f3")==="1",studio:gv("f4")==="1",statut:gv("f5")||"a_preparer",dateInstallation:gv("f6"),dateTournage:gv("f7"),notes:gv("f8"),elements:[]});sv();M=null;R();};
window.updateDC=function(){var n=gv("f1");if(!n)return alert("Nom requis");EDIT.nom=n;EDIT.adresse=gv("f2");EDIT.interieur=gv("f3")==="1";EDIT.studio=gv("f4")==="1";EDIT.statut=gv("f5");EDIT.dateInstallation=gv("f6");EDIT.dateTournage=gv("f7");EDIT.notes=gv("f8");sv();M=null;R();};

window.saveEl=function(){
  var n=gv("f1");if(!n)return alert("Nom requis");
  var btn=document.getElementById("save-el-btn");if(btn)btn.disabled=true;
  if(!DC.elements)DC.elements=[];
  var el={id:uid(),nom:n,rubrique:gv("f2")||"mobilier",statut:gv("f3")||"a_sourcer",description:gv("f4"),dimensions:gv("f5"),quantite:gv("f6")||1,couleur:gv("f7"),matiere:gv("f8"),tags:gv("f9"),scene:gv("f10"),role:gv("f11"),dateJeu:gv("f12"),continuity:gv("f13"),loueurId:gv("f14"),coutLocation:gv("f15"),coutReel:gv("f16"),dateDepart:gv("f17"),dateRetour:gv("f18"),photos:[]};
  
  if(PENDING_FILES.length===0){DC.elements.push(el);sv();M=null;PENDING_FILES=[];R();return;}
  
  var uploaded=0;var total=PENDING_FILES.length;
  var status=document.getElementById("upload-status");
  if(status)status.innerHTML='<div class="upload-progress"><div style="font-size:12px">Upload en cours... 0/'+total+'</div><div class="upload-bar"><div class="upload-fill" style="width:0%"></div></div></div>';
  
  for(var i=0;i<PENDING_FILES.length;i++){
    uploadPhoto(PENDING_FILES[i],function(url){
      if(url)el.photos.push(url);
      uploaded++;
      if(status)status.innerHTML='<div class="upload-progress"><div style="font-size:12px">Upload en cours... '+uploaded+'/'+total+'</div><div class="upload-bar"><div class="upload-fill" style="width:'+Math.round(uploaded/total*100)+'%"></div></div></div>';
      if(uploaded===total){DC.elements.push(el);sv();M=null;PENDING_FILES=[];R();}
    });
  }
};

window.updateEl=function(){var n=gv("f1");if(!n)return alert("Nom requis");EDIT.nom=n;EDIT.rubrique=gv("f2");EDIT.statut=gv("f3");EDIT.description=gv("f4");EDIT.dimensions=gv("f5");EDIT.quantite=gv("f6");EDIT.couleur=gv("f7");EDIT.matiere=gv("f8");EDIT.tags=gv("f9");EDIT.scene=gv("f10");EDIT.role=gv("f11");EDIT.dateJeu=gv("f12");EDIT.continuity=gv("f13");EDIT.loueurId=gv("f14");EDIT.coutLocation=gv("f15");EDIT.coutReel=gv("f16");EDIT.dateDepart=gv("f17");EDIT.dateRetour=gv("f18");sv();M=null;R();};
window.dupEl=function(){if(!confirm("Dupliquer?"))return;var c=JSON.parse(JSON.stringify(EL));c.id=uid();c.nom+=" (copie)";DC.elements.push(c);sv();alert("Dupliqué!");R();};
window.saveLo=function(){var n=gv("f1");if(!n)return alert("Nom requis");D.loueurs.push({id:uid(),nom:n,specialite:gv("f2"),contact:gv("f3"),telephone:gv("f4"),email:gv("f5"),adresse:gv("f6"),notes:gv("f7")});sv();M=null;R();};
window.updateLo=function(){var n=gv("f1");if(!n)return alert("Nom requis");EDIT.nom=n;EDIT.specialite=gv("f2");EDIT.contact=gv("f3");EDIT.telephone=gv("f4");EDIT.email=gv("f5");EDIT.adresse=gv("f6");EDIT.notes=gv("f7");sv();M=null;R();};
window.saveDep=function(){var m=gv("f4");if(!m)return alert("Montant requis");D.depenses.push({id:uid(),projetId:P?P.id:null,type:gv("f1"),description:gv("f2"),estime:parseFloat(gv("f3"))||0,montant:parseFloat(m),date:gv("f5"),fournisseur:gv("f6")});sv();M=null;R();};
window.updateDep=function(){var m=gv("f4");if(!m)return alert("Montant requis");EDIT.type=gv("f1");EDIT.description=gv("f2");EDIT.estime=parseFloat(gv("f3"))||0;EDIT.montant=parseFloat(m);EDIT.date=gv("f5");EDIT.fournisseur=gv("f6");sv();M=null;R();};
window.delDep=function(){if(!confirm("Supprimer?"))return;D.depenses=D.depenses.filter(function(d){return d.id!==EDIT.id});sv();M=null;R();};
window.delP=function(){if(!confirm("Supprimer?"))return;D.projets=D.projets.filter(function(p){return p.id!==P.id});sv();P=null;V="home";R();};
window.delD=function(){if(!confirm("Supprimer?"))return;P.decors=P.decors.filter(function(d){return d.id!==DC.id});sv();DC=null;V="proj";R();};
window.delE=function(){if(!confirm("Supprimer?"))return;DC.elements=DC.elements.filter(function(e){return e.id!==EL.id});sv();EL=null;V="dec";R();};
window.delL=function(){if(!confirm("Supprimer?"))return;D.loueurs=D.loueurs.filter(function(l){return l.id!==LO.id});sv();LO=null;V="lou";R();};

// Init
if(CODE)subscribeToProject(CODE);else R();
})();
