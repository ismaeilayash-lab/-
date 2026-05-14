// Joke Generator JavaScript

const API_URLS = {
    'all': 'https://v2.jokeapi.dev/joke/Any?safe-mode',
    'general': 'https://v2.jokeapi.dev/joke/General?safe-mode',
    'programming': 'https://v2.jokeapi.dev/joke/Programming?safe-mode',
    'knock-knock': 'https://v2.jokeapi.dev/joke/Knock-Knock?safe-mode'
};

let currentJoke = null;
let favorites = JSON.parse(localStorage.getItem('jokesFavorites')) || [];

// DOM Elements
const getJokeBtn = document.getElementById('getJokeBtn');
const shareBtn = document.getElementById('shareBtn');
const favoriteBtn = document.getElementById('favoriteBtn');
const clearFavoritesBtn = document.getElementById('clearFavoritesBtn');
const jokeContent = document.getElementById('jokeContent');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const jokeTypeSelect = document.getElementById('jokeType');
const favoritesList = document.getElementById('favoritesList');

// Event Listeners
getJokeBtn.addEventListener('click', fetchJoke);
shareBtn.addEventListener('click', shareJoke);
favoriteBtn.addEventListener('click', addToFavorites);
clearFavoritesBtn.addEventListener('click', clearAllFavorites);
jokeTypeSelect.addEventListener('change', fetchJoke);

// Load favorites on page load
document.addEventListener('DOMContentLoaded', () => {
    displayFavorites();
});

// Fetch joke from API
async function fetchJoke() {
    const jokeType = jokeTypeSelect.value;
    const url = API_URLS[jokeType];

    try {
        // Show loading state
        loading.classList.add('active');
        errorMessage.classList.remove('show');
        getJokeBtn.disabled = true;

        // Fetch joke
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch joke');
        }

        const data = await response.json();

        // Check if joke was found
        if (data.error) {
            throw new Error('No joke found');
        }

        // Store the current joke
        currentJoke = data;

        // Display the joke
        displayJoke(data);

        // Update favorite button
        updateFavoriteButton();

    } catch (error) {
        showError('Failed to load joke. Please try again.');
        console.error('Error:', error);
    } finally {
        loading.classList.remove('active');
        getJokeBtn.disabled = false;
    }
}

// Display joke
function displayJoke(data) {
    let jokeText = '';

    if (data.type === 'single') {
        jokeText = data.joke;
    } else if (data.type === 'twopart') {
        jokeText = `<p><strong>Setup:</strong> ${data.setup}</p><p><strong>Punchline:</strong> ${data.delivery}</p>`;
    }

    jokeContent.innerHTML = jokeText;
}

// Share joke
function shareJoke() {
    if (!currentJoke) {
        showError('No joke to share. Get a joke first!');
        return;
    }

    let jokeText = '';

    if (currentJoke.type === 'single') {
        jokeText = currentJoke.joke;
    } else if (currentJoke.type === 'twopart') {
        jokeText = `${currentJoke.setup}\n\n${currentJoke.delivery}`;
    }

    // Check if Web Share API is available
    if (navigator.share) {
        navigator.share({
            title: 'Check out this joke! 😂',
            text: jokeText
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback: Copy to clipboard
        copyToClipboard(jokeText);
        showSuccess('Joke copied to clipboard!');
    }
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Add to favorites
function addToFavorites() {
    if (!currentJoke) {
        showError('No joke to save. Get a joke first!');
        return;
    }

    let jokeText = '';

    if (currentJoke.type === 'single') {
        jokeText = currentJoke.joke;
    } else if (currentJoke.type === 'twopart') {
        jokeText = `${currentJoke.setup} - ${currentJoke.delivery}`;
    }

    // Check if joke is already in favorites
    const isDuplicate = favorites.some(fav => fav.text === jokeText);

    if (!isDuplicate) {
        favorites.push({
            id: Date.now(),
            text: jokeText,
            type: currentJoke.category
        });

        // Save to localStorage
        localStorage.setItem('jokesFavorites', JSON.stringify(favorites));

        // Update UI
        displayFavorites();
        updateFavoriteButton();
        showSuccess('Joke added to favorites!');
    } else {
        showError('This joke is already in your favorites!');
    }
}

// Display favorites
function displayFavorites() {
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p class="empty-message">No favorites yet. Start adding jokes!</p>';
        return;
    }

    favoritesList.innerHTML = favorites.map(joke => `
        <div class="favorite-item">
            <div class="favorite-text">${joke.text}</div>
            <button class="favorite-remove" onclick="removeFavorite(${joke.id})">Remove</button>
        </div>
    `).join('');
}

// Remove favorite
function removeFavorite(id) {
    favorites = favorites.filter(fav => fav.id !== id);
    localStorage.setItem('jokesFavorites', JSON.stringify(favorites));
    displayFavorites();
    updateFavoriteButton();
}

// Clear all favorites
function clearAllFavorites() {
    if (favorites.length === 0) {
        showError('No favorites to clear!');
        return;
    }

    if (confirm('Are you sure you want to clear all favorites?')) {
        favorites = [];
        localStorage.setItem('jokesFavorites', JSON.stringify(favorites));
        displayFavorites();
        updateFavoriteButton();
        showSuccess('All favorites cleared!');
    }
}

// Update favorite button appearance
function updateFavoriteButton() {
    if (!currentJoke) {
        favoriteBtn.style.opacity = '0.5';
        favoriteBtn.disabled = true;
        return;
    }

    let jokeText = '';
    if (currentJoke.type === 'single') {
        jokeText = currentJoke.joke;
    } else if (currentJoke.type === 'twopart') {
        jokeText = `${currentJoke.setup} - ${currentJoke.delivery}`;
    }

    const isFavorited = favorites.some(fav => fav.text === jokeText);

    if (isFavorited) {
        favoriteBtn.textContent = 'Remove from Favorites ⭐';
        favoriteBtn.style.background = '#ffc107';
        favoriteBtn.disabled = false;
        favoriteBtn.style.opacity = '1';
    } else {
        favoriteBtn.textContent = 'Add to Favorites ⭐';
        favoriteBtn.style.opacity = '1';
        favoriteBtn.disabled = false;
    }
}

// Error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 4000);
}

// Success message
function showSuccess(message) {
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 1000;
    `;
    tempDiv.textContent = message;
    document.body.appendChild(tempDiv);

    setTimeout(() => {
        tempDiv.remove();
    }, 3000);
}

// Fetch initial joke on load
window.addEventListener('load', () => {
    // Optional: fetch a joke on page load
    // Uncomment the line below if you want
    // fetchJoke();
});
