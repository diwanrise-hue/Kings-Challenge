/**
 * gameEngine.js
 * 🚀 النسخة الصاروخية (Ultra-Optimized) + إصلاح أنظمة التعادل والمماطلة:
 * تم دمج نظام احتساب (حجر ضد حجر)، و 50 حركة بدون أكل،
 * ونظام خسارة التكرار (3 تحذير، 4 خسارة) لكل حجر على حدة.
 */
import { gameState } from './gameState.js'; 

let workerCachedDirections = null;

export const gameEngine = {
    setWorkerDirections(directions) { workerCachedDirections = directions; },

    getPieceDirection(color, bState) {
        const baseColor = color.split('-')[0];
        if (gameState && gameState.pieceDirection && gameState.pieceDirection[baseColor]) {
            return gameState.pieceDirection[baseColor];
        }
        if (workerCachedDirections && workerCachedDirections[baseColor]) { return workerCachedDirections[baseColor]; }

        if (bState) {
            let wSumRow = 0, wCount = 0; let bSumRow = 0, bCount = 0;
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    let p = bState[r][c];
                    if (p) {
                        if (p[0] === 'w') { wSumRow += r; wCount++; }
                        else if (p[0] === 'b') { bSumRow += r; bCount++; }
                    }
                }
            }
            if (wCount > 0 && bCount > 0) {
                let wAvg = wSumRow / wCount; let bAvg = bSumRow / bCount;
                let wDir = wAvg < bAvg ? 1 : -1; let bDir = bAvg < wAvg ? 1 : -1;
                workerCachedDirections = { white: wDir, black: bDir };
                return workerCachedDirections[baseColor];
            }
        }
        return baseColor === 'black' ? 1 : -1;
    },

    computeOnlineFlip(color) { return color === 'black'; },

    getPieceCapturePaths(r, c, color, bState, parentDr = null, parentDc = null) {
        const colorChar = color[0]; 
        let isDama = bState[r][c] && bState[r][c].length > 5; 
        let paths = [];
        let dirY = this.getPieceDirection(colorChar === 'b' ? 'black' : 'white', bState); 
        let directions = isDama ? [[0,1], [0,-1], [1,0], [-1,0]] : [[dirY, 0], [0,1], [0,-1]];

        for (let [dr, dc] of directions) {
            if (isDama && parentDr !== null && parentDc !== null && dr === -parentDr && dc === -parentDc) continue;
            
            if (isDama) {
                let step = 1, foundEnemy = null, enemyR = -1, enemyC = -1;
                while (true) {
                    let nextR = r + dr * step, nextC = c + dc * step;
                    if (nextR < 0 || nextR >= 8 || nextC < 0 || nextC >= 8) break;
                    
                    let piece = bState[nextR][nextC];
                    if (!foundEnemy) {
                        if (piece === null) { step++; continue; }
                        else if (piece[0] !== colorChar) { foundEnemy = piece; enemyR = nextR; enemyC = nextC; step++; continue; }
                        else break; 
                    } else {
                        if (piece === null) {
                            let capturedPiece = bState[enemyR][enemyC]; let movingPiece = bState[r][c];
                            bState[enemyR][enemyC] = null; bState[nextR][nextC] = movingPiece; bState[r][c] = null;

                            let stepObj = { fromR: r, fromC: c, toR: nextR, toC: nextC, midR: enemyR, midC: enemyC };
                            let subPaths = this.getPieceCapturePaths(nextR, nextC, color, bState, dr, dc);
                            
                            if (subPaths.length > 0) { subPaths.forEach(sp => paths.push([stepObj, ...sp])); } 
                            else { paths.push([stepObj]); }

                            bState[r][c] = movingPiece; bState[nextR][nextC] = null; bState[enemyR][enemyC] = capturedPiece;
                            step++; continue; 
                        } else break; 
                    }
                }
            } else {
                let midR = r + dr, midC = c + dc, toR = r + 2 * dr, toC = c + 2 * dc;
                if (toR >= 0 && toR < 8 && toC >= 0 && toC < 8) {
                    let midPiece = bState[midR][midC];
                    if (midPiece && midPiece[0] !== colorChar && bState[toR][toC] === null) {
                        let capturedPiece = bState[midR][midC]; let movingPiece = bState[r][c];
                        bState[midR][midC] = null; bState[toR][toC] = movingPiece; bState[r][c] = null;

                        let stepObj = { fromR: r, fromC: c, toR: toR, toC: toC, midR: midR, midC: midC };
                        let subPaths = this.getPieceCapturePaths(toR, toC, color, bState, dr, dc);
                        
                        if (subPaths.length > 0) { subPaths.forEach(sp => paths.push([stepObj, ...sp])); } 
                        else { paths.push([stepObj]); }

                        bState[r][c] = movingPiece; bState[toR][toC] = null; bState[midR][midC] = capturedPiece;
                    }
                }
            }
        }
        return paths;
    },

    getPieceSimpleMoves(r, c, color, bState) {
        const colorChar = color[0];
        let isDama = bState[r][c] && bState[r][c].length > 5;
        let moves = [];
        let dirY = this.getPieceDirection(colorChar === 'b' ? 'black' : 'white', bState); 
        let directions = isDama ? [[0,1], [0,-1], [1,0], [-1,0]] : [[dirY, 0], [0,1], [0,-1]];

        for (let [dr, dc] of directions) {
            if (isDama) {
                let step = 1;
                while (true) {
                    let toR = r + dr * step, toC = c + dc * step;
                    if (toR >= 0 && toR < 8 && toC >= 0 && toC < 8 && bState[toR][toC] === null) {
                        moves.push([{ fromR: r, fromC: c, toR: toR, toC: toC, midR: null, midC: null }]); step++;
                    } else break;
                }
            } else {
                let toR = r + dr, toC = c + dc;
                if (toR >= 0 && toR < 8 && toC >= 0 && toC < 8 && bState[toR][toC] === null)
                    moves.push([{ fromR: r, fromC: c, toR: toR, toC: toC, midR: null, midC: null }]);
            }
        }
        return moves;
    },

    generateAllTurnMoves(color, bState, activeR = null, activeC = null, activeDr = null, activeDc = null) {
        let allCapturePaths = [], maxJumps = 0; 
        const colorChar = color[0]; 

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                let piece = bState[r][c];
                if (piece && piece[0] === colorChar && (activeR === null || (r === activeR && c === activeC))) {
                    let paths = this.getPieceCapturePaths(r, c, color, bState, (r === activeR ? activeDr : null), (c === activeC ? activeDc : null));
                    for (let p of paths) {
                        if (p.length > maxJumps) maxJumps = p.length; 
                        allCapturePaths.push(p);
                    }
                }
            }
        }
        
        if (maxJumps > 0) return allCapturePaths.filter(p => p.length === maxJumps);
        if (activeR !== null && activeC !== null) return [];

        let allSimpleMoves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                let piece = bState[r][c];
                if (piece && piece[0] === colorChar) { 
                    allSimpleMoves.push(...this.getPieceSimpleMoves(r, c, color, bState)); 
                }
            }
        }
        return allSimpleMoves;
    },

    applyPathToBoard(path, bState) {
        let nextBoard = bState.map(row => [...row]);
        if (!path || path.length === 0) return nextBoard;

        path.forEach(step => {
            let piece = nextBoard[step.fromR][step.fromC];
            nextBoard[step.fromR][step.fromC] = null;
            if (step.midR !== null) nextBoard[step.midR][step.midC] = null;
            nextBoard[step.toR][step.toC] = piece;
        });
        
        let last = path[path.length - 1]; let fPiece = nextBoard[last.toR][last.toC];
        if (fPiece && fPiece.length <= 5) { 
            let dirY = this.getPieceDirection(fPiece.split('-')[0], nextBoard); let promoRow = (dirY === 1) ? 7 : 0;
            if (last.toR === promoRow) { nextBoard[last.toR][last.toC] += '-dama'; }
        }
        return nextBoard;
    },

    findMaxJumps(r, c, color, vBoard, initDr = null, initDc = null) {
        const paths = this.getPieceCapturePaths(r, c, color, vBoard, initDr, initDc);
        if (paths.length === 0) return 0;
        let max = 0;
        for (let p of paths) { if (p.length > max) max = p.length; }
        return max;
    },

    isValidDamaMove(fromR, fromC, toR, toC, bState = null) {
        let board = bState || gameState.virtualBoard;
        if (!board) return false;
        
        if (fromR !== toR && fromC !== toC) return false;
        let dr = fromR === toR ? 0 : (toR > fromR ? 1 : -1), dc = fromC === toC ? 0 : (toC > fromC ? 1 : -1);
        let steps = Math.max(Math.abs(toR - fromR), Math.abs(toC - fromC));
        for (let i = 1; i <= steps; i++) { if (board[fromR + dr * i][fromC + dc * i] !== null) return false; }
        return true;
    },

    getDamaJumpTarget(fromR, fromC, toR, toC, color, bState = null) {
        let board = bState || gameState.virtualBoard;
        if (!board) return null;
        
        if (fromR !== toR && fromC !== toC) return null;
        const colorChar = color[0];
        let dr = fromR === toR ? 0 : (toR > fromR ? 1 : -1), dc = fromC === toC ? 0 : (toC > fromC ? 1 : -1);
        let enemy = null; let steps = Math.max(Math.abs(toR - fromR), Math.abs(toC - fromC));
        
        for (let i = 1; i < steps; i++) {
            let p = board[fromR + dr * i][fromC + dc * i];
            if (p !== null) { 
                if (enemy !== null || p[0] === colorChar) return null; 
                enemy = { row: fromR + dr * i, col: fromC + dc * i }; 
            }
        }
        return enemy;
    },

    hasAnyMove(color, bState) {
        const colorChar = color[0];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                let p = bState[r][c];
                if (p && p[0] === colorChar) {
                    if (this.getPieceCapturePaths(r, c, color, bState).length > 0) return true; 
                    if (this.getPieceSimpleMoves(r, c, color, bState).length > 0) return true; 
                }
            }
        }
        return false; 
    },

    // 💡 تتبع التكرار لكل حجر على حدة
    trackPieceHistory(fromR, fromC, toR, toC, color) {
        if (!gameState.pieceHistories) gameState.pieceHistories = {};
        
        let tracker = gameState.pieceHistories[color];
        
        // إذا كان الحجر الذي يتحرك هو نفس الحجر الذي تحرك في الدور السابق
        if (tracker && tracker.r === fromR && tracker.c === fromC) {
            tracker.r = toR;
            tracker.c = toC;
            tracker.history.push(`${toR},${toC}`);
        } else {
            // ويجب ان يحذف التكرار ويصفر اذا قام بحركة اخرى (حجر مختلف)
            gameState.pieceHistories[color] = {
                r: toR,
                c: toC,
                history: [`${fromR},${fromC}`, `${toR},${toC}`]
            };
        }
    },

    // ==========================================
    // 💡 إصلاح نظام التعادل (50 حركة بدون أكل، أو حجر ضد حجر)
    // ==========================================
    checkIdleDraw(bState, currentTurn) {
        // 1. فحص التعادل 50 حركة بدون تقدم (أكل أو تحريك بيدق)
        if (gameState.movesWithoutProgress >= 50) return true;

        // 2. فحص التعادل "حجر ضد حجر" 
        let wCount = 0, bCount = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (bState[r][c]) {
                    if (bState[r][c][0] === 'w') wCount++;
                    else if (bState[r][c][0] === 'b') bCount++;
                }
            }
        }
        // إذا تبقى حجر أبيض واحد وحجر أسود واحد، نعلن التعادل فوراً
        if (wCount === 1 && bCount === 1) return true;

        return false;
    },

    // ==========================================
    // 💡 نظام المماطلة وتكرار الحركات لكل حجر
    // ==========================================
    checkRepetitionAndStalling() {
        if (gameState.movesWithoutProgress === 0) {
            gameState.pieceHistories = {};
            return 0;
        }

        if (!gameState.pieceHistories) return 0;
        
        let maxRep = 0;
        
        // نتحقق من التكرار لكل لاعب بناءً على الحجر الأخير الذي يحركه
        for (let color in gameState.pieceHistories) {
            let tracker = gameState.pieceHistories[color];
            let counts = {};
            
            // نحسب عدد المرات التي تواجد فيها هذا الحجر في نفس المربع
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
