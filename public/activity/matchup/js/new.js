// Your JSON data structure
// let gameData = [];
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
    url: "/admin/activity/questions/match/get",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(data),
    success: function (res) {
      if (Array.isArray(res)) {
        gameData = res;
        questionsLoaded = true;
        if (typeof callback === "function") {
          callback();
        }
        questionIds = gameData.map((q) => q.questionid);
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


const gameData = [
  {
    "question": "Match the Word to the Image"
  },
  {
    "instruction": "Match the Fruit Apple",
    "is_equal_one": {
      "text": "Apple",
      "thumbnail": "/activity/matchup/images/img-1.png"
    },
    "is_equal_two": {
      "text": "Apple",
      "thumbnail": "/activity/matchup/images/img-1.png"
    }
  },
  {
    "instruction": "Match the Vehicle Car",
    "is_equal_one": {
      "text": "Car",
      "thumbnail": "/activity/matchup/images/img-2.png"
    },
    "is_equal_two": {
      "text": "Car",
      "thumbnail": "/activity/matchup/images/img-2.png"
    }
  },
  {
    "instruction": "Match the Ball",
    "is_equal_one": {
      "text": "Ball",
      "thumbnail": "/activity/matchup/images/img-3.png"
    },
    "is_equal_two": {
      "text": "Ball",
      "thumbnail": "/activity/matchup/images/img-3.png"
    }
  }
];

// const gameData = [
//   {
//     "question": "Match the following:"
//   },
//   {
//     "instruction": "Match the river water",
//     "is_equal_one": {
//       "text": "river",
//       "thumbnail": ""
//     },
//     "is_equal_two": {
//       "text": "",
//       "thumbnail": "uploads/questions/1751103136376-286949038.jpg"
//     }
//   },
//   {
//     "instruction": "Match the pond water",
//     "is_equal_one": {
//       "text": "pond",
//       "thumbnail": ""
//     },
//     "is_equal_two": {
//       "text": "",
//       "thumbnail": "uploads/questions/1751103136378-557977251.jpg"
//     }
//   },
//   {
//     "instruction": "Match the tap water",
//     "is_equal_one": {
//       "text": "tap water",
//       "thumbnail": ""
//     },
//     "is_equal_two": {
//       "text": "",
//       "thumbnail": "uploads/questions/1751103136379-429907997.jpg"
//     }
//   },
//   {
//     "instruction": "Match the lake water",
//     "is_equal_one": {
//       "text": "lake",
//       "thumbnail": ""
//     },
//     "is_equal_two": {
//       "text": "",
//       "thumbnail": "uploads/questions/1751103136382-978883756.jpg"
//     }
//   },
//   {
//     "instruction": "Match the sea water",
//     "is_equal_one": {
//       "text": "sea",
//       "thumbnail": ""
//     },
//     "is_equal_two": {
//       "text": "",
//       "thumbnail": "uploads/questions/1751103136430-463548170.jpg"
//     }
//   }
// ];

// Function to dynamically generate content based on the JSON data
function derangedShuffle(original) {
  let shuffled;
  let attempts = 0;

  do {
    shuffled = original.slice().sort(() => Math.random() - 0.5);
    attempts++;
  } while (
    shuffled.some((item, i) => item.text === original[i].text) &&
    attempts < 100
  );

  return shuffled;
}

function generateContent() {
  const questionContainer = document.getElementById('question-container');
  const mainHeading = document.getElementById('mainHeading');
  mainHeading.textContent = gameData[0].question;

  const matchingArea = document.getElementById('matching-area');
  matchingArea.innerHTML = ''; // Clear any previous content

  const leftItems = gameData.slice(1).map(item => item.is_equal_one);
  const rightItems = derangedShuffle(gameData.slice(1).map(item => item.is_equal_two));

  for (let i = 0; i < leftItems.length; i++) {
    const row = document.createElement('div');
    row.classList.add('row', 'mb-3');

    const left = leftItems[i];
    const right = rightItems[i];
    const instruction = gameData[i + 1].instruction;  // Access the instruction for each match

    const originalIndex = leftItems.findIndex(item =>
      JSON.stringify(item) === JSON.stringify(right)
    );

    // Left Column
    const leftColumn = document.createElement('div');
    leftColumn.classList.add('col-6');
    leftColumn.innerHTML = `
              <div class="item" data-id="${left.text}">
                ${left.text}
                <div class="dot left" data-id="${left.text}"></div>
                <input type="hidden" value="${i}"/>
              </div>
            `;
    row.appendChild(leftColumn);

    // Right Column
    const rightColumn = document.createElement('div');
    rightColumn.classList.add('col-6', 'text-end');
    rightColumn.innerHTML = `
              <div class="item right d-inline-block" data-id="${right.text}">
                <div class="dot right" data-id="${right.text}"></div>
                <input type="hidden" value="${originalIndex}"/>
                <img src="${right.thumbnail}" alt="${right.text}"/>
              </div>
            `;
    row.appendChild(rightColumn);

    matchingArea.appendChild(row);
  }

  enableDragAndDrop();
}

// Call the function to generate content
window.onload = () => {
  // fetchQuestions(() => {
    generateContent();
  // });
};

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const dragAudio = document.getElementById("dragAudio");
const dropAudio = document.getElementById("dropAudio");
const correctAudio = document.getElementById("correctAudio");
const wrongAudio = document.getElementById("wrongAudio");
const resultAudio = document.getElementById("resultAudio");
const backgroundAudio = document.getElementById('backgorundAudio');
backgroundAudio.loop = true;
backgroundAudio.volume = 0.5;

let startDot = null;
let tempLine = null;
let lines = [];
let secondsElapsed = 0;
let timerInterval;
let currentStep = 0;
let dragEnabled = false;
let hasSpokenAllMatched = false;
let checkingAnswers = false;

// Create guidance steps from gameData instead of hardcoded array
let guidanceSteps = [];

function createGuidanceSteps() {
  guidanceSteps = gameData.slice(1).map(item => ({
    id: item.is_equal_one.text,
    label: item.instruction
  }));

  // Shuffle the guidance steps
  shuffle(guidanceSteps);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

let typeHeadingInterval = null;
let typingInProgress = false;

function playBackgroundMusic() {
  backgroundAudio.play().catch(console.error);
}

function controlBackgroundMusicVolume(level) {
  backgroundAudio.volume = level;
}

function speakTextWithBackgroundControl(text) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  controlBackgroundMusicVolume(0.2);
  speechSynthesis.speak(utterance);
  utterance.onend = () => controlBackgroundMusicVolume(1.0);
}

function speakText(text) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  speechSynthesis.speak(utterance);
}

// Modified typeHeadingText function
// Modified typeHeadingText function
function typeHeadingText(text, elementId, speed = 50, onComplete = null) {
  const el = document.getElementById(elementId);
  if (!el) return;

  // Ensure that the element is visible when starting the animation
  el.style.visibility = 'visible';  // Make sure it is visible

  clearInterval(typeHeadingInterval);
  typingInProgress = true;
  el.dataset.fulltext = text;
  el.textContent = '';  // Start fresh with no text
  let i = 0;

  // Start typing animation
  typeHeadingInterval = setInterval(() => {
    if (i < text.length) {
      el.textContent += text.charAt(i++);
    } else {
      clearInterval(typeHeadingInterval);
      el.style.borderRight = 'none';
      typingInProgress = false;
      // Trigger onComplete callback after typing finishes
      if (onComplete) setTimeout(onComplete, 300);
    }
  }, speed);
}

// Mouse hover effect to increase font size
document.getElementById("mainHeading").addEventListener('mouseenter', () => {
  const el = document.getElementById("mainHeading");
  el.style.transition = "font-size 0.3s ease-in-out";
  el.style.fontSize = "2rem";  // Increased font size on hover
});

document.getElementById("mainHeading").addEventListener('mouseleave', () => {
  const el = document.getElementById("mainHeading");
  el.style.fontSize = "";  // Reset font size on mouse leave
});

function stopTypingAndShowFullText(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;

  clearInterval(typeHeadingInterval);
  typingInProgress = false;

  const fullText = el.dataset.fulltext || '';
  el.textContent = fullText;
  el.style.borderRight = 'none';
}

window.addEventListener('load', () => {
  const intro = document.getElementById("introAudio");
  intro.muted = false;
  document.getElementById("mainHeading").style.visibility = 'hidden';
  document.getElementById("timer-section").classList.remove("d-none");

  // Create guidance steps from gameData
  createGuidanceSteps();

  intro.play().catch(() => {
    document.body.addEventListener('click', () => intro.play(), { once: true });
  });

  intro.addEventListener('play', () => {
    typeHeadingText("Match the Word to the Image", "mainHeading", 50);
  });

  intro.addEventListener('ended', () => {
    speakText("Are you ready?");
    setTimeout(() => {
      document.getElementById("timer-section").classList.add("fade-in");
      setTimeout(() => {
        document.getElementById("timer-column").classList.remove("d-none");
        document.getElementById("check-btn-column").classList.remove("d-none");
        document.getElementById("matching-area").classList.remove("d-none");
        dragEnabled = true;
        startTimer();
        enableHoverSpeak();
        setDefaultImages();
        setTimeout(startGuidance, 500);
        playBackgroundMusic();
      }, 2000);
    }, 2000);
  });

  document.getElementById('checkBtn').addEventListener('click', checkAnswers);
});

function enableHoverSpeak() {
  document.querySelectorAll('.item[data-id]').forEach(item => {
    item.addEventListener('mouseenter', () => {
      const label = item.textContent.trim().split('\n')[0];
      item.style.backgroundColor = '#d6eaff';
      stopTypingAndShowFullText("instruction-text");
      speakText(label);
    });
    item.addEventListener('mouseleave', () => {
      const isRight = item.classList.contains('right');
      item.style.backgroundColor = isRight ? '#e0fff5' : '#fffbe0';
    });
  });

  const mainHeading = document.getElementById("mainHeading");
  mainHeading.addEventListener('mouseenter', () => {
    const text = mainHeading.dataset.fulltext || mainHeading.textContent.trim();

    if (!typingInProgress && text) {
      typeHeadingText(text, "mainHeading", 50);
      speakTextWithBackgroundControl(text);
    } else if (typingInProgress) {
      stopTypingAndShowFullText("mainHeading");
    }
  });

  const instructionBox = document.getElementById("instruction-text");
  instructionBox.addEventListener('mouseenter', () => {
    const text = instructionBox.dataset.fulltext || instructionBox.textContent.trim();
    if (typingInProgress) {
      stopTypingAndShowFullText("instruction-text");
    } else if (text) {
      typeHeadingText(text, "instruction-text", 50);
      speakTextWithBackgroundControl(text);
    }
  });
}

function setDefaultImages() {
  const boyImg = document.querySelector('img[alt="Left Side Image"]');
  const girlImg = document.querySelector('img[alt="Right Side Image"]');
  if (boyImg) boyImg.src = '/activity/matchup/images/boy-2.png';
  if (girlImg) girlImg.src = '/activity/matchup/images/girl-2.png';
}

function changeImages(isCorrect = false) {
  const boyImage = document.querySelector('img[alt="Left Side Image"]');
  const girlImage = document.querySelector('img[alt="Right Side Image"]');
  if (!boyImage || !girlImage) return;

  const newBoyImage = isCorrect ? '/activity/matchup/images/boy-4.png' : '/activity/matchup/images/boy-3.png';
  const newGirlImage = isCorrect ? '/activity/matchup/images/girl-4.png' : '/activity/matchup/images/girl-3.png';
  const boyImg = new Image();
  const girlImg = new Image();

  boyImg.onload = () => {
    boyImage.src = boyImg.src;
    girlImg.onload = () => {
      girlImage.src = girlImg.src;
      setTimeout(() => nextAnswer(), 1000);
    };
    girlImg.src = newGirlImage;
  };
  boyImg.src = newBoyImage;
}

function nextAnswer() {
  if (checkingAnswers) return;

  if (currentStep < guidanceSteps.length) {
    setTimeout(startGuidance, 1000);
  } else if (!hasSpokenAllMatched) {
    const msg = "All items matched! Click 'Check Answers' to finish.";
    hasSpokenAllMatched = true;

    const box = document.getElementById("instruction-text");
    box.style.opacity = 0;

    setTimeout(() => {
      typeHeadingText(msg, "instruction-text", 50, () => speakText(msg));
      box.style.opacity = 1;
    }, 100);

    document.getElementById('checkBtn').disabled = false;
  }
}

function startTimer() {
  timerInterval = setInterval(() => {
    secondsElapsed++;
    const min = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
    const sec = String(secondsElapsed % 60).padStart(2, '0');
    document.getElementById('timer-count').textContent = ` ${min}:${sec}`;
  }, 1000);
}

function startGuidance() {
  if (currentStep >= guidanceSteps.length) return;
  const step = guidanceSteps[currentStep];
  const box = document.getElementById("instruction-text");
  box.style.opacity = 0;
  setTimeout(() => {
    typeHeadingText(step.label, "instruction-text", 50, () => {
      speakText(step.label);
    });
    box.style.opacity = 1;
  }, 100);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  drawLines();
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('scroll', drawLines);
resizeCanvas();

function getAbsolutePosition(dot) {
  const rect = dot.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2 + window.scrollX,
    y: rect.top + rect.height / 2 + window.scrollY
  };
}

function enableDragAndDrop() {
  let isDragging = false;

  document.querySelectorAll('.dot.left').forEach(dot => {
    dot.addEventListener('mousedown', (e) => {
      e.preventDefault();
      if (!dragEnabled || isDragging) return;

      isDragging = true;
      dropAudio.currentTime = 0;
      dropAudio.play().catch(() => { });

      dot.classList.remove('active-match');
      startDot = {
        el: dot,
        id: dot.dataset.id,
        pos: getAbsolutePosition(dot)
      };
      dot.classList.add('active-drag');
      dot.classList.add('active');
    });
  });

  document.addEventListener('mousemove', (e) => {
    if (startDot && isDragging) {
      tempLine = {
        start: startDot.pos,
        end: { x: e.pageX, y: e.pageY }
      };
      drawLines();
    }
  });

  document.addEventListener('mouseup', (e) => {
    if (!startDot || !isDragging) return;

    isDragging = false;
    let matchedRightDot = null;

    document.querySelectorAll('.dot.right').forEach(dot => {
      const rect = dot.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        matchedRightDot = {
          el: dot,
          id: dot.dataset.id,
          pos: getAbsolutePosition(dot)
        };
      }
    });

    tempLine = null;

    if (matchedRightDot) {
      lines = lines.filter(line =>
        line.leftId !== startDot.id && line.rightId !== matchedRightDot.id
      );

      // Store which instruction this match was made for
      const currentInstruction = currentStep < guidanceSteps.length ?
        guidanceSteps[currentStep] : null;

      lines.push({
        start: startDot.pos,
        end: matchedRightDot.pos,
        leftId: startDot.id,
        rightId: matchedRightDot.id,
        correct: null,
        instruction: currentInstruction // Track the instruction for this match
      });

      startDot.el.classList.add('active-match');
      matchedRightDot.el.classList.add('active-match');
      currentStep++;

      if (currentStep < guidanceSteps.length) {
        setTimeout(startGuidance, 500);
      } else {
        document.getElementById("instruction-text").innerText = "All items matched! Click 'Check Answers' to finish.";
        speakText("All items matched! Click check answers to finish.");
        document.getElementById('checkBtn').disabled = false;
      }
    }

    startDot = null;
    document.querySelectorAll('.dot.left, .dot.right').forEach(dot =>
      dot.classList.remove('active-drag')
    );

    drawLines();
  });
}

function drawLines() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  lines.forEach(line => {
    const color = line.correct === null ? 'black' : (line.correct ? 'green' : 'red');
    drawLine(line.start, line.end, color);
  });

  if (tempLine) {
    drawLine(tempLine.start, tempLine.end, 'black');
  }
}

function drawLine(start, end, color = 'black') {
  if (!start || !end) return;

  const dx = end.x - start.x;
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.bezierCurveTo(start.x + dx * 0.5, start.y, start.x + dx * 0.5, end.y, end.x, end.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

// FIXED: Check answers based on the instruction each match was made for
function checkAnswers() {
  checkingAnswers = true;
  speechSynthesis.cancel();
  clearInterval(timerInterval);

  let correctCount = 0;
  let wrongCount = 0;

  lines.forEach(line => {
    let isCorrect = false;

    if (line.instruction) {
      // Find the game data item that matches this instruction
      const gameItem = gameData.slice(1).find(item =>
        item.instruction === line.instruction.label
      );

      if (gameItem) {
        // Check if the match is correct for this specific instruction
        isCorrect = line.leftId === gameItem.is_equal_one.text &&
          line.rightId === gameItem.is_equal_two.text;
      }
    }

    line.correct = isCorrect;

    if (isCorrect) {
      correctCount++;
    } else {
      wrongCount++;
    }
  });

  drawLines();

  const minutes = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
  const seconds = String(secondsElapsed % 60).padStart(2, '0');

  document.getElementById('scoreText').innerText =
    `Correct: ${correctCount}\nWrong: ${wrongCount}\nTime Taken: ${minutes}:${seconds}`;

  setTimeout(() => {
    document.getElementById('resultPopup').style.display = 'flex';
    document.body.classList.add('modal-open');

    if (correctCount > 0) {
      resultAudio.play().catch(() => { });
      const percentage = Math.floor((correctCount / guidanceSteps.length) * 100);
      const particleCount = Math.max(Math.floor(percentage), 25);
      triggerConfettiParticles(particleCount);
    } else {
      speakText("Oops! You need to learn more.");
    }
  }, 500);
}

function triggerConfettiParticles(particleCount) {
  const confettiCanvas = document.getElementById('confetti-canvas');
  const myConfetti = confetti.create(confettiCanvas, { resize: true, useWorker: true });
  const duration = 400;
  const end = Date.now() + duration;

  (function frame() {
    myConfetti({ particleCount, angle: 60, spread: 55, origin: { x: 0 } });
    myConfetti({ particleCount, angle: 120, spread: 55, origin: { x: 1 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

function restartGame() {
  checkingAnswers = false;
  hasSpokenAllMatched = false;
  lines = [];
  tempLine = null;

  drawLines();

  document.querySelectorAll('.dot.left, .dot.right').forEach(dot => {
    dot.classList.remove('active', 'active-match');
  });

  clearInterval(timerInterval);
  secondsElapsed = 0;
  document.getElementById('timer-count').textContent = '00:00';
  document.getElementById('resultPopup').style.display = 'none';
  document.body.classList.remove('modal-open');
  enableHoverSpeak();
  currentStep = 0;
  hasSpokenAllMatched = false;

  // Recreate and shuffle guidance steps
  createGuidanceSteps();

  setDefaultImages();
  startTimer();
  setTimeout(startGuidance, 1000);

  // Redirect to index.html after the restart action
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
  window.location.href = `/admin/match?sid=${sid}&tid=${tid}&lid=${lid}&stid=${stid}&qid=${qid}&ust=${ust}`;
}
