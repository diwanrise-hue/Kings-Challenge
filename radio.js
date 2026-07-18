// ========================================== //
//  radio.js - النسخة المطورة والآمنة للهواتف  //
// ========================================== //

// روابط بث حديثة، مستقرة، وتدعم بروتوكول HTTPS المشفر بالكامل لتفادي حظر المتصفحات
const RADIO_STATIONS = {
    kurdish: "https://stream.zeno.fm/3w6v088w0zhv", "https://stream-156.zeno.fm/x0xhw6c6g2zuv?zs=AfL9IRdsQ_qHIebZBo-9GA"  
      // إذاعة كردية
    arabic: "https://tatar.net.ua/radio/8000/radio.mp3",          // إذاعة للموسيقى العربية الكلاسيكية
    english: "https://icecast.walmradio.com:8443/classical",      // إذاعة أجنبية مستقرة جداً بدقة عالية
};

let audioInstance = null; // كائن الصوت الديناميكي لمنع تداخل القنوات
let isMusicPlaying = false;
let selectedRadioStation = localStorage.getItem('hub_radio_id') || 'kurdish';

function openRadioModal() {
    const modal = document.getElementById('radio-modal');
    if (modal) modal.style.display = 'flex';
    updateRadioButtonsUI();
}

function closeRadioModal() {
    const modal = document.getElementById('radio-modal');
    if (modal) modal.style.display = 'none';
}

function selectRadioStation(stationId) {
    if (RADIO_STATIONS[stationId]) {
        selectedRadioStation = stationId;
        updateRadioButtonsUI();
    }
}

function triggerPlayRadio() {
    const url = RADIO_STATIONS[selectedRadioStation];
    if (url) {
        playRadio(url, selectedRadioStation);
    }
}

function triggerStopRadio() {
    stopRadio();
}

/**
 * المحرك المطور لتشغيل البث على الهواتف
 */
function playRadio(url, id) {
    const musicBtn = document.getElementById('music-toggle-btn');
    
    // 1. إنهاء وإغلاق أي بث سابق تماماً لتفريغ ذاكرة الهاتف
    if (audioInstance) {
        audioInstance.pause();
        audioInstance.src = "";
        audioInstance = null;
    }

    // 2. إنشاء كائن صوتي جديد تماماً (يحل مشكلة قيود المتصفحات بنسبة 99%)
    audioInstance = new Audio();
    audioInstance.src = url;
    audioInstance.crossOrigin = "anonymous"; // لتفادي مشاكل الأمان CORS
    audioInstance.preload = "auto";

    audioInstance.play().then(() => {
        isMusicPlaying = true;
        
        if (musicBtn) {
            musicBtn.classList.add('music-playing');
            musicBtn.innerText = '🎵';
        }
        
        localStorage.setItem('hub_radio_url', url);
        localStorage.setItem('hub_radio_id', id);
        localStorage.setItem('hub_music_enabled', 'true');
        
        updateRadioButtonsUI();
    }).catch(e => {
        console.error("🔒 خطأ في تشغيل البث:", e);
        isMusicPlaying = false;
        updateRadioButtonsUI();
        
        // إظهار التنبيه الأنيق للمستخدم
        if (typeof showCustomPopup === 'function') {
            const lang = typeof currentLang !== 'undefined' ? currentLang : 'ar';
            const msg = lang === 'ar' 
                ? "عذراً، فشل الاتصال بالإذاعة. تأكد من استقرار الإنترنت أو جرب محطة أخرى." 
                : "Failed to connect to the radio stream. Please try another station.";
            showCustomPopup(msg);
        }
    });
}

/**
 * إيقاف البث وقطع الاتصال بالسيرفر فوراً لتوفير بيانات الهاتف
 */
function stopRadio() {
    const musicBtn = document.getElementById('music-toggle-btn');
    
    if (audioInstance) {
        audioInstance.pause();
        audioInstance.src = ""; // قطع التحميل من السيرفر تماماً
        audioInstance = null;
    }
    
    isMusicPlaying = false;
    
    if (musicBtn) {
        musicBtn.classList.remove('music-playing');
        musicBtn.innerText = '🔇';
    }
    
    localStorage.setItem('hub_music_enabled', 'false');
    updateRadioButtonsUI();
}

function updateRadioButtonsUI() {
    ['kurdish', 'arabic', 'english'].forEach(id => {
        const btn = document.getElementById('btn-station-' + id);
        if (btn) {
            if (id === selectedRadioStation) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });

    const visualizerContainer = document.getElementById('radio-visualizer-container');
    if (visualizerContainer) {
        if (isMusicPlaying) {
            visualizerContainer.classList.add('music-playing-visualizer');
        } else {
            visualizerContainer.classList.remove('music-playing-visualizer');
        }
    }
}

// تشغيل البث المحفوظ تلقائياً عند أول تفاعل للمستخدم مع الشاشة
window.addEventListener('click', () => {
    const savedMusicState = localStorage.getItem('hub_music_enabled');
    const savedRadioId = localStorage.getItem('hub_radio_id') || 'kurdish';
    const savedRadioUrl = RADIO_STATIONS[savedRadioId];
    
    if (savedMusicState === 'true' && savedRadioUrl && !isMusicPlaying) {
        selectedRadioStation = savedRadioId;
        playRadio(savedRadioUrl, savedRadioId);
    }
}, { once: true });

// تصدير الدوال للنطاق العالمي
window.openRadioModal = openRadioModal;
window.closeRadioModal = closeRadioModal;
window.selectRadioStation = selectRadioStation;
window.triggerPlayRadio = triggerPlayRadio;
window.triggerStopRadio = triggerStopRadio;
window.playRadio = playRadio;
window.stopRadio = stopRadio;
window.updateRadioButtonsUI = updateRadioButtonsUI;
