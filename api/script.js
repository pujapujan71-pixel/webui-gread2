let currentPokemonName = "";
let score = 0;

const btnGuess = document.getElementById('section1-btn');
const btnNext = document.getElementById('next-btn');
const inputField = document.getElementById('name');
const resultArea = document.getElementById('section1-result');
const pokemonImg = document.getElementById('pokemon-img');
const scoreDisplay = document.getElementById('score');

// Function to get a random Pokémon from Gen 1 (ID 1-151)
async function loadNewPokemon() {
    const randomId = Math.floor(Math.random() * 151) + 1;
    resultArea.textContent = "Loading...";
    btnNext.classList.add('hidden');
    inputField.value = "";
    inputField.disabled = false;
    btnGuess.disabled = false;

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
        const data = await response.json();
        
        currentPokemonName = data.name;
        // Use official artwork for better quality
        pokemonImg.src = data.sprites.other['official-artwork'].front_default;
        pokemonImg.classList.add('silhouette');
        resultArea.textContent = "";
    } catch (error) {
        resultArea.textContent = "Error loading Pokémon. Please refresh.";
    }
}

// Check if the guess is correct
function handleGuess() {
    const userGuess = inputField.value.toLowerCase().trim();
    
    if (!userGuess) return;

    if (userGuess === currentPokemonName) {
        resultArea.textContent = `Correct! It's ${currentPokemonName.toUpperCase()}!`;
        resultArea.style.color = "green";
        score++;
        scoreDisplay.textContent = score;
        revealPokemon();
    } else {
        resultArea.textContent = "Wrong! Try again.";
        resultArea.style.color = "red";
    }
}

// Reveal the Pokémon and show the "Next" button
function revealPokemon() {
    pokemonImg.classList.remove('silhouette');
    inputField.disabled = true;
    btnGuess.disabled = true;
    btnNext.classList.remove('hidden');
}

// Event Listeners
btnGuess.addEventListener('click', handleGuess);

btnNext.addEventListener('click', loadNewPokemon);

// Allow "Enter" key to submit guess
inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleGuess();
});

// Start the game on load
loadNewPokemon();
