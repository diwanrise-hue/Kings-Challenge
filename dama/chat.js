// chat.js
(function() {
    // 1. حقن التنسيقات (CSS) تلقائياً في صفحة الـ HTML
    const style = document.createElement('style');
    style.innerHTML = `
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* 💡 إخفاء زر الدردشة بشكل افتراضي */
        .game-chat-btn {
            display: none; 
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: none;
            border: none;
            outline: none;
            color: #ffffff;
            font-size: 28px;
            cursor: pointer;
            z-index: 999;
            padding: 5px;
            transition: transform 0.2s ease, opacity 0.2s ease;
            text-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
        }
        .game-chat-btn:active { transform: scale(0.85); }
        .game-chat-btn:hover { opacity: 0.8; }

        /* 💡 إظهار زر الدردشة فقط عندما تكون اللعبة في وضع الأونلاين */
        body.online-mode-active .game-chat-btn {
            display: block;
        }

        /* 💡 إغلاق نافذة الدردشة فوراً إذا خرج اللاعب من وضع الأونلاين */
        body:not(.online-mode-active) .chat-popup-window {
            display: none !important;
        }

        .chat-popup-window {
            position: fixed;
            bottom: 75px;
            left: 20px;
            width: 90%;
            max-width: 340px;
            background-color: #16161e;
            border-radius: 18px;
            box-shadow: 0 10px 35px rgba(0, 0, 0, 0.7);
            border: 1px solid #2a2a3c;
            display: none;
            flex-direction: column;
            overflow: hidden;
            z-index: 1000;
            animation: slideUp 0.25s ease;
        }
        .chat-popup-window.open { display: flex; }
        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        .popup-top-bar {
            background: #1f1f2e;
            padding: 10px 15px;
            color: #ffffff;
            font-size: 14px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #2a2a3c;
        }
        .popup-top-bar button {
            background: none;
            border: none;
            color: #aaa;
            font-size: 16px;
            cursor: pointer;
        }
        .popup-top-bar button:hover { color: #fff; }

        .popup-tabs {
            display: flex;
            flex-direction: row;
            background: #1a1a26;
            border-bottom: 1px solid #2a2a3c;
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
            background: #252538;
            border-bottom: 2px solid #2563eb;
        }

        .tab-content {
            display: none;
            padding: 20px 15px;
            min-height: 220px;
            justify-content: center;
            align-items: center;
        }
        .tab-content.active { display: flex; flex-direction: column; }

        .avatar-container {
            position: relative;
            width: 170px;
            height: 170px;
            overflow: visible;
            cursor: pointer;
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
            bottom: 80px;
            left: 30px;
            z-index: 2000;
            display: none;
            pointer-events: none;
        }
        .floating-avatar-display.show {
            display: flex;
            animation: popIn 0.3s ease;
        }
        @keyframes popIn {
            from { transform: scale(0.5); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }

        .game-toast {
            position: fixed;
            bottom: 85px;
            left: 50%;
            transform: translateX(-50%) translateY(20px);
            background: rgba(15, 15, 20, 0.85);
            color: #ffffff;
            padding: 10px 22px;
            border-radius: 20px;
            border: none;
            box-shadow: 0 5px 25px rgba(0, 0, 0, 0.9), 0 0 10px rgba(0, 0, 0, 0.5);
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.9);
            font-size: 14px;
            font-weight: bold;
            z-index: 3000;
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

        .play .img-1 { animation: playImg1 2.5s forwards; }
        .play .img-2 { animation: playImg2 2.5s forwards; }
        .play .img-3 { animation: playImg3 2.5s forwards; }
        .play .img-4 { animation: playImg4 2.5s forwards; }

        @keyframes playImg1 { 0%, 8.33% { opacity: 1; } 8.34%, 100% { opacity: 0; } }
        @keyframes playImg2 { 0%, 8.33% { opacity: 0; } 8.34%, 16.66% { opacity: 1; } 16.67%, 100% { opacity: 0; } }
        @keyframes playImg3 { 0%, 16.66% { opacity: 0; } 16.67%, 25.00% { opacity: 1; } 25.01%, 33.32% { opacity: 0; } 33.33%, 41.66% { opacity: 1; } 41.67%, 49.99% { opacity: 0; } 50.00%, 58.33% { opacity: 1; } 58.34%, 66.65% { opacity: 0; } 66.66%, 75.00% { opacity: 1; } 75.01%, 83.32% { opacity: 0; } 83.33%, 91.66% { opacity: 1; } 91.67%, 100% { opacity: 0; } }
        @keyframes playImg4 { 0%, 24.99% { opacity: 0; } 25.00%, 33.33% { opacity: 1; } 33.34%, 41.65% { opacity: 0; } 41.66%, 50.00% { opacity: 1; } 50.01%, 58.32% { opacity: 0; } 58.33%, 66.67% { opacity: 1; } 66.68%, 74.99% { opacity: 0; } 75.00%, 83.33% { opacity: 1; } 83.34%, 91.65% { opacity: 0; } 91.66%, 100% { opacity: 1; } }

        .preset-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            width: 100%;
            max-height: 220px;
            overflow-y: auto;
        }
        .preset-btn {
            background: #252538;
            color: #e2e8f0;
            border: 1px solid #3a3a52;
            padding: 10px 12px;
            border-radius: 8px;
            text-align: right;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.2s ease;
        }
        .preset-btn:hover { background: #2563eb; color: #ffffff; border-color: #2563eb; }
    `;
    document.head.appendChild(style);

    // 2. حقن هيكل عناصر الـ HTML تلقائياً في جسم الصفحة (body)
    const container = document.createElement('div');
    container.innerHTML = `
        <button class="game-chat-btn" id="gameChatBtn" title="الدردشة والتفاعل">💬</button>

        <div class="chat-popup-window" id="chatPopupWindow">
            <div class="popup-top-bar">
                <span>التفاعل السريع</span>
                <button id="closeChatBtn">✕</button>
            </div>

            <div class="popup-tabs">
                <button class="tab-btn" id="tabPresetBtn">💬 رسائل فورية</button>
                <button class="tab-btn active" id="tabAvatarBtn">🎭 الافتارات والإيموتس</button>
            </div>

            <div class="tab-content active" id="tabAvatarContent">
                <div class="avatar-container" id="avatarContainerTrigger">
                    <div class="white-frame"></div>
                    <img class="img-1 default-show" src="boss1.png" alt="boss 1">
                    <img class="img-2" src="boss2.png" alt="boss 2">
                    <img class="img-3" src="boss3.png" alt="boss 3">
                    <img class="img-4" src="boss4.png" alt="boss 4">
                </div>
            </div>

            <div class="tab-content" id="tabPresetContent">
                <div class="preset-list">
                    <button class="preset-btn" data-text="مرحباً بك، استمتع باللعبة!">👋 مرحباً بك، استمتع باللعبة!</button>
                    <button class="preset-btn" data-text="لعبتك رائعة جداً، أحسنت!">🔥 لعبتك رائعة جداً!</button>
                    <button class="preset-btn" data-text="انتظر، سأقوم بالرد سريعاً.">⏳ انتظر، سأقوم بالرد سريعاً.</button>
                    <button class="preset-btn" data-text="حظا سعيدا للجميع!">⭐ حظا سعيدا للجميع!</button>
                </div>
            </div>
        </div>

        <div class="floating-avatar-display" id="floatingAvatarDisplay">
            <div class="avatar-container" id="floatingAvatarBox">
                <div class="white-frame"></div>
                <img class="img-1 default-show" src="boss1.png" alt="boss 1">
                <img class="img-2" src="boss2.png" alt="boss 2">
                <img class="img-3" src="boss3.png" alt="boss 3">
                <img class="img-4" src="boss4.png" alt="boss 4">
            </div>
        </div>

        <div class="game-toast" id="gameToast"></div>

        <audio id="bossSound" src="laugh.mp3"></audio>
    `;
    document.body.appendChild(container);

    // 3. الأكواد البرمجية للوظائف (JavaScript Logic)
    let hideTimeout;
    let toastTimeout;

    const chatBtn = document.getElementById('gameChatBtn');
    const windowPopup = document.getElementById('chatPopupWindow');
    const closeChatBtn = document.getElementById('closeChatBtn');
    const tabAvatarBtn = document.getElementById('tabAvatarBtn');
    const tabPresetBtn = document.getElementById('tabPresetBtn');
    const tabAvatarContent = document.getElementById('tabAvatarContent');
    const tabPresetContent = document.getElementById('tabPresetContent');
    const avatarContainerTrigger = document.getElementById('avatarContainerTrigger');
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

    avatarContainerTrigger.addEventListener('click', triggerFloatingAvatar);

    function triggerFloatingAvatar() {
        windowPopup.classList.remove('open');

        if (hideTimeout) clearTimeout(hideTimeout);

        floatingAvatarDisplay.classList.remove('show');
        void floatingAvatarDisplay.offsetWidth; // Force reflow

        floatingAvatarDisplay.classList.add('show');

        const img1 = floatingAvatarBox.querySelector('.img-1');
        if (img1) img1.classList.remove('default-show');

        if (bossSound) {
            bossSound.currentTime = 0;
            bossSound.play().catch(error => {
                console.log("تعذر تشغيل الصوت تلقائياً:", error);
            });
        }

        floatingAvatarBox.classList.remove('play');
        void floatingAvatarBox.offsetWidth; // Force reflow
        floatingAvatarBox.classList.add('play');

        hideTimeout = setTimeout(() => {
            floatingAvatarDisplay.classList.remove('show');
            floatingAvatarBox.classList.remove('play');
            if (img1) img1.classList.add('default-show');
        }, 2500);
    }
})();
