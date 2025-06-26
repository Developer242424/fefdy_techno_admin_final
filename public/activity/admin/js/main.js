let confettiAnimationId = null;
let publicURL = "../";
function handleQuestionHover(text) {
  if (isTransitioning) return; // Only block if in answer-feedback phase
  const questionEl = document.getElementById("question-text");
  questionEl.classList.add("hovered-question");
  speakText(text);

  // Trigger text typing animation when hovering over question
  typeQuestionText(text, questionEl);

  setTimeout(() => {
    questionEl.classList.remove("hovered-question");
  }, 1000);
}
function typeQuestionText(text, el) {
  el.innerHTML = ""; // Clear the text initially
  let index = 0;
  const typeInterval = setInterval(() => {
    if (index < text.length) {
      el.innerHTML += text.charAt(index); // Append one letter at a time
      index++;
    } else {
      clearInterval(typeInterval); // Stop the animation when the full text is displayed
    }
  }, 50); // Adjust speed as necessary (currently it's 50ms per letter)
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

let questions = [];
let questionsLoaded = false;
let questionIds = "";
function fetchQuestions(callback) {
  const params = new URLSearchParams(window.location.search);
  const sid = params.get("sid");
  const tid = params.get("tid");
  const lid = params.get("lid");
  const stid = params.get("stid");
  const qid = params.get("qid");
  const ust = params.get("ust");

  const data = {
    sid,
    tid,
    lid,
    stid,
    qid,
    ust,
  };
  $.ajax({
    url: "/admin/activity/questions/get",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(data),
    success: function (res) {
      if (Array.isArray(res)) {
        questions = res;
        questionsLoaded = true;
        // console.log("✅ Questions loaded:", questions);

        userAnswers = new Array(questions.length).fill(null);
        userAnswers[0] = [];

        if (typeof callback === "function") {
          callback();
        }
        questionIds = questions.map((q) => q.questionid);
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

// Tracking answers and score
let currentQuestion = 0;
let correctAnswers = 0;
let wrongAnswers = 0;
let totalTime = 0;
let timer;
let reminderTimer;
let userAnswers = new Array(questions.length).fill(null);
let currentSpeech = null;
let isTransitioning = false;

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

// Question loading and interaction handling
function loadQuestion() {
  const question = questions[currentQuestion];
  const questionContainer = document.getElementById("question-container");
  const answersContainer = document.getElementById("answers-container");
  const progressBar = document.getElementById("progress-bar");

  // Update progress bar
  progressBar.style.width = `${
    ((currentQuestion + 1) / questions.length) * 100
  }%`;

  // Display question
  questionContainer.innerHTML = `
        <div class="quiz-question">
            <h2 id="question-text">${question.question}</h2>
        </div>
        <img src="/${question.image}" alt="question image" style="display:${
    question.image ? "block" : "none"
  }" class="question-image">
        <div class="audio-icon" onclick="speakQuestionOrResult()"><i class="fa fa-volume-up"></i></div>
    `;

  const questionTextElement = document.getElementById("question-text");
  stopCurrentSpeech();

  // Only type and speak if first time / unanswered (do not repeat)
  if (
    userAnswers[currentQuestion] === null ||
    (currentQuestion === 0 && userAnswers[0].length === 0)
  ) {
    speakQuestion(question.question); // handles both type & speak
  } else {
    // This should only happen when the question is being loaded for the first time
    typeQuestionText(question.question, questionTextElement);
    speakText(question.question);
  }

  // Clear previous answers
  answersContainer.innerHTML = "";

  // Loop through options
  question.options.forEach((option, index) => {
    const optionDiv = document.createElement("div");
    optionDiv.classList.add("answer-option");

    const optionImage = document.createElement("img");
    optionImage.src = "/" + option.image;
    optionImage.alt = option.text;
    optionImage.style.display = option.image !== "" ? "block" : "none";
    optionImage.classList.add("option-image");

    const optionText = document.createElement("div");
    optionText.classList.add("option-text");
    optionText.textContent = option.text;

    // 👉 Add hover speech for image
    optionImage.addEventListener("mouseenter", () => {
      speakText(option.text);
    });

    optionDiv.appendChild(optionImage);
    optionDiv.appendChild(optionText);

    // 🔁 Your existing selection logic here...
    if (!isTransitioning) {
      optionDiv.onclick = () => selectAnswer(index);
      optionDiv.style.pointerEvents = "auto";
    } else {
      optionDiv.style.pointerEvents = "none";
    }

    optionDiv.onmouseover = () => speakText(option.text);
    answersContainer.appendChild(optionDiv);
  });

  // Ensure Next button is disabled at the start of each new question
  updateNavigationButtons();

  // Start timers if not already started
  if (!timer) startTimer();
  startReminderTimer();
}

function typeQuestionText(text, el, callback = null) {
  el.innerHTML = ""; // Clear the text initially
  let index = 0;
  const typeInterval = setInterval(() => {
    if (index < text.length) {
      el.innerHTML += text.charAt(index); // Append one letter at a time
      index++;
    } else {
      clearInterval(typeInterval); // Stop the animation when the full text is displayed
      if (callback) callback();
    }
  }, 50); // Adjust speed as necessary
}

function navigate(direction) {
  stopCurrentSpeech();

  if (direction === "next") {
    const question = questions[currentQuestion];
    const userAnswer = userAnswers[currentQuestion] || [];

    if (Array.isArray(question.correct) && Array.isArray(userAnswer)) {
      const selectedSet = new Set(userAnswer);
      const correctSet = new Set(question.correct);
      const isFullyCorrect =
        selectedSet.size === correctSet.size &&
        [...selectedSet].every((i) => correctSet.has(i));

      markAnswerFeedback(
        selectedSet,
        correctSet,
        () => {
          isTransitioning = false;
          if (currentQuestion < questions.length - 1) {
            currentQuestion++;
            loadQuestion();
            updateNavigationButtons(); // Update button state after moving to next question
          } else {
            clearInterval(timer);
            stopCurrentSpeech();
            showResultModal();
          }
        },
        false
      ); // 🔇 No speech on Next button

      return;
    }
  } else if (direction === "previous" && currentQuestion > 0) {
    currentQuestion--;
    loadQuestion();
    updateNavigationButtons(); // Update button state after moving to previous question
  }
}
function handleAnswerSubmission(userAnswerArray) {
  isTransitioning = true;
  const correctSet = new Set(questions[currentQuestion].correct);
  const selectedSet = new Set(userAnswerArray);

  const isFullyCorrect =
    selectedSet.size === correctSet.size &&
    [...selectedSet].every((i) => correctSet.has(i));

  if (isFullyCorrect) {
    correctAnswers++;
  } else {
    wrongAnswers++;
  }

  markAnswerFeedback(selectedSet, correctSet, () => {
    setTimeout(() => {
      isTransitioning = false;
      if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        loadQuestion();
        updateNavigationButtons(); // Add this here to enable the "Previous" button immediately after the first question
      } else {
        clearInterval(timer);
        stopCurrentSpeech();
        showResultModal();
      }
    }, 1000);
  });
}

function updateNavigationButtons() {
  const nextBtn = document.getElementById("next-btn");
  const prevBtn = document.getElementById("prev-btn");

  const question = questions[currentQuestion];
  const correctAnswerCount = question.correct.length; // The number of correct answers (1 or 2)
  const userAnswer = userAnswers[currentQuestion];

  // Check if the user has selected the required number of answers
  const hasAnswered =
    Array.isArray(userAnswer) && userAnswer.length === correctAnswerCount;

  // ✅ NEXT BUTTON:
  // Enable only if the required number of correct answers have been selected
  nextBtn.disabled = !hasAnswered; // Disable if the required number of answers is not selected

  // ✅ PREVIOUS BUTTON:
  // Enable only if:
  // - currentQuestion > 0
  // - AND user has answered at least one earlier question
  const hasAnyAnswerBefore = userAnswers
    .slice(0, currentQuestion)
    .some((ans) => Array.isArray(ans) && ans.length > 0);

  prevBtn.disabled = currentQuestion === 0 || !hasAnyAnswerBefore;
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
    new Audio("result.mp3").play();
  }

  // 🎉 Call confetti with correct score count
  fireConfettiBasedOnScore(correctAnswers);
}

function startAgain() {
  // Stop any ongoing confetti animation
  if (confettiAnimationId) {
    cancelAnimationFrame(confettiAnimationId);
    confettiAnimationId = null;
  }

  // Stop and reset speech
  stopCurrentSpeech();

  // Reset game state
  currentQuestion = 0;
  correctAnswers = 0;
  wrongAnswers = 0;
  totalTime = 0;
  userAnswers = questions.map(() => []);

  // Reset timer

  function startTimer() {
    let timer = null;
    let totalTime = 0;

    if (timer) clearInterval(timer);
    totalTime = 0;
    const timerEl = document.getElementById("timer-count");
    if (timerEl) timerEl.textContent = totalTime;

    timer = setInterval(() => {
      totalTime++;
      if (timerEl) timerEl.textContent = totalTime;
    }, 1000);
  }

  // Hide result modal and reload the first question
  closeResultModal();
  loadQuestion();
  startTimer(); // Restart timer on game restart
  startReminderTimer();

  // Resume background music if needed
  backgroundAudio.currentTime = 0;
  backgroundAudio.play();
}

function closeResultModal() {
  document.getElementById("result-modal").style.display = "none";
}
function selectAnswer(selectedIndex) {
  const question = questions[currentQuestion];
  const expectedCount = question.correct.length; // How many answers expected
  let userAnswer = userAnswers[currentQuestion] || [];

  if (!Array.isArray(userAnswer)) userAnswer = [];

  if (userAnswer.includes(selectedIndex)) return; // Do nothing if option is already selected
  if (userAnswer.length >= expectedCount) return; // Do nothing if max options selected

  // Add selected option
  userAnswer.push(selectedIndex);
  userAnswers[currentQuestion] = userAnswer;

  // ✅ Only update the buttons if the expected count is reached
  updateNavigationButtons(); // Enables the Next button only when a selection is made.

  const correctSet = new Set(question.correct);
  const selectedSet = new Set(userAnswer);

  const optionDivs = document.querySelectorAll(".answer-option");
  const optionDiv = optionDivs[selectedIndex];

  if (correctSet.has(selectedIndex)) {
    optionDiv.classList.add("correct");
    optionDiv.innerHTML +=
      '<div class="result-icon"><i class="fa fa-check colour-green"></i></div>';
  } else {
    optionDiv.classList.add("incorrect");
    optionDiv.innerHTML +=
      '<div class="result-icon"><i class="fa fa-times colour-red"></i></div>';
  }

  optionDiv.classList.add("selected");
  optionDiv.style.pointerEvents = "none";

  // Add mouse hover to read text aloud
  optionDiv.addEventListener("mouseenter", () => {
    speakText(option.text);
  });

  // ✅ Enable Next button if all required answers are selected
  if (userAnswer.length === expectedCount) {
    isTransitioning = true;
    const isFullyCorrect =
      selectedSet.size === correctSet.size &&
      [...selectedSet].every((i) => correctSet.has(i));

    if (userAnswers[currentQuestion]._scored !== true) {
      if (isFullyCorrect) correctAnswers++;
      else wrongAnswers++;
      userAnswers[currentQuestion]._scored = true; // Mark as scored
    }

    markAnswerFeedback(selectedSet, correctSet, () => {
      setTimeout(() => {
        isTransitioning = false;
        if (currentQuestion < questions.length - 1) {
          currentQuestion++;
          loadQuestion();
        } else {
          clearInterval(timer);
          stopCurrentSpeech();
          showResultModal();
        }
      }, 1000);
    });
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
  stopCurrentSpeech(); // Stop any ongoing speech
  duckBackgroundAudio(); // Lower background music

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
function markAnswerFeedback(selectedSet, correctSet, callback, speak = true) {
  const answerOptions = document.querySelectorAll(".answer-option");

  answerOptions.forEach((opt, idx) => {
    const isSelected = selectedSet.has(idx);
    const isCorrect = correctSet.has(idx);

    if (isSelected && isCorrect) {
      opt.classList.add("correct");
      opt.innerHTML +=
        '<div class="result-icon"><i class="fa fa-check colour-green"></i></div>';
    } else if (isSelected && !isCorrect) {
      opt.classList.add("incorrect");
      opt.innerHTML +=
        '<div class="result-icon"><i class="fa fa-times colour-red"></i></div>';
    } else if (!isSelected && isCorrect) {
      opt.classList.add("correct");
      opt.innerHTML +=
        '<div class="result-icon"><i class="fa fa-check colour-green"></i></div>';
    }

    opt.style.pointerEvents = "none";
  });

  const correctText = [...correctSet]
    .map((i) => questions[currentQuestion].options[i].text)
    .join(" and ");

  if (speak) {
    speakText(`The correct answers are ${correctText}`, () => {
      setTimeout(callback, 1000);
    });
  } else {
    setTimeout(callback, 0);
  }
}

function completeTest() {
  const params = new URLSearchParams(window.location.search);
  const sid = params.get("sid");
  const tid = params.get("tid");
  const lid = params.get("lid");
  const stid = params.get("stid");
  const qid = params.get("qid");
  const ust = params.get("ust");

  const data = {
    sid,
    tid,
    lid,
    stid,
    qid,
    ust,
    correctAnswers,
    wrongAnswers,
    totalTime,
    questionIds,
  };
  $.ajax({
    url: "/admin/activity/questions/history",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(data),
    success: function (res) {
      if (res.status === 200) {
        // startAgain();
        location.reload();
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
