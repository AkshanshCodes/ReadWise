function createBookCard(book) {
  const card = document.createElement("div");
  card.className = "book-card";

  const cardInner = document.createElement("div");
  cardInner.className = "book-card-inner";

  let coverElement;

  if (book.cover_i) {
    coverElement = document.createElement("img");
    coverElement.src = "https://covers.openlibrary.org/b/id/" + book.cover_i + "-M.jpg";
    coverElement.alt = "Cover of " + book.title;
  } else {
    coverElement = document.createElement("div");
    coverElement.className = "book-cover-placeholder";
    coverElement.textContent = "No cover";
  }

  const details = document.createElement("div");
  details.className = "book-details";

  const title = document.createElement("h3");
  title.textContent = book.title;

  const author = document.createElement("p");
  author.textContent = book.author;

  let publishYearText = "Year unknown";
  if (book.first_publish_year) {
    publishYearText = book.first_publish_year;
  }

  const publishYear = document.createElement("p");
  publishYear.className = "book-meta";
  publishYear.textContent = publishYearText;

  const ebookStatus = document.createElement("p");
  ebookStatus.className = "book-meta";
  ebookStatus.textContent = "Ebook available: " + book.ebookText;

  details.appendChild(title);
  details.appendChild(author);
  details.appendChild(publishYear);
  details.appendChild(ebookStatus);

  cardInner.appendChild(coverElement);
  cardInner.appendChild(details);
  card.appendChild(cardInner);

  return card;
}

function setResultsTitle(title) {
  const resultsTitle = document.getElementById("resultsTitle");
  resultsTitle.textContent = title;
}

function showMessage(message, title) {
  const resultsDiv = document.getElementById("results");
  setResultsTitle(title || "");
  resultsDiv.innerHTML = "";
  resultsDiv.textContent = message;
}

function renderResults(books, title) {
  const resultsDiv = document.getElementById("results");
  setResultsTitle(title || "");
  resultsDiv.innerHTML = "";

  if (books.length === 0) {
    resultsDiv.textContent = "No books found.";
    return;
  }

  let i = 0;

  while (i < books.length) {
    const bookCard = createBookCard(books[i]);
    resultsDiv.appendChild(bookCard);
    i += 1;
  }
}

function formatBookData(book) {
  let author = "Unknown";
  let coverId = null;
  let publishYear = null;
  let title = "Untitled";
  let ebookText = "No";

  if (book.title) {
    title = book.title;
  }

  if (book.author_name && book.author_name.length > 0) {
    author = book.author_name[0];
  }

  if (book.cover_i) {
    coverId = book.cover_i;
  }

  if (book.first_publish_year) {
    publishYear = book.first_publish_year;
  }

  if (book.ebook_access && book.ebook_access !== "no_ebook") {
    ebookText = "Yes";
  } else if (book.has_fulltext) {
    ebookText = "Yes";
  }

  return {
    title: title,
    author: author,
    cover_i: coverId,
    first_publish_year: publishYear,
    ebookText: ebookText,
  };
}

function formatSubjectBookData(book) {
  let author = "Unknown";
  let coverId = null;
  let publishYear = null;
  let title = "Untitled";
  let ebookText = "No";

  if (book.title) {
    title = book.title;
  }

  if (book.authors && book.authors.length > 0 && book.authors[0].name) {
    author = book.authors[0].name;
  }

  if (book.cover_id) {
    coverId = book.cover_id;
  }

  if (book.first_publish_year) {
    publishYear = book.first_publish_year;
  }

  if (book.availability && book.availability.status) {
    ebookText = book.availability.status === "full access" ? "Yes" : "No";
  }

  return {
    title: title,
    author: author,
    cover_i: coverId,
    first_publish_year: publishYear,
    ebookText: ebookText,
  };
}

function buildBookList(rawBooks) {
  const books = [];
  let i = 0;

  while (i < rawBooks.length && i < 20) {
    const formattedBook = formatBookData(rawBooks[i]);
    books.push(formattedBook);
    i += 1;
  }

  return books;
}

function buildGenreBookList(rawBooks) {
  const books = [];
  let i = 0;
  let sourceBooks = [];

  if (rawBooks) {
    sourceBooks = rawBooks;
  }

  while (i < sourceBooks.length && i < 100) {
    const formattedBook = formatSubjectBookData(sourceBooks[i]);
    books.push(formattedBook);
    i += 1;
  }

  return books;
}

function formatGenreName(genreValue) {
  const words = genreValue.split("_");
  let formattedName = "";
  let i = 0;

  while (i < words.length) {
    const word = words[i];
    const firstLetter = word.charAt(0).toUpperCase();
    const restOfWord = word.slice(1);

    if (i === 0) {
      formattedName = firstLetter + restOfWord;
    } else {
      formattedName = formattedName + " " + firstLetter + restOfWord;
    }

    i += 1;
  }

  return formattedName;
}

async function searchBooks() {
  showMessage("Loading results...", "Search Results");

  const query = document.getElementById("searchInput").value.trim();
  if (!query) {
    showMessage("Please enter a search term.", "Search Results");
    return;
  }

  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  const data = await response.json();
  const books = buildBookList(data.docs);

  renderResults(books, 'Search Results for "' + query + '"');
}

async function browseGenre() {
  const genreSelect = document.getElementById("genreSelect");
  const selectedGenre = genreSelect.value;

  if (!selectedGenre) {
    showMessage("Please choose a genre first.", "Genre Books");
    return;
  }

  const genreName = formatGenreName(selectedGenre);
  showMessage("Loading genre books...", genreName + " Books");

  const url = "https://openlibrary.org/subjects/" + encodeURIComponent(selectedGenre) + ".json?limit=100";
  const response = await fetch(url);
  const data = await response.json();
  const books = buildGenreBookList(data.works);

  renderResults(books, genreName + " Books");
}

function setTheme(theme) {
  const isDarkTheme = theme === "dark";
  const themeToggleButton = document.getElementById("themeToggle");

  document.body.classList.toggle("dark-mode", isDarkTheme);
  document.body.classList.toggle("light-mode", !isDarkTheme);

  if (isDarkTheme) {
    themeToggleButton.textContent = "Light mode";
  } else {
    themeToggleButton.textContent = "Dark mode";
  }

  localStorage.setItem("preferredTheme", theme);
}

function toggleTheme() {
  const isDarkTheme = document.body.classList.contains("dark-mode");

  if (isDarkTheme) {
    setTheme("light");
  } else {
    setTheme("dark");
  }
}

window.addEventListener("DOMContentLoaded", function () {
  const savedTheme = localStorage.getItem("preferredTheme") || "light";
  setTheme(savedTheme);

  document.getElementById("themeToggle").addEventListener("click", toggleTheme);
});
