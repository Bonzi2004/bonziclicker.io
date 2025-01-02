let score = 0; // Начальный счет
const scoreDisplay = document.getElementById('score');
const notification = document.getElementById('notification');
let dailyRewardAvailable = true;
let currentCode = null;
let boostActive = false;
let boostInterval;
const boostLimit = 2500; // Минимум очков для активации буста
const boostDuration = 10000; // 10 секунд
const dailyRewardCooldown = 180000; // 3 минуты в миллисекундах
const codes = [
    { code: "BONZI", hint: "B...I" },
    { code: "CLICK", hint: "C...K" },
    { code: "CHRISTMAS", hint: "C...S" },
    { code: "GAME", hint: "G...E" },
];

// Массив изображений для взлома
const hackImages = [
    'https://avatars.mds.yandex.net/i?id=c8be8819a6a32032566f1d911f3c2d17_l-12536664-images-thumbs&n=13',
    'https://static.wikia.nocookie.net/the-microsoft-agent/images/6/6a/ClippyV2.png/revision/latest?cb=20190128065558',
    'https://static.wikia.nocookie.net/the-microsoft-agent/images/4/41/Peedy_Parrot.gif/revision/latest?cb=20190127180403',
    'https://static.wikia.nocookie.net/the-microsoft-agent/images/e/ed/Image_%281%29.gif/revision/latest?cb=20190127183042',
    'https://media.tenor.com/Xw-IhAxUofUAAAAj/bonzi-buddy-uwu.gif'
];

// Загрузка сохраненного счета
function loadScore() {
    const savedScore = localStorage.getItem('bonziClickerScore');
    if (savedScore) {
        score = parseInt(savedScore, 10);
        scoreDisplay.textContent = score;
    }
}

// Сохранение счета
function saveScore() {
    localStorage.setItem('bonziClickerScore', score);
}

// Обработчик клика по хомяку
document.getElementById('hamster').addEventListener('click', () => {
    score++;
    scoreDisplay.textContent = score;
    notification.textContent = "+1";
    notification.style.opacity = '1';
    setTimeout(() => {
        notification.style.opacity = '0';
    }, 1000);
    saveScore(); // Сохраняем счет после клика
});

// Обработчик для ежедневной награды
document.getElementById('daily-reward').addEventListener('click', () => {
    if (dailyRewardAvailable) {
        score += 20;
        scoreDisplay.textContent = score;
        alert('Вы получили ежедневную награду: +20 очков!');
        saveScore(); // Сохраняем счет после получения награды
        dailyRewardAvailable = false;

        // Таймер для следующей награды
        setTimeout(() => {
            dailyRewardAvailable = true;
            alert('Ежедневная награда снова доступна!');
        }, dailyRewardCooldown);
    } else {
        alert('Вы уже получили свою ежедневную награду. Подождите 3 минуты.');
    }
});

// Обработчик для применения шифра
document.getElementById('apply-combo').addEventListener('click', () => {
    const comboInput = document.getElementById('combo-code');
    const code = comboInput.value.trim();
    if (code === "BONZI") {
        score += 1000;
        scoreDisplay.textContent = score;
        alert('Код принят! +1000 очков');
        saveScore(); // Сохраняем счет после применения шифра
        comboInput.value = ''; // Очищаем поле ввода
    } else if (code === "0001") {
        window.location.href = 'https://i.postimg.cc/FsGSX931/193-20250102153235.png'; // Замените на URL изображения
    } else if (code === "1924") {
        window.location.href = 'https://i.postimg.cc/C5SR9tKj/194-20250102153635.png'; // Замените на URL видео
    } else if (code === "115") {
        window.location.href = 'https://i.postimg.cc/zXdyPxYg/195-20250102190311.png'; // Замените на URL изображения
    } else {
        alert('Неверная расшифровка. Попробуйте снова.');
    }
});

// Обработчик для активации буста
document.getElementById('boost-button').addEventListener('click', () => {
    if (!boostActive && score >= boostLimit) {
        boostActive = true;
        alert('Boost активирован!');

        boostInterval = setInterval(() => {
            score += 1; // Увеличиваем счет на 1
            scoreDisplay.textContent = score;
            saveScore(); // Сохраняем счет во время буста
        }, 10); // Увеличение счета каждые 10 миллисекунд

        setTimeout(() => {
            clearInterval(boostInterval);
            boostActive = false;
            alert('Boost завершен!');
        }, boostDuration); // Boost длится 10 секунд
    } else if (score < boostLimit) {
        alert('Не хватает очков для активации Boost! Достигните 2500 очков.');
    } else {
        alert('Boost уже активирован! Подождите, пока он не завершится.');
    }
});

// Обработчик для взлома
document.getElementById('hack-button').addEventListener('click', () => {
    const chance = Math.random();
    if (chance <= 0.2) { // 20% шанс
        const hamsterImage = document.getElementById('hamster');
        const randomIndex = Math.floor(Math.random() * hackImages.length); // Случайный индекс
        hamsterImage.src = hackImages[randomIndex]; // Заменяем изображение
        saveGameState(); // Сохраняем новое изображение
        alert('Взлом удался!');
    } else {
        alert('Взлом не удался! Попробуйте снова.');
    }
});

// Обработчик для дележа
document.getElementById('share-button').addEventListener('click', () => {
    const shareText = `Я достиг ${score} очков в BonziClicker!`;
    const shareUrl = window.location.href;

    if (navigator.share) {
        navigator.share({
            title: 'BonziClicker',
            text: shareText,
            url: shareUrl
        }).then(() => {
            console.log('Успешно поделились!');
        }).catch((error) => {
            console.error('Ошибка при попытке поделиться:', error);
        });
    } else {
        alert(`Скопируйте ссылку и поделитесь: ${shareUrl}`);
    }
});

// Выбор случайного кода при загрузке
function selectRandomCode() {
    if (codes.length > 0) {
        currentCode = codes[Math.floor(Math.random() * codes.length)];
        alert(`Подсказка для шифра: ${currentCode.hint}`);
    }
}

// Загрузка сохраненного счета и изображения
function loadGameState() {
    loadScore(); // Загружаем сохраненный счет
    selectRandomCode(); // Выбираем случайный код
}

// Вызываем функцию при загрузке страницы
window.onload = loadGameState;
