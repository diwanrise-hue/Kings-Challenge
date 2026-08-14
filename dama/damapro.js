// ملف: damapro.js
// مخصص لإضافة الإطارات الملكية الشفافة والتحكم بها ديناميكياً حسب مستوى اللاعب أو مركزه في لوحة الشرف

document.addEventListener('DOMContentLoaded', () => {
    // 1. إضافة الستايل (CSS) الشامل لجميع الإطارات الملكية وتنسيقات المراكز
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
        /* 🥇 إعدادات الإطار الأول (king1.webp) - المركز الأول 🥇 */
        /* ========================================== */
        img[src*="king1"].avatar-frame-overlay {
            top: -5.9px !important;         
            left: -10.8px !important;       
            width: 100px !important;        
            height: 103px !important;       
        }
        #profile-badge:has(img[src*="king1"]) .ai-level-badge,
        #profile-badge.has-king1 .ai-level-badge { 
            bottom: -1.3px !important;   
            left: 29px !important;
        }

        /* ========================================== */
        /* 🥈 إعدادات الإطار الثاني (king2.webp) - المركز الثاني 🥈 */
        /* ========================================== */
        img[src*="king2"].avatar-frame-overlay {
            top: -3.3px !important;         
            left: -9.95px !important;       
            width: 99px !important;         
            height: 99px !important;        
        }
        #profile-badge:has(img[src*="king2"]) .ai-level-badge,
        #profile-badge.has-king2 .ai-level-badge { 
            bottom: -1.3px !important;   
            left: 29px !important;
        }

        /* ========================================== */
        /* 🥉 إعدادات الإطار الثالث (king3.webp) - المركز الثالث 🥉 */
        /* ========================================== */
        img[src*="king3"].avatar-frame-overlay {
            top: -5.3px !important;         
            left: -9.95px !important;       
            width: 99px !important;         
            height: 99px !important;        
        }
        #profile-badge:has(img[src*="king3"]) .ai-level-badge,
        #profile-badge.has-king3 .ai-level-badge { 
            bottom: 0.2px !important;   
            left: 29px !important;
        }
    `;
    document.head.appendChild(frameStyle);

    // 2. البحث عن العناصر الرئيسية في الهيكل
    const avatarCapsule = document.getElementById('badge-avatar');
    const profileBadge = document.getElementById('profile-badge');
    const levelElement = document.getElementById('badge-level');

    if (avatarCapsule && profileBadge) {
        // استخراج رقم المستوى الحقيقي للاعب من عنصر #badge-level
        let playerLevel = 1;
        if (levelElement) {
            const levelMatch = levelElement.textContent.match(/\d+/);
            if (levelMatch) {
                playerLevel = parseInt(levelMatch[0], 10);
            }
        }

        // 👑 تحديد الإطار بناءً على رتبة المركز أو المستوى الافتراضي للبروفايل
        // ملاحظة: يمكنك ربط هذا المتغير لاحقاً برقم مركز اللاعب الفعلي في لوحة الشرف (مثلاً من بيانات السيرفر)
        let frameSrc = 'king3.webp'; // الافتراضي (المركز الثالث أو المستويات العادية)
        let frameClass = 'has-king3';

        // محاولة جلب ترتيب اللاعب في لوحة الشرف إن وُجد مخزناً أو متاحاً بالصفحة
        let playerRank = window.currentAuthenticatedUserRank || null; 

        if (playerRank === 1) {
            frameSrc = 'king1.webp';
            frameClass = 'has-king1';
        } else if (playerRank === 2) {
            frameSrc = 'king2.webp';
            frameClass = 'has-king2';
        } else if (playerRank === 3) {
            frameSrc = 'king3.webp';
            frameClass = 'has-king3';
        } else {
            // منطق افتراضي يعتمد على المستوى إذا لم يكن في المراكز الثلاثة الأولى
            if (playerLevel >= 5) {
                frameSrc = 'king1.webp';
                frameClass = 'has-king1';
            } else if (playerLevel > 2) {
                frameSrc = 'king2.webp';
                frameClass = 'has-king2';
            } else {
                frameSrc = 'king3.webp';
                frameClass = 'has-king3';
            }
        }

        // إضافة الكلاس الحاوية لدعم المتصفحات وتعديل التموضع
        profileBadge.classList.add(frameClass);

        // إنشاء عنصر الإطار الشفاف
        const currentFrame = document.createElement('img');
        currentFrame.src = frameSrc;
        currentFrame.alt = 'إطار ملكي للمراكز';
        currentFrame.className = 'avatar-frame-overlay';
        currentFrame.id = 'dynamic-avatar-frame'; 

        // إدراج الإطار الملكي مباشرة بعد كبسولة البروفايل
        avatarCapsule.insertAdjacentElement('afterend', currentFrame);
    }
});
