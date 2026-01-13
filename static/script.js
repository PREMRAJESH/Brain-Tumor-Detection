// Brain Tumor Detection - Frontend JavaScript

let selectedFile = null;

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const removeImageBtn = document.getElementById('removeImage');
const analyzeButton = document.getElementById('analyzeButton');
const resultsSection = document.getElementById('resultsSection');
const errorMessage = document.getElementById('errorMessage');
const newScanButton = document.getElementById('newScanButton');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

function setupEventListeners() {
    // File input change
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    uploadArea.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    // Remove image
    removeImageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetUpload();
    });

    // Analyze button
    analyzeButton.addEventListener('click', analyzeScan);

    // New scan button
    newScanButton.addEventListener('click', () => {
        resultsSection.style.display = 'none';
        resetUpload();
    });
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');

    const file = e.dataTransfer.files[0];
    if (file) {
        processFile(file);
    }
}

function processFile(file) {
    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
        showError('Please upload a valid image file (PNG, JPG, or JPEG)');
        return;
    }

    // Validate file size (16MB max)
    if (file.size > 16 * 1024 * 1024) {
        showError('File size must be less than 16MB');
        return;
    }

    selectedFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        uploadArea.style.display = 'none';
        imagePreview.style.display = 'block';
        analyzeButton.disabled = false;
    };
    reader.readAsDataURL(file);
}

function resetUpload() {
    selectedFile = null;
    fileInput.value = '';
    uploadArea.style.display = 'block';
    imagePreview.style.display = 'none';
    analyzeButton.disabled = true;
    hideError();
}

async function analyzeScan() {
    if (!selectedFile) return;

    // Show loading state
    const buttonText = analyzeButton.querySelector('.button-text');
    const buttonLoader = analyzeButton.querySelector('.button-loader');
    buttonText.style.display = 'none';
    buttonLoader.style.display = 'flex';
    analyzeButton.disabled = true;

    hideError();

    try {
        // Prepare form data
        const formData = new FormData();
        formData.append('file', selectedFile);

        // Make prediction request
        const response = await fetch('/api/predict', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Prediction failed');
        }

        if (data.success) {
            displayResults(data);
        } else {
            throw new Error(data.error || 'Unknown error occurred');
        }

    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Failed to analyze scan. Please try again.');
    } finally {
        // Reset button state
        buttonText.style.display = 'block';
        buttonLoader.style.display = 'none';
        analyzeButton.disabled = false;
    }
}

function displayResults(data) {
    const { prediction, confidence, all_probabilities } = data;

    // Set diagnosis
    document.getElementById('resultDiagnosis').textContent = prediction;

    // Set icon based on result
    const resultIcon = document.getElementById('resultIcon');
    if (prediction === 'No Tumor Detected') {
        resultIcon.innerHTML = '✅';
    } else {
        resultIcon.innerHTML = '⚠️';
    }

    // Set confidence
    const confidencePercent = (confidence * 100).toFixed(1);
    document.getElementById('confidenceValue').textContent = `${confidencePercent}%`;
    document.getElementById('confidenceFill').style.width = `${confidencePercent}%`;

    // Set confidence bar color based on value
    const confidenceFill = document.getElementById('confidenceFill');
    if (confidence >= 0.85) {
        confidenceFill.style.background = 'linear-gradient(90deg, #10b981, #059669)';
    } else if (confidence >= 0.70) {
        confidenceFill.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
    } else {
        confidenceFill.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
    }

    // Display all probabilities
    const probabilityList = document.getElementById('probabilityList');
    probabilityList.innerHTML = '';

    Object.entries(all_probabilities).forEach(([name, prob]) => {
        const probPercent = (prob * 100).toFixed(1);
        const item = document.createElement('div');
        item.className = 'probability-item';
        item.innerHTML = `
            <span class="probability-name">${name}</span>
            <span class="probability-value">${probPercent}%</span>
        `;
        probabilityList.appendChild(item);
    });

    // Show results section
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showError(message) {
    document.getElementById('errorText').textContent = message;
    errorMessage.style.display = 'flex';

    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    errorMessage.style.display = 'none';
}
