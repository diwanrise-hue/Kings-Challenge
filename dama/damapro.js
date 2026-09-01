// damapro.js
// مخصص لإضافة الإطارات الملكية للوحة الشرف، ونظام عرض شارات الـ VIP الديناميكي.
// 🚀 (تحديث الأداء): منع احتساب النمط المستمر (Reflow) واستخدام نظام State Check لتخفيف الضغط عن المعالج (CPU).
// 👑 تخصيص إطارات (Vipprofile.webp) و (Vipغرفة.webp) لـ VIP 3+.

document.addEventListener('DOMContentLoaded', () => {
    window.frameRank1 = 'Media/register/king1.webp'; 
    window.frameRank2 = 'Media/register/king2.webp'; 
    window.frameRank3 = 'Media/register/king3.webp'; 
   console.log("👑 DamaPro: تم تجهيز إطارات لوحة الشرف الملكية بنجاح.");
});

// ==========================================
// 🌟 نظام عرض شارات وإطارات الـ VIP الديناميكي 🌟
// ==========================================
(function() {
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

        @keyframes vipFlameWhite {
            0%, 100% { filter: drop-shadow(0 2px 2px rgba(255,255,255,0.8)) drop-shadow(0 -5px 6px rgba(200,200,255,0.9)); }
            50%  { filter: drop-shadow(0 2px 2px rgba(255,255,255,0.8)) drop-shadow(-2px -8px 8px rgba(255,255,255,0.9)); }
        }
        @keyframes vipFlamePurple {
            0%, 100%   { filter: drop-shadow(0 2px 2px rgba(155,89,182,0.8)) drop-shadow(0 -5px 6px rgba(190,40,210,0.9)); }
            50%  { filter: drop-shadow(0 2px 2px rgba(155,89,182,0.8)) drop-shadow(-2px -8px 8px rgba(155,89,182,0.9)); }
        }
        @keyframes vipFlameRed {
            0%, 100%   { filter: drop-shadow(0 2px 2px rgba(255,0,0,0.8)) drop-shadow(0 -5px 6px rgba(255,69,58,0.9)); }
            50%  { filter: drop-shadow(0 2px 2px rgba(255,0,0,0.8)) drop-shadow(-2px -8px 8px rgba(255,69,58,0.9)); }
        }
        @keyframes vipFlameMixed {
            0%, 100%   { filter: drop-shadow(0 2px 2px rgba(255,215,0,0.8)) drop-shadow(-2px -7px 8px rgba(255,69,58,0.9)); }
            50%  { filter: drop-shadow(0 2px 2px rgba(255,215,0,0.8)) drop-shadow(3px -9px 9px rgba(155,89,182,0.9)); }
        }

        .vip-badge-hub { position: absolute; top: 10px; left: 185px; width: 48px; height: 64px; object-fit: contain; z-index: 1000; pointer-events: none; will-change: transform; transform-style: preserve-3d; }
        .vip-badge-match-me { position: absolute; bottom: -15px; right: -15px; width: 33px; height: 44px; object-fit: contain; z-index: 1000; pointer-events: none; will-change: transform; transform-style: preserve-3d; }
        .vip-badge-match-opp { position: absolute; bottom: -15px; left: -15px; width: 33px; height: 44px; object-fit: contain; z-index: 1000; pointer-events: none; will-change: transform; transform-style: preserve-3d; }

        .vip-glow-white  { animation: vipFloatAndSpin 15s infinite linear, vipFlameWhite 3s infinite alternate ease-in-out; }
        .vip-glow-purple { animation: vipFloatAndSpin 15s infinite linear, vipFlamePurple 3s infinite alternate ease-in-out; }
        .vip-glow-red    { animation: vipFloatAndSpin 15s infinite linear, vipFlameRed 3s infinite alternate ease-in-out; }
        .vip-glow-mixed  { animation: vipFloatAndSpin 15s infinite linear, vipFlameMixed 3s infinite alternate ease-in-out; }

        .vip-frame-img-layer {
            position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important;
            object-fit: fill !important; z-index: 0 !important; border-radius: 20px !important; pointer-events: none !important;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6)) !important; 
        }

        .match-players-flex > div, .match-players-flex > span { position: relative; z-index: 2; }

        .custom-vip3-room-frame {
            position: absolute !important; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) !important; 
            width: 145% !important; height: 145% !important; z-index: 4 !important; pointer-events: none !important; 
            object-fit: contain !important; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.8)) !important;
        }
        
        .custom-vip3-profile-frame {
            position: absolute !important; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) !important; 
            width: 135% !important; height: 135% !important; z-index: 4 !important; pointer-events: none !important; 
            object-fit: contain !important; filter: drop-shadow(0 6px 12px rgba(0,0,0,0.9)) !important;
        }

        /* 🚀 (تحسين أداء): كلاس لإخفاء الإطارات العادية بدلاً من الجافاسكربت لتجنب الـ Reflow */
        .hide-normal-frame { border: none !important; }
        .hide-normal-frame img:not(.custom-vip3-profile-frame):not(.custom-vip3-room-frame):not([src*="vip"]):not(:first-child) { display: none !important; }
    `;
    document.head.appendChild(style);

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

        if (matchCardContainer) {
            let frameImg = matchCardContainer.querySelector('.vip-frame-img-layer');
            let isCurrentLevelProcessed = matchCardContainer.getAttribute('data-vip-processed') === String(lvl);

            // تعديل DOM فقط إذا تغير مستوى الـ VIP أو لم يتم معالجته
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

            // تجنب إعادة تعيين المصدر إذا كان نفسه (يقلل Repaint)
            if (badge.className !== newClass) badge.className = newClass;
            if (badge.getAttribute('src') !== newSrc) badge.src = newSrc;
            
            badge.onerror = function() { this.style.display = 'none'; };
            if (badge.style.display !== 'block') badge.style.display = 'block';
        } else {
            if (badge && badge.style.display !== 'none') badge.style.display = 'none';
        }
    };

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
    }, 1000);

    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (window.ui && window.ui.toggleOnlineUILayout) {
                const origToggle = window.ui.toggleOnlineUILayout;
                window.ui.toggleOnlineUILayout = function(active, oppName, oppAvatar) {
                    origToggle.call(window.ui, active, oppName, oppAvatar); 
                    if (active) {
                        let oppVip = (window.currentOpponentData && window.currentOpponentData.vipLevel) ? window.currentOpponentData.vipLevel : 0;
                        window.updateVipBadgeUI('card-opp-avatar', oppVip);
                    } else {
                        window.updateVipBadgeUI('card-opp-avatar', 0);
                    }
                };
            }
        }, 1000); 
    });

    // 🚀 تحديث الأداء: رفعنا الوقت إلى 1200ms، واستخدمنا نظام التحقق لتجنب تعديل DOM بدون داعي
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

            // أ. معالجة إطار البروفايل الشخصي
            const profileModal = document.getElementById('in-game-profile-modal');
            if (profileModal && profileModal.style.display !== 'none') {
                const igpAvatar = document.getElementById('igp-avatar');
                if (igpAvatar) {
                    let vipLvl = 0;
                    if (document.getElementById('own-profile-actions').style.display === 'block') {
                        vipLvl = parseInt(JSON.parse(localStorage.getItem('hub_user_profile') || '{}').vipLevel) || 0;
                    } else if (window.gameState && window.gameState.currentViewedPlayer) {
                        vipLvl = parseInt(window.gameState.currentViewedPlayer.vipLevel) || 0;
                    } else if (window.currentOpponentData) {
                        vipLvl = parseInt(window.currentOpponentData.vipLevel) || 0;
                    }

                    // 🚀 State Check: لا تعدل الكلاسات أو الـ DOM إذا كانت الحالة معالجة مسبقاً
                    const isProcessed = igpAvatar.getAttribute('data-vip3-processed') === String(vipLvl);
                    if (!isProcessed) {
                        let existingFrame = igpAvatar.querySelector('.custom-vip3-profile-frame');
                        if (vipLvl >= 3) {
                            igpAvatar.classList.add('hide-normal-frame');
                            if (!existingFrame) {
                                let frame = document.createElement('img');
                                frame.src = 'Media/VIP/Vipprofile.webp';
                                frame.className = 'custom-vip3-profile-frame';
                                igpAvatar.appendChild(frame);
                            }
                        } else {
                            if (existingFrame) existingFrame.remove();
                            igpAvatar.classList.remove('hide-normal-frame');
                        }
                        igpAvatar.setAttribute('data-vip3-processed', String(vipLvl));
                    }
                }
            }

            // ب. معالجة إطار الغرف
            const activeRoomsList = document.getElementById('active-rooms-list');
            if (activeRoomsList) {
                const vipBadges = activeRoomsList.querySelectorAll('img[src*="Media/VIP/vip"]');
                vipBadges.forEach(badge => {
                    const match = badge.src.match(/vip(\d+)\.webp/);
                    if (match) {
                        const lvl = parseInt(match[1]);
                        const avatarContainer = badge.parentElement;
                        if (lvl >= 3 && avatarContainer) {
                            // 🚀 State Check
                            if (!avatarContainer.classList.contains('hide-normal-frame')) {
                                avatarContainer.classList.add('hide-normal-frame');
                                if (!avatarContainer.querySelector('.custom-vip3-room-frame')) {
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

            // ج. معالجة بطاقة "غرفتي"
            const myWaitingRoom = document.getElementById('my-waiting-room-card');
            if (myWaitingRoom && myWaitingRoom.style.display !== 'none') {
                let vipLvl = parseInt(JSON.parse(localStorage.getItem('hub_user_profile') || '{}').vipLevel) || 0;
                const myAvatarContainer = document.getElementById('my-waiting-avatar')?.parentElement;
                
                if (myAvatarContainer && vipLvl >= 3) {
                    if (!myAvatarContainer.classList.contains('hide-normal-frame')) {
                        myAvatarContainer.classList.add('hide-normal-frame');
                        const myFrameContainer = document.getElementById('my-waiting-frame');
                        if (myFrameContainer && !myFrameContainer.querySelector('.custom-vip3-room-frame')) {
                            myFrameContainer.innerHTML = `<img src="Media/VIP/Vipغرفة.webp" class="custom-vip3-room-frame">`;
                        }
                    }
                }
            }
        } catch(e) {}
    }, 1200); 

})();
