// ==========================================
// ملف store.js - النسخة النهائية المحدثة الشاملة المدمجة (إصلاح تداخل التبويبات)
// ==========================================

const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/diwanrise-hue/Kings-Challenge/main/";

export const STORE_ITEMS = {
    // ===================================
    // أولاً: الخلفيات واللوحات (Backgrounds & Boards)
    // ===================================
    
    'bg_wood': { 
        type: 'bg', isDefault: true, nameAr: 'الخشب الفاخر', nameEn: 'Premium Wood', light: '#DEB887', dark: '#8B4513',
        linkedScore: 'score_default'
    },

    'bg_malachite': { 
        type: 'bg', cost: 3000, isLegendary: true, nameAr: 'رخام الملاكيت الأخضر', nameEn: 'Malachite Green Marble',
        isImage: true, imagePath: GITHUB_RAW_BASE + 'assets/bgs/1000134548.webp',
        linkedScore: 'score_malachite'
    },

    'bg_carved_wood': { 
        type: 'bg', cost: 1000, nameAr: 'الخشب المحفور', nameEn: 'Carved Wood',
        cssLight: 'background: repeating-linear-gradient(45deg, #DEB887, #DEB887 10px, #D2A679 10px, #D2A679 20px); box-shadow: inset 0 0 15px rgba(100,50,0,0.5);',
        cssDark: 'background: repeating-linear-gradient(-45deg, #8B4513, #8B4513 15px, #65320D 15px, #65320D 30px); box-shadow: inset 0 0 20px rgba(0,0,0,0.8);',
        linkedScore: 'score_carved_wood'
    },

    'bg_mosaic': { 
        type: 'bg', cost: 1500, nameAr: 'الموزاييك الملكي', nameEn: 'Royal Mosaic',
        cssLight: 'background-color: #E2D4B7; background-image: radial-gradient(circle at 50% 50%, #4A2E15 15%, transparent 18%), repeating-conic-gradient(from 0deg at 50% 50%, #C4AE8D 0deg, #C4AE8D 15deg, transparent 15deg, transparent 30deg); box-shadow: inset 0 0 10px rgba(74,46,21,0.4); border: 1px solid rgba(74,46,21,0.2);',
        cssDark: 'background-color: #3B2314; background-image: radial-gradient(circle at 50% 50%, #E2D4B7 10%, transparent 13%), radial-gradient(circle at 50% 50%, transparent 40%, #1E110A 45%, #1E110A 50%, transparent 55%), repeating-conic-gradient(from 15deg at 50% 50%, #2A170D 0deg, #2A170D 22.5deg, transparent 22.5deg, transparent 45deg); box-shadow: inset 0 0 15px rgba(0,0,0,0.8); border: 1px solid #1E110A;',
        linkedScore: 'score_starburst'
    },

    'bg_image_royal': { 
        type: 'bg', cost: 4000, isLegendary: true, nameAr: 'الساحة الملكية الفاخرة', nameEn: 'Premium Royal Arena', isImage: true, imagePath: GITHUB_RAW_BASE + 'assets/bgs/1000133232.webp',
        linkedScore: 'score_royal'
    },

    'bg_image_lava': { 
        type: 'bg', cost: 4500, isLegendary: true, nameAr: 'ساحة الحمم البركانية', nameEn: 'Volcanic Lava Arena', isImage: true, imagePath: GITHUB_RAW_BASE + 'assets/bgs/1000133390.webp',
        linkedScore: 'score_lava'
    },

    'bg_custom_warrior': { 
        type: 'bg', cost: 5000, isLegendary: true, nameAr: 'ساحة كتيبة الأبطال', nameEn: 'Hero Battalion Arena', isImage: true, imagePath: GITHUB_RAW_BASE + 'assets/bgs/1000134166.webp',
        linkedScore: 'score_warrior'
    },

    'bg_ruby_amber': { 
        type: 'bg', cost: 50000, isLegendary: true, nameAr: 'الياقوت والكهرمان الملكي', nameEn: 'Royal Ruby & Amber', isImage: true, imagePath: GITHUB_RAW_BASE + 'assets/bgs/10001320889.webp',
        linkedScore: 'score_ruby_amber'
    },

    'bg_mahogany': { 
        type: 'bg', cost: 2000, nameAr: 'ساحة الماهوجني الكلاسيكية', nameEn: 'Classic Mahogany Arena', isImage: true, imagePath: GITHUB_RAW_BASE + 'assets/bgs/1000134903.webp',
        linkedScore: 'score_mahogany'
    },

    'bg_turquoise_geometric': {
        type: 'bg', cost: 2200, nameAr: 'ساحة الفيروز والزخارف الهندسية', nameEn: 'Geometric Turquoise & Gold Arena', isImage: true, imagePath: GITHUB_RAW_BASE + 'assets/bgs/1000134417.webp', hasPurpleBorder: true,
        linkedScore: 'score_turquoise'
    },

    'bg_black_gold_marble': {
        type: 'bg', cost: 2500, nameAr: 'ساحة الرخام الأسود والعروق الذهبية', nameEn: 'Classic Black & Gold Marble Arena', isImage: true, imagePath: GITHUB_RAW_BASE + 'assets/bgs/1000134427.webp', hasPurpleBorder: true,
        linkedScore: 'score_black_gold'
    },

    'bg_blue_navy_marble': {
        type: 'bg', cost: 2600, nameAr: 'ساحة الرخام الأزرق الداكن والبيج', nameEn: 'Navy Blue & Beige Marble Arena', isImage: true, imagePath: GITHUB_RAW_BASE + 'assets/bgs/1000136612.webp', hasPurpleBorder: true,
        linkedScore: 'score_blue_navy'
    },

    'bg_brown_gold_leaves': {
        type: 'bg', cost: 2800, nameAr: 'ساحة الرخام البني والزخارف الذهبية', nameEn: 'Brown Marble & Golden Leaves Arena', isImage: true, imagePath: GITHUB_RAW_BASE + 'assets/bgs/1000136622.webp', hasPurpleBorder: true,
        linkedScore: 'score_brown_gold'
    },

    'bg_samurai_warriors': {
        type: 'bg', cost: 100000, isLegendary: true, nameAr: 'ساحة محاربي الساموراي الأسطورية', nameEn: 'Legendary Samurai Warriors Arena', isImage: true, imagePath: GITHUB_RAW_BASE + 'assets/bgs/1000136302.webp',
        linkedScore: 'score_samurai'
    },

    'bg_jester_theater': {
        type: 'bg', cost: 150000, isLegendary: true, nameAr: 'ساحة مسرح جيستر', nameEn: 'Jester Theater Arena', isImage: true, imagePath: GITHUB_RAW_BASE + 'assets/bgs/1000136557.webp',
        linkedScore: 'score_jester'
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
    // رابعاً: الأشرطة المخفية (المرتبطة تلقائياً بالساحات)
    // ===================================
    'score_default': { 
        type: 'score', isDefault: true, nameAr: 'الشريط الافتراضي', nameEn: 'Default Bar', 
        scoreBg1: 'linear-gradient(to bottom, #757b8a, #585d6b)', 
        scoreBg2: 'linear-gradient(to bottom, #99a0b3, #7a8194)',
        scoreBorder1: 'none', scoreBorder2: 'none' 
    },
    'score_classic_wood': { 
        type: 'score', cost: 0, nameAr: 'خشب كلاسيكي (مزدوج)', nameEn: 'Classic Wood Pair', 
        scoreBg1: 'linear-gradient(to bottom, #7a3821, #572615)', 
        scoreBg2: 'linear-gradient(to bottom, #ebd1b5, #c9b197)', 
        scoreBorder1: 'none', scoreBorder2: 'none' 
    },
    'score_carved_wood': { 
        type: 'score', cost: 0, nameAr: 'خشب محفور (مزدوج)', nameEn: 'Carved Wood Pair', 
        scoreBg1: 'linear-gradient(to bottom, #8a4e23, #613516)', 
        scoreBg2: 'linear-gradient(to bottom, #e3cba8, #bfa888)', 
        scoreBorder1: 'none', scoreBorder2: 'none' 
    },
    'score_mahogany': { 
        type: 'score', cost: 0, nameAr: 'الماهوجني (مزدوج)', nameEn: 'Mahogany Pair', 
        scoreBg1: 'linear-gradient(to bottom, #692424, #471717)', 
        scoreBg2: 'linear-gradient(to bottom, #edc6ad, #c4a187)', 
        scoreBorder1: 'none', scoreBorder2: 'none' 
    },
    'score_starburst': { 
        type: 'score', cost: 0, nameAr: 'زخارف شعاعية (مزدوج)', nameEn: 'Starburst Pair', 
        scoreBg1: 'linear-gradient(to bottom, #61402a, #42291a)', 
        scoreBg2: 'linear-gradient(to bottom, #f5e4c6, #cca781)', 
        scoreBorder1: 'none', scoreBorder2: 'none' 
    },
    'score_turquoise': { 
        type: 'score', cost: 0, nameAr: 'الفيروزي (مزدوج)', nameEn: 'Turquoise Pair', 
        scoreBg1: 'linear-gradient(to bottom, #1c92a6, #126370)', 
        scoreBg2: 'linear-gradient(to bottom, #ffffff, #e6dcc3)', 
        scoreBorder1: 'none', scoreBorder2: 'none' 
    },
    'score_blue_navy': { 
        type: 'score', cost: 0, nameAr: 'الرخام الأزرق (مزدوج)', nameEn: 'Navy Marble Pair', 
        scoreBg1: 'linear-gradient(to bottom, #39578c, #22385e)', 
        scoreBg2: 'linear-gradient(to bottom, #f2eadc, #c7beab)', 
        scoreBorder1: 'none', scoreBorder2: 'none' 
    },
    'score_black_gold': { 
        type: 'score', cost: 0, nameAr: 'الأسود الذهبي (مزدوج)', nameEn: 'Black Gold Pair', 
        scoreBg1: 'linear-gradient(to bottom, #2b2b2b, #121212)', 
        scoreBg2: 'linear-gradient(to bottom, #f2eadc, #d1c8b4)', 
        scoreBorder1: 'none', scoreBorder2: 'none' 
    },
    'score_brown_gold': { 
        type: 'score', cost: 0, nameAr: 'البني الذهبي (مزدوج)', nameEn: 'Brown Gold Pair', 
        scoreBg1: 'linear-gradient(to bottom, #6b4028, #472918)', 
        scoreBg2: 'linear-gradient(to bottom, #cf9761, #9c6c41)', 
        scoreBorder1: 'none', scoreBorder2: 'none' 
    },
    'score_malachite': { 
        type: 'score', cost: 0, isLegendary: true, nameAr: 'الملاكيت الأخضر (مزدوج)', nameEn: 'Malachite Pair', 
        scoreBg1: 'linear-gradient(to bottom, #115c38, #0a3d24)', 
        scoreBg2: 'linear-gradient(to bottom, #e3dac9, #c7beab)', 
        scoreBorder1: 'none', scoreBorder2: 'none' 
    },
    'score_royal': { 
        type: 'score', cost: 0, isLegendary: true, nameAr: 'الملكي الفاخر (مزدوج)', nameEn: 'Premium Royal Pair', 
        scoreBg1: 'linear-gradient(to bottom, #593199, #371d61)', 
        scoreBg2: 'linear-gradient(to bottom, #9955ed, #703eb0)', 
        scoreBorder1: 'none', scoreBorder2: 'none' 
    },
    'score_lava': { 
        type: 'score', cost: 0, isLegendary: true, nameAr: 'الحمم البركانية (مزدوج)', nameEn: 'Lava Pair', 
        scoreBg1: 'linear-gradient(to bottom, #f26d07, #bd4e00)', 
        scoreBg2: 'linear-gradient(to bottom, #3b1717, #1c0808)', 
        scoreBorder1: 'none', scoreBorder2: 'none' 
    },
    'score_warrior': { 
        type: 'score', cost: 0, isLegendary: true, nameAr: 'كتيبة الأبطال (مزدوج)', nameEn: 'Hero Battalion Pair', 
        scoreBg1: 'linear-gradient(to bottom, #4b5259, #2b3036)', 
        scoreBg2: 'linear-gradient(to bottom, #c2c5c9, #989c9e)', 
        scoreBorder1: 'none', scoreBorder2: 'none' 
    },
    'score_samurai': { 
        type: 'score', cost: 0, isLegendary: true, nameAr: 'الساموراي البرونزي (مزدوج)', nameEn: 'Samurai Pair', 
        scoreBg1: 'linear-gradient(to bottom, #b58c28, #7a5c15)', 
        scoreBg2: 'linear-gradient(to bottom, #e8e8e8, #a8a8a8)', 
        scoreBorder1: 'none', scoreBorder2: 'none' 
    },
    'score_jester': { 
        type: 'score', cost: 0, isLegendary: true, nameAr: 'مسرح جيستر (مزدوج)', nameEn: 'Jester Theater Pair', 
        scoreBg1: 'linear-gradient(to bottom, #6e3920, #452110)', 
        scoreBg2: 'linear-gradient(to bottom, #d4a37b, #a67d5b)', 
        scoreBorder1: 'none', scoreBorder2: 'none' 
    },
    'score_ruby_amber': { 
        type: 'score', cost: 0, isLegendary: true, nameAr: 'الياقوت والكهرمان (مزدوج)', nameEn: 'Ruby Amber Pair', 
        scoreBg1: 'linear-gradient(to bottom, #941313, #5e0808)', 
        scoreBg2: 'linear-gradient(to bottom, #e39d24, #b57712)', 
        scoreBorder1: 'none', scoreBorder2: 'none' 
    },

    // ===================================
    // خامساً: باقات المصباح والتلميحات (Offers & Hints)
    // ===================================
    'pack_hints_3':  { type: 'consumable', cost: 150, nameAr: 'باقة 3 تلميحات', nameEn: '3 Hints Pack', icon: '💡' },
    'pack_hints_10': { type: 'consumable', cost: 400, nameAr: 'باقة 10 تلميحات', nameEn: '10 Hints Pack', icon: '💡' }
};

window.STORE_ITEMS = STORE_ITEMS;

// 🌟 دالة إضافة عنصر شعبية إلى حقيبة اللاعب وحفظه محلياً ومزامنته 🌟
window.addPopularityToBag = function(itemId, amount = 1) {
    let profile = storeManager.getProfile();
    if (!profile) return;

    if (!profile.inventory || typeof profile.inventory !== 'object') {
        profile.inventory = {};
    }
    
    profile.inventory[itemId] = (profile.inventory[itemId] || 0) + amount;

    localStorage.setItem('hub_user_profile', JSON.stringify(profile));
    if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'SYNC_PROFILE' }, '*');
    }

    if (typeof window.renderGiftsInBag === 'function') {
        window.renderGiftsInBag();
    }
    storeManager.renderUI();
};

// 🌟 دالة عرض هدايا الشعبية المملوكة داخل تبويب الهدايا في الحقيبة 🌟
window.renderGiftsInBag = function() {
    const container = document.getElementById('theme-grid-section-gifts');
    if (!container) return;
    container.innerHTML = '';

    const profile = storeManager.getProfile();
    const inventory = profile.inventory || {};
    const giftsList = window.POPULARITY_ITEMS || [];

    let hasGifts = false;

    giftsList.forEach(gift => {
        const count = inventory[gift.id] || 0;
        if (count > 0) {
            hasGifts = true;
            const giftCard = document.createElement('div');
            giftCard.className = 'theme-grid-item';
            giftCard.innerHTML = `
                <div style="width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.3); border-radius: 8px;">
                    <img src="${gift.imagePath}" style="max-width: 85%; max-height: 85%; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));" alt="${gift.nameAr}">
                </div>
                <span class="theme-grid-title" style="font-size: 11px; margin-top: 4px;">${gift.nameAr}</span>
                <span style="color: #30d158; font-size: 11px; font-weight: bold;">العدد: x${count}</span>
            `;
            container.appendChild(giftCard);
        }
    });

    if (!hasGifts) {
        container.innerHTML = '<div style="color: rgba(255,255,255,0.4); text-align: center; grid-column: 1/-1; padding: 20px;">لا تملك هدايا شعبية حالياً. اشترِ من المتجر!</div>';
    }
};

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
            .legendary-card { 
                animation: none !important; 
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.05), rgba(0, 0, 0, 0.6)) !important; 
                border: 1px solid #ffd700 !important; 
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5) !important;
            }
            .legendary-icon { filter: none !important; }
            .legendary-text { color: #ffd700 !important; text-shadow: none !important; animation: none !important; }
            .legendary-btn { background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 140, 0, 0.2)) !important; border: 1px solid #ffd700 !important; color: #fff !important; }
            .legendary-btn:hover { background: linear-gradient(135deg, rgba(255, 215, 0, 0.4), rgba(255, 140, 0, 0.4)) !important; transform: scale(1.02) !important; }
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
            root.style.setProperty('--my-score-border', item.scoreBorder1 || 'none');
            root.style.setProperty('--opp-score-border', item.scoreBorder2 || 'none');
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
            if (!profile.inventory || typeof profile.inventory !== 'object') profile.inventory = {};
            
            if (!profile.equippedBg || !STORE_ITEMS[profile.equippedBg]) profile.equippedBg = 'bg_wood';
            if (!profile.equippedFr || !STORE_ITEMS[profile.equippedFr]) profile.equippedFr = 'fr_classic';
            if (!profile.equippedPc || !STORE_ITEMS[profile.equippedPc]) profile.equippedPc = 'pc_original';
            if (!profile.equippedScore || !STORE_ITEMS[profile.equippedScore]) profile.equippedScore = 'score_default';

            if (window.gameState) {
                window.gameState.userProfile = profile;
            }
            return profile;
        }
        
        return { purchasedItems: [], inventory: {}, equippedPc: 'pc_original', equippedBg: 'bg_wood', equippedFr: 'fr_classic', equippedScore: 'score_default' };
    },

    buyItem(itemId, itemType = 'item') {
        let profile = this.getProfile();
        const currentLang = localStorage.getItem('app_lang') || localStorage.getItem('appLang') || 'ar';
        const isAr = currentLang !== 'en';
        
        if (!profile || !profile.id) { 
            const msg = isAr ? "يرجى تسجيل الدخول أولاً!" : "Please login first!";
            if (window.socketManager && typeof window.socketManager._showToast === 'function') window.socketManager._showToast(msg);
            else alert(msg);
            return; 
        }
        
        let item = STORE_ITEMS[itemId];
        if (!item && window.POPULARITY_ITEMS) {
            item = window.POPULARITY_ITEMS.find(p => p.id === itemId);
            if (item) {
                item = { cost: item.price, type: 'popularity', nameAr: item.nameAr };
            }
        }
        
        if (!item) return;
        
        const processMsg = isAr ? "جاري معالجة الشراء عبر السيرفر..." : "Processing purchase...";
        if (window.socketManager && typeof window.socketManager._showToast === 'function') window.socketManager._showToast(processMsg);
        
        if (window['socket'] && window['socket'].connected) { 
            window['socket'].emit('requestPurchase', { userId: profile.id, itemId: itemId, cost: item.cost, itemType: itemType || item.type }); 
        } else { 
            if (profile.tokens >= item.cost) {
                profile.tokens -= item.cost;
                if (itemType === 'popularity' || (window.POPULARITY_ITEMS && window.POPULARITY_ITEMS.some(p => p.id === itemId))) {
                    if (!profile.inventory) profile.inventory = {};
                    profile.inventory[itemId] = (profile.inventory[itemId] || 0) + 1;
                } else {
                    if (!profile.purchasedItems.includes(itemId)) profile.purchasedItems.push(itemId);
                }
                localStorage.setItem('hub_user_profile', JSON.stringify(profile));
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({ type: 'SYNC_PROFILE' }, '*');
                }
                const successMsg = isAr ? `تم شراء ${item.nameAr || 'المنتج'} بنجاح!` : 'Purchase successful!';
                if (window.socketManager && typeof window.socketManager._showToast === 'function') window.socketManager._showToast(successMsg);
                this.renderUI();
            } else {
                const errorMsg = isAr ? "رصيدك غير كافٍ!" : "Insufficient tokens!";
                if (window.socketManager && typeof window.socketManager._showToast === 'function') window.socketManager._showToast(errorMsg);
            }
        }
    },

    equipItem(itemId) {
        let profile = this.getProfile();
        const currentLang = localStorage.getItem('app_lang') || localStorage.getItem('appLang') || 'ar';
        const isAr = currentLang !== 'en';

        if (!profile || !profile.id) { 
            const msg = isAr ? "يرجى تسجيل الدخول أولاً لاستخدام العناصر!" : "Please login first to equip items!";
            if (window.socketManager && typeof window.socketManager._showToast === 'function') window.socketManager._showToast(msg);
            else alert(msg);
            return; 
        }
        
        const item = STORE_ITEMS[itemId];

        if (window['socket'] && window['socket'].connected) { 
            window['socket'].emit('requestEquip', { userId: profile.id, itemId: itemId, itemType: item ? item.type : 'pc' }); 
        } else {
            if (!item) return;
            
            if (item.type === 'bg') { 
                profile.equippedBg = itemId; 
                if (item.linkedScore) {
                    profile.equippedScore = item.linkedScore;
                }
            } 
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

        const bagBg = document.getElementById('theme-grid-section-bg'); 
        const bagFr = document.getElementById('theme-grid-section-frames'); 
        const bagPc = document.getElementById('theme-grid-section-pieces');

        if(storeBg) storeBg.innerHTML = ''; 
        if(storeFr) storeFr.innerHTML = ''; 
        if(storePc) storePc.innerHTML = '';
        if(storeOffers) storeOffers.innerHTML = '';

        if(bagBg) bagBg.innerHTML = ''; 
        if(bagFr) bagFr.innerHTML = ''; 
        if(bagPc) bagPc.innerHTML = '';

        if (typeof window.renderGiftsInBag === 'function') {
            window.renderGiftsInBag();
        }

        const profile = this.getProfile(); 
        const currentLang = localStorage.getItem('app_lang') || localStorage.getItem('appLang') || 'ar';
        const isAr = currentLang !== 'en';
        let storePcEmpty = true, storeBgEmpty = true, storeFrEmpty = true;

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

            if (targetSection === 'score') return;
            
            const safePurchased = Array.isArray(profile.purchasedItems) ? profile.purchasedItems : [];
            const isPurchased = item.isDefault || safePurchased.includes(key);
            
            const isEquipped = (profile.equippedBg === key || profile.equippedPc === key || profile.equippedFr === key);
            const name = isAr ? item.nameAr : item.nameEn;

            const legendaryClassCard = item.isLegendary ? 'legendary-card' : ''; const legendaryClassIcon = item.isLegendary ? 'legendary-icon' : ''; const legendaryClassText = item.isLegendary ? 'legendary-text' : ''; const legendaryClassBtn = item.isLegendary ? 'legendary-btn' : '';
            const legendaryTag = item.isLegendary ? `<span style="position: absolute; top: -5px; right: -5px; background: linear-gradient(45deg, #ff007f, #7f00ff); color: white; font-size: 10px; padding: 3px 8px; border-radius: 8px; font-weight: bold; box-shadow: 0 0 10px #ff007f;">أسطوري</span>` : '';
            const legendaryBagBadge = item.isLegendary ? `<div style="font-size:10px; color:#ffd700; margin-bottom:5px; font-weight:bold;">★ أسطوري ★</div>` : '';

            let visualHtml = '';
            let bagVisualHtml = '';

            if (item.isImage && item.type !== 'fr') {
                let showImg = item.imagePathWhite || item.imagePath || '';
                visualHtml = `<div style="width: 50px; height: 50px; border-radius: 8px; background-image: url('${showImg}'); background-size: cover; background-position: center; margin: 5px 0; border: ${item.isLegendary ? '1px solid #FFD700' : '1px solid rgba(255,255,255,0.1)'};" class="${legendaryClassIcon}"></div>`;
            } else if (item.type === 'bg') {
                let bgStyle = (item.cssLight && item.cssDark) ? `<div style="display:flex; flex:1;"><div style="flex:1; ${item.cssLight}"></div><div style="flex:1; ${item.cssDark}"></div></div><div style="display:flex; flex:1;"><div style="flex:1; ${item.cssDark}"></div><div style="flex:1; ${item.cssLight}"></div></div>` : `<div style="display:flex; flex:1; background:${item.light};"></div><div style="flex:1; background:${item.dark};"></div>`;
                visualHtml = `<div style="width: 50px; height: 50px; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; margin: 5px 0; border: ${item.isLegendary ? '1px solid #FFD700' : '1px solid rgba(255,255,255,0.1)'};" class="${legendaryClassIcon}">${bgStyle}</div>`;
            } else if (item.type === 'fr') {
                let framePreview = '';
                if (item.isImage) {
                    framePreview = `<div style="width: 32px; height: 32px; background: rgba(0,0,0,0.7); background-clip: padding-box; border: 6px solid transparent; border-image: url('${item.imagePath}') 15% stretch;" class="${legendaryClassIcon}"></div>`;
                } else {
                    framePreview = `<div style="width: 32px; height: 32px; background: rgba(0,0,0,0.7); ${item.cssBoard || ''} border-width: 6px !important; border-radius: 4px;" class="${legendaryClassIcon}"></div>`;
                }
                visualHtml = `<div style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.08); border-radius: 8px; margin: 5px auto; border: ${item.isLegendary ? '1px solid #FFD700' : '1px solid rgba(255,255,255,0.2)'}; box-shadow: inset 0 0 10px rgba(0,0,0,0.5);">
                    ${framePreview}
                </div>`;
            } else if (item.type === 'pc') {
                let customPcStyle = item.wCss ? item.wCss : '';
                visualHtml = `<div style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; position: relative; ${customPcStyle}" class="${legendaryClassIcon}">${item.icon || ''}</div>`;
            } else if (item.type === 'consumable') {
                visualHtml = `<div style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; font-size: 32px; background: rgba(255,255,255,0.05); border-radius: 8px; margin: 5px 0; border: 1px solid rgba(255,255,255,0.1);" class="${legendaryClassIcon}">${item.icon || '💡'}</div>`;
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
                        bagVisualHtml = `<div class="theme-grid-preview ${legendaryClassIcon}" style="width: 50px; height: 50px; border-radius: 8px; background-image: url('${item.imagePath}'); background-size: cover; background-position: center; border: ${item.isLegendary ? '1px solid #FFD700' : '1px solid rgba(255,255,255,0.2)'}; box-shadow: 0 5px 15px rgba(0,0,0,0.5);"></div>`;
                    } else {
                        let bgStyle = (item.cssLight && item.cssDark) ? `<div style="display:flex; flex:1;"><div style="flex:1; ${item.cssLight}"></div><div style="flex:1; ${item.cssDark}"></div></div><div style="display:flex; flex:1;"><div style="flex:1; ${item.cssDark}"></div><div style="flex:1; ${item.cssLight}"></div></div>` : `<div style="display:flex; flex:1; background:${item.light};"></div><div style="flex:1; background:${item.dark};"></div>`;
                        bagVisualHtml = `<div class="theme-grid-preview ${legendaryClassIcon}" style="width: 50px; height: 50px; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; border: ${item.isLegendary ? '1px solid #FFD700' : '1px solid rgba(255,255,255,0.2)'}; box-shadow: 0 5px 15px rgba(0,0,0,0.5);">${bgStyle}</div>`;
                    }
                }
                
                gridItem.innerHTML = `${legendaryBagBadge}${bagVisualHtml} <span class="theme-grid-title ${legendaryClassText}" style="margin-top:8px;">${name}</span>`;
                
                if (targetSection === 'bg' && bagBg) bagBg.appendChild(gridItem); 
                else if (targetSection === 'fr' && bagFr) bagFr.appendChild(gridItem); 
                else if (targetSection === 'pc' && bagPc) bagPc.appendChild(gridItem);
            } else {
                const storeCard = document.createElement('div');
                storeCard.className = `store-item-card ${legendaryClassCard}`; storeCard.style.position = 'relative'; 
                
                if (item.hasPurpleBorder) {
                    storeCard.style.border = '1px solid rgba(168, 85, 247, 0.6)'; 
                    storeCard.style.boxShadow = '0 0 12px rgba(168, 85, 247, 0.15), inset 0 0 6px rgba(0,0,0,0.9)';
                }

                storeCard.innerHTML = `${legendaryTag} <div class="${legendaryClassText}" style="color: white; font-weight: 600; font-size: 14px; text-align: center; margin-top: ${item.isLegendary ? '10px' : '0'}; line-height: 1.2;">${name}</div> ${visualHtml} <div style="color: #f5a623; font-size: 13px; font-weight: bold; margin-bottom: 2px; margin-top: auto;">🪙 ${item.cost}</div>`;
                
                const buyBtn = document.createElement('button');
                buyBtn.className = `store-buy-btn store-buy-btn-small ${legendaryClassBtn}`; buyBtn.innerText = isAr ? 'شراء' : 'Buy';
                buyBtn.onclick = () => { 
                    if (window['openPurchaseModal']) { 
                        window['openPurchaseModal'](key, name, item.cost, item.type); 
                    } else { 
                        this.buyItem(key, item.type); 
                    } 
                };
                
                storeCard.appendChild(buyBtn);

                if (targetSection === 'bg') { 
                    if(storeBg) storeBg.appendChild(storeCard); storeBgEmpty = false; 
                } else if (targetSection === 'fr') { 
                    if(storeFr) storeFr.appendChild(storeCard); storeFrEmpty = false; 
                } else if (targetSection === 'consumable') {
                    if(storeOffers) storeOffers.appendChild(storeCard); 
                } else { 
                    if(storePc) storePc.appendChild(storeCard); storePcEmpty = false; 
                }
            }
        });

        if (storeBg && storeBgEmpty) storeBg.innerHTML = `<div style="color: rgba(255,255,255,0.4); text-align: center; grid-column: 1/-1; padding: 20px;">${isAr ? 'لا توجد عناصر متاحة' : 'No items available'}</div>`;
        if (storeFr && storeFrEmpty) storeFr.innerHTML = `<div style="color: rgba(255,255,255,0.4); text-align: center; grid-column: 1/-1; padding: 20px;">${isAr ? 'لا توجد عناصر متاحة' : 'No items available'}</div>`;
        if (storePc && storePcEmpty) storePc.innerHTML = `<div style="color: rgba(255,255,255,0.4); text-align: center; grid-column: 1/-1; padding: 20px;">${isAr ? 'لا توجد عناصر متاحة' : 'No items available'}</div>`;
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
                
                if (!window.__STORE_SOCKET_INIT) {
                    window.__STORE_SOCKET_INIT = true;
                    
                    window['socket'].on('profileUpdated', (updatedProfile) => {
                        this.renderUI();
                    });
                    
                    window['socket'].on('purchaseFailed', (msg) => { 
                        if (window.socketManager && typeof window.socketManager._showToast === 'function') window.socketManager._showToast(msg); 
                        else if (window['triggerCustomAlertNotification']) window['triggerCustomAlertNotification'](msg); 
                    });
                    
                    window['socket'].on('purchaseSuccess', (data) => { 
                        let msg = typeof data === 'string' ? data : (data.message || 'تم الشراء بنجاح!');
                        
                        if (data && data.itemId) {
                            if (data.itemType === 'popularity' || (window.POPULARITY_ITEMS && window.POPULARITY_ITEMS.some(p => p.id === data.itemId))) {
                                window.addPopularityToBag(data.itemId, data.amount || 1);
                            }
                        }

                        if (window.socketManager && typeof window.socketManager._showToast === 'function') window.socketManager._showToast(msg); 
                        else if (window['triggerCustomAlertNotification']) window['triggerCustomAlertNotification'](msg); 
                        
                        if (typeof window.triggerPurchaseCelebration === 'function') {
                            window.triggerPurchaseCelebration();
                        }
                        this.renderUI();
                    });
                }
                
            } else if (socketAttempts >= maxAttempts) { 
                clearInterval(socketCheck); 
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
        
        let bgItem = STORE_ITEMS[profile.equippedBg];
        if (bgItem && bgItem.linkedScore) {
            storeManager.applyScoreThemeCSS(bgItem.linkedScore);
        } else if (profile.equippedScore) {
            storeManager.applyScoreThemeCSS(profile.equippedScore);
        }
    } else if (profile.equippedScore) {
        storeManager.applyScoreThemeCSS(profile.equippedScore);
    }
    
    if (profile.equippedFr) {
        storeManager.applyFrameThemeCSS(profile.equippedFr);
    }
    if (profile.equippedPc) {
        document.body.setAttribute('data-piece-style', profile.equippedPc);
    }
};

// ==========================================
// 🌟 وظائف الواجهة (التبويبات النظيفة المتوافقة مع التصميم الجديد) 🌟
// ==========================================

window.switchThemeGridTabCategory = function(category) {
    // إخفاء كل أقسام الحقيبة (الخاصة بالألعاب والعام) وإزالة التفعيل
    const allTabs = ['bg', 'frames', 'pieces', 'profile-frames', 'gifts'];
    allTabs.forEach(tab => { 
        const btn = document.getElementById('theme-btn-tab-' + tab); 
        const sec = document.getElementById('theme-grid-section-' + tab); 
        if(btn) btn.classList.remove('active'); 
        if(sec) sec.style.display = 'none'; 
    });
    
    const activeBtn = document.getElementById('theme-btn-tab-' + category); 
    const activeSec = document.getElementById('theme-grid-section-' + category);
    
    if(activeBtn) activeBtn.classList.add('active'); 
    if(activeSec) {
        activeSec.style.display = 'grid';
        if (category === 'gifts') {
            window.renderGiftsInBag();
        }
    }
};

window.openPurchaseModal = function(itemId, itemName, cost, itemType) {
    const nameEl = document.getElementById('modal-item-name'); 
    const costEl = document.getElementById('modal-item-cost'); 
    const previewEl = document.getElementById('modal-item-preview'); 
    const buyBtn = document.getElementById('confirm-buy-btn');
    
    if (!nameEl || !costEl || !previewEl || !buyBtn) {
        storeManager.buyItem(itemId, itemType);
        return;
    }

    // 1. تعيين الاسم والسعر الأساسي
    nameEl.innerText = itemName; 
    costEl.innerText = '🪙 ' + cost; 

    // 2. تجهيز صورة العرض (Preview)
    let itemData = window.STORE_ITEMS ? window.STORE_ITEMS[itemId] : null; 
    if (!itemData && window.POPULARITY_ITEMS) {
        const popItem = window.POPULARITY_ITEMS.find(p => p.id === itemId);
        if (popItem) {
            itemData = { isImage: true, imagePath: popItem.imagePath, isLegendary: false, type: 'popularity' };
        }
    }

    previewEl.innerHTML = ''; 
    previewEl.style.background = 'rgba(255,255,255,0.05)'; 
    previewEl.style.backgroundImage = 'none';
    
    if(itemData) {
        previewEl.style.border = itemData.isLegendary ? '1px solid #ffd700' : '1px solid rgba(255,255,255,0.1)'; 
        previewEl.className = itemData.isLegendary ? 'purchase-preview-box legendary-icon' : 'purchase-preview-box';
        if (itemData.isImage) { 
            let imgUrl = itemData.imagePath || itemData.imagePathWhite || ''; 
            previewEl.style.backgroundImage = `url('${imgUrl}')`; 
            previewEl.style.backgroundSize = 'contain'; 
            previewEl.style.backgroundRepeat = 'no-repeat';
            previewEl.style.backgroundPosition = 'center'; 
        } else if(itemType === 'pc') { 
            previewEl.innerHTML = itemData.icon || '💎'; 
        } else if(itemType === 'score') { 
            previewEl.innerHTML = `<div style="width: 80%; height: 35px; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; border: 1px solid rgba(255,255,255,0.2);"><div style="flex: 1; background: ${itemData.scoreBg2}; border-bottom: 1px solid rgba(255,255,255,0.1);"></div><div style="flex: 1; background: ${itemData.scoreBg1};"></div></div>`; 
        } else if(itemType === 'bg' || itemType === 'fr') { 
            if (itemData.cssLight && itemData.cssDark) { 
                previewEl.innerHTML = `<div style="display:flex; flex:1;"><div style="flex:1; ${itemData.cssLight}"></div><div style="flex:1; ${itemData.cssDark}"></div></div><div style="display:flex; flex:1;"><div style="flex:1; ${itemData.cssDark}"></div><div style="flex:1; ${itemData.cssLight}"></div></div>`; 
            } else if (itemData.cssBoard) { 
                previewEl.innerHTML = `<div style="width:100%; height:100%; ${itemData.cssBoard} border-width:6px;"></div>`; 
            } else { 
                previewEl.style.background = `linear-gradient(135deg, ${itemData.light || '#DEB887'} 50%, ${itemData.dark || '#8B4513'} 50%)`; 
            } 
        }
    } else { 
        previewEl.innerHTML = '🎁'; 
        previewEl.className = 'purchase-preview-box'; 
    }

    // 3. منطق بطاقات الخصم المفقود!
    window.currentPurchaseItem = { id: itemId, price: cost, type: itemType };
    
    // جلب ملف اللاعب للتحقق من التذاكر
    const profile = storeManager.getProfile() || {};
    const discountContainer = document.getElementById('discount-selector-container');
    const discountSelect = document.getElementById('discount-ticket-select');
    
    let availableTickets = [];
    
    // دعم النظامين (المصفوفة الجديدة والقيمة القديمة)
    if (Array.isArray(profile.discountTickets) && profile.discountTickets.length > 0) {
        availableTickets = profile.discountTickets.map(t => typeof t === 'object' ? t.rate : t).filter(r => r > 0);
    } else if (profile.discountTicket && profile.discountTicket > 0) {
        availableTickets = [profile.discountTicket];
    }

    // إظهار صندوق الخصومات فقط إذا توفرت الشروط
    if (discountContainer && discountSelect) {
        if (availableTickets.length > 0 && cost > 0 && itemType !== 'popularity') {
            discountContainer.style.display = 'flex';
            discountSelect.innerHTML = '<option value="0">بدون خصم (حفظ القسائم)</option>';
            
            availableTickets.sort((a, b) => b - a); // ترتيب من الأعلى للأقل
            
            availableTickets.forEach((rate) => {
                let opt = document.createElement('option');
                opt.value = rate;
                opt.innerText = `خصم ${rate}% 🎫`;
                discountSelect.appendChild(opt);
            });

            // تفاعل السعر عند اختيار بطاقة
            discountSelect.onchange = function() {
                let selectedRate = parseInt(this.value) || 0;
                if (selectedRate > 0) {
                    let discountedPrice = Math.floor(cost * (1 - (selectedRate / 100)));
                    // إضافة دالة التنسيق إذا كانت متوفرة، أو عرض الرقم مباشرة
                    let displayCost = typeof formatCompactNumber === 'function' ? formatCompactNumber(cost) : cost;
                    let displayDiscount = typeof formatCompactNumber === 'function' ? formatCompactNumber(discountedPrice) : discountedPrice;
                    
                    costEl.innerHTML = `🪙 السعر: <span style="text-decoration: line-through; color: #a1a1aa; font-size: 15px;">${displayCost}</span> <span style="color: #30d158; margin-right: 5px;">${displayDiscount}</span>`;
                } else {
                    let displayCost = typeof formatCompactNumber === 'function' ? formatCompactNumber(cost) : cost;
                    costEl.innerText = `🪙 السعر: ${displayCost}`;
                }
            };
            
            discountSelect.value = "0";
            discountSelect.dispatchEvent(new Event('change'));
        } else {
            discountContainer.style.display = 'none';
        }
    }

    // 4. زر الشراء وربطه بالسيرفر لدعم التذاكر
    buyBtn.innerText = "شراء الآن";
    buyBtn.disabled = false;
    
    buyBtn.onclick = () => { 
        let selectedDiscountRate = 0;
        
        // قراءة الخصم فقط إذا كانت القائمة ظاهرة
        if (discountSelect && discountContainer && discountContainer.style.display !== 'none') {
            selectedDiscountRate = parseInt(discountSelect.value) || 0;
        }

        buyBtn.innerText = "جاري الشراء...";
        buyBtn.disabled = true;

        // إرسال الطلب للسيرفر ليقوم بخصم التذكرة الرصيد
        if (window.socket && window.socket.connected) {
            window.socket.emit('requestPurchase', { 
                itemId: itemId,
                appliedDiscountRate: selectedDiscountRate 
            });
        } else {
            // في حال عدم الاتصال بالسيرفر
            storeManager.buyItem(itemId, itemType);
        }

        setTimeout(() => { 
            if (typeof window.closeAppModal === 'function') window.closeAppModal('purchase-modal'); 
        }, 500); 
    };

    if (typeof window.openAppModal === 'function') window.openAppModal('purchase-modal');
};
