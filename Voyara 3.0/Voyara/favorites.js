(() => {
  if (window.voyaraFavoritesLoaded) return;
  window.voyaraFavoritesLoaded = true;
  const storageKey = "voyara-favorites-v1";
  const rootPrefix = location.pathname.includes("/html-preview/Voyara/") ? "../" : "";
  const read = () => { try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { return []; } };
  const write = (items) => localStorage.setItem(storageKey, JSON.stringify(items));
  const backgroundUrl = (element) => {
    const value = element?.style?.backgroundImage || getComputedStyle(element || document.body).backgroundImage;
    return value && value !== "none" ? value.replace(/^url\(["']?|["']?\)$/g, "") : "";
  };
  const cardFor = (button) => button.closest("[data-community-href],.experience-card,.result-card,.listing-card,.guides article,.voyager-ad-card,.post-card,.influencer-route-card");
  const detailsFor = (button) => {
    const card = cardFor(button);
    const title = card?.querySelector("h2,h3")?.textContent.trim() || button.getAttribute("aria-label")?.replace(/^(Save|Favorite)\s+/i, "") || document.title.split("|")[0].trim();
    const activityLinks = {"Exuma Cays & Swimming Pigs":"activity-detail.html?id=exuma-cays","Azure Beach Club Day Pass":"activity-detail.html?id=azure-day-pass","Island Chef’s Table by the Water":"activity-detail.html?id=chef-table","Small-Group Sunset Sail":"activity-detail.html?id=sunset-sail","Hidden Eleuthera with a Local":"activity-detail.html?id=hidden-eleuthera","Oceanfront Spa Ritual":"activity-detail.html?id=ocean-spa","Turtle Cove Reef Cruise":"activity-detail.html?id=turtle-cove","Sunset Beach Session":"activity-detail.html?id=sunset-beach-session","Nassau Highlights & Tastings":"activity-detail.html?id=nassau-highlights","Nassau Art Walk After Dark":"activity-detail.html?id=nassau-art-walk","Exuma Sound Weekend":"activity-detail.html?id=exuma-sound-weekend"};
    const guideLinks = {"Best Food in Nassau":"nassau-food-guide.html","The Perfect Day in Rose Island":"rose-island-itinerary.html","Girls Trip Weekend in Nassau":"girls-trip-itinerary.html"};
    const imageElement = card?.querySelector(".experience-card-image,.result-image,.listing-image,.voyager-ad-image,.route-cover,[style*='background-image']");
    const image = backgroundUrl(imageElement || card) || card?.querySelector("img")?.src || "assets/voyara-hero-v2.png";
    const linkRaw = card?.dataset.communityHref || activityLinks[title] || guideLinks[title] || card?.querySelector("h2 a,a.primary-action,a.result-image")?.getAttribute("href") || (card?.closest(".guides") ? "things-to-do.html?category=guides" : location.pathname.split("/").pop() + location.search);
    const link = linkRaw.replace(/^(\.\.\/)+/, "");
    const id = button.dataset.save || `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${link}`;
    const type = card?.querySelector(".pill,.listing-badge,.result-kicker")?.textContent.trim() || (card?.classList.contains("experience-card") ? "Experience" : "Voyara favorite");
    return { id, title, image, link, type, savedAt: Date.now() };
  };
  const active = (button) => button.classList.contains("saved") || button.classList.contains("heart-active");
  const setVisual = (button, isSaved) => {
    if (button.classList.contains("experience-heart") || button.classList.contains("save-card") || button.classList.contains("community-save-guide")) button.classList.toggle("saved", isSaved);
    else button.classList.toggle("heart-active", isSaved);
    button.setAttribute("aria-pressed", String(isSaved));
  };

  const favoriteButtons = [...document.querySelectorAll("button.heart,button.experience-heart,button.save-card,button.post-card-heart,button.community-save-guide")];
  favoriteButtons.forEach((button) => {
    const item = detailsFor(button);
    const exists = read().some((saved) => saved.id === item.id);
    if (exists) setVisual(button, true);
    button.addEventListener("click", () => {
      window.setTimeout(() => {
        let items = read();
        const isSaved = active(button);
        if (isSaved) items = [detailsFor(button), ...items.filter((saved) => saved.id !== item.id)];
        else items = items.filter((saved) => saved.id !== item.id);
        write(items);
        renderHeaderPreview();
        renderFavoritesPage();
      }, 0);
    });
  });

  const headerButton = document.querySelector(".header .heart-icon")?.closest("button,a");
  let panel;
  if (headerButton) {
    headerButton.classList.add("favorites-trigger");
    headerButton.setAttribute("aria-label", "Favorites");
    headerButton.setAttribute("aria-haspopup", "dialog");
    headerButton.setAttribute("aria-expanded", "false");
    panel = document.createElement("section");
    panel.className = "favorites-preview";
    panel.hidden = true;
    panel.innerHTML = `<header><div><span>YOUR COLLECTION</span><h2>Favorites</h2></div><button type="button" data-close-favorites aria-label="Close favorites">×</button></header><div data-recent-favorite></div><a class="favorites-view-all" href="${rootPrefix}favorites.html">View all favorites →</a>`;
    headerButton.parentElement.append(panel);
    const close = () => { panel.hidden = true; headerButton.setAttribute("aria-expanded", "false"); };
    headerButton.addEventListener("click", (event) => { event.preventDefault(); event.stopPropagation(); panel.hidden = !panel.hidden; headerButton.setAttribute("aria-expanded", String(!panel.hidden)); if (!panel.hidden) renderHeaderPreview(); });
    panel.addEventListener("click", (event) => event.stopPropagation());
    panel.querySelector("[data-close-favorites]").addEventListener("click", close);
    document.addEventListener("click", (event) => { if (!panel.contains(event.target) && !headerButton.contains(event.target)) close(); });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") close(); });
  }

  function renderHeaderPreview() {
    if (!panel) return;
    const latest = read().sort((a,b) => b.savedAt - a.savedAt)[0];
    const root = panel.querySelector("[data-recent-favorite]");
    root.innerHTML = latest ? `<p class="favorites-recent-label">Most recently saved</p><a class="favorites-recent-card" href="${rootPrefix}${latest.link}"><img src="${latest.image}" alt=""><span><small>${latest.type}</small><strong>${latest.title}</strong></span></a>` : `<div class="favorites-preview-empty"><span>♡</span><strong>No favorites yet</strong><p>Tap a heart to save something here.</p></div>`;
  }
  function renderFavoritesPage() {
    const grid = document.querySelector("#favorites-grid");
    if (!grid) return;
    const items = read().sort((a,b) => b.savedAt - a.savedAt);
    document.querySelector("#favorites-count").textContent = `${items.length} saved ${items.length === 1 ? "favorite" : "favorites"}`;
    grid.innerHTML = items.length ? items.map((item) => `<article class="favorite-page-card"><a href="${item.link}"><img src="${item.image}" alt=""><div><small>${item.type}</small><h2>${item.title}</h2><span>View favorite →</span></div></a><button type="button" data-remove-favorite="${item.id}" aria-label="Remove ${item.title}">♥</button></article>`).join("") : `<div class="favorites-page-empty"><span>♡</span><h2>Your favorites will live here</h2><p>Save activities, guides, itineraries and featured events with any heart button.</p><a href="index.html">Explore Voyara</a></div>`;
    grid.querySelectorAll("[data-remove-favorite]").forEach((button) => button.addEventListener("click", () => { write(read().filter((item) => item.id !== button.dataset.removeFavorite)); renderFavoritesPage(); renderHeaderPreview(); }));
  }
  renderHeaderPreview();
  renderFavoritesPage();
})();
