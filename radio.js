// ========================================== //
//  radio.js - النسخة النهائية المصححة والمطورة والمترجمة
// ========================================== //

// 0. نظام الترجمة (العربية، الكردية، الإنجليزية)
const RADIO_TRANSLATIONS = {
    ar: {
        title: "الراديو والموسيقى",
        cat_english: "الإنجليزية",
        cat_arabic: "العربية",
        cat_kurdish: "الكردية",
        play_btn: "تشغيل ▶",
        stop_btn: "إيقاف الراديو 🔴",
        status_connecting: "( جاري الاتصال بالبث... 🔄 )",
        status_refreshing: "( جاري إنعاش البث... ⏳ )",
        status_playing: "( تعمل الآن 🟢 )",
        status_failed_all: "( عذراً، لا يوجد اتصال بالبث حالياً ❌ )",
        status_failed_next: "( فشل الاتصال.. ننتقل للتالية ⏩ )",
        log_fast_switch: "تغيير سريع بين المحطات الفضائية للراديو.",
        direction: "rtl"
    },
    ku: {
        title: "ڕادیۆ و مۆسیقا",
        cat_english: "ئینگلیزی",
        cat_arabic: "عەرەبی",
        cat_kurdish: "کوردی",
        play_btn: "لێدان ▶",
        stop_btn: "وەستاندنی ڕادیۆ 🔴",
        status_connecting: "( پەیوەندیکردن بە پەخشەوە... 🔄 )",
        status_refreshing: "( نوێکردنەوەی پەخش... ⏳ )",
        status_playing: "( ئێستا پەخش دەکرێت 🟢 )",
        status_failed_all: "( ببورە، پەخشی ڕادیۆ بەردەست نییە ❌ )",
        status_failed_next: "( پەیوەندی سەرکەوتوو نەبوو.. گواستنەوە بۆ داهاتوو ⏩ )",
        log_fast_switch: "گۆڕینی خێرا لە نێوان وێستگەکانی ڕادیۆ.",
        direction: "rtl"
    },
    en: {
        title: "Radio & Music",
        cat_english: "English",
        cat_arabic: "Arabic",
        cat_kurdish: "Kurdish",
        play_btn: "Play ▶",
        stop_btn: "Stop Radio 🔴",
        status_connecting: "( Connecting to stream... 🔄 )",
        status_refreshing: "( Refreshing stream... ⏳ )",
        status_playing: "( Now Playing 🟢 )",
        status_failed_all: "( Sorry, stream unavailable ❌ )",
        status_failed_next: "( Connection failed.. skipping to next ⏩ )",
        log_fast_switch: "Fast switching between radio stations.",
        direction: "ltr"
    }
};

// تحديد اللغة الحالية (يمكن أخذها من لغة المتصفح، أو localStorage أو الافتراضي عربي)
let currentAppLang = localStorage.getItem('app_lang') || document.documentElement.lang || 'ar';
if (!RADIO_TRANSLATIONS[currentAppLang]) currentAppLang = 'ar';

function t(key) {
    return RADIO_TRANSLATIONS[currentAppLang][key];
}

// 1. هيكل البيانات للأصناف والقنوات
const RADIO_STATIONS = {
    kurdish: [
        { name: "Kurd folklore", url: "https://stream.zeno.fm/gmdsp1mgs7zuv" },
        { name: "دينغي كوردسات (Dengi Kurdsat)", url: "https://stream.zeno.fm/e87fd7r29f8uv" }, 
        { name: "Kamal Mohammad", url: "https://stream.zeno.fm/rex374xgr2zuv" },
        { name: "كمال كولجين", url: "https://stream.zeno.fm/624egn8hpm0uv" },
        { name: "احمد خليل", url: "https://stream.zeno.fm/uw3bpcdkpm0uv" },
        { name: "سانا برزنجي", url: "https://stream.zeno.fm/hrguyt6hpm0uv" },
        { name: "بادينان (Badinan FM)", url: "https://stream-156.zeno.fm/x0xhw6c6g2zuv?zs=AfL9IRdsQ_qHIebZBo-9GA" }
    ],
    arabic: [
        { name: "نغم فيروز", url: "https://stream.zeno.fm/24ydgrmvpg8uv" },
        { name: "اغاني 2", url: "https://stream.zeno.fm/17s3kijft2wtv" },
        { name: "اغاني", url: "https://stream.zeno.fm/bmccpngymc0vv" },
        { name: "ميلوديات", url: "https://stream.zeno.fm/3gkedytbapbuv" }
    ],
    english: [
        { name: "FM", url: "https://stream.revma.ihrhls.com/zc185" },
        { name: "New York's", url: "https://stream.vovmedia.vn/vov247" }
    ]
};

let audioInstance = null;
let isMusicPlaying = false;
let failedAttempts = 0; 
let stallTimeout = null; 

// إدارة الحالة وإعدادات الصوت
let selectedCategory = localStorage.getItem('hub_radio_category') || 'kurdish';
let parsedIndex = parseInt(localStorage.getItem('hub_radio_channel_index'));
let currentChannelIndex = !isNaN(parsedIndex) ? parsedIndex : 0;
let savedVolume = localStorage.getItem('hub_radio_volume');
let radioVolume = (savedVolume !== null && !isNaN(parseFloat(savedVolume))) ? parseFloat(savedVolume) : 0.3;

if (!RADIO_STATIONS[selectedCategory] || !RADIO_STATIONS[selectedCategory][currentChannelIndex]) {
    selectedCategory = 'kurdish';
    currentChannelIndex = 0;
}

// 2. حقن التصميم والواجهة
function injectRadioUI() {
    if (document.getElementById('radio-modal')) return;

    const style = document.createElement('style');
    style.innerHTML = `
        /* زر الراديو بجوار زر اللغة */
        .radio-hud-btn {
            height: 46px; width: 46px;
            background: rgba(25, 25, 30, 0.6); backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            color: #fff; font-size: 22px; cursor: pointer; padding: 0; outline: none;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .radio-hud-btn:hover { background: rgba(255,255,255,0.08); transform: scale(1.05); }
        .radio-hud-btn.playing { border-color: #30d158; box-shadow: 0 0 10px rgba(48, 209, 88, 0.4); }

        /* خلفية النافذة */
        .radio-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.8); display: none; justify-content: center; align-items: center;
            z-index: 10000; font-family: 'Tajawal', sans-serif;
        }

        /* صندوق النافذة الرئيسي - مع إضافة إطار نحيف جداً */
        .radio-modal-content {
            background: #1c1c1e; padding: 25px; border-radius: 20px; text-align: center;
            color: white; width: 90%; max-width: 380px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);
            position: relative;
            border: 1px solid rgba(255, 255, 255, 0.1); /* إضافة الإطار النحيف */
        }

        .radio-header { display: flex; justify-content: center; align-items: center; margin-bottom: 25px; position: relative; }
        .radio-header h3 { margin: 0; font-size: 20px; font-weight: 700; color: #fff; }
        
        /* ضبط زر الإغلاق ليتناسب مع اتجاه اللغة (RTL/LTR) */
        [dir="rtl"] .close-btn { left: 0; right: auto; }
        [dir="ltr"] .close-btn { right: 0; left: auto; }
        
        .close-btn { 
            position: absolute; top: 50%; transform: translateY(-50%);
            background: none; border: none; color: #888; font-size: 20px; cursor: pointer; padding: 5px;
        }

        /* قائمة الأصناف في الأعلى */
        .stations-list { display: flex; gap: 10px; margin-bottom: 25px; }
        .station-btn {
            flex: 1; padding: 12px 5px; background: #2c2c2e; color: #8e8e93;
            border: 2px solid transparent; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 600;
            transition: all 0.3s ease; font-family: inherit;
        }
        .station-btn.active { 
            background: #1c1c1e; 
            color: #fff; 
            border-color: #30d158; 
            box-shadow: 0 0 15px rgba(48, 209, 88, 0.6);
            font-weight: 700;
        }

        /* حاوية المؤشر النبضي والأسهم الجانبية */
        .visualizer-container {
            display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 15px;
        }

        /* أزرار الأسهم الجانبية للتنقل */
        .nav-arrow-btn {
            background: #2c2c2e; border: 1px solid #3a3a3c; color: #30d158;
            font-size: 18px; width: 38px; height: 38px; border-radius: 50%; cursor: pointer;
            display: flex; justify-content: center; align-items: center; transition: 0.2s ease; user-select: none;
        }
        .nav-arrow-btn:hover { background: #3a3a3c; box-shadow: 0 0 8px rgba(48, 209, 88, 0.4); }
        
        /* تدوير الأسهم في حالة الإنجليزية (LTR) لتكون منطقية */
        [dir="ltr"] .nav-prev-icon { transform: scaleX(-1); }
        [dir="ltr"] .nav-next-icon { transform: scaleX(-1); }

        /* المؤشر النبضي البصري */
        .visualizer-box {
            flex: 1; background: #111112; border-radius: 12px; height: 70px; display: flex;
            justify-content: center; align-items: center; gap: 3px; overflow: hidden;
        }
        .visualizer-box .bar {
            width: 3px; height: 10px; background: #3a3a3c; border-radius: 2px; transition: height 0.1s ease;
        }
        .visualizer-box.playing .bar { background: #30d158; animation: equalizer 0.8s infinite alternate ease-in-out; }
        
        @keyframes equalizer {
            0% { height: 10px; }
            100% { height: 45px; }
        }

        /* صندوق اسم القناة والحالة */
        .channel-info-box { margin-bottom: 25px; min-height: 55px; }
        .channel-name-text {
            font-size: 20px; font-weight: 700; color: #ffffff; display: block; margin-bottom: 6px; letter-spacing: 0.5px;
        }
        .radio-status-text { font-size: 13px; font-weight: 600; min-height: 18px; transition: 0.3s; }

        /* حاوية شريط التحكم في الصوت */
        .radio-volume-container {
            display: flex; align-items: center; justify-content: center; gap: 12px;
            margin-bottom: 20px; background: #2c2c2e; padding: 10px 15px; border-radius: 12px;
        }
        .radio-volume-icon { font-size: 16px; color: #30d158; user-select: none; }
        .radio-volume-slider {
            flex: 1; -webkit-appearance: none; appearance: none; height: 6px; border-radius: 3px;
            outline: none; cursor: pointer; background: #3a3a3c; direction: ltr; /* الصوت دائماً LTR */
        }
        .radio-volume-slider::-webkit-slider-thumb {
            -webkit-appearance: none; appearance: none; width: 16px; height: 16px;
            border-radius: 50%; background: #ffffff; border: 2px solid #30d158; cursor: pointer;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        }
        .radio-volume-slider::-moz-range-thumb {
            width: 12px; height: 12px; border-radius: 50%; background: #ffffff;
            border: 2px solid #30d158; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        }

        /* زر التشغيل والإيقاف الموحد */
        .radio-actions { display: flex; }
        .action-btn {
            flex: 1; padding: 14px 10px; border: none; border-radius: 12px;
            cursor: pointer; font-size: 16px; font-weight: bold; display: flex; justify-content: center; 
            align-items: center; gap: 8px; font-family: inherit; transition: background 0.3s, color 0.3s, box-shadow 0.3s;
        }
        .play-btn { background: #30d158; color: white; box-shadow: 0 4px 10px rgba(48, 209, 88, 0.3); }
        .stop-btn { background: #3a1c1e; color: #ff453a; box-shadow: 0 4px 10px rgba(255, 69, 58, 0.15); }
    `;
    document.head.appendChild(style);

    let barsHTML = '';
    for(let i = 0; i < 30; i++) {
        const randomDelay = (Math.random() * 0.5).toFixed(2);
        const randomDuration = (0.5 + Math.random() * 0.5).toFixed(2);
        barsHTML += `<div class="bar" style="animation-delay: ${randomDelay}s; animation-duration: ${randomDuration}s;"></div>`;
    }

    const modalHTML = `
        <div id="radio-modal" class="radio-modal-overlay" dir="${t('direction')}">
            <div class="radio-modal-content">
                <div class="radio-header">
                    <button class="close-btn" onclick="closeRadioModal()">✕</button>
                    <h3 id="ui-radio-title">${t('title')}</h3>
                </div>
                
                <div class="stations-list">
                    <button id="btn-station-english" class="station-btn" onclick="selectRadioCategory('english')">${t('cat_english')}</button>
                    <button id="btn-station-arabic" class="station-btn" onclick="selectRadioCategory('arabic')">${t('cat_arabic')}</button>
                    <button id="btn-station-kurdish" class="station-btn active" onclick="selectRadioCategory('kurdish')">${t('cat_kurdish')}</button>
                </div>

                <div class="visualizer-container">
                    <button class="nav-arrow-btn nav-prev-icon" onclick="prevChannel()">❮</button>
                    <div id="visualizer" class="visualizer-box">
                        ${barsHTML}
                    </div>
                    <button class="nav-arrow-btn nav-next-icon" onclick="nextChannel()">❯</button>
                </div>

                <div class="channel-info-box">
                    <span id="channel-display-name" class="channel-name-text">---</span>
                    <div id="radio-status" class="radio-status-text"></div>
                </div>

                <div class="radio-volume-container">
                    <span class="radio-volume-icon">🔊</span>
                    <input type="range" id="radio-volume-slider" class="radio-volume-slider" min="0" max="1" step="0.01" oninput="changeRadioVolume(this.value)">
                </div>

                <div class="radio-actions">
                    <button id="radio-toggle-action-btn" class="action-btn ${isMusicPlaying ? 'stop-btn' : 'play-btn'}" onclick="toggleRadioPlayState()">
                        ${isMusicPlaying ? t('stop_btn') : t('play_btn')}
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // حقن زر الراديو ليكون مجاوراً لزر اللغة
    const btnHTML = `<button id="music-toggle-btn" class="radio-hud-btn" onclick="openRadioModal()">📻</button>`;
    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn && langBtn.parentElement) {
        langBtn.parentElement.insertAdjacentHTML('afterbegin', btnHTML);
    } else {
        // حالة احتياطية في حال لم يتم العثور على زر اللغة لسبب ما
        document.body.insertAdjacentHTML('beforeend', `<div style="position:fixed; top:30px; right:25px; z-index:20;">${btnHTML}</div>`);
    }
    
    const modalOverlay = document.getElementById('radio-modal');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === this) {
                closeRadioModal();
            }
        });
    }
    
    const sliderElement = document.getElementById('radio-volume-slider');
    if (sliderElement) {
        sliderElement.value = radioVolume;
        changeRadioVolume(radioVolume);
    }
    
    updateRadioButtonsUI();
}

// 3. دوال تحديث الترجمة للواجهة والتغيير الديناميكي
function setRadioLanguage(langCode) {
    if (RADIO_TRANSLATIONS[langCode]) {
        currentAppLang = langCode;
        localStorage.setItem('app_lang', langCode);
        
        // تحديث النصوص الحية في الواجهة
        const modal = document.getElementById('radio-modal');
        if (modal) {
            modal.setAttribute('dir', t('direction'));
            document.getElementById('ui-radio-title').innerText = t('title');
            document.getElementById('btn-station-english').innerText = t('cat_english');
            document.getElementById('btn-station-arabic').innerText = t('cat_arabic');
            document.getElementById('btn-station-kurdish').innerText = t('cat_kurdish');
            
            updateRadioButtonsUI();
        }
    }
}

// 4. دوال التحكم بالواجهة والتنقل
function openRadioModal() {
    document.getElementById('radio-modal').style.display = 'flex';
}

function closeRadioModal() {
    document.getElementById('radio-modal').style.display = 'none';
}

function selectRadioCategory(category) {
    if (RADIO_STATIONS[category]) {
        selectedCategory = category;
        currentChannelIndex = 0; 
        failedAttempts = 0; 
        updateRadioButtonsUI();
        if (isMusicPlaying) triggerPlayRadio();
    }
}

function nextChannel() {
    const channels = RADIO_STATIONS[selectedCategory];
    currentChannelIndex = (currentChannelIndex + 1) % channels.length;
    updateRadioButtonsUI();
    if (isMusicPlaying) triggerPlayRadio();
}

function prevChannel() {
    const channels = RADIO_STATIONS[selectedCategory];
    currentChannelIndex = (currentChannelIndex - 1 + channels.length) % channels.length;
    updateRadioButtonsUI();
    if (isMusicPlaying) triggerPlayRadio();
}

function toggleRadioPlayState() {
    if (isMusicPlaying) {
        stopRadio();
    } else {
        failedAttempts = 0; 
        triggerPlayRadio();
    }
}

function changeRadioVolume(value) {
    radioVolume = parseFloat(value);
    localStorage.setItem('hub_radio_volume', value);
    
    if (audioInstance) {
        audioInstance.volume = radioVolume;
    }
    
    const slider = document.getElementById('radio-volume-slider');
    if (slider) {
        const percentage = radioVolume * 100;
        // تعديل اتجاه الألوان في شريط الصوت بناءً على لغة الواجهة
        const directionStr = t('direction') === 'rtl' ? 'to left' : 'to right';
        slider.style.background = `linear-gradient(${directionStr}, #30d158 ${percentage}%, #3a3a3c ${percentage}%)`;
    }
}

function updateRadioButtonsUI() {
    ['kurdish', 'arabic', 'english'].forEach(id => {
        const btn = document.getElementById('btn-station-' + id);
        if (btn) {
            id === selectedCategory ? btn.classList.add('active') : btn.classList.remove('active');
        }
    });

    const currentChannel = RADIO_STATIONS[selectedCategory][currentChannelIndex];
    const nameDisplay = document.getElementById('channel-display-name');
    if (nameDisplay && currentChannel) {
        nameDisplay.innerText = currentChannel.name;
    }

    const visualizer = document.getElementById('visualizer');
    const toggleBtn = document.getElementById('music-toggle-btn');
    const toggleActionBtn = document.getElementById('radio-toggle-action-btn');
    const statusText = document.getElementById('radio-status');
    
    // تحديث الألوان في شريط الصوت
    const slider = document.getElementById('radio-volume-slider');
    if (slider) changeRadioVolume(radioVolume);
    
    if (isMusicPlaying) {
        if(toggleBtn) toggleBtn.classList.add('playing');
        
        if(visualizer && audioInstance && !audioInstance.paused && audioInstance.readyState >= 3) {
            visualizer.classList.add('playing');
            if (statusText) statusText.innerText = t('status_playing');
        } else if (visualizer) {
            visualizer.classList.remove('playing');
        }
        
        if (toggleActionBtn) {
            toggleActionBtn.innerText = t('stop_btn');
            toggleActionBtn.className = "action-btn stop-btn";
        }
        
    } else {
        if(visualizer) visualizer.classList.remove('playing');
        if(toggleBtn) toggleBtn.classList.remove('playing');
        if (statusText) statusText.innerText = "";
        
        if (toggleActionBtn) {
            toggleActionBtn.innerText = t('play_btn');
            toggleActionBtn.className = "action-btn play-btn";
        }
    }
}

// 5. دوال الصوت المطورة
function triggerPlayRadio() {
    const currentChannel = RADIO_STATIONS[selectedCategory][currentChannelIndex];
    if (currentChannel && currentChannel.url) {
        playRadio(currentChannel.url, selectedCategory, currentChannelIndex);
    }
}

function playRadio(url, category, index) {
    const statusText = document.getElementById('radio-status');
    const toggleActionBtn = document.getElementById('radio-toggle-action-btn');
    const visualizer = document.getElementById('visualizer');

    if (statusText) {
        statusText.innerText = t('status_connecting');
        statusText.style.color = "#ff9500"; 
    }
    
    if (visualizer) visualizer.classList.remove('playing');

    if (audioInstance) {
        audioInstance.pause();
        audioInstance.onwaiting = null;
        audioInstance.onplaying = null;
        audioInstance.onerror = null;
        audioInstance.src = ''; 
        audioInstance.load();   
        audioInstance = null;
    }

    const liveTimestamp = Date.now();
    const optimizedUrl = url.includes('?') ? `${url}&_live=${liveTimestamp}` : `${url}?_live=${liveTimestamp}`;

    audioInstance = new Audio(optimizedUrl);
    audioInstance.preload = "none"; 
    audioInstance.volume = radioVolume;

    audioInstance.onwaiting = () => {
        if (isMusicPlaying && statusText) {
            statusText.innerText = t('status_refreshing');
            statusText.style.color = "#ff9500";
        }
        
        clearTimeout(stallTimeout);
        stallTimeout = setTimeout(() => {
            if (isMusicPlaying) {
                handleConnectionFailure(statusText);
            }
        }, 8000); 
    };

    audioInstance.onerror = () => {
        clearTimeout(stallTimeout);
        if (isMusicPlaying) {
             handleConnectionFailure(statusText);
        }
    };

    audioInstance.onplaying = () => {
        clearTimeout(stallTimeout);
        failedAttempts = 0; 
        if (statusText) {
            statusText.innerText = t('status_playing');
            statusText.style.color = "#30d158";
        }
        if (toggleActionBtn) {
            toggleActionBtn.innerText = t('stop_btn');
            toggleActionBtn.className = "action-btn stop-btn";
        }
        if (visualizer) visualizer.classList.add('playing');
    };

    const playPromise = audioInstance.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            isMusicPlaying = true;
            localStorage.setItem('hub_radio_url', url);
            localStorage.setItem('hub_radio_category', category);
            localStorage.setItem('hub_radio_channel_index', index.toString());
            localStorage.setItem('hub_music_enabled', 'true');
            updateRadioButtonsUI();
        }).catch(e => {
            if (e.name === 'AbortError' || e.message.includes('interrupted')) {
                console.log(t('log_fast_switch'));
            } else {
                isMusicPlaying = true;
                handleConnectionFailure(statusText);
            }
        });
    }
}

function handleConnectionFailure(statusText) {
    failedAttempts++;
    const maxChannels = RADIO_STATIONS[selectedCategory].length;

    if (failedAttempts >= maxChannels) {
         if (statusText) {
             statusText.innerText = t('status_failed_all');
             statusText.style.color = "#ff453a";
         }
         stopRadio(); 
         failedAttempts = 0; 
    } else {
         if (statusText) {
             statusText.innerText = t('status_failed_next');
             statusText.style.color = "#ff453a";
         }
         setTimeout(() => {
             if (isMusicPlaying) nextChannel();
         }, 1500);
    }
}

// 6. تهيئة وحفظ حالة الخروج
function stopRadio() {
    const statusText = document.getElementById('radio-status');
    if (statusText) statusText.innerText = ""; 

    clearTimeout(stallTimeout); 

    if (audioInstance) {
        audioInstance.pause();
        audioInstance.onwaiting = null;
        audioInstance.onplaying = null;
        audioInstance.onerror = null;
        audioInstance.src = ''; 
        audioInstance.load();   
        audioInstance = null;
    }
    isMusicPlaying = false;
    localStorage.setItem('hub_music_enabled', 'false');
    updateRadioButtonsUI();
}

document.addEventListener('DOMContentLoaded', () => {
    injectRadioUI(); 

    const handleFirstClick = () => {
        const savedMusicState = localStorage.getItem('hub_music_enabled');
        const savedCategory = localStorage.getItem('hub_radio_category') || 'kurdish';
        const savedIndex = parseInt(localStorage.getItem('hub_radio_channel_index')) || 0;
        
        if (savedMusicState === 'true' && RADIO_STATIONS[savedCategory] && RADIO_STATIONS[savedCategory][savedIndex] && !isMusicPlaying) {
            selectedCategory = savedCategory;
            currentChannelIndex = savedIndex;
            triggerPlayRadio();
        }
        window.removeEventListener('click', handleFirstClick); 
    };

    window.addEventListener('click', handleFirstClick);
});

const handleGameExitState = () => {
    if (audioInstance) {
        audioInstance.pause();
    }
};
window.addEventListener('beforeunload', handleGameExitState);
window.addEventListener('pagehide', handleGameExitState);

// تصدير الدوال للاستخدام العام (بما في ذلك دالة تغيير اللغة)
window.openRadioModal = openRadioModal;
window.closeRadioModal = closeRadioModal;
window.selectRadioCategory = selectRadioCategory;
window.nextChannel = nextChannel;
window.prevChannel = prevChannel;
window.toggleRadioPlayState = toggleRadioPlayState;
window.changeRadioVolume = changeRadioVolume;
window.setRadioLanguage = setRadioLanguage;
