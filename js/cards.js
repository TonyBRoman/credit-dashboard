// --- Utilities for localStorage ---
function getCards() {
  const stored = localStorage.getItem("cards");
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCards(cards) {
  localStorage.setItem("cards", JSON.stringify(cards));
}

// --- Principal Flew ---
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addCardForm");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const newCard = {
        id: Date.now().toString(),
        name: document.getElementById("cardName").value,
        limit: parseFloat(document.getElementById("cardLimit").value) || 0,
        available: parseFloat(document.getElementById("cardAvailable").value) || 0,
        interest: parseFloat(document.getElementById("cardInterest").value) || 0,
        cutDay: parseInt(document.getElementById("cardCutDay").value) || 1,
        color: document.getElementById("cardColor").value,
        records: []
      };

      const cards = getCards();
      cards.push(newCard);
      saveCards(cards);

      window.location.href = "index.html";
    });
  }
});
