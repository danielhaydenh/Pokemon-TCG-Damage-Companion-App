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
 * Called on New Game screen when user clicks Standard or Pocket.
 */
function selectGameMode(mode) {
  console.log("selectGameMode called with mode=", mode);

  // Grab Player 1 and Player 2 names from the index.html page
  const p1Input = document.getElementById("player1-name");
  const p2Input = document.getElementById("player2-name");

  const p1Name = p1Input ? p1Input.value.trim() : "Player 1";
  const p2Name = p2Input ? p2Input.value.trim() : "Player 2";

  // Initialize bench arrays
  initGameState(mode);

  // Store custom names
  players.player1.name = p1Name || "Player 1";
  players.player2.name = p2Name || "Player 2";

  // Save & redirect
  saveGameState();
  window.location.href = "player1.html";
}

/**
 * Sets up bench size (3 or 5 slots) and resets the arrays with null.
 */
function initGameState(mode) {
  console.log("initGameState called with mode:", mode);
  gameMode = mode;

  const benchSize = (mode === "standard") ? 5 : 3;
  players.player1.benchPokemon = new Array(benchSize).fill(null);
  players.player2.benchPokemon = new Array(benchSize).fill(null);

  console.log("players.player1.benchPokemon:", players.player1.benchPokemon);
  console.log("players.player2.benchPokemon:", players.player2.benchPokemon);

  saveGameState();
}

/**
 * Load from localStorage -> global variables.
 */
function loadGameState() {
  const saved = localStorage.getItem("pokemonGameState");
  if (saved) {
    const state = JSON.parse(saved);
    gameMode = state.gameMode;
    players = state.players;
    console.log("[loadGameState] Loaded from localStorage:", state);
  } else {
    console.log("[loadGameState] No saved state found.");
  }
}

/**
 * Save global variables -> localStorage.
 */
function saveGameState() {
  const state = { gameMode, players };
  localStorage.setItem("pokemonGameState", JSON.stringify(state));
}

/**
 * Called on player pages (body onload).
 * e.g. <body onload="onLoadPlayerPage('player1')">
 */
function onLoadPlayerPage(player) {
  console.log("[onLoadPlayerPage] for", player);
  loadGameState();
  renderPageForPlayer(player);
}

/**
 * Renders Active + Bench + Player Name.
 */
function renderPageForPlayer(player) {
  // Player name at the top
  const titleElem = document.getElementById(`${player}-title`);
  if (titleElem) {
    titleElem.textContent = players[player].name || "Unknown Player";
  }

  // Render bench & active
  renderBench(player);
  renderActive(player);
}

/**
 * Called if user clicks "New Game" button (in your nav bar or after faint).
 */
function confirmNewGame() {
  if (confirm("Are you sure you want to start a new game? All progress will be lost.")) {
    localStorage.removeItem("pokemonGameState");
    window.location.href = "index.html";
  }
}

/**
 * User typed a Pokémon's name/HP + selected "active" or "bench" -> Save
 */
function handlePokemonInput(player) {
  console.log("[handlePokemonInput] for", player, " - loading state first...");
  loadGameState();

  const name = document.getElementById(`pokemon-name-${player}`).value.trim();
  const hp = parseInt(document.getElementById(`pokemon-hp-${player}`).value, 10);
  const slot = document.getElementById(`pokemon-slot-${player}`).value;

  if (!name || isNaN(hp) || hp <= 0) {
    alert("Please enter a valid Pokémon name and HP > 0.");
    return;
  }

  if (slot === "active") {
    // If there's already an active Pokemon, ask to move it to the bench
    if (players[player].activePokemon) {
      if (confirm("Active slot is occupied. Swap current active Pokémon to a bench slot?")) {
        const emptyIndex = players[player].benchPokemon.findIndex(p => p === null);
        if (emptyIndex !== -1) {
          players[player].benchPokemon[emptyIndex] = players[player].activePokemon;
          players[player].activePokemon = { name, hp, status: {} };
        } else {
          alert("No empty bench slots available.");
        }
      }
    } else {
      // Place new Pokemon into active
      players[player].activePokemon = { name, hp, status: {} };
    }
  } else {
    // slot === 'bench'
    console.log("[handlePokemonInput] user chose bench. Checking for null slot...");
    const emptyIndex = players[player].benchPokemon.findIndex(p => p === null);
    console.log("Current bench for", player, players[player].benchPokemon);
    console.log("emptyIndex:", emptyIndex);

    if (emptyIndex !== -1) {
      players[player].benchPokemon[emptyIndex] = { name, hp, status: {} };
    } else {
      alert("No empty bench slots available.");
    }
  }

  // Clear input fields
  document.getElementById(`pokemon-name-${player}`).value = "";
  document.getElementById(`pokemon-hp-${player}`).value = "";

  saveGameState();
  renderPageForPlayer(player);
}

/**
 * Render Active Pokémon for a player.
 */
function renderActive(player) {
  const activeSlot = document.getElementById(`active-slot-${player}`);
  if (!activeSlot) return;

  const activePokemon = players[player].activePokemon;
  if (activePokemon) {
    activeSlot.innerHTML = `
      <p class="pokemon-name">${activePokemon.name}</p>
      <p class="pokemon-hp">${activePokemon.hp} HP</p>
      <div class="status-effects">
        ${renderStatusIcons(player, "active", activePokemon)}
      </div>
      <button class="button" onclick="adjustHP('${player}', 'active', 10)">+10 HP</button>
      <button class="button" onclick="adjustHP('${player}', 'active', -10)">-10 HP</button>
      <button class="button" onclick="evolvePokemon('${player}', 'active')">Evolve</button>
    `;
  } else {
    activeSlot.innerHTML = "<p>Empty Slot</p>";
  }
}

/**
 * Render Bench Pokémon for a player.
 */
function renderBench(player) {
  const benchContainer = document.getElementById(`bench-pokemon-${player}`);
  if (!benchContainer) return;

  // Adjust columns for standard/pocket
  if (gameMode === "standard") {
    benchContainer.style.gridTemplateColumns = "repeat(5, 1fr)";
  } else {
    benchContainer.style.gridTemplateColumns = "repeat(3, 1fr)";
  }

  benchContainer.innerHTML = "";
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
 * Renders status effect icons (SLP, BRN, CNF, PAR, PSN).
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

/**
 * Toggle a particular status effect on/off.
 */
function toggleStatus(player, slot, effect) {
  loadGameState();

  const pokemon = (slot === "active")
    ? players[player].activePokemon
    : players[player].benchPokemon[parseInt(slot, 10)];

  if (!pokemon) return;

  pokemon.status = pokemon.status || {};
  pokemon.status[effect] = !pokemon.status[effect];

  saveGameState();
  renderPageForPlayer(player);
}

/**
 * Add or subtract HP. Faint if <= 0.
 */
function adjustHP(player, slot, amount) {
  loadGameState();

  let pokemon;
  if (slot === "active") {
    pokemon = players[player].activePokemon;
  } else {
    pokemon = players[player].benchPokemon[parseInt(slot, 10)];
  }

  if (pokemon) {
    pokemon.hp += amount;
    if (pokemon.hp <= 0) {
      pokemon.hp = 0;
      notifyFaint(player, slot, pokemon.name);
    }
  }

  saveGameState();
  renderPageForPlayer(player);
}

/**
 * Handle fainting. If fainted while active, user must choose from bench (if available).
 */
function notifyFaint(player, slot, name) {
  alert(`${name} has fainted and is unable to battle.`);

  if (slot === "active") {
    players[player].activePokemon = null;

    const availableBenchIndex = players[player].benchPokemon.findIndex(p => p !== null);
    if (availableBenchIndex !== -1) {
      alert("Please select a Pokémon from your bench to replace the active Pokémon.");
    } else {
      alert("No bench Pokémon are available. The game has ended.");
      confirmNewGame();
    }
  } else {
    // Fainted on bench
    players[player].benchPokemon[parseInt(slot, 10)] = null;
  }
}

/**
 * Swap bench Pokémon with active slot.
 */
function swapToActive(player, index) {
  loadGameState();

  const temp = players[player].activePokemon;
  players[player].activePokemon = players[player].benchPokemon[index];
  players[player].benchPokemon[index] = temp;

  saveGameState();
  renderPageForPlayer(player);
}

/**
 * Evolve a Pokémon by changing name and HP.
 */
function evolvePokemon(player, slot) {
  loadGameState();

  const isActive = (slot === "active");
  const idx = isActive ? null : parseInt(slot, 10);
  const pokemon = isActive ? players[player].activePokemon : players[player].benchPokemon[idx];

  if (!pokemon) return;

  const newName = prompt("Enter the new Pokémon name:", pokemon.name);
  if (!newName) return;

  const newHP = parseInt(prompt("Enter the new HP:", pokemon.hp), 10);
  if (isNaN(newHP) || newHP <= 0) {
    alert("Invalid HP value. Please enter a positive number.");
    return;
  }

  pokemon.name = newName;
  pokemon.hp = newHP;

  saveGameState();
  renderPageForPlayer(player);
}
