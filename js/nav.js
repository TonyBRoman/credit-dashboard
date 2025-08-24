document.addEventListener("DOMContentLoaded", () => {
  const tabsContainer = document.getElementById("tabsContainer");
  const cardDetails = document.getElementById("cardDetails");
  const editModal = document.getElementById("editModal");
  const editForm = document.getElementById("editCardForm");
  const closeModalBtn = document.getElementById("closeModal");

  if (!tabsContainer || !cardDetails) return;

  let cards = getCards();

  if (cards.length === 0) {
    tabsContainer.innerHTML = "<p>You don't have any cards, add one.</p>";
    return;
  }

  renderTabs();
  showCardDetails(cards[0]);

  // ---------------------------------------
  // Render dynamic and fixed tabs
  // ---------------------------------------
  function renderTabs() {
    tabsContainer.innerHTML = "";

    // --- FIXED TAB ---
    const summaryLink = document.createElement("a");
    summaryLink.textContent = "Summary";
    summaryLink.href = "summary.html";
    summaryLink.classList.add("tab");
    tabsContainer.appendChild(summaryLink);

    // --- DYNAMIC TABS ---
    cards.forEach((card, index) => {
      const tab = document.createElement("button");
      tab.textContent = card.name;
      tab.classList.add("tab");
      if (index === 0) tab.classList.add("active");

      tab.addEventListener("click", () => {
        setActiveTab(tab);
        showCardDetails(card);
      });

      tabsContainer.appendChild(tab);
    });

    // --- FIXED TAB ---
    const totalDebtLink = document.createElement("a");
    totalDebtLink.textContent = "Deuda Total";
    totalDebtLink.href = "total-debt.html";
    totalDebtLink.classList.add("tab");
    tabsContainer.appendChild(totalDebtLink);
  }

  // ---------------------------------------
  // Function to activate tabs
  // ---------------------------------------
  function setActiveTab(tab) {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
  }

  // ---------------------------------------
  // CALCULATION FUNCTIONS
  // ---------------------------------------
  function calcularFechaLimitePago(cutDay) {
    let fechaCorte = new Date();
    fechaCorte.setDate(cutDay);

    let fechaLimite = new Date(fechaCorte);
    fechaLimite.setDate(fechaCorte.getDate() + 20);

    // If Saturday (6) or Sunday (0), move to Friday.
    if (fechaLimite.getDay() === 6) {
      fechaLimite.setDate(fechaLimite.getDate() - 1);
    } else if (fechaLimite.getDay() === 0) {
      fechaLimite.setDate(fechaLimite.getDate() - 2);
    }
    return fechaLimite;
  }

  function calcularPagoMinimo(saldoUsado) {
    const minimo = saldoUsado * 0.05; // 5%
    return Math.max(minimo, 200); // minimum $200
  }

  function calcularInteresYIVA(saldoUsado, tasaAnual) {
    const tasaMensual = tasaAnual / 12 / 100;
    const interes = saldoUsado * tasaMensual;
    const iva = interes * 0.16; // IVA 16%
    return { interes, iva };
  }

  // ---------------------------------------
  // Show details of a card
  // ---------------------------------------
  function showCardDetails(card) {
    const saldoUsado = card.limit - card.available;

    const fechaLimite = calcularFechaLimitePago(card.cutDay);
    const pagoMinimo = calcularPagoMinimo(saldoUsado);
    const pagoNoIntereses = saldoUsado;
    const { interes, iva } = calcularInteresYIVA(saldoUsado, card.interest);

    cardDetails.innerHTML = `
      <div class="card-info" style="border-left: 5px solid ${card.color}">
        <h2>${card.name}</h2>
        <p><strong>Limit balance:</strong> $${card.limit.toFixed(2)}</p>
        <p><strong>Available balance:</strong> $${card.available.toFixed(2)}</p>
        <p><strong>Used balance:</strong> $${saldoUsado.toFixed(2)}</p>
        <p><strong>Annual interest rate (%):</strong> ${card.interest.toFixed(2)}%</p>
        <p><strong>Cut-off day:</strong> ${card.cutDay}</p>
        <hr>
        <p><strong>Payment deadline:</strong> ${fechaLimite.toLocaleDateString()}</p>
        <p><strong>Minimum payment:</strong> $${pagoMinimo.toFixed(2)}</p>
        <p><strong>Payment to avoid interest:</strong> $${pagoNoIntereses.toFixed(2)}</p>
        <p><strong>Estimated interest:</strong> $${interes.toFixed(2)}</p>
        <p><strong>VAT on interest:</strong> $${iva.toFixed(2)}</p>
        <div class="actions">
          <button id="editCardBtn">Edit</button>
          <button id="deleteCardBtn">Delete</button>
        </div>
      </div>
    `;

    // ---------- Delete card with dynamic modal ----------
    document.getElementById("deleteCardBtn").addEventListener("click", () => {
      showDeleteModal(card);
    });

    // ---------- Edit card ----------
    const editBtn = document.getElementById("editCardBtn");
    editBtn.onclick = () => {
      editModal.style.display = "flex";

      document.getElementById("editName").value = card.name;
      document.getElementById("editLimit").value = card.limit;
      document.getElementById("editAvailable").value = card.available;
      document.getElementById("editInterest").value = card.interest;
      document.getElementById("editCutDay").value = card.cutDay;
      document.getElementById("editColor").value = card.color;
    };
  }

  // ---------------------------------------
  // Save changes to the edit form
  // ---------------------------------------
  editForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const activeTab = document.querySelector(".tab.active");
    if (!activeTab) return;

    const card = cards.find(c => c.name === activeTab.textContent);
    if (!card) return;

    card.name = document.getElementById("editName").value;
    card.limit = parseFloat(document.getElementById("editLimit").value) || 0;
    card.available = parseFloat(document.getElementById("editAvailable").value) || 0;
    card.interest = parseFloat(document.getElementById("editInterest").value) || 0;
    card.cutDay = parseInt(document.getElementById("editCutDay").value) || 1;
    card.color = document.getElementById("editColor").value;

    saveCards(cards);
    renderTabs();
    showCardDetails(card);
    editModal.style.display = "none";
  });

  // ---------- Close edit modal ----------
  closeModalBtn.onclick = () => editModal.style.display = "none";
  editModal.addEventListener("click", (event) => {
    if (event.target === editModal) editModal.style.display = "none";
  });

  // ---------------------------------------
  // Dynamic deletion modal
  // ---------------------------------------
  function showDeleteModal(card) {
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.style.display = "flex";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(0,0,0,0.5)";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";
    modal.style.zIndex = "1000";

    const modalContent = document.createElement("div");
    modalContent.classList.add("modal-content");
    modalContent.style.background = "#fff";
    modalContent.style.padding = "20px";
    modalContent.style.borderRadius = "8px";
    modalContent.style.textAlign = "center";
    modalContent.innerHTML = `
      <p>Are you sure you want to delete the card "${card.name}"?</p>
      <button id="confirmDeleteBtn">Yes, delete</button>
      <button id="cancelDeleteBtn">Cancel</button>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    modalContent.querySelector("#confirmDeleteBtn").onclick = () => {
      cards = cards.filter(c => c.id !== card.id);
      saveCards(cards);
      renderTabs();
      if (cards.length > 0) {
        showCardDetails(cards[0]);
      } else {
        tabsContainer.innerHTML = "<p>You don't have any cards, add one.</p>";
        cardDetails.innerHTML = "";
      }
      document.body.removeChild(modal);
    };

    modalContent.querySelector("#cancelDeleteBtn").onclick = () => {
      document.body.removeChild(modal);
    };

    modal.addEventListener("click", (e) => {
      if (e.target === modal) document.body.removeChild(modal);
    });
  }
});
