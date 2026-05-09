function createBookCard(book) {
  const card = document.createElement("div");
  card.className = "book-card";
  card.dataset.bookKey = createBookKey(book);

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
  author.className = "book-author";
  author.textContent = book.author;

  let publishYearText = "Year unknown";
  if (book.first_publish_year) {
    publishYearText = book.first_publish_year;
  }

  const metaRow = document.createElement("div");
  metaRow.className = "book-meta-row";

  const authorBadge = document.createElement("span");
  authorBadge.className = "book-meta";
  authorBadge.textContent = "By " + book.author;

  const publishYear = document.createElement("span");
  publishYear.className = "book-meta";
  publishYear.textContent = publishYearText;

  details.appendChild(title);
  details.appendChild(author);
  metaRow.appendChild(authorBadge);
  metaRow.appendChild(publishYear);
  details.appendChild(metaRow);

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.className = "save-book-button";
  updateSaveButton(saveButton, book);
  saveButton.addEventListener("click", function () {
    toggleSavedBook(book);
    updateSaveButton(saveButton, book);
  });

  const detailsButton = document.createElement("button");
  detailsButton.type = "button";
  detailsButton.className = "details-book-button";
  detailsButton.textContent = "Details";
  detailsButton.addEventListener("click", function () {
    openBookModal(book);
  });

  const actionRow = document.createElement("div");
  actionRow.className = "book-actions";
  actionRow.appendChild(detailsButton);
  actionRow.appendChild(saveButton);

  cardInner.appendChild(coverElement);
  cardInner.appendChild(details);
  cardInner.appendChild(actionRow);
  card.appendChild(cardInner);

  return card;
}

const savedBooksStorageKey = "savedBooks";
let currentModalBook = null;
let currentFeaturedBook = null;

const recommendedBooks = [
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    cover_i: 483518,
    first_publish_year: 1988,
    description: "A modern fable about following a dream and noticing the signs along the way.",
    subjects: ["Fiction", "Adventure", "Philosophy"],
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    cover_i: 12801113,
    first_publish_year: 2018,
    description: "A practical guide to building better habits through small, repeatable changes.",
    subjects: ["Self-help", "Habits", "Productivity"],
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    cover_i: 8101357,
    first_publish_year: 1965,
    description: "A sweeping science-fiction story of politics, survival, ecology, and power.",
    subjects: ["Science Fiction", "Adventure", "Politics"],
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    cover_i: 6979861,
    first_publish_year: 1937,
    description: "A cozy fantasy adventure about a reluctant hero, a long road, and a dragon's treasure.",
    subjects: ["Fantasy", "Adventure", "Classics"],
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    cover_i: 12645163,
    first_publish_year: 1813,
    description: "A sharp romantic classic about first impressions, family pressure, and social expectations.",
    subjects: ["Classics", "Romance", "Fiction"],
  },
  {
    title: "Educated",
    author: "Tara Westover",
    cover_i: 8755822,
    first_publish_year: 2018,
    description: "A memoir about family, isolation, education, and the difficult work of self-invention.",
    subjects: ["Memoir", "Biography", "Education"],
  },
];

function createBookKey(book) {
  return (book.title + "|" + book.author).toLowerCase();
}

function getSavedBooks() {
  const savedBooksJson = localStorage.getItem(savedBooksStorageKey);

  if (!savedBooksJson) {
    return [];
  }

  try {
    return JSON.parse(savedBooksJson);
  } catch (error) {
    return [];
  }
}

function saveBooksToStorage(books) {
  localStorage.setItem(savedBooksStorageKey, JSON.stringify(books));
}

function pickFeaturedBook() {
  const randomIndex = Math.floor(Math.random() * recommendedBooks.length);
  currentFeaturedBook = recommendedBooks[randomIndex];
}

function isBookSaved(book) {
  const savedBooks = getSavedBooks();
  const bookKey = createBookKey(book);
  let i = 0;

  while (i < savedBooks.length) {
    if (createBookKey(savedBooks[i]) === bookKey) {
      return true;
    }

    i += 1;
  }

  return false;
}

function updateSaveButton(button, book) {
  if (isBookSaved(book)) {
    button.textContent = "Saved";
    button.classList.add("is-saved");
    button.setAttribute("aria-label", "Remove " + book.title + " from reading list");
  } else {
    button.textContent = "Save Book";
    button.classList.remove("is-saved");
    button.setAttribute("aria-label", "Save " + book.title + " to reading list");
  }
}

function updateVisibleSaveButtons() {
  const buttons = document.querySelectorAll(".book-card");
  let i = 0;

  while (i < buttons.length) {
    const card = buttons[i];
    const saveButton = card.querySelector(".save-book-button");
    const book = {
      title: card.querySelector("h3").textContent,
      author: card.querySelector(".book-author").textContent,
    };

    updateSaveButton(saveButton, book);
    i += 1;
  }
}

function toggleSavedBook(book) {
  const savedBooks = getSavedBooks();
  const bookKey = createBookKey(book);
  const updatedBooks = [];
  let bookWasSaved = false;
  let i = 0;

  while (i < savedBooks.length) {
    if (createBookKey(savedBooks[i]) === bookKey) {
      bookWasSaved = true;
    } else {
      updatedBooks.push(savedBooks[i]);
    }

    i += 1;
  }

  if (!bookWasSaved) {
    updatedBooks.unshift({ ...book, status: book.status || "want-to-read", savedAt: Date.now() });
  }

  saveBooksToStorage(updatedBooks);
  renderReadingList();
  updateVisibleSaveButtons();
  updateFeaturedSaveButton();
}

function renderReadingList() {
  const savedBooksContainer = document.getElementById("savedBooks");
  const savedCount = document.getElementById("savedCount");
  const savedBooks = getSavedBooks();

  savedBooksContainer.innerHTML = "";
  savedCount.textContent = savedBooks.length;

  if (savedBooks.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "saved-empty";
    emptyMessage.textContent = "Save books from recommendations or search results to build your list.";
    savedBooksContainer.appendChild(emptyMessage);
    return;
  }

  let i = 0;

  while (i < savedBooks.length) {
    const book = savedBooks[i];
    const savedBook = document.createElement("div");
    savedBook.className = "saved-book";

    const savedBookCopy = document.createElement("div");
    const title = document.createElement("p");
    title.className = "saved-book-title";
    title.textContent = book.title;

    const author = document.createElement("p");
    author.className = "saved-book-author";
    author.textContent = book.author;

    const statusSelect = document.createElement("select");
    statusSelect.className = "status-select";
    statusSelect.setAttribute("aria-label", "Reading status for " + book.title);
    const statusOptions = [
      { value: "want-to-read", label: "Want to Read" },
      { value: "reading", label: "Reading" },
      { value: "finished", label: "Finished" }
    ];
    let j = 0;
    while (j < statusOptions.length) {
      const opt = document.createElement("option");
      opt.value = statusOptions[j].value;
      opt.textContent = statusOptions[j].label;
      if (book.status === statusOptions[j].value) {
        opt.selected = true;
      }
      statusSelect.appendChild(opt);
      j += 1;
    }
    statusSelect.addEventListener("change", function () {
      updateBookStatus(book, this.value);
    });

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-saved-button";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", function () {
      toggleSavedBook(book);
    });

    savedBookCopy.appendChild(title);
    savedBookCopy.appendChild(author);
    savedBookCopy.appendChild(statusSelect);
    savedBook.appendChild(savedBookCopy);
    savedBook.appendChild(removeButton);
    savedBooksContainer.appendChild(savedBook);
    i += 1;
  }
}

function renderFeaturedBook() {
  if (!currentFeaturedBook) {
    pickFeaturedBook();
  }

  const featuredCover = document.getElementById("featuredCover");
  const featuredTitle = document.getElementById("featuredTitle");
  const featuredAuthor = document.getElementById("featuredAuthor");
  const featuredDescription = document.getElementById("featuredDescription");

  featuredCover.src = "https://covers.openlibrary.org/b/id/" + currentFeaturedBook.cover_i + "-L.jpg";
  featuredCover.alt = "Cover of " + currentFeaturedBook.title;
  featuredTitle.textContent = currentFeaturedBook.title;
  featuredAuthor.textContent = "By " + currentFeaturedBook.author + " - " + currentFeaturedBook.first_publish_year;
  featuredDescription.textContent = currentFeaturedBook.description;
  updateFeaturedSaveButton();
}

function updateFeaturedSaveButton() {
  const featuredSaveButton = document.getElementById("featuredSave");

  if (featuredSaveButton && currentFeaturedBook) {
    updateSaveButton(featuredSaveButton, currentFeaturedBook);
  }
}

function getCoverUrl(book, size) {
  if (!book.cover_i) {
    return "";
  }

  return "https://covers.openlibrary.org/b/id/" + book.cover_i + "-" + size + ".jpg";
}

function getOpenLibraryUrl(book) {
  if (book.key) {
    return "https://openlibrary.org" + book.key;
  }

  return "https://openlibrary.org/search?q=" + encodeURIComponent(book.title + " " + book.author);
}

function getBookDescription(book) {
  if (book.description) {
    return book.description;
  }

  if (book.first_sentence) {
    return book.first_sentence;
  }

  return "More details may be available on Open Library.";
}

function renderModalSubjects(subjects) {
  const modalSubjects = document.getElementById("modalSubjects");
  modalSubjects.innerHTML = "";

  if (!subjects || subjects.length === 0) {
    return;
  }

  let i = 0;

  while (i < subjects.length && i < 5) {
    const subject = document.createElement("span");
    subject.className = "subject-chip";
    subject.textContent = subjects[i];
    modalSubjects.appendChild(subject);
    i += 1;
  }
}

function openBookModal(book) {
  currentModalBook = book;

  const modal = document.getElementById("bookModal");
  const modalCover = document.getElementById("modalCover");
  const modalCoverWrap = modalCover.parentElement;
  const modalTitle = document.getElementById("modalTitle");
  const modalAuthor = document.getElementById("modalAuthor");
  const modalDescription = document.getElementById("modalDescription");
  const modalMeta = document.getElementById("modalMeta");
  const modalOpenLibrary = document.getElementById("modalOpenLibrary");
  const modalSave = document.getElementById("modalSave");
  const coverUrl = getCoverUrl(book, "L");

  if (coverUrl) {
    modalCover.hidden = false;
    modalCover.src = coverUrl;
    modalCover.alt = "Cover of " + book.title;
    modalCoverWrap.removeAttribute("data-empty-message");
    modalCoverWrap.removeAttribute("aria-label");
  } else {
    modalCover.hidden = true;
    modalCover.removeAttribute("src");
    modalCover.alt = "";
    modalCoverWrap.setAttribute("data-empty-message", "No cover available");
    modalCoverWrap.setAttribute("aria-label", "No cover available");
  }

  modalTitle.textContent = book.title;
  modalAuthor.textContent = "By " + book.author;
  modalDescription.textContent = getBookDescription(book);
  modalOpenLibrary.href = getOpenLibraryUrl(book);
  updateSaveButton(modalSave, book);

  modalMeta.innerHTML = "";

  if (book.first_publish_year) {
    const year = document.createElement("span");
    year.className = "modal-meta";
    year.textContent = "First published " + book.first_publish_year;
    modalMeta.appendChild(year);
  }

  if (book.edition_count) {
    const editions = document.createElement("span");
    editions.className = "modal-meta";
    editions.textContent = book.edition_count + " editions";
    modalMeta.appendChild(editions);
  }

  renderModalSubjects(book.subjects);
  modal.hidden = false;
  document.body.classList.add("modal-open");
}

function closeBookModal() {
  const modal = document.getElementById("bookModal");
  modal.hidden = true;
  currentModalBook = null;
  document.body.classList.remove("modal-open");
}

function setupGenreChips() {
  const genreChips = document.querySelectorAll(".genre-chip");
  let i = 0;

  while (i < genreChips.length) {
    genreChips[i].addEventListener("click", function (event) {
      const genre = event.currentTarget.dataset.genre;
      document.getElementById("genreSelect").value = genre;
      browseGenre();
    });

    i += 1;
  }
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

  return {
    title: title,
    author: author,
    cover_i: coverId,
    first_publish_year: publishYear,
    edition_count: book.edition_count,
    first_sentence: Array.isArray(book.first_sentence) ? book.first_sentence[0] : book.first_sentence,
    key: book.key,
    subjects: book.subject ? book.subject.slice(0, 8) : [],
  };
}

function formatSubjectBookData(book) {
  let author = "Unknown";
  let coverId = null;
  let publishYear = null;
  let title = "Untitled";

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

  return {
    title: title,
    author: author,
    cover_i: coverId,
    first_publish_year: publishYear,
    edition_count: book.edition_count,
    key: book.key,
    subjects: book.subject ? book.subject.slice(0, 8) : [],
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

function migrateBooks() {
  const books = getSavedBooks();
  let i = 0;
  while (i < books.length) {
    if (!books[i].status) {
      books[i].status = "want-to-read";
    }
    if (!books[i].savedAt) {
      books[i].savedAt = Date.now();
    }
    i += 1;
  }
  saveBooksToStorage(books);
}

function updateBookStatus(book, newStatus) {
  const books = getSavedBooks();
  const key = createBookKey(book);
  let i = 0;
  while (i < books.length) {
    if (createBookKey(books[i]) === key) {
      books[i].status = newStatus;
    }
    i += 1;
  }
  saveBooksToStorage(books);
}

function refreshStatCards() {
  const books = getSavedBooks();
  let wantCount = 0;
  let readingCount = 0;
  let finishedCount = 0;
  let i = 0;
  while (i < books.length) {
    if (books[i].status === "reading") {
      readingCount += 1;
    } else if (books[i].status === "finished") {
      finishedCount += 1;
    } else {
      wantCount += 1;
    }
    i += 1;
  }
  animateCount("statTotalNum", books.length);
  animateCount("statWantNum", wantCount);
  animateCount("statReadingNum", readingCount);
  animateCount("statFinishedNum", finishedCount);
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) {
    return;
  }
  const start = parseInt(el.textContent, 10) || 0;
  const duration = 480;
  const startTime = performance.now();
  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + (target - start) * eased);
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

function switchTab(tab) {
  const isStats = tab === "stats";
  document.getElementById("discoverView").classList.toggle("view--hidden", isStats);
  document.getElementById("statsView").classList.toggle("view--hidden", !isStats);
  document.getElementById("tabDiscover").classList.toggle("tab-btn--active", !isStats);
  document.getElementById("tabStats").classList.toggle("tab-btn--active", isStats);
  if (isStats) {
    const ids = ["statTotalNum", "statWantNum", "statReadingNum", "statFinishedNum"];
    let i = 0;
    while (i < ids.length) {
      const el = document.getElementById(ids[i]);
      if (el) {
        el.textContent = "0";
      }
      i += 1;
    }
    refreshStatCards();
  }
}

window.addEventListener("DOMContentLoaded", function () {
  const savedTheme = localStorage.getItem("preferredTheme") || "light";
  setTheme(savedTheme);
  migrateBooks();
  renderFeaturedBook();
  renderReadingList();
  renderResults(recommendedBooks, "Recommended Books");
  setupGenreChips();

  document.getElementById("tabDiscover").addEventListener("click", function () {
    switchTab("discover");
  });
  document.getElementById("tabStats").addEventListener("click", function () {
    switchTab("stats");
  });
  document.getElementById("themeToggle").addEventListener("click", toggleTheme);
  document.getElementById("featuredSave").addEventListener("click", function () {
    toggleSavedBook(currentFeaturedBook);
  });
  document.getElementById("featuredSearch").addEventListener("click", function () {
    document.getElementById("searchInput").value = currentFeaturedBook.author;
    searchBooks();
  });
  document.getElementById("featuredDetails").addEventListener("click", function () {
    openBookModal(currentFeaturedBook);
  });
  document.getElementById("modalClose").addEventListener("click", closeBookModal);
  document.getElementById("bookModal").addEventListener("click", function (event) {
    if (event.target.id === "bookModal") {
      closeBookModal();
    }
  });
  document.getElementById("modalSave").addEventListener("click", function (event) {
    if (currentModalBook) {
      toggleSavedBook(currentModalBook);
      updateSaveButton(event.currentTarget, currentModalBook);
    }
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !document.getElementById("bookModal").hidden) {
      closeBookModal();
    }
  });
  document.getElementById("searchInput").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      searchBooks();
    }
  });
});

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
