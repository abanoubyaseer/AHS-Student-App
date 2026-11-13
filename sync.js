// MRF English - Sync - مش بيمسح حاجة فاضية
var firebaseConfig = {
  apiKey: "AIzaSyC1f-Vi0hnh2H1_UG-KsXRiZkOU0miXhs_4",
  authDomain: "mrf-english.firebaseapp.com",
  databaseURL: "https://mrf-english-default-rtdb.firebaseio.com",
  projectId: "mrf-english",
  storageBucket: "mrf-english.firebasestorage.app",
  messagingSenderId: "388831155630",
  appId: "1:388831155630:web:a14e57cb33b2f90aba43f"
};
if(typeof firebase!=='undefined' && !firebase.apps.length){ firebase.initializeApp(firebaseConfig); }
var db = (typeof firebase!=='undefined') ? firebase.database() : null;
function getStage(){
  var u = JSON.parse(localStorage.getItem('currentStudent')||localStorage.getItem('student')||'null');
  return u ? (u.stage||u.targetStage||'') : '';
}
function syncPushAll(){
  if(!db) return;
  try{
    var exams = JSON.parse(localStorage.getItem('teacherExams')||'[]');
    var hws = JSON.parse(localStorage.getItem('teacherHomeworks')||'[]');
    var students = JSON.parse(localStorage.getItem('students')||'[]');
    var reports = JSON.parse(localStorage.getItem('studentReports')||'[]');
    if(exams.length>0){
      exams.forEach(function(e){ if(e.id) db.ref('exams/'+e.id).set(e); });
    }
    if(hws.length>0){
      hws.forEach(function(h){ if(h.id) db.ref('homeworks/'+h.id).set(h); });
    }
    if(students.length>0){
      students.forEach(function(s){ if(s.code) db.ref('students/'+s.code).set(s); });
    }
    if(reports.length>0){
      reports.forEach(function(r){ if(r.id) db.ref('reports/'+r.id).set(r); });
    }
    var settings = JSON.parse(localStorage.getItem('teacherSettings')||'null');
    if(settings){ db.ref('teacherSettings').set(settings); }
  }catch(e){ console.log(e); }
}
function syncPullAll(){
  if(!db) return;
  db.ref('exams').on('value', function(snap){
    var data = snap.val()||{};
    var all = Object.values(data);
    if(all.length===0) return;
    var myStage = getStage();
    var mine = myStage ? all.filter(function(e){ return (e.stage||e.targetStage)===myStage; }) : all;
    if(myStage){ localStorage.setItem('exams', JSON.stringify(mine)); }
    else { localStorage.setItem('teacherExams', JSON.stringify(all)); }
  });
  db.ref('homeworks').on('value', function(snap){
    var data = snap.val()||{};
    var all = Object.values(data);
    if(all.length===0) return;
    var myStage = getStage();
    var mine = myStage ? all.filter(function(h){ return (h.stage||h.targetStage)===myStage; }) : all;
    if(myStage){ localStorage.setItem('homeworks', JSON.stringify(mine)); }
    else { localStorage.setItem('teacherHomeworks', JSON.stringify(all)); }
  });
  db.ref('students').on('value', function(snap){
    var data = snap.val()||{};
    var all = Object.values(data);
    if(all.length===0) return;
    localStorage.setItem('students', JSON.stringify(all));
  });
  db.ref('reports').on('value', function(snap){
    var data = snap.val()||{};
    var all = Object.values(data);
    if(all.length===0) return;
    localStorage.setItem('studentReports', JSON.stringify(all));
    localStorage.setItem('reports', JSON.stringify(all));
    if(typeof renderReports==='function'){ renderReports(); }
  });
  db.ref('teacherSettings').on('value', function(snap){
    var s = snap.val();
    if(!s) return;
    localStorage.setItem('teacherSettings', JSON.stringify(s));
  });
}
if(typeof document!=='undefined'){ document.addEventListener('DOMContentLoaded', function(){ syncPullAll(); }); }
