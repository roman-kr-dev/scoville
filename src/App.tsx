import React, { useState, useEffect, useCallback, useRef } from 'react';
import classNames from 'classnames';
import createGradiant from './utils/colors';
import './App.scss';

enum PepperStates {
  EMPTY,
  ACTIVE,
  SPICY,
  SWEET
}

enum KeyboardArrows {
  LEFT = 'ArrowLeft',
  RIGHT = 'ArrowRight',
  UP = 'ArrowUp',
  DOWN = 'ArrowDown'
}

interface PepperProps {
  state: PepperStates
}

interface PlayerProps {
  score: number
}

const matrixSize = { x: 10, y: 10 };

const Pepper = ({ state }: PepperProps) => {
  return <div className={classNames('cell', {
    'spicy': state === PepperStates.SPICY,
    'sweet': state === PepperStates.SWEET
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
      <span className="up" onClick={() => { onArrowClick( KeyboardArrows.UP ); }}>&#8593;</span>
      <span className="down" onClick={() => { onArrowClick( KeyboardArrows.DOWN ); }}>&#8595;</span>
    </div>
  );
}

function App() {
  const [ matrix, setMatrix ] = useState( generateMatrix );
  const marixRef = useRef( matrix );
  const [ x, setX ] = useState(() => Math.floor(Math.random() * matrixSize.x));
  const [ y, setY ] = useState(() => Math.floor(Math.random() * matrixSize.y));
  const [ score, setScore ] = useState(0);

  const move = useCallback(( arrow: KeyboardArrows ) => {
    if ([KeyboardArrows.LEFT, KeyboardArrows.RIGHT].includes( arrow )) { 
      setX(currentX => {
        const nextX = arrow === KeyboardArrows.LEFT ?  Math.max(0, currentX - 1) : Math.min(matrixSize.x - 1, currentX + 1);

        return nextX;
      });
    }

    if ([KeyboardArrows.UP, KeyboardArrows.DOWN].includes( arrow )) { 
      setY(currentY => {
        const nextY = arrow === KeyboardArrows.UP ?  Math.max(0, currentY - 1) : Math.min(matrixSize.y - 1, currentY + 1);

        return nextY;
      });
    }
  }, []);

  useEffect(() => {
    const randomize = () => {
      setMatrix(currentMatrix => {
        const now = new Date();
        
        const newMatrix = [...currentMatrix].map(row => {
          return row.map(box => {
            if (box.state !== PepperStates.ACTIVE && now > box.nextUpdate && !box.done) {
              box.nextUpdate = getRandomTime();
              box.state = getRandomState();
            }
  
            return box;
          });
        });
  
        return newMatrix;
      });
    }

    const interval = setInterval(() => {
      randomize();
    }, 250);

    return () => clearInterval(interval);  
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      move( e.code as KeyboardArrows );
    }

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    }
  }, [move]);

  useEffect(() => {
    const matrix = marixRef.current;

    if (matrix[y][x].state === PepperStates.EMPTY) { return; }

    const isSpicy = matrix[y][x].state === PepperStates.SPICY;

    setScore( currentScore => {
      return isSpicy ? currentScore + 1 : -1;
    });
  }, [x, y]);

  return (
    score === -1 ? 
    <div>Game Over</div> : 
    <>
      <Score score={score} />
      <ArrowsPanel onArrowClick={ move } />

      <div className="scoville-race">
        {
          matrix.map((row, yIndex) => <div key={ yIndex } className="row">
            {
              row.map(({ state }, xIndex) => {
                const key = `${yIndex}${xIndex}`;

                return y === yIndex && x === xIndex ? <Player key={ key } score={ score } /> : <Pepper key={ key } state={ state } />
              })
            }
          </div>)
        }
      </div>
    </>
  );
}

const colorMatix = createGradiant({ start: '#abf1ff', end: '#2e38ff', steps: matrixSize.x * matrixSize.y });

function getRandomTime(secondsRange: number = 5) {
  return new Date(Date.now() + (3 + Math.random() * secondsRange) * 1000);
}

function getRandomState() {
  return Math.floor(Math.random() * 2) ? PepperStates.SPICY : PepperStates.SWEET;
}

function generateMatrix() {
  return Array(10).fill(null).map(_ => {
    return Array(10).fill(null).map(_ => ({ state: PepperStates.EMPTY, nextUpdate: getRandomTime( matrixSize.x * matrixSize.y ), done: false }));
  });
}

export default App;