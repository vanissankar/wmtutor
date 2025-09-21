import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
const db = getFirestore(app);

// Form references
const loginForm = document.getElementById("commonLoginForm");
const loginFeedback = document.getElementById("loginFeedback");

// Login handler
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  if (!role) {
    loginFeedback.innerText = "⚠ Please select a role!";
    return;
  }

  try {
    // Query Firestore for matching user
    const q = query(
      collection(db, "user_roles"),
      where("email", "==", email),
      where("password", "==", password),
      where("role", "==", role)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const uid = userDoc.id; // Firestore doc ID as user ID

      // ✅ Save login state in sessionStorage
      sessionStorage.setItem("uid", uid);
      sessionStorage.setItem("role", role);
      sessionStorage.setItem("email", email);

      // Redirect based on role
      if (role === "citizen") {
        window.location.href = "citizen-dashboard.html";
      } else if (role === "cleaner") {
        window.location.href = "cleaner-dashboard.html";
      } else if (role === "admin") {
        window.location.href = "admin-dashboard.html";
      }
    } else {
      loginFeedback.innerText = "❌ Invalid credentials!";
    }
  } catch (err) {
    console.error(err);
    loginFeedback.innerText = "⚠ Login failed. Try again later.";
  }
});
