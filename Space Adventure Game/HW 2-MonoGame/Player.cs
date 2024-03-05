using Microsoft.Xna.Framework.Graphics;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xna.Framework.Input;
using Microsoft.Xna.Framework;


namespace Space_Adventure_Game
{
    internal class Player:GameObject
    {
        //fields 
        private int levelScore; //LevelScore is the score of the current level
        private int totalScore; // keep track of the player’s total score since starting the game
        private int width;
        private int height;
        private float movementSpeed = 5.0f;

        // Properties
        public int LevelScore
        {
            get { return levelScore; }
            set { levelScore = value; }
        }

        public int TotalScore
        {
            get { return totalScore; }
            set { totalScore = value; }
        }
        /// <summary>
        /// Initializes a new instance of the <see cref="Player"/> class.
        /// </summary>
        /// <param name="texture">The texture representing the player.</param>
        /// <param name="position">The initial position and size of the player on the screen.</param>
        /// <param name="localScore">The score of the player within the current level.</param>
        /// <param name="totalScore">The total score of the player across all levels.</param>
        /// <param name="width">The width of the player.</param>
        /// <param name="height">The height of the player.</param>
        public Player(Texture2D texture, Rectangle position, int localScore, int totalScore,int width,int height)
            : base(texture, position)
        {
            this.levelScore = localScore;
            this.totalScore = totalScore;
            this.width = width;
            this.height = height;

        }
        public override void Update(GameTime gameTime)
        {
            KeyboardState kbState = Keyboard.GetState();
            Vector2 movement = Vector2.Zero;
            if (kbState.IsKeyDown(Keys.Up) || kbState.IsKeyDown(Keys.W))
            {
                movement.Y -= movementSpeed;
            }
            if (kbState.IsKeyDown(Keys.Down) || kbState.IsKeyDown(Keys.S))
            {
                movement.Y += movementSpeed;
            }
            if (kbState.IsKeyDown(Keys.Left) || kbState.IsKeyDown(Keys.A))
            {
                movement.X -= movementSpeed;
            }
            if (kbState.IsKeyDown(Keys.Right) || kbState.IsKeyDown(Keys.D))
            {
                movement.X += movementSpeed;
            }

            // Normalize the movement vector if the player moves diagonally.
            if (movement != Vector2.Zero)
            {
                movement.Normalize();
            }


            // movement speed to the normalized vector.
            movement *= movementSpeed;

            // Calculate the new position.
            int newX = position.X + (int)movement.X;
            int newY = position.Y + (int)movement.Y;

            // Wrap around logic
            if (newX < 0)
            {
                newX = width - 1;
            }
            else if (newX >= width)
            {
                newX = 0;
            }

            if (newY < 0)
            {
                newY = height - 1;
            }
            else if (newY >= height)
            {
                newY = 0;
            }


            // Assign the new position to the player.
            position = new Rectangle(newX, newY, position.Width, position.Height);
        }
        /// <summary>
        /// Centers the player on the screen.
        /// </summary>
        public void Center()
        {
            // Calculate the center position
            int centerX = width / 2 - position.Width / 2;
            int centerY = height / 2 - position.Height / 2;

            // Set the player's position to the center of the screen
            position = new Rectangle(centerX, centerY, position.Width, position.Height);
        }

    }
}
