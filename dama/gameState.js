/**
 * gameState.js
 * المركز الموحد لبيانات اللعبة (State Management)
 * تم إنشاء هذا الملف خصيصاً لحل مشكلة التبعيات الدائرية (Circular Dependencies).
 */

export const gameState = {
    deviceFingerprint: localStorage.getItem('dama_device_fingerprint') || (() => {
        const fp = 'dev_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        try { localStorage.setItem('dama_device_fingerprint', fp); } catch(e) { console.warn("Storage full", e); }
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
    lang: localStorage.getItem('app_lang') || localStorage.getItem('appLang') || 'ar',
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
    movesWithoutProgress: 0, // 👈 (جديد) عداد حركات التعادل للخمول
    boardHistoryStr: [], // 👈 (جديد) مصفوفة تعقب المماطلة وتكرار الحركات
    virtualBoard: Array(8).fill(null).map(() => Array(8).fill(null)),
    
    userProfile: (() => {
        const stored = localStorage.getItem('hub_user_profile');
        if (stored) {
            try { return JSON.parse(stored); } catch(e) { console.error("Error parsing profile:", e); }
        }
        return { id: "", name: "", avatar: "1000132081.png", isCustomAvatar: false, gamesPlayed: 0, wins: 0, losses: 0, friends: [], hints: 5, nextFreeSpin: 0, discountTicket: 0 };
    })()
};

// كشف الكائن عالمياً لتتواصل معه الملفات القديمة (غير الـ Modules)
window.gameState = gameState; 

// إزالة منع النافذة بعد ثانية كما كان في الكود الأصلي
setTimeout(() => { gameState.blockGameOverModal = false; }, 1000);
