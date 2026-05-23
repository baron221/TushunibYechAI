/* app.js - Socratic AI Tutor & Parents Dashboard Mockup with Final Premium Features */

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. WEB AUDIO API SYNTHESIZER FOR GAME SOUND EFFECTS ---
  class SoundSynth {
    constructor() {
      this.ctx = null;
      this.muted = false;
    }

    init() {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
    }

    playCorrect() {
      if (this.muted) return;
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'sine';
      const now = this.ctx.currentTime;
      
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.35);
      
      osc.start(now);
      osc.stop(now + 0.35);
    }

    playWrong() {
      if (this.muted) return;
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'triangle';
      const now = this.ctx.currentTime;
      
      osc.frequency.setValueAtTime(220.00, now); // A3
      osc.frequency.linearRampToValueAtTime(165.00, now + 0.22); // E3
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.22);
      
      osc.start(now);
      osc.stop(now + 0.22);
    }

    playSuccess() {
      if (this.muted) return;
      this.init();
      const now = this.ctx.currentTime;
      
      const playTone = (freq, start, duration) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.08, start);
        gain.gain.linearRampToValueAtTime(0.001, start + duration);
        
        osc.start(start);
        osc.stop(start + duration);
      };
      
      playTone(523.25, now, 0.15); // C5
      playTone(659.25, now + 0.12, 0.15); // E5
      playTone(783.99, now + 0.24, 0.15); // G5
      playTone(1046.50, now + 0.36, 0.45); // C6
    }
  }

  const synth = new SoundSynth();

  // --- 2. UZBEK SPEECH SYNTHESIS (TEXT TO SPEECH) ---
  function speakUzbek(text) {
    if (synth.muted) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    // Remove markdown stars, emojis and convert newlines to speech-friendly dots
    let cleanText = text.replace(/\*\*/g, "");
    cleanText = cleanText.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, "");
    cleanText = cleanText.replace(/\n/g, ". ");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Attempt to load Uzbek/Turkic phonetics. Turkish (tr-TR) is an excellent equivalent in typical browser configurations.
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = voices.find(v => v.lang.startsWith("uz") || v.lang.startsWith("tr"));
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = 0.92; // Slightly slower, child-friendly rate
    utterance.pitch = 1.05; // Friendly and lively pitch
    
    window.speechSynthesis.speak(utterance);
  }

  // Pre-load voices list for Chrome/Safari compatibility
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };

  // --- STATE VARIABLES ---
  let currentTask = "task1";
  let currentState = "init";
  let score = 0;
  let hasMadeWrongChoice = false; // logic to check "Mustaqil Fikrlovchi" badge
  
  // Avatar Shop state
  let currentAvatar = "🐰";
  let currentAvatarName = "Tolibbek (Quyoncha)";
  let unlockedAvatars = {
    rabbit: true,
    sino: false,
    xorazmiy: false
  };

  const avatarDetails = {
    rabbit: { emoji: "🐰", name: "Tolibbek (Quyoncha)" },
    sino: { emoji: "👨‍⚕️", name: "Tolibbek (Ibn Sino)" },
    xorazmiy: { emoji: "🧮", name: "Tolibbek (Al-Xorazmiy)" }
  };

  // Achievements state
  let unlockedBadges = {
    logic: false,
    geometry: false,
    perfect: false
  };

  // --- DIALOGUE DATA (SOCRATIC METHOD STATE MACHINE IN UZBEK) ---
  const dialogueData = {
    task1: {
      init: {
        tutorMsg: "Salom! Men Tolibbekman. Keling, birgalikda bu masalani yechamiz:\n\n**Ahmadning 12 ta olmasi bor edi. U 4 tasini ukasiga berdi. Unda nechta olma qoldi?**\n\nMasalani yechishni nimadan boshlaymiz?",
        choices: [
          { text: "Ahmadning jami olmalarini aniqlashdan", correct: true, nextState: "step1", feedback: "Barakalla! Masala shartini tahlil qilish juda muhim." },
          { text: "Shunchaki 12 ga 4 ni qo'shib yuboraman", correct: false, nextState: "wrong_add", feedback: "Shoshilmaylik. Yechishdan oldin fikrlab olaylik." },
          { text: "Menga tayyor javobni ayta qoling", correct: false, nextState: "ask_direct", feedback: "Tayyor javobni ko'chirsak, miyamiz dangasa bo'lib qoladi-ku! Keling, birga yechamiz." }
        ]
      },
      wrong_add: {
        tutorMsg: "Ahmad olmalarini ukasiga bersa, uning olmalari ko'payadimi yoki kamayadimi? 🍎",
        choices: [
          { text: "Albatta kamayadi", correct: true, nextState: "step2", feedback: "Juda to'g'ri! Berib yuborgach kamayadi." },
          { text: "Ko'payadi", correct: false, nextState: "explain_decrease", feedback: "Tasavvur qil: senda 12 ta olma bor, 4 tasini berib yubording. Sendagi olmalar ko'payadimi?" }
        ]
      },
      ask_direct: {
        tutorMsg: "Xafa bo'lish yo'q, men senga yo'l ko'rsataman. Qara, Ahmad olmalarini ukasiga berdi. Demak uning olmalari kamaydi, to'g'rimi?",
        choices: [
          { text: "Ha, kamaydi", correct: true, nextState: "step2", feedback: "Ajoyib!" },
          { text: "Yo'q, o'zgarmadi", correct: false, nextState: "explain_decrease", feedback: "Qanday qilib o'zgarmaydi? Olmalar berib yuborildi-ku!" }
        ]
      },
      explain_decrease: {
        tutorMsg: "Keling, tasavvur qilamiz: Oldingda 12 ta olma turibdi. 4 tasini ukangga olib berding. Olmalaring kamayadimi yoki ko'payadi?",
        choices: [
          { text: "Kamayadi", correct: true, nextState: "step2", feedback: "To'ppa-to'g'ri! Kamayadi." }
        ]
      },
      step1: {
        tutorMsg: "Juda yaxshi! Demak, Ahmadning boshida 12 ta olmasi bor edi. U 4 tasini ukasiga berdi. Berib yuborgandan keyin olmalari soni kamaydimi yoki ko'paydimi?",
        choices: [
          { text: "Kamaydi", correct: true, nextState: "step2", feedback: "Ofarin! Aynan shunday." },
          { text: "Ko'paydi", correct: false, nextState: "explain_decrease", feedback: "Qayta o'ylab ko'r, berib yuborsa olmalar kamayadimi?" }
        ]
      },
      step2: {
        tutorMsg: "Juda to'g'ri! Ahmadning olmalari kamaydi. Sonlar kamaysa, biz qaysi matematik amaldan foydalanamiz? Qo'shish (+)mi yoki ayirish (-)mi? ➖",
        choices: [
          { text: "Ayirish amalidan (-)", correct: true, nextState: "step3", feedback: "Katta yutuq! Ayirish amali sonlarni kichraytiradi." },
          { text: "Qo'shish amalidan (+)", correct: false, nextState: "wrong_operator", feedback: "O'ylab ko'raylik. Qo'shsak, sonlar kattalashadi-ku?" }
        ]
      },
      wrong_operator: {
        tutorMsg: "Agar qo'shsak, olmalar soni 12 tadan ko'payib ketadi. Ammo Ahmad olmalarini berib yubordi. Demak qaysi amal bo'ladi?",
        choices: [
          { text: "Ayirish amali (-)", correct: true, nextState: "step3", feedback: "To'g'ri topding!" }
        ]
      },
      step3: {
        tutorMsg: "Ajoyib! Demak, ayirish amali. Buni ifoda ko'rinishida qanday yozamiz? Boshlang'ich olmalar sonidan ukasiga berganini ayiramiz, to'g'rimi? Qani yozib ko'r-chi:",
        choices: [
          { text: "12 - 4", correct: true, nextState: "final_calc", feedback: "Daho! Matematik ifodamiz tayyor: 12 - 4." },
          { text: "4 - 12", correct: false, nextState: "wrong_order", feedback: "Kichik sondan katta sonni hozircha ayira olmaymiz. Boshida 12 ta olma bor edi." }
        ]
      },
      wrong_order: {
        tutorMsg: "Boshida olmalar ko'p edi (12 ta). Ukasiga esa kamroq (4 ta) berdi. Shuning uchun ko'pidan kamini ayiramiz:",
        choices: [
          { text: "12 - 4", correct: true, nextState: "final_calc", feedback: "To'g'ri!" }
        ]
      },
      final_calc: {
        tutorMsg: "Barakalla! Endi oxirgi qadam: **12 dan 4 ni ayirsak nechchi qoladi?** Barmoqlaringizda yoki hayolan hisoblang! 🧮",
        choices: [
          { text: "8 ta olma", correct: true, nextState: "success_state", feedback: "Ura! To'g'ri yechdingiz! Fikrlash sizga yordam berdi!" },
          { text: "6 ta olma", correct: false, nextState: "wrong_calc", feedback: "Deyarli yaqin, lekin biroz adashting." },
          { text: "10 ta olma", correct: false, nextState: "wrong_calc", feedback: "Biroz ko'proq aytib yubording, qaytadan hisobla." }
        ]
      },
      wrong_calc: {
        tutorMsg: "Keling, 12 dan 4 ta orqaga sanaymiz: 11, 10, 9... Qani keyingi sonni siz ayting-chi?",
        choices: [
          { text: "8 ta olma qoladi", correct: true, nextState: "success_state", feedback: "Juda to'g'ri! Ofarin!" }
        ]
      },
      success_state: {
        tutorMsg: "🎉 **MASALA YECHILDI!** 🎉\n\nSiz mustaqil fikrlab masalani yechdingiz! Ahmadda **8 ta olma** qoldi.\n\nSokratik AI senga o'rganishda davom etishni maslahat beradi. Chap tarafdagi paneldan keyingi masalalarni tanlab sinab ko'rishingiz mumkin!",
        choices: []
      }
    },
    task2: { // Qutidagi sharlar (Logical Reasoning)
      init: {
        tutorMsg: "Mantiqiy masalalarni yaxshi ko'rasizmi? Keling, buni yechamiz:\n\n**Qutida jami 15 ta oq va ko'k sharlar bor. Oq sharlar ko'k sharlardan 3 ta ko'p. Qutida nechta oq shar bor?**\n\nQanday yo'l tutamiz?",
        choices: [
          { text: "Boshida 3 ta ortiqcha oq sharni olib turamiz", correct: true, nextState: "step1", feedback: "Ajoyib strategiya! Tenglashtirish usulidan foydalanamiz." },
          { text: "15 ni teng ikkiga bo'lib qo'yamiz", correct: false, nextState: "wrong_split", feedback: "Lekin 15 ni teng ikkiga bo'lganda butun son chiqmaydi-ku." },
          { text: "Taxminan 10 ta deb belgilayman", correct: false, nextState: "wrong_guess", feedback: "Taxmin qilish emas, aniq hisoblashni o'rganamiz!" }
        ]
      },
      wrong_split: {
        tutorMsg: "15 - toq son. Uni bo'lsa 7.5 tadan tushadi. Sharlarni esa yarimta qilib bo'lmaydi. Keling, 3 ta ortiqcha sharni vaqtincha chetga olib turamiz. Shunda nechta shar qoladi? ⚪🔵",
        choices: [
          { text: "15 - 3 = 12 ta shar qoladi", correct: true, nextState: "step2", feedback: "Barakalla! To'g'ri." }
        ]
      },
      wrong_guess: {
        tutorMsg: "Keling, mantiqiy yondashamiz. Oq sharlar ko'kdan ko'proq. 3 tasini vaqtincha olib qo'ysak, sharlar soni tenglashadi. 15 tadan 3 tasini olib qo'ysak, nechta qoladi?",
        choices: [
          { text: "12 ta", correct: true, nextState: "step2", feedback: "To'g'ri!" }
        ]
      },
      step1: {
        tutorMsg: "To'ppa-to'g'ri! Agar boyagi 3 ta ortiqcha oq sharni olib tursak, qutida oq va ko'k sharlar soni teng bo'lib qoladi. Qutida nechta shar qoladi?",
        choices: [
          { text: "12 ta shar (15 - 3)", correct: true, nextState: "step2", feedback: "Juda to'g'ri!" }
        ]
      },
      step2: {
        tutorMsg: "Endi 12 ta shar qoldi va ularning oq hamda ko'k soni mutlaqo teng. Demak, 12 ni oq va ko'k o'rtasida teng bo'lish uchun uni nechaga bo'lamiz? ⚖️",
        choices: [
          { text: "2 ga bo'lamiz", correct: true, nextState: "step3", feedback: "Zo'r! Ikki xil rang borligi uchun 2 ga bo'lamiz." },
          { text: "3 ga bo'lamiz", correct: false, nextState: "wrong_divide", feedback: "Ranglarimiz faqat oq va ko'k, ya'ni 2 xil. Nega 3 ga bo'lamiz?" }
        ]
      },
      wrong_divide: {
        tutorMsg: "Bizda faqat ikki xil rangdagi sharlar bor (oq va ko'k). Ularni teng bo'lish uchun 12 ni 2 ga bo'lamiz, to'g'rimi?",
        choices: [
          { text: "Ha, 2 ga bo'lamiz", correct: true, nextState: "step3", feedback: "Aynan!" }
        ]
      },
      step3: {
        tutorMsg: "Ofarin! 12 ni 2 ga bo'lsak, nechtadan to'g'ri keladi? Bu har bir rangdagi sharlarning teng miqdori bo'ladi.",
        choices: [
          { text: "6 tadan (12 / 2)", correct: true, nextState: "step4", feedback: "Juda to'g'ri! Demak ko'k sharlar 6 ta, oq sharlar ham hozircha 6 ta." },
          { text: "5 tadan", correct: false, nextState: "wrong_calc_div", feedback: "Hisoblashda biroz adashting. 6 * 2 nechchi bo'lardi?" }
        ]
      },
      wrong_calc_div: {
        tutorMsg: "Qayta hisoblab ko'r: 12 ni 2 ta teng qismga ajratsak nechchidan bo'ladi?",
        choices: [
          { text: "6 tadan", correct: true, nextState: "step4", feedback: "To'g'ri!" }
        ]
      },
      step4: {
        tutorMsg: "Ajoyib! Demak, ko'k sharlar 6 ta ekan. Oq sharlar esa ko'k sharlardan **3 ta ko'p** edi. Boya biz 3 ta oq sharni olib qo'ygan edik, endi ularni qaytaramiz. Oq sharlar jami nechta bo'ladi?",
        choices: [
          { text: "6 + 3 = 9 ta oq shar (To'g'ri!)", correct: true, nextState: "success_state", feedback: "Super! Siz haqiqiy detektivsiz! Javob: 9 ta oq shar!" },
          { text: "6 ta oq shar", correct: false, nextState: "wrong_add_back", feedback: "3 ta ortiqcha sharni qo'shishni unutdingiz-ku." }
        ]
      },
      wrong_add_back: {
        tutorMsg: "Boya olib qo'ygan 3 ta oq sharni 6 taga qo'shib qo'yishimiz kerak. Shunda necha bo'ladi?",
        choices: [
          { text: "9 ta oq shar bo'ladi", correct: true, nextState: "success_state", feedback: "Barakalla!" }
        ]
      },
      success_state: {
        tutorMsg: "🎉 **MASALA YECHILDI!** 🎉\n\nJuda chiroyli mantiqiy yechim! Javob: Qutida **9 ta oq** va **6 ta ko'k shar** bor. Jami: 9 + 6 = 15 ta shar. Oq sharlar ko'kdan 3 ta ko'p!\n\nSiz bilan faxrlanaman! Keyingi masalaga o'tamizmi?",
        choices: []
      }
    },
    task3: {
      init: {
        tutorMsg: "Keling geometriya dunyosiga kiramiz! 📐\n\n**To'g'ri to'rtburchakning bo'yi 8 sm, eni esa bo'yidan 2 sm qisqa. Uning yuzini (S) toping.**\n\nBirinchi qadamda nimani aniqlaymiz?",
        choices: [
          { text: "To'rtburchakning enini aniqlaymiz", correct: true, nextState: "step1", feedback: "To'g'ri! Enini bilmasdan yuzani topib bo'lmaydi." },
          { text: "Shunchaki 8 ni 2 ga ko'paytiramiz", correct: false, nextState: "wrong_geometry_mult", feedback: "Shoshilmang. 2 sm eni emas, u bo'yidan 2 sm qisqa." }
        ]
      },
      wrong_geometry_mult: {
        tutorMsg: "Masala shartiga qarang: eni 2 sm emas, bo'yidan (8 sm) 2 sm qisqaroq. Avval enini topamiz. Qisqa bo'lsa qaysi amal bo'ladi?",
        choices: [
          { text: "Ayirish amali: eni = 8 - 2", correct: true, nextState: "step1", feedback: "To'g'ri! Enini ayirib topamiz." }
        ]
      },
      step1: {
        tutorMsg: "Ajoyib! To'rtburchakning eni bo'yidan 2 sm qisqa. Demak, uning eni necha santimetrga teng bo'ladi?",
        choices: [
          { text: "6 sm (8 - 2)", correct: true, nextState: "step2", feedback: "Barakalla! Eni 6 sm." },
          { text: "10 sm (8 + 2)", correct: false, nextState: "wrong_geo_add", feedback: "Qisqa deyilyapti, qo'shish emas, ayirish kerak bo'ladi-ku?" }
        ]
      },
      wrong_geo_add: {
        tutorMsg: "Eni bo'yidan 'qisqa' deb aytilgan. Shuning uchun 8 dan 2 ni ayiramiz. Eni nechchi chiqadi?",
        choices: [
          { text: "6 sm bo'ladi", correct: true, nextState: "step2", feedback: "To'g'ri!" }
        ]
      },
      step2: {
        tutorMsg: "Demak, bo'yi **8 sm**, eni esa **6 sm**. Endi to'g'ri to'rtburchakning yuzini (S) topish formulasini yodga olamiz. Formula qanday edi? 🔲",
        choices: [
          { text: "S = a * b (Bo'yini eniga ko'paytiramiz)", correct: true, nextState: "step3", feedback: "Juda to'g'ri! Yuzani topish uchun bo'yi eniga ko'paytiriladi." },
          { text: "P = 2 * (a + b) (Perimetr formulasi)", correct: false, nextState: "wrong_geo_formula", feedback: "Bu formula perimetr (atrofi uzunligi) uchun. Bizga esa yuza (S) kerak." }
        ]
      },
      wrong_geo_formula: {
        tutorMsg: "Yodda tuting: Yuz shaklning ichki qismi o'lchovidir. Uni topish uchun bo'yi (a) eniga (b) ko'paytiriladi: S = a * b. Qaysi amalni bajaramiz?",
        choices: [
          { text: "Ko'paytirish (S = a * b)", correct: true, nextState: "step3", feedback: "Aynan!" }
        ]
      },
      step3: {
        tutorMsg: "Juda yaxshi. Demak bo'yi 8 sm ni eni 6 sm ga ko'paytiramiz. Qani, hisoblab ko'ring-chi, necha chiqadi? ✖️",
        choices: [
          { text: "48 kv.sm (8 * 6)", correct: true, nextState: "success_state", feedback: "Ajoyib! Geometriyani a'lo darajada o'zlashtiryapsiz! Javob: 48 kv.sm." },
          { text: "14 kv.sm (8 + 6)", correct: false, nextState: "wrong_mult_calc", feedback: "Siz sonlarni qo'shib yubordingiz. Biz ko'paytirishimiz kerak." }
        ]
      },
      wrong_mult_calc: {
        tutorMsg: "Keling, ko'paytirish jadvalini yodga olamiz: 8 karra 6 nechchi bo'lardi? Yoki 6 karra 8?",
        choices: [
          { text: "48 kv.sm bo'ladi", correct: true, nextState: "success_state", feedback: "Barakalla!" }
        ]
      },
      success_state: {
        tutorMsg: "🎉 **MASALA YECHILDI!** 🎉\n\nJuda to'g'ri yechim! To'rtburchakning yuzi **48 kv.sm** ga teng (S = 8 * 6 = 48). Siz ajoyib matematik qobiliyatga egasiz!\n\nTolibbek AI virtual repetitori senga yana yutuqlarni tilaydi!",
        choices: []
      }
    }
  };

  // --- CORE DOM ELEMENTS ---
  const chatMessagesBox = document.getElementById("chat-messages-box");
  const chatOptionsContainer = document.getElementById("chat-options-container");
  const scoreCounter = document.getElementById("score-counter");
  const presetBtns = document.querySelectorAll(".preset-btn");
  
  // OCR elements
  const ocrDropzone = document.getElementById("ocr-dropzone");
  const ocrFile = document.getElementById("ocr-file");
  const ocrScannerLine = ocrDropzone.querySelector(".ocr-scanner-line");
  const ocrStatusMsg = ocrDropzone.querySelector(".ocr-status-msg");
  
  // Voice elements
  const voiceBtn = document.getElementById("voice-btn");
  const waveParticles = voiceBtn.querySelector(".wave-particles");
  const micIcon = voiceBtn.querySelector(".mic-icon");
  const voiceStatusMsg = voiceBtn.querySelector(".voice-status-msg");

  // Dashboard elements
  const periodBtns = document.querySelectorAll(".period-btn");
  const radarArea = document.getElementById("radar-data-area");
  const radarDots = document.querySelectorAll(".radar-dot");
  const totalSolvedNum = document.getElementById("total-solved-num");
  const averageTimeNum = document.getElementById("average-time-num");
  const reportLeadText = document.getElementById("report-lead-text");
  const aiRecText = document.getElementById("ai-rec-text");

  // Pricing Elements
  const pricingToggle = document.getElementById("pricing-toggle");
  const schoolCard = document.getElementById("school-card");
  const b2cLabel = document.getElementById("b2c-label");
  const b2bLabel = document.getElementById("b2b-label");

  // Contact Form
  const contactForm = document.getElementById("contact-form");
  const formSuccess = document.getElementById("form-success");

  // --- PREMIUM COMPONENT DOM ELEMENTS ---
  const muteToggleBtn = document.getElementById("mute-toggle-btn");
  const shopToggleBtn = document.getElementById("shop-toggle-btn");
  const closeShopBtn = document.getElementById("close-shop-btn");
  const shopDrawer = document.getElementById("shop-drawer");
  const activeTutorAvatar = document.getElementById("active-tutor-avatar");
  const activeTutorName = document.getElementById("active-tutor-name");
  
  // Achievements drawer
  const achievementsToggleBtn = document.getElementById("achievements-toggle-btn");
  const closeTrophiesBtn = document.getElementById("close-trophies-btn");
  const trophyDrawer = document.getElementById("trophy-drawer");


  // Dashboard view toggles
  const btnViewParent = document.getElementById("btn-view-parent");
  const btnViewTeacher = document.getElementById("btn-view-teacher");
  const parentViewContent = document.getElementById("parent-view-content");
  const teacherViewContent = document.getElementById("teacher-view-content");
  const parentPeriodBox = document.getElementById("parent-period-box");

  // PDF overlay elements
  const pdfReportBtn = document.getElementById("pdf-report-btn");
  const printReportModal = document.getElementById("print-report-modal");
  const btnClosePrintModal = document.getElementById("btn-close-print-modal");
  const btnTriggerPrint = document.getElementById("btn-trigger-print");
  const certDate = document.getElementById("cert-date");

  // Telegram bot panel preview
  const tgChatBody = document.getElementById("tg-chat-body");

  // --- AUDIO SYNTH MUTING TOGGLE BINDING ---
  muteToggleBtn.addEventListener("click", () => {
    synth.muted = !synth.muted;
    if (synth.muted) {
      muteToggleBtn.textContent = "🔇 Ovozsiz";
      muteToggleBtn.style.background = "rgba(239, 68, 68, 0.15)";
      muteToggleBtn.style.borderColor = "var(--error-red)";
      window.speechSynthesis.cancel(); // Mute speech immediately
    } else {
      muteToggleBtn.textContent = "🔊 Ovozli";
      muteToggleBtn.style.background = "rgba(255, 255, 255, 0.04)";
      muteToggleBtn.style.borderColor = "var(--border-light)";
      synth.playCorrect(); // Test chime
    }
  });


  // --- AVATAR SHOP DRAWER TOGGLE ---
  shopToggleBtn.addEventListener("click", () => {
    synth.playCorrect();
    shopDrawer.classList.toggle("open");
    trophyDrawer.classList.remove("open");
  });

  closeShopBtn.addEventListener("click", () => {
    shopDrawer.classList.remove("open");
  });

  // Purchase/select avatar event mapping
  const shopItemElements = document.querySelectorAll(".shop-item");
  
  shopItemElements.forEach(item => {
    const cost = parseInt(item.getAttribute("data-cost") || "0");
    const avatarId = item.id.replace("shop-item-", "");
    const actionBtn = item.querySelector(".btn-avatar-action");

    if (actionBtn && avatarId && !avatarId.startsWith("badge")) {
      actionBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        
        if (!unlockedAvatars[avatarId]) {
          // Purchase path
          if (score >= cost) {
            score -= cost;
            scoreCounter.textContent = score;
            unlockedAvatars[avatarId] = true;
            
            synth.playSuccess();
            
            item.classList.remove("locked");
            item.classList.add("unlocked");
            actionBtn.textContent = "Tanlash";
            actionBtn.classList.remove("btn-primary");
            actionBtn.classList.add("btn-secondary");
            
            updateShopPurchaseButtons();
            renderSystemMessage(`🪙 Tabriklaymiz! "${avatarDetails[avatarId].name}" ustozi qulfdan ochildi!`);
          } else {
            synth.playWrong();
            alert(`Mablag' yetarli emas! Ushbu ustozni ochish uchun sizga ${cost} ta yulduzli ball kerak. Hozirgi ballaringiz: ${score} ⭐️. Masalalarni yechishda davom eting!`);
          }
        } else {
          // Select path
          selectAvatar(avatarId);
        }
      });
    }
  });

  function selectAvatar(avatarId) {
    currentAvatar = avatarDetails[avatarId].emoji;
    currentAvatarName = avatarDetails[avatarId].name;
    
    activeTutorAvatar.textContent = currentAvatar;
    activeTutorName.textContent = currentAvatarName;
    
    shopItemElements.forEach(item => {
      const actBtn = item.querySelector(".btn-avatar-action");
      const aId = item.id.replace("shop-item-", "");
      
      if (actBtn && !aId.startsWith("badge")) {
        item.classList.remove("active-item");
        if (unlockedAvatars[aId]) {
          actBtn.textContent = "Tanlash";
          actBtn.removeAttribute("disabled");
          actBtn.classList.remove("active-avatar");
        }
      }
    });

    const activeItem = document.getElementById(`shop-item-${avatarId}`);
    if (activeItem) {
      activeItem.classList.add("active-item");
      const activeBtn = activeItem.querySelector(".btn-avatar-action");
      activeBtn.textContent = "Tanlangan";
      activeBtn.setAttribute("disabled", "true");
      activeBtn.classList.add("active-avatar");
    }

    shopDrawer.classList.remove("open");
    synth.playCorrect();
    renderSystemMessage(`👨‍🏫 Virtual ustoz o'zgartirildi: ${currentAvatarName}`);
  }

  // --- TROPHY ACHIEVEMENTS DRAWER TOGGLE ---
  achievementsToggleBtn.addEventListener("click", () => {
    synth.playCorrect();
    trophyDrawer.classList.toggle("open");
    shopDrawer.classList.remove("open");
  });

  closeTrophiesBtn.addEventListener("click", () => {
    synth.playWrong();
    trophyDrawer.classList.remove("open");
  });

  function checkAchievementsUnlock() {
    // 1. Check Task 2 (Logic) solved
    if (currentTask === "task2" && currentState === "success_state" && !unlockedBadges.logic) {
      unlockedBadges.logic = true;
      unlockBadgeDOM("logic");
    }
    
    // 2. Check Task 3 (Geometry) solved
    if (currentTask === "task3" && currentState === "success_state" && !unlockedBadges.geometry) {
      unlockedBadges.geometry = true;
      unlockBadgeDOM("geometry");
    }

    // 3. Check Perfect Socratic Run solved
    if (currentState === "success_state" && !hasMadeWrongChoice && !unlockedBadges.perfect) {
      unlockedBadges.perfect = true;
      unlockBadgeDOM("perfect");
    }
  }

  function unlockBadgeDOM(badgeId) {
    const badgeItem = document.getElementById(`badge-${badgeId}`);
    if (badgeItem) {
      badgeItem.classList.remove("locked");
      badgeItem.classList.add("unlocked");
      
      const actBtn = badgeItem.querySelector(".btn-avatar-action");
      if (actBtn) {
        actBtn.textContent = "Ochildi 🏆";
        actBtn.classList.add("active-avatar");
      }
      
      synth.playSuccess();
      renderSystemMessage(`🏆 Katta yutuq! Siz yangi nishonni ochdingiz: "${badgeId === 'logic' ? 'Mantiq Qiroli' : badgeId === 'geometry' ? 'Yosh Al-Xorazmiy' : 'Mustaqil Fikrlovchi'}"!`);
    }
  }

  // --- SOCRATIC CHAT SIMULATOR ENGINE ---
  function initChat(taskName) {
    currentTask = taskName;
    currentState = "init";
    hasMadeWrongChoice = false; // Reset perfect run check
    chatMessagesBox.innerHTML = "";
    
    renderMessage("tutor", dialogueData[currentTask].init.tutorMsg);
    renderChoices(dialogueData[currentTask].init.choices);
  }

  function renderMessage(sender, text, isHint = false) {
    const bubble = document.createElement("div");
    bubble.classList.add("msg-bubble", sender);
    if (isHint) {
      bubble.classList.add("tutor-hint");
    }

    const avatar = document.createElement("div");
    avatar.classList.add("msg-avatar");
    avatar.textContent = sender === "tutor" ? (isHint ? "💡" : currentAvatar) : "🧒";

    const textBox = document.createElement("div");
    textBox.classList.add("msg-text-box");
    
    // Markdown replacement
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    formattedText = formattedText.replace(/\n/g, "<br>");
    textBox.innerHTML = formattedText;

    // Append speaker TTS read button for tutor bubbles
    if (sender === "tutor" && !isHint) {
      const speakBtn = document.createElement("button");
      speakBtn.classList.add("speech-bubble-speaker-btn");
      speakBtn.innerHTML = "🔊";
      speakBtn.title = "Ovoz chiqarib o'qish";
      speakBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        speakUzbek(text);
      });
      textBox.appendChild(speakBtn);
    }

    bubble.appendChild(avatar);
    bubble.appendChild(textBox);
    chatMessagesBox.appendChild(bubble);

    // Scroll to bottom
    setTimeout(() => {
      chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
    }, 50);
  }

  function renderSystemMessage(text) {
    const bubble = document.createElement("div");
    bubble.classList.add("msg-bubble", "system");

    const textBox = document.createElement("div");
    textBox.classList.add("msg-text-box");
    textBox.textContent = text;

    bubble.appendChild(textBox);
    chatMessagesBox.appendChild(bubble);
    
    setTimeout(() => {
      chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
    }, 50);
  }

  function renderChoices(choices) {
    chatOptionsContainer.innerHTML = "";
    
    if (!choices || choices.length === 0) {
      chatOptionsContainer.innerHTML = "<p style='color:var(--text-muted);font-size:0.8rem;font-style:italic;'>Muloqot tugadi. Yangi misol tanlang.</p>";
      return;
    }

    choices.forEach(choice => {
      const btn = document.createElement("button");
      btn.classList.add("chat-option-btn");
      if (choice.correct) {
        btn.classList.add("correct-choice");
      }
      btn.textContent = choice.text;
      btn.addEventListener("click", () => handleChoiceSelect(choice));
      chatOptionsContainer.appendChild(btn);
    });
  }

  function handleChoiceSelect(choice) {
    // Render child response
    renderMessage("child", choice.text);
    chatOptionsContainer.innerHTML = ""; // Clear options

    // Sound and score calculations
    if (choice.correct) {
      synth.playCorrect();
      score += 15;
      scoreCounter.textContent = score;
      
      updateShopPurchaseButtons();

      scoreCounter.classList.add("animate-pulse");
      setTimeout(() => scoreCounter.classList.remove("animate-pulse"), 1000);
    } else {
      synth.playWrong();
      hasMadeWrongChoice = true; // Perfect run broken
    }

    // Delay for realistic tutor typing feel
    setTimeout(() => {
      if (choice.correct) {
        renderSystemMessage("✨ Barakalla! +15 Ball!");
      } else {
        renderSystemMessage("💡 Yo'naltiruvchi maslahat:");
      }

      // Render Feedback & Tutor response
      if (choice.feedback) {
        renderMessage("tutor", choice.feedback, !choice.correct);
      }

      setTimeout(() => {
        const nextStateData = dialogueData[currentTask][choice.nextState];
        if (nextStateData) {
          currentState = choice.nextState;
          renderMessage("tutor", nextStateData.tutorMsg);
          renderChoices(nextStateData.choices);
          
          // Victory fanfare if completed
          if (choice.nextState === "success_state") {
            synth.playSuccess();
            checkAchievementsUnlock(); // Check nishonlar criteria
          }
        }
      }, 800);
    }, 600);
  }

  function updateShopPurchaseButtons() {
    shopItemElements.forEach(item => {
      const cost = parseInt(item.getAttribute("data-cost") || "0");
      const avatarId = item.id.replace("shop-item-", "");
      const actionBtn = item.querySelector(".btn-avatar-action");

      if (actionBtn && avatarId && !avatarId.startsWith("badge") && !unlockedAvatars[avatarId]) {
        if (score >= cost) {
          actionBtn.classList.remove("btn-outline");
          actionBtn.classList.add("btn-primary");
          actionBtn.textContent = "Sotib olish 🔓";
          actionBtn.style.animation = "pulse-glow 1.5s infinite";
        } else {
          actionBtn.style.animation = "none";
          actionBtn.textContent = `${cost} ⭐️ Ochildi`;
        }
      }
    });
  }

  // Bind Task Presets
  presetBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      presetBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const task = btn.getAttribute("data-task");
      initChat(task);
    });
  });

  // --- INTERACTIVE OCR SCANNER SIMULATOR ---
  ocrDropzone.addEventListener("click", () => {
    ocrFile.click();
  });

  ocrFile.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      simulateOCRScan(e.target.files[0].name);
    }
  });

  // Drag and drop simulation
  ocrDropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    ocrDropzone.style.borderColor = "var(--accent-teal)";
  });

  ocrDropzone.addEventListener("dragleave", () => {
    ocrDropzone.style.borderColor = "var(--border-light)";
  });

  ocrDropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    ocrDropzone.style.borderColor = "var(--border-light)";
    if (e.dataTransfer.files.length > 0) {
      simulateOCRScan(e.dataTransfer.files[0].name);
    }
  });

  function simulateOCRScan(filename) {
    ocrScannerLine.style.display = "block";
    ocrStatusMsg.style.display = "block";
    ocrStatusMsg.textContent = "Skanerlanmoqda...";
    ocrDropzone.style.pointerEvents = "none";
    synth.playCorrect(); // Quick feedback sound

    setTimeout(() => {
      ocrScannerLine.style.display = "none";
      ocrStatusMsg.textContent = "Aniqlandi! 📄";
      synth.playSuccess();
      
      setTimeout(() => {
        ocrStatusMsg.style.display = "none";
        ocrDropzone.style.pointerEvents = "auto";
        
        // Show success simulation inside chat
        renderSystemMessage(`📷 OCR Rasm yuklandi: "${filename}"`);
        renderSystemMessage("🤖 Skanerlandi: 2-sinf matematika, 12-masala.");
        
        // Auto load task 1 in active workspace
        const task1Btn = document.querySelector('[data-task="task1"]');
        if (task1Btn) {
          task1Btn.click();
        }
      }, 1000);
    }, 2500);
  }

  // --- SPEECH TO TEXT VOICE RECORD SIMULATOR ---
  let isRecording = false;

  voiceBtn.addEventListener("click", () => {
    if (isRecording) return;
    
    isRecording = true;
    waveParticles.style.display = "flex";
    micIcon.style.opacity = "0";
    voiceStatusMsg.style.display = "block";
    voiceStatusMsg.textContent = "Ovoz eshitilmoqda...";
    synth.playCorrect(); // trigger tone

    setTimeout(() => {
      waveParticles.style.display = "none";
      micIcon.style.opacity = "1";
      voiceStatusMsg.textContent = "O'girilmoqda...";

      setTimeout(() => {
        voiceStatusMsg.style.display = "none";
        isRecording = false;

        let spokenText = "";
        let choiceToTrigger = null;

        if (currentTask === "task1" && currentState === "init") {
          spokenText = "Ahmadning boshidagi olmalarini bilib olaylik.";
          choiceToTrigger = dialogueData.task1.init.choices[0];
        } else if (currentTask === "task1" && currentState === "step2") {
          spokenText = "Ayirish amalidan foydalanamiz, chunki olmalar kamaydi.";
          choiceToTrigger = dialogueData.task1.step2.choices[0];
        } else {
          spokenText = "Keling, masalani birgalikda bosqichma-bosqich yechaylik!";
          if (dialogueData[currentTask][currentState] && dialogueData[currentTask][currentState].choices.length > 0) {
            choiceToTrigger = dialogueData[currentTask][currentState].choices[0];
          }
        }

        if (choiceToTrigger) {
          renderSystemMessage("🎙️ Ovozli kiritish (Jasurbek)");
          handleChoiceSelect(choiceToTrigger);
        } else {
          synth.playWrong();
          renderSystemMessage("🎙️ Ovozli buyruq tushunilmadi. Iltimos variantlarni tanlang.");
        }
      }, 1000);
    }, 3000);
  });

  // --- 4. PARENTS DASHBOARD & TELEGRAM SIMULATOR METRIC UPDATES ---
  const tgMessages = {
    weekly: `<b>📊 HAFTALIK BOG'LIQ PEDAGOGIK REPORT</b>\n\n<b>Jasurbek O'rinov</b> (2-"B" sinfi):\n\n• O'zlashtirish darajasi: <b>92%</b>\n• Jami masalalar: <b>47 ta</b>\n• Kognitiv rivojlanish: ayirish amali va mantiqiy masalalarda a'lo.\n\n⚠️ Tavsiya: bo'lish amali bo'yicha vizual o'yinli masalalarga e'tibor qarating.`,
    monthly: `<b>📅 OYLIK KOGNITIV MONITORING REPORT</b>\n\n<b>Jasurbek O'rinov</b> (2-"B" sinfi):\n\n• O'zlashtirish darajasi: <b>94%</b>\n• Jami masalalar: <b>192 ta</b>\n• O'rtacha dars vaqti: kuniga <b>28 daqiqa</b>\n• Mustaqil fikrlash koeffitsiyenti o'ta yuqori (89%).\n\n🤖 Tavsiya: unga geometriya va kombinatorik masalalar to'plamini tavsiya qilamiz.`
  };

  periodBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      periodBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const period = btn.getAttribute("data-period");
      updateDashboard(period);
      synth.playCorrect();
    });
  });

  function updateDashboard(period) {
    const data = dbDataSets[period];
    if (!data) return;

    radarArea.setAttribute("points", data.radarPoints);

    radarDots.forEach((dot, idx) => {
      if (data.radarDots[idx]) {
        dot.setAttribute("cx", data.radarDots[idx].cx);
        dot.setAttribute("cy", data.radarDots[idx].cy);
      }
    });

    data.barHeights.forEach((height, idx) => {
      const barFill = document.getElementById(`bar-d${idx + 1}`);
      if (barFill) {
        barFill.style.height = height;
        const valLabel = barFill.previousElementSibling;
        if (valLabel && data.barValues[idx]) {
          valLabel.textContent = data.barValues[idx];
        }
      }
    });

    totalSolvedNum.textContent = data.solved;
    averageTimeNum.textContent = data.avgTime;
    
    let formattedLead = data.leadText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    reportLeadText.innerHTML = formattedLead;
    aiRecText.textContent = data.recText;

    // Dynamically update the Telegram Bot Mock preview bubbles
    updateTelegramMock(period);
  }

  function updateTelegramMock(period) {
    const time = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    tgChatBody.innerHTML = `
      <div class="tg-bubble incoming">
        <h6>Tushunib Yech AI Bot</h6>
        <p>${tgMessages[period]}</p>
        <span class="tg-time">${time}</span>
      </div>
    `;
  }

  // --- B2B SCHOOL DASHBOARD TOGGLE ---
  btnViewParent.addEventListener("click", () => {
    setViewMode("parent");
  });

  btnViewTeacher.addEventListener("click", () => {
    setViewMode("teacher");
  });

  function setViewMode(mode) {
    synth.playCorrect();
    if (mode === "parent") {
      btnViewParent.classList.add("active");
      btnViewTeacher.classList.remove("active");
      btnViewTeacher.classList.remove("highlight-pulse");
      
      parentViewContent.style.display = "block";
      teacherViewContent.style.display = "none";
      parentPeriodBox.style.display = "flex";
    } else {
      btnViewTeacher.classList.add("active");
      btnViewParent.classList.remove("active");
      
      parentViewContent.style.display = "none";
      teacherViewContent.style.display = "block";
      parentPeriodBox.style.display = "none";
    }
  }

  // --- MONETIZATION / PRICING TOGGLE ---
  pricingToggle.addEventListener("change", () => {
    synth.playCorrect();
    if (pricingToggle.checked) {
      // Maktablar (B2B) active
      schoolCard.classList.remove("dimmed");
      schoolCard.style.boxShadow = "var(--shadow-teal)";
      schoolCard.style.borderColor = "var(--accent-teal)";
      
      b2bLabel.classList.add("active");
      b2cLabel.classList.remove("active");
      
      // UX Touch
      btnViewTeacher.classList.add("highlight-pulse");
      
      setTimeout(() => {
        document.getElementById("dashboard").scrollIntoView({ behavior: "smooth" });
      }, 1000);
    } else {
      // Ota-onalar (B2C) active
      schoolCard.classList.add("dimmed");
      schoolCard.style.boxShadow = "none";
      schoolCard.style.borderColor = "var(--border-light)";
      
      b2cLabel.classList.add("active");
      b2bLabel.classList.remove("active");
      btnViewTeacher.classList.remove("highlight-pulse");
      setViewMode("parent"); // return to parent default
    }
  });

  // --- PRINTABLE PDF REPORT HANDLERS ---
  pdfReportBtn.addEventListener("click", () => {
    synth.playCorrect();
    
    // Set formatted date
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    certDate.textContent = today.toLocaleDateString('uz-UZ', options);

    // Open Printable Overlay Modal
    printReportModal.style.display = "flex";
  });

  btnClosePrintModal.addEventListener("click", () => {
    synth.playWrong();
    printReportModal.style.display = "none";
  });

  btnTriggerPrint.addEventListener("click", () => {
    synth.playSuccess();
    window.print(); // Invokes printer / browser print stylesheet
  });

  // Close modal when clicking outside certificate card
  printReportModal.addEventListener("click", (e) => {
    if (e.target === printReportModal) {
      printReportModal.style.display = "none";
    }
  });

  // --- PITCH DEMO FORM ---
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    synth.playCorrect();
    
    const submitBtn = contactForm.querySelector("button[type='submit']");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Yuborilmoqda...";
    submitBtn.disabled = true;

    setTimeout(() => {
      synth.playSuccess();
      contactForm.reset();
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      
      formSuccess.style.display = "block";
      setTimeout(() => {
        formSuccess.style.display = "none";
      }, 5000);
    }, 1500);
  });

  // B2B Teacher broadcast mock action
  const broadcastBtn = document.getElementById("broadcast-alert-btn");
  if (broadcastBtn) {
    broadcastBtn.addEventListener("click", () => {
      synth.playSuccess();
      alert("Pedagogik alertlar muvaffaqiyatli maktab ERP (Kundalik.com) tizimiga yuborildi! O'qituvchi va ota-onaga push-bildirishnoma ketdi. 📱");
    });
  }

  // --- INITIALIZE SYSTEM ON LOAD ---
  initChat("task1");
  updateDashboard("weekly"); // Pre-load weekly dashboard metrics
  
  // Dynamic roadmap activation on click
  const roadmapItems = document.querySelectorAll(".timeline-item");
  roadmapItems.forEach(item => {
    item.addEventListener("click", () => {
      synth.playCorrect();
      roadmapItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");
    });
  });
});
