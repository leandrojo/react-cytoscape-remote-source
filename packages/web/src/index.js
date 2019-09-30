/* global document */
/* eslint-disable react/jsx-filename-extension */

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

(() => {
  const { hostname } = document.location;
  const script = document.createElement('script');

  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', `http://${hostname}:8080/socket.io/socket.io.js`);

  document.body.appendChild(script);

  script.onload = () => {
    ReactDOM.render(<App />, document.getElementById('root'));
  };
})();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
