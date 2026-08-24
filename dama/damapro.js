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
        /* تأثير النبض الفخم المشترك */
        @keyframes vipPulseGpu {
            0% { transform: scale(1) translateZ(0); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8)); }
            100% { transform: scale(1.08) translateZ(0); filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.8)); }
        }

        /* 👑 1. شارة الـ VIP في الواجهة الرئيسية (Hub Profile) */
        .vip-badge-hub {
            position: absolute;
            top: 10px;
            left: 185px; /* المكان المخصص للبروفايل الرئيسي */
            width: 48px;  /* العرض */
            height: 64px; /* الطول (نسبة 3:4 دقيقة 100%) */
            object-fit: contain; /* يمنع أي تشوه للصورة */
            z-index: 50;
            pointer-events: none;
            transition: all 0.3s ease;
            animation: vipPulseGpu 2s infinite alternate ease-in-out;
            will-change: transform;
        }

        /* 👑 2. شارة الـ VIP في بطاقات اللعب (Online Match Cards) */
        .vip-badge-match {
            position: absolute;
            top: -12px;
            right: -12px; /* الظهور في الزاوية العلوية اليمنى للبطاقة */
            width: 30px;  /* العرض المصغر للبطاقة */
            height: 40px; /* الطول المصغر (نسبة 3:4 دقيقة 100%) */
            object-fit: contain;
            z-index: 50;
            pointer-events: none;
            transition: all 0.3s ease;
            animation: vipPulseGpu 2s infinite alternate ease-in-out;
            will-change: transform;
        }
    `;
    document.head.appendChild(style);

    // 2. دالة رسم أو تحديث شارة الـ VIP بذكاء (تفرق بين البروفايل وبطاقات اللعب)
    window.updateVipBadgeUI = function(avatarContainerId, vipLevel) {
        const avatarDiv = document.getElementById(avatarContainerId);
        if (!avatarDiv) return;

        // الحصول على الحاوية الأب (المربع الذي يحمل الـ relative)
        const parent = avatarDiv.parentElement;
        if (!parent) return;

        // تحديد الكلاس المناسب بناءً على مكان الشارة (لمنع تشوه الأماكن)
        const badgeClass = (avatarContainerId === 'badge-avatar') ? 'vip-badge-hub' : 'vip-badge-match';
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
        }, 1000); 
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
