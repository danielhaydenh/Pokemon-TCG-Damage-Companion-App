
// Global game state
let players = {
  player1: { name: "Player 1", activePokemon: null, benchPokemon: [] },
  player2: { name: "Player 2", activePokemon: null, benchPokemon: [] }
};
let gameMode = null;

// Confirm before starting a new game
function confirmNewGame() {
  if (confirm("Are you sure you want to start a new game? All current data will be lost.")) {
    localStorage.removeItem("pokemonGameState");
    window.location.href = "index.html";
  }
}

// Render Bench dynamically based on the game mode
function renderBench(player) {
  const benchContainer = document.getElementById(`bench-pokemon-${player}`);
  if (!benchContainer) return;
  benchContainer.className = "bench-container " + (gameMode === "standard" ? "standard" : "pocket");

  benchContainer.innerHTML = players[player].benchPokemon
    .map((pokemon) => pokemon
      ? `<div class="pokemon bench"><p>${pokemon.name}</p><p>${pokemon.hp} HP</p></div>`
      : `<div class="pokemon bench"><p>Empty Slot</p></div>`
    )
    .join("");
}

// Initialize the game state
function selectGameMode(mode) {
  gameMode = mode;
  players.player1.benchPokemon = Array(mode === "standard" ? 5 : 3).fill(null);
  players.player2.benchPokemon = Array(mode === "standard" ? 5 : 3).fill(null);
  localStorage.setItem("pokemonGameState", JSON.stringify({ gameMode, players }));
  window.location.href = "player1.html";
}
