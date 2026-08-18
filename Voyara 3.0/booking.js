const bookingCatalog = {
  "turtle-cove": { title: "Turtle Cove Snorkeling", category: "Water adventure", location: "Nassau, The Bahamas", price: 145, duration: "3.5 hours", image: "https://images.unsplash.com/photo-1544550285-f813152fb2fd?auto=format&fit=crop&w=1200&q=84" },
  "nassau-city": { title: "Nassau Highlights Tour", category: "Tour & excursion", location: "Nassau, The Bahamas", price: 59, duration: "2.5 hours", image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1200&q=84" },
  "chef-table": { title: "Island Chef’s Table", category: "Food & dining", location: "Cable Beach, The Bahamas", price: 85, duration: "2 hours", image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=1200&q=84" },
  "ocean-spa": { title: "Oceanfront Spa Ritual", category: "Wellness & luxury", location: "Paradise Island, The Bahamas", price: 160, duration: "90 minutes", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=84" },
  "rose-island": { title: "Rose Island Boat Escape", category: "Water adventure", location: "Nassau, The Bahamas", price: 129, duration: "4 hours", image: "https://images.unsplash.com/photo-1540202404-a2f29016b523?auto=format&fit=crop&w=1200&q=84" }
};

const money = (amount) => `$${Number(amount).toLocaleString("en-US")}`;
const storedDraft = () => JSON.parse(localStorage.getItem("voyara-booking-draft") || "null") || { id: "turtle-cove", ...bookingCatalog["turtle-cove"], date: "", time: "9:00 AM", guests: 2 };

document.querySelectorAll('a[href="discover.html"]').forEach((link) => link.setAttribute("href", "index.html"));
document.querySelector(".menu-button")?.addEventListener("click", (event) => { const nav = document.querySelector(".nav"); const open = nav.classList.toggle("open"); event.currentTarget.setAttribute("aria-expanded", String(open)); });

if (document.body.classList.contains("confirmation-page")) {
  const confirmation = JSON.parse(localStorage.getItem("voyara-latest-confirmation") || "null") || { number: "VOY-DEMO-001", customer: { name: "Voyara guest", email: "guest@example.com" }, item: storedDraft(), payment: "Apple Pay", total: 304 };
  const travelers = confirmation.item.travelers || { adults: confirmation.item.guests || 2, kids: 0 };
  document.querySelector("#confirmation-number").textContent = confirmation.number;
  document.querySelector("#ticket-title").textContent = confirmation.item.title;
  document.querySelector("#ticket-subtitle").textContent = `${confirmation.item.category} · ${confirmation.item.location}`;
  document.querySelector("#ticket-date").textContent = confirmation.item.date || "Flexible date";
  document.querySelector("#ticket-time").textContent = confirmation.item.time;
  document.querySelector("#ticket-guests").textContent = `${travelers.adults || 0} adults · ${travelers.kids || 0} children`;
  const transportLine = document.querySelector("#ticket-transport")?.closest("div");
  if (transportLine) transportLine.remove();
  document.querySelector("#confirmation-grid").innerHTML = `<div class="confirmation-stat"><span>Booking</span><strong>${confirmation.number}</strong></div><div class="confirmation-stat"><span>Payment</span><strong>${confirmation.payment}</strong></div><div class="confirmation-stat"><span>Guests</span><strong>${travelers.adults || 0} adults · ${travelers.kids || 0} children</strong></div><div class="confirmation-stat"><span>Total</span><strong>${money(confirmation.total)}</strong></div>`;
  document.querySelector("#copy-confirmation")?.addEventListener("click", async (event) => { try { await navigator.clipboard.writeText(confirmation.number); } catch {} event.currentTarget.textContent = "Copied ✓"; });
} else {
  const draft = storedDraft();
  const travelers = { adults: Number(draft.travelers?.adults || draft.guests || 2), kids: Number(draft.travelers?.kids || 0) };
  const adultPrice = Number(draft.price || 89);
  const childPrice = Number(draft.childPrice || Math.round(adultPrice * .66));
  const serviceFee = 14;
  let selectedTime = draft.time || "9:00 AM";
  const dateInput = document.querySelector("#booking-date");
  if (!draft.date) { const nextDay = new Date(); nextDay.setDate(nextDay.getDate() + 1); draft.date = nextDay.toISOString().slice(0, 10); }
  dateInput.value = draft.date;

  ["#booking-image", "#summary-image"].forEach((selector) => { document.querySelector(selector).src = draft.image || "assets/voyara-hero-v2.png"; });
  document.querySelector("#booking-title").textContent = draft.title;
  document.querySelector("#summary-title").textContent = draft.title;
  document.querySelector("#booking-category").textContent = draft.category;
  document.querySelector("#booking-location").textContent = `${draft.location} · ${draft.duration || "3 hours"}`;
  document.querySelector("#adult-unit-price").textContent = money(adultPrice);
  document.querySelector("#child-unit-price").textContent = money(childPrice);

  const addons = () => [...document.querySelectorAll('input[name="addon"]:checked')].map((input) => ({ name: input.dataset.addonName, price: Number(input.value) }));
  const addonTotal = () => addons().reduce((sum, item) => sum + item.price, 0);
  const total = () => adultPrice * travelers.adults + childPrice * travelers.kids + addonTotal() + serviceFee;

  function render() {
    document.querySelectorAll("[data-booking-traveler]").forEach((row) => { row.querySelector("div > strong").textContent = travelers[row.dataset.bookingTraveler]; });
    document.querySelectorAll(".app-addon").forEach((label) => label.classList.toggle("selected", label.querySelector("input").checked));
    document.querySelectorAll(".app-payment").forEach((label) => label.classList.toggle("selected", label.querySelector("input").checked));
    document.querySelector("#adult-price-label").textContent = `Adults · ${travelers.adults} × ${money(adultPrice)}`;
    document.querySelector("#adult-price-total").textContent = money(adultPrice * travelers.adults);
    document.querySelector("#child-price-label").textContent = `Children · ${travelers.kids} × ${money(childPrice)}`;
    document.querySelector("#child-price-total").textContent = money(childPrice * travelers.kids);
    document.querySelector("#child-price-row").hidden = travelers.kids === 0;
    ["#summary-addons", "#side-addons"].forEach((selector) => document.querySelector(selector).textContent = money(addonTotal()));
    ["#summary-total", "#confirm-total", "#side-total"].forEach((selector) => document.querySelector(selector).textContent = money(total()));
    document.querySelector("#summary-adults").textContent = `${travelers.adults} × ${money(adultPrice)}`;
    document.querySelector("#summary-children").textContent = `${travelers.kids} × ${money(childPrice)}`;
    document.querySelector("#summary-schedule").textContent = `${dateInput.value || "Choose date"} · ${selectedTime}`;
    draft.date = dateInput.value; draft.time = selectedTime; draft.travelers = { ...travelers }; draft.guests = travelers.adults + travelers.kids; draft.childPrice = childPrice;
    localStorage.setItem("voyara-booking-draft", JSON.stringify(draft));
  }

  document.querySelectorAll(".time-option").forEach((button) => button.addEventListener("click", () => { document.querySelectorAll(".time-option").forEach((item) => item.classList.remove("selected")); button.classList.add("selected"); selectedTime = button.dataset.time; render(); }));
  document.querySelectorAll("[data-booking-quantity]").forEach((button) => button.addEventListener("click", () => { const row = button.closest("[data-booking-traveler]"); const key = row.dataset.bookingTraveler; const minimum = key === "adults" ? 1 : 0; travelers[key] = Math.max(minimum, travelers[key] + Number(button.dataset.bookingQuantity)); render(); }));
  document.querySelectorAll('input[name="addon"], input[name="payment"], #booking-date').forEach((control) => control.addEventListener("change", render));
  document.querySelector("#confirm-booking").addEventListener("click", () => {
    if (!dateInput.value) return dateInput.focus();
    if (!document.querySelector("#terms-check").checked) return alert("Please accept the prototype policies to continue.");
    const confirmation = { number: `VOY-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`, createdAt: new Date().toISOString(), item: { ...draft, travelers: { ...travelers } }, addons: addons(), customer: { name: "Voyara guest", email: "guest@example.com" }, payment: document.querySelector('input[name="payment"]:checked').value, total: total() };
    localStorage.setItem("voyara-latest-confirmation", JSON.stringify(confirmation));
    window.location.href = "booking-confirmation.html";
  });
  render();
}

if (!document.querySelector('script[data-account-menu]')) { const script = document.createElement("script"); script.src = "account-menu.js?v=3"; script.dataset.accountMenu = "true"; document.head.append(script); }
if (!document.querySelector('script[data-trip-cart]')) { const script = document.createElement("script"); script.src = "trip-cart.js?v=3"; script.dataset.tripCart = "true"; document.head.append(script); }
if (!document.querySelector('script[data-favorites]')) { const script = document.createElement("script"); script.src = "favorites.js?v=2"; script.dataset.favorites = "true"; document.head.append(script); }
