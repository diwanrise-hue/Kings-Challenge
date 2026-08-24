// damapro.js
// مخصص لإضافة الإطارات الملكية للوحة الشرف، ونظام عرض شارات الـ VIP الديناميكي مع تأثير "اللهب المشتعل".

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. تصدير مسارات الإطارات كمتغيرات عامة (Global Variables) 
    window.frameRank1 = 'Media/register/king1.webp'; // إطار المركز الأول 🥇
    window.frameRank2 = 'Media/register/king2.webp'; // إطار المركز الثاني 🥈
    window.frameRank3 = 'Media/register/king3.webp'; // إطار المركز الثالث 🥉

   console.log("👑 DamaPro: تم تجهيز إطارات لوحة الشرف الملكية بنجاح من مسار dama/Media/register.");
});

// ==========================================
// 🌟 نظام عرض شارات الـ VIP الديناميكي داخل لعبة الدامة 🌟
// ==========================================
(function() {
    // 1. حقن التنسيقات (CSS) الخاصة بشارات الـ VIP ولهب الطاقة برمجياً
    const style = document.createElement('style');
    style.innerHTML = `
        /* 🌟 أنيميشن الطفو المستمر مع دوران سريع كل 10 ثوانٍ 🌟 */
        @keyframes vipFloatAndSpin {
            0%   { transform: translateY(0px) rotateY(0deg); animation-timing-function: ease-out; }
            10%  { transform: translateY(-6px) rotateY(0deg); animation-timing-function: ease-in; }
            20%  { transform: translateY(0px) rotateY(0deg); animation-timing-function: ease-out; }
            30%  { transform: translateY(-6px) rotateY(0deg); animation-timing-function: ease-in; }
            40%  { transform: translateY(0px) rotateY(0deg); animation-timing-function: ease-out; }
            50%  { transform: translateY(-6px) rotateY(0deg); animation-timing-function: ease-in; }
            60%  { transform: translateY(0px) rotateY(0deg); animation-timing-function: ease-out; }
            70%  { transform: translateY(-6px) rotateY(0deg); animation-timing-function: ease-in; }
            80%  { transform: translateY(0px) rotateY(0deg); }
            
            /* مرحلة الدوران السريع 3D */
            85%  { transform: translateY(-3px) rotateY(0deg); animation-timing-function: ease-in; }
            92%  { transform: translateY(-6px) rotateY(360deg); animation-timing-function: linear; }
            98%  { transform: translateY(0px) rotateY(720deg); animation-timing-function: ease-out; }
            100% { transform: translateY(0px) rotateY(720deg); }
        }

        /* 🌟 أنيميشن اللهب المشتعل (Flame Auras) 🌟 */
        
        /* لهب أبيض (VIP 1 & 2) */
        @keyframes vipFlameWhite {
            0%   { filter: drop-shadow(0 0 4px rgba(255,255,255,0.7)) drop-shadow(0 -3px 6px rgba(255,255,255,0.4)); }
            33%  { filter: drop-shadow(-2px -5px 7px rgba(255,255,255,0.9)) drop-shadow(1px -7px 9px rgba(200,200,255,0.5)); }
            66%  { filter: drop-shadow(2px -3px 6px rgba(255,255,255,0.8)) drop-shadow(-1px -9px 11px rgba(255,255,255,0.6)); }
            100% { filter: drop-shadow(0 -6px 8px rgba(255,255,255,1)) drop-shadow(0 -4px 6px rgba(200,200,255,0.5)); }
        }
        
        /* لهب بنفسجي (VIP 3) */
        @keyframes vipFlamePurple {
            0%   { filter: drop-shadow(0 0 4px rgba(155,89,182,0.7)) drop-shadow(0 -3px 6px rgba(155,89,182,0.4)); }
            33%  { filter: drop-shadow(-2px -5px 7px rgba(155,89,182,0.9)) drop-shadow(1px -7px 9px rgba(200,100,255,0.5)); }
            66%  { filter: drop-shadow(2px -3px 6px rgba(155,89,182,0.8)) drop-shadow(-1px -9px 11px rgba(155,89,182,0.6)); }
            100% { filter: drop-shadow(0 -6px 8px rgba(155,89,182,1)) drop-shadow(0 -4px 6px rgba(200,100,255,0.5)); }
        }
        
        /* لهب أحمر (VIP 4) */
        @keyframes vipFlameRed {
            0%   { filter: drop-shadow(0 0 4px rgba(255,69,58,0.7)) drop-shadow(0 -3px 6px rgba(255,69,58,0.4)); }
            33%  { filter: drop-shadow(-2px -5px 7px rgba(255,69,58,0.9)) drop-shadow(1px -7px 9px rgba(255,120,50,0.5)); }
            66%  { filter: drop-shadow(2px -3px 6px rgba(255,69,58,0.8)) drop-shadow(-1px -9px 11px rgba(255,69,58,0.6)); }
            100% { filter: drop-shadow(0 -6px 8px rgba(255,69,58,1)) drop-shadow(0 -4px 6px rgba(255,120,50,0.5)); }
        }
        
        /* لهب مخلوط متطاير: أبيض، بنفسجي، أحمر، ذهبي (VIP 5) */
        @keyframes vipFlameMixed {
            0%   { filter: drop-shadow(-2px -4px 7px rgba(255,255,255,0.8)) drop-shadow(2px -6px 9px rgba(155,89,182,0.6)); }
            25%  { filter: drop-shadow(2px -7px 9px rgba(255,69,58,0.9)) drop-shadow(-2px -3px 6px rgba(255,215,0,0.8)); }
            50%  { filter: drop-shadow(1px -4px 7px rgba(155,89,182,0.8)) drop-shadow(-1px -9px 11px rgba(255,255,255,0.9)); }
            75%  { filter: drop-shadow(-3px -7px 10px rgba(255,215,0,1)) drop-shadow(3px -4px 8px rgba(255,69,58,0.8)); }
            100% { filter: drop-shadow(0 -6px 9px rgba(255,255,255,0.9)) drop-shadow(0 -5px 7px rgba(155,89,182,0.7)); }
        }

        /* 🎨 كلاسات متغيرة لربط اللهب السريع والمناسب برمجياً */
        .vip-glow-white  { --vip-glow-anim: vipFlameWhite 0.6s infinite alternate ease-in-out; }
        .vip-glow-purple { --vip-glow-anim: vipFlamePurple 0.6s infinite alternate ease-in-out; }
        .vip-glow-red    { --vip-glow-anim: vipFlameRed 0.6s infinite alternate ease-in-out; }
        .vip-glow-mixed  { --vip-glow-anim: vipFlameMixed 0.5s infinite alternate ease-in-out; }

        /* 👑 1. شارة الـ VIP في الواجهة الرئيسية (Hub Profile) */
        .vip-badge-hub {
            position: absolute;
            top: 10px;
            left: 185px; 
            width: 48px;  
            height: 64px; 
            object-fit: contain; 
            z-index: 50;
            pointer-events: none;
            will-change: transform, filter;
            transform-style: preserve-3d;
            /* دمج أنيميشن الطفو مع أنيميشن اللهب */
            animation: vipFloatAndSpin 10s infinite linear, var(--vip-glow-anim, vipFlameWhite 0.6s infinite alternate ease-in-out);
        }

        /* 👑 2. شارة الـ VIP في بطاقة اللاعب المحلي (أسفل اليمين) */
        .vip-badge-match-me {
            position: absolute;
            bottom: -15px; 
            right: -15px;  
            width: 33px;  
            height: 44px; 
            object-fit: contain;
            z-index: 50;
            pointer-events: none;
            will-change: transform, filter;
            transform-style: preserve-3d;
            animation: vipFloatAndSpin 10s infinite linear, var(--vip-glow-anim, vipFlameWhite 0.6s infinite alternate ease-in-out);
        }

        /* 👑 3. شارة الـ VIP في بطاقة الخصم (أسفل اليسار) */
        .vip-badge-match-opp {
            position: absolute;
            bottom: -15px; 
            left: -15px;   
            width: 33px;  
            height: 44px; 
            object-fit: contain;
            z-index: 50;
            pointer-events: none;
            will-change: transform, filter;
            transform-style: preserve-3d;
            animation: vipFloatAndSpin 10s infinite linear, var(--vip-glow-anim, vipFlameWhite 0.6s infinite alternate ease-in-out);
        }
    `;
    document.head.appendChild(style);

    // 2. دالة رسم أو تحديث شارة الـ VIP مع تحديد لون اللهب
    window.updateVipBadgeUI = function(avatarContainerId, vipLevel) {
        const avatarDiv = document.getElementById(avatarContainerId);
        if (!avatarDiv) return;

        const parent = avatarDiv.parentElement;
        if (!parent) return;

        const badgeClass = (avatarContainerId === 'badge-avatar') ? 'vip-badge-hub' : 
                           (avatarContainerId === 'card-my-avatar') ? 'vip-badge-match-me' : 'vip-badge-match-opp';
        
        let badge = parent.querySelector('.' + badgeClass);
        
        // إذا كان يمتلك مستوى VIP أعلى من 0
        if (vipLevel && parseInt(vipLevel) > 0) {
            if (!badge) {
                badge = document.createElement('img');
                parent.appendChild(badge);
            }

            let lvl = parseInt(vipLevel);
            
            // 🌟 تحديد اللهب المناسب للمستوى
            let glowClass = 'vip-glow-white'; 
            if (lvl === 1 || lvl === 2) glowClass = 'vip-glow-white';
            else if (lvl === 3) glowClass = 'vip-glow-purple';
            else if (lvl === 4) glowClass = 'vip-glow-red';
            else if (lvl >= 5) glowClass = 'vip-glow-mixed';

            // تطبيق الكلاسات ومسار الصورة
            badge.className = `${badgeClass} ${glowClass}`;
            badge.src = `Media/VIP/vip${lvl}.webp`;
            
            badge.onerror = function() { this.style.display = 'none'; };
            badge.style.display = 'block';
        } else {
            // إخفاء الشارة إذا لم يكن VIP
            if (badge) badge.style.display = 'none';
        }
    };

    // 3. اعتراض دوال الواجهة الأساسية لتحديث الشارات تلقائياً

    // أ. تحديث شارة اللاعب المحلي (أنت)
    const originalApplyProfile = window.applyProfileDataToUI;
    window.applyProfileDataToUI = function(profile) {
        if (originalApplyProfile) originalApplyProfile(profile); 
        
        let vipLevel = profile.vipLevel || 0;
        
        window.updateVipBadgeUI('card-my-avatar', vipLevel);
        window.updateVipBadgeUI('badge-avatar', vipLevel);
    };

    // ب. تحديث شارة الخصم عند بدء المباراة
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
