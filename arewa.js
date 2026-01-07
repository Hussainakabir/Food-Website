
// THEME TOGGLE
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


// CART SYSTEM
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
  if (cartCount) cartCount.textContent = cart.length;

  if (cartItems) {
    cartItems.innerHTML = "";
    let total = 0;

    cart.forEach((item) => {
      total += item.price;
      const li = document.createElement("li");
      li.textContent = `${item.name} - ₦${item.price}`;
      cartItems.appendChild(li);
    });

    if (cartTotal) cartTotal.textContent = total;
  }
}


// OPEN / CLOSE CART
const cartButton = document.getElementById("cart-button");
if (cartButton) {
  cartButton.addEventListener("click", () => {
    cartModal.classList.remove("hidden");
  });
}

const closeCart = document.getElementById("close-cart");
if (closeCart) {
  closeCart.addEventListener("click", () => {
    cartModal.classList.add("hidden");
  });
}


// CHECKOUT → FIREBASE → WHATSAPP
const checkoutBtn = document.getElementById("checkout-btn");

if (checkoutBtn) {
  checkoutBtn.addEventListener("click", async () => {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const locationInput = document.getElementById("delivery-location");
    const location = locationInput.value.trim();

    if (!location) {
      alert("Please enter a delivery location.");
      return;
    }

    const WHATSAPP_NUMBER = "2349032216177"; // ← change this
    const orderId = "ORD-" + Date.now();

    let total = 0;
    cart.forEach(item => total += item.price);

    // 1️⃣ SAVE ORDER TO FIRESTORE
    try {
      await db.collection("orders").add({
        orderId,
        items: cart,
        total,
        location,
        status: "pending",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (err) {
      alert("Failed to save order. Try again.");
      console.error(err);
      return;
    }

    // 2️⃣ BUILD WHATSAPP MESSAGE
    let message = `🧾 *New Order*%0A`;
    message += `*Order ID:* ${orderId}%0A%0A`;

    cart.forEach((item, i) => {
      message += `${i + 1}. ${item.name} - ₦${item.price}%0A`;
    });

    message += `%0A*Total:* ₦${total}%0A`;
    message += `*Delivery Location:* ${location}%0A`;
    message += `*Payment:* Pay on delivery`;

    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

    // 3️⃣ REDIRECT TO WHATSAPP
    window.open(whatsappURL, "_blank");

    // 4️⃣ RESET CART
    cart = [];
    updateCart();
    locationInput.value = "";
    cartModal.classList.add("hidden");
  });
}



// FOOTER YEAR
const yearElement = document.getElementById("year");
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}


// REVEAL ANIMATION (fixed)
const revealElements = document.querySelectorAll(".reveal-up");

const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealElements.forEach(el => observer.observe(el));