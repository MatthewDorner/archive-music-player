//client/components/Search.js
import React from 'react';
import {Button} from 'react-bootstrap';
import {Link} from 'react-router-dom';

class Search extends React.Component {
constructor() {
    super();
    this.changeSearchText = this.changeSearchText.bind(this);
}

/**** handlers for this component ****/
changeSearchText(e) {
    this.props.searchTextHandler(this.refs.searchText.value);
}

/**** render ****/
render() {
    return (
        <React.Fragment>
            <input type="text" className="form-control" ref="searchText"/>
            <Button className="controlButton" onClick={this.changeSearchText}>Search</Button>
        </React.Fragment>
    );
}
}

export default Search;
