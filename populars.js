/**
 * populars.js
 * يحتوي على 15 هدية شعبية بأسعار واقتصاد متوازن (Economy Balanced)
 * يضمن تشجيع اللاعبين على الشراء بفضل البونص التصاعدي.
 */

const GITHUB_POPULARITY_BASE = "https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/assets/popularity/";

window.POPULARITY_ITEMS = [
    // --- الفئة العادية (مجاملات يومية) ---
    { id: 'pop_1', nameAr: 'وردة بيضاء', price: 10, popValue: 10, mediaType: 'image', imagePath: GITHUB_POPULARITY_BASE + '1.webp' },
    { id: 'pop_2', nameAr: 'وردة حمراء', price: 25, popValue: 25, mediaType: 'image', imagePath: GITHUB_POPULARITY_BASE + '2.webp' },
    { id: 'pop_3', nameAr: 'كوب قهوة', price: 50, popValue: 55, mediaType: 'image', imagePath: GITHUB_POPULARITY_BASE + '3.webp' },

    // --- الفئة البرونزية ---
    { id: 'pop_4', nameAr: 'قطعة حلوى', price: 100, popValue: 115, mediaType: 'image', imagePath: GITHUB_POPULARITY_BASE + '4.webp' },
    { id: 'pop_5', nameAr: 'بالون أزرق', price: 250, popValue: 300, mediaType: 'image', imagePath: GITHUB_POPULARITY_BASE + '5.webp' },
    { id: 'pop_6', nameAr: 'نجمة برونزية', price: 500, popValue: 625, mediaType: 'image', imagePath: GITHUB_POPULARITY_BASE + '6.webp' },

    // --- الفئة الفضية ---
    { id: 'pop_7', nameAr: 'خاتم فضة', price: 1000, popValue: 1300, mediaType: 'image', imagePath: GITHUB_POPULARITY_BASE + '7.webp' },
    { id: 'pop_8', nameAr: 'دب ألعاب', price: 2500, popValue: 3375, mediaType: 'image', imagePath: GITHUB_POPULARITY_BASE + '8.webp' },
    { id: 'pop_9', nameAr: 'ميدالية الشجاعة', price: 5000, popValue: 7000, mediaType: 'image', imagePath: GITHUB_POPULARITY_BASE + '9.webp' },

    // --- الفئة الذهبية ---
    { id: 'pop_10', nameAr: 'عطر فرنسي', price: 7500, popValue: 10875, mediaType: 'image', imagePath: GITHUB_POPULARITY_BASE + '10.webp' },
    { id: 'pop_11', nameAr: 'صندوق موسيقى', price: 10000, popValue: 15000, mediaType: 'image', imagePath: GITHUB_POPULARITY_BASE + '11.webp' },
    { id: 'pop_12', nameAr: 'سيف المحارب', price: 15000, popValue: 23250, mediaType: 'image', imagePath: GITHUB_POPULARITY_BASE + '12.webp' },

    // --- الفئة الماسية والأسطورية (VIP) ---
    { id: 'pop_13', nameAr: 'درع الحماية', price: 25000, popValue: 40000, mediaType: 'image', imagePath: GITHUB_POPULARITY_BASE + '13.webp' },
    { id: 'pop_14', nameAr: 'قلادة الياقوت', price: 35000, popValue: 57750, mediaType: 'image', imagePath: GITHUB_POPULARITY_BASE + '14.webp' },
    
    // --- الهدية المتحركة (فيديو فاخر جداً) ---
    { 
        id: 'pop_15', 
        nameAr: 'سيارة فيراري (متحركة)', 
        price: 50000, 
        popValue: 85000, 
        mediaType: 'video', 
        videoPath: 'http://googleusercontent.com/generated_video_content/16012774795876307422',
        imagePath: GITHUB_POPULARITY_BASE + '15.webp' // صورة مصغرة تظهر في المتجر
    }
];
