"use strict";

// Global variables
const bookBody = document.querySelector(".book-content");
const search = document.getElementById("searchVal");
const searchBtn = document.querySelector(".search-btn");
const bookStatsEl = document.querySelectorAll(".stats");
const mostUsedCont = document.querySelector(".most-used-words");
const leastUsedCont = document.querySelector(".least-used-words");
const fontTypeBtn = document.querySelector(".font-type");

let formattedText = [];
let characters = [];
let charactersWithSpace = [];
let objWordCount = {};

// Create txt file references into DOM and load them dynamically.
function dynamicLoad() {
  objFiles.forEach((file, index) => {
    let filePTag = document.createElement("p");
    filePTag.setAttribute("onclick", `filePath(${index})`);
    filePTag.textContent = `${file.title}`;
    document.querySelector(".select-book").append(filePTag);
  });
}

// Reset DOM
function resetDom() {
  mostUsedCont.textContent = "";
  leastUsedCont.textContent = "";
  bookStatsEl[0].innerHTML =
    "<span>Word</span><p> found</p><span>0</span><p>times</p>";
}

// Fetch Book text data.
function fetchBook(url) {
  const myRequest = new Request(url);
  fetch(myRequest)
    .then((res) => res.text())
    .then((text) => loadTextFile(text));
}

// Load Book text data into DOM
function loadTextFile(text) {
  resetDom();

  // Split text into array of paragraphs.
  let currentBook_array = text.split("\r\n");

  bookBody.innerHTML =
    `<h1>${currentBook_array.shift()}</h1><br />` +
    `<p>${currentBook_array.splice(1, 1)}</p>` +
    currentBook_array.join("<br />");

  // Pass raw text to be formatted.
  formatText(text.toLowerCase());
  bookBody.scrollTop = 0;
}

// Get book index and access file url path.
function filePath(index) {
  const Url = objFiles[index].path;
  document.querySelector(".book-title h1").textContent = objFiles[index].title;

  fetchBook(Url);
}

// Format text
function formatText(book) {
  // Format text into words and remove spaces
  let wordsSplit = book
    .replace(/\r\n/g, "|")
    .split(/[\s\W+]/)
    .filter((word) => word !== "");

  // Filter common apostrophe words and return a new array.
  const apostropheWords = ["s", "ll", "t", "ve", "re", "m", "d"];
  formattedText = wordsSplit.filter((word) => !apostropheWords.includes(word));

  // Format text into characters with and without spaces
  characters = book
    .replace(/\r\n/g, "")
    .split("")
    .filter((char) => char !== " ");

  // Array of characters and spaces.
  charactersWithSpace = book.replace(/(?:\r\n)/g, "");
  charactersWithSpace = [...charactersWithSpace];

  bookStats();
  countWords();
}

// Book Statistics / Update DOM
function bookStats() {
  bookStatsEl[1].textContent = `Words found: ${formattedText.length}`;
  bookStatsEl[2].textContent = `Characters (No spaces): ${characters.length}`;
  bookStatsEl[3].textContent = `Characters (With Spaces): ${charactersWithSpace.length}`;
}

// Count each word and its occurrences
const countWords = () => {
  // Filter numbers
  let filteredArray = formattedText.filter((word) => !parseInt(word));

  // Count each word occurrence and store in an object
  const wordCount = {};
  filteredArray.forEach((word) => {
    // words[word] = (words[word] || 0) + 1;
    wordCount[word] = wordCount[word] ? ++wordCount[word] : 1;
  });

  // Call sortWords function.
  sortWords(wordCount);
};

// Filter stopwords array and Sort words in a descending order.
function sortWords(wordCount) {
  objWordCount = Object.keys(wordCount)
    .filter((word) => !stopWords.includes(word))
    .sort((a, b) => wordCount[b] - wordCount[a])
    .reduce((words, word) => {
      words[word] = wordCount[word];
      return words;
    }, {});

  // Call usedWords function.
  usedWords(objWordCount);
  return objWordCount;
}

// Find word, highlight word and its occurrences and Update DOM
function findWord() {
  // Remove any word highlighted
  bookBody.innerHTML = bookBody.innerHTML.replaceAll(/<(\/*)mark[^>]*>/g, "");

  // Local variable to store the input value all lowercase
  let searchValue = search.value.toLowerCase();

  // Highlight words
  if (searchValue != "") {
    let regex = new RegExp("\\b" + searchValue + "\\b", "gi");
    bookBody.innerHTML = bookBody.innerHTML.replace(
      regex,
      `<mark class="highlight">$&</mark>`
    );

    // Update DOM with number of occurrences of the found word.
    let markTagCount = document.getElementsByTagName("MARK");
    bookStatsEl[0].innerHTML = `<span>${searchValue}</span><p> found</p><span>${markTagCount.length}</span><p>times</p>`;
  } else {
    return undefined;
  }
}

// Find Most and Least used words
function usedWords(obj) {
  // Get 10 Most Used Words and 10 Least Used Words
  let objToSlice = Object.entries(obj);
  const mostUsedWords = objToSlice.slice(0, 10);
  const leastUsedWords = objToSlice.slice(-10, objToSlice.length);

  // Update DOM
  function mostAndLeast(array, parentTag, times) {
    array.forEach((wordPair) => {
      let pTag = document.createElement("p");
      pTag.textContent = `${
        wordPair[0].charAt(0).toUpperCase() + wordPair[0].slice(1)
      }: ${wordPair[1]} ${times}`;
      // Append
      parentTag.appendChild(pTag);
    });
  }
  mostAndLeast(mostUsedWords, mostUsedCont, "times");
  mostAndLeast(leastUsedWords, leastUsedCont, "time");
}

// Change Font type
function changeFontType() {
  let img = document.getElementById("font-svg");
  if (img.className == "serif") {
    bookBody.classList.add("change-font");
    img.classList.replace("serif", "sans-serif");
    img.setAttribute("src", "./images/SansSerif.svg");
    img.setAttribute("alt", "Sans-Serif Font Icon");
  } else {
    bookBody.classList.remove("change-font");
    img.classList.replace("sans-serif", "serif");
    img.setAttribute("src", "./images/Serif.svg");
    img.setAttribute("alt", "Serif Font Icon");
  }
}

// Increase and decrease font size.
function changeFontSize() {
  // Setting up variable to store default font size
  let fontSize = 16;
  const fontSizeText = document.querySelector(".font-size");
  // Event listeners to increase and decrease font size
  document
    .querySelector(".fontSize-decrement")
    .addEventListener("click", () => {
      fontSize--;
      // Conditional to set up a minimun font size
      return bookBody.style.fontSize == "12px"
        ? (fontSize = "12")
        : ((bookBody.style.fontSize = `${fontSize}px`),
          (fontSizeText.textContent = `${fontSize}px`));
    });

  document
    .querySelector(".fontSize-increment")
    .addEventListener("click", () => {
      fontSize++;
      // Conditional to set up a maximum font size
      return bookBody.style.fontSize == "20px"
        ? (fontSize = "20")
        : ((bookBody.style.fontSize = `${fontSize}px`),
          (fontSizeText.textContent = `${fontSize}px`));
    });
}

// Show and hide the font menu dinamically
function showHideFontMenu() {
  if (!document.querySelector(".btn-cont").hasAttribute("id")) {
    document.querySelector(".btn-cont").setAttribute("id", "hidden");
  } else {
    document.getElementById("hidden").removeAttribute("id");
  }
}

// Clear Search items and Highlighted words.
function clearSearchItems() {
  if (search.value === "") return;
  bookStatsEl[0].innerHTML =
    "<span>Word</span><p> found</p><span>0</span><p>times</p>";
  bookBody.innerHTML = bookBody.innerHTML.replaceAll(/<(\/*)mark[^>]*>/g, "");
  search.value = "";
}

// Event Listeners
searchBtn.addEventListener("click", findWord);
fontTypeBtn.addEventListener("click", changeFontType);
document.getElementById("close").addEventListener("click", showHideFontMenu);
document.querySelector(".clear").addEventListener("click", clearSearchItems);
document
  .querySelector(".font-menu")
  .addEventListener("click", showHideFontMenu);
// On load
dynamicLoad();
changeFontSize();
