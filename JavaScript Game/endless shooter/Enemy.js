class Enemy extends Actor {
    constructor(app, x, isLeft, player) {
        super(app);
        this.playerX = x
        console.log('enemy', x)
        this.scale.x = 0.3 * (isLeft ? -1 : 1)
        this.scale.y = 0.3
        this.baseHeight = 80
        this.playerY = this.app.screen.height - this.baseHeight; 
        this.loadAssets()
        this.isPlayerVisible = false
        this.maxHits = 4
        this.player = player
    }

    setup(resources) {

        /* 
        .add('eWalk', 'images/enemy walk.png')
    .add('eHurt', 'images/enemy hurt.png')
    .add('eDeath', 'images/enemy dead.png')
    .add('eAttack', 'images/enemy attack.png')
    .add('eAttack2', 'images/enemy attack 2.png')
        */
        // Create animations
        this.playerAnimations.idle = this.singleAnimation(resources.eWalk, 6);
        this.playerAnimations.hurt = this.singleAnimation(resources.eHurt, 4);
        this.playerAnimations.death = this.singleAnimation(resources.eDeath, 5);
        this.playerAnimations.attack = this.singleAnimation(resources.eAttack2, 11);

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
        this.setupAnimation(this.playerAnimations.hurt, 0.2, false);
        this.setupAnimation(this.playerAnimations.attack, 0.15, false);
        this.setupAnimation(this.playerAnimations.death, 0.1, false);

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
        if(this.isPlayerVisible) return;

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
        this.switchAnimation(this.playerAnimations.hurt)
        this.moveLeft = false
        this.moveRight = false
        setTimeout(()=>{
            if(this.hits>this.maxHits){
                this.die()
                return
            }
            this.moveLeft = this.currentAnimation.scale.x < 0
            this.moveRight = this.currentAnimation.scale.x > 0
            this.switchAnimation(this.playerAnimations.idle)
        }, 400)
    }

    tryShoot(player){
        if(this.isPlayerVisible) return
        this.isPlayerVisible = this.isPlayerInRange(player.currentAnimation)
        if(this.isPlayerVisible){
            this.switchAnimation(this.playerAnimations.attack)
            setTimeout(()=>{
                this.isPlayerVisible = false
                if(this.isPlayerInRange(player.currentAnimation)
                    && this.currentAnimation == this.playerAnimations.attack
                ){
                //check if player is still in range and if your attack is not canceled
                    player.takeHit()
                }
                this.switchAnimation(this.playerAnimations.idle)
            }, 1000)
        }
    }

    isPlayerInRange(player){
        if(!this.currentAnimation) return false
        if(!player) return false
        let direction = this.currentAnimation.scale.x > 0? 1 : -1
        let posCenter = {
            x: this.currentAnimation.x + direction * 20,
            y: this.currentAnimation.y,
            width: this.currentAnimation.width-5,
            height: this.currentAnimation.height
        }
        return checkCollision(posCenter, player)
    }
}
