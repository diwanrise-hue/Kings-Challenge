// ملف: damapro.js
// مخصص لإضافة الإطارات الملكية الشفافة والتحكم بها ديناميكياً للوحة الشرف فقط (تبويب المستوى)
// 🌟 تم فك ارتباط هذا الملف بالواجهة الرئيسية (Main Profile Badge) لتجنب التداخل.

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. تصدير مسارات الإطارات كمتغيرات عامة (Global Variables) 
    // لكي يستطيع ملف uiController.js قراءتها واستخدامها في لوحة الشرف
    window.frameRank1 = 'dama/Media/register/king1.webp'; // إطار المركز الأول 🥇
    window.frameRank2 = 'dama/Media/register/king2.webp'; // إطار المركز الثاني 🥈
    window.frameRank3 = 'dama/Media/register/king3.webp'; // إطار المركز الثالث 🥉

    /* 
       تم حذف الأكواد السابقة التي كانت تستهدف:
       document.getElementById('profile-badge')
       document.getElementById('badge-avatar')
       لضمان بقاء الواجهة الرئيسية نظيفة وعدم تركيب إطارات الـ King عليها بالخطأ.
    */

   console.log("👑 DamaPro: تم تجهيز إطارات لوحة الشرف الملكية بنجاح من مسار dama/Media/register.");
});
