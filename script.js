const grid = document.getElementById('grid');
const startBtn = document.getElementById('start-btn');
const statusText = document.getElementById('status');

let gameSequence = [];
let currentSequence = [];
let playerSequence = [];
let level = 0;
let isPlayingSequence = false;
let gameActive = false;
let gameTimeouts = []; 

const images = [
    'img1.jpg', 'img2.jpg', 'img3.jpg', 
    'img4.jpg', 'img5.jpg', 'img6.jpg', 
    'img7.jpg', 'img8.jpg', 'img9.jpg'
];

for (let i = 0; i < 9; i++) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.index = i;
    card.innerHTML = `
        <div class="card-face card-back"></div>
        <div class="card-face card-front">
            <img src="${images[i]}" alt="card-${i}">
        </div>
    `;
    card.addEventListener('click', () => handleCardClick(i));
    grid.appendChild(card);
}

startBtn.addEventListener('click', startGame);

function clearAllGameStates() {
    gameActive = false;
    isPlayingSequence = false;
    gameTimeouts.forEach(t => clearTimeout(t));
    gameTimeouts = [];
    statusText.classList.remove('your-turn');
}

function startGame() {
    clearAllGameStates(); 
    
    closeAllCards();
    
    setTimeout(() => {
        level = 0;
        gameSequence = [0, 1, 2, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5);
        currentSequence = [];
        playerSequence = [];
        gameActive = true;
        
        startBtn.innerText = "Restart";
        statusText.innerText = "Let's Start";
        nextLevel();
    }, 300);
}

async function nextLevel() {
    if (!gameActive) return;

    if (level >= 9) {
        statusText.innerText = "Congrats!";
        gameActive = false;
        return;
    }

    closeAllCards();
    await new Promise(r => {
        const t = setTimeout(r, 800);
        gameTimeouts.push(t);
    });

    if (!gameActive) return;

    playerSequence = [];
    level++;
    statusText.innerText = `${level}/9`;
    statusText.classList.remove('your-turn');
    
    currentSequence.push(gameSequence[level - 1]);
    playSequence();
}

async function playSequence() {
    isPlayingSequence = true;
    
    await new Promise(r => {
        const t = setTimeout(r, 500);
        gameTimeouts.push(t);
    });

    for (let index of currentSequence) {
        if (!gameActive) return; 
        await flashCard(index);
    }
    
    if (gameActive) {
        isPlayingSequence = false;
        statusText.innerText = "Your turn!";
        statusText.classList.add('your-turn');
    }
}

function flashCard(index) {
    return new Promise(resolve => {
        if (!gameActive) return resolve();
        
        const cards = document.querySelectorAll('.card');
        const card = cards[index];
        
        card.classList.add('active');
        
        const t1 = setTimeout(() => {
            if (gameActive) card.classList.remove('active');
            const t2 = setTimeout(resolve, 400);
            gameTimeouts.push(t2);
        }, 1000);
        gameTimeouts.push(t1);
    });
}

function handleCardClick(index) {
    if (isPlayingSequence || !gameActive) return;

    const cards = document.querySelectorAll('.card');
    if (cards[index].classList.contains('active')) return;

    playerSequence.push(index);
    cards[index].classList.add('active');

    const step = playerSequence.length - 1;
    
    if (playerSequence[step] !== currentSequence[step]) {
        statusText.innerText = "Ooops wrong click!";
        statusText.classList.remove('your-turn');
        gameActive = false;
        return;
    }

    if (playerSequence.length === currentSequence.length) {
        statusText.innerText = "Correct!";
        isPlayingSequence = true; 
        const t = setTimeout(nextLevel, 1200);
        gameTimeouts.push(t);
    }
}

function closeAllCards() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => card.classList.remove('active'));
}