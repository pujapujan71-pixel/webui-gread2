let currentPokemonName = "";
let currentPokemonJPName = "";
let currentPokemonData = null;
let isShiny = false;
let score = 0;

const btnNext = document.getElementById('next-btn');
const btnHint = document.getElementById('hint-btn');
const resultArea = document.getElementById('section1-result');
const pokemonImg = document.getElementById('pokemon-img');
const scoreDisplay = document.getElementById('score');
const displayName = document.getElementById('pokemon-display-name');
const hintArea = document.getElementById('hint-text');
const gameCard = document.querySelector('.game-card');

const optionsContainer = document.getElementById('options-container');
const typeColors = {
    fire: '#ff9c54', grass: '#63bb5b', water: '#4e90d5', electric: '#f3d23b',
    ice: '#74cec0', fighting: '#ce4069', poison: '#ab6ac8', ground: '#d97746',
    flying: '#8fa8dd', psychic: '#f97176', bug: '#90c12c', rock: '#c7b78b',
    ghost: '#5269ac', dragon: '#0a6dc4', dark: '#5a5366', steel: '#5a8ea1',
    fairy: '#ec8fe6', normal: '#9099a1'
};

// Function to get a random Pokémon from Gen 1 (ID 1-151)
async function loadNewPokemon() {
    const randomId = Math.floor(Math.random() * 151) + 1;
    resultArea.textContent = "Loading...";
    optionsContainer.innerHTML = ''; // Clear previous options
    btnNext.classList.add('hidden');
    btnHint.classList.remove('hidden');
    hintArea.classList.add('hidden');
    pokemonImg.classList.remove('shiny-sparkle');
    displayName.classList.add('hidden');
    gameCard.style.backgroundColor = "white";

    try {
        // Fetch main data and species data (for JP names and hints)
        const [res, speciesRes] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`),
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${randomId}`)
        ]);
        const data = await res.json();
        const speciesData = await speciesRes.json();

        currentPokemonData = data;
        currentPokemonName = data.name;
        
        // Find Japanese name and flavor text
        currentPokemonJPName = speciesData.names.find(n => n.language.name === "ja").name;
        const flavorText = speciesData.flavor_text_entries.find(f => f.language.name === "ja").flavor_text;
        hintArea.textContent = flavorText.replace(/\f/g, ' '); // Clean up the text

        // Random Shiny (10% chance)
        isShiny = Math.random() < 0.1;
        const artwork = isShiny ? data.sprites.other['official-artwork'].front_shiny : data.sprites.other['official-artwork'].front_default;
        
        pokemonImg.src = artwork;
        pokemonImg.classList.add('silhouette');
        resultArea.textContent = "";

        // --- Generate 4 options ---
        let options = [currentPokemonName];
        let fetchedOptionIds = new Set([randomId]);

        while (options.length < 4) {
            let newRandomId = Math.floor(Math.random() * 151) + 1;
            if (fetchedOptionIds.has(newRandomId)) {
                continue; // Avoid duplicates
            }
            
            const optionRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${newRandomId}`);
            if (!optionRes.ok) continue;
            const optionData = await optionRes.json();
            
            // Ensure the option name is not already in the list
            if (!options.includes(optionData.name)) {
                options.push(optionData.name);
                fetchedOptionIds.add(newRandomId);
            }
        }

        // Shuffle options
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }

        options.forEach(optionName => {
            const button = document.createElement('button');
            button.classList.add('option-button');
            button.textContent = optionName.toUpperCase();
            button.addEventListener('click', handleOptionClick);
            optionsContainer.appendChild(button);
        });
    } catch (error) {
        resultArea.textContent = "Error loading Pokémon. Please refresh.";
    }
}

// Check if the guess is correct
function handleOptionClick(event) {
    const userGuess = event.target.textContent.toLowerCase();
    const allOptionButtons = optionsContainer.querySelectorAll('.option-button');
    allOptionButtons.forEach(button => button.disabled = true); // Disable all options after a choice

    if (userGuess === currentPokemonName.toLowerCase()) {
        resultArea.textContent = `Correct!`;
        resultArea.style.color = "green";
        event.target.classList.add('correct');
        score++;
        scoreDisplay.textContent = score;
        revealPokemon();
    } else {
        resultArea.textContent = "Wrong! Try again.";
        resultArea.style.color = "red";
        event.target.classList.add('incorrect');
        // Highlight the correct answer
        allOptionButtons.forEach(button => {
            if (button.textContent.toLowerCase() === currentPokemonName.toLowerCase()) {
                button.classList.add('correct');
            }
        });
        revealPokemon(); // Still reveal the pokemon even if wrong
    }
}

// Reveal the Pokémon and show the "Next" button
function revealPokemon() {
    pokemonImg.classList.remove('silhouette');
    btnHint.classList.add('hidden');
    btnNext.classList.remove('hidden');
    
    // ポケモンの名前を画像の上に表示
    displayName.textContent = `${currentPokemonJPName} (${currentPokemonName.toUpperCase()})`;
    displayName.classList.remove('hidden');

    if (isShiny) pokemonImg.classList.add('shiny-sparkle');

    // Dynamic background based on primary type
    const type = currentPokemonData.types[0].type.name;
    gameCard.style.backgroundColor = typeColors[type] || "white";
}

btnHint.addEventListener('click', () => {
    hintArea.classList.remove('hidden');
    btnHint.classList.add('hidden');
});

btnNext.addEventListener('click', loadNewPokemon);

// Start the game on load
loadNewPokemon();
