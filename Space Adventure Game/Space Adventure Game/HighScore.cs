    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Threading.Tasks;

    namespace Space_Adventure_Game
    {
        public class HighScore
        {
        public string PlayerName { get; set; }
        public int Score { get; set; }

    
            public override string ToString()
            {
        
                return $"{PlayerName}: {Score}";
        
            }

        }
    }
