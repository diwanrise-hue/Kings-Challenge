// ملف: hubIcons.js
// ============================================================
// أيقونات الشريط السفلي والأزرار العلوية — SVG ملونة
// تم الحفاظ على الربط مع الواجهة بدون أي تغيير.
// ============================================================

window.HUB_ICONS = {

    // ========================================================
    // ✦ الأحدث
    // ========================================================
    latest: `
    <svg viewBox="0 0 64 64"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         preserveAspectRatio="xMidYMid meet">

        <defs>
            <linearGradient id="latestGold"
                x1="10" y1="5" x2="54" y2="59">
                <stop offset="0%" stop-color="#FFF6A8"/>
                <stop offset="25%" stop-color="#FFD83D"/>
                <stop offset="60%" stop-color="#FFAE00"/>
                <stop offset="100%" stop-color="#F26A00"/>
            </linearGradient>

            <linearGradient id="latestPurple"
                x1="12" y1="8" x2="53" y2="55">
                <stop offset="0%" stop-color="#E879FF"/>
                <stop offset="50%" stop-color="#9257FF"/>
                <stop offset="100%" stop-color="#5428C9"/>
            </linearGradient>

            <radialGradient id="latestAura">
                <stop offset="0%" stop-color="#FFD83D" stop-opacity=".35"/>
                <stop offset="60%" stop-color="#9B5CFF" stop-opacity=".12"/>
                <stop offset="100%" stop-opacity="0"/>
            </radialGradient>

            <filter id="latestGlow"
                x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="2"/>
                <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>

        <circle cx="32" cy="32" r="30"
                fill="url(#latestAura)"/>

        <path
            d="M32 5
               L39 23
               L58 25
               L43 36
               L47 55
               L32 44
               L17 55
               L21 36
               L6 25
               L25 23Z"
            fill="url(#latestGold)"
            stroke="#FFF2A0"
            stroke-width="1.5"
            stroke-linejoin="round"
            filter="url(#latestGlow)"/>

        <path
            d="M32 12
               L36 26
               L51 27
               L39 35
               L43 49
               L32 42
               L21 49
               L25 35
               L13 27
               L28 26Z"
            fill="url(#latestPurple)"
            opacity=".45"/>

        <path
            d="M32 18
               L34.5 28
               L43 30
               L35 34.5
               L37 43
               L32 38
               L27 43
               L29 34.5
               L21 30
               L29.5 28Z"
            fill="#FFF9D7"
            opacity=".75"/>

        <path
            d="M50 7V17M45 12H55"
            stroke="#FFF3A1"
            stroke-width="2.2"
            stroke-linecap="round"/>

        <path
            d="M10 39V46M6.5 42.5H13.5"
            stroke="#DAB8FF"
            stroke-width="1.8"
            stroke-linecap="round"/>

        <circle cx="51" cy="48" r="2"
                fill="#FFD83D"/>
    </svg>`,

    // ========================================================
    // 🎮 الألعاب
    // ========================================================
    games: `
    <svg viewBox="0 0 64 64"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         preserveAspectRatio="xMidYMid meet">

        <defs>
            <linearGradient id="gameBlue"
                x1="8" y1="8" x2="56" y2="56">
                <stop offset="0%" stop-color="#66F2FF"/>
                <stop offset="35%" stop-color="#19B9FF"/>
                <stop offset="70%" stop-color="#536EFF"/>
                <stop offset="100%" stop-color="#743BFF"/>
            </linearGradient>

            <radialGradient id="gameGlow">
                <stop offset="0%" stop-color="#35DFFF" stop-opacity=".3"/>
                <stop offset="100%" stop-color="#2764FF" stop-opacity="0"/>
            </radialGradient>

            <filter id="gameShadow"
                x="-60%" y="-60%" width="220%" height="220%">
                <feDropShadow
                    dx="0" dy="3" stdDeviation="2"
                    flood-color="#1667FF"
                    flood-opacity=".35"/>
            </filter>
        </defs>

        <ellipse cx="32" cy="32" rx="30" ry="26"
                 fill="url(#gameGlow)"/>

        <path
            d="M17 17
               C21 14 26.5 12.8 32 12.8
               C37.5 12.8 43 14 47 17
               C51.5 20.2 55.2 30.8 56.7 38.3
               C58 44.5 53.2 48.9 48.7 45.7
               L41 40H23L15.3 45.7
               C10.8 48.9 6 44.5 7.3 38.3
               C8.8 30.8 12.5 20.2 17 17Z"
            fill="url(#gameBlue)"
            stroke="#9AF4FF"
            stroke-width="1.7"
            stroke-linejoin="round"
            filter="url(#gameShadow)"/>

        <path
            d="M18 18
               C22 15.5 27 14.5 32 14.5
               C37 14.5 42 15.5 46 18"
            stroke="#D9FBFF"
            stroke-width="2.5"
            stroke-linecap="round"
            opacity=".65"/>

        <path
            d="M14 27H20V21H26V27H32V33H26V39H20V33H14Z"
            fill="#F0FDFF"/>

        <circle cx="42" cy="27" r="3.5"
                fill="#FF527E"/>
        <circle cx="42" cy="27" r="1.3"
                fill="#FFD3DE"/>

        <circle cx="49" cy="34" r="3.5"
                fill="#FFD449"/>
        <circle cx="49" cy="34" r="1.3"
                fill="#FFF3B0"/>
    </svg>`,

    // ========================================================
    // 🎲 المتجر
    // حجر دامة كبير + حجر طاولة كبير
    // ========================================================
    store: `
    <svg viewBox="0 0 64 64"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         preserveAspectRatio="xMidYMid meet">

        <defs>

            <!-- ========================================= -->
            <!-- حجر الدامة -->
            <!-- ========================================= -->

            <radialGradient id="realDamaTop"
                cx="30%" cy="18%" r="85%">
                <stop offset="0%" stop-color="#FFB4B4"/>
                <stop offset="20%" stop-color="#FF5968"/>
                <stop offset="55%" stop-color="#E21E3F"/>
                <stop offset="82%" stop-color="#B30F35"/>
                <stop offset="100%" stop-color="#720D2B"/>
            </radialGradient>

            <linearGradient id="realDamaSide"
                x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#D91E43"/>
                <stop offset="45%" stop-color="#B40F35"/>
                <stop offset="100%" stop-color="#650C27"/>
            </linearGradient>


            <!-- ========================================= -->
            <!-- حجر الطاولة -->
            <!-- ========================================= -->

            <radialGradient id="realTableTop"
                cx="30%" cy="18%" r="85%">
                <stop offset="0%" stop-color="#FFF7B2"/>
                <stop offset="22%" stop-color="#FFE16A"/>
                <stop offset="55%" stop-color="#F7AE19"/>
                <stop offset="82%" stop-color="#C86A05"/>
                <stop offset="100%" stop-color="#7A3600"/>
            </radialGradient>

            <linearGradient id="realTableSide"
                x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#F5A91B"/>
                <stop offset="45%" stop-color="#C96B05"/>
                <stop offset="100%" stop-color="#713000"/>
            </linearGradient>


            <filter id="stoneDepth"
                x="-60%" y="-60%" width="220%" height="240%">

                <feDropShadow
                    dx="0"
                    dy="4"
                    stdDeviation="2.5"
                    flood-color="#30000C"
                    flood-opacity=".35"/>
            </filter>

            <filter id="goldDepth"
                x="-60%" y="-60%" width="220%" height="240%">

                <feDropShadow
                    dx="0"
                    dy="4"
                    stdDeviation="2.5"
                    flood-color="#5C2800"
                    flood-opacity=".35"/>
            </filter>

        </defs>


        <!-- ================================================= -->
        <!-- حجر الدامة الأحمر — كبير وواضح في الخلف -->
        <!-- ================================================= -->

        <!-- الظل -->
        <ellipse
            cx="19"
            cy="51"
            rx="16"
            ry="4.5"
            fill="#4D071C"
            opacity=".28"/>

        <!-- جسم الحجر الجانبي -->
        <path
            d="
            M4.5 24
            C4.5 17.9 11.1 13.5 20
            13.5
            C28.9 13.5 35.5 17.9 35.5 24
            V38.5
            C35.5 44.6 28.9 49 20 49
            C11.1 49 4.5 44.6 4.5 38.5
            Z"
            fill="url(#realDamaSide)"
            stroke="#FF7180"
            stroke-width="1.4"
            filter="url(#stoneDepth)"/>

        <!-- خط الحافة -->
        <path
            d="
            M5.5 25
            C6.5 30 12.5 33.5 20 33.5
            C27.5 33.5 33.5 30 34.5 25"
            stroke="#FF5D70"
            stroke-width="1.5"
            opacity=".65"/>

        <!-- سطح علوي كبير -->
        <ellipse
            cx="20"
            cy="23.8"
            rx="15.5"
            ry="10"
            fill="url(#realDamaTop)"
            stroke="#FF8A96"
            stroke-width="1.8"/>

        <!-- حافة سطح -->
        <ellipse
            cx="20"
            cy="23.8"
            rx="11.5"
            ry="6.8"
            stroke="#FFB0B7"
            stroke-width="1.4"
            opacity=".7"/>

        <!-- دائرة داخلية -->
        <ellipse
            cx="20"
            cy="23.8"
            rx="7.2"
            ry="4.1"
            fill="#9C1030"
            opacity=".3"
            stroke="#FFD0D4"
            stroke-width="1.2"/>

        <!-- لمعة كبيرة -->
        <ellipse
            cx="14.5"
            cy="20.5"
            rx="4.8"
            ry="2"
            fill="#FFDCE0"
            opacity=".72"
            transform="rotate(-10 14.5 20.5)"/>


        <!-- ================================================= -->
        <!-- حجر الطاولة الذهبي — كبير وواضح في المقدمة -->
        <!-- ================================================= -->

        <!-- الظل -->
        <ellipse
            cx="44"
            cy="53"
            rx="16"
            ry="4.5"
            fill="#5B2700"
            opacity=".28"/>

        <!-- الجسم -->
        <path
            d="
            M28
            22
            C28
            15.7 34.8 11.5 44
            11.5
            C53.2 11.5 60 15.7 60 22
            V39
            C60 45.3 53.2 49.5 44 49.5
            C34.8 49.5 28 45.3 28 39
            Z"
            fill="url(#realTableSide)"
            stroke="#FFD866"
            stroke-width="1.5"
            filter="url(#goldDepth)"/>

        <!-- حافة -->
        <path
            d="
            M29 23
            C30.5 28.2 36.2 31.5 44 31.5
            C51.8 31.5 57.5 28.2 59 23"
            stroke="#F8B72C"
            stroke-width="1.5"
            opacity=".7"/>

        <!-- سطح علوي -->
        <ellipse
            cx="44"
            cy="21.8"
            rx="16"
            ry="9.8"
            fill="url(#realTableTop)"
            stroke="#FFE58A"
            stroke-width="1.8"/>

        <!-- حلقة سطح -->
        <ellipse
            cx="44"
            cy="21.8"
            rx="11.8"
            ry="6.8"
            stroke="#FFF0A8"
            stroke-width="1.4"
            opacity=".72"/>

        <!-- نقاط حجر الطاولة -->
        <circle
            cx="38"
            cy="20"
            r="1.65"
            fill="#713000"/>

        <circle
            cx="44"
            cy="23.8"
            r="1.65"
            fill="#713000"/>

        <circle
            cx="50"
            cy="20"
            r="1.65"
            fill="#713000"/>

        <!-- نقطة مركزية -->
        <circle
            cx="44"
            cy="21.8"
            r="2.3"
            stroke="#FFEFA5"
            stroke-width="1"
            opacity=".55"/>

        <!-- لمعان -->
        <ellipse
            cx="38"
            cy="18.5"
            rx="5"
            ry="2"
            fill="#FFFFFF"
            opacity=".65"
            transform="rotate(-10 38 18.5)"/>

        <!-- بريق -->
        <path
            d="M55 6V14M51 10H59"
            stroke="#FFE06A"
            stroke-width="1.8"
            stroke-linecap="round"/>

    </svg>`,

    // ========================================================
    // 🎒 حقيبة الممتلكات (الزر العلوي)
    // ========================================================
    bag: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="26" height="26" style="display: block;">
        <defs>
            <linearGradient id="bagGoldSideIdx" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef08a"/><stop offset="25%" stop-color="#f59e0b"/><stop offset="50%" stop-color="#d97706"/><stop offset="75%" stop-color="#b45309"/><stop offset="100%" stop-color="#78350f"/></linearGradient>
            <linearGradient id="bagBodySideIdx" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#334155"/><stop offset="40%" stop-color="#1e293b"/><stop offset="85%" stop-color="#0f172a"/><stop offset="100%" stop-color="#020617"/></linearGradient>
            <linearGradient id="bagIvorySideIdx" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ffffff"/><stop offset="70%" stop-color="#fef3c7"/><stop offset="100%" stop-color="#fde68a"/></linearGradient>
            <linearGradient id="bagRubySideIdx" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f87171"/><stop offset="50%" stop-color="#dc2626"/><stop offset="100%" stop-color="#991b1b"/></linearGradient>
            <radialGradient id="bagGlowSideIdx" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#f59e0b" stop-opacity="0.45"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
        </defs>
        <g style="transform-origin: 60px 60px; animation: luxuryFloat 4s ease-in-out infinite;">
            <circle cx="60" cy="60" r="54" fill="url(#bagGlowSideIdx)"/>
            <ellipse cx="60" cy="108" rx="34" ry="4" fill="#000000" opacity="0.22"/>
            <g>
                <path d="M 44 32 C 44 18 76 18 76 32" fill="none" stroke="url(#bagGoldSideIdx)" stroke-width="4.5" stroke-linecap="round"/>
                <rect x="52" y="20" width="16" height="5" rx="2.5" fill="url(#bagBodySideIdx)" stroke="url(#bagGoldSideIdx)" stroke-width="1"/>
                <rect x="22" y="32" width="76" height="66" rx="14" fill="url(#bagBodySideIdx)" stroke="url(#bagGoldSideIdx)" stroke-width="1.8"/>
                <path d="M 22 46 L 22 38 C 22 34.7 24.7 32 28 32 L 36 32" fill="none" stroke="url(#bagGoldSideIdx)" stroke-width="3.5" stroke-linecap="round"/>
                <path d="M 84 32 L 92 32 C 95.3 32 98 34.7 98 38 L 98 46" fill="none" stroke="url(#bagGoldSideIdx)" stroke-width="3.5" stroke-linecap="round"/>
                <path d="M 22 84 L 22 92 C 22 95.3 24.7 98 28 98 L 36 98" fill="none" stroke="url(#bagGoldSideIdx)" stroke-width="3.5" stroke-linecap="round"/>
                <path d="M 84 98 L 92 98 C 95.3 98 98 95.3 98 92 L 98 84" fill="none" stroke="url(#bagGoldSideIdx)" stroke-width="3.5" stroke-linecap="round"/>
                <rect x="36" y="38" width="6" height="10" rx="1.5" fill="url(#bagGoldSideIdx)"/>
                <circle cx="39" cy="45" r="1" fill="#0f172a"/>
                <rect x="78" y="38" width="6" height="10" rx="1.5" fill="url(#bagGoldSideIdx)"/>
                <circle cx="81" cy="45" r="1" fill="#0f172a"/>
                <line x1="22" y1="48" x2="98" y2="48" stroke="url(#bagGoldSideIdx)" stroke-width="1.5" stroke-dasharray="8,2,2,2"/>
                <g transform="translate(32, 52) rotate(-18)">
                    <rect x="0" y="0" width="22" height="30" rx="3" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
                    <path d="M 11 19 L 7 13 L 15 13 Z" fill="#1e293b"/>
                    <circle cx="11" cy="13" r="2.5" fill="#1e293b"/>
                </g>
                <g transform="translate(38, 50) rotate(-6)">
                    <rect x="0" y="0" width="22" height="30" rx="3" fill="url(#bagIvorySideIdx)" stroke="url(#bagGoldSideIdx)" stroke-width="1"/>
                    <text x="3" y="7" font-family="Arial" font-size="5" font-weight="bold" fill="url(#bagRubySideIdx)">A</text>
                    <path d="M 11 20 C 11 20 5 14 5 10 C 5 7.5 7 6 9.2 6 C 10.6 6 11 6.8 11 6.8 C 11 6.8 11.4 6 12.8 6 C 15 6 17 7.5 17 10 C 17 14 11 20 11 20 Z" fill="url(#bagRubySideIdx)"/>
                </g>
                <g transform="translate(64, 52) rotate(12)">
                    <rect x="0" y="0" width="19" height="32" rx="3.5" fill="url(#bagIvorySideIdx)" stroke="#1e293b" stroke-width="1.2"/>
                    <line x1="3" y1="16" x2="16" y2="16" stroke="#475569" stroke-width="1.2"/>
                    <circle cx="9.5" cy="16" r="1.2" fill="url(#bagGoldSideIdx)"/>
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
                    <rect x="0" y="0" width="15" height="15" rx="3.5" fill="url(#bagIvorySideIdx)" stroke="url(#bagGoldSideIdx)" stroke-width="1"/>
                    <circle cx="4" cy="4" r="1.2" fill="#0f172a"/>
                    <circle cx="11" cy="4" r="1.2" fill="#0f172a"/>
                    <circle cx="7.5" cy="7.5" r="1.4" fill="url(#bagRubySideIdx)"/>
                    <circle cx="4" cy="11" r="1.2" fill="#0f172a"/>
                    <circle cx="11" cy="11" r="1.2" fill="#0f172a"/>
                </g>
                <g transform="translate(70, 78)">
                    <circle cx="10" cy="10" r="10" fill="url(#bagGoldSideIdx)" stroke="#78350f" stroke-width="1"/>
                    <circle cx="10" cy="10" r="7" fill="url(#bagBodySideIdx)" stroke="url(#bagGoldSideIdx)" stroke-width="1"/>
                    <circle cx="10" cy="10" r="3.5" fill="url(#bagGoldSideIdx)"/>
                    <circle cx="10" cy="10" r="1.5" fill="#ffffff" opacity="0.6"/>
                </g>
            </g>
        </g>
    </svg>`,

    // ========================================================
    // 📻 الراديو (الزر العلوي)
    // ========================================================
    radio: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 120 130" width="28" height="28" style="display: block;">
        <defs>
            <linearGradient id="woodOuterRadioBtnIdx" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#92400e"/><stop offset="50%" stop-color="#78350f"/><stop offset="100%" stop-color="#451a03"/></linearGradient>
            <linearGradient id="woodInnerRadioBtnIdx" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#b45309"/><stop offset="100%" stop-color="#78350f"/></linearGradient>
            <linearGradient id="brassGradRadioBtnIdx" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef08a"/><stop offset="40%" stop-color="#d97706"/><stop offset="100%" stop-color="#78350f"/></linearGradient>
            <linearGradient id="chromeGradRadioBtnIdx" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#cbd5e1"/><stop offset="50%" stop-color="#ffffff"/><stop offset="100%" stop-color="#64748b"/></linearGradient>
            <linearGradient id="dialGradRadioBtnIdx" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fff7ed"/><stop offset="60%" stop-color="#ffedd5"/><stop offset="100%" stop-color="#fed7aa"/></linearGradient>
            <pattern id="speakerMeshRadioBtnIdx" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#292524" /><circle cx="2" cy="2" r="1" fill="#44403c" /></pattern>
        </defs>
        <g style="animation: floatAnimRadioBtn 3.5s ease-in-out infinite;">
            <path d="M 32 28 L 16 8" stroke="url(#chromeGradRadioBtnIdx)" stroke-width="2.5" stroke-linecap="round" />
            <circle cx="15" cy="7" r="2.5" fill="url(#brassGradRadioBtnIdx)" />
            <rect x="14" y="32" width="72" height="52" rx="12" fill="#1c1917" />
            <rect x="14" y="27" width="72" height="52" rx="12" fill="url(#woodOuterRadioBtnIdx)" />
            <rect x="18" y="31" width="64" height="44" rx="8" fill="url(#woodInnerRadioBtnIdx)" />
            <rect x="22" y="35" width="30" height="36" rx="6" fill="url(#speakerMeshRadioBtnIdx)" stroke="#451a03" stroke-width="1.5" />
            <rect x="22" y="35" width="30" height="36" rx="6" fill="none" stroke="url(#brassGradRadioBtnIdx)" stroke-width="1" opacity="0.8" />
            <rect x="55" y="35" width="23" height="36" rx="6" fill="#1c1917" stroke="#451a03" stroke-width="1" />
            <circle cx="66.5" cy="46" r="8.5" fill="url(#dialGradRadioBtnIdx)" stroke="url(#brassGradRadioBtnIdx)" stroke-width="1.5" />
            <circle cx="66.5" cy="46" r="6.5" fill="none" stroke="#d97706" stroke-width="0.8" stroke-dasharray="1.5,1.5" />
            <line x1="66.5" y1="46" x2="69.5" y2="41" stroke="#dc2626" stroke-width="1.5" stroke-linecap="round" />
            <circle cx="66.5" cy="46" r="1.2" fill="#78350f" />
            <circle cx="60.5" cy="62" r="3.8" fill="#1c1917" />
            <circle cx="60.5" cy="62" r="3.2" fill="url(#brassGradRadioBtnIdx)" stroke="#451a03" stroke-width="0.5" />
            <line x1="60.5" y1="62" x2="60.5" y2="59.8" stroke="#1c1917" stroke-width="0.8" />
            <circle cx="72.5" cy="62" r="3.8" fill="#1c1917" />
            <circle cx="72.5" cy="62" r="3.2" fill="url(#brassGradRadioBtnIdx)" stroke="#451a03" stroke-width="0.5" />
            <line x1="72.5" y1="62" x2="74" y2="60.5" stroke="#1c1917" stroke-width="0.8" />
            <rect x="22" y="79" width="10" height="3" rx="1.5" fill="#292524" />
            <rect x="68" y="79" width="10" height="3" rx="1.5" fill="#292524" />
            <path d="M 14 35 C 14 30.5 17.5 27 22 27 L 78 27 C 82.5 27 86 30.5 86 35 L 86 39 L 14 39 Z" fill="#ffffff" opacity="0.18" />
        </g>
    </svg>`
};

// ============================================================
// دالة لحقن الأيقونات في الشريط السفلي والأزرار العلوية
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    const latestIconContainer = document.getElementById('icon-latest');
    const gamesIconContainer = document.getElementById('icon-games');
    const storeIconContainer = document.getElementById('icon-store');
    
    // حاويات الأزرار العلوية الجديدة
    const bagIconContainer = document.getElementById('hud-icon-bag');
    const radioIconContainer = document.getElementById('hud-icon-radio');

    if (latestIconContainer) latestIconContainer.innerHTML = window.HUB_ICONS.latest;
    if (gamesIconContainer) gamesIconContainer.innerHTML = window.HUB_ICONS.games;
    if (storeIconContainer) storeIconContainer.innerHTML = window.HUB_ICONS.store;
    
    // حقن الأيقونات العلوية
    if (bagIconContainer) bagIconContainer.innerHTML = window.HUB_ICONS.bag;
    if (radioIconContainer) radioIconContainer.innerHTML = window.HUB_ICONS.radio;
});
