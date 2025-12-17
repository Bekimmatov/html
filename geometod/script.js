/**
 * GEOGRAPHIC DISCOVERY: UZBEKISTAN EDITION (FINAL UNIVERSAL)
 * Logic: 30s Timer, Distance Calc, 9 Targets, Universal Layout
 */

// --- DATA ---
const BASE_START = [41.2660, 69.2770];

const TEAMS = [
    {
        id: 0, name: "Guruh 1", color: "#e74c3c", pos: BASE_START,
        targets: [], foundMarkers: [], stats: { correct: 0, wrong: 0 },
        iconClass: 'team-1-marker', activeTargetId: null
    },
    {
        id: 1, name: "Guruh 2", color: "#3498db", pos: [BASE_START[0] + 0.002, BASE_START[1] + 0.002],
        targets: [], foundMarkers: [], stats: { correct: 0, wrong: 0 },
        iconClass: 'team-2-marker', activeTargetId: null
    },
    {
        id: 2, name: "Guruh 3", color: "#2ecc71", pos: [BASE_START[0] - 0.002, BASE_START[1] - 0.002],
        targets: [], foundMarkers: [], stats: { correct: 0, wrong: 0 },
        iconClass: 'team-3-marker', activeTargetId: null
    }
];

const LOCATIONS = [
    { id: 0, name: "Chorvoq Suv Ombori", coords: [41.6349905, 70.0421746], type: "Suv Ombori", hint: "Chirchiq daryosi yuqori oqimidagi suv ombori (Chorvoq)" },
    { id: 1, name: "Ohangaron Suv Ombori", coords: [41.0568838, 70.2224247], type: "Suv Ombori", hint: "Ohangaron daryosi yuqori oqimidagi suv ombori" },
    { id: 2, name: "Tuyabo'g'iz Suv Ombori", coords: [40.9743744, 69.3147954], type: "Suv Ombori", hint: "Ohangaron daryosi oʻrta oqimidagi suv ombori (Tuyabo'g'iz)" },
    { id: 3, name: "Angren", coords: [41.0080711, 70.0750544], type: "Ko'mir Koni", hint: "Eng yirik koʻmir koni (Angren)" },
    { id: 4, name: "Olmaliq", coords: [40.8526256, 69.5865960], type: "Sanoat Markazi", hint: "Angren-Olmaliq sanoat rayonidagi metallurgiya kombinati" },
    { id: 5, name: "Bekobod", coords: [40.2157560, 69.2606929], type: "Sanoat Markazi", hint: "Qora metallurgiyaning yirik korxonasi" },
    { id: 6, name: "Chirchiq", coords: [41.4576697, 69.5684955], type: "Sanoat Markazi", hint: "Kimyogarlar va mashinasozlar shahri" },
    { id: 7, name: "Ohangaron City", coords: [40.9088624, 69.6395539], type: "Sanoat Markazi", hint: "Ulkan sement zavodi joylashgan shahar" },
    { id: 8, name: "Nurafshon", coords: [41.0410838, 69.3615898], type: "Ma'muriy Markaz", hint: "Toshkent viloyatining maʼmuriy markazi" }
];

const QUESTIONS = [
    { q: "Toshkent iqtisodiy rayoni maʼmuriy jihatdan qaysi hududlardan tashkil topgan?", a: ["Toshkent shahri va Jizzax viloyati", "Toshkent shahri va Fargʻona viloyati", "Toshkent viloyati va Sirdaryo viloyati", "Toshkent shahri va Toshkent viloyati"], correct: 3 },
    { q: "Toshkent shahri qaysi yildan boshlab Oʻzbekistonning poytaxti maqomida kelmoqda?", a: ["1991-yildan", "1930-yildan", "1924-yildan", "1950-yildan"], correct: 1 },
    { q: "Toshkent iqtisodiy rayonida elektr energiyasining yarmini taʼminlovchi inshootlar qaysi?", a: ["Chorvoq IES va Chorvoq GESi", "Sirdaryo IESi va Navoiy IESi", "Chirchiq–Boʻzsuv kaskadi va IESlar", "Angren va Bekobod IEMlari"], correct: 2 },
    { q: "Toshkent iqtisodiy rayoni qaysi iqtisodiy rayonlar bilan tutashgan?", a: ["Samarqand va Mirzachoʻl", "Fargʻona va Zarafshon", "Fargʻona va Mirzachoʻl", "Quyi Amudaryo va Janubiy"], correct: 2 },
    { q: "Toshkent iqtisodiy rayoni qaysi mineral resurslarga boy?", a: ["Qoʻngʻir koʻmir, alyuminiy, sement", "Neft va gaz", "Mis va oltin rudalari", "Uran va fosforit"], correct: 0 },
    { q: "Toshkent viloyati sanoatida yalpimahsulotning 2/3 qismi qaysi tarmoqqa to'g'ri keladi?", a: ["Yengil sanoat", "Oziq-ovqat sanoati", "Mashinasozlik", "Ogʻir sanoat"], correct: 3 },
    { q: "Toshkent viloyati qishloq xoʻjaligining yetakchi tarmoqlari qaysilar?", a: ["Sholichilik va bugʻdoychilik", "Paxta, don, sabzavot, bogʻdorchilik", "Qorakoʻlchilik va tuyachilik", "Paxtachilik va meva"], correct: 1 },
    { q: "Toshkent viloyati sanoati uchun eng muhim tarmoqlar qaysilar?", a: ["Avtomobilsozlik", "Metallurgiya, mashinasozlik, kimyo", "Neft va gaz", "Yengil sanoat"], correct: 1 },
    { q: "Toshkent viloyatidagi IESlarni joylashtirishda qaysi omil hal qiluvchi bo'lgan?", a: ["Xomashyo omili", "Transport omili", "Isteʼmolchi va gidroenergiya", "Mahalliy koʻmir va gaz omili"], correct: 3 },
    { q: "Toshkent viloyati chorvachiligining asosiy ixtisoslashuvi nima?", a: ["Goʻsht-sut, parranda, baliqchilik", "Qorakoʻlchilik va echkichilik", "Jun uchun qoʻychilik", "Yilqichilik va tuyachilik"], correct: 0 },
    { q: "Angren–Olmaliq sanoat rayonida qaysi tarmoq asosiy hisoblanadi?", a: ["Kimyo sanoati", "Aviakosmik sanoat", "Rangli metallurgiya", "Avtomobilsozlik"], correct: 2 },
    { q: "Olmaliq kombinatida mis rudasi tarkibidan qo'shimcha nimalar olinadi?", a: ["Rux va titan", "Oltin, kumush va molibden", "Uran va volfram", "Qoʻrgʻoshin va qalay"], correct: 1 },
    { q: "Olmaliq metallurgiyasi joylashuvi qanday tamoyilga misol bo'ladi?", a: ["Xomashyo bazasiga yaqin", "Energiya manbayiga yaqin", "Kombinatlashgan ishlab chiqarish", "Transport tugunida"], correct: 2 },
    { q: "Bekobod metallurgiya zavodi qanday xomashyodan foydalanadi?", a: ["Choʻyan rudasi", "Temir rudasi", "Temir-tersak (metallom)", "Mahalliy koʻmir"], correct: 2 },
    { q: "Toshkent–Yangiyoʻl sanoat tugunining asosiy ixtisoslashuvi nima?", a: ["Mashinasozlik", "Qurilish materiallari", "Yengil va oziq-ovqat", "Togʻ-kon sanoati"], correct: 2 },
    { q: "Chirchiq shahridagi sanoatning asosiy ixtisoslashuvi qaysi?", a: ["Kimyo va qiyin eruvchan metallar", "Avtomobilsozlik", "IEM va yogʻ-moy", "Mashinasozlik"], correct: 0 },
    { q: "Toshkent viloyatidagi qaysi IES koʻmir bilan ishlaydi?", a: ["Chirchiq IEM", "Yangi Angren IES", "Toshkent IES", "Bekobod IEM"], correct: 1 },
    { q: "Chorvoq suv ombori qanday maqsadda qurilgan?", a: ["Sugʻorish va energetika", "Faqat elektr energiyasi", "Faqat sugʻorish", "Baliqchilik"], correct: 0 },
    { q: "Toshkent viloyatidagi IEMlar nima maqsadda qurilgan?", a: ["Elektr energiyasi uchun", "Rekreatsiya", "Elektr va issiqlik energiyasi", "Sugʻorish"], correct: 2 },
    { q: "Toshkent shahri qanday funksiyalarni bajaradi?", a: ["Transport markazi", "Siyosiy, iqtisodiy, madaniy markaz", "Sanoat markazi", "Faqat siyosiy markaz"], correct: 1 }
];

let map;
let teamMarkers = [];
let targetMarkers = [];
let routingControl = null;
let activeTeamId = 0;
let quizInterval = null;
let isMusicPlaying = false;
let currentRoute = null;

const UI = {
    init: () => {
        document.getElementById('btn-start-quiz').classList.add('hidden');
        document.getElementById('quiz-interface').classList.add('hidden');
        UI.refreshAll();
    },

    selectTeam: (id) => {
        if (document.body.classList.contains('animating')) return;
        Game.ensureMusic();
        Game.switchTeam(id);
    },

    toggleMusic: () => {
        const audio = document.getElementById('bg-music');
        if (isMusicPlaying) {
            audio.pause(); document.getElementById('music-toggle').innerText = "🎵 Musiqa: OFF";
        } else {
            audio.volume = 0.3; audio.play().catch(console.warn); document.getElementById('music-toggle').innerText = "🎵 Musiqa: ON";
        }
        isMusicPlaying = !isMusicPlaying;
    },

    toggleFullscreen: () => {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(console.warn);
        else if (document.exitFullscreen) document.exitFullscreen();
    },

    refreshAll: () => {
        UI.updateActivePanel();
        UI.updateStatsTable();
        UI.updateFooterControls();
    },

    updateFooterControls: () => {
        document.querySelectorAll('.team-btn').forEach((btn, idx) => {
            if (idx === activeTeamId) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    },

    updateActivePanel: () => {
        const team = TEAMS[activeTeamId];
        document.getElementById('active-team-display').innerText = team.name;
        document.getElementById('active-team-display').style.color = team.color;

        const missionText = document.getElementById('mission-text');
        if (team.activeTargetId !== null) {
            const t = LOCATIONS.find(l => l.id === team.activeTargetId);
            missionText.innerHTML = `DAVOM ETTIRING: <b>${t.hint}</b>`;
            missionText.style.color = "#d35400";
        } else if (team.targets.length > 0) {
            const t = LOCATIONS.find(l => l.id === team.targets[0]);
            missionText.innerHTML = `YANGI MAQSAD: <b>${t.hint}</b>`;
            missionText.style.color = "#16a085";
        } else {
            missionText.innerHTML = `<span style="color:green">Barcha qismlar yakunlandi!</span>`;
        }
    },

    updateStatsTable: () => {
        const tbody = document.getElementById('stats-body');
        tbody.innerHTML = '';

        TEAMS.forEach(team => {
            const isActive = (team.id === activeTeamId);
            const found = team.foundMarkers.length;
            const tr = document.createElement('tr');
            if (isActive) tr.className = 'row-active';
            tr.innerHTML = `
                <td style="color:${team.color}; font-weight:bold;">${team.name}</td>
                <td>${found} ta</td>
                <td style="color:#27ae60; font-weight:bold;">${team.stats.correct}</td>
                <td style="color:#c0392b; font-weight:bold;">${team.stats.wrong}</td>
            `;
            tbody.appendChild(tr);
        });
    },

    showNotification: (msg) => {
        const el = document.getElementById('last-message');
        el.innerHTML = msg;
        const area = document.getElementById('notification-area');
        area.style.backgroundColor = "#e8f8f5";
        setTimeout(() => area.style.backgroundColor = "white", 300);
    },

    showStartButton: () => document.getElementById('btn-start-quiz').classList.remove('hidden'),
    hideStartButton: () => document.getElementById('btn-start-quiz').classList.add('hidden')
};

const Game = {
    init: () => {
        map = L.map('map').setView(BASE_START, 9);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        fetch('tashkent.geojson').then(r => r.ok ? r.json() : null).then(d => {
            if (d) L.geoJSON(d, { style: { color: '#34495e', weight: 3, fillColor: '#3498db', fillOpacity: 0.1 } }).addTo(map);
        }).catch(console.warn);

        // Assign Targets
        let pool = [...LOCATIONS.map(l => l.id)].sort(() => Math.random() - 0.5);
        TEAMS[0].targets = [pool.pop(), pool.pop(), pool.pop()];
        TEAMS[1].targets = [pool.pop(), pool.pop(), pool.pop()];
        TEAMS[2].targets = [pool.pop(), pool.pop(), pool.pop()];

        TEAMS.forEach(team => {
            let icon = L.divIcon({ className: `team-icon ${team.iconClass}`, html: team.id + 1, iconSize: [30, 30] });
            let m = L.marker(team.pos, { icon }).addTo(map);
            teamMarkers.push(m);
        });

        LOCATIONS.forEach(loc => {
            let icon = L.divIcon({ className: 'target-marker-icon', iconSize: [20, 20] });
            let m = L.marker(loc.coords, { icon }).addTo(map);
            m.on('click', () => Game.handleMarkerClick(loc.id));
            targetMarkers.push({ id: loc.id, marker: m, data: loc });
        });

        UI.refreshAll();
        Game.switchTeam(0);
    },

    ensureMusic: () => { if (!isMusicPlaying && document.getElementById('bg-music').paused) UI.toggleMusic(); },

    switchTeam: (id) => {
        activeTeamId = id;
        if (routingControl) { map.removeControl(routingControl); routingControl = null; currentRoute = null; }

        UI.hideStartButton();
        document.getElementById('quiz-interface').classList.add('hidden');

        const team = TEAMS[id];
        targetMarkers.forEach(tm => {
            const el = tm.marker.getElement();
            if (el) {
                el.classList.remove('correct');
                if (team.foundMarkers.includes(tm.id)) el.classList.add('correct');
            }
        });

        map.panTo(team.pos);
        UI.refreshAll();

        if (team.activeTargetId !== null) {
            const t = LOCATIONS.find(l => l.id === team.activeTargetId);
            Game.drawRoute(team.pos, t.coords, team.color, true);
        } else {
            UI.showNotification(`Guruh ${id + 1} navbati.`);
        }
    },

    handleMarkerClick: (targetId) => {
        if (document.body.classList.contains('animating')) return;
        const team = TEAMS[activeTeamId];

        if (team.activeTargetId !== null && team.activeTargetId !== targetId) {
            alert("Avval boshlangan yo'lni oxiriga yetkazing!"); return;
        }
        if (team.foundMarkers.includes(targetId)) return;

        team.activeTargetId = targetId;
        const t = LOCATIONS.find(l => l.id === targetId);

        UI.refreshAll();
        UI.showNotification("Marshrut hisoblanmoqda...");
        Game.drawRoute(team.pos, t.coords, team.color, true);
    },

    drawRoute: (start, end, color, showBtn) => {
        if (routingControl) map.removeControl(routingControl);
        routingControl = L.Routing.control({
            waypoints: [L.latLng(start), L.latLng(end)],
            router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
            lineOptions: { styles: [{ color, opacity: 0.8, weight: 5 }] },
            createMarker: () => null, show: false, addWaypoints: false, fitSelectedRoutes: false
        }).addTo(map);

        routingControl.on('routesfound', (e) => {
            currentRoute = e.routes[0];
            if (showBtn) {
                UI.showStartButton();
                UI.showNotification("Tayyor! Savolga o'tish.");
            }
        });
    },

    startQuizSequence: () => {
        UI.hideStartButton();
        const q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];

        const iface = document.getElementById('quiz-interface');
        iface.classList.remove('hidden');
        document.getElementById('question-text').innerText = q.q;

        const opts = document.getElementById('options-container');
        opts.innerHTML = '';
        q.a.forEach((txt, idx) => {
            let btn = document.createElement('button');
            btn.innerText = txt;
            btn.onclick = () => Game.submitAnswer(idx === q.correct);
            opts.appendChild(btn);
        });

        let timeLeft = 30;
        const bar = document.getElementById('progress-bar');
        const txt = document.getElementById('timer-text');

        iface.dataset.ts = Date.now();
        if (quizInterval) clearInterval(quizInterval);

        quizInterval = setInterval(() => {
            timeLeft -= 0.1;
            bar.style.width = `${(timeLeft / 30) * 100}%`;

            let potentialKm = (timeLeft <= 0) ? 5.0 : 50 * (timeLeft / 30);
            if (potentialKm < 5.0 && timeLeft <= 0) potentialKm = 5.0;
            if (timeLeft > 0 && potentialKm < 0) potentialKm = 0;

            txt.innerText = `Masofa: ${potentialKm.toFixed(1)} km`;
            if (timeLeft <= -999) clearInterval(quizInterval);
        }, 100);
    },

    submitAnswer: (isCorrect) => {
        clearInterval(quizInterval);
        document.getElementById('quiz-interface').classList.add('hidden');

        const team = TEAMS[activeTeamId];
        const elapsed = (Date.now() - parseInt(document.getElementById('quiz-interface').dataset.ts)) / 1000;

        if (!isCorrect) {
            team.stats.wrong++;
            UI.refreshAll();
            UI.showNotification(`<span style='color:red'>Xato! Navbat o'tdi.</span>`);
            alert("Noto'g'ri javob!");
            Game.nextTurn();
        } else {
            team.stats.correct++;
            UI.refreshAll();
            let rem = 30 - elapsed;
            if (rem < 0) rem = 0;

            let dist;
            if (rem <= 0) {
                dist = 5;
            } else {
                dist = 50 * (rem / 30);
            }

            UI.showNotification(`<span style='color:green'>To'g'ri! ${dist.toFixed(1)} km yurasiz.</span>`);
            Game.executeMove(dist);
        }
    },

    executeMove: (kms) => {
        if (!currentRoute) return;
        document.body.classList.add('animating');

        const marker = teamMarkers[activeTeamId];
        const coords = currentRoute.coordinates;
        let maxMeters = kms * 1000;
        let i = 0; let travelled = 0; let pos = coords[0];

        const tick = setInterval(() => {
            if (i >= coords.length - 1 || travelled >= maxMeters) {
                clearInterval(tick); Game.finishMove(pos); return;
            }
            let d = L.latLng(coords[i]).distanceTo(L.latLng(coords[i + 1]));
            travelled += d; pos = coords[i + 1];
            marker.setLatLng(pos); map.panTo(pos); i++;
        }, 20);
    },

    finishMove: (finalPos) => {
        document.body.classList.remove('animating');
        const team = TEAMS[activeTeamId];
        team.pos = [finalPos.lat, finalPos.lng];

        const tId = team.activeTargetId;
        const tObj = targetMarkers.find(t => t.id === tId);
        const dist = L.latLng(finalPos).distanceTo(L.latLng(tObj.data.coords));

        if (dist < 1000) {
            if (team.targets.includes(tId)) {
                team.foundMarkers.push(tId);
                team.targets = team.targets.filter(t => t !== tId);
                tObj.marker.getElement().classList.add('correct');
                UI.showNotification("<span style='color:green'>Manzil topildi!</span>");
                alert(`TABRIKLAYMIZ! ${tObj.data.name} topildi.`);
                team.activeTargetId = null;
                if (routingControl) { map.removeControl(routingControl); routingControl = null; }
            } else {
                UI.showNotification("<span style='color:red'>Noto'g'ri manzil!</span>");
                alert("Bu noto'g'ri joy!");
                team.activeTargetId = null;
                if (routingControl) { map.removeControl(routingControl); routingControl = null; }
            }
            UI.refreshAll();
            Game.nextTurn();
        } else {
            UI.showNotification("Sayohat davom etadi...");
            Game.nextTurn();
        }
    },

    nextTurn: () => {
        setTimeout(() => {
            let n = (activeTeamId + 1) % 3; Game.switchTeam(n);
        }, 1500);
    }
};

document.addEventListener("DOMContentLoaded", () => { Game.init(); UI.init(); });
window.UI = UI; window.Game = Game;
