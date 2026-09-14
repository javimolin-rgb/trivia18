/* =========================================================
   TRIVIA DIECIOCHERA 2026
   QUIZ INDEPENDIENTE

   El banco de preguntas se obtiene automáticamente
   desde index.html.

   Así NO necesitas duplicar las 240+ preguntas.
   ========================================================= */


let questions = [];

let current = 0;

let score = 0;

let answered = false;

let userAnswers = [];

let wrongQuestions = [];


/* =========================================================
   ELEMENTOS
   ========================================================= */

const intro =
  document.getElementById("intro");

const quizScreen =
  document.getElementById("quizScreen");

const resultScreen =
  document.getElementById("resultScreen");

const loading =
  document.getElementById("loading");

const loadError =
  document.getElementById("loadError");

const startBtn =
  document.getElementById("startBtn");

const retryBtn =
  document.getElementById("retryBtn");

const reviewBtn =
  document.getElementById("reviewBtn");

const restartTop =
  document.getElementById("restartTop");

const previousBtn =
  document.getElementById("previousBtn");

const continueBtn =
  document.getElementById("continueBtn");

const questionArea =
  document.getElementById("questionArea");

const questionNumber =
  document.getElementById("questionNumber");

const progressBar =
  document.getElementById("progressBar");

const scoreElement =
  document.getElementById("score");

const percentageElement =
  document.getElementById("percentage");

const resultSummary =
  document.getElementById("resultSummary");

const correctCount =
  document.getElementById("correctCount");

const wrongCount =
  document.getElementById("wrongCount");


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

  return String(value)

    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");

}


/* =========================================================
   CARGAR PREGUNTAS DESDE INDEX.HTML
   ========================================================= */

async function loadQuestions() {

  try {

    const response =
      await fetch("index.html", {
        cache: "no-store"
      });

    if (!response.ok) {

      throw new Error(
        "No se pudo cargar index.html"
      );

    }


    const html =
      await response.text();


    /*
      Buscamos:

      const D=[ ... ];

      const total=D.length;

      No necesitamos copiar el banco de preguntas.
    */

    const startMarker =
      "const D=";

    const endMarker =
      "const total=D.length";


    const start =
      html.indexOf(startMarker);


    const end =
      html.indexOf(endMarker);


    if (
      start === -1 ||
      end === -1 ||
      end <= start
    ) {

      throw new Error(
        "No se encontró el banco de preguntas."
      );

    }


    const dataText =
      html
        .slice(
          start + startMarker.length,
          end
        )
        .trim()
        .replace(/;$/, "");


    /*
      D es un array JavaScript que ya está
      definido en TU propio index.html.

      Lo evaluamos únicamente después de haber
      obtenido ese bloque desde el mismo archivo.
    */

    const getData =
      new Function(
        "return (" +
        dataText +
        ")"
      );


    questions =
      getData();


    if (
      !Array.isArray(questions) ||
      !questions.length
    ) {

      throw new Error(
        "El banco de preguntas está vacío."
      );

    }


    loading.textContent =
      questions.length +
      " preguntas listas.";


    startBtn.disabled = false;


  } catch (error) {

    console.error(error);

    loading.hidden = true;

    loadError.hidden = false;

    loadError.textContent =
      "No se pudieron cargar las preguntas. " +
      "Asegúrate de que quiz.html y index.html " +
      "estén en la misma carpeta.";

    startBtn.disabled = true;

  }

}


/* =========================================================
   INICIAR
   ========================================================= */

function startQuiz() {

  current = 0;

  score = 0;

  answered = false;

  userAnswers = [];

  wrongQuestions = [];


  intro.hidden = true;

  resultScreen.hidden = true;

  quizScreen.hidden = false;


  renderQuestion();


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================================
   RENDER DE PREGUNTA
   ========================================================= */

function renderQuestion() {

  const question =
    questions[current];


  answered = false;


  questionNumber.textContent =
    "Pregunta " +
    (current + 1) +
    " de " +
    questions.length;


  scoreElement.textContent =
    score;


  progressBar.style.width =
    (
      ((current + 1) /
      questions.length) *
      100
    ) +
    "%";


  previousBtn.disabled =
    current === 0;


  continueBtn.disabled = true;


  continueBtn.textContent =
    current === questions.length - 1
      ? "Ver resultado ✓"
      : "Continuar →";


  questionArea.innerHTML = `

    <h2 class="question-title">
      ${escapeHTML(question.q)}
    </h2>

    <div class="answer-list">

      ${question.o.map((option, index) => `

        <button
          class="answer"
          type="button"
          data-index="${index}"
        >

          <span class="answer-letter">
            ${String.fromCharCode(65 + index)}
          </span>

          <span class="answer-text">
            ${escapeHTML(option)}
          </span>

        </button>

      `).join("")}

    </div>

    <div
      id="feedback"
      class="feedback"
      hidden
    ></div>

  `;


  questionArea
    .querySelectorAll(".answer")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          answerQuestion(
            Number(button.dataset.index)
          );

        }
      );

    });

}


/* =========================================================
   RESPONDER
   ========================================================= */

function answerQuestion(selected) {

  if (answered) return;


  answered = true;


  const question =
    questions[current];


  const correct =
    selected === question.a;


  userAnswers[current] =
    selected;


  if (correct) {

    score++;

  } else {

    wrongQuestions.push(current);

  }


  scoreElement.textContent =
    score;


  const buttons =
    questionArea.querySelectorAll(
      ".answer"
    );


  buttons.forEach(
    (button, index) => {

      button.disabled = true;


      if (
        index === question.a
      ) {

        button.classList.add(
          "correct"
        );

      }


      if (
        index === selected &&
        index !== question.a
      ) {

        button.classList.add(
          "wrong"
        );

      }

    }
  );


  showFeedback(
    question,
    correct
  );


  continueBtn.disabled = false;


  /*
    Si es la última pregunta,
    el botón cambia a resultado.
  */

  continueBtn.textContent =
    current === questions.length - 1
      ? "Ver resultado ✓"
      : "Continuar →";

}


/* =========================================================
   FEEDBACK
   ========================================================= */

function showFeedback(
  question,
  correct
) {

  const feedback =
    document.getElementById(
      "feedback"
    );


  const correctText =
    String.fromCharCode(
      65 + question.a
    ) +
    ") " +
    question.o[question.a];


  const title =
    correct
      ? "✅ ¡Correcto!"
      : "❌ Era otra";


  let explanation = "";


  if (question.e) {

    explanation = `
      <div class="feedback-explanation">
        ${escapeHTML(question.e)}
      </div>
    `;

  }


  feedback.innerHTML = `

    <div class="feedback-title">
      ${title}
    </div>

    <div>
      Respuesta correcta:
      <span class="feedback-answer">
        ${escapeHTML(correctText)}
      </span>
    </div>

    ${explanation}

  `;


  feedback.hidden = false;


  /*
    Lleva suavemente el feedback
    a la vista en teléfonos.
  */

  setTimeout(() => {

    feedback.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });

  }, 80);

}


/* =========================================================
   SIGUIENTE
   ========================================================= */

function nextQuestion() {

  if (!answered) return;


  if (
    current <
    questions.length - 1
  ) {

    current++;

    renderQuestion();


    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });


  } else {

    finishQuiz();

  }

}


/* =========================================================
   ANTERIOR
   ========================================================= */

function previousQuestion() {

  if (current <= 0) return;


  current--;

  renderQuestion();


  /*
    Si ya había respondido esta pregunta,
    volvemos a mostrar su respuesta.
  */

  if (
    userAnswers[current] !== undefined
  ) {

    restoreAnswer();

  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================================
   RESTAURAR RESPUESTA AL VOLVER ATRÁS
   ========================================================= */

function restoreAnswer() {

  const selected =
    userAnswers[current];


  const question =
    questions[current];


  const buttons =
    questionArea.querySelectorAll(
      ".answer"
    );


  answered = true;


  buttons.forEach(
    (button, index) => {

      button.disabled = true;


      if (
        index === question.a
      ) {

        button.classList.add(
          "correct"
        );

      }


      if (
        index === selected &&
        index !== question.a
      ) {

        button.classList.add(
          "wrong"
        );

      }

    }
  );


  showFeedback(
    question,
    selected === question.a
  );


  continueBtn.disabled = false;


  continueBtn.textContent =
    current === questions.length - 1
      ? "Ver resultado ✓"
      : "Continuar →";

}


/* =========================================================
   TERMINAR
   ========================================================= */

function finishQuiz() {

  const total =
    questions.length;


  const percentage =
    Math.round(
      (score / total) * 100
    );


  quizScreen.hidden = true;

  resultScreen.hidden = false;


  percentageElement.textContent =
    percentage + "%";


  correctCount.textContent =
    score;


  wrongCount.textContent =
    total - score;


  let message;


  if (percentage >= 90) {

    message =
      "🔥 ¡Nivelazo! Estás muy preparada para la trivia.";

  } else if (percentage >= 75) {

    message =
      "👏 ¡Muy bien! Ya tienes una base muy sólida.";

  } else if (percentage >= 60) {

    message =
      "💪 Vas bien. Un repaso más y puedes subir muchísimo.";

  } else {

    message =
      "📚 Buen punto de partida. Revisa la guía y vuelve a intentarlo.";

  }


  resultSummary.innerHTML =
    `<strong>${score} de ${total}</strong> correctas.<br>${message}`;


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================================
   REINICIAR
   ========================================================= */

function restartQuiz() {

  const confirmed =
    window.confirm(
      "¿Quieres reiniciar el quiz? Se perderá tu progreso actual."
    );


  if (!confirmed) return;


  startQuiz();

}


/* =========================================================
   REPETIR
   ========================================================= */

function retryQuiz() {

  startQuiz();

}


/* =========================================================
   REVISAR ERRORES
   ========================================================= */

function reviewWrongAnswers() {

  if (!wrongQuestions.length) {

    window.alert(
      "¡No tienes errores! 🎉"
    );

    return;

  }


  /*
    Creamos una versión del quiz
    únicamente con las preguntas
    que fallaste.
  */

  const originalQuestions =
    questions;


  questions =
    wrongQuestions.map(
      index =>
        originalQuestions[index]
    );


  current = 0;

  score = 0;

  answered = false;

  userAnswers = [];

  wrongQuestions = [];


  resultScreen.hidden = true;

  quizScreen.hidden = false;


  renderQuestion();


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================================
   EVENTOS
   ========================================================= */

startBtn.addEventListener(
  "click",
  startQuiz
);


continueBtn.addEventListener(
  "click",
  nextQuestion
);


previousBtn.addEventListener(
  "click",
  previousQuestion
);


restartTop.addEventListener(
  "click",
  restartQuiz
);


retryBtn.addEventListener(
  "click",
  retryQuiz
);


reviewBtn.addEventListener(
  "click",
  reviewWrongAnswers
);


/* =========================================================
   ARRANQUE
   ========================================================= */

startBtn.disabled = true;

loadQuestions();
