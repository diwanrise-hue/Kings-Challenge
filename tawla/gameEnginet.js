/**
 * gameEnginet.js (Client-Side)
 * محرك اللعبة للعميل (النسخة المخصصة للعبة الطاولة - Tawla)
 */

import { gameState } from './gameStatet.js'; 

export const gameEngine = {
    
    // 🎲 إعداد ساحة الطاولة القياسية (24 مثلث + البار + منطقة الخروج)
    initStandardTawlaBoard() {
        // الفهرس من 0 إلى 23 (الأبيض يتحرك من 0 إلى 23، والأسود من 23 إلى 0)
        let points = Array(24).fill(null).map(() => ({ color: null, count: 0 }));
        
        // التوزيع القياسي (Standard Backgammon Setup)
        points[0] = { color: 'white', count: 2 };
        points[5] = { color: 'black', count: 5 };
        points[7] = { color: 'black', count: 3 };
        points[11] = { color: 'white', count: 5 };
        points[12] = { color: 'black', count: 5 };
        points[16] = { color: 'white', count: 3 };
        points[18] = { color: 'white', count: 5 };
        points[23] = { color: 'black', count: 2 };

        return {
            points: points,
            bar: { white: 0, black: 0 },
            bearOff: { white: 0, black: 0 }
        };
    },

    // 🎲 رمي النرد
    rollDice() {
        let d1 = Math.floor(Math.random() * 6) + 1;
        let d2 = Math.floor(Math.random() * 6) + 1;
        
        // إذا كانا متشابهين (دبل)، يحصل اللاعب على 4 حركات
        let moves = (d1 === d2) ? [d1, d1, d1, d1] : [d1, d2];
        return { d1, d2, moves };
    },

    // 🎲 التحقق مما إذا كان اللاعب يستطيع إخراج أحجاره (Bearing Off)
    canBearOff(color, board) {
        if (board.bar[color] > 0) return false;
        
        let startIdx = color === 'white' ? 0 : 6;
        let endIdx = color === 'white' ? 17 : 23;
        
        // إذا كان هناك أي حجر خارج منطقة المنزل (الربع الأخير)
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
        
        // إذا كان للاعب أحجار في "البار"، يجب عليه تحريكها أولاً
        let hasBar = board.bar[color] > 0;
        if (hasBar && pointIndex !== 'bar') return []; // لا يمكن تحريك شيء آخر

        // منع تكرار الحركات إذا كان النرد يحتوي على أرقام متشابهة
        let uniqueDice = [...new Set(diceMoves)];

        uniqueDice.forEach(die => {
            let toIndex;
            
            // حساب الوجهة
            if (pointIndex === 'bar') {
                toIndex = color === 'white' ? die - 1 : 24 - die;
            } else {
                toIndex = pointIndex + (die * direction);
            }

            // حالة 1: الحركة داخل اللوحة
            if (toIndex >= 0 && toIndex <= 23) {
                let targetPoint = board.points[toIndex];
                // يمكن النزول إذا كانت النقطة فارغة، أو بها أحجارنا، أو بها حجر واحد للخصم (Blot)
                if (targetPoint.color === null || targetPoint.color === color || targetPoint.count <= 1) {
                    validMoves.push({ to: toIndex, dieUsed: die });
                }
            } 
            // حالة 2: الخروج من اللوحة (Bearing Off)
            else if ((color === 'white' && toIndex >= 24) || (color === 'black' && toIndex < 0)) {
                if (this.canBearOff(color, board)) {
                    // التحقق مما إذا كان الرقم بالضبط يخرج الحجر، أو إذا كان الحجر هو الأبعد ويستخدم رقماً أكبر
                    let exactExit = color === 'white' ? (toIndex === 24) : (toIndex === -1);
                    if (exactExit) {
                        validMoves.push({ to: 'bearOff', dieUsed: die });
                    } else {
                        // إذا كان الرقم أكبر من المطلوب، يجب التأكد أنه لا يوجد حجر أبعد منه
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

        // إزالة الحجر من المصدر
        if (from === 'bar') {
            board.bar[color]--;
        } else {
            board.points[from].count--;
            if (board.points[from].count === 0) board.points[from].color = null;
        }

        // وضع الحجر في الوجهة
        if (to === 'bearOff') {
            board.bearOff[color]++;
        } else {
            let targetPoint = board.points[to];
            // ضرب حجر الخصم (Hit a blot)
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
    }
};

if (typeof window !== 'undefined') {
    window.gameEngine = gameEngine;
}
