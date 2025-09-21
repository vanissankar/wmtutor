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
    const snapshot = await getDocs(collection(db, "users"));
    usersList.innerHTML = "";
    snapshot.forEach(docSnap => {
      const user = docSnap.data();
      const card = document.createElement("div");
      card.className = "userCard";
      card.innerHTML = `
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Role:</strong> ${user.role}</p>
        <p><strong>Training Completed:</strong> ${user.trainingCompleted ? "Yes ✅" : "No ❌"}</p>
        <p><strong>Reports Submitted:</strong> ${user.reportsSubmitted || 0}</p>
        <button onclick="deleteUser('${docSnap.id}')">Delete</button>
      `;
      usersList.appendChild(card);
    });
    if (snapshot.empty) usersList.innerHTML = "<p>No users found.</p>";
  } catch(err) {
    console.error(err);
    usersList.innerHTML = "<p>Error loading users.</p>";
  }
}

window.deleteUser = async (id) => {
  if(confirm("Are you sure you want to delete this user?")) {
    try {
      await deleteDoc(doc(db, "users", id));
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
    const usersSnap = await getDocs(collection(db, "users"));
    const reportsSnap = await getDocs(collection(db, "reports"));

    const citizens = usersSnap.docs.filter(u => u.data().role === "Citizen");
    const workers = usersSnap.docs.filter(u => u.data().role === "Worker");
    const trainedUsers = usersSnap.docs.filter(u => u.data().trainingCompleted);

    statsCards.innerHTML = `
      <p><strong>Total Citizens:</strong> ${citizens.length}</p>
      <p><strong>Total Cleaning Workers:</strong> ${workers.length}</p>
      <p><strong>Users Trained:</strong> ${trainedUsers.length}</p>
      <p><strong>Total Waste Reports Submitted:</strong> ${reportsSnap.size}</p>
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
    const usersSnap = await getDocs(collection(db, "users"));
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
  // Here you can integrate EmailJS or Firestore notification collection
  alert("Notification sent to all users:\n\n" + message);
  notifyForm.reset();
});
