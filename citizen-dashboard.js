import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, updateDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

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
const storage = getStorage(app);

// Sections & nav
const navBtns = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".section");
navBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    navBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    sections.forEach(s => s.classList.remove("active"));
    document.getElementById(btn.dataset.section).classList.add("active");
  });
});

// User info
const userNameEl = document.getElementById("userName");
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", () => {
  sessionStorage.clear(); // clear uid & role
  location.href = "login.html";
});

// Learning Modules Data
const modulesData = [
  {
    videoUrl: "https://www.youtube.com/embed/video1",
    questions: [
      { q:"What type of waste goes in dry bin?", options:["Plastic","Kitchen Waste","Batteries"], answer:0 },
      { q:"Should wet waste be segregated?", options:["Yes","No"], answer:0 }
    ]
  },
  {
    videoUrl: "https://www.youtube.com/embed/video2",
    questions: [
      { q:"Composting reduces landfill load?", options:["Yes","No"], answer:0 },
      { q:"Can plastic be composted?", options:["Yes","No"], answer:1 }
    ]
  },
  {
    videoUrl: "https://www.youtube.com/embed/video3",
    questions: [
      { q:"Recycling helps environment?", options:["Yes","No"], answer:0 },
      { q:"All waste is biodegradable?", options:["Yes","No"], answer:1 }
    ]
  }
];

const modulesContainer = document.getElementById("modulesContainer");
const progressContainer = document.getElementById("progressContainer");
const complaintForm = document.getElementById("complaintForm");
const complaintFeedback = document.getElementById("complaintFeedback");
const storeItemsEl = document.getElementById("storeItems");

// Certificate
const certificateBtn = document.createElement("button");
certificateBtn.innerText = "Download Certificate";
certificateBtn.style.display = "none";
certificateBtn.addEventListener("click", generateCertificate);
document.body.appendChild(certificateBtn);

// ------------------------
// USE SESSIONSTORAGE TO GET USER
// ------------------------
const uid = sessionStorage.getItem("uid");
const role = sessionStorage.getItem("role");

if (!uid || role !== "citizen") {
  location.href = "login.html"; // not logged in or wrong role
} else {
  userNameEl.innerText = role.charAt(0).toUpperCase() + role.slice(1);
  loadLearningModules(uid);
  loadProgress(uid);
  loadStore();
}

// --- Learning Modules ---
async function loadLearningModules(uid) {
  modulesContainer.innerHTML = "";
  let userProgress = { completedModules: 0 };
  try {
    const docRef = doc(db, "citizen_progress", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) userProgress = docSnap.data();
  } catch (err) { console.error(err); }

  modulesData.forEach((module, index) => {
    if (index > userProgress.completedModules) return; // lock modules
    const moduleDiv = document.createElement("div");
    moduleDiv.className = "module";
    moduleDiv.innerHTML = `<h3>Module ${index + 1}</h3>
      <iframe src="${module.videoUrl}" frameborder="0" allowfullscreen></iframe>
      <div class="quiz"></div>`;
    modulesContainer.appendChild(moduleDiv);

    const quizDiv = moduleDiv.querySelector(".quiz");
    module.questions.forEach((ques, qIndex) => {
      const qDiv = document.createElement("div");
      qDiv.className = "question";
      qDiv.innerHTML = `<h4>${ques.q}</h4>`;
      const optionsDiv = document.createElement("div");
      optionsDiv.className = "options";
      ques.options.forEach((opt, optIndex) => {
        const label = document.createElement("label");
        label.innerHTML = `<input type="radio" name="mod${index}_q${qIndex}" value="${optIndex}"> ${opt}`;
        optionsDiv.appendChild(label);
      });
      qDiv.appendChild(optionsDiv);
      quizDiv.appendChild(qDiv);
    });

    const submitBtn = document.createElement("button");
    submitBtn.innerText = "Submit Quiz";
    submitBtn.addEventListener("click", async () => {
      let score = 0;
      module.questions.forEach((ques, qIndex) => {
        const ans = parseInt(document.querySelector(`input[name="mod${index}_q${qIndex}"]:checked`)?.value);
        if (ans === ques.answer) score++;
      });
      const percent = (score / module.questions.length) * 100;
      if (percent >= 80) {
        alert(`Congrats! You scored ${percent}%. Module Completed.`);
        const docRef = doc(db, "citizen_progress", uid);
        try { await updateDoc(docRef, { completedModules: index + 1 }); }
        catch { await setDoc(docRef, { completedModules: index + 1 }, { merge: true }); }

        loadLearningModules(uid);
        loadProgress(uid);
        checkCertificate(uid);
      } else { alert(`You scored ${percent}%. Need at least 80% to complete.`); }
    });
    quizDiv.appendChild(submitBtn);
  });
}

// --- Progress ---
async function loadProgress(uid) {
  try {
    const docRef = doc(db, "citizen_progress", uid);
    const docSnap = await getDoc(docRef);
    let completed = 0;
    if (docSnap.exists()) completed = docSnap.data().completedModules;
    progressContainer.innerHTML = `<p>Modules Completed: ${completed} / ${modulesData.length}</p>`;
  } catch (err) { console.error(err); }
}

// --- Store ---
async function loadStore() {
  storeItemsEl.innerHTML = "";
  const items = [
    { name: "3-Bin Dustbin Kit", price: "₹500" },
    { name: "Compost Kit", price: "₹300" },
    { name: "Gloves / PPE", price: "₹200" }
  ];
  items.forEach(it => {
    const div = document.createElement("div");
    div.className = "storeItem";
    div.innerHTML = `<h4>${it.name}</h4><p>${it.price}</p><button>Buy</button>`;
    storeItemsEl.appendChild(div);
  });
}

// --- Certificate Logic ---
async function checkCertificate(uid){
  const docRef = doc(db, "citizen_progress", uid);
  const docSnap = await getDoc(docRef);
  if(docSnap.exists() && docSnap.data().completedModules === modulesData.length){
    certificateBtn.style.display = "block";
  } else certificateBtn.style.display = "none";
}

function generateCertificate(){
  const certId = "CITIZEN-"+uid+"-"+Date.now();
  const certHTML = `
    <div style="width:800px; height:600px; border:5px solid #00f260; padding:50px; text-align:center;">
      <h1>Certificate of Completion</h1>
      <p>This is to certify that Citizen <strong>${uid}</strong> has completed all training modules.</p>
      <p>Certificate ID: <strong>${certId}</strong></p>
    </div>
  `;
  const newWindow = window.open("");
  newWindow.document.write(certHTML);
  newWindow.print();
}

// Check certificate on load
checkCertificate(uid);

// --- Complaints ---
complaintForm.addEventListener("submit", async e => {
  e.preventDefault();
  const location = document.getElementById("location").value;
  const description = document.getElementById("description").value;
  const file = document.getElementById("photo").files[0];
  if (!file) return;

  try {
    const fileRef = ref(storage, `complaints/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const fileURL = await getDownloadURL(fileRef);

    await addDoc(collection(db, "citizen_complaints"), {
      uid,
      location,
      description,
      photoURL: fileURL,
      timestamp: Date.now()
    });

    complaintFeedback.innerText = "Complaint submitted successfully!";
    complaintForm.reset();
  } catch (err) { console.error(err); complaintFeedback.innerText = "Error submitting complaint"; }
});
