class UI {
    constructor(app) {
        this.app = app
        this.health = null
        this.count = null
        
        // UI initialization
    }
    setHelth(currentHp, maxHp){
        
          function createHpBar() {

            let hpPortion = currentHp / maxHp;
            if(hpPortion == 0){
                hpPortion = 0.01
            }

            const gr  = new PIXI.Graphics();
            gr.beginFill(0xffffff);
            gr.drawRect(30, 30, 300, 30);
            gr.endFill();
            gr.beginFill(0xff8888);
            gr.drawRect(32, 32, 296 * Math.max(0, hpPortion), 26);
            gr.endFill();
            return gr;
          }
          if(this.health){
              app.stage.removeChild(this.health);
          }
          // Create black hp bar (the one behind the red one) and add it to our container:
          this.health =  createHpBar(0xff0000);
          app.stage.addChild(this.health);
    }
    setKillCount(newCount){

          if(this.count){
              app.stage.removeChild(this.count);
          }
          // Create black hp bar (the one behind the red one) and add it to our container:
          this.count = new PIXI.Text('Score: '+newCount, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xff1010,
            align: 'center',
        });

        this.count.x = 30;
        this.count.y = 80;

        app.stage.addChild(this.count);

    }

    finalized = false
    showFinalScore(totalScore) {
        if(this.finalized) return
        this.finalized = true

        if(this.count){
            app.stage.removeChild(this.count);
        }

        if(this.health){
            app.stage.removeChild(this.health);
        }

        const finalScoreContainer = new PIXI.Container();

        // Create a semi-transparent white rounded rectangle
        const roundedRect = new PIXI.Graphics();
        roundedRect.beginFill(0xffffff, 0.8);
        roundedRect.drawRoundedRect(0, 0, 300, 130, 20);
        roundedRect.endFill();
        roundedRect.x = (this.app.screen.width - roundedRect.width) / 2;
        roundedRect.y = (this.app.screen.height - roundedRect.height) / 2;

        // Create text to display the total score
        const totalScoreText = new PIXI.Text(`Total score: ${totalScore}`, {
            fontFamily: 'Arial',
            fontSize: 36,
            fill: 0x000000,
            align: 'center',
        });
        totalScoreText.x = roundedRect.x + (roundedRect.width - totalScoreText.width) / 2;
        totalScoreText.y = roundedRect.y + (roundedRect.height - totalScoreText.height) / 2;

        // Add the rounded rectangle and text to the container
        finalScoreContainer.addChild(roundedRect, totalScoreText);

        // Add the container to the stage
        this.app.stage.addChild(finalScoreContainer);
    }
}
