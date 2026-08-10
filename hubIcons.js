// ملف: hubIcons.js
// ============================================================
// أيقونات الشريط السفلي — SVG ملونة
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

    </svg>`
};


// ============================================================
// دالة لحقن الأيقونات في الشريط السفلي عند تحميل الصفحة
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    const latestIconContainer =
        document.getElementById('icon-latest');

    const gamesIconContainer =
        document.getElementById('icon-games');

    const storeIconContainer =
        document.getElementById('icon-store');

    if (latestIconContainer)
        latestIconContainer.innerHTML = window.HUB_ICONS.latest;

    if (gamesIconContainer)
        gamesIconContainer.innerHTML = window.HUB_ICONS.games;

    if (storeIconContainer)
        storeIconContainer.innerHTML = window.HUB_ICONS.store;
});


