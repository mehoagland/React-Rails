import { BrowserRouter, Switch, Route } from 'react-router-dom';
import React from 'react';
import App from './App';
import SongList from './components/SongList';
import SongSingle from './components/SongSingle';
import SongAddForm from './components/SongAddForm';
import SongEditForm from './components/SongEditForm';

export default (
  <BrowserRouter>
    <Switch>
      <Route exact path="/" component={App} />
      <Route exact path="/songs" component={SongList} />
      <Route path="/songs/new" component={SongAddForm} />
      <Route exact path="/songs/:id" component={SongSingle} />
      <Route path="/songs/:id/edit" component={SongEditForm} />
    </Switch>
  </BrowserRouter>
)
