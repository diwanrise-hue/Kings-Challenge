/**
 * populars.js
 * يحتوي على 15 هدية شعبية (14 صورة ثابتة، وهدية واحدة متحركة)
 */

const GITHUB_POPULARITY_BASE = "https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/assets/popularity/";

window.POPULARITY_ITEMS = [
    // --- الفئة العادية ---
    { id: 'pop_1', nameAr: 'وردة بيضاء', price: 10, mediaType: 'image', imagePath: GITHUB_POPULARITY_BASE + '1.webp' },
    { id: 'pop_2', nameAr: 'وردة حمراء', price: 20, mediaType: 'image', imagePath: GITHUB_POPULARITY_BASE + '2.webp' },
    { id: 'pop_3', nameAr: 'كوب قهوة', price: 30, mediaType: 'image', imagePath: GITHUB_POPULARITY_BASE + '3.webp' },

    // --- الفئة البرونزية ---
    { id: 'pop_4', nameAr: 'قطعة حلوى', price: 50, mediaType: 'image', imagePath: GITHUB_POPULARITY_BASE + '4.webp' },
    { id: 'pop_5', nameAr: 'بالون أزرق', price: 80, mediaType: 'image', imagePath: GITHUB_POPULARITY_BASE + '5.webp' },
    { id: 'pop_6', nameAr: 'نجمة برونزية', price: 100, mediaType: 'image', imagePath: GITHUB_POPULARITY_BASE + '6.webp' },

    // --- الفئة الفضية ---
    { id: 'pop_7', nameAr: 'خاتم فضة', price: 150, mediaType: 'image', imagePath: GITHUB_POPULARITY_BASE + '7.webp' },
    { id: 'pop_8', nameAr: 'دب ألعاب', price: 200, mediaType: 'image', imagePath: GITHUB_POPULARITY_BASE + '8.webp' },
    { id: 'pop_9', nameAr: 'ميدالية الشجاعة', price: 250, mediaType: 'image', imagePath: GITHUB_POPULARITY_BASE + '9.webp' },

    // --- الفئة الذهبية ---
    { id: 'pop_10', nameAr: 'عطر فرنسي', price: 300, mediaType: 'image', imagePath: GITHUB_POPULARITY_BASE + '10.webp' },
    { id: 'pop_11', nameAr: 'صندوق موسيقى', price: 400, mediaType: 'image', imagePath: GITHUB_POPULARITY_BASE + '11.webp' },
    { id: 'pop_12', nameAr: 'سيف المحارب', price: 500, mediaType: 'image', imagePath: GITHUB_POPULARITY_BASE + '12.webp' },

    // --- الفئة الماسية ---
    { id: 'pop_13', nameAr: 'درع الحماية', price: 600, mediaType: 'image', imagePath: GITHUB_POPULARITY_BASE + '13.webp' },
    { id: 'pop_14', nameAr: 'قلادة الياقوت', price: 800, mediaType: 'image', imagePath: GITHUB_POPULARITY_BASE + '14.webp' },
    
    // --- الهدية المتحركة (فيديو) ---
    { 
        id: 'pop_15', 
        nameAr: 'سيارة فيراري (متحركة)', 
        price: 1000, 
        mediaType: 'video', 
        videoPath: 'http://googleusercontent.com/generated_video_content/16012774795876307422' 
    }
];
