import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import {
  HashRouter as Router,
  Switch,
  Route
} from 'react-router-dom';
import GameV1 from './versions/v1/App';
import Game from './App';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <Route path="/basic">
          <GameV1 />
        </Route>
        <Route path="/2d">
          <Game />
        </Route>
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);