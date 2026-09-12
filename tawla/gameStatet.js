/**
 * gameStatet.js
 * المركز الموحد لبيانات لعبة الطاولة (Tawla State Management)
 */
const isBrowser = typeof window !== 'undefined';
const safeStorage = isBrowser ? localStorage : { getItem: () => null, setItem: () => {} };

export const gameState = {
    deviceFingerprint: safeStorage.getItem('tawla_device_fingerprint') || (() => {
        const fp = 'dev_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        try { safeStorage.setItem('tawla_device_fingerprint', fp); } catch(e) {}
        return fp;
    })(),
    
    isBotOpponent: false,
    isOnlineMode: false,
    onlineRoomID: "",
    myOnlineColor: "",
    currentOpponentName: "",
    currentOpponentAvatar: "❓",
    
    // 🎲 متغيرات الطاولة الأساسية
    currentTurn: 'white',
    dice: [], // مصفوفة النرد الحالية مثلاً [5, 3]
    diceRolled: false,
    
    // 📐 هندسة اللوحة (24 مثلث)
    // كل مثلث يحتوي على كائن: { color: 'white'|'black', count: 0 }
    virtualBoard: Array(24).fill(null).map(() => ({ color: null, count: 0 })),
    
    // ⛓️ السجن (Bar) للقطع المأكولة
    bar: { white: 0, black: 0 },
    
    // 🚪 الإخراج (Bear-off) للقطع التي أنهت دورتها
    bearOff: { white: 0, black: 0 },
    
    selectedPoint: null, // المثلث الذي اختاره اللاعب لتحريك القطعة
    validMoves: [], // الحركات المتاحة بناءً على النرد
    
    turnTimerInterval: null,
    turnTimeLeft: 45,
    lang: safeStorage.getItem('app_lang') || 'ar',
    
    modalStack: [],
    myCurrentRoomId: null,
    currentViewedPlayer: null,

    userProfile: (() => {
        const stored = safeStorage.getItem('hub_user_profile');
        if (stored) {
            try { return JSON.parse(stored); } catch(e) {}
        }
        return { id: "", name: "", avatar: "1000132081.png", isCustomAvatar: false, tokens: 0, xp: 0 };
    })()
};

if (isBrowser) {
    window.gameState = gameState; 
}
