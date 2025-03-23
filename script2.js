// Fix updateProgress function
function updateProgress() {
    const total = words.length; // Use current round's word count
    const completed = words.filter(word => word.correct).length;
    
    // Update totalCorrect based on current round's completed words
    totalCorrect = completed;
    
    // Calculate correct answers as a percentage of current round's total
    const progressPercentage = Math.round((completed / total) * 100) || 0;
    
    // Update progress bar and text
    document.getElementById("progress").style.width = progressPercentage + "%";
    document.getElementById("progressText").innerText = `${completed}/${total} completed`;
    
    // Update question counter
    let questionText;
    if (words.length > 0) {
        questionText = `Round ${currentRound}: Question ${currentIndex + 1}/${words.length}`;
    } else {
        questionText = `Round ${currentRound}: Completed`;
    }
    
    const questionCounter = document.getElementById("questionCounter");
    if (questionCounter) {
        questionCounter.innerText = questionText;
    }
    
    console.log(`Progress: ${completed}/${total} (${progressPercentage}%) - ${questionText}`);
}

// Fix the round summary calculations
function showRoundSummary(isFinal = false) {
    const roundSummary = document.getElementById('roundSummary') || createRoundSummaryElement();
    
    // Calculate actual stats
    const totalTerms = originalWordsList.length;
    const completedTerms = originalWordsList.filter(word => 
        !roundWrongAnswers.some(w => w.term === word.term)
    ).length;
    const wrongInThisRound = roundWrongAnswers.length;
    const percentage = Math.round((completedTerms / totalTerms) * 100);
    
    if (wrongInThisRound === 0 || isFinal) {
        roundSummary.innerHTML = `
            <h2>Quiz Completed!</h2>
            <div class="stats">
                <p>All words completed! 🎉</p>
                <p>Total correct: ${completedTerms}/${totalTerms} (${percentage}%)</p>
                <p>Total rounds completed: ${currentRound}</p>
            </div>
            <div class="buttons">
                <button class="button button-primary" onclick="resetQuiz()">
                    Start New Quiz
                </button>
            </div>
        `;
    } else {
        roundSummary.innerHTML = `
            <h2>Round ${currentRound} Completed</h2>
            <div class="stats">
                <p>Total correct: ${completedTerms}/${totalTerms} (${percentage}%)</p>
                <p>Remaining words: ${wrongInThisRound}</p>
            </div>
            <div class="buttons">
                <button class="button button-primary" onclick="startNextRound()">
                    Next Round (${wrongInThisRound} words)
                </button>
            </div>
        `;
    }
    
    roundSummary.style.display = 'block';
}

// Fix finishRound function to avoid double-counting correct answers
function finishRound() {
    // In sequential mode, we need to count only newly correct words from this round
    // and make sure not to double count words already marked as correct
    const correctThisRound = words.filter(word => word.correct).length;
    
    // Log useful information
    console.log(`Round ${currentRound} finished. New words correct: ${correctThisRound}, Wrong: ${roundWrongAnswers.length}, Total correct so far: ${totalCorrect}`);
    
    // Hide question card and show summary
    const questionCard = document.getElementById("questionCard");
    if (questionCard) questionCard.style.display = "none";
    
    showRoundSummary(roundWrongAnswers.length === 0);
    saveToLocalStorage();
}

// Fix startNextRound to properly reset all words
function startNextRound() {
    currentRound++;
    currentIndex = 0;
    
    // Get the wrong answers from previous round
    const wrongTerms = roundWrongAnswers.map(w => w.term);
    
    // Reset all words for the new round, marking previously wrong ones as not completed
    words = originalWordsList.map(word => ({
        ...word,
        correct: false // Reset all words to incorrect for new round
    }));
    
    // Filter to only keep the wrong words for the new round
    words = words.filter(word => wrongTerms.includes(word.term));
    
    // Reset the wrong answers tracking for the new round
    roundWrongAnswers = [];
    
    // Reset total correct since we're starting a new round
    totalCorrect = 0;
    
    console.log(`Starting round ${currentRound} with ${words.length} words to retry`);
    
    resetUIForNewRound();
    loadQuestion();
    updateProgress();
    saveToLocalStorage();
}

// Add helper function to reset UI for a new round
function resetUIForNewRound() {
    // Hide round summary
    const roundSummary = document.getElementById('roundSummary');
    if (roundSummary) roundSummary.style.display = 'none';
    
    // Show question card
    const questionCard = document.getElementById('questionCard');
    if (questionCard) questionCard.style.display = 'block';
    
    // Reset answer input and buttons
    const elements = {
        answerInput: document.getElementById('answer'),
        submitBtn: document.getElementById('submitBtn'),
        nextBtn: document.getElementById('nextBtn'),
        skipBtn: document.getElementById('skipBtn'),
        feedback: document.getElementById('feedback'),
        overrideBtn: document.getElementById('overrideBtn')
    };
    
    if (elements.answerInput) {
        elements.answerInput.value = '';
        elements.answerInput.disabled = false;
    }
    if (elements.submitBtn) elements.submitBtn.style.display = 'inline-block';
    if (elements.nextBtn) elements.nextBtn.style.display = 'none';
    if (elements.skipBtn) elements.skipBtn.style.display = 'inline-block';
    if (elements.feedback) elements.feedback.innerHTML = '';
    if (elements.overrideBtn) elements.overrideBtn.style.display = 'none';
}

// Modify the checkAnswer function to handle retyping for incorrect answers
function checkAnswer() {
    const answer = document.getElementById('answer').value.trim().toLowerCase();
    const currentTerm = words[currentIndex];
    const correctAnswer = currentTerm.term.toLowerCase();
    
    // Get UI elements
    const elements = {
        feedback: document.getElementById('feedback'),
        submitBtn: document.getElementById('submitBtn'),
        nextBtn: document.getElementById('nextBtn'),
        skipBtn: document.getElementById('skipBtn'),
        overrideBtn: document.getElementById('overrideBtn'),
        answerInput: document.getElementById('answer')
    };

    if (answer === correctAnswer) {
        // Correct answer on first try
        elements.feedback.innerHTML = `<span class="correct">Correct!</span>`;
        markComplete(currentTerm);
        
        // Update UI for correct answer
        elements.answerInput.disabled = true;
        elements.submitBtn.style.display = 'none';
        elements.skipBtn.style.display = 'none';
        elements.nextBtn.style.display = 'inline-block';
        elements.overrideBtn.style.display = 'none';
    } else {
        // Wrong answer - show feedback and require retyping
        elements.feedback.innerHTML = `<span class="incorrect">Incorrect. Please type: ${currentTerm.term}</span>`;
        
        // Add to wrong answers without marking as complete
        if (!roundWrongAnswers.some(item => item.term === currentTerm.term)) {
            roundWrongAnswers.push({...currentTerm});
        }
        
        // Set up input for auto-validation instead of using the submit button
        elements.answerInput.value = '';
        elements.answerInput.focus();
        
        // Hide submit button and show skip button during retyping phase
        elements.submitBtn.style.display = 'none';
        elements.skipBtn.style.display = 'inline-block';
        
        // Show override button for manual marking as correct
        elements.overrideBtn.style.display = 'inline-block';
        
        // Remove any existing listeners first to prevent duplicates
        elements.answerInput.removeEventListener('input', autoValidationHandler);
        
        // Create a reusable handler function that can be removed later
        function autoValidationHandler() {
            const typedAnswer = elements.answerInput.value.trim().toLowerCase();
            if (typedAnswer === correctAnswer) {
                // Remove this event listener once correct answer is typed
                elements.answerInput.removeEventListener('input', autoValidationHandler);
                
                // Auto-validate the answer
                autoValidateRetyping(currentTerm);
            }
        }
        
        // Add the input event listener (better than keyup for this purpose)
        elements.answerInput.addEventListener('input', autoValidationHandler);
    }
    
    updateProgress();
}

// Improve the auto-validation function
function autoValidateRetyping(term) {
    const feedback = document.getElementById('feedback');
    const answerInput = document.getElementById('answer');
    const nextBtn = document.getElementById('nextBtn');
    const skipBtn = document.getElementById('skipBtn');
    const submitBtn = document.getElementById('submitBtn');
    const overrideBtn = document.getElementById('overrideBtn');
    
    // Show success message for retyping (only appears for previously incorrect answers)
    feedback.innerHTML = `<span class="correct">Good! You've correctly retyped the answer.</span>`;
    
    // Disable input
    answerInput.disabled = true;
    
    // Update button visibility
    skipBtn.style.display = 'none';
    submitBtn.style.display = 'none';
    overrideBtn.style.display = 'none';
    nextBtn.style.display = 'inline-block';
    
    // Automatically advance to next question after a brief delay
    setTimeout(() => {
        nextQuestion();
    }, 1500); // 1.5 second delay before advancing
}

function markComplete(term) {
    if (!term.correct) {
        term.correct = true;
        // Only increment if we're still below the total number of words
        if (totalCorrect < originalWordsList.length) {
            totalCorrect++;
            console.log(`Marked "${term.term}" as complete. Total correct: ${totalCorrect}`);
        } else {
            console.log(`"${term.term}" marked as correct, but totalCorrect already at max: ${totalCorrect}`);
        }
    } else {
        console.log(`"${term.term}" was already marked as correct.`);
    }
}

function markWrong(term) {
    // Only add to roundWrongAnswers if not already present
    if (!roundWrongAnswers.some(item => item.term === term.term)) {
        const termCopy = { ...term, correct: false };
        roundWrongAnswers.push(termCopy);
        
        // Also update the totalCorrect if this term was previously marked as correct
        if (term.correct) {
            term.correct = false;
            totalCorrect = Math.max(0, totalCorrect - 1); // Ensure it doesn't go below 0
            console.log(`Unmarked "${term.term}" as correct. New total correct: ${totalCorrect}`);
        }
    }
    console.log(`Marked "${term.term}" as wrong. Total wrong: ${roundWrongAnswers.length}`);
}

function overrideCorrect() {
    const currentTerm = words[currentIndex];
    
    // Remove from wrong answers
    roundWrongAnswers = roundWrongAnswers.filter(item => item.term !== currentTerm.term);
    
    // Mark as correct
    markComplete(currentTerm);
    
    // Update UI
    const feedback = document.getElementById('feedback');
    const overrideBtn = document.getElementById('overrideBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (feedback) feedback.innerHTML = `<span class="correct">Marked as correct!</span>`;
    if (overrideBtn) overrideBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'inline-block';
    
    // Update progress WITHOUT incrementing totalCorrect again
    updateProgress();
    saveToLocalStorage();
}

function retryIncorrect() {
    if (incorrectWords.length > 0) {
        words = [...incorrectWords];
        incorrectWords = [];
        currentIndex = 0; // Start from the first incorrect word
        loadQuestion();
        updateProgress();
        saveToLocalStorage();
    }
}

// Enhance the restart function with better error handling
function restartWithWrongAnswers() {
    if (localStorage.getItem('quizletSessionIncorrect')) {
        try {
            const sessionIncorrect = JSON.parse(localStorage.getItem('quizletSessionIncorrect'));
            if (sessionIncorrect && Array.isArray(sessionIncorrect) && sessionIncorrect.length > 0) {
                words = [...sessionIncorrect];
                incorrectWords = [];
                completed = 0;
                
                document.getElementById("questionCard").style.display = "block";
                document.getElementById("restartWithWrongBtn").style.display = "none";
                
                updateProgress();
                loadQuestion();
                saveToLocalStorage();
                
                // Clear the session incorrect list after restarting
                localStorage.removeItem('quizletSessionIncorrect');
            } else {
                console.log("No incorrect answers to restart with");
            }
        } catch (e) {
            console.error("Error parsing session incorrect data", e);
            localStorage.removeItem('quizletSessionIncorrect');
        }
    }
}

// Also update the resetQuiz function to reset the totalCorrect counter
async function resetQuiz() {
    const confirmed = await showConfirm("Are you sure you want to reset the quiz? All progress will be lost.", "Reset Quiz");
    
    if (confirmed) {
        // Clear all state
        words = [];
        incorrectWords = [];
        originalWordsList = [];
        roundWrongAnswers = [];
        wrongAnswers.clear();
        correctAnswers.clear();
        
        // Reset counters
        completed = 0;
        totalCorrect = 0;
        currentRound = 1;
        currentIndex = 0;
        
        // Clear localStorage
        localStorage.removeItem('quizletWords');
        localStorage.removeItem('quizletIncorrect');
        localStorage.removeItem('quizletCompleted');
        localStorage.removeItem('quizletScore');
        localStorage.removeItem('quizletSessionIncorrect');
        localStorage.removeItem('quizletRoundWrong');
        localStorage.removeItem('quizletOriginalList');
        localStorage.removeItem('quizletTotalCorrect');
        
        // Reset UI
        document.getElementById('importSection').classList.remove('hidden');
        document.getElementById('quizSection').style.display = 'none';
        document.getElementById('restartWithWrongBtn').style.display = 'none';
        document.getElementById('fileInput').value = '';
        
        // Clear progress bar
        document.getElementById("progress").style.width = "0%";
        document.getElementById("progressText").innerText = "0/0 completed";
        
        console.log("Quiz reset completed");
        ToastSystem.show("Quiz reset completed", "info");
    }
}

function addQuestionCounterStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        #questionCounter {
            margin-left: 15px;
            font-weight: bold;
            color: #4a90e2;
        }
        .dark-mode #questionCounter {
            color: #64b5f6;
        }
    `;
    document.head.appendChild(styleElement);
}

// Fix the loadQuestion function to properly handle empty state
function loadQuestion() {
    const questionCard = document.getElementById("questionCard");
    const prompt = document.getElementById("prompt");
    const hint = document.getElementById("hint");
    const answer = document.getElementById("answer");
    const feedback = document.getElementById("feedback");
    const submitBtn = document.getElementById("submitBtn");

    // Check if all required elements exist
    if (!questionCard || !prompt || !hint || !answer || !feedback) {
        console.error("One or more required elements not found in loadQuestion");
        return;
    }

    // Check if we have words left
    if (words.length === 0) {
        finishRound();
        return;
    }

    // Fix for index out of bounds
    if (currentIndex >= words.length) {
        currentIndex = 0;
    }

    // Show question card
    questionCard.style.display = "block";
    
    // Hide round summary if it exists
    const roundSummary = document.getElementById('roundSummary');
    if (roundSummary) roundSummary.style.display = "none";

    // Set question content
    const currentTerm = words[currentIndex];
    
    if (!currentTerm) {
        console.error("Current term is undefined at index", currentIndex);
        console.log("Available words:", words);
        return;
    }
    
    console.log(`Loading term: ${currentTerm.term}, definition: ${currentTerm.definition}`);
    
    prompt.innerText = currentTerm.definition || "No definition available";
    hint.innerText = currentTerm.hint || 
        (currentTerm.term.charAt(0) + "______");
    hint.classList.remove("visible");
    
    // Reset input and UI state
    answer.value = "";
    answer.disabled = false;
    feedback.innerText = "";
    
    // Reset button states and handlers
    submitBtn.innerHTML = 'Submit';
    submitBtn.onclick = checkAnswer;
    submitBtn.style.display = "inline-block";
    
    document.getElementById("nextBtn").style.display = "none";
    document.getElementById("skipBtn").style.display = "inline-block";
    document.getElementById("overrideBtn").style.display = "none";
    
    answer.focus();
    updateProgress();
    saveToLocalStorage();
}

// Fix skipQuestion function - it was missing
function skipQuestion() {
    const currentTerm = words[currentIndex];
    markWrong(currentTerm);
    
    const feedback = document.getElementById('feedback');
    const answerInput = document.getElementById('answer');
    const submitBtn = document.getElementById('submitBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    feedback.innerHTML = `<span class="incorrect">Skipped. The answer was: ${currentTerm.term}</span>`;
    answerInput.disabled = true;
    submitBtn.style.display = 'none';
    nextBtn.style.display = 'inline-block';
    
    saveToLocalStorage();
}