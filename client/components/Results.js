//client/components/Results.js
import $ from '../../jquery.js';
import React from 'react';
import {Button} from 'react-bootstrap';
import {Link} from 'react-router-dom';
var querystring = require('querystring');

class Results extends React.Component {

constructor() {
    super();
}

truncateTitle(title) {
    return title.replace("Grateful Dead Live at", "");
}

truncateDate(date) {
    return date.substring(0,10);
}

isFavorite(i) {
    for (var j = 0; j < this.props.favoritesData.length; j++) {
        if (this.props.favoritesData[j].identifier == this.props.data[i].identifier) {
            return this.props.favoritesData[j]._id;
        }
    }
    return -1;
}

/**** render ****/
render() {
    return (
        <React.Fragment>
            { this.props.data.length > 0 &&
            <React.Fragment>
                <table>
                    <thead>
                        <tr key='header'>
                            <th></th>
                            <th>Title</th>
                            <th>Date</th>
                            <th>Avg_Rating</th>
                            <th>Creator</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody className='results-tbody'>
                    {
                        this.props.data.map((exp, i) => {
                            return  <React.Fragment key={i}>
                                        <tr key={i}>
                                            <td className='results-cell'><Button className='table-button' value={i} onClick={this.props.expandHandler}>{ exp.hasOwnProperty('metadata') ? "-" : "+" }</Button></td>
                                            <td className='results-cell'>{this.truncateTitle(exp.title)}</td>
                                            <td className='results-cell'>{this.truncateDate(exp.date)}</td>
                                            <td className='results-cell'>{exp.avg_rating}</td>
                                            <td className='results-cell'>{exp.creator}</td>
                                            <td className='results-cell favorite-cell'>
                                                <Button className='table-button' value={i + ",0"} onClick={this.props.playTrackHandler}>Play</Button>
                                                { (this.isFavorite(i) != -1) ?
                                                <Button className='table-button favorite-button' value={this.isFavorite(i)} onClick={this.props.removeFavoriteHandler}>Remove Favorite</Button>
                                                :
                                                <Button className='table-button favorite-button' value={i} onClick={this.props.favoriteHandler}>Favorite</Button>
                                                }
                                            </td>
                                        </tr>
                                        { exp.hasOwnProperty("metadata") && 
                                            exp.metadata.map((track, j) => {
                                                return  <tr key={i + "," + j}>
                                                            <td colSpan='5'>{track.name}</td>
                                                            <td><Button className='table-button play-button' value={i + "," +j} onClick={this.props.playTrackHandler}>Play</Button></td>
                                                        </tr>
                                            })
                                        }
                                    </React.Fragment>
                                })
                            }
                    </tbody>
                </table>
                <div className='results-bottom-border'></div>
            </React.Fragment> }
        </React.Fragment>
)};
}

export default Results;
