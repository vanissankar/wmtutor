import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  if (!role) {
    alert("Please select a role!");
    return;
  }

  try {
    // Check if account with same email + role already exists
    const q = query(collection(db, "user_roles"), where("email", "==", email), where("role", "==", role));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      alert(`An account already exists for ${role} role with this email.`);
      return;
    }

    // Add new user role document
    await addDoc(collection(db, "user_roles"), {
      name,
      email,
      password, // For production, hash this password
      role
    });

    alert(`Your ${role.charAt(0).toUpperCase() + role.slice(1)} account has been created successfully!`);
    signupForm.reset();

  } catch (error) {
    console.error("Error creating account:", error);
    alert("Something went wrong. Please try again later.");
  }
});
