let players = {
  player1: { name: "Player 1", activePokemon: null, benchPokemon: [] },
  player2: { name: "Player 2", activePokemon: null, benchPokemon: [] },
};
let gameMode = null;

function confirmNewGame() {
  if (confirm("Are you sure you want to start a new game? All current data will be lost.")) {
    localStorage.removeItem("pokemonGameState");
    window.location.href = "index.html";
  }
}

function selectGameMode(mode) {
  gameMode = mode;

  players.player1.benchPokemon = new Array(mode === "standard" ? 5 : 3).fill(null);
  players.player2.benchPokemon = new Array(mode === "standard" ? 5 : 3).fill(null);

  localStorage.setItem("pokemonGameState", JSON.stringify({ gameMode, players }));
  window.location.href = "player1.html";
}

function onLoadPlayerPage(player) {
  const savedState = JSON.parse(localStorage.getItem("pokemonGameState") || "{}");
  if (savedState.players) {
    gameMode = savedState.gameMode;
    players = savedState.players;
  }
  renderPageForPlayer(player);
}

function renderPageForPlayer(player) {
  document.getElementById(`${player}-title`).textContent = players[player].name;
  renderBench(player);
}

function renderBench(player) {
  const benchContainer = document.getElementById(`bench-pokemon-${player}`);
  benchContainer.classList.toggle("standard", gameMode === "standard");
  benchContainer.innerHTML = players[player].benchPokemon
    .map(
      (pokemon, index) => `
      <div class="pokemon">
        ${pokemon ? `<p>${pokemon.name}</p><p>${pokemon.hp} HP</p>` : "<p>Empty Slot</p>"}
      </div>`
    )
    .join("");
}
