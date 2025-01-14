// Global game state
let players = {
  player1: {
    name: "Player 1",
    activePokemon: null,
    benchPokemon: []
  },
  player2: {
    name: "Player 2",
    activePokemon: null,
    benchPokemon: []
  }
};

let gameMode = null; // "standard" or "pocket"

/**
 * Confirm before starting a new game.
 */
function confirmNewGame() {
  if (confirm("Are you sure you want to start a new game? All progress will be lost.")) {
    localStorage.removeItem("pokemonGameState");
    window.location.href = "index.html";
  }
}
