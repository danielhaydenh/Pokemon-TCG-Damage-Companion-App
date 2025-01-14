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
  if (confirm("Are you sure you want to start a new game? All current data will be lost.")) {
    localStorage.removeItem("pokemonGameState");
    window.location.href = "index.html";
  }
}

/**
 * Render Bench Pokémon for a player.
 */
function renderBench(player) {
  const benchContainer = document.getElementById(`bench-pokemon-${player}`);
  if (!benchContainer) return;

  // Adjust layout based on game mode
  if (gameMode === "standard") {
    benchContainer.classList.add("standard");
  } else {
    benchContainer.classList.remove("standard");
  }

  benchContainer.innerHTML = ""; // Clear existing bench slots

  players[player].benchPokemon.forEach((pokemon, index) => {
    const div = document.createElement("div");
    div.className = "pokemon bench";

    if (pokemon) {
      div.innerHTML = `
        <p class="pokemon-name">${pokemon.name}</p>
        <p class="pokemon-hp">${pokemon.hp} HP</p>
        <div class="status-effects">
          ${renderStatusIcons(player, index, pokemon)}
        </div>
        <button class="button" onclick="adjustHP('${player}', ${index}, 10)">+10 HP</button>
        <button class="button" onclick="adjustHP('${player}', ${index}, -10)">-10 HP</button>
        <button class="button" onclick="swapToActive('${player}', ${index})">Swap to Active</button>
        <button class="button" onclick="evolvePokemon('${player}', ${index})">Evolve</button>
      `;
    } else {
      div.innerHTML = `<p>Empty Slot</p>`;
    }
    benchContainer.appendChild(div);
  });
}

/**
 * Render status effect icons (SLP, BRN, CNF, PAR, PSN).
 */
function renderStatusIcons(player, slot, pokemon) {
  const s = (pokemon.status || {});
  return `
    <div class="status-effect ${s.slp ? 'active' : ''}" onclick="toggleStatus('${player}', '${slot}', 'slp')">SLP</div>
    <div class="status-effect ${s.brn ? 'active' : ''}" onclick="toggleStatus('${player}', '${slot}', 'brn')">BRN</div>
    <div class="status-effect ${s.cnf ? 'active' : ''}" onclick="toggleStatus('${player}', '${slot}', 'cnf')">CNF</div>
    <div class="status-effect ${s.par ? 'active' : ''}" onclick="toggleStatus('${player}', '${slot}', 'par')">PAR</div>
    <div class="status-effect ${s.psn ? 'active' : ''}" onclick="toggleStatus('${player}', '${slot}', 'psn')">PSN</div>
  `;
}
