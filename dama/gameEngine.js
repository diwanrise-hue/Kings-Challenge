/**
 * gameEngine.js (Client-Side)
 * النسخة المطابقة تماماً لمحرك السيرفر (game-logic.js) لضمان التوافق 100%
 * 🌟 (مُحدّث): إصلاح نظام تحديد الاتجاه ليصبح ثابتاً ويمنع شلل الأحجار.
 * 🎯 (مُحدّث جذرياً): نظام "التعادل الذكي" لإنهاء المطاردة المملة (1 ضد 1) فوراً ما لم يوجد أكل إجباري!
 */

import { gameState } from './gameState.js'; 

export const gameEngine = {
    isValidPos(r, c) {
        return r >= 0 && r < 8 && c >= 0 && c < 8;
    },

    getPieceDirection(color, bState, roomDirectionData = null) {
        const baseColor = color.split('-')[0];
        
        // الاعتماد على الاتجاه الثابت الذي تم تحديده عند بدء المباراة لمنع الانعكاس
        if (roomDirectionData && roomDirectionData[baseColor] !== undefined) {
            return roomDirectionData[baseColor];
        } else if (gameState.pieceDirection && gameState.pieceDirection[baseColor] !== undefined) {
            return gameState.pieceDirection[baseColor];
        }

        // في حال لم يكن متوفراً (كحالة احتياطية)، نعتمد على لون اللاعب الأساسي
        if (gameState.playerColor === 'white') {
            return baseColor === 'white' ? -1 : 1;
        } else {
            return baseColor === 'black' ? -1 : 1;
        }
    },

    computeOnlineFlip(color) { 
        return color === 'black'; 
    },

    getPieceCapturePaths(r, c, color, bState, dirY, parentDr = null, parentDc = null, roomDirectionData = null) {
        const baseColor = color.split('-')[0];
        const isDama = bState[r][c] && bState[r][c].endsWith('-dama');

        let currentDirections = isDama ? [[0, 1], [0, -1], [1, 0], [-1, 0]] : [[dirY, 0], [0, 1], [0, -1]];
        let paths = [];

        for (const [dr, dc] of currentDirections) {
            if (isDama && parentDr !== null && parentDc !== null && dr === -parentDr && dc === -parentDc) continue;

            if (isDama) {
                let step = 1, foundEnemy = null, enemyPos = { r: -1, c: -1 };

                while (true) {
                    const nextR = r + dr * step, nextC = c + dc * step;
                    if (!this.isValidPos(nextR, nextC)) break;

                    const piece = bState[nextR][nextC];
                    if (!foundEnemy) {
                        if (piece === null) { step++; continue; }
                        else if (!piece.startsWith(baseColor)) {
                            foundEnemy = piece;
                            enemyPos = { r: nextR, c: nextC };
                            step++; continue;
                        } else break;
                    } else {
                        if (piece === null) {
                            let capturedPiece = bState[enemyPos.r][enemyPos.c];
                            let movingPiece = bState[r][c];

                            bState[enemyPos.r][enemyPos.c] = null;
                            bState[nextR][nextC] = movingPiece;
                            bState[r][c] = null;

                            const stepObj = { fromR: r, fromC: c, toR: nextR, toC: nextC, midR: enemyPos.r, midC: enemyPos.c };
                            const subPaths = this.getPieceCapturePaths(nextR, nextC, color, bState, dirY, dr, dc, roomDirectionData);

                            if (subPaths.length > 0) {
                                for (const sp of subPaths) paths.push([stepObj, ...sp]);
                            } else { paths.push([stepObj]); }

                            bState[r][c] = movingPiece;
                            bState[nextR][nextC] = null;
                            bState[enemyPos.r][enemyPos.c] = capturedPiece;

                            step++; continue;
                        } else break;
                    }
                }
            } else {
                const midR = r + dr, midC = c + dc, toR = r + 2 * dr, toC = c + 2 * dc;
                if (this.isValidPos(toR, toC)) {
                    const midPiece = bState[midR][midC], toPiece = bState[toR][toC];
                    if (midPiece && !midPiece.startsWith(baseColor) && toPiece === null) {
                        let capturedPiece = bState[midR][midC], movingPiece = bState[r][c];

                        bState[midR][midC] = null;
                        bState[toR][toC] = movingPiece;
                        bState[r][c] = null;

                        const stepObj = { fromR: r, fromC: c, toR: toR, toC: toC, midR: midR, midC: midC };
                        const subPaths = this.getPieceCapturePaths(toR, toC, color, bState, dirY, dr, dc, roomDirectionData);

                        if (subPaths.length > 0) {
                            for (const sp of subPaths) paths.push([stepObj, ...sp]);
                        } else { paths.push([stepObj]); }

                        bState[r][c] = movingPiece;
                        bState[toR][toC] = null;
                        bState[midR][midC] = capturedPiece;
                    }
                }
            }
        }
        return paths;
    },

    getPieceSimpleMoves(r, c, color, bState, dirY) {
        const baseColor = color.split('-')[0];
        const isDama = bState[r][c] && bState[r][c].endsWith('-dama');
        
        let currentDirections = isDama ? [[0, 1], [0, -1], [1, 0], [-1, 0]] : [[dirY, 0], [0, 1], [0, -1]];
        let moves = [];

        for (const [dr, dc] of currentDirections) {
            if (isDama) {
                let step = 1;
                while (true) {
                    const toR = r + dr * step, toC = c + dc * step;
                    if (!this.isValidPos(toR, toC) || bState[toR][toC] !== null) break;
                    moves.push([{ fromR: r, fromC: c, toR: toR, toC: toC, midR: null, midC: null }]);
                    step++;
                }
            } else {
                const toR = r + dr, toC = c + dc;
                if (this.isValidPos(toR, toC) && bState[toR][toC] === null) {
                    moves.push([{ fromR: r, fromC: c, toR: toR, toC: toC, midR: null, midC: null }]);
                }
            }
        }
        return moves;
    },

    generateAllTurnMoves(color, bState, activeR = null, activeC = null, activeDr = null, activeDc = null, roomDirectionData = null) {
        let allCapturePaths = [], maxJumps = 0;
        const baseColor = color.split('-')[0];
        const dirY = this.getPieceDirection(baseColor, bState, roomDirectionData); 

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = bState[r][c];
                if (piece && piece.startsWith(baseColor)) {
                    if (activeR !== null && activeC !== null && (r !== activeR || c !== activeC)) continue;
                    const initDr = (r === activeR && c === activeC) ? activeDr : null;
                    const initDc = (r === activeR && c === activeC) ? activeDc : null;

                    const paths = this.getPieceCapturePaths(r, c, baseColor, bState, dirY, initDr, initDc, roomDirectionData);
                    for (const p of paths) {
                        if (p.length > maxJumps) maxJumps = p.length;
                        allCapturePaths.push(p);
                    }
                }
            }
        }

        if (maxJumps > 0) return allCapturePaths.filter(p => p.length === maxJumps);
        
        let allSimpleMoves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = bState[r][c];
                if (piece && piece.startsWith(baseColor)) {
                    if (activeR !== null && activeC !== null && (r !== activeR || c !== activeC)) continue;
                    
                    allSimpleMoves.push(...this.getPieceSimpleMoves(r, c, baseColor, bState, dirY));
                }
            }
        }
        return allSimpleMoves;
    },

    findMaxJumps(r, c, color, vBoard, initDr = null, initDc = null, roomDirectionData = null) {
        const baseColor = color.split('-')[0];
        const dirY = this.getPieceDirection(baseColor, vBoard, roomDirectionData);
        const paths = this.getPieceCapturePaths(r, c, color, vBoard, dirY, initDr, initDc, roomDirectionData);
        if (paths.length === 0) return 0;
        let max = 0;
        for (let p of paths) { if (p.length > max) max = p.length; }
        return max;
    },

    applyPathToBoard(path, bState, roomDirectionData = null) {
        let newBoard = bState.map(row => [...row]);
        if (!path || path.length === 0) return newBoard;

        path.forEach(step => {
            let piece = newBoard[step.fromR][step.fromC];
            newBoard[step.fromR][step.fromC] = null;
            if (step.midR !== null && step.midC !== null) newBoard[step.midR][step.midC] = null;
            newBoard[step.toR][step.toC] = piece;
        });

        const lastStep = path[path.length - 1];
        let fPiece = newBoard[lastStep.toR][lastStep.toC];

        if (fPiece && !fPiece.includes('dama')) {
            const dirY = this.getPieceDirection(fPiece.split('-')[0], newBoard, roomDirectionData);
            const promoRow = (dirY === 1) ? 7 : 0;
            if (lastStep.toR === promoRow) newBoard[lastStep.toR][lastStep.toC] += '-dama';
        }

        return newBoard;
    },

    isValidDamaMove(fromR, fromC, toR, toC, bState = null) {
        let board = bState || gameState.virtualBoard;
        if (!board) return false;
        
        if (fromR !== toR && fromC !== toC) return false;
        let dr = fromR === toR ? 0 : (toR > fromR ? 1 : -1), dc = fromC === toC ? 0 : (toC > fromC ? 1 : -1);
        let steps = Math.max(Math.abs(toR - fromR), Math.abs(toC - fromC));
        for (let i = 1; i < steps; i++) { if (board[fromR + dr * i][fromC + dc * i] !== null) return false; }
        return true;
    },

    getDamaJumpTarget(fromR, fromC, toR, toC, color, bState = null) {
        let board = bState || gameState.virtualBoard;
        if (!board) return null;
        
        if (fromR !== toR && fromC !== toC) return null;
        const baseColor = color.split('-')[0];
        let dr = fromR === toR ? 0 : (toR > fromR ? 1 : -1), dc = fromC === toC ? 0 : (toC > fromC ? 1 : -1);
        let enemy = null; let steps = Math.max(Math.abs(toR - fromR), Math.abs(toC - fromC));
        
        for (let i = 1; i < steps; i++) {
            let p = board[fromR + dr * i][fromC + dc * i];
            if (p !== null) { 
                if (enemy !== null || p.startsWith(baseColor)) return null; 
                enemy = { row: fromR + dr * i, col: fromC + dc * i }; 
            }
        }
        return enemy;
    },

    hasAnyMove(color, bState, roomDirectionData = null) {
        return this.generateAllTurnMoves(color, bState, null, null, null, null, roomDirectionData).length > 0;
    },

    trackPieceHistory(fromR, fromC, toR, toC, color) {
        if (!gameState.pieceHistories) gameState.pieceHistories = {};
        
        let tracker = gameState.pieceHistories[color];
        if (tracker && tracker.r === fromR && tracker.c === fromC) {
            tracker.r = toR;
            tracker.c = toC;
            tracker.history.push(`${toR},${toC}`);
        } else {
            gameState.pieceHistories[color] = {
                r: toR,
                c: toC,
                history: [`${fromR},${fromC}`, `${toR},${toC}`]
            };
        }
    },

    // 🎯 الحل السحري لمنع المطاردة المملة (التعادل الذكي لـ 1 ضد 1)
    checkIdleDraw(bState, currentTurn, roomDirectionData = null) {
        // 1. قانون التعادل عند مرور 50 حركة بدون تقدم أو أكل
        if (gameState.movesWithoutProgress >= 50) return true;
        
        // 2. إحصاء الأحجار المتبقية على الرقعة
        let wCount = 0, bCount = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (bState[r][c]) {
                    if (bState[r][c].startsWith('white')) wCount++;
                    else if (bState[r][c].startsWith('black')) bCount++;
                }
            }
        }
        
        // 3. تطبيق منطق (حجر ضد حجر)
        if (wCount === 1 && bCount === 1) {
            // نتحقق من كل الحركات المتاحة للاعب الذي جاء دوره الآن
            let moves = this.generateAllTurnMoves(currentTurn, bState, null, null, null, null, roomDirectionData);
            
            // هل يمتلك هذا اللاعب أي حركة فيها أكل إجباري (midR ليس null)؟
            let hasCapture = moves.some(path => path.some(step => step.midR !== null && step.midR !== undefined));
            
            // إذا لم يكن هناك أكل إجباري، ننهي اللعبة بالتعادل فوراً لمنع المطاردة!
            if (!hasCapture) {
                return true; 
            }
        }
        
        return false;
    },

    checkRepetitionAndStalling() {
        if (gameState.movesWithoutProgress === 0) {
            gameState.pieceHistories = {};
            return 0;
        }

        if (!gameState.pieceHistories) return 0;
        
        let maxRep = 0;
        for (let color in gameState.pieceHistories) {
            let tracker = gameState.pieceHistories[color];
            let counts = {};
            for (let pos of tracker.history) {
                counts[pos] = (counts[pos] || 0) + 1;
                if (counts[pos] > maxRep) {
                    maxRep = counts[pos];
                }
            }
        }

        return maxRep; 
    },

    checkGameOver(bState, isSimulation = false) {
        if (!this.hasAnyMove('white', bState)) { if (!isSimulation) this.endGame('black'); return 'black'; }
        if (!this.hasAnyMove('black', bState)) { if (!isSimulation) this.endGame('white'); return 'white'; }
        return null;
    },

    handleSurrender(surrenderingColor) {
        const winnerColor = (surrenderingColor === 'white') ? 'black' : 'white';
        this.endGame(winnerColor);
    },

    endGame(winnerColor) {
        if (gameState.isUpdatingStats || gameState.statsUpdated) return;
        gameState.isUpdatingStats = true; gameState.isGameOver = true; gameState.isGameActive = false;
        
        if (winnerColor !== 'draw') { this.updateUserStats(winnerColor); }
        gameState.statsUpdated = true; gameState.isUpdatingStats = false; 

        if (window.questsManager && !gameState.isTutorialMode && !gameState.isSpectator) {
            const mode = gameState.isOnlineMode ? 'online' : 'bot';
            window.questsManager.updateProgress('play', 1, mode); 
            const myColor = gameState.isOnlineMode ? gameState.myOnlineColor : gameState.playerColor;
            if (winnerColor === myColor) {
                window.questsManager.updateProgress('win', 1, mode); 
            }
        }

        const ui = typeof window !== 'undefined' ? window.ui : null;
        if (ui && typeof ui.showOnlineResultsModal === 'function') { ui.showOnlineResultsModal(winnerColor); } 
        else if (ui && typeof ui.showResultsModal === 'function') { ui.showResultsModal(winnerColor); }

        if (gameState.isOnlineMode && gameState.onlineRoomID && typeof window !== 'undefined' && window.socket) {
            window.socket.emit('matchEnded', { roomID: String(gameState.onlineRoomID).trim(), winner: winnerColor });
        }
    },

    updateUserStats(winnerColor) {
        const ui = typeof window !== 'undefined' ? window.ui : null;
        if (ui && typeof ui.updateUserStats === 'function') {
            const myColor = gameState.myOnlineColor || gameState.playerColor;
            ui.updateUserStats(winnerColor === myColor);
        }
    },

    closeResultsMenu() {
        const ui = typeof window !== 'undefined' ? window.ui : null;
        if (ui && typeof ui.hideOnlineResultsModal === 'function') { ui.hideOnlineResultsModal(); } 
        else if (ui && typeof ui.closeModal === 'function') { ui.closeModal(); }
    },

    resetGame() {
        const ui = typeof window !== 'undefined' ? window.ui : null;
        if (ui && typeof ui.initBoard === 'function') { ui.initBoard(); }
        gameState.currentTurn = 'white'; gameState.isGameOver = false; gameState.isGameActive = true; 
        gameState.statsUpdated = false; gameState.isUpdatingStats = false; gameState.selectedPiece = null;

        if (ui) {
            if (typeof ui.clearHighlights === 'function') ui.clearHighlights();
            if (typeof ui.hideOnlineResultsModal === 'function') ui.hideOnlineResultsModal();
        }
    }
};

if (typeof window !== 'undefined') {
    window.gameEngine = gameEngine;
}
