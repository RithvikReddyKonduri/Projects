// Create a new PIXI application with a canvas of width 800 and height 600.
const app = new PIXI.Application({
    width: 800, // Canvas width
    height: 600, // Canvas height
    backgroundColor: 0x000000, // Set initial background color to black
});

// Append the application's view (canvas) to the document body.
document.body.appendChild(app.view);

quit = true

const startGame = () => {
    quit = false
    // Remove the buttons
    document.getElementById('startGameButton').style.display = 'none';

    // Change the PIXI.js canvas background to transparent
    app.renderer.backgroundColor = 0x00000000; // Set background color to transparent

    const ui =  new UI(app)
    // Create a sprite from the background image.
    const background = PIXI.Sprite.from('images/background_image.png');

    // Resize the background to fill the screen.
    background.width = app.screen.width;
    background.height = app.screen.height;

    // Add the background to the stage.
    app.stage.addChild(background);

    // Create a new player object by invoking the Player class constructor.
    const player = new Player(app);
    
    let enemies = []
    let level = 0
    let offset = 80
    let killCount = 0

    // Load the assets using the PIXI loader.
    app.loader.load((loader, resources) => {
        app.ticker.add((delta) => {
            if(quit && !player.isDead){
                player.die()
            }
            if(player.isDead) {
                ui.showFinalScore(killCount)
                return
            }
            ui.setHelth(player.maxHits - player.hits, player.maxHits)
            ui.setKillCount(killCount)

            if(enemies.length == 0){
                addEnemies = Math.pow(2, level)
                level++
                offset--
                for(let ind = 0; ind < addEnemies; ind++){
                    let xOut = ind * offset - offset
                    let isLeft = Math.random() > 0.5
                    let x = isLeft 
                        ? app.screen.width + xOut // to the right of screan an out
                        : -xOut // out to left of screen
                    enemies.push(Math.random() > 0.5 ? new Enemy(app, x, isLeft, player): new Enemy2(app, x, isLeft, player))
                }
            }
            for(let enemie of enemies){
                enemie.tryShoot(player)
                player.bullets.forEach((bullet)=>{
                    if(enemie.checkCollision(bullet)){
                        enemie.takeHit()
                        player.removeBullet(bullet)
                    }
                })
            }
            enemies = enemies.filter(enemie=>{
                if(enemie.isDead){
                    killCount++
                    return false
                }
                return true
            })
        });
    });

    // Start the game loop
    app.ticker.start();
}

//startGame()

// Event listener for "Start Game" button
document.getElementById('startGameButton').addEventListener('click', startGame);

// Event listener for "Quit Game" button
document.getElementById('quitGameButton').addEventListener('click', () => {
    if(!quit){
        quit = true
        return
    }

    // Ask the user to refresh the page
    if (window.confirm("The game has ended. Please refresh the page to play again.")) {
        location.reload();
    }
});