import React from 'react';
import { Link } from 'react-router-dom';

const Song = (props) => {
  return (
    <div className="song">
      <h1><Link to={`/songs/${props.id}`}>{props.title}</Link></h1>
      <h2>by {props.artist}</h2>
    </div>
  )
}
export default Song
