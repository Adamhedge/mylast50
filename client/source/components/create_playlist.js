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
      <div tabIndex="0" className='fiftyButton'>
        <a href="/login">
          <button className='button' onClick={this.handleClick}>
                        50
          </button>
        </a>
        <p className='instructions'>Push to make a playlist of your last 50 songs</p>
      </div>
    );
  }
}


export default CreatePlaylist;
