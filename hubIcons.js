// ملف: hubIcons.js
// ============================================================
// أيقونات الشريط السفلي — SVG ملونة Premium
// لا يوجد أي تغيير في الربط مع الواجهة.
// ============================================================

window.HUB_ICONS = {

    // ========================================================
    // ✦ الأحدث — ذهبي + بنفسجي
    // ========================================================
    latest: `
    <svg viewBox="0 0 64 64"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         preserveAspectRatio="xMidYMid meet">

        <defs>

            <linearGradient id="latestGold"
                            x1="12" y1="8"
                            x2="53" y2="56"
                            gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#FFF4A3"/>
                <stop offset="25%" stop-color="#FFD84A"/>
                <stop offset="55%" stop-color="#FFB300"/>
                <stop offset="100%" stop-color="#FF7A00"/>
            </linearGradient>

            <linearGradient id="latestPurple"
                            x1="10" y1="10"
                            x2="54" y2="54"
                            gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#D86CFF"/>
                <stop offset="50%" stop-color="#8B5CFF"/>
                <stop offset="100%" stop-color="#4C2BBD"/>
            </linearGradient>

            <radialGradient id="latestAura">
                <stop offset="0%" stop-color="#FFD84A" stop-opacity=".38"/>
                <stop offset="55%" stop-color="#A855F7" stop-opacity=".14"/>
                <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
            </radialGradient>

            <filter id="latestGlow"
                    x="-80%" y="-80%"
                    width="260%" height="260%">
                <feGaussianBlur stdDeviation="2.5"
                                 result="blur"/>
                <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>

        </defs>

        <!-- الهالة -->
        <circle
            cx="32"
            cy="32"
            r="28"
            fill="url(#latestAura)"/>

        <!-- توهج خلف النجمة -->
        <path
            d="
            M32 6
            L39 23
            L58 25
            L43 36
            L47 55
            L32 44
            L17 55
            L21 36
            L6 25
            L25 23
            Z"
            fill="url(#latestPurple)"
            opacity=".3"
            filter="url(#latestGlow)"/>

        <!-- النجمة الرئيسية -->
        <path
            d="
            M32 5
            L38.5 23.8
            L58 24.7
            L42.8 36.1
            L47.5 55
            L32 44.3
            L16.5 55
            L21.2 36.1
            L6 24.7
            L25.5 23.8
            Z"
            fill="url(#latestGold)"
            stroke="#FFF0A6"
            stroke-width="1.4"
            stroke-linejoin="round"
            filter="url(#latestGlow)"/>

        <!-- طبقة داخلية -->
        <path
            d="
            M32 12
            L36.3 26
            L51 27
            L39.5 35.4
            L43 49
            L32 41.5
            L21 49
            L24.5 35.4
            L13 27
            L27.7 26
            Z"
            fill="url(#latestPurple)"
            opacity=".38"/>

        <!-- لمعان مركزي -->
        <path
            d="
            M32 18
            L34.3 27.6
            L43.5 30
            L35.2 34.5
            L37 43
            L32 37.8
            L27 43
            L28.8 34.5
            L20.5 30
            L29.7 27.6
            Z"
            fill="#FFF8D1"
            opacity=".72"/>

        <!-- بريق -->
        <path
            d="M50 7V17M45 12H55"
            stroke="#FFF4A3"
            stroke-width="2.3"
            stroke-linecap="round"/>

        <path
            d="M10 39V46M6.5 42.5H13.5"
            stroke="#D8B4FE"
            stroke-width="1.8"
            stroke-linecap="round"/>

        <circle
            cx="51"
            cy="48"
            r="2"
            fill="#FFD84A"/>

    </svg>`,



    // ========================================================
    // 🎮 الألعاب — أزرق + سماوي + بنفسجي
    // ========================================================
    games: `
    <svg viewBox="0 0 64 64"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         preserveAspectRatio="xMidYMid meet">

        <defs>

            <linearGradient id="gameBlue"
                            x1="8" y1="10"
                            x2="55" y2="55"
                            gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#5EE7FF"/>
                <stop offset="35%" stop-color="#24A8FF"/>
                <stop offset="70%" stop-color="#536DFF"/>
                <stop offset="100%" stop-color="#743CFF"/>
            </linearGradient>

            <linearGradient id="gameLight"
                            x1="20" y1="13"
                            x2="45" y2="35"
                            gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#FFFFFF" stop-opacity=".7"/>
                <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
            </linearGradient>

            <radialGradient id="gameAura">
                <stop offset="0%" stop-color="#25D9FF" stop-opacity=".28"/>
                <stop offset="100%" stop-color="#2563EB" stop-opacity="0"/>
            </radialGradient>

            <filter id="gameGlow"
                    x="-60%" y="-60%"
                    width="220%" height="220%">
                <feGaussianBlur stdDeviation="2"
                                 result="blur"/>
                <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>

        </defs>

        <!-- الهالة -->
        <ellipse
            cx="32"
            cy="32"
            rx="29"
            ry="25"
            fill="url(#gameAura)"/>

        <!-- ظل -->
        <ellipse
            cx="32"
            cy="52"
            rx="19"
            ry="4"
            fill="#2463FF"
            opacity=".16"/>

        <!-- جسم يد التحكم -->
        <path
            d="
            M17 17
            C21.3 14.1 26.5 13
            32 13
            C37.5 13 42.7 14.1 47 17
            C51.3 19.9 55.2 30.7 56.7 38.3
            C57.9 44.4 53.3 48.8 48.9 45.7
            L41.2 40H22.8
            L15.1 45.7
            C10.7 48.8 6.1 44.4 7.3 38.3
            C8.8 30.7 12.7 19.9 17 17Z"
            fill="url(#gameBlue)"
            fill-opacity=".88"
            stroke="#8DEBFF"
            stroke-width="1.6"
            stroke-linejoin="round"
            filter="url(#gameGlow)"/>

        <!-- لمعان علوي -->
        <path
            d="
            M18 18
            C22 15.7 26.7 14.6 32 14.6
            C37.3 14.6 42 15.7 46 18"
            stroke="url(#gameLight)"
            stroke-width="3"
            stroke-linecap="round"/>

        <!-- D-PAD -->
        <path
            d="
            M14 27
            H20
            V21
            H26
            V27
            H32
            V33
            H26
            V39
            H20
            V33
            H14
            Z"
            fill="#E7FBFF"
            opacity=".95"/>

        <!-- زر A -->
        <circle
            cx="42"
            cy="27"
            r="3.5"
            fill="#FF5C8A"/>

        <circle
            cx="42"
            cy="27"
            r="1.4"
            fill="#FFD1DE"/>

        <!-- زر B -->
        <circle
            cx="49"
            cy="34"
            r="3.5"
            fill="#FFD34E"/>

        <circle
            cx="49"
            cy="34"
            r="1.4"
            fill="#FFF1A8"/>

        <!-- أزرار صغيرة -->
        <circle
            cx="34"
            cy="38"
            r="1.4"
            fill="#D7F9FF"
            opacity=".75"/>

        <circle
            cx="39"
            cy="38"
            r="1.4"
            fill="#D7F9FF"
            opacity=".75"/>

    </svg>`,



    // ========================================================
    // 🎲 المتجر — حجر دامة + حجر طاولة
    // ========================================================
    store: `
    <svg viewBox="0 0 64 64"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         preserveAspectRatio="xMidYMid meet">

        <defs>

            <!-- حجر الدامة -->
            <radialGradient id="damaRed"
                            cx="30%" cy="18%"
                            r="82%"
                            gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#FF8A8A"/>
                <stop offset="28%" stop-color="#FF3B4F"/>
                <stop offset="65%" stop-color="#D7193F"/>
                <stop offset="100%" stop-color="#7F102E"/>
            </radialGradient>

            <!-- حافة الدامة -->
            <linearGradient id="damaEdge"
                            x1="8" y1="20"
                            x2="32" y2="46"
                            gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#FF6B7A"/>
                <stop offset="50%" stop-color="#C9183D"/>
                <stop offset="100%" stop-color="#700D29"/>
            </linearGradient>

            <!-- حجر الطاولة -->
            <radialGradient id="backgammonGold"
                            cx="30%" cy="18%"
                            r="85%"
                            gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#FFF4A3"/>
                <stop offset="25%" stop-color="#FFD84D"/>
                <stop offset="60%" stop-color="#F59E0B"/>
                <stop offset="100%" stop-color="#A95100"/>
            </radialGradient>

            <!-- هالة -->
            <radialGradient id="storeAura">
                <stop offset="0%" stop-color="#FFB000" stop-opacity=".28"/>
                <stop offset="55%" stop-color="#FF3B3B" stop-opacity=".10"/>
                <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
            </radialGradient>

            <filter id="storeGlow"
                    x="-70%" y="-70%"
                    width="240%" height="240%">
                <feGaussianBlur stdDeviation="2"
                                 result="blur"/>
                <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>

            <filter id="storeShadow"
                    x="-70%" y="-70%"
                    width="240%" height="240%">
                <feDropShadow
                    dx="0"
                    dy="4"
                    stdDeviation="2.5"
                    flood-color="#6B1026"
                    flood-opacity=".35"/>
            </filter>

        </defs>


        <!-- الهالة -->
        <circle
            cx="32"
            cy="32"
            r="30"
            fill="url(#storeAura)"/>


        <!-- ================================================= -->
        <!-- حجر الدامة الأحمر — الخلفي -->
        <!-- ================================================= -->

        <!-- الظل -->
        <ellipse
            cx="19"
            cy="48"
            rx="13"
            ry="4"
            fill="#7F102E"
            opacity=".22"/>

        <!-- جسم الحجر -->
        <path
            d="
            M7 25
            C7 20.2 12.8 16.5 20 16.5
            C27.2 16.5 33 20.2 33 25
            V38
            C33 42.8 27.2 46.5 20 46.5
            C12.8 46.5 7 42.8 7 38
            Z"
            fill="url(#damaEdge)"
            stroke="#FF6B7A"
            stroke-width="1.5"
            filter="url(#storeShadow)"/>

        <!-- سطح الدامة -->
        <ellipse
            cx="20"
            cy="24.7"
            rx="13"
            ry="7.6"
            fill="url(#damaRed)"
            stroke="#FF8A8A"
            stroke-width="1.7"/>

        <!-- الحلقة -->
        <ellipse
            cx="20"
            cy="24.7"
            rx="8.2"
            ry="4.5"
            stroke="#FFB4BA"
            stroke-width="1.5"
            opacity=".7"/>

        <ellipse
            cx="20"
            cy="24.7"
            rx="4.8"
            ry="2.5"
            stroke="#8C1230"
            stroke-width="1"
            opacity=".55"/>

        <!-- انعكاس -->
        <path
            d="
            M12.5 22.3
            C14.5 20.5 17 19.6 20.3 19.6"
            stroke="#FFD8DC"
            stroke-width="1.8"
            stroke-linecap="round"
            opacity=".8"/>


        <!-- ================================================= -->
        <!-- حجر الطاولة الذهبي — الأمامي -->
        <!-- ================================================= -->

        <!-- الظل -->
        <ellipse
            cx="43"
            cy="51"
            rx="12"
            ry="4"
            fill="#8A4800"
            opacity=".22"/>

        <!-- جسم الحجر -->
        <path
            d="
            M31 21
            C31 16.7 36.4 13.4 43 13.4
            C49.6 13.4 55 16.7 55 21
            V39
            C55 43.3 49.6 46.6 43 46.6
            C36.4 46.6 31 43.3 31 39
            Z"
            fill="url(#backgammonGold)"
            stroke="#FFE27A"
            stroke-width="1.6"
            filter="url(#storeGlow)"/>

        <!-- سطح -->
        <ellipse
            cx="43"
            cy="20.8"
            rx="12"
            ry="6.8"
            fill="url(#backgammonGold)"
            stroke="#FFF0A3"
            stroke-width="1.7"/>

        <!-- نقاط الطاولة -->
        <circle
            cx="38.5"
            cy="19.6"
            r="1.35"
            fill="#8A4A00"/>

        <circle
            cx="43"
            cy="22"
            r="1.35"
            fill="#8A4A00"/>

        <circle
            cx="47.5"
            cy="19.6"
            r="1.35"
            fill="#8A4A00"/>

        <!-- الحلقة الداخلية -->
        <ellipse
            cx="43"
            cy="20.8"
            rx="7"
            ry="3.7"
            stroke="#FFF4B5"
            stroke-width="1"
            opacity=".65"/>

        <!-- لمعان -->
        <path
            d="
            M36.5 18.3
            C38.5 16.7 40.7 16
            43.2 16"
            stroke="#FFFFFF"
            stroke-width="1.7"
            stroke-linecap="round"
            opacity=".75"/>

        <!-- نجمة صغيرة للمتجر -->
        <path
            d="M54 7V14M50.5 10.5H57.5"
            stroke="#FFD84D"
            stroke-width="1.7"
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


