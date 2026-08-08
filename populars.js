/**
 * populars.js
 * يحتوي على 30 هدية شعبية تعتمد على صور (روابط من GitHub)
 */

const GITHUB_POPULARITY_BASE = "https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/assets/popularity/";

window.POPULARITY_ITEMS = [
    // --- الفئة العادية ---
    { id: 'pop_1', nameAr: 'وردة بيضاء', price: 10, imagePath: GITHUB_POPULARITY_BASE + '1.webp' },
    { id: 'pop_2', nameAr: 'وردة حمراء', price: 20, imagePath: GITHUB_POPULARITY_BASE + '2.webp' },
    { id: 'pop_3', nameAr: 'كوب قهوة', price: 30, imagePath: GITHUB_POPULARITY_BASE + '3.webp' },
    { id: 'pop_4', nameAr: 'قطعة حلوى', price: 50, imagePath: GITHUB_POPULARITY_BASE + '4.webp' },
    { id: 'pop_5', nameAr: 'بالون أزرق', price: 80, imagePath: GITHUB_POPULARITY_BASE + '5.webp' },

    // --- الفئة البرونزية ---
    { id: 'pop_6', nameAr: 'نجمة برونزية', price: 100, imagePath: GITHUB_POPULARITY_BASE + '6.webp' },
    { id: 'pop_7', nameAr: 'خاتم فضة', price: 150, imagePath: GITHUB_POPULARITY_BASE + '7.webp' },
    { id: 'pop_8', nameAr: 'دب ألعاب', price: 200, imagePath: GITHUB_POPULARITY_BASE + '8.webp' },
    { id: 'pop_9', nameAr: 'ميدالية الشجاعة', price: 250, imagePath: GITHUB_POPULARITY_BASE + '9.webp' },
    { id: 'pop_10', nameAr: 'عطر فرنسي', price: 300, imagePath: GITHUB_POPULARITY_BASE + '10.webp' },

    // --- الفئة الفضية ---
    { id: 'pop_11', nameAr: 'صندوق موسيقى', price: 400, imagePath: GITHUB_POPULARITY_BASE + '11.webp' },
    { id: 'pop_12', nameAr: 'سيف المحارب', price: 500, imagePath: GITHUB_POPULARITY_BASE + '12.webp' },
    { id: 'pop_13', nameAr: 'درع الحماية', price: 600, imagePath: GITHUB_POPULARITY_BASE + '13.webp' },
    { id: 'pop_14', nameAr: 'قلادة الياقوت', price: 800, imagePath: GITHUB_POPULARITY_BASE + '14.webp' },
    { id: 'pop_15', nameAr: 'شعلة النار', price: 1000, imagePath: GITHUB_POPULARITY_BASE + '15.webp' },

    // --- الفئة الذهبية ---
    { id: 'pop_16', nameAr: 'نجمة ذهبية', price: 1500, imagePath: GITHUB_POPULARITY_BASE + '16.webp' },
    { id: 'pop_17', nameAr: 'كيس ذهب', price: 2000, imagePath: GITHUB_POPULARITY_BASE + '17.webp' },
    { id: 'pop_18', nameAr: 'سيارة رياضية', price: 2500, imagePath: GITHUB_POPULARITY_BASE + '18.webp' },
    { id: 'pop_19', nameAr: 'زمردة نادرة', price: 3000, imagePath: GITHUB_POPULARITY_BASE + '19.webp' },
    { id: 'pop_20', nameAr: 'حصان خرافي', price: 5000, imagePath: GITHUB_POPULARITY_BASE + '20.webp' },

    // --- الفئة الماسية ---
    { id: 'pop_21', nameAr: 'ماسة زرقاء', price: 10000, imagePath: GITHUB_POPULARITY_BASE + '21.webp' },
    { id: 'pop_22', nameAr: 'تاج الملك', price: 15000, imagePath: GITHUB_POPULARITY_BASE + '22.webp' },
    { id: 'pop_23', nameAr: 'صندوق الكنز', price: 20000, imagePath: GITHUB_POPULARITY_BASE + '23.webp' },
    { id: 'pop_24', nameAr: 'يخت فاخر', price: 25000, imagePath: GITHUB_POPULARITY_BASE + '24.webp' },
    { id: 'pop_25', nameAr: 'قصر ملكي', price: 50000, imagePath: GITHUB_POPULARITY_BASE + '25.webp' },

    // --- الفئة الأسطورية (الملايين) ---
    { id: 'pop_26', nameAr: 'تنين ناري', price: 100000, imagePath: GITHUB_POPULARITY_BASE + '26.webp' },
    { id: 'pop_27', nameAr: 'طائرة خاصة', price: 250000, imagePath: GITHUB_POPULARITY_BASE + '27.webp' },
    { id: 'pop_28', nameAr: 'صاروخ فضائي', price: 500000, imagePath: GITHUB_POPULARITY_BASE + '28.webp' },
    { id: 'pop_29', nameAr: 'كوكب ذهبي', price: 750000, imagePath: GITHUB_POPULARITY_BASE + '29.webp' },
    { id: 'pop_30', nameAr: 'مجرة أسطورية', price: 1000000, imagePath: GITHUB_POPULARITY_BASE + '30.webp' }
];
