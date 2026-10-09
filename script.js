const reportButtons = [
  document.getElementById("reportBtn"),
  document.getElementById("heroReportBtn")
];

reportButtons.forEach((button) => {
  button.addEventListener("click", () => {
    alert("Report Issue screen will be connected in Screen 2.");
  });
});

document.getElementById("mapBtn").addEventListener("click", () => {
  document.getElementById("map").scrollIntoView({ behavior: "smooth" });
  alert("GIS Map screen will be connected in Screen 4.");
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");

    if (href === "#") {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
});
// Report Issue button
const reportBtn = document.getElementById("reportBtn");

reportBtn.addEventListener("click", function() {
    window.location.href = "report.html";
});
