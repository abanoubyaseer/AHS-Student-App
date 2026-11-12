// ===== MRF English - Sync بين موقع المستر وتطبيق الطالب =====
var firebaseConfig = {
  apiKey: "AIzaSyClf-vI0hnh2hI_UG--KsXRiZkOU0miXhS_4",
  authDomain: "mrf-english.firebaseapp.com",
  databaseURL: "https://mrf-english-default-rtdb.firebaseio.com",
  projectId: "mrf-english",
  storageBucket: "mrf-english.firebasestorage.app",
  messagingSenderId: "388831155630",
  appId: "1:388831155630:web:a14e57cb33bb2f90aba43f"
};

var SYNC_KEYS = [
  'teacherExams',
  'teacherHomeworks',
  'teacherNotis',
  'honorBoard',
  'studentReports',
  'students',
  'forumMsgs',
  'currentStudent'
];

function syncPush(key){
  if(!window.firebaseDB) return;
  var val = localStorage.getItem(key);
  if(val===null) return;
  try{
    var parsed = JSON.parse(val);
    window.firebaseDB.ref('mrf/'+key).set(parsed);
  }catch(e){}
}
function syncPushAll(){
  SYNC_KEYS.forEach(function(k){ syncPush(k); });
}
function syncPull(){
  if(!window.firebaseDB) return;
  SYNC_KEYS.forEach(function(key){
    window.firebaseDB.ref('mrf/'+key).on('value', function(snap){
      var v = snap.val();
      if(v===null || v===undefined) return;
      var newStr = JSON.stringify(v);
      if(localStorage.getItem(key) !== newStr){
        localStorage.setItem(key, newStr);
        if(typeof renderList === 'function'){ try{ renderList(); }catch(e){} }
        if(typeof renderHonor === 'function'){ try{ renderHonor(); }catch(e){} }
        if(typeof applyAll === 'function'){ try{ applyAll(); }catch(e){} }
        if(typeof renderReports === 'function'){ try{ renderReports(); }catch(e){} }
        if(typeof renderForum === 'function'){ try{ renderForum(); }catch(e){} }
      }
    });
  });
}
var _oldSet = localStorage.setItem;
localStorage.setItem = function(k, v){
  _oldSet.apply(this, arguments);
  if(SYNC_KEYS.indexOf(k) !== -1){
    setTimeout(function(){ syncPush(k); }, 200);
  }
};
document.addEventListener('DOMContentLoaded', function(){
  setTimeout(function(){
    if(window.firebaseDB){ syncPull(); syncPushAll(); }
  }, 800);
});
