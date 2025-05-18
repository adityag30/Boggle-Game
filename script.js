const boardSize = 4;
const boardElement = document.getElementById("board");
const wordListElement = document.getElementById("wordList");
const timerElement = document.getElementById("timer");
let timerInterval = null;

let trie = {};
function addToTrie(word) {
  let node = trie;
  for (const letter of word) {
    if (!node[letter]) node[letter] = {};
    node = node[letter];
  }
  node.$ = true;
}

const defaultDictionary = ["cat", "dog", "go", "good", "god", "dot", "cod", "cot", "gate", "date", "got", "dig", "git", "tag"];
function loadDefaultDictionary() {
  trie = {};
  defaultDictionary.forEach(addToTrie);
}

function loadDictionary(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    const words = e.target.result
      .split(/\r?\n/)
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length);
    trie = {};
    words.forEach(addToTrie);
    alert("Custom dictionary loaded with " + words.length + " words.");
  };
  reader.readAsText(file);
}

function createBoard() {
  for (let i = 0; i < boardSize * boardSize; i++) {
    const input = document.createElement("input");
    input.maxLength = 1;
    boardElement.appendChild(input);
  }
}

function getBoard() {
  const inputs = boardElement.querySelectorAll("input");
  const board = [];
  for (let r = 0; r < boardSize; r++) {
    board[r] = [];
    for (let c = 0; c < boardSize; c++) {
      board[r][c] = inputs[r * boardSize + c].value.toLowerCase();
    }
  }
  return board;
}

function solveBoard() {
  const board = getBoard();
  const found = new Set();
  const visited = Array.from({ length: boardSize }, () => Array(boardSize).fill(false));

  function dfs(r, c, node, prefix) {
    if (
      r < 0 || r >= boardSize ||
      c < 0 || c >= boardSize ||
      visited[r][c] ||
      !node[board[r][c]]
    ) return;

    visited[r][c] = true;
    node = node[board[r][c]];
    const word = prefix + board[r][c];

    if (node.$ && word.length >= 3) found.add(word);

    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr !== 0 || dc !== 0) {
          dfs(r + dr, c + dc, node, word);
        }
      }
    }

    visited[r][c] = false;
  }

  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      dfs(r, c, trie, "");
    }
  }

  wordListElement.innerHTML = "";
  [...found].sort().forEach(word => {
    const li = document.createElement("li");
    li.textContent = word;
    wordListElement.appendChild(li);
  });
}

function randomizeBoard() {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const inputs = boardElement.querySelectorAll("input");
  inputs.forEach(input => {
    input.value = letters[Math.floor(Math.random() * letters.length)];
  });
}

function startTimer() {
  let timeLeft = 60;
  timerElement.textContent = timeLeft;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    timerElement.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      alert("Time's up! Click 'Solve' to view results.");
    }
  }, 1000);
}

// Initialize
loadDefaultDictionary();
createBoard();
