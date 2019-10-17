import React from 'react';
import ReactDOM from 'react-dom';
import CreatePlaylist from './components/create_playlist.js';
import './style/index.css';

function Login() {
  return (
    <div>
      <CreatePlaylist />
    </div>
  );
}

const loginButton = <Login />;

ReactDOM.render(
  loginButton,
  document.getElementById('root')
);
