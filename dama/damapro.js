// damapro.js
// مخصص لإضافة الإطارات الملكية للوحة الشرف، ونظام عرض شارات الـ VIP الديناميكي.

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. تصدير مسارات الإطارات كمتغيرات عامة (Global Variables) 
    // لكي يستطيع ملف uiController.js قراءتها واستخدامها في لوحة الشرف
    window.frameRank1 = 'Media/register/king1.webp'; // إطار المركز الأول 🥇
    window.frameRank2 = 'Media/register/king2.webp'; // إطار المركز الثاني 🥈
    window.frameRank3 = 'Media/register/king3.webp'; // إطار المركز الثالث 🥉

    /* 
       تم حذف الأكواد السابقة التي كانت تستهدف:
       document.getElementById('profile-badge')
       document.getElementById('badge-avatar')
       لضمان بقاء الواجهة الرئيسية نظيفة وعدم تركيب إطارات الـ King عليها بالخطأ.
    */

   console.log("👑 DamaPro: تم تجهيز إطارات لوحة الشرف الملكية بنجاح من مسار dama/Media/register.");
});

// ==========================================
// 🌟 نظام عرض شارات الـ VIP الديناميكي داخل لعبة الدامة 🌟
// ==========================================
(function() {
    // 1. حقن التنسيقات (CSS) الخاصة بشارات الـ VIP برمجياً
    const style = document.createElement('style');
    style.innerHTML = `
        /* 🌟 أنيميشن الطفو المستمر مع دوران سريع كل 10 ثوانٍ 🌟 */
        @keyframes vipFloatAndSpin {
            /* مرحلة الطفو الناعم (من 0 إلى 80 ثانية نسبياً) */
            0%   { transform: translateY(0px) rotateY(0deg); animation-timing-function: ease-out; }
            10%  { transform: translateY(-6px) rotateY(0deg); animation-timing-function: ease-in; }
            20%  { transform: translateY(0px) rotateY(0deg); animation-timing-function: ease-out; }
            30%  { transform: translateY(-6px) rotateY(0deg); animation-timing-function: ease-in; }
            40%  { transform: translateY(0px) rotateY(0deg); animation-timing-function: ease-out; }
            50%  { transform: translateY(-6px) rotateY(0deg); animation-timing-function: ease-in; }
            60%  { transform: translateY(0px) rotateY(0deg); animation-timing-function: ease-out; }
            70%  { transform: translateY(-6px) rotateY(0deg); animation-timing-function: ease-in; }
            80%  { transform: translateY(0px) rotateY(0deg); }
            
            /* مرحلة الدوران السريع 3D (دورتين كاملتين = 720 درجة) */
            85%  { transform: translateY(-3px) rotateY(0deg); animation-timing-function: ease-in; }
            92%  { transform: translateY(-6px) rotateY(360deg); animation-timing-function: linear; }
            98%  { transform: translateY(0px) rotateY(720deg); animation-timing-function: ease-out; }
            100% { transform: translateY(0px) rotateY(720deg); }
        }

        /* 👑 1. شارة الـ VIP في الواجهة الرئيسية (Hub Profile) */
        .vip-badge-hub {
            position: absolute;
            top: 10px;
            left: 185px; /* المكان المخصص للبروفايل الرئيسي */
            width: 48px;  
            height: 64px; 
            object-fit: contain; 
            z-index: 50;
            pointer-events: none;
            filter: drop-shadow(0 4px 6px rgba(0,0,0,0.6));
            will-change: transform;
            animation: vipFloatAndSpin 10s infinite linear;
            transform-style: preserve-3d;
        }

        /* 👑 2. شارة الـ VIP في بطاقة اللاعب المحلي (أسفل اليمين - قريب من حافة الشاشة) */
        .vip-badge-match-me {
            position: absolute;
            bottom: -15px; /* بروز بسيط للأسفل */
            right: -15px;  /* بروز بسيط للخارج باتجاه حافة الشاشة اليمنى */
            width: 33px;  
            height: 44px; 
            object-fit: contain;
            z-index: 50;
            pointer-events: none;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8));
            will-change: transform;
            animation: vipFloatAndSpin 10s infinite linear;
            transform-style: preserve-3d;
        }

        /* 👑 3. شارة الـ VIP في بطاقة الخصم (أسفل اليسار - قريب من حافة الشاشة) */
        .vip-badge-match-opp {
            position: absolute;
            bottom: -15px; /* بروز بسيط للأسفل */
            left: -15px;   /* بروز بسيط للخارج باتجاه حافة الشاشة اليسرى */
            width: 33px;  
            height: 44px; 
            object-fit: contain;
            z-index: 50;
            pointer-events: none;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8));
            will-change: transform;
            animation: vipFloatAndSpin 10s infinite linear;
            transform-style: preserve-3d;
        }
    `;
    document.head.appendChild(style);

    // 2. دالة رسم أو تحديث شارة الـ VIP بذكاء (تفرق بين البروفايل وبطاقات اللعب)
    window.updateVipBadgeUI = function(avatarContainerId, vipLevel) {
        const avatarDiv = document.getElementById(avatarContainerId);
        if (!avatarDiv) return;

        let parent, badgeClass;

        if (avatarContainerId === 'badge-avatar') {
            // بالنسبة للبروفايل الرئيسي، نضعها في الحاوية الأب المباشرة للأفاتار
            parent = avatarDiv.parentElement; 
            badgeClass = 'vip-badge-hub';
        } else {
            // بالنسبة لبطاقات الأونلاين، نبحث عن حاوية البطاقة بالكامل لنضع الشارة على الحافة
            parent = avatarDiv.closest('.match-players-flex');
            if (!parent) return;
            badgeClass = (avatarContainerId === 'card-my-avatar') ? 'vip-badge-match-me' : 'vip-badge-match-opp';
        }

        let badge = parent.querySelector('.' + badgeClass);
        
        // إذا كان يمتلك مستوى VIP أعلى من 0
        if (vipLevel && parseInt(vipLevel) > 0) {
            if (!badge) {
                badge = document.createElement('img');
                badge.className = badgeClass;
                parent.appendChild(badge);
            }
            // تحديث مسار الصورة حسب المستوى
            badge.src = `Media/VIP/vip${vipLevel}.webp`;
            
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
        
        // تحديث شارة اللوحة العلوية في المباراة (أنت)
        window.updateVipBadgeUI('card-my-avatar', vipLevel);
        
        // تحديث شارة البروفايل المصغرة العائمة (أنت)
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
                        // رسم الشارة للخصم
                        window.updateVipBadgeUI('card-opp-avatar', oppVip);
                    } else {
                        // إخفاء الشارة عند الخروج من الأونلاين
                        window.updateVipBadgeUI('card-opp-avatar', 0);
                    }
                };
            }
        }, 1000); // تأخير بسيط لضمان تحميل واجهة اللعبة بالكامل
    });

    // 4. حلقة فحص (Loop) كل ثانيتين لضمان بقاء الشارة
    setInterval(() => {
        try {
            // فحص اللاعب المحلي
            let profileStr = localStorage.getItem('hub_user_profile');
            if (profileStr) {
                let p = JSON.parse(profileStr);
                window.updateVipBadgeUI('card-my-avatar', p.vipLevel || 0);
                window.updateVipBadgeUI('badge-avatar', p.vipLevel || 0);
            }
            
            // فحص الخصم
            if (window.isMatchRunning && window.currentOpponentData) {
                window.updateVipBadgeUI('card-opp-avatar', window.currentOpponentData.vipLevel || 0);
            }
        } catch(e) {}
    }, 2000);

})();
