const game = document.getElementById("game");
const ship = document.getElementById("ship");
const enemy = document.getElementById("enemy");

const gameWidth = game.clientWidth;
const shipWidth = ship.clientWidth;

const scoreCount = document.getElementById("score")
const currentHP = document.getElementById("currentHealth")
const hpCount = document.getElementById("hpcount")
const levelCount = document.getElementById("level")
const levelDisplay = document.getElementById("levelDisplay")
const highScoreDisplay = document.getElementById("highscore")

//SOUNDS

const shootSound = new Audio('../assets/sounds/shoot.wav');
const hitSound = new Audio("../assets/sounds/hit.mp3");
const bulletCollideSound = new Audio("../assets/sounds/buller.wav")
const dmgSound = new Audio("../assets/sounds/damage.wav")
const loseSound = new Audio("../assets/sounds/lose.wav")
const winSound = new Audio("../assets/sounds/win.wav")

var shooting = false
var shootInterval = null
var canShoot = true

var score = 0
var highscore = 0
var prevScore = 0
var currentHealth = 1000

var position = ship.getBoundingClientRect().left - game.getBoundingClientRect().left;

var movingLeft = false;
var movingRight = false;
var enemyDirection = 3;

var moveSpeed = 2;
var enemySpeed = 0.5;

var level = 0;

var maxLevel = 5;

const updateScore = () => {
    scoreCount.innerHTML = `Score : ${score}`;
    if(score > highscore) {
        highscore = score
        updateHighscore()
    }
    if (score - prevScore == (120 * ((1 * (1 + Math.ceil((level - 1) / 3))) + (2 * (1 + Math.ceil((level - 2) / 3))) + (3 * (1 + Math.ceil((level - 3) / 3)))))) {
        prevScore = score
        upLevel()
    }
}

const exitGame = () => {
    levelDisplay.innerHTML = `Thank You For Playing!<br>Your HighScore : ${highscore}`
    levelDisplay.style.fontSize = '8rem'
    levelDisplay.style.opacity = "1"
}

const updateHighscore = () => {
    highScoreDisplay.innerHTML = `High Score : ${highscore}`
}

const restartGame = () => {

    level = 0
    score = 0
    currentHealth = 1000
    levelDisplay.innerHTML = `Start New Game ?`
    var btn1 = document.createElement("button")
    var btn2 = document.createElement("button")
    var buttonbox = document.createElement("div")
    buttonbox.classList.add("buttonbox")
    btn1.classList.add("choice-btn")
    btn2.classList.add("choice-btn")
    btn1.innerHTML = 'No'
    btn2.innerHTML = 'Yes'
    levelDisplay.appendChild(buttonbox)
    buttonbox.appendChild(btn1)
    buttonbox.appendChild(btn2)
    levelDisplay.style.fontSize = '10rem'
    levelDisplay.style.opacity = "1"

    btn1.addEventListener('click', () => {

        btn1.disabled = true
        setTimeout(() => {

            levelDisplay.style.opacity = "0"
            setTimeout(() => {
                levelDisplay.style.fontSize = '16rem'
                levelDisplay.innerHTML = ''
                exitGame()
            }, 2000);

        }, 2000);
        
    })

    btn2.addEventListener('click', () => {
        btn2.disabled = true
        setTimeout(() => {

            levelDisplay.style.opacity = "0"
            setTimeout(() => {
                levelDisplay.style.fontSize = '16rem'
                levelDisplay.innerHTML = ''
                upLevel()
            }, 2000);

        }, 2000);
    })

}

const updateHealth = () => {

    hpCount.innerHTML = `HP : ${currentHealth}/1000`

    currentHP.style.width = `${currentHealth / 10}%`

    currentHP.style.background = `linear-gradient(to left, rgb(${255 - (255 * currentHealth/1000)}, ${255 * currentHealth / 1000}, 0), rgb(${128 * (1 - (currentHealth / 1000))},${128 * (currentHealth / 1000)}, 0))`

    if(currentHealth == 0){
        enemy.innerHTML = ""
        enemy.style.top = "7%"
        enemy.style.left = "auto"

        levelDisplay.innerHTML = `YOU LOST`

        levelDisplay.style.opacity = "1"

        setTimeout(() => {

            loseSound.volume = 1
            loseSound.play();
            levelDisplay.style.opacity = "0"
            setTimeout(() => {
                restartGame()
            }, 2000);

        }, 2000);
    }

}

function moveShip() {

    if (!((position == 0 || position == (gameWidth - shipWidth)) && (movingLeft && movingRight))) {
        if (movingLeft && position > 0) {
            position -= (position >= moveSpeed ? moveSpeed : position);
        }
        if (movingRight && position < (gameWidth - shipWidth)) {
            position += ((gameWidth - shipWidth - position) > moveSpeed ? moveSpeed : (gameWidth - shipWidth - position))
        }

        ship.style.left = `${position}px`;

    }

    requestAnimationFrame(moveShip);

}

const upLevel = () => {

    level += 1
    if (level == maxLevel) {
        levelDisplay.innerHTML = `YOU WON`
        levelDisplay.style.opacity = "1"

        setTimeout(() => {

            levelDisplay.style.opacity = "0"
            setTimeout(() => {
                restartGame()
            }, 2000)

        }, 2000);

        return
    }
    levelCount.innerHTML = `Level : ${level}`
    enemy.innerHTML = ""
    enemy.style.top = "7%"
    enemy.style.left = "auto"
    levelDisplay.innerHTML = `LEVEL ${level}`
    levelDisplay.style.opacity = "1"

    updateHealth();

    updateScore();
    
    if (level != 1) {
        winSound.volume = 1
        winSound.play();
    }

    setTimeout(() => {
        
        levelDisplay.style.opacity = "0"

        setTimeout(() => {
            
            spawnAlien();

            requestAnimationFrame(moveEnemy);

            attackBullet();

        }, 2500);
        
    }, 2000);

}

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case "ArrowLeft":
            movingLeft = true;
            break;
        case "ArrowRight":
            movingRight = true;
            break;
        case " ":
            if (!shooting) {

                shooting = true
                if (!shootInterval) {

                    var d = 0

                    if (ship.getBoundingClientRect().left == game.getBoundingClientRect().left || Math.round(ship.getBoundingClientRect().right) == Math.round(game.getBoundingClientRect().right)) {
                        d = 0
                    } else {

                        if (movingLeft) {
                            if (movingRight) {
                                d = 0
                            } else {
                                d = -1
                            }
                        } else {
                            if (movingRight) {
                                d = 1
                            } else {
                                d = 0
                            }
                        }

                    }

                    shootBullet(d)

                    shootInterval = setInterval(() => {
                        if (!shooting) {
                            clearInterval(shootInterval)
                            shootInterval = null
                            return
                        }

                        var d = 0

                        if (ship.getBoundingClientRect().left == game.getBoundingClientRect().left || Math.round(ship.getBoundingClientRect().right) == Math.round(game.getBoundingClientRect().right)) {
                            d = 0
                        } else {

                            if (movingLeft) {
                                if (movingRight) {
                                    d = 0
                                } else {
                                    d = -1
                                }
                            } else {
                                if (movingRight) {
                                    d = 1
                                } else {
                                    d = 0
                                }
                            }

                        }

                        shootBullet(d)

                    }, 500)
                }

            }
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.key) {
        case "ArrowLeft":
            movingLeft = false;
            break;
        case "ArrowRight":
            movingRight = false;
            break;
        case " ":
            shooting = false;
            clearInterval(shootInterval)
            shootInterval = null
            break;
    }
});

const shootBullet = (direction) => {

    if (!canShoot) return;

    canShoot = false

    var bullet = document.createElement('div')
    bullet.classList.add('bullet')
    game.appendChild(bullet)

    let bulletPositionX = position + (shipWidth / 2) - 1;
    let bulletPositionY = ship.getBoundingClientRect().top

    bullet.style.left = `${bulletPositionX}px`
    bullet.style.top = `${bulletPositionY}px`

    var shootSoundClone = shootSound.cloneNode();
    shootSoundClone.volume = 0.08
    shootSoundClone.play()

    function moveBullet() {

        if (!bullet) return

        let bulletSpeedY = 2;
        bulletPositionY -= bulletSpeedY
        bullet.style.top = `${bulletPositionY}px`

        let d_y = ship.getBoundingClientRect().top - bulletPositionY

        var bulletSpeedX = moveSpeed * (1 - (d_y / game.clientHeight) ** (1 / 3))
        bulletPositionX += (bulletSpeedX * direction)
        bullet.style.left = `${bulletPositionX}px`

        var aliens = document.querySelectorAll("#enemy .alien-container");

        aliens.forEach((alien, index) => {

            let alienRect = alien.getBoundingClientRect();
            let bulletRect = bullet.getBoundingClientRect();

            if (alien.children[0].style.visibility != 'hidden' && (bulletRect.left < alienRect.right && bulletRect.right > alienRect.left && bulletRect.top < alienRect.bottom && bulletRect.bottom > alienRect.top)) {
                alien.children[0].style.visibility = 'hidden'
                const hitClone = hitSound.cloneNode();
                hitClone.volume = 0.08
                hitClone.play();
                let enemy_level
                if (alien.children[0].src.includes("alien-1")) {
                    enemy_level = 1
                } else if (alien.children[0].src.includes("alien-2")) {
                    enemy_level = 2
                } else {
                    enemy_level = 3
                }
                score += 10 * enemy_level
                updateScore()
                bullet.remove()

                let f = true
                let i = index - index % 12
                let z = i

                while(aliens[i]){
                    if(aliens[i].children[0].style.visibility != 'hidden'){
                        f = false
                        break;
                    }
                    i += 1
                }

                if(f == true){
                    while (aliens[z]) {
                        aliens[z].remove()
                        z += 1
                    }
                }

                return;
            }

        });

        if (bulletPositionX < 0 || bulletPositionX > document.body.clientWidth) {
            bullet.remove()
        }
        else if (bulletPositionY < 0) {
            bullet.remove()
        } else {
            requestAnimationFrame(moveBullet)
        }

    }

    requestAnimationFrame(moveBullet)

    setTimeout(() => {
        canShoot = true
    }, 250);

};

const spawnAlien = () => {
    let a_rows = 1 + Math.ceil((level - 1) / 3)
    let b_rows = 1 + Math.ceil((level - 2) / 3)
    let c_rows = 1 + Math.ceil((level - 3) / 3)
    for (i = 0; i < (a_rows + b_rows + c_rows); i++) {
        for (j = 0; j < 12; j++) {
            var alien = document.createElement('div')
            alien.classList.add('alien-container')
            enemy.appendChild(alien)
            var img = document.createElement('img')
            var n = 0
            if (i + 1 <= c_rows) {
                n = 3;
            } else if (i + 1 <= c_rows + b_rows) {
                n = 2
            } else {
                n = 1
            }
            img.src = `../assets/sprites/alien-${n}.png`
            img.classList.add('alien-img')
            alien.appendChild(img)
        }
    }
};

function moveEnemy() {

    if(enemy.innerHTML == "") return;

    var enemyLeftPos = enemy.offsetLeft;
    var enemyWidth = enemy.clientWidth;

    if (enemy.offsetTop + enemy.clientHeight >= game.clientHeight) return

    var flag = 1

    if (enemyLeftPos + enemyWidth >= game.clientWidth || enemyLeftPos < 0) {

        enemyDirection *= -1
        if (ship.getBoundingClientRect().top - enemy.getBoundingClientRect().bottom <= 40){
            enemy.style.top = `${enemy.offsetTop + (ship.getBoundingClientRect().top - enemy.getBoundingClientRect().bottom)}px`
            currentHealth = 0
            updateHealth()
            return
        }
        enemy.style.top = `${enemy.offsetTop + 40}px`;
        if (enemyLeftPos + enemyWidth >= game.clientWidth) {
            enemy.style.left = `${enemy.offsetLeft + (enemyLeftPos + enemyWidth - game.clientWidth + 5) * (-1)}px`;
            flag = 0
        }
    }

    if(flag == 1){
        enemy.style.left = `${enemy.offsetLeft + enemySpeed * enemyDirection}px`;
    }

    requestAnimationFrame(moveEnemy)

};

const attackBullet = () => {

    var aliens = document.querySelectorAll("#enemy .alien-container");

    if(aliens.length == 0) return;

    var attackers = []
    aliens.forEach((alien) => {
        if (alien.children[0].style.visibility != "hidden") {
            attackers.push(alien)
        }
    })

    var attacking = []

    for (var z = 0; z < level * 3; z++) {
        let selected = attackers[Math.round(Math.random() * (attackers.length))]
        if (attackers.length > level * 3 * 1.5) {
            while (attacking.includes(selected)) {
                selected = attackers[Math.round(Math.random() * (attackers.length))]
            }
        }
        attacking.push(selected)
    }

    attacking.forEach((attack_elem, index) => {

        var randomTime = Math.floor((Math.random() * 900) + 100)

        setTimeout(() => {

            if (!attack_elem) return;

            var enemy_bullet = document.createElement('div')
            enemy_bullet.classList.add('bullet-enemy')
            game.appendChild(enemy_bullet)

            let bulletPositionX = attack_elem.getBoundingClientRect().left + attack_elem.clientWidth / 2 - game.getBoundingClientRect().left;
            let bulletPositionY = attack_elem.getBoundingClientRect().bottom - game.getBoundingClientRect().top - attack_elem.clientHeight * 0.25

            enemy_bullet.style.left = `${bulletPositionX}px`
            enemy_bullet.style.top = `${bulletPositionY}px`

            const moveAttackBullet = () => {

                if (!enemy_bullet) return

                let bulletSpeedY = 2;
                bulletPositionY += bulletSpeedY
                enemy_bullet.style.top = `${bulletPositionY}px`

                let player_bullets = document.querySelectorAll(".bullet")
                var enemy_bulletRect = enemy_bullet.getBoundingClientRect();

                player_bullets.forEach((player_bullet) => {

                    let player_bulletRect = player_bullet.getBoundingClientRect();

                    if (((enemy_bulletRect.left > player_bulletRect.left && enemy_bulletRect.left < player_bulletRect.right) || (enemy_bulletRect.right > player_bulletRect.left && enemy_bulletRect.right < player_bulletRect.right)) && ((enemy_bulletRect.top > player_bulletRect.top && enemy_bulletRect.top < player_bulletRect.bottom) || (enemy_bulletRect.bottom > player_bulletRect.top && enemy_bulletRect.bottom < player_bulletRect.bottom))) {
                        var hitClone = hitSound.cloneNode();
                        hitClone.volume = 0.5
                        hitClone.play();
                        player_bullet.remove()
                        enemy_bullet.remove()
                        return;
                    }

                });

                if (enemy_bulletRect.left < ship.getBoundingClientRect().right && enemy_bulletRect.right > ship.getBoundingClientRect().left && enemy_bulletRect.top < ship.getBoundingClientRect().bottom && enemy_bulletRect.bottom > ship.getBoundingClientRect().top) {
                    currentHealth -= 100 * level
                    var dmClone = dmgSound.cloneNode();
                    dmClone.volume = 0.5
                    dmClone.play();
                    if (currentHealth < 0) currentHealth = 0
                    updateHealth()
                    enemy_bullet.remove()
                    return;
                }

                if (bulletPositionY > Math.max(window.innerHeight, document.body.clientHeight)) {
                    enemy_bullet.remove()
                } else {
                    requestAnimationFrame(moveAttackBullet)
                }

            }

            requestAnimationFrame(moveAttackBullet)

        }, (index * randomTime))

    })

    setTimeout(() => {
        attackBullet()
    }, level * 5000)

};

requestAnimationFrame(moveShip);

upLevel()