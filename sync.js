// MRF English - Sync - بيترجم الأسئلة للطالب
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
function fixQuestions(exam){
  if(!exam) return exam;
  var qs = exam.questions || exam.qs || [];
  if(!Array.isArray(qs)){ qs = Object.values(qs); }
  exam.questions = qs.map(function(q){
    var text = q.q || q.question || q.title || '';
    var ch = q.choices || q.options || q.answers || ['','','',''];
    var corr = (q.correct!==undefined ? q.correct : (q.answer!==undefined ? q.answer : 0));
    return {q: text, question: text, title: text, choices: ch, options: ch, answers: ch, correct: corr, answer: corr, grade: q.grade||1, type: q.type||'mcq', img: q.img||q.image||''};
  });
  exam.qs = exam.questions;
  return exam;
}
function syncPushAll(){
  if(!db) return;
  try{
    var reports = JSON.parse(localStorage.getItem('studentReports')||'[]');
    if(reports.length>0){ reports.forEach(function(r){ if(r.id) db.ref('reports/'+r.id).set(r); }); }
    var students = JSON.parse(localStorage.getItem('students')||'[]');
    if(students.length>0){ students.forEach(function(s){ if(s.code) db.ref('students/'+s.code).set(s); }); }
    var cur = JSON.parse(localStorage.getItem('currentStudent')||localStorage.getItem('student')||'null');
    if(cur && cur.code){ db.ref('students/'+cur.code).set(cur); }
  }catch(e){ console.log(e); }
}
function syncPullAll(){
  if(!db) return;
  db.ref('exams').on('value', function(snap){
    var all = Object.values(snap.val()||{}).map(fixQuestions);
    if(all.length===0) return;
    var myStage = getStage();
    var mine = myStage ? all.filter(function(e){ return String(e.stage||e.targetStage)===String(myStage) || String(e.stage||e.targetStage)==='' ; }) : all;
    localStorage.setItem('exams', JSON.stringify(mine));
    localStorage.setItem('teacherExams', JSON.stringify(all));
  });
  db.ref('homeworks').on('value', function(snap){
    var all = Object.values(snap.val()||{}).map(fixQuestions);
    if(all.length===0) return;
    var myStage = getStage();
    var mine = myStage ? all.filter(function(h){ return String(h.stage||h.targetStage)===String(myStage) || String(h.stage||h.targetStage)===''; }) : all;
    localStorage.setItem('homeworks', JSON.stringify(mine));
    localStorage.setItem('teacherHomeworks', JSON.stringify(all));
  });
  db.ref('students').on('value', function(snap){
    var all = Object.values(snap.val()||{});
    if(all.length===0) return;
    localStorage.setItem('students', JSON.stringify(all));
  });
  db.ref('reports').on('value', function(snap){
    var all = Object.values(snap.val()||{});
    if(all.length===0) return;
    localStorage.setItem('studentReports', JSON.stringify(all));
    localStorage.setItem('reports', JSON.stringify(all));
  });
  
  db.ref('notifications').on('value', function(snap){
  var all = Object.values(snap.val()||{});
  if(all.length===0) return;
  var myStage = getStage();
  var mine = myStage ? all.filter(function(n){ return !n.targetStage || String(n.targetStage)===String(myStage) || n.targetStage==='all'; }) : all;
  localStorage.setItem('notifications', JSON.stringify(mine));
  localStorage.setItem('teacherNotifications', JSON.stringify(mine));
});
  db.ref('teacherSettings').on('value', function(snap){
    var s = snap.val();
    if(!s) return;
    localStorage.setItem('teacherSettings', JSON.stringify(s));
  });
}
if(typeof document!=='undefined'){ document.addEventListener('DOMContentLoaded', function(){ syncPullAll(); }); }
