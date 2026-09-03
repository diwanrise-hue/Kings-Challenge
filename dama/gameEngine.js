/**
 * gameEngine.js (Client-Side)
 * النسخة المطابقة تماماً لمحرك السيرفر (game-logic.js) لضمان التوافق 100%
 * 🌟 (مُحدّث): نظام "التعادل الذكي" لإنهاء المطاردة المملة.
 * 🛡️ (مُحدّث أمني): منع تسجيل إحصائيات اللعب (فوز/خسارة) عند اللعب ضد البوت لحماية السجل!
 */

import { gameState } from './gameState.js'; 

export const gameEngine = {
    isValidPos(r, c) {
        return r >= 0 && r < 8 && c >= 0 && c < 8;
    },

    getPieceDirection(color, bState, roomDirectionData = null) {
        const baseColor = color.split('-')[0];
        if (roomDirectionData && roomDirectionData[baseColor] !== undefined) {
            return roomDirectionData[baseColor];
        } else if (gameState.pieceDirection && gameState.pieceDirection[baseColor] !== undefined) {
            return gameState.pieceDirection[baseColor];
        }
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

                        let isMidAirPromotion = false;
                        let promoRow = (dirY === 1) ? 7 : 0;
                        
                        if (toR === promoRow && !movingPiece.includes('dama')) {
                            movingPiece += '-dama';
                            isMidAirPromotion = true;
                        }

                        bState[midR][midC] = null;
                        bState[toR][toC] = movingPiece;
                        bState[r][c] = null;

                        const stepObj = { fromR: r, fromC: c, toR: toR, toC: toC, midR: midR, midC: midC };
                        const subPaths = this.getPieceCapturePaths(toR, toC, color, bState, dirY, dr, dc, roomDirectionData);

                        if (subPaths.length > 0) {
                            for (const sp of subPaths) paths.push([stepObj, ...sp]);
                        } else { paths.push([stepObj]); }

                        bState[r][c] = isMidAirPromotion ? movingPiece.replace('-dama', '') : movingPiece;
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
    const baseColor = color.split('-')[0];
    const dirY = this.getPieceDirection(baseColor, bState, roomDirectionData);

    // جمع قطع اللاعب مرة واحدة فقط
    const pieces = [];

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = bState[r][c];

            if (!piece || !piece.startsWith(baseColor)) continue;

            if (
                activeR !== null &&
                activeC !== null &&
                (r !== activeR || c !== activeC)
            ) {
                continue;
            }

            pieces.push({
                r,
                c,
                initDr: (r === activeR && c === activeC) ? activeDr : null,
                initDc: (r === activeR && c === activeC) ? activeDc : null
            });
        }
    }

    // البحث عن مسارات الأكل مع الاحتفاظ فقط بأطول المسارات
    let allCapturePaths = [];
    let maxJumps = 0;

    for (const piece of pieces) {
        const paths = this.getPieceCapturePaths(
            piece.r,
            piece.c,
            baseColor,
            bState,
            dirY,
            piece.initDr,
            piece.initDc,
            roomDirectionData
        );

        for (const path of paths) {
            if (path.length > maxJumps) {
                maxJumps = path.length;
                allCapturePaths = [path];
            } else if (path.length === maxJumps) {
                allCapturePaths.push(path);
            }
        }
    }

    // إذا يوجد أكل إجباري، نعيد فقط أطول سلاسل الأكل
    if (maxJumps > 0) {
        return allCapturePaths;
    }

    // لا يوجد أكل → النقلات العادية
    const allSimpleMoves = [];

    for (const piece of pieces) {
        allSimpleMoves.push(
            ...this.getPieceSimpleMoves(
                piece.r,
                piece.c,
                baseColor,
                bState,
                dirY
            )
        );
    }

    return allSimpleMoves;
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

    checkIdleDraw(bState, currentTurn, roomDirectionData = null) {
        if (gameState.movesWithoutProgress >= 50) return true;
        
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
            let moves = this.generateAllTurnMoves(currentTurn, bState, null, null, null, null, roomDirectionData);
            let hasCapture = moves.some(path => path.some(step => step.midR !== null && step.midR !== undefined));
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
        
        // 🌟 حماية السجل: إذا كان اللعب ضد البوت، لا تسجل أي إحصائيات!
        if (winnerColor !== 'draw' && !gameState.isBotOpponent) { 
            this.updateUserStats(winnerColor); 
        }
        
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
        // 🛑 أمان إضافي: خروج فوري إذا كان الخصم بوت
        if (gameState.isBotOpponent) return; 

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
