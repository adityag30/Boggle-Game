  const gridSize = 4;
      const embedWords = ["CAT", "DOG", "SUN", "FUN"];
      let foundWords = new Set();
      let hintUsed = false;
      let score = 0, timer = 120, interval, gameEnded = false;
      let selectedTiles = [], isDragging = false;

      const gridElement = document.getElementById("grid");
      const scoreElement = document.getElementById("score");
      const timerElement = document.getElementById("timer");
      const currentWordInput = document.getElementById("currentWord");
      const wordListElement = document.getElementById("wordList");
      const submitBtn = document.getElementById("submitBtn");
      const hintBtn = document.getElementById("hintBtn");
      const restartBtn = document.getElementById("restartBtn");

      function generateSmartGrid() {
        const grid = Array(gridSize * gridSize).fill("");

        function canPlace(word, row, col, dir) {
          const dx = { h: 0, v: 1, d: 1 }[dir];
          const dy = { h: 1, v: 0, d: 1 }[dir];
          for (let i = 0; i < word.length; i++) {
            let x = row + dx * i, y = col + dy * i;
            if (x >= gridSize || y >= gridSize || grid[x * gridSize + y] !== "") return false;
          }
          return true;
        }

        function placeWord(word) {
          while (true) {
            let row = Math.floor(Math.random() * gridSize);
            let col = Math.floor(Math.random() * gridSize);
            let dir = ["h", "v", "d"][Math.floor(Math.random() * 3)];
            if (canPlace(word, row, col, dir)) {
              for (let i = 0; i < word.length; i++) {
                let x = row + (dir === "v" || dir === "d" ? i : 0);
                let y = col + (dir === "h" || dir === "d" ? i : 0);
                grid[x * gridSize + y] = word[i];
              }
              break;
            }
    }
        }

        embedWords.forEach(placeWord);

        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        grid.forEach((v, i) => {
          if (!v) grid[i] = letters[Math.floor(Math.random() * letters.length)];
        });

        gridElement.innerHTML = "";
        grid.forEach((char, i) => {
          const tile = document.createElement("div");
          tile.className = "tile";
          tile.textContent = char;
          tile.dataset.index = i;
          gridElement.appendChild(tile);
        });

        document.querySelectorAll(".tile").forEach(tile => {
          tile.addEventListener("mousedown", () => { if (!gameEnded) startSelect(tile); });
          tile.addEventListener("mouseenter", () => { if (isDragging && !gameEnded) addTile(tile); });
        });

        document.addEventListener("mouseup", () => {
          if (!gameEnded && isDragging) {
            isDragging = false;
            submitWord();
          }
        });
      }

      function startSelect(tile) {
        isDragging = true;
        clearHint();
        addTile(tile);
      }
  function addTile(tile) {
        if (!tile.classList.contains("selected")) {
          tile.classList.add("selected");
          selectedTiles.push(tile.textContent);
          currentWordInput.value = selectedTiles.join("");
        }
      }

      function clearSelection() {
        document.querySelectorAll(".tile.selected").forEach(t => t.classList.remove("selected"));
        selectedTiles = [];
        currentWordInput.value = "";
      }

      async function submitWord() {
        const word = currentWordInput.value;
        if (word.length < 3 || foundWords.has(word)) return clearSelection();

        try {
          const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
          const data = await res.json();

          if (Array.isArray(data) && data[0]?.meanings?.length > 0) {
            foundWords.add(word);
            score += 10;
            scoreElement.textContent = score;

            let meaning = "";
            const defs = data[0].meanings[0].definitions;
            if (defs && defs.length > 0) {
              meaning = defs[0].definition;
            }

            const li = document.createElement("li");
            li.innerHTML = `<strong>${word}</strong>: ${meaning}`;
            wordListElement.appendChild(li);

            if (embedWords.every(w => foundWords.has(w))) {
              hintBtn.disabled = true;
            }
  } else {
            alert(`${word} is not a valid word.`);
          }
        } catch (err) {
          alert("Error fetching meaning. Please try again.");
          console.error(err);
        }

        clearSelection();
      }

      function startTimer() {
    clearInterval(interval); // prevent multiple timers running
    interval = setInterval(() => {
      timer--;
      timerElement.textContent = timer;
      if (timer <= 0) endGame();
    }, 1000);
  }

      function endGame() {
    gameEnded = true;
    clearInterval(interval);
    submitBtn.disabled = true;
    hintBtn.disabled = true;
    document.querySelectorAll(".tile").forEach(tile => {
      tile.style.pointerEvents = "none";
      tile.style.cursor = "default";
    });
    gridElement.style.opacity = 0.5;
  const playerName = prompt("Time's up! Enter your name for the leaderboard:");
    if (playerName) {
      const existing = leaderboard.find(entry => entry.name === playerName);
      if (!existing || score > existing.score) {
        if (existing) {
          existing.score = score;
        } else {
          leaderboard.push({ name: playerName, score });
        }
        leaderboard.sort((a, b) => b.score - a.score);
        leaderboard = leaderboard.slice(0, 5); // keep top 5
        saveLeaderboard();
      }
      updateLeaderboard();
    }

    alert(`Time's up! Final Score: ${score}`);
  }


      function dfsHighlight(word, grid) {
        const visited = Array(gridSize).fill().map(() => Array(gridSize).fill(false));
        const path = [];
        const directions = [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];

        function dfs(i, j, idx) {
          if (idx === word.length) return true;
          if (i < 0 || i >= gridSize || j < 0 || j >= gridSize || visited[i][j] || grid[i][j] !== word[idx]) return false;

          visited[i][j] = true;
          path.push([i, j]);

          for (let [dx, dy] of directions) {
            if (dfs(i + dx, j + dy, idx + 1)) return true;
          }

          visited[i][j] = false;
          path.pop();
          return false;
        }
    for (let i = 0; i < gridSize; i++) {
          for (let j = 0; j < gridSize; j++) {
            if (dfs(i, j, 0)) return path;
          }
        }
        return null;
      }

      function clearHint() {
        document.querySelectorAll(".tile.hint").forEach(t => t.classList.remove("hint"));
      }

      hintBtn.addEventListener("click", () => {
        if (hintUsed || gameEnded) return;

        const tiles = document.querySelectorAll(".tile");
        const grid = Array.from({ length: gridSize }, (_, i) =>
          Array.from({ length: gridSize }, (_, j) => tiles[i * gridSize + j].textContent)
        );

        for (let word of embedWords) {
          if (!foundWords.has(word)) {
            const path = dfsHighlight(word, grid);
            if (path) {
              path.forEach(([i, j]) => {
                tiles[i * gridSize + j].classList.add("hint");
              });
              hintUsed = true;
              hintBtn.disabled = true;
              hintBtn.textContent = "Hint (0 left)";
              return;
            }
          }
        }

        hintBtn.disabled = true;
        alert("No hint available.");
      });
    submitBtn.addEventListener("click", () => { if (!gameEnded) submitWord(); });

      generateSmartGrid();
      startTimer();
  // Leaderboard data (load from localStorage or empty)
  let leaderboard = JSON.parse(localStorage.getItem('boggleLeaderboard') || '[]');

  // Utility: save leaderboard to localStorage
  function saveLeaderboard() {
    localStorage.setItem('boggleLeaderboard', JSON.stringify(leaderboard));
  }

  // Update leaderboard display
  function updateLeaderboard() {
    const list = document.getElementById('leaderboardList');
    list.innerHTML = '';
    leaderboard.slice(0, 5).forEach(({name, score}, i) => {
      const li = document.createElement('li');
      li.textContent = `${name}: ${score}`;
      list.appendChild(li);
    });
  }

  // Prompt for player name before restarting
  restartBtn.addEventListener('click', () => {
    if (!gameEnded) {
      if (!confirm('Are you sure you want to restart? Your current game will be lost.')) return;
    }

    let playerName = prompt('Enter your name for leaderboard:', 'Player');
    if (!playerName) playerName = 'Player';

    // Save current score if game ended and score > 0
    if (gameEnded && score > 0) {
      leaderboard.push({ name: playerName.trim(), score });
      leaderboard.sort((a, b) => b.score - a.score);
      if (leaderboard.length > 5) leaderboard = leaderboard.slice(0, 5);
      saveLeaderboard();
    }

    // Original restart code (you keep this as is)
    clearInterval(interval);
    foundWords.clear();
    score = 0;
    timer = 120;
    scoreElement.textContent = score;
    timerElement.textContent = timer;
    wordListElement.innerHTML = '';
    clearHint();
    gameEnded = false;
    submitBtn.disabled = false;
    hintBtn.disabled = false;
    hintUsed = false;
    hintBtn.textContent = 'Hint (1 left)';
    gridElement.style.opacity = 1;
    document.querySelectorAll('.tile').forEach(tile => {
      tile.style.pointerEvents = '';
      tile.style.cursor = 'pointer';
    });

    generateSmartGrid();
    startTimer();
    updateLeaderboard();
  });

  // Initialize leaderboard on page load
  updateLeaderboard();

  // Also add player name prompt on initial game start:
  window.addEventListener('load', () => {
    let playerName = prompt('Enter your name to start the game:', 'Player');
    if (!playerName) playerName = 'Player';
    updateLeaderboard();
    startTimer();
  });
    updateLeaderboard();
