const BACKEND_URL = "https://YOURSITE-service.onrender.com";
// 로컬 테스트할 땐:
// const BACKEND_URL = "http://127.0.0.1:8000";

const THAI_CONSONANTS = [
  { char: "ก", name: "ko kai", tone: "Middle" },
  { char: "ข", name: "kho khai", tone: "High" },
  { char: "ฃ", name: "kho khuat", tone: "High" },
  { char: "ค", name: "kho khwai", tone: "Low" },
  { char: "ฅ", name: "kho khon", tone: "Low" },
  { char: "ฆ", name: "kho rakhang", tone: "Low" },
  { char: "ง", name: "ngo ngu", tone: "Low" },
  { char: "จ", name: "cho chan", tone: "Middle" },
  { char: "ฉ", name: "cho ching", tone: "High" },
  { char: "ช", name: "cho chang", tone: "Low" },
  { char: "ซ", name: "so so", tone: "Low" },
  { char: "ฌ", name: "cho choe", tone: "Low" },
  { char: "ญ", name: "yo ying", tone: "Low" },
  { char: "ฎ", name: "do chada", tone: "Middle" },
  { char: "ฏ", name: "to patak", tone: "Middle" },
  { char: "ฐ", name: "tho than", tone: "High" },
  { char: "ฑ", name: "tho montho", tone: "Low" },
  { char: "ฒ", name: "tho phuthao", tone: "Low" },
  { char: "ณ", name: "no nen", tone: "Low" },
  { char: "ด", name: "do dek", tone: "Middle" },
  { char: "ต", name: "to tao", tone: "Middle" },
  { char: "ถ", name: "tho thung", tone: "High" },
  { char: "ท", name: "tho thahan", tone: "Low" },
  { char: "ธ", name: "tho thong", tone: "Low" },
  { char: "น", name: "no nu", tone: "Low" },
  { char: "บ", name: "bo baimai", tone: "Middle" },
  { char: "ป", name: "po pla", tone: "Middle" },
  { char: "ผ", name: "pho phueng", tone: "High" },
  { char: "ฝ", name: "fo fa", tone: "High" },
  { char: "พ", name: "pho phan", tone: "Low" },
  { char: "ฟ", name: "fo fan", tone: "Low" },
  { char: "ภ", name: "pho samphao", tone: "Low" },
  { char: "ม", name: "mo ma", tone: "Low" },
  { char: "ย", name: "yo yak", tone: "Low" },
  { char: "ร", name: "ro ruea", tone: "Low" },
  { char: "ล", name: "lo ling", tone: "Low" },
  { char: "ว", name: "wo waen", tone: "Low" },
  { char: "ศ", name: "so sala", tone: "High" },
  { char: "ษ", name: "so ruesi", tone: "High" },
  { char: "ส", name: "so suea", tone: "High" },
  { char: "ห", name: "ho hip", tone: "High" },
  { char: "ฬ", name: "lo chula", tone: "Low" },
  { char: "อ", name: "o ang", tone: "Middle" },
  { char: "ฮ", name: "ho nokhuk", tone: "Low" },
];

const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const nicknameInput = document.getElementById("nickname-input");
const startBtn = document.getElementById("start-btn");
const startError = document.getElementById("start-error");

const playerLine = document.getElementById("player-line");
const metaLine = document.getElementById("meta-line");
const livesEl = document.getElementById("lives");
const remainingEl = document.getElementById("remaining");
const thaiCharEl = document.getElementById("thai-char");
const choicesEl = document.getElementById("choices");
const feedbackEl = document.getElementById("feedback");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");

let nickname = "";
let quizStarts = 0;
let lives = 3;
let questions = [];
let currentIndex = 0;
let answered = false;

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getLabel(item) {
  return `${item.name} — ${item.tone}`;
}

function buildQuiz() {
  questions = shuffle(THAI_CONSONANTS);
  currentIndex = 0;
  lives = 3;
  answered = false;
  updateHeader();
  renderQuestion();
}

function updateHeader() {
  playerLine.textContent = nickname;
  metaLine.textContent = `Starts: ${quizStarts}`;
  livesEl.textContent = "❤️".repeat(lives) + "🖤".repeat(3 - lives);
  remainingEl.textContent = `Remaining: ${questions.length - currentIndex}`;
}

function renderQuestion() {
  feedbackEl.textContent = "";
  nextBtn.classList.add("hidden");
  restartBtn.classList.add("hidden");
  choicesEl.innerHTML = "";

  if (lives <= 0) {
    thaiCharEl.textContent = "💀";
    feedbackEl.textContent = "Game Over";
    restartBtn.classList.remove("hidden");
    remainingEl.textContent = `Remaining: ${questions.length - currentIndex}`;
    return;
  }

  if (currentIndex >= questions.length) {
    thaiCharEl.textContent = "🎉";
    feedbackEl.textContent = "You cleared all Thai consonants!";
    remainingEl.textContent = "Remaining: 0";
    restartBtn.classList.remove("hidden");
    return;
  }

  answered = false;

  const current = questions[currentIndex];
  thaiCharEl.textContent = current.char;

  const wrongPool = THAI_CONSONANTS.filter(
    (item) => item.char !== current.char
  );

  const wrongChoices = shuffle(wrongPool).slice(0, 2);
  const options = shuffle([current, ...wrongChoices]);

  options.forEach((option) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = getLabel(option);
    btn.addEventListener("click", () => handleAnswer(option, current, btn));
    choicesEl.appendChild(btn);
  });

  updateHeader();
}

function handleAnswer(selected, correct, clickedBtn) {
  if (answered) return;
  answered = true;

  const buttons = [...document.querySelectorAll(".choice-btn")];
  buttons.forEach((btn) => (btn.disabled = true));

  if (selected.char === correct.char) {
    clickedBtn.classList.add("correct");
    feedbackEl.textContent = "Correct!";
  } else {
    clickedBtn.classList.add("wrong");
    lives -= 1;
    feedbackEl.textContent = `Wrong. Correct answer: ${getLabel(correct)}`;

    buttons.forEach((btn) => {
      if (btn.textContent === getLabel(correct)) {
        btn.classList.add("correct");
      }
    });
  }

  updateHeader();

  if (lives <= 0) {
    restartBtn.classList.remove("hidden");
  } else {
    nextBtn.classList.remove("hidden");
  }
}

nextBtn.addEventListener("click", () => {
  currentIndex += 1;
  renderQuestion();
});

restartBtn.addEventListener("click", () => {
  buildQuiz();
});

startBtn.addEventListener("click", async () => {
  const rawNickname = nicknameInput.value.trim();

  if (!rawNickname) {
    startError.textContent = "Please enter your nickname.";
    return;
  }

  startError.textContent = "";
  startBtn.disabled = true;
  startBtn.textContent = "Starting...";

  try {
    const res = await fetch(`${BACKEND_URL}/users/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nickname: rawNickname }),
    });

    if (!res.ok) {
      throw new Error("Failed to start quiz.");
    }

    const data = await res.json();

    nickname = data.nickname;
    quizStarts = data.quiz_starts;

    startScreen.classList.add("hidden");
    quizScreen.classList.remove("hidden");

    buildQuiz();
  } catch (error) {
    console.error(error);
    startError.textContent =
      "Could not reach backend. Check your backend URL or service status.";
  } finally {
    startBtn.disabled = false;
    startBtn.textContent = "Start Quiz";
  }
});

nicknameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    startBtn.click();
  }
});