/**
 * gameEnginet.js (Client-Side)
 * محرك اللعبة للعميل (النسخة المخصصة للعبة الطاولة - Tawla)
 * 🌟 تمت إضافة دالة التحقق من المارس (Gammon) لتتوافق مع السيرفر.
 */

import { gameState } from './gameStatet.js'; 

export const gameEngine = {
    
     // 🎲 إعداد ساحة الطاولة القياسية بالترتيب الرياضي الصحيح (0 إلى 23)
    initStandardTawlaBoard() {
        let points = Array(24).fill(null).map(() => ({ color: null, count: 0 }));
        
        // --- النصف العلوي (0 إلى 11) ---
        points[0] = { color: 'white', count: 2 };
        points[5] = { color: 'black', count: 5 };
        points[7] = { color: 'black', count: 3 };
        points[11] = { color: 'white', count: 5 };
        
        // --- النصف السفلي (12 إلى 23) ---
        points[12] = { color: 'black', count: 5 }; 
        points[16] = { color: 'white', count: 3 }; 
        points[18] = { color: 'white', count: 5 }; 
        points[23] = { color: 'black', count: 2 }; 
        
        // تم توحيد الكلمة إلى bearOff لتعمل الدوال بشكل صحيح
        return { points: points, bar: { white: 0, black: 0 }, bearOff: { white: 0, black: 0 } };
    },

    // 🎲 رمي النرد
    rollDice() {
        let d1 = Math.floor(Math.random() * 6) + 1;
        let d2 = Math.floor(Math.random() * 6) + 1;
        
        let moves = (d1 === d2) ? [d1, d1, d1, d1] : [d1, d2];
        return { d1, d2, moves };
    },

    // 🎲 التحقق مما إذا كان اللاعب يستطيع إخراج أحجاره (Bearing Off)
    canBearOff(color, board) {
        if (board.bar[color] > 0) return false;
        
        let startIdx = color === 'white' ? 0 : 6;
        let endIdx = color === 'white' ? 17 : 23;
        
        for (let i = startIdx; i <= endIdx; i++) {
            if (board.points[i].color === color && board.points[i].count > 0) {
                return false;
            }
        }
        return true;
    },

    // 🎲 جلب كل الحركات الممكنة لنقطة معينة بناءً على النرد المتبقي
    getValidMovesForPoint(pointIndex, color, board, diceMoves) {
        let validMoves = [];
        let direction = color === 'white' ? 1 : -1;
        
        let hasBar = board.bar[color] > 0;
        if (hasBar && pointIndex !== 'bar') return []; 

        let uniqueDice = [...new Set(diceMoves)];

        uniqueDice.forEach(die => {
            let toIndex;
            
            if (pointIndex === 'bar') {
                toIndex = color === 'white' ? die - 1 : 24 - die;
            } else {
                toIndex = pointIndex + (die * direction);
            }

            if (toIndex >= 0 && toIndex <= 23) {
                let targetPoint = board.points[toIndex];
                if (targetPoint.color === null || targetPoint.color === color || targetPoint.count <= 1) {
                    validMoves.push({ to: toIndex, dieUsed: die });
                }
            } 
            else if ((color === 'white' && toIndex >= 24) || (color === 'black' && toIndex < 0)) {
                if (this.canBearOff(color, board)) {
                    let exactExit = color === 'white' ? (toIndex === 24) : (toIndex === -1);
                    if (exactExit) {
                        validMoves.push({ to: 'bearOff', dieUsed: die });
                    } else {
                        let isFarthest = true;
                        let startPoint = color === 'white' ? 18 : 5;
                        let step = color === 'white' ? 1 : -1;
                        for (let i = startPoint; i !== pointIndex; i += step) {
                            if (board.points[i].color === color && board.points[i].count > 0) {
                                isFarthest = false; break;
                            }
                        }
                        if (isFarthest) {
                            validMoves.push({ to: 'bearOff', dieUsed: die });
                        }
                    }
                }
            }
        });

        return validMoves;
    },

    // 🎲 التحقق مما إذا كان اللاعب يمتلك أي حركة قانونية
    hasAnyValidMove(color, board, diceMoves) {
        if (diceMoves.length === 0) return false;
        
        if (board.bar[color] > 0) {
            return this.getValidMovesForPoint('bar', color, board, diceMoves).length > 0;
        }

        for (let i = 0; i < 24; i++) {
            if (board.points[i].color === color && board.points[i].count > 0) {
                if (this.getValidMovesForPoint(i, color, board, diceMoves).length > 0) {
                    return true;
                }
            }
        }
        return false;
    },

    // 🎲 تنفيذ الحركة وتحديث اللوحة
    executeMove(from, to, color, board) {
        let isHit = false;

        if (from === 'bar') {
            board.bar[color]--;
        } else {
            board.points[from].count--;
            if (board.points[from].count === 0) board.points[from].color = null;
        }

        if (to === 'bearOff') {
            board.bearOff[color]++;
        } else {
            let targetPoint = board.points[to];
            if (targetPoint.color !== null && targetPoint.color !== color && targetPoint.count === 1) {
                board.bar[targetPoint.color]++;
                targetPoint.count = 1;
                targetPoint.color = color;
                isHit = true;
            } else {
                targetPoint.count++;
                targetPoint.color = color;
            }
        }
        return isHit;
    },

    // 🎲 إنهاء اللعبة عند خروج 15 حجر
    checkGameOver(board) {
        if (board.bearOff['white'] === 15) return 'white';
        if (board.bearOff['black'] === 15) return 'black';
        return null;
    },

    // 🌟 إضافة قاعدة المارس (Gammon) لمضاعفة الجوائز محلياً
    isMars(winnerColor, board) {
        const loserColor = winnerColor === 'white' ? 'black' : 'white';
        return board.bearOff[loserColor] === 0;
    }
};

if (typeof window !== 'undefined') {
    window.gameEngine = gameEngine;
}

    // 🎲 استخراج جميع الحركات الممكنة للدور الحالي (تم إضافتها للبوت ونظام التلميح)
    generateAllTurnMoves(color, board, diceMoves) {
        let allMoves = [];
        if (!diceMoves || diceMoves.length === 0) return allMoves;

        // إذا كان هناك حجر في البار، يجب اللعب منه أولاً
        if (board.bar[color] > 0) {
            let valid = this.getValidMovesForPoint('bar', color, board, diceMoves);
            valid.forEach(v => allMoves.push({ from: 'bar', to: v.to, dieUsed: v.dieUsed }));
            return allMoves;
        },

        // فحص باقي الخانات
        for (let i = 0; i < 24; i++) {
            if (board.points[i].color === color && board.points[i].count > 0) {
                let valid = this.getValidMovesForPoint(i, color, board, diceMoves);
                valid.forEach(v => allMoves.push({ from: i, to: v.to, dieUsed: v.dieUsed }));
            }
        }
        return allMoves;
    },
