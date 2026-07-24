// gameEngine.js
import { gameState } from './main.js';
import { ui } from './uiController.js'; 

let workerCachedDirections = null;

export const gameEngine = {
    // دالة الاكتشاف الديناميكي: تعثر على اتجاه الأحجار الصحيح حتى داخل الـ Web Worker المنعزل!
    getPieceDirection(color, bState) {
        const baseColor = color.split('-')[0];
        
        // 1. إذا كنا في الملف الرئيسي والاتجاهات محفوظة ومضمونة
        if (typeof window !== 'undefined' && window.gameState && window.gameState.pieceDirection) {
            if (window.gameState.pieceDirection[baseColor]) {
                return window.gameState.pieceDirection[baseColor];
            }
        }

        // 2. إذا كنا داخل الـ Web Worker: نكتشف الاتجاه بقراءة الرقعة مباشرة
        if (bState) {
            let wTop = 0, wBot = 0, bTop = 0, bBot = 0;
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    let p = bState[r][c];
                    if (p) {
                        if (p.startsWith('white')) { r < 4 ? wTop++ : wBot++; }
                        else if (p.startsWith('black')) { r < 4 ? bTop++ : bBot++; }
                    }
                }
            }
            
            // في بداية اللعبة (الأحجار كثيرة)، نقوم بتحديد وحفظ الاتجاه الصحيح للونين
            if (wTop + wBot > 10 || bTop + bBot > 10) {
                let wDir = -1, bDir = 1; // الافتراضي
                
                if (wTop > wBot) { wDir = 1; bDir = -1; }
                else if (wBot > wTop) { wDir = -1; bDir = 1; }
                else if (bTop > bBot) { bDir = 1; wDir = -1; }
                else if (bBot > bTop) { bDir = -1; wDir = 1; }

                workerCachedDirections = { white: wDir, black: bDir };
            }
        }

        // 3. قراءة الاتجاه من الذاكرة المؤقتة للعامل
        if (workerCachedDirections && workerCachedDirections[baseColor]) {
            return workerCachedDirections[baseColor];
        }

        // 4. خطة بديلة أخيرة
        return baseColor === 'black' ? 1 : -1;
    },

    computeOnlineFlip(color) {
        let topCount = 0, bottomCount = 0;
        if(gameState && gameState.virtualBoard) {
            gameState.virtualBoard.forEach((row, r) => row.forEach(cell => {
                if (cell && cell.startsWith(color)) r < 4 ? topCount++ : bottomCount++;
            }));
        }
        return topCount > bottomCount;
    },

    // دالة الافتراس المُحسّنة (تم استبدال نسخ المصفوفة بـ Backtracking)
    getPieceCapturePaths(r, c, color, bState, parentDr = null, parentDc = null) {
        const baseColor = color.split('-')[0];
        let piece = bState[r][c];
        if (!piece) return [];
        let isDama = piece.endsWith('-dama');
        let paths = [];
        let dirY = this.getPieceDirection(baseColor, bState); // استدعاء ذكي
        let directions = isDama ? [[0,1], [0,-1], [1,0], [-1,0]] : [[dirY, 0], [0,1], [0,-1]];

        for (let [dr, dc] of directions) {
            if (isDama && parentDr !== null && parentDc !== null && dr === -parentDr && dc === -parentDc) continue;
            if (isDama) {
                let step = 1, foundEnemy = null, enemyR = -1, enemyC = -1;
                while (true) {
                    let nextR = r + dr * step, nextC = c + dc * step;
                    if (nextR < 0 || nextR >= 8 || nextC < 0 || nextC >= 8) break;
                    let p = bState[nextR][nextC];
                    if (!foundEnemy) {
                        if (p === null) { step++; continue; }
                        else if (!p.startsWith(baseColor)) { foundEnemy = p; enemyR = nextR; enemyC = nextC; step++; continue; }
                        else break;
                    } else {
                        if (p === null) {
                            // --- تقنية الـ Backtracking (تطبيق الحركة ثم التراجع) ---
                            bState[r][c] = null;
                            bState[enemyR][enemyC] = null;
                            bState[nextR][nextC] = piece;

                            let stepObj = { fromR: r, fromC: c, toR: nextR, toC: nextC, midR: enemyR, midC: enemyC };
                            let subPaths = this.getPieceCapturePaths(nextR, nextC, color, bState, dr, dc);

                            // التراجع عن الحركة لإعادة اللوحة لحالتها الأصلية
                            bState[r][c] = piece;
                            bState[enemyR][enemyC] = foundEnemy;
                            bState[nextR][nextC] = null;
                            // ----------------------------------------------------

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
                    let midPiece = bState[midR][midC];
                    if (midPiece && !midPiece.startsWith(baseColor) && bState[toR][toC] === null) {
                        // --- تقنية الـ Backtracking ---
                        bState[r][c] = null;
                        bState[midR][midC] = null;
                        bState[toR][toC] = piece;

                        let stepObj = { fromR: r, fromC: c, toR: toR, toC: toC, midR: midR, midC: midC };
                        let subPaths = this.getPieceCapturePaths(toR, toC, color, bState, dr, dc);

                        // التراجع عن الحركة
                        bState[r][c] = piece;
                        bState[midR][midC] = midPiece;
                        bState[toR][toC] = null;
                        // ------------------------------

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
        const baseColor = color.split('-')[0];
        let isDama = bState[r][c] && bState[r][c].endsWith('-dama');
        let moves = [];
        let dirY = this.getPieceDirection(baseColor, bState); // استدعاء ذكي
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

    // دالة توليد الحركات المُحسّنة (بإضافة Early Pruning وحلقات أسرع)
    generateAllTurnMoves(color, bState, activeR = null, activeC = null, activeDr = null, activeDc = null) {
        let allCapturePaths = [];
        let maxJumps = 0;
        const baseColor = color.split('-')[0];
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                let piece = bState[r][c];
                if (piece && piece.startsWith(baseColor) && (activeR === null || (r === activeR && c === activeC))) {
                    let paths = this.getPieceCapturePaths(r, c, baseColor, bState, (r === activeR ? activeDr : null), (c === activeC ? activeDc : null));
                    for (let i = 0; i < paths.length; i++) {
                        let len = paths[i].length;
                        if (len > maxJumps) maxJumps = len;
                        allCapturePaths.push(paths[i]);
                    }
                }
            }
        }
        
        // التصفية المبكرة: إذا وجد أكل إجباري، لا داعي لاحتساب الحركات العادية
        if (maxJumps > 0) return allCapturePaths.filter(p => p.length === maxJumps);
        if (activeR !== null && activeC !== null) return [];

        let allSimpleMoves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                let piece = bState[r][c];
                if (piece && piece.startsWith(baseColor)) {
                    allSimpleMoves.push(...this.getPieceSimpleMoves(r, c, baseColor, bState));
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
        
        let last = path[path.length - 1];
        let fPiece = nextBoard[last.toR][last.toC];
        
        if (fPiece && !fPiece.includes('dama')) {
            let dirY = this.getPieceDirection(fPiece, nextBoard); // ترقية مبنية على الاتجاه الجديد
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
        console.log("[Game Engine] A fresh new game has been initialized successfully.");
    }
};

window.gameEngine = gameEngine;
