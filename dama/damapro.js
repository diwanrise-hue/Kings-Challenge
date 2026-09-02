// damapro.js
// مخصص لإضافة الإطارات الملكية للوحة الشرف، ونظام عرض شارات الـ VIP الديناميكي مع تأثير "اللهب المشتعل".
// 🌟 (مُحدّث): تم حذف الإطارات الإجبارية (V23 / 45) الخاصة بخلفية بطاقة الـ VIP لعدم التضارب مع إطارات المتجر.

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. تصدير مسارات الإطارات كمتغيرات عامة (Global Variables) 
    window.frameRank1 = 'Media/register/king1.webp'; // إطار المركز الأول 🥇
    window.frameRank2 = 'Media/register/king2.webp'; // إطار المركز الثاني 🥈
    window.frameRank3 = 'Media/register/king3.webp'; // إطار المركز الثالث 🥉

   console.log("👑 DamaPro: تم تجهيز إطارات لوحة الشرف الملكية بنجاح من مسار dama/Media/register.");
});

// ==========================================
// 🌟 نظام عرض شارات الـ VIP الديناميكي 🌟
// ==========================================
(function() {
    // 1. حقن التنسيقات (CSS) الخاصة بشارات الـ VIP واللهب فقط
    const style = document.createElement('style');
    style.innerHTML = `
        /* 🌟 أنيميشن الطفو البطيء والانسيابي مع دوران كل 15 ثانية 🌟 */
        @keyframes vipFloatAndSpin {
            0%   { transform: translateY(0px) rotateY(0deg); animation-timing-function: ease-in-out; }
            25%  { transform: translateY(-6px) rotateY(0deg); animation-timing-function: ease-in-out; }
            50%  { transform: translateY(0px) rotateY(0deg); animation-timing-function: ease-in-out; }
            75%  { transform: translateY(-6px) rotateY(0deg); animation-timing-function: ease-in-out; }
            85%  { transform: translateY(0px) rotateY(0deg); }
            
            /* مرحلة الدوران السريع 3D */
            90%  { transform: translateY(-3px) rotateY(0deg); animation-timing-function: ease-in; }
            95%  { transform: translateY(-6px) rotateY(360deg); animation-timing-function: linear; }
            100% { transform: translateY(0px) rotateY(720deg); animation-timing-function: ease-out; }
        }

        /* 🔥 أنيميشن ألسنة اللهب المتصاعدة بالـ CSS 🔥 */
        @keyframes vipFlameWhite {
            0%   { filter: drop-shadow(0 2px 2px rgba(255,255,255,0.8)) drop-shadow(0 -5px 6px rgba(200,200,255,0.9)) drop-shadow(2px -12px 10px rgba(150,150,255,0.5)); }
            33%  { filter: drop-shadow(0 2px 2px rgba(255,255,255,0.8)) drop-shadow(-3px -8px 8px rgba(255,255,255,0.9)) drop-shadow(-2px -16px 12px rgba(200,200,255,0.4)); }
            66%  { filter: drop-shadow(0 2px 2px rgba(255,255,255,0.8)) drop-shadow(2px -6px 7px rgba(200,200,255,0.9)) drop-shadow(3px -14px 15px rgba(255,255,255,0.6)); }
            100% { filter: drop-shadow(0 2px 2px rgba(255,255,255,0.8)) drop-shadow(0 -5px 6px rgba(255,255,255,0.9)) drop-shadow(1px -12px 12px rgba(150,150,255,0.5)); }
        }
        @keyframes vipFlamePurple {
            0%   { filter: drop-shadow(0 2px 2px rgba(155,89,182,0.8)) drop-shadow(0 -5px 6px rgba(190,40,210,0.9)) drop-shadow(2px -12px 10px rgba(255,100,255,0.5)); }
            33%  { filter: drop-shadow(0 2px 2px rgba(155,89,182,0.8)) drop-shadow(-3px -8px 8px rgba(155,89,182,0.9)) drop-shadow(-2px -16px 12px rgba(220,80,255,0.4)); }
            66%  { filter: drop-shadow(0 2px 2px rgba(155,89,182,0.8)) drop-shadow(2px -6px 7px rgba(190,40,210,0.9)) drop-shadow(3px -14px 15px rgba(255,150,255,0.6)); }
            100% { filter: drop-shadow(0 2px 2px rgba(155,89,182,0.8)) drop-shadow(0 -5px 6px rgba(155,89,182,0.9)) drop-shadow(1px -12px 12px rgba(220,80,255,0.5)); }
        }
        @keyframes vipFlameRed {
            0%   { filter: drop-shadow(0 2px 2px rgba(255,0,0,0.8)) drop-shadow(0 -5px 6px rgba(255,69,58,0.9)) drop-shadow(2px -12px 10px rgba(255,165,0,0.6)); }
            33%  { filter: drop-shadow(0 2px 2px rgba(255,0,0,0.8)) drop-shadow(-3px -8px 8px rgba(255,69,58,0.9)) drop-shadow(-2px -16px 12px rgba(255,215,0,0.4)); }
            66%  { filter: drop-shadow(0 2px 2px rgba(255,0,0,0.8)) drop-shadow(2px -6px 7px rgba(220,20,20,0.9)) drop-shadow(3px -14px 15px rgba(255,140,0,0.6)); }
            100% { filter: drop-shadow(0 2px 2px rgba(255,0,0,0.8)) drop-shadow(0 -5px 6px rgba(255,69,58,0.9)) drop-shadow(1px -12px 12px rgba(255,165,0,0.5)); }
        }
        @keyframes vipFlameMixed {
            0%   { filter: drop-shadow(0 2px 2px rgba(255,215,0,0.8)) drop-shadow(-2px -7px 8px rgba(255,69,58,0.9)) drop-shadow(2px -14px 12px rgba(155,89,182,0.6)); }
            33%  { filter: drop-shadow(0 2px 2px rgba(255,215,0,0.8)) drop-shadow(3px -9px 9px rgba(155,89,182,0.9)) drop-shadow(-3px -16px 10px rgba(255,215,0,0.5)); }
            66%  { filter: drop-shadow(0 2px 2px rgba(255,215,0,0.8)) drop-shadow(1px -6px 7px rgba(255,215,0,0.9)) drop-shadow(-1px -15px 14px rgba(255,69,58,0.7)); }
            100% { filter: drop-shadow(0 2px 2px rgba(255,215,0,0.8)) drop-shadow(0 -8px 8px rgba(255,69,58,0.9)) drop-shadow(1px -13px 11px rgba(155,89,182,0.6)); }
        }

        /* 👑 كلاسات شارة الـ VIP (شعلة النار) */
        .vip-badge-hub { position: absolute; top: 10px; left: 185px; width: 48px; height: 64px; object-fit: contain; z-index: 1000; pointer-events: none; will-change: transform, filter; transform-style: preserve-3d; }
        .vip-badge-match-me { position: absolute; bottom: -15px; right: -15px; width: 33px; height: 44px; object-fit: contain; z-index: 1000; pointer-events: none; will-change: transform, filter; transform-style: preserve-3d; }
        .vip-badge-match-opp { position: absolute; bottom: -15px; left: -15px; width: 33px; height: 44px; object-fit: contain; z-index: 1000; pointer-events: none; will-change: transform, filter; transform-style: preserve-3d; }

        /* 🎨 تأثيرات اللهب (تم إبطاؤها لتصبح مريحة جداً للعين بـ 2.5 ثانية) */
        .vip-glow-white  { animation: vipFloatAndSpin 15s infinite linear, vipFlameWhite 2.5s infinite alternate ease-in-out; }
        .vip-glow-purple { animation: vipFloatAndSpin 15s infinite linear, vipFlamePurple 2.5s infinite alternate ease-in-out; }
        .vip-glow-red    { animation: vipFloatAndSpin 15s infinite linear, vipFlameRed 2.5s infinite alternate ease-in-out; }
        .vip-glow-mixed  { animation: vipFloatAndSpin 15s infinite linear, vipFlameMixed 2.5s infinite alternate ease-in-out; }
    `;
    document.head.appendChild(style);

    // 2. دالة رسم أو تحديث شارة الـ VIP
    window.updateVipBadgeUI = function(avatarContainerId, vipLevel) {
        const avatarDiv = document.getElementById(avatarContainerId);
        if (!avatarDiv) return;

        const parentNode = avatarDiv.parentElement;
        if (!parentNode) return;

        let parent, badgeClass;
        let matchCardContainer = null; 

        if (avatarContainerId === 'badge-avatar') {
            badgeClass = 'vip-badge-hub';
            parent = parentNode;
        } else {
            matchCardContainer = avatarDiv.closest('.match-players-flex');
            if (!matchCardContainer) return;
            badgeClass = (avatarContainerId === 'card-my-avatar') ? 'vip-badge-match-me' : 'vip-badge-match-opp';
            parent = matchCardContainer; 
        }
        
        let badge = parent.querySelector('.' + badgeClass);
        let lvl = parseInt(vipLevel) || 0;

        // إضافة شارة اللهب (VIP Badge) فقط، تعمل لجميع مستويات VIP
        if (lvl > 0) {
            if (!badge) {
                badge = document.createElement('img');
                parent.appendChild(badge);
            }
            
            // تحديد لون اللهب
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

    // 4. حلقة فحص (Loop) كل ثانيتين لضمان بقاء الشارة
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
