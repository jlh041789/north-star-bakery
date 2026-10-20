"use strict";
// Touchstone 4: favorites and validated preorder inquiry for North Star Bakery.
const PRODUCT_CATALOG = [
  { id: "signature-loaf", name: "Signature Loaf" },
  { id: "morning-pastry", name: "Morning Pastries" },
  { id: "celebration-cake", name: "Celebration Cakes" }
];
const STORAGE_KEYS = { favorites: "northStarBakeryFavorites", requestType: "northStarBakeryRequestType" };

function readStorage(key, fallback) {
  try { const value = localStorage.getItem(key); return value === null ? fallback : JSON.parse(value); }
  catch (error) { return fallback; } // Private browsing may restrict storage.
}
function saveStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) { /* Session still works. */ }
}
function getFavorites() {
  const saved = readStorage(STORAGE_KEYS.favorites, []);
  const knownIds = PRODUCT_CATALOG.map(product => product.id);
  return Array.isArray(saved) ? [...new Set(saved.filter(id => knownIds.includes(id)))] : [];
}
function namesFor(ids) { return PRODUCT_CATALOG.filter(product => ids.includes(product.id)).map(product => product.name); }
function updateFavoritesUI() {
  const favorites = getFavorites();
  document.querySelectorAll(".favorite-button").forEach(button => {
    const selected = favorites.includes(button.dataset.product);
    button.setAttribute("aria-pressed", String(selected));
    const product = PRODUCT_CATALOG.find(item => item.id === button.dataset.product);
    button.textContent = `${selected ? "♥ Saved" : "♡ Save"} ${product.name}`;
  });
  const summary = document.getElementById("favorite-summary");
  if (summary) summary.textContent = favorites.length
    ? `Your saved favorites: ${namesFor(favorites).join(", ")}.`
    : "No favorites saved yet. Tap a product to save it.";
}
function initializeFavorites() {
  if (!document.querySelector(".favorite-button")) return;
  document.querySelectorAll(".favorite-button").forEach(button => {
    button.addEventListener("click", () => {
      const favorites = getFavorites(); const id = button.dataset.product;
      const updated = favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites, id];
      saveStorage(STORAGE_KEYS.favorites, updated); updateFavoritesUI();
    });
  });
  document.getElementById("clear-favorites")?.addEventListener("click", () => {
    saveStorage(STORAGE_KEYS.favorites, []); updateFavoritesUI();
  });
  updateFavoritesUI();
}
function showError(field, message) {
  field.setAttribute("aria-invalid", message ? "true" : "false");
  const error = document.getElementById(`${field.id}-error`);
  if (error) error.textContent = message;
}
function validateField(field) {
  const value = field.value.trim(); let message = "";
  if (field.required && !value) message = "This field is required.";
  else if (field.id === "full-name" && value.length < 2) message = "Please enter at least 2 characters for your name.";
  else if (field.id === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = "Enter an email address such as name@example.com.";
  else if (field.id === "item-details" && value.length < 10) message = "Please enter at least 10 characters describing your request.";
  showError(field, message); return message === "";
}
function initializeForm() {
  const form = document.getElementById("preorder-form"); if (!form) return;
  const requestType = document.getElementById("request-type");
  const saved = readStorage(STORAGE_KEYS.requestType, "");
  if (["preorder", "question"].includes(saved)) requestType.value = saved;
  requestType.addEventListener("change", () => {
    saveStorage(STORAGE_KEYS.requestType, requestType.value);
    validateField(requestType);
  });
  const favorites = getFavorites();
  if (favorites.length) {
    const description = `Interested in: ${namesFor(favorites).join(", ")}. Please share availability and pickup details.`;
    const details = document.getElementById("item-details");
    if (!details.value) details.value = description;
    const note = document.getElementById("saved-favorites-note");
    note.textContent = "Your saved favorites were added to the item details. You can edit this text.";
  }
  const fields = ["full-name", "email", "request-type", "item-details"].map(id => document.getElementById(id));
  fields.forEach(field => field.addEventListener(field.tagName === "SELECT" ? "change" : "input", () => validateField(field)));
  form.addEventListener("submit", event => {
    event.preventDefault(); // Demo site: never send data without a configured backend.
    const valid = fields.map(validateField).every(Boolean);
    const message = document.getElementById("form-message");
    if (!valid) {
      message.textContent = "Please correct the highlighted fields before continuing.";
      fields.find(field => field.getAttribute("aria-invalid") === "true")?.focus();
      return;
    }
    message.textContent = "Your information looks good! This is a demonstration form, so your request has not been sent. Please contact the bakery directly to confirm an order.";
  });
  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      fields.forEach(field => showError(field, ""));
      document.getElementById("form-message").textContent = "";
      saveStorage(STORAGE_KEYS.requestType, "");
    }, 0);
  });
}
document.addEventListener("DOMContentLoaded", () => { initializeFavorites(); initializeForm(); });
