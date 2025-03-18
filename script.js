let words = [];
let incorrectWords = [];
let currentIndex = 0;
let completed = 0;
let isDarkMode = false;
let createdTerms = [];
let wrongAnswers = new Set();
let correctAnswers = new Set();
let currentRound = 1;
let roundWrongAnswers = [];
let originalWordsList = [];
let isSequentialMode = true; // Set to true for sequential mode

// Add a totalCorrect counter to track correct answers across rounds
let totalCorrect = 0;

// Add the missing function near the top of the file, after the global variables
function showQuizSection() {
    const importSection = document.getElementById('importSection');
    const quizSection = document.getElementById('quizSection');
    const roundSummary = document.getElementById('roundSummary');
    
    if (importSection) {
        importSection.classList.add('hidden');
    }
    
    if (quizSection) {
        quizSection.style.display = 'block';
        
        // Reset round summary if it exists
        if (roundSummary) {
            roundSummary.style.display = 'none';
        }
        
        // Reset UI elements
        const elements = {
            answerInput: document.getElementById('answer'),
            submitBtn: document.getElementById('submitBtn'),
            nextBtn: document.getElementById('nextBtn'),
            skipBtn: document.getElementById('skipBtn'),
            feedback: document.getElementById('feedback'),
            overrideBtn: document.getElementById('overrideBtn')
        };
        
        // Reset input and buttons to initial state
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
}

// Add missing nextQuestion function
function nextQuestion() {
    // Check if there are questions left
    if (words.length === 0) {
        finishRound();
        return;
    }
    
    // For sequential mode, we need to increment the index
    if (isSequentialMode) {
        // If we're at the end of the list, show the round summary
        if (currentIndex >= words.length - 1) {
            finishRound();
            return;
        } else {
            // Otherwise move to the next question
            currentIndex++;
        }
    } else {
        // For random mode (fallback)
        currentIndex = Math.floor(Math.random() * words.length);
    }
    
    console.log(`Moving to question at index ${currentIndex} of ${words.length} remaining questions`);
    
    // Reset UI for next question
    const elements = {
        submitBtn: document.getElementById('submitBtn'),
        nextBtn: document.getElementById('nextBtn'),
        skipBtn: document.getElementById('skipBtn'),
        overrideBtn: document.getElementById('overrideBtn'),
        answerInput: document.getElementById('answer'),
        feedback: document.getElementById('feedback')
    };
    
    if (elements.feedback) elements.feedback.innerHTML = '';
    if (elements.answerInput) {
        elements.answerInput.value = '';
        elements.answerInput.disabled = false;
        elements.answerInput.focus();
    }
    if (elements.submitBtn) elements.submitBtn.style.display = 'inline-block';
    if (elements.nextBtn) elements.nextBtn.style.display = 'none';
    if (elements.skipBtn) elements.skipBtn.style.display = 'inline-block';
    if (elements.overrideBtn) elements.overrideBtn.style.display = 'none';
    
    loadQuestion();
}

// Add the missing showHint function
function showHint() {
    const hint = document.getElementById('hint');
    if (hint) {
        hint.classList.toggle('visible');
    }
}

// Set up event listeners when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check for saved words in local storage
    loadFromLocalStorage();
    
    // Set up file input listener
    document.getElementById('fileInput').addEventListener('change', importWords);
    
    // Set up enter key for submission in answer field
    document.getElementById('answer').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
    
    // Setup enter key for adding terms
    document.getElementById('hintInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTerm();
        }
    });
    
    // Set up keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Only process shortcuts when quiz section is visible
        const quizSection = document.getElementById('quizSection');
        const isQuizActive = quizSection && quizSection.style.display !== 'none';
        
        // Global shortcuts (work regardless of current view)
        if (e.key === 'Escape') {
            // Close any open modal dialog
            if (document.getElementById('modalOverlay').classList.contains('active')) {
                DialogSystem.close(false);
                e.preventDefault();
            }
            // Hide hint if visible
            const hint = document.getElementById('hint');
            if (hint && hint.classList.contains('visible')) {
                hint.classList.remove('visible');
                e.preventDefault();
            }
            return;
        }
        
        // Quiz-specific shortcuts
        if (isQuizActive) {
            // Alt+H to show/hide hint
            if (e.altKey && (e.key === 'h' || e.key === 'H')) {
                e.preventDefault();
                showHint();
            } 
            // Ctrl+Space to skip question
            else if (e.ctrlKey && e.key === ' ') {
                e.preventDefault();
                // Only if skip button is visible
                const skipBtn = document.getElementById('skipBtn');
                if (skipBtn && skipBtn.style.display !== 'none') {
                    skipQuestion();
                }
            }
            // Alt+N for next question
            else if (e.altKey && (e.key === 'n' || e.key === 'N')) {
                e.preventDefault();
                // Only if next button is visible
                const nextBtn = document.getElementById('nextBtn');
                if (nextBtn && nextBtn.style.display !== 'none') {
                    nextQuestion();
                }
            }
            // Alt+R to retry incorrect words
            else if (e.altKey && (e.key === 'r' || e.key === 'R')) {
                e.preventDefault();
                // Only if retry button is visible
                const retryBtn = document.getElementById('retryBtn');
                if (retryBtn && retryBtn.style.display !== 'none') {
                    retryIncorrect();
                }
            }
        }
        
        // Create tab shortcuts
        if (document.getElementById('create-tab') && 
            document.getElementById('create-tab').classList.contains('active')) {
            // Ctrl+Enter to add a new term
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                addTerm();
            }
        }
    });
    
    // Handle Enter key for next question
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const nextBtn = document.getElementById('nextBtn');
            const submitBtn = document.getElementById('submitBtn');
            
            // Only allow Enter to trigger next question when next button is visible
            if (nextBtn && nextBtn.style.display !== 'none') {
                e.preventDefault(); // Prevent form submission
                nextQuestion();
            } 
            // Don't allow Enter to submit when input is disabled
            else if (submitBtn && document.getElementById('answer').disabled) {
                e.preventDefault();
            }
        }
    });
    
    // Set up dark mode toggle
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
    
    // Check if user prefers dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        toggleDarkMode();
    }
    
    // Check stored preference
    if (localStorage.getItem('darkMode') === 'true') {
        toggleDarkMode();
    }
    
    // Check for saved created terms
    const savedCreatedTerms = localStorage.getItem('quizletCreatedTerms');
    if (savedCreatedTerms) {
        createdTerms = JSON.parse(savedCreatedTerms);
        updateTermsList();
    }

    addQuestionCounterStyles();
});

function switchTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Deactivate all tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show the selected tab content
    document.getElementById(tabId).classList.add('active');
    
    // Activate the clicked tab button
    const buttons = document.querySelectorAll('.tab-button');
    const index = ['import-tab', 'create-tab', 'samples-tab', 'saved-sets-tab'].indexOf(tabId);
    if (index >= 0 && index < buttons.length) {
        buttons[index].classList.add('active');
    }
    
    // Load saved sets if that tab is selected
    if (tabId === 'saved-sets-tab') {
        loadSavedSets();
    }
}

async function addTerm() {
    const term = document.getElementById('termInput').value.trim();
    const definition = document.getElementById('definitionInput').value.trim();
    const hint = document.getElementById('hintInput').value.trim();
    
    if (term && definition) {
        createdTerms.push({
            term: term,
            definition: definition,
            hint: hint || generateHint(term)
        });
        
        // Clear input fields
        document.getElementById('termInput').value = '';
        document.getElementById('definitionInput').value = '';
        document.getElementById('hintInput').value = '';
        
        // Focus back on term input for quick entry
        document.getElementById('termInput').focus();
        
        // Update the terms list and save
        updateTermsList();
        localStorage.setItem('quizletCreatedTerms', JSON.stringify(createdTerms));
        
        // Show toast instead of alert
        ToastSystem.show('Term added successfully!', 'success');
    } else {
        await showAlert('Please enter both a term and a definition.', 'Missing Information');
    }
}

function generateHint(term) {
    // Basic hint generator: first letter + underscores + last letter if term is long enough
    if (term.length <= 2) return term[0] + '_';
    
    let hint = term[0];
    for (let i = 1; i < term.length - 1; i++) {
        hint += '_';
    }
    if (term.length > 3) hint += term[term.length - 1];
    return hint;
}

function updateTermsList() {
    const termsList = document.getElementById('termsList');
    const startButton = document.getElementById('startCreatedSetBtn');
    
    if (createdTerms.length === 0) {
        termsList.innerHTML = '<p id="noTermsMessage">No terms added yet.</p>';
        startButton.disabled = true;
        return;
    }
    
    startButton.disabled = false;
    
    let html = '';
    createdTerms.forEach((item, index) => {
        html += `
        <div class="term-item">
            <div class="term-content">
                <strong>${item.term}</strong>: ${item.definition}
            </div>
            <div class="term-actions">
                <button onclick="editTerm(${index})">✏️</button>
                <button onclick="deleteTerm(${index})">❌</button>
            </div>
        </div>`;
    });
    
    termsList.innerHTML = html;
}

// Fix the editTerm function - remove the double dot
function editTerm(index) {
    const term = createdTerms[index];
    
    document.getElementById('termInput').value = term.term;
    document.getElementById('definitionInput').value = term.definition;
    document.getElementById('hintInput').value = term.hint || '';
    
    // Delete the term after loading into input fields
    createdTerms.splice(index, 1);
    updateTermsList();
    localStorage.setItem('quizletCreatedTerms', JSON.stringify(createdTerms));
    
    // Focus on the term input for editing
    document.getElementById('termInput').focus();
}

async function deleteTerm(index) {
    const confirmed = await showConfirm('Are you sure you want to delete this term?', 'Delete Term');
    
    if (confirmed) {
        createdTerms.splice(index, 1);
        updateTermsList();
        localStorage.setItem('quizletCreatedTerms', JSON.stringify(createdTerms));
        ToastSystem.show('Term deleted', 'info');
    }
}

async function clearTerms() {
    if (createdTerms.length === 0) return;
    
    const confirmed = await showConfirm('Are you sure you want to clear all terms?', 'Clear All Terms');
    
    if (confirmed) {
        createdTerms = [];
        updateTermsList();
        localStorage.setItem('quizletCreatedTerms', JSON.stringify(createdTerms));
        ToastSystem.show('All terms cleared', 'info');
    }
}

function startWithCreatedSet() {
    if (createdTerms.length === 0) {
        alert('Please add at least one term before starting.');
        return;
    }
    
    // Clear previous state
    words = createdTerms.map(term => ({...term, correct: false}));
    originalWordsList = [...words];
    incorrectWords = [];
    roundWrongAnswers = [];
    wrongAnswers.clear();
    correctAnswers.clear();
    
    // Reset counters
    completed = 0;
    totalCorrect = 0;
    currentRound = 1;
    currentIndex = 0;
    
    showQuizSection();
    updateProgress();
    loadQuestion();
    saveToLocalStorage();
    
    console.log(`Started new quiz with ${words.length} terms`);
}

function createSampleSet(type = 'programming') {
    switch(type) {
        case 'programming':
            words = [
                {term: "algorithm", definition: "A process or set of rules to be followed in calculations or other problem-solving operations", hint: "a________m"},
                {term: "variable", definition: "A symbolic name associated with a value that can change", hint: "v_______e"},
                {term: "function", definition: "A block of organized, reusable code used to perform a single action", hint: "f______n"},
                {term: "iteration", definition: "The repetition of a process in order to generate a sequence of outcomes", hint: "i______n"},
                {term: "recursion", definition: "A method where the solution depends on solutions to smaller instances of the same problem", hint: "r______n"}
            ];
            break;
        case 'geography':
            words = [
                {term: "continent", definition: "One of the main landmasses on Earth", hint: "c________t"},
                {term: "peninsula", definition: "A piece of land surrounded by water on three sides", hint: "p_______a"},
                {term: "archipelago", definition: "A group of islands", hint: "a_________o"},
                {term: "isthmus", definition: "A narrow strip of land connecting two larger land areas", hint: "i_____s"},
                {term: "plateau", definition: "An area of relatively level high ground", hint: "p_____u"}
            ];
            break;
        case 'science':
            words = [
                {term: "photosynthesis", definition: "Process by which plants convert light energy into chemical energy", hint: "p_____________s"},
                {term: "mitochondria", definition: "The powerhouse of the cell", hint: "m__________a"},
                {term: "gravity", definition: "The force that attracts objects toward one another", hint: "g_____y"},
                {term: "atom", definition: "The basic unit of a chemical element", hint: "a__m"},
                {term: "ecosystem", definition: "A biological community of interacting organisms and their physical environment", hint: "e_______m"}
            ];
            break;
        default:
            return;
    }
    
    const quizSection = document.getElementById('quizSection');
    if (!quizSection) {
        console.error("Quiz section not found");
        return;
    }

    originalWordsList = words.map(word => ({...word, correct: false}));
    words = [...originalWordsList];
    incorrectWords = [];
    roundWrongAnswers = [];
    wrongAnswers.clear();
    correctAnswers.clear();
    
    // Reset counters
    completed = 0;
    totalCorrect = 0;
    currentRound = 1;
    currentIndex = 0;
    
    showQuizSection();
    updateProgress();
    // Only load question if quiz section is visible
    if (quizSection.style.display === 'block') {
        loadQuestion();
    }
    saveToLocalStorage();
    
    console.log(`Created sample set with ${words.length} terms`);
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.getElementById('darkModeToggle').textContent = isDarkMode ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDarkMode);
}

// Update the loadFromLocalStorage function to load the totalCorrect value
function loadFromLocalStorage() {
    const savedWords = localStorage.getItem('quizletWords');
    const savedIncorrect = localStorage.getItem('quizletIncorrect');
    const savedOriginalList = localStorage.getItem('quizletOriginalList');
    const savedCompleted = localStorage.getItem('quizletCompleted');
    const savedRound = localStorage.getItem('quizletRound');
    const savedTotalCorrect = localStorage.getItem('quizletTotalCorrect');
    
    if (savedWords) {
        words = JSON.parse(savedWords);
        incorrectWords = savedIncorrect ? JSON.parse(savedIncorrect) : [];
        originalWordsList = savedOriginalList ? JSON.parse(savedOriginalList) : [...words];
        completed = savedCompleted ? parseInt(savedCompleted) : 0;
        currentRound = savedRound ? parseInt(savedRound) : 1;
        totalCorrect = savedTotalCorrect ? parseInt(savedTotalCorrect) : 0;
        
        showQuizSection();
        updateProgress();
        // Only load question if quiz section is visible
        if (document.getElementById('quizSection').style.display === 'block') {
            loadQuestion();
        }
    }
}

// Update the saveToLocalStorage function to save the totalCorrect value
function saveToLocalStorage() {
    localStorage.setItem('quizletWords', JSON.stringify(words));
    localStorage.setItem('quizletIncorrect', JSON.stringify(incorrectWords));
    localStorage.setItem('quizletOriginalList', JSON.stringify(originalWordsList));
    localStorage.setItem('quizletCompleted', completed.toString());
    localStorage.setItem('quizletRound', currentRound.toString());
    localStorage.setItem('quizletRoundWrong', JSON.stringify(roundWrongAnswers));
    localStorage.setItem('quizletTotalCorrect', totalCorrect.toString());
}

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

// Import words function - missing implementation
function importWords(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const contents = e.target.result;
            const lines = contents.split('\n');
            words = [];
            
            lines.forEach(line => {
                const parts = line.split('\t');
                if (parts.length >= 2) {
                    const term = parts[0].trim();
                    const definition = parts[1].trim();
                    const hint = parts[2] ? parts[2].trim() : generateHint(term);
                    
                    if (term && definition) {
                        words.push({
                            term: term,
                            definition: definition,
                            hint: hint
                        });
                    }
                }
            });
            
            if (words.length > 0) {
                originalWordsList = [...words];
                incorrectWords = [];
                roundWrongAnswers = [];
                completed = 0;
                totalCorrect = 0;
                currentRound = 1;
                currentIndex = 0;
                
                showQuizSection();
                updateProgress();
                loadQuestion();
                saveToLocalStorage();
            } else {
                alert('No valid terms found in the file.');
            }
        } catch (error) {
            console.error('Error parsing file:', error);
            alert('Error parsing file. Please check the format.');
        }
    };
    
    reader.readAsText(file);
}

function createRoundSummaryElement() {
    const summaryDiv = document.createElement('div');
    summaryDiv.id = 'roundSummary';
    summaryDiv.className = 'round-summary';
    summaryDiv.style.display = 'none';
    
    const quizSection = document.getElementById('quizSection');
    const questionCard = document.getElementById('questionCard');
    
    if (quizSection && questionCard) {
        quizSection.insertBefore(summaryDiv, questionCard);
    }
    
    // Add styles
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .round-summary {
            background-color: #f9f9f9;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }
        .dark-mode .round-summary {
            background-color: #2d2d2d;
            color: #e0e0e0;
        }
        .round-summary h2 {
            margin-top: 0;
            color: #4a90e2;
        }
        .dark-mode .round-summary h2 {
            color: #64b5f6;
        }
        .round-summary .stats {
            margin: 15px 0;
            font-size: 18px;
        }
        .round-summary .buttons {
            margin-top: 20px;
        }
        .round-summary button {
            margin: 0 10px;
        }
    `;
    document.head.appendChild(styleElement);
    
    return summaryDiv;
}

// Add these functions after the existing createSampleSet function

async function saveCurrentSet() {
    if (createdTerms.length === 0) {
        await showAlert('Please add at least one term before saving.', 'No Terms');
        return;
    }
    
    const setName = await showPrompt('Enter a name for this set:', '', 'Save Study Set');
    if (!setName) return; // User cancelled
    
    // Get existing saved sets or initialize empty object
    const savedSets = JSON.parse(localStorage.getItem('quizletSavedSets') || '{}');
    
    // Save the set with timestamp
    savedSets[setName] = {
        terms: createdTerms,
        timestamp: new Date().toISOString()
    };
    
    // Update localStorage
    localStorage.setItem('quizletSavedSets', JSON.stringify(savedSets));
    ToastSystem.show(`Set "${setName}" saved successfully!`, 'success');
    
    // Refresh the saved sets list if visible
    if (document.getElementById('saved-sets-tab').classList.contains('active')) {
        loadSavedSets();
    }
}

function exportCreatedSet() {
    if (createdTerms.length === 0) {
        alert('Please add at least one term before exporting.');
        return;
    }
    
    // Create a JSON string from the created terms
    const jsonContent = JSON.stringify(createdTerms, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create and click a download link
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quizlet_set_' + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

function loadSavedSets() {
    const savedSetsContainer = document.getElementById('savedSetsList');
    if (!savedSetsContainer) return;
    
    // Get saved sets from localStorage
    const savedSets = JSON.parse(localStorage.getItem('quizletSavedSets') || '{}');
    
    if (Object.keys(savedSets).length === 0) {
        savedSetsContainer.innerHTML = '<p>No saved sets found. Create and save a set first.</p>';
        return;
    }
    
    // Create HTML for each saved set
    let html = '';
    for (const [name, data] of Object.entries(savedSets)) {
        const termCount = data.terms.length;
        const date = new Date(data.timestamp).toLocaleDateString();
        
        html += `
        <div class="saved-set-item">
            <div class="saved-set-info">
                <h4>${name}</h4>
                <p>${termCount} terms · Saved on ${date}</p>
            </div>
            <div class="saved-set-actions">
                <button onclick="loadSavedSet('${name}')" class="button button-small">Load</button>
                <button onclick="exportSavedSet('${name}')" class="button button-small">Export</button>
                <button onclick="deleteSavedSet('${name}')" class="button button-small button-danger">Delete</button>
            </div>
        </div>`;
    }
    
    savedSetsContainer.innerHTML = html;
}

async function loadSavedSet(name) {
    const savedSets = JSON.parse(localStorage.getItem('quizletSavedSets') || '{}');
    if (!savedSets[name]) {
        await showAlert('Set not found!', 'Error');
        return;
    }
    
    // Load the terms into createdTerms
    createdTerms = [...savedSets[name].terms];
    updateTermsList();
    
    // Switch to the create tab
    switchTab('create-tab');
    
    ToastSystem.show(`Loaded set "${name}" with ${createdTerms.length} terms.`, 'success');
}

async function exportSavedSet(name) {
    const savedSets = JSON.parse(localStorage.getItem('quizletSavedSets') || '{}');
    if (!savedSets[name]) {
        await showAlert('Set not found!', 'Error');
        return;
    }
    
    // Create a JSON string from the saved terms
    const jsonContent = JSON.stringify(savedSets[name].terms, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create and click a download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `quizlet_set_${name.replace(/[^a-z0-9]/gi, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
    
    ToastSystem.show(`Set "${name}" exported successfully!`, 'success');
}

async function deleteSavedSet(name) {
    const confirmed = await showConfirm(`Are you sure you want to delete the set "${name}"?`, 'Delete Set');
    
    if (!confirmed) {
        return;
    }
    
    const savedSets = JSON.parse(localStorage.getItem('quizletSavedSets') || '{}');
    if (savedSets[name]) {
        delete savedSets[name];
        localStorage.setItem('quizletSavedSets', JSON.stringify(savedSets));
        loadSavedSets(); // Refresh the list
        ToastSystem.show(`Set "${name}" deleted.`, 'info');
    }
}

// Custom dialog system
const DialogSystem = {
    // Modal elements cache
    elements: null,
    
    // Current callbacks
    resolvePromise: null,
    rejectPromise: null,
    
    // Initialize dialog elements
    init() {
        if (this.elements) return;
        
        this.elements = {
            overlay: document.getElementById('modalOverlay'),
            dialog: document.getElementById('modalDialog'),
            title: document.getElementById('modalTitle'),
            message: document.getElementById('modalMessage'),
            input: document.getElementById('modalInput'),
            cancelBtn: document.getElementById('modalCancelBtn'),
            confirmBtn: document.getElementById('modalConfirmBtn')
        };
        
        // Close on overlay click
        this.elements.overlay.addEventListener('click', (e) => {
            if (e.target === this.elements.overlay) {
                this.close(false);
            }
        });
        
        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.overlay.classList.contains('active')) {
                this.close(false);
            }
        });
    },
    
    // Show alert dialog
    alert(message, title = 'Alert') {
        return new Promise((resolve) => {
            this.init();
            this.resolvePromise = resolve;
            
            this.elements.title.textContent = title;
            this.elements.message.textContent = message;
            this.elements.input.style.display = 'none';
            this.elements.cancelBtn.style.display = 'none';
            this.elements.confirmBtn.textContent = 'OK';
            
            this.elements.confirmBtn.onclick = () => this.close(true);
            
            this.open();
        });
    },
    
    // Show confirm dialog
    confirm(message, title = 'Confirm') {
        return new Promise((resolve) => {
            this.init();
            this.resolvePromise = resolve;
            
            this.elements.title.textContent = title;
            this.elements.message.textContent = message;
            this.elements.input.style.display = 'none';
            this.elements.cancelBtn.style.display = 'inline-block';
            this.elements.cancelBtn.textContent = 'Cancel';
            this.elements.confirmBtn.textContent = 'OK';
            
            this.elements.cancelBtn.onclick = () => this.close(false);
            this.elements.confirmBtn.onclick = () => this.close(true);
            
            this.open();
        });
    },
    
    // Show prompt dialog
    prompt(message, defaultValue = '', title = 'Input Required') {
        return new Promise((resolve) => {
            this.init();
            this.resolvePromise = resolve;
            
            this.elements.title.textContent = title;
            this.elements.message.textContent = message;
            this.elements.input.style.display = 'block';
            this.elements.input.value = defaultValue;
            this.elements.cancelBtn.style.display = 'inline-block';
            this.elements.cancelBtn.textContent = 'Cancel';
            this.elements.confirmBtn.textContent = 'OK';
            
            this.elements.cancelBtn.onclick = () => this.close(null);
            this.elements.confirmBtn.onclick = () => this.close(this.elements.input.value);
            
            this.elements.input.onkeypress = (e) => {
                if (e.key === 'Enter') {
                    this.close(this.elements.input.value);
                }
            };
            
            this.open();
            
            // Focus input after animation completes
            setTimeout(() => {
                this.elements.input.focus();
            }, 300);
        });
    },
    
    // Open dialog
    open() {
        this.init();
        this.elements.overlay.classList.add('active');
    },
    
    // Close dialog with result
    close(result) {
        if (!this.elements || !this.elements.overlay.classList.contains('active')) return;
        
        this.elements.overlay.classList.remove('active');
        
        if (this.resolvePromise) {
            setTimeout(() => {
                this.resolvePromise(result);
                this.resolvePromise = null;
            }, 300); // Match transition time
        }
    }
};

// Toast notification system
const ToastSystem = {
    show(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toastContainer');
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Set content
        toast.innerHTML = `<div class="toast-message">${message}</div>`;
        
        // Add to container
        container.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('visible'), 10);
        
        // Remove after duration
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => container.removeChild(toast), 300);
        }, duration);
    }
};

// Replace existing alert function
async function showAlert(message, title = 'Alert') {
    await DialogSystem.alert(message, title);
}

// Replace existing confirm function
async function showConfirm(message, title = 'Confirm') {
    return await DialogSystem.confirm(message, title);
}

// Replace existing prompt function
async function showPrompt(message, defaultValue = '', title = 'Input Required') {
    return await DialogSystem.prompt(message, defaultValue, title);
}
