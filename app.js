// ---------------------------
// app.js (Auth + Firestore + UI interactions)
// ---------------------------

// Elements
const signupForm = document.getElementById('signupForm');
const loginForm  = document.getElementById('loginForm');
const contactForm= document.getElementById('contactForm');

const submissionsList = document.getElementById('submissionsList');
const userEmailEl = document.getElementById('userEmail');
const userAvatar = document.getElementById('userAvatar');
const logoutBtn = document.getElementById('logoutBtn');
const totalSubmissionsEl = document.getElementById('totalSubmissions');
const recentEl = document.getElementById('recent');
const refreshBtn = document.getElementById('refreshBtn');
const clearAllBtn = document.getElementById('clearAllBtn');

// guard: firebase objects (from your firebase-config.js)
if (typeof auth === 'undefined' || typeof db === 'undefined') {
  console.error('Firebase is not initialized. Make sure js/firebase-config.js is loaded.');
}

// ----------------- Signup -----------------
signupForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = signupForm['email'].value.trim();
  const password = signupForm['password'].value;

  try{
    await auth.createUserWithEmailAndPassword(email, password);
    // Signed up - redirect to dashboard
    window.location.href = 'dashboard.html';
  } catch(err){
    alert(err.message);
  }
});

// ----------------- Login -----------------
loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = loginForm['email'].value.trim();
  const password = loginForm['password'].value;
  const ADMIN_EMAIL = "hussainib237@gmail.com"; 

  try{
    await auth.signInWithEmailAndPassword(email, password);

if (email === ADMIN_EMAIL) {
    // admin goes to dashboard
    window.location.href = "dashboard.html";
} else {
    // normal users go back to main website (or index)
    window.location.href = "index.html"; 
}
  } catch(err){
    alert(err.message);
  }
});

// ----------------- Contact form (save to 'submissions') -----------------
// FIND THIS SECTION IN app.js
contactForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  // We use e.target to get the values from the 'name' attributes in your HTML
  const name = e.target['name'].value.trim();
  const email = e.target['email'].value.trim();
  const message = e.target['message'].value.trim();

  try {
    await db.collection('submissions').add({
      name: name,          // This must be 'name'
      email: email,        // This must be 'email'
      message: message,    // This must be 'message'
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert("Message sent! Check your dashboard.");
    contactForm.reset();
  } catch (err) {
    alert("Error: " + err.message);
  }
});
// ----------------- Dashboard protection & user info -----------------

// Keep track of unsubscribe function for realtime listener
let unsubscribeSubmissions = null;

auth.onAuthStateChanged(user => {
  const ADMIN_EMAIL = "hussainib237@gmail.com"; 

  // If we are on dashboard.html (submissionsList exists)
  if (submissionsList) {

    // User not logged in → redirect to index
    if (!user) {
      window.location.href = "index.html";
      return;
    }

    // User logged in but NOT admin → redirect to index
    if (user.email !== ADMIN_EMAIL) {
      window.location.href = "index.html";
      return;
    }

    // User is admin → show user info
    if (userEmailEl) userEmailEl.textContent = user.email || "—";

    if (userAvatar) {
      const initials = (user.email || "U").charAt(0).toUpperCase();
      userAvatar.textContent = initials;
    }

    // Start realtime updates for admin
    startRealtime();
    startOrdersRealtime(); 
  }
});

// ----------------- Logout -----------------
logoutBtn?.addEventListener('click', async () => {
  try {
    await auth.signOut();
    window.location.href = 'index.html';
  } catch (err) {
    alert(err.message);
  }
});

// ------------------- Realtime submissions -----------------
function startRealtime() {
  db.collection('submissions').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
    submissionsList.innerHTML = '';
    
    // Update stats
    if (totalSubmissionsEl) totalSubmissionsEl.textContent = snapshot.size;
    
    snapshot.forEach(doc => {
      const item = doc.data();
      const id = doc.id;
      const li = document.createElement('li');

      // IMPORTANT: Ensure item.name, item.email, and item.message match the form above
      li.innerHTML = `
        <div class="submission-left">
          <div class="avatar">${(item.name || 'A').charAt(0).toUpperCase()}</div>
          <div class="submission-content">
            <div class="meta"><strong>${escapeHtml(item.name || 'Anonymous')}</strong> • ${escapeHtml(item.email || 'No Email')}</div>
            <div class="msg">${escapeHtml(item.message || 'No message content provided')}</div>
          </div>
        </div>
        <div class="item-actions">
           <button class="btn btn-danger small delete" data-id="${id}">Delete</button>
        </div>
      `;
      submissionsList.appendChild(li);

      // delete handler
      li.querySelector('.delete')?.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        if (!confirm('Delete this message?')) return;
        try {
          await db.collection('submissions').doc(id).delete();
        } catch(err) {
          alert(err.message);
        }
      });

      // view handler (simple alert)
      li.querySelector('.view')?.addEventListener('click', () => {
        alert(`From: ${item.name} (${item.email})\n\n${item.message}`);
      });
    });
  }, err => {
    console.error('Realtime error', err);
  });
}

function startOrdersRealtime() {
  const ordersList = document.getElementById("ordersList");
  if (!ordersList) return;

  db.collection("orders")
    .orderBy("createdAt", "desc")
    .onSnapshot(snapshot => {
      ordersList.innerHTML = "";

      snapshot.forEach(doc => {
        const order = doc.data();

        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${order.orderId}</strong><br>
          ₦${order.total} • ${order.location}<br>
          <small>Status: ${order.status}</small>
          <hr>
        `;

        ordersList.appendChild(li);
      });
    });
}


//new
const ordersList = document.getElementById('ordersList');

function startOrdersRealtime() {
  db.collection('orders').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
    if(!ordersList) return;
    ordersList.innerHTML = '';

    snapshot.forEach(doc => {
      const order = doc.data();
      const id = doc.id;
      const li = document.createElement('li');
      
      // Determine status color
      const statusColor = order.status === 'completed' ? '#2ecc71' : '#e0b44a';

      li.innerHTML = `
        <div class="submission-left">
          <div class="avatar" style="background: ${statusColor}">🛒</div>
          <div class="submission-content">
            <div class="meta"><strong>Order ID: ${order.orderId}</strong> • ${formatDate(order.createdAt)}</div>
            <div class="msg">
               <strong>Items:</strong> ${order.items.map(i => i.name).join(', ')} <br>
               <strong>Location:</strong> ${order.location} <br>
               <strong>Total:</strong> ₦${order.total.toLocaleString()}
            </div>
            <div class="status-badge" style="color: ${statusColor}; font-weight: bold; font-size: 12px; margin-top: 5px;">
               Status: ${order.status.toUpperCase()}
            </div>
          </div>
        </div>
        <div class="item-actions">
           ${order.status !== 'completed' ? `<button class="btn btn-primary small complete-btn" data-id="${id}">Complete</button>` : ''}
           <button class="btn btn-danger small delete-order-btn" data-id="${id}">Delete</button>
        </div>
      `;
      ordersList.appendChild(li);
    });
  });
}

// Handle Button Clicks (Complete/Delete)
document.addEventListener('click', async (e) => {
  const id = e.target.dataset.id;
  
  // Mark as Completed
  if (e.target.classList.contains('complete-btn')) {
    await db.collection('orders').doc(id).update({ status: 'completed' });
  }

  // Delete Order Record
  if (e.target.classList.contains('delete-order-btn')) {
    if(confirm("Remove this order record?")) {
      await db.collection('orders').doc(id).delete();
    }
  }
});


// ----------------- Auth State Observer (ADD THIS HERE) -----------------
auth.onAuthStateChanged(user => {
  if (user) {
    // 1. If an ADMIN is logged in
    console.log("Admin authenticated:", user.email);
    
    // Update dashboard UI
    if (userEmailEl) userEmailEl.textContent = user.email;
    if (userAvatar) userAvatar.textContent = user.email.charAt(0).toUpperCase();
    
    // Start loading data
    startRealtime();        // Loads messages
    startOrdersRealtime();  // Loads food orders
    
  } else {
    // 2. If NO ONE is logged in
    console.log("No user session found.");
    
    // Security: If they are on the dashboard, kick them back to login
    if (window.location.pathname.includes('dashboard.html')) {
      window.location.href = 'login.html';
    }
  }
});



// ----------------- Helpers -----------------
function formatDate(ts){
  if (!ts) return '—';
  // ts is Firestore Timestamp or Date
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString();
}

function escapeHtml(str){
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ----------------- Actions -----------------
refreshBtn?.addEventListener('click', () => {
  // restart realtime query (forces refresh)
  startRealtime();
});

clearAllBtn?.addEventListener('click', async () => {
  if (!confirm('Delete ALL submissions? This cannot be undone.')) return;
  try {
    const snapshot = await db.collection('submissions').get();
    const batch = db.batch();
    snapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    alert('All submissions deleted.');
  } catch(err){
    alert(err.message);
  }
});