  //getting canvas
  const canvas=document.getElementById("gameWindow");
  const ctx=canvas.getContext('2d');
  console.log("Canvas initialised");

  let gameRunning=true;		//checking for game over
  let xoffset=50;		//offset for boundedness
  let boffset=10;		//offset for bullet generation
  let lastShotTime=Date.now();		//recordig intial time of start
  let shotCoolDown=500;	//shot cooldown time in ms
  let eShotCoolDown=10000;		//cooldown for enemy shots
  let eoffset=0; 		//enemyoffset for shooting
//defining the aliens matrix
  let columns=8;
  let rows=5;

  //player object
  let player={

	  x: canvas.width/2,	//inital x
	  y: canvas.height-50,	//initial y
	  rectHeight: 20,	//height of rect
	  rectWidth: 50,	//width of rect
	  vel: 0.8,	//speed
	  dir: 0,	//direction of motion
	  shoot: false,	//whether player is shooting or not
	  draw: function(){	//function to draw the player
		  ctx.fillStyle='Lime';
		  ctx.fillRect(this.x,this.y,this.rectWidth,this.rectHeight);
	  }
  };

  let bullets=[];		//array to store any active bullets the player shoots
  let aliens=[];		//array for the enemy grid
  let ebullets=[];		//array for enemy bullets
  //checking for key press
  document.addEventListener("keydown",(event)=>{
	  if(event.key==='ArrowLeft' || event.key==='a'){
		//moves to the left
		  player.dir=-1;
	  }
	else if(event.key==='ArrowRight' || event.key==='d'){
		  //moves to the right
		  player.dir=1;
	}
	else if(event.key==='g'){
		  //checks for shooting
		  if(Date.now()-lastShotTime>=shotCoolDown){
			  player.shoot=true;
		  }
	}
  });

  //checking for key lift
  document.addEventListener("keyup",(event)=>{
	  if(event.key==='ArrowLeft' || event.key==='ArrowRight' || event.key==='a' || event.key==='d'){
		//stops moving
		  player.dir=0;
	  }
	else if(event.key==='g'){
	  //stops shooting
		  player.shoot=false;
	}
  });

  function initialiseAliens(){
	  let curX = 50;  // Dimensions are 60x30
	  let curY = 50;	//initial x and y offsets
	  for(let i = 1; i <= rows; i++){
		  let row = [];
		  for(let j = 1; j <= columns; j++){
			  row.push({  // Adding an alien to a row
				  posx: curX,
				  posy: curY,
				  vel: 0.05,
				  dir: 1,
				  height: 30,
				  width: 70,
				  eShotTime: Date.now(),
				  shoot: function(){
				  		ebullets.push({
			 				x: this.posx+this.width/2,
			  				y: this.posy - eoffset,
			  				width: 2,
			 			 	height: 10,
			  				vel: 1,
						});
				  }
			  });
			  curX += 90;
		  }
		  aliens.push(row);  // Adding a row to the alien matrix
		  curY += 50;
		  curX = 50;
	  }
  }


  //fn to draw the player
  drawCanvas=function(){
	//clearing canvas
	ctx.clearRect(0,0,canvas.width,canvas.height);
	player.draw() 	//drawing player

	aliens.forEach(function(row){		//drawing the aliens
	  row.forEach((alien) => {
		  ctx.fillStyle = 'White';
		  ctx.fillRect(alien.posx, alien.posy, alien.width, alien.height);
	  });
	});

	bullets.forEach(function(bullet) {	//drawing bullets
		  ctx.fillStyle = 'White';
		  ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
	  });
	
	ebullets.forEach(function(bullet) {	//drawing ebullets
		  ctx.fillStyle = 'White';
		  ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
	  });
  }

  //updating
 function update(){
    // Handle player movement
    if ((player.dir == -1 && (player.x - (player.rectWidth / 2) > 0)) || 
        (player.dir == 1 && (player.x + (player.rectWidth / 2) < canvas.width - xoffset))) {
        player.x += player.vel * player.dir;
    }
    
    // Handle shooting
    if (player.shoot) {
        bullets.push({
            x: player.x + player.rectWidth / 2,
            y: player.y - boffset,
            width: 2,
            height: 10,
            vel: 1,
        });
        lastShotTime = Date.now();
        player.shoot = false; // Prevent multiple bullets
    }

    // Update bullet positions and check collisions
    bullets = bullets.filter(function(bullet) {
        bullet.y -= bullet.vel;
        let hit = false;
        
        aliens.forEach(function(row, rowIndex) {
            row.forEach(function(alien, alienIndex) {
                if (bullet.x < alien.posx + alien.width &&
                    bullet.x + bullet.width > alien.posx &&
                    bullet.y < alien.posy + alien.height &&
                    bullet.y + bullet.height > alien.posy) {
                    
                    hit = true;
                    aliens[rowIndex].splice(alienIndex, 1); // Remove alien
                }
            });
        });
        
        return !hit; // Keep bullets that haven't hit an alien
    });

    // Filter out empty rows of aliens
    aliens = aliens.filter(row => row.length > 0);

    // Update aliens' positions and handle shooting
    aliens.forEach(function(row) {
        if (((row[0].posx - (row[0].width / 2)) > 0 && row[0].dir == -1) || 
            (row[row.length - 1].dir == 1 && (row[row.length - 1].posx + (row[row.length- 1].width / 2)) < (canvas.width - xoffset))) {
            row.forEach(alien => alien.posx += alien.vel * alien.dir);
        } else {
            row.forEach(alien => {
                alien.dir *= -1;
                alien.posy += 50;
            });
        }
        
        // Randomly select an alien to shoot
        if (Math.random() < 0.02) {
            let randomAlienIndex = Math.floor(Math.random() * row.length);
            let alien = row[randomAlienIndex];
            if (Date.now() - alien.eShotTime >= eShotCoolDown) {
                alien.shoot();
                alien.eShotTime = Date.now();	//update last shot time
            }
        }
    });

    // Handle enemy bullets
    ebullets.forEach((ebullet, ebulletIndex) => {
        ebullet.y += ebullet.vel;
        if (ebullet.x < player.x + player.rectWidth &&
            ebullet.x + ebullet.width > player.x &&
            ebullet.y < player.y + player.rectHeight &&
            ebullet.y + ebullet.height > player.y) {
            ebullets.splice(ebulletIndex, 1);
            gameRunning = false; // End the game for now
        }
    });

    // Remove bullets that are off-screen
    bullets = bullets.filter(bullet => bullet.y > 0);
    ebullets = ebullets.filter(bullet => bullet.y < canvas.height);
}


  //setting up the initial canvas
  function initialise(){
	  initialiseAliens();
	  drawCanvas();
  }

  //main game loop
  function gameLoop(){

	  update(); 	//updates game state
	  drawCanvas(); 		//draws the current game state after updating
	  if(gameRunning){
		  requestAnimationFrame(gameLoop);	//calling the loop again
	  }
  }	

  //calling the game loop
  initialise();
  gameLoop();

if (!gameRunning){
	console.log("Game Over!");
}