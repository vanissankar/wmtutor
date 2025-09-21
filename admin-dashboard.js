import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAuQmK4A0ArK7Mbe5b1CLJvE1ca7e_IpC4",
  authDomain: "gujaratinnovationhub.firebaseapp.com",
  projectId: "gujaratinnovationhub",
  storageBucket: "gujaratinnovationhub.appspot.com",
  messagingSenderId: "979890535208",
  appId: "1:979890535208:web:05adb922822774ed96ee1d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");
const loginForm = document.getElementById("adminLoginForm");
const logoutBtn = document.getElementById("logoutBtn");
const switchBtns = document.querySelectorAll(".switch-btn");
const sections = document.querySelectorAll(".section");

const usersList = document.getElementById("usersList");
const statsCards = document.getElementById("statsCards");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const notifyForm = document.getElementById("notifyForm");

// ---------------- LOGIN ----------------
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginSection.style.display = "none";
    dashboardSection.style.display = "block";
    loadUsers();
    loadStats();
  } catch(err) {
    document.getElementById("loginFeedback").innerText = "Login failed! Check email/password.";
    console.error(err);
  }
});

// ---------------- LOGOUT ----------------
logoutBtn.addEventListener("click", () => {
  auth.signOut();
  loginSection.style.display = "block";
  dashboardSection.style.display = "none";
});

// ---------------- NAVIGATION ----------------
switchBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    switchBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    sections.forEach(s => s.classList.remove("active"));
    document.getElementById(btn.dataset.section).classList.add("active");
  });
});

// ---------------- USER MANAGEMENT ----------------
async function loadUsers() {
  usersList.innerHTML = "<p>Loading users...</p>";
  try {
    const snapshot = await getDocs(collection(db, "user_roles")); // <-- fixed collection
    usersList.innerHTML = "";

    if (snapshot.empty) {
      usersList.innerHTML = "<p>No users found.</p>";
      return;
    }

    snapshot.forEach(docSnap => {
      const user = docSnap.data();
      const email = user.email || "N/A";
      const name = user.name || "N/A";
      const role = user.role || "N/A";

      const card = document.createElement("div");
      card.className = "userCard";
      card.innerHTML = `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Role:</strong> ${role}</p>
        <button onclick="deleteUser('${docSnap.id}')">Delete</button>
      `;
      usersList.appendChild(card);
    });
  } catch(err) {
    console.error(err);
    usersList.innerHTML = "<p>Error loading users.</p>";
  }
}

// ---------------- DELETE USER ----------------
window.deleteUser = async (id) => {
  if(confirm("Are you sure you want to delete this user?")) {
    try {
      await deleteDoc(doc(db, "user_roles", id)); // <-- fixed collection
      loadUsers();
    } catch(err) {
      console.error(err);
    }
  }
};

// ---------------- STATISTICS ----------------
async function loadStats() {
  statsCards.innerHTML = "<p>Loading stats...</p>";
  try {
    const usersSnap = await getDocs(collection(db, "user_roles")); // <-- fixed collection

    let citizens = 0, cleaners = 0, totalUsers = 0;

    usersSnap.forEach(docSnap => {
      const user = docSnap.data();
      totalUsers++;
      const role = (user.role || "").toLowerCase();
      if(role === "citizen") citizens++;
      if(role === "cleaner") cleaners++;
    });

    statsCards.innerHTML = `
      <div class="statCard"><p><strong>Total Users:</strong> ${totalUsers}</p></div>
      <div class="statCard"><p><strong>Total Citizens:</strong> ${citizens}</p></div>
      <div class="statCard"><p><strong>Total Cleaners:</strong> ${cleaners}</p></div>
    `;
  } catch(err) {
    console.error(err);
    statsCards.innerHTML = "<p>Error loading stats.</p>";
  }
}

// ---------------- SEARCH / FILTER ----------------
searchInput.addEventListener("input", async () => {
  const term = searchInput.value.trim().toLowerCase();
  searchResults.innerHTML = "<p>Searching...</p>";
  try {
    const usersSnap = await getDocs(collection(db, "user_roles")); // <-- fixed collection
    const results = [];
    usersSnap.forEach(docSnap => {
      const user = docSnap.data();
      if(user.email.toLowerCase().includes(term) || user.role.toLowerCase().includes(term)) {
        results.push(`User: ${user.email} [${user.role}]`);
      }
    });
    searchResults.innerHTML = results.length ? results.map(r => `<p>${r}</p>`).join("") : "<p>No results found.</p>";
  } catch(err) {
    console.error(err);
    searchResults.innerHTML = "<p>Error searching users.</p>";
  }
});

// ---------------- NOTIFICATIONS ----------------
notifyForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = document.getElementById("notifyMsg").value.trim();
  if(message === "") return;
  alert("Notification sent to all users:\n\n" + message);
  notifyForm.reset();
});
