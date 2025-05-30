// Oyun Elemanları - DOM Referansları
document.addEventListener('DOMContentLoaded', () => {
    const start = document.querySelector(".start"); // Oyunu başlat butonu
    const difficultySelect = document.querySelector(".difficulty-select"); // Zorluk seçim ekranı
    const game = document.querySelector("#game"); // Ana oyun konteyneri
    const sco = document.getElementById("score"); // Skor göstergesi
    const audio = document.getElementById("audio"); // Arka plan müziği
    const ply = document.getElementById("play"); // Oyun başlangıç sesi
    const out = document.getElementById("out"); // Oyun bitiş sesi
    const results = document.getElementById("result"); // Sonuç sesi
    const result_box = document.querySelector(".result_box"); // Sonuç popup kutusu
    const restart = result_box.querySelector(".restart"); // Yeniden başlat butonu
    const text = result_box.querySelector(".score_text"); // Final skor metni
    const nameForm = result_box.querySelector(".name_form"); // İsim giriş formu
    const playerNameInput = document.getElementById("player_name"); // İsim giriş alanı
    const saveScoreBtn = document.getElementById("save_score"); // Skor kaydet butonu
    const topScoresList = document.querySelector(".top-scores-list"); // Top scores listesi

    // Müzik elementleri
    const easyMusic = document.getElementById("easyMusic");
    const normalMusic = document.getElementById("normalMusic");
    const hardMusic = document.getElementById("hardMusic");
    let currentMusic = null;

    // Zorluk seviyeleri ayarları
    const difficultySettings = {
        easy: {
            initialSpeed: 500,
            music: easyMusic,
            speedLevels: {
                1: { score: 50, speed: 400, timeout: 2000 },
                2: { score: 100, speed: 350, timeout: 1800 },
                3: { score: 200, speed: 300, timeout: 1600 },
                4: { score: 400, speed: 250, timeout: 1400 }
            }
        },
        normal: {
            initialSpeed: 400,
            music: normalMusic,
            speedLevels: {
                1: { score: 70, speed: 300, timeout: 1600 },
                2: { score: 150, speed: 250, timeout: 1600 },
                3: { score: 400, speed: 200, timeout: 1200 },
                4: { score: 800, speed: 160, timeout: 1000 }
            }
        },
        hard: {
            initialSpeed: 300,
            music: hardMusic,
            speedLevels: {
                1: { score: 50, speed: 250, timeout: 1400 },
                2: { score: 100, speed: 200, timeout: 1200 },
                3: { score: 200, speed: 150, timeout: 1000 },
                4: { score: 400, speed: 120, timeout: 800 }
            }
        }
    };

    let currentDifficulty = null;
    let currentSettings = null;

    // Oyun Durum Değişkenleri
    let a; // Kare oluşturma için interval referansı
    let tos = 2400; // Kare kaldırma zaman aşımı (milisaniye)
    let bool1 = bool2 = bool3 = bool4 = true; // Hız seviyesi bayrakları
    var count = 1; // Kare oluşturma sayacı
    var score = 0; // Oyuncunun skoru
    var step = 0; // Mevcut hız seviyesi
    var mar = randomMargin(), mar2; // Kareler için kenar boşluğu pozisyonları
    var hasSubmittedScore = false; // Skor gönderildi mi?

    // Oyna butonuna tıklandığında zorluk seçim ekranını göster
    start.querySelector("button").onclick = () => {
        start.style.display = "none";
        difficultySelect.style.display = "flex";
        document.querySelector(".dpuLogo").style.display = "none";
    };

    // Geri butonuna tıklandığında ana menüye dön
    document.querySelector(".back-btn").onclick = () => {
        difficultySelect.style.display = "none";
        start.style.display = "block";
        document.querySelector(".dpuLogo").style.display = "block";
    };

    // Arka plan müziğini başlat ve döngüye al
    function startBackgroundMusic(music) {
        // Önceki müziği durdur
        if (currentMusic) {
            currentMusic.pause();
            currentMusic.currentTime = 0;
        }
        
        // Yeni müziği ayarla ve başlat
        currentMusic = music;
        currentMusic.loop = true;
        currentMusic.volume = 0.5;
        currentMusic.play().catch(error => {
            console.log("Music autoplay prevented:", error);
        });
    }

    // Zorluk seviyesi seçildiğinde oyunu başlat
    document.querySelectorAll(".difficulty-btn").forEach(btn => {
        btn.onclick = () => {
            const difficulty = btn.classList.contains("easy") ? "easy" : 
                             btn.classList.contains("normal") ? "normal" : "hard";
            
            currentDifficulty = difficulty;
            currentSettings = difficultySettings[difficulty];
            
            difficultySelect.style.display = "none";
            game.style.display = "block";
            
            // Oyunu başlat
            ply.play();
            score = 0;
            sco.innerText = score;
            speed(currentSettings.initialSpeed);
            
            // Zorluk seviyesine göre müziği başlat
            startBackgroundMusic(currentSettings.music);
        };
    });

    // Liderlik tablosunu yükle
    async function loadLeaderboard() {
        try {
            const response = await fetch('api/get_leaderboard.php');
            const data = await response.json();
            
            if (data.success && topScoresList) {
                const scores = data.scores;
                
                // Sadece ilk 3 skoru göster
                topScoresList.innerHTML = scores.slice(0, 3).map((score, index) => `
                    <div class="top-score-item">
                        <div class="rank">#${index + 1}</div>
                        <div class="player-name">${score.username}</div>
                        <div class="player-score">${score.score}</div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading leaderboard:', error);
        }
    }

    // Skoru kaydet
    async function saveScore(name) {
        try {
            const response = await fetch('api/save_score.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    score: score
                })
            });
            
            const data = await response.json();
            if (data.success) {
                hasSubmittedScore = true;
                if (nameForm) nameForm.style.display = 'none';
                loadLeaderboard(); // Liderlik tablosunu güncelle
            }
        } catch (error) {
            console.error('Error saving score:', error);
        }
    }

    // Oyun bittiğinde sonuç ekranını göster
    function viewResult(){
        if (game) game.style.display = "none";
        if (results) results.play();
        if (result_box) {
            result_box.classList.add("activeResult");
            if (text) text.innerText = "You've scored " + score + " points";
            
            // İlk kez oynuyorsa isim formunu göster
            if (!hasSubmittedScore && nameForm) {
                nameForm.style.display = 'flex';
            }
            
            // Liderlik tablosunu yükle
            loadLeaderboard();
        }
    }

    // Skor kaydet butonuna tıklandığında
    if (saveScoreBtn) {
        saveScoreBtn.onclick = () => {
            if (playerNameInput) {
                const name = playerNameInput.value.trim();
                if (name) {
                    saveScore(name);
                } else {
                    alert('Lütfen isminizi girin!');
                }
            }
        };
    }

    // Oyun bitişini yönet
    function outs(){
        if (currentMusic) {
            currentMusic.pause();
            currentMusic.currentTime = 0;
        }
        out.play();
        setTimeout(viewResult, 1000);
    }

    // Yeniden başlatıldığında oyun durumunu sıfırla
    if (restart) {
        restart.onclick = ()=>{
            if (start) start.style.display = "block";
            if (result_box) result_box.classList.remove("activeResult");
            if (sco) sco.innerText = 0;
            if (currentMusic) {
                currentMusic.pause();
                currentMusic.currentTime = 0;
            }
            score = 0;
            hasSubmittedScore = false;
        }
    }

    // Kare oluşturma hızını ayarla
    function speed(e){
        a = setInterval(appendDiv, e);
    }

    // Hız seviyesi bayraklarını sıfırla
    function reset(){
        bool1 = bool2 = bool3 = bool4 = true;
    }

    // Yeni kare oluştur ve ekle
    function appendDiv(){
        var ob = document.createElement("div");

        // Yeni karenin önceki kareden farklı bir sütunda görünmesini sağla
        do{mar2 = randomMargin()}
        while(mar == mar2){mar = mar2}

        ob.style.marginLeft = mar2+"%";
        setTimeout(moveDown, 100, ob);
        
        // Kare tıklama işlemini yönet
        ob.onclick = () =>{
            ob.style.background = "rgba(0,0,0,0.2)"
            updateScore();
        }

        // Skora göre oyun hızını ayarla
        if(score >= 70 && score < 150) step = 1;
        else if(score >= 150 && score < 400) step = 2;
        else if(score >= 400 && score < 800) step = 3;
        else if(score >= 800) step = 4;
        
        document.getElementById("tiles").prepend(ob);
    }

    // Rastgele kenar boşluğu pozisyonu oluştur (0%, 25%, 50% veya 75%)
    function randomMargin(){return 25*Math.floor(Math.random()*4)}

    // Kare hareketini ve hız ayarlamalarını yönet
    function moveDown(e){
        e.classList.add("move");
        
        const settings = currentSettings.speedLevels;
        
        // Zorluk seviyesine göre hız ayarları
        if(score >= settings[1].score && score < settings[2].score){
            e.classList.add("speedX1");
            if(bool1){
                clearInterval(a);
                speed(settings[1].speed);
                reset();
                bool1 = false;
                tos = settings[1].timeout;
            }
        } 
        else if(score >= settings[2].score && score < settings[3].score){
            e.classList.add("speedX2");
            if(bool2){
                clearInterval(a);
                speed(settings[2].speed);
                reset();
                bool2 = false;
                tos = settings[2].timeout;
            }
        }
        else if(score >= settings[3].score && score < settings[4].score){
            e.classList.add("speedX3");
            if(bool3){
                clearInterval(a);
                speed(settings[3].speed);
                reset();
                bool3 = false;
                tos = settings[3].timeout;
            }
        } 
        else if(score >= settings[4].score){
            e.classList.add("speedX4");
            if(bool4){
                clearInterval(a);
                speed(settings[4].speed);
                reset();
                bool4 = false;
                tos = settings[4].timeout;
            }
        }
        setTimeout(removeDiv, tos, e)
    }

    // Kare tıklandığında skoru güncelle
    function updateScore(){
        score++;
        sco.innerText = score;
    }

    // Kareyi kaldır ve oyun bitişini kontrol et
    function removeDiv(e){
        var bg = e.style.background;
        if(bg == ""){
            clearInterval(a);
            outs();
        }
        e.remove()
    }
});