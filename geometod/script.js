/**
 * GEOGRAPHIC DISCOVERY: UZBEKISTAN EDITION (FINAL UNIVERSAL)
 * Logic: 30s Timer, Distance Calc, 5 Random Targets from 9, Victory Fireworks
 */

// --- DATA ---
const BASE_START = [41.2660, 69.2770];

const TEAMS = [
    {
        id: 0, name: "Guruh 1", color: "#e74c3c", pos: BASE_START,
        targets: [], foundMarkers: [], stats: { correct: 0, wrong: 0 },
        iconClass: 'team-1-marker', activeTargetId: null,
        lastQIdx: -3, qSetOffset: 0 // Logic: 0, 3, 6...
    },
    {
        id: 1, name: "Guruh 2", color: "#3498db", pos: [BASE_START[0] + 0.002, BASE_START[1] + 0.002],
        targets: [], foundMarkers: [], stats: { correct: 0, wrong: 0 },
        iconClass: 'team-2-marker', activeTargetId: null,
        lastQIdx: -2, qSetOffset: 0 // Logic: 1, 4, 7...
    },
    {
        id: 2, name: "Guruh 3", color: "#2ecc71", pos: [BASE_START[0] - 0.002, BASE_START[1] - 0.002],
        targets: [], foundMarkers: [], stats: { correct: 0, wrong: 0 },
        iconClass: 'team-3-marker', activeTargetId: null,
        lastQIdx: -1, qSetOffset: 0 // Logic: 2, 5, 8...
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
    {
        q: "Toshkent iqtisodiy rayoni maʼmuriy jihatdan qaysi hududlardan tashkil topgan?",
        a: [
            "Toshkent shahri va Jizzax viloyati",
            "Toshkent shahri va Fargʻona viloyati",
            "Toshkent viloyati va Sirdaryo viloyati",
            "Toshkent shahri va Toshkent viloyati"
        ],
        correct: 3
    },

    {
        q: "Toshkent shahri qaysi yildan boshlab Oʻzbekistonning poytaxti maqomida kelmoqda?",
        a: [
            "1991-yildan",
            "1930-yildan",
            "1924-yildan",
            "1950-yildan"
        ],
        correct: 1
    },

    {
        q: "Toshkent iqtisodiy rayonida ishlab chiqariladigan elektr energiyasining qariyb yarmini taʼminlovchi asosiy inshootlar majmuasi qaysi?",
        a: [
            "Chorvoq IES va Chorvoq GESi",
            "Sirdaryo IESi va Navoiy IESi",
            "Chirchiq–Boʻzsuv gidroenergetika kaskadi va IESlar",
            "Angren va Bekobod IEMlari"
        ],
        correct: 2
    },

    {
        q: "Toshkent iqtisodiy rayoni qaysi iqtisodiy rayonlar bilan tutashgan?",
        a: [
            "Samarqand va Mirzachoʻl",
            "Fargʻona va Zarafshon",
            "Fargʻona va Mirzachoʻl",
            "Quyi Amudaryo va Janubiy"
        ],
        correct: 2
    },

    {
        q: "Toshkent iqtisodiy rayoni qaysi mineral resurslarga boyligi bilan boshqa rayonlardan ajralib turadi?",
        a: [
            "Qoʻngʻir koʻmir, alyuminiy va sement xomashyolari",
            "Neft va gaz",
            "Mis va oltin rudalari",
            "Uran va fosforit"
        ],
        correct: 0
    },

    {
        q: "Toshkent iqtisodiy rayonining sanoatida yalpi mahsulotning asosiy qismi (2/3) qaysi tarmoqqa toʻgʻri keladi?",
        a: [
            "Yengil sanoat",
            "Oziq-ovqat sanoati",
            "Mashinasozlik",
            "Ogʻir sanoat"
        ],
        correct: 3
    },

    {
        q: "Toshkent viloyati qishloq xoʻjaligining yetakchi tarmoqlari qatoriga qaysilar kiradi?",
        a: [
            "Sholichilik va bugʻdoychilik",
            "Paxtachilik, donchilik, sabzavotchilik, bogʻdorchilik, goʻsht-sut chorvachiligi",
            "Qorakoʻlchilik va tuyachilik",
            "Paxtachilik va meva yetishtirish"
        ],
        correct: 1
    },

    {
        q: "Toshkent viloyatining sanoat tarkibi uchun xos boʻlgan eng muhim tarmoqlar qaysilar?",
        a: [
            "Avtomobilsozlik va elektrotexnika",
            "Qora va rangli metallurgiya, mashinasozlik, kimyo, qurilish materiallari sanoati",
            "Neftni qayta ishlash va gaz sanoati",
            "Yengil va oziq-ovqat sanoati"
        ],
        correct: 1
    },

    {
        q: "Toshkent viloyatidagi IESlarni joylashtirishda qaysi omil hal qiluvchi rol oʻynagan?",
        a: [
            "Xomashyo omili",
            "Transport omili",
            "Isteʼmolchi va gidroenergetika imkoniyati",
            "Mahalliy koʻmir va gaz omili"
        ],
        correct: 3
    },

    {
        q: "Toshkent viloyati chorvachiligining asosiy ixtisoslashuvi nimadan iborat?",
        a: [
            "Goʻsht-sut chorvachiligi, parrandachilik va baliqchilik",
            "Qorakoʻlchilik va echkichilik",
            "Jun uchun qoʻychilik",
            "Yilqichilik va tuyachilik"
        ],
        correct: 0
    },

    {
        q: "Angren–Olmaliq sanoat rayonida mamlakatdagi qaysi sanoat tarmogʻining asosiy qismi jamlangan?",
        a: [
            "Kimyo sanoati",
            "Aviakosmik sanoati",
            "Rangli metallurgiya",
            "Avtomobilsozlik"
        ],
        correct: 2
    },

    {
        q: "Olmaliq togʻ-metallurgiya kombinatida mis ruda tarkibida qoʻshimcha ravishda qaysi metallar qazib olinadi?",
        a: [
            "Rux va titan",
            "Oltin, kumush va molibden",
            "Uran va volfram",
            "Qoʻrgʻoshin va qalay"
        ],
        correct: 1
    },

    {
        q: "Olmaliq metallurgiyasi joylashuvi qanday joylashuv tamoyiliga misol boʻladi?",
        a: [
            "Xomashyo bazasiga yaqin joylashuv",
            "Energiya manbayiga yaqin joylashuv",
            "Kombinatlashgan ishlab chiqarish",
            "Transport tugunida joylashuv"
        ],
        correct: 2
    },

    {
        q: "Bekobod shahridagi metallurgiya zavodi oʻz ish faoliyatida qanday xomashyodan foydalanadi?",
        a: [
            "Choʻyan rudasi",
            "Temir rudasi",
            "Temir-tersak (metallom)",
            "Mahalliy koʻmir"
        ],
        correct: 2
    },

    {
        q: "Toshkent–Yangiyoʻl sanoat tugunining asosiy ixtisoslashuvi qaysi sanoat tarmoqlariga toʻgʻri keladi?",
        a: [
            "Mashinasozlik",
            "Qurilish materiallari",
            "Yengil va oziq-ovqat sanoati",
            "Togʻ-kon sanoati"
        ],
        correct: 2
    },

    {
        q: "Chirchiq shahridagi sanoatning asosiy ixtisoslashuvi qaysi tarmoqlarga toʻgʻri keladi?",
        a: [
            "Kimyo va qiyin eruvchan qotishmalar ishlab chiqarish",
            "Avtomobilsozlik va paxta tozalash",
            "IEM va yogʻ-moy sanoati",
            "Mashinasozlik va metallurgiya"
        ],
        correct: 0
    },

    {
        q: "Toshkent viloyatidagi qaysi IES koʻmir bilan ishlaydi?",
        a: [
            "Chirchiq IEM",
            "Yangi Angren IES",
            "Toshkent IES",
            "Bekobod IEM"
        ],
        correct: 1
    },

    {
        q: "Toshkent viloyatidagi Chorvoq suv ombori qanday maqsadda qurilgan?",
        a: [
            "Sugʻorish va energetika",
            "Faqat elektr energiyasi",
            "Faqat sugʻorish",
            "Baliqchilik va dam olish"
        ],
        correct: 0
    },

    {
        q: "Toshkent viloyatidagi IEMlar nima maqsadda qurilgan?",
        a: [
            "Elektr energiyasi ishlab chiqarish uchun",
            "Rekreatsiya va baliqchilik",
            "Elektr energiyasi va issiqlik energiyasi ishlab chiqarish",
            "Sugʻorish va energetika"
        ],
        correct: 2
    },

    {
        q: "Toshkent shahri qanday funksiyalarni (vazifalarni) bajaradi?",
        a: [
            "Transport va ilm-fan markazi",
            "Siyosiy, iqtisodiy, transport, ilm-fan va madaniy markaz",
            "Sanoat va transport markazi",
            "Faqat siyosiy va ilm-fan markazi"
        ],
        correct: 1
    },

    {
        q: "2019-yil maʼlumotlariga koʻra Toshkent shahrida qancha aholi istiqomat qiladi?",
        a: [
            "1,5 mln ga yaqin",
            "2,5 mln ga yaqin",
            "3 mln ga yaqin",
            "4 mln ga yaqin"
        ],
        correct: 1
    },

    {
        q: "Toshkent shahri atrofida vujudga kelgan aglomeratsiyaning radiusi qancha?",
        a: [
            "10-20 km",
            "30-40 km",
            "60-70 km",
            "80-100 km"
        ],
        correct: 2
    },

    {
        q: "Toshkent aglomeratsiyasi tarkibiga nechta shahar va shaharcha kiradi?",
        a: [
            "5 ta shahar va oʻnlab shaharcha",
            "10 ta shahar va oʻnlab shaharcha",
            "15 ta shahar va oʻnlab shaharcha",
            "20 ta shahar va oʻnlab shaharcha"
        ],
        correct: 1
    },

    {
        q: "Toshkent shahrida sanoatning qaysi tarmoqlari yetakchilik qiladi?",
        a: [
            "Kimyo va metallurgiya",
            "Mashinasozlik, yengil va oziq-ovqat sanoatlari",
            "Yoqilgʻi-energetika va qurilish materiallari",
            "Farmasevtika va kosmetika sanoati"
        ],
        correct: 1
    },

    {
        q: "Toshkent IESlari oʻz ish faoliyatida qanday yoqilgʻidan foydalanadi?",
        a: [
            "Qoʻngʻir koʻmir",
            "Neft",
            "Tabiiy gaz",
            "Torf"
        ],
        correct: 2
    },

    {
        q: "Toshkent shahrida yuk tashishning asosiy qismi qaysi transport turiga toʻgʻri keladi?",
        a: [
            "Temiryoʻl transporti",
            "Quvur transporti",
            "Avtomobil transporti",
            "Havo transporti"
        ],
        correct: 2
    },

    {
        q: "Chorvoq suv ombori qaysi daryoda barpo etilgan?",
        a: [
            "Ohangaron daryosi",
            "Sirdaryo daryosi",
            "Chirchiq daryosi",
            "Zarafshon daryosi"
        ],
        correct: 2
    },

    {
        q: "2017-yildan Toshkent viloyatining maʼmuriy markazi maqomini olgan shahar qaysi?",
        a: [
            "Angren",
            "Olmaliq",
            "Chirchiq",
            "Nurafshon"
        ],
        correct: 3
    },

    {
        q: "Toshkent viloyatida mavjud IESlarning asosiy turi qaysi?",
        a: [
            "Gaz bilan ishlaydigan IESlar",
            "Koʻmir bilan ishlaydigan IESlar",
            "Neft bilan ishlaydigan IESlar",
            "IEMlar"
        ],
        correct: 1
    },

    {
        q: "Olmaliq sanoat tugunining asosiy ixtisoslashuvi qaysi tarmoqqa toʻgʻri keladi?",
        a: [
            "Kimyo sanoati",
            "Mashinasozlik",
            "Rangli metallurgiya",
            "Qurilish materiallari sanoati"
        ],
        correct: 2
    },

    {
        q: "Toshkent iqtisodiy rayonining rivojlanishiga asosiy sabab nima?",
        a: [
            "Qulay tabiiy sharoit",
            "Geografik oʻrin qulayligi va iqtisodiy imkoniyatlar",
            "Koʻp sonli malakali kadrlar",
            "Boy mineral resurslarga egaligi"
        ],
        correct: 1
    },

    {
        q: "Toshkent viloyati Chorvoq suv ombori qanday maqsadda qurilgan?",
        a: [
            "Sugʻorish va energetika",
            "Faqat sugʻorish",
            "Faqat energetika",
            "Baliqchilik va dam olish"
        ],
        correct: 0
    },

    {
        q: "Toshkent viloyati yengil va oziq-ovqat sanoati korxonalari joylashgan sanoat tugunlari qaysilar?",
        a: [
            "Angren–Olmaliq",
            "Toshkent–Chirchiq va Toshkent–Yangiyoʻl",
            "Bekobod",
            "Gʻazalkent"
        ],
        correct: 1
    },

    {
        q: "Toshkent shahri aglomeratsiyasi tarkibiga qancha shahar kiradi?",
        a: [
            "5 ta shahar",
            "7 ta shahar",
            "10 ta shahar",
            "15 ta shahar"
        ],
        correct: 2
    },

    {
        q: "Toshkent shahri qaysi funksiyalarni bajaradi?",
        a: [
            "Transport va ilm-fan markazi",
            "Siyosiy va madaniy markaz",
            "Sanoat va transport markazi",
            "Koʻp funksiyali shahar"
        ],
        correct: 3
    },

    {
        q: "Olmaliq shahri qachon va nima sababdan sanoat punkti sifatida shakllangan?",
        a: [
            "1951-y, rangli metall rudasi koni negizida",
            "1940-y, koʻmir koni negizida",
            "1930-y, IEM qurilishi negizida",
            "1960-y, kimyo sanoati negizida"
        ],
        correct: 0
    },

    {
        q: "Bekobod sanoat tugunining asosiy ixtisoslashuvi nima?",
        a: [
            "Kimyo va qurilish materiallari",
            "Sement va mashinasozlik",
            "Qora metallurgiya va qurilish materiallari",
            "Neftni qayta ishlash"
        ],
        correct: 2
    },

    {
        q: "Chorvoq suv ombori qanday maqsadda qurilgan?",
        a: [
            "Sugʻorish va energetika",
            "Faqat sugʻorish",
            "Faqat energetika",
            "Baliqchilik va dam olish"
        ],
        correct: 0
    },

    {
        q: "Angren shahri qachon va nima sababdan sanoat punkti sifatida shakllangan?",
        a: [
            "1951-y, rangli metall rudasi koni negizida",
            "1940-y, koʻmir koni negizida",
            "1930-y, IEM qurilishi negizida",
            "1960-y, kimyo sanoati negizida"
        ],
        correct: 1
    },

    {
        q: "Toshkent viloyatining maʼmuriy markazi Nurafshon shahrida qaysi konsepsiya amalga oshirilmoqda?",
        a: [
            "Yangi shaharcha",
            "Yashil shahar",
            "Aqlli shahar",
            "Sanoat shahri"
        ],
        correct: 2
    }
];


let map;
let teamMarkers = [];
let targetMarkers = [];
let routingControl = null;
let activeTeamId = 0;
let quizInterval = null;
let isMusicPlaying = false;
let currentRoute = null;
let selectedTargets = []; // 5 randomly chosen target IDs
let gameOver = false;

const UI = {
    init: () => {
        document.getElementById('btn-start-quiz').classList.add('hidden');
        document.getElementById('quiz-interface').classList.add('hidden');
        UI.refreshAll();
    },

    selectTeam: (id) => {
        if (gameOver) return;
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
        document.getElementById('active-team-display').innerText = team.name + ` (${team.foundMarkers.length}/4)`;
        document.getElementById('active-team-display').style.color = team.color;

        const missionText = document.getElementById('mission-text');
        if (gameOver) {
            missionText.innerHTML = `<span style="color:gold;font-weight:bold">🏆 O'yin tugadi!</span>`;
            missionText.style.color = "gold";
        } else if (team.activeTargetId !== null) {
            const t = LOCATIONS.find(l => l.id === team.activeTargetId);
            missionText.innerHTML = `DAVOM ETTIRING: <b>${t.hint}</b>`;
            missionText.style.color = "#d35400";
        } else if (team.targets.length > 0) {
            const t = LOCATIONS.find(l => l.id === team.targets[0]);
            missionText.innerHTML = `YANGI MAQSAD: <b>${t.hint}</b>`;
            missionText.style.color = "#16a085";
        } else {
            missionText.innerHTML = `<span style="color:green">Barcha 4 joy topildi!</span>`;
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
                <td>${found}/4</td>
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

        // Randomly pick 4 locations for EACH team independently
        TEAMS.forEach(t => {
            let allIds = [...LOCATIONS.map(l => l.id)].sort(() => Math.random() - 0.5);
            t.targets = allIds.slice(0, 4);
        });

        TEAMS.forEach(team => {
            let icon = L.divIcon({ className: `team-icon ${team.iconClass}`, html: team.id + 1, iconSize: [30, 30] });
            let m = L.marker(team.pos, { icon }).addTo(map);
            teamMarkers.push(m);
        });

        // Show all locations on the map as targets, markers will highlight per team
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
        if (gameOver) return;
        activeTeamId = id;
        if (routingControl) { map.removeControl(routingControl); routingControl = null; currentRoute = null; }

        UI.hideStartButton();
        document.getElementById('quiz-interface').classList.add('hidden');

        const team = TEAMS[id];
        targetMarkers.forEach(tm => {
            const el = tm.marker.getElement();
            if (el) {
                // Show only this team's assigned targets or already found markers
                if (team.targets.includes(tm.id) || team.foundMarkers.includes(tm.id)) {
                    el.style.display = 'block';
                    el.classList.remove('correct');
                    if (team.foundMarkers.includes(tm.id)) el.classList.add('correct');
                } else {
                    el.style.display = 'none';
                }
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
        if (gameOver) return;
        if (document.body.classList.contains('animating')) return;
        const team = TEAMS[activeTeamId];

        // Auto-start music on first interaction
        Game.ensureMusic();

        // If team already has an active target, they must finish it first
        if (team.activeTargetId !== null && team.activeTargetId !== targetId) {
            alert("Avval boshlangan yo'lni oxiriga yetkazing!"); return;
        }
        // Don't allow clicking already-found markers
        if (team.foundMarkers.includes(targetId)) {
            UI.showNotification("Bu joy allaqachon topilgan!");
            return;
        }
        // Check this target is actually in the team's assigned targets
        if (!team.targets.includes(targetId) && !team.foundMarkers.includes(targetId)) {
            UI.showNotification("Bu joy sizning guruhingizga biriktirilmagan!");
            return;
        }

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

        const team = TEAMS[activeTeamId];
        let nextIdx = team.lastQIdx + 3;

        // If reached end of current set (e.g. 0, 3, 6... > total)
        if (nextIdx >= QUESTIONS.length) {
            team.qSetOffset = (team.qSetOffset + 1) % 3;
            nextIdx = (team.id + team.qSetOffset) % 3;
        }

        team.lastQIdx = nextIdx;
        const q = QUESTIONS[nextIdx];

        const iface = document.getElementById('quiz-interface');
        iface.classList.remove('hidden');
        document.getElementById('question-text').innerText = q.q;

        const opts = document.getElementById('options-container');
        opts.innerHTML = '';
        let answered = false;
        q.a.forEach((txt, idx) => {
            let btn = document.createElement('button');
            btn.innerText = txt;
            btn.onclick = () => {
                if (answered) return;
                answered = true;
                Game.submitAnswer(idx === q.correct);
            };
            opts.appendChild(btn);
        });

        let timeLeft = 30;
        const bar = document.getElementById('progress-bar');
        const txt = document.getElementById('timer-text');

        iface.dataset.ts = Date.now();
        if (quizInterval) clearInterval(quizInterval);
        txt.style.color = '#2c3e50'; // reset color from previous expired timer

        quizInterval = setInterval(() => {
            timeLeft -= 0.1;
            bar.style.width = `${Math.max(0, (timeLeft / 30) * 100)}%`;

            let potentialKm = (timeLeft <= 0) ? 5.0 : 50 * (timeLeft / 30);
            if (potentialKm < 5.0) potentialKm = 5.0;

            txt.innerText = `Masofa: ${potentialKm.toFixed(1)} km`;

            // When time expires: stop timer, but keep quiz open with min distance
            if (timeLeft <= 0) {
                clearInterval(quizInterval);
                bar.style.width = '0%';
                txt.innerText = `⚠️ Vaqt tugadi! 5.0 km`;
                txt.style.color = '#e74c3c';
            }
        }, 100);
    },

    submitAnswer: (isCorrect) => {
        clearInterval(quizInterval);
        document.getElementById('quiz-interface').classList.add('hidden');

        const team = TEAMS[activeTeamId];
        const elapsed = (Date.now() - parseInt(document.getElementById('quiz-interface').dataset.ts)) / 1000;

        if (!isCorrect) {
            team.stats.wrong++;
            // Wrong answer: keep activeTargetId & route — team just loses this turn
            // When their turn comes back, switchTeam will redraw the route
            UI.refreshAll();
            UI.showNotification(`<span style='color:red'>Xato! Navbat o'tdi.</span>`);
            alert("Noto'g'ri javob! Keyingi navbatda davom etasiz.");
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
            // Increase speed by taking larger steps (every 2nd coordinate) and reducing interval
            let nextIdx = Math.min(i + 6, coords.length - 1);
            let d = L.latLng(coords[i]).distanceTo(L.latLng(coords[nextIdx]));
            travelled += d; pos = coords[nextIdx];
            marker.setLatLng(pos); map.panTo(pos); i = nextIdx;
        }, 10);
    },

    finishMove: (finalPos) => {
        document.body.classList.remove('animating');
        const team = TEAMS[activeTeamId];
        team.pos = [finalPos.lat, finalPos.lng];

        const tId = team.activeTargetId;
        // Safety check: if no active target (shouldn't happen but guard against it)
        if (tId === null) {
            Game.nextTurn();
            return;
        }

        const tObj = targetMarkers.find(t => t.id === tId);
        if (!tObj) {
            team.activeTargetId = null;
            Game.nextTurn();
            return;
        }

        const dist = L.latLng(finalPos).distanceTo(L.latLng(tObj.data.coords));

        if (dist < 1000) {
            if (team.targets.includes(tId)) {
                team.foundMarkers.push(tId);
                team.targets = team.targets.filter(t => t !== tId);
                tObj.marker.getElement().classList.add('correct');
                UI.showNotification("<span style='color:green'>Manzil topildi! (" + team.foundMarkers.length + "/4)</span>");
                alert(`TABRIKLAYMIZ! ${tObj.data.name} topildi. (${team.foundMarkers.length}/4)`);
                team.activeTargetId = null;
                if (routingControl) { map.removeControl(routingControl); routingControl = null; currentRoute = null; }
                // Check if this team found all 5 — they win!
                if (Game.checkGameOver(team)) return;
            } else {
                UI.showNotification("<span style='color:orange'>Bu joy allaqachon topilgan!</span>");
                team.activeTargetId = null;
                if (routingControl) { map.removeControl(routingControl); routingControl = null; currentRoute = null; }
            }
            UI.refreshAll();
            Game.nextTurn();
        } else {
            // Team didn't reach yet — keep the activeTargetId so they continue next turn
            UI.showNotification(`Manzilgacha hali ${(dist / 1000).toFixed(1)} km qoldi. Sayohat davom etadi...`);
            Game.nextTurn();
        }
    },

    nextTurn: () => {
        if (gameOver) return;
        setTimeout(() => {
            let n = (activeTeamId + 1) % 3; Game.switchTeam(n);
        }, 1500);
    },

    checkGameOver: (winnerTeam) => {
        // First team to find all 5 targets wins
        if (winnerTeam.targets.length > 0) return false;

        gameOver = true;

        UI.refreshAll();
        UI.showNotification(`<span style='color:gold; font-size:1.2rem'>🏆 ${winnerTeam.name} G'OLIB! 4/4 topildi! 🏆</span>`);

        // Play victory sound effect
        Game.playVictorySound();

        // Launch fireworks celebration
        Game.launchFireworks(winnerTeam.color);
        return true;
    },

    playVictorySound: () => {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            // Fanfare melody notes (frequency, startTime, duration, type)
            const notes = [
                [523.25, 0, 0.1, 'square'],    // C5
                [659.25, 0.1, 0.1, 'square'], // E5
                [784.00, 0.2, 0.1, 'square'],  // G5
                [1046.50, 0.3, 0.4, 'square'], // C6
                [784.00, 0.7, 0.1, 'square'],  // G5
                [1046.50, 0.8, 0.6, 'square'], // C6
                // Harmony
                [261.63, 0, 0.7, 'sawtooth'],  // C4
                [329.63, 0.7, 0.7, 'sawtooth'],// E4
            ];

            notes.forEach(([freq, start, dur, type]) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.type = type || 'triangle';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0, audioCtx.currentTime + start);
                gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + start + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + start + dur);
                osc.start(audioCtx.currentTime + start);
                osc.stop(audioCtx.currentTime + start + dur);
            });

            // "Sparkle" effect
            for (let i = 0; i < 15; i++) {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.type = 'sine';
                osc.frequency.value = 1500 + Math.random() * 2000;
                const t = 1.0 + i * 0.1;
                gain.gain.setValueAtTime(0.1, audioCtx.currentTime + t);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + t + 0.2);
                osc.start(audioCtx.currentTime + t);
                osc.stop(audioCtx.currentTime + t + 0.3);
            }
        } catch (e) { console.warn('Victory sound failed:', e); }
    },

    launchFireworks: (winnerColor) => {
        // Use canvas-confetti for a professional look
        const duration = 15 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 99999 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            // since particles fall down, start a bit higher than random
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                colors: [winnerColor, '#f1c40f', '#ffffff']
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors: [winnerColor, '#f1c40f', '#ffffff']
            });
        }, 250);

        // Visual text overlay on top of the map
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 100000;
            text-align: center;
            pointer-events: none;
            background: rgba(255, 255, 255, 0.9);
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 0 50px rgba(0,0,0,0.3);
            border: 5px solid ${winnerColor};
            animation: victoryScale 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        `;
        overlay.innerHTML = `
            <h1 style="font-size: 3rem; color: #2c3e50; margin: 0;">🏆 G'ALABA! 🏆</h1>
            <p style="font-size: 1.5rem; color: ${winnerColor}; font-weight: bold; margin: 20px 0;">${TEAMS[activeTeamId].name} o'yin g'olibi bo'ldi!</p>
            <p style="font-size: 1.1rem; color: #7f8c8d;">Barcha 4 ta manzil muvaffaqiyatli topildi.</p>
        `;
        document.body.appendChild(overlay);

        // Add CSS animation for victory overlay
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes victoryScale {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
};

document.addEventListener("DOMContentLoaded", () => { Game.init(); UI.init(); });
window.UI = UI; window.Game = Game;
