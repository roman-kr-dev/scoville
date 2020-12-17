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
        <Route path="/v1">
          <GameV1 />
        </Route>
        <Route path="/">
          <Game />
        </Route>
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);