import { WebSocketServer } from 'ws';
import { tickGame, generateFood } from './gameEngine.js';

const BOARD_SIZE = 380;

const PORT = process.env.PORT || 3000;
const CELL = 20;
const INITIAL_SPEED = 200;
const MIN_SPEED = 60;
const SPEED_STEP = 5;

const wss = new WebSocketServer({ port: PORT });

let width = BOARD_SIZE;
let height = BOARD_SIZE;
let speed = INITIAL_SPEED;
let intervalId;

let state;

const clients = new Set();

const broadcast = () => {
    const data = JSON.stringify({ type: 'state', payload: state });
    clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(data);
        }
    });
};

const startGame = () => {
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
        scores: { p1: 0, p2: 0 },
        status: 'running',
        winner: null
    };

    speed = INITIAL_SPEED;
    clearInterval(intervalId);
    intervalId = setInterval(loop, speed);
};

const loop = () => {
    if (!state || state.status !== 'running') return;

    state = tickGame(state, width, height);

    broadcast();

    if (state.status !== 'running') {
        clearInterval(intervalId);
        return;
    }

    const totalScore = state.scores.p1 + state.scores.p2;
    const newSpeed = Math.max(MIN_SPEED, INITIAL_SPEED - totalScore * SPEED_STEP);

    if (newSpeed !== speed) {
        speed = newSpeed;
        clearInterval(intervalId);
        intervalId = setInterval(loop, speed);
    }
};

wss.on('connection', ws => {
    clients.add(ws);

    const playerId = clients.size === 1 ? 'p1' : 'p2';

    ws.send(JSON.stringify({
        type: 'role',
        player: playerId
    }));

    ws.send(JSON.stringify({ type: 'state', payload: state }));

    ws.on('message', message => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'input') {
                const { player, direction } = data;
                const current = state.directions[player];

                if (direction === 'DOWN' && current !== 'UP') state.directions[player] = 'DOWN';
                if (direction === 'UP' && current !== 'DOWN') state.directions[player] = 'UP';
                if (direction === 'RIGHT' && current !== 'LEFT') state.directions[player] = 'RIGHT';
                if (direction === 'LEFT' && current !== 'RIGHT') state.directions[player] = 'LEFT';
            }

            if (data.type === 'restart') {
                startGame();
                broadcast();
            }
        } catch (e) {}
    });

    ws.on('close', () => {
        clients.delete(ws);
    });
});

startGame();
broadcast();

console.log(`Server running on port ${PORT}`);