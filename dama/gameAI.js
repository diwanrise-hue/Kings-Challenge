// gameAI.js
// 🌟 (النسخة الاحترافية المطلقة): 
// تم إضافة خوارزمية "تمديد المسار الإجباري (Forced Move Extension)".
// البوت الآن سيرى فخاخ التضحية بـ 3 أحجار (وحتى 5 أحجار) بوضوح تام ولن يتوقف عن الحساب في المنتصف!

import { gameEngine } from './gameEngine.js';
import { gameState } from './gameState.js'; 

const AI_LEVELS = {
    1: { id: 1, depth: 1, randomChance: 0.30, maxTime: 500,  name: "عمق 1" },
    2: { id: 2, depth: 2, randomChance: 0.15, maxTime: 1000, name: "عمق 2" },
    3: { id: 3, depth: 3, randomChance: 0.05, maxTime: 1500, name: "عمق 3" },
    4: { id: 4, depth: 4, randomChance: 0.00, maxTime: 2500, name: "عمق 4" },
    5: { id: 5, depth: 5, randomChance: 0.00, maxTime: 4000, name: "عمق 5" },
    6: { id: 6, depth: 6, randomChance: 0.00, maxTime: 8000, name: "عمق 6" },
    7: { id: 7, depth: 7, randomChance: 0.00, maxTime: 15000, name: "الزعيم (عمق 7)" }, 
    8: { id: 8, depth: 8, randomChance: 0.00, maxTime: 20000, name: "المصباح السحري" } 
};

function isSameMove(m1, m2) {
    if (!m1 || !m2 || m1.length === 0 || m2.length === 0) return false;
    let start1 = m1[0], end1 = m1[m1.length - 1];
    let start2 = m2[0], end2 = m2[m2.length - 1];
    return start1.fromR === start2.fromR && start1.fromC === start2.fromC &&
           end1.toR === end2.toR && end1.toC === end2.toC;
}

export const gameAI = {
    nodesEvaluated: 0,
    killerMoves: new Array(30).fill(null), 
    
    generateBoardHash(board, currentTurn) {
        let hash = currentTurn === 'white' ? 'W' : 'B';
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                let p = board[r][c];
                if (!p) hash += '.';
                else if (p === 'white') hash += 'w';
                else if (p === 'black') hash += 'b';
                else if (p === 'white-dama') hash += 'X';
                else if (p === 'black-dama') hash += 'Y';
            }
        }
        return hash;
    },

    applyMoveToBoard(board, movePath, color, pieceDir) {
        let newBoard = board.map(row => [...row]);
        if (!movePath || movePath.length === 0) return newBoard;
        
        let startR = movePath[0].fromR;
        let startC = movePath[0].fromC;
        let piece = newBoard[startR][startC];
        newBoard[startR][startC] = null;
        
        let lastStep = movePath[movePath.length - 1];
        let endR = lastStep.toR;
        let endC = lastStep.toC;
        
        for (let step of movePath) {
            if (step.midR !== null && step.midC !== null && step.midR !== undefined) {
                newBoard[step.midR][step.midC] = null;
            }
        }
        
        let promoRow = (pieceDir[color] === 1) ? 7 : 0;
        if (endR === promoRow && !piece.includes('dama')) {
            piece += '-dama';
        }
        
        newBoard[endR][endC] = piece;
        return newBoard;
    },

    evaluateBoard(board, aiColor, pieceDirection, levelNum) {
        let score = 0;
        let oppColor = aiColor === 'white' ? 'black' : 'white';
        let myDir = pieceDirection[aiColor];
        
        let myPieces = 0, oppPieces = 0;
        let myDamas = 0, oppDamas = 0;
        let myPiecesList = [], oppPiecesList = []; 

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                let p = board[r][c];
                if (p) {
                    let isMine = p.startsWith(aiColor);
                    let isDama = p.includes('dama');
                    let sign = isMine ? 1 : -1;
                    let pColor = isMine ? aiColor : oppColor;

                    if (isMine) { 
                        myPieces++; 
                        if (isDama) myDamas++; 
                        myPiecesList.push({r, c}); 
                    } else { 
                        oppPieces++; 
                        if (isDama) oppDamas++; 
                        oppPiecesList.push({r, c}); 
                    }

                    // وزن الدامة 400، الحجر 100 (للتضحية بـ 3 مقابل דامة)
                    score += (isDama ? 400 : 100) * sign;

                    if (!isDama && levelNum >= 3) {
                        let pDir = isMine ? myDir : -myDir;
                        let progress = (pDir === 1) ? r : (7 - r);
                        score += (progress * 2) * sign; 
                        
                        if (progress === 6) score += 40 * sign; 
                        
                        if (levelNum >= 5) {
                            if (c >= 2 && c <= 5) score += 4 * sign; 
                            let backRow = (pDir === 1) ? 0 : 7;
                            if (r === backRow) score += 8 * sign; 
                            
                            let backR = r - pDir;
                            if (backR >= 0 && backR < 8 && board[backR][c] && board[backR][c].startsWith(pColor)) {
                                score += 3 * sign; 
                            }
                            if ((c > 0 && board[r][c-1] && board[r][c-1].startsWith(pColor)) ||
                                (c < 7 && board[r][c+1] && board[r][c+1].startsWith(pColor))) {
                                score += 3 * sign; 
                            }
                        }
                    }
                }
            }
        }

        if (levelNum >= 5) {
            if (myPieces > oppPieces) score += (16 - oppPieces) * 5; 
            else if (oppPieces > myPieces) score -= (16 - myPieces) * 5; 
        }

        let isEndgame = (myPieces + oppPieces) <= 8 || oppPieces <= 3 || myPieces <= 3;
        
        if (isEndgame && levelNum >= 6) {
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    let p = board[r][c];
                    if (p && p.includes('dama')) {
                        let isMine = p.startsWith(aiColor);
                        let sign = isMine ? 1 : -1;
                        
                        if ((isMine && myPieces > oppPieces) || (!isMine && oppPieces > myPieces)) {
                            let preyList = isMine ? oppPiecesList : myPiecesList;
                            if (preyList.length > 0) {
                                let minDistance = 999;
                                let sameLineBonus = 0;
                                for (let prey of preyList) {
                                    let dist = Math.abs(r - prey.r) + Math.abs(c - prey.c);
                                    if (dist < minDistance) minDistance = dist;
                                    if (r === prey.r || c === prey.c) sameLineBonus += 15;
                                }
                                score -= (minDistance * 4) * sign; 
                                score += sameLineBonus * sign;
                            }
                        } else {
                            let predatorList = isMine ? oppPiecesList : myPiecesList;
                            let sameLinePenalty = 0;
                            for (let predator of predatorList) {
                                if (r === predator.r || c === predator.c) sameLinePenalty += 15;
                            }
                            let centerDist = Math.abs(r - 3.5) + Math.abs(c - 3.5);
                            score += (centerDist * 4) * sign; 
                            score -= sameLinePenalty * sign; 
                        }
                    }
                }
            }
            if (myDamas > 0 && oppPieces === 0) score += 10000; 
            if (oppDamas > 0 && myPieces === 0) score -= 10000;
        }

        return score;
    },

    quiescence(board, alpha, beta, isMaximizing, currentTurn, aiColor, pieceDirection, levelNum, depthLimit) {
        this.nodesEvaluated++;

        let allMoves = gameEngine.generateAllTurnMoves(currentTurn, board);
        let captures = allMoves.filter(m => m.some(step => step.midR !== null));
        
        if (captures.length === 0 || depthLimit <= 0) {
            return this.evaluateBoard(board, aiColor, pieceDirection, levelNum);
        }

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let move of captures) {
                let newBoard = this.applyMoveToBoard(board, move, currentTurn, pieceDirection);
                let nextTurn = currentTurn === 'white' ? 'black' : 'white';
                let score = this.quiescence(newBoard, alpha, beta, false, nextTurn, aiColor, pieceDirection, levelNum, depthLimit - 1);
                maxEval = Math.max(maxEval, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let move of captures) {
                let newBoard = this.applyMoveToBoard(board, move, currentTurn, pieceDirection);
                let nextTurn = currentTurn === 'white' ? 'black' : 'white';
                let score = this.quiescence(newBoard, alpha, beta, true, nextTurn, aiColor, pieceDirection, levelNum, depthLimit - 1);
                minEval = Math.min(minEval, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    },

    async getBestMoveAsync(virtualBoard, levelStr, aiColor, pieceDirection) {
        let levelNum = parseInt(levelStr) || 3;
        const currentLevel = AI_LEVELS[levelNum] || AI_LEVELS[3];

        let moves = gameEngine.generateAllTurnMoves(aiColor, virtualBoard);

        if (moves.length === 0) return null; 
        if (moves.length === 1) return moves[0];

        if (Math.random() < currentLevel.randomChance) {
            return moves[Math.floor(Math.random() * moves.length)];
        }

        let startTime = Date.now();
        let bestMoveGlobal = moves[0]; 
        const self = this;
        this.nodesEvaluated = 0;
        this.killerMoves.fill(null);
        
        const tt = new Map();

        // 🚀 أضفنا (extensions) لتتبع عدد الحركات الإجبارية المجانية
        async function minimax(board, depth, isMaximizing, alpha, beta, currentTurn, currentMovesNoProg, isRoot = false, extensions = 0) {
            self.nodesEvaluated++;
            
            if (self.nodesEvaluated % 5000 === 0) {
                await new Promise(r => setTimeout(r, 0)); 
            }

            if (Date.now() - startTime >= currentLevel.maxTime) {
                return { score: self.evaluateBoard(board, aiColor, pieceDirection, levelNum), timeout: true };
            }

            if (currentMovesNoProg >= 50) return { score: 0 }; 

            let boardHash = self.generateBoardHash(board, currentTurn) + "-" + depth;
            if (tt.has(boardHash)) return tt.get(boardHash);

            let possibleMoves = gameEngine.generateAllTurnMoves(currentTurn, board);
            
            if (possibleMoves.length === 0) {
                return { score: isMaximizing ? (-99000 - depth) : (99000 + depth) };
            }

            // 🚀 السر العبقري هنا (Forced Move Extension):
            // إذا كانت الحركة إجبارية (الخصم مجبر على الأكل)، نرد العمق الذي تم خصمه!
            // نعطي البوت حتى 8 خطوات مجانية إضافية لاكتشاف فخاخ التضحية الكبيرة.
            let isForced = (possibleMoves.length === 1);
            if (isForced && !isRoot && extensions < 8) {
                depth++; // استرداد العمق (حركة مجانية بدون استهلاك طاقة)
                extensions++;
            }

            if (depth <= 0) {
                let finalScore = 0;
                if (levelNum >= 5) {
                    finalScore = self.quiescence(board, alpha, beta, isMaximizing, currentTurn, aiColor, pieceDirection, levelNum, 6);
                } else {
                    finalScore = self.evaluateBoard(board, aiColor, pieceDirection, levelNum);
                }
                let result = { score: finalScore };
                tt.set(boardHash, result);
                return result;
            }

            if (levelNum >= 5) {
                possibleMoves.sort((a, b) => {
                    let aCaptureCount = a.filter(s => s.midR !== null).length * 100;
                    let bCaptureCount = b.filter(s => s.midR !== null).length * 100;
                    let aKiller = isSameMove(self.killerMoves[depth], a) ? 50 : 0;
                    let bKiller = isSameMove(self.killerMoves[depth], b) ? 50 : 0;
                    return (bCaptureCount + bKiller) - (aCaptureCount + aKiller);
                });
            }

            let bestMove = null;
            let isTimeout = false;
            let bestScoreObj = null;

            if (isMaximizing) {
                let maxEval = -Infinity;
                for (let move of possibleMoves) {
                    let isCapture = move.some(s => s.midR !== null);
                    let lastStep = move[move.length - 1];
                    let piece = board[move[0].fromR][move[0].fromC];
                    let promoRow = (pieceDirection[currentTurn] === 1) ? 7 : 0;
                    let isPromotion = (lastStep.toR === promoRow && !piece.includes('dama'));
                    
                    let nextMovesNoProg = (isCapture || isPromotion) ? 0 : currentMovesNoProg + 1;
                    let newBoard = self.applyMoveToBoard(board, move, currentTurn, pieceDirection);
                    let nextTurn = currentTurn === 'white' ? 'black' : 'white';
                    
                    // تمرير (extensions) للحلقة القادمة
                    let result = await minimax(newBoard, depth - 1, false, alpha, beta, nextTurn, nextMovesNoProg, false, extensions);
                    
                    if (result.timeout) { isTimeout = true; break; }
                    
                    let moveRepPenalty = 0;
                    if (isRoot && currentTurn === aiColor && gameState.pieceHistories && gameState.pieceHistories[aiColor]) {
                        let tracker = gameState.pieceHistories[aiColor];
                        if (tracker.r === move[0].fromR && tracker.c === move[0].fromC) { 
                            let targetStr = `${move[move.length - 1].toR},${move[move.length - 1].toC}`;
                            let count = 0;
                            for (let pos of tracker.history) { if (pos === targetStr) count++; }
                            if (count === 2) moveRepPenalty = -200;    
                            if (count >= 3) moveRepPenalty = -99000;  
                        }
                    }

                    let randomNoise = isRoot ? (Math.random() * 0.5) : 0; 
                    let currentScore = result.score + moveRepPenalty + randomNoise;

                    if (currentScore > maxEval) { maxEval = currentScore; bestMove = move; }
                    alpha = Math.max(alpha, currentScore);
                    
                    if (beta <= alpha) {
                        if (levelNum >= 6 && !isCapture) self.killerMoves[depth] = move; 
                        break; 
                    }
                }
                bestScoreObj = { score: maxEval, move: bestMove, timeout: isTimeout };
            } else {
                let minEval = Infinity;
                for (let move of possibleMoves) {
                    let isCapture = move.some(s => s.midR !== null);
                    let lastStep = move[move.length - 1];
                    let piece = board[move[0].fromR][move[0].fromC];
                    let promoRow = (pieceDirection[currentTurn] === 1) ? 7 : 0;
                    let isPromotion = (lastStep.toR === promoRow && !piece.includes('dama'));
                    
                    let nextMovesNoProg = (isCapture || isPromotion) ? 0 : currentMovesNoProg + 1;
                    let newBoard = self.applyMoveToBoard(board, move, currentTurn, pieceDirection);
                    let nextTurn = currentTurn === 'white' ? 'black' : 'white';
                    
                    let result = await minimax(newBoard, depth - 1, true, alpha, beta, nextTurn, nextMovesNoProg, false, extensions);
                    
                    if (result.timeout) { isTimeout = true; break; }
                    
                    if (result.score < minEval) { minEval = result.score; bestMove = move; }
                    beta = Math.min(beta, result.score);
                    
                    if (beta <= alpha) {
                        if (levelNum >= 6 && !isCapture) self.killerMoves[depth] = move;
                        break; 
                    }
                }
                bestScoreObj = { score: minEval, move: bestMove, timeout: isTimeout };
            }

            if (!bestScoreObj.timeout) tt.set(boardHash, bestScoreObj);
            return bestScoreObj;
        }

        for (let currentDepth = 2; currentDepth <= currentLevel.depth; currentDepth++) {
            let currentIdleMoves = gameState.movesWithoutProgress || 0;
            let result = await minimax(virtualBoard, currentDepth, true, -Infinity, Infinity, aiColor, currentIdleMoves, true, 0);
            
            if (!result.timeout && result.move) bestMoveGlobal = result.move;
            if (result.timeout || Date.now() - startTime >= currentLevel.maxTime) break;
            if (Math.abs(result.score) > 90000) break; 
        }

        tt.clear();
        return bestMoveGlobal;
    }
};
