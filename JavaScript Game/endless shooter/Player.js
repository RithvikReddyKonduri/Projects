class Player extends Actor {
    constructor(app) {
        super(app)
        // Initialize player position at the bottom of the screen
        this.playerX = this.app.screen.width / 2; // Centered horizontally
        this.playerY = this.app.screen.height - this.baseHeight; // Placed at the bottom of the screen
        this.playerSpeed = 1.5
        this.loadAssets()
        this.nextShot = 0
    }

    setup(resources) {
        // Create animations
        this.playerAnimations.idle = this.singleAnimation(resources.gIdle, 5);
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
        this.app.stage.addChild(this.currentAnimation);
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

        // Add event listeners for key presses
        window.addEventListener('keydown', (event) => this.onKeyDown(event));
        window.addEventListener('keyup', (event) => this.onKeyUp(event));
    }

    gameLoop(delta) {
        this.nextShot -= delta
        if(this.isDead){
            return
        }
        if (this.moveLeft) {
            this.currentAnimation.x -= this.playerSpeed * delta;

            this.currentAnimation.scale.x = -1; // Flip horizontally to face left

            if(this.currentAnimation.x < this.currentAnimation.width/2){
                this.currentAnimation.x = this.currentAnimation.width/2
            }

        } else if (this.moveRight) {
            this.currentAnimation.x += this.playerSpeed * delta;

            this.currentAnimation.scale.x = 1; // Normal scale to face right

            if(this.currentAnimation.x > this.app.screen.width - this.currentAnimation.width/2){
                this.currentAnimation.x = this.app.screen.width - this.currentAnimation.width/2
            }
        }

        // Handle jumping
        if (this.isJumping) {
            this.jumpVelocity += this.gravity * delta;
            this.currentAnimation.y += this.jumpVelocity * delta;

            if (this.currentAnimation.y >= this.app.screen.height - this.baseHeight) {
                // Adjust the height for landing
                this.currentAnimation.y = this.app.screen.height - this.baseHeight;
                this.isJumping = false;
                this.jumpVelocity = 0;
                if(this.isCrouching){
                    this.switchAnimation(this.playerAnimations.crouch);
                } else if(this.moveRight || this.moveLeft){
                    this.switchAnimation(this.playerAnimations.run);
                } else {
                    this.switchAnimation(this.playerAnimations.idle);
                }
            }
        }

        // Move bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.x += bullet.velocityX * delta;

            // Remove bullets that go off-screen
            if (bullet.x < 0 || bullet.x > this.app.screen.width) {
                this.app.stage.removeChild(bullet);
                this.bullets.splice(i, 1);
            }
        }
    }

    takeHit(){
        if(this.isDead) return
        this.hits+=1
        this.moveLeft = false
        this.moveRight = false
        setTimeout(()=>{
            if(this.hits>this.maxHits){
                this.die()
                return
            }
            this.switchAnimation(this.playerAnimations.idle)
        }, 200)
    }

    onKeyDown(event) {
        if(this.isDead){
            return
        }
        switch (event.key) {
            case 'a':
                this.moveLeft = true;
                this.moveRight = false;
                this.currentAnimation.scale.x = -1;
                this.switchAnimation(this.playerAnimations.run);
                break;
            case 'd':
                this.moveRight = true;
                this.moveLeft = false;
                this.currentAnimation.scale.x = 1;
                this.switchAnimation(this.playerAnimations.run);
                break;
            case 'w':
                if (!this.isJumping) {
                    this.jump();
                }
                break;
            case 's':
                if (!this.isJumping) {
                    if (this.isCrouching) {
                        this.standUp();
                    } else {
                        this.crouch();
                    }
                }
                break;
            case ' ': // Shoot when Space key is pressed
                this.shoot();
                break;
        }
    }
    
    onKeyUp(event) {
        if(this.isDead){
            return
        }
        switch (event.key) {
            case 'a':
                this.moveLeft = false;
                if (!this.isCrouching) {
                    this.switchAnimation(this.moveRight ? this.playerAnimations.run : this.playerAnimations.idle);
                } else {
                    this.switchAnimation(this.moveRight ? this.playerAnimations.run : this.playerAnimations.crouch);
                }
                break;
            case 'd':
                this.moveRight = false;
                if (!this.isCrouching) {
                    this.switchAnimation(this.moveLeft ? this.playerAnimations.run : this.playerAnimations.idle);
                }
                else {
                    this.switchAnimation(this.moveLeft ? this.playerAnimations.run : this.playerAnimations.crouch);
                }
                break;
        }
    }

    jump() {
        if (!this.isJumping) {
            this.isJumping = true;
            this.jumpVelocity = -this.jumpHeight;
            this.switchAnimation(this.playerAnimations.jump)
        }
    }

    crouch() {
        if (!this.isJumping) {
            this.isCrouching = true;
    
            this.switchAnimation(this.playerAnimations.crouch);
        }
    }
    
    standUp() {
        this.isCrouching = false;
        this.switchAnimation(this.playerAnimations.idle);
    }
    

    shoot() {
        // make available buletts limited
        if(this.nextShot > 0) return
        this.nextShot = 10 // 100 ms

        const bulletTexture = PIXI.utils.TextureCache['bullet'];
        const bullet = new PIXI.Sprite(bulletTexture);
        bullet.anchor.set(0.5,0.5)
        // Define weapon offsets (adjust these based on your game)
        const weaponOffsetX = 20; // Horizontal offset from player's center
        const weaponOffsetY = -26; // Vertical offset above player's head

        // Calculate the position of the bullet based on the player's position and orientation
        const orientation = this.currentAnimation.scale.x;
        if(orientation < 0){
            bullet.scale.x = -bullet.scale.x
        }
        const playerX = this.currentAnimation.x;
        const playerY = this.currentAnimation.y;

        const bulletX = playerX + (weaponOffsetX * orientation);
        const bulletY = playerY + weaponOffsetY;

        // Set bullet's initial position
        bullet.x = bulletX;
        bullet.y = bulletY;

        // Set bullet's velocity
        if (orientation === -1) {
            // Player is facing left
            bullet.velocityX = -this.bulletSpeed;
        } else {
            // Player is facing right
            bullet.velocityX = this.bulletSpeed;
        }

        // Add bullet to the stage
        this.app.stage.addChild(bullet);

        // Add bullet to the bullets array
        this.bullets.push(bullet);

        // Play the shoot sound
        this.shootSound.play();
    }
    removeBullet(bullet){
        this.app.stage.removeChild(bullet);
        this.bullets = this.bullets.filter(bu=>bu!==bullet)
    }
}
