# Olimpiada Analytics — 2025–2026-yillar olimpiada natijalari tahliliy veb-platformasi

**Muallif:** Bekimmatov Rahmatjon  
**Hudud:** Xorazm viloyati, Yangibozor tumani  
**Muassasa:** 26-sonli umumiy o'rta ta'lim maktabi  
**Texnologiyalar:** HTML5, CSS3 (Tailwind CSS), JavaScript (ES6+), Chart.js 4.4.1, JSON  

---

## 🎯 Loyiha haqida

Ushbu interaktiv veb-platforma Yangibozor tumanidagi barcha 35 ta maktabning 2025 va 2026-yillardagi tuman bosqichi fan olimpiadasi natijalarini to'liq qamrab olgan yagona professional tahliliy tizimdir.

Platformada jami **2 220 ta rasmiy yozuv**, 11 ta fan, 3 ta sinf (9, 10, 11) hamda 26-maktabning ko'rsatkichlari chuqur tahlil qilingan.

### Asosiy imkoniyatlar:
- **📊 Boshqaruv paneli (Dashboard):** 6 ta interaktiv KPI ko'rsatkich kartasi, 2 yillik maktab va tuman qiyosi hamda tahliliy ustunli diagrammalar.
- **⚖️ Yillarni taqqoslash:** 2025 va 2026-yillar orasidagi o'zgarishlar dinamikasi (qatnashuv, o'rtacha ball, medallar, sinflar kesimidagi o'sish).
- **🏫 Maktablar reytingi:** Tumandagi barcha 35 ta ta'lim muassasasining to'liq reyting jadvali (saralash, qidiruv va CSV eksport bilan).
- **📚 Fanlar tahlili:** 11 ta fan kesimida maktab va tuman ko'rsatkichlari, mas'ul o'qituvchilar va diagrammalar.
- **🎓 Sinflar tahlili:** 9, 10, 11-sinflar kesimidagi natijalar va 6 nafar o'quvchining 2 yillik uzviy rivojlanish kartochkalari.
- **⭐ 26-maktab qo'mondonlik markazi:** Barcha 33 ta fan-sinf yo'nalishlari xaritasi, 5 ta medal sohiblari, 2027-yilgi 10 nafar iqtidorlar zaxirasi, SWOT tahlili va 7 ta aniq boshqaruv qarori.
- **🔍 O'quvchilar natijalari bazasi:** 2 220 ta yozuv bo'yicha tezkor qidiruv, ko'p bosqichli filtrlar, sahifalash (pagination) va maxfiylik rejimi (to'liq ism / qisqartma).
- **🧩 Savollar murakkabligi tahlili:** 1–10 (oson, 0.9 ball), 11–20 (o'rta, 1.5 ball), 21–30 (qiyin, 2.6 ball) savollar bloklarining to'g'ri yechilish foizi.
- **✅ Ma'lumotlar sifati reyestri:** 2 220 ta yozuvning 100% formulalar to'g'riligi, 0 inversiya, 0 dublikat tekshiruvi.
- **📋 Harakatlar rejasi:** 2026/2027 o'quv yili uchun 10 ta aniq muddatli monitoring tadbirlari jadvali.
- **🌓 Yorug' va qorong'i rejim:** Tungi va kunduzgi interfeys almashinuvi.

---

## 🚀 GitHub Pages orqali bepul joylashtirish (Deploy)

Platforma to'liq statik (server talab qilmaydi) bo'lgani sababli uni GitHub Pages orqali bir necha daqiqada internetga chiqarish mumkin:

### 1-qadam: GitHub repository yaratish
1. [GitHub](https://github.com) sahifangizga kiring.
2. Yuqori o'ng burchakdagi **+** tugmasini bosib, **New repository** ni tanlang.
3. Repository nomini kiriting: `olimpiada-analytics`.
4. Uni **Public** qilib belgilang va **Create repository** tugmasini bosing.

### 2-qadam: Fayllarni yuklash
Loyiha papkasidagi barcha fayllarni (`index.html`, `README.md`, `css/`, `js/`, `data/`) repositoryingizga yuklang:
```bash
git init
git add .
git commit -m "Initial commit: Olimpiada Analytics platformasi"
git branch -M main
git remote add origin https://github.com/[username]/olimpiada-analytics.git
git push -u origin main
```
Yoki GitHub veb-interfeysi orqali **"Upload files"** tugmasidan foydalanishingiz mumkin.

### 3-qadam: GitHub Pages xizmatini yoqish
1. Repository sahifasida **Settings** bo'limiga kiring.
2. Chap menyudan **Pages** bandini tanlang.
3. **Build and deployment** bo'limida:
   - **Source:** *Deploy from a branch*
   - **Branch:** *main* va papka sifatida */ (root)* ni tanlang.
4. **Save** tugmasini bosing.

1–2 daqiqadan so'ng sayt internetda jonli ishlay boshlaydi:
`https://[username].github.io/olimpiada-analytics/`

---

## 🔄 Yangi ma'lumotlar bilan yangilash tartibi

Kelgusi (masalan, 2027-yilgi) olimpiada natijalari paydo bo'lganda saytni yangilash juda oson:
1. Excel bazasidagi yangi yozuvlarni `data/olimpiada.json` fayliga qo'shing.
2. O'zgarishlarni GitHub repositoryga yuklang (`git push`).
3. GitHub Pages saytni avtomatik ravishda yangilangan ma'lumotlar bilan qayta quradi.

---

## 📄 Litsenziya va Mualliflik

Loyiha muallifi: **Bekimmatov Rahmatjon**  
Yangibozor tumani, 26-sonli umumiy o'rta ta'lim maktabi.  
Barcha huquqlar himoyalangan © 2026.
