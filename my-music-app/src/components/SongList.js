import Services from '../services';
import React from 'react';
import Song from './Song';
import { Link } from 'react-router-dom';
class SongList extends React.Component {
  constructor() {
    super();
    this.state = {
      apiDataLoaded: false,
      apiData: null,
    };
  }

  componentDidMount() {
    Services.getAllSongs()
    .then( songs => {
      this.setState({
        apiDataLoaded: true,
        apiData: songs.data
      })
    })
  .catch( err => {
    console.log('err', err)
    })
  }

  renderSongs() {
    return this.state.apiData.songs.map( song => <Song {...song} key={song.id} />)
  };

  render() {
    return (
      <div className="song-list">
        <Link to="/songs/new">Add a new song?</Link>
        {this.state.apiDataLoaded ? this.renderSongs() : (<h1>Loading</h1>)}
      </div>
    )
  }
};

export default SongList


