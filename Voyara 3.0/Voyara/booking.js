const bookingCatalog = {
  "turtle-cove": { title: "Turtle Cove Snorkeling", category: "Water adventure", location: "Nassau, The Bahamas", price: 145, duration: "3.5 hours", image: "https://images.unsplash.com/photo-1544550285-f813152fb2fd?auto=format&fit=crop&w=1200&q=84" },
  "nassau-city": { title: "Nassau Highlights Tour", category: "Tour & excursion", location: "Nassau, The Bahamas", price: 59, duration: "2.5 hours", image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1200&q=84" },
  "chef-table": { title: "Island Chef’s Table", category: "Food & dining", location: "Cable Beach, The Bahamas", price: 85, duration: "2 hours", image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=1200&q=84" },
  "ocean-spa": { title: "Oceanfront Spa Ritual", category: "Wellness & luxury", location: "Paradise Island, The Bahamas", price: 160, duration: "90 minutes", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=84" },
  "rose-island": { title: "Rose Island Boat Escape", category: "Water adventure", location: "Nassau, The Bahamas", price: 129, duration: "4 hours", image: "https://images.unsplash.com/photo-1540202404-a2f29016b523?auto=format&fit=crop&w=1200&q=84" }
};
document.querySelectorAll('a[href="discover.html"]').forEach((link) => {
  link.setAttribute("href", "index.html");
});
document.querySelector(".menu-button")?.addEventListener("click", (event) => {
  const nav = document.querySelector(".nav");
  const open = nav.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(open));
});
const money = (value) => `$${Number(value || 0).toLocaleString()}`;
const storedDraft = () => JSON.parse(localStorage.getItem("voyara-booking-draft") || "null") || { id: "turtle-cove", ...bookingCatalog["turtle-cove"], date: "", time: "9:30 AM", guests: 2 };

if (document.body.classList.contains("confirmation-page")) {
  const confirmation = JSON.parse(localStorage.getItem("voyara-latest-confirmation") || "null") || { number: "VOY-DEMO-001", customer: { name: "Voyara guest", email: "guest@example.com" }, item: storedDraft(), transport: { name: "Self arrival" }, payment: "Prototype card", total: 290 };
  document.querySelector("#confirmation-number").textContent = confirmation.number;
  document.querySelector("#ticket-title").textContent = confirmation.item.title;
  document.querySelector("#ticket-subtitle").textContent = `${confirmation.item.category} · ${confirmation.item.location}`;
  document.querySelector("#ticket-date").textContent = confirmation.item.date || "Flexible date";
  document.querySelector("#ticket-time").textContent = confirmation.item.time;
  const ticketTravelers = confirmation.item.travelers;
  document.querySelector("#ticket-guests").textContent = ticketTravelers ? `${ticketTravelers.adults || 0} adults · ${ticketTravelers.kids || 0} kids · ${ticketTravelers.seniors || 0} seniors` : `${confirmation.item.guests} guests`;
  document.querySelector("#ticket-transport").textContent = confirmation.transport.name;
  document.querySelector("#confirmation-grid").innerHTML = `<div class="confirmation-stat"><span>Traveler</span><strong>${confirmation.customer.name}</strong></div><div class="confirmation-stat"><span>Email</span><strong>${confirmation.customer.email}</strong></div><div class="confirmation-stat"><span>Payment</span><strong>${confirmation.payment}</strong></div><div class="confirmation-stat"><span>Total</span><strong>${money(confirmation.total)}</strong></div>`;
  document.querySelector("#copy-confirmation").addEventListener("click", async (event) => { try { await navigator.clipboard.writeText(confirmation.number); } catch {} event.currentTarget.textContent = "Copied ✓"; });
} else {
  const draft = storedDraft();
  let currentStep = 1;
  let selectedTime = draft.time || "9:30 AM";
  const dateInput = document.querySelector("#booking-date");
  if (!draft.date) { const nextDay = new Date(); nextDay.setDate(nextDay.getDate() + 1); draft.date = nextDay.toISOString().slice(0, 10); }
  dateInput.value = draft.date;
  const guestSelect = document.querySelector("#booking-guests");
  const travelerCounts = draft.travelers ? { adults:Number(draft.travelers.adults||0),kids:Number(draft.travelers.kids||0),seniors:Number(draft.travelers.seniors||0) } : { adults:Number(draft.guests||2),kids:0,seniors:0 };
  guestSelect.hidden = true;
  guestSelect.closest("label").insertAdjacentHTML("beforeend", `${draft.audience === "adult-only" ? '<small class="booking-age-notice">18+ experience · children are not permitted</small>' : ""}<div class="booking-traveler-picker">${[["adults","Adults","18+"],["kids","Kids","0–17"],["seniors","Seniors","55+"]].map(([key,label,ages])=>`<div class="booking-traveler-row${draft.audience === "adult-only" && key === "kids" ? " disabled" : ""}" data-booking-traveler="${key}"><span><b>${label}</b><small>${ages}</small></span><div><button type="button" data-booking-quantity="-1">−</button><strong>0</strong><button type="button" data-booking-quantity="1">+</button></div></div>`).join("")}</div>`);
  ["#booking-image", "#summary-image"].forEach((selector) => { document.querySelector(selector).src = draft.image || "assets/voyara-hero-v2.png"; });
  document.querySelector("#booking-title").textContent = draft.title;
  document.querySelector("#summary-title").textContent = draft.title;
  document.querySelector("#booking-category").textContent = draft.category;
  document.querySelector("#booking-location").textContent = `${draft.location} · ${draft.duration || "3 hours"}`;
  document.querySelector("#booking-unit-price").textContent = `${money(draft.price)} per guest`;
  const addons = () => [...document.querySelectorAll('input[name="addon"]:checked')].map((input) => ({ name: input.dataset.addonName, price: Number(input.value) }));
  const transport = () => { const input = document.querySelector('input[name="transport"]:checked'); return { name: input.dataset.transportName, price: Number(input.value) }; };
  const guests = () => travelerCounts.adults + travelerCounts.kids + travelerCounts.seniors;
  const travelerSummary = () => `${travelerCounts.adults} adults · ${travelerCounts.kids} kids · ${travelerCounts.seniors} seniors`;
  const total = () => draft.price * guests() + addons().reduce((sum, item) => sum + item.price, 0) + transport().price;
  function updateSummary() {
    draft.date = dateInput.value; draft.time = selectedTime; draft.guests = guests(); draft.travelers = {...travelerCounts};
    guestSelect.innerHTML = `<option value="${guests()}">${guests()} travelers</option>`; guestSelect.value = String(guests());
    localStorage.setItem("voyara-booking-draft", JSON.stringify(draft));
    document.querySelector("#summary-schedule").textContent = `${draft.date || "Choose date"} · ${selectedTime} · ${travelerSummary()}`;
    document.querySelector("#summary-base").textContent = money(draft.price * guests());
    document.querySelector("#summary-addons").textContent = money(addons().reduce((sum, item) => sum + item.price, 0));
    document.querySelector("#summary-transport").textContent = money(transport().price);
    document.querySelector("#summary-total").textContent = money(total());
    document.querySelector("#route-review").innerHTML = `<li><span>${selectedTime}</span><div><strong>${draft.title}</strong><small>${draft.location} · ${draft.duration || "3 hours"}</small></div><strong>${money(draft.price * guests())}</strong></li>`;
  }
  function renderReview() {
    document.querySelector("#booking-review").innerHTML = `<div class="review-block"><h3>Experience</h3><p><strong>${draft.title}</strong><br>${draft.date} at ${selectedTime}<br>${travelerSummary()}<br>${draft.location}</p></div><div class="review-block"><h3>Add-ons & transportation</h3><p>${addons().map((item) => item.name).join(", ") || "No add-ons"}<br>${transport().name}</p></div><div class="review-block"><h3>Traveler</h3><p>${document.querySelector("#customer-name").value || "Not entered"}<br>${document.querySelector("#customer-email").value || "Not entered"}</p></div><div class="review-block"><h3>Estimated total</h3><p><strong>${money(total())}</strong> · prototype payment only</p></div>`;
  }
  function showStep(step) {
    currentStep = step;
    document.querySelectorAll(".booking-step").forEach((panel) => panel.classList.toggle("active", Number(panel.dataset.step) === step));
    document.querySelectorAll(".step-marker").forEach((marker) => { const number = Number(marker.dataset.stepMarker); marker.classList.toggle("active", number === step); marker.classList.toggle("complete", number < step); });
    if (step === 5) renderReview();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  document.querySelectorAll(".time-option").forEach((button) => button.addEventListener("click", () => { document.querySelectorAll(".time-option").forEach((item) => item.classList.remove("selected")); button.classList.add("selected"); selectedTime = button.dataset.time; updateSummary(); }));
  document.querySelectorAll("[data-booking-quantity]").forEach((button)=>button.addEventListener("click",()=>{const row=button.closest("[data-booking-traveler]");if(row.classList.contains("disabled"))return;const key=row.dataset.bookingTraveler;travelerCounts[key]=Math.max(key==="adults"&&travelerCounts.seniors===0?1:0,travelerCounts[key]+Number(button.dataset.bookingQuantity));if(travelerCounts.adults+travelerCounts.seniors<1)travelerCounts.adults=1;document.querySelectorAll("[data-booking-traveler]").forEach((item)=>{item.querySelector("strong").textContent=travelerCounts[item.dataset.bookingTraveler]});updateSummary()}));
  document.querySelectorAll("[data-booking-traveler]").forEach((item)=>{item.querySelector("strong").textContent=travelerCounts[item.dataset.bookingTraveler]});
  document.querySelectorAll("[data-next]").forEach((button) => button.addEventListener("click", () => {
    const next = Number(button.dataset.next);
    if (next === 2 && !dateInput.value) return dateInput.focus();
    if (next === 5) { const name = document.querySelector("#customer-name"); const email = document.querySelector("#customer-email"); if (!name.value.trim()) return name.focus(); if (!email.checkValidity()) return email.reportValidity(); }
    showStep(next);
  }));
  document.querySelectorAll("[data-back]").forEach((button) => button.addEventListener("click", () => showStep(Number(button.dataset.back))));
  document.querySelectorAll(".step-marker").forEach((button) => button.addEventListener("click", () => { const step = Number(button.dataset.stepMarker); if (step <= currentStep) showStep(step); }));
  document.querySelectorAll('input[name="addon"],input[name="transport"],#booking-guests,#booking-date').forEach((control) => control.addEventListener("change", updateSummary));
  document.querySelectorAll('input[name="payment"]').forEach((input) => input.addEventListener("change", () => { document.querySelector("#prototype-card-field").style.display = input.checked && input.value !== "Prototype card" ? "none" : ""; }));
  document.querySelector("#confirm-booking").addEventListener("click", () => {
    if (!document.querySelector("#terms-check").checked) return alert("Please accept the prototype policies to continue.");
    const confirmation = { number: `VOY-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`, createdAt: new Date().toISOString(), item: { ...draft, date: dateInput.value, time: selectedTime, travelers:{...travelerCounts}, guests: guests() }, addons: addons(), transport: transport(), customer: { name: document.querySelector("#customer-name").value.trim(), email: document.querySelector("#customer-email").value.trim() }, payment: document.querySelector('input[name="payment"]:checked').value, total: total() };
    localStorage.setItem("voyara-latest-confirmation", JSON.stringify(confirmation));
    window.location.href = "booking-confirmation.html";
  });
  updateSummary();
}

if (!document.querySelector('script[data-account-menu]')) {
  const accountMenuScript = document.createElement("script");
  accountMenuScript.src = "account-menu.js?v=3";
  accountMenuScript.dataset.accountMenu = "true";
  document.head.append(accountMenuScript);
}

if (!document.querySelector('script[data-trip-cart]')) {
  const tripCartScript = document.createElement("script");
  tripCartScript.src = `${location.pathname.includes("/html-preview/Voyara/") ? "../" : ""}trip-cart.js?v=3`;
  tripCartScript.dataset.tripCart = "true";
  document.head.append(tripCartScript);
}
if (!document.querySelector('script[data-favorites]')) {
  const favoritesScript = document.createElement("script");
  favoritesScript.src = `${location.pathname.includes("/html-preview/Voyara/") ? "../" : ""}favorites.js?v=2`;
  favoritesScript.dataset.favorites = "true";
  document.head.append(favoritesScript);
}
