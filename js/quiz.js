import {
  escapeHtml,
  normalizeTextAnswer,
  loadBestScores,
  saveBestScores
} from "./utils.js";

const quizSelect = document.getElementById("quiz-select");
const startBtn = document.getElementById("start-quiz");
const quizArea = document.getElementById("quiz-area");
const answerArea = document.getElementById("answer-area");
const feedbackEl = document.getElementById("feedback");
const nextBtn = document.getElementById("next-question");
const questionTitle = document.getElementById("question-title");
const progressEl = document.getElementById("progress");
const scoreLiveEl = document.getElementById("score-live");
const finalArea = document.getElementById("final-area");
const bestScoreEl = document.getElementById("best-score");

let quizzes = [];
let currentQuiz = null;
let qIndex = 0;
let score = 0;
let locked = false;

const bestScores = loadBestScores();

function showBestScore() {
  const id = quizSelect.value;
  const best = bestScores[id];
  bestScoreEl.textContent = best != null ? `Meilleur score: ${best} / ?` : "Meilleur score: —";
}

async function loadQuizzes() {
  const res = await fetch("./data/quizzes.json");
  quizzes = await res.json();

  quizSelect.innerHTML = "";
  quizzes.forEach((q) => {
    const opt = document.createElement("option");
    opt.value = q.id;
    opt.textContent = q.title;
    quizSelect.appendChild(opt);
  });


  updateBestScoreLine();
}

function updateBestScoreLine() {
  const id = quizSelect.value;
  const quiz = quizzes.find((x) => x.id === id);
  const best = bestScores[id];
  if (!quiz) return;

  const total = quiz.questions.length;
  bestScoreEl.textContent = best != null
    ? `Meilleur score: ${best} / ${total}`
    : `Meilleur score: — / ${total}`;
}

function startQuiz() {
  const id = quizSelect.value;
  currentQuiz = quizzes.find((x) => x.id === id);
  if (!currentQuiz) return alert("Quiz introuvable");

  qIndex = 0;
  score = 0;
  locked = false;

  finalArea.classList.add("hidden");
  quizArea.classList.remove("hidden");

  renderQuestion();
}

function renderQuestion() {
  const q = currentQuiz.questions[qIndex];
  locked = false;
  nextBtn.classList.add("hidden");
  feedbackEl.textContent = "";
  feedbackEl.className = "mt-4 text-sm";

  progressEl.textContent = `Question ${qIndex + 1} / ${currentQuiz.questions.length}`;
  questionTitle.innerHTML = escapeHtml(q.question);
  scoreLiveEl.textContent = `Score: ${score}`;

 
  answerArea.innerHTML = "";

  if (q.type === "text") {
    answerArea.innerHTML = `
      <div class="space-y-3">
        <input id="text-answer" class="w-full border rounded-lg px-3 py-2" placeholder="Ta réponse..." />
        <button id="submit-text" class="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-black">Valider</button>
      </div>
    `;

    document.getElementById("submit-text").addEventListener("click", () => {
      const val = document.getElementById("text-answer").value;
      checkAnswer({ type: "text", value: val });
    });

    
    document.getElementById("text-answer").addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const val = e.target.value;
        checkAnswer({ type: "text", value: val });
      }
    });
  }

  if (q.type === "true_false") {
    answerArea.innerHTML = `
      <div class="flex gap-3">
        <button data-bool="true" class="tf px-4 py-2 rounded-lg border hover:bg-slate-50">Vrai</button>
        <button data-bool="false" class="tf px-4 py-2 rounded-lg border hover:bg-slate-50">Faux</button>
      </div>
    `;
    answerArea.querySelectorAll(".tf").forEach((btn) => {
      btn.addEventListener("click", () => {
        checkAnswer({ type: "true_false", value: btn.dataset.bool === "true" });
      });
    });
  }
}

function checkAnswer(userAnswer) {
  if (locked) return;
  locked = true;

  const q = currentQuiz.questions[qIndex];
  let correct = false;

  if (q.type === "text") {
    const user = normalizeTextAnswer(userAnswer.value);
    const accepted = (q.acceptedAnswers || []).map(normalizeTextAnswer);
    correct = accepted.includes(user);
  }

  if (q.type === "true_false") {
    correct = Boolean(userAnswer.value) === Boolean(q.correct);
  }

  if (correct) {
    score += 1;
    feedbackEl.textContent = "✅ Correct";
    feedbackEl.classList.add("text-green-700");
  } else {
    feedbackEl.textContent = "❌ Incorrect";
    feedbackEl.classList.add("text-red-700");
  }

  scoreLiveEl.textContent = `Score: ${score}`;
  nextBtn.classList.remove("hidden");
}

function nextQuestion() {
  if (!currentQuiz) return;

  if (qIndex < currentQuiz.questions.length - 1) {
    qIndex += 1;
    renderQuestion();
  } else {
    finishQuiz();
  }
}

function finishQuiz() {
  const total = currentQuiz.questions.length;

  
  const prevBest = bestScores[currentQuiz.id];
  if (prevBest == null || score > prevBest) {
    bestScores[currentQuiz.id] = score;
    saveBestScores(bestScores);
  }

  finalArea.classList.remove("hidden");
  finalArea.innerHTML = `
    <h2 class="text-xl font-semibold">Résultat</h2>
    <p class="mt-2">Score: <span class="font-semibold">${score}</span> / ${total}</p>
    <p class="text-sm text-slate-500 mt-2">Meilleur score enregistré: ${bestScores[currentQuiz.id]} / ${total}</p>
    <div class="mt-4 flex gap-3 flex-wrap">
      <button id="restart" class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Rejouer</button>
      <a href="./flashcards.html" class="px-4 py-2 rounded-lg border hover:bg-slate-50">Aller aux Flashcards</a>
    </div>
  `;

  document.getElementById("restart").addEventListener("click", () => {
    startQuiz();
  });

  updateBestScoreLine();
}


startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
quizSelect.addEventListener("change", updateBestScoreLine);


loadQuizzes().catch(() => {
  alert("Impossible de charger data/quizzes.json (ouvre le projet avec un serveur local).");
});
