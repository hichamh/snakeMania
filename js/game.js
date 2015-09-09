$( function()
{
	var finalScore;
	$(".start").click(game);
	$(".instruction").click(instructions);
	$(".score").click(highScores);
	$(".menu").click(menu);
	function game () 
	{
		
		$("#ad").css({'display':'none'});
		$("#loading").css({'display':'none'});
		$("#menu").css({'display':'none'});
		$("#gameOver").css({'display':'none'});
		$("#game").css({'display':'block'});
		
		//global vars
		var stage;
		var myCanvas = $("#game")[0];
		var secondCanvas = $("#finish")[0];
		var w = $("#game").width();
		var h = $("#game").height();
		var cw = 10;//cell width
		var difficulty;//difficulty of the game, the value of this variable changes the game level, it constantly increases as the game goes on
		var directionSnake;// will be set to right by default in init()
		var bool;//for the hungry snakes movement to be two times slower
		var powerUpState;//holds if a powerup is on and which one using its type
		var powerUpTime;//hold the time at which the power up was consumed
		var snakeTextTime;//hold the time at which the snake text appeared
		var enterPressed; //for the menu
		var multiplier;//multiplies the score of the food
		
		//colors
		//snake color
		var white = createjs.Graphics.getRGB(255,255,255);
		var black = createjs.Graphics.getRGB(0,0,0);
		//food colors
		var yellow = createjs.Graphics.getRGB(255,255,0);
		var red = createjs.Graphics.getRGB(255,0,0);
		var orange = createjs.Graphics.getRGB(255,165,0) ;
		//enemy colors
		var LSColor = createjs.Graphics.getRGB(188,143,143) ;
		var green = createjs.Graphics.getRGB(0,255,0);
		//powerups colors
		var neonGreen = createjs.Graphics.getRGB(172,233,0,1.5);//for kill enemies
		var neonPurple = createjs.Graphics.getRGB(204,55,194,1.5);//for slow ennemies
		var neonOrange = createjs.Graphics.getRGB(255,153,51,1.5);//life +1
		var neonPink = createjs.Graphics.getRGB(255,36,164,1.5);//can eat snake
		var neonBlueSky = createjs.Graphics.getRGB(70,288,188,1.5);//reduce size
		var darkGolden = createjs.Graphics.getRGB(184,134,11,1.5);//immortality
		
		//Menu Objects
		var title = new createjs.Text("Snake 2.0","bold 40px impact");
		var instructions = new createjs.Text("", "bold 20px impact")
		instructions.text = "1- Collect the squares for points\n 2- Avoid the lost snakes and hungry snakes! \n 3- Collect the power ups to survive longer! \n Press an Arrow to start the game :)";
		title.x = 200;
		title.y = 100;
		instructions.x = 100;
		instructions.y = 180;
		
	
		//game objects
		var score;//init to 0
		var life;//init to 3
		var snakeArray; //container for the snake
		var lostSnakeHandlerArray;//handles the storing of lost snakes
		var hungrySnakeHandlerArray;//handles the storing of the hungry snakes
		var scoreText = new createjs.Text("","bold 15px impact");
		scoreText.alpha = .5;
		var lifeText = new createjs.Text("","bold 15px impact");
		lifeText.alpha = .5;
		var diffText = new createjs.Text("","bold 15px impact");
		diffText.alpha = .5;
		var snakeText = new createjs.Text("","bold 15px impact");
		snakeText.outline = true;
		snakeText.alpha = .8;
		var multiplierText = new createjs.Text("","bold 15px impact");
		multiplierText.alpha = .5;
		var foodHolder;//holds the food
		var powerUpsHolder;//holds the powerUps
		
		
		//sounds		
		var soundBG = document.getElementById("mainMusic");
		var soundFood = document.getElementById("food");
		var soundPowerUp = document.getElementById("powerUp");
		var soundGO = document.getElementById("soundGameOver");
		var soundLifeUp = document.getElementById("soundLifeUp");
		var soundReduceSize = document.getElementById("soundReduceSize");
		var soundKillEnemies = document.getElementById("soundKillEnemies");
		var soundHurt = document.getElementById("soundHurt");
		init();
		/*
		 * initializes the game, resets it too
		 */
		
		function init()
			{
				stage = new createjs.Stage(myCanvas);//the stage contains our convas element
				
				var g = new createjs.Graphics();
				g.setStrokeStyle(1); // stroke of 1pixel
			//set the stroke color to white, with an alpha of .7
				g.beginStroke(white);
				g.beginFill(black);
				g.drawRect(0,0,w,h);//drawRect(x,y,width,height)
				var rect = new createjs.Shape(g);
				stage.addChild(rect);
				
				
				soundGO.pause();
				soundBG.pause();
				soundBG.currentTime = 0;
				soundBG.play();
				score = 0;
				life = 3;
				bool = false;
				difficulty = 0.01//the difficulty is increased at 0.00001 per tick;
				foodHolder = new Object();
				powerUpsHolder = [];
				powerUpState = "null";//no power up
				powerUpTime = 0;
				multiplier = 1;
				
				
				createSnake();
				createLostSnakeHandler();
				createHungrySnakeHandler();
				createFood();
				stage.addChild(scoreText);
				stage.addChild(diffText);
				stage.addChild(lifeText);
				stage.addChild(snakeText);
				stage.addChild(multiplierText);
				
				
			
				paintUDI();
				stage.update();
				//to have a gameloop 30 frames per sec
				createjs.Ticker.setFPS(20);
				createjs.Ticker.addListener(stage);
				
			}//end of init function
	
		//$("#start").click(init());
		//game loop, 
		stage.tick = function ()
		{
			
			//increments the difficulty
			difficulty += 0.00003;
			score += (0.1 * multiplier);
			moveSnake();
			lostSnakeHandler();
			hungrySnakeHandler();
			powerUpsHandler();
			
			paintUDI();
			
			stage.update();
			
		}//end of tick fct , game loop
		
		
		function createSnake()
		{
			
			var length = 4; //Length of the snake
			directionSnake = "right";
			snakeArray = []; //Empty array to start with
			for(var i = length-1; i>=0; i--)
			{
				//This will create a horizontal snake starting from the top left in the container
				
				var shape = new createjs.Shape();
				shape = paintCell(white);//paintCell has the code to paint a 10x10 px block
				shape.x = i*cw;//we place it horizentally by default, starting from (0,0)
				shape.y = 250;
				snakeArray.push(shape);
			}//end of for loop\
			//adds the container the stage and update
			for(var i=0;i<snakeArray.length;i++)
			{
			stage.addChild(snakeArray[i]);
			}
			
		}//end of createSnake	
		
		/*
		 * 1- increments the snake position depending on the direction
		 * 2- check for snake out of boudanry clauses and self collision
		 * 3- check collision with lost snakes
		 * 4- check collision with hungry snakes
		 * 5- check collision with powerups
		 * 6- check collision with food
		 * 7- movement code for snake
		 */
		
		
		function moveSnake()
		
		{
			var nextX = snakeArray[0].x;
			var nextY = snakeArray[0].y;
	
			// 1- we increment the position depending on the direction
			if(directionSnake == "right") nextX += 10;
			else if(directionSnake == "left") nextX -= 10;
			else if(directionSnake == "up") nextY-= 10;
			else if(directionSnake == "down") nextY+= 10;
		
			// 2- now for boundaries collision check, if out of boundary or self collision restart game
			if(check_collision(nextX, nextY, snakeArray))
			{
				
				killGame();
				return;
			}
			if(nextX < 0 || nextX > w || nextY < 0 || nextY > h )
			{
				killGame();
				return;
			}
			
			
			
			//3- code for collision with Lost Snakes
			for(var i =0; i < lostSnakeHandlerArray.length; i++)
			{
				lostSnake = lostSnakeHandlerArray[i].lostSnakeArray;
				//collision with the head of the lostSnake , life -1
				
				for(var j =0; j < lostSnake.length; j++)
				{
					
					
					
					var LSbool = false;
					if((nextX == lostSnake[j].x && nextY == lostSnake[j].y) || (snakeArray[0].x == lostSnake[j].x && snakeArray[0].y == lostSnake[j].y) )	
					{
						life--;
						LSbool = true;
						if(life <= 0) { killGame(); return;}
					}
					
					if(LSbool == true) 
					{ 
						multiplier =1;
						killLostSnake(lostSnake, i);
						soundHurt.pause();
						soundHurt.currentTime = 0;
						soundHurt.play();
						snakeText.text = "Ouch";
						snakeTextTime = createjs.Ticker.getTime();
						//soundGotHurt.play();
					}
					
				}
			}
		
			//4- code for collision with Hungry Snakes
			for(var i =0; i < hungrySnakeHandlerArray.length; i++)
			{
				hungrySnake = hungrySnakeHandlerArray[i].hungrySnakeArray;
				//collision of the head with the hungrySnake , life -1
				var HSbool = false;
				
				for(var j = 0; j < hungrySnake.length; j++)
				{
					if((nextX == hungrySnake[j].x && nextY == hungrySnake[j].y)  )	
					{
						HSbool = true;
						life--;
						if(life <= 0) { killGame(); return;}
						
					}
				}
				
				if(HSbool == true) 
				{ 
					multiplier = 1;
					killHungrySnake(hungrySnake, i);
					//soundGotHurt.play();
					soundHurt.pause();
					soundHurt.currentTime = 0;
					soundHurt.play();
					snakeText.text = "Ouch";
					snakeTextTime = createjs.Ticker.getTime();
				}	
			}	
			
			
			//5- check collision with powerups
			for(var i =0; i < powerUpsHolder.length; i++)
			{
				var PUp = powerUpsHolder[i];
				if(nextX == PUp.powerUp.x && nextY == PUp.powerUp.y)
				{
					powerUpState = PUp.type;
					killPowerUp(i);
					powerUpTime = createjs.Ticker.getTime();
					snakeTextTime = powerUpTime;
					snakeTalk(PUp.type) ;
					if(powerUpState == "lifeUp")
					{
						soundLifeUp.pause();
						soundLifeUp.currentTime = 0;
						soundLifeUp.play();
					}
					else if(powerUpState == "reduceSize")
					{
						soundReduceSize.pause();
						soundReduceSize.currentTime = 0;
						soundReduceSize.play();
					}
					else if(powerUpState == "killEnemies")
					{
						soundKillEnemies.pause();
						soundKillEnemies.currentTime = 0;
						soundKillEnemies.play();
					}
					
					
					 
				}
				
			}
			//6- code for collision with food => score + 50
			if(nextX == foodHolder.food.x && nextY == foodHolder.food.y)
			{/*snake eats food lol
			/*
			 * 
			 */	
				var shape = new createjs.Shape();
				shape = paintCell(white); 
				shape.x = nextX; shape.y = nextY; 
				snakeArray.unshift(shape);
				var scoreToAdd;
				stage.addChild(snakeArray[0]);
				if(foodHolder.Type  == "red") {scoreToAdd = (60 * multiplier); snakeText.text = scoreToAdd.toString();}
				else if(foodHolder.Type == "orange") {scoreToAdd = (40 * multiplier); snakeText.text = scoreToAdd.toString();}
				else {scoreToAdd = (20 * multiplier); snakeText.text = scoreToAdd.toString() ;}//yellow
				score += scoreToAdd;
				multiplier++;
				//The snake can now eat the food.
				// and we need to Create new food somewhere in the stage
				snakeTextTime = createjs.Ticker.getTime();
				soundFood.pause();
				soundFood.currentTime = 0;
				soundFood.play();
							
							
				//soundFood.play();			
				moveFood();
			}
			else
			{
				var tail = snakeArray.pop(); //pops out the last cell
				tail.x = nextX; tail.y = nextY;
				snakeArray.unshift(tail); //puts back the tail as the first cell
			}
			//The snake can now eat the food.
		
			
		
		}//end of moveSnake   
		
		/*
		 * initializes the hungry snake handler, 
		 * called by init()
		 */
		function createHungrySnakeHandler()
		{
			
			hungrySnakeHandlerArray = [];
			
		}
	
		
		/*
		 * handles the hungry snakes creation and movement of the existing hungry snakes on screen
		 * called from the game loop
		 */
		function hungrySnakeHandler()
		{
			
			if(Math.random()<.4 * difficulty)//set factor to .5
			{
			createHungrySnake();
			
			}
			
			if(bool == true)
			{
			moveHungrySnakes();
			bool = false;
			}
			else
			{
				bool = true;
			}
			
		}
		
		/*
		 * handles the lost snakes creation and movement of the existing lost snakes on screen
		 * called from the game loop
		 */
		
		function createHungrySnake ()

		{
			var HSArray = [];// this will store the hungrysnake for the purposes of this function
			var length = 3;
			var x;
			var y;
			var hungrySnakeDirection;
			//placement code
			var position = Math.floor((Math.random()*4)+1);
			
			if (position== 1)	{ x = Math.floor(Math.random()*39) * 10;  y = -20 ;  hungrySnakeDirection = "down"}//starts at the top going down
			if (position== 2)	{ x = Math.floor(Math.random()*39) * 10;  y = h  ;  hungrySnakeDirection = "up"}//starts at the bottom going up
			if (position== 3)	{ x = -20;  y = Math.floor(Math.random()*39) * 10;   hungrySnakeDirection = "right"}
			if (position== 4)	{ x = w ;  y = Math.floor(Math.random()*39) * 10;   hungrySnakeDirection = "left"}
			for(var i = length-1; i>=0; i--)
			{
				//This will create a horizontal snake starting from the top left in the container
				var shape = new createjs.Shape();
				shape = paintCell(green);//paintCell has the code to paint a 10x10 px block
				if(hungrySnakeDirection == "right" || hungrySnakeDirection == "left")  {shape.x = x + (i * cw); shape.y = y ;}
				else 	{shape.x = x ; shape.y = y + (i * cw) ; }
				
				
				
				HSArray.push(shape);
			}//end of for loop\
			for(var i=0;i<HSArray.length;i++)
			{
			stage.addChild(HSArray[i]);//we add every block of this snake to the stage
			
			}

			hungrySnakeHandlerArray.push({hungrySnakeArray: HSArray, direction : hungrySnakeDirection});//add the new instance to the hungrySnake handler
		}
		
		function moveHungrySnakes ()
		{
			for(var i = 0;i< hungrySnakeHandlerArray.length;i++)
				{
					var hungrySnake = hungrySnakeHandlerArray[i].hungrySnakeArray;// holds each hungry snake in the handler for the purposes of the function
					var direction   = hungrySnakeHandlerArray[i].direction;				
					var nextX = hungrySnake[0].x;// the next X position of the hungrySnake
					var nextY = hungrySnake[0].y;//the next Y
					var snakeHead = snakeArray[0];
					var hungrySnakeHead = hungrySnake[0];
	
					//we increment the position depending on the position of the sneak head 
					var deltaX = hungrySnakeHead.x - snakeHead.x;
					var deltaY = hungrySnakeHead.y - snakeHead.y;
					
					
					if(Math.abs(deltaX) > Math.abs(deltaY))
					{
						if(deltaX > 0)
						{
							if(direction != "right")
							{
								nextX -= cw;
								direction = "left";
							}
							else//direction is right, either go up or down depending on deltaY
							{
								if(deltaY > 0) {nextY -= cw; direction = "up";}
								else 		   {nextY += cw; direction = "down";}	
							}
						}
						else// deltaX < 0
						{
							if(direction != "left")
							{
								nextX += cw;
								direction = "right";
							}
							else//direction is left, either go up or down depending on deltaY
							{
								if(deltaY > 0) {nextY -= cw; direction = "up";}
								else 		   {nextY += cw; direction = "down";}	
							}
						}
					}
					else if ( Math.abs(deltaX) < Math.abs(deltaY))
					{
						if(deltaY > 0)
						{
							if(direction != "down")
							{
								nextY -= cw;
								direction = "up";
							}
							else//direction is down, either go right or left depending on deltaX
							{
								if(deltaX > 0) {nextX -= cw; direction = "left";}
								else 		   {nextX += cw; direction = "right";}	
							}
						}
						else// deltaY < 0
						{
							if(direction != "up")
							{
								nextY += cw;
								direction = "down";
							}
							else//direction is up, either go right or left depending on deltaX
							{
								if(deltaX > 0) {nextX -= cw; direction = "left";}
								else 		   {nextX += cw; direction = "right";}	
							}
						}	
					}
					
					else //deltaX == deltaY
					{
						var r = Math.floor(Math.random()*2); //gives me a num between 0 and 1 
						if(r == 0) // r = 0 so we change deltaX
						{
							if(deltaX > 0)
							{
								if(direction != "right")
								{
									nextX -= cw;
									direction = "left";
								}
								else//direction is right, either go up or down depending on deltaY
								{
									if(deltaY > 0) {nextY -= cw; direction = "left";}
									else 		   {nextY += cw; direction = "left";}	
								}
							}
							else// deltaX < 0
							{
								if(direction != "left")
								{
									nextX += cw;
									direction = "right";
								}
								else//direction is left, either go up or down depending on deltaY
								{
									if(deltaY > 0) {nextY -= cw; direction = "right";}
									else 		   {nextY += cw; direction = "right";}	
								}
							}
						}
						else// r = 1, so we change deltaY
							{
								if(deltaY > 0)
								{
									if(direction != "down")
									{
										nextY -= cw;
									direction = "up";
									}
									else//direction is down, either go right or left depending on deltaX
									{
										if(deltaX > 0) {nextX -= cw; direction = "left";}
										else 		   {nextX += cw; direction = "right";}	
									}
								}
								else// deltaY < 0
								{
									if(direction != "up")
									{
										nextY += cw;
										direction = "down";
									}
									else//direction is up, either go right or left depending on deltaX
									{
										if(deltaX > 0) {nextX -= cw; direction = "left";}
										else 		   {nextX += cw; direction = "right";}	
									}
								}	
							}
					}
					var tail = hungrySnake.pop(); //pops out the last cell
					tail.x = nextX; tail.y = nextY;
					hungrySnake.unshift(tail); //puts back the tail as the first cell
					
					
					
					
					if(nextX < 0 || nextX > w  || nextY < 0 || nextY > h )
					//kill the snake since out of boundary
					{
						killHungrySnake(hungrySnake, i);
					}
					
					
				}
		}

		function killHungrySnake(hungryS, i)
		{
			for(var j = 0;j<hungryS.length;j++)
						{
							stage.removeChild(hungryS[j]);
						}
						hungrySnakeHandlerArray.splice(i,1);
		}


		/*
		 * initializes the lost snake handler, 
		 * called by init()
		 */
		function createLostSnakeHandler()
		{
			
			lostSnakeHandlerArray = [];
			
		}
		
		/*
		 * handles the lostSnakes creation during the game
		 */
		function lostSnakeHandler()
		{
			if(Math.random()<.6 *difficulty)
			{
 			createLostSnake();
			}
			moveLostSnakes();
		}
		
		/*
		 * creates a lost snake and stores it into the lostSnakeHandlerArray 
		 * called by lostSnakeHandler()
		 */
		function createLostSnake ()
		{
			var LSArray = [];//will store the created lost snake for the function purposes
			var length = 2;
			var x;
			var y;
			var lostSnakeDirection;
			//placement code
			var position = Math.floor((Math.random()*4)+1);
			
			if (position== 1)	{ x = Math.floor(Math.random()*39) * 10;  y = -20 ;  lostSnakeDirection = "down"}//starts at the top going down
			if (position== 2)	{ x = Math.floor(Math.random()*39) * 10;  y = h  ;  lostSnakeDirection = "up"}//starts at the bottom going up
			if (position== 3)	{ x = -20;  y = Math.floor(Math.random()*39) * 10;   lostSnakeDirection = "right"}
			if (position== 4)	{ x = w ;  y = Math.floor(Math.random()*39) * 10;   lostSnakeDirection = "left"}
			for(var i = length-1; i>=0; i--)
			{
				//This will create a horizontal snake starting from the top left in the container
				var shape = new createjs.Shape();
				shape = paintCell(LSColor);//paintCell has the code to paint a 10x10 px block
				if(lostSnakeDirection == "right" || lostSnakeDirection == "left")  {shape.x = x + (i * cw); shape.y = y ;}
				else 	{shape.x = x ; shape.y = y + (i * cw) ; }
				
				
				
				LSArray.push(shape);
			}
			//end of for loop\
			for(var i=0;i<LSArray.length;i++)
			{
			stage.addChild(LSArray[i]);//add every block of the created lostsnake in the array
			
			}

			lostSnakeHandlerArray.push({lostSnakeArray : LSArray, direction : lostSnakeDirection});//add the lostsnake to the lostSnakes handler
		}
		/*
		 * moves each lost snake in lostSnakes handler, check for boundary collisions
		 */
		function moveLostSnakes ()
		{
			for(var i = 0;i< lostSnakeHandlerArray.length;i++)
				{
					var lostSnake = lostSnakeHandlerArray[i].lostSnakeArray;
					var directionLS = lostSnakeHandlerArray[i].direction;
					var nextX = lostSnake[0].x;
					var nextY = lostSnake[0].y;
	
					//we increment the position depending on the direction
					if(directionLS == "right") nextX += 10;
					else if(directionLS == "left") nextX -= 10;
					else if(directionLS == "up") nextY-= 10;
					else if(directionLS == "down") nextY+= 10;
					var tail = lostSnake.pop(); //pops out the last cell
					tail.x = nextX; tail.y = nextY;
					lostSnake.unshift(tail); //puts back the tail as the first cell
					
					if(nextX < 0 || nextX > w  || nextY < 0 || nextY > h )
					//kill the snake since out of boundary
					{
						killLostSnake(lostSnake, i);
						
					}
					
					
				}
		}
		
		
		
		/*
		 * param : lost Snake array, index of the instance in the handler
		 * return nothing
		 * basicly removes every block of the snake from the stage then delete the instance of the snake from the handler ==> frees the ram
		 */
		function killLostSnake(lostS, i)
		{
			for(var j = 0;j<lostS.length;j++)
						{
							stage.removeChild(lostS[j]);
						}
						lostSnakeHandlerArray.splice(i,1);
		}
		
		
		/*
		 * create food at a random position, 3 types of food: red = 60 pts, orange = 40 pts, yellow = 20 pts
		 */
		function createFood()
		{
			var random = Math.floor(Math.random()*6);
			var C;
			var T;
			if(random == 0)		{C = red; T = "red";}
			else if(random == 1 || random == 2 )	{C = orange; T = "orange" ;}
			else  if( random == 3 || random == 4 || random == 5)	{C = yellow; T = "yellow";}
			var shape = new createjs.Shape();
				shape = paintCell(C);//paintCell has the code to paint a 10x10 px block
				shape.x = Math.floor(Math.random()*38 + 1) * 10;//places the food block somewhere in the stage
				shape.y = Math.floor(Math.random()*38 + 1) * 10;
				
			var F = shape;
			foodHolder.food = F;
			foodHolder.Color = C;
			foodHolder.Type = T;
			
				
			
			stage.addChild(F);
			
		}
		
		
		/*
		 * moves the food to a new position, and change the type of the food
		 */
		function moveFood()

		{
			stage.removeChild(foodHolder.food);
			
			var random = Math.floor(Math.random()*6);
			var C;
			var T;
			if(random == 0)		{C = red; T = "red";}
			else if(random == 1 || random == 2 )	{C = orange; T = "orange" ;}
			else  if( random >= 3)	{C = yellow; T = "yellow"}
			var shape = new createjs.Shape();
				shape = paintCell(C);//paintCell has the code to paint a 10x10 px block
				shape.x = Math.round(Math.random()*38 + 1) * 10;//places the food block somewhere in the stage
				shape.y = Math.round(Math.random()*38 + 1) * 10;
				
			var F = shape;
			foodHolder.food = F;
			foodHolder.Color = C;
			foodHolder.Type = T;
			
				
			
			stage.addChild(F);
			
		}
		
		function snakeTalk(type)
					{
						if(type == "killEnemies")
						{
							snakeText.text = "All die!";
						}
						else if(type == "lifeUp")
						{
							snakeText.text = "Life Up";
						}
						else if(type == "reduceSize")
						{
							snakeText.text = "size Reduced";
						}
						
					}
		
		/*
		 * initializes the powerUpsHandler
		 */
		
		/*
		 * creates a power up every X seconds depending on difficulty
		 */
		function powerUpsHandler()
		{
			if(Math.random()<.35 * difficulty)//set factor to .8
			{
			createPowerUp();
			}
			for(var i = 0; i< powerUpsHolder.length;i++)
			{
				if((createjs.Ticker.getTime() - powerUpsHolder[i].timeCreation) > 3000)//if the power up was there for more than 3s
				{
					killPowerUp(i);
					
				}
			}
			if(powerUpState != "null")
			{
				if(powerUpState == "lifeUp")//life +1 
				{
					//soundBG.setVolume(20);
					//soundLifeUp.play();
					//soundBG.setVolume(10);
					life++;
					powerUpState = "null";
					powerUpTime = 0;
				}
				else if(powerUpState == "reduceSize")//reduce size by 2
				{
					if(snakeArray.length > 5)
					{
						stage.removeChild(snakeArray.pop());
						stage.removeChild(snakeArray.pop());
						powerUpState = "null";
						powerUpTime = 0;
						
					}
				}
				else if(powerUpState == "killEnemies")//state =  killEnemies  
				{
					
					for(var i = 0; i < hungrySnakeHandlerArray.length;i++)
					{
						var hungrySnake= hungrySnakeHandlerArray[i].hungrySnakeArray;
						for(var j = 0;j<hungrySnake.length;j++)
						{
							stage.removeChild(hungrySnake[j]);
						} 
					}
					hungrySnakeHandlerArray = [];
					
					
					for(var i = 0; i < lostSnakeHandlerArray.length;i++)
					{
						var lostSnake = lostSnakeHandlerArray[i].lostSnakeArray;
						for(var j = 0;j<lostSnake.length;j++)
						{
							stage.removeChild(lostSnake[j]);
						} 
					}
					lostSnakeHandlerArray = [];
				
					
					powerUpState = "null";
					 
				}
			}
		}
		/*
		 * kills the power up
		 */
		function killPowerUp(i)
		{
			stage.removeChild(powerUpsHolder[i].powerUp);
			powerUpsHolder.splice(i, 1);
		}
		/*
		 * creates a power up, adds it to
		 */
		function createPowerUp() 
		{
			
			var random = Math.floor(Math.random()*6);
			var C;
			var T;//type
			var timeC = createjs.Ticker.getTime();//holds the time of creation
			if(random == 0)		{C = neonGreen; T = "killEnemies";}//kills all the enemies on screen
			else if(random == 1 || random == 2  )	{C = neonOrange; T = "lifeUp";}// life +1
			else  if( random >= 3)	{C = neonBlueSky; T = "reduceSize";}//reduces the size by 2
			
			var shape = new createjs.Shape();
				shape = paintCircle(C);//paintCell has the code to paint a 10x10 px block
				shape.x = Math.round(Math.random()*49) * cw;//places the food block somewhere in the stage
				shape.y = Math.round(Math.random()*49) * cw;
				
			var F = shape;
			powerUpsHolder.push(
				{	
					powerUp : F,
					color : C,
					type: T,
					timeCreation : timeC
				}); 
			
			
				
			
			stage.addChild(F);
		}
		

		function check_collision(x, y, array)
		{
			//This function will check if the provided x/y coordinates exist
			//in an array of cells or not
			for(var i = 0; i < array.length; i++)
			{
				if(array[i].x == x && array[i].y == y)
				 return true;
			}
			return false;
		}
		
		function paintCell(color)
		{
			var g = new createjs.Graphics();
			g.setStrokeStyle(1); // stroke of 1pixel
			//set the stroke color to white, with an alpha of .7
			g.beginStroke(black);
			g.beginFill(color);
			g.drawRect(0,0,10,10);//drawRect(x,y,width,height)
			var cell = new createjs.Shape(g);
			
			return cell;
			
		}//will be used to paint everycell
		function paintCircle(color)
		{
			var g = new createjs.Graphics();
			g.setStrokeStyle(1); // stroke of 1pixel
			//set the stroke color to white, with an alpha of .7
			g.beginStroke(createjs.Graphics.getRGB(color));//(11,72,120,1)
			g.beginFill(color);
			g.drawCircle(5,5,6);//drawRect(x,y,width,height)
			var cell = new createjs.Shape(g);
			
			return cell;
			
		}//will be used to paint everycell
		function paintUDI()
		{
			//score painting
			scoreText.text = "score: " +  Math.floor(score).toString();
			scoreText.color = "#FFF";
			scoreText.x = 10;
			scoreText.y = 20;
			
			//life painting
			lifeText.text = "life: " + life.toString();
			lifeText.color = "#FFF";
			lifeText.x = 10;
			lifeText.y = 60;
			
			//level painting
			var level = Math.floor(difficulty * 100);
			diffText.text = "level: " + level.toString();
			diffText.color = "#FFF";
			diffText.x = 10;
			diffText.y = 80;
			
			//multiplier painting
			multiplierText.text = "X " + multiplier.toString();
			multiplierText.color = "#FFF";
			multiplierText.x = 20;
			multiplierText.y = 40;
			//snakeText painting
			if(createjs.Ticker.getTime() - snakeTextTime > 1500 )
						{
							snakeText.text = "";
							snakeTextTime = 0;
						}
			snakeText.color = "#FFF";
			snakeText.x = snakeArray[0].x + 10;
			snakeText.y = snakeArray[0].y + 10;
			
		}			   
		function killGame()
		{
				soundBG.pause();
				soundGO.pause();
				soundGO.currentTime = 0;
				soundGO.play();
				finalScore = Math.floor(score);
				$("#GOScore").html("Score:  " + finalScore.toString()); 
				stage.tick = function () {};
				stage.removeAllChildren();
				stage = null;
				gameOver();
		}
		/*
		 * updates the snake's position depending on the direction
		 */
		$(document).keydown(function(e)
		{
		var key = e.which;
		//We will add another clause to prevent reverse gear
		if(key == "37" && directionSnake != "right") setTimeout(function() {directionSnake = "left"; }, 30);
		else if(key == "38" && directionSnake != "down") setTimeout(function() {directionSnake = "up"; }, 30);
		else if(key == "39" && directionSnake != "left") setTimeout(function() {directionSnake = "right"; }, 30);
		else if(key == "40" && directionSnake != "up") setTimeout(function() {directionSnake = "down"; }, 30);
		//The snake is now keyboard controllable
		
		});
					   
	}
	function gameOver()
	{
		$("#ad").css({'display':'block'});
		$("#game").css({'display':'none'});
		$("#gameOver").css({'display':'block'});
		jQuery.post("phpProcessor.php" , { score : finalScore } , function(data)
  																	{
  																		if(data != "new")
  																		{
  																			$("#highestScore").html("high Score:  " + data.toString()); 
  																		}
  																		else 
  																		{
  																			alert("new high score, enter your name!");
  																		}
  																		//alert(data);
  																	}
  	 );
  	 
	}
	function instructions()
	{
		$("#menu").css({'display':'none'});
		$("#instructions").css({'display':'block'});
	}
	function highScores()
	{
		$("#ad").css({'display':'block'});
		$("#menu").css({'display':'none'});
		$("#gameOver").css({'display':'none'});
		$("#highScores").css({'display':'block'});
		jQuery.post("phpProcessor.php" ,  function(data)
  			{
  				$("#HS").html("highest Score:  " + data.toString()); 
  			});
	}
	function menu()
	{
		$("#ad").css({'display':'block'});
		$("#menu").css({'display':'block'});
		$("#gameOver").css({'display':'none'});
		$("#highScores").css({'display':'none'});
		$("#instructions").css({'display':'none'});
	}
	
});//end of $() the first one
