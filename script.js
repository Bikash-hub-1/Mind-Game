const questionElement = document.getElementById('question');
const answerButtons = document.getElementById('answer-buttons');
const nextBtn = document.getElementById('next-btn');
let currentQuestionIndex = 0;
let score = 0;
let questions = [];

// Function to decode HTML entities
function decodeHTMLEntities(text) {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

async function fetchQuestions() {
  const response = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
  const data = await response.json();
  questions = data.results.map((questionData) => {
    const formattedQuestion = {
      question: decodeHTMLEntities(questionData.question),
      answers: [
        ...questionData.incorrect_answers.map(answer => ({ text: decodeHTMLEntities(answer), correct: false })),
        { text: decodeHTMLEntities(questionData.correct_answer), correct: true }
      ].sort(() => Math.random() - 0.5) // Shuffle answers
    };
    return formattedQuestion;
  });
}

async function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  nextBtn.innerText = 'Next';
  await fetchQuestions();
  showQuestion();
}

function showQuestion() {
  resetState();
  let currentQuestion = questions[currentQuestionIndex];
  let questionNo = currentQuestionIndex + 1;
  questionElement.innerText = `Question ${questionNo}: ${currentQuestion.question}`;
  currentQuestion.answers.forEach(answer => {
    const button = document.createElement('button');
    button.innerText = answer.text;
    button.classList.add('btn');
    button.dataset.correct = answer.correct;
    answerButtons.appendChild(button);
    button.addEventListener('click', selectAnswer);
  });
}

function resetState() {
  nextBtn.style.display = 'none';
  while (answerButtons.firstChild) {
    answerButtons.removeChild(answerButtons.firstChild);
  }
}

function selectAnswer(e) {
  const selectedButton = e.target;
  const correct = selectedButton.dataset.correct === 'true';
  setStatusClass(selectedButton, correct);
  Array.from(answerButtons.children).forEach(button => {
    button.disabled = true;
  });
  if (correct) {
    score++;
  } else {
    const correctButtons = Array.from(answerButtons.children).filter(button => button.dataset.correct === 'true');
    correctButtons.forEach(button => {
      setStatusClass(button, true);
    });
  }
  if (currentQuestionIndex < questions.length - 1) {
    nextBtn.style.display = 'block';
  } else {
    showScore();
  }
}

function setStatusClass(element, correct) {
  clearStatusClass(element);
  if (correct) {
    element.classList.add('correct');
  } else {
    element.classList.add('incorrect');
  }
}

function clearStatusClass(element) {
  element.classList.remove('correct');
  element.classList.remove('incorrect');
}

function showPopup(message, emoji) {
  const popup = document.createElement('div');
  popup.classList.add('popup');
  popup.innerHTML = `${emoji} ${message}`;
  document.body.appendChild(popup);

  // Show the popup
  setTimeout(() => {
    popup.classList.add('show');
  }, 100);

  // Hide the popup after 3 seconds
  setTimeout(() => {
    popup.classList.remove('show');
    popup.classList.add('hide');
  }, 3000);

  // Remove the popup from the DOM after the animation
  setTimeout(() => {
    popup.remove();
  }, 3500);
}

function showScore() {
  resetState();
  let emoji;
  let message;
  const scorePercentage = (score / questions.length) * 100;

  if (scorePercentage === 100) {
    emoji = '🎉';
    message = 'Perfect!';
  } else if (scorePercentage >= 75) {
    emoji = '😊';
    message = 'Good!';
  } else if (scorePercentage >= 50) {
    emoji = '😐';
    message = 'Average';
  } else {
    emoji = '😢';
    message = 'Low';
  }

  showPopup(message, emoji);

  questionElement.innerHTML = `
    <h2>You scored ${score} out of ${questions.length}!</h2>
  `;
  nextBtn.innerText = 'Restart';
  nextBtn.style.display = 'block';
}

nextBtn.addEventListener('click', () => {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    showQuestion();
  } else {
    startQuiz();
  }
});

startQuiz();