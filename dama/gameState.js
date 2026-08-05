/**
 * gameState.js
 * المركز الموحد لبيانات اللعبة (State Management)
 * تم إنشاء هذا الملف خصيصاً لحل مشكلة التبعيات الدائرية (Circular Dependencies).
 */

// 💡 حماية بيئة المتصفح: إذا كان الكود يعمل داخل البوت (Worker)، نستخدم ذاكرة وهمية لتجنب الانهيار
const isBrowser = typeof window !== 'undefined';
const safeStorage = isBrowser ? localStorage : { getItem: () => null, setItem: () => {} };

export const gameState = {
    deviceFingerprint: safeStorage.getItem('dama_device_fingerprint') || (() => {
        const fp = 'dev_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        try { safeStorage.setItem('dama_device_fingerprint', fp); } catch(e) { if(isBrowser) console.warn("Storage full", e); }
        return fp;
    })(),
    botMoveCount: 0,
    isBotOpponent: false,
    isOnlineMode: false,
    onlineRoomID: "",
    myOnlineColor: "",
    currentOpponentName: "",
    currentOpponentAvatar: "❓",
    turnTimerInterval: null,
    turnTimeLeft: 45,
    selectedPiece: null,
    currentTurn: 'white',
    isMultiJumping: false,
    requiredJumps: 0,
    jumpsCount: 0,
    playerColor: 'white',
    lang: safeStorage.getItem('app_lang') || safeStorage.getItem('appLang') || 'ar',
    lastJumpDir: { dr: null, dc: null },
    opponentStartRow: null,
    opponentStartCol: null,
    aiTimeout: null,
    mmInterval: null,
    mmTimeLeft: 0,
    onlineFlip: false,
    pieceDirection: { white: -1, black: 1 },
    blockGameOverModal: true,
    originalHints: null, 
    roomBet: 0, 
    movesWithoutProgress: 0, // عداد حركات التعادل للخمول
    boardHistoryStr: [], // مصفوفة تعقب المماطلة وتكرار الحركات
    virtualBoard: Array(8).fill(null).map(() => Array(8).fill(null)),
    
    // ==========================================
    // 🌟 المتغيرات الجديدة التي تم نقلها من main.js
    // ==========================================
    modalStack: [],           // مصفوفة تتبع النوافذ المفتوحة
    isEditingBet: false,      // حالة تعديل الرهان
    pendingChallengeId: null, // رقم التحدي المعلق
    myCurrentRoomId: null,    // رقم الغرفة الحالية الخاصة بك
    currentViewedPlayer: null,// بيانات اللاعب الذي تشاهد ملفه الشخصي

    userProfile: (() => {
        const stored = safeStorage.getItem('hub_user_profile');
        if (stored) {
            try { return JSON.parse(stored); } catch(e) { if(isBrowser) console.error("Error parsing profile:", e); }
        }
        return { id: "", name: "", avatar: "1000132081.png", isCustomAvatar: false, gamesPlayed: 0, wins: 0, losses: 0, friends: [], hints: 5, nextFreeSpin: 0, discountTicket: 0 };
    })()
};

// 💡 منع البوت من قراءة كائن window و setTimeout الخاص بالواجهة
if (isBrowser) {
    window.gameState = gameState; 
    setTimeout(() => { gameState.blockGameOverModal = false; }, 1000);
}
