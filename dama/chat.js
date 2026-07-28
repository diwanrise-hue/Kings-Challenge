// chat.js
(function() {
    // المسار المباشر لملفات الدردشة على جيت هاب
    const BASE_CHAT_URL = "https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/dama/chat/";

    // 1. حقن التنسيقات (CSS) تلقائياً في صفحة الـ HTML
    const style = document.createElement('style');
    style.innerHTML = `
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* زر الدردشة - ظاهر دائماً في وضع الأونلاين والأوفلاين */
        .game-chat-btn {
            display: flex !important;
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

        .chat-popup-window {
            position: fixed;
            bottom: 85px;
            left: 15px;
            width: 90%;
            max-width: 320px;
            background-color: rgba(22, 22, 30, 0.95);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border-radius: 18px;
            box-shadow: 0 10px 35px rgba(0, 0, 0, 0.7);
            border: 1px solid rgba(135, 206, 235, 0.2);
            display: none;
            flex-direction: column;
            overflow: hidden;
            z-index: 10001;
            animation: slideUp 0.25s ease;
        }
        .chat-popup-window.open { display: flex; }
        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        .popup-top-bar {
            background: rgba(255, 255, 255, 0.05);
            padding: 10px 15px;
            color: #ffffff;
            font-size: 14px;
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
            padding: 12px;
            background: none;
            border: none;
            color: #8888a0;
            font-size: 13px;
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
            padding: 20px 15px;
            min-height: 220px;
            justify-content: center;
            align-items: center;
        }
        .tab-content.active { display: flex; flex-direction: column; }

        .avatars-wrapper {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: center;
            align-items: center;
            width: 100%;
        }

        .avatar-container {
            position: relative;
            overflow: visible;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .avatar-container:hover { transform: scale(1.05); }

        .avatars-wrapper .avatar-container {
            width: 65px;
            height: 65px;
        }

        .floating-avatar-display .avatar-container {
            width: 150px;
            height: 150px;
        }
        
        .white-frame {
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 82%;
            height: 75%;
            background-color: #ffffff;
            border-radius: 30px 30px 0 0;
            z-index: 1;
            box-shadow: 0 5px 15px rgba(0,0,0,0.5);
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

        .floating-avatar-display {
            position: fixed;
            bottom: 95px;
            left: 20px;
            z-index: 10002;
            display: none;
            pointer-events: none;
        }
        .floating-avatar-display.show {
            display: flex;
            animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes popIn {
            from { transform: scale(0.5); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }

        .game-toast {
            position: fixed;
            bottom: 95px;
            left: 50%;
            transform: translateX(-50%) translateY(20px);
            background: rgba(46, 204, 113, 0.95);
            color: #ffffff;
            padding: 10px 22px;
            border-radius: 20px;
            border: 1px solid rgba(255,255,255,0.2);
            box-shadow: 0 5px 25px rgba(0, 0, 0, 0.5);
            font-size: 14px;
            font-weight: bold;
            z-index: 10005;
            opacity: 0;
            transition: all 0.3s ease;
            pointer-events: none;
            display: flex;
            align-items: center;
            gap: 8px;
            text-align: center;
            max-width: 90%;
        }
        .game-toast.show {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }

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
        .play-oldman .old-img-1 { animation: oldManImg1 1.2s forwards; }
        .play-oldman .old-img-2 { animation: oldManImg2 1.2s forwards; }

        @keyframes oldManImg1 {
            0%, 12.49% { opacity: 1; }
            12.5%, 24.99% { opacity: 0; }
            25%, 37.49% { opacity: 1; }
            37.5%, 49.99% { opacity: 0; }
            50%, 62.49% { opacity: 1; }
            62.5%, 74.99% { opacity: 0; }
            75%, 87.49% { opacity: 1; }
            87.5%, 99.99% { opacity: 0; }
            100% { opacity: 1; }
        }
        @keyframes oldManImg2 {
            0%, 12.49% { opacity: 0; }
            12.5%, 24.99% { opacity: 1; }
            25%, 37.49% { opacity: 0; }
            37.5%, 49.99% { opacity: 1; }
            50%, 62.49% { opacity: 0; }
            62.5%, 74.99% { opacity: 1; }
            75%, 87.49% { opacity: 0; }
            87.5%, 99.99% { opacity: 1; }
            100% { opacity: 0; }
        }

        /* أنيميشن حجي حزين */
        .play-sadman .sad-img-1 { animation: sadManImg1 2.5s forwards; }
        .play-sadman .sad-img-2 { animation: sadManImg2 2.5s forwards; }
        .play-sadman .sad-img-3 { animation: sadManImg3 2.5s forwards; }

        @keyframes sadManImg1 {
            0%, 11.11% { opacity: 1; }
            11.12%, 33.32% { opacity: 0; }
            33.33%, 44.43% { opacity: 1; }
            44.44%, 66.65% { opacity: 0; }
            66.66%, 77.76% { opacity: 1; }
            77.77%, 99.99% { opacity: 0; }
            100% { opacity: 1; }
        }
        @keyframes sadManImg2 {
            0%, 11.11% { opacity: 0; }
            11.12%, 22.22% { opacity: 1; }
            22.23%, 44.43% { opacity: 0; }
            44.44%, 55.55% { opacity: 1; }
            55.56%, 77.76% { opacity: 0; }
            77.77%, 88.88% { opacity: 1; }
            88.89%, 100% { opacity: 0; }
        }
        @keyframes sadManImg3 {
            0%, 22.22% { opacity: 0; }
            22.23%, 33.32% { opacity: 1; }
            33.33%, 55.55% { opacity: 0; }
            55.56%, 66.65% { opacity: 1; }
            66.66%, 88.88% { opacity: 0; }
            88.89%, 99.99% { opacity: 1; }
            100% { opacity: 0; }
        }

        /* 💡 تنسيق الرسائل السريعة لتصبح شبكة (Grid) بـ 3 أعمدة مثل الصورة المرفقة */
        .preset-list {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            width: 100%;
            max-height: 220px;
            overflow-y: auto;
            direction: rtl; /* اتجاه الكتابة من اليمين لليسار */
            padding: 5px;
        }
        
        /* 💡 تنسيق الزر ليكون بخلفية بيضاء وخط أسود بارز مثل الصورة */
        .preset-btn {
            background: #ffffff;
            color: #1a1a1a;
            border: 1px solid #d1d1d1;
            padding: 10px 4px;
            border-radius: 8px;
            text-align: center;
            cursor: pointer;
            font-size: 13px;
            font-weight: bold;
            transition: all 0.2s ease;
            box-shadow: 0 3px 0 #cccccc, 0 4px 6px rgba(0,0,0,0.2); /* تأثير زر 3D خفيف */
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 45px;
        }
        .preset-btn:active {
            transform: translateY(3px);
            box-shadow: 0 0 0 #cccccc, 0 1px 2px rgba(0,0,0,0.2);
        }
        .preset-btn:hover { 
            background: #f0f0f0; 
        }
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
                    
                    <div class="avatar-container" id="avatarOldManTrigger">
                        <div class="white-frame"></div>
                        <img class="old-img-1 default-show" src="${BASE_CHAT_URL}حجي/حجي سعيد1.web" alt="حجي سعيد 1" style="opacity: 1;">
                        <img class="old-img-2" src="${BASE_CHAT_URL}حجي/حجي سعيد2.web" alt="حجي سعيد 2">
                    </div>
                    
                    <div class="avatar-container" id="avatarSadHajjiTrigger">
                        <div class="white-frame"></div>
                        <img class="sad-img-1 default-show" src="${BASE_CHAT_URL}حجي/حجي حزين1.web" alt="حجي حزين 1" style="opacity: 1;">
                        <img class="sad-img-2" src="${BASE_CHAT_URL}حجي/حجي حزين2.web" alt="حجي حزين 2">
                        <img class="sad-img-3" src="${BASE_CHAT_URL}حجي/حجي حزين3.web" alt="حجي حزين 3">
                    </div>

                    <div class="avatar-container" id="avatarContainerTrigger">
                        <div class="white-frame"></div>
                        <img class="img-1 default-show" src="${BASE_CHAT_URL}boss1.web" alt="boss 1">
                        <img class="img-2" src="${BASE_CHAT_URL}boss2.web" alt="boss 2">
                        <img class="img-3" src="${BASE_CHAT_URL}boss3.web" alt="boss 3">
                        <img class="img-4" src="${BASE_CHAT_URL}boss4.web" alt="boss 4">
                    </div>

                </div>
            </div>

            <div class="tab-content" id="tabPresetContent">
                <div class="preset-list">
                    <button class="preset-btn" data-text="انضربنا بوري!">انضربنا بوري!</button>
                    <button class="preset-btn" data-text="عفية">عفية</button>
                    <button class="preset-btn" data-text="عاشت ايدك">عاشت ايدك</button>
                    
                    <button class="preset-btn" data-text="دوس خالي">دوس خالي</button>
                    <button class="preset-btn" data-text="فداك">فداك</button>
                    <button class="preset-btn" data-text="هاي شنو؟">هاي شنو؟</button>
                    
                    <button class="preset-btn" data-text="آسف">آسف</button>
                    <button class="preset-btn" data-text="الله بالخير">الله بالخير</button>
                    <button class="preset-btn" data-text="يمعود شسالفة!">يمعود شسالفة!</button>
                </div>
            </div>
        </div>

        <div class="floating-avatar-display" id="floatingAvatarDisplay">
            <div class="avatar-container" id="floatingAvatarBox">
                </div>
        </div>

        <div class="game-toast" id="gameToast"></div>

        <audio id="bossSound" src="${BASE_CHAT_URL}laugh.mp3"></audio>
    `;
    document.body.appendChild(container);

    // 3. الأكواد البرمجية للوظائف (JavaScript Logic)
    let hideTimeout;
    let toastTimeout;

    const windowPopup = document.getElementById('chatPopupWindow');
    const closeChatBtn = document.getElementById('closeChatBtn');
    const tabAvatarBtn = document.getElementById('tabAvatarBtn');
    const tabPresetBtn = document.getElementById('tabPresetBtn');
    const tabAvatarContent = document.getElementById('tabAvatarContent');
    const tabPresetContent = document.getElementById('tabPresetContent');
    
    const avatarContainerTrigger = document.getElementById('avatarContainerTrigger');
    const avatarOldManTrigger = document.getElementById('avatarOldManTrigger');
    const avatarSadHajjiTrigger = document.getElementById('avatarSadHajjiTrigger');

    const gameToast = document.getElementById('gameToast');
    const bossSound = document.getElementById('bossSound');
    const floatingAvatarDisplay = document.getElementById('floatingAvatarDisplay');
    const floatingAvatarBox = document.getElementById('floatingAvatarBox');

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

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.getAttribute('data-text');
            selectPreset(text);
        });
    });

    function selectPreset(text) {
        windowPopup.classList.remove('open');
        gameToast.textContent = text;
        gameToast.classList.add('show');

        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            gameToast.classList.remove('show');
        }, 2500);
    }

    avatarContainerTrigger.addEventListener('click', () => triggerFloatingAvatar('boss'));
    avatarOldManTrigger.addEventListener('click', () => triggerFloatingAvatar('oldman'));
    avatarSadHajjiTrigger.addEventListener('click', () => triggerFloatingAvatar('sadhajji'));

    function triggerFloatingAvatar(avatarType = 'boss') {
        windowPopup.classList.remove('open');

        if (hideTimeout) clearTimeout(hideTimeout);

        floatingAvatarDisplay.classList.remove('show');
        void floatingAvatarDisplay.offsetWidth; // Force reflow

        if (avatarType === 'boss') {
            floatingAvatarBox.innerHTML = `
                <div class="white-frame"></div>
                <img class="img-1 default-show" src="${BASE_CHAT_URL}boss1.web" alt="boss 1">
                <img class="img-2" src="${BASE_CHAT_URL}boss2.web" alt="boss 2">
                <img class="img-3" src="${BASE_CHAT_URL}boss3.web" alt="boss 3">
                <img class="img-4" src="${BASE_CHAT_URL}boss4.web" alt="boss 4">
            `;

            floatingAvatarDisplay.classList.add('show');

            const img1 = floatingAvatarBox.querySelector('.img-1');
            if (img1) img1.classList.remove('default-show');

            if (bossSound) {
                bossSound.currentTime = 0;
                bossSound.play().catch(error => {
                    console.log("تعذر تشغيل الصوت تلقائياً:", error);
                });
            }

            floatingAvatarBox.className = 'avatar-container play';
            
            hideTimeout = setTimeout(() => {
                floatingAvatarDisplay.classList.remove('show');
                floatingAvatarBox.classList.remove('play');
                if (img1) img1.classList.add('default-show');
            }, 2500);

        } else if (avatarType === 'oldman') {
            floatingAvatarBox.innerHTML = `
                <div class="white-frame"></div>
                <img class="old-img-1 default-show" src="${BASE_CHAT_URL}حجي/حجي سعيد1.web" alt="حجي سعيد 1">
                <img class="old-img-2" src="${BASE_CHAT_URL}حجي/حجي سعيد2.web" alt="حجي سعيد 2">
            `;

            floatingAvatarDisplay.classList.add('show');
            
            const img1 = floatingAvatarBox.querySelector('.old-img-1');
            if (img1) img1.classList.remove('default-show');

            floatingAvatarBox.className = 'avatar-container play-oldman';

            hideTimeout = setTimeout(() => {
                floatingAvatarDisplay.classList.remove('show');
                floatingAvatarBox.classList.remove('play-oldman');
                if (img1) img1.classList.add('default-show');
            }, 2500);

        } else if (avatarType === 'sadhajji') {
            floatingAvatarBox.innerHTML = `
                <div class="white-frame"></div>
                <img class="sad-img-1 default-show" src="${BASE_CHAT_URL}حجي/حجي حزين1.web" alt="حجي حزين 1">
                <img class="sad-img-2" src="${BASE_CHAT_URL}حجي/حجي حزين2.web" alt="حجي حزين 2">
                <img class="sad-img-3" src="${BASE_CHAT_URL}حجي/حجي حزين3.web" alt="حجي حزين 3">
            `;

            floatingAvatarDisplay.classList.add('show');
            
            const img1 = floatingAvatarBox.querySelector('.sad-img-1');
            if (img1) img1.classList.remove('default-show');

            floatingAvatarBox.className = 'avatar-container play-sadman';

            hideTimeout = setTimeout(() => {
                floatingAvatarDisplay.classList.remove('show');
                floatingAvatarBox.classList.remove('play-sadman');
                if (img1) img1.classList.add('default-show');
            }, 2500);
        }
    }
})();
