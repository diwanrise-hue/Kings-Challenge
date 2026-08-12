// ملف: damapro.js
// مخصص لإضافة الإطارات الملكية فوق صورة البروفايل ديناميكياً

document.addEventListener('DOMContentLoaded', () => {
    // 1. إضافة الستايل (CSS) الخاص بالإطار الملكي إلى الصفحة
    const frameStyle = document.createElement('style');
    frameStyle.innerHTML = `
        /* ========================================== */
        /* 👑 طبقة الإطار الملكي (king1.webp) 👑 */
        /* ========================================== */
        .avatar-frame-overlay {
            position: absolute !important;
            top: -5.9px !important;         /* ⬅️ التحكم بالارتفاع */
            left: -10.8px !important;       /* ⬅️ التحكم بالتموضع الأفقي */
            width: 100px !important;        /* ⬅️ عرض الإطار */
            height: 103px !important;       /* ⬅️ ارتفاع الإطار */
            z-index: 20 !important;         /* ⬅️ طبقة عليا فوق البروفايل */
            pointer-events: none !important; /* لمنع إعاقة النقرات */
            object-fit: contain;
            filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5)); /* ظل خفيف للبروز */
        }
    `;
    document.head.appendChild(frameStyle);

    // 2. إنشاء صورة الإطار ووضعها داخل حاوية البروفايل
    const profileBadge = document.getElementById('profile-badge');
    
    if (profileBadge) {
        const kingFrame = document.createElement('img');
        kingFrame.src = 'king1.webp';
        kingFrame.alt = 'إطار ملكي';
        kingFrame.className = 'avatar-frame-overlay';
        kingFrame.id = 'dynamic-avatar-frame'; // معرف للتحكم به مستقبلاً (مثل تغييره أو إخفائه)

        // إضافة الإطار ليكون الابن الأخير داخل الحاوية (ليظهر فوق كل شيء)
        profileBadge.appendChild(kingFrame);
    }
});
