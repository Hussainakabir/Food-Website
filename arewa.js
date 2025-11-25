// Theme toggle
const toggle = document.getElementById("theme-toggle");
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.body.setAttribute("data-theme", "dark");
  toggle.textContent = "☀️";
}

toggle.addEventListener("click", () => {
  const current = document.body.getAttribute("data-theme");
  const newTheme = current === "dark" ? "light" : "dark";
  document.body.setAttribute("data-theme", newTheme);
  toggle.textContent = newTheme === "dark" ? "☀️" : "🌙";
  localStorage.setItem("theme", newTheme);
});

// Cart system
let cart = [];
const cartCount = document.getElementById("cart-count");
const cartModal = document.getElementById("cart-modal");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");

document.querySelectorAll(".add-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".menu-card");
    const name = card.dataset.name;
    const price = parseInt(card.dataset.price);

    cart.push({ name, price });
    updateCart();
    btn.textContent = "Added!";
    setTimeout(() => (btn.textContent = "Add to Cart"), 1000);
  });
});

function updateCart() {
  cartCount.textContent = cart.length;
  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item) => {
    total += item.price;
    const li = document.createElement("li");
    li.textContent = `${item.name} - ₦${item.price}`;
    cartItems.appendChild(li);
  });

  cartTotal.textContent = total;
}

// Open/Close cart
document.getElementById("cart-button").addEventListener("click", () => {
  cartModal.classList.remove("hidden");
});

document.getElementById("close-cart").addEventListener("click", () => {
  cartModal.classList.add("hidden");
});

// Checkout
document.getElementById("checkout-btn").addEventListener("click", () => {
  const location = document.getElementById("delivery-location").value.trim();
  if (!location) {
    alert("Please enter a delivery location.");
    return;
  }

  alert(`Order placed! Your food will be delivered to: ${location}`);
  cart = [];
  updateCart();
  cartModal.classList.add("hidden");
});

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();


// Reveal on scroll
const revealElements = document.querySelectorAll('.reveal-up');
const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
reveals.forEach(el => observer.observe(el));  