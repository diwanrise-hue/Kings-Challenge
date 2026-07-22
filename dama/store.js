// ==========================================
// ملف store.js - النسخة النهائية المحدثة الشاملة المدمجة برمجياً بروابط جيت هاب المباشرة
// ==========================================

const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/";

export const STORE_ITEMS = {
    // ===================================
    // أولاً: الخلفيات واللوحات (Backgrounds & Boards)
    // ===================================
    
    'bg_wood': { 
        type: 'bg', isDefault: true, nameAr: 'الخشب الفاخر', nameEn: 'Premium Wood', light: '#DEB887', dark: '#8B4513'
    },

    'bg_malachite': { 
        type: 'bg', cost: 3000, isLegendary: true, nameAr: 'رخام الملاكيت الأخضر', nameEn: 'Malachite Green Marble',
        isImage: true, imagePath: GITHUB_RAW_BASE + 'assets/bgs/1000134548.webp'
    },

    'bg_carved_wood': { 
        type: 'bg', cost: 1000, nameAr: 'الخشب المحفور', nameEn: 'Carved Wood',
        cssLight: 'background: repeating-linear-gradient(45deg, #DEB887, #DEB887 10px, #D2A679 10px, #D2A679 20px); box-shadow: inset 0 0 15px rgba(100,50,0,0.5);',
        cssDark: 'background: repeating-linear-gradient(-45deg, #8B4513, #8B4513 15px, #65320D 15px, #65320D 30px); box-shadow: inset 0 0 20px rgba(0,0,0,0.8);'
    },

    'bg_mosaic': { 
        type: 'bg', cost: 1500, nameAr: 'الموزاييك الملكي', nameEn: 'Royal Mosaic',
        cssLight: 'background-color: #E2D4B7; background-image: radial-gradient(circle at 50% 50%, #4A2E15 15%, transparent 18%), repeating-conic-gradient(from 0deg at 50% 50%, #C4AE8D 0deg, #C4AE8D 15deg, transparent 15deg, transparent 30deg); box-shadow: inset 0 0 10px rgba(74,46,21,0.4); border: 1px solid rgba(74,46,21,0.2);',
        cssDark: 'background-color: #3B2314; background-image: radial-gradient(circle at 50% 50%, #E2D4B7 10%, transparent 13%), radial-gradient(circle at 50% 50%, transparent 40%, #1E110A 45%, #1E110A 50%, transparent 55%), repeating-conic-gradient(from 15deg at 50% 50%, #2A170D 0deg, #2A170D 22.5deg, transparent 22.5deg, transparent 45deg); box-shadow: inset 0 0 15px rgba(0,0,0,0.8); border: 1px solid #1E110A;'
    },

    'bg_image_royal': { 
        type: 'bg', cost: 4000, isLegendary: true, nameAr: 'الساحة الملكية الفاخرة', nameEn: 'Premium Royal Arena', isImage: true, imagePath: GITHUB_RAW_BASE + 'assets/bgs/1000133232.webp'
    },

    'bg_image_lava': { 
        type: 'bg', cost: 4500, isLegendary: true, nameAr: 'ساحة الحمم البركانية', nameEn: 'Volcanic Lava Arena', isImage: true, imagePath: GITHUB_RAW_BASE + 'assets/bgs/1000133390.webp'
    },

    'bg_custom_warrior': { 
        type: 'bg', cost: 5000, isLegendary: true, nameAr: 'ساحة كتيبة الأبطال', nameEn: 'Hero Battalion Arena', isImage: true, imagePath: GITHUB_RAW_BASE + 'assets/bgs/1000134166.webp'
    },

    'bg_ruby_amber': { 
        type: 'bg', cost: 50000, isLegendary: true, nameAr: 'الياقوت والكهرمان الملكي', nameEn: 'Royal Ruby & Amber', isImage: true, imagePath: GITHUB_RAW_BASE + 'assets/bgs/10001320889.webp'
    },

    'bg_mahogany': { 
        type: 'bg', cost: 2000, nameAr: 'ساحة الماهوجني الكلاسيكية', nameEn: 'Classic Mahogany Arena', isImage: true, imagePath: GITHUB_RAW_BASE + 'assets/bgs/1000134903.webp'
    },

    'bg_turquoise_geometric': {
        type: 'bg', cost: 2200, nameAr: 'ساحة الفيروز والزخارف الهندسية', nameEn: 'Geometric Turquoise & Gold Arena', isImage: true, imagePath: GITHUB_RAW_BASE + 'assets/bgs/1000134417.webp', hasPurpleBorder: true
    },

    'bg_black_gold_marble': {
        type: 'bg', cost: 2500, nameAr: 'ساحة الرخام الأسود والعروق الذهبية', nameEn: 'Classic Black & Gold Marble Arena', isImage: true, imagePath: GITHUB_RAW_BASE + 'assets/bgs/1000134427.webp', hasPurpleBorder: true
    },

    'bg_blue_navy_marble': {
        type: 'bg', cost: 2600, nameAr: 'ساحة الرخام الأزرق الداكن والبيج', nameEn: 'Navy Blue & Beige Marble Arena', isImage: true, imagePath: GITHUB_RAW_BASE + 'assets/bgs/1000136612.webp', hasPurpleBorder: true
    },

    'bg_brown_gold_leaves': {
        type: 'bg', cost: 2800, nameAr: 'ساحة الرخام البني والزخارف الذهبية', nameEn: 'Brown Marble & Golden Leaves Arena', isImage: true, imagePath: GITHUB_RAW_BASE + 'assets/bgs/1000136622.webp', hasPurpleBorder: true
    },

    'bg_samurai_warriors': {
        type: 'bg', cost: 100000, isLegendary: true, nameAr: 'ساحة محاربي الساموراي الأسطورية', nameEn: 'Legendary Samurai Warriors Arena', isImage: true, imagePath: GITHUB_RAW_BASE + 'assets/bgs/1000136302.webp'
    },

    'bg_jester_theater': {
        type: 'bg', cost: 150000, isLegendary: true, nameAr: 'ساحة مسرح جيستر', nameEn: 'Jester Theater Arena', isImage: true, imagePath: GITHUB_RAW_BASE + 'assets/bgs/1000136557.webp'
    },

    // ===================================
    // ثانياً: الإطارات (Frames) 
    // ===================================
    
    'fr_classic': { 
        type: 'fr', isDefault: true, nameAr: 'إطار خشبي كلاسيكي', nameEn: 'Classic Wood Frame',
        cssBoard: 'border: 12px solid #5C3A21; border-radius: 8px; box-shadow: 0 20px 40px rgba(0,0,0,0.5), 0 0 0 2px rgba(255,255,255,0.05), inset 0 0 15px rgba(0,0,0,0.9); border-image: repeating-linear-gradient(45deg, #5C3A21, #5C3A21 10px, #4A2E1B 10px, #4A2E1B 20px) 12;',
        customCSS: `
            #board { 
                border: 12px solid #5C3A21 !important; 
                border-radius: 8px !important; 
                box-shadow: 0 20px 40px rgba(0,0,0,0.5), 0 0 0 2px rgba(255,255,255,0.05), inset 0 0 15px rgba(0,0,0,0.9) !important; 
                border-image: repeating-linear-gradient(45deg, #5C3A21, #5C3A21 10px, #4A2E1B 10px, #4A2E1B 20px) 12 !important;
                box-sizing: border-box !important;
                width: 100vw !important;
                max-width: 100vw !important;
                height: 100vw !important;
                position: relative !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                margin: 0 !important;
                padding: 0 !important;
                aspect-ratio: 1 / 1 !important;
                transition: all 0.5s ease; 
            }
        `
    },

    'fr_1000135477': { 
        type: 'fr', cost: 3500, isLegendary: true, nameAr: 'إطار كتيبة الأبطال', nameEn: 'Hero Battalion Frame',
        isImage: true, 
        imagePath: GITHUB_RAW_BASE + 'assets/frames/1000135477.webp',
        customCSS: `
            #board { 
                border: 5vw solid transparent !important; 
                border-image: url('${GITHUB_RAW_BASE}assets/frames/1000135477.webp') 7.2% stretch !important; 
                border-image-outset: 0 !important; 
                border-radius: 0 !important; 
                background-clip: padding-box !important; 
                box-sizing: border-box !important;
                width: 100vw !important;
                max-width: 100vw !important;
                height: 100vw !important;
                position: relative !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                margin: 0 !important;
                padding: 0 !important;
                aspect-ratio: 1 / 1 !important;
                transition: all 0.3s ease; 
            }
            .board-coordinates, 
            .notation-322f9, 
            .cg-wrap coords, 
            svg text { 
                display: none !important; 
            }
            @media (min-width: 768px) { 
                #board { border-width: 25px !important; } 
            }
        `
    },
    
    'fr_ruby_amber': { 
        type: 'fr', cost: 40000, isLegendary: true, nameAr: 'إطار الياقوت والكهرمان الملكي', nameEn: 'Royal Ruby & Amber Frame',
        isImage: true, 
        imagePath: GITHUB_RAW_BASE + 'assets/frames/1000134883.webp',
        customCSS: `
            #board { 
                border: 8vw solid transparent !important; 
                border-image: url('${GITHUB_RAW_BASE}assets/frames/1000134883.webp') 9.5% stretch !important; 
                border-radius: 0 !important; 
                box-sizing: border-box !important;
                width: 100vw !important;
                max-width: 100vw !important;
                height: 100vw !important;
                position: relative !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                margin: 0 !important;
                padding: 0 !important;
                aspect-ratio: 1 / 1 !important;
                transition: all 0.5s ease; 
            }
            @media (min-width: 768px) { #board { border-width: 45px !important; } }
        `
    },

    'fr_mahogany': { 
        type: 'fr', cost: 2500, nameAr: 'إطار الماهوجني المرقم', nameEn: 'Numbered Mahogany Frame',
        isImage: true, 
        imagePath: GITHUB_RAW_BASE + 'assets/frames/1000134904.webp',
        customCSS: `
            #board { 
                border: 6vw solid transparent !important; 
                border-image: url('${GITHUB_RAW_BASE}assets/frames/1000134904.webp') 5% stretch !important; 
                border-radius: 0 !important; 
                box-sizing: border-box !important;
                width: 100vw !important;
                max-width: 100vw !important;
                height: 100vw !important;
                position: relative !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                margin: 0 !important;
                padding: 0 !important;
                aspect-ratio: 1 / 1 !important;
                transition: all 0.5s ease; 
            }
            @media (min-width: 768px) { #board { border-width: 45px !important; } }
        `
    },

    'fr_samurai_warriors': { 
        type: 'fr', cost: 70000, isLegendary: true, nameAr: 'إطار محاربي الساموراي', nameEn: 'Samurai Warriors Frame',
        isImage: true, 
        imagePath: GITHUB_RAW_BASE + 'assets/frames/1000136304.webp',
        customCSS: `
            #board { 
                border: 4.5vw solid transparent !important; 
                border-image: url('${GITHUB_RAW_BASE}assets/frames/1000136304.webp') 5% stretch !important; 
                border-radius: 0 !important; 
                box-sizing: border-box !important;
                width: 100vw !important;
                max-width: 100vw !important;
                height: 100vw !important;
                position: relative !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                margin: 0 !important;
                padding: 0 !important;
                aspect-ratio: 1 / 1 !important;
                transition: all 0.5s ease; 
            }
            @media (min-width: 768px) { #board { border-width: 28px !important; } }
        `
    },

    'fr_jester_theater': { 
        type: 'fr', cost: 85000, isLegendary: true, nameAr: 'إطار مسرح جيستر', nameEn: 'Jester Theater Frame',
        isImage: true, 
        imagePath: GITHUB_RAW_BASE + 'assets/frames/1000136584.webp',
        customCSS: `
            #board { 
                border: 6.5vw solid transparent !important; 
                border-image: url('${GITHUB_RAW_BASE}assets/frames/1000136584.webp') 8% stretch !important; 
                border-radius: 0 !important; 
                box-sizing: border-box !important;
                width: 100vw !important;
                max-width: 100vw !important;
                height: 100vw !important;
                position: relative !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                margin: 0 !important;
                padding: 0 !important;
                aspect-ratio: 1 / 1 !important;
                transition: all 0.5s ease; 
            }
            @media (min-width: 768px) { #board { border-width: 40px !important; } }
        `
    },

    'fr_blue_navy_marble': { 
        type: 'fr', cost: 3000, nameAr: 'إطار الرخام الأزرق الداكن المرقم', nameEn: 'Numbered Navy Blue Marble Frame',
        isImage: true, 
        imagePath: GITHUB_RAW_BASE + 'assets/frames/1000136630.webp',
        customCSS: `
            #board { 
                border: 5.5vw solid transparent !important; 
                border-image: url('${GITHUB_RAW_BASE}assets/frames/1000136630.webp') 6% stretch !important; 
                border-radius: 0 !important; 
                box-sizing: border-box !important;
                width: 100vw !important;
                max-width: 100vw !important;
                height: 100vw !important;
                position: relative !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                margin: 0 !important;
                padding: 0 !important;
                aspect-ratio: 1 / 1 !important;
                transition: all 0.5s ease; 
            }
            @media (min-width: 768px) { #board { border-width: 35px !important; } }
        `
    },

    'fr_royal_luxury': { 
        type: 'fr', cost: 6000, isLegendary: true, nameAr: 'الإطار الملكي الفاخر', nameEn: 'Royal Luxury Frame',
        isImage: true, 
        imagePath: GITHUB_RAW_BASE + 'assets/frames/1000136629.webp',
        customCSS: `
            #board { 
                border: 7vw solid transparent !important; 
                border-image: url('${GITHUB_RAW_BASE}assets/frames/1000136629.webp') 8% stretch !important; 
                border-radius: 0 !important; 
                box-sizing: border-box !important;
                width: 100vw !important;
                max-width: 100vw !important;
                height: 100vw !important;
                position: relative !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                margin: 0 !important;
                padding: 0 !important;
                aspect-ratio: 1 / 1 !important;
                transition: all 0.5s ease; 
            }
            @media (min-width: 768px) { #board { border-width: 45px !important; } }
        `
    },

    // ===================================
    // ثالثاً: الأحجار والبيادق (Pieces & Stones)
    // ===================================
    
    'pc_original': { type: 'pc', isDefault: true, nameAr: 'النمط الأصلي', nameEn: 'Original', icon: '⚪' },

    'pc_carved_wood': { 
        type: 'pc', cost: 150, nameAr: 'خشب محفور', nameEn: 'Carved Wood',
        icon: '<div style="position: absolute; top: 17.5%; left: 17.5%; width: 65%; height: 65%; border-radius: 50%; background: inherit; box-shadow: inset 4px 4px 8px rgba(0,0,0,0.4), inset -3px -3px 6px rgba(255,255,255,0.3); pointer-events: none;"></div>',
        wCss: `background: #E6C280; border: 2px solid #C08A4C; box-shadow: inset 0 0 10px rgba(0,0,0,0.2), 2px 2px 5px rgba(0,0,0,0.4);`,
        bCss: `background: #5C3A21; border: 2px solid #3E2723; box-shadow: inset 0 0 10px rgba(0,0,0,0.5), 2px 2px 5px rgba(0,0,0,0.6);`,
        customPseudoCss: `
            body[data-piece-style="pc_carved_wood"] .piece::before {
                content: ''; position: absolute; width: 65%; height: 65%; border-radius: 50%;
                background: inherit; box-shadow: inset 4px 4px 8px rgba(0,0,0,0.4), inset -3px -3px 6px rgba(255,255,255,0.3);
            }
            body[data-piece-style="pc_carved_wood"] .piece.dama::after {
                content: '👑'; color: #FFD700; font-size: 16px; z-index: 2; text-shadow: 0 0 5px rgba(0,0,0,0.8); display:flex; align-items:center; justify-content:center;
            }
        `,
        dCss: 'border: 3px solid #FFD700; box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);'
    },

    'pc_ebony_gold': { 
        type: 'pc', cost: 1000, nameAr: 'الأبنوس الذهبي', nameEn: 'Royal Ebony Gold',
        icon: '<div style="position: absolute; top: 32.5%; left: 32.5%; width: 35%; height: 35%; border-radius: 50%; border: 1.5px solid #D4AF37; background: rgba(0,0,0,0.1); pointer-events: none;"></div>',
        wCss: `background: #FDFBF7; border: 2px solid #D4AF37; box-shadow: inset 0 0 15px rgba(212, 175, 55, 0.2), 0 4px 8px rgba(0,0,0,0.3);`,
        bCss: `background: #1A1A1A; border: 2px solid #D4AF37; box-shadow: inset 0 0 20px rgba(0,0,0,0.9), 0 4px 8px rgba(0,0,0,0.5);`,
        customPseudoCss: `
            body[data-piece-style="pc_ebony_gold"] .piece::before {
                content: ''; position: absolute; width: 65%; height: 65%;
                border: 1.5px solid #D4AF37;
                clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
                z-index: 1;
            }
            body[data-piece-style="pc_ebony_gold"] .piece::after {
                content: ''; position: absolute; width: 35%; height: 35%;
                border-radius: 50%; border: 1.5px solid #D4AF37;
                z-index: 2; background: rgba(0,0,0,0.05);
            }
            body[data-piece-style="pc_ebony_gold"] .piece.black::after {
                background: #222;
            }
            body[data-piece-style="pc_ebony_gold"] .piece.dama::after {
                content: '👑'; color: #FFF; font-size: 13px; background: #D4AF37; border: 1px solid #FFF; display:flex; align-items:center; justify-content:center; box-shadow: 0 0 10px #D4AF37;
            }
        `,
        dCss: 'border: 2px solid #FFF; box-shadow: 0 0 20px #D4AF37;'
    },

    'pc_custom_warrior': { 
        type: 'pc', cost: 2500, isLegendary: true, nameAr: 'كتيبة الأبطال', nameEn: 'Hero Battalion',
        isImage: true, 
        imagePathWhite: GITHUB_RAW_BASE + 'assets/pieces/1000133464.webp', 
        imagePathBlack: GITHUB_RAW_BASE + 'assets/pieces/1000133465.webp', 
        damaImagePathWhite: GITHUB_RAW_BASE + 'assets/pieces/1000133463.webp', 
        damaImagePathBlack: GITHUB_RAW_BASE + 'assets/pieces/1000133466.webp'  
    },

    'pc_samurai_legends': { 
        type: 'pc', cost: 5000, isLegendary: true, nameAr: 'نمط محاربي الساموراي', nameEn: 'Samurai Legends',
        isImage: true, 
        imagePathWhite: GITHUB_RAW_BASE + 'assets/pieces/1000135430.webp', 
        imagePathBlack: GITHUB_RAW_BASE + 'assets/pieces/1000135417.webp', 
        damaImagePathWhite: GITHUB_RAW_BASE + 'assets/pieces/1000135428.webp', 
        damaImagePathBlack: GITHUB_RAW_BASE + 'assets/pieces/1000135418.webp'  
    },

    'pc_death_skulls': { 
        type: 'pc', cost: 5500, isLegendary: true, nameAr: 'جماجم الموت الأسطورية', nameEn: 'Legendary Death Skulls',
        isImage: true, 
        imagePathWhite: GITHUB_RAW_BASE + 'assets/pieces/1000135429.webp', 
        imagePathBlack: GITHUB_RAW_BASE + 'assets/pieces/1000135421.webp', 
        damaImagePathWhite: GITHUB_RAW_BASE + 'assets/pieces/1000135424.webp', 
        damaImagePathBlack: GITHUB_RAW_BASE + 'assets/pieces/1000135420.webp'
    },

    'pc_oak_leaf': { 
        type: 'pc', cost: 5000, isLegendary: true, nameAr: 'طاقم البلوط والتاج الملكي الأسطوري', nameEn: 'Royal Oak Leaf & Crown Set',
        isImage: true, 
        imagePathWhite: GITHUB_RAW_BASE + 'assets/pieces/1000135694.webp',     
        imagePathBlack: GITHUB_RAW_BASE + 'assets/pieces/1000135693.webp',     
        damaImagePathWhite: GITHUB_RAW_BASE + 'assets/pieces/1000135689.webp',  
        damaImagePathBlack: GITHUB_RAW_BASE + 'assets/pieces/1000135692.webp'   
    },

    'pc_crane_emerald': {
        type: 'pc', cost: 6000, isLegendary: true, nameAr: 'طاقم طائر الكركي والزمرد الأسطوري', nameEn: 'Legendary Emerald & Tiger Eye Crown Set',
        isImage: true,
        imagePathWhite: GITHUB_RAW_BASE + 'assets/pieces/1000135702.webp',     
        imagePathBlack: GITHUB_RAW_BASE + 'assets/pieces/1000135701.webp',     
        damaImagePathWhite: GITHUB_RAW_BASE + 'assets/pieces/1000135689.webp',  
        damaImagePathBlack: GITHUB_RAW_BASE + 'assets/pieces/1000135692.webp'   
    },

    'pc_royal_sun': {
        type: 'pc', cost: 6500, isLegendary: true, nameAr: 'طاقم شمس الرخام والبرونز الأسطوري', nameEn: 'Legendary Marble & Bronze Sun Set',
        isImage: true,
        imagePathWhite: GITHUB_RAW_BASE + 'assets/pieces/1000135759.webp',     
        imagePathBlack: GITHUB_RAW_BASE + 'assets/pieces/1000135716.webp',     
        damaImagePathWhite: GITHUB_RAW_BASE + 'assets/pieces/1000135689.webp',  
        damaImagePathBlack: GITHUB_RAW_BASE + 'assets/pieces/1000135692.webp'   
    },

    'pc_broken_stone': {
        type: 'pc', cost: 7500, isLegendary: true, nameAr: 'طاقم الحجر المكسور الأسطوري', nameEn: 'Legendary Broken Stone Set',
        isImage: true,
        imagePathWhite: GITHUB_RAW_BASE + 'assets/pieces/1000135713.webp',     
        imagePathBlack: GITHUB_RAW_BASE + 'assets/pieces/1000135712.webp',     
        damaImagePathWhite: GITHUB_RAW_BASE + 'assets/pieces/1000135689.webp',  
        damaImagePathBlack: GITHUB_RAW_BASE + 'assets/pieces/1000135690.webp'   
    },

    'pc_marble_rose': {
        type: 'pc',
        cost: 8000,
        isLegendary: true,
        nameAr: 'طاقم الوردة الرخامية والذهب الأسطوري',
        nameEn: 'Legendary Marble Rose & Gold Set',
        isImage: true,
        imagePathWhite: GITHUB_RAW_BASE + 'assets/pieces/1000135720.webp',     
        imagePathBlack: GITHUB_RAW_BASE + 'assets/pieces/1000135743.webp',     
        damaImagePathWhite: GITHUB_RAW_BASE + 'assets/pieces/1000135689.webp',  
        damaImagePathBlack: GITHUB_RAW_BASE + 'assets/pieces/1000135690.webp'   
    },

    // ===================================
    // رابعاً: الأشرطة (Scoreboards) - 7 أطقم جديدة (كل طقم يحتوي على لونين)
    // ===================================
    'score_default': { 
        type: 'score', isDefault: true, nameAr: 'الشريط الافتراضي', nameEn: 'Default Bar', 
        scoreBg1: 'rgba(30, 32, 40, 0.6)', scoreBg2: 'rgba(30, 32, 40, 0.6)',
        scoreBorder1: '1px solid rgba(255,255,255,0.08)', scoreBorder2: '1px solid rgba(255,255,255,0.08)' 
    },
    'score_classic_wood': { 
        type: 'score', cost: 500, nameAr: 'خشب كلاسيكي (مزدوج)', nameEn: 'Classic Wood Pair', 
        scoreBg1: 'linear-gradient(to bottom, #401a11, #250d07)', 
        scoreBg2: 'linear-gradient(to bottom, #dfb78c, #c49a6c)', 
        scoreBorder1: '1px solid #6b371b', scoreBorder2: '1px solid #9e5b33' 
    },
    'score_starburst': { 
        type: 'score', cost: 1600, nameAr: 'زخارف شعاعية (مزدوج)', nameEn: 'Starburst Pair', 
        scoreBg1: 'linear-gradient(to bottom, #3b2313, #1e110a)', 
        scoreBg2: 'linear-gradient(to bottom, #e2d4b7, #c4ae8d)', 
        scoreBorder1: '1px solid #5c3a21', scoreBorder2: '1px solid #8b6540' 
    },
    'score_blue_navy': { 
        type: 'score', cost: 1800, nameAr: 'الرخام الأزرق (مزدوج)', nameEn: 'Navy Marble Pair', 
        scoreBg1: 'linear-gradient(to bottom, #0f2042, #071022)', 
        scoreBg2: 'linear-gradient(to bottom, #f0ebd8, #d3cbba)', 
        scoreBorder1: '1px solid #38bdf8', scoreBorder2: '1px solid #8b6540' 
    },
    'score_malachite': { 
        type: 'score', cost: 2200, isLegendary: true, nameAr: 'الملاكيت الأخضر (مزدوج)', nameEn: 'Malachite Pair', 
        scoreBg1: 'linear-gradient(to bottom, #004d25, #002612)', 
        scoreBg2: 'linear-gradient(to bottom, #fdfbf7, #e0dcd3)', 
        scoreBorder1: '1px solid #ffd700', scoreBorder2: '1px solid #ffd700' 
    },
    'score_lava': { 
        type: 'score', cost: 3500, isLegendary: true, nameAr: 'الحمم البركانية (مزدوج)', nameEn: 'Lava Pair', 
        scoreBg1: 'linear-gradient(to bottom, #8b0000, #4a0000)', 
        scoreBg2: 'linear-gradient(to bottom, #ff4500, #ff8c00)', 
        scoreBorder1: '1px solid #ff8c00', scoreBorder2: '1px solid #fff' 
    },
    'score_samurai': { 
        type: 'score', cost: 4000, isLegendary: true, nameAr: 'الساموراي البرونزي (مزدوج)', nameEn: 'Samurai Pair', 
        scoreBg1: 'linear-gradient(to bottom, #8b6508, #4a3600)', 
        scoreBg2: 'linear-gradient(to bottom, #e6e6e6, #b3b3b3)', 
        scoreBorder1: '1px solid #ffd700', scoreBorder2: '1px solid #8b6508' 
    },
    'score_jester': { 
        type: 'score', cost: 4500, isLegendary: true, nameAr: 'مسرح جيستر (مزدوج)', nameEn: 'Jester Theater Pair', 
        scoreBg1: 'linear-gradient(to bottom, #3b1b0b, #1a0a03)', 
        scoreBg2: 'linear-gradient(to bottom, #9e6d42, #6b4324)', 
        scoreBorder1: '1px solid #c28f5b', scoreBorder2: '1px solid #e2b385' 
    },
    'score_ruby_amber': { 
        type: 'score', cost: 5000, isLegendary: true, nameAr: 'الياقوت والكهرمان (مزدوج)', nameEn: 'Ruby Amber Pair', 
        scoreBg1: 'linear-gradient(to bottom, #8b0000, #4a0000)', 
        scoreBg2: 'linear-gradient(to bottom, #d97706, #92400e)', 
        scoreBorder1: '1px solid #ffbf00', scoreBorder2: '1px solid #ffbf00' 
    },

    // ===================================
    // خامساً: باقات المصباح والتلميحات (Offers & Hints)
    // ===================================
    'pack_hints_3':  { type: 'consumable', cost: 150, nameAr: 'باقة 3 تلميحات', nameEn: '3 Hints Pack', icon: '💡' },
    'pack_hints_10': { type: 'consumable', cost: 400, nameAr: 'باقة 10 تلميحات', nameEn: '10 Hints Pack', icon: '💡' }
};

window.STORE_ITEMS = STORE_ITEMS;

export const storeManager = {
    
    startGapKiller() {
        if (window.__gapKillerActive) return;
        window.__gapKillerActive = true;

        const applyGapKillerStyles = () => {
            const board = document.getElementById('board');
            if (!board) return;

            board.style.setProperty('width', '100vw', 'important');
            board.style.setProperty('height', '100vw', 'important');
            board.style.setProperty('max-width', '100vw', 'important');
            board.style.setProperty('position', 'relative', 'important');
            board.style.setProperty('left', '50%', 'important');
            board.style.setProperty('transform', 'translateX(-50%)', 'important');
            board.style.setProperty('box-sizing', 'border-box', 'important');

            let el = board.parentElement;
            while (el && el.tagName !== 'BODY' && el.tagName !== 'HTML') {
                el.style.setProperty('overflow', 'visible', 'important');
                el = el.parentElement;
            }
            document.body.style.setProperty('overflow-x', 'hidden', 'important');
        };

        applyGapKillerStyles();
        window.addEventListener('resize', applyGapKillerStyles);
    },

    injectLegendaryAnimations() {
        if (document.getElementById('store-legendary-styles')) return;
        const style = document.createElement('style');
        style.id = 'store-legendary-styles';
        style.innerHTML = `
            @keyframes legendaryGlow {
                0% { box-shadow: 0 0 10px rgba(255, 215, 0, 0.4), inset 0 0 10px rgba(255, 215, 0, 0.2); border-color: rgba(255, 215, 0, 0.5); }
                50% { box-shadow: 0 0 25px rgba(255, 215, 0, 0.9), inset 0 0 15px rgba(255, 215, 0, 0.6); border-color: rgba(255, 215, 0, 1); transform: scale(1.02); }
                100% { box-shadow: 0 0 10px rgba(255, 215, 0, 0.4), inset 0 0 10px rgba(255, 215, 0, 0.2); border-color: rgba(255, 215, 0, 0.5); }
            }
            @keyframes legendaryFloat {
                0% { transform: translateY(0px) rotate(0deg) scale(1); filter: drop-shadow(0 0 5px rgba(255,215,0,0.5)); }
                50% { transform: translateY(-6px) rotate(5deg) scale(1.15); filter: drop-shadow(0 0 20px rgba(255,215,0,1)); }
                100% { transform: translateY(0px) rotate(0deg) scale(1); filter: drop-shadow(0 0 5px rgba(255,215,0,0.5)); }
            }
            @keyframes legendaryPulseText {
                0%, 100% { text-shadow: 0 0 5px #ffd700; color: #ffd700; }
                50% { text-shadow: 0 0 15px #ff8c00, 0 0 30px #ff8c00; color: #fff; }
            }
            .legendary-card { animation: legendaryGlow 2.5s infinite ease-in-out; background: linear-gradient(135deg, rgba(255, 215, 0, 0.08), rgba(0, 0, 0, 0.5)) !important; }
            .legendary-icon { animation: legendaryFloat 3s infinite ease-in-out; }
            .legendary-text { animation: legendaryPulseText 2s infinite ease-in-out; }
            .legendary-btn { background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 140, 0, 0.3)) !important; border: 1px solid #ffd700 !important; color: #fff !important; text-shadow: 0 0 5px rgba(255, 215, 0, 0.8); }
            .legendary-btn:hover { background: linear-gradient(135deg, rgba(255, 215, 0, 0.6), rgba(255, 140, 0, 0.6)) !important; transform: scale(1.05) !important; }
        `;
        document.body.appendChild(style);
    },

    injectDynamicPieceStyles() {
        let pieceStyles = `
            #board .cell { display: flex !important; align-items: center !important; justify-content: center !important; }
            @keyframes goldenVaporAura { 0% { transform: scale(1); opacity: 0.8; filter: blur(2px); } 100% { transform: scale(1.6); opacity: 0; filter: blur(8px); } }
        `;
        
        Object.keys(STORE_ITEMS).forEach(key => {
            const item = STORE_ITEMS[key];
            if (item.type === 'pc' && key !== 'pc_original') {
                if (item.isImage) {
                    let whiteImg = item.imagePathWhite || item.imagePath || '';
                    let blackImg = item.imagePathBlack || item.imagePath || '';
                    let whiteDamaImg = item.damaImagePathWhite || whiteImg;
                    let blackDamaImg = item.damaImagePathBlack || blackImg;

                    pieceStyles += `
                        body[data-piece-style="${key}"] .piece { 
                            background-color: transparent !important; border: none !important; box-shadow: 0 5px 10px rgba(0,0,0,0.5) !important; 
                            position: relative; width: 85% !important; height: 85% !important; margin: 0 !important; 
                        }
                        body[data-piece-style="${key}"] .piece::before, body[data-piece-style="${key}"] .piece::after { display: none !important; }
                        body[data-piece-style="${key}"] .piece.white { background-image: url('${whiteImg}') !important; background-size: 100% 100% !important; }
                        body[data-piece-style="${key}"] .piece.black { background-image: url('${blackImg}') !important; background-size: 100% 100% !important; }
                        body[data-piece-style="${key}"] .piece.white.dama { background-image: url('${whiteDamaImg}') !important; border: 2px solid #FFD700 !important; box-shadow: 0 0 15px #FFD700, inset 0 0 10px rgba(255,215,0,0.5) !important; }
                        body[data-piece-style="${key}"] .piece.black.dama { background-image: url('${blackDamaImg}') !important; border: 2px solid #FFD700 !important; box-shadow: 0 0 15px #FFD700, inset 0 0 10px rgba(255,215,0,0.5) !important; }
                        body[data-piece-style="${key}"] .piece.dama::after {
                            content: '' !important; display: block !important; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                            border-radius: 50%; background: radial-gradient(circle, rgba(255,215,0,0.6) 0%, rgba(255,140,0,0) 70%);
                            z-index: -1; animation: goldenVaporAura 1.5s infinite ease-out; pointer-events: none;
                        }
                    `;
                } else if (item.wCss && item.bCss) {
                    pieceStyles += `
                        body[data-piece-style="${key}"] .piece.white { ${item.wCss} }
                        body[data-piece-style="${key}"] .piece.black { ${item.bCss} }
                        body[data-piece-style="${key}"] .piece.dama { ${item.dCss || ''} }
                    `;
                }
                if (item.customPseudoCss) { pieceStyles += item.customPseudoCss; }
            } else if (item.type === 'pc' && key === 'pc_original') {
                 pieceStyles += `
                 body[data-piece-style="${key}"] .piece.white { background: radial-gradient(circle at 30% 30%, #ffffff, #dcdde1, #95a5a6) !important; border: 1px solid #bdc3c7 !important; clip-path: none !important; border-radius: 50% !important; box-shadow: inset -3px -3px 6px rgba(0,0,0,0.2), 2px 2px 4px rgba(0,0,0,0.2) !important; }
                 body[data-piece-style="${key}"] .piece.black { background: radial-gradient(circle at 30% 30%, #68707a, #353b45, #1e1e24) !important; border: 1px solid #1a1a24 !important; clip-path: none !important; border-radius: 50% !important; box-shadow: inset -3px -3px 6px rgba(0,0,0,0.5), 2px 2px 4px rgba(0,0,0,0.4) !important; }
             `;
            }
        });

        let styleEl = document.getElementById('dynamic-pieces-css');
        if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = 'dynamic-pieces-css'; document.head.appendChild(styleEl); }
        styleEl.innerHTML = pieceStyles;
    },

    applyBoardThemeCSS(bgKey) {
        const item = STORE_ITEMS[bgKey];
        if (!item || item.type !== 'bg') return;

        let styleEl = document.getElementById('dynamic-board-css');
        if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = 'dynamic-board-css'; document.head.appendChild(styleEl); }

        if (item.isImage) {
            styleEl.innerHTML = `
                #board { 
                    background-image: url('${item.imagePath}') !important; 
                    background-size: 100% 100% !important; 
                    background-position: center !important; 
                    background-origin: content-box !important; 
                    background-clip: content-box !important;   
                }
                .cell.light { background-color: transparent !important; border: none !important; transition: all 0.5s ease; }
                .cell.dark { background-color: rgba(0,0,0,0.1) !important; border: none !important; transition: all 0.5s ease; }
            `;
        } else if (item.cssLight && item.cssDark) {
            styleEl.innerHTML = `
                #board { background-image: none !important; background-color: transparent !important; }
                .cell.light { ${item.cssLight} !important; transition: all 0.5s ease; } 
                .cell.dark { ${item.cssDark} !important; transition: all 0.5s ease; }
            `;
        } else {
            document.documentElement.style.setProperty('--light-cell', item.light); document.documentElement.style.setProperty('--dark-cell', item.dark);
            styleEl.innerHTML = '';
        }
    },

    applyFrameThemeCSS(frKey) {
        const item = STORE_ITEMS[frKey];
        if (!item || item.type !== 'fr') return;

        let styleEl = document.getElementById('dynamic-frame-css');
        if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = 'dynamic-frame-css'; document.head.appendChild(styleEl); }

        if (item.customCSS) {
            styleEl.innerHTML = item.customCSS;
        } else {
            styleEl.innerHTML = '';
        }
    },

    applyScoreThemeCSS(scoreKey) {
        const item = STORE_ITEMS[scoreKey];
        const root = document.documentElement;
        if (item && item.type === 'score') {
            root.style.setProperty('--my-score-bg', item.scoreBg1 || 'rgba(30, 32, 40, 0.6)');
            root.style.setProperty('--opp-score-bg', item.scoreBg2 || 'rgba(30, 32, 40, 0.6)');
            root.style.setProperty('--my-score-border', item.scoreBorder1 || '1px solid rgba(255,255,255,0.08)');
            root.style.setProperty('--opp-score-border', item.scoreBorder2 || '1px solid rgba(255,255,255,0.08)');
        }
    },

    getProfile() {
        let profile = null;
        if (window.gameState && window.gameState.userProfile) {
            profile = window.gameState.userProfile;
        } else {
            let p = localStorage.getItem('hub_user_profile');
            if (p) {
                try { profile = JSON.parse(p); } catch(e) {}
            }
        }

        if (profile) {
            if (!Array.isArray(profile.purchasedItems)) profile.purchasedItems = [];
            
            if (!profile.equippedBg || !STORE_ITEMS[profile.equippedBg]) profile.equippedBg = 'bg_wood';
            if (!profile.equippedFr || !STORE_ITEMS[profile.equippedFr]) profile.equippedFr = 'fr_classic';
            if (!profile.equippedPc || !STORE_ITEMS[profile.equippedPc]) profile.equippedPc = 'pc_original';
            if (!profile.equippedScore || !STORE_ITEMS[profile.equippedScore]) profile.equippedScore = 'score_default';

            if (window.gameState) {
                window.gameState.userProfile = profile;
            }
            return profile;
        }
        
        return { purchasedItems: [], equippedPc: 'pc_original', equippedBg: 'bg_wood', equippedFr: 'fr_classic', equippedScore: 'score_default' };
    },

    buyItem(itemId) {
        let profile = this.getProfile();
        if (!profile || !profile.id) { return window['triggerCustomAlertNotification'] ? window['triggerCustomAlertNotification'](window['currentLang'] === 'ar' ? "يرجى تسجيل الدخول أولاً!" : "Please login first!") : alert("يرجى تسجيل الدخول أولاً!"); }
        const item = STORE_ITEMS[itemId];
        if (!item) return;
        
        if (window['triggerCustomAlertNotification']) window['triggerCustomAlertNotification'](window['currentLang'] === 'ar' ? "جاري معالجة الشراء عبر السيرفر..." : "Processing purchase...");
        if (window['socket'] && window['socket'].connected) { window['socket'].emit('requestPurchase', { userId: profile.id, itemId: itemId, cost: item.cost }); } 
        else { if (window['triggerCustomAlertNotification']) window['triggerCustomAlertNotification'](window['currentLang'] === 'ar' ? "أنت غير متصل بالسيرفر!" : "Not connected to server!"); }
    },

    equipItem(itemId) {
        let profile = this.getProfile();
        if (!profile || !profile.id) { return window['triggerCustomAlertNotification'] ? window['triggerCustomAlertNotification'](window['currentLang'] === 'ar' ? "يرجى تسجيل الدخول أولاً لاستخدام العناصر!" : "Please login first to equip items!") : alert("يرجى تسجيل الدخول أولاً!"); }
        
        const item = STORE_ITEMS[itemId];

        if (window['socket'] && window['socket'].connected) { 
            window['socket'].emit('requestEquip', { userId: profile.id, itemId: itemId, itemType: item ? item.type : 'pc' }); 
        } else {
            if (!item) return;
            if (item.type === 'bg') { profile.equippedBg = itemId; } 
            else if (item.type === 'fr') { profile.equippedFr = itemId; } 
            else if (item.type === 'pc') { profile.equippedPc = itemId; }
            else if (item.type === 'score') { profile.equippedScore = itemId; }
            
            if (window.gameState) {
                window.gameState.userProfile = profile; 
            }
            if (window.applyTheme) {
                window.applyTheme(profile);
            }
            
            localStorage.setItem('hub_user_profile', JSON.stringify(profile));
            this.renderUI();
        }
    },

    renderUI() {
        const storeBg = document.getElementById('store-section-bg'); 
        const storeFr = document.getElementById('store-section-frames'); 
        const storePc = document.getElementById('store-section-pieces');
        const storeOffers = document.getElementById('store-section-offers');
        const storeScore = document.getElementById('store-section-score'); 

        const bagBg = document.getElementById('theme-grid-section-bg'); 
        const bagFr = document.getElementById('theme-grid-section-frames'); 
        const bagPc = document.getElementById('theme-grid-section-pieces');
        const bagScore = document.getElementById('theme-grid-section-score'); 

        if(storeBg) storeBg.innerHTML = ''; 
        if(storeFr) storeFr.innerHTML = ''; 
        if(storePc) storePc.innerHTML = '';
        if(storeOffers) storeOffers.innerHTML = '';
        if(storeScore) storeScore.innerHTML = '';

        if(bagBg) bagBg.innerHTML = ''; 
        if(bagFr) bagFr.innerHTML = ''; 
        if(bagPc) bagPc.innerHTML = '';
        if(bagScore) bagScore.innerHTML = '';

        const profile = this.getProfile(); 
        const isAr = window['currentLang'] !== 'en';
        let storePcEmpty = true, storeBgEmpty = true, storeFrEmpty = true, storeScoreEmpty = true;

        const sortedKeys = Object.keys(STORE_ITEMS).sort((a, b) => {
            const itemA = STORE_ITEMS[a];
            const itemB = STORE_ITEMS[b];
            
            const legA = itemA.isLegendary ? 1 : 0;
            const legB = itemB.isLegendary ? 1 : 0;
            if (legA !== legB) return legB - legA;
            
            const costA = itemA.cost || 0;
            const costB = itemB.cost || 0;
            return costB - costA;
        });

        sortedKeys.forEach(key => {
            const item = STORE_ITEMS[key];
            const targetSection = item.type; 
            
            const safePurchased = Array.isArray(profile.purchasedItems) ? profile.purchasedItems : [];
            const isPurchased = item.isDefault || safePurchased.includes(key);
            
            const isEquipped = (profile.equippedBg === key || profile.equippedPc === key || profile.equippedFr === key || profile.equippedScore === key);
            const name = isAr ? item.nameAr : item.nameEn;

            const legendaryClassCard = item.isLegendary ? 'legendary-card' : ''; const legendaryClassIcon = item.isLegendary ? 'legendary-icon' : ''; const legendaryClassText = item.isLegendary ? 'legendary-text' : ''; const legendaryClassBtn = item.isLegendary ? 'legendary-btn' : '';
            const legendaryTag = item.isLegendary ? `<span style="position: absolute; top: -5px; right: -5px; background: linear-gradient(45deg, #ff007f, #7f00ff); color: white; font-size: 10px; padding: 3px 8px; border-radius: 8px; font-weight: bold; box-shadow: 0 0 10px #ff007f;">أسطوري</span>` : '';
            const legendaryBagBadge = item.isLegendary ? `<div style="font-size:10px; color:#ffd700; margin-bottom:5px; font-weight:bold;">★ أسطوري ★</div>` : '';

            let visualHtml = '';
            let bagVisualHtml = '';

            if (item.isImage && item.type !== 'fr') {
                let showImg = item.imagePathWhite || item.imagePath || '';
                visualHtml = `<div style="width: 50px; height: 50px; border-radius: 8px; background-image: url('${showImg}'); background-size: cover; background-position: center; margin: 5px 0; border: ${item.isLegendary ? '2px solid #FFD700' : '1px solid rgba(255,255,255,0.1)'};" class="${legendaryClassIcon}"></div>`;
            } else if (item.type === 'bg') {
                let bgStyle = (item.cssLight && item.cssDark) ? `<div style="display:flex; flex:1;"><div style="flex:1; ${item.cssLight}"></div><div style="flex:1; ${item.cssDark}"></div></div><div style="display:flex; flex:1;"><div style="flex:1; ${item.cssDark}"></div><div style="flex:1; ${item.cssLight}"></div></div>` : `<div style="display:flex; flex:1; background:${item.light};"></div><div style="flex:1; background:${item.dark};"></div>`;
                visualHtml = `<div style="width: 50px; height: 50px; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; margin: 5px 0; border: ${item.isLegendary ? '2px solid #FFD700' : '1px solid rgba(255,255,255,0.1)'};" class="${legendaryClassIcon}">${bgStyle}</div>`;
            } else if (item.type === 'fr') {
                let framePreview = '';
                if (item.isImage) {
                    framePreview = `<div style="width: 32px; height: 32px; background: rgba(0,0,0,0.7); background-clip: padding-box; border: 6px solid transparent; border-image: url('${item.imagePath}') 15% stretch;" class="${legendaryClassIcon}"></div>`;
                } else {
                    framePreview = `<div style="width: 32px; height: 32px; background: rgba(0,0,0,0.7); ${item.cssBoard || ''} border-width: 6px !important; border-radius: 4px;" class="${legendaryClassIcon}"></div>`;
                }
                visualHtml = `<div style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.08); border-radius: 8px; margin: 5px auto; border: ${item.isLegendary ? '2px solid #FFD700' : '1px solid rgba(255,255,255,0.2)'}; box-shadow: inset 0 0 10px rgba(0,0,0,0.5);">
                    ${framePreview}
                </div>`;
            } else if (item.type === 'pc') {
                let customPcStyle = item.wCss ? item.wCss : '';
                visualHtml = `<div style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; position: relative; ${customPcStyle}" class="${legendaryClassIcon}">${item.icon || ''}</div>`;
            } else if (item.type === 'consumable') {
                visualHtml = `<div style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; font-size: 32px; background: rgba(255,255,255,0.05); border-radius: 8px; margin: 5px 0; border: 1px solid rgba(255,255,255,0.1);" class="${legendaryClassIcon}">${item.icon || '💡'}</div>`;
            } else if (item.type === 'score') {
                visualHtml = `<div style="width: 80%; height: 35px; border-radius: 8px; margin: 10px auto; overflow: hidden; display: flex; flex-direction: column; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 4px 10px rgba(0,0,0,0.4);" class="${legendaryClassIcon}">
                    <div style="flex: 1; background: ${item.scoreBg2}; border-bottom: 1px solid rgba(255,255,255,0.1);"></div>
                    <div style="flex: 1; background: ${item.scoreBg1};"></div>
                </div>`;
            }

            bagVisualHtml = visualHtml;

            if (isPurchased) {
                const gridItem = document.createElement('div');
                gridItem.className = `theme-grid-item ${isEquipped ? 'active' : ''} ${legendaryClassCard}`;
                gridItem.onclick = () => {
                    this.equipItem(key);
                    if (window.showEquipNotification) {
                        window.showEquipNotification(item.type);
                    }
                };
                
                if (item.type === 'bg') {
                    if (item.isImage) {
                        bagVisualHtml = `<div class="theme-grid-preview ${legendaryClassIcon}" style="width: 50px; height: 50px; border-radius: 8px; background-image: url('${item.imagePath}'); background-size: cover; background-position: center; border: ${item.isLegendary ? '2px solid #FFD700' : '1px solid rgba(255,255,255,0.2)'}; box-shadow: 0 5px 15px rgba(0,0,0,0.5);"></div>`;
                    } else {
                        let bgStyle = (item.cssLight && item.cssDark) ? `<div style="display:flex; flex:1;"><div style="flex:1; ${item.cssLight}"></div><div style="flex:1; ${item.cssDark}"></div></div><div style="display:flex; flex:1;"><div style="flex:1; ${item.cssDark}"></div><div style="flex:1; ${item.cssLight}"></div></div>` : `<div style="display:flex; flex:1; background:${item.light};"></div><div style="flex:1; background:${item.dark};"></div>`;
                        bagVisualHtml = `<div class="theme-grid-preview ${legendaryClassIcon}" style="width: 50px; height: 50px; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; border: ${item.isLegendary ? '2px solid #FFD700' : '1px solid rgba(255,255,255,0.2)'}; box-shadow: 0 5px 15px rgba(0,0,0,0.5);">${bgStyle}</div>`;
                    }
                }
                
                gridItem.innerHTML = `${legendaryBagBadge}${bagVisualHtml} <span class="theme-grid-title ${legendaryClassText}" style="margin-top:8px;">${name}</span>`;
                
                if (targetSection === 'bg' && bagBg) bagBg.appendChild(gridItem); 
                else if (targetSection === 'fr' && bagFr) bagFr.appendChild(gridItem); 
                else if (targetSection === 'pc' && bagPc) bagPc.appendChild(gridItem);
                else if (targetSection === 'score' && bagScore) bagScore.appendChild(gridItem);
            } else {
                const storeCard = document.createElement('div');
                storeCard.className = `store-item-card ${legendaryClassCard}`; storeCard.style.position = 'relative'; 
                
                if (item.hasPurpleBorder) {
                    storeCard.style.border = '2px solid rgba(168, 85, 247, 0.4)'; 
                    storeCard.style.boxShadow = '0 0 12px rgba(168, 85, 247, 0.15)';
                }

                storeCard.innerHTML = `${legendaryTag} <div class="${legendaryClassText}" style="color: white; font-weight: 600; font-size: 14px; text-align: center; margin-top: ${item.isLegendary ? '10px' : '0'};">${name}</div> ${visualHtml} <div style="color: #f5a623; font-size: 13px; font-weight: bold; margin-bottom: 2px; text-shadow: ${item.isLegendary ? '0 0 5px rgba(245,166,35,0.5)' : 'none'};">🪙 ${item.cost}</div>`;
                
                const buyBtn = document.createElement('button');
                buyBtn.className = `store-buy-btn store-buy-btn-small ${legendaryClassBtn}`; buyBtn.innerText = isAr ? 'شراء' : 'Buy';
                buyBtn.onclick = () => { 
                    if (window['openPurchaseModal']) { 
                        window['openPurchaseModal'](key, name, item.cost, item.type); 
                    } else { 
                        this.buyItem(key); 
                    } 
                };
                
                storeCard.appendChild(buyBtn);

                if (targetSection === 'bg') { 
                    if(storeBg) storeBg.appendChild(storeCard); storeBgEmpty = false; 
                } else if (targetSection === 'fr') { 
                    if(storeFr) storeFr.appendChild(storeCard); storeFrEmpty = false; 
                } else if (targetSection === 'consumable') {
                    if(storeOffers) storeOffers.appendChild(storeCard); 
                } else if (targetSection === 'score') {
                    if(storeScore) storeScore.appendChild(storeCard); storeScoreEmpty = false;
                } else { 
                    if(storePc) storePc.appendChild(storeCard); storePcEmpty = false; 
                }
            }
        });

        if (storeBg && storeBgEmpty) storeBg.innerHTML = `<div style="color: rgba(255,255,255,0.4); text-align: center; grid-column: 1/-1; padding: 20px;">${isAr ? 'لا توجد عناصر متاحة' : 'No items available'}</div>`;
        if (storeFr && storeFrEmpty) storeFr.innerHTML = `<div style="color: rgba(255,255,255,0.4); text-align: center; grid-column: 1/-1; padding: 20px;">${isAr ? 'لا توجد عناصر متاحة' : 'No items available'}</div>`;
        if (storePc && storePcEmpty) storePc.innerHTML = `<div style="color: rgba(255,255,255,0.4); text-align: center; grid-column: 1/-1; padding: 20px;">${isAr ? 'لا توجد عناصر متاحة' : 'No items available'}</div>`;
        if (storeScore && storeScoreEmpty) storeScore.innerHTML = `<div style="color: rgba(255,255,255,0.4); text-align: center; grid-column: 1/-1; padding: 20px;">${isAr ? 'لا توجد عناصر متاحة' : 'No items available'}</div>`;
    },

    init() {
        if (window.__STORE_RUNNING__) return;
        window.__STORE_RUNNING__ = true;

        this.injectLegendaryAnimations(); 
        this.injectDynamicPieceStyles();
        
        this.startGapKiller();

        let prof = this.getProfile();
        if (prof) {
            if (window.applyTheme) {
                window.applyTheme(prof);
            }
        }

        let socketAttempts = 0; const maxAttempts = 20;

        const socketCheck = setInterval(() => {
            socketAttempts++;
            if (window['socket']) {
                clearInterval(socketCheck); 
                
                window['socket'].off('profileUpdated'); 
                window['socket'].off('purchaseFailed'); 
                window['socket'].off('purchaseSuccess');
                window['socket'].off('disconnect');
                window['socket'].off('connect_error');
                window['socket'].off('connect');
                
                window['socket'].on('disconnect', (reason) => {
                    console.warn('Disconnected:', reason);
                    if (window.ui && typeof window.ui.showCustomAlert === 'function') {
                        const title = window.gameState && window.gameState.lang === 'en' ? "Connection Lost" : "انقطاع الاتصال";
                        const msg = window.gameState && window.gameState.lang === 'en' 
                            ? "⚠️ Connection lost. Retrying..." 
                            : "⚠️ عذراً، انقطع الاتصال بالخادم أو الإنترنت ضعيف. يرجى الانتظار، جاري محاولة إعادة الاتصال...";
                        
                        window.ui.showCustomAlert(msg, title, null, false);
                    }
                });

                window['socket'].on('connect_error', (err) => {
                    console.warn('Connection Error:', err);
                    if (window.ui && typeof window.ui.showCustomAlert === 'function') {
                        const title = window.gameState && window.gameState.lang === 'en' ? "Connection Error" : "ضعف الإنترنت";
                        const msg = window.gameState && window.gameState.lang === 'en' 
                            ? "⚠️ Internet connection is weak. Retrying..." 
                            : "⚠️ جاري محاولة استعادة الاتصال بالإنترنت، يرجى الانتظار...";
                        
                        window.ui.showCustomAlert(msg, title, null, false);
                    }
                });

                window['socket'].on('connect', () => {
                    console.log('Connected to server successfully');
                    if (window.ui && typeof window.ui.setDisplay === 'function') {
                        window.ui.setDisplay('custom-alert-modal', 'none');
                    } else if (typeof window.closeAppModal === 'function') {
                        window.closeAppModal('custom-alert-modal');
                    }
                });

                window['socket'].on('profileUpdated', (updatedProfile) => {
                    localStorage.setItem('hub_user_profile', JSON.stringify(updatedProfile));
                    
                    if (window.gameState) {
                        window.gameState.userProfile = updatedProfile; 
                    }

                    if (window['applyProfileDataToUI']) window['applyProfileDataToUI'](updatedProfile);
                    
                    if (window.applyTheme) {
                        window.applyTheme(updatedProfile);
                    }
                    this.renderUI();
                });
                
                window['socket'].on('purchaseFailed', (msg) => { 
                    if (window['triggerCustomAlertNotification']) window['triggerCustomAlertNotification'](msg); 
                });
                
                window['socket'].on('purchaseSuccess', (msg) => { 
                    if (window['triggerCustomAlertNotification']) window['triggerCustomAlertNotification'](msg); 
                });
                
            } else if (socketAttempts >= maxAttempts) { 
                clearInterval(socketCheck); 
                console.warn("Store.js: لم يتم العثور على السوكيت بعد 10 ثوانٍ. سيعمل المتجر في وضع الأوفلاين."); 
            }
        }, 500);

        setTimeout(() => { this.renderUI(); }, 200);
    }
};

window.storeManager = storeManager;

window.applyTheme = function(profile) {
    if (!profile) return;
    if (profile.equippedBg) {
        storeManager.applyBoardThemeCSS(profile.equippedBg);
    }
    if (profile.equippedFr) {
        storeManager.applyFrameThemeCSS(profile.equippedFr);
    }
    if (profile.equippedPc) {
        document.body.setAttribute('data-piece-style', profile.equippedPc);
    }
    if (profile.equippedScore) {
        storeManager.applyScoreThemeCSS(profile.equippedScore);
    }
};
