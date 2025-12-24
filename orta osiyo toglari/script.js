// --- Configuration ---
const CONFIG = {
    tileLayer: 'https://tile.opentopomap.org/{z}/{x}/{y}.png',
    borderGeoJSON: 'https://raw.githubusercontent.com/Bekimmatov/R/refs/heads/main/OrtaOsiyoTog/OrtaOsiyoCh.geojson',
    mountainsGeoJSON: 'https://raw.githubusercontent.com/Bekimmatov/R/refs/heads/main/OrtaOsiyoTog/ToglarOrtaO.geojson',
    audio: {
        correct: 'https://github.com/Bekimmatov/R/raw/refs/heads/main/correct-156911.mp3',
        wrong: 'https://github.com/Bekimmatov/R/raw/refs/heads/main/buzzer-or-wrong-answer-20582%20(1).mp3',
        finish: 'https://github.com/Bekimmatov/R/raw/refs/heads/main/purchase-success-384963.mp3'
    },
    styles: {
        border: {
            color: '#333333',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.5,
            fillColor: '#cccccc'
        },
        mountain: {
            color: '#ff9800',
            weight: 4,
            opacity: 0.9
        },
        correct: { color: '#4caf50', weight: 6 },
        wrong: { color: '#f44336', weight: 6 },
    }
};

// --- State ---
let map;
let mountainLayer;
let borderLayer;
let allMountains = [];
let availableQuestions = [];
let currentMode = 'study';
let quizState = {
    targetMountain: null,
    score: 0,
    startTime: 0,
    timerInterval: null
};

// --- DOM Elements ---
const dom = {
    studyBtn: document.getElementById('btn-study'),
    quizBtn: document.getElementById('btn-quiz'),
    searchInput: document.getElementById('search-input'),
    searchResults: document.getElementById('search-results'),
    quizControls: document.getElementById('quiz-controls'),
    searchContainer: document.getElementById('search-container'),
    targetLabel: document.getElementById('target-mountain'),
    scoreLabel: document.getElementById('quiz-score'),
    timerLabel: document.getElementById('quiz-timer'),
    detailsBtn: document.getElementById('btn-details'),
    aboutModal: document.getElementById('about-modal'),
    closeModalBtn: document.getElementById('close-modal'),
    fullscreenBtn: document.getElementById('btn-fullscreen')
};

// --- Initialization ---
function init() {
    initMap();
    initListeners();
    preloadAudio();
}

function initMap() {
    map = L.map('map', { zoomControl: false }).setView([41.0, 65.0], 5);
    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer(CONFIG.tileLayer, {
        attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
    }).addTo(map);

    loadData();
}

async function loadData() {
    try {
        const borderRes = await fetch(CONFIG.borderGeoJSON);
        const borderData = await borderRes.json();
        borderLayer = L.geoJSON(borderData, { style: CONFIG.styles.border }).addTo(map);
        borderLayer.bringToBack();

        const mountainsRes = await fetch(CONFIG.mountainsGeoJSON);
        const mountainsData = await mountainsRes.json();

        mountainLayer = L.geoJSON(mountainsData, {
            style: CONFIG.styles.mountain,
            onEachFeature: onEachMountain
        }).addTo(map);

    } catch (error) {
        console.error("Error loading GeoJSON data:", error);
        alert("Xarita ma'lumotlarini yuklashda xatolik yuz berdi.");
    }
}

function onEachMountain(feature, layer) {
    const name = feature.properties['Лист1_'] || "Noma'lum";
    const id = feature.properties['id'] || "";

    const mountainObj = {
        name: name,
        id: id,
        layer: layer
    };
    allMountains.push(mountainObj);

    // Permanent Label (Clickable)
    if (id) {
        const tooltip = layer.bindTooltip(String(id), {
            permanent: true,
            direction: 'center',
            className: 'mountain-label',
            interactive: true // Make label clickable
        });

        // Add explicit click listener to the tooltip after it's added
        // Alternatively, since interactive: true propagates to layer, we can rely on layer click
        // But for safety, we can listen for distinct interaction if needed.
        // Leaflet 1.0+: interactive tooltips bubbling to layer is default behavior usually.
    }

    // Interaction
    layer.on('click', () => {
        handleMountainClick(mountainObj);
    });

    layer.on('mouseover', function () {
        if (currentMode === 'study') this.setStyle({ weight: 7 });
    });
    layer.on('mouseout', function () {
        if (currentMode === 'study') this.setStyle(CONFIG.styles.mountain);
    });
}

// --- Logic ---

function handleMountainClick(mountainObj) {
    if (currentMode === 'study') {
        mountainObj.layer.bindPopup(`<b>${mountainObj.name}</b>`).openPopup();
    } else if (currentMode === 'quiz') {
        checkAnswer(mountainObj);
    }
}

// --- Event Listeners ---
function initListeners() {
    dom.studyBtn.addEventListener('click', () => switchMode('study'));
    dom.quizBtn.addEventListener('click', () => switchMode('quiz'));
    dom.searchInput.addEventListener('input', (e) => handleSearch(e.target.value));

    dom.detailsBtn.addEventListener('click', () => dom.aboutModal.classList.remove('hidden'));
    dom.closeModalBtn.addEventListener('click', () => dom.aboutModal.classList.add('hidden'));
    dom.fullscreenBtn.addEventListener('click', toggleFullscreen);

    window.addEventListener('click', (e) => {
        if (e.target === dom.aboutModal) dom.aboutModal.classList.add('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!dom.searchContainer.contains(e.target)) {
            dom.searchResults.classList.add('hidden');
        }
    });
}

function switchMode(mode) {
    currentMode = mode;
    dom.studyBtn.classList.toggle('active-mode', mode === 'study');
    dom.quizBtn.classList.toggle('active-mode', mode === 'quiz');

    if (mode === 'study') {
        dom.searchContainer.classList.remove('hidden');
        dom.quizControls.classList.add('hidden');
        resetMapStyles();
        stopQuiz();
    } else {
        dom.searchContainer.classList.add('hidden');
        dom.quizControls.classList.remove('hidden');
        startQuiz();
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
    }
}

// --- Audio ---
function preloadAudio() {
    for (let key in CONFIG.audio) {
        new Audio(CONFIG.audio[key]);
    }
}

function playSound(type) {
    const audio = new Audio(CONFIG.audio[type]);
    audio.play().catch(e => console.warn("Audio play failed", e));
}

// --- Study Mode: Search ---
function handleSearch(query) {
    dom.searchResults.innerHTML = '';
    if (!query.trim()) {
        dom.searchResults.classList.add('hidden');
        return;
    }

    const matches = allMountains.filter(m =>
        m.name.toLowerCase().includes(query.toLowerCase())
    );

    if (matches.length > 0) {
        dom.searchResults.classList.remove('hidden');
        matches.forEach(m => {
            const div = document.createElement('div');
            div.className = 'search-item';
            div.textContent = m.name;
            div.onclick = () => {
                focusOnMountain(m);
                dom.searchResults.classList.add('hidden');
                dom.searchInput.value = m.name;
            };
            dom.searchResults.appendChild(div);
        });
    } else {
        dom.searchResults.classList.add('hidden');
    }
}

function focusOnMountain(m) {
    map.flyToBounds(m.layer.getBounds(), { padding: [50, 50], maxZoom: 8 });
    m.layer.openPopup();
    m.layer.setStyle({ color: '#fff', weight: 8 });
    setTimeout(() => {
        m.layer.setStyle(CONFIG.styles.mountain);
    }, 2000);
}

// --- Quiz Mode ---

function startQuiz() {
    resetMapStyles();
    let candidates = [...allMountains].filter(m => m.name && m.name !== "Noma'lum" && m.name !== "Unknown");
    candidates.sort(() => Math.random() - 0.5);
    availableQuestions = candidates.slice(0, 20);

    quizState.score = 0;
    quizState.startTime = Date.now();

    updateScore();
    startTimer();
    nextQuestion();
}

function stopQuiz() {
    clearInterval(quizState.timerInterval);
    dom.targetLabel.textContent = "...";
    dom.timerLabel.textContent = "00:00";
}

function startTimer() {
    clearInterval(quizState.timerInterval);
    quizState.timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - quizState.startTime) / 1000);
        const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const secs = String(elapsed % 60).padStart(2, '0');
        dom.timerLabel.textContent = `${mins}:${secs}`;
    }, 1000);
}

function nextQuestion() {
    if (availableQuestions.length === 0) {
        finishQuiz();
        return;
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    quizState.targetMountain = availableQuestions[randomIndex];
    availableQuestions.splice(randomIndex, 1);

    dom.targetLabel.textContent = quizState.targetMountain.name;
}

function checkAnswer(clickedMountain) {
    if (!quizState.targetMountain) return;

    const layer = clickedMountain.layer;
    const tooltip = layer.getTooltip();

    if (clickedMountain.name === quizState.targetMountain.name) {
        // Correct - Turn Green and Stay Green
        playSound('correct');

        layer.setStyle(CONFIG.styles.correct);
        if (tooltip && tooltip.getElement()) {
            tooltip.getElement().classList.add('label-correct');
            tooltip.getElement().classList.remove('label-wrong');
        }

        quizState.score++;
        updateScore();
        nextQuestion();
    } else {
        // Wrong - Flash Red then Revert
        playSound('wrong');

        layer.setStyle(CONFIG.styles.wrong);
        if (tooltip && tooltip.getElement()) {
            tooltip.getElement().classList.add('label-wrong');
        }


        // Removed alert as per user request

        // Revert style after delay
        setTimeout(() => {
            layer.setStyle(CONFIG.styles.mountain);
            if (tooltip && tooltip.getElement()) {
                tooltip.getElement().classList.remove('label-wrong');
            }
        }, 1000); // 1 second flash
    }
}

function updateScore() {
    dom.scoreLabel.textContent = `Ball: ${quizState.score}`;
}

function finishQuiz() {
    clearInterval(quizState.timerInterval);
    playSound('finish');
    dom.targetLabel.textContent = "YAKUNLANDI!";

    const timeTaken = dom.timerLabel.textContent;
    saveToLeaderboard(timeTaken, quizState.score);

    setTimeout(() => {
        alert(`Test Yakunlandi!\nVaqt: ${timeTaken}\nYakuniy natija: ${quizState.score}`);
    }, 500);
}

function saveToLeaderboard(timeStr, score) {
    const name = prompt("Ismingizni kiriting:", "O'yinchi");
    if (!name) return;

    const record = {
        name: name,
        date: new Date().toLocaleDateString(),
        time: timeStr,
        score: score
    };

    let leaderboard = JSON.parse(localStorage.getItem('oro_leaderboard') || "[]");
    leaderboard.push(record);
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem('oro_leaderboard', JSON.stringify(leaderboard));
}

function resetMapStyles() {
    if (!mountainLayer) return;
    mountainLayer.eachLayer(layer => {
        layer.setStyle(CONFIG.styles.mountain);
        layer.closePopup();
        const tooltip = layer.getTooltip();
        if (tooltip && tooltip.getElement()) {
            tooltip.getElement().classList.remove('label-correct', 'label-wrong');
        }
    });
}

// Start App
init();
