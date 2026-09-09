// damapro.js 
// مخصص لإضافة الإطارات الملكية (على البطاقة بالكامل)، ونظام عرض شارات الـ VIP الديناميكي.

document.addEventListener('DOMContentLoaded', () => {
    window.frameRank1 = 'Media/register/king1.webp'; 
    window.frameRank2 = 'Media/register/king2.webp'; 
    window.frameRank3 = 'Media/register/king3.webp'; 
});

(function() {
    const style = document.createElement('style');
    style.innerHTML = `
        /* 🔥 أنيميشن الـ VIP 🔥 */
        @keyframes vipFloatAndSpin {
            0% { transform: translateY(0px) rotateY(0deg); }
            25% { transform: translateY(-6px) rotateY(0deg); }
            50% { transform: translateY(0px) rotateY(0deg); }
            75% { transform: translateY(-6px) rotateY(0deg); }
            85% { transform: translateY(0px) rotateY(0deg); }
            90% { transform: translateY(-3px) rotateY(0deg); }
            95% { transform: translateY(-6px) rotateY(360deg); }
            100% { transform: translateY(0px) rotateY(720deg); }
        }
        @keyframes vipFlameWhite { 0% { filter: drop-shadow(0 2px 2px rgba(255,255,255,0.8)); } 100% { filter: drop-shadow(0 -5px 6px rgba(255,255,255,0.9)); } }
        @keyframes vipFlamePurple { 0% { filter: drop-shadow(0 2px 2px rgba(155,89,182,0.8)); } 100% { filter: drop-shadow(0 -5px 6px rgba(155,89,182,0.9)); } }
        @keyframes vipFlameRed { 0% { filter: drop-shadow(0 2px 2px rgba(255,0,0,0.8)); } 100% { filter: drop-shadow(0 -5px 6px rgba(255,69,58,0.9)); } }
        @keyframes vipFlameMixed { 0% { filter: drop-shadow(0 2px 2px rgba(255,215,0,0.8)); } 100% { filter: drop-shadow(0 -8px 8px rgba(255,69,58,0.9)); } }

        /* 💳 كلاسات الإطارات للبطاقة بالكامل (Card Frames) 💳 */
        .card-royal-frame {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: fill; /* ليغطي مساحة البطاقة بالكامل */
            z-index: 10; /* ليظهر فوق خلفية البطاقة */
            pointer-events: none; /* حتى لا يعيق الضغط على البطاقة */
            border-radius: 12px; /* تم إضافة انحناء ليتناسب مع بطاقتك، يمكنك تعديل الرقم */
        }

        /* 👑 كلاسات شارة الـ VIP (مرتبطة بالبطاقة الآن) */
        .vip-badge-hub { position: absolute; top: 10px; left: 185px; width: 48px; height: 64px; object-fit: contain; z-index: 1000; pointer-events: none; }
        
        /* وضعنا الشارة في الزاوية العلوية الجانبية للبطاقة */
        .vip-badge-match-me { position: absolute; top: -15px; right: -15px; width: 40px; height: 53px; object-fit: contain; z-index: 1000; pointer-events: none; }
        .vip-badge-match-opp { position: absolute; top: -15px; left: -15px; width: 40px; height: 53px; object-fit: contain; z-index: 1000; pointer-events: none; }

        .vip-glow-white { animation: vipFloatAndSpin 15s infinite linear, vipFlameWhite 2.5s infinite alternate ease-in-out; }
        .vip-glow-purple { animation: vipFloatAndSpin 15s infinite linear, vipFlamePurple 2.5s infinite alternate ease-in-out; }
        .vip-glow-red { animation: vipFloatAndSpin 15s infinite linear, vipFlameRed 2.5s infinite alternate ease-in-out; }
        .vip-glow-mixed { animation: vipFloatAndSpin 15s infinite linear, vipFlameMixed 2.5s infinite alternate ease-in-out; }
    `;
    document.head.appendChild(style);

    // ==========================================
    // 🛠️ دالة ذكية للوصول إلى "البطاقة الكاملة" وليس الأفاتار فقط
    // ==========================================
    function getCardContainer(avatarId) {
        const avatarDiv = document.getElementById(avatarId);
        if (!avatarDiv) return null;
        
        // نصعد مستويين في الكود للوصول إلى الحاوية الرئيسية للبطاقة
        // (افتراض أن الكود: <div class="card"> -> <div class="avatar-wrap"> -> <img id="avatar">)
        let parent = avatarDiv.parentElement;
        if (parent && parent.parentElement) {
            return parent.parentElement; 
        }
        return parent; 
    }

    // ==========================================
    // دالة عرض الإطار على البطاقة
    // ==========================================
    window.updateFrameUI = function(avatarContainerId, frameUrl) {
        const cardContainer = getCardContainer(avatarContainerId);
        if (!cardContainer) return;

        // إجبار البطاقة على احتواء الإطار بداخلها لكي لا يطير في الشاشة
        if (window.getComputedStyle(cardContainer).position === 'static') {
            cardContainer.style.position = 'relative';
        }

        let frame = cardContainer.querySelector('.card-royal-frame');
        
        if (frameUrl) {
            if (!frame) {
                frame = document.createElement('img');
                frame.className = 'card-royal-frame';
                // إدراج الإطار كأول عنصر في البطاقة ليكون خلفية للمحتوى
                cardContainer.insertBefore(frame, cardContainer.firstChild);
            }
            frame.src = frameUrl;
            frame.style.display = 'block';
        } else {
            if (frame) frame.style.display = 'none';
        }
    };

    // ==========================================
    // دالة تحديث شارة الـ VIP (مرتبطة بالبطاقة)
    // ==========================================
    window.updateVipBadgeUI = function(avatarContainerId, vipLevel) {
        const cardContainer = getCardContainer(avatarContainerId);
        if (!cardContainer) return;

        if (window.getComputedStyle(cardContainer).position === 'static') {
            cardContainer.style.position = 'relative';
        }

        let badgeClass = 'vip-badge-hub';
        if (avatarContainerId === 'card-my-avatar') badgeClass = 'vip-badge-match-me';
        if (avatarContainerId === 'card-opp-avatar') badgeClass = 'vip-badge-match-opp';
        
        let badge = cardContainer.querySelector('.' + badgeClass);
        let lvl = parseInt(vipLevel) || 0;

        if (lvl > 0) {
            if (!badge) {
                badge = document.createElement('img');
                cardContainer.appendChild(badge);
            }
            
            let glowClass = 'vip-glow-white'; 
            if (lvl === 3) glowClass = 'vip-glow-purple';
            else if (lvl === 4) glowClass = 'vip-glow-red';
            else if (lvl >= 5) glowClass = 'vip-glow-mixed';

            badge.className = `${badgeClass} ${glowClass}`;
            badge.src = `Media/VIP/vip${lvl}.webp`;
            badge.onerror = function() { this.style.display = 'none'; };
            badge.style.display = 'block';
        } else {
            if (badge) badge.style.display = 'none';
        }
    };

    // ==========================================
    // اعتراض الدوال لتشغيل (الإطارات + الشارات) معاً
    // ==========================================
    let isProfileHooked = false;
    setInterval(() => {
        if (!isProfileHooked && typeof window.applyProfileDataToUI === 'function') {
            const originalApplyProfile = window.applyProfileDataToUI;
            window.applyProfileDataToUI = function(profile) {
                if (originalApplyProfile) originalApplyProfile(profile); 
                
                let vipLevel = profile.vipLevel || 0;
                window.updateVipBadgeUI('card-my-avatar', vipLevel);
                window.updateVipBadgeUI('badge-avatar', vipLevel);

                if (profile.activeFrame) {
                    window.updateFrameUI('card-my-avatar', profile.activeFrame);
                }
            };
            isProfileHooked = true;
        }
    }, 500);

    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (window.ui && window.ui.toggleOnlineUILayout) {
                const origToggle = window.ui.toggleOnlineUILayout;
                window.ui.toggleOnlineUILayout = function(active, oppName, oppAvatar) {
                    origToggle.call(window.ui, active, oppName, oppAvatar); 
                    
                    if (active) {
                        let oppVip = 0;
                        let oppFrame = null;
                        
                        if (window.currentOpponentData) {
                            oppVip = window.currentOpponentData.vipLevel || 0;
                            // جلب إطار الخصم 
                            // ملاحظة: للتجربة، يمكنك وضع window.frameRank1 هنا مؤقتاً لتراه يعمل
                            oppFrame = window.currentOpponentData.activeFrame || null; 
                        }
                        
                        window.updateVipBadgeUI('card-opp-avatar', oppVip);
                        window.updateFrameUI('card-opp-avatar', oppFrame);
                    } else {
                        window.updateVipBadgeUI('card-opp-avatar', 0);
                        window.updateFrameUI('card-opp-avatar', null);
                    }
                };
            }
        }, 1000); 
    });

})();
