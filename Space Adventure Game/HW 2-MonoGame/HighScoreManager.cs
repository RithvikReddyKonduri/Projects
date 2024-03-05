using Space_Adventure_Game;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace Space_Adventure_Game
{

    public class HighScoreManager
    {
        private const string HighScoreFilePath = "highscores.txt";

        // Load high scores from the file
        public static List<HighScore> LoadHighScores()
        {
            List<HighScore> highScores = new List<HighScore>();

            // Check if the high score file exists
            if (File.Exists(HighScoreFilePath))
            {
                // Read all lines from the file
                string[] lines = File.ReadAllLines(HighScoreFilePath);

                // Parse each line to create HighScore objects
                foreach (string line in lines)
                {
                    // Split the line into parts using the ':' character as a separator
                    string[] parts = line.Split(':');

                    // Check if the line contains two parts (player name and score)
                    if (parts.Length == 2)
                    {
                        // Try to parse the second part (score) as an integer
                        int score;
                        if (int.TryParse(parts[1], out score))
                        {
                            // If successful, create a HighScore object and add it to the list
                            HighScore newHighScore = new HighScore();
                            newHighScore.PlayerName = parts[0]; // First part is player name
                            newHighScore.Score = score; // Second part is score
                            highScores.Add(newHighScore); // Add the HighScore object to the list
                        }
                    }
                }

                // Sort high scores manually in descending order by score
                for (int i = 0; i < highScores.Count - 1; i++)
                {
                    for (int j = i + 1; j < highScores.Count; j++)
                    {
                        if (highScores[j].Score > highScores[i].Score)
                        {
                            // Swap positions if the score at index j is greater than the score at index i
                            HighScore temp = highScores[i];
                            highScores[i] = highScores[j];
                            highScores[j] = temp;
                        }
                    }
                }
            }

            return highScores;
        }

        // Save high scores to the file
        public static void SaveHighScores(List<HighScore> highScores)
        {
            StreamWriter writer = null;
            try
            {
                // Create or overwrite the high score file
                writer = new StreamWriter(HighScoreFilePath);

                // Write each high score to the file in the format "PlayerName:Score"
                foreach (HighScore score in highScores)
                {
                    writer.WriteLine(score.PlayerName + ":" + score.Score);
                }
            }
            finally
            {
                // Close the StreamWriter if it was initialized
                if (writer != null)
                {
                    writer.Close();
                }
            }
        }

        // Update high scores with a new score
        public static void UpdateHighScores(string playerName, int score)
        {
            // Load existing high scores
            List<HighScore> highScores = LoadHighScores();

            // Add the new score to the list of high scores
            highScores.Add(new HighScore { PlayerName = playerName, Score = score });

            // Sort the high scores  using bubble sort
            for (int i = 0; i < highScores.Count - 1; i++)
            {
                for (int j = i + 1; j < highScores.Count; j++)
                {
                    if (highScores[j].Score > highScores[i].Score)
                    {
                        // Swap positions if the score at index j is greater than the score at index i
                        HighScore temp = highScores[i];
                        highScores[i] = highScores[j];
                        highScores[j] = temp;
                    }
                }
            }

            // Keep only the top 10 scores
            while (highScores.Count > 10)
            {
                highScores.RemoveAt(highScores.Count - 1);
            }

            // Save the updated high scores
            SaveHighScores(highScores);
        }

    }

}
