//client/components/AudioControl.js
import React from 'react';
import {Button} from 'react-bootstrap';
import {Link} from 'react-router-dom';

class AudioControl extends React.Component {
constructor() {
    super();
    this.audioEnded = this.audioEnded.bind(this);
}

/**** Lifecycle Hooks ****/
componentDidMount() {
    this.refs.audioRef.pause();
    this.refs.audioRef.load();
    this.refs.audioRef.play();
}

componentDidUpdate(prevProps) {
	// only update if fileName changed, so you can browse without affecting the player
	if (prevProps.fileName != this.props.fileName) {
	    this.refs.audioRef.pause();
	    this.refs.audioRef.load();
	    this.refs.audioRef.play();
	}
}

/**** Methods ****/
audioEnded() {
	// send a fake 'event' to play next track.
	var e = { target: { value: 'next'}};
	this.props.transportHandler(e);
}

/**** Render ****/
render() {
    return (
    	<React.Fragment>
			<audio ref='audioRef' controls onEnded={this.audioEnded} className='embedAudio'>
			  <source src={"http://www.archive.org/download/" + this.props.identifier + "/" + this.props.fileName} type="audio/mpeg" />
			  Cannot play audio
			</audio>
	        <Button className='controlButton' value='next' onClick={this.props.transportHandler}>+</Button>
	        <Button className='controlButton' value='previous' onClick={this.props.transportHandler}>-</Button>
	        <span className="trackTitle">{"NOW PLAYING: [" + this.props.fileName + "]"}</span>
        </React.Fragment>
    );
}
}

export default AudioControl;
