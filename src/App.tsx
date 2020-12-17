import React, { useState, useEffect } from 'react';
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

const Pepper = ({ state }: PepperProps) => {
  return <div className={classNames('cell', {
    'spicy': state === PepperStates.SPICY,
    'sweet': state === PepperStates.SWEET
  })} />
}

const Player = ({ score }: PlayerProps) => {
  const size = 30 + ( score * 5 );

  return <div className="cell player" style={ {
    width: size,
    height: size,
    backgroundColor: colorMatix[ score ]
  } } />;
}

function App() {
  const [ matrix, setMatrix ] = useState( generateMatrix );
  const [ x, setX ] = useState(() => Math.floor(Math.random() * matrix.length));
  const [ y, setY ] = useState(() => Math.floor(Math.random() * matrix.length));
  const [ score, setScore ] = useState(0);

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
      console.log( e.code )

      if ([KeyboardArrows.LEFT, KeyboardArrows.RIGHT].includes( e.code as KeyboardArrows )) { 
        setX(currentX => {
          const nextX = e.code === KeyboardArrows.LEFT ?  Math.max(0, currentX - 1) : Math.min(matrix.length - 1, currentX + 1);
  
          return nextX;
        });
      }

      if ([KeyboardArrows.UP, KeyboardArrows.DOWN].includes( e.code as KeyboardArrows )) { 
        setY(currentY => {
          const nextY = e.code === KeyboardArrows.UP ?  Math.max(0, currentY - 1) : Math.min(matrix.length - 1, currentY + 1);
  
          return nextY;
        });
      }
    }

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    }
  }, [matrix.length]);

  useEffect(() => {
    if (matrix[y][x].state === PepperStates.EMPTY) { return; }

    const isSpicy = matrix[y][x].state === PepperStates.SPICY;

    setScore( currentScore => {
      return isSpicy ? currentScore + 1 : -1;
    });
  }, [x, y])

  return (
    score === -1 ? 
    <div>Game Over</div> : 
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
  );
}

const colorMatix = createGradiant({ start: '#ffe8e8', end: '#FF0000', steps: 100 });

function getRandomTime() {
  return new Date(Date.now() + (3 + Math.random() * 5) * 1000);
}

function getRandomState() {
  return Math.floor(Math.random() * 2) ? PepperStates.SPICY : PepperStates.SWEET;
}

function generateMatrix() {
  return Array(10).fill(null).map(_ => {
    return Array(10).fill(null).map(_ => ({ state: PepperStates.EMPTY, nextUpdate: getRandomTime(), done: false }));
  });
}

export default App;
