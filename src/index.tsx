import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';
import Basic from './versions/basic/App';
import TwoD from './versions/2d/App';;

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <Route path="/basic">
          <Basic />
        </Route>
        <Route path="/2d">
          <TwoD />
        </Route>
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);