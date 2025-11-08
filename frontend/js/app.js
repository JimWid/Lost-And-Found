// Accessibility enhancements
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';

    document.body.appendChild(announcement);
    announcement.textContent = message;

    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// Keyboard navigation improvements
document.addEventListener('keydown', (e) => {
    // Allow Escape key to clear form focus
    if (e.key === 'Escape') {
        const focusedElement = document.activeElement;
        if (focusedElement && (focusedElement.tagName === 'INPUT' || focusedElement.tagName === 'BUTTON')) {
            focusedElement.blur();
        }
    }
});
// API base URL - adjust if backend is running on different port
const API_BASE = 'http://127.0.0.1:8000';

// DOM elements
const uploadForm = document.getElementById('upload-form');
const imageInput = document.getElementById('image-upload');
const locationInput = document.getElementById('location');
const submitBtn = document.getElementById('submit-btn');
const uploadStatus = document.getElementById('upload-status');
const itemsList = document.getElementById('items-list');
const loadMoreBtn = document.getElementById('load-more-btn');

// State
let currentItemId = 1;
let isLoading = false;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadItems();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    uploadForm.addEventListener('submit', handleUpload);
    loadMoreBtn.addEventListener('click', loadMoreItems);
}

// Handle form submission
async function handleUpload(e) {
    e.preventDefault();

    if (!imageInput.files[0]) {
        showStatus('Please select an image to upload.', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('file', imageInput.files[0]);
    if (locationInput.value.trim()) {
        formData.append('foundLocation', locationInput.value.trim());
    }

    setLoading(true);
    showStatus('', ''); // Clear previous status

    try {
        const response = await fetch(`${API_BASE}/create-lost-item`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        showStatus('Item uploaded successfully!', 'success');
        announceToScreenReader('Item uploaded successfully');

        // Reset form
        uploadForm.reset();

        // Reload items to show the new one
        loadItems();

    } catch (error) {
        console.error('Upload error:', error);
        showStatus('Failed to upload item. Please try again.', 'error');
        announceToScreenReader('Upload failed. Please try again.');
    } finally {
        setLoading(false);
    }
}

// Load items from the API
async function loadItems() {
    try {
        // For now, we'll try to load a few items by ID
        // In a real app, you'd have an endpoint to get all items
        const items = [];
        for (let i = 1; i <= 10; i++) {
            try {
                const response = await fetch(`${API_BASE}/lost-items/${i}`);
                if (response.ok) {
                    const item = await response.json();
                    items.push(item);
                }
            } catch (e) {
                // Item doesn't exist, continue
            }
        }

        displayItems(items);
        currentItemId = Math.max(...items.map(item => item.id), 0) + 1;

    } catch (error) {
        console.error('Error loading items:', error);
        showStatus('Failed to load items.', 'error');
    }
}

// Load more items (placeholder for pagination)
async function loadMoreItems() {
    // This would be implemented with proper pagination endpoint
    loadMoreBtn.style.display = 'none';
}

// Display items in the UI
function displayItems(items) {
    itemsList.innerHTML = '';

    if (items.length === 0) {
        itemsList.innerHTML = '<p>No items found yet. Be the first to report a found item!</p>';
        return;
    }

    items.forEach(item => {
        const itemCard = createItemCard(item);
        itemsList.appendChild(itemCard);
    });

    // Show load more button if there might be more items
    if (items.length >= 10) {
        loadMoreBtn.style.display = 'block';
    }
}

// Create item card element
function createItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';

    const formattedDate = new Date(item.addedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    card.innerHTML = `
        <div class="item-image" style="background: linear-gradient(45deg, #f0f0f0, #e0e0e0); display: flex; align-items: center; justify-content: center; color: #666;">
            📷 Image not available
        </div>
        <div class="item-content">
            <h3 class="item-title">${item.title}</h3>
            <p class="item-description">${item.description}</p>
            <div class="item-meta">
                <span class="item-category">${item.category}</span>
                <span>${formattedDate}</span>
            </div>
            ${item.foundLocation ? `<p><strong>Location:</strong> ${item.foundLocation}</p>` : ''}
            ${item.confidence ? `<p><strong>Detection Confidence:</strong> ${(item.confidence * 100).toFixed(1)}%</p>` : ''}
            ${item.objectName ? `<p><strong>Detected Object:</strong> ${item.objectName}</p>` : ''}
        </div>
    `;

    return card;
}

// Show status message
function showStatus(message, type) {
    uploadStatus.textContent = message;
    uploadStatus.className = type;
    uploadStatus.style.display = message ? 'block' : 'none';
}

// Set loading state
function setLoading(loading) {
    isLoading = loading;
    submitBtn.disabled = loading;
    submitBtn.innerHTML = loading ?
        '<span class="loading"></span> Uploading...' :
        'Submit Item';
}

// Utility function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Error handling for fetch requests
function handleFetchError(error) {
    console.error('Fetch error:', error);
    // You could implement retry logic here
}