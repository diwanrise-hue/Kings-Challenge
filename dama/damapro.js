// damapro.js
// مخصص لإضافة الإطارات الملكية للوحة الشرف، ونظام عرض شارات الـ VIP الديناميكي مع تأثير "اللهب المشتعل".
// 🌟 (مُحدّث جذرياً): استخدام نظام الصورة الخلفية (DOM Image) لضمان تطابق الحجم 100% وتدمير التغويش والظلال نهائياً.
// 👑 (مُحدّث حصري): تخصيص إطارات (Vipprofile.webp) و (Vipغرفة.webp) حصرياً للاعبي VIP 3 فما فوق في البروفايل وقائمة الغرف.

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. تصدير مسارات الإطارات كمتغيرات عامة (Global Variables) 
    window.frameRank1 = 'Media/register/king1.webp'; // إطار المركز الأول 🥇
    window.frameRank2 = 'Media/register/king2.webp'; // إطار المركز الثاني 🥈
    window.frameRank3 = 'Media/register/king3.webp'; // إطار المركز الثالث 🥉

   console.log("👑 DamaPro: تم تجهيز إطارات لوحة الشرف الملكية بنجاح من مسار dama/Media/register.");
});

// ==========================================
// 🌟 نظام عرض شارات وإطارات الـ VIP الديناميكي 🌟
// ==========================================
(function() {
    // 1. حقن التنسيقات (CSS) الخاصة بشارات الـ VIP، اللهب، وإطارات الغرف والبروفايل الحصرية
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

        /* 🎨 تأثيرات اللهب */
        .vip-glow-white  { animation: vipFloatAndSpin 15s infinite linear, vipFlameWhite 2.5s infinite alternate ease-in-out; }
        .vip-glow-purple { animation: vipFloatAndSpin 15s infinite linear, vipFlamePurple 2.5s infinite alternate ease-in-out; }
        .vip-glow-red    { animation: vipFloatAndSpin 15s infinite linear, vipFlameRed 2.5s infinite alternate ease-in-out; }
        .vip-glow-mixed  { animation: vipFloatAndSpin 15s infinite linear, vipFlameMixed 2.5s infinite alternate ease-in-out; }

        /* ========================================== */
        /* 🌟 كلاس الإطار الجديد داخل المباراة (V23 و 45) 🌟 */
        /* ========================================== */
        .vip-frame-img-layer {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            object-fit: fill !important; 
            z-index: 0 !important;
            border-radius: 20px !important; 
            pointer-events: none !important;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6)) !important; 
        }

        /* رفع عناصر البطاقة لتظهر فوق الإطار */
        .match-players-flex > div, .match-players-flex > span {
            position: relative;
            z-index: 2;
        }

        /* ========================================== */
        /* 👑 إطارات VIP 3+ المخصصة للغرف والبروفايل 👑 */
        /* ========================================== */
        .custom-vip3-room-frame {
            position: absolute !important; 
            top: 50% !important; 
            left: 50% !important; 
            transform: translate(-50%, -50%) !important; 
            width: 145% !important; /* حجم يبرز الإطار خارج الدائرة */
            height: 145% !important; 
            z-index: 4 !important; 
            pointer-events: none !important; 
            object-fit: contain !important;
            filter: drop-shadow(0 4px 6px rgba(0,0,0,0.8)) !important;
        }
        
        .custom-vip3-profile-frame {
            position: absolute !important; 
            top: 50% !important; 
            left: 50% !important; 
            transform: translate(-50%, -50%) !important; 
            width: 135% !important; /* حجم متناسق مع البروفايل الشخصي */
            height: 135% !important; 
            z-index: 4 !important; 
            pointer-events: none !important; 
            object-fit: contain !important;
            filter: drop-shadow(0 6px 12px rgba(0,0,0,0.9)) !important;
        }
    `;
    document.head.appendChild(style);

    // 2. دالة رسم أو تحديث شارة الـ VIP والإطارات داخل المباراة
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
            // تحديد البطاقة الكاملة داخل المباراة
            matchCardContainer = avatarDiv.closest('.match-players-flex');
            if (!matchCardContainer) return;
            badgeClass = (avatarContainerId === 'card-my-avatar') ? 'vip-badge-match-me' : 'vip-badge-match-opp';
            parent = matchCardContainer; 
        }
        
        let badge = parent.querySelector('.' + badgeClass);
        let lvl = parseInt(vipLevel) || 0;

        // تطبيق الإطارات أثناء المباراة
        if (matchCardContainer) {
            let frameImg = matchCardContainer.querySelector('.vip-frame-img-layer');

            if (lvl > 1) { // يتم عرض الإطار فقط لـ VIP 2 فما فوق
                matchCardContainer.style.setProperty('background', 'transparent', 'important');
                matchCardContainer.style.setProperty('background-color', 'transparent', 'important');
                matchCardContainer.style.setProperty('border', 'none', 'important');
                matchCardContainer.style.setProperty('box-shadow', 'none', 'important');
                matchCardContainer.style.setProperty('backdrop-filter', 'none', 'important');
                matchCardContainer.style.setProperty('-webkit-backdrop-filter', 'none', 'important');

                if (!frameImg) {
                    frameImg = document.createElement('img');
                    frameImg.className = 'vip-frame-img-layer';
                    matchCardContainer.insertBefore(frameImg, matchCardContainer.firstChild);
                }

                if (lvl === 2 || lvl === 3) {
                    frameImg.src = 'Media/VIP/V23.webp?v=30';
                } else if (lvl >= 4) {
                    frameImg.src = 'Media/VIP/45.webp?v=30';
                }

            } else {
                if (frameImg) frameImg.remove();
                matchCardContainer.style.removeProperty('background');
                matchCardContainer.style.removeProperty('background-color');
                matchCardContainer.style.removeProperty('border');
                matchCardContainer.style.removeProperty('box-shadow');
                matchCardContainer.style.removeProperty('backdrop-filter');
                matchCardContainer.style.removeProperty('-webkit-backdrop-filter');
            }
        }

        // إضافة شارة اللهب (VIP Badge) 
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
    };

    // 3. اعتراض دوال الواجهة الأساسية لتحديث الشارات والإطارات تلقائياً
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

    // تحديث شارة وإطار الخصم عند بدء المباراة
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

    // 4. حلقة الفحص السريعة (Loop) للمتجر وشارات الـ VIP والإطارات الملكية (كل 300ms لضمان الاستجابة الفورية)
    setInterval(() => {
        try {
            // تحديث الشارات العامة
            let profileStr = localStorage.getItem('hub_user_profile');
            if (profileStr) {
                let p = JSON.parse(profileStr);
                window.updateVipBadgeUI('card-my-avatar', p.vipLevel || 0);
                window.updateVipBadgeUI('badge-avatar', p.vipLevel || 0);
            }
            
            if (window.isMatchRunning && window.currentOpponentData) {
                window.updateVipBadgeUI('card-opp-avatar', window.currentOpponentData.vipLevel || 0);
            }

            // ==========================================
            // 👑 نظام إطارات VIP 3+ المخصصة للغرف والبروفايل 👑
            // ==========================================

            // أ. معالجة إطار البروفايل الشخصي (Vipprofile.webp)
            const profileModal = document.getElementById('in-game-profile-modal');
            if (profileModal && profileModal.style.display !== 'none') {
                const igpAvatar = document.getElementById('igp-avatar');
                if (igpAvatar) {
                    let vipLvl = 0;
                    
                    if (document.getElementById('own-profile-actions').style.display === 'block') {
                        let p = JSON.parse(localStorage.getItem('hub_user_profile') || '{}');
                        vipLvl = parseInt(p.vipLevel) || 0;
                    } else if (window.gameState && window.gameState.currentViewedPlayer) {
                        vipLvl = parseInt(window.gameState.currentViewedPlayer.vipLevel) || 0;
                    } else if (window.currentOpponentData) {
                        vipLvl = parseInt(window.currentOpponentData.vipLevel) || 0;
                    }

                    let existingFrame = igpAvatar.querySelector('.custom-vip3-profile-frame');
                    
                    if (vipLvl >= 3) {
                        // إخفاء الإطار العادي إن وجد
                        const normalFrames = igpAvatar.querySelectorAll('img:not(.custom-vip3-profile-frame):not(:first-child)');
                        normalFrames.forEach(f => f.style.display = 'none');
                        
                        // إزالة حواف الـ CSS لعدم التضارب مع الإطار الجديد
                        igpAvatar.style.setProperty('border', 'none', 'important');
                        
                        if (!existingFrame) {
                            let frame = document.createElement('img');
                            frame.src = 'Media/VIP/Vipprofile.webp';
                            frame.className = 'custom-vip3-profile-frame';
                            igpAvatar.appendChild(frame);
                        }
                    } else {
                        if (existingFrame) existingFrame.remove();
                        // استعادة الإطار العادي
                        igpAvatar.style.setProperty('border', '3px solid #d4af37', 'important');
                        const normalFrames = igpAvatar.querySelectorAll('img:not(.custom-vip3-profile-frame):not(:first-child)');
                        normalFrames.forEach(f => f.style.display = 'block');
                    }
                }
            }

            // ب. معالجة إطار الغرف (Vipغرفة.webp) في قائمة الغرف المتاحة
            const activeRoomsList = document.getElementById('active-rooms-list');
            if (activeRoomsList) {
                const vipBadges = activeRoomsList.querySelectorAll('img[src*="Media/VIP/vip"]');
                vipBadges.forEach(badge => {
                    const match = badge.src.match(/vip(\d+)\.webp/);
                    if (match) {
                        const lvl = parseInt(match[1]);
                        if (lvl >= 3) {
                            const avatarContainer = badge.parentElement;
                            if (avatarContainer) {
                                let existingRoomFrame = avatarContainer.querySelector('.custom-vip3-room-frame');
                                
                                // إخفاء الإطار الافتراضي الذي يولده السيرفر
                                const normalFrames = avatarContainer.querySelectorAll('img:not(.custom-vip3-room-frame):not([src*="vip"]):not(:first-child)');
                                normalFrames.forEach(f => f.style.display = 'none');
                                
                                // إزالة حواف الـ CSS إن وجدت
                                avatarContainer.style.setProperty('border', 'none', 'important');

                                if (!existingRoomFrame) {
                                    let frame = document.createElement('img');
                                    frame.src = 'Media/VIP/Vipغرفة.webp';
                                    frame.className = 'custom-vip3-room-frame';
                                    avatarContainer.appendChild(frame);
                                }
                            }
                        }
                    }
                });
            }

            // ج. معالجة بطاقة "غرفتي في الانتظار"
            const myWaitingRoom = document.getElementById('my-waiting-room-card');
            if (myWaitingRoom && myWaitingRoom.style.display !== 'none') {
                let p = JSON.parse(localStorage.getItem('hub_user_profile') || '{}');
                let vipLvl = parseInt(p.vipLevel) || 0;
                const myAvatarContainer = document.getElementById('my-waiting-avatar')?.parentElement;
                
                if (myAvatarContainer && vipLvl >= 3) {
                    const myFrameContainer = document.getElementById('my-waiting-frame');
                    myAvatarContainer.style.setProperty('border', 'none', 'important'); // إزالة الخط الأصفر
                    
                    if (myFrameContainer && !myFrameContainer.querySelector('.custom-vip3-room-frame')) {
                        myFrameContainer.innerHTML = `<img src="Media/VIP/Vipغرفة.webp" class="custom-vip3-room-frame">`;
                    }
                }
            }

        } catch(e) {}
    }, 300);

})();
