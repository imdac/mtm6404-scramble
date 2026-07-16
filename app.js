/**********************************************
 * STARTER CODE
 **********************************************/

/**
 * shuffle()
 * Shuffle the contents of an array
 *   depending the datatype of the source
 * Makes a copy. Does NOT shuffle the original.
 * Based on Steve Griffith's array shuffle prototype
 * @Parameters: Array or string
 * @Return: Scrambled Array or string, based on the provided parameter
 */
function shuffle (src) {
  const copy = [...src]

  const length = copy.length
  for (let i = 0; i < length; i++) {
    const x = copy[i]
    const y = Math.floor(Math.random() * length)
    const z = copy[y]
    copy[i] = z
    copy[y] = x
  }

  if (typeof src === 'string') {
    return copy.join('')
  }

  return copy
}

/**********************************************
 * YOUR CODE BELOW
 **********************************************/

// Destructure React hooks
const { useState, useEffect } = React;

// Array of 10 words
const ORIGINAL_WORDS = [
  'react',
  'javascript',
  'component',
  'state',
  'effect',
  'storage',
  'scramble',
  'student',
  'program',
  'website'
];

function Game() {
  // Game States
  const [wordsArray, setWordsArray] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrambledWord, setScrambledWord] = useState('');
  const [guess, setGuess] = useState('');
  const [points, setPoints] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [passes, setPasses] = useState(3);
  const [feedback, setFeedback] = useState('');
  const [gameOver, setGameOver] = useState(false);

  const MAX_STRIKES = 3;

  // Initialize a fresh game
  const initGame = () => {
    const freshShuffledList = shuffle(ORIGINAL_WORDS);
    const firstWordScrambled = shuffle(freshShuffledList[0]);

    setWordsArray(freshShuffledList);
    setCurrentIndex(0);
    setScrambledWord(firstWordScrambled);
    setPoints(0);
    setStrikes(0);
    setPasses(3);
    setFeedback('');
    setGameOver(false);
    setGuess('');

    // Set initial values in Local Storage
    localStorage.setItem('scramble_words', JSON.stringify(freshShuffledList));
    localStorage.setItem('scramble_index', '0');
    localStorage.setItem('scramble_scrambled_word', firstWordScrambled);
    localStorage.setItem('scramble_points', '0');
    localStorage.setItem('scramble_strikes', '0');
    localStorage.setItem('scramble_passes', '3');
    localStorage.setItem('scramble_game_over', 'false');
  };

  // Pull data from Local Storage on initial load
  useEffect(() => {
    const savedWords = localStorage.getItem('scramble_words');
    const savedIndex = localStorage.getItem('scramble_index');
    const savedScrambled = localStorage.getItem('scramble_scrambled_word');
    const savedPoints = localStorage.getItem('scramble_points');
    const savedStrikes = localStorage.getItem('scramble_strikes');
    const savedPasses = localStorage.getItem('scramble_passes');
    const savedGameOver = localStorage.getItem('scramble_game_over');

    // If data exists, load it into React state
    if (savedWords && savedIndex && savedScrambled && savedPoints && savedStrikes && savedPasses && savedGameOver) {
      setWordsArray(JSON.parse(savedWords));
      setCurrentIndex(parseInt(savedIndex, 10));
      setScrambledWord(savedScrambled);
      setPoints(parseInt(savedPoints, 10));
      setStrikes(parseInt(savedStrikes, 10));
      setPasses(parseInt(savedPasses, 10));
      setGameOver(savedGameOver === 'true');
    } else {
      initGame();
    }
  }, []);

  // Save changes to Local Storage whenever React states change
  useEffect(() => {
    if (wordsArray.length > 0) {
      localStorage.setItem('scramble_words', JSON.stringify(wordsArray));
      localStorage.setItem('scramble_index', currentIndex.toString());
      localStorage.setItem('scramble_scrambled_word', scrambledWord);
      localStorage.setItem('scramble_points', points.toString());
      localStorage.setItem('scramble_strikes', strikes.toString());
      localStorage.setItem('scramble_passes', passes.toString());
      localStorage.setItem('scramble_game_over', gameOver.toString());
    }
  }, [wordsArray, currentIndex, scrambledWord, points, strikes, passes, gameOver]);

  // Advance to next word
  const advanceWord = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= wordsArray.length) {
      setGameOver(true);
    } else {
      setCurrentIndex(nextIndex);
      setScrambledWord(shuffle(wordsArray[nextIndex]));
    }
  };

  // Handle submit guess
  const handleGuessSubmit = (e) => {
    e.preventDefault(); // Stop page reload

    if (!guess.trim() || gameOver) return;

    const currentWord = wordsArray[currentIndex];

    // Case-insensitive comparison
    if (guess.trim().toLowerCase() === currentWord.toLowerCase()) {
      setFeedback('Correct!');
      setPoints(points + 1);
      advanceWord();
    } else {
      setFeedback('Incorrect!');
      const nextStrikes = strikes + 1;
      setStrikes(nextStrikes);

      if (nextStrikes >= MAX_STRIKES) {
        setGameOver(true);
      }
    }

    setGuess(''); // Clear textbox
  };

  // Handle pass button
  const handlePass = () => {
    if (passes > 0 && !gameOver) {
      setPasses(passes - 1);
      setFeedback('Word Skipped!');
      advanceWord();
      setGuess(''); // Clear textbox
    }
  };

  // Reset Game and clear Local Storage keys
  const handleReset = () => {
    localStorage.removeItem('scramble_words');
    localStorage.removeItem('scramble_index');
    localStorage.removeItem('scramble_scrambled_word');
    localStorage.removeItem('scramble_points');
    localStorage.removeItem('scramble_strikes');
    localStorage.removeItem('scramble_passes');
    localStorage.removeItem('scramble_game_over');
    initGame();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Scramble</h1>

      {gameOver ? (
        <div>
          <h2 style={styles.gameOverTitle}>Game Over</h2>
          <p style={styles.statsText}>Your Final Score: <strong>{points}</strong> Points</p>
          
          {strikes >= MAX_STRIKES ? (
            <p style={{ ...styles.statsText, color: '#ff4d4d' }}>Max strikes reached.</p>
          ) : (
            <p style={{ ...styles.statsText, color: '#00cc66' }}>You completed all words.</p>
          )}

          <button onClick={handleReset} style={styles.buttonSubmit}>
            Play Again
          </button>
        </div>
      ) : (
        <div>
          {/* Stats Display */}
          <div style={styles.statsBar}>
            <span><strong>Points:</strong> {points}</span>
            <span><strong>Strikes:</strong> {strikes}/{MAX_STRIKES}</span>
            <span><strong>Passes:</strong> {passes}</span>
          </div>

          {/* Scrambled Word Box */}
          <div style={styles.scrambleDisplay}>
            {scrambledWord}
          </div>

          {/* Guess Form */}
          <form onSubmit={handleGuessSubmit} style={{ marginBottom: '12px' }}>
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Your guess..."
              style={styles.input}
            />
            <button type="submit" style={styles.buttonSubmit}>
              Submit Guess
            </button>
          </form>

          {/* Pass Button */}
          <button 
            onClick={handlePass} 
            disabled={passes === 0}
            style={{
              ...styles.buttonPass,
              color: passes === 0 ? '#999' : '#000',
              cursor: passes === 0 ? 'not-allowed' : 'pointer',
              textDecoration: passes === 0 ? 'line-through' : 'none'
            }}
          >
            Pass Word
          </button>

          {/* Feedback Output */}
          {feedback && (
            <p style={{
              ...styles.feedback,
              color: feedback.includes('Correct') ? '#00cc66' : '#ff4d4d'
            }}>
              {feedback}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Minimalist Styles Object
const styles = {
  container: {
    maxWidth: '360px',
    margin: '100px auto',
    fontFamily: 'system-ui, sans-serif',
    textAlign: 'center',
    padding: '24px',
    border: '1px solid #eee',
    borderRadius: '12px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111',
    marginBottom: '20px',
    letterSpacing: '-0.5px'
  },
  statsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#666',
    marginBottom: '24px'
  },
  scrambleDisplay: {
    fontSize: '32px',
    fontWeight: 'bold',
    letterSpacing: '6px',
    textTransform: 'uppercase',
    color: '#111',
    margin: '30px 0',
    userSelect: 'none'
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    boxSizing: 'border-box',
    marginBottom: '10px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    outline: 'none',
    textAlign: 'center'
  },
  buttonSubmit: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  buttonPass: {
    width: '100%',
    padding: '10px',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500'
  },
  feedback: {
    marginTop: '16px',
    fontSize: '15px',
    fontWeight: '600'
  },
  gameOverTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111',
    marginBottom: '10px'
  },
  statsText: {
    fontSize: '16px',
    color: '#444',
    marginBottom: '20px'
  }
};

// Mount App to root div in index.html
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Game />);