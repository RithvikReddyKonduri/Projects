using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;


namespace Space_Adventure_Game
{
    internal abstract class GameObject
    {
        // Fields
        private Texture2D texture;
        protected Rectangle position;

        // Get the position and size of the object

        public Rectangle Position 
        {
            get { return position; } 
        }

        // Constructor
        /// <summary>
        /// Initializes a new instance of the <see cref="GameObject"/> class.
        /// </summary>
        /// <param name="texture">The texture representing the object.</param>
        /// <param name="position">The position and size of the object on the screen.</param>
        protected GameObject(Texture2D texture, Rectangle position)
        {
            this.texture = texture;
            this.position = position;
        }
        public virtual void Draw(SpriteBatch sb)
        {
            sb.Draw(texture, position, Color.White);

        }
        public abstract void Update(GameTime gameTime);
    

    }


}
