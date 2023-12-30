class Enemy extends PIXI.AnimatedSprite {
    constructor(frames, x, y, speed, direction) {
        super(frames);
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.direction = direction;
        this.animationSpeed = 0.1;
        this.play();
        this.orientation = direction === 'left' ? -1 : 1;
        this.scale.x = this.orientation;
        this.isPlayerVisible = false; // Add a property to track player visibility
    }

    updatePosition(screenWidth, playerX) {

        if (this.isPlayerVisible) {
            // Enemy has seen the player, stop moving
            return;
        }

        if (this.direction === 'left') {
            this.x -= this.speed;
            if (this.x + this.width < 0) {
                this.x = screenWidth;
            }
        } else {
            this.x += this.speed;
            if (this.x > screenWidth) {
                this.x = -this.width;
            }
        }

        // Check if the player is within a certain range of the enemy
        if (Math.abs(this.x - playerX) < 200) {
            this.isPlayerVisible = true; // Player is visible to this enemy
            // You can add code here to handle what happens when the enemy sees the player
            // For example, you can stop the enemy's animation or trigger an attack.
        }
    }
}
