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
    // 1. حقن التنسيقات (CSS) الخاصة بشارة الـ VIP برمجياً
    const style = document.createElement('style');
    style.innerHTML = `
        .vip-badge-ingame {
            position: absolute;
            top: 10px;
            left: 185px; /* الظهور في الزاوية العلوية اليسرى */
            width: 55px;
            height: 62px;
            z-index: 50;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8));
            pointer-events: none;
            transition: all 0.3s ease;
            animation: vipPulseGpu 2s infinite alternate ease-in-out;
            will-change: transform;
        }

        /* تأثير نبض خفيف ليعطي فخامة للشارة */
        @keyframes vipPulseGpu {
            0% { transform: scale(1) translateZ(0); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8)); }
            100% { transform: scale(1.1) translateZ(0); filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6)); }
        }
    `;
    document.head.appendChild(style);

    // 2. دالة رسم أو تحديث شارة الـ VIP
    window.updateVipBadgeUI = function(avatarContainerId, vipLevel) {
        const avatarDiv = document.getElementById(avatarContainerId);
        if (!avatarDiv) return;

        // الحصول على الحاوية الأب (المربع الذي يحمل الـ relative)
        const parent = avatarDiv.parentElement;
        if (!parent) return;

        let badge = parent.querySelector('.vip-badge-ingame');
        
        // إذا كان يمتلك مستوى VIP أعلى من 0
        if (vipLevel && parseInt(vipLevel) > 0) {
            if (!badge) {
                badge = document.createElement('img');
                badge.className = 'vip-badge-ingame';
                parent.appendChild(badge);
            }
            // تحديث مسار الصورة حسب المستوى
            badge.src = `Media/VIP/vip${vipLevel}.webp`;
            
            // في حال عدم العثور على الصورة، يمكنك جعلها تختفي حتى لا تظهر أيقونة مكسورة
            badge.onerror = function() { this.style.display = 'none'; };
            badge.style.display = 'block';
        } else {
            // إخفاء الشارة إذا لم يكن VIP
            if (badge) badge.style.display = 'none';
        }
    };

    // 3. اعتراض دوال الواجهة الأساسية لتحديث الشارات تلقائياً دون التعديل عليها

    // أ. تحديث شارة اللاعب المحلي (أنت)
    const originalApplyProfile = window.applyProfileDataToUI;
    window.applyProfileDataToUI = function(profile) {
        if (originalApplyProfile) originalApplyProfile(profile); // تنفيذ الكود الأصلي
        
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
                    origToggle.call(window.ui, active, oppName, oppAvatar); // تنفيذ الكود الأصلي
                    
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

    // 4. حلقة فحص (Loop) كل ثانيتين لضمان بقاء الشارة حتى لو تم إعادة رسم الأفاتار
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
 
