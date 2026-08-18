const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".nav");
const notice = document.querySelector("#notice");

function animateFavorite(button, active) {
  button.setAttribute("aria-pressed", String(active));
  button.classList.remove("heart-pop");
  void button.offsetWidth;
  if (active) button.classList.add("heart-pop");
}

menuButton.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});

document.querySelector("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const query = encodeURIComponent(data.get("interest") || "");
  window.location.href = `things-to-do.html?q=${query}`;
});

document.querySelectorAll(".save-button").forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.toggle("saved");
    button.textContent = button.classList.contains("saved") ? "Saved ✓" : "View itinerary →";
  });
});

document.querySelectorAll(".heart").forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.toggle("heart-active");
    const active = button.classList.contains("heart-active");
    button.textContent = active ? "♥" : "♡";
    animateFavorite(button, active);
  });
});

document.querySelectorAll("[data-community-href]").forEach((card) => {
  const openPage = () => { window.location.href = card.dataset.communityHref; };
  card.addEventListener("click", (event) => { if (!event.target.closest(".post-card-heart")) openPage(); });
  card.addEventListener("keydown", (event) => { if ((event.key === "Enter" || event.key === " ") && !event.target.closest(".post-card-heart")) { event.preventDefault(); openPage(); } });
});

document.querySelectorAll(".follow-button").forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.toggle("following");
    button.textContent = button.classList.contains("following") ? "Following" : "Follow";
  });
});

document.querySelectorAll("[data-notice]").forEach((button) => {
  button.addEventListener("click", () => showNotice(button.dataset.notice));
});

const guidesScroll = document.querySelector("#guides-scroll");
document.querySelectorAll("[data-guide-scroll]").forEach((button) => {
  button.addEventListener("click", () => {
    guidesScroll.scrollBy({ top: Number(button.dataset.guideScroll) * 150, behavior: "smooth" });
  });
});

notice.addEventListener("click", () => { notice.hidden = true; });

function showNotice(message) {
  notice.textContent = `${message}  ×`;
  notice.hidden = false;
}

document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const track = carousel.querySelector("[data-carousel-track]");
  carousel.querySelectorAll("[data-carousel-direction]").forEach((button) => {
    button.addEventListener("click", () => track.scrollBy({ left: Number(button.dataset.carouselDirection) * 520, behavior: "smooth" }));
  });
});

document.querySelectorAll(".experience-heart").forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.toggle("saved");
    const active = button.classList.contains("saved");
    button.textContent = active ? "♥" : "♡";
    animateFavorite(button, active);
    showNotice(active ? "Experience saved to your Voyara collection." : "Experience removed from saved items.");
  });
});

document.querySelectorAll(".experience-card").forEach((card) => {
  card.addEventListener("click", (event) => {
    if (event.target.closest(".experience-heart")) return;
    const activityIds = {
      "Exuma Cays & Swimming Pigs": "exuma-cays",
      "Azure Beach Club Day Pass": "azure-day-pass",
      "Island Chef’s Table by the Water": "chef-table",
      "Small-Group Sunset Sail": "sunset-sail",
      "Hidden Eleuthera with a Local": "hidden-eleuthera",
      "Oceanfront Spa Ritual": "ocean-spa",
      "Turtle Cove Reef Cruise": "turtle-cove",
      "Sunset Beach Session": "sunset-beach-session",
      "Nassau Highlights & Tastings": "nassau-highlights",
      "Nassau Art Walk After Dark": "nassau-art-walk",
      "Exuma Sound Weekend": "exuma-sound-weekend"
    };
    const activityId = activityIds[card.querySelector("h3")?.textContent.trim()];
    if (activityId) window.location.href = `activity-detail.html?id=${encodeURIComponent(activityId)}`;
  });
});

document.querySelectorAll(".creator-carousel-section .creator-card").forEach((card) => {
  card.addEventListener("click", (event) => {
    if (event.target.closest(".follow-button")) return;
    window.location.href = "voyagers.html";
  });
});

if (!document.querySelector('script[data-account-menu]')) {
  const accountMenuScript = document.createElement("script");
  accountMenuScript.src = "account-menu.js?v=3";
  accountMenuScript.dataset.accountMenu = "true";
  document.head.append(accountMenuScript);
}

if (!document.querySelector('script[data-trip-cart]')) {
  const tripCartScript = document.createElement("script");
  tripCartScript.src = "trip-cart.js?v=3";
  tripCartScript.dataset.tripCart = "true";
  document.head.append(tripCartScript);
}
if (!document.querySelector('script[data-favorites]')) {
  const favoritesScript = document.createElement("script");
  favoritesScript.src = "favorites.js?v=2";
  favoritesScript.dataset.favorites = "true";
  document.head.append(favoritesScript);
}
