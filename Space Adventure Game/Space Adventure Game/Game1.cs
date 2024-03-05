using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xna.Framework.Input;
using System.Diagnostics;


namespace Space_Adventure_Game
    {
    public enum GameState
    {
        Menu,
        Game,
        GameOver,
        HighScores
    }
    public class Game1 : Game
        {
            private GraphicsDeviceManager _graphics;
            private SpriteBatch _spriteBatch;
            // Fields
            Player player;
            List<Collectible> collectibles;
            int currentLevel;
            double timer;
            KeyboardState previousKbState;
            Random random;
            GameState currentState;

            // Assets
            Texture2D playerTexture;
            Texture2D collectibleTexture;
            SpriteFont font;
            Texture2D background;

        public Game1()
        {
                _graphics = new GraphicsDeviceManager(this);
                Content.RootDirectory = "Content";
                IsMouseVisible = true;
                random = new Random(); 

        }

        protected override void Initialize()
        {
            // Retrieve width and height from the initialized GraphicsDevice
            int width = _graphics.GraphicsDevice.Viewport.Width;
            int height = _graphics.GraphicsDevice.Viewport.Height;

            // Load high scores
            List<HighScore> highScores = HighScoreManager.LoadHighScores();

            base.Initialize();
        }


        protected override void LoadContent()
        {
            _spriteBatch = new SpriteBatch(GraphicsDevice);

            // Load the player's texture asset
            playerTexture = Content.Load<Texture2D>("spaceship");
            // Halve the player's texture size
            Rectangle playerRect = new Rectangle(0, 0, playerTexture.Width / 3, playerTexture.Height / 3);

            // Load the texture for the collectible
            collectibleTexture = Content.Load<Texture2D>("rocketfuel");
            // Halve the collectible's texture size
            Rectangle collectibleRect = new Rectangle(0, 0, collectibleTexture.Width / 3, collectibleTexture.Height / 3);

            // Load any SpriteFonts that you'll be using
            font = Content.Load<SpriteFont>("textData");

            //load space background
            background = Content.Load<Texture2D>("space");

            int playerWidth = playerTexture.Width;
            int playerHeight = playerTexture.Height;

            // Calculate the center position for the player
            int screenWidth = GraphicsDevice.Viewport.Width;
            int screenHeight = GraphicsDevice.Viewport.Height;
            int playerX = (screenWidth - playerWidth) / 2;
            int playerY = (screenHeight - playerHeight) / 2;

            // Create the player with the centered position
            player = new Player(playerTexture, new Rectangle(playerX, playerY, playerWidth, playerHeight), 0, 0, screenWidth, screenHeight);
        }



        protected override void Update(GameTime gameTime)
        {
            // Get the current keyboard state
            KeyboardState currentKeyboardState = Keyboard.GetState();

            // Update the game based on its current state
            switch (currentState)
            {
                case GameState.Menu:
                case GameState.GameOver:
                    // Check for a single press of the Enter key
                    if (SingleKeyPress(Keys.Enter, currentKeyboardState))
                    {
                        // Call ResetGame() to set up the initial level
                        ResetGame();

                        // Change the state to Game
                        currentState = GameState.Game;
                    }
                    break;

                case GameState.HighScores:
                    // Check if the user presses the Enter key once
                    if (SingleKeyPress(Keys.Enter, currentKeyboardState))
                    {
                        // Swap to the menu state
                        currentState = GameState.Menu;
                    }
                    break;


                case GameState.Game:
                    // Adjust the timer by subtracting the elapsed seconds since the last frame
                    timer -= (float)gameTime.ElapsedGameTime.TotalSeconds;

                    // Process input to move the player around the screen
                    player.Update(gameTime);

                    // Check all collectibles to see if the player has hit them
                    foreach (Collectible collectible in collectibles.ToList())
                    {
                        if (collectible.CheckCollision(player))
                        {
                            // Reward the player with points (adjust this as needed)
                            player.LevelScore += 10;

                            // Remove the collectible from the list
                            collectibles.Remove(collectible);
                        }
                    }


                    // Determine the next game state
                    if (timer <= 0)
                    {
                        currentState = GameState.GameOver;
                    }
                    else if (collectibles.Count == 0)
                    {
                        NextLevel();
                    }
                    break;
            }

            // Update the previous keyboard state
            previousKbState = currentKeyboardState;

            base.Update(gameTime);
     

        // Update the previous keyboard state
        previousKbState = currentKeyboardState;

            base.Update(gameTime);
        }
        /// <summary>
        /// Resets the game to its initial state.
        /// </summary
        private void ResetGame()
        {
            // Check if player object is null and initialize it if necessary
            if (player == null)
            {

                // Initialize player object
                player = new Player(playerTexture, new Rectangle(0, 0, playerTexture.Width, playerTexture.Height), 0, 0, GraphicsDevice.Viewport.Width, GraphicsDevice.Viewport.Height);

            }

            // Set the current level to zero
            currentLevel = 0;


            // Reset the player's TotalScore property
            player.TotalScore = 0;

            // Call NextLevel() to set up the first level of the game
            NextLevel();
        }

        /// <summary>
        /// Proceeds to the next level of the game.
        /// </summary>
        private void NextLevel()
        {
            // Step 1: Increment the current level by one
            currentLevel++;


            // Step 2: Set the timer to an appropriate value (start with 10 seconds)
            timer = 10;

            // Step 3: Update the player by resetting their LevelScore property
            player.TotalScore += player.LevelScore;
            player.LevelScore = 0;

            // Step 4: Get the collectibles ready
            // Clear the list of collectibles
            // Initialize the collectibles list if it's null
            if (collectibles == null)
            {
                collectibles = new List<Collectible>();
            }
            else
            {
                // Clear the list of collectibles if it's not null
                collectibles.Clear();
            }
            // Calculate how many collectibles the current level should have
            int baseCollectiblesCount = 3; // Base number of collectibles
            int extraCollectiblesPerLevel = 2; // Additional collectibles per level
            int totalCollectiblesCount = baseCollectiblesCount + (extraCollectiblesPerLevel * currentLevel);
            // Example debug statement to track player's level score


            int collectiblesCreated = 0; // Counter for the collectibles created
            const int minimumDistance = 100; // Minimum distance between collectibles and from player

            while (collectiblesCreated < totalCollectiblesCount)
            {
                // Variables to store the x and y coordinates of the new collectible
                int x, y;
                // Variable to store the proposed position and size of the new collectible
                Rectangle proposedPosition;
                // Keep generating a new position for the collectible until it meets the criteria
                do
                {

                    // Generate a random x coordinate within the bounds of the screen, adjusting for collectible width
                    // This ensures the collectible is fully visible horizontally and vertically
                    x = random.Next(collectibleTexture.Width, GraphicsDevice.Viewport.Width - collectibleTexture.Width);
                    y = random.Next(collectibleTexture.Height, GraphicsDevice.Viewport.Height - collectibleTexture.Height);

                    // Create a rectangle representing the proposed position and size of the collectible
                    // This is used for collision detection and rendering
                    proposedPosition = new Rectangle(x, y, collectibleTexture.Width, collectibleTexture.Height);
                }
                // Repeat the loop if the proposed position does not maintain the minimum distance from existing collectibles
                // or if it intersects with the player's current position
                // This ensures collectibles are not too close to each other or to the player upon creation
                while (!IsPositionValid(proposedPosition, minimumDistance) || proposedPosition.Intersects(player.Position));
                // Create a new collectible with the validated position and size
                Collectible newCollectible = new Collectible(collectibleTexture, proposedPosition);
                // Add the new collectible to the list of collectibles in the level
                collectibles.Add(newCollectible);
                collectiblesCreated++;
            }
        }
        /// <summary>
        /// Checks if the proposed position for a new collectible is at a valid distance
        /// from all existing collectibles to avoid overlap and maintain gameplay balance.
        /// </summary>
        /// <param name="proposedPosition">The Rectangle representing the proposed position
        /// and size of the new collectible.</param>
        /// <param name="minimumDistance">The minimum allowed distance between the center of
        /// the proposed collectible and the center of any existing collectibles.</param>
        /// <returns>Returns true if the proposed position is at least the minimum distance away
        /// from all existing collectibles, ensuring no overlap or too-close placement. Otherwise, returns false.</returns>
        /// <remarks>
        /// This method uses the Pythagorean theorem to calculate the actual distance between the centers
        /// of the proposed collectible and each existing collectible. If any existing collectible is closer than
        /// the specified minimum distance to the proposed collectible, the method returns false, indicating
        /// the proposed position is invalid. This validation helps in maintaining a fair and balanced gameplay
        /// experience by preventing collectibles from being placed too close to each other.
        /// </remarks>
        private bool IsPositionValid(Rectangle proposedPosition, int minimumDistance)
            {
            foreach (Collectible existingCollectible in collectibles)
            {
                // Calculate the distance between the centers of the proposed and existing collectibles
                float distanceX = Math.Abs(proposedPosition.Center.X - existingCollectible.Position.Center.X);
                float distanceY = Math.Abs(proposedPosition.Center.Y - existingCollectible.Position.Center.Y);

                // Calculate the actual distance using Pythagorean theorem
                double distance = Math.Sqrt(distanceX * distanceX + distanceY * distanceY);

                if (distance < minimumDistance)
                {
                    // The proposed position is too close to an existing collectible
                    return false;
                }
            }
            // The proposed position is valid
            return true;
        }
        /// <summary>
        /// Checks if a key has been pressed only once.
        /// </summary>
        /// <param name="key">The key to check.</param>
        /// <param name="kbState">The current keyboard state.</param>
        /// <returns>True if the key has been pressed only once, false otherwise.</returns>
        private bool SingleKeyPress(Keys key, KeyboardState kbState)
        {
            // Check if the key is down in the current keyboard state
            bool keyDownNow = kbState.IsKeyDown(key);

            // Check if the key is up in the previous keyboard state
            bool keyUpBefore = previousKbState.IsKeyUp(key);

            // Return true if the key is down now and was up before (i.e., if it's the first frame the key was pressed)
            return keyDownNow && keyUpBefore;
        }

        protected override void Draw(GameTime gameTime)
        {
            GraphicsDevice.Clear(Color.CornflowerBlue);

            // Begin drawing with SpriteBatch
            _spriteBatch.Begin();

            _spriteBatch.Draw(background, new Rectangle(0, 0, GraphicsDevice.Viewport.Width, GraphicsDevice.Viewport.Height), Color.White);

            // Draw based on the current game state
            switch (currentState)
            {
                case GameState.Menu:
                    // Draw title and instructions for starting the game
                    string title = "Space Adventure Game";
                    string instructions = "Press Enter to Start";
                    Vector2 titlePosition = new Vector2((GraphicsDevice.Viewport.Width - font.MeasureString(title).X) / 2, 100);
                    Vector2 instructionsPosition = new Vector2((GraphicsDevice.Viewport.Width - font.MeasureString(instructions).X) / 2, 200);
                    _spriteBatch.DrawString(font, title, titlePosition, Color.White);
                    _spriteBatch.DrawString(font, instructions, instructionsPosition, Color.White);
                    break;

                case GameState.GameOver:
                    // Draw "Game Over" phrase
                    string gameOverText = "Game Over";
                    Vector2 gameOverPosition = new Vector2((GraphicsDevice.Viewport.Width - font.MeasureString(gameOverText).X) / 2, 100);
                    _spriteBatch.DrawString(font, gameOverText, gameOverPosition, Color.White);

                    // Draw last level reached, total score, and instructions for returning to main menu
                    string lastLevelText = "Last Level: " + currentLevel;
                    string totalScoreText = "Total Score: " + player.TotalScore;
                    string returnInstructions = "Press Enter to Return to Menu";
                    Vector2 lastLevelPosition = new Vector2((GraphicsDevice.Viewport.Width - font.MeasureString(lastLevelText).X) / 2, 200);
                    Vector2 totalScorePosition = new Vector2((GraphicsDevice.Viewport.Width - font.MeasureString(totalScoreText).X) / 2, 250);
                    Vector2 returnInstructionsPosition = new Vector2((GraphicsDevice.Viewport.Width - font.MeasureString(returnInstructions).X) / 2, 300);
                    _spriteBatch.DrawString(font, lastLevelText, lastLevelPosition, Color.White);
                    _spriteBatch.DrawString(font, totalScoreText, totalScorePosition, Color.White);
                    _spriteBatch.DrawString(font, returnInstructions, returnInstructionsPosition, Color.White);
                    break;

                case GameState.Game:
                    // Draw collectibles and player
                    foreach (Collectible collectible in collectibles)
                    {
                        collectible.Draw(_spriteBatch);
                    }
                    player.Draw(_spriteBatch);

                    // Draw current level, score for this level, and timer
                    string levelText = "Level: " + currentLevel;
                    string scoreText = "Score: " + player.LevelScore;   
                    string timerText = "Time Left: " + String.Format("{0:0.00}", timer);
                    Vector2 levelPosition = new Vector2(10, 10);
                    Vector2 scorePosition = new Vector2(10, 30);
                    Vector2 timerPosition = new Vector2(10, 50);
                    _spriteBatch.DrawString(font, levelText, levelPosition, Color.White);
                    _spriteBatch.DrawString(font, scoreText, scorePosition, Color.White);
                    _spriteBatch.DrawString(font, timerText, timerPosition, Color.White);
                    break;

                case GameState.HighScores:
                    // Draw high scores using SpriteBatch
                    List<HighScore> highScores = HighScoreManager.LoadHighScores();
                    Vector2 position = new Vector2(100, 100);
                    int yOffset = 20;
                    foreach (HighScore score in highScores.Take(10))
                    {
                        _spriteBatch.DrawString(font, score.ToString(), position, Color.White);
                        position.Y += yOffset;
                    }
                    break;

            }

            // End drawing with SpriteBatch
            _spriteBatch.End();

            base.Draw(gameTime);
        }

    }
}