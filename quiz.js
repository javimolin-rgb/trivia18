let allQuestions=Array.isArray(window.QUESTION_BANK)?window.QUESTION_BANK.slice():[];
let questions=[];
let topics=[];
let current=0;
let score=0;
let userAnswers=[];
let wrongQuestions=[];
let answered=false;
let currentTopic='';

const $=id=>document.getElementById(id);
const intro=$('intro'),topicScreen=$('topicScreen'),quizScreen=$('quizScreen'),resultScreen=$('resultScreen');
const startBtn=$('startBtn'),loading=$('loading'),loadError=$('loadError');

function init(){
  if(!allQuestions.length){
    loading.hidden=true;
    loadError.hidden=false;
    loadError.textContent='No se encontró el banco de preguntas. Asegúrate de que questions.js esté en la misma carpeta que quiz.html.';
    startBtn.disabled=true;
    return;
  }
  topics=[...new Set(allQuestions.map(q=>q.topic).filter(Boolean))];
  $('topicCount').textContent=topics.length;
  loading.textContent=`${allQuestions.length} preguntas listas · ${topics.length} temas.`;
  startBtn.disabled=false;
}

function showTopics(){
  intro.hidden=true;
  quizScreen.hidden=true;
  resultScreen.hidden=true;
  topicScreen.hidden=false;
  renderTopics();
  window.scrollTo({top:0,behavior:'smooth'});
}

function renderTopics(){
  const grid=$('topicGrid');
  grid.innerHTML=topics.map(topic=>{
    const count=allQuestions.filter(q=>q.topic===topic).length;
    const done=topicProgress(topic);
    const pct=count?Math.round(done/count*100):0;
    return `<button class="topic-card" type="button" data-topic="${escapeHtml(topic)}">
      <span class="topic-card-icon">${escapeHtml(topic.split(' ')[0])}</span>
      <span class="topic-card-title">${escapeHtml(topic.replace(/^\S+\s*/,''))}</span>
      <span class="topic-card-count">${count} preguntas</span>
      <span class="topic-progress"><span style="width:${pct}%"></span></span>
      <span class="topic-card-status">${done?`${done}/${count} respondidas`:'Comenzar tema →'}</span>
    </button>`;
  }).join('');
  grid.querySelectorAll('.topic-card').forEach(btn=>btn.addEventListener('click',()=>startTopic(btn.dataset.topic)));
}

function topicProgress(topic){
  try{return Number(localStorage.getItem(`trivia18-progress-${topic}`)||0)}catch(e){return 0}
}
function saveTopicProgress(){
  try{localStorage.setItem(`trivia18-progress-${currentTopic}`,String(Math.max(topicProgress(currentTopic),current+1)))}catch(e){}
}

function startTopic(topic){
  currentTopic=topic;
  questions=allQuestions.filter(q=>q.topic===topic);
  current=0;
  score=0;
  userAnswers=Array(questions.length).fill(null);
  wrongQuestions=[];
  answered=false;
  topicScreen.hidden=true;
  resultScreen.hidden=true;
  quizScreen.hidden=false;
  $('topicLabel').textContent=currentTopic;
  renderQuestion();
  window.scrollTo({top:0,behavior:'smooth'});
}

function renderQuestion(){
  if(!questions.length)return;
  const q=questions[current];
  answered=userAnswers[current]!==null&&userAnswers[current]!==undefined;
  $('questionNumber').textContent=`Pregunta ${current+1} de ${questions.length}`;
  $('score').textContent=score;
  $('progressBar').style.width=`${((current+1)/questions.length)*100}%`;
  $('questionArea').innerHTML=`<div class="question-card"><h2>${escapeHtml(q.q)}</h2><div class="answer-list">${q.o.map((option,i)=>`<button class="answer-btn" data-index="${i}" type="button">${String.fromCharCode(65+i)}) ${escapeHtml(option)}</button>`).join('')}</div>${answered?`<div id="feedback" class="feedback"></div>`:''}</div>`;
  document.querySelectorAll('.answer-btn').forEach(btn=>btn.addEventListener('click',()=>answerQuestion(Number(btn.dataset.index))));
  $('previousBtn').disabled=current===0;
  $('continueBtn').disabled=!answered;
  if(answered)restoreAnswer();
}

function answerQuestion(selected){
  if(answered)return;
  const q=questions[current];
  answered=true;
  userAnswers[current]=selected;
  if(selected===q.a)score++;
  else wrongQuestions.push(current);
  saveTopicProgress();
  document.querySelectorAll('.answer-btn').forEach((btn,i)=>{
    btn.disabled=true;
    if(i===q.a)btn.classList.add('correct');
    if(i===selected&&selected!==q.a)btn.classList.add('wrong');
  });
  $('score').textContent=score;
  showFeedback(q,selected);
  $('continueBtn').disabled=false;
}

function showFeedback(q,selected){
  const feedback=$('feedback')||document.createElement('div');
  if(!feedback.id){feedback.id='feedback';feedback.className='feedback';$('questionArea').querySelector('.question-card').appendChild(feedback)}
  const ok=selected===q.a;
  feedback.innerHTML=`<strong>${ok?'✅ ¡Correcta!':'❌ Incorrecta'}</strong><div>Respuesta: <b>${String.fromCharCode(65+q.a)}) ${escapeHtml(q.o[q.a])}</b></div>${q.e?`<div style="margin-top:6px">${escapeHtml(q.e)}</div>`:''}`;
}

function restoreAnswer(){
  const q=questions[current],selected=userAnswers[current];
  document.querySelectorAll('.answer-btn').forEach((btn,i)=>{
    btn.disabled=true;
    if(i===q.a)btn.classList.add('correct');
    if(i===selected&&selected!==q.a)btn.classList.add('wrong');
  });
  showFeedback(q,selected);
}

function nextQuestion(){
  if(!answered)return;
  if(current<questions.length-1){
    current++;
    renderQuestion();
    window.scrollTo({top:quizScreen.offsetTop-65,behavior:'smooth'});
  }else finishTopic();
}

function previousQuestion(){
  if(current>0){
    current--;
    renderQuestion();
    window.scrollTo({top:quizScreen.offsetTop-65,behavior:'smooth'});
  }
}

function finishTopic(){
  quizScreen.hidden=true;
  resultScreen.hidden=false;
  const total=questions.length;
  const wrong=total-score;
  const pct=Math.round(score/total*100);
  $('percentage').textContent=`${pct}%`;
  $('correctCount').textContent=score;
  $('wrongCount').textContent=wrong;
  $('resultSummary').textContent=`Obtuviste ${score} de ${total} correctas en este tema.`;
  $('resultTopic').textContent=currentTopic;
  window.scrollTo({top:0,behavior:'smooth'});
}

function restartQuiz(){
  if(confirm('¿Quieres reiniciar este tema desde la primera pregunta?'))startTopic(currentTopic);
}
function retryQuiz(){startTopic(currentTopic)}
function reviewWrongAnswers(){
  if(!wrongQuestions.length){alert('¡No tienes errores para revisar! 🎉');return}
  questions=wrongQuestions.map(i=>questions[i]);
  current=0;
  score=0;
  userAnswers=Array(questions.length).fill(null);
  wrongQuestions=[];
  answered=false;
  resultScreen.hidden=true;
  quizScreen.hidden=false;
  $('topicLabel').textContent=`Repaso: ${currentTopic}`;
  renderQuestion();
  window.scrollTo({top:0,behavior:'smooth'});
}
function exitTopic(){showTopics()}
function escapeHtml(value){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

startBtn.addEventListener('click',showTopics);
$('continueBtn').addEventListener('click',nextQuestion);
$('previousBtn').addEventListener('click',previousQuestion);
$('retryBtn').addEventListener('click',retryQuiz);
$('reviewBtn').addEventListener('click',reviewWrongAnswers);
$('topicsBtn').addEventListener('click',showTopics);
$('exitTopicBtn').addEventListener('click',exitTopic);
$('restartTop').addEventListener('click',()=>{
  if(!quizScreen.hidden)restartQuiz();
  else if(!topicScreen.hidden)showTopics();
  else showTopics();
});
init();
