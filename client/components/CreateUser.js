//client/components/CreateUser.js
import React from 'react';
import {Button} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import axios from 'axios';
var querystring = require('querystring'); 
import Modal from 'react-modal';

class CreateUser extends React.Component {
constructor() {
    super();
    this.state = {
        username: "",
        password: "",
        confirmPassword: "",
        serverResponse: "",
        modalStatus: false
    };

    this.handleUsername = this.handleUsername.bind(this);
    this.handlePassword = this.handlePassword.bind(this);
    this.handleConfirmPassword = this.handleConfirmPassword.bind(this);
    this.createUser = this.createUser.bind(this);
    this.closeModal = this.closeModal.bind(this);
}

/**** Lifecycle Hooks ****/
componentWillMount() {
    Modal.setAppElement('body');
}

/**** Handlers for this component actions ****/
handleUsername(e) {
    this.setState({
        username: e.target.value
    });
}

handlePassword(e) {
    this.setState({
        password: e.target.value
    });
}

handleConfirmPassword(e) {
    this.setState({
        confirmPassword: e.target.value
    });
}

createUser(e) {
    if (this.state.username == "" || this.state.password == "" || this.state.confirmPassword != this.state.password) {
        this.setState({
            serverResponse: "Please enter username, password and matching confirmation password.",
            modalStatus: true
        });
        return;
    }

    axios.post('/insertUser',
        querystring.stringify({
            username: this.state.username,
            password: this.state.password
        }), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).then((response) => {
            this.setState({
                serverResponse: response.data.msg,
                modalStatus: true
            });
        });
}

closeModal() {
    this.setState({
        modalStatus: false,
        serverResponse: ""
    });
}

/**** Render ****/
render() {
    return (
        <React.Fragment>
            <Modal isOpen={this.state.modalStatus} className='Modal'>
                <div>{this.state.serverResponse}</div>
                <Button className='control-button' onClick={this.closeModal}>Close</Button>
            </Modal>
            <div className='container-fluid create-user-form'>
                <div className='row'>
                    <h1>Create User</h1>
                </div>
            	<form>
                    <div className='row'>
                        <div className='col-xs-12'>
                        	<div className='form-group'>
                        		<label className='control-label text-left' htmlFor='usernameInput'>Username</label>
                        		<input type='userName' id='usernameInput' className='form-control' onChange={this.handleUsername} />
                        	</div>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-xs-12'>
                        	<div className='form-group'>
                        		<label className='control-label text-left' htmlFor='passwordInput'>Password</label>
                        		<input type='userName' id='passwordInput' className='form-control' onChange={this.handlePassword} />
                        	</div>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-xs-12'>
                        	<div className='form-group'>
                        		<label className='control-label text-left' htmlFor='confirmPasswordInput'>Confirm Password</label>
                        		<input type='userName' id='confirmPasswordInput' className='form-control' onChange={this.handleConfirmPassword} />
                        	</div>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-xs-12'>
                            <Button className='control-button' onClick={this.createUser}>Create</Button>
                            <Link to="/"><Button className='control-button'>Back</Button></Link>
                        </div>
                    </div>
            	</form>
            </div>
        </React.Fragment>
    );
}
}

export default CreateUser;

