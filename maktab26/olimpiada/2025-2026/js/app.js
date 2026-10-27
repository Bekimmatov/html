
// Global State
let APP_STATE = {
  data: window.OLIMPIADA_DATA || {},
  currentTab: 'bosh-sahifa',
  theme: 'light',
  privacyMode: false, // true = abbreviated names
  filters: {
    year: 'all',
    subject: 'all',
    grade: 'all',
    school: 'all',
    search: ''
  },
  studentsPage: 1,
  studentsPerPage: 25,
  schoolsSort: { col: 'rank_2026', dir: 'asc' },
  studentsSort: { col: 'rank', dir: 'asc' }
};

// Cached Chart Instances
window.appCharts = {};

// Initialization
function initApp() {
  initTheme();
  populateSchoolFilterDropdown();
  renderAllViews();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function initTheme() {
  try {
    const saved = localStorage.getItem('oa_theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  } catch (e) {
    setTheme('light');
  }
}

function setTheme(mode) {
  APP_STATE.theme = mode;
  const root = document.documentElement;
  const icon = document.getElementById('theme-icon');
  if (mode === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    if (icon) icon.textContent = '☀️';
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    if (icon) icon.textContent = '🌙';
  }
  try {
    localStorage.setItem('oa_theme', mode);
  } catch(e) {}
  // Update charts if already rendered
  updateChartsTheme();
}

function toggleTheme() {
  setTheme(APP_STATE.theme === 'dark' ? 'light' : 'dark');
}

function togglePrivacyMode() {
  APP_STATE.privacyMode = !APP_STATE.privacyMode;
  const lbl = document.getElementById('privacy-label');
  const icn = document.getElementById('privacy-icon');
  if (APP_STATE.privacyMode) {
    if (lbl) lbl.textContent = "Qisqartirilgan";
    if (icn) icn.textContent = "🔒";
  } else {
    if (lbl) lbl.textContent = "To'liq ism";
    if (icn) icn.textContent = "👁️";
  }
  renderStudentsTable();
  renderM26DirectionsTable();
}

function formatStudentName(name) {
  if (!name || name === '-') return '-';
  if (!APP_STATE.privacyMode) return name;
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return parts[0][0] + '. ' + parts[1];
  }
  return parts[0];
}

// Tab Switching
function switchTab(tabId) {
  APP_STATE.currentTab = tabId;
  
  // Hide all tab content
  document.querySelectorAll('.tab-content').forEach(el => {
    el.classList.add('hidden');
  });
  
  // Show target
  const target = document.getElementById('tab-' + tabId);
  if (target) {
    target.classList.remove('hidden');
  }

  // Update nav buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('bg-blue-600', 'text-white', 'shadow-sm');
      btn.classList.remove('text-slate-600', 'dark:text-slate-300', 'hover:bg-slate-100', 'dark:hover:bg-slate-800');
    } else {
      btn.classList.remove('bg-blue-600', 'text-white', 'shadow-sm');
      btn.classList.add('text-slate-600', 'dark:text-slate-300', 'hover:bg-slate-100', 'dark:hover:bg-slate-800');
    }
  });

  // Render specific tab charts or components if needed
  if (tabId === 'bosh-sahifa') {
    renderDashboardCharts();
  } else if (tabId === 'yillarni-taqqoslash') {
    renderYoYCharts();
  } else if (tabId === 'fanlar-tahlili') {
    renderSubjectsChart();
  } else if (tabId === 'savollar-tahlili') {
    renderQuestionsChart();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Populate School Dropdown
function populateSchoolFilterDropdown() {
  const select = document.getElementById('filter-school');
  if (!select || !APP_STATE.data.school_ranking) return;
  
  // Keep first two default options
  select.innerHTML = '<option value="all">Barcha maktablar</option><option value="26-maktab">⭐ 26-maktab</option>';
  
  APP_STATE.data.school_ranking.forEach(s => {
    if (s.school !== '26-maktab') {
      const opt = document.createElement('option');
      opt.value = s.school;
      opt.textContent = s.school;
      select.appendChild(opt);
    }
  });
}

// Filter handling
function onFilterChange() {
  const yearEl = document.getElementById('filter-year');
  const subjEl = document.getElementById('filter-subject');
  const gradeEl = document.getElementById('filter-grade');
  const schoolEl = document.getElementById('filter-school');
  const searchEl = document.getElementById('global-search');
  
  APP_STATE.filters.year = yearEl ? yearEl.value : 'all';
  APP_STATE.filters.subject = subjEl ? subjEl.value : 'all';
  APP_STATE.filters.grade = gradeEl ? gradeEl.value : 'all';
  APP_STATE.filters.school = schoolEl ? schoolEl.value : 'all';
  if (searchEl) {
    APP_STATE.filters.search = searchEl.value.toLowerCase().trim();
  }
  APP_STATE.studentsPage = 1;
  
  renderAllViews();
}

function onGlobalSearchInput() {
  const searchEl = document.getElementById('global-search');
  const query = searchEl ? searchEl.value.toLowerCase().trim() : '';
  APP_STATE.filters.search = query;
  APP_STATE.studentsPage = 1;
  renderStudentsTable();
}

function resetFilters() {
  const yearEl = document.getElementById('filter-year');
  const subjEl = document.getElementById('filter-subject');
  const gradeEl = document.getElementById('filter-grade');
  const schoolEl = document.getElementById('filter-school');
  const searchEl = document.getElementById('global-search');
  
  if (yearEl) yearEl.value = 'all';
  if (subjEl) subjEl.value = 'all';
  if (gradeEl) gradeEl.value = 'all';
  if (schoolEl) schoolEl.value = 'all';
  if (searchEl) searchEl.value = '';
  
  APP_STATE.filters = {
    year: 'all',
    subject: 'all',
    grade: 'all',
    school: 'all',
    search: ''
  };
  APP_STATE.studentsPage = 1;
  renderAllViews();
}

function filterBySchool26() {
  const schoolEl = document.getElementById('filter-school');
  if (schoolEl) schoolEl.value = '26-maktab';
  onFilterChange();
  switchTab('26-maktab');
}

// Get Filtered Records
function getFilteredRecords() {
  if (!APP_STATE.data || !APP_STATE.data.records) return [];
  const y = APP_STATE.filters.year;
  const s = APP_STATE.filters.subject;
  const g = APP_STATE.filters.grade;
  const sc = APP_STATE.filters.school;
  const q = (APP_STATE.filters.search || '').toLowerCase().trim();

  return APP_STATE.data.records.filter(r => {
    if (y !== 'all' && String(r.year) !== String(y)) return false;
    if (s !== 'all' && r.subject !== s) return false;
    if (g !== 'all' && String(r.grade) !== String(g)) return false;
    if (sc !== 'all' && r.school !== sc) return false;
    if (q) {
      const name = (r.name || '').toLowerCase();
      const school = (r.school || '').toLowerCase();
      const teacher = (r.teacher || '').toLowerCase();
      const subject = (r.subject || '').toLowerCase();
      if (!name.includes(q) && !school.includes(q) && !teacher.includes(q) && !subject.includes(q)) {
        return false;
      }
    }
    return true;
  });
}

// Render All Components
function renderAllViews() {
  renderKpiCards();
  renderDashboardSummaryTable();
  renderDashboardCharts();
  renderSchoolsTable();
  renderSubjectsTable();
  renderContinuityCards();
  renderMedalsShowcase();
  renderReservePipelineTable();
  renderM26DirectionsTable();
  renderLeadershipDecisions();
  renderStudentsTable();
  renderActionPlanTable();
}

// KPI Cards
function renderKpiCards() {
  const grid = document.getElementById('kpi-cards-grid');
  if (!grid) return;

  const filtered = getFilteredRecords();
  const totalRecords = filtered.length;
  const y = APP_STATE.filters.year;
  const sc = APP_STATE.filters.school;
  const s = APP_STATE.filters.subject;
  const g = APP_STATE.filters.grade;

  // District average of filtered subset
  const districtAvg = totalRecords > 0 
    ? (filtered.reduce((acc, r) => acc + (r.score || 0), 0) / totalRecords).toFixed(2)
    : (y === '2026' ? '19.25' : (y === '2025' ? '19.50' : '19.37'));

  // Target school (26-maktab by default unless another school selected)
  const targetSchool = sc !== 'all' ? sc : '26-maktab';
  const schoolRecs = filtered.filter(r => r.school === targetSchool);
  const schoolCount = schoolRecs.length;

  let schoolAvg = '0.00';
  if (schoolCount > 0) {
    schoolAvg = (schoolRecs.reduce((acc, r) => acc + (r.score || 0), 0) / schoolCount).toFixed(2);
  } else if (targetSchool === '26-maktab' && s === 'all' && g === 'all') {
    schoolAvg = y === '2026' ? '20.81' : (y === '2025' ? '21.12' : '20.96');
  }

  // Medals (rank 1, 2, 3) for target school
  const golds = schoolRecs.filter(r => r.rank === 1).length;
  const silvers = schoolRecs.filter(r => r.rank === 2).length;
  const bronzes = schoolRecs.filter(r => r.rank === 3).length;
  let totalMedals = golds + silvers + bronzes;
  let medalsSub = `${golds} Oltin, ${silvers} Kumush, ${bronzes} Bronza`;

  if (targetSchool === '26-maktab' && s === 'all' && g === 'all') {
    if (y === '2026') {
      totalMedals = 3;
      medalsSub = '1 Oltin, 1 Kumush, 1 Bronza';
    } else if (y === '2025') {
      totalMedals = 2;
      medalsSub = '1 Oltin, 1 Kumush';
    } else {
      totalMedals = 5;
      medalsSub = '2 Oltin, 2 Kumush, 1 Bronza';
    }
  }

  // Top-10 placements
  let top10Count = schoolRecs.filter(r => r.rank <= 10).length;
  if (targetSchool === '26-maktab' && s === 'all' && g === 'all') {
    if (y === '2026') top10Count = 11;
    else if (y === '2025') top10Count = 11;
    else top10Count = 22;
  }
  const top10Pct = (targetSchool === '26-maktab' && s === 'all' && g === 'all') ? '33.3%' : (schoolCount > 0 ? ((top10Count / schoolCount) * 100).toFixed(1) + '%' : '0.0%');

  // Dynamic Card Values
  let totalRecsDisplay = totalRecords > 0 ? totalRecords.toLocaleString() : (y === '2026' ? '1,126' : (y === '2025' ? '1,094' : '2,220'));
  let totalRecsSub = y === '2026' ? '2026-yil ishtirokchilari' : (y === '2025' ? '2025-yil ishtirokchilari' : 'Baza qatorlari (2 yillik)');
  if (sc !== 'all') {
    totalRecsSub = `${targetSchool} (${schoolCount} ta)`;
  }

  let rankDisplay = "9-o'rin";
  let rankSub = "+2 pog'ona o'sish";
  if (targetSchool === '26-maktab') {
    if (y === '2025') {
      rankDisplay = "11-o'rin";
      rankSub = "2025-yil natijasi";
    } else if (y === '2026') {
      rankDisplay = "9-o'rin";
      rankSub = "+2 pog'ona o'sish";
    } else {
      rankDisplay = "9-o'rin";
      rankSub = "2026-yil (Top-10 da)";
    }
  } else {
    rankDisplay = targetSchool;
    rankSub = "Tanlangan maktab";
  }

  const diffFromDistrict = (parseFloat(schoolAvg) - parseFloat(districtAvg)).toFixed(2);
  const diffSign = parseFloat(diffFromDistrict) >= 0 ? `+${diffFromDistrict}` : diffFromDistrict;

  const cards = [
    { title: "Jami ishtiroklar", value: totalRecsDisplay, sub: totalRecsSub, color: "blue" },
    { title: targetSchool === '26-maktab' ? "26-maktab o'rni" : "Maktab o'rni", value: rankDisplay, sub: rankSub, color: "amber" },
    { title: targetSchool === '26-maktab' ? "26-maktab medallari" : "Medallar soni", value: `${totalMedals} ta`, sub: medalsSub, color: "amber" },
    { title: targetSchool === '26-maktab' ? "26-maktab o'rtacha" : "Maktab o'rtacha", value: schoolAvg, sub: `Tumandan ${diffSign} yuqori`, color: "emerald" },
    { title: "Tuman o'rtacha", value: districtAvg, sub: y === 'all' ? "2 yillik ko'rsatkich" : `${y}-yil ko'rsatkichi`, color: "slate" },
    { title: "Kuchli 10 talik", value: `${top10Count} ta`, sub: `${top10Pct} konversiya`, color: "indigo" }
  ];

  grid.innerHTML = cards.map(c => `
    <div class="kpi-card bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">${c.title}</span>
      <div class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white my-1 tracking-tight">${c.value}</div>
      <span class="text-[10px] text-${c.color}-600 dark:text-${c.color}-400 font-medium truncate">${c.sub}</span>
    </div>
  `).join('');
}

// Dashboard Summary Table
function renderDashboardSummaryTable() {
  const tbody = document.getElementById('tbody-dash-summary');
  if (!tbody) return;

  const rows = [
    { label: "Ishtirokchilar soni (o'quvchi)", m25: 33, m26: 33, diff: 0, t25: 1094, t26: 1126, adv: "To'liq qamrov", note: "Barcha 11 ta fan va 3 ta sinfda to'liq qatnashgan" },
    { label: "O'rtacha ball (maks 60)", m25: "21.12", m26: "20.81", diff: "-0.31", t25: "19.50", t26: "19.25", adv: "+1.56 ball", note: "Maktab bali tumandan barqaror ravishda +1.6 ball baland" },
    { label: "Tuman reytingidagi o'rni", m25: "11-o'rin", m26: "9-o'rin", diff: "+2 pog'ona", t25: "Tuman", t26: "Tuman", adv: "Top-10", note: "Maktab 11-o'rindan 9-o'ringa ko'tarildi" },
    { label: "Jami medallar", m25: 2, m26: 3, diff: "+1 medal", t25: 99, t26: 99, adv: "+50% o'sish", note: "2026-yilda yangi bronza medali qo'shildi" },
    { label: "Oltin medallar (1-o'rin)", m25: 1, m26: 1, diff: "0", t25: 33, t26: 33, adv: "Chempion", note: "Har ikki yilda ham Oltin medal qo'lga kiritildi" },
    { label: "Kuchli 10 talik (Top-10)", m25: 11, m26: 11, diff: "0", t25: 330, t26: 330, adv: "33.3%", note: "Har 3 o'quvchidan biri tuman Top-10 ligiga kirdi" }
  ];

  tbody.innerHTML = rows.map(r => `
    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
      <td class="px-3 py-2.5 font-bold text-slate-800 dark:text-slate-200">${r.label}</td>
      <td class="px-3 py-2.5 text-right font-semibold text-slate-700 dark:text-slate-300">${r.m25}</td>
      <td class="px-3 py-2.5 text-right font-bold text-blue-600 dark:text-blue-400">${r.m26}</td>
      <td class="px-3 py-2.5 text-right font-semibold text-emerald-600">${r.diff}</td>
      <td class="px-3 py-2.5 text-right text-slate-500">${r.t25}</td>
      <td class="px-3 py-2.5 text-right text-slate-500">${r.t26}</td>
      <td class="px-3 py-2.5 text-right font-bold text-amber-600 dark:text-amber-400">${r.adv}</td>
      <td class="px-3 py-2.5 text-slate-500 text-[11px]">${r.note}</td>
    </tr>
  `).join('');
}

// Chart Helper
function createOrUpdateChart(id, config) {
  if (window.appCharts[id]) {
    window.appCharts[id].destroy();
  }
  const ctx = document.getElementById(id);
  if (!ctx) return;
  window.appCharts[id] = new Chart(ctx, config);
}

function updateChartsTheme() {
  const isDark = APP_STATE.theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#334155' : '#e2e8f0';

  Object.values(window.appCharts).forEach(chart => {
    if (chart && chart.options) {
      if (chart.options.scales) {
        Object.values(chart.options.scales).forEach(scale => {
          if (scale.ticks) scale.ticks.color = textColor;
          if (scale.grid) scale.grid.color = gridColor;
        });
      }
      if (chart.options.plugins && chart.options.plugins.legend) {
        chart.options.plugins.legend.labels.color = textColor;
      }
      chart.update();
    }
  });
}

// Dashboard Charts
function renderDashboardCharts() {
  const isDark = APP_STATE.theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#334155' : '#e2e8f0';

  // 1. Score Comparison
  createOrUpdateChart('chart-score-comparison', {
    type: 'bar',
    data: {
      labels: ['2025-yil', '2026-yil'],
      datasets: [
        {
          label: '26-maktab',
          data: [21.12, 20.81],
          backgroundColor: '#2563eb',
          borderRadius: 6
        },
        {
          label: "Tuman o'rtachasi",
          data: [19.50, 19.25],
          backgroundColor: '#94a3b8',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 15,
          max: 25,
          ticks: { color: textColor },
          grid: { color: gridColor }
        },
        x: {
          ticks: { color: textColor },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { labels: { color: textColor } }
      }
    }
  });

  // 2. Top Schools Bar
  if (APP_STATE.data.school_ranking) {
    const top10 = APP_STATE.data.school_ranking.slice(0, 10);
    createOrUpdateChart('chart-top-schools', {
      type: 'bar',
      data: {
        labels: top10.map(s => s.school),
        datasets: [{
          label: "2026 O'rtacha ball",
          data: top10.map(s => s.avg_2026),
          backgroundColor: top10.map(s => s.is_school26 ? '#f59e0b' : '#3b82f6'),
          borderRadius: 5
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            min: 15,
            ticks: { color: textColor },
            grid: { color: gridColor }
          },
          y: {
            ticks: { color: textColor },
            grid: { display: false }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}

// YoY Charts
function renderYoYCharts() {
  const isDark = APP_STATE.theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#334155' : '#e2e8f0';

  // Grades YoY
  createOrUpdateChart('chart-grades-yoy', {
    type: 'bar',
    data: {
      labels: ['9-sinf', '10-sinf', '11-sinf'],
      datasets: [
        {
          label: '2025-yil',
          data: [21.68, 16.45, 25.22],
          backgroundColor: '#94a3b8',
          borderRadius: 6
        },
        {
          label: '2026-yil',
          data: [23.58, 19.65, 19.19],
          backgroundColor: '#3b82f6',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 15,
          max: 25,
          ticks: { color: textColor },
          grid: { color: gridColor }
        },
        x: { ticks: { color: textColor }, grid: { display: false } }
      },
      plugins: { legend: { labels: { color: textColor } } }
    }
  });

  // Questions YoY
  createOrUpdateChart('chart-questions-yoy', {
    type: 'bar',
    data: {
      labels: ["1–10 (Oson)", "11–20 (O'rta)", "21–30 (Qiyin)"],
      datasets: [
        {
          label: '26-maktab (2025)',
          data: [42.4, 39.7, 43.6],
          backgroundColor: '#94a3b8',
          borderRadius: 6
        },
        {
          label: '26-maktab (2026)',
          data: [40.9, 44.8, 40.0],
          backgroundColor: '#2563eb',
          borderRadius: 6
        },
        {
          label: 'Tuman (2026)',
          data: [41.7, 41.1, 35.8],
          backgroundColor: '#cbd5e1',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          ticks: { color: textColor, callback: v => v + '%' },
          grid: { color: gridColor }
        },
        x: { ticks: { color: textColor }, grid: { display: false } }
      },
      plugins: { legend: { labels: { color: textColor } } }
    }
  });
}

// Subjects Chart
function renderSubjectsChart() {
  const isDark = APP_STATE.theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#334155' : '#e2e8f0';

  if (!APP_STATE.data.subject_stats) return;

  const data = APP_STATE.data.subject_stats;
  createOrUpdateChart('chart-subjects-breakdown', {
    type: 'bar',
    data: {
      labels: data.map(s => s.subject),
      datasets: [
        {
          label: '26-maktab (2026)',
          data: data.map(s => s.m26_avg_2026),
          backgroundColor: '#f59e0b',
          borderRadius: 6
        },
        {
          label: "Tuman o'rtachasi (2026)",
          data: data.map(s => s.district_avg_2026),
          backgroundColor: '#3b82f6',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          ticks: { color: textColor },
          grid: { color: gridColor }
        },
        x: {
          ticks: { color: textColor, maxRotation: 45, minRotation: 30 },
          grid: { display: false }
        }
      },
      plugins: { legend: { labels: { color: textColor } } }
    }
  });
}

// Questions Detailed Chart
function renderQuestionsChart() {
  const isDark = APP_STATE.theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#334155' : '#e2e8f0';

  createOrUpdateChart('chart-questions-detailed', {
    type: 'bar',
    data: {
      labels: ["1–10 (Oson: 0.9 ball)", "11–20 (O'rta: 1.5 ball)", "21–30 (Qiyin: 2.6 ball)"],
      datasets: [
        {
          label: "26-maktab to'g'ri javob %",
          data: [40.9, 44.8, 40.0],
          backgroundColor: '#2563eb',
          borderRadius: 6
        },
        {
          label: "Tuman to'g'ri javob %",
          data: [41.7, 41.1, 35.8],
          backgroundColor: '#94a3b8',
          borderRadius: 6
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { color: textColor, callback: v => v + '%' },
          grid: { color: gridColor }
        },
        y: { ticks: { color: textColor }, grid: { display: false } }
      },
      plugins: { legend: { labels: { color: textColor } } }
    }
  });
}

// Schools Ranking Table
function renderSchoolsTable() {
  const tbody = document.getElementById('tbody-schools-ranking');
  if (!tbody || !APP_STATE.data.school_ranking) return;

  const query = (document.getElementById('school-table-search')?.value || '').toLowerCase().trim();
  
  let list = [...APP_STATE.data.school_ranking];
  if (query) {
    list = list.filter(s => s.school.toLowerCase().includes(query));
  }

  // Sorting
  const { col, dir } = APP_STATE.schoolsSort;
  list.sort((a, b) => {
    let va = a[col], vb = b[col];
    if (typeof va === 'string') return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    return dir === 'asc' ? (va - vb) : (vb - va);
  });

  tbody.innerHTML = list.map(s => {
    const is26 = s.is_school26;
    const rowClass = is26 
      ? 'bg-amber-50/80 dark:bg-amber-950/40 font-bold border-l-4 border-amber-500' 
      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50';

    const rankDiffBadge = s.rank_diff > 0 
      ? `<span class="text-emerald-600 font-bold">▲ +${s.rank_diff}</span>`
      : s.rank_diff < 0 
        ? `<span class="text-rose-600 font-bold">▼ ${s.rank_diff}</span>`
        : `<span class="text-slate-400">-</span>`;

    const scoreDiffBadge = s.score_diff > 0 
      ? `<span class="text-emerald-600 font-semibold">+${s.score_diff.toFixed(2)}</span>`
      : s.score_diff < 0 
        ? `<span class="text-rose-600 font-semibold">${s.score_diff.toFixed(2)}</span>`
        : `<span class="text-slate-400">0.00</span>`;

    return `
      <tr class="${rowClass} transition">
        <td class="px-3 py-2 font-bold text-slate-800 dark:text-slate-200">#${s.rank_2026}</td>
        <td class="px-3 py-2 font-semibold text-slate-900 dark:text-white">${is26 ? '⭐ ' + s.school : s.school}</td>
        <td class="px-3 py-2 text-right font-black text-blue-600 dark:text-blue-400">${s.avg_2026.toFixed(2)}</td>
        <td class="px-3 py-2 text-right font-bold text-amber-600">${s.medals_2026}</td>
        <td class="px-3 py-2 text-right text-slate-700 dark:text-slate-300">${s.top10_2026}</td>
        <td class="px-3 py-2 text-right text-slate-500">${s.avg_2025.toFixed(2)}</td>
        <td class="px-3 py-2 text-right text-slate-500">#${s.rank_2025}</td>
        <td class="px-3 py-2 text-right">${scoreDiffBadge}</td>
        <td class="px-3 py-2 text-center">${rankDiffBadge}</td>
      </tr>
    `;
  }).join('');
}

function sortSchools(col) {
  if (APP_STATE.schoolsSort.col === col) {
    APP_STATE.schoolsSort.dir = APP_STATE.schoolsSort.dir === 'asc' ? 'desc' : 'asc';
  } else {
    APP_STATE.schoolsSort.col = col;
    APP_STATE.schoolsSort.dir = (col === 'school') ? 'asc' : 'desc';
  }
  renderSchoolsTable();
}

// Subjects Table
function renderSubjectsTable() {
  const tbody = document.getElementById('tbody-subjects-table');
  if (!tbody || !APP_STATE.data.subject_stats) return;

  tbody.innerHTML = APP_STATE.data.subject_stats.map(s => {
    const isAdv = s.diff_2026 > 0;
    const diffBadge = isAdv
      ? `<span class="text-emerald-600 font-bold">+${s.diff_2026.toFixed(2)}</span>`
      : `<span class="text-rose-600 font-bold">${s.diff_2026.toFixed(2)}</span>`;

    const changeBadge = s.yoy_change > 0 
      ? `<span class="text-emerald-600 font-semibold">+${s.yoy_change.toFixed(2)}</span>`
      : `<span class="text-rose-600 font-semibold">${s.yoy_change.toFixed(2)}</span>`;

    return `
      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
        <td class="px-3 py-2 font-bold text-slate-900 dark:text-white">${s.subject}</td>
        <td class="px-3 py-2 text-right text-slate-500">${s.m26_avg_2025.toFixed(2)}</td>
        <td class="px-3 py-2 text-right text-slate-400">${s.district_avg_2025.toFixed(2)}</td>
        <td class="px-3 py-2 text-right font-black text-blue-600 dark:text-blue-400">${s.m26_avg_2026.toFixed(2)}</td>
        <td class="px-3 py-2 text-right text-slate-500">${s.district_avg_2026.toFixed(2)}</td>
        <td class="px-3 py-2 text-right">${diffBadge}</td>
        <td class="px-3 py-2 text-right">${changeBadge}</td>
        <td class="px-3 py-2 text-center font-bold text-amber-600">${s.medals}</td>
        <td class="px-3 py-2 text-slate-600 dark:text-slate-300 font-medium">${s.teacher}</td>
      </tr>
    `;
  }).join('');
}

// Continuity Cards (6 students)
function renderContinuityCards() {
  const grid = document.getElementById('continuity-cards-grid');
  if (!grid || !APP_STATE.data.continuity_tracking) return;

  grid.innerHTML = APP_STATE.data.continuity_tracking.map(c => `
    <div class="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-900 dark:text-white truncate">${formatStudentName(c.name)}</span>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${c.score_diff > 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}">
            ${c.score_diff > 0 ? '+' + c.score_diff.toFixed(1) + ' ball' : c.score_diff.toFixed(1) + ' ball'}
          </span>
        </div>
        <div class="text-[11px] text-slate-500 space-y-1 my-2">
          <p><span class="font-semibold text-slate-600 dark:text-slate-400">2025:</span> ${c.y25}</p>
          <p><span class="font-semibold text-blue-600 dark:text-blue-400">2026:</span> ${c.y26}</p>
        </div>
      </div>
      <p class="text-[11px] font-medium text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
        ${c.summary}
      </p>
    </div>
  `).join('');
}

// Medals Showcase
function renderMedalsShowcase() {
  const grid = document.getElementById('medals-showcase-grid');
  if (!grid || !APP_STATE.data.medals_data) return;

  grid.innerHTML = APP_STATE.data.medals_data.map(m => {
    const isGold = m.medal === 'Oltin';
    const isSilver = m.medal === 'Kumush';
    const bgBadge = isGold ? 'bg-amber-100 text-amber-800 border-amber-300' : isSilver ? 'bg-slate-200 text-slate-800 border-slate-400' : 'bg-orange-100 text-orange-800 border-orange-300';
    const medalIcon = isGold ? '🥇' : isSilver ? '🥈' : '🥉';

    return `
      <div class="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xl">${medalIcon}</span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${bgBadge}">${m.year} • ${m.grade}</span>
          </div>
          <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate">${formatStudentName(m.name)}</h4>
          <p class="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">${m.subject}</p>
          <div class="text-[11px] text-slate-500 mt-2">
            <span>To'plagan bali: <strong class="text-slate-800 dark:text-white">${m.score}</strong></span>
          </div>
        </div>
        <p class="text-[10px] text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700 mt-2 truncate">
          ${m.teacher}
        </p>
      </div>
    `;
  }).join('');
}

// Reserve Pipeline Table
function renderReservePipelineTable() {
  const tbody = document.getElementById('tbody-reserve-pipeline');
  if (!tbody || !APP_STATE.data.reserve_pipeline) return;

  tbody.innerHTML = APP_STATE.data.reserve_pipeline.map(r => `
    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
      <td class="px-3 py-2 font-bold text-slate-900 dark:text-white">${formatStudentName(r.name)}</td>
      <td class="px-3 py-2 text-slate-700 dark:text-slate-300 font-medium">${r.subject_2026}</td>
      <td class="px-3 py-2 text-right font-black text-blue-600 dark:text-blue-400">${r.score}</td>
      <td class="px-3 py-2 text-center font-bold text-amber-600">#${r.rank}</td>
      <td class="px-3 py-2 text-center font-semibold text-slate-800 dark:text-slate-200">${r.grade_2027}</td>
      <td class="px-3 py-2"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">${r.potential}</span></td>
      <td class="px-3 py-2 text-slate-600 dark:text-slate-300 text-[11px]">${r.plan}</td>
      <td class="px-3 py-2 text-slate-500 font-medium">${r.teacher}</td>
    </tr>
  `).join('');
}

// 33 Directions Table
function renderM26DirectionsTable() {
  const tbody = document.getElementById('tbody-m26-directions');
  if (!tbody || !APP_STATE.data.school26_directions) return;

  tbody.innerHTML = APP_STATE.data.school26_directions.map(d => {
    const isUp = d.score_change > 0;
    const scoreDiff = isUp ? `+${d.score_change.toFixed(2)}` : `${d.score_change.toFixed(2)}`;
    const scoreClass = isUp ? 'text-emerald-600 font-bold' : d.score_change < 0 ? 'text-rose-600 font-bold' : 'text-slate-400';

    return `
      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
        <td class="px-3 py-2 font-bold text-slate-900 dark:text-white">${d.subject} (${d.grade})</td>
        <td class="px-3 py-2 text-slate-600 dark:text-slate-300">${formatStudentName(d.name_2025)}</td>
        <td class="px-3 py-2 text-right text-slate-500">${d.score_2025}</td>
        <td class="px-3 py-2 text-center text-slate-400">#${d.rank_2025 || '-'}</td>
        <td class="px-3 py-2 font-semibold text-slate-900 dark:text-white">${formatStudentName(d.name_2026)}</td>
        <td class="px-3 py-2 text-right font-black text-blue-600 dark:text-blue-400">${d.score_2026}</td>
        <td class="px-3 py-2 text-center font-bold text-amber-600">#${d.rank_2026}</td>
        <td class="px-3 py-2 text-right ${scoreClass}">${scoreDiff}</td>
        <td class="px-3 py-2 text-center font-medium">${d.rank_change > 0 ? '▲ +' + d.rank_change : d.rank_change < 0 ? '▼ ' + d.rank_change : '-'}</td>
        <td class="px-3 py-2 text-slate-500">${d.teacher}</td>
      </tr>
    `;
  }).join('');
}

// Leadership Decisions
function renderLeadershipDecisions() {
  const container = document.getElementById('leadership-decisions-list');
  if (!container) return;

  const decisions = [
    { num: 1, title: "Qiyin savollar laboratoriyasi", desc: "Haftada 2 soat olimpiadaning 21–30 blokidagi murakkab ijodiy masalalarni yechish bo'yicha maxsus laboratoriya to'garagini tashkil etish." },
    { num: 2, title: "10 nafar istiqbolli iqtidorga individual murabbiy", desc: "9 va 10-sinfda medal va Top-10 ko'rsatkich qayd etgan o'quvchilar bilan maqsadli shaxsiy dastur ishlab chiqish." },
    { num: 3, title: "Tabiiy fanlarni (Fizika, Kimyo) metodik qo'llash", desc: "Natijalari oqsagan tabiiy fanlar bo'yicha eksperimental-laboratoriya mashg'ulotlarini kuchaytirish." },
    { num: 4, title: "Chempion o'qituvchilar tajribasini yoyish", desc: "Matematika va Informatika fanlaridan Oltin va Kumush medal tayyorlagan pedagoglar tajribasini ommalashtirish." },
    { num: 5, title: "Rag'batlantirish tizimini joriy qilish", desc: "Tuman bosqichida sovrinli o'rin olgan o'quvchilar va ularning ustozlarini maktab fondi hisobidan mukofotlash." },
    { num: 6, title: "Choraklik sinov monitoringi", desc: "Har chorakda kamida bir marta rasmiy vaznli ballik (0.9, 1.5, 2.6) tizim asosida sinov olimpiadasini o'tkazish." },
    { num: 7, title: "Yangibozor IMI bilan hamkorlik", desc: "Tuman yetakchisi bo'lgan Ixtisoslashtirilgan maktab-internat bilan tajriba almashish va sinov bellashuvlarini tashkil etish." }
  ];

  container.innerHTML = decisions.map(d => `
    <div class="flex items-start space-x-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
      <span class="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">${d.num}</span>
      <div>
        <h4 class="font-bold text-slate-800 dark:text-slate-200 text-xs">${d.title}</h4>
        <p class="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">${d.desc}</p>
      </div>
    </div>
  `).join('');
}

// Students Database Table & Pagination
function renderStudentsTable() {
  const tbody = document.getElementById('tbody-students-records');
  const counter = document.getElementById('records-counter');
  if (!tbody) return;

  const list = getFilteredRecords();
  if (counter) counter.textContent = `Ko'rsatilmoqda: ${list.length} ta / 2,220 ta yozuv`;

  // Sort
  const { col, dir } = APP_STATE.studentsSort;
  list.sort((a, b) => {
    let va = a[col], vb = b[col];
    if (typeof va === 'string') return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    return dir === 'asc' ? (va - vb) : (vb - va);
  });

  // Pagination
  const totalPages = Math.ceil(list.length / APP_STATE.studentsPerPage) || 1;
  if (APP_STATE.studentsPage > totalPages) APP_STATE.studentsPage = totalPages;
  if (APP_STATE.studentsPage < 1) APP_STATE.studentsPage = 1;

  const start = (APP_STATE.studentsPage - 1) * APP_STATE.studentsPerPage;
  const pageItems = list.slice(start, start + APP_STATE.studentsPerPage);

  if (pageItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="px-4 py-8 text-center text-slate-400 text-xs">Belgilangan filtrlarga mos keluvchi ma'lumot topilmadi</td></tr>`;
  } else {
    tbody.innerHTML = pageItems.map(r => {
      const is26 = r.school === '26-maktab';
      const rankBadge = r.rank === 1 
        ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">🥇 1-örin</span>`
        : r.rank === 2
          ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">🥈 2-örin</span>`
          : r.rank === 3
            ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800">🥉 3-örin</span>`
            : `<span class="text-slate-600 dark:text-slate-400 font-semibold">#${r.rank}</span>`;

      return `
        <tr class="${is26 ? 'bg-amber-50/80 dark:bg-amber-950/40 font-semibold' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'} transition">
          <td class="px-3 py-2 text-slate-500 font-mono text-[11px]">${r.id}</td>
          <td class="px-3 py-2 text-slate-600 dark:text-slate-400 font-medium">${r.year}</td>
          <td class="px-3 py-2 font-semibold text-slate-900 dark:text-white">${r.subject}</td>
          <td class="px-3 py-2 text-center text-slate-600 dark:text-slate-400">${r.grade}</td>
          <td class="px-3 py-2 font-bold text-slate-900 dark:text-white">${formatStudentName(r.name)}</td>
          <td class="px-3 py-2 text-slate-700 dark:text-slate-300">${is26 ? '⭐ ' + r.school : r.school}</td>
          <td class="px-3 py-2 text-right font-black text-blue-600 dark:text-blue-400">${r.score.toFixed(2)}</td>
          <td class="px-3 py-2 text-center">${rankBadge}</td>
          <td class="px-3 py-2 text-slate-500 truncate max-w-xs">${r.teacher}</td>
        </tr>
      `;
    }).join('');
  }

  // Update pagination controls
  renderPaginationControls(totalPages);
}

function renderPaginationControls(totalPages) {
  const container = document.getElementById('pagination-buttons');
  const info = document.getElementById('pagination-info');
  if (info) info.textContent = `Sahifa: ${APP_STATE.studentsPage} / ${totalPages}`;
  if (!container) return;

  let btns = [];
  btns.push(`<button onclick="changePage(1)" ${APP_STATE.studentsPage === 1 ? 'disabled class="opacity-50 cursor-not-allowed"' : ''} class="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition">«</button>`);
  btns.push(`<button onclick="changePage(${APP_STATE.studentsPage - 1})" ${APP_STATE.studentsPage === 1 ? 'disabled class="opacity-50 cursor-not-allowed"' : ''} class="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition">‹</button>`);

  // Show window around current page
  let startP = Math.max(1, APP_STATE.studentsPage - 2);
  let endP = Math.min(totalPages, startP + 4);
  if (endP - startP < 4) startP = Math.max(1, endP - 4);

  for (let p = startP; p <= endP; p++) {
    const isCur = p === APP_STATE.studentsPage;
    btns.push(`<button onclick="changePage(${p})" class="px-2.5 py-1 text-xs rounded border ${isCur ? 'bg-blue-600 text-white border-blue-600 font-bold' : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'} transition">${p}</button>`);
  }

  btns.push(`<button onclick="changePage(${APP_STATE.studentsPage + 1})" ${APP_STATE.studentsPage === totalPages ? 'disabled class="opacity-50 cursor-not-allowed"' : ''} class="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition">›</button>`);
  btns.push(`<button onclick="changePage(${totalPages})" ${APP_STATE.studentsPage === totalPages ? 'disabled class="opacity-50 cursor-not-allowed"' : ''} class="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition">»</button>`);

  container.innerHTML = btns.join(' ');
}

function changePage(p) {
  APP_STATE.studentsPage = p;
  renderStudentsTable();
}

function sortStudents(col) {
  if (APP_STATE.studentsSort.col === col) {
    APP_STATE.studentsSort.dir = APP_STATE.studentsSort.dir === 'asc' ? 'desc' : 'asc';
  } else {
    APP_STATE.studentsSort.col = col;
    APP_STATE.studentsSort.dir = (col === 'score' || col === 'id') ? 'asc' : 'asc';
  }
  renderStudentsTable();
}

// Action Plan Table
function renderActionPlanTable() {
  const tbody = document.getElementById('tbody-action-plan');
  if (!tbody) return;

  const plan = [
    { tr: 1, title: "2027-yilgi zaxira ro'yxatini tasdiqlash va murabbiylarni biriktirish", who: "Direktor o'rinbosari, Metodbirlashma rahbarlari", when: "Sentyabr, 2026", result: "10 nafar o'quvchi uchun shaxsiy rivojlanish rejasi", check: "Pedagogik kengash qarori", status: "Bajarildi" },
    { tr: 2, title: "11 ta fan bo'yicha maxsus to'garaklar jadvalini yo'lga qo'yish", who: "O'quv ishlari bo'yicha direktor o'rinbosari", when: "Sentyabr, 2026", result: "Haftalik 2 soatlik maxsus olimpiada mashg'ulotlari", check: "Dars jurnallari", status: "Bajarildi" },
    { tr: 3, title: "Qiyin savollar (21-30) bo'yicha murakkab masalalar bankini yaratish", who: "Fan metodbirlashma rahbarlari", when: "Oktyabr, 2026", result: "Har bir fan bo'yicha 200 tadan nostandart masala", check: "Metodik to'plam", status: "Jarayonda" },
    { tr: 4, title: "1-chorak yakuniy olimpiada sinov testini o'tkazish", who: "Monitoring guruhi", when: "Noyabr, 2026", result: "O'quvchilarning boshlang'ich o'sish dinamikasi", check: "Tahliliy ma'lumotnoma", status: "Rejalashtirilgan" },
    { tr: 5, title: "Tabiiy fanlar (Fizika, Kimyo, Biologiya) bo'yicha laboratoriya oyligi", who: "Fan o'qituvchilari", when: "Dekabr, 2026", result: "Eksperimental masalalarni yechish ko'nikmasi", check: "Laboratoriya hisobotlari", status: "Rejalashtirilgan" },
    { tr: 6, title: "Yangibozor IMI bilan o'rtoqlik olimpiadasi", who: "Direktor o'rinbosari", when: "Yanvar, 2027", result: "Yetakchi maktab bilan qiyosiy sinov va xatolar tahlili", check: "Protokol", status: "Rejalashtirilgan" },
    { tr: 7, title: "2-chorak monitoring sinovi va korreksion mashg'ulotlar", who: "Fan o'qituvchilari", when: "Fevral, 2027", result: "Oqsagan mavzular bo'yicha qo'shimcha yordam", check: "Jadval", status: "Rejalashtirilgan" },
    { tr: 8, title: "Iqtidorli o'quvchilar bilan psixologik treninglar", who: "Maktab psixologi", when: "Mart, 2027", result: "Imtihon hayajoni va stressni yengish ko'nikmasi", check: "Trening qaydnomasi", status: "Rejalashtirilgan" },
    { tr: 9, title: "Maktab bosqichi saralash olimpiadasi", who: "Hakamlar hay'ati", when: "Aprel, 2027", result: "Eng kuchli 33 nafar o'quvchi tuman bosqichiga saralanadi", check: "Buyruq va bayonnoma", status: "Rejalashtirilgan" },
    { tr: 10, title: "Tuman bosqichi oldidan 10 kunlik intensiv yig'in", who: "Fan ustozlari", when: "May/Sentyabr, 2027", result: "Olimpiadaga 100% shay jamoa", check: "Yakuniy hisobot", status: "Rejalashtirilgan" }
  ];

  tbody.innerHTML = plan.map(p => `
    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
      <td class="px-3 py-2 text-center font-bold text-slate-500">${p.tr}</td>
      <td class="px-3 py-2 font-bold text-slate-900 dark:text-white">${p.title}</td>
      <td class="px-3 py-2 text-slate-600 dark:text-slate-400">${p.who}</td>
      <td class="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">${p.when}</td>
      <td class="px-3 py-2 text-slate-600 dark:text-slate-400 text-[11px]">${p.result}</td>
      <td class="px-3 py-2 text-slate-500">${p.check}</td>
      <td class="px-3 py-2 text-center">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${p.status === 'Bajarildi' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : p.status === 'Jarayonda' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}">
          ${p.status}
        </span>
      </td>
    </tr>
  `).join('');
}

// Export CSV Functions
function downloadCSV(csvContent, filename) {
  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportDashboardSummaryCSV() {
  const rows = [
    ["Ko'rsatkich", "2025 (Maktab)", "2026 (Maktab)", "O'zgarish", "2025 (Tuman)", "2026 (Tuman)", "Ustunlik", "Xulosa"],
    ["Ishtirokchilar soni", 33, 33, 0, 1094, 1126, "To'liq qamrov", "Barcha 11 ta fan va 3 ta sinfda to'liq qatnashgan"],
    ["O'rtacha ball", 21.12, 20.81, -0.31, 19.50, 19.25, "+1.56 ball", "Maktab bali tumandan barqaror +1.6 ball baland"],
    ["Tuman reytingi o'rni", "11-o'rin", "9-o'rin", "+2 pog'ona", "Tuman", "Tuman", "Top-10", "Maktab 11-o'rindan 9-o'ringa ko'tarildi"],
    ["Jami medallar", 2, 3, "+1 medal", 99, 99, "+50%", "2026-yilda yangi bronza medali qo'shildi"],
    ["Kuchli 10 talik", 11, 11, 0, 330, 330, "33.3%", "Har 3 o'quvchidan biri tuman Top-10 ligiga kirdi"]
  ];
  const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  downloadCSV(csv, "26_maktab_umumiy_korsatkichlar_2025_2026.csv");
}

function exportSchoolsTableCSV() {
  if (!APP_STATE.data.school_ranking) return;
  const headers = ["2026 O'rni", "Maktab", "2026 O'rtacha ball", "2026 Medallar", "2026 Top-10", "2025 O'rtacha ball", "2025 O'rni", "Ball farqi", "Pog'ona farqi"];
  const rows = APP_STATE.data.school_ranking.map(s => [
    s.rank_2026, s.school, s.avg_2026, s.medals_2026, s.top10_2026, s.avg_2025, s.rank_2025, s.score_diff, s.rank_diff
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  downloadCSV(csv, "yangibozor_maktablar_reytingi_2025_2026.csv");
}

function exportM26DirectionsCSV() {
  if (!APP_STATE.data.school26_directions) return;
  const headers = ["Fan va sinf", "2025 O'quvchi", "2025 Ball", "2025 O'rin", "2026 O'quvchi", "2026 Ball", "2026 O'rin", "Ball farqi", "O'rin farqi", "Mas'ul o'qituvchi"];
  const rows = APP_STATE.data.school26_directions.map(d => [
    `${d.subject} (${d.grade})`, d.name_2025, d.score_2025, d.rank_2025, d.name_2026, d.score_2026, d.rank_2026, d.score_change, d.rank_change, d.teacher
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  downloadCSV(csv, "26_maktab_33_yonalish_tahlili.csv");
}

function exportFilteredRecordsCSV() {
  const filtered = getFilteredRecords();
  const headers = ["T/r", "Yil", "Sana", "Fan", "Sinf", "O'quvchi F.I.Sh.", "Maktab", "1-10 to'g'ri", "11-20 to'g'ri", "21-30 to'g'ri", "Jami ball", "Tuman o'rni", "O'qituvchi"];
  const rows = filtered.map(r => [
    r.id, r.year, r.date, r.subject, r.grade, r.name, r.school, r.q1, r.q2, r.q3, r.score, r.rank, r.teacher
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  downloadCSV(csv, "olimpiada_filtrlangan_natijalar.csv");
}
