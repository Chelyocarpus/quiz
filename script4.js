/**
 * Show dialog for importing a shared set
 * @param {Object} shareData - The shared set data
 */
async function showSharedSetDialog(shareData) {
    // Initialize the dialog system first
    if (!DialogSystem.elements) {
        DialogSystem.init();
    }
    
    // Create custom buttons for the dialog
    if (!DialogSystem.elements) {
        console.error("Failed to initialize dialog system");
        // Remove automatic fallback to prevent unwanted imports
        ToastSystem.show('Error showing import dialog.', 'error');
        return;
    }
    
    const setName = shareData.name;
    const termCount = shareData.terms.length;
    
    try {
        // Create a more visually appealing dialog
        DialogSystem.elements.title.textContent = '📥 Shared Set Received';
        
        // Get a sample of terms to show (up to 3), but only show the terms
        const sampleTerms = shareData.terms.slice(0, 3).map(t => 
            `<div class="sample-term">
                <strong>${t.term}</strong>
            </div>`
        ).join('');
        
        const moreTermsText = termCount > 3 ? `<div class="more-terms">+ ${termCount - 3} more terms</div>` : '';
        
        // Create a rich HTML message with set preview
        DialogSystem.elements.message.innerHTML = `
            <div class="shared-set-preview">
                <div class="preview-header">
                    <div class="preview-icon">📚</div>
                    <div class="preview-title">
                        <strong>${setName}</strong>
                        <span>${termCount} terms</span>
                    </div>
                </div>
                <div class="preview-terms">
                    ${sampleTerms}
                    ${moreTermsText}
                </div>
                <div class="preview-options">
                    <p>What would you like to do with this shared set?</p>
                </div>
            </div>
        `;
        
        // Add custom styles just for this dialog
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .shared-set-preview {
                border-radius: 8px;
                overflow: hidden;
                margin: 0 -20px;
            }
            .preview-header {
                display: flex;
                align-items: center;
                padding: 10px 20px;
                background-color: var(--primary-color);
                color: white;
            }
            .preview-icon {
                font-size: 2rem;
                margin-right: 15px;
            }
            .preview-title {
                display: flex;
                flex-direction: column;
            }
            .preview-title strong {
                font-size: 1.2rem;
                margin-bottom: 4px;
            }
            .preview-title span {
                font-size: 0.9rem;
                opacity: 0.9;
            }
            .preview-terms {
                padding: 15px 20px;
                background-color: rgba(0,0,0,0.03);
                max-height: 200px;
                overflow-y: auto;
            }
            .dark-mode .preview-terms {
                background-color: rgba(255,255,255,0.05);
            }
            .sample-term {
                display: flex;
                flex-direction: column;
                padding: 8px 0;
                border-bottom: 1px solid rgba(0,0,0,0.1);
                text-align: left;
            }
            .dark-mode .sample-term {
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            .sample-term:last-child {
                border-bottom: none;
            }
            .sample-term strong {
                margin-bottom: 3px;
            }
            .sample-term span {
                font-size: 0.9rem;
                opacity: 0.8;
            }
            .more-terms {
                text-align: center;
                padding: 5px;
                font-style: italic;
                color: var(--primary-color);
            }
            .preview-options {
                padding: 10px 20px;
            }
            .dialog-buttons {
                display: flex;
                justify-content: space-between;
                width: 100%;
            }
            .modal-dialog {
                animation: bounceIn 0.5s;
            }
            @keyframes bounceIn {
                0% { transform: scale(0.8); opacity: 0; }
                70% { transform: scale(1.05); }
                100% { transform: scale(1); opacity: 1; }
            }
        `;
        
        // Append styles to the document head
        document.head.appendChild(styleElement);
        
        // Hide the default input
        DialogSystem.elements.input.style.display = 'none';

        // Reference to the modal footer (safer than using parentNode)
        const modalFooter = document.getElementsByClassName('modal-footer')[0];
        if (!modalFooter) {
            throw new Error("Modal footer not found");
        }
        
        // Store original buttons for restoring later
        const originalButtons = [...modalFooter.children];
        
        // Save the original button values to restore them later
        const originalCancelText = DialogSystem.elements.cancelBtn.textContent;
        const originalConfirmText = DialogSystem.elements.confirmBtn.textContent;
        
        // Update button styling
        DialogSystem.elements.cancelBtn.style.display = 'inline-block';
        DialogSystem.elements.cancelBtn.textContent = '❌ Close';
        DialogSystem.elements.cancelBtn.className = 'button button-secondary';
        
        DialogSystem.elements.confirmBtn.textContent = '🚀 Study Now';
        DialogSystem.elements.confirmBtn.className = 'button button-primary';
        
        // Create a new save button
        const saveButton = document.createElement('button');
        saveButton.className = 'button button-primary';
        saveButton.innerHTML = '<span style="margin-right:4px;">💾</span> Save Set';
        saveButton.style.marginRight = '10px';
        
        // Create a custom button container
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'dialog-buttons';
        
        // Create left side of buttons
        const leftButtons = document.createElement('div');
        leftButtons.appendChild(DialogSystem.elements.cancelBtn);
        
        // Create right side of buttons
        const rightButtons = document.createElement('div');
        rightButtons.style.display = 'flex';
        rightButtons.style.gap = '10px';
        rightButtons.appendChild(saveButton);
        rightButtons.appendChild(DialogSystem.elements.confirmBtn);
        
        // Add both sides to the container
        buttonContainer.appendChild(leftButtons);
        buttonContainer.appendChild(rightButtons);
        
        // Clear and replace the footer
        modalFooter.innerHTML = '';
        modalFooter.appendChild(buttonContainer);
        
        // Create a promise to handle the dialog result
        const dialogPromise = new Promise((resolve) => {
            // Set up button actions
            const closeHandler = () => {
                resolve('cancel');
                DialogSystem.elements.overlay.classList.remove('active');
                
                // Cleanup: remove custom styles and restore buttons
                styleElement.remove();
                restoreButtons();
            };
            
            const studyHandler = () => {
                resolve('study');
                DialogSystem.elements.overlay.classList.remove('active');
                
                // Cleanup: remove custom styles and restore buttons
                styleElement.remove();
                restoreButtons();
            };
            
            const saveHandler = () => {
                resolve('save');
                DialogSystem.elements.overlay.classList.remove('active');
                
                // Cleanup: remove custom styles and restore buttons
                styleElement.remove();
                restoreButtons();
            };
            
            // Attach handlers
            DialogSystem.elements.cancelBtn.onclick = closeHandler;
            DialogSystem.elements.confirmBtn.onclick = studyHandler;
            saveButton.onclick = saveHandler;
            
            // Also close on ESC key
            const escapeHandler = (e) => {
                if (e.key === 'Escape' && DialogSystem.elements.overlay.classList.contains('active')) {
                    closeHandler();
                    document.removeEventListener('keydown', escapeHandler);
                }
            };
            document.addEventListener('keydown', escapeHandler);
            
            // Also close when clicking on overlay
            const overlayClickHandler = (e) => {
                if (e.target === DialogSystem.elements.overlay) {
                    closeHandler();
                    DialogSystem.elements.overlay.removeEventListener('click', overlayClickHandler);
                }
            };
            DialogSystem.elements.overlay.addEventListener('click', overlayClickHandler);
            
            // Function to restore original buttons when done
            function restoreButtons() {
                // Reset the footer
                modalFooter.innerHTML = '';
                
                // Re-add original buttons
                originalButtons.forEach(button => {
                    modalFooter.appendChild(button);
                });
                
                // Restore original button properties
                DialogSystem.elements.cancelBtn.textContent = originalCancelText;
                DialogSystem.elements.confirmBtn.textContent = originalConfirmText;
                
                // Reattach to the proper variable references
                DialogSystem.elements.cancelBtn = document.getElementById('modalCancelBtn');
                DialogSystem.elements.confirmBtn = document.getElementById('modalConfirmBtn');
            }
        });
        
        // Show the dialog
        DialogSystem.elements.overlay.classList.add('active');
        
        // Handle the user's choice
        const choice = await dialogPromise;
        
        switch(choice) {
            case 'study':
                // Start studying the shared set immediately
                words = shareData.terms.map(term => ({...term, correct: false}));
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
                
                ToastSystem.show(`Started studying "${shareData.name}" with ${words.length} terms`, 'success');
                break;
                
            case 'save':
                // Save to local storage
                saveSharedSet(shareData);
                break;
                
            case 'cancel':
                // Do nothing
                ToastSystem.show('Shared set import cancelled', 'info');
                break;
        }
    } catch (error) {
        // Remove automatic fallback
        console.error("Error showing shared set dialog:", error);
        ToastSystem.show('Error showing import dialog', 'error');
        
        // Clean up any partial changes
        if (document.head.querySelector('style[data-dialog-temp]')) {
            document.head.querySelector('style[data-dialog-temp]').remove();
        }
        
        // Reset the dialog to prevent further issues
        DialogSystem.init();
    }
}

/**
 * Save a shared set to local storage
 * @param {Object} shareData - The shared set data
 */
function saveSharedSet(shareData) {
    // Get existing saved sets
    const savedSets = JSON.parse(localStorage.getItem('quizletSavedSets') || '{}');
    
    // Check if a set with this name already exists
    let setName = shareData.name;
    if (savedSets[setName]) {
        // Find a unique name by adding a number
        let counter = 1;
        while (savedSets[`${setName} (${counter})`]) {
            counter++;
        }
        setName = `${setName} (${counter})`;
    }
    
    // Add the set to saved sets
    savedSets[setName] = {
        terms: shareData.terms,
        timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('quizletSavedSets', JSON.stringify(savedSets));
    
    // Show success message
    ToastSystem.show(`Saved shared set "${setName}" with ${shareData.terms.length} terms`, 'success');
    
    // If on the saved sets tab, refresh the list
    if (document.getElementById('saved-sets-tab').classList.contains('active')) {
        loadSavedSets();
    }
    
    // Switch to saved sets tab to show the newly added set
    switchTab('saved-sets-tab');
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
    a.download = `quiz_set_${name.replace(/[^a-z0-9]/gi, '_')}.json`;
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

/**
 * Reset the application to the overview/main menu
 */
function resetToOverview() {
    // Only perform the reset if we're currently in quiz mode
    const quizSection = document.getElementById('quizSection');
    const importSection = document.getElementById('importSection');
    
    if (quizSection && quizSection.style.display !== 'none') {
        // Hide quiz section and show import section
        quizSection.style.display = 'none';
        importSection.classList.remove('hidden');
        
        // Reset file input
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.value = '';
        }
        
        // Show continue button if we have an active session
        updateContinueSessionButton();
        
        // Show a notification
        ToastSystem.show('Returned to main menu', 'info');
        
        // Note: This doesn't reset the quiz state, just returns to the main screen
    }
}

/**
 * Continue a previously active learning session
 */
function continueSession() {
    // Check if we have saved words in localStorage
    const savedWords = localStorage.getItem('quizletWords');
    
    if (savedWords) {
        // Simply show the quiz section again
        showQuizSection();
        
        // Update progress and reload the current question
        updateProgress();
        loadQuestion();
        
        ToastSystem.show('Continuing where you left off', 'success');
    } else {
        // No active session found
        ToastSystem.show('No active session found', 'error');
        
        // Hide the continue button
        const continueSessionContainer = document.getElementById('continueSessionContainer');
        if (continueSessionContainer) {
            continueSessionContainer.style.display = 'none';
        }
    }
}

/**
 * Update the continue session button based on the current state
 */
function updateContinueSessionButton() {
    const continueSessionContainer = document.getElementById('continueSessionContainer');
    const continueSessionInfo = document.getElementById('continueSessionInfo');
    
    if (!continueSessionContainer || !continueSessionInfo) return;
    
    // Check if we have an active session
    const savedWords = localStorage.getItem('quizletWords');
    const savedRound = localStorage.getItem('quizletRound');
    
    if (savedWords) {
        // We have an active session
        const words = JSON.parse(savedWords);
        const completed = words.filter(word => word.correct).length;
        const round = savedRound ? parseInt(savedRound) : 1;
        
        // Show container and update info
        continueSessionContainer.style.display = 'block';
        continueSessionInfo.textContent = 
            `Round ${round}: ${completed}/${words.length} terms completed. Continue where you left off!`;
    } else {
        // No active session
        continueSessionContainer.style.display = 'none';
    }
}

// Add to the existing DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    // ...existing code...
    
    // Check for active session and update continue button
    updateContinueSessionButton();
    
    // ...existing code...
});

async function importFromLink() {
    const linkInput = document.getElementById('linkInput');
    const link = linkInput.value.trim();
    
    if (!link) {
        ToastSystem.show('Please enter a link', 'error');
        return;
    }
    
    try {
        // Extract URL parameters
        const url = new URL(link);
        const sharedData = url.searchParams.get('shared') || url.searchParams.get('s');
        
        if (!sharedData) {
            throw new Error('Invalid share link format');
        }
        
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
        if (!shareData.name || !Array.isArray(shareData.terms) || shareData.terms.length === 0) {
            throw new Error('Invalid set data');
        }
        
        // Clear the input
        linkInput.value = '';
        
        // Show the import dialog
        showSharedSetDialog(shareData);
        
    } catch (error) {
        console.error('Error importing from link:', error);
        ToastSystem.show('Invalid or unsupported link format', 'error');
    }
}
