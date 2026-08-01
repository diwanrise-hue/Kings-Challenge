/**
 * gameEngine.js
 * النسخة المحسنة والخالية من الثغرات: تم إصلاح معمارية الدامة للـ Worker، 
 * وتسريع الفحص (Performance Boost)، وضبط استنتاج اتجاه القطع في النهايات (Endgame).
 * - (جديد) دعم كشف المماطلة والتعادل التلقائي.
 */

import { gameState } from './gameState.js'; 
import { ui } from './uiController.js'; 

let workerCachedDirections = null;

export const gameEngine = {
    
    setWorkerDirections(directions) {
        workerCachedDirections = directions;
    },

    getPieceDirection(color, bState) {
        const baseColor = color.split('-')[0];
        
        if (typeof window !== 'undefined' && window.gameState && window.gameState.pieceDirection) {
            if (window.gameState.pieceDirection[baseColor]) {
                return window.gameState.pieceDirection[baseColor];
            }
        }

        if (workerCachedDirections && workerCachedDirections[baseColor]) {
            return workerCachedDirections[baseColor];
        }

        if (bState) {
            let wSumRow = 0, wCount = 0;
            let bSumRow = 0, bCount = 0;
            
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    let p = bState[r][c];
                    if (p) {
                        if (p.startsWith('white')) { wSumRow += r; wCount++; }
                        else if (p.startsWith('black')) { bSumRow += r; bCount++; }
                    }
                }
            }
            
            if (wCount > 0 && bCount > 0) {
                let wAvg = wSumRow / wCount;
                let bAvg = bSumRow / bCount;
                
                let wDir = wAvg < bAvg ? 1 : -1;
                let bDir = bAvg < wAvg ? 1 : -1;

                workerCachedDirections = { white: wDir, black: bDir };
                return workerCachedDirections[baseColor];
            }
        }

        return baseColor === 'black' ? 1 : -1;
    },

    computeOnlineFlip(color) {
        return color === 'black'; 
    },

    getPieceCapturePaths(r, c, color, bState, parentDr = null, parentDc = null) {
        const baseColor = color.split('-')[0];
        let isDama = bState[r][c] && bState[r][c].endsWith('-dama');
        let paths = [];
        let dirY = this.getPieceDirection(baseColor, bState); 
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
                        if (piece === null) { 
                            step++; 
                            continue; 
                        }
                        else if (!piece.startsWith(baseColor)) { 
                            foundEnemy = piece; 
                            enemyR = nextR; 
                            enemyC = nextC; 
                            step++; 
                            continue; 
                        }
                        else break; 
                    } else {
                        if (piece === null) {
                            let capturedPiece = bState[enemyR][enemyC];
                            let movingPiece = bState[r][c];

                            bState[enemyR][enemyC] = null; 
                            bState[nextR][nextC] = movingPiece; 
                            bState[r][c] = null;

                            let stepObj = { fromR: r, fromC: c, toR: nextR, toC: nextC, midR: enemyR, midC: enemyC };
                            let subPaths = this.getPieceCapturePaths(nextR, nextC, color, bState, dr, dc);
                            
                            if (subPaths.length > 0) {
                                subPaths.forEach(sp => paths.push([stepObj, ...sp]));
                            } else {
                                paths.push([stepObj]);
                            }

                            bState[r][c] = movingPiece;
                            bState[nextR][nextC] = null;
                            bState[enemyR][enemyC] = capturedPiece;

                            step++; 
                            continue; 
                        } else break; 
                    }
                }
            } else {
                let midR = r + dr, midC = c + dc, toR = r + 2 * dr, toC = c + 2 * dc;
                if (toR >= 0 && toR < 8 && toC >= 0 && toC < 8) {
                    if (bState[midR][midC] && !bState[midR][midC].startsWith(baseColor) && bState[toR][toC] === null) {
                        let capturedPiece = bState[midR][midC];
                        let movingPiece = bState[r][c];

                        bState[midR][midC] = null; 
                        bState[toR][toC] = movingPiece; 
                        bState[r][c] = null;

                        let stepObj = { fromR: r, fromC: c, toR: toR, toC: toC, midR: midR, midC: midC };
                        let subPaths = this.getPieceCapturePaths(toR, toC, color, bState, dr, dc);
                        
                        if (subPaths.length > 0) {
                            subPaths.forEach(sp => paths.push([stepObj, ...sp]));
                        } else {
                            paths.push([stepObj]);
                        }

                        bState[r][c] = movingPiece;
                        bState[toR][toC] = null;
                        bState[midR][midC] = capturedPiece;
                    }
                }
            }
        }
        return paths;
    },

    getPieceSimpleMoves(r, c, color, bState) {
        const baseColor = color.split('-')[0];
        let isDama = bState[r][c] && bState[r][c].endsWith('-dama');
        let moves = [];
        let dirY = this.getPieceDirection(baseColor, bState); 
        let directions = isDama ? [[0,1], [0,-1], [1,0], [-1,0]] : [[dirY, 0], [0,1], [0,-1]];

        for (let [dr, dc] of directions) {
            if (isDama) {
                let step = 1;
                while (true) {
                    let toR = r + dr * step, toC = c + dc * step;
                    if (toR >= 0 && toR < 8 && toC >= 0 && toC < 8 && bState[toR][toC] === null) {
                        moves.push([{ fromR: r, fromC: c, toR: toR, toC: toC, midR: null, midC: null }]); 
                        step++;
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
        const baseColor = color.split('-')[0];
        
        bState.forEach((row, r) => row.forEach((piece, c) => {
            if (piece && piece.startsWith(baseColor) && (activeR === null || (r === activeR && c === activeC))) {
                this.getPieceCapturePaths(r, c, baseColor, bState, (r === activeR ? activeDr : null), (c === activeC ? activeDc : null)).forEach(p => {
                    if (p.length > maxJumps) maxJumps = p.length;
                    allCapturePaths.push(p);
                });
            }
        }));
        
        if (maxJumps > 0) return allCapturePaths.filter(p => p.length === maxJumps);
        if (activeR !== null && activeC !== null) return [];

        let allSimpleMoves = [];
        bState.forEach((row, r) => row.forEach((piece, c) => {
            if (piece && piece.startsWith(baseColor)) {
                allSimpleMoves.push(...this.getPieceSimpleMoves(r, c, baseColor, bState));
            }
        }));
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
        
        let last = path[path.length - 1];
        let fPiece = nextBoard[last.toR][last.toC];
        
        if (fPiece && !fPiece.includes('dama')) {
            let dirY = this.getPieceDirection(fPiece, nextBoard); 
            let promoRow = (dirY === 1) ? 7 : 0;
            if (last.toR === promoRow) {
                nextBoard[last.toR][last.toC] += '-dama';
            }
        }
        return nextBoard;
    },

    findMaxJumps(r, c, color, vBoard, initDr = null, initDc = null) {
        const paths = this.getPieceCapturePaths(r, c, color.split('-')[0], vBoard, initDr, initDc);
        return Math.max(0, ...paths.map(p => p.length));
    },

    isValidDamaMove(fromR, fromC, toR, toC, bState = null) {
        let board = bState || (typeof window !== 'undefined' && window.gameState ? window.gameState.virtualBoard : null);
        if (!board) return false;
        
        if (fromR !== toR && fromC !== toC) return false;
        let dr = fromR === toR ? 0 : (toR > fromR ? 1 : -1), dc = fromC === toC ? 0 : (toC > fromC ? 1 : -1);
        let steps = Math.max(Math.abs(toR - fromR), Math.abs(toC - fromC));
        for (let i = 1; i <= steps; i++) {
            if (board[fromR + dr * i][fromC + dc * i] !== null) return false;
        }
        return true;
    },

    getDamaJumpTarget(fromR, fromC, toR, toC, color, bState = null) {
        let board = bState || (typeof window !== 'undefined' && window.gameState ? window.gameState.virtualBoard : null);
        if (!board) return null;
        
        if (fromR !== toR && fromC !== toC) return null;
        const baseColor = color.split('-')[0];
        let dr = fromR === toR ? 0 : (toR > fromR ? 1 : -1), dc = fromC === toC ? 0 : (toC > fromC ? 1 : -1);
        let enemy = null;
        let steps = Math.max(Math.abs(toR - fromR), Math.abs(toC - fromC));
        for (let i = 1; i < steps; i++) {
            let p = board[fromR + dr * i][fromC + dc * i];
            if (p !== null) { 
                if (enemy !== null || p.startsWith(baseColor)) return null; 
                enemy = { row: fromR + dr * i, col: fromC + dc * i }; 
            }
        }
        return enemy;
    },

    hasAnyMove(color, bState) {
        const baseColor = color.split('-')[0];
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                let p = bState[r][c];
                if (p && p.startsWith(baseColor)) {
                    let captures = this.getPieceCapturePaths(r, c, baseColor, bState);
                    if (captures.length > 0) return true; 
                    
                    let moves = this.getPieceSimpleMoves(r, c, baseColor, bState);
                    if (moves.length > 0) return true; 
                }
            }
        }
        return false; 
    },

    // 💡 1. دالة فحص التعادل التلقائي (1 ضد 1 بدون أكل متاح)
    checkIdleDraw(bState, currentTurn) {
        let wCount = 0, bCount = 0;
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (bState[r][c]) {
                    if (bState[r][c].startsWith('white')) wCount++;
                    else if (bState[r][c].startsWith('black')) bCount++;
                }
            }
        }

        if (wCount === 1 && bCount === 1) {
            let captures = [];
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    if (bState[r][c] && bState[r][c].startsWith(currentTurn)) {
                        captures.push(...this.getPieceCapturePaths(r, c, currentTurn, bState));
                    }
                }
            }
            if (captures.length === 0) return true;
        }

        return false;
    },

    // 💡 2. دالة كشف المماطلة وتكرار الرقعة (Anti-Trolling)
    checkRepetitionAndStalling() {
        if (!gameState.boardHistoryStr) return 0;
        const currentStr = JSON.stringify(gameState.virtualBoard);
        let count = 1; 
        
        for (let str of gameState.boardHistoryStr) {
            if (str === currentStr) count++;
        }
        return count; 
    },

    checkGameOver(bState, isSimulation = false) {
        if (!this.hasAnyMove('white', bState)) {
            if (!isSimulation) this.endGame('black');
            return 'black';
        }
        
        if (!this.hasAnyMove('black', bState)) {
            if (!isSimulation) this.endGame('white');
            return 'white';
        }
        
        return null;
    },

    handleSurrender(surrenderingColor) {
        const winnerColor = (surrenderingColor === 'white') ? 'black' : 'white';
        this.endGame(winnerColor);
    },

    // 💡 3. تحديث دالة إنهاء اللعبة لتدعم حالة التعادل 'draw'
    endGame(winnerColor) {
        if (gameState.isUpdatingStats || gameState.statsUpdated) return;
        gameState.isUpdatingStats = true; 

        gameState.isGameOver = true;
        gameState.isGameActive = false;
        
        if (winnerColor !== 'draw') {
            this.updateUserStats(winnerColor);
        }
        
        gameState.statsUpdated = true;
        gameState.isUpdatingStats = false; 

        if (ui && typeof ui.showOnlineResultsModal === 'function') {
            ui.showOnlineResultsModal(winnerColor);
        } else if (ui && typeof ui.showResultsModal === 'function') {
            ui.showResultsModal(winnerColor);
        }

        if (gameState.isOnlineMode && gameState.onlineRoomID && window.socket) {
            window.socket.emit('matchEnded', { 
                roomID: String(gameState.onlineRoomID).trim(),
                winner: winnerColor 
            });
        }
    },

    updateUserStats(winnerColor) {
        if (ui && typeof ui.updateUserStats === 'function') {
            const myColor = gameState.myOnlineColor || gameState.playerColor;
            const isWinner = (winnerColor === myColor);
            ui.updateUserStats(isWinner);
        }
    },

    closeResultsMenu() {
        if (ui && typeof ui.hideOnlineResultsModal === 'function') {
            ui.hideOnlineResultsModal();
        } else if (ui && typeof ui.closeModal === 'function') {
            ui.closeModal();
        }
    },

    resetGame() {
        if (ui && typeof ui.initBoard === 'function') {
            ui.initBoard(); 
        }
        
        gameState.currentTurn = 'white';
        gameState.isGameOver = false;
        gameState.isGameActive = true; 
        gameState.statsUpdated = false; 
        gameState.isUpdatingStats = false; 
        gameState.selectedPiece = null;

        if (ui) {
            if (typeof ui.clearHighlights === 'function') ui.clearHighlights();
            if (typeof ui.hideOnlineResultsModal === 'function') ui.hideOnlineResultsModal();
        }
        console.log("[Game Engine] A fresh new game has been initialized successfully.");
    }
};

window.gameEngine = gameEngine;
