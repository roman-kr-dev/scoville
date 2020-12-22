import React, { useState, useEffect, useRef, useCallback } from 'react';
import classNames from 'classnames';
import createGradiant from '../../utils/colors';

enum PepperStates {
  EMPTY,
  ACTIVE,
  SPICY,
  SWEET,
  DONE
}

enum GameStatus {
  ACTIVE,
  GAMEOVER,
  COMPLETED
}

enum KeyboardArrows {
  LEFT = 'ArrowLeft',
  RIGHT = 'ArrowRight'
}

interface PepperProps {
  state: PepperStates
}

interface PlayerProps {
  score: number
}

const Pepper = ({ state }: PepperProps) => {
  return <div className={classNames('cell', {
    'spicy': state === PepperStates.SPICY,
    'sweet': state === PepperStates.SWEET,
    'done': state === PepperStates.DONE
  })} />
}

const Player = ({ score }: PlayerProps) => {
  return <div className="cell player" style={ {
    backgroundColor: colorMatix[ score ]
  } } />;
}

const Score = ({ score }: { score: number }) => {
  return <div className="score">Score: {score}</div>
}

const ArrowsPanel = ({ onArrowClick }: { onArrowClick: ( arrow: KeyboardArrows ) => void }) => {
  return (
    <div className="arrows">
      <span className="left" onClick={() => { onArrowClick( KeyboardArrows.LEFT ); }}>&#8592;</span>
      <span className="right" onClick={() => { onArrowClick( KeyboardArrows.RIGHT ); }}>&#8594;</span>
    </div>
  );
}

function App() {
  const [ matrix, setMatrix ] = useState( generateMatrix );
  const [ x, setX ] = useState(() => Math.floor(Math.random() * matrix.length));
  const [ score, setScore ] = useState(0);
  const [ gameStatus, setGameStatus ] = useState( GameStatus.ACTIVE );
  const matrixRef = useRef( matrix );

  const move = useCallback(( arrow: KeyboardArrows ) => {
    if ([KeyboardArrows.LEFT, KeyboardArrows.RIGHT].includes( arrow )) { 
      setX(currentX => {
        const nextX = arrow === KeyboardArrows.LEFT ?  Math.max(0, currentX - 1) : Math.min(matrixRef.current.length - 1, currentX + 1);

        return nextX;
      });
    }
  }, []);

  const reset = useCallback(() => {
    const matrix = generateMatrix();

    setMatrix( matrix );
    setX( Math.floor(Math.random() * matrixRef.current.length) );
    setScore( 0 );
    setGameStatus( GameStatus.ACTIVE );

    matrixRef.current = matrix;
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if ( gameStatus !== GameStatus.ACTIVE ) { return; }

    const randomize = () => {
      setMatrix(currentMatrix => {
        const now = new Date();
        
        const newMatrix = [...currentMatrix].map(box => {
          if (box.state !== PepperStates.ACTIVE && box.state !== PepperStates.DONE && now > box.nextUpdate && !box.done) {
            box.nextUpdate = getRandomTime();
            box.state = getRandomState( box.state === PepperStates.SWEET ? 3 : 2 );
          }

          return box;
        });
  
        return newMatrix;
      });
    }

    interval = setInterval(() => {
      randomize();
    }, 250);

    return () => clearInterval(interval);  
  }, [ gameStatus ]);

  useEffect(() => {
    if (  gameStatus !== GameStatus.ACTIVE ) { return; }

    const onKeyDown = (e: KeyboardEvent) => {
      if (![KeyboardArrows.LEFT, KeyboardArrows.RIGHT].includes( e.code as KeyboardArrows )) { return; }

      setX(currentX => {
        const nextX = e.code === KeyboardArrows.LEFT ?  Math.max(0, currentX - 1) : Math.min(matrixRef.current.length - 1, currentX + 1);

        return nextX;
      });
    }

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [ gameStatus ]);

  useEffect(() => {
    const matrix = matrixRef.current;

    if (matrix[x].state === PepperStates.EMPTY || matrix[x].state === PepperStates.DONE) { return; }

    const isSpicy = matrix[x].state === PepperStates.SPICY;

    if ( isSpicy ) {
      matrix[x].state = PepperStates.DONE;

      setScore(currentScore => currentScore + 1);
    } else {
      setGameStatus( GameStatus.GAMEOVER );
    }
  }, [x]);

  useEffect(() => {
    if ( score === matrixRef.current.length ) {
      setGameStatus( GameStatus.COMPLETED );
    }
  }, [score]);

  return (
    <>
      { gameStatus === GameStatus.GAMEOVER ? <div className="game-over">Game Over ( score: { score } ) <button onClick={ reset }>Try Again</button></div> : null }
      { gameStatus === GameStatus.COMPLETED ? <div className="game-completed">Great Success! ( score: { score } ) <button onClick={ reset }>Start Again </button></div> : null }
      { gameStatus === GameStatus.ACTIVE ? <Score score={score} /> : null }
      { gameStatus === GameStatus.ACTIVE ? <ArrowsPanel onArrowClick={ move } /> : null }
      
      <div className={ classNames('scoville-race', { 'done': gameStatus !== GameStatus.ACTIVE }) }>
        {matrix.map(({ state }, i) =>
          x === i ? <Player key={i} score={ score } /> : <Pepper key={i} state={ state } />
        )}
      </div>
    </>
  );
}

const colorMatix = createGradiant({ start: '#abf1ff', end: '#2e38ff', steps: 10 });

function getRandomTime(minSeconds: number = 3, secondsRange: number = 5) {
  return new Date(Date.now() + (minSeconds + Math.random() * secondsRange) * 1000);
}

function getRandomState( spicyWeight = 2 ) {
  return Math.floor(Math.random() * spicyWeight) === 0 ? PepperStates.SWEET : PepperStates.SPICY;
}

function generateMatrix() {
  return Array(10).fill(null).map((_, i) => ({ state: PepperStates.EMPTY, nextUpdate: getRandomTime( 1, 10 ), done: false, i }));
}

export default App;
