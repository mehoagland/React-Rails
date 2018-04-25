import React from 'react';
import Services from '../services';
import { Redirect } from 'react-router-dom';

class SongAddForm extends React.Component {
  constructor() {
    super();
    this.state = {
      title: '',
      artist: '',
      added_by: '',
      fireRedirect: false
    }
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  };
  handleInputChange(e) {
    let name = e.target.name;
    let value = e.target.value;
    this.setState({
      [name]: value
    })
  };

  handleFormSubmit(e) {
    e.preventDefault();
    Services.createSong(this.state)
    .then( song => {
      this.setState({
        fireRedirect: true
      })
    })
    .catch( err => {
      console.log('nooo', err);
    })
  }

  render() {
    return (
      <div className="create-form">
        <form onSubmit={this.handleFormSubmit}>
          <input name="title" onChange={this.handleInputChange} type="text" placeholder="your song name here" />
          <input type="text" name="artist" onChange={this.handleInputChange} placeholder="artist" />
          <input type="text" name="added_by" onChange={this.handleInputChange} placeholder="who added this?" />
          <input type="submit" value="let's get it" />
        </form>
        {this.state.fireRedirect ? <Redirect to="/songs" /> : ''}
      </div>
    )
  }
}

export default SongAddForm
