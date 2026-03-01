import React, { useRef, useEffect, useState } from 'react';

const CELL = 20;
const BOARD_SIZE = 380;

const Canvas = () => {
    const canvasRef = useRef(null);
    const socketRef = useRef(null);
    const [uiState, setUiState] = useState(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        socketRef.current = new WebSocket(
            import.meta.env.DEV
                ? 'ws://localhost:3000'
                : 'wss://snake-game-js-tamu.onrender.com'
        );
        const socket = socketRef.current;

        let myPlayer = null;

        socket.onopen = () => console.log('WS connected');
        socket.onerror = (e) => console.log('WS error', e);
        socket.onclose = () => console.log('WS closed');

        let gameState;

        const drawBackground = () => {
            ctx.fillStyle = '#111827';
            ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);
        };

        const drawFood = () => {
            ctx.fillStyle = '#FACC15';
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

        const drawScores = () => {
            ctx.fillStyle = 'white';
            ctx.font = 'bold 16px Verdana';
            ctx.textAlign = 'left';
            ctx.fillText(`P1: ${gameState.scores.p1}`, 10, 20);

            ctx.textAlign = 'right';
            ctx.fillText(`P2: ${gameState.scores.p2}`, BOARD_SIZE - 10, 20);
        };

        const render = () => {
            if (!gameState) return;
            drawBackground();
            drawFood();
            drawSnake(gameState.snakes.p1, '#10B981');
            drawSnake(gameState.snakes.p2, '#F43F5E');
            drawScores();
        };

        socket.onmessage = event => {
            const data = JSON.parse(event.data);

            if (data.type === 'role') {
                myPlayer = data.player;
                return;
            }

            if (data.type === 'state') {
                gameState = data.payload;
                render();

                if (gameState.status === 'gameover' || gameState.status === 'finished') {
                    setUiState(gameState);
                }
            }
        };

        const send = (player, direction) => {
            if (!socket || socket.readyState !== 1) return;
            socket.send(JSON.stringify({
                type: 'input',
                player,
                direction
            }));
        };

        const handleKeyDown = e => {
            if (!gameState || gameState.status !== 'running') return;
            if (!myPlayer) return;

            if (e.key === 'ArrowDown') send(myPlayer, 'DOWN');
            if (e.key === 'ArrowUp') send(myPlayer, 'UP');
            if (e.key === 'ArrowRight') send(myPlayer, 'RIGHT');
            if (e.key === 'ArrowLeft') send(myPlayer, 'LEFT');
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            socket.close();
        };

    }, []);

    const handleRestart = () => {
        setUiState(null);
        const socket = socketRef.current;
        if (socket && socket.readyState === 1) {
            socket.send(JSON.stringify({ type: 'restart' }));
        }
    };

    return (
        <div style={{ position: 'relative', width: BOARD_SIZE, height: BOARD_SIZE }}>
            <canvas ref={canvasRef} width={BOARD_SIZE} height={BOARD_SIZE} />
            {uiState && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.6)',
                    color: 'white',
                   
                }}>
                    <div style={{
                        marginBottom: '16px',
                        font: 'bold 24px Verdana',
                        color: '#FACC15',
                    }}>
                        {uiState.status === 'finished'
                            ? `Winner: ${uiState.winner}`
                            : 'Game Over'}
                    </div>
                    <button onClick={handleRestart}>
                        New Game
                    </button>
                </div>
            )}
        </div>
    );
};

export default Canvas;