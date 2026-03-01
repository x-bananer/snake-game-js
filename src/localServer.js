import { tickGame, generateFood } from './gameEngine.js';

const CELL = 20;
const INITIAL_SPEED = 200;
const MIN_SPEED = 60;
const SPEED_STEP = 5;

let state;
let widthRef;
let heightRef;
let speed = INITIAL_SPEED;
let intervalId;
const listeners = new Set();

const notify = () => {
    listeners.forEach(cb => cb(state));
};

const startLoop = () => {
    intervalId = setInterval(() => {
        if (state.status !== 'running') return;

        state = tickGame(state, widthRef, heightRef);

        notify();

        if (state.status !== 'running') {
            clearInterval(intervalId);
            return;
        }

        const totalScore = state.scores.p1 + state.scores.p2;
        speed = Math.max(MIN_SPEED, INITIAL_SPEED - totalScore * SPEED_STEP);

        clearInterval(intervalId);
        startLoop();

    }, speed);
};

export const initServer = (width, height) => {
    widthRef = width;
    heightRef = height;

    state = {
        snakes: {
            p1: [{ x: CELL, y: CELL }],
            p2: [{ x: width - CELL * 2, y: height - CELL * 2 }]
        },
        directions: {
            p1: 'RIGHT',
            p2: 'LEFT'
        },
        food: generateFood(width, height),
        scores: {
            p1: 0,
            p2: 0
        },
        status: 'running',
        winner: null
    };

    notify();
    startLoop();
};

export const subscribe = cb => {
    listeners.add(cb);
    return () => listeners.delete(cb);
};

export const sendInput = (player, direction) => {
    const current = state.directions[player];

    if (direction === 'DOWN' && current !== 'UP') state.directions[player] = 'DOWN';
    if (direction === 'UP' && current !== 'DOWN') state.directions[player] = 'UP';
    if (direction === 'RIGHT' && current !== 'LEFT') state.directions[player] = 'RIGHT';
    if (direction === 'LEFT' && current !== 'RIGHT') state.directions[player] = 'LEFT';
};

export const restartGame = () => {
    state = {
        snakes: {
            p1: [{ x: CELL, y: CELL }],
            p2: [{ x: widthRef - CELL * 2, y: heightRef - CELL * 2 }]
        },
        directions: {
            p1: 'RIGHT',
            p2: 'LEFT'
        },
        food: generateFood(widthRef, heightRef),
        scores: {
            p1: 0,
            p2: 0
        },
        status: 'running',
        winner: null
    };

    notify();
    clearInterval(intervalId);
    startLoop();
};

export const stopServer = () => {
    clearInterval(intervalId);
};
