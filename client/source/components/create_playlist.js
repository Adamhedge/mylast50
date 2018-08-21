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
            <div>
                <a href="/login" className='button_container'>
                    <button className='button' onClick={this.handleClick}>
                        Get your last 50
                    </button>
                </a>
            </div>
        )
    }
}


export default CreatePlaylist
