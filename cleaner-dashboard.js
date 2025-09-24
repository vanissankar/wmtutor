import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// --- Firebase Config ---
const firebaseConfig = {
  apiKey: "AIzaSyAuQmK4A0ArK7Mbe5b1CLJvE1ca7e_IpC4",
  authDomain: "gujaratinnovationhub.firebaseapp.com",
  projectId: "gujaratinnovationhub",
  storageBucket: "gujaratinnovationhub.appspot.com",
  messagingSenderId: "979890535208",
  appId: "1:979890535208:web:05adb922822774ed96ee1d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// --- DOM Elements ---
const navBtns = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".section");
const userNameEl = document.getElementById("userName");
const logoutBtn = document.getElementById("logoutBtn");
const modulesContainer = document.getElementById("modulesContainer");
const pointsContainer = document.getElementById("pointsContainer");
const taskForm = document.getElementById("taskForm");
const taskFeedback = document.getElementById("taskFeedback");
const storeItemsEl = document.getElementById("storeItems");
const downloadCertBtn = document.getElementById("downloadCertBtn");
const instructionBtn = document.getElementById("instructionBtn");

// --- Modules Data ---
const modulesData = [
  {
    videoUrl: "https://www.youtube.com/embed/e30Izcn49OA?si=NejURbQvAYCRU3Me",
    questions: [
      { q:"உலர்ந்த கழிவுப் பெட்டியிலே எந்த வகை கழிவு சேர்க்க வேண்டும்?", options:["பிளாஸ்டிக்","சமையலறை கழிவு","பேட்டரி"], answer:0 },
      { q:"எதிர்வினை கழிவுகளை பிரிக்க வேண்டுமா?", options:["ஆம்","இல்லை"], answer:0 }
    ]
  },
  {
    videoUrl: "https://www.youtube.com/embed/RAptxP5TM28?si=AiwgOimOGQyOx6f1",
    questions: [
      { q:"கம்போஸ்டிங் செய்வதால் மண் மேடு (லேண்ட்ஃபில்) சுமை குறையுமா?", options:["ஆம்","இல்லை"], answer:0 },
      { q:"பிளாஸ்டிக் கலப்பு உரம் ஆகுமா?", options:["ஆம்","இல்லை"], answer:1 }
    ]
  },
  {
    videoUrl: "https://www.youtube.com/embed/qUHLXO7M4bU?si=ccYa2OsqmIzUB_4F",
    questions: [
      { q:"மறுசுழற்சி சுற்றுசீரான்மைக்கு உதவுமா?", options:["ஆம்","இல்லை"], answer:0 },
      { q:"எல்லா கழிவுகளும் உயிரியாற்சிதைவுறத்தக்கது?", options:["ஆம்","இல்லை"], answer:1 }
    ]
  }
];

// --- Auth Check ---
const uid = sessionStorage.getItem("uid");
const role = sessionStorage.getItem("role");
if (!uid || role !== "cleaner") location.href = "login.html";
userNameEl.innerText = role + ": " + uid;

// --- Navigation ---
navBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    navBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    sections.forEach(s => s.classList.remove("active"));
    document.getElementById(btn.dataset.section).classList.add("active");
  });
});

// --- Logout ---
logoutBtn.addEventListener("click", () => {
  sessionStorage.clear();
  location.href = "login.html";
});

// --- Load Modules ---
async function loadModules() {
  modulesContainer.innerHTML = "";
  let progress = { completedModules: 0 };
  try {
    const docSnap = await getDoc(doc(db, "cleaner_progress", uid));
    if (docSnap.exists()) progress = docSnap.data();
  } catch (err) { console.error(err); }

  modulesData.forEach((module, index) => {
    if (index > progress.completedModules) return; // Lock next module

    const moduleDiv = document.createElement("div");
    moduleDiv.className = "module";
    moduleDiv.innerHTML = `
      <h3>Module ${index+1}</h3>
      <iframe src="${module.videoUrl}" frameborder="0" allowfullscreen></iframe>
      <div class="quiz"></div>
    `;
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
        await setDoc(doc(db, "cleaner_progress", uid), { completedModules: index+1 }, { merge: true });
        loadModules();
        loadPoints();
        loadCertificate();
      } else alert(`You scored ${percent}%. Need 80% to unlock next module.`);
    });
    quizDiv.appendChild(submitBtn);
  });
}

instructionBtn.addEventListener("click", () => {
  const activeSection = document.querySelector(".section.active");
  if (activeSection.id === "modulesSection") {
    // Play the pre-recorded Tamil audio
    const audio = new Audio("voice 1.mp3"); // path to your Tamil MP3
    audio.play();
  } else {
    const audio = new Audio("voice 2.mp3"); // optional: "No instructions here" audio
    audio.play();
  }
});

// --- Task Submission ---
taskForm.addEventListener("submit", async e => {
  e.preventDefault();
  const location = document.getElementById("taskLocation").value;
  const file = document.getElementById("taskPhoto").files[0];
  if (!file) return;

  try {
    const fileRef = ref(storage, `tasks/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const photoURL = await getDownloadURL(fileRef);

    navigator.geolocation.getCurrentPosition(async pos => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      await addDoc(collection(db, "cleaner_tasks"), {
        uid, location, coords, photoURL, timestamp: Date.now()
      });
      taskFeedback.innerText = "Task submitted successfully!";
      taskForm.reset();
      loadPoints();
    });
  } catch (err) {
    console.error(err);
    taskFeedback.innerText = "Error submitting task";
  }
});

// --- Load Points ---
async function loadPoints() {
  let completedModules = 0, completedTasks = 0;
  try {
    const progressSnap = await getDoc(doc(db, "cleaner_progress", uid));
    if (progressSnap.exists()) completedModules = progressSnap.data().completedModules;

    const tasksSnap = await getDocs(collection(db, "cleaner_tasks"));
    tasksSnap.forEach(t => { if (t.data().uid === uid) completedTasks++; });
  } catch (err) { console.error(err); }

  const totalPoints = completedModules * 50 + completedTasks * 10;
  pointsContainer.innerHTML = `
    <p>Modules Completed: ${completedModules}</p>
    <p>Tasks Completed: ${completedTasks}</p>
    <p>Total Points: ${totalPoints}</p>`;
}

// --- Certificate ---
async function loadCertificate() {
  const progressSnap = await getDoc(doc(db, "cleaner_progress", uid));
  if (progressSnap.exists() && progressSnap.data().completedModules === modulesData.length) {
    downloadCertBtn.style.display = "block";
    downloadCertBtn.onclick = () => {
      const certId = "CLEANER-" + uid + "-" + Date.now();
      const certHTML = `
        <div style="width:800px; height:600px; border:5px solid green; padding:50px; text-align:center;">
          <h1>Certificate of Completion</h1>
          <p>This is to certify that Cleaner <strong>${uid}</strong> has completed all training modules.</p>
          <p>Certificate ID: <strong>${certId}</strong></p>
        </div>`;
      const newWindow = window.open("");
      newWindow.document.write(certHTML);
      newWindow.print();
    };
  } else {
    downloadCertBtn.style.display = "none";
  }
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
    div.innerHTML = `
      <h4>${it.name}</h4>
      <p>${it.price}</p>
      <button>Buy</button>
    `;
    storeItemsEl.appendChild(div);
  });
}

// --- Initial Load ---
loadModules();
loadPoints();
loadCertificate();
loadStore();
