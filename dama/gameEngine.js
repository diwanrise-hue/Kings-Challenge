// gameEngine.js
import { gameState } from './main.js';
import { ui } from './uiController.js'; 

export const gameEngine = {
    // دالة ذكية لتحديد اتجاه اللعب بناءً على النمط (أونلاين/أوفلاين) لتجنب الحركات العكسية
    getPieceDirection(color) {
        const baseColor = color.split('-')[0];
        
        // في وضع الأونلاين (مع السيرفر): الأسود دائماً يهبط (+1) والأبيض يصعد (-1)
        if (gameState && gameState.isOnlineMode) {
            return baseColor === 'black' ? 1 : -1;
        }
        
        // في وضع الأوفلاين (اللعب المحلي): لون اللاعب دائماً يصعد من الأسفل (-1)، والخصم يهبط (+1)
        if (gameState && gameState.playerColor) {
            return baseColor === gameState.playerColor ? -1 : 1;
        }
        
        // بديل آمن لتشغيل الكود داخل الـ Web Workers (الذكاء الاصطناعي)
        if (gameState && gameState.pieceDirection && gameState.pieceDirection[baseColor]) {
            return gameState.pieceDirection[baseColor];
        }
        
        return baseColor === 'black' ? 1 : -1;
    },

    computeOnlineFlip(color) {
        let topCount = 0, bottomCount = 0;
        if (gameState && gameState.virtualBoard) {
            gameState.virtualBoard.forEach((row, r) => row.forEach(cell => {
                if (cell && cell.startsWith(color)) r < 4 ? topCount++ : bottomCount++;
            }));
        }
        return topCount > bottomCount;
    },

    getPieceCapturePaths(r, c, color, bState, parentDr = null, parentDc = null) {
        let isDama = bState[r][c] && bState[r][c].endsWith('-dama');
        let paths = [];
        let dirY = this.getPieceDirection(color);
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
                        else if (!piece.startsWith(color.split('-')[0])) { foundEnemy = piece; enemyR = nextR; enemyC = nextC; step++; continue; }
                        else break;
                    } else {
                        if (piece === null) {
                            let nextBoard = bState.map(row => [...row]);
                            nextBoard[enemyR][enemyC] = null; 
                            nextBoard[nextR][nextC] = bState[r][c]; 
                            nextBoard[r][c] = null;
                            let stepObj = { fromR: r, fromC: c, toR: nextR, toC: nextC, midR: enemyR, midC: enemyC };
                            let subPaths = this.getPieceCapturePaths(nextR, nextC, color, nextBoard, dr, dc);
                            if (subPaths.length > 0) {
                                subPaths.forEach(sp => paths.push([stepObj, ...sp]));
                            } else {
                                paths.push([stepObj]);
                            }
                            break; 
                        } else break;
                    }
                }
            } else {
                let midR = r + dr, midC = c + dc, toR = r + 2 * dr, toC = c + 2 * dc;
                if (toR >= 0 && toR < 8 && toC >= 0 && toC < 8) {
                    if (bState[midR][midC] && !bState[midR][midC].startsWith(color.split('-')[0]) && bState[toR][toC] === null) {
                        let nextBoard = bState.map(row => [...row]);
                        nextBoard[midR][midC] = null; 
                        nextBoard[toR][toC] = bState[r][c]; 
                        nextBoard[r][c] = null;
                        let stepObj = { fromR: r, fromC: c, toR: toR, toC: toC, midR: midR, midC: midC };
                        let subPaths = this.getPieceCapturePaths(toR, toC, color, nextBoard, dr, dc);
                        if (subPaths.length > 0) {
                            subPaths.forEach(sp => paths.push([stepObj, ...sp]));
                        } else {
                            paths.push([stepObj]);
                        }
                    }
                }
            }
        }
        return paths;
    },

    getPieceSimpleMoves(r, c, color, bState) {
        let isDama = bState[r][c] && bState[r][c].endsWith('-dama');
        let moves = [];
        let dirY = this.getPieceDirection(color);
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
        
        let last = path[path.length - 1], fPiece = nextBoard[last.toR][last.toC];
        if (fPiece && !fPiece.includes('dama')) {
            let dirY = this.getPieceDirection(fPiece);
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

    isValidDamaMove(fromR, fromC, toR, toC) {
        if (fromR !== toR && fromC !== toC) return false;
        let dr = fromR === toR ? 0 : (toR > fromR ? 1 : -1), dc = fromC === toC ? 0 : (toC > fromC ? 1 : -1);
        let steps = Math.max(Math.abs(toR - fromR), Math.abs(toC - fromC));
        for (let i = 1; i <= steps; i++) {
            if (gameState.virtualBoard[fromR + dr * i][fromC + dc * i] !== null) return false;
        }
        return true;
    },

    getDamaJumpTarget(fromR, fromC, toR, toC, color) {
        if (fromR !== toR && fromC !== toC) return null;
        const baseColor = color.split('-')[0];
        let dr = fromR === toR ? 0 : (toR > fromR ? 1 : -1), dc = fromC === toC ? 0 : (toC > fromC ? 1 : -1);
        let enemy = null;
        let steps = Math.max(Math.abs(toR - fromR), Math.abs(toC - fromC));
        for (let i = 1; i < steps; i++) {
            let p = gameState.virtualBoard[fromR + dr * i][fromC + dc * i];
            if (p !== null) { 
                if (enemy !== null || p.startsWith(baseColor)) return null; 
                enemy = { row: fromR + dr * i, col: fromC + dc * i }; 
            }
        }
        return enemy;
    },

    checkGameOver(bState, isSimulation = false) {
        let whiteMoves = this.generateAllTurnMoves('white', bState).length;
        let blackMoves = this.generateAllTurnMoves('black', bState).length;

        if (whiteMoves === 0) {
            if (!isSimulation) this.endGame('black');
            return 'black';
        }
        if (blackMoves === 0) {
            if (!isSimulation) this.endGame('white');
            return 'white';
        }
        return null;
    },

    handleSurrender(surrenderingColor) {
        const winnerColor = (surrenderingColor === 'white') ? 'black' : 'white';
        this.endGame(winnerColor);
    },

    endGame(winnerColor) {
        if (gameState.isUpdatingStats || gameState.statsUpdated) return;
        gameState.isUpdatingStats = true; 

        gameState.isGameOver = true;
        gameState.isGameActive = false;
        
        this.updateUserStats(winnerColor);
        
        gameState.statsUpdated = true;
        gameState.isUpdatingStats = false; 

        if (ui && typeof ui.showOnlineResultsModal === 'function') {
            ui.showOnlineResultsModal(winnerColor);
        } else if (ui && typeof ui.showResultsModal === 'function') {
            ui.showResultsModal(winnerColor);
        }

        if (gameState.isOnlineMode && gameState.onlineRoomID && window.socket) {
            window.socket.emit('matchEnded', { roomID: gameState.onlineRoomID });
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
    }
};

window.gameEngine = gameEngine;
