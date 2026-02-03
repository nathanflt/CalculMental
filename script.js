// Variables globales
let currentLevel = 1;
let studyLevel = '';
let gameMode = '';
let score = 0;
let lives = 3;
let currentQuestion = {};
let timerInterval;
let timeLeft = 15;
let globalTimer = 0;
let globalTimerInterval;
let correctAnswers = 0;

// Configuration des niveaux selon le niveau d'étude
const levelConfigs = {
    primaire: {
        1: { desc: '🟢 Niveau 1 - Facile<br><small>Addition simple (0-10)</small>', type: 'primaire1' },
        2: { desc: '🟡 Niveau 2 - Moyen<br><small>Addition & Soustraction (0-20)</small>', type: 'primaire2' },
        3: { desc: '🟠 Niveau 3 - Difficile<br><small>Multiplication (1-5)</small>', type: 'primaire3' },
        4: { desc: '🔴 Niveau 4 - Expert<br><small>Multiplication (1-10)</small>', type: 'primaire4' }
    },
    college: {
        1: { desc: '🟢 Niveau 1 - Facile<br><small>Opérations simples (0-50)</small>', type: 'college1' },
        2: { desc: '🟡 Niveau 2 - Moyen<br><small>Multiplication & Division</small>', type: 'college2' },
        3: { desc: '🟠 Niveau 3 - Difficile<br><small>Calculs mixtes avec grands nombres</small>', type: 'college3' },
        4: { desc: '🔴 Niveau 4 - Expert<br><small>Puissances & Racines carrées</small>', type: 'college4' }
    },
    lycee: {
        1: { desc: '🟢 Niveau 1 - Facile<br><small>Calculs avec décimaux</small>', type: 'lycee1' },
        2: { desc: '🟡 Niveau 2 - Moyen<br><small>Fractions & Pourcentages</small>', type: 'lycee2' },
        3: { desc: '🟠 Niveau 3 - Difficile<br><small>Puissances & Racines</small>', type: 'lycee3' },
        4: { desc: '🔴 Niveau 4 - Expert<br><small>Équations & Calcul mental avancé</small>', type: 'lycee4' }
    },
    superieur: {
        1: { desc: '🟢 Niveau 1 - Facile<br><small>Arithmétique mentale rapide</small>', type: 'sup1' },
        2: { desc: '🟡 Niveau 2 - Moyen<br><small>Calculs algébriques</small>', type: 'sup2' },
        3: { desc: '🟠 Niveau 3 - Difficile<br><small>Logarithmes & Exponentielles</small>', type: 'sup3' },
        4: { desc: '🔴 Niveau 4 - Expert<br><small>Calcul mental extrême</small>', type: 'sup4' }
    }
};

// Sélectionner le niveau d'étude
function selectStudyLevel(level) {
    studyLevel = level;
    document.getElementById('studyLevelSelection').style.display = 'none';
    document.getElementById('gameModeSelection').style.display = 'block';
}

// Sélectionner le mode de jeu
function selectGameMode(mode) {
    gameMode = mode;
    updateLevelDescriptions();
    document.getElementById('gameModeSelection').style.display = 'none';
    document.getElementById('menu').style.display = 'block';
}

// Retour à la sélection du niveau d'étude
function backToStudyLevel() {
    document.getElementById('gameModeSelection').style.display = 'none';
    document.getElementById('studyLevelSelection').style.display = 'block';
}

// Retour à la sélection du mode de jeu
function backToGameMode() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('gameModeSelection').style.display = 'block';
}

// Mettre à jour les descriptions des niveaux
function updateLevelDescriptions() {
    const config = levelConfigs[studyLevel];
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`level${i}Desc`).innerHTML = config[i].desc;
    }
}

// Charger les records
function loadRecords() {
    const recordsDiv = document.getElementById('records');
    let html = '';
    for (let i = 1; i <= 4; i++) {
        const record = localStorage.getItem(`record_${studyLevel}_${gameMode}_${i}`) || 0;
        html += `<div style="margin: 5px 0;">Niveau ${i}: ${record} pts</div>`;
    }
    recordsDiv.innerHTML = html;
}

// Toggle thème
function toggleTheme() {
    document.body.classList.toggle('night-mode');
    document.body.classList.toggle('day-mode');
}

// Démarrer le jeu
function startGame(level) {
    currentLevel = level;
    score = 0;
    correctAnswers = 0;
    
    // Configuration selon le mode
    if (gameMode === 'classic') {
        lives = 3;
        timeLeft = 15;
        document.getElementById('livesBox').style.display = 'block';
        document.getElementById('timerBar').style.display = 'block';
        document.getElementById('timerLabel').textContent = 'Temps';
    } else if (gameMode === 'training') {
        lives = Infinity;
        document.getElementById('livesBox').style.display = 'none';
        document.getElementById('timerBar').style.display = 'none';
        document.getElementById('timerLabel').textContent = 'Questions';
    } else {
        // Modes chrono
        lives = Infinity;
        document.getElementById('livesBox').style.display = 'none';
        document.getElementById('timerBar').style.display = 'block';
        document.getElementById('timerLabel').textContent = 'Temps restant';
        
        if (gameMode === 'chrono60') globalTimer = 60;
        else if (gameMode === 'chrono90') globalTimer = 90;
        else if (gameMode === 'chrono180') globalTimer = 180;
    }
    
    document.getElementById('menu').style.display = 'none';
    document.getElementById('gameArea').style.display = 'block';
    document.getElementById('gameOver').style.display = 'none';
    
    updateStats();
    generateQuestion();
    
    if (gameMode === 'classic') {
        startTimer();
    } else if (gameMode === 'training') {
        // Pas de timer en mode entraînement
        document.getElementById('timer').textContent = correctAnswers;
    } else {
        startGlobalTimer();
    }
}

// Générer une question
function generateQuestion() {
    let num1, num2, operator, answer, questionText;
    const config = levelConfigs[studyLevel][currentLevel];
    const type = config.type;

    switch(type) {
        // PRIMAIRE
        case 'primaire1': // Addition simple 0-10
            num1 = Math.floor(Math.random() * 10);
            num2 = Math.floor(Math.random() * 10);
            operator = '+';
            answer = num1 + num2;
            questionText = `${num1} ${operator} ${num2} = ?`;
            break;

        case 'primaire2': // Addition & Soustraction 0-20
            num1 = Math.floor(Math.random() * 20);
            num2 = Math.floor(Math.random() * 20);
            operator = Math.random() > 0.5 ? '+' : '-';
            if (operator === '-' && num2 > num1) [num1, num2] = [num2, num1];
            answer = operator === '+' ? num1 + num2 : num1 - num2;
            questionText = `${num1} ${operator} ${num2} = ?`;
            break;

        case 'primaire3': // Multiplication 1-5
            num1 = Math.floor(Math.random() * 5) + 1;
            num2 = Math.floor(Math.random() * 5) + 1;
            operator = '×';
            answer = num1 * num2;
            questionText = `${num1} ${operator} ${num2} = ?`;
            break;

        case 'primaire4': // Multiplication 1-10
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            operator = '×';
            answer = num1 * num2;
            questionText = `${num1} ${operator} ${num2} = ?`;
            break;

        // COLLÈGE
        case 'college1': // Opérations simples 0-50
            num1 = Math.floor(Math.random() * 50);
            num2 = Math.floor(Math.random() * 50);
            operator = ['+', '-', '×'][Math.floor(Math.random() * 3)];
            if (operator === '-' && num2 > num1) [num1, num2] = [num2, num1];
            if (operator === '×') {
                num1 = Math.floor(Math.random() * 12) + 1;
                num2 = Math.floor(Math.random() * 12) + 1;
            }
            answer = operator === '+' ? num1 + num2 : operator === '-' ? num1 - num2 : num1 * num2;
            questionText = `${num1} ${operator} ${num2} = ?`;
            break;

        case 'college2': // Multiplication & Division
            if (Math.random() > 0.5) {
                num1 = Math.floor(Math.random() * 15) + 1;
                num2 = Math.floor(Math.random() * 15) + 1;
                operator = '×';
                answer = num1 * num2;
            } else {
                num2 = Math.floor(Math.random() * 12) + 1;
                answer = Math.floor(Math.random() * 15) + 1;
                num1 = num2 * answer;
                operator = '÷';
            }
            questionText = `${num1} ${operator} ${num2} = ?`;
            break;

        case 'college3': // Calculs mixtes avec grands nombres
            const ops = ['+', '-', '×'];
            operator = ops[Math.floor(Math.random() * ops.length)];
            if (operator === '×') {
                num1 = Math.floor(Math.random() * 20) + 10;
                num2 = Math.floor(Math.random() * 20) + 10;
            } else {
                num1 = Math.floor(Math.random() * 200) + 50;
                num2 = Math.floor(Math.random() * 100) + 20;
                if (operator === '-' && num2 > num1) [num1, num2] = [num2, num1];
            }
            answer = operator === '+' ? num1 + num2 : operator === '-' ? num1 - num2 : num1 * num2;
            questionText = `${num1} ${operator} ${num2} = ?`;
            break;

        case 'college4': // Puissances & Racines carrées
            if (Math.random() > 0.5) {
                num1 = Math.floor(Math.random() * 10) + 2;
                num2 = Math.floor(Math.random() * 3) + 2;
                answer = Math.pow(num1, num2);
                questionText = `${num1}^${num2} = ?`;
            } else {
                const squares = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225];
                num1 = squares[Math.floor(Math.random() * squares.length)];
                answer = Math.sqrt(num1);
                questionText = `√${num1} = ?`;
            }
            break;

        // LYCÉE
        case 'lycee1': // Calculs avec décimaux
            num1 = (Math.floor(Math.random() * 50) + 10) + (Math.floor(Math.random() * 10) / 10);
            num2 = (Math.floor(Math.random() * 30) + 5) + (Math.floor(Math.random() * 10) / 10);
            operator = ['+', '-', '×'][Math.floor(Math.random() * 3)];
            if (operator === '-' && num2 > num1) [num1, num2] = [num2, num1];
            answer = Math.round((operator === '+' ? num1 + num2 : operator === '-' ? num1 - num2 : num1 * num2) * 10) / 10;
            questionText = `${num1} ${operator} ${num2} = ?`;
            break;

        case 'lycee2': // Fractions & Pourcentages
            if (Math.random() > 0.5) {
                // Pourcentage
                num1 = Math.floor(Math.random() * 500) + 100;
                const percent = [10, 15, 20, 25, 30, 40, 50, 75][Math.floor(Math.random() * 8)];
                answer = Math.round(num1 * percent / 100);
                questionText = `${percent}% de ${num1} = ?`;
            } else {
                // Fraction simple
                const fractions = [[1,2], [1,3], [2,3], [1,4], [3,4], [1,5], [2,5]];
                const frac = fractions[Math.floor(Math.random() * fractions.length)];
                num1 = Math.floor(Math.random() * 100) + 20;
                answer = Math.round(num1 * frac[0] / frac[1]);
                questionText = `${frac[0]}/${frac[1]} de ${num1} = ?`;
            }
            break;

        case 'lycee3': // Puissances & Racines avancées
            const choice = Math.floor(Math.random() * 3);
            if (choice === 0) {
                // Puissances
                num1 = Math.floor(Math.random() * 15) + 2;
                num2 = Math.floor(Math.random() * 4) + 2;
                answer = Math.pow(num1, num2);
                questionText = `${num1}^${num2} = ?`;
            } else if (choice === 1) {
                // Racines carrées
                const squares = [16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 256, 289, 324, 361, 400];
                num1 = squares[Math.floor(Math.random() * squares.length)];
                answer = Math.sqrt(num1);
                questionText = `√${num1} = ?`;
            } else {
                // Racines cubiques
                const cubes = [8, 27, 64, 125, 216, 343, 512, 729, 1000];
                num1 = cubes[Math.floor(Math.random() * cubes.length)];
                answer = Math.round(Math.pow(num1, 1/3));
                questionText = `∛${num1} = ?`;
            }
            break;

        case 'lycee4': // Expert - Équations & Calcul mental avancé
            const expertChoice = Math.floor(Math.random() * 4);
            if (expertChoice === 0) {
                // Équation simple: 2x + 5 = 17
                const a = Math.floor(Math.random() * 9) + 2;
                const b = Math.floor(Math.random() * 20) + 5;
                answer = Math.floor(Math.random() * 15) + 1;
                const result = a * answer + b;
                questionText = `${a}x + ${b} = ${result}, x = ?`;
            } else if (expertChoice === 1) {
                // Carré d'un nombre à 2 chiffres
                num1 = Math.floor(Math.random() * 30) + 11;
                answer = num1 * num1;
                questionText = `${num1}² = ?`;
            } else if (expertChoice === 2) {
                // Multiplication mentale difficile
                num1 = Math.floor(Math.random() * 90) + 11;
                num2 = Math.floor(Math.random() * 90) + 11;
                answer = num1 * num2;
                questionText = `${num1} × ${num2} = ?`;
            } else {
                // Puissance de 2
                num1 = Math.floor(Math.random() * 8) + 5;
                answer = Math.pow(2, num1);
                questionText = `2^${num1} = ?`;
            }
            break;

        // SUPÉRIEUR
        case 'sup1': // Arithmétique mentale rapide
            const rapidChoice = Math.floor(Math.random() * 3);
            if (rapidChoice === 0) {
                // Multiplication rapide
                num1 = Math.floor(Math.random() * 80) + 20;
                num2 = Math.floor(Math.random() * 80) + 20;
                answer = num1 * num2;
                questionText = `${num1} × ${num2} = ?`;
            } else if (rapidChoice === 1) {
                // Carré de nombres
                num1 = Math.floor(Math.random() * 40) + 15;
                answer = num1 * num1;
                questionText = `${num1}² = ?`;
            } else {
                // Division mentale
                num2 = Math.floor(Math.random() * 20) + 5;
                answer = Math.floor(Math.random() * 50) + 10;
                num1 = num2 * answer;
                questionText = `${num1} ÷ ${num2} = ?`;
            }
            break;

        case 'sup2': // Calculs algébriques
            const algChoice = Math.floor(Math.random() * 3);
            if (algChoice === 0) {
                // (a + b)²
                num1 = Math.floor(Math.random() * 15) + 5;
                num2 = Math.floor(Math.random() * 15) + 5;
                answer = (num1 + num2) * (num1 + num2);
                questionText = `(${num1} + ${num2})² = ?`;
            } else if (algChoice === 1) {
                // Équation du 1er degré
                const a = Math.floor(Math.random() * 12) + 3;
                const b = Math.floor(Math.random() * 30) + 10;
                answer = Math.floor(Math.random() * 20) + 1;
                const result = a * answer - b;
                questionText = `${a}x - ${b} = ${result}, x = ?`;
            } else {
                // Factorisation mentale
                num1 = Math.floor(Math.random() * 20) + 10;
                num2 = Math.floor(Math.random() * 20) + 10;
                answer = num1 * num1 - num2 * num2;
                questionText = `${num1}² - ${num2}² = ?`;
            }
            break;

        case 'sup3': // Logarithmes & Exponentielles (simplifiés)
            const logChoice = Math.floor(Math.random() * 4);
            if (logChoice === 0) {
                // log₂(2^n) = n
                answer = Math.floor(Math.random() * 10) + 3;
                num1 = Math.pow(2, answer);
                questionText = `log₂(${num1}) = ?`;
            } else if (logChoice === 1) {
                // Puissances de 3
                num1 = Math.floor(Math.random() * 6) + 3;
                answer = Math.pow(3, num1);
                questionText = `3^${num1} = ?`;
            } else if (logChoice === 2) {
                // log₁₀
                const powers = [10, 100, 1000, 10000, 100000];
                const idx = Math.floor(Math.random() * powers.length);
                num1 = powers[idx];
                answer = idx + 1;
                questionText = `log₁₀(${num1}) = ?`;
            } else {
                // Multiplication complexe
                num1 = Math.floor(Math.random() * 150) + 50;
                num2 = Math.floor(Math.random() * 150) + 50;
                answer = num1 * num2;
                questionText = `${num1} × ${num2} = ?`;
            }
            break;

        case 'sup4': // Expert EXTRÊME
            const extremeChoice = Math.floor(Math.random() * 5);
            if (extremeChoice === 0) {
                // Cube d'un nombre
                num1 = Math.floor(Math.random() * 25) + 10;
                answer = num1 * num1 * num1;
                questionText = `${num1}³ = ?`;
            } else if (extremeChoice === 1) {
                // Multiplication très difficile
                num1 = Math.floor(Math.random() * 200) + 100;
                num2 = Math.floor(Math.random() * 200) + 100;
                answer = num1 * num2;
                questionText = `${num1} × ${num2} = ?`;
            } else if (extremeChoice === 2) {
                // Équation complexe: ax² = b
                num1 = Math.floor(Math.random() * 20) + 5; // x
                const a = Math.floor(Math.random() * 5) + 2;
                const b = a * num1 * num1;
                answer = num1;
                questionText = `${a}x² = ${b}, x = ?`;
            } else if (extremeChoice === 3) {
                // Puissances élevées
                num1 = Math.floor(Math.random() * 12) + 5;
                num2 = Math.floor(Math.random() * 5) + 3;
                answer = Math.pow(num1, num2);
                questionText = `${num1}^${num2} = ?`;
            } else {
                // Factorisation extrême
                num1 = Math.floor(Math.random() * 40) + 20;
                num2 = Math.floor(Math.random() * 40) + 20;
                answer = num1 * num1 - num2 * num2;
                questionText = `${num1}² - ${num2}² = ?`;
            }
            break;
    }

    currentQuestion = { answer, questionText };
    document.getElementById('question').textContent = questionText;
    document.getElementById('answerInput').value = '';
    document.getElementById('answerInput').focus();
    
    // Ne redémarrer le timer que pour le mode classique
    if (gameMode === 'classic') {
        resetTimer();
    }
}

// Timer global pour les modes chrono
function startGlobalTimer() {
    updateGlobalTimer();
    
    globalTimerInterval = setInterval(() => {
        globalTimer--;
        updateGlobalTimer();
        
        if (globalTimer <= 0) {
            endGame();
        }
    }, 1000);
}

function updateGlobalTimer() {
    const minutes = Math.floor(globalTimer / 60);
    const seconds = globalTimer % 60;
    document.getElementById('timer').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    let totalTime;
    if (gameMode === 'chrono60') totalTime = 60;
    else if (gameMode === 'chrono90') totalTime = 90;
    else if (gameMode === 'chrono180') totalTime = 180;
    
    const percentage = (globalTimer / totalTime) * 100;
    document.getElementById('timerFill').style.width = percentage + '%';
}

// Timer
function startTimer() {
    timeLeft = 15;
    updateTimer();
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimer();
        
        if (timeLeft <= 0) {
            wrongAnswer();
        }
    }, 1000);
}

function updateTimer() {
    document.getElementById('timer').textContent = timeLeft;
    const percentage = (timeLeft / 15) * 100;
    document.getElementById('timerFill').style.width = percentage + '%';
}

function resetTimer() {
    clearInterval(timerInterval);
    if (gameMode === 'classic') {
        startTimer();
    }
}

// Vérifier la réponse
function checkAnswer() {
    const userAnswer = parseInt(document.getElementById('answerInput').value);
    
    if (isNaN(userAnswer)) return;

    // Arrêter le timer pour éviter qu'il n'appelle wrongAnswer en parallèle
    clearInterval(timerInterval);

    if (userAnswer === currentQuestion.answer) {
        correctAnswer();
    } else {
        wrongAnswer();
    }
}

// Bonne réponse
function correctAnswer() {
    correctAnswers++;
    score += 10 + (currentLevel * 5);
    showFeedback('✓ Correct !', 'correct');
    updateStats();
    
    setTimeout(() => {
        generateQuestion();
        hideFeedback();
    }, 800);
}

// Mauvaise réponse
function wrongAnswer() {
    if (gameMode !== 'training') {
        lives--;
    }
    
    showFeedback(`✗ Faux ! La réponse était ${currentQuestion.answer}`, 'incorrect');
    updateStats();
    
    if (lives === 0 && gameMode === 'classic') {
        setTimeout(() => endGame(), 1000);
    } else {
        setTimeout(() => {
            generateQuestion();
            hideFeedback();
        }, 1500);
    }
}

// Afficher feedback
function showFeedback(message, type) {
    const feedback = document.getElementById('feedback');
    feedback.textContent = message;
    feedback.className = `feedback ${type} show`;
}

function hideFeedback() {
    document.getElementById('feedback').classList.remove('show');
}

// Mettre à jour les stats
function updateStats() {
    document.getElementById('score').textContent = score;
    
    if (gameMode === 'classic') {
        document.getElementById('lives').textContent = '❤️'.repeat(lives);
    } else if (gameMode === 'training') {
        document.getElementById('timer').textContent = correctAnswers;
    }
}

// Fin du jeu
function endGame() {
    clearInterval(timerInterval);
    clearInterval(globalTimerInterval);
    
    document.getElementById('gameArea').style.display = 'none';
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('finalScore').textContent = score;

    // Affichage des statistiques selon le mode
    let statsMessage = '';
    if (gameMode === 'training') {
        statsMessage = `Questions réussies : ${correctAnswers}`;
    } else if (gameMode.startsWith('chrono')) {
        statsMessage = `Bonnes réponses : ${correctAnswers}`;
    }
    
    if (statsMessage) {
        document.getElementById('finalScore').innerHTML = `Score: ${score}<br><small>${statsMessage}</small>`;
    }

    // Vérifier et sauvegarder le record (sauf en mode entraînement)
    if (gameMode !== 'training') {
        const recordKey = `record_${studyLevel}_${gameMode}_${currentLevel}`;
        const currentRecord = localStorage.getItem(recordKey) || 0;
        
        if (score > currentRecord) {
            localStorage.setItem(recordKey, score);
            document.getElementById('recordMessage').textContent = `🎉 NOUVEAU RECORD ! 🎉`;
        } else {
            document.getElementById('recordMessage').textContent = `Record du niveau: ${currentRecord} pts`;
        }
    } else {
        document.getElementById('recordMessage').textContent = `Mode entraînement - Pas de record sauvegardé`;
    }
}

// Retour au menu
function backToMenu() {
    clearInterval(timerInterval);
    clearInterval(globalTimerInterval);
    document.getElementById('menu').style.display = 'block';
    document.getElementById('gameArea').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
    loadRecords();
}

// Gestion du clavier
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && document.getElementById('gameArea').style.display === 'block') {
        checkAnswer();
    }
});
