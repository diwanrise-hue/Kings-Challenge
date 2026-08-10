    // ========================================================
    // 🎲 المتجر
    // متجر ألعاب فاخر — واجهة مضيئة وملونة
    // ========================================================
    store: `
    <svg viewBox="0 0 64 64"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         preserveAspectRatio="xMidYMid meet">

        <defs>

            <!-- ========================================= -->
            <!-- خلفية وإضاءة المتجر -->
            <!-- ========================================= -->

            <radialGradient id="storeAura"
                cx="50%" cy="42%" r="58%">
                <stop offset="0%" stop-color="#FFD86A" stop-opacity=".34"/>
                <stop offset="55%" stop-color="#FF9F43" stop-opacity=".13"/>
                <stop offset="100%" stop-color="#FF6B35" stop-opacity="0"/>
            </radialGradient>

            <!-- ========================================= -->
            <!-- جسم المتجر -->
            <!-- ========================================= -->

            <linearGradient id="storeBody"
                x1="8" y1="14" x2="56" y2="59">
                <stop offset="0%" stop-color="#334155"/>
                <stop offset="35%" stop-color="#1E293B"/>
                <stop offset="72%" stop-color="#111827"/>
                <stop offset="100%" stop-color="#020617"/>
            </linearGradient>

            <linearGradient id="storeFrame"
                x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#FFF3A6"/>
                <stop offset="25%" stop-color="#FFD54A"/>
                <stop offset="55%" stop-color="#F59E0B"/>
                <stop offset="80%" stop-color="#D97706"/>
                <stop offset="100%" stop-color="#92400E"/>
            </linearGradient>

            <!-- ========================================= -->
            <!-- مظلة المتجر -->
            <!-- ========================================= -->

            <linearGradient id="storeAwningRed"
                x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#FF8A9A"/>
                <stop offset="30%" stop-color="#F43F5E"/>
                <stop offset="70%" stop-color="#DC173D"/>
                <stop offset="100%" stop-color="#9F1239"/>
            </linearGradient>

            <linearGradient id="storeAwningGold"
                x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#FFF7B2"/>
                <stop offset="35%" stop-color="#FFD84D"/>
                <stop offset="75%" stop-color="#F59E0B"/>
                <stop offset="100%" stop-color="#B45309"/>
            </linearGradient>

            <!-- ========================================= -->
            <!-- النوافذ -->
            <!-- ========================================= -->

            <linearGradient id="storeWindow"
                x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#CFFAFE"/>
                <stop offset="28%" stop-color="#67E8F9"/>
                <stop offset="65%" stop-color="#22B8E6"/>
                <stop offset="100%" stop-color="#155E75"/>
            </linearGradient>

            <linearGradient id="storeDoor"
                x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#475569"/>
                <stop offset="45%" stop-color="#1E293B"/>
                <stop offset="100%" stop-color="#020617"/>
            </linearGradient>

            <!-- ========================================= -->
            <!-- الألعاب داخل الواجهة -->
            <!-- ========================================= -->

            <radialGradient id="storeDiceRed"
                cx="30%" cy="20%" r="80%">
                <stop offset="0%" stop-color="#FFB4BC"/>
                <stop offset="35%" stop-color="#FB536B"/>
                <stop offset="70%" stop-color="#E11D48"/>
                <stop offset="100%" stop-color="#881337"/>
            </radialGradient>

            <radialGradient id="storeDiceGold"
                cx="30%" cy="18%" r="82%">
                <stop offset="0%" stop-color="#FFF7B2"/>
                <stop offset="30%" stop-color="#FFD84A"/>
                <stop offset="70%" stop-color="#F59E0B"/>
                <stop offset="100%" stop-color="#92400E"/>
            </radialGradient>

            <linearGradient id="storeBlueGame"
                x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#8BFAFF"/>
                <stop offset="40%" stop-color="#22D3EE"/>
                <stop offset="100%" stop-color="#2563EB"/>
            </linearGradient>

            <!-- ========================================= -->
            <!-- الظلال والإضاءة -->
            <!-- ========================================= -->

            <filter id="storeShadow"
                x="-60%" y="-60%" width="220%" height="240%">

                <feDropShadow
                    dx="0"
                    dy="4"
                    stdDeviation="2.4"
                    flood-color="#020617"
                    flood-opacity=".5"/>
            </filter>

            <filter id="storeGlow"
                x="-80%" y="-80%" width="260%" height="260%">

                <feGaussianBlur
                    stdDeviation="2"
                    result="blur"/>

                <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>

        </defs>


        <!-- =============================================== -->
        <!-- هالة خلف المتجر -->
        <!-- =============================================== -->

        <ellipse
            cx="32"
            cy="34"
            rx="30"
            ry="28"
            fill="url(#storeAura)"/>


        <!-- =============================================== -->
        <!-- ظل المتجر -->
        <!-- =============================================== -->

        <ellipse
            cx="32"
            cy="57"
            rx="24"
            ry="4"
            fill="#020617"
            opacity=".34"/>


        <!-- =============================================== -->
        <!-- جسم مبنى المتجر -->
        <!-- =============================================== -->

        <path
            d="
            M8 25
            L8 52
            C8 54.8 10.2 57 13 57
            H51
            C53.8 57 56 54.8 56 52
            V25
            Z"
            fill="url(#storeBody)"
            stroke="url(#storeFrame)"
            stroke-width="1.7"
            filter="url(#storeShadow)"/>


        <!-- =============================================== -->
        <!-- الجزء العلوي / اللافتة -->
        <!-- =============================================== -->

        <rect
            x="10"
            y="15"
            width="44"
            height="13"
            rx="4"
            fill="url(#storeFrame)"
            stroke="#FFF1A8"
            stroke-width="1.2"
            filter="url(#storeGlow)"/>

        <rect
            x="12"
            y="17"
            width="40"
            height="9"
            rx="2.8"
            fill="#24152B"
            stroke="#FBBF24"
            stroke-width=".8"/>


        <!-- =============================================== -->
        <!-- اسم المتجر — رمز ألعاب -->
        <!-- =============================================== -->

        <path
            d="
            M18 22
            L20 18.5
            L22 22
            L20 24
            Z"
            fill="#67E8F9"/>

        <circle
            cx="27"
            cy="21.5"
            r="2"
            fill="#FFD84A"/>

        <path
            d="
            M32 18.5
            L34 22
            L32 24
            L30 22
            Z"
            fill="#FB7185"/>

        <circle
            cx="39"
            cy="21.5"
            r="2"
            fill="#A78BFA"/>

        <path
            d="M44 19V24M41.5 21.5H46.5"
            stroke="#FFF7B2"
            stroke-width="1.3"
            stroke-linecap="round"/>


        <!-- =============================================== -->
        <!-- مظلة المتجر -->
        <!-- =============================================== -->

        <path
            d="
            M7 27
            C7.5 23.8 10 21.5 13 21.5
            H51
            C54 21.5 56.5 23.8 57 27
            L54.5 31
            C53.7 32.4 51.9 33.2 50.2 33.2
            C47.9 33.2 46.2 31.8 45.5 30
            C44.7 31.8 43 33.2 40.7 33.2
            C38.4 33.2 36.7 31.8 36 30
            C35.2 31.8 33.5 33.2 31.2 33.2
            C28.9 33.2 27.2 31.8 26.5 30
            C25.7 31.8 24 33.2 21.7 33.2
            C19.4 33.2 17.7 31.8 17 30
            C16.2 31.8 14.5 33.2 12.2 33.2
            C10.5 33.2 8.7 32.4 8 31
            Z"
            fill="url(#storeAwningRed)"
            stroke="#FFB1BA"
            stroke-width="1.1"
            filter="url(#storeShadow)"/>


        <!-- خطوط ذهبية للمظلة -->

        <path
            d="M12 23.5H52"
            stroke="#FFEFA5"
            stroke-width="1"
            opacity=".7"/>

        <path
            d="M17 23L16.5 30
               M26 23L25.5 30
               M36 23L36 30
               M46 23L46.5 30"
            stroke="#FFCDD5"
            stroke-width=".9"
            opacity=".55"/>


        <!-- =============================================== -->
        <!-- نافذة العرض اليسرى -->
        <!-- =============================================== -->

        <rect
            x="12"
            y="36"
            width="17"
            height="15"
            rx="3"
            fill="#0F172A"
            stroke="url(#storeFrame)"
            stroke-width="1.2"/>

        <rect
            x="14"
            y="38"
            width="13"
            height="11"
            rx="1.8"
            fill="url(#storeWindow)"/>


        <!-- انعكاس الزجاج -->

        <path
            d="M15 39L20 38L15 46Z"
            fill="#FFFFFF"
            opacity=".42"/>


        <!-- =============================================== -->
        <!-- نافذة العرض اليمنى -->
        <!-- =============================================== -->

        <rect
            x="35"
            y="36"
            width="17"
            height="15"
            rx="3"
            fill="#0F172A"
            stroke="url(#storeFrame)"
            stroke-width="1.2"/>

        <rect
            x="37"
            y="38"
            width="13"
            height="11"
            rx="1.8"
            fill="url(#storeWindow)"/>

        <path
            d="M38 39L43 38L38 46Z"
            fill="#FFFFFF"
            opacity=".42"/>


        <!-- =============================================== -->
        <!-- باب المتجر -->
        <!-- =============================================== -->

        <rect
            x="27"
            y="38"
            width="10"
            height="19"
            rx="3"
            fill="url(#storeDoor)"
            stroke="url(#storeFrame)"
            stroke-width="1.2"/>

        <rect
            x="29"
            y="40"
            width="6"
            height="7"
            rx="1.2"
            fill="#172554"
            stroke="#67E8F9"
            stroke-width=".7"/>

        <circle
            cx="34"
            cy="50"
            r="1"
            fill="#FFD84A"/>


        <!-- =============================================== -->
        <!-- لعبة نرد حمراء داخل النافذة -->
        <!-- =============================================== -->

        <g transform="translate(15 39) rotate(-12)">

            <rect
                x="0"
                y="0"
                width="8"
                height="8"
                rx="2"
                fill="url(#storeDiceRed)"
                stroke="#FFD1D7"
                stroke-width=".5"/>

            <circle cx="2.3" cy="2.3" r=".7" fill="#FFF"/>
            <circle cx="5.7" cy="5.7" r=".7" fill="#FFF"/>
            <circle cx="5.7" cy="2.3" r=".7" fill="#FFF"/>
        </g>


        <!-- =============================================== -->
        <!-- لعبة نرد ذهبية داخل النافذة -->
        <!-- =============================================== -->

        <g transform="translate(40 40) rotate(10)">

            <rect
                x="0"
                y="0"
                width="8"
                height="8"
                rx="2"
                fill="url(#storeDiceGold)"
                stroke="#FFF7B2"
                stroke-width=".5"/>

            <circle cx="2.3" cy="2.3" r=".7" fill="#713000"/>
            <circle cx="5.7" cy="5.7" r=".7" fill="#713000"/>
            <circle cx="5.7" cy="2.3" r=".7" fill="#713000"/>
        </g>


        <!-- =============================================== -->
        <!-- قطعة لعبة زرقاء -->
        <!-- =============================================== -->

        <circle
            cx="23"
            cy="48"
            r="2.8"
            fill="url(#storeBlueGame)"
            stroke="#CFFAFE"
            stroke-width=".7"/>

        <circle
            cx="22"
            cy="47"
            r=".8"
            fill="#FFFFFF"
            opacity=".75"/>


        <!-- =============================================== -->
        <!-- قطعة لعبة بنفسجية -->
        <!-- =============================================== -->

        <circle
            cx="44"
            cy="48"
            r="2.8"
            fill="#A78BFA"
            stroke="#EDE9FE"
            stroke-width=".7"/>

        <circle
            cx="43"
            cy="47"
            r=".8"
            fill="#FFFFFF"
            opacity=".75"/>


        <!-- =============================================== -->
        <!-- لمعات زخرفية -->
        <!-- =============================================== -->

        <path
            d="M5 13V19M2 16H8"
            stroke="#FFE06A"
            stroke-width="1.5"
            stroke-linecap="round"
            opacity=".9"/>

        <path
            d="M57 10V15M54.5 12.5H59.5"
            stroke="#67E8F9"
            stroke-width="1.3"
            stroke-linecap="round"
            opacity=".9"/>

        <circle
            cx="58"
            cy="48"
            r="1.5"
            fill="#FFD84A"/>

        <circle
            cx="6"
            cy="43"
            r="1.3"
            fill="#FB7185"/>


        <!-- =============================================== -->
        <!-- لمعان نهائي على واجهة المتجر -->
        <!-- =============================================== -->

        <path
            d="
            M12 16
            C18 13.5 27 13 36 13
            C44 13 50 14 53 16"
            stroke="#FFFFFF"
            stroke-width="1.2"
            stroke-linecap="round"
            opacity=".35"/>

    </svg>`,


