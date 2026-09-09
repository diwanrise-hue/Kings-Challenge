// damapro.js
// مخصص لإضافة الإطارات الملكية للوحة الشرف، ونظام عرض شارات الـ VIP الديناميكي مع تأثير "اللهب المشتعل" وإطارات البطاقات.

document.addEventListener('DOMContentLoaded', () => {
    // 1. تصدير مسارات الإطارات كمتغيرات عامة (Global Variables) 
    window.frameRank1 = 'Media/register/king1.webp'; 
    window.frameRank2 = 'Media/register/king2.webp'; 
    window.frameRank3 = 'Media/register/king3.webp'; 

   console.log("👑 DamaPro: تم تجهيز إطارات لوحة الشرف الملكية بنجاح.");
});

// ==========================================
// 🌟 نظام عرض شارات وإطارات الـ VIP الديناميكي 🌟
// ==========================================
(function() {
    // 1. حقن التنسيقات (CSS) الخاصة بشارات الـ VIP، اللهب، وإطارات البطاقات
    const style = document.createElement('style');
    style.innerHTML = `
        /* 🌟 أنيميشن الطفو البطيء والانسيابي مع دوران كل 15 ثانية 🌟 */
        @keyframes vipFloatAndSpin {
            0%   { transform: translateY(0px) rotateY(0deg); animation-timing-function: ease-in-out; }
            25%  { transform: translateY(-6px) rotateY(0deg); animation-timing-function: ease-in-out; }
            50%  { transform: translateY(0px) rotateY(0deg); animation-timing-function: ease-in-out; }
            75%  { transform: translateY(-6px) rotateY(0deg); animation-timing-function: ease-in-out; }
            85%  { transform: translateY(0px) rotateY(0deg); }
            90%  { transform: translateY(-3px) rotateY(0deg); animation-timing-function: ease-in; }
            95%  { transform: translateY(-6px) rotateY(360deg); animation-timing-function: linear; }
            100% { transform: translateY(0px) rotateY(720deg); animation-timing-function: ease-out; }
        }

        /* 🔥 أنيميشن ألسنة اللهب المتصاعدة بالـ CSS 🔥 */
        @keyframes vipFlameWhite {
            0%   { filter: drop-shadow(0 2px 2px rgba(255,255,255,0.8)) drop-shadow(0 -5px 6px rgba(200,200,255,0.9)); }
            100% { filter: drop-shadow(0 2px 2px rgba(255,255,255,0.8)) drop-shadow(0 -5px 6px rgba(255,255,255,0.9)); }
        }
        @keyframes vipFlamePurple {
            0%   { filter: drop-shadow(0 2px 2px rgba(155,89,182,0.8)) drop-shadow(0 -5px 6px rgba(190,40,210,0.9)); }
            100% { filter: drop-shadow(0 2px 2px rgba(155,89,182,0.8)) drop-shadow(0 -5px 6px rgba(155,89,182,0.9)); }
        }
        @keyframes vipFlameRed {
            0%   { filter: drop-shadow(0 2px 2px rgba(255,0,0,0.8)) drop-shadow(0 -5px 6px rgba(255,69,58,0.9)); }
            100% { filter: drop-shadow(0 2px 2px rgba(255,0,0,0.8)) drop-shadow(0 -5px 6px rgba(255,69,58,0.9)); }
        }
        @keyframes vipFlameMixed {
            0%   { filter: drop-shadow(0 2px 2px rgba(255,215,0,0.8)) drop-shadow(-2px -7px 8px rgba(255,69,58,0.9)); }
            100% { filter: drop-shadow(0 2px 2px rgba(255,215,0,0.8)) drop-shadow(0 -8px 8px rgba(255,69,58,0.9)); }
        }

        /* 👑 كلاسات شارة الـ VIP (شعلة النار) */
        .vip-badge-hub { position: absolute; top: 10px; left: 185px; width: 48px; height: 64px; object-fit: contain; z-index: 1000; pointer-events: none; }
        .vip-badge-match-me { position: absolute; bottom: -15px; right: -15px; width: 33px; height: 44px; object-fit: contain; z-index: 1000; pointer-events: none; }
        .vip-badge-match-opp { position: absolute; bottom: -15px; left: -15px; width: 33px; height: 44px; object-fit: contain; z-index: 1000; pointer-events: none; }

        /* 🖼️ كلاسات إطارات البطاقة الكاملة (V23 و 45) */
        .vip-card-bg-frame {
            position: absolute;
            /* 🌟 إصلاح الحجم: تكبير الإطار وإزاحته قليلاً ليغطي الإطار الأساسي بالكامل 🌟 */
            top: -4px;
            left: -4px;
            width: calc(100% + 8px);
            height: calc(100% + 8px);
            object-fit: fill; 
            z-index: 1; /* الإطار في الطبقة السفلية */
            pointer-events: none; 
            border-radius: 12px; 
        }
        .vip-card-bg-frame-top {
            z-index: 2; /* للإطار الثاني في حال دمج V23 و 45 معاً */
        }

        /* 🎨 تأثيرات اللهب */
        .vip-glow-white  { animation: vipFloatAndSpin 15s infinite linear, vipFlameWhite 2.5s infinite alternate ease-in-out; }
        .vip-glow-purple { animation: vipFloatAndSpin 15s infinite linear, vipFlamePurple 2.5s infinite alternate ease-in-out; }
        .vip-glow-red    { animation: vipFloatAndSpin 15s infinite linear, vipFlameRed 2.5s infinite alternate ease-in-out; }
        .vip-glow-mixed  { animation: vipFloatAndSpin 15s infinite linear, vipFlameMixed 2.5s infinite alternate ease-in-out; }
    `;
    document.head.appendChild(style);

    // 2. دالة رسم أو تحديث شارة الـ VIP وإطار البطاقة
    window.updateVipBadgeUI = function(avatarContainerId, vipLevel) {
        const avatarDiv = document.getElementById(avatarContainerId);
        if (!avatarDiv) return;

        const parentNode = avatarDiv.parentElement;
        if (!parentNode) return;

        let parent, badgeClass;
        let matchCardContainer = null; 

        // تحديد الحاوية بناءً على المكان (اللوبي أم المباراة)
        if (avatarContainerId === 'badge-avatar') {
            badgeClass = 'vip-badge-hub';
            parent = parentNode;
        } else {
            matchCardContainer = avatarDiv.closest('.match-players-flex') || parentNode; // ضمان إيجاد حاوية البطاقة
            badgeClass = (avatarContainerId === 'card-my-avatar') ? 'vip-badge-match-me' : 'vip-badge-match-opp';
            parent = matchCardContainer; 
        }
        
        let lvl = parseInt(vipLevel) || 0;

        // ==========================================
        // أ. إضافة وتحديث شارة الـ VIP (اللهب المشتعل)
        // ==========================================
        let badge = parent.querySelector('.' + badgeClass);
        if (lvl > 0) {
            if (!badge) {
                badge = document.createElement('img');
                parent.appendChild(badge);
            }
            
            let glowClass = 'vip-glow-white'; 
            if (lvl === 1 || lvl === 2) glowClass = 'vip-glow-white';
            else if (lvl === 3) glowClass = 'vip-glow-purple';
            else if (lvl === 4) glowClass = 'vip-glow-red';
            else if (lvl >= 5) glowClass = 'vip-glow-mixed';

            badge.className = `${badgeClass} ${glowClass}`;
            badge.src = `Media/VIP/vip${lvl}.webp`;
            badge.onerror = function() { this.style.display = 'none'; };
            badge.style.display = 'block';
        } else {
            if (badge) badge.style.display = 'none';
        }

        // ==========================================
        // ب. إضافة إطارات البطاقة (V23 و 45) لداخل المباراة فقط
        // ==========================================
        if (avatarContainerId === 'card-my-avatar' || avatarContainerId === 'card-opp-avatar') {
            // ضمان أن الحاوية الأب تأخذ position relative ليحتوي الإطار المطلق
            parent.style.position = 'relative';

            // إزالة الإطارات القديمة لتحديثها بدون تكرار
            let oldFrames = parent.querySelectorAll('.vip-card-bg-frame');
            oldFrames.forEach(f => f.remove());

            if (lvl >= 2) {
                let framesToAdd = [];
                
                // تطبيق شروط الإطارات حسب مستوى الـ VIP
                if (lvl === 2) {
                    framesToAdd.push('Media/VIP/V23.webp'); // VIP 2
                } else if (lvl === 3) {
                    framesToAdd.push('Media/VIP/V23.webp'); // VIP 3 يأخذ كلا الإطارين
                    framesToAdd.push('Media/VIP/45.webp');
                } else if (lvl >= 4) {
                    framesToAdd.push('Media/VIP/45.webp');  // VIP 4 وما فوق
                }

                // حقن الصور في الواجهة
                framesToAdd.forEach((src, index) => {
                    let frameImg = document.createElement('img');
                    frameImg.src = src;
                    // الإطار الأول يأخذ الكلاس الأساسي، والثاني (إن وجد) يأخذ كلاس إضافي لرفعه طبقة واحدة
                    frameImg.className = index === 0 ? 'vip-card-bg-frame' : 'vip-card-bg-frame vip-card-bg-frame-top';
                    
                    frameImg.onerror = function() { this.remove(); };
                    // إدراج الإطار في بداية الحاوية ليكون كخلفية للبطاقة
                    parent.insertBefore(frameImg, parent.firstChild);
                });
            }

            // 🌟 إصلاح مشكلة اختفاء معلومات اللاعب (الاسم، الصورة، اللقب) 🌟
            // نقوم بالمرور على جميع العناصر داخل البطاقة ونعطيها z-index أعلى لتظهر فوق الإطار الجديد
            Array.from(parent.children).forEach(child => {
                // التأكد من أننا لا نرفع الإطارات نفسها
                if (!child.classList.contains('vip-card-bg-frame')) {
                    // إذا لم يكن للعنصر position محدد مسبقاً، نعطيه relative ليتمكن من استخدام الـ z-index
                    const compStyle = window.getComputedStyle(child);
                    if (compStyle.position === 'static') {
                        child.style.position = 'relative';
                    }
                    // إعطاء أولوية العرض للمحتويات لتكون فوق الإطار (الذي يحمل z-index: 1 و 2)
                    child.style.zIndex = '10';
                }
            });
        }
    };

    // 3. اعتراض دوال الواجهة الأساسية لتحديث الشارات تلقائياً
    let isProfileHooked = false;
    setInterval(() => {
        if (!isProfileHooked && typeof window.applyProfileDataToUI === 'function') {
            const originalApplyProfile = window.applyProfileDataToUI;
            window.applyProfileDataToUI = function(profile) {
                if (originalApplyProfile) originalApplyProfile(profile); 
                let vipLevel = profile.vipLevel || 0;
                window.updateVipBadgeUI('card-my-avatar', vipLevel);
                window.updateVipBadgeUI('badge-avatar', vipLevel);
            };
            isProfileHooked = true;
        }
    }, 500);

    // تحديث شارة الخصم عند بدء المباراة
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (window.ui && window.ui.toggleOnlineUILayout) {
                const origToggle = window.ui.toggleOnlineUILayout;
                window.ui.toggleOnlineUILayout = function(active, oppName, oppAvatar) {
                    origToggle.call(window.ui, active, oppName, oppAvatar); 
                    
                    if (active) {
                        let oppVip = 0;
                        if (window.currentOpponentData && window.currentOpponentData.vipLevel) {
                            oppVip = window.currentOpponentData.vipLevel;
                        }
                        window.updateVipBadgeUI('card-opp-avatar', oppVip);
                    } else {
                        window.updateVipBadgeUI('card-opp-avatar', 0);
                    }
                };
            }
        }, 1000); 
    });

    // 4. حلقة فحص (Loop) كل ثانيتين لضمان بقاء الشارة والإطارات
    setInterval(() => {
        try {
            let profileStr = localStorage.getItem('hub_user_profile');
            if (profileStr) {
                let p = JSON.parse(profileStr);
                window.updateVipBadgeUI('card-my-avatar', p.vipLevel || 0);
                window.updateVipBadgeUI('badge-avatar', p.vipLevel || 0);
            }
            
            if (window.isMatchRunning && window.currentOpponentData) {
                window.updateVipBadgeUI('card-opp-avatar', window.currentOpponentData.vipLevel || 0);
            }
        } catch(e) {}
    }, 2000);

})();
