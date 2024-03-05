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
    internal class Collectible : GameObject
    {

        // Fields & Properties
        private bool isActive;
        public bool IsActive
        {
            get { return isActive; }
            set { isActive = value; }
        }
        /// <summary>
        /// Initializes a new instance of the <see cref="Collectible"/> class.
        /// </summary>
        /// <param name="texture">The texture representing the collectible.</param>
        /// <param name="position">The initial position and size of the collectible on the screen.</param>
        public Collectible(Texture2D texture, Rectangle position)
            : base(texture, position)
        {
            // Collectibles start out active by default
            isActive = true;
        }
        /// <summary>
        /// Checks for collision between this GameObject and another GameObject.
        /// </summary>
        /// <param name="check">The GameObject to check for collision with.</param>
        /// <returns>True if a collision is detected, otherwise false.</returns>
        public bool CheckCollision(GameObject check)
        {
            // If this collectible is not active, return false
            if (!IsActive)
                return false;

            // Check if the rectangle of the current collectible intersects with the provided GameObject's rectangle
            if (Position.Intersects(check.Position))
            {
                // If there is a collision, update this collectible's active field to false
                IsActive = false;
                return true; // Collision detected
            }

            // No collision detected
            return false;
        }

        public override void Update(GameTime gameTime)
        {

        }

    }
}


