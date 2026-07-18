// ========================================== //
//  radio.js - نظام الراديو والموسيقى المطور  //
// ========================================== //

// 1. خريطة روابط بث الإذاعات الحية (يمكنك استبدالها بروابطك الخاصة لاحقاً)
const RADIO_STATIONS = {
    kurdish: "https://stream.zeno.fm/3w6v088w0zhv", // إذاعة كردية كلاسيك
    arabic: "https://stream.radiojar.com/8s996shv0z3vv",  // إذاعة عربية طرب
    english: "https://hyades.shoutca.st/8004/stream"     // إذاعة أجنبية Lofi/Chill
};

// 2. الحالات والمتغيرات الداخلية للنظام
let isMusicPlaying = false;
let selectedRadioStation = localStorage.getItem('hub_radio_id') || 'kurdish';

/**
 * فتح نافذة الراديو المنبثقة
 */
function openRadioModal() {
    const modal = document.getElementById('radio-modal');
    if (modal) modal.style.display = 'flex';
    updateRadioButtonsUI();
}

/**
 * إغلاق نافذة الراديو المنبثقة
 */
function closeRadioModal() {
    const modal = document.getElementById('radio-modal');
    if (modal) modal.style.display = 'none';
}

/**
 * تحديد القناة المراد الاستماع إليها (تحضير التحديد)
 * @param {string} stationId - معرف الإذاعة (arabic, english, kurdish)
 */
function selectRadioStation(stationId) {
    if (RADIO_STATIONS[stationId]) {
        selectedRadioStation = stationId;
        updateRadioButtonsUI();
    }
}

/**
 * الضغط على زر التشغيل (Play) لتبدأ الإذاعة المحددة حالياً
 */
function triggerPlayRadio() {
    const url = RADIO_STATIONS[selectedRadioStation];
    if (url) {
        playRadio(url, selectedRadioStation);
    }
}

/**
 * الضغط على زر الإيقاف (Stop) لإسكات الصوت
 */
function triggerStopRadio() {
    stopRadio();
}

/**
 * محرك تشغيل الصوت الأساسي والتعامل مع أذونات المتصفح
 */
function playRadio(url, id) {
    const audioEl = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-toggle-btn');
    
    if (!audioEl) return;

    audioEl.src = url;
    audioEl.play().then(() => {
        isMusicPlaying = true;
        
        if (musicBtn) {
            musicBtn.classList.add('music-playing');
            musicBtn.innerText = '🎵';
        }
        
        // حفظ تفضيلات المستخدم في الذاكرة المحلية (Local Storage)
        localStorage.setItem('hub_radio_url', url);
        localStorage.setItem('hub_radio_id', id);
        localStorage.setItem('hub_music_enabled', 'true');
        
        updateRadioButtonsUI();
    }).catch(e => {
        console.error("🔒 فشل تشغيل الراديو بسبب قيود المتصفح أو الرابط:", e);
        
        // استدعاء نافذة التنبيه المخصصة الموجودة في ملف الـ HTML الأساسي
        if (typeof showCustomPopup === 'function') {
            const lang = typeof currentLang !== 'undefined' ? currentLang : 'ar';
            const msg = lang === 'ar' 
                ? "عذراً، فشل الاتصال بالإذاعة. تأكد من اتصالك بالإنترنت أو جرب قناة أخرى." 
                : "Failed to connect to the radio stream. Please check your connection.";
            showCustomPopup(msg);
        }
    });
}

/**
 * محرك إيقاف الصوت وتصفير العنوان المصدري لمنع استهلاك البيانات في الخلفية
 */
function stopRadio() {
    const audioEl = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-toggle-btn');
    
    if (!audioEl) return;

    audioEl.pause();
    audioEl.src = ''; 
    isMusicPlaying = false;
    
    if (musicBtn) {
        musicBtn.classList.remove('music-playing');
        musicBtn.innerText = '🔇';
    }
    
    localStorage.setItem('hub_music_enabled', 'false');
    updateRadioButtonsUI();
}

/**
 * تحديث واجهة المستخدم الرسومية (الأزرار والـ Visualizer التموجي) بناءً على المتغيرات الحالية
 */
function updateRadioButtonsUI() {
    // تحديث كلاس النشاط (active) لقنوات التبديل الثلاثة
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

    // تشغيل أو إيقاف حركة تموجات الصوت البصرية (Visualizer)
    const visualizerContainer = document.getElementById('radio-visualizer-container');
    if (visualizerContainer) {
        if (isMusicPlaying) {
            visualizerContainer.classList.add('music-playing-visualizer');
        } else {
            visualizerContainer.classList.remove('music-playing-visualizer');
        }
    }
}

/**
 * تخطي قيود المتصفحات الحديثة (Autoplay Policy):
 * يتم تفعيل الراديو تلقائياً إذا كان مفصلاً في الجلسة السابقة عند أول نقرة للمستخدم على الشاشة.
 */
window.addEventListener('click', () => {
    const savedMusicState = localStorage.getItem('hub_music_enabled');
    const savedRadioId = localStorage.getItem('hub_radio_id') || 'kurdish';
    const savedRadioUrl = RADIO_STATIONS[savedRadioId];
    
    if (savedMusicState === 'true' && savedRadioUrl && !isMusicPlaying) {
        selectedRadioStation = savedRadioId;
        playRadio(savedRadioUrl, savedRadioId);
    }
}, { once: true });

// --- ربط الدوال بالنطاق العالمي (window) لضمان عمل الـ onclick المباشر في الـ HTML ---
window.openRadioModal = openRadioModal;
window.closeRadioModal = closeRadioModal;
window.selectRadioStation = selectRadioStation;
window.triggerPlayRadio = triggerPlayRadio;
window.triggerStopRadio = triggerStopRadio;
window.playRadio = playRadio;
window.stopRadio = stopRadio;
window.updateRadioButtonsUI = updateRadioButtonsUI;
