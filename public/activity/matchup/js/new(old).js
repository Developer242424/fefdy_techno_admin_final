// Your JSON data structure
const gameData = [
  {
    "question": "Match the Word to the Image"
  },
  {
    "instruction": "Match the Apple",
    "is_equal_one": {
      "text": "Apple",
      "thumbnail": "images/img-1.png"
    },
    "is_equal_two": {
      "text": "Apple",
      "thumbnail": "images/img-1.png"
    },
    "answer": "apple"
  },
  {
    "instruction": "Match the Car",
    "is_equal_one": {
      "text": "Car",
      "thumbnail": "images/img-2.png"
    },
    "is_equal_two": {
      "text": "Car",
      "thumbnail": "images/img-2.png"
    },
    "answer": "car"
  },
  {
    "instruction": "Match the Ball",
    "is_equal_one": {
      "text": "Ball",
      "thumbnail": "images/img-3.png"
    },
    "is_equal_two": {
      "text": "Ball",
      "thumbnail": "images/img-3.png"
    },
    "answer": "ball"
  }
];

// Function to dynamically generate content based on the JSON data
function generateContent() {
    const questionContainer = document.getElementById('question-container');
    
    // Add main heading
    const mainHeading = document.getElementById('mainHeading');
    mainHeading.textContent = gameData[0].question;

    // Add matching rows for each question
    const matchingArea = document.getElementById('matching-area');
    gameData.slice(1).forEach(item => {
        const row = document.createElement('div');
        row.classList.add('row', 'mb-3');

        // Left side of matching
        const leftColumn = document.createElement('div');
        leftColumn.classList.add('col-6');
        leftColumn.innerHTML = `
            <div class="item" data-id="${item.is_equal_one.text}">
                ${item.is_equal_one.text}
                <div class="dot left" data-id="${item.is_equal_one.text}"></div>
            </div>
        `;
        row.appendChild(leftColumn);

        // Right side of matching
        const rightColumn = document.createElement('div');
        rightColumn.classList.add('col-6', 'text-end');
        rightColumn.innerHTML = `
            <div class="item right d-inline-block" data-id="${item.is_equal_two.text}">
                <div class="dot right" data-id="${item.is_equal_two.text}"></div>
                <img src="${item.is_equal_two.thumbnail}" alt="${item.is_equal_two.text}" />
            </div>
        `;
        row.appendChild(rightColumn);

        // Add the row to the matching area
        matchingArea.appendChild(row);
    });
}

// Call the function to generate content
window.onload = generateContent;

const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    const correctMap = {
      apple: 'A',
      car: 'B',
      ball: 'C'
    };
    
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
    
    let guidanceSteps = [
      { id: "car", label: "Match the Electronic item" },
      { id: "apple", label: "Match the Fruit" },
      { id: "ball", label: "Match the Game item" }
    ];
    
    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }
    shuffle(guidanceSteps);
    
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
    function typeHeadingText(text, elementId, speed = 50, onComplete = null) {
      const el = document.getElementById(elementId);
      if (!el) return;
      clearInterval(typeHeadingInterval);
      typingInProgress = true;
      el.dataset.fulltext = text;
      el.style.visibility = 'visible';
      el.textContent = ''; // 👈 Ensure fully cleared before typing
      let i = 0;
      typeHeadingInterval = setInterval(() => {
        if (i < text.length) {
          el.textContent += text.charAt(i++);
        } else {
          clearInterval(typeHeadingInterval);
          el.style.borderRight = 'none';
          typingInProgress = false;
          if (onComplete) setTimeout(onComplete, 300);
        }
      }, speed);
    }
    
    
    function stopTypingAndShowFullText(elementId) {
      const el = document.getElementById(elementId);
      if (!el) return;
    
      clearInterval(typeHeadingInterval);
      typingInProgress = false;
    
      const fullText = el.dataset.fulltext || '';
      el.textContent = fullText; // 💡 Ensure full text is shown
      el.style.borderRight = 'none';
    }
    
    
    window.addEventListener('load', () => {
      const intro = document.getElementById("introAudio");
      intro.muted = false;
      document.getElementById("mainHeading").style.visibility = 'hidden';
      document.getElementById("timer-section").classList.remove("d-none");
    
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
    
      // ✅ Prevent re-trigger if already animating
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
    
    // The rest of the script remains unchanged
    
    function setDefaultImages() {
      document.querySelector('img[alt="Left Side Image"]').src = 'images/boy-2.png';
      document.querySelector('img[alt="Right Side Image"]').src = 'images/girl-2.png';
    }
    function changeImages(isCorrect = false) {
      const boyImage = document.querySelector('img[alt="Left Side Image"]');
      const girlImage = document.querySelector('img[alt="Right Side Image"]');
      const newBoyImage = isCorrect ? 'images/boy-4.png' : 'images/boy-3.png';
      const newGirlImage = isCorrect ? 'images/girl-4.png' : 'images/girl-3.png';
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
      // 🛑 Block nextAnswer if results are being shown
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
      highlightStep(step.id); // Optional
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
    
    function drawLine(start, end, color = 'black') {
      const dx = end.x - start.x;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.bezierCurveTo(start.x + dx * 0.5, start.y, start.x + dx * 0.5, end.y, end.x, end.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = 6;
      ctx.stroke();
    }
    function drawLines() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      lines.forEach(line => {
        const color = line.correct === null ? 'black' : (line.correct ? 'green' : 'red');
        drawLine(line.start, line.end, color);
      });
      if (tempLine) drawLine(tempLine.start, tempLine.end, 'black');
    }
    // Updated function to add drag-and-drop functionality to dynamic items
function enableDragAndDrop() {
    document.querySelectorAll('.dot.left').forEach(dot => {
        dot.addEventListener('mousedown', (e) => {
            e.preventDefault();
            if (!dragEnabled) return;
            dropAudio.currentTime = 0;
            dropAudio.play().catch(() => {});
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
        if (startDot) {
            tempLine = {
                start: startDot.pos,
                end: { x: e.pageX, y: e.pageY }
            };
            drawLines();
        }
    });

    document.addEventListener('mouseup', (e) => {
        if (!startDot) return;
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

        if (matchedRightDot) {
            lines = lines.filter(line => line.leftId !== startDot.id && line.rightId !== matchedRightDot.id);
            lines.push({
                start: startDot.pos,
                end: matchedRightDot.pos,
                leftId: startDot.id,
                rightId: matchedRightDot.id,
                correct: null
            });
            dropAudio.currentTime = 0;
            dropAudio.play().catch(() => {});
            document.querySelectorAll('.dot.left, .dot.right').forEach(dot => dot.classList.remove('active-match'));
            startDot.el.classList.add('active-match', 'active');
            matchedRightDot.el.classList.add('active-match', 'active');
    
            currentStep++;
            if (currentStep < guidanceSteps.length) {
                setTimeout(startGuidance, 1000);
            } else {
                document.getElementById("instruction-text").innerText = "All items matched! Click 'Check Answers' to finish.";
                speakText("All items matched! Click check answers to finish.");
            }
            updateCheckButton();
        }
        document.querySelectorAll('.dot.left').forEach(dot => dot.classList.remove('active-drag'));
        tempLine = null;
        startDot = null;
        drawLines();
        document.querySelector('.container').classList.remove('noselect');
    });
}

// Call this after generating the content to activate drag-and-drop
enableDragAndDrop();

    
    // ✅ This is the missing function
    function checkAnswers() {
      suppressFinalSpeech = true; // 🛑 Don't allow final message after check triggered
      speechSynthesis.cancel(); 
      clearInterval(timerInterval);
    
    
      lines.forEach(line => line.correct = null);
      drawLines();
    
      let correctCount = 0;
      let wrongCount = 0;
    
      const matchedSteps = guidanceSteps.slice(0, currentStep);
      const stepIds = new Set(matchedSteps.map(step => step.id));
      const mandatoryLines = lines.filter(line => stepIds.has(line.leftId));
    
      mandatoryLines.forEach((line, index) => {
        setTimeout(() => {
          const expectedRight = correctMap[line.leftId];
          const isCorrect = (line.leftId === guidanceSteps[index].id) && (line.rightId === expectedRight);
          line.correct = isCorrect;
          drawLines();
    
          const sound = isCorrect ? correctAudio : wrongAudio;
          sound.currentTime = 0;
          sound.play().catch(() => {});
    
          if (isCorrect) {
            correctCount++;
          } else {
            wrongCount++;
          }
    
          if (isCorrect) {
            setTimeout(() => changeImages(true), 50);
          } else {
            setTimeout(() => changeImages(false), 50);
          }
    
          if (index === mandatoryLines.length - 1) {
            setTimeout(() => {
              const minutes = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
              const seconds = String(secondsElapsed % 60).padStart(2, '0');
              document.getElementById('scoreText').innerText =
                `Correct: ${correctCount}\nWrong: ${wrongCount}\nTime Taken: ${minutes}:${seconds}`;
              document.getElementById('resultPopup').style.display = 'flex';
              document.body.classList.add('modal-open');
    
              if (correctCount > 0) {
                resultAudio.play().catch(() => {});
                const percentage = Math.floor((correctCount / guidanceSteps.length) * 100);
                const particleCount = Math.max(Math.floor(percentage), 25);
                triggerConfettiParticles(particleCount);
              } else {
                speakText("Oops! You need to learn more.");
              }
            }, 1000);
          }
        }, index * 1000);
      });
    
      if (mandatoryLines.length === 0) {
        const minutes = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
        const seconds = String(secondsElapsed % 60).padStart(2, '0');
        document.getElementById('scoreText').innerText =
          `Correct: 0\nWrong: 0\nTime Taken: ${minutes}:${seconds}`;
        document.getElementById('resultPopup').style.display = 'flex';
        document.body.classList.add('modal-open');
    
        speakText("Oops! You need to learn more.");
      }
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
      suppressFinalSpeech = false;
      hasSpokenAllMatched = false;
      lines = [];
      tempLine = null;
      
      drawLines();
    
      // 🛠️ Remove leftover classes from previous round
      document.querySelectorAll('.dot.left, .dot.right').forEach(dot => {
        dot.classList.remove('active', 'active-match');
      });
    
      clearInterval(timerInterval);
      secondsElapsed = 0;
      document.getElementById('timer-count').textContent = '00:00';
      document.getElementById('resultPopup').style.display = 'none';
      document.body.classList.remove('modal-open');
      updateCheckButton();
      enableHoverSpeak();
      currentStep = 0;
      hasSpokenAllMatched = false;
      shuffle(guidanceSteps);
      setDefaultImages();
      startTimer();
      setTimeout(startGuidance, 1000);
    }
    
    
    function adjustParticles(percentage) {
      const confettiCanvas = document.getElementById('confetti-canvas');
      const myConfetti = confetti.create(confettiCanvas, { resize: true, useWorker: true });
      const particleCount = Math.floor(percentage);
      const duration = 400;
      const end = Date.now() + duration;
    
      (function frame() {
        myConfetti({
          particleCount: particleCount,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        myConfetti({
          particleCount: particleCount,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
    
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }
    
