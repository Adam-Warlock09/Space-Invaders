//getting canvas
const canvas=document.getElementById("gameWindow");
const ctx=canvas.getContext('2d');
console.log("Canvas initialised");

let gameOver=false;		//checking for game over
let xoffset=50;		//offset for boundedness
let boffset=10;		//offset for bullet generation
let lastShotTime=Date.now();
let shotCoolDown=500;

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
let aliens=[];
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

function initaliseAliens(){
    let curX = 50;  // Dimensions are 60x30
    let curY = 50;
    for(let i = 1; i <= 5; i++){
        let row = [];
        for(let j = 1; j <= 5; j++){
            row.push({  // Adding an alien to a row
                posx: curX,
                posy: curY,
                vel: 1,
                dir: 1,
			  	height: 60,
			  	width: 30
            });
            curX += 70;
        }
        aliens.push(row);  // Adding a row to the alien matrix
        curY += 40;
        curX = 50;
    }
}


//fn to draw the player
drawCanvas=function(){
  //clearing canvas
  ctx.clearRect(0,0,canvas.width,canvas.height);
  player.draw() 	//drawing player
  
  aliens.forEach(function(row){
  	row.forEach((alien) => {
		ctx.fillStyle = 'White';
        ctx.fillRect(alien.posx, alien.posy, alien.width, alien.height);
	});
  });
  
  bullets.forEach(function(bullet) {	//drawing bullets
        ctx.fillStyle = 'White';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

//updating
function update(){
  //checking for boundedness
  	if ((player.dir==-1 && (player.x-(player.rectWidth/2)>0)) || (player.dir==1 && (player.x+(player.rectWidth/2)<canvas.width-xoffset))){
		player.x+=player.vel*player.dir;
	}
  	if (player.shoot==true){
	  //generate a bullet and add it to the active bullets array
		bullets.push({
			x: player.x+player.rectWidth/2,
		  	y: player.y - boffset,
		  	width: 2,
		  	height: 10,
		  	vel: 1,
		});
	  lastShotTime=Date.now()
	  player.shoot=false;	//make it false so that multiple bullets don't shoot
	}
	  // Update bullet positions
    bullets.forEach(function(bullet) {
        bullet.y -= bullet.vel;
    });

    // Remove bullets that have gone off-screen
    bullets = bullets.filter(function(bullet) {
        return bullet.y > 0;
    });
	
}

//setting up the inital canvas
function initialise(){
	initialiseAliens();
  	drawCanvas();
}

//main game loop
function gameLoop(){
  
	update(); 	//updates game state
  	drawCanvas(); 		//draws the current game state after updating
  
  	requestAnimationFrame(gameLoop);	//calling the loop again
}

//calling the game loop
gameLoop();