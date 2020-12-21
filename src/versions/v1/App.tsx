import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import createGradiant from '../../utils/colors';
import './App.scss';

enum PepperStates {
  EMPTY,
  ACTIVE,
  SPICY,
  SWEET
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
  const marixRef = useRef( matrix );
  const [ x, setX ] = useState(() => Math.floor(Math.random() * matrix.length));
  const [ score, setScore ] = useState(0);

  useEffect(() => {
    const randomize = () => {
      setMatrix(currentMatrix => {
        const now = new Date();
        
        const newMatrix = [...currentMatrix].map(box => {
          if (box.state !== PepperStates.ACTIVE && now > box.nextUpdate && !box.done) {
            box.nextUpdate = getRandomTime();
            box.state = getRandomState();
          }

          return box;
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
      if (![KeyboardArrows.LEFT, KeyboardArrows.RIGHT].includes( e.code as KeyboardArrows )) { return; }

      setX(currentX => {
        const nextX = e.code === KeyboardArrows.LEFT ?  Math.max(0, currentX - 1) : Math.min(matrix.length - 1, currentX + 1);

        return nextX;
      });
    }

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    }
  }, [matrix.length]);

  useEffect(() => {
    const matrix = marixRef.current;

    if (matrix[x].state === PepperStates.EMPTY) { return; }

    const isSpicy = matrix[x].state === PepperStates.SPICY;

    setScore( currentScore => {
      return isSpicy ? currentScore + 1 : -1;
    });
  }, [x])

  return (
    score === -1 ? 
    <div>Game Over</div> : 
    <div className="scoville-race">
       {matrix.map(({ state }, i) =>
          x === i ? <Player key={i} score={ score } /> : <Pepper key={i} state={ state } />
       )}
    </div>
  );
}

const colorMatix = createGradiant({ start: '#ffe8e8', end: '#FF0000', steps: 50 });

function getRandomTime() {
  return new Date(Date.now() + (3 + Math.random() * 5) * 1000);
}

function getRandomState() {
  return Math.floor(Math.random() * 2) ? PepperStates.SPICY : PepperStates.SWEET;
}

function generateMatrix() {
  return Array(10).fill(null).map((_, i) => ({ state: PepperStates.EMPTY, nextUpdate: getRandomTime(), done: false, i }));
}

export default App;
