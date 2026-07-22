// icons.js
// هذا الملف يحتوي على جميع أكواد صور SVG ليتم حقنها في اللعبة لتخفيف حجم كود HTML

const SVGIcons = {
    // 1. أيقونة القائمة (الهامبرغر)
    hamburger: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>`,

    // 2. أيقونة نسخ الـ ID
    copyId: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,

    // 3. حقيبة الأزياء السريعة (العلوية) - ذات المعرفات العادية
    bagQuick: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="34" height="34" style="vertical-align: middle; display: inline-block; transform: scale(1.3);">
        <defs>
            <linearGradient id="bagGold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef08a"/><stop offset="25%" stop-color="#f59e0b"/><stop offset="50%" stop-color="#d97706"/><stop offset="75%" stop-color="#b45309"/><stop offset="100%" stop-color="#78350f"/></linearGradient>
            <linearGradient id="bagBody" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#334155"/><stop offset="40%" stop-color="#1e293b"/><stop offset="85%" stop-color="#0f172a"/><stop offset="100%" stop-color="#020617"/></linearGradient>
            <linearGradient id="bagIvory" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ffffff"/><stop offset="70%" stop-color="#fef3c7"/><stop offset="100%" stop-color="#fde68a"/></linearGradient>
            <linearGradient id="bagRuby" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f87171"/><stop offset="50%" stop-color="#dc2626"/><stop offset="100%" stop-color="#991b1b"/></linearGradient>
            <radialGradient id="bagGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#f59e0b" stop-opacity="0.45"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
            <filter id="bagShadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000000" flood-opacity="0.35"/></filter>
            <style>.anim-luxury { transform-origin: 60px 60px; animation: luxuryFloat 4s ease-in-out infinite; } @keyframes luxuryFloat { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-7px) rotate(-1deg); } }</style>
        </defs>
        <g class="anim-luxury">
            <circle cx="60" cy="60" r="54" fill="url(#bagGlow)"/>
            <ellipse cx="60" cy="108" rx="34" ry="4" fill="#000000" opacity="0.22"/>
            <g filter="url(#bagShadow)">
                <path d="M 44 32 C 44 18 76 18 76 32" fill="none" stroke="url(#bagGold)" stroke-width="4.5" stroke-linecap="round"/>
                <rect x="52" y="20" width="16" height="5" rx="2.5" fill="url(#bagBody)" stroke="url(#bagGold)" stroke-width="1"/>
                <rect x="22" y="32" width="76" height="66" rx="14" fill="url(#bagBody)" stroke="url(#bagGold)" stroke-width="1.8"/>
                <path d="M 22 46 L 22 38 C 22 34.7 24.7 32 28 32 L 36 32" fill="none" stroke="url(#bagGold)" stroke-width="3.5" stroke-linecap="round"/>
                <path d="M 84 32 L 92 32 C 95.3 32 98 34.7 98 38 L 98 46" fill="none" stroke="url(#bagGold)" stroke-width="3.5" stroke-linecap="round"/>
                <path d="M 22 84 L 22 92 C 22 95.3 24.7 98 28 98 L 36 98" fill="none" stroke="url(#bagGold)" stroke-width="3.5" stroke-linecap="round"/>
                <path d="M 84 98 L 92 98 C 95.3 98 98 95.3 98 92 L 98 84" fill="none" stroke="url(#bagGold)" stroke-width="3.5" stroke-linecap="round"/>
                <rect x="36" y="38" width="6" height="10" rx="1.5" fill="url(#bagGold)"/>
                <circle cx="39" cy="45" r="1" fill="#0f172a"/>
                <rect x="78" y="38" width="6" height="10" rx="1.5" fill="url(#bagGold)"/>
                <circle cx="81" cy="45" r="1" fill="#0f172a"/>
                <line x1="22" y1="48" x2="98" y2="48" stroke="url(#bagGold)" stroke-width="1.5" stroke-dasharray="8,2,2,2"/>
                <g transform="translate(32, 52) rotate(-18)">
                    <rect x="0" y="0" width="22" height="30" rx="3" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
                    <path d="M 11 19 L 7 13 L 15 13 Z" fill="#1e293b"/>
                    <circle cx="11" cy="13" r="2.5" fill="#1e293b"/>
                </g>
                <g transform="translate(38, 50) rotate(-6)">
                    <rect x="0" y="0" width="22" height="30" rx="3" fill="url(#bagIvory)" stroke="url(#bagGold)" stroke-width="1"/>
                    <text x="3" y="7" font-family="Arial" font-size="5" font-weight="bold" fill="url(#bagRuby)">A</text>
                    <path d="M 11 20 C 11 20 5 14 5 10 C 5 7.5 7 6 9.2 6 C 10.6 6 11 6.8 11 6.8 C 11 6.8 11.4 6 12.8 6 C 15 6 17 7.5 17 10 C 17 14 11 20 11 20 Z" fill="url(#bagRuby)"/>
                </g>
                <g transform="translate(64, 52) rotate(12)">
                    <rect x="0" y="0" width="19" height="32" rx="3.5" fill="url(#bagIvory)" stroke="#1e293b" stroke-width="1.2"/>
                    <line x1="3" y1="16" x2="16" y2="16" stroke="#475569" stroke-width="1.2"/>
                    <circle cx="9.5" cy="16" r="1.2" fill="url(#bagGold)"/>
                    <circle cx="5.5" cy="5.5" r="1.3" fill="#0f172a"/>
                    <circle cx="13.5" cy="5.5" r="1.3" fill="#0f172a"/>
                    <circle cx="5.5" cy="10.5" r="1.3" fill="#0f172a"/>
                    <circle cx="13.5" cy="10.5" r="1.3" fill="#0f172a"/>
                    <circle cx="5.5" cy="21.5" r="1.3" fill="#0f172a"/>
                    <circle cx="13.5" cy="21.5" r="1.3" fill="#0f172a"/>
                    <circle cx="5.5" cy="26.5" r="1.3" fill="#0f172a"/>
                    <circle cx="13.5" cy="26.5" r="1.3" fill="#0f172a"/>
                </g>
                <g transform="translate(34, 76) rotate(8)">
                    <rect x="0" y="0" width="15" height="15" rx="3.5" fill="url(#bagIvory)" stroke="url(#bagGold)" stroke-width="1"/>
                    <circle cx="4" cy="4" r="1.2" fill="#0f172a"/>
                    <circle cx="11" cy="4" r="1.2" fill="#0f172a"/>
                    <circle cx="7.5" cy="7.5" r="1.4" fill="url(#bagRuby)"/>
                    <circle cx="4" cy="11" r="1.2" fill="#0f172a"/>
                    <circle cx="11" cy="11" r="1.2" fill="#0f172a"/>
                </g>
                <g transform="translate(70, 78)">
                    <circle cx="10" cy="10" r="10" fill="url(#bagGold)" stroke="#78350f" stroke-width="1"/>
                    <circle cx="10" cy="10" r="7" fill="url(#bagBody)" stroke="url(#bagGold)" stroke-width="1"/>
                    <circle cx="10" cy="10" r="3.5" fill="url(#bagGold)"/>
                    <circle cx="10" cy="10" r="1.5" fill="#ffffff" opacity="0.6"/>
                </g>
            </g>
        </g>
    </svg>`,

    // 4. الغرف الخاصة (روم)
    door: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="34" height="34" style="vertical-align: middle; display: inline-block; transform: scale(1.3); transform-origin: center;">
        <defs>
            <linearGradient id="doorGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#8d6e63"/><stop offset="100%" stop-color="#5d4037"/></linearGradient>
            <radialGradient id="handleGrad" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fde047"/><stop offset="100%" stop-color="#ca8a04"/></radialGradient>
            <filter id="doorShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/></filter>
            <style>.anim-door { transform-origin: 50px 50px; animation: floatDoor 3s ease-in-out infinite; } @keyframes floatDoor { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }</style>
        </defs>
        <g class="anim-door">
            <ellipse cx="50" cy="88" rx="24" ry="3.5" fill="#000" opacity="0.2"/>
            <path d="M 22 84 L 22 24 C 22 17, 78 17, 78 24 L 78 84 Z" fill="#3e2723" filter="url(#doorShadow)"/>
            <path d="M 26 84 L 26 27 C 26 22, 74 22, 74 27 L 74 84 Z" fill="url(#doorGrad)"/>
            <rect x="31" y="31" width="38" height="22" rx="2" fill="rgba(0,0,0,0.15)" stroke="rgba(255,255,255,0.1)" stroke-width="0.8"/>
            <rect x="31" y="58" width="38" height="22" rx="2" fill="rgba(0,0,0,0.15)" stroke="rgba(255,255,255,0.1)" stroke-width="0.8"/>
            <circle cx="65" cy="55" r="3.5" fill="url(#handleGrad)" filter="url(#doorShadow)"/>
            <g transform="translate(62, 12)" filter="url(#doorShadow)">
                <circle cx="12" cy="12" r="12" fill="#22c55e"/>
                <path d="M 12 6 L 12 18 M 6 12 L 18 12" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
            </g>
        </g>
    </svg>`,

    // 5. كأس الشرف (الترتيب)
    medal: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="34" height="34" style="vertical-align: middle; display: inline-block; transform: scale(1.3); transform-origin: center;">
        <defs>
            <linearGradient id="medalGm" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fffbeb"/><stop offset="15%" stop-color="#fef08a"/><stop offset="35%" stop-color="#eab308"/><stop offset="60%" stop-color="#ca8a04"/><stop offset="85%" stop-color="#854d0e"/><stop offset="100%" stop-color="#451a03"/></linearGradient>
            <linearGradient id="medalGe" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stop-color="#78350f"/><stop offset="50%" stop-color="#fde047"/><stop offset="100%" stop-color="#fff"/></linearGradient>
            <linearGradient id="medalRb" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#991b1b"/><stop offset="40%" stop-color="#dc2626"/><stop offset="100%" stop-color="#7f1d1d"/></linearGradient>
            <linearGradient id="medalRs" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(0,0,0,0.1)"/><stop offset="100%" stop-color="rgba(0,0,0,0.5)"/></linearGradient>
            <radialGradient id="medalMg" cx="50%" cy="62%" r="45%"><stop offset="0%" stop-color="#fde047" stop-opacity="0.6"/><stop offset="100%" stop-color="#fde047" stop-opacity="0"/></radialGradient>
            <filter id="medalUs" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000" flood-opacity="0.4"/></filter>
            <filter id="medalTd" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#b45309" flood-opacity="0.35"/></filter>
            <style>
                @keyframes medalFloat { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-3px) scale(1.03); } }
                @keyframes medalSparkle { 0%, 100% { opacity: 0.2; transform: scale(0.7) rotate(0deg); } 50% { opacity: 1; transform: scale(1.4) rotate(180deg); } }
                .medal-am { animation: medalFloat 3s ease-in-out infinite; transform-origin: 50px 50px; }
                .medal-s1 { animation: medalSparkle 2.2s ease-in-out infinite; transform-origin: 25px 25px; }
                .medal-s2 { animation: medalSparkle 2.8s ease-in-out infinite 0.7s; transform-origin: 75px 25px; }
            </style>
        </defs>
        <g class="medal-am" filter="url(#medalTd)">
            <circle cx="50" cy="62" r="32" fill="url(#medalMg)"/>
            <g filter="url(#medalUs)">
                <path d="M36 10 L18 30 L30 35 L44 14 Z" fill="#581c87" opacity="0.3"/>
                <path d="M64 10 L82 30 L70 35 L56 14 Z" fill="#581c87" opacity="0.3"/>
                <path d="M38 10 L22 28 L32 33 L46 14 Z" fill="#7f1d1d"/>
                <path d="M62 10 L78 28 L68 33 L54 14 Z" fill="#7f1d1d"/>
                <path d="M38 10 L50 26 L62 10 L54 6 L50 12 L46 6 Z" fill="url(#medalRb)"/>
                <path d="M33 10 L50 31 L67 10 L63 6 L50 22 L37 6 Z" fill="url(#medalRb)"/>
                <line x1="43" y1="8" x2="47" y2="22" stroke="#fde047" stroke-width="1.5" opacity="0.8"/>
                <line x1="57" y1="8" x2="53" y2="22" stroke="#fde047" stroke-width="1.5" opacity="0.8"/>
                <path d="M33 10 L50 31 L67 10 L50 16 Z" fill="url(#medalRs)"/>
            </g>
            <g filter="url(#medalUs)">
                <ellipse cx="50" cy="33" rx="6" ry="3.5" fill="#451a03"/>
                <path d="M43 33 C43 28 57 28 57 33 C57 38 43 38 43 33 Z" fill="none" stroke="url(#medalGm)" stroke-width="3"/>
                <ellipse cx="50" cy="33" rx="3.5" ry="1.8" fill="#eab308"/>
            </g>
            <circle cx="50" cy="63" r="27" fill="#000" opacity="0.35"/>
            <g filter="url(#medalUs)">
                <circle cx="50" cy="62" r="27" fill="url(#medalGm)"/>
                <circle cx="50" cy="62" r="26" fill="none" stroke="url(#medalGe)" stroke-width="1.5"/>
                <circle cx="50" cy="62" r="23.5" fill="none" stroke="#78350f" stroke-width="0.8" stroke-dasharray="1.5 3" opacity="0.85"/>
                <circle cx="50" cy="62" r="22" fill="#78350f"/>
                <circle cx="50" cy="62" r="21" fill="url(#medalGm)"/>
            </g>
            <path d="M34 65 C34 52 42 45 50 45 C58 45 66 52 66 65" opacity="0.4" stroke="#78350f" stroke-width="1" fill="none"/>
            <g transform="translate(50, 62) scale(1.05)" filter="url(#medalUs)">
                <polygon points="0,-13.5 4,-4 13.5,-4 6,-0.5 8.5,9.5 0,4 -8.5,9.5 -6,-0.5 -13.5,-4 -4,-4" fill="#78350f"/>
                <polygon points="0,-13.5 0,2 4,-4" fill="#fef08a"/>
                <polygon points="0,-13.5 0,2 -4,-4" fill="#ca8a04"/>
                <polygon points="13.5,-4 0,2 4,-4" fill="#eab308"/>
                <polygon points="13.5,-4 0,2 8.5,9.5" fill="#a16207"/>
                <polygon points="8.5,9.5 0,2 6,-0.5" fill="#ca8a04"/>
                <polygon points="8.5,9.5 0,2 0,4" fill="#854d0e"/>
                <polygon points="0,4 0,2 -6,-0.5" fill="#eab308"/>
                <polygon points="0,4 0,2 -8.5,9.5" fill="#ca8a04"/>
                <polygon points="-8.5,9.5 0,2 -4,-4" fill="#a16207"/>
                <polygon points="-13.5,-4 0,2 -4,-4" fill="#fef08a"/>
                <circle cx="0" cy="2" r="1.5" fill="#fff"/>
            </g>
            <path class="medal-s1" d="M25 25 L26.5 21 L28 25 L32 26.5 L28 28 L26.5 32 L25 28 L21 26.5 Z" fill="#fff"/>
            <path class="medal-s2" d="M75 25 L76 22 L77 25 L80 26 L77 27 L76 30 L75 27 L72 26 Z" fill="#fffbeb"/>
        </g>
    </svg>`,

    // 6. حقيبة الأزياء الجانبية - قمنا بتمييز المعرفات بإضافة "Side" لتجنب اختفاءها
    bagSide: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="34" height="34" style="vertical-align: middle; display: inline-block; transform: scale(1.3); transform-origin: center;">
        <defs>
            <linearGradient id="bagGoldSide" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef08a"/><stop offset="25%" stop-color="#f59e0b"/><stop offset="50%" stop-color="#d97706"/><stop offset="75%" stop-color="#b45309"/><stop offset="100%" stop-color="#78350f"/></linearGradient>
            <linearGradient id="bagBodySide" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#334155"/><stop offset="40%" stop-color="#1e293b"/><stop offset="85%" stop-color="#0f172a"/><stop offset="100%" stop-color="#020617"/></linearGradient>
            <linearGradient id="bagIvorySide" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ffffff"/><stop offset="70%" stop-color="#fef3c7"/><stop offset="100%" stop-color="#fde68a"/></linearGradient>
            <linearGradient id="bagRubySide" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f87171"/><stop offset="50%" stop-color="#dc2626"/><stop offset="100%" stop-color="#991b1b"/></linearGradient>
            <radialGradient id="bagGlowSide" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#f59e0b" stop-opacity="0.45"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
            <filter id="bagShadowSide" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000000" flood-opacity="0.35"/></filter>
        </defs>
        <g class="anim-luxury">
            <circle cx="60" cy="60" r="54" fill="url(#bagGlowSide)"/>
            <ellipse cx="60" cy="108" rx="34" ry="4" fill="#000000" opacity="0.22"/>
            <g filter="url(#bagShadowSide)">
                <path d="M 44 32 C 44 18 76 18 76 32" fill="none" stroke="url(#bagGoldSide)" stroke-width="4.5" stroke-linecap="round"/>
                <rect x="52" y="20" width="16" height="5" rx="2.5" fill="url(#bagBodySide)" stroke="url(#bagGoldSide)" stroke-width="1"/>
                <rect x="22" y="32" width="76" height="66" rx="14" fill="url(#bagBodySide)" stroke="url(#bagGoldSide)" stroke-width="1.8"/>
                <path d="M 22 46 L 22 38 C 22 34.7 24.7 32 28 32 L 36 32" fill="none" stroke="url(#bagGoldSide)" stroke-width="3.5" stroke-linecap="round"/>
                <path d="M 84 32 L 92 32 C 95.3 32 98 34.7 98 38 L 98 46" fill="none" stroke="url(#bagGoldSide)" stroke-width="3.5" stroke-linecap="round"/>
                <path d="M 22 84 L 22 92 C 22 95.3 24.7 98 28 98 L 36 98" fill="none" stroke="url(#bagGoldSide)" stroke-width="3.5" stroke-linecap="round"/>
                <path d="M 84 98 L 92 98 C 95.3 98 98 95.3 98 92 L 98 84" fill="none" stroke="url(#bagGoldSide)" stroke-width="3.5" stroke-linecap="round"/>
                <rect x="36" y="38" width="6" height="10" rx="1.5" fill="url(#bagGoldSide)"/>
                <circle cx="39" cy="45" r="1" fill="#0f172a"/>
                <rect x="78" y="38" width="6" height="10" rx="1.5" fill="url(#bagGoldSide)"/>
                <circle cx="81" cy="45" r="1" fill="#0f172a"/>
                <line x1="22" y1="48" x2="98" y2="48" stroke="url(#bagGoldSide)" stroke-width="1.5" stroke-dasharray="8,2,2,2"/>
                <g transform="translate(32, 52) rotate(-18)">
                    <rect x="0" y="0" width="22" height="30" rx="3" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
                    <path d="M 11 19 L 7 13 L 15 13 Z" fill="#1e293b"/>
                    <circle cx="11" cy="13" r="2.5" fill="#1e293b"/>
                </g>
                <g transform="translate(38, 50) rotate(-6)">
                    <rect x="0" y="0" width="22" height="30" rx="3" fill="url(#bagIvorySide)" stroke="url(#bagGoldSide)" stroke-width="1"/>
                    <text x="3" y="7" font-family="Arial" font-size="5" font-weight="bold" fill="url(#bagRubySide)">A</text>
                    <path d="M 11 20 C 11 20 5 14 5 10 C 5 7.5 7 6 9.2 6 C 10.6 6 11 6.8 11 6.8 C 11 6.8 11.4 6 12.8 6 C 15 6 17 7.5 17 10 C 17 14 11 20 11 20 Z" fill="url(#bagRubySide)"/>
                </g>
                <g transform="translate(64, 52) rotate(12)">
                    <rect x="0" y="0" width="19" height="32" rx="3.5" fill="url(#bagIvorySide)" stroke="#1e293b" stroke-width="1.2"/>
                    <line x1="3" y1="16" x2="16" y2="16" stroke="#475569" stroke-width="1.2"/>
                    <circle cx="9.5" cy="16" r="1.2" fill="url(#bagGoldSide)"/>
                    <circle cx="5.5" cy="5.5" r="1.3" fill="#0f172a"/>
                    <circle cx="13.5" cy="5.5" r="1.3" fill="#0f172a"/>
                    <circle cx="5.5" cy="10.5" r="1.3" fill="#0f172a"/>
                    <circle cx="13.5" cy="10.5" r="1.3" fill="#0f172a"/>
                    <circle cx="5.5" cy="21.5" r="1.3" fill="#0f172a"/>
                    <circle cx="13.5" cy="21.5" r="1.3" fill="#0f172a"/>
                    <circle cx="5.5" cy="26.5" r="1.3" fill="#0f172a"/>
                    <circle cx="13.5" cy="26.5" r="1.3" fill="#0f172a"/>
                </g>
                <g transform="translate(34, 76) rotate(8)">
                    <rect x="0" y="0" width="15" height="15" rx="3.5" fill="url(#bagIvorySide)" stroke="url(#bagGoldSide)" stroke-width="1"/>
                    <circle cx="4" cy="4" r="1.2" fill="#0f172a"/>
                    <circle cx="11" cy="4" r="1.2" fill="#0f172a"/>
                    <circle cx="7.5" cy="7.5" r="1.4" fill="url(#bagRubySide)"/>
                    <circle cx="4" cy="11" r="1.2" fill="#0f172a"/>
                    <circle cx="11" cy="11" r="1.2" fill="#0f172a"/>
                </g>
                <g transform="translate(70, 78)">
                    <circle cx="10" cy="10" r="10" fill="url(#bagGoldSide)" stroke="#78350f" stroke-width="1"/>
                    <circle cx="10" cy="10" r="7" fill="url(#bagBodySide)" stroke="url(#bagGoldSide)" stroke-width="1"/>
                    <circle cx="10" cy="10" r="3.5" fill="url(#bagGoldSide)"/>
                    <circle cx="10" cy="10" r="1.5" fill="#ffffff" opacity="0.6"/>
                </g>
            </g>
        </g>
    </svg>`,

    // 7. إعدادات الصوت (ترس خشبي)
    gear: `<svg viewBox="0 0 100 100" width="34" height="34" style="vertical-align: middle; display: inline-block; transform: scale(1.3); transform-origin: center;">
        <defs>
            <radialGradient id="woodBase" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#b45309"/><stop offset="70%" stop-color="#78350f"/><stop offset="100%" stop-color="#451a03"/></radialGradient>
            <linearGradient id="woodHighlight" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f59e0b" stop-opacity="0.5"/><stop offset="100%" stop-color="#451a03" stop-opacity="0.9"/></linearGradient>
            <filter id="gear3D" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#000" flood-opacity="0.6"/></filter>
        </defs>
        <g filter="url(#gear3D)">
            <path d="M46 5 L54 5 L57 15 L66 18 L74 11 L81 16 L76 24 L82 33 L92 36 L94 44 L84 48 L84 56 L94 60 L92 68 L82 71 L76 80 L81 88 L74 93 L66 86 L57 89 L54 99 L46 99 L43 89 L34 86 L26 93 L19 88 L24 80 L18 71 L8 68 L10 60 L20 56 L20 48 L10 44 L12 36 L22 33 L28 24 L21 16 L28 11 L36 18 L45 15 Z" fill="url(#woodBase)" stroke="#451a03" stroke-width="1"/>
            <path d="M46 5 L54 5 L57 15 L66 18 L74 11 L81 16 L76 24 L82 33 L92 36 L94 44 L84 48 L84 56 L94 60 L92 68 L82 71 L76 80 L81 88 L74 93 L66 86 L57 89 L54 99 L46 99 L43 89 L34 86 L26 93 L19 88 L24 80 L18 71 L8 68 L10 60 L20 56 L20 48 L10 44 L12 36 L22 33 L28 24 L21 16 L28 11 L36 18 L45 15 Z" fill="url(#woodHighlight)"/>
            <circle cx="50" cy="50" r="24" fill="#2c3e50" stroke="#1e293b" stroke-width="2"/>
            <circle cx="50" cy="50" r="14" fill="url(#woodBase)" stroke="#451a03" stroke-width="1.5"/>
            <circle cx="50" cy="50" r="14" fill="url(#woodHighlight)"/>
            <circle cx="50" cy="50" r="4" fill="#1e293b"/>
            <circle cx="50" cy="18" r="2.5" fill="#fbbf24"/>
            <circle cx="50" cy="82" r="2.5" fill="#fbbf24"/>
            <circle cx="18" cy="50" r="2.5" fill="#fbbf24"/>
            <circle cx="82" cy="50" r="2.5" fill="#fbbf24"/>
        </g>
    </svg>`,

    // 8. زر الأونلاين (الكرة الأرضية)
    globe: `<svg viewBox="0 0 100 100" width="28" height="28" style="vertical-align: middle; display: inline-block; transform: scale(1.4); transform-origin: center; margin-left: 5px;">
        <defs>
            <radialGradient id="oceanBlueBtn" cx="35%" cy="30%" r="70%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="45%" stop-color="#0284c7"/><stop offset="80%" stop-color="#1d4ed8"/><stop offset="100%" stop-color="#0f172a"/></radialGradient>
            <linearGradient id="landGradBtn" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ffffff"/><stop offset="40%" stop-color="#bae6fd"/><stop offset="100%" stop-color="#38bdf8"/></linearGradient>
            <radialGradient id="atmosphereGlowBtn" cx="50%" cy="50%" r="50%"><stop offset="70%" stop-color="#38bdf8" stop-opacity="0"/><stop offset="92%" stop-color="#38bdf8" stop-opacity="0.5"/><stop offset="100%" stop-color="#0284c7" stop-opacity="0.9"/></radialGradient>
            <linearGradient id="glossHighlightBtn" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
            <clipPath id="globeClipBtn"><circle cx="50" cy="50" r="36"/></clipPath>
        </defs>
        <circle cx="50" cy="50" r="36" fill="url(#oceanBlueBtn)"/>
        <g clip-path="url(#globeClipBtn)">
            <g stroke="#ffffff" stroke-width="0.5" fill="none" opacity="0.3">
                <line x1="10" y1="50" x2="90" y2="50"/>
                <ellipse cx="50" cy="50" rx="36" ry="18"/>
                <ellipse cx="50" cy="50" rx="36" ry="30"/>
                <line x1="50" y1="10" x2="50" y2="90"/>
                <ellipse cx="50" cy="50" rx="18" ry="36"/>
                <ellipse cx="50" cy="50" rx="30" ry="36"/>
            </g>
            <g fill="url(#landGradBtn)" stroke="#0284c7" stroke-width="0.3" opacity="0.92">
                <path d="M 22 28 C 26 24, 32 26, 30 34 C 28 40, 24 42, 28 48 C 30 52, 35 58, 32 66 C 29 72, 26 75, 23 70 C 21 62, 25 54, 21 46 C 18 40, 19 32, 22 28 Z"/>
                <path d="M 46 22 C 52 20, 58 24, 56 28 C 52 32, 45 30, 44 35 C 43 42, 50 45, 54 52 C 58 60, 52 72, 45 74 C 40 75, 41 64, 39 56 C 38 48, 41 40, 44 32 Z"/>
                <path d="M 60 20 C 68 18, 78 22, 76 30 C 74 38, 68 36, 65 42 C 62 48, 72 46, 75 52 C 78 58, 72 65, 68 62 C 64 58, 62 50, 58 42 C 56 34, 55 24, 60 20 Z"/>
                <circle cx="72" cy="68" r="3"/>
                <circle cx="38" cy="23" r="1.8"/>
                <circle cx="62" cy="58" r="1.5"/>
            </g>
        </g>
        <circle cx="50" cy="50" r="36" fill="url(#atmosphereGlowBtn)"/><path d="M 20 32 A 34 34 0 0 1 80 32 A 36 36 0 0 0 20 32 Z" fill="url(#glossHighlightBtn)"/>
    </svg>`,

    // 9. بوابة المتجر
    storePortal: `<svg viewBox="0 0 100 100" width="32" height="32" style="vertical-align: middle; display: inline-block; transform: scale(1.3); transform-origin: center;">
        <defs>
            <linearGradient id="chromeGradientBtn" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ffffff"/><stop offset="30%" stop-color="#cbd5e1"/><stop offset="60%" stop-color="#94a3b8"/><stop offset="85%" stop-color="#64748b"/><stop offset="100%" stop-color="#e2e8f0"/></linearGradient>
            <linearGradient id="redHandleGradBtn" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#f87171"/><stop offset="50%" stop-color="#dc2626"/><stop offset="100%" stop-color="#991b1b"/></linearGradient>
            <linearGradient id="wireGradientBtn" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#94a3b8"/><stop offset="50%" stop-color="#475569"/><stop offset="100%" stop-color="#334155"/></linearGradient>
            <linearGradient id="rubberGradientBtn" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#475569"/><stop offset="100%" stop-color="#1e293b"/></linearGradient>
        </defs>
        <ellipse cx="50" cy="90" rx="30" ry="3.5" fill="#000" opacity="0.15"/>
        <path d="M 82 25 L 75 60 L 25 60 L 18 25" fill="none" stroke="url(#chromeGradientBtn)" stroke-width="3" stroke-linecap="round"/>
        <rect x="74" y="21.5" width="12" height="4.5" rx="2.2" fill="url(#redHandleGradBtn)" stroke="#7f1d1d" stroke-width="0.5"/>
        <line x1="76" y1="23" x2="84" y2="23" stroke="#fca5a5" stroke-width="1" stroke-linecap="round"/>
        <g stroke="url(#wireGradientBtn)" stroke-width="1.5" stroke-linecap="round">
            <path d="M 19 32 H 81 M 20 39 H 80 M 21 46 H 79 M 23 53 H 77"/>
            <path d="M 25 25 L 28 60 M 35 25 L 36 60 M 45 25 L 44 60 M 55 25 L 52 60 M 65 25 L 60 60 M 75 25 L 68 60"/>
        </g>
        <rect x="16" y="22.5" width="68" height="5" rx="2.5" fill="url(#redHandleGradBtn)" stroke="#7f1d1d" stroke-width="0.5"/>
        <line x1="18" y1="24" x2="82" y2="24" stroke="#fca5a5" stroke-width="1" stroke-linecap="round"/>
        <circle cx="17.5" cy="25" r="3" fill="#1e293b"/>
        <circle cx="17.5" cy="25" r="1.2" fill="#cbd5e1"/>
        <circle cx="82.5" cy="25" r="3" fill="#1e293b"/>
        <circle cx="82.5" cy="25" r="1.2" fill="#cbd5e1"/>
        <path d="M 28 60 L 25 75 L 70 75 L 72 60" fill="none" stroke="url(#chromeGradientBtn)" stroke-width="2.5" stroke-linecap="round"/>
        <g transform="translate(68, 75)"><path d="M 0 0 L 2 12" fill="none" stroke="url(#chromeGradientBtn)" stroke-width="2"/><circle cx="2" cy="12" r="5" fill="url(#rubberGradientBtn)"/><circle cx="2" cy="12" r="2.5" fill="url(#chromeGradientBtn)"/><circle cx="2" cy="12" r="1" fill="#1e293b"/></g>
        <g transform="translate(26, 75)"><path d="M 0 0 L 2 12" fill="none" stroke="url(#chromeGradientBtn)" stroke-width="2"/><circle cx="2" cy="12" r="5" fill="url(#rubberGradientBtn)"/><circle cx="2" cy="12" r="2.5" fill="url(#chromeGradientBtn)"/><circle cx="2" cy="12" r="1" fill="#1e293b"/></g>
    </svg>`,

    // 10. زر المصباح
    bulb: `<svg viewBox="0 0 100 100" width="32" height="32" style="vertical-align: middle; display: inline-block; transform: scale(1.2);">
        <defs>
            <filter id="bulbGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
            <radialGradient id="glassBodyGrad" cx="40%" cy="35%" r="65%"><stop offset="0%" stop-color="#ffffff"/><stop offset="35%" stop-color="#fef08a"/><stop offset="70%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#d97706"/></radialGradient>
            <linearGradient id="filamentGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#ffffff"/><stop offset="50%" stop-color="#fef08a"/><stop offset="100%" stop-color="#f97316"/></linearGradient>
            <linearGradient id="metalBase" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#64748b"/><stop offset="25%" stop-color="#f1f5f9"/><stop offset="50%" stop-color="#94a3b8"/><stop offset="75%" stop-color="#cbd5e1"/><stop offset="100%" stop-color="#334155"/></linearGradient>
            <linearGradient id="contactPoint" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#475569"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>
            <style>@keyframes pulseGlow { 0%, 100% { transform: scale(1); filter: drop-shadow(0px 0px 2px rgba(251, 191, 36, 0.4)); } 50% { transform: scale(1.05); filter: drop-shadow(0px 0px 8px rgba(245, 158, 11, 0.8)); } } .anim-p { transform-origin: 50px 50px; animation: pulseGlow 3s ease-in-out infinite; }</style>
        </defs>
        <g class="anim-p">
            <g stroke="#fbbf24" stroke-width="1.5" stroke-linecap="round" opacity="0.6">
                <line x1="50" y1="6" x2="50" y2="11" /> <line x1="22" y1="18" x2="26" y2="22" /> <line x1="78" y1="18" x2="74" y2="22" /> <line x1="12" y1="42" x2="17" y2="42" /> <line x1="88" y1="42" x2="83" y2="42" />
            </g>
            <circle cx="50" cy="42" r="28" fill="#fef08a" opacity="0.25" filter="url(#bulbGlow)" />
            <path d="M 50 14 C 33 14 22 27 22 42 C 22 53 31 60 36 67 C 38 70 38 74 38 75 L 62 75 C 62 74 62 70 64 67 C 69 60 78 53 78 42 C 78 27 67 14 50 14 Z" fill="url(#glassBodyGrad)" />
            <path d="M 44 72 L 44 50 L 47 44 M 56 72 L 56 50 L 53 44" stroke="#94a3b8" stroke-width="1" fill="none" opacity="0.8"/>
            <path d="M 46 44 C 42 36 46 28 50 28 C 54 28 58 36 54 44 Z" fill="none" stroke="url(#filamentGrad)" stroke-width="2.5" stroke-linecap="round" filter="url(#bulbGlow)"/>
            <circle cx="50" cy="36" r="3" fill="#ffffff" filter="url(#bulbGlow)"/>
            <path d="M 30 32 C 28 38 31 46 33 49 C 30 45 28 38 32 30 C 36 22 45 18 50 17 C 42 18 33 24 30 32 Z" fill="#ffffff" opacity="0.65"/>
            <rect x="38" y="75" width="24" height="4" rx="2" fill="url(#metalBase)"/>
            <rect x="39" y="79" width="22" height="4" rx="2" fill="url(#metalBase)"/>
            <rect x="40" y="83" width="20" height="4" rx="2" fill="url(#metalBase)"/>
            <path d="M 42 87 C 42 91 58 91 58 87 Z" fill="url(#contactPoint)"/>
        </g>
    </svg>`,

    // 11. زر الراديو
    radioBtn: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 120 130" style="width: 100%; height: 100%; transform: scale(1.25);">
        <defs>
            <style>@keyframes floatAnimRadioBtn { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } } .anim-f-radio-btn { animation: floatAnimRadioBtn 3.5s ease-in-out infinite; }</style>
            <filter id="mainShadowRadioBtn" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.25"/></filter>
            <filter id="radioShadowInnerBtn" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.35"/></filter>
            <filter id="dialGlowRadioBtn" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="0" stdDeviation="2.5" flood-color="#f97316" flood-opacity="0.8"/></filter>
            <linearGradient id="woodOuterRadioBtn" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#92400e"/><stop offset="50%" stop-color="#78350f"/><stop offset="100%" stop-color="#451a03"/></linearGradient>
            <linearGradient id="woodInnerRadioBtn" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#b45309"/><stop offset="100%" stop-color="#78350f"/></linearGradient>
            <linearGradient id="brassGradRadioBtn" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef08a"/><stop offset="40%" stop-color="#d97706"/><stop offset="100%" stop-color="#78350f"/></linearGradient>
            <linearGradient id="chromeGradRadioBtn" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#cbd5e1"/><stop offset="50%" stop-color="#ffffff"/><stop offset="100%" stop-color="#64748b"/></linearGradient>
            <linearGradient id="dialGradRadioBtn" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fff7ed"/><stop offset="60%" stop-color="#ffedd5"/><stop offset="100%" stop-color="#fed7aa"/></linearGradient>
            <pattern id="speakerMeshRadioBtn" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#292524" /><circle cx="2" cy="2" r="1" fill="#44403c" /></pattern>
        </defs>
        <g class="anim-f-radio-btn" filter="url(#mainShadowRadioBtn)">
            <path d="M 32 28 L 16 8" stroke="url(#chromeGradRadioBtn)" stroke-width="2.5" stroke-linecap="round" />
            <circle cx="15" cy="7" r="2.5" fill="url(#brassGradRadioBtn)" />
            <rect x="14" y="32" width="72" height="52" rx="12" fill="#1c1917" />
            <rect x="14" y="27" width="72" height="52" rx="12" fill="url(#woodOuterRadioBtn)" filter="url(#radioShadowInnerBtn)" />
            <rect x="18" y="31" width="64" height="44" rx="8" fill="url(#woodInnerRadioBtn)" />
            <rect x="22" y="35" width="30" height="36" rx="6" fill="url(#speakerMeshRadioBtn)" stroke="#451a03" stroke-width="1.5" />
            <rect x="22" y="35" width="30" height="36" rx="6" fill="none" stroke="url(#brassGradRadioBtn)" stroke-width="1" opacity="0.8" />
            <rect x="55" y="35" width="23" height="36" rx="6" fill="#1c1917" stroke="#451a03" stroke-width="1" />
            <circle cx="66.5" cy="46" r="8.5" fill="url(#dialGradRadioBtn)" filter="url(#dialGlowRadioBtn)" stroke="url(#brassGradRadioBtn)" stroke-width="1.5" />
            <circle cx="66.5" cy="46" r="6.5" fill="none" stroke="#d97706" stroke-width="0.8" stroke-dasharray="1.5,1.5" />
            <line x1="66.5" y1="46" x2="69.5" y2="41" stroke="#dc2626" stroke-width="1.5" stroke-linecap="round" />
            <circle cx="66.5" cy="46" r="1.2" fill="#78350f" />
            <circle cx="60.5" cy="62" r="3.8" fill="#1c1917" />
            <circle cx="60.5" cy="62" r="3.2" fill="url(#brassGradRadioBtn)" stroke="#451a03" stroke-width="0.5" />
            <line x1="60.5" y1="62" x2="60.5" y2="59.8" stroke="#1c1917" stroke-width="0.8" />
            <circle cx="72.5" cy="62" r="3.8" fill="#1c1917" />
            <circle cx="72.5" cy="62" r="3.2" fill="url(#brassGradRadioBtn)" stroke="#451a03" stroke-width="0.5" />
            <line x1="72.5" y1="62" x2="74" y2="60.5" stroke="#1c1917" stroke-width="0.8" />
            <rect x="22" y="79" width="10" height="3" rx="1.5" fill="#292524" />
            <rect x="68" y="79" width="10" height="3" rx="1.5" fill="#292524" />
            <path d="M 14 35 C 14 30.5 17.5 27 22 27 L 78 27 C 82.5 27 86 30.5 86 35 L 86 39 L 14 39 Z" fill="#ffffff" opacity="0.18" />
        </g>
    </svg>`,

    // 12. أيقونة الراديو للقائمة الجانبية (بمعرفات مختلفة لمنع التعارض)
    radioSide: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 120 130" style="width: 100%; height: 100%; transform: scale(1.3);">
        <defs>
            <style>@keyframes floatAnimRadioSide { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } } .anim-f-radio-side { animation: floatAnimRadioSide 3.5s ease-in-out infinite; }</style>
            <filter id="mainShadowRadioSide" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.25"/></filter>
            <filter id="radioShadowInnerSide" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.35"/></filter>
            <filter id="dialGlowRadioSide" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="0" stdDeviation="2.5" flood-color="#f97316" flood-opacity="0.8"/></filter>
            <linearGradient id="woodOuterRadioSide" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#92400e"/><stop offset="50%" stop-color="#78350f"/><stop offset="100%" stop-color="#451a03"/></linearGradient>
            <linearGradient id="woodInnerRadioSide" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#b45309"/><stop offset="100%" stop-color="#78350f"/></linearGradient>
            <linearGradient id="brassGradRadioSide" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef08a"/><stop offset="40%" stop-color="#d97706"/><stop offset="100%" stop-color="#78350f"/></linearGradient>
            <linearGradient id="chromeGradRadioSide" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#cbd5e1"/><stop offset="50%" stop-color="#ffffff"/><stop offset="100%" stop-color="#64748b"/></linearGradient>
            <linearGradient id="dialGradRadioSide" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fff7ed"/><stop offset="60%" stop-color="#ffedd5"/><stop offset="100%" stop-color="#fed7aa"/></linearGradient>
            <pattern id="speakerMeshRadioSide" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#292524" /><circle cx="2" cy="2" r="1" fill="#44403c" /></pattern>
        </defs>
        <g class="anim-f-radio-side" filter="url(#mainShadowRadioSide)">
            <path d="M 32 28 L 16 8" stroke="url(#chromeGradRadioSide)" stroke-width="2.5" stroke-linecap="round" />
            <circle cx="15" cy="7" r="2.5" fill="url(#brassGradRadioSide)" />
            <rect x="14" y="32" width="72" height="52" rx="12" fill="#1c1917" />
            <rect x="14" y="27" width="72" height="52" rx="12" fill="url(#woodOuterRadioSide)" filter="url(#radioShadowInnerSide)" />
            <rect x="18" y="31" width="64" height="44" rx="8" fill="url(#woodInnerRadioSide)" />
            <rect x="22" y="35" width="30" height="36" rx="6" fill="url(#speakerMeshRadioSide)" stroke="#451a03" stroke-width="1.5" />
            <rect x="22" y="35" width="30" height="36" rx="6" fill="none" stroke="url(#brassGradRadioSide)" stroke-width="1" opacity="0.8" />
            <rect x="55" y="35" width="23" height="36" rx="6" fill="#1c1917" stroke="#451a03" stroke-width="1" />
            <circle cx="66.5" cy="46" r="8.5" fill="url(#dialGradRadioSide)" filter="url(#dialGlowRadioSide)" stroke="url(#brassGradRadioSide)" stroke-width="1.5" />
            <circle cx="66.5" cy="46" r="6.5" fill="none" stroke="#d97706" stroke-width="0.8" stroke-dasharray="1.5,1.5" />
            <line x1="66.5" y1="46" x2="69.5" y2="41" stroke="#dc2626" stroke-width="1.5" stroke-linecap="round" />
            <circle cx="66.5" cy="46" r="1.2" fill="#78350f" />
            <circle cx="60.5" cy="62" r="3.8" fill="#1c1917" />
            <circle cx="60.5" cy="62" r="3.2" fill="url(#brassGradRadioSide)" stroke="#451a03" stroke-width="0.5" />
            <line x1="60.5" y1="62" x2="60.5" y2="59.8" stroke="#1c1917" stroke-width="0.8" />
            <circle cx="72.5" cy="62" r="3.8" fill="#1c1917" />
            <circle cx="72.5" cy="62" r="3.2" fill="url(#brassGradRadioSide)" stroke="#451a03" stroke-width="0.5" />
            <line x1="72.5" y1="62" x2="74" y2="60.5" stroke="#1c1917" stroke-width="0.8" />
            <rect x="22" y="79" width="10" height="3" rx="1.5" fill="#292524" />
            <rect x="68" y="79" width="10" height="3" rx="1.5" fill="#292524" />
            <path d="M 14 35 C 14 30.5 17.5 27 22 27 L 78 27 C 82.5 27 86 30.5 86 35 L 86 39 L 14 39 Z" fill="#ffffff" opacity="0.18" />
        </g>
    </svg>`
};


// هذه الدالة ستقوم بالبحث عن كل عنصر يحتوي على الخاصية `data-icon` وحقن الـ SVG فيه
window.injectAllSVGIcons = function() {
    document.querySelectorAll('[data-icon]').forEach(el => {
        const iconName = el.getAttribute('data-icon');
        if (SVGIcons[iconName]) {
            el.innerHTML = SVGIcons[iconName];
        }
    });
};

// تنفيذ الحقن عند تحميل الصفحة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.injectAllSVGIcons);
} else {
    window.injectAllSVGIcons();
}
