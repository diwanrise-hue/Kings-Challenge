// damapro.js
// 🛡️ (إصلاح شامل - Bulletproof): تمت معالجة جميع الأخطاء البرمجية وإرجاع البيانات الأصلية لمنع توقف اللعبة.
// 🚀 (أداء فائق): استخدام الأنيميشن المسرّع عتادياً (Opacity).
// 👑 (تعديل الأهداف): وضع إطار (Vipprofile.webp) حول نافذة البروفايل *بالكامل*، وإطار (Vipغرفة.webp) حول بطاقة الغرفة *بالكامل*.

window.frameRank1 = 'Media/register/king1.webp'; 
window.frameRank2 = 'Media/register/king2.webp'; 
window.frameRank3 = 'Media/register/king3.webp'; 

document.addEventListener('DOMContentLoaded', () => {
   console.log("👑 DamaPro: تم تجهيز نظام الـ VIP والإطارات الملكية (البروفايل والغرف) بنجاح.");
});

// ==========================================
// 🌟 نظام عرض شارات وإطارات الـ VIP الديناميكي 🌟
// ==========================================
(function() {
    try {
        const style = document.createElement('style');
        style.innerHTML = `
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

            @keyframes vipPulseAlpha {
                0%   { opacity: 0.6; }
                100% { opacity: 1; }
            }

            .vip-badge-hub { position: absolute; top: 10px; left: 185px; width: 48px; height: 64px; object-fit: contain; z-index: 1000; pointer-events: none; will-change: transform, opacity; transform-style: preserve-3d; }
            .vip-badge-match-me { position: absolute; bottom: -15px; right: -15px; width: 33px; height: 44px; object-fit: contain; z-index: 1000; pointer-events: none; will-change: transform, opacity; transform-style: preserve-3d; }
            .vip-badge-match-opp { position: absolute; bottom: -15px; left: -15px; width: 33px; height: 44px; object-fit: contain; z-index: 1000; pointer-events: none; will-change: transform, opacity; transform-style: preserve-3d; }

            .vip-glow-white  { filter: drop-shadow(0 -2px 6px rgba(255,255,255,0.8)); animation: vipFloatAndSpin 15s infinite linear, vipPulseAlpha 1.5s infinite alternate ease-in-out; }
            .vip-glow-purple { filter: drop-shadow(0 -2px 6px rgba(190,40,210,0.8)); animation: vipFloatAndSpin 15s infinite linear, vipPulseAlpha 1.5s infinite alternate ease-in-out; }
            .vip-glow-red    { filter: drop-shadow(0 -2px 6px rgba(255,69,58,0.8));   animation: vipFloatAndSpin 15s infinite linear, vipPulseAlpha 1.5s infinite alternate ease-in-out; }
            .vip-glow-mixed  { filter: drop-shadow(0 -2px 6px rgba(255,215,0,0.8));   animation: vipFloatAndSpin 15s infinite linear, vipPulseAlpha 1.5s infinite alternate ease-in-out; }

            /* إطارات داخل المباراة */
            .vip-frame-img-layer {
                position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important;
                object-fit: fill !important; z-index: 0 !important; border-radius: 20px !important; pointer-events: none !important;
                filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6)) !important; 
            }

            .match-players-flex > div, .match-players-flex > span { position: relative; z-index: 2; }

            /* 🌟 الستايل الجديد المخصص لنافذة البروفايل بالكامل 🌟 */
            .custom-vip3-profile-frame {
                position: absolute !important; 
                top: 50% !important; 
                left: 50% !important; 
                transform: translate(-50%, -50%) !important; 
                width: calc(100% + 22px) !important; /* توسعة لتغطي النافذة */
                height: calc(100% + 22px) !important; 
                z-index: 0 !important; /* خلف النصوص والصور */
                pointer-events: none !important; 
                object-fit: fill !important; 
                border-radius: 32px !important;
                filter: drop-shadow(0 6px 15px rgba(0,0,0,0.9)) !important;
            }

            /* 🌟 الستايل المخصص لبطاقة الغرفة بالكامل 🌟 */
            .custom-vip3-card-bg {
                position: absolute !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                width: calc(100% + 18px) !important; 
                height: calc(100% + 24px) !important; 
                z-index: 1 !important; 
                object-fit: fill !important; 
                pointer-events: none !important;
                filter: drop-shadow(0 4px 10px rgba(0,0,0,0.8)) !important;
            }

            .hide-normal-frame { border: none !important; }
            .hide-normal-frame img:not(.custom-vip3-profile-frame):not(.custom-vip3-card-bg):not([src*="vip"]):not(:first-child) { display: none !important; }
        `;
        document.head.appendChild(style);
    } catch(e) { console.error(e); }

    window.updateVipBadgeUI = function(avatarContainerId, vipLevel) {
        try {
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

            if (matchCardContainer) {
                let frameImg = matchCardContainer.querySelector('.vip-frame-img-layer');
                let isCurrentLevelProcessed = matchCardContainer.getAttribute('data-vip-processed') === String(lvl);

                if (!isCurrentLevelProcessed) {
                    if (lvl > 1) { 
                        matchCardContainer.style.setProperty('background', 'transparent', 'important');
                        matchCardContainer.style.setProperty('border', 'none', 'important');
                        matchCardContainer.style.setProperty('box-shadow', 'none', 'important');

                        if (!frameImg) {
                            frameImg = document.createElement('img');
                            frameImg.className = 'vip-frame-img-layer';
                            matchCardContainer.insertBefore(frameImg, matchCardContainer.firstChild);
                        }

                        if (lvl === 2 || lvl === 3) frameImg.src = 'Media/VIP/V23.webp?v=30';
                        else if (lvl >= 4) frameImg.src = 'Media/VIP/45.webp?v=30';

                    } else {
                        if (frameImg) frameImg.remove();
                        matchCardContainer.style.removeProperty('background');
                        matchCardContainer.style.removeProperty('border');
                        matchCardContainer.style.removeProperty('box-shadow');
                    }
                    matchCardContainer.setAttribute('data-vip-processed', String(lvl));
                }
            }

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

                const newClass = `${badgeClass} ${glowClass}`;
                const newSrc = `Media/VIP/vip${lvl}.webp`;

                if (badge.className !== newClass) badge.className = newClass;
                if (badge.getAttribute('src') !== newSrc) badge.src = newSrc;
                
                badge.onerror = function() { this.style.display = 'none'; };
                if (badge.style.display !== 'block') badge.style.display = 'block';
            } else {
                if (badge && badge.style.display !== 'none') badge.style.display = 'none';
            }
        } catch(e) {}
    };

    let isProfileHooked = false;
    setInterval(() => {
        if (!isProfileHooked && typeof window.applyProfileDataToUI === 'function') {
            const originalApplyProfile = window.applyProfileDataToUI;
            window.applyProfileDataToUI = function() {
                let res;
                if (originalApplyProfile) res = originalApplyProfile.apply(this, arguments); 
                try {
                    let profile = arguments[0];
                    let vipLevel = (profile && profile.vipLevel) ? profile.vipLevel : 0;
                    if (typeof window.updateVipBadgeUI === 'function') {
                        window.updateVipBadgeUI('card-my-avatar', vipLevel);
                        window.updateVipBadgeUI('badge-avatar', vipLevel);
                    }
                } catch(e) {}
                return res; 
            };
            isProfileHooked = true;
        }
    }, 1000);

    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (window.ui && window.ui.toggleOnlineUILayout) {
                const origToggle = window.ui.toggleOnlineUILayout;
                window.ui.toggleOnlineUILayout = function() {
                    let res = origToggle.apply(this, arguments); 
                    try {
                        let active = arguments[0];
                        if (active) {
                            let oppVip = (window.currentOpponentData && window.currentOpponentData.vipLevel) ? window.currentOpponentData.vipLevel : 0;
                            if (typeof window.updateVipBadgeUI === 'function') window.updateVipBadgeUI('card-opp-avatar', oppVip);
                        } else {
                            if (typeof window.updateVipBadgeUI === 'function') window.updateVipBadgeUI('card-opp-avatar', 0);
                        }
                    } catch(e) {}
                    return res;
                };
            }
        }, 1000); 
    });

    setInterval(() => {
        if (document.hidden) return;

        try {
            let profileStr = localStorage.getItem('hub_user_profile');
            if (profileStr && typeof window.updateVipBadgeUI === 'function') {
                let p = JSON.parse(profileStr);
                window.updateVipBadgeUI('card-my-avatar', p.vipLevel || 0);
                window.updateVipBadgeUI('badge-avatar', p.vipLevel || 0);
            }
            if (window.isMatchRunning && window.currentOpponentData && typeof window.updateVipBadgeUI === 'function') {
                window.updateVipBadgeUI('card-opp-avatar', window.currentOpponentData.vipLevel || 0);
            }

            // ==============================================================
            // أ. 🌟 معالجة نافذة البروفايل بالكامل (البطاقة الكبيرة) 🌟
            // ==============================================================
            const profileModal = document.getElementById('in-game-profile-modal');
            if (profileModal && profileModal.style.display !== 'none') {
                // استهداف الحاوية الأساسية للنافذة (البطاقة المظلمة)
                const profileCard = profileModal.querySelector('.settings-card') || profileModal.firstElementChild;
                
                if (profileCard) {
                    let vipLvl = 0;
                    const ownActions = document.getElementById('own-profile-actions');
                    
                    if (ownActions && ownActions.style && ownActions.style.display === 'block') {
                        vipLvl = parseInt(JSON.parse(localStorage.getItem('hub_user_profile') || '{}').vipLevel) || 0;
                    } else if (window.gameState && window.gameState.currentViewedPlayer) {
                        vipLvl = parseInt(window.gameState.currentViewedPlayer.vipLevel) || 0;
                    } else if (window.currentOpponentData) {
                        vipLvl = parseInt(window.currentOpponentData.vipLevel) || 0;
                    }

                    const isProcessed = profileCard.getAttribute('data-vip3-processed') === String(vipLvl);
                    if (!isProcessed) {
                        let existingFrame = profileCard.querySelector('.custom-vip3-profile-frame');
                        
                        if (vipLvl >= 3) {
                            // إزالة الحدود الصفراء القديمة مع الحفاظ على الخلفية الأصلية للنافذة
                            profileCard.style.setProperty('border', 'none', 'important');
                            
                            // ضمان أن كل المحتوى يظهر فوق الإطار
                            Array.from(profileCard.children).forEach(child => {
                                if (!child.classList.contains('custom-vip3-profile-frame')) {
                                    child.style.position = 'relative';
                                    child.style.zIndex = '2';
                                }
                            });

                            if (!existingFrame) {
                                let frame = document.createElement('img');
                                frame.src = 'Media/VIP/Vipprofile.webp';
                                frame.className = 'custom-vip3-profile-frame';
                                profileCard.insertBefore(frame, profileCard.firstChild);
                            }
                        } else {
                            if (existingFrame) existingFrame.remove();
                            // إعادة الحدود الأصلية
                            profileCard.style.setProperty('border', '1.5px solid #a88734', 'important');
                        }
                        profileCard.setAttribute('data-vip3-processed', String(vipLvl));
                    }
                }
            }

            // ==============================================================
            // ب. 🌟 معالجة إطار الغرف المتاحة (التطبيق على البطاقة بالكامل) 🌟
            // ==============================================================
            const activeRoomsList = document.getElementById('active-rooms-list');
            if (activeRoomsList) {
                const vipBadges = activeRoomsList.querySelectorAll('img[src*="Media/VIP/vip"]');
                vipBadges.forEach(badge => {
                    const match = badge.src.match(/vip(\d+)\.webp/);
                    if (match) {
                        const lvl = parseInt(match[1]);
                        if (lvl >= 3) {
                            const roomCard = badge.closest('#active-rooms-list > div') || badge.parentElement.parentElement.parentElement;
                            
                            if (roomCard && !roomCard.classList.contains('vip-card-processed')) {
                                roomCard.classList.add('vip-card-processed');
                                roomCard.style.position = 'relative';
                                
                                roomCard.style.setProperty('border', 'none', 'important');

                                Array.from(roomCard.children).forEach(child => {
                                    child.style.position = 'relative';
                                    child.style.zIndex = '2';
                                });

                                if (!roomCard.querySelector('.custom-vip3-card-bg')) {
                                    let frame = document.createElement('img');
                                    frame.src = 'Media/VIP/Vipغرفة.webp';
                                    frame.className = 'custom-vip3-card-bg';
                                    roomCard.insertBefore(frame, roomCard.firstChild);
                                }
                            }
                        }
                    }
                });
            }

            // ==============================================================
            // ج. 🌟 معالجة بطاقة غرفتي في الانتظار (التطبيق على البطاقة بالكامل) 🌟
            // ==============================================================
            const myWaitingRoom = document.getElementById('my-waiting-room-card');
            if (myWaitingRoom && myWaitingRoom.style && myWaitingRoom.style.display !== 'none') {
                let vipLvl = parseInt(JSON.parse(localStorage.getItem('hub_user_profile') || '{}').vipLevel) || 0;
                
                if (vipLvl >= 3 && !myWaitingRoom.classList.contains('vip-card-processed')) {
                    myWaitingRoom.classList.add('vip-card-processed');
                    myWaitingRoom.style.position = 'relative';
                    
                    myWaitingRoom.style.setProperty('border', 'none', 'important');

                    Array.from(myWaitingRoom.children).forEach(child => {
                        child.style.position = 'relative';
                        child.style.zIndex = '2';
                    });

                    if (!myWaitingRoom.querySelector('.custom-vip3-card-bg')) {
                        let frame = document.createElement('img');
                        frame.src = 'Media/VIP/Vipغرفة.webp';
                        frame.className = 'custom-vip3-card-bg';
                        myWaitingRoom.insertBefore(frame, myWaitingRoom.firstChild);
                    }
                }
            }
        } catch(e) {}
    }, 1500); 

})();
