async function searchBooks() {
  let resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  let query = document.getElementById("searchInput").value;
  let url = `https://openlibrary.org/search.json?q=${query}`;

  let response = await fetch(url);
  let data = await response.json();

  data.docs.slice(0, 10).forEach(book => {
    let title = book.title;
    let author;

    if (book.author_name) {
      author = book.author_name[0];
    } else {
      author = "Unknown";
    }

    let div = document.createElement("div");
    div.innerHTML = `
      <h3>${title}</h3>
      <p>${author}</p>
      <hr>
    `;

    resultsDiv.appendChild(div);
  });

  if (data.docs.length === 0) {
    resultsDiv.textContent = "No books found.";
  }
}
