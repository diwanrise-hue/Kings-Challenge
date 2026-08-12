// ملف: damapro.js
// مخصص لإضافة الإطارات الملكية الشفافة فوق صورة البروفايل ديناميكياً بذكاء

document.addEventListener('DOMContentLoaded', () => {
    // 1. إضافة الستايل (CSS) الشامل لجميع الإطارات الملكية
    const frameStyle = document.createElement('style');
    frameStyle.innerHTML = `
        /* ========================================== */
        /* 👑 الخصائص المشتركة لأي إطار يضاف فوق البروفايل 👑 */
        /* ========================================== */
        .avatar-frame-overlay {
            position: absolute !important;
            z-index: 10 !important;         /* طبقة عليا فوق البروفايل ولكن أسفل النصوص */
            pointer-events: none !important; /* لمنع إعاقة النقرات */
            object-fit: contain;
            filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5)); /* ظل خفيف للبروز 3D */
            transition: all 0.3s ease;
        }

        /* ========================================== */
        /* 🥇 إعدادات الإطار الأول (king1.webp) - لمتصدري الموسم 🥇 */
        /* ========================================== */
        img[src*="king1"].avatar-frame-overlay {
            top: -5.9px !important;         
            left: -10.8px !important;       
            width: 100px !important;        
            height: 103px !important;       
        }

        /* ========================================== */
        /* 🥈 إعدادات الإطار الثاني (king2.webp) - الإطار الأساسي الحالي 🥈 */
        /* ========================================== */
        img[src*="king2"].avatar-frame-overlay {
            top: -3.3px !important;         
            left: -9.95px !important;       
            width: 99px !important;         
            height: 99px !important;        
        }

        /* ======================================================= */
        /* 🎯 كود إجباري مرتبط بوجود إطار king2.webp لتخفيض LV 1 🎯 */
        /* ======================================================= */
        #profile-badge:has(img[src*="king2"]) .ai-level-badge,
        #profile-badge.has-king2 .ai-level-badge { 
            bottom: -1.3px !important;   /* نزول تلقائي لـ LV 1 ليستقر داخل المستطيل الأزرق السفلي */
            left: 29px !important;
        }
    `;
    document.head.appendChild(frameStyle);

    // 2. البحث عن الكبسولة التي تحتوي على صورة البروفايل الأساسية
    const avatarCapsule = document.getElementById('badge-avatar');
    
    if (avatarCapsule) {
        const currentFrame = document.createElement('img');
        
        // 🌟 يمكنك مستقبلاً تغيير "king2.webp" إلى "king1.webp" هنا، وسيتكيف النظام تلقائياً مع القياسات! 🌟
        currentFrame.src = 'king2.webp';
        currentFrame.alt = 'إطار ملكي';
        currentFrame.className = 'avatar-frame-overlay';
        currentFrame.id = 'dynamic-avatar-frame'; 

        // ندرج الإطار الملكي "مباشرة بعد" الكبسولة لضمان الترتيب السليم للطبقات
        avatarCapsule.insertAdjacentElement('afterend', currentFrame);
    }
});
