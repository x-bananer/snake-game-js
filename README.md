# Multiplayer Snake Game

Realtime multiplayer Snake game built with React and Node.js.  
Two players connect to the same session and compete in real time.

## Link
https://multiplayer-snake-game-js.vercel.app

## Tech Stack

Frontend:
- React
- Vite
- HTML5 Canvas

Backend:
- Node.js
- WebSocket

## Features

- Realtime multiplayer gameplay
- Two-player competitive mode
- Live score tracking
- Server-authoritative game state
- Collision detection (walls, self, opponent)
- Restartable game session

## How It Works

The frontend renders the board using Canvas.

The backend:
- maintains authoritative game state
- processes player input
- updates snake positions
- checks collisions
- broadcasts updated state to all connected clients

All movement and scoring logic runs on the server to prevent desynchronization.

## Installation

Clone the repository:

git clone https://github.com/your-username/multiplayer-snake.git  

### Frontend

npm install  
npm run dev  

Runs on: http://localhost:5173

### Backend

cd backend  
npm install  
node index.js  

Runs on: http://localhost:3000