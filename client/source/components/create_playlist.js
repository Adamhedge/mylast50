import React, { Component } from 'react';
import './create_playlist.css';

class CreatePlaylist extends Component {
  constructor() {
    super();

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    console.log('Success!');
  }

  render() {
    return (
      <div className='fiftyButton'>
        <p className='instructions'>Tap for your last 50 songs</p>
        <a href="#">
          <button className='button' onClick={this.handleClick}>
                        50
          </button>
        </a>
      </div>
    );
  }
}


export default CreatePlaylist;
