// ========================================== //
//  radio.js - النسخة المطابقة للتصميم المطلوب //
// ========================================== //

// 1. روابط البث
const RADIO_STATIONS = {
    kurdish: "https://stream-156.zeno.fm/x0xhw6c6g2zuv?zs=AfL9IRdsQ_qHIebZBo-9GA",  
    arabic: "https://tatar.net.ua/radio/8000/radio.mp3",
    english: "https://icecast.walmradio.com:8443/classical"
};

let audioInstance = null;
let isMusicPlaying = false;
let selectedRadioStation = localStorage.getItem('hub_radio_id') || 'kurdish';

// 2. حقن التصميم (CSS) والواجهة (HTML) في الصفحة برمجياً
function injectRadioUI() {
    // التحقق من عدم وجود الواجهة مسبقاً لمنع التكرار
    if (document.getElementById('radio-modal')) return;

    // --- التصميم المطابق للصورة ---
    const style = document.createElement('style');
    style.innerHTML = `
        /* زر الراديو العائم */
        .radio-floating-btn {
            position: fixed; bottom: 20px; left: 20px;
            background: #1c1c1e; border: 2px solid #333; color: white;
            font-size: 28px; width: 60px; height: 60px; border-radius: 50%;
            cursor: pointer; z-index: 9999; display: flex; justify-content: center; align-items: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5); transition: 0.3s;
        }
        .radio-floating-btn.playing { border-color: #34c759; box-shadow: 0 0 15px rgba(52, 199, 89, 0.4); }

        /* خلفية النافذة المنبثقة */
        .radio-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.8); display: none; justify-content: center; align-items: center;
            z-index: 10000; dir: rtl; font-family: 'Tajawal', sans-serif;
        }

        /* صندوق النافذة */
        .radio-modal-content {
            background: #1c1c1e; padding: 25px; border-radius: 20px; text-align: center;
            color: white; width: 90%; max-width: 380px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);
            position: relative;
        }

        /* الهيدر وزر الإغلاق */
        .radio-header { display: flex; justify-content: center; align-items: center; margin-bottom: 25px; position: relative; }
        .radio-header h3 { margin: 0; font-size: 20px; font-weight: 700; color: #fff; }
        .close-btn { 
            position: absolute; left: 0; top: 50%; transform: translateY(-50%);
            background: none; border: none; color: #888; font-size: 20px; cursor: pointer; padding: 5px;
        }

        /* أزرار المحطات */
        .stations-list { display: flex; gap: 10px; margin-bottom: 20px; }
        .station-btn {
            flex: 1; padding: 12px 5px; background: #2c2c2e; color: #ccc;
            border: none; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 600;
            transition: 0.2s; font-family: inherit;
        }
        .station-btn.active { background: #3c3c3e; color: #fff; box-shadow: inset 0 0 0 1px #555; }

        /* أزرار التحكم (تشغيل / إيقاف) */
        .radio-actions { display: flex; gap: 15px; margin-bottom: 20px; }
        .action-btn {
            flex: 1; padding: 15px 10px; border: none; border-radius: 12px;
            cursor: pointer; font-size: 16px; font-weight: bold; display: flex; justify-content: center; align-items: center; gap: 8px; font-family: inherit;
        }
        .play-btn { background: #34c759; color: white; }
        .stop-btn { background: #3a1c1e; color: #ff453a; }

        /* المؤشر البصري */
        .visualizer-box {
            background: #111112; border-radius: 12px; height: 70px; display: flex;
            justify-content: center; align-items: center; gap: 3px; overflow: hidden;
        }
        .visualizer-box .bar {
            width: 3px; height: 10px; background: #444; border-radius: 2px; transition: height 0.1s ease;
        }
        .visualizer-box.playing .bar { background: #555; animation: equalizer 0.8s infinite alternate ease-in-out; }
        
        /* حركة المؤشر البصري */
        @keyframes equalizer {
            0% { height: 10px; }
            100% { height: 40px; }
        }
    `;
    document.head.appendChild(style);

    // تجهيز أعمدة المؤشر البصري بدون استخدام علامة $
    let barsHTML = '';
    for(let i = 0; i < 30; i++) {
        barsHTML += '<div class="bar"></div>';
    }

    // --- بناء الواجهة (HTML) ---
    const uiHTML = `
        <!-- الزر العائم -->
        <button id="music-toggle-btn" class="radio-floating-btn" onclick="openRadioModal()">📻</button>

        <!-- النافذة المنبثقة -->
        <div id="radio-modal" class="radio-modal-overlay" dir="rtl">
            <div class="radio-modal-content">
                <div class="radio-header">
                    <button class="close-btn" onclick="closeRadioModal()">✕</button>
                    <h3>الراديو والموسيقى</h3>
                </div>
                
                <div class="stations-list">
                    <button id="btn-station-english" class="station-btn" onclick="selectRadioStation('english')">الإنجليزية</button>
                    <button id="btn-station-arabic" class="station-btn" onclick="selectRadioStation('arabic')">العربية</button>
                    <button id="btn-station-kurdish" class="station-btn active" onclick="selectRadioStation('kurdish')">الكردية</button>
                </div>

                <div class="radio-actions">
                    <button class="action-btn stop-btn" onclick="triggerStopRadio()">إيقاف الراديو 🔴</button>
                    <button class="action-btn play-btn" onclick="triggerPlayRadio()">تشغيل ▶</button>
                </div>

                <div id="visualizer" class="visualizer-box">
                    ` + barsHTML + `
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', uiHTML);

    // تحديث الواجهة بناءً على البيانات المحفوظة
    updateRadioButtonsUI();
}

// 3. دوال التحكم بالواجهة
function openRadioModal() {
    document.getElementById('radio-modal').style.display = 'flex';
}

function closeRadioModal() {
    document.getElementById('radio-modal').style.display = 'none';
}

function selectRadioStation(stationId) {
    if (RADIO_STATIONS[stationId]) {
        selectedRadioStation = stationId;
        updateRadioButtonsUI();
    }
}

function updateRadioButtonsUI() {
    // تحديث أزرار المحطات
    ['kurdish', 'arabic', 'english'].forEach(id => {
        const btn = document.getElementById('btn-station-' + id);
        if (btn) {
            id === selectedRadioStation ? btn.classList.add('active') : btn.classList.remove('active');
        }
    });

    // تحديث المؤشر البصري والزر العائم
    const visualizer = document.getElementById('visualizer');
    const toggleBtn = document.getElementById('music-toggle-btn');
    
    if (isMusicPlaying) {
        if(visualizer) visualizer.classList.add('playing');
        if(toggleBtn) toggleBtn.classList.add('playing');
        
        // استخدام الطريقة التقليدية (بدون $) لضمان عدم ظهور أخطاء في المتصفح
        document.querySelectorAll('.visualizer-box .bar').forEach(bar => {
            bar.style.animationDelay = (Math.random() * 0.5) + "s";
            bar.style.animationDuration = (0.5 + Math.random() * 0.5) + "s";
        });
    } else {
        if(visualizer) visualizer.classList.remove('playing');
        if(toggleBtn) toggleBtn.classList.remove('playing');
    }
}

// 4. دوال التحكم بالصوت
function triggerPlayRadio() {
    const url = RADIO_STATIONS[selectedRadioStation];
    if (url) playRadio(url, selectedRadioStation);
}

function triggerStopRadio() {
    stopRadio();
}

function playRadio(url, id) {
    if (audioInstance) {
        audioInstance.pause();
        audioInstance.src = "";
        audioInstance = null;
    }

    audioInstance = new Audio();
    audioInstance.src = url;
    audioInstance.crossOrigin = "anonymous";
    audioInstance.preload = "auto";

    audioInstance.play().then(() => {
        isMusicPlaying = true;
        localStorage.setItem('hub_radio_url', url);
        localStorage.setItem('hub_radio_id', id);
        localStorage.setItem('hub_music_enabled', 'true');
        updateRadioButtonsUI();
    }).catch(e => {
        console.error("خطأ في التشغيل:", e);
        isMusicPlaying = false;
        updateRadioButtonsUI();
        alert("فشل الاتصال بالمحطة. يرجى المحاولة مرة أخرى.");
    });
}

function stopRadio() {
    if (audioInstance) {
        audioInstance.pause();
        audioInstance.src = ""; 
        audioInstance = null;
    }
    isMusicPlaying = false;
    localStorage.setItem('hub_music_enabled', 'false');
    updateRadioButtonsUI();
}

// 5. تهيئة السكربت عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    injectRadioUI(); // بناء الواجهة فوراً

    // التشغيل التلقائي إذا كان محفوظاً مسبقاً (عند أول نقرة)
    window.addEventListener('click', () => {
        const savedMusicState = localStorage.getItem('hub_music_enabled');
        const savedRadioId = localStorage.getItem('hub_radio_id') || 'kurdish';
        const savedRadioUrl = RADIO_STATIONS[savedRadioId];
        
        if (savedMusicState === 'true' && savedRadioUrl && !isMusicPlaying) {
            selectedRadioStation = savedRadioId;
            playRadio(savedRadioUrl, savedRadioId);
        }
    }, { once: true });
});

// تصدير الدوال للنطاق العالمي لتعمل مع onClick في HTML
window.openRadioModal = openRadioModal;
window.closeRadioModal = closeRadioModal;
window.selectRadioStation = selectRadioStation;
window.triggerPlayRadio = triggerPlayRadio;
window.triggerStopRadio = triggerStopRadio;
