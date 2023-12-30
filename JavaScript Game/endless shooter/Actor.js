// Collision detection function
function checkCollision(rect1, rect2) {
    return rect1 && rect2 && Math.abs(rect1.x - rect2.x) < rect1.width / 3 + rect2.width / 3 
            && Math.abs(rect1.y - rect2.y) < rect1.height / 2 + rect2.height / 2 
} 

class Actor {
    constructor(app) {
        this.app = app
        this.playerAnimations = {};
        this.currentAnimation = null;
        this.moveLeft = false;
        this.moveRight = false;
        this.isJumping = false;
        this.isCrouching = false; // Added crouch flag
        this.jumpVelocity = 0;
        this.jumpHeight = 6;
        this.gravity = 0.5;
        this.playerSpeed = 1;
        this.scale = {x:1, y: 1}
        this.baseHeight = 73
        this.isDead = false
        this.hits = 0
        this.maxHits = 2

        // Create an array to store bullets
        this.bullets = [];

        // Define bullet speed
        this.bulletSpeed = 5;

        // Initialize the sound effect
        this.initializeSound();

        // Initialize player position at the bottom of the screen
        this.playerX = this.app.screen.width / 2; // Centered horizontally
        this.playerY = this.app.screen.height - this.baseHeight; // Placed at the bottom of the screen
    }

    initializeSound() {
        this.shootSound = new Howl({
            src: ['sounds/9mm-pistol-shot-6349.mp3'],
            volume: 0.5, // Adjust the volume as needed
        });
    }

    loadAssets() {
        getRecoruces().then((res)=>this.setup(res))
    }

    singleAnimation(resource, frameCount){
        let anim = new PIXI.AnimatedSprite(this.createFrames(resource.texture, frameCount));
        anim.anchor.set(0.5, 1)
        anim.scale.set(this.scale.x, this.scale.y)
        return anim
    }

    setup(resources) {
        // Create animations
        this.playerAnimations.idle = this.singleAnimation(resources.gIdle, 5)
        this.playerAnimations.jump = this.singleAnimation(resources.gJump, 2);
        this.playerAnimations.run = this.singleAnimation(resources.gRun, 6);
        this.playerAnimations.death = this.singleAnimation(resources.gDeath, 8);
        this.playerAnimations.crouch = this.singleAnimation(resources.gCrouch, 3);

        // Initialize player with idle animation
        this.currentAnimation = this.playerAnimations.idle;
        this.setupAnimation(this.currentAnimation, 0.1, true);

        // Set initial player position
        this.currentAnimation.x = this.playerX;
        this.currentAnimation.y = this.playerY;

        // Add the current animation to the stage and play it
        this.app.stage.addChild(this.currentAnimation)
        this.app.stage.addChild(this.app.stage);
        this.currentAnimation.play();

        // Setup other animations
        this.setupAnimation(this.playerAnimations.jump, 0.2, false);
        this.setupAnimation(this.playerAnimations.run, 0.15, true);
        this.setupAnimation(this.playerAnimations.death, 0.1, false);

        // Setup crouch animation
        this.setupAnimation(this.playerAnimations.crouch, 0.1, true);
        this.playerAnimations.crouch.loop = false;

        // Add the game loop
        this.app.ticker.add((delta) => this.gameLoop(delta));
    }

    setupAnimation(animation, speed, loop) {
        animation.animationSpeed = speed;
        animation.loop = loop;
        animation.x = this.currentAnimation.x; // Use the current X position
        animation.y = this.currentAnimation.y; // Use the current Y position
    }

    switchAnimation(newAnimation) {
        if (this.currentAnimation !== newAnimation) {
            // Store the current position of the animation
            let posX = this.currentAnimation.x;
            let posY = this.currentAnimation.y;

            let newDirection = this.currentAnimation.scale.x > 0 ? 1 : -1
            
            // Stop the current animation and remove it from the stage
            this.currentAnimation.stop();
            this.app.stage.removeChild(this.currentAnimation);

            // Update the current animation and add it to the stage
            this.currentAnimation = newAnimation;
            this.currentAnimation.scale.x = Math.abs(this.currentAnimation.scale.x) * newDirection;

            this.app.stage.addChild(this.currentAnimation);

            // Set the new animation to the stored position
            this.currentAnimation.x = posX;
            this.currentAnimation.y = posY;

            // Play the new animation
            this.currentAnimation.gotoAndPlay(0);
        }
    }

    die(){
        this.switchAnimation(this.playerAnimations.death)
        setTimeout(()=>{
            this.app.stage.removeChild(this.currentAnimation);
        },1000)
        this.isDead = true
    }

    createFrames(texture, frameCount) {
        let frames = [];
        for (let i = 0; i < frameCount; i++) {
            const frameWidth = texture.width / frameCount;
            const rect = new PIXI.Rectangle(i * frameWidth, 0, frameWidth, texture.height);
            frames.push(new PIXI.Texture(texture.baseTexture, rect));
        }
        return frames;
    }

    checkCollision(rect){
        if(!this.currentAnimation) return false
        let posCenter = {
            x: this.currentAnimation.x,
            y: this.currentAnimation.y - this.currentAnimation.height/2,
            width: this.currentAnimation.width,
            height: this.currentAnimation.height
        }
        return checkCollision(rect, posCenter)
    }
}
