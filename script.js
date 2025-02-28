let quizData = [];
let score = 0;
let totalSeconds = 0; // Total seconds for the timer
let timerInterval;    // Interval ID for the timer
let currentLevel = 1; // Track the quiz level
let feedbackLevel1 = ''; // Store feedback for Level 1
let feedbackLevel2 = ''; // Store feedback for Level 2
    // Track the current level


async function startQuiz() {
    const name = document.getElementById('name').value.trim();
    const subject = document.getElementById('subject').value;
    const numQuestions = parseInt(document.getElementById('numQuestions').value);

    if (!name || !subject || !numQuestions) {
        alert('Please fill in all fields!');
        return;
    }

    totalSeconds = numQuestions * (currentLevel === 1 ? 25 : 30);

    const response = await fetch('http://localhost:3000/get-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, numQuestions }),
    });

    const result = await response.json();
    if (result.success) {
        quizData = result.questions;
        displayQuiz(numQuestions);
        startTimer();
    } else {
        alert('Error fetching questions: ' + result.message);
    }
}

function startTimer() {
    const timerDiv = document.getElementById('timer');
    let remainingSeconds = totalSeconds;

    timerDiv.style.display = 'block';
    timerDiv.textContent = `Time Remaining: ${formatTime(remainingSeconds)}`;

    timerInterval = setInterval(() => {
        remainingSeconds--;

        if (remainingSeconds <= 10) {
            timerDiv.classList.add('blink');
        }

        timerDiv.textContent = `Time Remaining: ${formatTime(remainingSeconds)}`;

        if (remainingSeconds <= 0) {
            clearInterval(timerInterval);
            alert('Time is up! Submitting your quiz automatically.');
            submitQuiz();
        }
    }, 1000);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function displayQuiz(numQuestions) {
    document.getElementById('setup').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';

    const questionsDiv = document.getElementById('questions');
    questionsDiv.innerHTML = '';
    quizData.forEach((question, index) => {
        questionsDiv.innerHTML += `
            <div class="question" id="question-${index}">
                <p><strong>Q${index + 1}:</strong> <span class="question-text">${question.question_text}</span></p>
                <div class="options">
                    <label><input type="radio" name="q${index}" value="A"> ${question.option_a}</label>
                    <label><input type="radio" name="q${index}" value="B"> ${question.option_b}</label>
                    <label><input type="radio" name="q${index}" value="C"> ${question.option_c}</label>
                    <label><input type="radio" name="q${index}" value="D"> ${question.option_d}</label>
                </div>
            </div>
        `;
    });

    const allInputs = document.querySelectorAll('input[type="radio"]');
    allInputs.forEach(input => {
        input.addEventListener('change', () => {
            const allAnswered = Array.from(quizData).every((_, i) =>
                document.querySelector(`input[name="q${i}"]:checked`)
            );
            document.getElementById('submit-btn').disabled = !allAnswered;
        });
    });
}

function submitQuiz() {
    clearInterval(timerInterval);

    const feedbackDiv = document.getElementById('feedback');
    feedbackDiv.innerHTML = ''; // Clear feedback container for new submission

    score = 0;

    quizData.forEach((q, i) => {
        const userAnswerElement = document.querySelector(`input[name="q${i}"]:checked`);
        const feedback = document.createElement('div');
        feedback.classList.add('feedback-item');

        if (userAnswerElement) {
            const selectedValue = userAnswerElement.value.trim().toUpperCase();
            const correctOption = q.correct_option.trim().toUpperCase();

            if (selectedValue === correctOption) {
                score++;
                feedback.innerHTML = `
                    <p><strong>Question ${i + 1}:</strong> ${q.question_text}</p>
                    <p style="color: green;">Correct!</p>
                    <p><strong>Explanation:</strong> ${q.explanation || 'No explanation provided.'}</p>
                `;
            } else {
                feedback.innerHTML = `
                    <p><strong>Question ${i + 1}:</strong> ${q.question_text}</p>
                    <p style="color: red;">Wrong!</p>
                    <p>Correct Answer: ${q.correct_option}</p>
                    <p><strong>Explanation:</strong> ${q.explanation || 'No explanation provided.'}</p>
                `;
            }
        } else {
            feedback.innerHTML = `
                <p><strong>Question ${i + 1}:</strong> ${q.question_text}</p>
                <p style="color: red;">You did not answer this question.</p>
                <p>Correct Answer: ${q.correct_option}</p>
                <p><strong>Explanation:</strong> ${q.explanation || 'No explanation provided.'}</p>
            `;
        }

        feedbackDiv.appendChild(feedback);
    });

    const percentage = (score / quizData.length) * 100;
    document.getElementById('final-score').textContent = `Your final score is: ${percentage.toFixed(2)}%`;

    const feedbackQuote = document.getElementById('feedback-quote');
    if (percentage >= 90) {
        feedbackQuote.textContent = 'Excellent! 🌟';
    } else if (percentage >= 70) {
        feedbackQuote.textContent = 'Very Good! 👍';
    } else if (percentage >= 50) {
        feedbackQuote.textContent = 'Good! 😊';
    } else {
        feedbackQuote.textContent = 'Needs Improvement! 😔';
    }

    // Save feedback for the current level
    if (currentLevel === 1) {
        feedbackLevel1 = feedbackDiv.innerHTML;
        if (percentage >= 70) {
            document.getElementById('level2-btn').style.display = 'block'; // Enable Level 2 button
        }
    } else if (currentLevel === 2) {
        feedbackLevel2 = feedbackDiv.innerHTML;
    }

    // Always show the exit button
    document.getElementById('exit-btn').style.display = 'block';

    document.getElementById('feedback-container').style.display = 'block';
    document.getElementById('quiz-container').style.display = 'none';
}

function startLevel2Quiz() {
    currentLevel = 2;
    document.getElementById('feedback-container').style.display = 'none'; // Hide Level 1 feedback
    document.getElementById('level2-btn').style.display = 'none';
    startQuiz();
}

function showFeedback(level) {
    const feedbackDiv = document.getElementById('feedback');
    feedbackDiv.innerHTML = ''; // Clear the feedback container

    if (level === 1) {
        feedbackDiv.innerHTML = `
            <h2>Level 1 Feedback</h2>
            ${feedbackLevel1 || '<p>No feedback available for Level 1.</p>'}
        `;
    } else if (level === 2) {
        feedbackDiv.innerHTML = `
            <h2>Level 2 Feedback</h2>
            ${feedbackLevel2 || '<p>No feedback available for Level 2.</p>'}
        `;
    }

    document.getElementById('feedback-container').style.display = 'block';
}

function exitQuiz() {
    document.getElementById('feedback-container').style.display = 'none';
    document.getElementById('thank-you').style.display = 'block';
}
function exitPage() {
    if (confirm("Are you sure you want to exit?")) {
        window.open('', '_self'); // Open a blank page in the same tab
        window.close(); // Close the current window
    }
}

function reloadPage() {
    window.location.reload();
}
