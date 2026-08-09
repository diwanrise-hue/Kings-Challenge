// ========================================== //
//  radio.js - النسخة النهائية المصححة والمطورة والمترجمة
// ========================================== //

// 0. كود أيقونة الراديو (SVG) ليتم حقنها ديناميكياً في أي مكان
const RADIO_SVG_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 120 130" style="width: 100%; height: 100%; transform: scale(1.25);">
  <defs>
    <style>
      @keyframes floatAnimRadio {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }
      .anim-f-radio { animation: floatAnimRadio 3.5s ease-in-out infinite; }
    </style>
    <filter id="mainShadowRadio" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.25"/>
    </filter>
    <filter id="radioShadowInner" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.35"/>
    </filter>
    <filter id="dialGlowRadio" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="0" stdDeviation="2.5" flood-color="#f97316" flood-opacity="0.8"/>
    </filter>
    <linearGradient id="woodOuterRadio" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#92400e"/>
      <stop offset="50%" stop-color="#78350f"/>
      <stop offset="100%" stop-color="#451a03"/>
    </linearGradient>
    <linearGradient id="woodInnerRadio" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#b45309"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <linearGradient id="brassGradRadio" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="40%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <linearGradient id="chromeGradRadio" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#cbd5e1"/>
      <stop offset="50%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#64748b"/>
    </linearGradient>
    <linearGradient id="dialGradRadio" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff7ed"/>
      <stop offset="60%" stop-color="#ffedd5"/>
      <stop offset="100%" stop-color="#fed7aa"/>
    </linearGradient>
    <pattern id="speakerMeshRadio" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="4" fill="#292524" />
      <circle cx="2" cy="2" r="1" fill="#44403c" />
    </pattern>
  </defs>
  <g class="anim-f-radio" filter="url(#mainShadowRadio)">
    <path d="M 32 28 L 16 8" stroke="url(#chromeGradRadio)" stroke-width="2.5" stroke-linecap="round" />
    <circle cx="15" cy="7" r="2.5" fill="url(#brassGradRadio)" />
    <rect x="14" y="32" width="72" height="52" rx="12" fill="#1c1917" />
    <rect x="14" y="27" width="72" height="52" rx="12" fill="url(#woodOuterRadio)" filter="url(#radioShadowInner)" />
    <rect x="18" y="31" width="64" height="44" rx="8" fill="url(#woodInnerRadio)" />
    <rect x="22" y="35" width="30" height="36" rx="6" fill="url(#speakerMeshRadio)" stroke="#451a03" stroke-width="1.5" />
    <rect x="22" y="35" width="30" height="36" rx="6" fill="none" stroke="url(#brassGradRadio)" stroke-width="1" opacity="0.8" />
    <rect x="55" y="35" width="23" height="36" rx="6" fill="#1c1917" stroke="#451a03" stroke-width="1" />
    <circle cx="66.5" cy="46" r="8.5" fill="url(#dialGradRadio)" filter="url(#dialGlowRadio)" stroke="url(#brassGradRadio)" stroke-width="1.5" />
    <circle cx="66.5" cy="46" r="6.5" fill="none" stroke="#d97706" stroke-width="0.8" stroke-dasharray="1.5,1.5" />
    <line x1="66.5" y1="46" x2="69.5" y2="41" stroke="#dc2626" stroke-width="1.5" stroke-linecap="round" />
    <circle cx="66.5" cy="46" r="1.2" fill="#78350f" />
    <circle cx="60.5" cy="62" r="3.8" fill="#1c1917" />
    <circle cx="60.5" cy="62" r="3.2" fill="url(#brassGradRadio)" stroke="#451a03" stroke-width="0.5" />
    <line x1="60.5" y1="62" x2="60.5" y2="59.8" stroke="#1c1917" stroke-width="0.8" />
    <circle cx="72.5" cy="62" r="3.8" fill="#1c1917" />
    <circle cx="72.5" cy="62" r="3.2" fill="url(#brassGradRadio)" stroke="#451a03" stroke-width="0.5" />
    <line x1="72.5" y1="62" x2="74" y2="60.5" stroke="#1c1917" stroke-width="0.8" />
    <rect x="22" y="79" width="10" height="3" rx="1.5" fill="#292524" />
    <rect x="68" y="79" width="10" height="3" rx="1.5" fill="#292524" />
    <path d="M 14 35 C 14 30.5 17.5 27 22 27 L 78 27 C 82.5 27 86 30.5 86 35 L 86 39 L 14 39 Z" fill="#ffffff" opacity="0.18" />
  </g>
</svg>`;

function renderRadioIcons() {
    const radioContainers = document.querySelectorAll('.auto-radio-icon');
    radioContainers.forEach(container => {
        container.innerHTML = RADIO_SVG_ICON;
        container.classList.remove('radio-hud-btn-fallback');
        container.classList.add('radio-hud-btn');
    });
}

// نظام الترجمة
const RADIO_TRANSLATIONS = {
    ar: {
        title: "الراديو", 
        cat_english: "الإنجليزية",
        cat_arabic: "العربية",
        cat_kurdish: "الكردية",
        play_btn: "تشغيل ▶",
        stop_btn: "إيقاف الراديو 🔴",
        status_connecting: "( جاري الاتصال بالبث... 🔄 )",
        status_reconnecting: "( جاري إعادة المحاولة... 🔄 )", 
        status_refreshing: "( جاري إنعاش البث... ⏳ )",
        status_playing: "( تعمل الآن 🟢 )",
        status_failed_all: "( عذراً، لا يوجد اتصال بالبث حالياً ❌ )",
        status_failed_next: "( فشل الاتصال.. ننتقل للتالية ⏩ )",
        log_fast_switch: "تغيير سريع بين المحطات الفضائية للراديو.",
        direction: "rtl"
    },
    ku: {
        title: "ڕادیۆ", 
        cat_english: "ئینگلیزی",
        cat_arabic: "عەرەبی",
        cat_kurdish: "کوردی",
        play_btn: "لێدان ▶",
        stop_btn: "وەستاندنی ڕادیۆ 🔴",
        status_connecting: "( پەیوەندیکردن بە پەخشەوە... 🔄 )",
        status_reconnecting: "( دووبارە هەوڵدانەوە... 🔄 )", 
        status_refreshing: "( نوێکردنەوەی پەخش... ⏳ )",
        status_playing: "( ئێستا پەخش دەکرێت 🟢 )",
        status_failed_all: "( ببورە، پەخشی ڕادیۆ بەردەست نییە ❌ )",
        status_failed_next: "( پەیوەندی سەرکەوتوو نەبوو.. گواستنەوە بۆ داهاتوو ⏩ )",
        log_fast_switch: "گۆڕینی خێرا لە نێوان وێستگەکانی ڕادیۆ.",
        direction: "rtl"
    },
    en: {
        title: "Radio", 
        cat_english: "English",
        cat_arabic: "Arabic",
        cat_kurdish: "Kurdish",
        play_btn: "Play ▶",
        stop_btn: "Stop Radio 🔴",
        status_connecting: "( Connecting to stream... 🔄 )",
        status_reconnecting: "( Retrying connection... 🔄 )", 
        status_refreshing: "( Refreshing stream... ⏳ )",
        status_playing: "( Now Playing 🟢 )",
        status_failed_all: "( Sorry, stream unavailable ❌ )",
        status_failed_next: "( Connection failed.. skipping to next ⏩ )",
        log_fast_switch: "Fast switching between radio stations.",
        direction: "ltr"
    }
};

let currentAppLang = localStorage.getItem('app_lang') || document.documentElement.lang || 'ar';
if (!RADIO_TRANSLATIONS[currentAppLang]) currentAppLang = 'ar';

function t(key) { return RADIO_TRANSLATIONS[currentAppLang][key]; }

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
let stallTimeout = null; 

// متغيرات نظام المحاولة الذكية 
let currentChannelRetries = 0; 
let channelsTried = 0; 

let selectedCategory = localStorage.getItem('hub_radio_category') || 'kurdish';
let parsedIndex = parseInt(localStorage.getItem('hub_radio_channel_index'));
let currentChannelIndex = !isNaN(parsedIndex) ? parsedIndex : 0;
let savedVolume = localStorage.getItem('hub_radio_volume');
let radioVolume = (savedVolume !== null && !isNaN(parseFloat(savedVolume))) ? parseFloat(savedVolume) : 0.3;

if (!RADIO_STATIONS[selectedCategory] || !RADIO_STATIONS[selectedCategory][currentChannelIndex]) {
    selectedCategory = 'kurdish';
    currentChannelIndex = 0;
}

function injectRadioUI() {
    if (document.getElementById('radio-modal')) return;

    const style = document.createElement('style');
    style.innerHTML = `
        /* 🌟 زر فتح الراديو في الواجهة (مطابق للخطة) */
        .radio-hud-btn {
            height: 36px; width: 36px;
            background: linear-gradient(to bottom, #1b5e20 0%, #08210b 100%) !important; 
            border: 0.8px solid rgba(255, 215, 0, 0.6) !important;
            box-shadow: inset 0 2px 1px rgba(255, 255, 255, 0.3), inset 0 -4px 10px rgba(0, 0, 0, 0.8), 0 4px 10px rgba(0, 0, 0, 0.6) !important; 
            border-radius: 12px !important;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; padding: 0; outline: none;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .radio-hud-btn svg { transform: scale(1) !important; width: 24px; height: 24px; }
        .radio-hud-btn:hover { transform: scale(1.05); filter: brightness(1.1); }
        .radio-hud-btn.playing { 
            border-color: #ffd700 !important; 
            box-shadow: inset 0 2px 1px rgba(255, 255, 255, 0.3), inset 0 -4px 10px rgba(0, 0, 0, 0.8), 0 4px 15px rgba(255, 215, 0, 0.4) !important; 
        }
        
        .radio-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(8px);
            display: none; justify-content: center; align-items: center;
            z-index: 100000; font-family: 'Tajawal', sans-serif;
        }
        
        /* 🌟 نافذة الراديو المطابقة للمتجر 🌟 */
        .radio-modal-content {
            background: #0b120d; /* لون أخضر داكن عميق */
            padding: 25px; border-radius: 24px; text-align: center;
            color: white; width: 90%; max-width: 380px; 
            box-shadow: 0 15px 35px rgba(0,0,0,0.8), 0 0 15px rgba(255, 215, 0, 0.15);
            position: relative;
            border: 0.8px solid #ffd700;
        }
        .radio-header { display: flex; justify-content: center; align-items: center; margin-bottom: 25px; position: relative; }
        .radio-header h3 { margin: 0; font-size: 20px; font-weight: 700; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.8); }
        
        [dir="rtl"] .close-btn { left: 0; right: auto; }
        [dir="ltr"] .close-btn { right: 0; left: auto; }
        .close-btn { 
            position: absolute; top: 50%; transform: translateY(-50%);
            background: none; border: none; color: #a1a1aa; font-size: 20px; cursor: pointer; padding: 5px; transition: 0.3s;
        }
        .close-btn:hover { color: #ffd700; }
        
        .stations-list { display: flex; gap: 10px; margin-bottom: 25px; }
        .station-btn {
            flex: 1; padding: 12px 5px; 
            background: rgba(255, 255, 255, 0.02); color: #a1a1aa;
            border: 0.8px solid rgba(255, 215, 0, 0.3); border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 600;
            transition: all 0.3s ease; font-family: inherit;
        }
        .station-btn.active { 
            background: linear-gradient(to bottom, #1b5e20 0%, #08210b 100%); 
            color: #ffd700; border-color: #ffd700; 
            box-shadow: inset 0 2px 1px rgba(255, 255, 255, 0.3), inset 0 -4px 10px rgba(0, 0, 0, 0.8), 0 4px 10px rgba(0, 0, 0, 0.6); 
            font-weight: 700;
            text-shadow: 0 1px 3px rgba(0,0,0,0.9);
        }
        
        .visualizer-container { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 15px; }
        
        .nav-arrow-btn {
            background: linear-gradient(to bottom, #1b5e20 0%, #08210b 100%); 
            border: 0.8px solid rgba(255, 215, 0, 0.6); color: #ffd700;
            font-size: 16px; width: 38px; height: 38px; border-radius: 12px; cursor: pointer;
            display: flex; justify-content: center; align-items: center; transition: 0.2s ease; user-select: none;
            box-shadow: inset 0 2px 1px rgba(255, 255, 255, 0.3), inset 0 -4px 10px rgba(0, 0, 0, 0.8), 0 4px 10px rgba(0, 0, 0, 0.6);
        }
        .nav-arrow-btn:hover { transform: scale(1.05); filter: brightness(1.1); }
        [dir="ltr"] .nav-prev-icon { transform: scaleX(-1); }
        [dir="ltr"] .nav-next-icon { transform: scaleX(-1); }
        
        .visualizer-box {
            flex: 1; background: #060907; border-radius: 12px; height: 60px; display: flex;
            justify-content: center; align-items: center; gap: 3px; overflow: hidden;
            border: 0.8px solid rgba(255, 215, 0, 0.3);
            box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
        }
        .visualizer-box .bar {
            width: 3px; height: 10px; background: #4a3e1c; border-radius: 2px; transition: height 0.1s ease;
        }
        .visualizer-box.playing .bar { background: #ffd700; animation: equalizer 0.8s infinite alternate ease-in-out; }
        @keyframes equalizer { 0% { height: 10px; } 100% { height: 45px; } }
        
        .channel-info-box { margin-bottom: 25px; min-height: 55px; }
        .channel-name-text { font-size: 20px; font-weight: 700; color: #ffffff; display: block; margin-bottom: 6px; letter-spacing: 0.5px; }
        .radio-status-text { font-size: 13px; font-weight: 600; min-height: 18px; transition: 0.3s; text-shadow: 0 1px 3px rgba(0,0,0,0.8); }
        
        .radio-volume-container {
            display: flex; align-items: center; justify-content: center; gap: 12px;
            margin-bottom: 20px; background: #060907; padding: 10px 15px; border-radius: 12px;
            border: 0.8px solid rgba(255, 215, 0, 0.3);
            box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
        }
        .radio-volume-icon { font-size: 16px; color: #ffd700; user-select: none; }
        .radio-volume-slider {
            flex: 1; -webkit-appearance: none; appearance: none; height: 6px; border-radius: 3px;
            outline: none; cursor: pointer; background: #4a3e1c; direction: ltr;
        }
        .radio-volume-slider::-webkit-slider-thumb {
            -webkit-appearance: none; appearance: none; width: 16px; height: 16px;
            border-radius: 50%; background: #1b5e20; border: 1.5px solid #ffd700; cursor: pointer;
            box-shadow: 0 2px 6px rgba(0,0,0,0.6);
        }
        .radio-volume-slider::-moz-range-thumb {
            width: 12px; height: 12px; border-radius: 50%; background: #1b5e20;
            border: 1.5px solid #ffd700; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.6);
        }
        
        .radio-actions { display: flex; }
        .action-btn {
            flex: 1; padding: 14px 10px; border-radius: 16px; border: 0.8px solid transparent;
            cursor: pointer; font-size: 16px; font-weight: bold; display: flex; justify-content: center; 
            align-items: center; gap: 8px; font-family: inherit; transition: all 0.3s ease;
        }
        .play-btn { 
            background: linear-gradient(to bottom, #1b5e20 0%, #08210b 100%); 
            color: #ffd700; border-color: #ffd700; 
            box-shadow: inset 0 2px 1px rgba(255, 255, 255, 0.3), inset 0 -4px 10px rgba(0, 0, 0, 0.8), 0 4px 10px rgba(0, 0, 0, 0.6); 
            text-shadow: 0 1px 3px rgba(0,0,0,0.9);
        }
        .stop-btn { 
            background: linear-gradient(to bottom, #7f1d1d 0%, #450a0a 100%); 
            color: #ffb3b3; border-color: #ff453a; 
            box-shadow: inset 0 2px 1px rgba(255, 255, 255, 0.3), inset 0 -4px 10px rgba(0, 0, 0, 0.8), 0 4px 10px rgba(0, 0, 0, 0.6); 
            text-shadow: 0 1px 3px rgba(0,0,0,0.9);
        }
        .action-btn:active { transform: scale(0.97); }
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
    
    let existingToggleBtn = document.getElementById('music-toggle-btn');
    if (!existingToggleBtn) {
        const btnHTML = `<button id="music-toggle-btn" class="radio-hud-btn auto-radio-icon" onclick="openRadioModal()"></button>`;
        document.body.insertAdjacentHTML('beforeend', `<div style="position:fixed; top:30px; left:25px; z-index:20;">${btnHTML}</div>`);
    }
    
    const modalOverlay = document.getElementById('radio-modal');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === this) closeRadioModal();
        });
    }
    
    const sliderElement = document.getElementById('radio-volume-slider');
    if (sliderElement) {
        sliderElement.value = radioVolume;
        changeRadioVolume(radioVolume);
    }
    
    updateRadioButtonsUI();
}

function setRadioLanguage(langCode) {
    if (RADIO_TRANSLATIONS[langCode]) {
        currentAppLang = langCode;
        localStorage.setItem('app_lang', langCode);
        
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

function openRadioModal() { document.getElementById('radio-modal').style.display = 'flex'; }
function closeRadioModal() { document.getElementById('radio-modal').style.display = 'none'; }

function selectRadioCategory(category) {
    if (RADIO_STATIONS[category]) {
        selectedCategory = category;
        currentChannelIndex = 0; 
        currentChannelRetries = 0; 
        channelsTried = 0; 
        updateRadioButtonsUI();
        if (isMusicPlaying) triggerPlayRadio();
    }
}

function nextChannel(isAutoSkip = false) {
    const channels = RADIO_STATIONS[selectedCategory];
    currentChannelIndex = (currentChannelIndex + 1) % channels.length;
    
    if (!isAutoSkip) { currentChannelRetries = 0; channelsTried = 0; }
    
    updateRadioButtonsUI();
    if (isMusicPlaying) triggerPlayRadio();
}

function prevChannel() {
    const channels = RADIO_STATIONS[selectedCategory];
    currentChannelIndex = (currentChannelIndex - 1 + channels.length) % channels.length;
    currentChannelRetries = 0; 
    channelsTried = 0;
    updateRadioButtonsUI();
    if (isMusicPlaying) triggerPlayRadio();
}

function toggleRadioPlayState() {
    if (isMusicPlaying) {
        stopRadio();
    } else { 
        currentChannelRetries = 0; 
        channelsTried = 0; 
        triggerPlayRadio(); 
    }
}

function changeRadioVolume(value) {
    radioVolume = parseFloat(value);
    localStorage.setItem('hub_radio_volume', value);
    
    if (audioInstance) audioInstance.volume = radioVolume;
    
    const slider = document.getElementById('radio-volume-slider');
    if (slider) {
        const percentage = radioVolume * 100;
        slider.style.background = `linear-gradient(to right, #ffd700 ${percentage}%, #4a3e1c ${percentage}%)`;
    }
}

function updateRadioButtonsUI() {
    ['kurdish', 'arabic', 'english'].forEach(id => {
        const btn = document.getElementById('btn-station-' + id);
        if (btn) id === selectedCategory ? btn.classList.add('active') : btn.classList.remove('active');
    });

    const currentChannel = RADIO_STATIONS[selectedCategory][currentChannelIndex];
    const nameDisplay = document.getElementById('channel-display-name');
    if (nameDisplay && currentChannel) nameDisplay.innerText = currentChannel.name;

    const visualizer = document.getElementById('visualizer');
    const toggleBtn = document.getElementById('music-toggle-btn');
    const toggleActionBtn = document.getElementById('radio-toggle-action-btn');
    const statusText = document.getElementById('radio-status');
    
    const slider = document.getElementById('radio-volume-slider');
    if (slider) changeRadioVolume(radioVolume);
    
    if (isMusicPlaying) {
        if(toggleBtn) toggleBtn.classList.add('playing');
        if(visualizer && audioInstance && !audioInstance.paused && audioInstance.readyState >= 3) {
            visualizer.classList.add('playing');
            if (statusText && statusText.innerText !== t('status_reconnecting')) {
                statusText.innerText = t('status_playing');
            }
        } else if (visualizer) visualizer.classList.remove('playing');
        
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

function triggerPlayRadio(isRetry = false) {
    const currentChannel = RADIO_STATIONS[selectedCategory][currentChannelIndex];
    if (currentChannel && currentChannel.url) playRadio(currentChannel.url, selectedCategory, currentChannelIndex, isRetry);
}

function playRadio(url, category, index, isRetry = false) {
    const statusText = document.getElementById('radio-status');
    const toggleActionBtn = document.getElementById('radio-toggle-action-btn');
    const visualizer = document.getElementById('visualizer');

    if (statusText && !isRetry) {
        statusText.innerText = t('status_connecting');
        statusText.style.color = "#f5a623"; 
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
        if (isMusicPlaying && statusText && !isRetry) {
            statusText.innerText = t('status_refreshing');
            statusText.style.color = "#f5a623";
        }
        clearTimeout(stallTimeout);
        stallTimeout = setTimeout(() => {
            if (isMusicPlaying) handleConnectionFailure(statusText);
        }, 8000); 
    };

    audioInstance.onerror = () => {
        clearTimeout(stallTimeout);
        if (isMusicPlaying) handleConnectionFailure(statusText);
    };

    audioInstance.onplaying = () => {
        clearTimeout(stallTimeout);
        currentChannelRetries = 0; 
        channelsTried = 0; 
        
        if (statusText) {
            statusText.innerText = t('status_playing');
            statusText.style.color = "#ffd700";
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
            if (e.name === 'AbortError' || e.message.includes('interrupted')) console.log(t('log_fast_switch'));
            else { isMusicPlaying = true; handleConnectionFailure(statusText); }
        });
    }
}

function handleConnectionFailure(statusText) {
    currentChannelRetries++; 
    const maxChannels = RADIO_STATIONS[selectedCategory].length;

    if (currentChannelRetries < 3) {
        if (statusText) { 
            statusText.innerText = t('status_reconnecting'); 
            statusText.style.color = "#f5a623"; 
        }
        setTimeout(() => { if (isMusicPlaying) triggerPlayRadio(true); }, 1500);
    } else {
        currentChannelRetries = 0;
        channelsTried++;

        if (channelsTried >= maxChannels) {
             if (statusText) { 
                 statusText.innerText = t('status_failed_all'); 
                 statusText.style.color = "#ff453a"; 
             }
             stopRadio(); 
             channelsTried = 0; 
        } else {
             if (statusText) { 
                 statusText.innerText = t('status_failed_next'); 
                 statusText.style.color = "#ff453a"; 
             }
             setTimeout(() => { if (isMusicPlaying) nextChannel(true); }, 1500);
        }
    }
}

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
    renderRadioIcons(); 

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

const handleGameExitState = () => { if (audioInstance) audioInstance.pause(); };
window.addEventListener('beforeunload', handleGameExitState);
window.addEventListener('pagehide', handleGameExitState);

window.openRadioModal = openRadioModal;
window.closeRadioModal = closeRadioModal;
window.selectRadioCategory = selectRadioCategory;
window.nextChannel = nextChannel;
window.prevChannel = prevChannel;
window.toggleRadioPlayState = toggleRadioPlayState;
window.changeRadioVolume = changeRadioVolume;
window.setRadioLanguage = setRadioLanguage;
window.triggerPlayRadio = triggerPlayRadio;
window.stopRadio = stopRadio;
