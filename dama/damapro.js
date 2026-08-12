// ملف: damapro.js
// مخصص لإضافة الإطارات الملكية الشفافة والتحكم بها ديناميكياً حسب مستوى اللاعب

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
        /* 🥈 إعدادات الإطار الثاني (king2.webp) - إطار النخبة (مستوى > 2) 🥈 */
        /* ========================================== */
        img[src*="king2"].avatar-frame-overlay {
            top: -3.3px !important;         
            left: -9.95px !important;       
            width: 99px !important;         
            height: 99px !important;        
        }

        /* 🎯 كود إجباري مرتبك بوجود إطار king2.webp لتخفيض LV 1 🎯 */
        #profile-badge:has(img[src*="king2"]) .ai-level-badge,
        #profile-badge.has-king2 .ai-level-badge { 
            bottom: -1.3px !important;   /* نزول تلقائي لـ LV 1 ليستقر داخل المستطيل الأزرق السفلي */
            left: 29px !important;
        }

        /* ========================================== */
        /* 🥉 إعدادات الإطار الثالث (king3.webp) - الإطار الافتراضي 🥉 */
        /* ========================================== */
        img[src*="king3"].avatar-frame-overlay {
            top: -5.3px !important;         
            left: -9.95px !important;       
            width: 99px !important;         
            height: 99px !important;        
        }

        /* 🎯 كود إجباري مرتبك بوجود إطار king3.webp لضبط موقع LV 1 🎯 */
        #profile-badge:has(img[src*="king3"]) .ai-level-badge,
        #profile-badge.has-king3 .ai-level-badge { 
            bottom: 0.2px !important;   /* رفع تلقائي لـ LV 1 ليستقر داخل المستطيل الأزرق لإطار king3 */
            left: 29px !important;
        }
    `;
    document.head.appendChild(frameStyle);

    // 2. البحث عن العناصر الرئيسية في الهيكل
    const avatarCapsule = document.getElementById('badge-avatar');
    const profileBadge = document.getElementById('profile-badge');
    const levelElement = document.getElementById('badge-level');

    if (avatarCapsule && profileBadge) {
        // استخراج رقم المستوى الحقيقي للاعب من عنصر #badge-level (مثال: "LV 3" يُستخرج منه الرقم 3)
        let playerLevel = 1;
        if (levelElement) {
            const levelMatch = levelElement.textContent.match(/\d+/);
            if (levelMatch) {
                playerLevel = parseInt(levelMatch[0], 10);
            }
        }

        // 👑 تحديد الإطار بناءً على المستوى (هدية إطار النخبة king2.webp لأعلى من مستوى 2)
        let frameSrc = 'king3.webp';
        let frameClass = 'has-king3';

        if (playerLevel > 2) {
            frameSrc = 'king2.webp'; // إطار النخبة الملكي
            frameClass = 'has-king2';
        }

        // إضافة الكلاس الحاوية لدعم المتصفحات القديمة
        profileBadge.classList.add(frameClass);

        // إنشاء عنصر الإطار الشفاف
        const currentFrame = document.createElement('img');
        currentFrame.src = frameSrc;
        currentFrame.alt = 'إطار ملكي';
        currentFrame.className = 'avatar-frame-overlay';
        currentFrame.id = 'dynamic-avatar-frame'; 

        // إدراج الإطار الملكي مباشرة بعد كبسولة البروفايل
        avatarCapsule.insertAdjacentElement('afterend', currentFrame);
    }
});
