//Make intro buttons send to another route.

// Register a catch-button
const catchBtnEl = document.querySelector(".catch-btn");
catchBtnEl?.addEventListener("click", () => {
  window.location.href = "/catch";
});

// Statistic button
const statBtnEl = document.querySelector(".statistic-btn");
