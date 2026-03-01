import { useRef, useEffect } from 'react';

const CELL = 20;
const INITIAL_SPEED = 200;
const MIN_SPEED = 60;
const SPEED_STEP = 5;

const generateFood = (width, height) => ({
    x: Math.floor(Math.random() * (width / CELL)) * CELL,
    y: Math.floor(Math.random() * (height / CELL)) * CELL
});

const getNextHead = (snake, direction, width, height) => {
    const head = { ...snake[0] };

    if (direction === 'DOWN') head.y = head.y + CELL > height - CELL ? 0 : head.y + CELL;
    if (direction === 'UP') head.y = head.y - CELL < 0 ? height - CELL : head.y - CELL;
    if (direction === 'RIGHT') head.x = head.x + CELL > width - CELL ? 0 : head.x + CELL;
    if (direction === 'LEFT') head.x = head.x - CELL < 0 ? width - CELL : head.x - CELL;

    return head;
};

const checkSelfCollision = (snake, head) =>
    snake.some(segment => segment.x === head.x && segment.y === head.y);

const tickGame = (state, width, height) => {
    const next1 = getNextHead(state.snakes.p1, state.directions.p1, width, height);
    const next2 = getNextHead(state.snakes.p2, state.directions.p2, width, height);

    if (checkSelfCollision(state.snakes.p1, next1) || checkSelfCollision(state.snakes.p2, next2)) {
        return { ...state, status: 'gameover' };
    }

    const ate1 = next1.x === state.food.x && next1.y === state.food.y;
    const ate2 = next2.x === state.food.x && next2.y === state.food.y;

    let snake1 = [next1, ...state.snakes.p1];
    let snake2 = [next2, ...state.snakes.p2];

    if (!ate1) snake1.pop();
    if (!ate2) snake2.pop();

    return {
        ...state,
        snakes: {
            p1: snake1,
            p2: snake2
        },
        food: ate1 || ate2 ? generateFood(width, height) : state.food,
        scores: {
            p1: ate1 ? state.scores.p1 + 1 : state.scores.p1,
            p2: ate2 ? state.scores.p2 + 1 : state.scores.p2
        }
    };
};

const Canvas = ({ width, height }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        let intervalId;
        let speed = INITIAL_SPEED;

        let gameState = {
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
            status: 'running'
        };

        const drawBackground = () => {
            ctx.fillStyle = '#FFCE1B';
            ctx.fillRect(0, 0, width, height);
        };

        const drawFood = () => {
            ctx.fillStyle = '#FF00FF';
            ctx.beginPath();
            ctx.arc(
                gameState.food.x + CELL / 2,
                gameState.food.y + CELL / 2,
                CELL / 2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        };

        const drawSnake = (snake, color) => {
            ctx.fillStyle = color;
            snake.forEach(segment => {
                ctx.beginPath();
                ctx.roundRect(segment.x, segment.y, CELL, CELL, 4);
                ctx.fill();
            });
        };

        const render = () => {
            drawBackground();
            drawFood();
            drawSnake(gameState.snakes.p1, '#00674F');
            drawSnake(gameState.snakes.p2, '#0033AA');
        };

        const loop = () => {
            if (gameState.status !== 'running') return;

            gameState = tickGame(gameState, width, height);

            if (gameState.status === 'gameover') {
                clearInterval(intervalId);
                alert('Game Over');
                reset();
                return;
            }

            const totalScore = gameState.scores.p1 + gameState.scores.p2;
            speed = Math.max(MIN_SPEED, INITIAL_SPEED - totalScore * SPEED_STEP);
            clearInterval(intervalId);
            start();

            render();
        };

        const start = () => {
            intervalId = setInterval(loop, speed);
        };

        const reset = () => {
            gameState = {
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
                status: 'running'
            };
            speed = INITIAL_SPEED;
            start();
        };

        const handleKeyDown = e => {
            const d1 = gameState.directions.p1;
            const d2 = gameState.directions.p2;

            if (e.key === 'ArrowDown' && d1 !== 'UP') gameState.directions.p1 = 'DOWN';
            if (e.key === 'ArrowUp' && d1 !== 'DOWN') gameState.directions.p1 = 'UP';
            if (e.key === 'ArrowRight' && d1 !== 'LEFT') gameState.directions.p1 = 'RIGHT';
            if (e.key === 'ArrowLeft' && d1 !== 'RIGHT') gameState.directions.p1 = 'LEFT';

            if (e.key === 's' && d2 !== 'UP') gameState.directions.p2 = 'DOWN';
            if (e.key === 'w' && d2 !== 'DOWN') gameState.directions.p2 = 'UP';
            if (e.key === 'd' && d2 !== 'LEFT') gameState.directions.p2 = 'RIGHT';
            if (e.key === 'a' && d2 !== 'RIGHT') gameState.directions.p2 = 'LEFT';
        };

        render();
        start();

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            clearInterval(intervalId);
        };

    }, [width, height]);

    return <canvas ref={canvasRef} width={width} height={height} />;
};

export default Canvas;