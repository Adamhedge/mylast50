import React, { Component } from 'react'
import './create_playlist.css'

class CreatePlaylist extends Component {
    constructor () {
        super();

        this.handleClick = this.handleClick.bind(this)
    }

    handleClick() {
        console.log('Success!')
    }

    render () {
        return (
            <div className='fiftyButton'>
                <p className='instructions'>Tap for your last 50 songs</p>
                <a href="/login">
                    <button className='button' onClick={this.handleClick} onTouchStart>
                        50
                    </button>
                </a>
            </div>
        )
    }
}


export default CreatePlaylist
