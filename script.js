document.addEventListener('DOMContentLoaded', () => {
    const hamster = document.getElementById('hamster');
    const scoreElement = document.getElementById('score');
    const energyElement = document.getElementById('energy');
    const dailyRewardTimerElement = document.getElementById('daily-reward-timer');
    const dailyCodeTimerElement = document.getElementById('daily-code-timer');
    const comboTimerElement = document.getElementById('combo-timer');
    const currentClicksElement = document.getElementById('current-clicks');
    const progressFillElement = document.getElementById('progress-fill');
    const promoInput = document.getElementById('promo-input');
    const promoButton = document.getElementById('promo-button');
    const skinsList = document.getElementById('skins-list');
    const boostButton = document.querySelector('.boost-button');

    // Anti-autoclicker system
    let lastClickTime = 0;
    let clickIntervals = [];
    const MAX_CLICKS_PER_SECOND = 15;
    const BAN_DURATION = 3 * 24 * 60 * 60 * 1000;

    // Game variables
    let score = parseInt(localStorage.getItem('score')) || 0;
    let currentEnergy = 3000;
    const totalEnergy = 3000;
    let currentSkin = localStorage.getItem('currentSkin') || hamster.src;
    let ownedSkins = JSON.parse(localStorage.getItem('ownedSkins')) || [1];
    let clickGoal = parseInt(localStorage.getItem('clickGoal')) || 100;
    let currentClicks = parseInt(localStorage.getItem('currentClicks')) || 0;
    let rewardMultiplier = parseInt(localStorage.getItem('rewardMultiplier')) || 1;
    let isBoostActive = false;
    let boostInterval;
    let usedPromoCodes = JSON.parse(localStorage.getItem('usedPromoCodes')) || [];

    // Skins data
    const skins = [
        { id: 1, name: "Стандартный", price: 0, url: "https://avatars.mds.yandex.net/i?id=c8be8819a6a32032566f1d911f3c2d17_l-12536664-images-thumbs&n=13" },
        { id: 2, name: "peedy", price: 10000, url: "https://i.ibb.co/fzNFmxMc/528-20250514123500.png" },
        { id: 3, name: "Clippy", price: 500000, url: "https://i.postimg.cc/TY1RVWHL/534-20250516210437.png" },
        { id: 4, name: "Genie", price: 3000000, url: "https://i.postimg.cc/KzbGBqdx/524-20250516225042.png" },
        { id: 5, name: "Bonzi With SunGlasses", price: 6000000, url: "https://i.postimg.cc/B6J3X8Kv/524-20250516225255.png" },
        { id: 6, name: "col Bonza", price: 10000000, url: "https://i.ibb.co/DPPRZs2Y/524-20250513232822.png" } 
    ];

    // Create reward notification element
    const rewardNotification = document.createElement('div');
    rewardNotification.className = 'reward-notification';
    rewardNotification.id = 'reward-notification';
    document.body.appendChild(rewardNotification);

    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    function updateEnergyDisplay() {
        energyElement.textContent = `${currentEnergy}/${totalEnergy}`;
    }

    function createFloatingScore(x, y) {
        const floatingScore = document.createElement('div');
        floatingScore.className = 'floating-score';
        
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;
        
        floatingScore.style.left = `${x + scrollX}px`;
        floatingScore.style.top = `${y + scrollY}px`;
        floatingScore.textContent = '+1';
        document.body.appendChild(floatingScore);
        
        setTimeout(() => {
            floatingScore.remove();
        }, 1000);
    }

    function updateClickProgress() {
        const progressPercent = (currentClicks / clickGoal) * 100;
        progressFillElement.style.width = `${progressPercent}%`;
        currentClicksElement.textContent = `${currentClicks}/${clickGoal}`;
        
        if (currentClicks >= clickGoal) {
            completeClickChallenge();
        }
    }

    function completeClickChallenge() {
        const reward = 5000 * rewardMultiplier;
        score += reward;
        scoreElement.textContent = formatNumber(score);
        localStorage.setItem('score', score);
        
        currentClicks = 0;
        clickGoal = Math.floor(clickGoal * 1.5);
        rewardMultiplier++;
        
        localStorage.setItem('currentClicks', currentClicks);
        localStorage.setItem('clickGoal', clickGoal);
        localStorage.setItem('rewardMultiplier', rewardMultiplier);
        
        updateClickProgress();
        
        rewardNotification.textContent = `Поздравляем! Вы заработали ${formatNumber(reward)} очков!`;
        rewardNotification.style.display = 'block';
        
        setTimeout(() => {
            rewardNotification.style.display = 'none';
        }, 2000);
        
        initShop();
    }

    function startTimer(timerElement, initialTimeInSeconds, callback) {
        let time = initialTimeInSeconds;
        const interval = setInterval(() => {
            if (time > 0) {
                time--;
                const minutes = Math.floor(time / 60);
                const seconds = time % 60;
                timerElement.textContent = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            } else {
                callback();
                clearInterval(interval);
                startTimer(timerElement, initialTimeInSeconds, callback);
            }
        }, 1000);
    }

    function rewardCallback() {
        const randomPoints = Math.floor(Math.random() * 10001) + 5000;
        score += randomPoints;
        scoreElement.textContent = formatNumber(score);
        localStorage.setItem('score', score);
        initShop();
    }

    function buySkin(skin) {
        if (score >= skin.price && !ownedSkins.includes(skin.id)) {
            score -= skin.price;
            ownedSkins.push(skin.id);
            scoreElement.textContent = formatNumber(score);
            localStorage.setItem('score', score);
            localStorage.setItem('ownedSkins', JSON.stringify(ownedSkins));
            initShop();
        }
    }

    function selectSkin(skin) {
        currentSkin = skin.url;
        hamster.src = currentSkin;
        localStorage.setItem('currentSkin', currentSkin);
        initShop();
    }

    function initShop() {
        skinsList.innerHTML = '';
        skins.forEach(skin => {
            const skinItem = document.createElement('div');
            skinItem.className = 'skin-item';
            
            const skinPreview = document.createElement('img');
            skinPreview.src = skin.url;
            skinPreview.className = 'skin-preview';
            skinPreview.alt = skin.name;
            
            const skinInfo = document.createElement('div');
            skinInfo.className = 'skin-info';
            skinInfo.innerHTML = `
                <div class="skin-name">${skin.name}</div>
                <div class="skin-price">Цена: ${formatNumber(skin.price)}</div>
            `;
            
            const buyButton = document.createElement('button');
            buyButton.className = 'buy-button';
            
            if (ownedSkins.includes(skin.id)) {
                if (currentSkin === skin.url) {
                    buyButton.textContent = 'Выбрано';
                    buyButton.disabled = true;
                } else {
                    buyButton.textContent = 'Выбрать';
                    buyButton.onclick = () => selectSkin(skin);
                }
            } else {
                buyButton.textContent = 'Купить';
                buyButton.onclick = () => buySkin(skin);
                buyButton.disabled = score < skin.price;
            }
            
            skinItem.appendChild(skinPreview);
            skinItem.appendChild(skinInfo);
            skinItem.appendChild(buyButton);
            skinsList.appendChild(skinItem);
        });
    }
function detectAutoclicker() {
        const now = Date.now();
        const timeSinceLastClick = now - lastClickTime;
        lastClickTime = now;

        if (clickIntervals.length >= 10) {
            clickIntervals.shift();
        }
        clickIntervals.push(timeSinceLastClick);

        if (clickIntervals.length >= 5) {
            const averageInterval = clickIntervals.reduce((a, b) => a + b, 0) / clickIntervals.length;
            const clicksPerSecond = 1000 / averageInterval;

            if (clicksPerSecond > MAX_CLICKS_PER_SECOND && isTooRegular(clickIntervals)) {
                banPlayer();
                return true;
            }
        }
        return false;
    }

    function isTooRegular(intervals) {
        const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((acc, interval) => {
            return acc + Math.pow(interval - avg, 2);
        }, 0) / intervals.length;

        return variance < 10;
    }
function banPlayer() {
        const banUntil = Date.now() + BAN_DURATION;
        localStorage.setItem('bannedUntil', banUntil);
        showBanMessage();
    }
    
    

    function checkBanStatus() {
        const banUntil = localStorage.getItem('bannedUntil');
        if (banUntil && Date.now() < parseInt(banUntil)) {
            showBanMessage();
            return true;
        }
        return false;
    }

    function showBanMessage() {
        const banUntil = localStorage.getItem('bannedUntil');
        const banTimeLeft = (parseInt(banUntil) - Date.now()) / (1000 * 60 * 60 * 24);
        
        const banMessage = document.createElement('div');
        banMessage.style.position = 'fixed';
        banMessage.style.top = '0';
        banMessage.style.left = '0';
        banMessage.style.width = '100%';
        banMessage.style.height = '100%';
        banMessage.style.backgroundColor = 'rgba(0,0,0,0.9)';
        banMessage.style.color = 'white';
        banMessage.style.display = 'flex';
        banMessage.style.flexDirection = 'column';
        banMessage.style.justifyContent = 'center';
        banMessage.style.alignItems = 'center';
        banMessage.style.zIndex = '10000';
        banMessage.style.fontSize = '24px';
        banMessage.style.textAlign = 'center';
        banMessage.style.padding = '20px';
        
        banMessage.innerHTML = `
            <h1>Вы забанены!</h1>
            <p>Обнаружено использование автокликера.</p>
            <p>Бан истечет через: ${banTimeLeft.toFixed(1)} дней</p>
            <p>Попробуйте играть честно!</p>
        `;
        
        document.body.innerHTML = '';
        document.body.appendChild(banMessage);
    }


    // Boost function
    boostButton.addEventListener('click', () => {
        if (score >= 100000 && !isBoostActive) {
            score -= 100000;
            scoreElement.textContent = formatNumber(score);
            localStorage.setItem('score', score);

            isBoostActive = true;
            boostButton.style.backgroundColor = 'red';

            boostInterval = setInterval(() => {
                score += 5;
                scoreElement.textContent = formatNumber(score);
                localStorage.setItem('score', score);
            }, 1);

            setTimeout(() => {
                clearInterval(boostInterval);
                isBoostActive = false;
                boostButton.style.backgroundColor = '#ff5722';
            }, 10000);
        }
    });

    // Promo code function
    promoButton.addEventListener('click', () => {
        const promo = promoInput.value.trim();
        let bonus = 0;
        let skinUrl = null;

        if (usedPromoCodes.includes(promo)) {
            alert("Этот промокод уже был использован!");
            return;
        }

        if (promo === "Bueno000") {
            bonus = 10000;
            usedPromoCodes.push(promo);
            localStorage.setItem('usedPromoCodes', JSON.stringify(usedPromoCodes));
        } else if (promo === "кортел") {
            bonus = 5000;
            usedPromoCodes.push(promo);
            localStorage.setItem('usedPromoCodes', JSON.stringify(usedPromoCodes));
        } else if (promo === "Chomikbox") {
            skinUrl = "https://i.postimg.cc/Z5Jh7hTp/524-20250514221401.png";
        }

        if (bonus > 0) {
            score += bonus;
            scoreElement.textContent = formatNumber(score);
            localStorage.setItem('score', score);
            promoInput.value = "";
            alert(`Промокод активирован! +${bonus} очков!`);
        } else if (skinUrl) {
            currentSkin = skinUrl;
            hamster.src = currentSkin;
            localStorage.setItem('currentSkin', currentSkin);
            promoInput.value = "";
            alert("Промокод активирован! Новый скин применён!");
            initShop();
        } else {
            alert("Неверный промокод!");
        }
    });

    // Disable boost button if not enough points
    setInterval(() => {
        boostButton.disabled = score < 100000 || isBoostActive;
    }, 1000);

    // Hamster click handler
    hamster.addEventListener('click', (event) => {
        if (checkBanStatus()) return;
        
        if (detectAutoclicker()) return;
        
        if (currentEnergy > 0) {
            score++;
            currentClicks++;
            localStorage.setItem('currentClicks', currentClicks);
            currentEnergy--;
            scoreElement.textContent = formatNumber(score);
            updateEnergyDisplay();
            createFloatingScore(event.clientX, event.clientY);
            localStorage.setItem('score', score);
            updateClickProgress();
            initShop();
        }
    });

    // Energy regeneration
    setInterval(() => {
        if (currentEnergy < totalEnergy) {
            currentEnergy++;
            updateEnergyDisplay();
        }
    }, 5000);

    // Passive income
    setInterval(() => {
        score += 2000;
        scoreElement.textContent = formatNumber(score);
        localStorage.setItem('score', score);
        initShop();
    }, 60000);

    // Initialize timers
    startTimer(dailyRewardTimerElement, 750, rewardCallback);
    startTimer(dailyCodeTimerElement, 450, rewardCallback);
    startTimer(comboTimerElement, 30, rewardCallback);

    // Check ban status on load
    if (checkBanStatus()) {
        return;
    }

    // Initialize shop and progress
    initShop();
    updateClickProgress();
    updateEnergyDisplay();
    scoreElement.textContent = formatNumber(score);
    hamster.src = currentSkin;
});