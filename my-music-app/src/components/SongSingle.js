import React from 'react';
import Services from '../services';
import { Redirect } from 'react-router-dom';

class SongSingle extends React.Component {
  constructor() {
    super();
    this.state = {
      apiDataLoaded: false,
      apiData: null,
      fireRedirect: false
    };
    this.deleteSong = this.deleteSong.bind(this)
  }
  componentDidMount() {
    Services.getOneSong(this.props.match.params.id)
    .then( song => {
      this.setState({
        apiDataLoaded: true,
        apiData: song.data
      })
    })
    .catch( err => {
      console.log('nooo', err);
    })
  }

  renderSong() {
    return (
      <div className="single-song">
        <h1>{this.state.apiData.song.title}</h1>
        <button onClick={this.deleteSong}>Delete this song? </button>
      </div>
    )
  }

  deleteSong() {
    Services.deleteSong(this.props.match.params.id)
    .then( song => {
      this.setState({
        fireRedirect: true
      })
    })
    .catch( err => {
      console.log('nooooo', err)
    })
  }

  render() {
    return (
      <div className="song-single">
        {this.state.apiDataLoaded ? this.renderSong() : ''}
        {this.state.fireRedirect ? <Redirect to="/songs" /> : ''}
      </div>
    )
  }
}

export default SongSingle
