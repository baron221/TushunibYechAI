# Tushunib Yech — Fikrlashni o'rgatuvchi AI Virtual Repetitor 🧠🎓

> **“Javobni emas, fikrlashni o‘rgatamiz.”**

**Tushunib Yech** — boshlang‘ich sinf (1–4 sinf) o‘quvchilari uchun misol-masalalarni shunchaki yechib bermay, ularni bosqichma-bosqich (Sokrat uslubida) o‘zbek tilida sodda tushuntiruvchi birinchi virtual AI-repetitor platformasi.

Mavjud global ilovalar (Photomath, ChatGPT) faqat natijaga (ko'chirishga) e'tibor qaratsa, **Tushunib Yech** bolaning tahliliy va mustaqil fikrlash qobiliyatini rivojlantirishga qaratilgan mahalliylashtirilgan ta'limiy yondashuvni taqdim etadi.

---

## 🚀 Asosiy Imkoniyatlar & Simulyatorlar

Loyiha investorlar, maktablar va ota-onalar uchun ishlab chiqilgan yuqori darajadagi interaktiv Single Page Application (SPA) ko'rinishidagi showcase hisoblanadi:

1. **Sokratik AI Tutor Simulyatori (Playground)**:
   * Bolalarga tayyor javobni bermasdan, yo'naltiruvchi savollar orqali yondashadi.
   * Variantlar va xato javob yechimlariga mos ravishda AI turlicha yo‘l ko‘rsatadi (Nudges).
   * Har bir mantiqiy qadam uchun o'quvchi rag'batlantiriladi (+15 yulduzli ball).
2. **🪙 Tolibbek Avatarlar Do'koni (Gamification)**:
   * O'quvchi masalalardan yig'gan yulduzli ballari hisobidan yangi virtual ustozlarni (masalan, *Ibn Sino* yoki *Al-Xorazmiy*) qulfdan ochadi. Avatarni o'zgartirish chat interfeysini va AI ustozi emojisini dinamik yangilaydi.
3. **🔊 Web Audio API Ovozli Effektlar (Sound Synth)**:
   * Hech qanday og'ir mp3 fayllarsiz, brauzerning o'zida oscillator to'lqinlari orqali yaratilgan yoqimli tovush chimes (to'g'ri javobda ko'tariluvchi ton, xatoda past ogohlantirish, g'alabada retro-o'yin arpeggiosi).
4. **🏫 B2B Maktab/O'qituvchi Boshqaruv Paneli**:
   * Ota-onalar hisobotidan tashqari, xususiy maktablar uchun sinf o'quvchilari reyting jadvali, completion foizlari va sinf bo'yicha kognitiv radar diagrammasi integratsiya qilingan.
5. **📄 PDF Pedagogik Hisobot Generatori**:
   * Ota-onalar uchun o'quvchining haftalik tahlili va shaxsiy AI tavsiyalari yozilgan premium sertifikat ko'rinishidagi chop etishga tayyor PDF andozasi (Window native `@media print` qoidalari bilan).

---

## 🛠️ Loyiha Tuzilishi (Project Directory)

```bash
AiTutor/
├── index.html        # Sahifaning semantik va vizual skeleti (HTML5)
├── styles.css        # Premium dark mode dizayn tizimi, glassmorfizm va print qoidalari
├── app.js            # Socratic dialoq state-machine mantiqi, audio synth va UI kontroller
├── package.json      # Mahalliy HTTP server va scriptlar sozlamasi
└── README.md         # Loyiha hujjatlari va yo'riqnomasi
```

---

## 💻 Developerlar uchun Sozlash Yo'riqnomasi (Setup Guide)

Loyiha mutlaqo toza, tezkor va hech qanday murakkab freymvorklarsiz (Vanilla JS, CSS3 custom properties) ishlab chiqilgan. Mahalliy kompyuterda ishga tushirish nihoyatda oson.

### Tizim Talablari
* [Node.js](https://nodejs.org/) (v16 yoki undan yuqori versiya tavsiya etiladi)

### 1. Loyihani yuklab olish va o'rnatish
Avval terminalda loyiha papkasiga o'ting:
```bash
git clone https://github.com/baron221/TushunibYechAI.git
cd TushunibYechAI
```

### 2. Bog'liqliklarni o'rnatish (Dependencies)
Loyiha uchun minimal, lekin qulay dev-server o'rnatiladi:
```bash
npm install
```

### 3. Mahalliy serverni ishga tushirish (Run Development Server)
Sahifani lokal tarzda ishga tushirish va brauzerda avtomatik ochish uchun quyidagi buyruqni bosing:
```bash
npm run dev
```
Server sukut bo'yicha **`http://localhost:3000`** portida ishga tushadi va brauzeringizda darcha ochiladi.

---

## 🧠 AI va Pedagogik Tizim qanday ishlaydi? (Architectural Context)

Real ishlab chiqarishda (production) ushbu startap orqa fonida **Google Gemini 3.5 Flash / Pro** modellari xizmat qiladi. Tizim ishlash prinsiplari quyidagicha:

### A. Sokratik Prompt Muhandisligi (Socratic Prompt Engineering)
Gemini modeli quyidagi maxsus tizim yo'riqnomasi (System Instructions) orqali boshqariladi:
```markdown
Siz boshlang'ich sinf bolalari uchun sabrli o'zbek ustozi "Tolibbek"siz. 
Vazifangiz bolaga matematik masalalarni yechishda yordam berishdir.
QOIDALAR:
1. Hech qachon bolaga tayyor matematik ifodani yoki yakuniy javobni yozmang.
2. Masalani mantiqiy kichik qismlarga ajrating.
3. Har bir qadamda bolaga yo'naltiruvchi savol bering.
4. Bola xato qilsa, uni urishmang, vizual tasavvur qilishga undang (masalan: "olmalarni rasmini chizib ko'raylik").
```

### B. OCR va Multimodal Tahlil
O'quvchi kitob darchasini rasmga olib yuklaganda, **Gemini Multimodal API** tasvirni skanerlaydi, uning ichidagi o'zbekcha matnni aniqlaydi va avtomatik ravishda darslik bazasidan o'sha misolni topib, Sokratik chat paneliga yuklaydi.

### C. Kognitiv Tahlil (Parents Analytics Engine)
AI bolaning chatdagi javoblari tarixini, hisoblash tezligini va yo'l qo'ygan xatolarini tahlil qiladi. Shunga asosan pedagogik xulosa (Haftalik kognitiv hisobot) yozib, ota-onalarga push xabarnoma sifatida yuboradi.

---

## 🧪 Sinovdan o'tkazish va Tekshirish (Verification & Testing)

Developerlar interaktiv simulyatorlarning barcha yo‘nalishlarini quyidagicha sinab ko‘rishlari mumkin:
1. **Xato javoblar testi**: Sokratik chatda ataylab xato variantlarni tanlang (masalan, qo'shish o'rniga ayirish). AI sizni qanday qilib to'g'ri fikrlashga qaytarishini ovozli effektlar hamrohligida tekshiring.
2. **Do'kon testi**: Playgroundda bir nechta masalani yechib 100 ball to'plang. Do'kon darchasiga o'ting va *Ibn Sino* avatarini sotib oling. Chat avatarining o'zgarishini tekshiring.
3. **B2B test**: O'qituvchi boshqaruvi paneliga o'ting, sinfdagi Said Nosirov ismli talabaga tegishli "Kritik" holatni kuzating va Kundalik.com tizimiga integratsiya tugmasini test qiling.
4. **PDF tahriri**: PDF yuklash tugmasini bosib, sertifikat darchasini oching va `Ctrl + P` (yoki Print) bosib brauzerning toza sertifikat generatsiyasini ko'ring.

---

## 📄 Litsenziya (License)
Ushbu loyiha EdTech sohasida yangi innovatsiyalarni olib kirish maqsadida ochiq manbali kod sifatida taqdim etiladi.

*Yaratildi: 2026-yil, 💜 ta'lim va kelajak texnologiyalari yo'lida.*
