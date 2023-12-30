class Enemy2 extends Actor {
    constructor(app, x, isLeft, player) {
        super(app);
        this.playerX = x
        this.scale.x = 0.3 * (isLeft ? -1 : 1)
        this.scale.y = 0.3
        this.baseHeight = 80
        this.playerY = this.app.screen.height - this.baseHeight; 
        this.loadAssets()
        this.isPlayerVisible = false
        this.maxHits = 1
        this.player = player
    }

    setup(resources) {

        /* 
        .add('erIdle', 'images/enemy robot 1 idle.png')
        .add('erWalk', 'images/enemy robot 1 walk.png')
        .add('erDeath', 'images/enemy robot 1 death.png')
        .add('erShot', 'images/enemy robot 1 shot.png')
        */
        // Create animations
        this.playerAnimations.idle = this.singleAnimation(resources.erIdle, 9);
        this.playerAnimations.walk = this.singleAnimation(resources.erWalk, 12);
        this.playerAnimations.death = this.singleAnimation(resources.erDeath, 15);
        this.playerAnimations.attack = this.singleAnimation(resources.erShot, 16);
        this.playerAnimations.attack.scale.set(1)
        this.playerAnimations.attack.anchor.set(0.2, 0.65)
        this.playerAnimations.death.scale.set(0.47)
        this.playerAnimations.death.anchor.set(0.5, 0.8)
        this.playerAnimations.idle.scale.set(0.28)
        this.currentAnimation = this.playerAnimations.walk;
        // Set initial player position
        this.currentAnimation.x = this.playerX;
        this.currentAnimation.y = this.playerY;

        this.setupAnimation(this.playerAnimations.idle, 0.2, true);
        this.setupAnimation(this.playerAnimations.walk, 0.2, true);
        this.setupAnimation(this.playerAnimations.attack, 0.35, false);
        this.setupAnimation(this.playerAnimations.death, 0.2, false);


        // Add the current animation to the stage and play it
        this.app.stage.addChild(this.currentAnimation);
        this.currentAnimation.play();

        // Setup other animations


        if(this.scale.x > 0){
            this.moveRight = true;
            this.moveLeft = false;
        }
        else{
            this.moveLeft = true;
            this.moveRight = false;
        }
        this.app.ticker.add((delta) => this.gameLoop(delta));
    }

    gameLoop(delta) {
        if(this.isPlayerVisible) return

        if((this.moveRight || this.moveLeft) && !this.player.isDead && this.player.currentAnimation){         
            if(this.player.currentAnimation.x > this.currentAnimation.x){
                this.moveRight = true;
                this.moveLeft = false;
            }
            else{
                this.moveLeft = true;
                this.moveRight = false;
            }
        }

        if (this.moveLeft) {
            this.currentAnimation.x -= this.playerSpeed * delta;
            // check for out of screen wrap to other side when it is not visible
            if(this.currentAnimation.x < -this.currentAnimation.width){
                this.currentAnimation.x = this.app.screen.width + this.currentAnimation.width
            }
            this.currentAnimation.scale.x = -Math.abs(this.currentAnimation.scale.x)
        } else if (this.moveRight) {
            this.currentAnimation.x += this.playerSpeed * delta;
            // check for out of screen wrap to other side when it is not visible
            if(this.currentAnimation.x > this.app.screen.width + this.currentAnimation.width){
                this.currentAnimation.x = -this.currentAnimation.width
            }
            this.currentAnimation.scale.x = Math.abs(this.currentAnimation.scale.x)
        }
    }

    takeHit(){
        if(this.isDead) return
        this.hits+=1
        this.switchAnimation(this.playerAnimations.idle)
        this.moveLeft = false
        this.moveRight = false
        setTimeout(()=>{
            if(this.hits>this.maxHits){
                this.die()
                return
            }
            this.moveLeft = this.currentAnimation.scale.x < 0
            this.moveRight = this.currentAnimation.scale.x > 0
            this.switchAnimation(this.playerAnimations.walk)
        }, 350)
    }

    tryShoot(player){
        if(this.isPlayerVisible) return
        this.isPlayerVisible = this.isPlayerInRange(player.currentAnimation)
        if(this.isPlayerVisible){
            this.switchAnimation(this.playerAnimations.attack)
            setTimeout(()=>{
                this.isPlayerVisible = false
                if(this.isPlayerInRange(player.currentAnimation) &&
                this.currentAnimation == this.playerAnimations.attack //&&
                // player.currentAnimation !== player.playerAnimations.crouch
                ){
                    // this enemy shoots high so it cant hit you while in crouch
                    // but can while you move
                    player.takeHit()
                }
                this.switchAnimation(this.playerAnimations.walk)
            }, 1000)
        }
    }

    isPlayerInRange(player){
        if(!this.currentAnimation) return false
        if(!player) return false
        let direction = this.currentAnimation.scale.x > 0? 1 : -1
        let posCenter = {
            x: this.currentAnimation.x + direction * 55,
            y: this.currentAnimation.y,
            width: this.currentAnimation.width+40,
            height: this.currentAnimation.height
        }
        return checkCollision(posCenter, player)
    }
}
