// ===================================
// Interactive Flow - Core State Management
// ===================================

// Flow state object
const flowState = {
    currentStep: 1,
    selectedCourse: null,
    painPoints: {
        alignment: 65,
        scenario: 85,
        roi: 60,
        planning: 40
    },
    selectedConsultation: null,
    selectedContactMethod: 'wechat'
};

// ===================================
// Step Navigation Functions
// ===================================

function showStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.flow-step').forEach(step => {
        step.classList.remove('active');
    });

    // Show target step
    const targetStep = document.getElementById(`step${stepNumber}`);
    if (targetStep) {
        targetStep.classList.add('active');
        flowState.currentStep = stepNumber;

        // Scroll to interactive section
        const interactiveSection = document.getElementById('interactive');
        if (interactiveSection) {
            const headerHeight = document.getElementById('header').offsetHeight;
            const targetPosition = interactiveSection.offsetTop - headerHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }

        // Save state to localStorage
        saveFlowState();
    }
}

function goToNextStep() {
    if (flowState.currentStep < 4) {
        showStep(flowState.currentStep + 1);
    }
}

function goToPreviousStep() {
    if (flowState.currentStep > 1) {
        showStep(flowState.currentStep - 1);
    }
}

// ===================================
// State Persistence
// ===================================

function saveFlowState() {
    try {
        localStorage.setItem('trainingFlowState', JSON.stringify(flowState));
    } catch (e) {
        console.error('Failed to save flow state:', e);
    }
}

function loadFlowState() {
    try {
        const savedState = localStorage.getItem('trainingFlowState');
        if (savedState) {
            const parsed = JSON.parse(savedState);
            Object.assign(flowState, parsed);
            return true;
        }
    } catch (e) {
        console.error('Failed to load flow state:', e);
    }
    return false;
}

// ===================================
// Step 1: Course Selection
// ===================================

function initializeCourseSelection() {
    const courseOptions = document.querySelectorAll('#step1 .option-card');
    const continueBtn = document.querySelector('#step1 .btn-continue');

    courseOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options
            courseOptions.forEach(opt => opt.classList.remove('selected'));

            // Add selected class to clicked option
            option.classList.add('selected');

            // Update state
            flowState.selectedCourse = option.getAttribute('data-value');

            // Enable continue button
            if (continueBtn) {
                continueBtn.disabled = false;
            }

            // Save state
            saveFlowState();
        });
    });

    // Restore selection if exists
    if (flowState.selectedCourse) {
        const selectedOption = document.querySelector(`#step1 .option-card[data-value="${flowState.selectedCourse}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
            if (continueBtn) {
                continueBtn.disabled = false;
            }
        }
    }
}

// ===================================
// Step 1: Pain Points Sliders
// ===================================

function initializePainPointSliders() {
    const sliderTracks = document.querySelectorAll('#step1 .slider-track');

    sliderTracks.forEach(track => {
        const fill = track.querySelector('.slider-fill');
        const thumb = track.querySelector('.slider-thumb');
        const initialValue = parseInt(track.getAttribute('data-value')) || 50;

        // Set initial position
        updateSliderPosition(track, fill, thumb, initialValue);

        // Mouse events
        track.addEventListener('mousedown', (e) => {
            handleSliderInteraction(e, track, fill, thumb);
        });

        track.addEventListener('click', (e) => {
            handleSliderInteraction(e, track, fill, thumb);
        });

        // Touch events for mobile
        track.addEventListener('touchstart', (e) => {
            handleSliderInteraction(e.touches[0], track, fill, thumb);
        });
    });
}

function handleSliderInteraction(e, track, fill, thumb) {
    const rect = track.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

    updateSliderPosition(track, fill, thumb, percentage);

    // Update state based on slider label
    const sliderItem = track.closest('.slider-item');
    const label = sliderItem.querySelector('.slider-label').textContent;

    if (label.includes('高层认知对齐')) {
        flowState.painPoints.alignment = Math.round(percentage);
    } else if (label.includes('具体场景识别')) {
        flowState.painPoints.scenario = Math.round(percentage);
    } else if (label.includes('ROI测算模型')) {
        flowState.painPoints.roi = Math.round(percentage);
    } else if (label.includes('90天落地规划')) {
        flowState.painPoints.planning = Math.round(percentage);
    }

    saveFlowState();
}

function updateSliderPosition(track, fill, thumb, percentage) {
    fill.style.width = `${percentage}%`;
    thumb.style.left = `${percentage}%`;
    track.setAttribute('data-value', Math.round(percentage));
}

// ===================================
// Step 2: Consultation Options
// ===================================

function initializeConsultationOptions() {
    const consultationCards = document.querySelectorAll('#step2 .consultation-card');
    const continueBtn = document.querySelector('#step2 .btn-continue');

    consultationCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove selected class from all cards
            consultationCards.forEach(c => c.classList.remove('selected'));

            // Add selected class to clicked card
            card.classList.add('selected');

            // Update state
            flowState.selectedConsultation = card.getAttribute('data-value');

            // Enable continue button
            if (continueBtn) {
                continueBtn.disabled = false;
            }

            // Save state
            saveFlowState();
        });
    });

    // Restore selection if exists
    if (flowState.selectedConsultation) {
        const selectedCard = document.querySelector(`#step2 .consultation-card[data-value="${flowState.selectedConsultation}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            if (continueBtn) {
                continueBtn.disabled = false;
            }
        }
    }
}

// ===================================
// Step 3: Contact Method Options
// ===================================

function initializeContactMethodOptions() {
    const contactMethodCards = document.querySelectorAll('#step3 .contact-method-card');

    contactMethodCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove selected class from all cards
            contactMethodCards.forEach(c => c.classList.remove('selected'));

            // Add selected class to clicked card
            card.classList.add('selected');

            // Update state
            flowState.selectedContactMethod = card.getAttribute('data-value');

            // Save state
            saveFlowState();
        });
    });

    // Restore selection if exists
    if (flowState.selectedContactMethod) {
        const selectedCard = document.querySelector(`#step3 .contact-method-card[data-value="${flowState.selectedContactMethod}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
    }
}

// ===================================
// Button Event Listeners
// ===================================

function initializeNavigationButtons() {
    // Continue buttons
    const continueButtons = document.querySelectorAll('.btn-continue');
    continueButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const nextStep = btn.getAttribute('data-next');
            if (nextStep) {
                const stepNumber = parseInt(nextStep.replace('step', ''));
                showStep(stepNumber);
            }
        });
    });

    // Back buttons
    const backButtons = document.querySelectorAll('.btn-back');
    backButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const prevStep = btn.getAttribute('data-prev');
            if (prevStep) {
                const stepNumber = parseInt(prevStep.replace('step', ''));
                showStep(stepNumber);
            }
        });
    });
}

// ===================================
// Main Initialization
// ===================================

function initializeInteractiveFlow() {
    // Load saved state if exists
    loadFlowState();

    // Initialize all step components
    initializeCourseSelection();
    initializePainPointSliders();
    initializeConsultationOptions();
    initializeContactMethodOptions();
    initializeNavigationButtons();

    // Show the current step (in case state was restored)
    if (flowState.currentStep > 1) {
        showStep(flowState.currentStep);
    }

    console.log('Interactive flow initialized successfully!');
}

// ===================================
// Initialize on DOM Load
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    initializeInteractiveFlow();
});

