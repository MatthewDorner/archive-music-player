//client/components/App.js
import $ from '../../jquery.js';
import React from 'react';
import {Button} from 'react-bootstrap';
import axios from 'axios';
import {Link} from 'react-router-dom';
var querystring = require('querystring');
import Modal from 'react-modal';

import Results from './Results'
import Search from './Search';
import UserControl from './UserControl';
import AudioControl from './AudioControl';

class App extends React.Component {
constructor(props) {
    super();

    this.state = {

        // list of search results, each element of array is a show / playlist
        data: [],

        // same as data[], but the user's (if logged in) saved favorites instead of search results
        favoritesData: [],

        // index of currently playing track
        trackIndex: 0,

        // list of tracks in the currently playing show / playlist
        currentMetadata: [],

        // archive.org identifier of currently playing show / playlist
        currentIdentifier: "",

        // just used to display "logged in as: "
        username: null,

        // state for the Modal dialog box
        modalWaitStatus: false,
        modalMessageStatus: false,
        message: ""
    }

    // methods
    this.getMetaData = this.getMetaData.bind(this);
    this.getData = this.getData.bind(this);
    this.getFavorites = this.getFavorites.bind(this);

    // handlers to pass down to child components
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.searchTextHandler = this.searchTextHandler.bind(this);
    this.handleTransport = this.handleTransport.bind(this);
    this.expand = this.expand.bind(this);
    this.playTrack = this.playTrack.bind(this);
    this.addFavorite = this.addFavorite.bind(this);
    this.removeFavorite = this.removeFavorite.bind(this);

    // handlers for this component actions
    this.closeModalMessage = this.closeModalMessage.bind(this);
    this.viewFavorites = this.viewFavorites.bind(this);
}

/**** Lifecycle Hooks ****/
componentWillMount() {
    Modal.setAppElement('body');

    var token = localStorage.getItem('jwtToken');
    var username = localStorage.getItem('username');

    // if user has a session token, update username as user should be logged in
    // and load user's Favorites into the state
    if (token != null && username != null) {
        this.setState({
            username: username
        });
        this.getFavorites();
    }
}

/**** Methods ****/
getMetaData(identifier) {
    console.log("in App, getting metadata for: " + identifier);

    $.ajax({
        url: "https://archive.org/metadata/" + identifier,
        dataType: 'jsonp',
        success: (result) => {
            var filteredResult = result.files.filter(item => item.name.endsWith(".mp3"));
            this.setState({
                currentMetadata: filteredResult
            });
        }
    });
}

getData(searchText) {
    console.log("querying for list of Results again");
    $.ajax({ 
        url: "https://archive.org/services/search/v1/scrape?debug=false&xvar=production&total_only=false&count=1000&fields=identifier,title,date,avg_rating,creator,mediatype&q=collection:GratefulDead AND (title:\"" + searchText + "\")",
        dataType: 'jsonp',

        success: (result) => {
            this.setState({
                data: result.items,
                modalWaitStatus: false
            });
        }
    });
}

getFavorites() {

    // I don't know why but it doesn't work the same if I put this line in the
    // handleLogin() method inside of UserControl component...
    axios.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');

    axios.get('/getUserFavorites')
        .then((response) => {
            var newData = [];
            var newFavorite;
            for (var i = 0; i < response.data.length; i++) {

                // along with the normal data from archive.org, add the _id from mongoDB for the delete function
                newFavorite = JSON.parse(response.data[i].favoriteRecord);
                newFavorite._id = response.data[i]._id;
                newData.push(newFavorite);
            }

            this.setState({
                favoritesData: newData
            });
        });
}

/**** Handlers to pass down to child components ****/
login(username) {
    this.setState({
        username: username
    });
    this.getFavorites();
}

logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username');
    this.setState({
        username: null,
        data: [],
        favoritesData: []
    });
}

searchTextHandler(searchText) {

    // display the "Please Wait" modal
    this.setState({
        modalWaitStatus: true
    });
    this.getData(searchText);
}

handleTransport(e) {
    switch(e.target.value) {
        case 'next':
            if (this.state.trackIndex < (this.state.currentMetadata.length-1)) {
                this.setState({
                    trackIndex: +this.state.trackIndex + 1
                });
            }
            break;
        case 'previous':
            if (this.state.trackIndex > 0) {
                this.setState({
                    trackIndex: +this.state.trackIndex - 1
                });
            }
            break;
    }
}

expand(e) {
    var index = e.target.value;
    var identifier = this.state.data[e.target.value].identifier;

    if (this.state.data[index].hasOwnProperty('metadata')) {
        var data = this.state.data;
        delete data[index].metadata;
        this.setState({
            data: data
        });
        return;
    } else {
        $.ajax({ 
            url: "https://archive.org/metadata/" + identifier,
            dataType: 'jsonp',

            // filter with name ending in .mp3
            success: (result) => {
                var filteredResult = result.files.filter(item => item.name.endsWith(".mp3"));
                var data = this.state.data;
                data[index].metadata = filteredResult;
                this.setState({
                    data: data
                });
            }
        });
    }
}

playTrack(e) {
    this.setState({
        currentIdentifier: this.state.data[e.target.value.split(',')[0]].identifier,
        trackIndex: e.target.value.split(',')[1]
    }, () => {
        this.getMetaData(this.state.currentIdentifier);
    });
}

addFavorite(e) {

    // if the show / playlist is "expanded", meaning it has .metadata attached, we don't
    // want to save that track list (.metadata) into the database, otherwise it'd show up
    // expanded again when the user recalls their favorites
    var newFavorite = this.state.data[e.target.value];
    if (newFavorite.hasOwnProperty('metadata')) {
        delete newFavorite.metadata;
    }

    axios.post('/insertFavorite',
        querystring.stringify({
            favoriteRecord: JSON.stringify(newFavorite)
        }), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).then((response) => {
            this.getFavorites();
            this.setState({
                message: response.data,
                modalMessageStatus: true
            });
        }).catch((error) => {
            this.setState({
                message: error.response.data.msg,
                modalMessageStatus: true
            });
        });
}

removeFavorite(e) {
    axios.post('/deleteFavorite?id=' + e.target.value)
        .then((response) => {
            this.getFavorites();
            this.setState({
                message: response.data,
                modalMessageStatus: true
            });
        }).catch((error) => {
            this.setState({
                message: error.response.data.msg,
                modalMessageStatus: true
            })
        });
}

/**** Handlers for this component actions ****/
viewFavorites() {
    if (localStorage.getItem('jwtToken') != null) {
        this.setState({
            data: this.state.favoritesData
        });
    } else {
        this.setState({
            message: "Please log in to view your Favorites.",
            modalMessageStatus: true
        });
    }
}

closeModalMessage() {
    this.setState({
        message: "",
        modalMessageStatus: false
    })
}

/**** Render ****/
render() {
    return (
        <div className='container-fluid'>
            <Modal isOpen={this.state.modalWaitStatus} className='Modal'>
                <div>Please Wait...</div>
            </Modal>
            <Modal isOpen={this.state.modalMessageStatus} className='Modal'>
                <div>{this.state.message}</div>
                <Button className='control-button' onClick={this.closeModalMessage}>Close</Button>
            </Modal>
            <div className='controls-container'>
                <h1>Grateful Dead Player</h1>
                <UserControl loginHandler={this.login} logoutHandler={this.logout} currentUser={this.state.username} />
                <img src="gratefuldead.gif" height={250} width={250} />
                <p><a href="https://gfycat.com/gifs/detail/TintedKindKillerwhale">via Gfycat</a></p>
                <div className="form-inline">
                    <div className="row">
                        <div className="col-xs-12">
                            <Search searchTextHandler={this.searchTextHandler} />
                            <Button className='control-button' onClick={this.viewFavorites}>View Favorites</Button>
                            {this.state.currentMetadata.length > 0 &&
                                <AudioControl identifier={this.state.currentIdentifier} fileName={this.state.currentMetadata[this.state.trackIndex].name} transportHandler={this.handleTransport} />
                            }
                        </div>
                    </div>
                </div>
            </div>
            <Results data={this.state.data} favoritesData={this.state.favoritesData} expandHandler={this.expand} playTrackHandler={this.playTrack} favoriteHandler={this.addFavorite} removeFavoriteHandler={this.removeFavorite} />
        </div>
)};
}

export default App;
