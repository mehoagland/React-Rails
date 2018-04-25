# React on Rails

## Learning Objectives
* Review what an API is and what it does
* Understand the power ActiveRecord has over data in a db
* Use Rails as an API to feed JSON data to a front end
* Build a React app to interact with our Rails API

## Where are we coming from?

We've already covered ActiveRecord and all of the fancy
abstraction that it lets us do when it comes to manipulating data from
our database. We know that we can make all of our SQL commands in one or
two words as long as we reference our model correctly. 

We can now go into how to use Rails as strictly a JSON API.

## What is the advantage?

The reason we'd want to use only the API aspects of Rails is because
using ERB to serve data from our back end can get very rigid. Using
only the API stuff from Rails allows us to customize our stack a bit and
use whatever front end we want. 

## Setting up our Database

Spinning up a new Rails API is just a smidge more involved than a
standard Rails app.

```bash
rails new --api my_music_rails_api --database=postgresql -G
```

Let's go through exactly what this command does.

* `rails new` will generate a new rails app. 
* `--api` tells rails that all I want is an instance of ActionController and an instance of ActiveRecord. And even more specifically than that, the instance of ActionController that I want is ActionController::API. 
* `my_music_rails_api` is just the name of my app
* `--database=postgresql` tells rails that the database I want to use is PSQL, instead of the rails default, SQLite.
* `-G` stops rails from instantiating a git repo in our new app.

And we're done. That's all the setup we need to get an API going in Rails.

After we've done this, we have to run 

`rails db:create` 

## Setting up our Model

Once we've gotten our database set up and ready to start holding pieces
of data, we're going to start building our ActiveRecord stuff. So first
thing's first, we're going to generate a new `Song` model using

`rails generate model Song`

And once that finishes, we'll modify the migration to populate our
table: 

```ruby
t.string :title
t.string :artist
t.string :added_by
```

We apply the migration to our database: 

`rails db:migrate`

## Seeding our database

So we're almost done! All we need to do is give ActiveRecord some data
to hold onto so that we can begin testing.

```ruby
 # db/seed.rb
Song.destroy_all
Song.create!([
               {
                 title: 'Africa',
                 artist: 'Toto',
                 added_by: 'Ryan'
               },
               {
                 title: 'Tennessee Whiskey',
                 artist: 'Chris Stapleton',
                 added_by: 'Ada'
               },
               {
                 title: 'Saw You in a Dream',
                 artist: 'The Japanese House',
                 added_by: 'Eric'
               }
             ])

puts "Added #{Song.count} songs to the database"
```

Once we've written this, we'll jump back into our terminal and run 

`rails db:seed`

And then we're done! We now have everything we need to start testing in
our `rails console`

## You guys do!

Use `rails c` to find all of the songs in our database, and then find
only one based on its id.

## Setting up our Controller

`rails generate controller Songs`

And we'll add our calling our `ActiveRecord` model for each `index` and `show` routes.

Since we're not rendering any views, we have to explicitly tell our
controller what to do with the data we get back from ActiveRecord. That
said, we're going to tell our controller that we want `json` data back,
so we'll just write `render json: ` and then give it our data to render.

## You guys do!

Write your `index` and `show` methods


## Create, Update, Delete

Writing these methods are a little more involved. All three of them have
a chance of failing due to some error, so we'll need to have some sort
of failsafe if anything goes wrong. 

```ruby

# app/controllers/songs_controller.rb

def create
  @song = Song.new(song_params)
  @song.save
  render json: {
    message: "let's get it",
    song: @song
  }
end

def update
  @song = Song.find(params[:id])
  @song.update(song_params)
  render json: {
    message: "let's get it",
    song: @song
  }
end

def destroy
  @song = Song.find(params[:id])
  @song.delete
  render json: {
    message: "we got it",
  }
end
  

private

def song_params
  params.permit(:title, :artist, :added_by)
end

```

## Cleaning up

I spy with my little eye the same line of code appearing in three separate
spaces. Specifically, I see the

`@song = Song.find(params[:id])`

that we're using in the `update`, `show`, and `delete` methods. 

So what do we do with lines of code that repeat themselves? We turn them into methods. 

So we'll define another private method, just underneath (or above)
`song_params`. As long as we define it under the word `private` it won't
matter.

```ruby
def set_song
 @song = Song.find(params[:id])
end

```

Once we've done that, we can go straight to the top of our controller
and make it look like the following: 

```ruby
class SongsController < ApplicationController
  before_action :set_song, only: [:show, :update, :delete]
  # rest of controller
end
```

Now, our controller will call our private method before the given
methods. Clean code!!


# React

So now that we've fully built out CRUD functionality in our Rails API, all that's left is to write a front end to leverage all of that functionality. 

Now that our JSON API is fully done and ready to start serving JSON to our front end, we can focus strictly on building our React app to take advantage of that. This is the main selling point of using Rails as an API, since we've defined our JSON serving methods using minimal configuration, and we can now focus strictly on writing React.

First thing's first when we start any React project. It makes sense to start from the beginning using

`create-react-app react-app`

Once that finishes, we can get started with Step 0 of our process.

## Step 0: Setting up to Receive Data

For our React app to be able to talk to our Rails API, we'll be relegating all of our `fetch` API calls to one file that we export and import as needed. We'll be building this `service` file with the aim of returning only API consumption methods. Before we get started with actually writing components, we need to make sure that we open up the necessary routes in our Rails API, and then add a little bit of configuration to get around a couple of Rails's quirks.

### Routes in our Rails API
We'll be opening up routes one at a time in our Rails app so that we can make sure we're stepping through all of our functionality thoroughly and modularly. So we'll start by opening up our `read` methods:

```ruby
# config/routes.rb

Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  resources :songs, only: [:index, :show], path: "/api/songs"
end
```

The only thing that should look new is that last little bit, `path: "/api/songs"` and it's super intuitive. It prepends `/api` to your `resources` and allows you to configure your path however you want.

### Starting Our API module

We're going to build a file that holds ALL of our CRUD methods, but we'll be building them one at a time as we progress through all of our functionality so that we aren't overwhelmed with stuff to do.

```javascript
// react-app/src/api/index.js

import axios from 'axios';

const api = {
  getAllSongs() {
    return fetch('/api/songs')
      .then(response => response.json());
  }
};

export default api;
```

### Proxying Requests to our Rails API

At this point, we've set up our routes in Rails, and we've set up our first API consumption method in a file in our React app. We'll get the two apps to talk to each other in the same way that React and Express talk to each other: using a `proxy` declaration in our React app's `package.json` file.

```javascript
// MyMusicApp/package.json
{
//other declarations

  "proxy": "http://localhost:3001"
}
```

Small catch is that Rails's default port is 3000, but we need our React app running on 3000. So what we'll end up doing is when we start our Rails server, we'll start it on 3001 using the command

```bash
rails s -p 3001
```

Once we've gone through all of these steps, we're ready to start writing actual React. Almost.

## Step 0.5: Setting up Our Component Structure

Our next step, now that we're set up for our two apps to interact, we can focus on planning out our React app's component structure, and installing the necessary packages to make our app run the way we want. We've already installed `axios` for all of our API stuff, but we'll also need `react-router-dom` to give us the super nice and flexible routing capability. We'll `touch` all of the files and install all the stuff now, and our first step will be writing our first couple of routes.

1. We'll start by `mkdir`ing a `src/components` folder to hold all of our components. 
2. Next, we'll `touch` `src/components/SongList.js src/components/Song.js src/components/SongSingle.js src/components/SongAddForm.js src/components/SongEditForm.js`, as well as an `src/router.js` file.
3. After that, we'll write up a separate `Router` file to hold all of our front-end routes so that we can separate out our list of songs from our single song, from our edit form, and from our creation form. We'll be building out this form as we go along too, but to start off, we'll write out this:

```javascript
// MyMusicApp/src/router.js

import { BrowserRouter, Switch, Route } from 'react-router-dom';
import React from 'react';
import App from './App';
import SongList from './components/SongList';

export default(
  <BrowserRouter>
    <Switch>
      <Route exact path="/" component={App} />
    </Switch>
  </BrowserRouter>
)
```

After we've written this out, we're going to replace `<App />` in our `src/index.js` file so that React renders our router in place of our `App.js` component. It should look something like this:

```javascript
// src/index.js

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// import App from './App';
import Router from './router'
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(Router, document.getElementById('root'));
registerServiceWorker();
```
Note how we didn't render it as a component, but instead as just a normal "variable-type" import.


**NOW** we're ready to start writing up some components.

## Step 1: Read Components - Index

When dealing with our `read` methods, `index` and `show`, we need components that will send out a request to our Rails server, receive a JSON object as a response, and then treat that response accordingly. Since we've only defined an index method, we're only gonna write an index component. 

Our next step in our process is to start working with our `SongList` component. 

This component will need a few methods:

1. A `constructor` to hold our JSON in state when we call our API
2. A `componentDidMount` method that calls our API
3. A method to map over the stuff we get back from our API
4. And finally, a `render` that will render either a loading screen or our data.

The `constructor` will look the same as always.

Our `componentDidMount` method will look a little different, though. Since we're outsourcing our API calls to our `services.js` file, it'll look something like this:

```javascript
// MyMusicApp/src/components/SongList.js

//import necessary React stuff
import services from '../services'


class SongList extends React.Component {
  //code code code
  
  componentDidMount() {
    services.getAllSongs()
    .then( data => {
      //code code code
    })
    .catch( err => {
      //code code code
    })
  };
  
};
```

The important point is that we aren't calling axios anymore. We're importing a file that calls axios for us. That's really the only difference. The rest of our component will look like business as usual; once our API gives us our data, we'll be spinning off baby components carrying information about each thing that comes back from the API.

<details><summary>Your `SongList` component should look something like this</summary>

```javascript
import React from 'react';
import ApiServices from '../services';
import { Link } from 'react-router-dom';
import Song from './Song';

class SongList extends React.Component {
  constructor() {
    super();
    this.state = {
      apiDataLoaded: false,
      apiData: null
    }
    this.renderSongs = this.renderSongs.bind(this)
  }

  componentDidMount() {
    ApiServices.getAllSongs()
    .then( data => {
      this.setState({
        apiDataLoaded: true,
        apiData: data.data
      })
    })
    .catch( err => {
      console.log('noo', err)
    })
  }

  renderSongs() {
    return this.state.apiData.songs.map( song => <Song {...song} key={song.id} />)
  }

  render() {
    return (
      <div className="song-list">
        <Link to="/songs/new">Add a song?</Link>
        {this.state.apiDataLoaded ? <ul>{this.renderSongs()}</ul> : ''}
      </div>
    )
  }
}

export default SongList;


```
</details>

<details><summary>Your `Song` component should look something like this</summary>

```javascript
import React from 'react';
import { Link } from 'react-router-dom'
const Song = props => {
  console.log(props)
  return(
    <li className="song">
      <h1><Link to={`/songs/${props.id}`}>{props.title}</Link></h1>
      <h2>By {props.artist}</h2>
      <p>Big ups to {props.added_by} for the song recommendation</p>
    </li>
  )
}

export default Song
```
</details>

## Step 2: Read Components - Show

Now that we've taken care of our `index` method, our next stop is going to be `show`, just to finish off our `R` in `CRUD` functionality.

Before we start on our `SongSingle` component, we need to make a couple of additions to a few of our files. Our first step is to build a new route in our `router.js` file:

```javascript
<Route exact path="/songs/:id" component={SongSingle} />
```

Next, we need to add a new method to our `services.js` file to make a new request that takes the ID out of our URL and feed it to Rails as a `params[:id]` to lock down a specific song.

```javascript
// MyMusicApp/src/services.js

class ApiServices {
  //code code code
  getOneSong(id) {
    return axios.get(`/api/songs/${id}`)
  }
  //code code code
}
```

This component will follow mostly the same flow as our `index` method:

1. a `constructor` to hold state from our API call
2. a `componentDidMount` that calls our API
3. some logic to render "Loading" or our API data

<details><summary>Your `SongSingle` component should look something like this</summary>

```javascript
import React from 'react';
import ApiServices from '../services';

class SongSingle extends React.Component {
  constructor() {
    super();
    this.state = {
      apiDataLoaded: false,
      apiData: null,
    };
  };

  componentDidMount() {
    ApiServices.getOneSong(Number(this.props.match.params.id))
    .then( data => {
      this.setState({
        apiDataLoaded: true,
        apiData: data.data
      })
    })
    .catch( err => {
      console.log('noo', err)
    })
  }

  renderSong() {
    return(
      <div className="single-song">
        <h1>{this.state.apiData.song.title}</h1>
        <h2>{this.state.apiData.song.artist}</h2>
      </div>
    );
  };

  render() {
    return(
      <div className="single-container">
        {this.state.apiDataLoaded ? this.renderSong() : ''}
      </div>
    )
  }
};

export default SongSingle

```

</details>

## Step 3: Create Component

Now that we've finished with building components that interact with our `read` functionality, we'll move onto `create`. 

Just like we did to set up for `show`, we need to make a couple of changes to our `router` file and our `services` file to accommodate incoming requests. 

The route we're adding to our `router.js` file is as such: 

```javascript
<Route path="/songs/new" component={SongAddForm} />
```

Our next `service` change is going to be a little more involved, but at its core, it's just an `axios` POST request that's been housed in its own method:

<details><summary>`services.js`</summary>

```javascript
// MyMusicApi/src/services.js

class Services {

  // code code code
    
  createSong(song) {
    return axios({
      method: 'POST',
      url: '/api/songs',
      data: {
        title: song.title,
        artist: song.artist,
        added_by: song.added_by
      }
    })
  }
  
  // code code code
}
```
</details>

The form itself is something that we're going to need to give some thought to. Having written our axios method, we know we need a few bits of state:

1. 3 pieces of information to pass to Rails, namely, a `title`, an `artist` and an `added_by`. 
2. In addition to that, we know that it's generally good UX to go straight back to our list of songs, so we need some sort of `Redirect` functionality, which we'll import from `react-router-dom`
3. Additionally, we'll need our usual form methods, `handleFormSubmit` and `handleInputChange` so that we can send information to Rails.

At the end of the day, the component should look a little something like this:


<details><summary>`SongAddForm`</summary>

```javascript
import React from 'react';
import { Redirect } from 'react-router-dom';
import ApiServices from '../services';

class SongAddForm extends React.Component {
  constructor() {
    super();
    this.state = {
      title: '',
      artist: '',
      added_by: '',
      fireRedirect: false
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  };

  handleInputChange(e) {
    let name = e.target.name;
    let value = e.target.value;
    this.setState({
      [name]: value
    })
  }

  handleFormSubmit(e) {
    e.preventDefault();
    ApiServices.createSong(this.state)
    .then( data => {
      this.setState({
        fireRedirect: true
      })
    })
    .catch( err => {
      console.log('nooo', err)
    })
  }

  render() {
    return (
      <div className="song-form">
        <form onSubmit={this.handleFormSubmit}>
          <input type="text" name="title" onChange={this.handleInputChange} placeholder="song title" />
          <input type="text" name="artist" onChange={this.handleInputChange} placeholder="song artist" />
          <input type="text" name="added_by" onChange={this.handleInputChange} placeholder="added by whom?" />
          <input type="submit" value="let's get it" />
        </form>
        {this.state.fireRedirect ? <Redirect to="/songs" /> : ''}
      </div>
    )
  }
}

export default SongAddForm

```
</details>

## Step 4: Update Component

Moving right along, and in keeping with our form mindset, we'll get straight to our `update` functionality, which means we're gonna need to revisit a few files. Just like before, we'll add to our `router` and `services` files:

```javascript
<Route path="/songs/:id/edit" component={SongEditForm} />
```

<details><summary>`services`</summary>

```javascript
  editSong(song, id) {
    return axios({
      method: 'PUT',
      url: `/api/songs/${id}`,
      data: {
        title: song.title,
        artist: song.artist,
        added_by: song.added_by
      }
    })
  }
```
</details>

Next, we need a way to access our form, which means that we need some sort of entryway to `/songs/:id/edit`. The place where it makes the most sense to do so would be from `/songs/:id`, which means we're going to go back to our `SongSingle` component and throw a `{ Link }` into our component to go to our new route.

Once we've done that, we'll need to give some thought to our component structure again. We know that we need to call our API twice. Once to load the song that we want to edit from our API, and again once we've completed the form. In short,

1. a `constructor` to hold state as we fill a form out, and to pre-load our data in that form
2. a `componentDidMount` method to call our API to ask it for information
3. Our form methods that we use to control inputs
4. Some `Redirect` logic to go back to our `SongSingle` component after we finish editing.

<details><summary>Final Edit form</summary>

```javascript
import React from 'react';
import ApiServices from '../services';
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
  };

  componentDidMount() {
    ApiServices.getOneSong(this.props.match.params.id)
    .then( data => {
      console.log(data, 'from componentDidMount')
      this.setState({
        apiDataLoaded: true,
        apiData: data.data,
        title: data.data.song.title,
        artist: data.data.song.artist,
        added_by: data.data.song.added_by
      })
    })
    .catch( err => {
      console.log('noooo', err)
    })
  }

  handleInputChange(e) {
    console.log('triggered', this.state)
    let name = e.target.name;
    let value = e.target.value;
    this.setState({
      [name]: value
    })
  }

  handleFormSubmit(e) {
    e.preventDefault();
    ApiServices.editSong(this.state, this.props.match.params.id)
    .then( data => {
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
      <form className="form" onSubmit={this.handleFormSubmit}>
        <input type="text" name="title" onChange={this.handleInputChange} value={this.state.title} />
        <input type="text" name="artist" onChange={this.handleInputChange} value={this.state.artist} />
        <input type="text" name="added_by" onChange={this.handleInputChange} value={this.state.added_by} />
        <input type="submit" value="let's get it" />
      </form>
    )
  }

  render() {
    console.log(this.state)
    return (
      <div className="edit-form">
        {this.state.apiDataLoaded ? this.renderEditForm() : (<h1>Loading Your data</h1>)}
        {this.state.fireRedirect ? <Redirect to={`/songs/${this.props.match.params.id}`} /> : ''}
      </div>
    )
  }
}

export default SongEditForm;


```

</details>


## Step 5: Delete Functionality - Show Component

Last but not least, adding delete functionality requires no extra routes, but will require a small addition to our `SongSingle` component.

<details><summary>Our last `services.js` method should look like this</summary>

```javascript
  deleteSong(id) {
    return axios({
      method: 'DELETE',
      url: `/api/songs/${id}`
    })
  }
```

</details>

The only thing left to do is to add in a method to `SongSingle` that calls our new `Service` method, control a `Redirect` to go to our index page when we delete successfully, and then we're done!

<details><summary>Our `SongSingle` component should look like this at the end of the day</summary>

```javascript
import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import ApiServices from '../services';

class SongSingle extends React.Component {
  constructor() {
    super();
    this.state = {
      apiDataLoaded: false,
      apiData: null,
      fireRedirect: false
    };
    this.deleteSong = this.deleteSong.bind(this)
  };

  componentDidMount() {
    ApiServices.getOneSong(Number(this.props.match.params.id))
    .then( data => {
      this.setState({
        apiDataLoaded: true,
        apiData: data.data
      })
    })
    .catch( err => {
      console.log('noo', err)
    })
  }

  deleteSong() {
    console.log(ApiServices)
    ApiServices.deleteSong(this.props.match.params.id)
    .then( data => {
      this.setState({
        fireRedirect: true
      })
    })
    .catch( err => {
      console.log('nooo', err)
    })
  }

  renderSong() {
    return(
      <div className="single-song">
        <h1>{this.state.apiData.song.title}</h1>
        <h2>{this.state.apiData.song.artist}</h2>
        <Link to={`/songs/${this.state.apiData.song.id}/edit`}>Edit this song?</Link>
        <button onClick={this.deleteSong}>Delete This Song?</button>
      </div>
    );
  };

  render() {
    return(
      <div className="single-container">
        {this.state.apiDataLoaded ? this.renderSong() : ''}
        {this.state.fireRedirect ? <Redirect to="/songs" /> : ''}
      </div>
    )
  }
};

export default SongSingle

```

</details>


## Conclusion

React on Rails is probably one of the fastest stacks you can build. We just build an entire CRUD app from scratch today. This stack takes advantage of how fast and strong ActiveRecord is when using Rails, while leveraging all of the smoothness and cleanliness of React.
