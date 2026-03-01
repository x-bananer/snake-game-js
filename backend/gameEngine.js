const CELL = 20;

export const generateFood = (width, height) => ({
    x: Math.floor(Math.random() * (width / CELL)) * CELL,
    y: Math.floor(Math.random() * (height / CELL)) * CELL
});

export const getNextHead = (snake, direction, width, height) => {
    const head = { ...snake[0] };

    if (direction === 'DOWN') head.y = head.y + CELL > height - CELL ? 0 : head.y + CELL;
    if (direction === 'UP') head.y = head.y - CELL < 0 ? height - CELL : head.y - CELL;
    if (direction === 'RIGHT') head.x = head.x + CELL > width - CELL ? 0 : head.x + CELL;
    if (direction === 'LEFT') head.x = head.x - CELL < 0 ? width - CELL : head.x - CELL;

    return head;
};

const checkSelfCollision = (snake, head) =>
    snake.some(segment => segment.x === head.x && segment.y === head.y);

const checkCrossCollision = (snakeA, snakeB, headA, headB) => {
    const hitOther1 = snakeB.some(segment => segment.x === headA.x && segment.y === headA.y);
    const hitOther2 = snakeA.some(segment => segment.x === headB.x && segment.y === headB.y);
    const headOn = headA.x === headB.x && headA.y === headB.y;
    return hitOther1 || hitOther2 || headOn;
};

export const tickGame = (state, width, height) => {
    const next1 = getNextHead(state.snakes.p1, state.directions.p1, width, height);
    const next2 = getNextHead(state.snakes.p2, state.directions.p2, width, height);

    if (
        checkSelfCollision(state.snakes.p1, next1) ||
        checkSelfCollision(state.snakes.p2, next2) ||
        checkCrossCollision(state.snakes.p1, state.snakes.p2, next1, next2)
    ) {
        return { ...state, status: 'gameover' };
    }

    const ate1 = next1.x === state.food.x && next1.y === state.food.y;
    const ate2 = next2.x === state.food.x && next2.y === state.food.y;

    let snake1 = [next1, ...state.snakes.p1];
    let snake2 = [next2, ...state.snakes.p2];

    if (!ate1) snake1.pop();
    if (!ate2) snake2.pop();

    const newScores = {
        p1: ate1 ? state.scores.p1 + 1 : state.scores.p1,
        p2: ate2 ? state.scores.p2 + 1 : state.scores.p2
    };

    const winner = newScores.p1 >= 21
        ? 'p1'
        : newScores.p2 >= 21
        ? 'p2'
        : null;

    let newFood = state.food;

    if (ate1 || ate2) {
        let candidate;
        let collision;

        do {
            candidate = generateFood(width, height);
            collision =
                snake1.some(s => s.x === candidate.x && s.y === candidate.y) ||
                snake2.some(s => s.x === candidate.x && s.y === candidate.y);
        } while (collision);

        newFood = candidate;
    }

    return {
        ...state,
        snakes: {
            p1: snake1,
            p2: snake2
        },
        food: newFood,
        scores: newScores,
        status: winner ? 'finished' : state.status,
        winner
    };
};