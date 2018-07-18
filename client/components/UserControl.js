//client/components/UserControl.js
import React from 'react';
import {Button} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import axios from 'axios';
import Modal from 'react-modal';
var querystring = require('querystring'); 

class UserControl extends React.Component {
constructor() {
    super();
    this.state = {
    	username: "",
    	password: "",
    	modalStatus: false,
    	serverResponse: ""
    }

    this.handleLogin = this.handleLogin.bind(this);
    this.handleUsername = this.handleUsername.bind(this);
    this.handlePassword = this.handlePassword.bind(this);
    this.closeModal = this.closeModal.bind(this);
}

/**** Lifecycle Hooks ****/
componentWillMount() {
    Modal.setAppElement('body');
}

/**** Handlers for this component actions ****/
closeModal() {
    this.setState({
        modalStatus: false,
        serverResponse: ""
    });
}

handleLogin() {
    const { username, password } = this.state;
    if (username == "") {
        this.setState({
            modalStatus: true,
            serverResponse: "Please enter a username."
        });
        return;
    } else if (password == "") {
        this.setState({
            modalStatus: true,
            serverResponse: "Please enter a password."
        });
        return;
    }

    axios.post('/login', { username, password })
        .then((response) => {
            console.log(response);
            localStorage.setItem('jwtToken', response.data.token);
            localStorage.setItem('username', username);

            // send userName back up to main screen state to update login display via this component's prop
            // reset the state so if someone logs out, it won't still retain their last user/pass
            // maybe could be better done some other way
            this.props.loginHandler(this.state.username);
            this.setState({
                username: "",
                password: ""
            });
        })
       .catch((error) => {
            this.setState({
                serverResponse: error.response.data.msg,
                modalStatus: true
            });
    });
}

handleUsername(e) {
	this.setState({
		username: e.target.value
	});
}

handlePassword(e) {
	this.setState({
		password: e.target.value
	})
}

/**** Render ****/
render() {
    return (
    	<React.Fragment>
	        <Modal isOpen={this.state.modalStatus} className='Modal'>
	            <div>{this.state.serverResponse}</div>
	            <Button className='control-button' onClick={this.closeModal}>Close</Button>
	        </Modal>    	
	    	<div className='user-control'>
		    	{this.props.currentUser ?
		    		<span><span className='user-name-text'>Logged in as: {this.props.currentUser}</span><Button className='control-button' onClick={this.props.logoutHandler}>Log Out</Button></span>
		    	: 
		            <span className='form-inline'>
		            	<input className='form-control' placeholder='username' onChange={this.handleUsername} />
		            	<input className='form-control' placeholder='password' onChange={this.handlePassword} />

			            <Button className='control-button' onClick={this.handleLogin}>Log In</Button>
			            <Link to="/createUser"><Button className='control-button'>Create User</Button></Link>
		            </span>
		     	}
	     	</div>
     	</React.Fragment>
    );
}
}

export default UserControl;
