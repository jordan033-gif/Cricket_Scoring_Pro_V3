let match=null,history=JSON.parse(localStorage.getItem("cricketHistory")||"[]"),undoStack=[],deferredPrompt=null;
const $=id=>document.getElementById(id);
function show(id){document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));$(id).classList.add("active");if(id==="home")renderHome();if(id==="history")renderHistory();window.scrollTo(0,0)}
function showHome(){show("home")}function showNew(){show("new")}function showHistory(){show("history")}
function startMatch(){const name=$("matchName").value.trim()||"Friendly Match",a=$("teamA").value.trim()||"Team A",b=$("teamB").value.trim()||"Team B",overs=Math.max(1,parseInt($("totalOvers").value)||10),first=$("batFirst").value;match={id:Date.now(),name,a,b,overs,innings:1,batting:first==="A"?a:b,runs:0,wickets:0,balls:0,events:[],finished:false};undoStack=[];$("scoreMatch").textContent=name;show("score");renderScore()}
function snapshot(){undoStack.push(JSON.stringify(match));if(undoStack.length>30)undoStack.shift()}
function legalBall(){match.balls++}
function addRuns(r){snapshot();match.runs+=r;legalBall();match.events.unshift({over:formatOver(),text:r+" run"+(r===1?"":"s")});renderScore();checkEnd()}
function extra(type){snapshot();match.runs++;if(type!=="Wide"&&type!=="No Ball")legalBall();match.events.unshift({over:formatOver(),text:type+" +1"});renderScore();checkEnd()}
function wicket(){snapshot();match.wickets++;legalBall();match.events.unshift({over:formatOver(),text:"WICKET"});renderScore();checkEnd()}
function formatOver(){return Math.floor(match.balls/6)+"."+(match.balls%6)}
function renderScore(){$("runs").textContent=match.runs;$("wickets").textContent=match.wickets;$("overs").textContent=formatOver();$("rr").textContent=match.balls?(match.runs/(match.balls/6)).toFixed(2):"0.00";$("batTeam").textContent=match.batting;$("inningsLabel").textContent="Innings "+match.innings;$("balls").innerHTML=match.events.slice(0,40).map((e,i)=>`<div class="ballItem"><span>${match.events.length-i}. ${e.over}</span><b>${e.text}</b></div>`).join("")||'<div class="empty">Scoring events will appear here.</div>'}
function checkEnd(){if(match.balls>=match.overs*6||match.wickets>=10){}}
function undo(){if(!undoStack.length)return;match=JSON.parse(undoStack.pop());renderScore()}
function newInnings(){snapshot();match.innings++;match.batting=match.batting===match.a?match.b:match.a;match.runs=0;match.wickets=0;match.balls=0;match.events=[];renderScore()}
function finishMatch(){if(!match)return;match.finished=true;history.unshift({...match,finalScore:`${match.runs}/${match.wickets}`,finalOvers:formatOver(),date:new Date().toLocaleString()});history=history.slice(0,50);localStorage.setItem("cricketHistory",JSON.stringify(history));match=null;showHome()}
function renderHome(){$("matchCount").textContent=history.length;if(history[0]){$("lastScore").textContent=history[0].finalScore;$("lastOvers").textContent=history[0].finalOvers}else{$("lastScore").textContent="—";$("lastOvers").textContent="—"}$("recent").className=history.length?"cards":"cards empty";$("recent").innerHTML=history.slice(0,4).map(x=>`<div class="matchCard"><b>${esc(x.name)}</b><small>${esc(x.a)} vs ${esc(x.b)} · ${x.finalScore} in ${x.finalOvers} overs</small><small>${esc(x.date)}</small></div>`).join("")||"No matches yet. Start your first match."}
function renderHistory(){$("historyList").innerHTML=history.map(x=>`<div class="historyItem"><div class="row"><b>${esc(x.name)}</b><b>${x.finalScore}</b></div><small>${esc(x.a)} vs ${esc(x.b)} · ${x.finalOvers} overs · ${esc(x.date)}</small></div>`).join("")||'<div class="empty">No saved matches.</div>'}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("installBtn").classList.remove("hidden")});
$("installBtn").onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$("installBtn").classList.add("hidden")}};
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));
renderHome();
