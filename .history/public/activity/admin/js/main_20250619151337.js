let confettiAnimationId = null;
function handleQuestionHover(text) {
  if (isTransitioning) return; // Only block if in answer-feedback phase
  const questionEl = document.getElementById("question-text");
  questionEl.classList.add("hovered-question");
  speakText(text);

  setTimeout(() => {
    questionEl.classList.remove("hovered-question");
  }, 1000);
}

let questions = [];
let questionsLoaded = false;

function fetchQuestions(callback) {
  $.ajax({
    url: "/admin/activity/questions/get",
    method: "POST",
    contentType: false,
    processData: false,
    success: function (res) {
      if (Array.isArray(res)) {
        questions = res;
        questionsLoaded = true;
        console.log("✅ Questions loaded:", questions);

        userAnswers = new Array(questions.length).fill(null);
        userAnswers[0] = [];

        if (typeof callback === "function") {
          callback();
        }
      } else {
        console.warn("⚠️ Invalid question data received.");
      }
    },
    error: function (xhr) {
      let errorMessage = "An error occurred.";
      if (xhr.responseJSON && xhr.responseJSON.message) {
        errorMessage = xhr.responseJSON.message;
      }
      console.warn("⚠️", errorMessage);
    },
  });
}

// const questions = [
//   {
//     question: "What gives us water?",
//     image: "./images/Question 1/Question.png",
//     options: [
//       { text: "Pencil", image: "./images/Question 1/Option 1.png" },
//       { text: "Chair", image: "./images/Question 1/Option 2.png" },
//       { text: "Rain", image: "./images/Question 1/Option 3.png" },
//       { text: "Table", image: "./images/Question 1/Option 4.png" },
//     ],
//     correct: [1, 2],
//   },
//   {
//     question: "Where does rainwater go?",
//     image: "./images/Question 2/Question.png",
//     options: [
//       { text: "Toys", image: "./images/Question 2/Option 1.png" },
//       { text: "Rivers", image: "./images/Question 2/Option 2.png" },
//       { text: "Sky", image: "./images/Question 2/Option 3.png" },
//       { text: "Cars", image: "./images/Question 2/Option 4.png" },
//     ],
//     correct: 1,
//   },
//   {
//     question: "What is ice made of?",
//     image: "./images/Question 3/Question.png",
//     options: [
//       { text: "Pencil", image: "./images/Question 3/Option 1.png" },
//       { text: "Water", image: "./images/Question 3/Option 2.png" },
//       { text: "Rock", image: "./images/Question 3/Option 3.png" },
//       { text: "Sand", image: "./images/Question 3/Option 4.png" },
//     ],
//     correct: 1,
//   },
//   {
//     question: "What do we see when water becomes gas?",
//     image: "./images/Question 4/Question.png",
//     options: [
//       { text: "Board", image: "./images/Question 4/Option 1.png" },
//       { text: "Sand", image: "./images/Question 4/Option 2.png" },
//       { text: "Vapour", image: "./images/Question 4/Option 3.png" },
//       { text: "Paint", image: "./images/Question 4/Option 4.png" },
//     ],
//     correct: 2,
//   },
//   {
//     question: "What should we do with water?",
//     image: "./images/Question 5/Question.png",
//     options: [
//       { text: "Plant", image: "./images/Question 5/Option 1.png" },
//       { text: "Drink", image: "./images/Question 5/Option 2.png" },
//       { text: "Shelf", image: "./images/Question 5/Option 3.png" },
//       { text: "Sofa", image: "./images/Question 5/Option 4.png" },
//     ],
//     correct: 1,
//   },
// ];

let currentQuestion = 0;
let correctAnswers = 0;
let wrongAnswers = 0;
let totalTime = 0;
let timer;
let reminderTimer;
let userAnswers = new Array(questions.length).fill(null);
userAnswers[0] = [];
let currentSpeech = null;
let isTransitioning = false;

function stopCurrentSpeech() {
  if (currentSpeech) {
    window.speechSynthesis.cancel();
    currentSpeech = null;
  }
}

function speakQuestion(text) {
  stopCurrentSpeech();
  duckBackgroundAudio(); // 🔉 lower bg

  const el = document.getElementById("question-text");
  el.innerHTML = "";
  let index = 0;

  const typeInterval = setInterval(() => {
    if (index < text.length) {
      el.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(typeInterval);
    }
  }, 50);

  currentSpeech = new SpeechSynthesisUtterance(text);
  currentSpeech.lang = "en-US";
  currentSpeech.onend = () => {
    currentSpeech = null;
    restoreBackgroundAudio(); // 🔊 restore bg
  };
  window.speechSynthesis.speak(currentSpeech);
}

function speakText(text, callback = null) {
  stopCurrentSpeech();
  currentSpeech = new SpeechSynthesisUtterance(text);
  currentSpeech.lang = "en-US";

  currentSpeech.onend = () => {
    currentSpeech = null;
    if (callback) callback();
  };

  window.speechSynthesis.speak(currentSpeech);
}

function startReminderTimer() {
  if (reminderTimer) clearInterval(reminderTimer);

  reminderTimer = setInterval(() => {
    const answer = userAnswers[currentQuestion];
    const isUnanswered =
      (currentQuestion === 0 && answer.length < 2) ||
      (currentQuestion !== 0 && answer === null);

    if (isUnanswered) {
      speakText("Find the correct answer.");
    }
  }, 10 * 1000); // ⚠️ 1,500 ms = 1.5 seconds
}

function loadQuestion() {
  const question = questions[currentQuestion];
  const questionContainer = document.getElementById("question-container");
  const answersContainer = document.getElementById("answers-container");
  const progressBar = document.getElementById("progress-bar");

  progressBar.style.width = `${
    ((currentQuestion + 1) / questions.length) * 100
  }%`;

  questionContainer.innerHTML = `
        <div class="quiz-question">
            <h2 id="question-text" onmouseover="handleQuestionHover('${question.question}')">${question.question}</h2>
        </div>
        <img src="/${question.image}" alt="question image" style="display:${question.image ? "block" : "none"}" class="question-image">
        <div class="audio-icon" onclick="speakQuestionOrResult()"><i class="fa fa-volume-up"></i></div>
    `;

  answersContainer.innerHTML = "";

  question.options.forEach((option, index) => {
    const optionDiv = document.createElement("div");
    optionDiv.classList.add("answer-option");
    optionDiv.innerHTML = `
            <img src="/${option.image}" style="display:${option.image ? "block" : "none"}" alt="${option.text}" class="option-image">
            <div class="option-text">${option.text}</div>
        `;

    const userAnswer = userAnswers[currentQuestion];

    // Handle Question 0 (multi-select)
    if (currentQuestion === 0) {
      optionDiv.style.pointerEvents = userAnswer.length === 2 ? "none" : "auto";

      if (userAnswer.includes(index)) {
        const isCorrect = question.correct.includes(index);
        optionDiv.classList.add(isCorrect ? "correct" : "incorrect");
        optionDiv.innerHTML += isCorrect
          ? '<div class="result-icon"><i class="fa fa-check colour-green"></i></div>'
          : '<div class="result-icon"><i class="fa fa-times colour-red"></i></div>';
      }

      if (userAnswer.length < 2) {
        optionDiv.onclick = () => {
          if (!isTransitioning) toggleAnswerQ0(index);
        };
      }
    } else {
      // For all other questions
      const isCorrect = index === question.correct;

      if (userAnswer !== null) {
        // Disable clicking and show result
        optionDiv.style.pointerEvents = userAnswer !== null ? "none" : "auto";

        if (userAnswer === index) {
          optionDiv.classList.add(isCorrect ? "correct" : "incorrect");
          optionDiv.innerHTML += isCorrect
            ? '<div class="result-icon"><i class="fa fa-check colour-green"></i></div>'
            : '<div class="result-icon"><i class="fa fa-times colour-red"></i></div>';
        } else if (isCorrect) {
          // Show correct option even if not selected
          optionDiv.classList.add("correct");
          optionDiv.innerHTML +=
            '<div class="result-icon"><i class="fa fa-check colour-green"></i></div>';
        }
      } else {
        optionDiv.style.pointerEvents = "auto";
        optionDiv.onclick = () => {
          if (!isTransitioning) checkAnswer(index);
        };
      }
    }

    optionDiv.onmouseover = () => speakText(option.text);
    answersContainer.appendChild(optionDiv);
  });

  updateNavigationButtons();

  if (!timer) startTimer();
  startReminderTimer();

  if (
    userAnswers[currentQuestion] === null ||
    (currentQuestion === 0 && userAnswers[0].length === 0)
  ) {
    speakQuestion(question.question);
  }
}

function toggleAnswerQ0(selectedIndex) {
  const selectedAnswers = userAnswers[0];

  if (selectedAnswers.includes(selectedIndex)) {
    selectedAnswers.splice(selectedAnswers.indexOf(selectedIndex), 1);
  } else if (selectedAnswers.length < 2) {
    selectedAnswers.push(selectedIndex);
  }

  loadQuestion();

  if (selectedAnswers.length === 2) {
    document
      .querySelectorAll(".answer-option")
      .forEach((opt) => (opt.style.pointerEvents = "none"));

    const correctSet = new Set(questions[0].correct);
    console.log("correctSet  "+correctSet);
    const selectedSet = new Set(selectedAnswers);
    console.log("selectedSet  "+selectedSet);

    const isFullyCorrect =
      selectedAnswers.every((i) => correctSet.has(i)) &&
      selectedAnswers.length === correctSet.size;
    const isAnyCorrect = selectedAnswers.some((i) => correctSet.has(i));

    // 🧮 Count score:
    if (isFullyCorrect) {
      correctAnswers++;
    } else {
      wrongAnswers++;
    }

    // ✅ Show correct options
    document.querySelectorAll(".answer-option").forEach((opt, idx) => {
      if (correctSet.has(idx)) {
        opt.classList.add("correct");
        if (!opt.querySelector(".result-icon")) {
          opt.innerHTML +=
            '<div class="result-icon"><i class="fa fa-check colour-green"></i></div>';
        }
      }
    });

    new Audio(isAnyCorrect ? "/activity/admin/right.mp3" : "/activity/admin/wrong.mp3").play();

    const correctText = questions[0].correct
      .map((i) => questions[0].options[i].text)
      .join(" and ");
    speakText(`The right answers are ${correctText}`, () => {
      setTimeout(() => navigate("next"), 1000);
    });

    document.getElementById("next-btn").disabled = false;
  } else {
    document.getElementById("next-btn").disabled = true;
  }
}

function checkAnswer(selectedIndex) {
  if (isTransitioning) return;
  isTransitioning = true;

  const question = questions[currentQuestion];
  const answerOptions = document.querySelectorAll(".answer-option");
  answerOptions.forEach((opt) => (opt.style.pointerEvents = "none"));

  userAnswers[currentQuestion] = selectedIndex;

  const isCorrect = Array.isArray(question.correct)
    ? question.correct.includes(selectedIndex)
    : selectedIndex === question.correct;

  if (isCorrect) {
    correctAnswers++;
    answerOptions[selectedIndex].classList.add("correct");
    answerOptions[selectedIndex].innerHTML +=
      '<div class="result-icon"><i class="fa fa-check colour-green"></i></div>';
    new Audio("/activity/admin/right.mp3").play();

    speakText("Well done! Your answer is correct!", () => {
      setTimeout(() => {
        isTransitioning = false;
        navigate("next");
      }, 1000);
    });
  } else {
    wrongAnswers++;
    answerOptions[selectedIndex].classList.add("incorrect");
    answerOptions[selectedIndex].innerHTML +=
      '<div class="result-icon"><i class="fa fa-times colour-red"></i></div>';

    answerOptions.forEach((opt, idx) => {
      if (
        Array.isArray(question.correct)
          ? question.correct.includes(idx)
          : idx === question.correct
      ) {
        opt.classList.add("correct");
        opt.innerHTML +=
          '<div class="result-icon"><i class="fa fa-check colour-green"></i></div>';
      }
    });

    new Audio("/activity/admin/wrong.mp3").play();

    speakText("Oops! Your answer is incorrect.", () => {
      setTimeout(() => {
        isTransitioning = false;
        navigate("next");
      }, 1000);
    });
  }

  document.getElementById("next-btn").disabled = false;
}

// Inside your existing JS function
function navigate(direction) {
  stopCurrentSpeech();
  isTransitioning = false;

  if (direction === "next" && currentQuestion < questions.length - 1) {
    currentQuestion++;
    loadQuestion();
  }
  // ✅ This already exists and is correct
  else if (direction === "previous" && currentQuestion > 0) {
    currentQuestion--;
    loadQuestion();
  } else if (direction === "next") {
    clearInterval(timer);
    stopCurrentSpeech();
    new Audio("/activity/admin/result.mp3").play();
    showResultModal();
  }
  updateNavigationButtons();
}

function updateNavigationButtons() {
  document.getElementById("prev-btn").disabled = currentQuestion === 0;
  document.getElementById("next-btn").disabled =
    currentQuestion === 0
      ? userAnswers[0].length !== 2
      : userAnswers[currentQuestion] === null;
}

function startTimer() {
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    totalTime++;
    document.getElementById("timer-count").textContent = totalTime;
  }, 1000);
}

function showResultModal() {
  document.getElementById("correct-count").textContent = correctAnswers;
  document.getElementById("wrong-count").textContent = wrongAnswers;
  document.getElementById("total-time").textContent = totalTime;
  document.getElementById("result-modal").style.display = "block";

  // 🔊 Play celebration sound (optional)

  // 🎉 Fire multiple bursts of confetti
  fireMultipleConfetti();
}

function fireConfettiBasedOnScore(scoreCount) {
  const maxScore = questions.length;

  // 🎤 Show message if no correct answers
  if (scoreCount === 0) {
    speakText("Oops! You need to learn more.");
    return;
  }

  // 🎯 Map score to particle count
  let particleCount;
  if (scoreCount === 5) particleCount = 100;
  else if (scoreCount === 4) particleCount = 80;
  else if (scoreCount === 3) particleCount = 60;
  else if (scoreCount === 2) particleCount = 40;
  else if (scoreCount === 1) particleCount = 20;

  const duration = 1500;
  const end = Date.now() + duration;

  function frame() {
    confetti({
      particleCount: particleCount,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    });
    confetti({
      particleCount: particleCount,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
    });

    if (Date.now() < end) {
      confettiAnimationId = requestAnimationFrame(frame);
    }
  }

  frame();
}
function showResultModal() {
  // 🔇 Stop background music when result is shown
  backgroundAudio.pause();
  backgroundAudio.currentTime = 0;

  // 📝 Show result data
  document.getElementById("correct-count").textContent = correctAnswers;
  document.getElementById("wrong-count").textContent = wrongAnswers;
  document.getElementById("total-time").textContent = totalTime;
  document.getElementById("result-modal").style.display = "block";

  // 🔊 Play sound only if some correct answers
  if (correctAnswers > 0) {
    new Audio("/activity/admin/result.mp3").play();
  }

  // 🎉 Call confetti with correct score count
  fireConfettiBasedOnScore(correctAnswers);
}

function startAgain() {
  // 🔇 Stop confetti if running
  if (confettiAnimationId) {
    cancelAnimationFrame(confettiAnimationId);
    confettiAnimationId = null;
  }

  // 🔇 Stop and reset speech
  stopCurrentSpeech();

  // 🔁 Reset game state
  currentQuestion = 0;
  correctAnswers = 0;
  wrongAnswers = 0;
  totalTime = 0;
  userAnswers = new Array(questions.length).fill(null);
  userAnswers[0] = [];

  // 🔁 Reset timer
  if (timer) clearInterval(timer);
  if (reminderTimer) clearInterval(reminderTimer);

  // 🔁 Hide modal and reload question
  closeResultModal();
  loadQuestion();
  startTimer();
  startReminderTimer();

  // 🔊 Resume background music if needed
  backgroundAudio.currentTime = 0;
  backgroundAudio.play();
}

function closeResultModal() {
  document.getElementById("result-modal").style.display = "none";
}
function speakQuestionOrResult() {
  const question = questions[currentQuestion];
  const userAnswer = userAnswers[currentQuestion];

  if (
    userAnswer === null ||
    (currentQuestion === 0 && userAnswer.length === 0)
  ) {
    speakQuestion(question.question);
  } else {
    const correctAnswerText = Array.isArray(question.correct)
      ? question.correct.map((i) => question.options[i].text).join(", ")
      : question.options[question.correct].text;
    speakText(`The correct answer is ${correctAnswerText}`);
  }
}

const backgroundAudio = document.getElementById("backgroundAudio");
const introAudio = document.getElementById("introAudio");

const BACKGROUND_NORMAL_VOLUME = 0.3;
const BACKGROUND_DUCK_VOLUME = 0.05;

backgroundAudio.volume = BACKGROUND_NORMAL_VOLUME; // Initial volume

function duckBackgroundAudio() {
  backgroundAudio.volume = BACKGROUND_DUCK_VOLUME;
}

function restoreBackgroundAudio() {
  backgroundAudio.volume = BACKGROUND_NORMAL_VOLUME;
}

function stopCurrentSpeech() {
  if (currentSpeech) {
    window.speechSynthesis.cancel();
    currentSpeech = null;
    restoreBackgroundAudio();
  }
}

function speakText(text, callback = null) {
  stopCurrentSpeech();
  duckBackgroundAudio();

  currentSpeech = new SpeechSynthesisUtterance(text);
  currentSpeech.lang = "en-US";
  currentSpeech.onend = () => {
    currentSpeech = null;
    restoreBackgroundAudio();
    if (callback) callback();
  };
  window.speechSynthesis.speak(currentSpeech);
}

function speakQuestion(text) {
  stopCurrentSpeech();
  duckBackgroundAudio();

  const el = document.getElementById("question-text");
  el.innerHTML = "";
  let index = 0;
  const typeInterval = setInterval(() => {
    if (index < text.length) {
      el.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(typeInterval);
    }
  }, 50);

  currentSpeech = new SpeechSynthesisUtterance(text);
  currentSpeech.lang = "en-US";
  currentSpeech.onend = () => {
    currentSpeech = null;
    restoreBackgroundAudio();
  };
  window.speechSynthesis.speak(currentSpeech);
}

function playIntro() {
  introAudio.play();
  document.getElementById("clickPrompt").style.display = "none";
}

window.onload = () => {
  introAudio
    .play()
    .then(() => {
      console.log("🔊 intro.mp3 playing");
    })
    .catch(() => {
      document.getElementById("clickPrompt").style.display = "block";
    });

  introAudio.onended = () => {
    backgroundAudio.muted = false;
    backgroundAudio.volume = BACKGROUND_NORMAL_VOLUME;
    backgroundAudio.play().catch((err) => {
      console.warn("🔇 Background audio autoplay blocked", err);
    });
  };

  fetchQuestions(() => {
    loadQuestion();
    startReminderTimer();
  });
};

function startQuiz() {
  // hide prompt
  document.getElementById("clickPrompt").style.display = "none";

  // now safe to play background music
  backgroundAudio.muted = false;
  backgroundAudio.volume = BACKGROUND_NORMAL_VOLUME;
  backgroundAudio.play();

  loadQuestion();
  startReminderTimer();
  startTimer();
}

// Add ducking to sound effects (inside checkAnswer and toggleAnswerQ0)
function playEffectSound(src, onEndCallback = null) {
  duckBackgroundAudio();
  const sound = new Audio(src);
  sound.play();
  sound.onended = () => {
    restoreBackgroundAudio();
    if (onEndCallback) onEndCallback();
  };
}

// Inside your existing checkAnswer:
function checkAnswer(selectedIndex) {
  if (isTransitioning) return;
  isTransitioning = true;

  const question = questions[currentQuestion];
  const answerOptions = document.querySelectorAll(".answer-option");
  answerOptions.forEach((opt) => (opt.style.pointerEvents = "none"));

  userAnswers[currentQuestion] = selectedIndex;

  const isCorrect = Array.isArray(question.correct)
    ? question.correct.includes(selectedIndex)
    : selectedIndex === question.correct;

  if (isCorrect) {
    correctAnswers++;
    answerOptions[selectedIndex].classList.add("correct");
    answerOptions[selectedIndex].innerHTML +=
      '<div class="result-icon"><i class="fa fa-check colour-green"></i></div>';
    playEffectSound("/activity/admin/right.mp3");

    speakText("Well done! Your answer is correct!", () => {
      setTimeout(() => {
        isTransitioning = false;
        navigate("next");
      }, 1000);
    });
  } else {
    wrongAnswers++;
    answerOptions[selectedIndex].classList.add("incorrect");
    answerOptions[selectedIndex].innerHTML +=
      '<div class="result-icon"><i class="fa fa-times colour-red"></i></div>';

    answerOptions.forEach((opt, idx) => {
      if (
        Array.isArray(question.correct)
          ? question.correct.includes(idx)
          : idx === question.correct
      ) {
        opt.classList.add("correct");
        opt.innerHTML +=
          '<div class="result-icon"><i class="fa fa-check colour-green"></i></div>';
      }
    });

    playEffectSound("/activity/admin/wrong.mp3");

    speakText("Oops! Your answer is incorrect.", () => {
      setTimeout(() => {
        isTransitioning = false;
        navigate("next");
      }, 1000);
    });
  }

  document.getElementById("next-btn").disabled = false;
}

// Inside your toggleAnswerQ0
function toggleAnswerQ0(selectedIndex) {
  const selectedAnswers = userAnswers[0];

  if (selectedAnswers.includes(selectedIndex)) {
    selectedAnswers.splice(selectedAnswers.indexOf(selectedIndex), 1);
  } else if (selectedAnswers.length < 2) {
    selectedAnswers.push(selectedIndex);
  }

  loadQuestion();

  if (selectedAnswers.length === 2) {
    document
      .querySelectorAll(".answer-option")
      .forEach((opt) => (opt.style.pointerEvents = "none"));

    const correctSet = new Set(questions[0].correct);
    const selectedSet = new Set(selectedAnswers);

    const isFullyCorrect =
      selectedAnswers.every((i) => correctSet.has(i)) &&
      selectedAnswers.length === correctSet.size;
    const isAnyCorrect = selectedAnswers.some((i) => correctSet.has(i));

    if (isFullyCorrect) {
      correctAnswers++;
    } else {
      wrongAnswers++;
    }

    document.querySelectorAll(".answer-option").forEach((opt, idx) => {
      if (correctSet.has(idx)) {
        opt.classList.add("correct");
        if (!opt.querySelector(".result-icon")) {
          opt.innerHTML +=
            '<div class="result-icon"><i class="fa fa-check colour-green"></i></div>';
        }
      }
    });

    playEffectSound(isAnyCorrect ? "/activity/admin/right.mp3" : "/activity/admin/wrong.mp3");

    const correctText = questions[0].correct
      .map((i) => questions[0].options[i].text)
      .join(" and ");
    speakText(`The right answers are ${correctText}`, () => {
      setTimeout(() => navigate("next"), 1000);
    });

    document.getElementById("next-btn").disabled = false;
  } else {
    document.getElementById("next-btn").disabled = true;
  }
}
