// chat.js
(function() {
    // المسار المباشر لملفات الدردشة على جيت هاب
    const BASE_CHAT_URL = "https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/dama/chat/";

    // 1. حقن التنسيقات (CSS) تلقائياً في صفحة الـ HTML
    const style = document.createElement('style');
    style.innerHTML = `
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* زر الدردشة - مخفي افتراضياً، ويظهر برمجياً في الأونلاين فقط */
        .game-chat-btn {
            display: none !important; 
            align-items: center;
            justify-content: center;
            background: rgba(45, 48, 55, 0.65) !important;
            border: 1px solid rgba(135, 206, 235, 0.4) !important;
            color: #ffffff;
            font-size: 20px;
            cursor: pointer;
            width: 44px !important;
            height: 44px !important;
            border-radius: 12px !important;
            transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1) !important;
            padding: 0 !important;
            box-shadow: 0 0 3px rgba(135, 206, 235, 0.3) !important;
            outline: none !important;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }

        .game-chat-btn:hover { 
            background: rgba(255, 255, 255, 0.15) !important; 
            transform: scale(0.96) !important;
            box-shadow: 0 0 8px rgba(135, 206, 235, 0.6) !important;
        }

        /* القائمة المنسدلة للدردشة */
        .chat-popup-window {
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%) translateY(20px);
            width: 95%; 
            max-width: 360px; 
            background-color: rgba(22, 22, 30, 0.95);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border-radius: 16px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.7);
            border: 1px solid rgba(135, 206, 235, 0.2);
            display: none;
            flex-direction: column;
            overflow: hidden;
            z-index: 10001;
            opacity: 0;
            transition: all 0.25s ease;
        }
        .chat-popup-window.open { 
            display: flex; 
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }

        .popup-top-bar {
            background: rgba(255, 255, 255, 0.05);
            padding: 8px 12px;
            color: #ffffff;
            font-size: 13px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .popup-top-bar button {
            background: none;
            border: none;
            color: #aaa;
            font-size: 16px;
            cursor: pointer;
            transition: color 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .popup-top-bar button:hover { color: #ff453a; }

        .popup-tabs {
            display: flex;
            flex-direction: row;
            background: rgba(0, 0, 0, 0.2);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .tab-btn {
            flex: 1;
            padding: 10px;
            background: none;
            border: none;
            color: #8888a0;
            font-size: 12px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }
        .tab-btn.active {
            color: #ffffff;
            background: rgba(255, 255, 255, 0.05);
            border-bottom: 2px solid #87ceeb;
        }

        .tab-content {
            display: none;
            padding: 10px; 
            min-height: auto; 
            justify-content: center;
            align-items: center;
        }
        .tab-content.active { display: flex; flex-direction: column; }

        .avatars-wrapper {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 8px;
            justify-content: center;
            align-items: center;
            width: 100%;
        }

        /* ---------------------------------------------------- */
        /* 💬 ستايلات فقاعة الحوار والأفاتارات العلوية (الجديدة) */
        /* ---------------------------------------------------- */
        
        .in-game-chat-bubble {
            position: absolute;
            background: #ffffff;
            color: #1a1a1a;
            padding: 8px 14px;
            border-radius: 16px;
            font-size: 13px;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(0,0,0,0.4);
            z-index: 10005;
            white-space: nowrap;
            pointer-events: none;
            animation: popBubble 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            top: 65px; /* تظهر أسفل صورة اللاعب بقليل */
            left: 50%;
            transform: translateX(-50%);
            border: 2px solid #e0e0e0;
        }

        /* ذيل الفقاعة */
        .in-game-chat-bubble::before {
            content: '';
            position: absolute;
            top: -8px;
            left: 50%;
            transform: translateX(-50%);
            border-width: 0 8px 8px 8px;
            border-style: solid;
            border-color: transparent transparent #ffffff transparent;
        }

        .in-game-avatar-popup {
            position: absolute;
            width: 100px;
            height: 100px;
            z-index: 10005;
            pointer-events: none;
            top: -20px; /* تظهر فوق صورة اللاعب مباشرة */
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            justify-content: center;
            align-items: center;
        }

        @keyframes popBubble {
            from { transform: translateX(-50%) scale(0.5); opacity: 0; }
            to { transform: translateX(-50%) scale(1); opacity: 1; }
        }

        /* ---------------------------------------------------- */

        .avatar-container {
            position: relative;
            overflow: visible;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .avatar-container:hover { transform: scale(1.05); }

        .avatars-wrapper .avatar-container {
            width: 75px; 
            height: 75px; 
        }

        .white-frame {
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 82%;
            height: 75%;
            background-color: #ffffff;
            border-radius: 20px 20px 0 0;
            z-index: 1;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        }
        
        .avatar-container img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            object-fit: contain;
            z-index: 2;
        }
        .avatar-container img.default-show { opacity: 1; }

        /* أنيميشن الأفاتار الأول (الزعيم) */
        .play .img-1 { animation: playImg1 2.5s forwards; }
        .play .img-2 { animation: playImg2 2.5s forwards; }
        .play .img-3 { animation: playImg3 2.5s forwards; }
        .play .img-4 { animation: playImg4 2.5s forwards; }

        @keyframes playImg1 { 0%, 8.33% { opacity: 1; } 8.34%, 100% { opacity: 0; } }
        @keyframes playImg2 { 0%, 8.33% { opacity: 0; } 8.34%, 16.66% { opacity: 1; } 16.67%, 100% { opacity: 0; } }
        @keyframes playImg3 { 0%, 16.66% { opacity: 0; } 16.67%, 25.00% { opacity: 1; } 25.01%, 33.32% { opacity: 0; } 33.33%, 41.66% { opacity: 1; } 41.67%, 49.99% { opacity: 0; } 50.00%, 58.33% { opacity: 1; } 58.34%, 66.65% { opacity: 0; } 66.66%, 75.00% { opacity: 1; } 75.01%, 83.32% { opacity: 0; } 83.33%, 91.66% { opacity: 1; } 91.67%, 100% { opacity: 0; } }
        @keyframes playImg4 { 0%, 24.99% { opacity: 0; } 25.00%, 33.33% { opacity: 1; } 33.34%, 41.65% { opacity: 0; } 41.66%, 50.00% { opacity: 1; } 50.01%, 58.32% { opacity: 0; } 58.33%, 66.67% { opacity: 1; } 66.68%, 74.99% { opacity: 0; } 75.00%, 83.33% { opacity: 1; } 83.34%, 91.65% { opacity: 0; } 91.66%, 100% { opacity: 1; } }

        /* أنيميشن التبديل لحجي سعيد */
        .play-oldman .old-img-1 { animation: oldManImg1 1.4s forwards; }
        .play-oldman .old-img-2 { animation: oldManImg2 1.4s forwards; }

        @keyframes oldManImg1 { 0%, 12.49% { opacity: 1; } 12.5%, 24.99% { opacity: 0; } 25%, 37.49% { opacity: 1; } 37.5%, 49.99% { opacity: 0; } 50%, 62.49% { opacity: 1; } 62.5%, 74.99% { opacity: 0; } 75%, 87.49% { opacity: 1; } 87.5%, 99.99% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes oldManImg2 { 0%, 12.49% { opacity: 0; } 12.5%, 24.99% { opacity: 1; } 25%, 37.49% { opacity: 0; } 37.5%, 49.99% { opacity: 1; } 50%, 62.49% { opacity: 0; } 62.5%, 74.99% { opacity: 1; } 75%, 87.49% { opacity: 0; } 87.5%, 99.99% { opacity: 1; } 100% { opacity: 0; } }

        /* أنيميشن حجي حزين */
        .play-sadman .sad-img-1 { animation: sadManImg1 2.5s forwards; }
        .play-sadman .sad-img-2 { animation: sadManImg2 2.5s forwards; }
        .play-sadman .sad-img-3 { animation: sadManImg3 2.5s forwards; }

        @keyframes sadManImg1 { 0%, 19.99% { opacity: 1; } 20%, 100% { opacity: 0; } }
        @keyframes sadManImg2 { 0%, 19.99% { opacity: 0; } 20%, 39.99% { opacity: 1; } 40%, 59.99% { opacity: 0; } 60%, 79.99% { opacity: 1; } 80%, 100% { opacity: 0; } }
        @keyframes sadManImg3 { 0%, 39.99% { opacity: 0; } 40%, 59.99% { opacity: 1; } 60%, 79.99% { opacity: 0; } 80%, 100% { opacity: 1; } }

        /* أنيميشن حجي مفكر */
        .play-thinkingman .think-img-1 { animation: thinkManImg1 1.2s forwards; }
        .play-thinkingman .think-img-2 { animation: thinkManImg2 1.2s forwards; }
        .play-thinkingman .think-img-3 { animation: thinkManImg3 1.2s forwards; }

        @keyframes thinkManImg1 { 0%, 14.28% { opacity: 1; } 14.29%, 57.14% { opacity: 0; } 57.15%, 71.42% { opacity: 1; } 71.43%, 100% { opacity: 0; } }
        @keyframes thinkManImg2 { 0%, 14.28% { opacity: 0; } 14.29%, 28.57% { opacity: 1; } 28.58%, 42.85% { opacity: 0; } 42.86%, 57.14% { opacity: 1; } 57.15%, 71.42% { opacity: 0; } 71.43%, 85.71% { opacity: 1; } 85.72%, 100% { opacity: 0; } }
        @keyframes thinkManImg3 { 0%, 28.57% { opacity: 0; } 28.58%, 42.85% { opacity: 1; } 42.86%, 85.71% { opacity: 0; } 85.72%, 100% { opacity: 1; } }

        /* أنيميشن حجي يضحك */
        .play-laughingman .laugh-img-1 { animation: laughManImg1 1.8s forwards; }
        .play-laughingman .laugh-img-2 { animation: laughManImg2 1.8s forwards; }

        @keyframes laughManImg1 { 0%, 9.99% { opacity: 1; } 10%, 19.99% { opacity: 0; } 20%, 29.99% { opacity: 1; } 30%, 39.99% { opacity: 0; } 40%, 49.99% { opacity: 1; } 50%, 59.99% { opacity: 0; } 60%, 69.99% { opacity: 1; } 70%, 79.99% { opacity: 0; } 80%, 89.99% { opacity: 1; } 90%, 100% { opacity: 0; } }
        @keyframes laughManImg2 { 0%, 9.99% { opacity: 0; } 10%, 19.99% { opacity: 1; } 20%, 29.99% { opacity: 0; } 30%, 39.99% { opacity: 1; } 40%, 49.99% { opacity: 0; } 50%, 59.99% { opacity: 1; } 60%, 69.99% { opacity: 0; } 70%, 79.99% { opacity: 1; } 80%, 89.99% { opacity: 0; } 90%, 100% { opacity: 1; } }

        /* أنيميشن حجي مندهش */
        .play-surprisedman .surprised-img-1 { animation: surprisedManImg1 2.5s forwards; }
        .play-surprisedman .surprised-img-2 { animation: surprisedManImg2 2.5s forwards; }
        .play-surprisedman .surprised-img-3 { animation: surprisedManImg3 1s forwards; }
        .play-surprisedman .surprised-img-4 { animation: surprisedManImg4 1s forwards; }

        @keyframes surprisedManImg1 { 0%, 14% { opacity: 1; } 14.01%, 100% { opacity: 0; } }
        @keyframes surprisedManImg2 { 0%, 14% { opacity: 0; } 14.01%, 28% { opacity: 1; } 28.01%, 100% { opacity: 0; } }
        @keyframes surprisedManImg3 { 0%, 28% { opacity: 0; } 28.01%, 42% { opacity: 1; } 42.01%, 56% { opacity: 0; } 56.01%, 70% { opacity: 1; } 70.01%, 84% { opacity: 0; } 84.01%, 100% { opacity: 1; } }
        @keyframes surprisedManImg4 { 0%, 42% { opacity: 0; } 42.01%, 56% { opacity: 1; } 56.01%, 70% { opacity: 0; } 70.01%, 84% { opacity: 1; } 84.01%, 100% { opacity: 0; } }

        /* أنيميشن حجي نعسان */
        .play-sleepyman .sleepy-img-1 { animation: sleepyManImg1 1.8s forwards; }
        .play-sleepyman .sleepy-img-2 { animation: sleepyManImg2 1.8s forwards; }

        @keyframes sleepyManImg1 { 0%, 20% { opacity: 1; } 20.01%, 40% { opacity: 0; } 40.01%, 60% { opacity: 1; } 60.01%, 80% { opacity: 0; } 80.01%, 100% { opacity: 1; } }
        @keyframes sleepyManImg2 { 0%, 20% { opacity: 0; } 20.01%, 40% { opacity: 1; } 40.01%, 60% { opacity: 0; } 60.01%, 80% { opacity: 1; } 80.01%, 100% { opacity: 0; } }

        /* الرسائل الفورية */
        .preset-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; width: 100%; max-height: 158px; overflow-y: auto; direction: rtl; padding: 2px; }
        .preset-btn { background: #ffffff; color: #1a1a1a; border: 1px solid #d1d1d1; padding: 6px 2px; border-radius: 6px; text-align: center; cursor: pointer; font-size: 11px; font-weight: bold; transition: all 0.2s ease; box-shadow: 0 2px 0 #cccccc, 0 3px 5px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; min-height: 38px; }
        .preset-btn:active { transform: translateY(2px); box-shadow: 0 0 0 #cccccc, 0 1px 2px rgba(0,0,0,0.1); }
        .preset-btn:hover { background: #f0f0f0; }
    `;
    document.head.appendChild(style);

    // 2. بناء عناصر التحكم المدمجة
    const chatBtn = document.createElement('button');
    chatBtn.id = 'gameChatBtn';
    chatBtn.className = 'game-chat-btn';
    chatBtn.title = 'الدردشة والتفاعل';
    chatBtn.innerHTML = '💬';

    const bottomPanel = document.getElementById('bottom-control-panel');
    if (bottomPanel) {
        const resignBtn = document.getElementById('resign-btn');
        if (resignBtn) {
            bottomPanel.insertBefore(chatBtn, resignBtn);
        } else {
            bottomPanel.appendChild(chatBtn);
        }
    } else {
        document.body.appendChild(chatBtn);
    }

    const container = document.createElement('div');
    container.innerHTML = `
        <div class="chat-popup-window" id="chatPopupWindow">
            <div class="popup-top-bar">
                <span>التفاعل السريع</span>
                <button id="closeChatBtn">✕</button>
            </div>
            <div class="popup-tabs">
                <button class="tab-btn" id="tabPresetBtn">💬 رسائل فورية</button>
                <button class="tab-btn active" id="tabAvatarBtn">🎭 الافتارات</button>
            </div>
            <div class="tab-content active" id="tabAvatarContent">
                <div class="avatars-wrapper">
                    <div class="avatar-container" data-avatar="oldman">
                        <div class="white-frame"></div>
                        <img class="old-img-1 default-show" src="${BASE_CHAT_URL}حجي/حجي سعيد1.webp?v=13">
                        <img class="old-img-2" src="${BASE_CHAT_URL}حجي/حجي سعيد2.webp?v=13">
                    </div>
                    <div class="avatar-container" data-avatar="sadhajji">
                        <div class="white-frame"></div>
                        <img class="sad-img-1 default-show" src="${BASE_CHAT_URL}حجي/حجي حزين1.webp?v=13">
                        <img class="sad-img-2" src="${BASE_CHAT_URL}حجي/حجي حزين2.webp?v=13">
                        <img class="sad-img-3" src="${BASE_CHAT_URL}حجي/حجي حزين3.webp?v=13">
                    </div>
                    <div class="avatar-container" data-avatar="thinkinghajji">
                        <div class="white-frame"></div>
                        <img class="think-img-1 default-show" src="${BASE_CHAT_URL}حجي/حجي_يفكر1.webp?v=13">
                        <img class="think-img-2" src="${BASE_CHAT_URL}حجي/حجي_يفكر2.webp?v=13">
                        <img class="think-img-3" src="${BASE_CHAT_URL}حجي/حجي_يفكر3.webp?v=13">
                    </div>
                    <div class="avatar-container" data-avatar="laughinghajji">
                        <div class="white-frame"></div>
                        <img class="laugh-img-1 default-show" src="${BASE_CHAT_URL}حجي/حجي_يضحك1.webp?v=13">
                        <img class="laugh-img-2" src="${BASE_CHAT_URL}حجي/حجي_يضحك2.webp?v=13">
                    </div>
                    <div class="avatar-container" data-avatar="surprisedhajji">
                        <div class="white-frame"></div>
                        <img class="surprised-img-1 default-show" src="${BASE_CHAT_URL}حجي/حجي_مندهش1.webp?v=13">
                        <img class="surprised-img-2" src="${BASE_CHAT_URL}حجي/حجي_مندهش2.webp?v=13">
                        <img class="surprised-img-3" src="${BASE_CHAT_URL}حجي/حجي_مندهش3.webp?v=13">
                        <img class="surprised-img-4" src="${BASE_CHAT_URL}حجي/حجي_مندهش4.webp?v=13">
                    </div>
                    <div class="avatar-container" data-avatar="sleepyhajji">
                        <div class="white-frame"></div>
                        <img class="sleepy-img-1 default-show" src="${BASE_CHAT_URL}حجي/حجي_نعسان1.webp?v=13">
                        <img class="sleepy-img-2" src="${BASE_CHAT_URL}حجي/حجي_نعسان2.webp?v=13">
                    </div>
                    <div class="avatar-container" data-avatar="boss">
                        <div class="white-frame"></div>
                        <img class="img-1 default-show" src="${BASE_CHAT_URL}boss1.png?v=13">
                        <img class="img-2" src="${BASE_CHAT_URL}boss2.png?v=13">
                        <img class="img-3" src="${BASE_CHAT_URL}boss3.png?v=13">
                        <img class="img-4" src="${BASE_CHAT_URL}boss4.png?v=13">
                    </div>
                </div>
            </div>
            <div class="tab-content" id="tabPresetContent">
                <div class="preset-list">
                    <button class="preset-btn" data-text="يا للخسارة!">يا للخسارة!</button>
                    <button class="preset-btn" data-text="أحسنت!">أحسنت!</button>
                    <button class="preset-btn" data-text="سلمت يداك">سلمت يداك</button>
                    <button class="preset-btn" data-text="انطلق!">انطلق!</button>
                    <button class="preset-btn" data-text="لا عليك">لا عليك</button>
                    <button class="preset-btn" data-text="ما هذا؟">ما هذا؟</button>
                    <button class="preset-btn" data-text="أعتذر">أعتذر</button>
                    <button class="preset-btn" data-text="طاب يومك">طاب يومك</button>
                    <button class="preset-btn" data-text="عجباً، ماذا يحدث!">عجباً، ماذا يحدث!</button>
                    <button class="preset-btn" data-text="مرحباً بك">مرحباً بك</button>
                    <button class="preset-btn" data-text="أداءٌ رائع!">أداءٌ رائع!</button>
                    <button class="preset-btn" data-text="أسرع لو سمحت">أسرع لو سمحت</button>
                    <button class="preset-btn" data-text="أحسنت صنعاً">أحسنت صنعاً</button>
                    <button class="preset-btn" data-text="لاعبٌ ماهر!">لاعبٌ ماهر!</button>
                    <button class="preset-btn" data-text="حركةٌ ذكية">حركةٌ ذكية</button>
                    <button class="preset-btn" data-text="الفوز حليفنا">الفوز حليفنا</button>
                    <button class="preset-btn" data-text="فوزٌ ساحق!">فوزٌ ساحق!</button>
                    <button class="preset-btn" data-text="مباركٌ لك!">مباركٌ لك!</button>
                    <button class="preset-btn" data-text="يا للروعة!">يا للروعة!</button>
                    <button class="preset-btn" data-text="أضحكتني!">أضحكتني!</button>
                    <button class="preset-btn" data-text="المعذرة!">المعذرة!</button>
                    <button class="preset-btn" data-text="لا بأس، لا عليك">لا بأس، لا عليك</button>
                    <button class="preset-btn" data-text="تدرّب جيداً">تدرّب جيداً</button>
                    <button class="preset-btn" data-text="لماذا!">لماذا!</button>
                </div>
            </div>
        </div>

        <!-- إضافة الملفات الصوتية مع بادئة chat_ لتجنب أي تضارب -->
        <audio id="chat_bossSound" src="${BASE_CHAT_URL}laugh.mp3"></audio>
        <audio id="chat_saeedSound" src="${BASE_CHAT_URL}حجي/ضحك_لايك.mp3"></audio>
        <audio id="chat_laughingHajjiSound" src="${BASE_CHAT_URL}حجي/حجي_يضحك.mp3"></audio>
        <audio id="chat_sadHajjiSound" src="${BASE_CHAT_URL}حجي/حجي_حزين.mp3"></audio>
        <audio id="chat_sleepyHajjiSound" src="${BASE_CHAT_URL}حجي/حجي_نعسان.mp3"></audio>
        <audio id="chat_thinkingHajjiSound" src="${BASE_CHAT_URL}حجي/حجي_يفكر.mp3"></audio>
        <audio id="chat_surprisedHajjiSound" src="${BASE_CHAT_URL}حجي/حجي_مندهش.mp3"></audio>
    `;
    document.body.appendChild(container);

    // 3. الأكواد البرمجية للوظائف (JavaScript Logic)
    let hideTimeouts = { me: null, opp: null };

    const windowPopup = document.getElementById('chatPopupWindow');
    const closeChatBtn = document.getElementById('closeChatBtn');
    const tabAvatarBtn = document.getElementById('tabAvatarBtn');
    const tabPresetBtn = document.getElementById('tabPresetBtn');
    const tabAvatarContent = document.getElementById('tabAvatarContent');
    const tabPresetContent = document.getElementById('tabPresetContent');

    function toggleChatWindow() {
        windowPopup.classList.toggle('open');
        if (windowPopup.classList.contains('open')) {
            switchTab('avatar');
        }
    }

    chatBtn.addEventListener('click', toggleChatWindow);
    closeChatBtn.addEventListener('click', toggleChatWindow);

    function switchTab(tabName) {
        if (tabName === 'avatar') {
            tabAvatarBtn.classList.add('active');
            tabPresetBtn.classList.remove('active');
            tabAvatarContent.classList.add('active');
            tabPresetContent.classList.remove('active');
        } else {
            tabPresetBtn.classList.add('active');
            tabAvatarBtn.classList.remove('active');
            tabPresetContent.classList.add('active');
            tabAvatarContent.classList.remove('active');
        }
    }

    tabAvatarBtn.addEventListener('click', () => switchTab('avatar'));
    tabPresetBtn.addEventListener('click', () => switchTab('preset'));

    // استماع لضغطات المستخدم للرسائل النصية
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.getAttribute('data-text');
            windowPopup.classList.remove('open');
            handleOutboundChat('text', text);
        });
    });

    // استماع لضغطات المستخدم للأفاتارات
    document.querySelectorAll('.avatar-container[data-avatar]').forEach(el => {
        el.addEventListener('click', () => {
            const avatarId = el.getAttribute('data-avatar');
            windowPopup.classList.remove('open');
            handleOutboundChat('avatar', avatarId);
        });
    });

    // دالة الإرسال للسيرفر وعرضها محلياً
    function handleOutboundChat(type, value) {
        // العرض عند اللاعب نفسه أولاً
        window.playInGameChat('me', type, value);
        
        // إرسالها للسيرفر (عن طريق socketManager إذا كان متصلاً)
        if (window.socketManager && typeof window.socketManager.sendChatData === 'function') {
            window.socketManager.sendChatData(type, value);
        }
    }

    // 💡 الدالة الشاملة لعرض الدردشة والأفاتارات (متاحة للـ socketManager أيضاً)
    window.playInGameChat = function(sender, type, value) {
        // تحديد مكان العرض (أنت أم الخصم) بناءً على حاوية الصور في الأعلى
        const targetElementId = sender === 'me' ? 'card-my-avatar' : 'card-opp-avatar';
        const targetElement = document.getElementById(targetElementId);
        
        if (!targetElement) return;

        // تجهيز حاوية البروفايل لتكون Position Relative لكي تظهر الفقاعة والأفاتار فوقها
        if (getComputedStyle(targetElement.parentElement).position === 'static') {
            targetElement.parentElement.style.position = 'relative';
        }

        if (type === 'text') {
            // تنظيف أي رسالة سابقة لنفس اللاعب
            const oldBubble = targetElement.parentElement.querySelector('.in-game-chat-bubble');
            if (oldBubble) oldBubble.remove();

            const bubble = document.createElement('div');
            bubble.className = 'in-game-chat-bubble';
            bubble.textContent = value;
            targetElement.parentElement.appendChild(bubble);

            setTimeout(() => {
                if (bubble.parentElement) bubble.remove();
            }, 3000);

        } else if (type === 'avatar') {
            // تنظيف أي أفاتار سابق
            const oldAvatar = targetElement.parentElement.querySelector('.in-game-avatar-popup');
            if (oldAvatar) oldAvatar.remove();
            if (hideTimeouts[sender]) clearTimeout(hideTimeouts[sender]);

            const avatarBox = document.createElement('div');
            avatarBox.className = 'in-game-avatar-popup avatar-container';
            
            let htmlContent = '';
            let audioId = '';
            let animClass = '';

            switch(value) {
                case 'boss':
                    htmlContent = `<div class="white-frame"></div><img class="img-1 default-show" src="${BASE_CHAT_URL}boss1.png?v=13"><img class="img-2" src="${BASE_CHAT_URL}boss2.png?v=13"><img class="img-3" src="${BASE_CHAT_URL}boss3.png?v=13"><img class="img-4" src="${BASE_CHAT_URL}boss4.png?v=13">`;
                    audioId = 'chat_bossSound'; animClass = 'play';
                    break;
                case 'oldman':
                    htmlContent = `<div class="white-frame"></div><img class="old-img-1 default-show" src="${BASE_CHAT_URL}حجي/حجي سعيد1.webp?v=13"><img class="old-img-2" src="${BASE_CHAT_URL}حجي/حجي سعيد2.webp?v=13">`;
                    audioId = 'chat_saeedSound'; animClass = 'play-oldman';
                    break;
                case 'sadhajji':
                    htmlContent = `<div class="white-frame"></div><img class="sad-img-1 default-show" src="${BASE_CHAT_URL}حجي/حجي حزين1.webp?v=13"><img class="sad-img-2" src="${BASE_CHAT_URL}حجي/حجي حزين2.webp?v=13"><img class="sad-img-3" src="${BASE_CHAT_URL}حجي/حجي حزين3.webp?v=13">`;
                    audioId = 'chat_sadHajjiSound'; animClass = 'play-sadman';
                    break;
                case 'thinkinghajji':
                    htmlContent = `<div class="white-frame"></div><img class="think-img-1 default-show" src="${BASE_CHAT_URL}حجي/حجي_يفكر1.webp?v=13"><img class="think-img-2" src="${BASE_CHAT_URL}حجي/حجي_يفكر2.webp?v=13"><img class="think-img-3" src="${BASE_CHAT_URL}حجي/حجي_يفكر3.webp?v=13">`;
                    audioId = 'chat_thinkingHajjiSound'; animClass = 'play-thinkingman';
                    break;
                case 'laughinghajji':
                    htmlContent = `<div class="white-frame"></div><img class="laugh-img-1 default-show" src="${BASE_CHAT_URL}حجي/حجي_يضحك1.webp?v=13"><img class="laugh-img-2" src="${BASE_CHAT_URL}حجي/حجي_يضحك2.webp?v=13">`;
                    audioId = 'chat_laughingHajjiSound'; animClass = 'play-laughingman';
                    break;
                case 'surprisedhajji':
                    htmlContent = `<div class="white-frame"></div><img class="surprised-img-1 default-show" src="${BASE_CHAT_URL}حجي/حجي_مندهش1.webp?v=13"><img class="surprised-img-2" src="${BASE_CHAT_URL}حجي/حجي_مندهش2.webp?v=13"><img class="surprised-img-3" src="${BASE_CHAT_URL}حجي/حجي_مندهش3.webp?v=13"><img class="surprised-img-4" src="${BASE_CHAT_URL}حجي/حجي_مندهش4.webp?v=13">`;
                    audioId = 'chat_surprisedHajjiSound'; animClass = 'play-surprisedman';
                    break;
                case 'sleepyhajji':
                    htmlContent = `<div class="white-frame"></div><img class="sleepy-img-1 default-show" src="${BASE_CHAT_URL}حجي/حجي_نعسان1.webp?v=13"><img class="sleepy-img-2" src="${BASE_CHAT_URL}حجي/حجي_نعسان2.webp?v=13">`;
                    audioId = 'chat_sleepyHajjiSound'; animClass = 'play-sleepyman';
                    break;
            }

            avatarBox.innerHTML = htmlContent;
            avatarBox.classList.add(animClass);
            
            // إخفاء الصورة الافتراضية أثناء الأنيميشن
            const img1 = avatarBox.querySelector('img.default-show');
            if (img1) img1.classList.remove('default-show');

            targetElement.parentElement.appendChild(avatarBox);

            // تشغيل الصوت
            const audioEl = document.getElementById(audioId);
            if (audioEl) {
                audioEl.currentTime = 0;
                audioEl.play().catch(e => console.log('Audio play error:', e));
            }

            hideTimeouts[sender] = setTimeout(() => {
                if (avatarBox.parentElement) avatarBox.remove();
            }, 2500);
        }
    };

})();
