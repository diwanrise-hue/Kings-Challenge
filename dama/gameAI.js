// gameAI.js
import { gameState } from './gameState.js';

let worker = null;

function getWorker() {
    if (!worker) {
        worker = new Worker(new URL('./aiWorker.js', import.meta.url), { type: 'module' });
    }
    return worker;
}

export const gameAI = {
    async getBestMoveAsync(virtualBoard, levelStr, aiColor, pieceDirection) {
        const aiWorker = getWorker();

        return new Promise((resolve) => {
            aiWorker.onmessage = function (e) {
                resolve(e.data.bestMove);
            };

            aiWorker.postMessage({
                virtualBoard,
                levelStr,
                aiColor,
                pieceDirection,
                pieceHistories: gameState.pieceHistories || null,
                movesWithoutProgress: gameState.movesWithoutProgress || 0
            });
        });
    }
};
