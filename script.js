const API_KEY = "3a91748452329fc03b9f666534ec6c95";

const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/original";

// ✅ FIXED URLS (API KEY INCLUDED PROPERLY)
const rowsData = [
  { title: "Trending", url: `${BASE}/trending/all/week?api_key=${API_KEY}` },
  { title: "Top Rated", url: `${BASE}/movie/top_rated?api_key=${API_KEY}` },
  { title: "Action", url: `${BASE}/discover/movie?api_key=${API_KEY}&with_genres=28` },
  { title: "Comedy", url: `${BASE}/discover/movie?api_key=${API_KEY}&with_genres=35` },
];

// ELEMENTS
const banner = document.getElementById("banner");
const title = document.getElementById("title");
const desc = document.getElementById("desc");
const rows = document.getElementById("rows");

const modal = document.getElementById("modal");
const trailerFrame = document.getElementById("trailer");

// NAV SCROLL
window.addEventListener("scroll", () => {
  document.getElementById("nav").classList.toggle("nav_black", window.scrollY > 50);
});
document.getElementById("playBtn").onclick = async () => {
  try {
    const res = await fetch(`${BASE}/trending/all/week?api_key=${API_KEY}`);
    const data = await res.json();

    const movie = data.results[0]; // banner movie

    openTrailer(movie); // reuse your trailer function

  } catch (err) {
    console.error("Play error:", err);
  }
};
let myList = [];

document.getElementById("myListBtn").onclick = () => {
  const movieName = document.getElementById("title").innerText;

  if (!myList.includes(movieName)) {
    myList.push(movieName);
    alert(`${movieName} added to My List ❤️`);
  } else {
    alert("Already in your list 😄");
  }

  console.log("My List:", myList);
};
function getMyList() {
  return JSON.parse(localStorage.getItem("myList")) || [];
}

function saveMyList(list) {
  localStorage.setItem("myList", JSON.stringify(list));
}
function toggleMyList(movie) {
  let list = getMyList();

  const exists = list.find(m => m.id === movie.id);

  if (exists) {
    list = list.filter(m => m.id !== movie.id);
    alert("Removed from My List ❌");
  } else {
    list.push(movie);
    alert("Added to My List ❤️");
  }

  saveMyList(list);
  renderMyList();
}
// 🎥 BANNER
async function loadBanner() {
  try {
    const res = await fetch(rowsData[0].url);
    const data = await res.json();

    const movie = data.results[Math.floor(Math.random() * data.results.length)];

    banner.style.backgroundImage = `url(${IMG}${movie.backdrop_path})`;
    title.innerText = movie.title || movie.name || "No Title";
    desc.innerText = movie.overview || "No description";

  } catch (err) {
    console.error("Banner Error:", err);
  }
}
document.getElementById("myListBtn").onclick = () => {
  const movie = {
    id: Date.now(),
    title: document.getElementById("title").innerText,
    poster_path: banner.style.backgroundImage.split('"')[1]
  };

  toggleMyList(movie);
};
function renderMyList() {
  const section = document.getElementById("myListSection");
  const container = document.getElementById("myListRow");

  const list = getMyList();

  container.innerHTML = "";

  if (list.length === 0) {
    section.style.display = "none";
    return;
  }

  section.style.display = "block";

  list.forEach(movie => {
    const img = document.createElement("img");
    img.classList.add("poster");

    img.src = movie.poster_path.startsWith("http")
      ? movie.poster_path
      : IMG + movie.poster_path;

    img.onclick = () => openTrailer(movie);

    // remove on right click
    img.oncontextmenu = (e) => {
      e.preventDefault();
      toggleMyList(movie);
    };

    container.appendChild(img);
  });
}
// 🎞 ROWS
async function createRow(row) {
  try {
    const res = await fetch(row.url);
    const data = await res.json();

    const div = document.createElement("div");
    div.classList.add("row");

    const h2 = document.createElement("h2");
    h2.innerText = row.title;

    const posters = document.createElement("div");
    posters.classList.add("row_posters");

    data.results.forEach(movie => {
      if (!movie.poster_path) return;

      const img = document.createElement("img");
      img.src = IMG + movie.poster_path;
      img.classList.add("poster");

      // ✅ CLICK FIX
      img.onclick = () => openTrailer(movie);

img.oncontextmenu = (e) => {
  e.preventDefault();
  toggleMyList(movie); // right-click to save/remove
};

      posters.appendChild(img);
    });

    div.appendChild(h2);
    div.appendChild(posters);
    rows.appendChild(div);

  } catch (err) {
    console.error("Row Error:", err);
  }
}

// 🎬 TRAILER (FULL FIX)
async function openTrailer(movie) {
  try {
    const type = movie.media_type === "tv" ? "tv" : "movie";

    const res = await fetch(`${BASE}/${type}/${movie.id}/videos?api_key=${API_KEY}`);
    const data = await res.json();

    console.log("Trailer Data:", data);

    let trailer = data.results.find(
      v => v.type === "Trailer" && v.site === "YouTube"
    );

    if (!trailer && data.results.length > 0) {
      trailer = data.results[0];
    }

    if (!trailer) {
      alert("No trailer available 😢");
      return;
    }

    trailerFrame.src = `https://www.youtube.com/embed/${trailer.key}`;
    modal.style.display = "block";

  } catch (err) {
    console.error("Trailer Error:", err);
  }
}

// CLOSE MODAL
document.getElementById("close").onclick = () => {
  modal.style.display = "none";
  trailerFrame.src = "";
};

// 🔍 SEARCH
document.getElementById("searchBtn")?.addEventListener("click", async () => {
  const query = document.getElementById("search").value.trim();

  if (!query) return alert("Enter something!");

  try {
    const res = await fetch(`${BASE}/search/multi?api_key=${API_KEY}&query=${query}`);
    const data = await res.json();

    rows.innerHTML = "";

    renderCustomRow("Search Results", data.results);

  } catch (err) {
    console.error(err);
  }
});

// 🎯 RENDER SEARCH
function renderCustomRow(titleText, movies) {
  const div = document.createElement("div");
  div.classList.add("row");

  const h2 = document.createElement("h2");
  h2.innerText = titleText;

  const posters = document.createElement("div");
  posters.classList.add("row_posters");

  movies.forEach(movie => {
    if (!movie.poster_path) return;

    const img = document.createElement("img");
    img.src = IMG + movie.poster_path;
    img.classList.add("poster");

    img.onclick = () => openTrailer(movie);

    posters.appendChild(img);
  });

  div.appendChild(h2);
  div.appendChild(posters);
  rows.appendChild(div);
}

// 🚀 INIT
function init() {
  loadBanner();
  rowsData.forEach(createRow);
}

init(renderMyList());