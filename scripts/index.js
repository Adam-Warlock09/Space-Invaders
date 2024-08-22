const game = document.getElementById("game");
const ship = document.getElementById("ship");
const enemy = document.getElementById("enemy");

const gameWidth = game.clientWidth;
const shipWidth = ship.clientWidth;

var shooting = false
var shootInterval = null
var canShoot = true

var position = ship.getBoundingClientRect().left - game.getBoundingClientRect().left;

let movingLeft = false;
let movingRight = false;

let moveSpeed = 5;

let level = 2;

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

    const moveBullet = () => {

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

}

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

const attackBullet = () => {
    
    var aliens = document.querySelectorAll("#enemy .alien-container");
    var attackers = []
    
    for (z = 0; z < level; z++) {
        attackers.push(Math.round(Math.random() * (11) + ((12 * z) + 1)))
        attackers.push(Math.round(Math.random() * (11) + ((12 * z) + 1)))
        attackers.push(Math.round(Math.random() * (11) + ((12 * z) + 1)))
    }

    console.log(attackers)
    
    attackers.forEach((index) => {
        
        index *= -1
        console.log(aliens[aliens.length + index])
        var bullet = document.createElement('div')
        bullet.classList.add('bullet-enemy')
        let attack_elem = aliens[aliens.length + index]
        attack_elem.appendChild(bullet)
        
        let bulletPositionX = aliens[aliens.length + index].getBoundingClientRect().left + aliens[aliens.length + index].clientWidth / 2 - enemy.getBoundingClientRect().left;
        let bulletPositionY = aliens[aliens.length + index].getBoundingClientRect().bottom - enemy.getBoundingClientRect().top 
    
        bullet.style.left = `${bulletPositionX}px`
        bullet.style.top = `${bulletPositionY}px`

    })


    // const moveAttackBullet = (bullet) => {

    //     let bulletSpeedY = 5;
    //     bulletPositionY += bulletSpeedY
    //     bullet.style.top = `${bulletPositionY}px`


    //     aliens.forEach((alien) => {

    //         let alienRect = alien.getBoundingClientRect();
    //         let bulletRect = bullet.getBoundingClientRect();

    //         if (alien.children[0].style.visibility != 'hidden' && (bulletRect.left < alienRect.right && bulletRect.right > alienRect.left && bulletRect.top < alienRect.bottom && bulletRect.bottom > alienRect.top)) {
    //             alien.children[0].style.visibility = 'hidden'
    //             bullet.remove()
    //             return;
    //         }

    //     });

    //     if (bulletPositionY > document.body.clientHeight) {
    //         bullet.remove()
    //     } else {
    //         requestAnimationFrame(moveAttackBullet)
    //     }

    // }

    // requestAnimationFrame(moveAttackBullet)

}

requestAnimationFrame(moveShip);

spawnAlien();

attackBullet()