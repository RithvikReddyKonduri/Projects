// Create a new PIXI application with a canvas of width 800 and height 600.
const app = new PIXI.Application({
    width: 800, // Canvas width
    height: 600, // Canvas height
    backgroundColor: 0x000000, // Set initial background color to black
});

// Append the application's view (canvas) to the document body.
document.body.appendChild(app.view);

// Event listener for "Start Game" button
document.getElementById('startGameButton').addEventListener('click', () => {
    // Remove the buttons
    document.getElementById('startGameButton').style.display = 'none';

    // Change the PIXI.js canvas background to transparent
    app.renderer.backgroundColor = 0x00000000; // Set background color to transparent

    // Create a sprite from the background image.
    const background = PIXI.Sprite.from('images/background_image.png');

    // Resize the background to fill the screen.
    background.width = app.screen.width;
    background.height = app.screen.height;

    // Add the background to the stage.
    app.stage.addChild(background);

    // Create a new player object by invoking the Player class constructor.
    const player = new Player(app);

    // Load a spritesheet named 'enemySpritesheet' from the 'images/enemy walk.png' file.
    app.loader.add('enemySpritesheet', 'images/enemy walk.png');

    // Load a spritesheet named 'enemy2Spritesheet' from the 'images/enemy robot 1 walk.png' file.
    app.loader.add('enemy2Spritesheet', 'images/enemy robot 1 walk.png');

    // Load the assets using the PIXI loader.
    app.loader.load((loader, resources) => {
        // Get the animation frames for the first enemy sprite from the loaded spritesheet.
        let frames = [];
        let frameWidth = resources.enemySpritesheet.texture.width / 6; // Spritesheet is evenly divided into 6 frames.
        
        for (let i = 0; i < 6; i++) {
            // Create a texture for each frame using a portion of the spritesheet's texture.
            let rect = new PIXI.Rectangle(i * frameWidth, 0, frameWidth, resources.enemySpritesheet.texture.height);
            let texture = new PIXI.Texture(resources.enemySpritesheet.texture.baseTexture, rect);
            frames.push(texture);
        }

        // Create one enemy object using the frames, initial position, speed, and direction for the left side.
        const enemy1 = new Enemy(frames, 0, 96, 1, 'left');

        // Create another enemy object for the right side with 12 frames.
        let enemy2Frames = [];
        let enemy2FrameWidth = resources.enemy2Spritesheet.texture.width / 12; // Spritesheet is evenly divided into 12 frames.
        
        for (let i = 0; i < 12; i++) {
            // Create a texture for each frame using a portion of the spritesheet's texture.
            let rect = new PIXI.Rectangle(i * enemy2FrameWidth, 0, enemy2FrameWidth, resources.enemy2Spritesheet.texture.height);
            let texture = new PIXI.Texture(resources.enemy2Spritesheet.texture.baseTexture, rect);
            enemy2Frames.push(texture);
        }
        
        const enemy2 = new Enemy(enemy2Frames, app.screen.width, 96, 1, 'right');

        // Resize and reposition the left enemy.
        let scale = 0.3; // Adjust the scale .
        enemy1.width *= scale;
        enemy1.height *= scale;

        let moveDown = 375; // Adjust the vertical position
        enemy1.y += moveDown;

        // Resize and reposition the right enemy.
        enemy2.width *= scale;
        enemy2.height *= scale;
        enemy2.x -= enemy2.width; // Move the right enemy to the left side

        enemy2.y += moveDown;

        // Add both enemy objects to the stage.
        app.stage.addChild(enemy1);
        app.stage.addChild(enemy2);

        // Define a game loop using the PIXI ticker for both enemies.
        app.ticker.add((delta) => {
            // Update left enemy position
            enemy1.updatePosition(app.screen.width, player.x);

            // Update right enemy position
            enemy2.updatePosition(app.screen.width, player.x);

            // Check for collisions with left enemy
            player.bullets.forEach((bullet, i) => {
                if (checkCollision(bullet, enemy1)) {
                    // Collision detected with left enemy, remove bullet and handle enemy collision (e.g., reduce enemy health, remove enemy, etc.).
                    app.stage.removeChild(bullet);
                    player.bullets.splice(i, 1);
                }
            });

            // Check for collisions with right enemy
            player.bullets.forEach((bullet, i) => {
                if (checkCollision(bullet, enemy2)) {
                    // Collision detected with right enemy, remove bullet and handle enemy collision (e.g., reduce enemy health, remove enemy, etc.).
                    app.stage.removeChild(bullet);
                    player.bullets.splice(i, 1);
                }
            });
        });

        // Collision detection function
        function checkCollision(rect1, rect2) {
            return rect1.x < rect2.x + rect2.width &&
                   rect1.x + rect1.width > rect2.x &&
                   rect1.y < rect2.y + rect2.height &&
                   rect1.y + rect1.height > rect2.y;
        }
    });

    // Start the game loop
    app.ticker.start();
});

// Event listener for "Quit Game" button
document.getElementById('quitGameButton').addEventListener('click', () => {
    // Stop the game loop
    app.ticker.stop();

    // Clear the game stage
    app.stage.removeChildren();

    // Remove all elements from the body of the document
    document.body.innerHTML = '';

    // Reset the background color
    app.renderer.backgroundColor = 0x000000;

    // Ask the user to refresh the page
    if (window.confirm("The game has ended. Please refresh the page to play again.")) {
        location.reload();
    }
});