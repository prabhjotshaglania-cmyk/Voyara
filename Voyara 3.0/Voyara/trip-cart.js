(() => {
  if (window.voyaraTripCartLoaded) return;
  window.voyaraTripCartLoaded = true;

  const icon = document.querySelector(".header .bag-icon");
  const trigger = icon?.closest("a, button");
  const actions = trigger?.parentElement;
  if (!icon || !trigger || !actions) return;

  trigger.setAttribute("aria-label", "Booked trips");
  trigger.setAttribute("aria-haspopup", "dialog");
  trigger.setAttribute("aria-expanded", "false");
  trigger.classList.add("trip-cart-trigger");

  const badge = document.createElement("span");
  badge.className = "trip-cart-badge";
  trigger.append(badge);

  const panel = document.createElement("section");
  panel.className = "trip-cart-panel";
  panel.hidden = true;
  panel.setAttribute("aria-label", "Your booked trips");
  panel.innerHTML = `<header><div><span class="trip-cart-eyebrow">YOUR VOYAGES</span><h2>Booked trips</h2></div><button type="button" class="trip-cart-close" aria-label="Close booked trips">×</button></header><div class="trip-cart-items"></div><footer class="trip-cart-footer"></footer>`;
  actions.append(panel);

  const itemsRoot = panel.querySelector(".trip-cart-items");
  const footer = panel.querySelector(".trip-cart-footer");
  const rootPrefix = location.pathname.includes("/html-preview/Voyara/") ? "../" : "";
  const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);
  const normalizeTravelers = (item) => {
    if (item.travelers) return { adults: Number(item.travelers.adults || 0), kids: Number(item.travelers.kids || 0), seniors: Number(item.travelers.seniors || 0) };
    return { adults: Number(item.guests || 2), kids: 0, seniors: 0 };
  };
  const readTrips = () => {
    const confirmed = JSON.parse(localStorage.getItem("voyara-latest-confirmation") || "null");
    const draft = JSON.parse(localStorage.getItem("voyara-booking-draft") || "null");
    if (confirmed?.item) return [{ ...confirmed.item, status: "Booked", storage: "confirmation" }];
    if (draft) return [{ ...draft, status: "Ready to book", storage: "draft" }];
    return [];
  };
  const saveTrip = (trip) => {
    const travelers = normalizeTravelers(trip);
    const guests = travelers.adults + travelers.kids + travelers.seniors;
    if (trip.storage === "confirmation") {
      const confirmation = JSON.parse(localStorage.getItem("voyara-latest-confirmation") || "null");
      if (confirmation?.item) localStorage.setItem("voyara-latest-confirmation", JSON.stringify({ ...confirmation, item: { ...confirmation.item, travelers, guests } }));
    } else {
      const draft = JSON.parse(localStorage.getItem("voyara-booking-draft") || "null");
      if (draft) localStorage.setItem("voyara-booking-draft", JSON.stringify({ ...draft, travelers, guests }));
    }
  };

  function render() {
    const trips = readTrips();
    badge.textContent = String(trips.length);
    badge.hidden = !trips.length;
    if (!trips.length) {
      itemsRoot.innerHTML = `<div class="trip-cart-empty"><span>⛵</span><strong>No booked trips yet</strong><p>Choose an activity and it will appear here while you plan.</p><a href="${rootPrefix}things-to-do.html">Explore activities</a></div>`;
      footer.innerHTML = "";
      return;
    }
    itemsRoot.innerHTML = trips.map((trip, index) => {
      const travelers = normalizeTravelers(trip);
      const adultOnly = trip.audience === "adult-only" || trip.adultOnly === true;
      return `<article class="trip-cart-item" data-trip-index="${index}">
        <div class="trip-cart-trip"><img src="${trip.image || "assets/voyara-hero-v2.png"}" alt=""><div><span>${trip.status}</span><h3>${trip.title || "Voyara experience"}</h3><p>${trip.date || "Flexible date"}${trip.time ? ` · ${trip.time}` : ""}</p></div></div>
        <div class="trip-cart-audience${adultOnly ? " is-adult-only" : ""}">
          ${adultOnly ? `<p class="trip-age-note">18+ experience · children cannot be added</p>` : ""}
          ${[["adults","Adults","18+"],["kids","Kids","0–17"],["seniors","Seniors","55+"]].map(([key,label,ages]) => `<div class="trip-traveler-row${adultOnly && key === "kids" ? " disabled" : ""}" data-traveler="${key}"><span><strong>${label}</strong><small>${ages}</small></span><div><button type="button" data-quantity="-1" aria-label="Remove ${label}">−</button><b>${travelers[key]}</b><button type="button" data-quantity="1" aria-label="Add ${label}">+</button></div></div>`).join("")}
        </div>
        <div class="trip-cart-item-total"><button type="button" class="trip-cart-remove" data-remove-trip aria-label="Remove ${trip.title || "trip"}"><span aria-hidden="true">⌫</span> Remove trip</button><span>${Object.values(travelers).reduce((sum, count) => sum + count, 0)} travelers</span><strong>${money(Number(trip.price || 0) * Object.values(travelers).reduce((sum, count) => sum + count, 0))}</strong></div>
      </article>`;
    }).join("");
    const trip = trips[0];
    const travelers = normalizeTravelers(trip);
    const totalTravelers = Object.values(travelers).reduce((sum, count) => sum + count, 0);
    footer.innerHTML = `<div><span>Estimated trip total</span><strong>${money(Number(trip.price || 0) * totalTravelers)}</strong></div><a href="${rootPrefix}${trip.storage === "confirmation" ? "itineraries.html" : "booking.html"}">${trip.storage === "confirmation" ? "View trip" : "Continue booking"}</a>`;

    itemsRoot.querySelectorAll("[data-quantity]").forEach((button) => button.addEventListener("click", () => {
      const card = button.closest("[data-trip-index]");
      const row = button.closest("[data-traveler]");
      const selected = trips[Number(card.dataset.tripIndex)];
      const counts = normalizeTravelers(selected);
      const key = row.dataset.traveler;
      if (row.classList.contains("disabled")) return;
      const next = Math.max(key === "adults" && counts.seniors === 0 ? 1 : 0, counts[key] + Number(button.dataset.quantity));
      counts[key] = next;
      if (counts.adults + counts.seniors < 1) counts.adults = 1;
      selected.travelers = counts;
      saveTrip(selected);
      render();
    }));
    itemsRoot.querySelectorAll("[data-remove-trip]").forEach((button) => button.addEventListener("click", () => {
      const selected = trips[Number(button.closest("[data-trip-index]").dataset.tripIndex)];
      if (selected.storage === "confirmation") localStorage.removeItem("voyara-latest-confirmation");
      else localStorage.removeItem("voyara-booking-draft");
      render();
    }));
  }

  const close = () => { panel.hidden = true; trigger.setAttribute("aria-expanded", "false"); };
  trigger.addEventListener("click", (event) => { event.preventDefault(); event.stopPropagation(); panel.hidden = !panel.hidden; trigger.setAttribute("aria-expanded", String(!panel.hidden)); if (!panel.hidden) render(); });
  panel.addEventListener("click", (event) => event.stopPropagation());
  panel.querySelector(".trip-cart-close").addEventListener("click", close);
  document.addEventListener("click", (event) => { if (!panel.contains(event.target) && !trigger.contains(event.target)) close(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") close(); });
  window.addEventListener("storage", render);
  render();
})();
