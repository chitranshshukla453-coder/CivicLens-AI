
// Report Issue buttons
const reportButtons = [
  document.getElementById("reportBtn"),
  document.getElementById("heroReportBtn")
];

reportButtons.forEach((button) => {
  if (button) {
    button.addEventListener("click", () => {
      window.location.href = "report.html";
    });
  }
});

// Explore Civic Map button
const mapBtn = document.getElementById("mapBtn");

if (mapBtn) {
  mapBtn.addEventListener("click", () => {
    window.location.href = "map.html";
  });
}

// Navigation links
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");

    if (href === "#") {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
});
