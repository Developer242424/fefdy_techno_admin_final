const questions = [
    {
            question: "Which is the Best Version?",
            image: "https://cdn.hashnode.com/res/hashnode/image/upload/v1682055846589/5ee8cb0c-88d3-4a97-b12c-b21ccc3c948c.jpeg",
            options: [
                {text: "Facebook Version", image: "1.jpg"},
                {text: "iOS Version", image: "2.jpg"},
                {text: "Android Version", image: "3.jpg"},
                {text: "PC & Mac Version", image: "4.jpg"}
            ],
            correct: 3
        },
        {
            question: "What is the capital of France?",
            image: "https://cdn.pixabay.com/photo/2018/04/25/09/26/eiffel-tower-3349075_1280.jpg",
            options: [
                {text: "Paris", image: "https://cdn.pixabay.com/photo/2016/11/18/19/01/paris-1836415_1280.jpg"},
                {text: "London", image: "https://cdn.pixabay.com/photo/2014/09/11/18/23/london-441853_1280.jpg"},
                {text: "Berlin", image: "https://cdn.pixabay.com/photo/2016/01/19/18/00/berlin-1150051_1280.jpg"},
                {text: "Madrid", image: "https://cdn.pixabay.com/photo/2018/01/31/12/16/madrid-3121359_1280.jpg"}
            ],
            correct: 0
        },
        {
            question: "Which animal is known as the king of the jungle?",
            image: "https://cdn.pixabay.com/photo/2019/02/04/20/07/jungle-3975656_1280.jpg",
            options: [
                {text: "Lion", image: "https://cdn.pixabay.com/photo/2014/11/03/15/11/lion-515028_1280.jpg"},
                {text: "Tiger", image: "https://cdn.pixabay.com/photo/2015/12/18/13/46/tiger-1098607_1280.jpg"},
                {text: "Elephant", image: "https://cdn.pixabay.com/photo/2016/11/14/04/45/elephant-1822636_1280.jpg"},
                {text: "Bear", image: "https://cdn.pixabay.com/photo/2016/03/08/20/03/bear-1244775_1280.jpg"}
            ],
            correct: 0
        },
        {
            question: "What is the largest planet in our solar system?",
            image: "https://cdn.pixabay.com/photo/2016/07/19/04/40/moon-1527501_1280.jpg",
            options: [
                {text: "Earth", image: "https://cdn.pixabay.com/photo/2011/12/13/14/39/venus-11022_1280.jpg"},
                {text: "Mars", image: "https://cdn.pixabay.com/photo/2011/12/13/14/31/mars-11012_1280.jpg"},
                {text: "Jupiter", image: "https://cdn.pixabay.com/photo/2016/07/23/23/33/jupiter-1537573_1280.jpg"},
                {text: "Saturn", image: "https://cdn.pixabay.com/photo/2012/01/09/09/33/saturn-11614_1280.jpg"}
            ],
            correct: 2
        },
        {
            question: "Which country is famous for sushi?",
            image: "https://cdn.pixabay.com/photo/2016/07/26/16/16/sushi-1543252_1280.jpg",
            options: [
                {text: "China", image: "https://cdn.pixabay.com/photo/2018/11/12/16/09/forbidden-city-3811186_1280.jpg"},
                {text: "Japan", image: "https://cdn.pixabay.com/photo/2016/10/22/20/34/fuji-mountain-1761292_1280.jpg"},
                {text: "Korea", image: "https://cdn.pixabay.com/photo/2017/08/22/17/42/korea-2669593_1280.jpg"},
                {text: "Thailand", image: "https://cdn.pixabay.com/photo/2016/11/14/03/35/bangkok-1822513_1280.jpg"}
            ],
            correct: 1
        },
        {
            question: "What is the hardest natural substance on Earth?",
            image: "https://cdn.pixabay.com/photo/2016/10/22/15/32/stones-1761597_1280.jpg",
            options: [
                {text: "Gold", image: "https://cdn.pixabay.com/photo/2016/04/29/12/35/gold-1360995_1280.jpg"},
                {text: "Diamond", image: "https://cdn.pixabay.com/photo/2016/08/16/17/20/diamonds-1598227_1280.jpg"},
                {text: "Iron", image: "https://cdn.pixabay.com/photo/2016/08/15/14/35/iron-1595608_1280.jpg"},
                {text: "Platinum", image: "https://cdn.pixabay.com/photo/2013/07/12/12/56/platinum-146574_1280.jpg"}
            ],
            correct: 1
        }
    ];

    let currentQuestion = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let totalTime = 0;
    let timer;
    let userAnswers = new Array(questions.length).fill(null); // Store answers in an array
    let currentSpeech = null; // Store the current SpeechSynthesisUtterance
    let isTransitioning = false; // Flag to prevent multiple clicks during transition
    let autoAdvancing = true; // Flag to control auto advancing

    // Stop any ongoing speech
    function stopCurrentSpeech() {
        if (currentSpeech) {
            window.speechSynthesis.cancel();
            currentSpeech = null;
        }
    }

    // Speak the question text
    function speakQuestion(questionText) {
        stopCurrentSpeech();
        currentSpeech = new SpeechSynthesisUtterance(questionText);
        currentSpeech.lang = "en-US";
        window.speechSynthesis.speak(currentSpeech);
    }

    // Speak the text (answer option)
    function speakText(text, callback = null) {
        stopCurrentSpeech();
        currentSpeech = new SpeechSynthesisUtterance(text);
        currentSpeech.lang = 'en-US';

        currentSpeech.onend = function () {
            currentSpeech = null;
            if (callback && autoAdvancing) callback(); // Move to next question after speech ends if auto advancing
        };

        window.speechSynthesis.speak(currentSpeech);
    }
    
    // Show loading animation
    function showLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('active');
    }
    
    // Hide loading animation
    function hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.remove('active');
    }

    function loadQuestion() {
const question = questions[currentQuestion];
const questionContainer = document.getElementById("question-container");
const answersContainer = document.getElementById("answers-container");

// Update progress bar
const progressBar = document.getElementById("progress-bar");
progressBar.style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;

// Set question and image
questionContainer.innerHTML = 
    `<div class="quiz-question"><h2>${question.question}</h2></div>
    <img src="${question.image}" alt="question image" class="question-image">
    <div class="audio-icon" onclick="speakQuestionOrResult()">${userAnswers[currentQuestion] !== null ? '<i class="fa fa-volume-up"></i>' : '<i class="fa fa-volume-up"></i>'}</div>`;

// If this is an already answered question, add feedback message
if (userAnswers[currentQuestion] !== null) {
    const isCorrect = userAnswers[currentQuestion] === question.correct;
    const correctAnswer = question.options[question.correct].text;
    
    const message = document.createElement('div');
    message.classList.add('feedback');
    
    // Speak the result instead of the question for answered questions
    speakResult(isCorrect, correctAnswer);
} else {
    // Speak the question when loaded for unanswered questions
    speakQuestion(question.question);
}

// Set answers
answersContainer.innerHTML = "";
question.options.forEach((option, index) => {
    const optionDiv = document.createElement("div");
    optionDiv.classList.add("answer-option");
    
    optionDiv.innerHTML = `
        <img src="${option.image}" alt="${option.text}" class="option-image">
        <div class="option-text">${option.text}</div>
    `;

    // If this question has already been answered, disable the option and highlight the correct or incorrect answer
    if (userAnswers[currentQuestion] !== null) {
        optionDiv.style.pointerEvents = "none";
        if (userAnswers[currentQuestion] === index) {
            if (index === question.correct) {
                optionDiv.classList.add("correct");
                optionDiv.innerHTML += '<div class="result-icon"><i class="fa fa-check colour-green" aria-hidden="true""></i></div>';
            } else {
                optionDiv.classList.add("incorrect");
                optionDiv.innerHTML += '<div class="result-icon"><i class="fa fa-times colour-red" aria-hidden="true""></i></div>';
            }
        }
    }

    // If this question hasn't been answered yet, enable hover audio
    if (userAnswers[currentQuestion] === null) {
        optionDiv.onmouseover = () => {
            speakText(option.text); // Speak the current hovered option
        };
    }

    // On click, check the answer and fix it permanently
    optionDiv.onclick = () => {
        if (!isTransitioning) {
            checkAnswer(index, optionDiv);
        }
    };

    answersContainer.appendChild(optionDiv);
});

// Start the timer if not already started
if (!timer) {
    startTimer();
}

// Update navigation buttons
updateNavigationButtons();

hideLoading();

// Ensure the first question's audio is played when it loads
if (currentQuestion === 0) {
    speakQuestion(question.question); // Ensure this is explicitly called for the first question.
}
}


// New function to speak the result for already answered questions
function speakResult(isCorrect, correctAnswer) {
stopCurrentSpeech();
let speechText = isCorrect ? 
    `You answered this question correctly. The answer is ${correctAnswer}.` : 
    `Your answer was incorrect. The correct answer is ${correctAnswer}.`;

currentSpeech = new SpeechSynthesisUtterance(speechText);
currentSpeech.lang = "en-US";
window.speechSynthesis.speak(currentSpeech);
}

// New function to handle the audio icon click based on whether question is answered
function speakQuestionOrResult() {
const question = questions[currentQuestion];

if (userAnswers[currentQuestion] !== null) {
    // Question was already answered
    const isCorrect = userAnswers[currentQuestion] === question.correct;
    const correctAnswer = question.options[question.correct].text;
    speakResult(isCorrect, correctAnswer);
} else {
    // Question not yet answered
    speakQuestion(question.question);
}
}

    // Improved checkAnswer function to add a celebration sound
    function checkAnswer(selectedIndex, selectedOption) {
if (isTransitioning) return; // Prevent multiple selections during transition

isTransitioning = true;
const correctIndex = questions[currentQuestion].correct;
const answerOptions = document.querySelectorAll('.answer-option');

// Disable all options once an answer is selected
answerOptions.forEach(option => {
    option.style.pointerEvents = "none";
});

// Store user's answer permanently
userAnswers[currentQuestion] = selectedIndex;

// If the answer is correct
if (selectedIndex === correctIndex) {
    correctAnswers++;
    selectedOption.classList.add("correct");
    selectedOption.innerHTML += '<div class="result-icon"><i class="fa fa-check colour-green" aria-hidden="true"></i></div>';

    // Play the celebration sound before announcing the correct answer
    const celebrationSound = new Audio("right.mp3"); // Replace with actual sound file path
    celebrationSound.play();

    // Announce the correct answer after 3 seconds (celebration sound duration)
    setTimeout(() => {
        speakText(`Correct! The answer is ${questions[currentQuestion].options[correctIndex].text}`, () => {
            // Always try to auto-advance after answering a new question
            if (isLastUnansweredQuestion()) {
                autoAdvance();
            } else {
                isTransitioning = false;
            }
        });
    }, 1000); // Wait for 1 second before announcing the correct answer
} else {
    wrongAnswers++;
    selectedOption.classList.add("incorrect");
    selectedOption.innerHTML += '<div class="result-icon"><i class="fa fa-times colour-red" aria-hidden="true"></i></div>';

    // Play a celebration sound for wrong answers first
    const celebrationSound = new Audio("wrong.mp3"); // Use a different celebration sound file for wrong answers
    celebrationSound.play();

    // Show the correct answer visually
    const correctOption = answerOptions[correctIndex];
    correctOption.classList.add("correct");
    correctOption.innerHTML += '<div class="result-icon"><i class="fa fa-check colour-green" aria-hidden="true"></i></div>';

    // Announce the correct answer via speech after the celebration sound duration (3 seconds)
    setTimeout(() => {
        speakText(`The right answer is - ${questions[currentQuestion].options[correctIndex].text}`, () => {
            // Always try to auto-advance after answering a new question
            if (isLastUnansweredQuestion()) {
                autoAdvance();
            } else {
                isTransitioning = false;
            }
        });
    }, 700); // Wait for 3 seconds before announcing the correct answer
}

// Always update navigation buttons after answering
updateNavigationButtons();

// If not auto-advancing (determined by isLastUnansweredQuestion), reset transition state
if (!isLastUnansweredQuestion()) {
    setTimeout(() => {
        isTransitioning = false;
    }, 500);
}
}



// New helper function to check if this is the furthest unanswered question
function isLastUnansweredQuestion() {
// Loop through questions after current one to see if any are already answered
for (let i = currentQuestion + 1; i < questions.length; i++) {
    if (userAnswers[i] !== null) {
        return false; // Found an answered question ahead of current
    }
}
return true; // This is the furthest unanswered question
}

// Modified autoAdvance to work regardless of autoAdvancing flag
function autoAdvance() {
// Short delay before advancing to the next question
setTimeout(() => {
    showLoading();
    
    // Move to next question or show results if last question
    currentQuestion++;
    if (currentQuestion < questions.length) {
        setTimeout(() => {
            loadQuestion();
            isTransitioning = false;
        }, 500); // Small delay for loading animation
    } else {
        // End of quiz, show results
        clearInterval(timer);
        setTimeout(() => {
            hideLoading();
            showResults();
            isTransitioning = false;
        }, 500);
    }
}, 1000); // Give user a moment to see the feedback
}

// Modified navigate function to set auto-advancing more intelligently
function navigate(direction) {
if (isTransitioning) return;

isTransitioning = true;
showLoading();

// Only turn off auto advancing if we're going backward
if (direction === 'prev') {
    autoAdvancing = false;
}
// When going forward to an unanswered question, restore auto-advancing
else if (direction === 'next' && userAnswers[currentQuestion + 1] === null) {
    autoAdvancing = true;
}

if (direction === 'prev' && currentQuestion > 0) {
    currentQuestion--;
} else if (direction === 'next' && currentQuestion < questions.length - 1) {
    currentQuestion++;
} else if (direction === 'next' && currentQuestion === questions.length - 1) {
    // Show results if we're at the last question and clicking next
    clearInterval(timer);
    setTimeout(() => {
        hideLoading();
        showResults();
        isTransitioning = false;
    }, 500);
    return;
}

setTimeout(() => {
    loadQuestion();
    isTransitioning = false;
}, 500);
}
    
    // Update navigation buttons based on current position
    function updateNavigationButtons() {
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

// Disable previous button if we're at the first question
prevBtn.disabled = currentQuestion === 0;

// Disable next button if current question is not answered
nextBtn.disabled = userAnswers[currentQuestion] === null;

// Change next button text on last question
if (currentQuestion === questions.length - 1) {
    nextBtn.textContent = "Finish Quiz";
} else {
    nextBtn.textContent = "Next Question";
}
}
    
    // Check if all questions are answered
    function allQuestionsAnswered() {
        return userAnswers.every((answer, index) => answer !== null);
    }

    function showResults() {
document.getElementById("correct-count").textContent = correctAnswers;
document.getElementById("wrong-count").textContent = wrongAnswers;
document.getElementById("total-time").textContent = totalTime;

// Show the modal with results
document.getElementById("result-modal").style.display = "block";

// Play the result audio when showing the results
const resultAudio = new Audio("result.mp3"); // Replace with the path to your result audio file
resultAudio.play();

// Set up the close button
document.getElementById("close-modal").onclick = function() {
    // Close the modal
    document.getElementById("result-modal").style.display = "none";
    // Restart the quiz
    startAgain();
};

// Close the modal and restart the quiz if clicking outside
window.onclick = function(event) {
    if (event.target == document.getElementById("result-modal")) {
        // Restart the quiz if the user clicks outside the modal
        startAgain();
    }
};
}

    function startAgain() {
        currentQuestion = 0;
        correctAnswers = 0;
        wrongAnswers = 0;
        totalTime = 0;
        userAnswers = new Array(questions.length).fill(null); // Reset answers
        isTransitioning = false;
        autoAdvancing = true; // Reset to auto advance mode

        // Shuffle questions for a fresh quiz start
        shuffleArray(questions);

        // Hide the result modal and start the quiz
        document.getElementById("result-modal").style.display = "none";

        // Reset and reload the quiz
        if (timer) clearInterval(timer);
        showLoading();
        setTimeout(() => {
            startTimer();
            loadQuestion();
        }, 500);
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function startTimer() {
        totalTime = 0;
        document.getElementById("timer-count").textContent = totalTime;
        timer = setInterval(function () {
            totalTime++;
            document.getElementById("timer-count").textContent = totalTime;
        }, 1000); // Update every second
    }

    // Start the quiz
    showLoading();
    setTimeout(() => {
        loadQuestion();
    }, 500);
    
    // Set up close modal functionality
    document.getElementById("close-modal").onclick = function() {
        document.getElementById("result-modal").style.display = "none";
    };