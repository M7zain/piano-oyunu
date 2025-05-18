// Oyun Elemanları - DOM Referansları
const start = document.querySelector(".start"); // Oyunu başlat butonu
const game = document.querySelector("#game"); // Ana oyun konteyneri
const sco = document.getElementById("score"); // Skor göstergesi
const audio = document.getElementById("audio"); // Arka plan müziği
const ply = document.getElementById("play"); // Oyun başlangıç sesi
const out = document.getElementById("out"); // Oyun bitiş sesi
const results = document.getElementById("result"); // Sonuç sesi
const result_box = document.querySelector(".result_box"); // Sonuç popup kutusu
const restart = result_box.querySelector(".restart"); // Yeniden başlat butonu
const text = result_box.querySelector(".score_text"); // Final skor metni
const leaderboard = document.querySelector(".leaderboard");
const leaderboardBody = document.getElementById("leaderboard-body");
const usernameForm = document.querySelector(".username-form");
const usernameInput = document.getElementById("username-input");
const submitScore = document.getElementById("submit-score");
const viewLeaderboardBtn = document.querySelector(".view-leaderboard");
const closeLeaderboardBtn = document.querySelector(".close-button");
const playButton = start.querySelector(".play-button");

// Oyun Durum Değişkenleri
let gameState = {
    isPlaying: false,
    isPaused: false,
    score: 0,
    highScore: localStorage.getItem('highScore') || 0,
    currentStep: 0,
    combo: 0,
    leaderboard: JSON.parse(localStorage.getItem('leaderboard')) || [],
    currentPlayer: '',
    scoreSubmitted: false
};

let a; // Kare oluşturma için interval referansı
let tos = 2400; // Kare kaldırma zaman aşımı (milisaniye)
let bool1 = bool2 = bool3 = bool4 = true; // Hız seviyesi bayrakları
var count = 1; // Kare oluşturma sayacı
var mar = randomMargin(), mar2; // Kareler için kenar boşluğu pozisyonları

// Kare tıklama işleyicisi
function handleTileClick(tile) {
    if (tile.classList.contains('clicked') || gameState.isPaused) return;
    
    tile.classList.add('clicked');
    tile.style.background = "rgba(0,0,0,0.2)";
    updateScore();
    
    // Combo sistemini güncelle
    gameState.combo++;
    if (gameState.combo > 1) {
        showComboText(gameState.combo);
    }
}

// Combo text göster
function showComboText(combo) {
    const comboText = document.createElement('div');
    comboText.className = 'combo-text';
    comboText.textContent = `Combo x${combo}!`;
    game.appendChild(comboText);
    
    setTimeout(() => comboText.remove(), 1000);
}

// Pause ekranını göster
function showPauseScreen() {
    const pauseScreen = document.querySelector('.pause-screen');
    const pauseScore = document.getElementById('pause-score');
    const pauseHighScore = document.getElementById('pause-high-score');
    
    pauseScore.textContent = gameState.score;
    pauseHighScore.textContent = gameState.highScore;
    pauseScreen.classList.add('active');
}

// Pause ekranını gizle
function hidePauseScreen() {
    const pauseScreen = document.querySelector('.pause-screen');
    pauseScreen.classList.remove('active');
}

// Yüksek skoru güncelle ve göster
function updateHighScoreDisplay() {
    const highScoreElement = document.getElementById('high-score');
    if (highScoreElement) {
        highScoreElement.textContent = `En Yüksek: ${gameState.highScore}`;
    }
}

// Event Listeners
viewLeaderboardBtn.addEventListener('click', () => {
    updateLeaderboardDisplay();
    leaderboard.classList.add("active");
});

closeLeaderboardBtn.addEventListener('click', () => {
    leaderboard.classList.remove("active");
});

// Oyunu başlat butonu
playButton.addEventListener('click', showUsernameForm);

// Username form submit
submitScore.addEventListener('click', handleUsernameSubmit);

// Restart butonu
restart.addEventListener('click', handleRestart);

// Enter tuşu ile form submit
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleUsernameSubmit();
    }
});

// Liderlik tablosunu güncelle
function updateLeaderboardDisplay() {
    // Skorları sırala
    gameState.leaderboard.sort((a, b) => b.score - a.score);
    
    // En yüksek 10 skoru göster
    const topScores = gameState.leaderboard.slice(0, 10);
    
    // Tabloyu temizle
    leaderboardBody.innerHTML = '';

    if (topScores.length === 0) {
        // Eğer skor yoksa mesaj göster
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="3" style="text-align: center;">Henüz skor kaydedilmemiş</td>
        `;
        leaderboardBody.appendChild(row);
        return;
    }
    
    // Yeni skorları ekle
    topScores.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${entry.username}</td>
            <td>${entry.score}</td>
        `;
        leaderboardBody.appendChild(row);
    });
}

// Kullanıcı adı formunu göster
function showUsernameForm() {
    usernameForm.querySelector('h3').textContent = 'Kullanıcı Adınızı Girin';
    usernameForm.classList.add('active');
    usernameInput.value = ''; // Form her gösterildiğinde temizle
    usernameInput.focus(); // Input'a odaklan
}

// Kullanıcı adı submit işleyicisi
function handleUsernameSubmit() {
    const username = usernameInput.value.trim();
    if (username) {
        // Özel komut kontrolü
        if (username.toLowerCase() === 'clearboard') {
            // Liderlik tablosunu temizle
            gameState.leaderboard = [];
            localStorage.setItem('leaderboard', JSON.stringify(gameState.leaderboard));
            // Yüksek skoru sıfırla
            gameState.highScore = 0;
            localStorage.setItem('highScore', '0');
            // Liderlik tablosunu güncelle
            updateLeaderboardDisplay();
            // Admin olarak oyuna başla
            gameState.currentPlayer = 'Admin';
            usernameForm.classList.remove('active');
            startGame();
            return;
        }

        gameState.currentPlayer = username;
        usernameForm.classList.remove('active');
        startGame();
    }
}

// Oyun bittiğinde sonuç ekranını göster
function viewResult() {
    if (!gameState.scoreSubmitted) {
        gameState.isPlaying = false;
        game.style.display = "none";
        
        // Skoru kaydet
        gameState.leaderboard.push({
            username: gameState.currentPlayer,
            score: gameState.score,
            date: new Date().toISOString()
        });
        
        // Liderlik tablosunu localStorage'a kaydet
        localStorage.setItem('leaderboard', JSON.stringify(gameState.leaderboard));
        
        // Yüksek skoru güncelle
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            localStorage.setItem('highScore', gameState.highScore);
        }
        
        gameState.scoreSubmitted = true;
        
        // Direkt olarak başlangıç ekranına dön
        returnToStartScreen();
    }
}

// Başlangıç ekranına dön
function returnToStartScreen() {
    audio.pause();
    audio.currentTime = 0;
    out.play();
    start.style.display = "block";
    game.style.display = "none";
    updateLeaderboardDisplay(); // Liderlik tablosunu güncelle
}

// Arka plan müziğini başlat ve döngüye al
function startAudio() {
    audio.play();
}
audio.addEventListener("ended", () => {
    audio.currentTime = 0;
    audio.play();
});

// Kare oluşturma hızını ayarla
function speed(e) {
    a = setInterval(appendDiv, e);
}

// Hız seviyesi bayraklarını sıfırla
function reset() {
    bool1 = bool2 = bool3 = bool4 = true;
}

// Oyun bitişini yönet
function outs() {
    audio.pause();
    out.play();
    setTimeout(viewResult, 1000);
}

// Yeni kare oluştur ve ekle
function appendDiv() {
    var ob = document.createElement("div");

    // Yeni karenin önceki kareden farklı bir sütunda görünmesini sağla
    do { mar2 = randomMargin() }
    while (mar == mar2) { mar = mar2 }

    ob.style.marginLeft = mar2 + "%";
    setTimeout(moveDown, 100, ob);

    // Kare tıklama işlemini yönet
    ob.onclick = () => handleTileClick(ob);
    
    // Touch olayını ekle
    ob.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Varsayılan touch davranışını engelle
        handleTileClick(ob);
    });

    // Skora göre oyun hızını ayarla
    if (gameState.score >= 70 && gameState.score < 150) gameState.currentStep = 1;
    else if (gameState.score >= 150 && gameState.score < 400) gameState.currentStep = 2;
    else if (gameState.score >= 400 && gameState.score < 800) gameState.currentStep = 3;
    else if (gameState.score >= 800) gameState.currentStep = 4;

    document.getElementById("tiles").prepend(ob);
}

// Rastgele kenar boşluğu pozisyonu oluştur (0%, 25%, 50% veya 75%)
function randomMargin() { return 25 * Math.floor(Math.random() * 4) }

// Kare hareketini ve hız ayarlamalarını yönet
function moveDown(e) {
    e.classList.add("move");

    // Hız seviyesi 1 (70-149 puan)
    if (gameState.currentStep == 1) {
        e.classList.add("speedX1");
        if (bool1 == true) {
            clearInterval(a);
            speed(300);
            reset();
            bool1 = false;
            tos = 1600;
        }
    }
    // Hız seviyesi 2 (150-399 puan)
    else if (gameState.currentStep == 2) {
        e.classList.add("speedX2");
        if (bool2 == true) {
            clearInterval(a);
            speed(250);
            reset();
            bool2 = false;
            tos = 1600;
        }
    }
    // Hız seviyesi 3 (400-799 puan)
    else if (gameState.currentStep == 3) {
        e.classList.add("speedX3");
        if (bool3 == true) {
            clearInterval(a);
            speed(200);
            reset();
            bool3 = false;
            tos = 1200;
        }
    }
    // Hız seviyesi 4 (800+ puan)
    else if (gameState.currentStep == 4) {
        e.classList.add("speedX4");
        if (bool4 == true) {
            clearInterval(a);
            speed(160);
            reset();
            bool4 = false;
            tos = 1000;
        }
    }
    setTimeout(removeDiv, tos, e)
}

// Kare tıklandığında skoru güncelle
function updateScore() {
    gameState.score++;
    sco.innerText = gameState.score;

    // Yüksek skoru güncelle
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('highScore', gameState.highScore);
        updateHighScoreDisplay();
    }
}

// Kareyi kaldır ve oyun bitişini kontrol et
function removeDiv(e) {
    var bg = e.style.background;
    if (bg == "") {
        clearInterval(a);
        outs();
    }
    e.remove()
}

// Oyunu başlat
function startGame() {
    resetGameState();
    game.style.display = "block";
    start.style.display = "none";
    leaderboard.classList.remove('active');
    ply.play();
    speed(400);
    setTimeout(startAudio, 1000);
}

// Oyun durumunu sıfırla
function resetGameState() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.combo = 0;
    gameState.currentStep = 0;
    gameState.scoreSubmitted = false;
    sco.innerText = '0';
    updateHighScoreDisplay();
}