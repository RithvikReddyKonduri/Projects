class Player {
    constructor(app) {
        this.app = app;
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

        // Load assets
        this.loadAssets();

        // Create an array to store bullets
        this.bullets = [];

        // Define bullet speed
        this.bulletSpeed = 5;

        // Initialize the sound effect
        this.initializeSound();

        // Initialize player position at the bottom of the screen
        this.playerX = this.app.screen.width / 2; // Centered horizontally
        this.playerY = this.app.screen.height - 120; // Placed at the bottom of the screen
    }

    initializeSound() {
        this.shootSound = new Howl({
            src: ['sounds/9mm-pistol-shot-6349.mp3'],
            volume: 0.5, // Adjust the volume as needed
        });
    }
    loadAssets() {
        PIXI.Loader.shared
            .add('bullet', 'images/MuzzleFlash.png')
            .add('idle', 'images/Gunner_Blue_Idle.png')
            .add('jump', 'images/Gunner_Blue_Jump.png')
            .add('run', 'images/Gunner_Blue_Run.png')
            .add('death', 'images/Gunner_Blue_Death.png')
            .add('crouch', 'images/Gunner_Blue_Crouch.png')
            .load((loader, resources) => this.setup(loader, resources));
    }

    setup(loader, resources) {
        // Create animations
        this.playerAnimations.idle = new PIXI.AnimatedSprite(this.createFrames(resources.idle.texture, 5));
        this.playerAnimations.jump = new PIXI.AnimatedSprite(this.createFrames(resources.jump.texture, 2));
        this.playerAnimations.run = new PIXI.AnimatedSprite(this.createFrames(resources.run.texture, 6));
        this.playerAnimations.death = new PIXI.AnimatedSprite(this.createFrames(resources.death.texture, 8));
        this.playerAnimations.crouch = new PIXI.AnimatedSprite(this.createFrames(resources.crouch.texture, 3));

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

        // Add event listeners for key presses
        window.addEventListener('keydown', (event) => this.onKeyDown(event));
        window.addEventListener('keyup', (event) => this.onKeyUp(event));

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

            // Stop the current animation and remove it from the stage
            this.currentAnimation.stop();
            this.app.stage.removeChild(this.currentAnimation);

            // Update the current animation and add it to the stage
            this.currentAnimation = newAnimation;
            this.app.stage.addChild(this.currentAnimation);

            // Set the new animation to the stored position
            this.currentAnimation.x = posX;
            this.currentAnimation.y = posY;

            // Play the new animation
            this.currentAnimation.play();
        }
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
    


    gameLoop(delta) {
        if (this.moveLeft) {
            this.currentAnimation.x -= this.playerSpeed;
            this.currentAnimation.scale.x = -1; // Flip horizontally to face left
        } else if (this.moveRight) {
            this.currentAnimation.x += this.playerSpeed;
            this.currentAnimation.scale.x = 1; // Normal scale to face right
        }

        // Handle jumping
        if (this.isJumping) {
            this.jumpVelocity += this.gravity;
            this.currentAnimation.y += this.jumpVelocity;

            if (this.currentAnimation.y >= this.app.screen.height - 120) {
                // Adjust the height for landing
                this.currentAnimation.y = this.app.screen.height - 120;
                this.isJumping = false;
                this.jumpVelocity = 0;
            }
        }

        // Move bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.x += bullet.velocityX;

            // Remove bullets that go off-screen
            if (bullet.x < 0 || bullet.x > this.app.screen.width) {
                this.app.stage.removeChild(bullet);
                this.bullets.splice(i, 1);
            }
        }
    }

    onKeyDown(event) {
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
        switch (event.key) {
            case 'a':
                this.moveLeft = false;
                if (!this.isCrouching) {
                    this.switchAnimation(this.moveRight ? this.playerAnimations.run : this.playerAnimations.idle);
                    this.currentAnimation.scale.x = -1;
                }
                break;
            case 'd':
                this.moveRight = false;
                if (!this.isCrouching) {
                    this.switchAnimation(this.moveLeft ? this.playerAnimations.run : this.playerAnimations.idle);
                    this.currentAnimation.scale.x = 1;
                }
                break;
        }
    }
    
    
    

    jump() {
        if (!this.isJumping) {
            this.isJumping = true;
            this.jumpVelocity = -this.jumpHeight;
        }
    }

    crouch() {
        if (!this.isJumping) {
            this.isCrouching = true;
    
            // Store the current orientation
            const currentOrientation = this.currentAnimation.scale.x;
    
            // Determine the desired orientation based on movement
            let desiredOrientation = 1; // Default to right
            if (this.moveLeft) {
                desiredOrientation = -1; // Face left if moving left
            }
    
            if (currentOrientation !== desiredOrientation) {
                this.currentAnimation.scale.x = desiredOrientation; // Set the correct orientation
            }
    
            // Restore the orientation after crouching
            this.storedOrientation = currentOrientation;
    
            this.switchAnimation(this.playerAnimations.crouch);
        }
    }
    
    
    standUp() {
        this.isCrouching = false;
    
        // Restore the orientation when standing up
        if (this.storedOrientation === -1) {
            this.currentAnimation.scale.x = -1; // Face left
        } else if (this.storedOrientation === 1) {
            this.currentAnimation.scale.x = 1; // Face right
        }
    
        this.switchAnimation(this.playerAnimations.idle);
    }
    

    shoot() {
        const bulletTexture = PIXI.utils.TextureCache['bullet'];
        const bullet = new PIXI.Sprite(bulletTexture);

        // Define weapon offsets (adjust these based on your game)
        const weaponOffsetX = 30; // Horizontal offset from player's center
        const weaponOffsetY = 18; // Vertical offset above player's head

        // Calculate the position of the bullet based on the player's position and orientation
        const orientation = this.currentAnimation.scale.x;
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
}
