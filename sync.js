// MRF English - Sync - بيصلح الربط بس، مش بيغير التصميم
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
    var exams = JSON.parse(localStorage.getItem('teacherExams')||localStorage.getItem('exams')||'[]');
    var hws = JSON.parse(localStorage.getItem('teacherHomeworks')||localStorage.getItem('homeworks')||'[]');
    var students = JSON.parse(localStorage.getItem('students')||'[]');
    var reports = JSON.parse(localStorage.getItem('studentReports')||localStorage.getItem('reports')||'[]');
    exams.forEach(function(e){
      e.targetStage = e.stage || e.targetStage || '';
      e.questions = (e.questions||[]).map(function(q){
        return {q: q.q||q.question||'', choices: q.choices||q.options||['','','',''], correct: (q.correct!==undefined?q.correct:0), grade: q.grade||1, type: q.type||'mcq', img: q.img||''};
      });
      db.ref('exams/'+e.id).set(e);
    });
    hws.forEach(function(h){
      h.targetStage = h.stage || h.targetStage || '';
      h.questions = (h.questions||[]).map(function(q){
        return {q: q.q||q.question||'', choices: q.choices||q.options||['','','',''], correct: (q.correct!==undefined?q.correct:0), grade: q.grade||1, type: q.type||'mcq', img: q.img||''};
      });
      db.ref('homeworks/'+h.id).set(h);
    });
    students.forEach(function(s){ if(s.code) db.ref('students/'+s.code).set(s); });
    reports.forEach(function(r){ if(r.id) db.ref('reports/'+r.id).set(r); });
    var instr = JSON.parse(localStorage.getItem('examInstructions')||'{}');
    db.ref('examInstructions').set(instr);
    var settings = JSON.parse(localStorage.getItem('teacherSettings')||'{}');
    db.ref('teacherSettings').set(settings);
  }catch(e){ console.log(e); }
}
function syncPullAll(){
  if(!db) return;
  db.ref('exams').on('value', function(snap){
    var all = Object.values(snap.val()||{});
    var myStage = getStage();
    var mine = myStage ? all.filter(function(e){ return (e.stage||e.targetStage)===myStage; }) : all;
    if(myStage){ localStorage.setItem('exams', JSON.stringify(mine)); }
    else { localStorage.setItem('teacherExams', JSON.stringify(all)); }
  });
  db.ref('homeworks').on('value', function(snap){
    var all = Object.values(snap.val()||{});
    var myStage = getStage();
    var mine = myStage ? all.filter(function(h){ return (h.stage||h.targetStage)===myStage; }) : all;
    if(myStage){ localStorage.setItem('homeworks', JSON.stringify(mine)); }
    else { localStorage.setItem('teacherHomeworks', JSON.stringify(all)); }
  });
  db.ref('students').on('value', function(snap){
    localStorage.setItem('students', JSON.stringify(Object.values(snap.val()||{})));
  });
  db.ref('reports').on('value', function(snap){
    var all = Object.values(snap.val()||{});
    localStorage.setItem('studentReports', JSON.stringify(all));
    localStorage.setItem('reports', JSON.stringify(all));
    if(typeof renderReports==='function'){ renderReports(); }
  });
  db.ref('teacherSettings').on('value', function(snap){
    localStorage.setItem('teacherSettings', JSON.stringify(snap.val()||{}));
    var s = snap.val()||{};
    var btn = document.getElementById('uploadToneBtn');
    if(btn && s.toneLocked){ btn.style.display='none'; }
  });
}
if(typeof document!=='undefined'){ document.addEventListener('DOMContentLoaded', function(){ syncPullAll(); }); }
