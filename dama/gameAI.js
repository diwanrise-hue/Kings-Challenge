// gameAI.js

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

const MAX_TT_SIZE = 300000; 

function isSameMove(m1, m2) {
    if (!m1 || !m2 || m1.length !== m2.length) return false;
    for (let i = 0; i < m1.length; i++) {
        if (m1[i].fromR !== m2[i].fromR || m1[i].fromC !== m2[i].fromC ||
            m1[i].toR !== m2[i].toR || m1[i].toC !== m2[i].toC ||
            m1[i].midR !== m2[i].midR || m1[i].midC !== m2[i].midC) return false;
    }
    return true;
}

export const gameAI = {
    nodesEvaluated: 0,
    killerMoves: new Array(100).fill(null).map(() => [null, null]), 
    historyHeuristic: { 'white': new Array(4096).fill(0), 'black': new Array(4096).fill(0) },
    
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
        let newBoard = [];
        for (let i = 0; i < 8; i++) newBoard.push(board[i].slice());
        
        if (!movePath || movePath.length === 0) return newBoard;
        
        let startR = movePath[0].fromR;
        let startC = movePath[0].fromC;
        let piece = newBoard[startR][startC];
        newBoard[startR][startC] = null;
        
        let lastStep = movePath[movePath.length - 1];
        let endR = lastStep.toR;
        let endC = lastStep.toC;
        
        for (let step of movePath) {
            if (step.midR != null && step.midC != null) {
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

    quiescence(board, alpha, beta, isMaximizing, currentTurn, aiColor, pieceDirection, levelNum, depthLimit, startTime, maxTime) {
        this.nodesEvaluated++;

        if (Date.now() - startTime >= maxTime) {
            return { timeout: true };
        }

        let allMoves = gameEngine.generateAllTurnMoves(currentTurn, board);
        
        let captures = allMoves.filter(move =>
            move.some(step => step.midR != null && step.midC != null)
        );
        
        if (captures.length === 0 || depthLimit <= 0) {
            return { score: this.evaluateBoard(board, aiColor, pieceDirection, levelNum), timeout: false };
        }

        captures.sort((a, b) => {
            let aCapCount = a.filter(s => s.midR != null).length;
            let bCapCount = b.filter(s => s.midR != null).length;
            if (aCapCount !== bCapCount) return bCapCount - aCapCount;
            let aPromo = (a[a.length - 1].toR === (pieceDirection[currentTurn] === 1 ? 7 : 0)) && !board[a[0].fromR][a[0].fromC].includes('dama') ? 1 : 0;
            let bPromo = (b[b.length - 1].toR === (pieceDirection[currentTurn] === 1 ? 7 : 0)) && !board[b[0].fromR][b[0].fromC].includes('dama') ? 1 : 0;
            return bPromo - aPromo;
        });

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let move of captures) {
                let newBoard = this.applyMoveToBoard(board, move, currentTurn, pieceDirection);
                let nextTurn = currentTurn === 'white' ? 'black' : 'white';
                
                let result = this.quiescence(newBoard, alpha, beta, false, nextTurn, aiColor, pieceDirection, levelNum, depthLimit - 1, startTime, maxTime);
                if (result.timeout) return { timeout: true };
                
                maxEval = Math.max(maxEval, result.score);
                alpha = Math.max(alpha, result.score);
                if (beta <= alpha) break;
            }
            return { score: maxEval, timeout: false };
        } else {
            let minEval = Infinity;
            for (let move of captures) {
                let newBoard = this.applyMoveToBoard(board, move, currentTurn, pieceDirection);
                let nextTurn = currentTurn === 'white' ? 'black' : 'white';
                
                let result = this.quiescence(newBoard, alpha, beta, true, nextTurn, aiColor, pieceDirection, levelNum, depthLimit - 1, startTime, maxTime);
                if (result.timeout) return { timeout: true };
                
                minEval = Math.min(minEval, result.score);
                beta = Math.min(beta, result.score);
                if (beta <= alpha) break;
            }
            return { score: minEval, timeout: false };
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
        
        this.killerMoves = new Array(100).fill(null).map(() => [null, null]);
        this.historyHeuristic['white'].fill(0);
        this.historyHeuristic['black'].fill(0);
        
        const tt = new Map();
        let previousPV = []; 

        function getMoveScore(move, ttMove, pvMoveLocal, isCapture, ply, currentTurn) {
            if (ttMove && isSameMove(move, ttMove)) return 1000000;
            if (pvMoveLocal && isSameMove(move, pvMoveLocal)) return 900000;
            if (isCapture) {
                let capCount = move.filter(s => s.midR != null && s.midC != null).length;
                return 100000 + (capCount * 1000);
            }
            if (self.killerMoves[ply][0] && isSameMove(move, self.killerMoves[ply][0])) return 90000;
            if (self.killerMoves[ply][1] && isSameMove(move, self.killerMoves[ply][1])) return 80000;
            
            let fromIdx = move[0].fromR * 8 + move[0].fromC;
            let toIdx = move[move.length - 1].toR * 8 + move[move.length - 1].toC;
            return self.historyHeuristic[currentTurn][fromIdx * 64 + toIdx];
        }

        async function minimax(board, nominalDepth, searchDepth, isMaximizing, alpha, beta, currentTurn, currentMovesNoProg, isRoot = false, extensions = 0, ply = 0) {
            self.nodesEvaluated++;
            
            if (self.nodesEvaluated % 5000 === 0) {
                await new Promise(r => setTimeout(r, 0)); 
            }

            if (Date.now() - startTime >= currentLevel.maxTime) {
                return { timeout: true };
            }

            if (currentMovesNoProg >= 50) return { score: 0, timeout: false, pv: [] }; 

            const originalAlpha = alpha;
            const originalBeta = beta;
            
            let possibleMoves = gameEngine.generateAllTurnMoves(currentTurn, board);
            
            if (possibleMoves.length === 0) {
                return { score: isMaximizing ? (-99000 + ply) : (99000 - ply), timeout: false, pv: [] };
            }

            let isForced = (possibleMoves.length === 1);
            if (isForced && !isRoot && extensions < 8) {
                searchDepth++; 
                extensions++;
            }

            let boardHash = self.generateBoardHash(board, currentTurn) + '|NP:' + currentMovesNoProg + '|EXT:' + extensions;
            
            if (tt.has(boardHash)) {
                let cached = tt.get(boardHash);
                if (cached.depth >= searchDepth) {
                    if (cached.flag === 'EXACT') return { score: cached.score, move: cached.move, pv: [], timeout: false };
                    if (cached.flag === 'LOWERBOUND' && cached.score >= beta) return { score: cached.score, move: cached.move, pv: [], timeout: false };
                    if (cached.flag === 'UPPERBOUND' && cached.score <= alpha) return { score: cached.score, move: cached.move, pv: [], timeout: false };
                }
            }

            if (searchDepth <= 0) {
                let qResult = { score: 0, timeout: false };
                if (levelNum >= 5) {
                    qResult = self.quiescence(board, alpha, beta, isMaximizing, currentTurn, aiColor, pieceDirection, levelNum, 6, startTime, currentLevel.maxTime);
                } else {
                    qResult.score = self.evaluateBoard(board, aiColor, pieceDirection, levelNum);
                }
                if (qResult.timeout) return { timeout: true };
                return { score: qResult.score, timeout: false, pv: [] };
            }

            let ttMove = tt.has(boardHash) ? tt.get(boardHash).move : null;
            let pvMoveLocal = (previousPV && previousPV[ply]) ? previousPV[ply] : null;

            if (levelNum >= 5) {
                let scoredMoves = possibleMoves.map(move => {
                    let isCapture = move.some(s => s.midR != null && s.midC != null);
                    return { move, score: getMoveScore(move, ttMove, pvMoveLocal, isCapture, ply, currentTurn) };
                });
                scoredMoves.sort((a, b) => b.score - a.score);
                possibleMoves = scoredMoves.map(m => m.move);
            }

            let bestMove = null;
            let bestPV = [];

            if (isMaximizing) {
                let maxEval = -Infinity;
                for (let move of possibleMoves) {
                    let isCapture = move.some(s => s.midR != null && s.midC != null);
                    let lastStep = move[move.length - 1];
                    let piece = board[move[0].fromR][move[0].fromC];
                    let promoRow = (pieceDirection[currentTurn] === 1) ? 7 : 0;
                    let isPromotion = (lastStep.toR === promoRow && !piece.includes('dama'));
                    
                    let nextMovesNoProg = (isCapture || isPromotion) ? 0 : currentMovesNoProg + 1;
                    let newBoard = self.applyMoveToBoard(board, move, currentTurn, pieceDirection);
                    let nextTurn = currentTurn === 'white' ? 'black' : 'white';
                    
                    let result = await minimax(newBoard, nominalDepth - 1, searchDepth - 1, false, alpha, beta, nextTurn, nextMovesNoProg, false, extensions, ply + 1);
                    
                    if (result.timeout) return { timeout: true };
                    
                    let moveRepPenalty = 0;
                    if (isRoot && currentTurn === aiColor && gameState.pieceHistories && gameState.pieceHistories[aiColor]) {
                        let tracker = gameState.pieceHistories[aiColor];
                        if (tracker.r === move[0].fromR && tracker.c === move[0].fromC) { 
                            let targetStr = `${move[move.length - 1].toR},${move[move.length - 1].toC}`;
                            let count = 0;
                            for (let pos of tracker.history) { if (pos === targetStr) count++; }
                            if (count === 2) moveRepPenalty = -200;    
                            if (count >= 3 && result.score < 90000) moveRepPenalty = -99000;  
                        }
                    }

                    let currentScore = result.score + moveRepPenalty;

                    if (currentScore > maxEval) { 
                        maxEval = currentScore; 
                        bestMove = move; 
                        bestPV = [move].concat(result.pv || []); 
                    }
                    alpha = Math.max(alpha, currentScore);
                    
                    if (beta <= alpha) {
                        if (levelNum >= 5 && !isCapture) {
                            let fromIdx = move[0].fromR * 8 + move[0].fromC;
                            let toIdx = move[move.length - 1].toR * 8 + move[move.length - 1].toC;
                            self.historyHeuristic[currentTurn][fromIdx * 64 + toIdx] += searchDepth * searchDepth;
                            if (self.historyHeuristic[currentTurn][fromIdx * 64 + toIdx] > 10000) {
                                self.historyHeuristic[currentTurn][fromIdx * 64 + toIdx] = 10000;
                            }
                            if (!isSameMove(move, self.killerMoves[ply][0])) {
                                self.killerMoves[ply][1] = self.killerMoves[ply][0];
                                self.killerMoves[ply][0] = move;
                            }
                        }
                        break; 
                    }
                }
                
                let flag = 'EXACT';
                if (maxEval <= originalAlpha) flag = 'UPPERBOUND';
                else if (maxEval >= originalBeta) flag = 'LOWERBOUND';
                
                let shouldReplace = true;
                if (tt.has(boardHash)) {
                    let cached = tt.get(boardHash);
                    if (cached.depth > searchDepth) shouldReplace = false;
                    else if (cached.depth === searchDepth && cached.flag === 'EXACT' && flag !== 'EXACT') shouldReplace = false;
                }
                if (shouldReplace) {
                    if (tt.size >= MAX_TT_SIZE && !tt.has(boardHash)) {
                        let iterator = tt.keys();
                        let deleted = false;
                        for (let i = 0; i < 3; i++) {
                            let key = iterator.next().value;
                            if (!key) break;
                            let cached = tt.get(key);
                            if (cached.flag !== 'EXACT' || cached.depth < searchDepth) {
                                tt.delete(key);
                                deleted = true;
                                break;
                            }
                        }
                        if (!deleted) tt.delete(tt.keys().next().value);
                    }
                    tt.set(boardHash, { score: maxEval, move: bestMove, flag: flag, depth: searchDepth });
                }
                
                return { score: maxEval, move: bestMove, pv: bestPV, timeout: false };

            } else {
                let minEval = Infinity;
                for (let move of possibleMoves) {
                    let isCapture = move.some(s => s.midR != null && s.midC != null);
                    let lastStep = move[move.length - 1];
                    let piece = board[move[0].fromR][move[0].fromC];
                    let promoRow = (pieceDirection[currentTurn] === 1) ? 7 : 0;
                    let isPromotion = (lastStep.toR === promoRow && !piece.includes('dama'));
                    
                    let nextMovesNoProg = (isCapture || isPromotion) ? 0 : currentMovesNoProg + 1;
                    let newBoard = self.applyMoveToBoard(board, move, currentTurn, pieceDirection);
                    let nextTurn = currentTurn === 'white' ? 'black' : 'white';
                    
                    let result = await minimax(newBoard, nominalDepth - 1, searchDepth - 1, true, alpha, beta, nextTurn, nextMovesNoProg, false, extensions, ply + 1);
                    
                    if (result.timeout) return { timeout: true };
                    
                    if (result.score < minEval) { 
                        minEval = result.score; 
                        bestMove = move; 
                        bestPV = [move].concat(result.pv || []); 
                    }
                    beta = Math.min(beta, result.score);
                    
                    if (beta <= alpha) {
                        if (levelNum >= 5 && !isCapture) {
                            let fromIdx = move[0].fromR * 8 + move[0].fromC;
                            let toIdx = move[move.length - 1].toR * 8 + move[move.length - 1].toC;
                            self.historyHeuristic[currentTurn][fromIdx * 64 + toIdx] += searchDepth * searchDepth;
                            if (self.historyHeuristic[currentTurn][fromIdx * 64 + toIdx] > 10000) {
                                self.historyHeuristic[currentTurn][fromIdx * 64 + toIdx] = 10000;
                            }
                            if (!isSameMove(move, self.killerMoves[ply][0])) {
                                self.killerMoves[ply][1] = self.killerMoves[ply][0];
                                self.killerMoves[ply][0] = move;
                            }
                        }
                        break; 
                    }
                }
                
                let flag = 'EXACT';
                if (minEval >= originalBeta) flag = 'LOWERBOUND';
                else if (minEval <= originalAlpha) flag = 'UPPERBOUND';
                
                let shouldReplace = true;
                if (tt.has(boardHash)) {
                    let cached = tt.get(boardHash);
                    if (cached.depth > searchDepth) shouldReplace = false;
                    else if (cached.depth === searchDepth && cached.flag === 'EXACT' && flag !== 'EXACT') shouldReplace = false;
                }
                if (shouldReplace) {
                    if (tt.size >= MAX_TT_SIZE && !tt.has(boardHash)) {
                        let iterator = tt.keys();
                        let deleted = false;
                        for (let i = 0; i < 3; i++) {
                            let key = iterator.next().value;
                            if (!key) break;
                            let cached = tt.get(key);
                            if (cached.flag !== 'EXACT' || cached.depth < searchDepth) {
                                tt.delete(key);
                                deleted = true;
                                break;
                            }
                        }
                        if (!deleted) tt.delete(tt.keys().next().value);
                    }
                    tt.set(boardHash, { score: minEval, move: bestMove, flag: flag, depth: searchDepth });
                }
                
                return { score: minEval, move: bestMove, pv: bestPV, timeout: false };
            }
        }

        const startDepth = currentLevel.depth === 1 ? 1 : 2;
        let previousScore = 0;
        
        for (let currentDepth = startDepth; currentDepth <= currentLevel.depth; currentDepth++) {
            let currentIdleMoves = gameState.movesWithoutProgress || 0;
            
            let alpha = -Infinity;
            let beta = Infinity;
            let windowSteps = [150, 300, 600, 1200, Infinity];
            let windowIdx = 0;
            
            if (levelNum >= 6 && currentDepth >= 3) {
                alpha = previousScore - windowSteps[0];
                beta = previousScore + windowSteps[0];
            }

            let timeoutOccurred = false;

            while (true) {
                let result = await minimax(virtualBoard, currentDepth, currentDepth, true, alpha, beta, aiColor, currentIdleMoves, true, 0, 0);
                
                if (result.timeout) {
                    timeoutOccurred = true;
                    break;
                }
                
                if ((alpha > -Infinity && result.score <= alpha) || (beta < Infinity && result.score >= beta)) {
                    windowIdx++;
                    if (windowSteps[windowIdx] === Infinity) {
                        alpha = -Infinity;
                        beta = Infinity;
                    } else {
                        alpha = previousScore - windowSteps[windowIdx];
                        beta = previousScore + windowSteps[windowIdx];
                    }
                    continue; 
                }
                
                bestMoveGlobal = result.move;
                previousScore = result.score;
                previousPV = result.pv || [];
                break;
            }

            if (timeoutOccurred) {
                break; 
            }
        }

        tt.clear();
        return bestMoveGlobal;
    }
};
