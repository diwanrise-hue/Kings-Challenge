// ملف: damapro.js
// مخصص لإضافة الإطارات الملكية الشفافة فوق صورة البروفايل ديناميكياً

document.addEventListener('DOMContentLoaded', () => {
    // 1. إضافة الستايل (CSS) الخاص بالإطار الملكي إلى الصفحة
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
            /* 🌟 قللنا طبقة الإطار إلى 10 ليبقى تحت النصوص والمستوى (999) 🌟 */
            z-index: 10 !important;         
            pointer-events: none !important; 
            object-fit: contain;
            filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5)); 
        }
    `;
    document.head.appendChild(frameStyle);

    // 2. البحث عن الكبسولة التي تحتوي على صورة البروفايل
    const avatarCapsule = document.getElementById('badge-avatar');
    
    if (avatarCapsule) {
        const kingFrame = document.createElement('img');
        kingFrame.src = 'king1.webp';
        kingFrame.alt = 'إطار ملكي';
        kingFrame.className = 'avatar-frame-overlay';
        kingFrame.id = 'dynamic-avatar-frame'; 

        // 🌟 السحر هنا: ندرج الإطار الملكي "مباشرة بعد" صورة البروفايل الأساسية، 
        // لكي يكون ترتيبه في كود الـ HTML أسفل صورة البروفايل ولكن "قبل" شارة المستوى والنصوص! 🌟
        avatarCapsule.insertAdjacentElement('afterend', kingFrame);
    }
});
