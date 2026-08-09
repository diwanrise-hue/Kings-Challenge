// ملف: hubIcons.js
// ============================================================
// أيقونات الشريط السفلي — SVG Premium
// ملاحظة: تم الحفاظ على نفس أسماء الأيقونات والربط مع الواجهة.
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
            <linearGradient id="latestMain" x1="13" y1="8" x2="51" y2="56">
                <stop offset="0%" stop-color="currentColor"/>
                <stop offset="55%" stop-color="currentColor" stop-opacity=".92"/>
                <stop offset="100%" stop-color="currentColor" stop-opacity=".55"/>
            </linearGradient>

            <radialGradient id="latestGlow">
                <stop offset="0%" stop-color="currentColor" stop-opacity=".45"/>
                <stop offset="100%" stop-color="currentColor" stop-opacity="0"/>
            </radialGradient>

            <filter id="latestShadow"
                    x="-80%" y="-80%"
                    width="260%" height="260%">
                <feDropShadow
                    dx="0"
                    dy="3"
                    stdDeviation="2"
                    flood-color="currentColor"
                    flood-opacity=".25"/>
            </filter>
        </defs>

        <!-- هالة -->
        <circle
            cx="32"
            cy="32"
            r="25"
            fill="url(#latestGlow)"
            opacity=".5"/>

        <!-- النجمة الخارجية -->
        <path
            d="
            M32 5
            L38.5 23.8
            L58 24.5
            L42.7 36.2
            L47.8 55
            L32 44.4
            L16.2 55
            L21.3 36.2
            L6 24.5
            L25.5 23.8
            Z"
            fill="currentColor"
            fill-opacity=".08"
            stroke="currentColor"
            stroke-width="2"
            stroke-linejoin="round"
            filter="url(#latestShadow)"/>

        <!-- النجمة الداخلية -->
        <path
            d="
            M32 11
            L36.4 25.8
            L51.5 27
            L39.7 35.6
            L43.2 50
            L32 42
            L20.8 50
            L24.3 35.6
            L12.5 27
            L27.6 25.8
            Z"
            fill="url(#latestMain)"
            opacity=".95"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linejoin="round"/>

        <!-- بريق مركزي -->
        <path
            d="M32 19L34.1 28.4L43 30L35.1 34.8L37 43L32 38.2L27 43L28.9 34.8L21 30L29.9 28.4Z"
            fill="white"
            opacity=".18"/>

        <!-- بريق علوي -->
        <path
            d="M49 8V17M44.5 12.5H53.5"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            opacity=".85"/>

        <!-- بريق جانبي -->
        <path
            d="M11 39V45M8 42H14"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            opacity=".65"/>

        <circle
            cx="49"
            cy="48"
            r="2"
            fill="currentColor"
            opacity=".65"/>

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
            <linearGradient id="gameBody"
                            x1="10" y1="10"
                            x2="54" y2="54">
                <stop offset="0%" stop-color="currentColor"/>
                <stop offset="100%" stop-color="currentColor" stop-opacity=".55"/>
            </linearGradient>

            <linearGradient id="gameTop"
                            x1="20" y1="16"
                            x2="44" y2="32">
                <stop offset="0%" stop-color="white" stop-opacity=".18"/>
                <stop offset="100%" stop-color="white" stop-opacity="0"/>
            </linearGradient>

            <filter id="gameShadow"
                    x="-60%" y="-60%"
                    width="220%" height="220%">
                <feDropShadow
                    dx="0"
                    dy="3"
                    stdDeviation="2"
                    flood-color="currentColor"
                    flood-opacity=".28"/>
            </filter>
        </defs>

        <!-- ظل -->
        <ellipse
            cx="32"
            cy="52"
            rx="18"
            ry="4"
            fill="currentColor"
            opacity=".12"/>

        <!-- جسم يد التحكم -->
        <path
            d="
            M17 17
            C21.2 14.2 26.3 13 32 13
            C37.7 13 42.8 14.2 47 17
            C51.2 19.8 55.3 30.7 56.8 38.3
            C58 44.2 53.5 48.8 49.1 45.7
            L41.2 40H22.8
            L14.9 45.7
            C10.5 48.8 6 44.2 7.2 38.3
            C8.7 30.7 12.8 19.8 17 17Z"
            fill="url(#gameBody)"
            fill-opacity=".16"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linejoin="round"
            filter="url(#gameShadow)"/>

        <!-- انعكاس علوي -->
        <path
            d="
            M18 18
            C22 15.6 26.7 14.7 32 14.7
            C37.3 14.7 42 15.6 46 18"
            stroke="url(#gameTop)"
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
            fill="currentColor"
            opacity=".92"/>

        <!-- زر A -->
        <circle
            cx="42"
            cy="27"
            r="3.3"
            fill="currentColor"/>

        <!-- زر B -->
        <circle
            cx="49"
            cy="34"
            r="3.3"
            fill="currentColor"
            opacity=".68"/>

        <!-- أزرار صغيرة -->
        <circle
            cx="34"
            cy="38"
            r="1.4"
            fill="currentColor"
            opacity=".55"/>

        <circle
            cx="39"
            cy="38"
            r="1.4"
            fill="currentColor"
            opacity=".55"/>

    </svg>`,



    // ========================================================
    // 🛍️ المتجر
    // حجر دامة + حجر طاولة
    // ========================================================
    store: `
    <svg viewBox="0 0 64 64"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         preserveAspectRatio="xMidYMid meet">

        <defs>

            <!-- حجر الدامة -->
            <radialGradient id="damaStone"
                            cx="32%" cy="20%"
                            r="78%">
                <stop offset="0%" stop-color="currentColor"/>
                <stop offset="48%" stop-color="currentColor" stop-opacity=".9"/>
                <stop offset="100%" stop-color="currentColor" stop-opacity=".48"/>
            </radialGradient>

            <!-- حجر الطاولة -->
            <linearGradient id="backgammonStone"
                            x1="20" y1="10"
                            x2="49" y2="53">
                <stop offset="0%" stop-color="currentColor"/>
                <stop offset="50%" stop-color="currentColor" stop-opacity=".88"/>
                <stop offset="100%" stop-color="currentColor" stop-opacity=".45"/>
            </linearGradient>

            <filter id="stoneShadow"
                    x="-70%" y="-70%"
                    width="240%" height="240%">
                <feDropShadow
                    dx="0"
                    dy="4"
                    stdDeviation="2.5"
                    flood-color="currentColor"
                    flood-opacity=".28"/>
            </filter>

            <filter id="softGlow"
                    x="-80%"
                    y="-80%"
                    width="260%"
                    height="260%">
                <feGaussianBlur stdDeviation="1.5"/>
            </filter>
        </defs>


        <!-- ============================================= -->
        <!-- حجر الدامة — الخلفي -->
        <!-- ============================================= -->

        <!-- ظل -->
        <ellipse
            cx="20"
            cy="48"
            rx="13"
            ry="4"
            fill="currentColor"
            opacity=".13"/>

        <!-- جسم الحجر -->
        <path
            d="
            M7 25
            C7 20.3 12.8 16.7 20 16.7
            C27.2 16.7 33 20.3 33 25
            V38
            C33 42.7 27.2 46.3 20 46.3
            C12.8 46.3 7 42.7 7 38
            Z"
            fill="url(#damaStone)"
            fill-opacity=".25"
            stroke="currentColor"
            stroke-width="2.2"
            filter="url(#stoneShadow)"/>

        <!-- سطح الحجر -->
        <ellipse
            cx="20"
            cy="24.8"
            rx="13"
            ry="7.6"
            fill="url(#damaStone)"
            stroke="currentColor"
            stroke-width="2.2"/>

        <!-- الحلقة الخارجية -->
        <ellipse
            cx="20"
            cy="24.8"
            rx="8.2"
            ry="4.4"
            stroke="currentColor"
            stroke-width="1.5"
            opacity=".4"/>

        <!-- الحلقة الداخلية -->
        <ellipse
            cx="20"
            cy="24.8"
            rx="4.8"
            ry="2.5"
            stroke="currentColor"
            stroke-width="1"
            opacity=".28"/>

        <!-- لمعان حجر الدامة -->
        <path
            d="
            M12.5 22.5
            C14.5 20.7 17 19.8 20.3 19.8"
            stroke="white"
            stroke-width="1.7"
            stroke-linecap="round"
            opacity=".48"/>


        <!-- ============================================= -->
        <!-- حجر الطاولة — الأمامي -->
        <!-- ============================================= -->

        <!-- ظل -->
        <ellipse
            cx="43"
            cy="51"
            rx="12"
            ry="4"
            fill="currentColor"
            opacity=".14"/>

        <!-- جسم الحجر -->
        <path
            d="
            M31 21
            C31 16.8 36.4 13.5 43 13.5
            C49.6 13.5 55 16.8 55 21
            V39
            C55 43.2 49.6 46.5 43 46.5
            C36.4 46.5 31 43.2 31 39
            Z"
            fill="url(#backgammonStone)"
            fill-opacity=".24"
            stroke="currentColor"
            stroke-width="2.2"
            filter="url(#stoneShadow)"/>

        <!-- سطح -->
        <ellipse
            cx="43"
            cy="20.8"
            rx="12"
            ry="6.8"
            fill="url(#backgammonStone)"
            stroke="currentColor"
            stroke-width="2.2"/>

        <!-- تفاصيل الطاولة -->
        <circle
            cx="38.5"
            cy="19.7"
            r="1.35"
            fill="currentColor"/>

        <circle
            cx="43"
            cy="22"
            r="1.35"
            fill="currentColor"/>

        <circle
            cx="47.5"
            cy="19.7"
            r="1.35"
            fill="currentColor"/>

        <!-- حلقة -->
        <ellipse
            cx="43"
            cy="20.8"
            rx="7"
            ry="3.7"
            stroke="currentColor"
            stroke-width="1"
            opacity=".25"/>

        <!-- لمعان -->
        <path
            d="
            M36.5 18.5
            C38.5 16.9 40.7 16.2 43.2 16.2"
            stroke="white"
            stroke-width="1.6"
            stroke-linecap="round"
            opacity=".5"/>

        <!-- لمعة صغيرة خارجية -->
        <circle
            cx="54"
            cy="10"
            r="1.7"
            fill="currentColor"
            opacity=".7"/>

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


