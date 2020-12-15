import React, { useState, useEffect, useCallback } from 'react';
import classNames from 'classnames';
import createGradiant from './utils/colors';
import logo from './logo.svg';
import './App.scss';
import { time } from 'console';

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

interface UpdatePepperProps {
  xIndex: number,
  state: PepperStates
}

interface PepperProps {
  state: PepperStates,
  xIndex: number,
  onUpdate: ({ xIndex, state }: UpdatePepperProps) => void
}

interface PlayerProps {
  color: string
}

const Pepper = ({ state, xIndex, onUpdate }: PepperProps) => {
  useEffect(() => {
    let timeout: number;

    const randomState = () => {
      timeout = window.setTimeout(() => {
        const newState = Math.floor(Math.random() * 2) ? PepperStates.SPICY : PepperStates.SWEET;

        if ( newState !== state ) { onUpdate({ xIndex, state: newState }) }
      }, (Math.random() * 5 * 1000));
    }

    randomState();

    return () => {
      clearTimeout(timeout);
    }
  }, [state, xIndex, onUpdate]);

  return <div className={classNames('cell', {
    'spicy': state === PepperStates.SPICY,
    'sweet': state === PepperStates.SWEET
  })} />
}

const Player = ({ color }: PlayerProps) => {
  return <div className="cell player" style={ {backgroundColor: color} } />;
}

function App() {
  const [ matrix, setMatrix ] = useState( generateMatrix );
  const [ colorMatrix ] = useState( generateColorMatrix(matrix.length) );
  const [ x, setX ] = useState(() => Math.floor(Math.random() * matrix.length));
  const [ score, setScore ] = useState(0);

  const updatePepperState = useCallback(({ xIndex, state }: UpdatePepperProps) => {
    setMatrix((currentMatrix) => {
      const newMatrix = [...currentMatrix];
      newMatrix[ xIndex ] = {...newMatrix[ xIndex ], state };

      return newMatrix;
    });
  }, []);


  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch ( e.code ) {
        case KeyboardArrows.LEFT:
          setX(currentX => Math.max(0, currentX - 1));

          setScore( score => score + 1 );
          break;

        case KeyboardArrows.RIGHT:
          setX(currentX => Math.min(matrix.length - 1, currentX + 1));

          setScore( score => score + 1 );
          break;
      }
    }

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    }
  }, [matrix.length]);

  return (
    <div className="scoville-race">
       {matrix.map(({ state }, i) =>
          x === i ? <Player key={i} color={ colorMatrix[ score ] } /> : <Pepper key={i} xIndex={i} state={ state } onUpdate={ updatePepperState } />
       )}
    </div>
  );
}

function generateMatrix() {
  return Array(10).fill({state: PepperStates.EMPTY});
}

function generateColorMatrix(steps: number) {
  return () => {
    return createGradiant({ start: '#ffe8e8', end: '#FF0000', steps: steps - 2 });
  }
}

export default App;
