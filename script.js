// ============ Theme toggle ============
(function () {
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;
  toggle.addEventListener("click", () => {
    const root = document.documentElement;
    const isDark = root.getAttribute("data-theme") === "dark";
    if (isDark) {
      root.removeAttribute("data-theme");
      try { localStorage.setItem("theme", "light"); } catch (e) {}
    } else {
      root.setAttribute("data-theme", "dark");
      try { localStorage.setItem("theme", "dark"); } catch (e) {}
    }
  });
})();

// ============ FAQ accordion ============
document.querySelectorAll(".accordion__head").forEach((head) => {
  head.addEventListener("click", () => {
    const item = head.closest(".accordion__item");
    const panel = item.querySelector(".accordion__panel");
    const isOpen = item.classList.toggle("is-open");
    head.setAttribute("aria-expanded", String(isOpen));
    panel.style.maxHeight = isOpen ? panel.scrollHeight + "px" : null;
  });
});

// ============ Modal ============
const modal = document.getElementById("leadModal");
const form = document.getElementById("leadForm");
const success = document.getElementById("leadSuccess");
let lastFocused = null;

function openModal() {
  lastFocused = document.activeElement;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  const first = modal.querySelector("input");
  if (first) setTimeout(() => first.focus(), 50);
}

function closeModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  // reset to form view for next open
  form.hidden = false;
  success.hidden = true;
  form.reset();
  clearErrors();
  if (lastFocused) lastFocused.focus();
}

document.querySelectorAll("[data-open-form]").forEach((b) =>
  b.addEventListener("click", openModal)
);
document.querySelectorAll("[data-close-form]").forEach((b) =>
  b.addEventListener("click", closeModal)
);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
});

// ============ Validation ============
function setError(name, msg) {
  const slot = form.querySelector(`[data-error-for="${name}"]`);
  if (slot) slot.textContent = msg;
  const input = form.querySelector(`[name="${name}"]`);
  const field = input ? input.closest(".field") : null;
  if (field) field.classList.toggle("is-invalid", Boolean(msg));
}

function clearErrors() {
  form.querySelectorAll("[data-error-for]").forEach((s) => (s.textContent = ""));
  form.querySelectorAll(".field").forEach((f) => f.classList.remove("is-invalid"));
}

const phoneRe = /^[+]?[\d\s().-]{10,18}$/;
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate() {
  clearErrors();
  let ok = true;
  const data = new FormData(form);
  const name = (data.get("name") || "").trim();
  const phone = (data.get("phone") || "").trim();
  const email = (data.get("email") || "").trim();
  const agree = form.querySelector('[name="agree"]').checked;

  if (name.length < 2) {
    setError("name", "Введите имя");
    ok = false;
  }
  // нужен хотя бы один рабочий контакт
  if (!phone && !email) {
    setError("phone", "Укажите телефон или e-mail");
    ok = false;
  } else {
    if (phone && !phoneRe.test(phone)) {
      setError("phone", "Проверьте номер телефона");
      ok = false;
    }
    if (email && !emailRe.test(email)) {
      setError("email", "Проверьте e-mail");
      ok = false;
    }
  }
  if (!agree) {
    setError("agree", "Нужно согласие на обработку данных");
    ok = false;
  }
  return ok;
}

// live-очистка ошибки при вводе
form.querySelectorAll(".field__input").forEach((input) => {
  input.addEventListener("input", () => {
    const field = input.closest(".field");
    field.classList.remove("is-invalid");
    const slot = form.querySelector(`[data-error-for="${input.name}"]`);
    if (slot) slot.textContent = "";
  });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validate()) return;

  const name = (new FormData(form).get("name") || "друг").trim();
  // Здесь была бы реальная отправка на бэкенд / Formspree.
  document.getElementById("successName").textContent = name;
  form.hidden = true;
  success.hidden = false;
});
