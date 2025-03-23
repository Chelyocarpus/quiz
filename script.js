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

// Add the toggleFormatHelp function
function toggleFormatHelp() {
    const examples = document.getElementById('formatExamples');
    const button = document.querySelector('.info-button');
    
    if (examples.style.display === 'none') {
        examples.style.display = 'block';
        button.textContent = '❌ Hide Format Examples';
    } else {
        examples.style.display = 'none';
        button.textContent = 'ℹ️ Show Format Examples';
    }
}

// Set up event listeners when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Clear URL parameters on page load/refresh
    if (window.location.search) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }

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
    
    // Check for active session and update continue button
    updateContinueSessionButton();

    // Check if there's a shared set in the URL
    checkForSharedSet();
    
    // Add keyboard shortcuts for term creation
    document.addEventListener('keydown', function(e) {
        // Alt+N for new term (when in create tab)
        if (e.altKey && e.key === 'n' && document.getElementById('create-tab').classList.contains('active')) {
            e.preventDefault();
            document.getElementById('termInput').focus();
        }

        // Tab between inputs in create form
        if (e.key === 'Tab' && document.activeElement.matches('#termInput, #definitionInput, #hintInput')) {
            const inputs = ['termInput', 'definitionInput', 'hintInput'];
            const currentIndex = inputs.indexOf(document.activeElement.id);
            if (currentIndex === 2 && !e.shiftKey) {
                e.preventDefault();
                addTerm();
            }
        }
    });

    // Auto-save created terms every minute
    setInterval(() => {
        if (createdTerms.length > 0) {
            localStorage.setItem('quizletCreatedTermsDraft', JSON.stringify(createdTerms));
        }
    }, 60000);

    // Load auto-saved draft if exists
    const savedDraft = localStorage.getItem('quizletCreatedTermsDraft');
    if (savedDraft && !localStorage.getItem('quizletCreatedTerms')) {
        createdTerms = JSON.parse(savedDraft);
        updateTermsList();
        ToastSystem.show('Restored unsaved terms from last session', 'info');
    }
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
    const addButton = document.querySelector('button[onclick="addTerm()"]');
    const isEditing = addButton?.dataset.isEditing === 'true';
    const editIndex = document.getElementById('termInput').dataset.editIndex;
    
    if (term && definition) {
        const newTerm = {
            term: term,
            definition: definition,
            hint: hint || generateHint(term)
        };

        if (isEditing && editIndex) {
            // Update existing term
            createdTerms[editIndex] = newTerm;
            
            // Reset edit mode
            addButton.innerHTML = '➕ Add Term';
            addButton.dataset.isEditing = 'false';
            delete document.getElementById('termInput').dataset.editIndex;
        } else {
            // Add new term
            createdTerms.push(newTerm);
        }
        
        // Clear input fields
        document.getElementById('termInput').value = '';
        document.getElementById('definitionInput').value = '';
        document.getElementById('hintInput').value = '';
        
        // Focus back on term input for quick entry
        document.getElementById('termInput').focus();
        
        // Update the terms list and save
        updateTermsList();
        localStorage.setItem('quizletCreatedTerms', JSON.stringify(createdTerms));
        
        // Show appropriate toast message
        ToastSystem.show(isEditing ? 'Term updated successfully!' : 'Term added successfully!', 'success');
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
    
    // Store the index being edited
    document.getElementById('termInput').dataset.editIndex = index;
    
    // Change the add button text to indicate edit mode
    const addButton = document.querySelector('button[onclick="addTerm()"]');
    if (addButton) {
        addButton.innerHTML = '💾 Save Changes';
        addButton.dataset.isEditing = 'true';
    }
    
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
        // Load the data into memory but don't start the quiz
        words = JSON.parse(savedWords);
        incorrectWords = savedIncorrect ? JSON.parse(savedIncorrect) : [];
        originalWordsList = savedOriginalList ? JSON.parse(savedOriginalList) : [...words];
        completed = savedCompleted ? parseInt(savedCompleted) : 0;
        currentRound = savedRound ? parseInt(savedRound) : 1;
        totalCorrect = savedTotalCorrect ? parseInt(savedTotalCorrect) : 0;
        
        // Only update the continue button state
        updateContinueSessionButton();
    }
}