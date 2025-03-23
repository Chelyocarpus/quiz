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

// Import words function - missing implementation
function importWords(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const contents = e.target.result;
            let parsedTerms = [];
            
            // Try to parse as JSON first
            try {
                // Parse the JSON content
                const jsonData = JSON.parse(contents);
                
                if (Array.isArray(jsonData) && jsonData.length > 0) {
                    // Process JSON array format
                    parsedTerms = jsonData.map(item => ({
                        term: item.term || '',
                        definition: item.definition || '',
                        hint: item.hint || generateHint(item.term || '')
                    }));
                } else {
                    throw new Error("Invalid JSON format");
                }
            } catch (jsonError) {
                console.log("Not valid JSON, trying tab-delimited format");
                
                // Fallback to tab-delimited format
                const lines = contents.split('\n');
                parsedTerms = [];
                
                lines.forEach(line => {
                    const parts = line.split('\t');
                    if (parts.length >= 2) {
                        const term = parts[0].trim();
                        const definition = parts[1].trim();
                        const hint = parts[2] ? parts[2].trim() : generateHint(term);
                        
                        if (term && definition) {
                            parsedTerms.push({
                                term: term,
                                definition: definition,
                                hint: hint
                            });
                        }
                    }
                });
            }
            
            if (parsedTerms.length > 0) {
                // Ask user if they want to save the imported terms
                showImportOptions(parsedTerms);
            } else {
                showAlert('No valid terms found in the file. Please check the format.', 'Import Error');
            }
        } catch (error) {
            console.error('Error parsing file:', error);
            showAlert('Error parsing file: ' + error.message, 'Import Error');
        }
    };
    
    reader.readAsText(file);
}

// Add a new function to handle import options
async function showImportOptions(parsedTerms) {
    const importMessage = `Successfully parsed ${parsedTerms.length} terms. What would you like to do?`;
    
    // Create custom buttons for the dialog
    DialogSystem.elements = DialogSystem.elements || DialogSystem.init();
    
    // Show dialog with multiple options
    DialogSystem.elements.title.textContent = 'Import Successful';
    DialogSystem.elements.message.textContent = importMessage;
    DialogSystem.elements.input.style.display = 'none';
    DialogSystem.elements.cancelBtn.style.display = 'inline-block';
    DialogSystem.elements.cancelBtn.textContent = 'Cancel';
    DialogSystem.elements.confirmBtn.textContent = 'Start Quiz Now';
    
    // Add a new button for saving to created terms
    const saveButton = document.createElement('button');
    saveButton.className = 'button button-primary';
    saveButton.textContent = 'Save to My Sets';
    saveButton.style.marginRight = '10px';
    
    // Insert the save button before the confirm button
    DialogSystem.elements.confirmBtn.parentNode.insertBefore(
        saveButton, 
        DialogSystem.elements.confirmBtn
    );
    
    // Create a promise to handle the dialog result
    const dialogPromise = new Promise((resolve) => {
        // Set up button actions
        DialogSystem.elements.cancelBtn.onclick = () => {
            resolve('cancel');
            DialogSystem.elements.overlay.classList.remove('active');
            // Remove the extra button
            saveButton.remove();
        };
        
        DialogSystem.elements.confirmBtn.onclick = () => {
            resolve('start');
            DialogSystem.elements.overlay.classList.remove('active');
            // Remove the extra button
            saveButton.remove();
        };
        
        saveButton.onclick = () => {
            resolve('save');
            DialogSystem.elements.overlay.classList.remove('active');
            // Remove the extra button
            saveButton.remove();
        };
    });
    
    // Show the dialog
    DialogSystem.elements.overlay.classList.add('active');
    
    // Handle the user's choice
    const choice = await dialogPromise;
    
    switch(choice) {
        case 'start':
            // Start quiz immediately (original behavior)
            words = parsedTerms.map(term => ({...term, correct: false}));
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
            
            ToastSystem.show(`Imported ${words.length} terms successfully!`, 'success');
            break;
            
        case 'save':
            // Save to created terms
            createdTerms = [...parsedTerms];
            updateTermsList();
            localStorage.setItem('quizletCreatedTerms', JSON.stringify(createdTerms));
            
            // Switch to the create tab
            switchTab('create-tab');
            
            ToastSystem.show(`Added ${parsedTerms.length} terms to your set!`, 'success');
            break;
            
        case 'cancel':
            // Do nothing
            ToastSystem.show('Import cancelled', 'info');
            break;
    }
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
    
    const savedSets = JSON.parse(localStorage.getItem('quizletSavedSets') || '{}');
    
    if (Object.keys(savedSets).length === 0) {
        savedSetsContainer.innerHTML = '<p>No saved sets found. Create and save a set first.</p>';
        return;
    }
    
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
                <div class="primary-actions">
                    <button onclick="startStudyingSet('${name}')" class="button button-small button-primary">🚀 Study</button>
                    <button onclick="shareSet('${name}')" class="button button-small button-primary">🔗 Share</button>
                </div>
                <div class="secondary-actions">
                    <button onclick="loadSavedSet('${name}')" class="button button-small">✏️ Edit</button>
                    <button onclick="exportSavedSet('${name}')" class="button button-small">📤 Export</button>
                    <button onclick="deleteSavedSet('${name}')" class="button button-small button-danger">🗑️ Delete</button>
                </div>
            </div>
        </div>`;
    }
    
    savedSetsContainer.innerHTML = html;
}

/**
 * Generate and copy a shareable link for a study set
 * @param {string} name - The name of the set to share
 */
async function shareSet(name) {
    const savedSets = JSON.parse(localStorage.getItem('quizletSavedSets') || '{}');
    if (!savedSets[name]) {
        ToastSystem.show('Set not found!', 'error');
        return;
    }
    
    try {
        // Get the terms from the saved set
        const setData = savedSets[name];
        
        // Create a compact representation for sharing (only necessary fields)
        const shareData = {
            n: name, // shortened field names to reduce size
            t: setData.terms.map(term => ({
                t: term.term,
                d: term.definition,
                h: term.hint
            }))
        };
        
        // Convert to JSON and compress with LZString
        const jsonData = JSON.stringify(shareData);
        const compressedData = LZString.compressToEncodedURIComponent(jsonData);
        
        // Create the shareable URL
        const baseUrl = window.location.href.split('?')[0]; // Remove any existing query params
        const shareUrl = `${baseUrl}?s=${compressedData}`;
        
        // Check if URL is too long (most browsers support at least 2000 characters)
        if (shareUrl.length > 2048) {
            // Show size info in the error dialog
            const sizeKB = Math.round(shareUrl.length / 1024 * 10) / 10;
            throw new Error(`The study set is too large (${sizeKB}KB) to share as a direct link.`);
        }
        
        // Copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        
        // Show success message with URL length info
        ToastSystem.show(`Link copied! URL length: ${shareUrl.length} chars`, 'success');
    } catch (error) {
        console.error('Error generating share link:', error);
        
        if (error.message.includes("too large")) {
            // Offer alternative sharing options in a dialog
            showSharingOptions(name, savedSets[name]);
        } else if (error.name === 'NotAllowedError') {
            // Clipboard write failed (likely permission issue)
            ToastSystem.show('Could not copy link automatically. Please use Export/Import instead.', 'error');
        } else {
            ToastSystem.show('Failed to generate shareable link', 'error');
        }
    }
}

/**
 * Show options for sharing large sets
 * @param {string} name - The name of the set
 * @param {Object} setData - The set data to share
 */
async function showSharingOptions(name, setData) {
    const message = `This set (${setData.terms.length} terms) is too large for a direct share link.
    
You can:
1. Export the set to a file and share that file
2. Try splitting the set into smaller sets
3. Use a file sharing service and share the download link`;

    DialogSystem.elements = DialogSystem.elements || DialogSystem.init();
    
    // Show dialog with multiple options
    DialogSystem.elements.title.textContent = 'Set Too Large To Share';
    DialogSystem.elements.message.textContent = message;
    DialogSystem.elements.input.style.display = 'none';
    DialogSystem.elements.cancelBtn.style.display = 'inline-block';
    DialogSystem.elements.cancelBtn.textContent = 'Cancel';
    DialogSystem.elements.confirmBtn.textContent = 'Export File';
    
    // Create a promise to handle the dialog result
    const dialogPromise = new Promise((resolve) => {
        DialogSystem.elements.cancelBtn.onclick = () => {
            resolve('cancel');
            DialogSystem.elements.overlay.classList.remove('active');
        };
        
        DialogSystem.elements.confirmBtn.onclick = () => {
            resolve('export');
            DialogSystem.elements.overlay.classList.remove('active');
        };
    });
    
    // Show the dialog
    DialogSystem.elements.overlay.classList.add('active');
    
    // Handle the user's choice
    const choice = await dialogPromise;
    
    if (choice === 'export') {
        // Export the set to a file for sharing
        exportSavedSet(name);
    }
}

/**
 * Check for shared set in URL and import if present
 */
function checkForSharedSet() {
    try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const sharedData = urlParams.get('s'); // Only use 's' parameter
        
        if (sharedData) {
            try {
                // Decompress and parse the data
                const decodedData = LZString.decompressFromEncodedURIComponent(sharedData);
                const parsed = JSON.parse(decodedData);
                
                // Convert short field names back to full names
                const shareData = parsed.n && parsed.t ? {
                    name: parsed.n,
                    terms: parsed.t.map(t => ({
                        term: t.t,
                        definition: t.d,
                        hint: t.h
                    }))
                } : parsed;
                
                // Validate the data
                if (shareData.name && Array.isArray(shareData.terms) && shareData.terms.length > 0) {
                    // Clear the URL parameter
                    window.history.replaceState({}, document.title, window.location.pathname);
                    
                    // Show import dialog
                    if (!DialogSystem.elements) DialogSystem.init();
                    showSharedSetDialog(shareData);
                }
                
            } catch (error) {
                console.error('Error parsing shared set:', error);
                ToastSystem.show('Invalid shared link format', 'error');
            }
        }
    } catch (error) {
        console.error('Error checking for shared set:', error);
        ToastSystem.show('Error processing shared link', 'error');
    }
}

async function startStudyingSet(name) {
    const savedSets = JSON.parse(localStorage.getItem('quizletSavedSets') || '{}');
    if (!savedSets[name]) {
        await showAlert('Set not found!', 'Error');
        return;
    }
    
    // Start studying the saved set
    words = savedSets[name].terms.map(term => ({...term, correct: false}));
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
    
    ToastSystem.show(`Started studying "${name}" with ${words.length} terms`, 'success');
}

function updateTermsList() {
    const termsList = document.getElementById('termsList');
    const startButton = document.getElementById('startCreatedSetBtn');
    
    if (createdTerms.length === 0) {
        termsList.innerHTML = '<p id="noTermsMessage">📝 No terms added yet.</p>';
        startButton.disabled = true;
        return;
    }
    
    startButton.disabled = false;
    
    // Clear the list first
    termsList.innerHTML = '';
    
    createdTerms.forEach((item, index) => {
        const termElement = document.createElement('div');
        termElement.className = 'term-item';
        termElement.ondblclick = () => editTerm(index);
        termElement.innerHTML = `
            <div class="term-content">
                <span class="term-number">${index + 1}.</span>
                <div class="term-text">
                    <div class="term-label">Term:</div>
                    <div class="term-value">${item.term}</div>
                    <div class="definition-label">Definition:</div>
                    <div class="definition-value">${item.definition}</div>
                </div>
            </div>
            <div class="term-actions">
                <button onclick="editTerm(${index})" title="Edit (double-click term)">✏️</button>
                <button onclick="deleteTerm(${index})" title="Delete">❌</button>
            </div>`;
        termsList.appendChild(termElement);
    });
}