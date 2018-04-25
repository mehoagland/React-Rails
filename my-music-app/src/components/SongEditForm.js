import React from 'react';
import Services from '../services';
import { Redirect } from 'react-router-dom';

class SongEditForm extends React.Component {
  constructor() {
    super();
    this.state = {
      apiDataLoaded: false,
      apiData: null,
      title: '',
      artist: '',
      added_by: '',
      fireRedirect: false
    }
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }

  componentDidMount() {
    Services.getOneSong(this.props.match.params.id)
    .then( song => {
      this.setState({
        apiDataLoaded: true,
        apiData: song.data,
        title: song.data.song.title,
        artist: song.data.song.artist,
        added_by: song.data.song.added_by
      })
    })
    .catch( err => {
      console.log('noooo', err)
    })
  }

  handleInputChange(e) {
    let name = e.target.name;
    let value = e.target.value;
    this.setState({
      [name]: value
    })
  }

  handleFormSubmit(e) {
    e.preventDefault();
    Services.updateSong(this.state, this.props.match.params.id)
    .then( song => {
      this.setState({
        fireRedirect: true
      })
    })
    .catch( err => {
      console.log('nooo', err)
    })
  }

  renderEditForm() {
    return (
      <form className="edit-form" onSubmit={this.handleFormSubmit}>
        <input type="text" name="title" onChange={this.handleInputChange} value={this.state.title} />
        <input type="text" name="artist" onChange={this.handleInputChange} value={this.state.artist} />
        <input type="text" name="added_by" onChange={this.handleInputChange} value={this.state.added_by} />
        <input type="submit" value="lesssgetttittttt" />
      </form>
    )
  }

  render() {
    return (
      <div className="edit-form-container">
        {this.state.apiDataLoaded ? this.renderEditForm() : '' }
        {this.state.fireRedirect ? <Redirect to={`/songs/${this.props.match.params.id}`} /> : '' }
      </div>
    )
  }

}

export default SongEditForm;
