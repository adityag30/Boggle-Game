const gridElement = document.getElementById("grid");
const currentWordInput = document.getElementById("currentWord");
const wordListElement = document.getElementById("wordList");
const scoreElement = document.getElementById("score");
const timerElement = document.getElementById("timer");
const submitBtn = document.getElementById("submitBtn");

const gridSize = 4;
let foundWords = new Set();
let score = 0;
let timer = 120;
let interval;
let isDragging = false;
let selectedTiles = [];
const embedWords = ["CAT", "SUN", "FUN", "DOG"];

async function isValidWord(word) {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data && data[0] && data[0].meanings && data[0].meanings.length > 0;
  } catch (error) {
    console.error("Error fetching data:", error);
    return false;
  }
}

function generateSmartGrid() {
  const grid = Array(gridSize * gridSize).fill("");

  function canPlaceWord(word, row, col, direction) {
    if (direction === "horizontal" && col + word.length <= gridSize) {
      for (let i = 0; i < word.length; i++) {
        if (grid[row * gridSize + col + i] !== "") return false;
      }
      return true;
    }
    if (direction === "vertical" && row + word.length <= gridSize) {
      for (let i = 0; i < word.length; i++) {
        if (grid[(row + i) * gridSize + col] !== "") return false;
      }
      return true;
    }
    if (
      direction === "diagonal" &&
      row + word.length <= gridSize &&
      col + word.length <= gridSize
    ) {
      for (let i = 0; i < word.length; i++) {
        if (grid[(row + i) * gridSize + col + i] !== "") return false;
      }
      return true;
    }
    return false;
  }

  function placeWord(word, row, col, direction) {
    for (let i = 0; i < word.length; i++) {
      if (direction === "horizontal") grid[row * gridSize + col + i] = word[i];
      if (direction === "vertical") grid[(row + i) * gridSize + col] = word[i];
      if (direction === "diagonal")
        grid[(row + i) * gridSize + col + i] = word[i];
    }
  }

  embedWords.forEach((word) => {
    let placed = false;
    while (!placed) {
      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);
      const directions = ["horizontal", "vertical", "diagonal"];
      const direction =
        directions[Math.floor(Math.random() * directions.length)];
      if (canPlaceWord(word, row, col, direction)) {
        placeWord(word, row, col, direction);
        placed = true;
      }
    }
  });

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === "") {
      grid[i] = letters[Math.floor(Math.random() * letters.length)];
    }
  }

  gridElement.innerHTML = "";
  grid.forEach((letter, index) => {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    tile.textContent = letter;
    tile.dataset.index = index;
    gridElement.appendChild(tile);
  });

  const tiles = document.querySelectorAll(".tile");
  tiles.forEach((tile) => {
    tile.addEventListener("mousedown", () => {
      if (!gameEnded) {
        isDragging = true;
        addTile(tile);
      }
    });
    tile.addEventListener("mouseenter", () => {
      if (isDragging && !tile.classList.contains("selected") && !gameEnded) {
        addTile(tile);
      }
    });
  });

  document.addEventListener("mouseup", () => {
    if (!gameEnded) {
      isDragging = false;
      submitSelectedWord();
    }
  });
}

function addTile(tile) {
  tile.classList.add("selected");
  selectedTiles.push(tile.textContent);
  currentWordInput.value = selectedTiles.join("");
}

async function submitSelectedWord() {
  const word = currentWordInput.value;
  if (word.length < 3 || foundWords.has(word)) {
    clearSelection();
    return;
  }

  const valid = await isValidWord(word);
  if (valid) {
    foundWords.add(word);
    const li = document.createElement("li");
    li.textContent = word;
    wordListElement.appendChild(li);
    score += 10;
    scoreElement.textContent = score;
  } else {
    alert(`${word} is not a valid word.`);
  }

  clearSelection();
}

function clearSelection() {
  document
    .querySelectorAll(".tile.selected")
    .forEach((tile) => tile.classList.remove("selected"));
  selectedTiles = [];
  currentWordInput.value = "";
}

let gameEnded = false;

function endGame() {
  gameEnded = true;
  clearInterval(interval);
  alert("Time's up! Final Score: " + score);

  submitBtn.disabled = true;
  const tiles = document.querySelectorAll(".tile");
  tiles.forEach((tile) => {
    tile.style.pointerEvents = "none";
    tile.style.cursor = "default";
  });

  gridElement.style.opacity = 0.5;
}

function startTimer() {
  interval = setInterval(() => {
    timer--;
    timerElement.textContent = timer;
    if (timer <= 0) {
      endGame();
    }
  }, 1000);
}

submitBtn.addEventListener("click", () => {
  if (!gameEnded) submitSelectedWord();
});

// Initialize the game
generateSmartGrid();
startTimer();
