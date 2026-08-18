(() => {
  const track = document.querySelector("#profile-favorites-track");
  const count = document.querySelector("#profile-favorite-count");
  const readFavorites = () => { try { return JSON.parse(localStorage.getItem("voyara-favorites-v1") || "[]"); } catch { return []; } };
  const renderFavorites = () => {
    const items = readFavorites();
    if (count) count.textContent = `${items.length} saved`;
    if (!track) return;
    if (!items.length) { track.innerHTML = `<div class="profile-favorites-empty"><strong>No favourites yet.</strong> <a href="things-to-do.html">Explore experiences →</a></div>`; return; }
    track.innerHTML = items.map((item) => `<a class="profile-experience-card" href="${item.link || "favorites.html"}"><div style="background-image:url('${item.image || "assets/voyara-hero-v2.png"}')"><span>${item.type || "FAVOURITE"}</span></div><section><small>Saved for your next trip</small><h3>${item.title}</h3><p>View favourite →</p></section></a>`).join("");
  };
  document.querySelectorAll("[data-profile-carousel]").forEach((carousel) => {
    const track = carousel.querySelector(".profile-card-track");
    carousel.querySelectorAll("[data-slide]").forEach((button) => button.addEventListener("click", () => track?.scrollBy({ left: Number(button.dataset.slide) * 532, behavior: "smooth" })));
  });
  renderFavorites();
})();
