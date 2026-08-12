// ملف: damapro.js
// مخصص لإضافة الإطارات الملكية الشفافة فوق صورة البروفايل ديناميكياً

document.addEventListener('DOMContentLoaded', () => {
    const frameStyle = document.createElement('style');
    frameStyle.innerHTML = `
        /* ========================================== */
        /* 👑 طبقة الإطار الملكي الشفاف (king1.webp) 👑 */
        /* ========================================== */
        .avatar-frame-overlay {
            position: absolute !important;
            top: -5.9px !important;         
            left: -10.8px !important;       
            width: 100px !important;        
            height: 103px !important;       
            z-index: 4 !important; /* 🌟 تم خفض الطبقة لتكون أسفل النصوص (5) وشارة المستوى (9999) 🌟 */
            pointer-events: none !important; 
            object-fit: contain;
            filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5)); 
        }
    `;
    document.head.appendChild(frameStyle);

    const profileBadge = document.getElementById('profile-badge');
    
    if (profileBadge) {
        const kingFrame = document.createElement('img');
        kingFrame.src = 'king1.webp';
        kingFrame.alt = 'إطار ملكي';
        kingFrame.className = 'avatar-frame-overlay';
        kingFrame.id = 'dynamic-avatar-frame'; 

        // 🌟 الحل السحري: إدراج الإطار "خلف" جميع النصوص وشارة المستوى في هيكل الـ HTML 🌟
        const avatarCapsule = profileBadge.querySelector('.profile-avatar-capsule');
        if (avatarCapsule) {
            avatarCapsule.insertAdjacentElement('afterend', kingFrame);
        } else {
            profileBadge.appendChild(kingFrame);
        }
    }
});
