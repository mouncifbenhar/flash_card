import {
  uid, slugify, escapeHtml,
  loadCollectionsData, saveCollectionsData
} from "./utils.js";

let data = loadCollectionsData();

const collectionsList = document.getElementById("collections-list");
const collectionSelect = document.getElementById("collection-select");
const createCollectionForm = document.getElementById("create-collection-form");
const createCardForm = document.getElementById("create-card-form");
const cardsArea = document.getElementById("cards-area");
const currentTitleEl = document.getElementById("current-collection-title");
const flashcardContainer = document.getElementById("flashcard-container");
const collectionInfo = document.getElementById("collection-info");
const cardCounter = document.getElementById("card-counter");

let currentCollectionId = null;
let currentIndex = 0;
let isFlipped = false;

function refreshUI() {
  collectionSelect.innerHTML = "";
  data.collections.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.title;
    collectionSelect.appendChild(opt);
  });

  collectionsList.innerHTML = "";
  data.collections.forEach((c) => {
    const item = document.createElement("div");
    item.className = "p-3 border rounded-lg flex justify-between items-center gap-3";
    item.innerHTML = `
      <div>
        <div class="font-medium">${escapeHtml(c.title)}</div>
        <div class="text-sm text-slate-500">${c.cards.length} carte(s)</div>
      </div>
      <div class="flex gap-2">
        <button data-id="${c.id}" class="open-collection px-2 py-1 bg-indigo-600 text-white rounded text-sm">Ouvrir</button>
        <button data-id="${c.id}" class="del-collection px-2 py-1 bg-red-100 text-red-700 rounded text-sm">Suppr.</button>
      </div>
    `;
    collectionsList.appendChild(item);
  });

  collectionInfo.textContent = `${data.collections.length} collection(s)`;

  if (currentCollectionId) {
    const col = data.collections.find((x) => x.id === currentCollectionId);
    if (!col) {
      cardsArea.classList.add("hidden");
      return;
    }
    cardsArea.classList.remove("hidden");
    currentTitleEl.textContent = col.title;
    renderCard();
  } else {
    cardsArea.classList.add("hidden");
  }
}

function openCollection(id) {
  currentCollectionId = id;
  currentIndex = 0;
  isFlipped = false;
  refreshUI();
}

function renderCard() {
  const col = data.collections.find((x) => x.id === currentCollectionId);
  if (!col) return;

  if (col.cards.length === 0) {
    flashcardContainer.innerHTML = `<div class="p-4 border rounded bg-slate-50">Aucune carte dans cette collection.</div>`;
    cardCounter.textContent = "";
    return;
  }

  if (currentIndex >= col.cards.length) currentIndex = 0;

  const card = col.cards[currentIndex];
  flashcardContainer.innerHTML = `
    <div class="w-full flex items-center justify-center">
      <div id="single-card"
        class="w-full max-w-2xl min-h-[140px] border rounded-xl p-6 bg-white flex items-center justify-center text-center text-lg cursor-pointer select-none hover:bg-slate-50 transition">
        ${isFlipped ? escapeHtml(card.answer) : escapeHtml(card.question)}
      </div>
    </div>
  `;

  cardCounter.textContent = `Carte ${currentIndex + 1} / ${col.cards.length}`;
}

createCollectionForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("collection-title").value.trim();
  if (!title) return alert("Titre requis");

  const base = slugify(title);
  const id = `${base}-${Math.random().toString(36).slice(2, 6)}`;

  data.collections.push({ id, title, cards: [] });
  saveCollectionsData(data);

  document.getElementById("collection-title").value = "";
  refreshUI();
});

createCardForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const collectionId = collectionSelect.value;
  const q = document.getElementById("card-question").value.trim();
  const a = document.getElementById("card-answer").value.trim();

  if (!q || !a) return alert("Question et réponse requises");

  const col = data.collections.find((c) => c.id === collectionId);
  if (!col) return alert("Collection introuvable");

  col.cards.push({ id: uid("c"), question: q, answer: a });
  saveCollectionsData(data);

  document.getElementById("card-question").value = "";
  document.getElementById("card-answer").value = "";

  // If current collection open
  if (currentCollectionId === collectionId) {
    isFlipped = false;
    currentIndex = col.cards.length - 1;
  }
  refreshUI();
});

collectionsList.addEventListener("click", (e) => {
  const openBtn = e.target.closest(".open-collection");
  const delBtn = e.target.closest(".del-collection");

  if (openBtn) {
    openCollection(openBtn.dataset.id);
  }

  if (delBtn) {
    const id = delBtn.dataset.id;
    if (!confirm("Supprimer cette collection ?")) return;

    data.collections = data.collections.filter((c) => c.id !== id);
    saveCollectionsData(data);

    if (currentCollectionId === id) currentCollectionId = null;
    refreshUI();
  }
});

document.getElementById("next-card").addEventListener("click", () => {
  const col = data.collections.find((x) => x.id === currentCollectionId);
  if (!col || col.cards.length === 0) return;
  currentIndex = (currentIndex + 1) % col.cards.length;
  isFlipped = false;
  renderCard();
});

document.getElementById("prev-card").addEventListener("click", () => {
  const col = data.collections.find((x) => x.id === currentCollectionId);
  if (!col || col.cards.length === 0) return;
  currentIndex = (currentIndex - 1 + col.cards.length) % col.cards.length;
  isFlipped = false;
  renderCard();
});

document.getElementById("flip-card").addEventListener("click", () => {
  isFlipped = !isFlipped;
  renderCard();
});

flashcardContainer.addEventListener("click", (e) => {
  const clicked = e.target.closest("#single-card");
  if (clicked) {
    isFlipped = !isFlipped;
    renderCard();
  }
});

refreshUI();
