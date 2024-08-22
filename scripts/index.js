const game = document.getElementById("game");
const ship = document.getElementById("ship");
const enemy = document.getElementById("enemy");

const gameWidth = game.clientWidth;
const shipWidth = ship.clientWidth;

var shooting = false
var shootInterval = null
var canShoot = true

var score = 0
var damage = 0

var position = ship.getBoundingClientRect().left - game.getBoundingClientRect().left;

let movingLeft = false;
let movingRight = false;
var enemyDirection = 3;

let moveSpeed = 5;
let enemySpeed = 0.4;

let level = 1;

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

    function moveBullet() {

        if (!bullet) return

        let bulletSpeedY = 5;
        bulletPositionY -= bulletSpeedY
        bullet.style.top = `${bulletPositionY}px`

        let d_y = ship.getBoundingClientRect().top - bulletPositionY

        var bulletSpeedX = moveSpeed * (1 - (d_y / game.clientHeight) ** (1 / 3))
        bulletPositionX += (bulletSpeedX * direction)
        bullet.style.left = `${bulletPositionX}px`

        var aliens = document.querySelectorAll("#enemy .alien-container");

        aliens.forEach((alien) => {

            let alienRect = alien.getBoundingClientRect();
            let bulletRect = bullet.getBoundingClientRect();

            if (alien.children[0].style.visibility != 'hidden' && (bulletRect.left < alienRect.right && bulletRect.right > alienRect.left && bulletRect.top < alienRect.bottom && bulletRect.bottom > alienRect.top)) {
                alien.children[0].style.visibility = 'hidden'
                if(alien.children[0].src == "http://127.0.0.1:5500/assets/sprites/alien-1.png"){
                    
                }
                score += 10
                bullet.remove()
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
    }, 450);

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

    var enemyLeftPos = enemy.offsetLeft;
    var enemyWidth = enemy.clientWidth;

    if (enemy.offsetTop + enemy.clientHeight >= game.clientHeight) return

    if (enemyLeftPos + enemyWidth >= game.clientWidth || enemyLeftPos < 0) {

        console.log
        enemyDirection *= -1
        enemy.style.top = `${enemy.offsetTop + 60}px`;
        if (enemyLeftPos + enemyWidth >= game.clientWidth) {
            enemy.style.left = `${enemy.offsetLeft + (enemyLeftPos + enemyWidth - game.clientWidth) * enemyDirection}px`;
        }
    }

    enemy.style.left = `${enemy.offsetLeft + enemySpeed * enemyDirection}px`;

    setTimeout(() => {

    }, 50);
    requestAnimationFrame(moveEnemy)

};

const attackBullet = () => {

    var aliens = document.querySelectorAll("#enemy .alien-container");
    var attackers = []
    aliens.forEach((alien) => {
        if (alien.children[0].style.visibility != "hidden") {
            attackers.push(alien)
        }
    })

    var attacking = []

    for (z = 0; z < level * 3; z++) {
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

                let bulletSpeedY = 5;
                bulletPositionY += bulletSpeedY
                enemy_bullet.style.top = `${bulletPositionY}px`

                let player_bullets = document.querySelectorAll(".bullet")
                var enemy_bulletRect = enemy_bullet.getBoundingClientRect();

                player_bullets.forEach((player_bullet) => {

                    let player_bulletRect = player_bullet.getBoundingClientRect();

                    if (((enemy_bulletRect.left > player_bulletRect.left && enemy_bulletRect.left < player_bulletRect.right) || (enemy_bulletRect.right > player_bulletRect.left && enemy_bulletRect.right < player_bulletRect.right)) && ((enemy_bulletRect.top > player_bulletRect.top && enemy_bulletRect.top < player_bulletRect.bottom) || (enemy_bulletRect.bottom > player_bulletRect.top && enemy_bulletRect.bottom < player_bulletRect.bottom))) {
                        player_bullet.remove()
                        enemy_bullet.remove()
                        return;
                    }

                });

                if (enemy_bulletRect.left < ship.getBoundingClientRect().right && enemy_bulletRect.right > ship.getBoundingClientRect().left && enemy_bulletRect.top < ship.getBoundingClientRect().bottom && enemy_bulletRect.bottom > ship.getBoundingClientRect().top) {
                    damage += 1
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

spawnAlien();

// requestAnimationFrame(moveEnemy)

// attackBullet()