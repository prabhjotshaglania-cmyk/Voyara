const form = document.querySelector("#personalized-form");
const notice = document.querySelector("#prototype-notice");

const words = {
  balanced: ["Balanced Escape", "A thoughtful mix of signature experiences and unhurried island time."],
  adventure: ["Adventure Route", "An energetic plan built around water, wildlife and memorable island stops."],
  relaxed: ["Slow Island Reset", "A spacious plan with beaches, wellness and room to follow the moment."],
  culture: ["Flavours & Culture Trail", "A locally rooted plan led by food, heritage and neighbourhood discoveries."],
};

function updatePlan() {
  const data = new FormData(form);
  const island = data.get("island");
  const days = Number(data.get("days"));
  const style = data.get("style");
  const interests = data.getAll("interest");
  const [name, summary] = words[style];
  document.querySelector("#result-title").textContent = `${island} ${name}`;
  document.querySelector("#result-summary").textContent = summary;
  document.querySelector("#preview-title").textContent = `${island} · ${name}`;
  document.querySelector("#preview-meta").textContent = `${days} ${days === 1 ? "day" : "days"} · ${interests.slice(0, 3).join(", ") || "Flexible discovery"}`;
  document.querySelector("#match-score").textContent = `${Math.min(98, 88 + interests.length * 2)}%`;
}

form?.addEventListener("input", updatePlan);
form?.addEventListener("submit", (event) => {
  event.preventDefault();
  localStorage.setItem("voyara-itinerary-preferences", JSON.stringify(Object.fromEntries(new FormData(form))));
  if (notice) { notice.textContent = "Your itinerary preferences were saved."; notice.hidden = false; window.setTimeout(() => { notice.hidden = true; }, 2400); }
});

document.querySelector("#build-plan")?.addEventListener("click", () => {
  if (notice) { notice.textContent = "Your personalized itinerary is ready to customize."; notice.hidden = false; window.setTimeout(() => { window.location.href = "itineraries.html"; }, 700); }
});

updatePlan();
