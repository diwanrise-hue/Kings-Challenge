// ========================================== //
//  radio.js - النسخة النهائية المصححة والمطورة
// ========================================== //

// 1. هيكل البيانات للأصناف والقنوات
const RADIO_STATIONS = {
    kurdish: [
        { name: "Kurd floklore ", url: "https://stream.zeno.fm/gmdsp1mgs7zuv" },
        { name: "دينغي كوردسات (Dengi Kurdsat)", url: "https://stream.zeno.fm/e87fd7r29f8uv" }, 
        { name: "Kamal Mohammad", url: "https://stream.zeno.fm/rex374xgr2zuv" },
        { name: "كمال كولجين", url: "https://stream.zeno.fm/624egn8hpm0uv" },
        { name: "احمد خليل", url: "https://stream.zeno.fm/uw3bpcdkpm0uv" },
        { name: "سانا برزنجي", url: "https://stream.zeno.fm/hrguyt6hpm0uv" },
        { name: "بادينان (Badinan FM)", url: "https://stream-156.zeno.fm/x0xhw6c6g2zuv?zs=AfL9IRdsQ_qHIebZBo-9GA" }
    ],
    arabic: [
        { name: " نغم فيروز", url: "https://stream.zeno.fm/24ydgrmvpg8uv" },
        { name: " اغاني2", url: "https://stream.zeno.fm/17s3kijft2wtv" },
        { name: " اغاني  ", url: "https://stream.zeno.fm/bmccpngymc0vv" },
        { name: "ميلوديات", url: "https://stream.zeno.fm/3gkedytbapbuv" }
    ],
    english: [
        { name: " fm ", url: "https://stream.revma.ihrhls.com/zc185" },
        { name: "New York's", url: "https://stream.vovmedia.vn/vov247" }
    ]
};

let audioInstance = null;
let isMusicPlaying = false;
let failedAttempts = 0; 
let stallTimeout = null; 

// إدارة الحالة وإعدادات الصوت
let selectedCategory = localStorage.getItem('hub_radio_category') || 'kurdish';
let currentChannelIndex = parseInt(localStorage.getItem('hub_radio_channel_index')) || 0;
let radioVolume = localStorage.getItem('hub_radio_volume') !== null ? parseFloat(localStorage.getItem('hub_radio_volume')) : 0.3;

if (!RADIO_STATIONS[selectedCategory] || !RADIO_STATIONS[selectedCategory][currentChannelIndex]) {
    selectedCategory = 'kurdish';
    currentChannelIndex = 0;
}

// 2. حقن التصميم والواجهة
function injectRadioUI() {
    if (document.getElementById('radio-modal')) return;

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
        .radio-floating-btn.playing { border-color: #30d158; box-shadow: 0 0 15px rgba(48, 209, 88, 0.4); }

        /* خلفية النافذة */
        .radio-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.8); display: none; justify-content: center; align-items: center;
            z-index: 10000; direction: rtl; font-family: 'Tajawal', sans-serif;
        }

        /* صندوق النافذة الرئيسي */
        .radio-modal-content {
            background: #1c1c1e; padding: 25px; border-radius: 20px; text-align: center;
            color: white; width: 90%; max-width: 380px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);
            position: relative;
        }

        .radio-header { display: flex; justify-content: center; align-items: center; margin-bottom: 25px; position: relative; }
        .radio-header h3 { margin: 0; font-size: 20px; font-weight: 700; color: #fff; }
        .close-btn { 
            position: absolute; left: 0; top: 50%; transform: translateY(-50%);
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
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 15px;
        }

        /* أزرار الأسهم الجانبية للتنقل */
        .nav-arrow-btn {
            background: #2c2c2e;
            border: 1px solid #3a3a3c;
            color: #30d158;
            font-size: 18px;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: 0.2s ease;
            user-select: none;
        }
        .nav-arrow-btn:hover {
            background: #3a3a3c;
            box-shadow: 0 0 8px rgba(48, 209, 88, 0.4);
        }

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
        .channel-info-box {
            margin-bottom: 25px;
            min-height: 55px;
        }
        .channel-name-text {
            font-size: 20px;
            font-weight: 700;
            color: #ffffff;
            display: block;
            margin-bottom: 6px;
            letter-spacing: 0.5px;
        }
        .radio-status-text {
            font-size: 13px;
            font-weight: 600;
            min-height: 18px;
            transition: 0.3s;
        }

        /* حاوية شريط التحكم في الصوت المطور لتلوين ديناميكي */
        .radio-volume-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 20px;
            background: #2c2c2e;
            padding: 10px 15px;
            border-radius: 12px;
        }
        .radio-volume-icon {
            font-size: 16px;
            color: #30d158;
            user-select: none;
        }
        .radio-volume-slider {
            flex: 1;
            -webkit-appearance: none;
            appearance: none;
            height: 6px;
            border-radius: 3px;
            outline: none;
            cursor: pointer;
            background: #3a3a3c;
        }
        /* تصميم مقبض السحب ليتوافق مع الامتلاء */
        .radio-volume-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #ffffff;
            border: 2px solid #30d158;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        }
        .radio-volume-slider::-moz-range-thumb {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #ffffff;
            border: 2px solid #30d158;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        }

        /* زر التشغيل والإيقاف الموحد */
        .radio-actions { display: flex; }
        .action-btn {
            flex: 1; padding: 14px 10px; border: none; border-radius: 12px;
            cursor: pointer; font-size: 16px; font-weight: bold; display: flex; justify-content: center; align-items: center; gap: 8px; font-family: inherit;
            transition: background 0.3s, color 0.3s, box-shadow 0.3s;
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

    const uiHTML = `
        <button id="music-toggle-btn" class="radio-floating-btn" onclick="openRadioModal()">📻</button>

        <div id="radio-modal" class="radio-modal-overlay" dir="rtl">
            <div class="radio-modal-content">
                <div class="radio-header">
                    <button class="close-btn" onclick="closeRadioModal()">✕</button>
                    <h3>الراديو والموسيقى</h3>
                </div>
                
                <div class="stations-list">
                    <button id="btn-station-english" class="station-btn" onclick="selectRadioCategory('english')">الإنجليزية</button>
                    <button id="btn-station-arabic" class="station-btn" onclick="selectRadioCategory('arabic')">العربية</button>
                    <button id="btn-station-kurdish" class="station-btn active" onclick="selectRadioCategory('kurdish')">الكردية</button>
                </div>

                <div class="visualizer-container">
                    <button class="nav-arrow-btn" onclick="prevChannel()">❮</button>
                    <div id="visualizer" class="visualizer-box">
                        ${barsHTML}
                    </div>
                    <button class="nav-arrow-btn" onclick="nextChannel()">❯</button>
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
                    <button id="radio-toggle-action-btn" class="action-btn play-btn" onclick="toggleRadioPlayState()">تشغيل ▶</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', uiHTML);
    
    const sliderElement = document.getElementById('radio-volume-slider');
    if (sliderElement) {
        sliderElement.value = radioVolume;
        changeRadioVolume(radioVolume);
    }
    
    updateRadioButtonsUI();
}

// 3. دوال التحكم بالواجهة والتنقل
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

// تعديل اتجاه تعبئة الـ Gradient ليناسب الـ RTL بصرياً بشكل صحيح (to left)
function changeRadioVolume(value) {
    radioVolume = parseFloat(value);
    localStorage.setItem('hub_radio_volume', value);
    
    if (audioInstance) {
        audioInstance.volume = radioVolume;
    }
    
    const slider = document.getElementById('radio-volume-slider');
    if (slider) {
        const percentage = radioVolume * 100;
        slider.style.background = `linear-gradient(to left, #30d158 ${percentage}%, #3a3a3c ${percentage}%)`;
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
    const statusText = document.getElementById('radio-status');
    const toggleActionBtn = document.getElementById('radio-toggle-action-btn');
    
    if (isMusicPlaying) {
        if(visualizer) visualizer.classList.add('playing');
        if(toggleBtn) toggleBtn.classList.add('playing');
    } else {
        if(visualizer) visualizer.classList.remove('playing');
        if(toggleBtn) toggleBtn.classList.remove('playing');
        if (statusText) statusText.innerText = "";
        if (toggleActionBtn) {
            toggleActionBtn.innerText = "تشغيل ▶";
            toggleActionBtn.className = "action-btn play-btn";
        }
    }
}

// 4. دوال الصوت المطورة
function triggerPlayRadio() {
    const currentChannel = RADIO_STATIONS[selectedCategory][currentChannelIndex];
    if (currentChannel && currentChannel.url) {
        playRadio(currentChannel.url, selectedCategory, currentChannelIndex);
    }
}

function playRadio(url, category, index) {
    const statusText = document.getElementById('radio-status');
    const toggleActionBtn = document.getElementById('radio-toggle-action-btn');

    if (statusText) {
        statusText.innerText = "( جاري الاتصال بالبث... 🔄 )";
        statusText.style.color = "#ff9500"; 
    }

    // تفريغ الذاكرة وقطع الاتصال بالطريقة المعيارية الآمنة للمتصفحات (src = '')
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
    audioInstance.crossOrigin = "anonymous";
    audioInstance.preload = "none"; 
    audioInstance.volume = radioVolume;

    audioInstance.onwaiting = () => {
        if (isMusicPlaying && statusText) {
            statusText.innerText = "( جاري إنعاش البث... ⏳ )";
            statusText.style.color = "#ff9500";
        }
        
        clearTimeout(stallTimeout);
        stallTimeout = setTimeout(() => {
            if (isMusicPlaying) {
                handleConnectionFailure(statusText);
            }
        }, 4000);
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
            statusText.innerText = "( تعمل الآن 🟢 )";
            statusText.style.color = "#30d158";
        }
        if (toggleActionBtn) {
            toggleActionBtn.innerText = "إيقاف الراديو 🔴";
            toggleActionBtn.className = "action-btn stop-btn";
        }
    };

    const playPromise = audioInstance.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            isMusicPlaying = true;
            localStorage.setItem('hub_radio_url', url);
            localStorage.setItem('hub_radio_category', category);
            localStorage.setItem('hub_radio_channel_index', index.toString());
            localStorage.setItem('hub_music_enabled', 'true'); // حفظ الحالة كـ مفعل للعودة لاحقاً
            updateRadioButtonsUI();
        }).catch(e => {
            if (e.name === 'AbortError' || e.message.includes('interrupted')) {
                console.log("تغيير سريع بين المحطات الفضائية للراديو.");
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
             statusText.innerText = "( عذراً، لا يوجد اتصال بالبث حالياً ❌ )";
             statusText.style.color = "#ff453a";
         }
         stopRadio(); 
         failedAttempts = 0; 
    } else {
         if (statusText) {
             statusText.innerText = "( فشل الاتصال.. ننتقل للتالية ⏩ )";
             statusText.style.color = "#ff453a";
         }
         setTimeout(() => {
             if (isMusicPlaying) nextChannel();
         }, 1500);
    }
}

// 5. تهيئة وحفظ حالة الخروج
function stopRadio() {
    const statusText = document.getElementById('radio-status');
    if (statusText) statusText.innerText = ""; 

    clearTimeout(stallTimeout); 

    if (audioInstance) {
        audioInstance.pause();
        audioInstance.onwaiting = null;
        audioInstance.onplaying = null;
        audioInstance.onerror = null;
        audioInstance.src = ''; // تفريغ المسار
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
        
        // الآن ستعمل هذه الميزة بنجاح لأن التحديث لا يمسح الحالة المفعلة
        if (savedMusicState === 'true' && RADIO_STATIONS[savedCategory] && RADIO_STATIONS[savedCategory][savedIndex] && !isMusicPlaying) {
            selectedCategory = savedCategory;
            currentChannelIndex = savedIndex;
            triggerPlayRadio();
        }
        window.removeEventListener('click', handleFirstClick); 
    };

    window.addEventListener('click', handleFirstClick);
});

// عند مغادرة الصفحة نقوم بـ إيقاف البث الصوتي مؤقتاً لحماية المتصفح، دون تخريب بيانات الـ localStorage
const handleGameExitState = () => {
    if (audioInstance) {
        audioInstance.pause();
    }
};
window.addEventListener('beforeunload', handleGameExitState);
window.addEventListener('pagehide', handleGameExitState);

// تصدير الدوال للنطاق العالمي (Global Scope)
window.openRadioModal = openRadioModal;
window.closeRadioModal = closeRadioModal;
window.selectRadioCategory = selectRadioCategory;
window.nextChannel = nextChannel;
window.prevChannel = prevChannel;
window.toggleRadioPlayState = toggleRadioPlayState;
window.changeRadioVolume = changeRadioVolume;
