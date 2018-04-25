import axios from 'axios';

class Services {
  getAllSongs() {
    return axios.get('/api/songs')
  };
  getOneSong(id) {
    return axios.get(`/api/songs/${id}`)
  };
  createSong(song) {
    return axios({
      method: "POST",
      url: "/api/songs",
      data: {
        title: song.title,
        artist: song.artist,
        added_by: song.added_by
      }
    });
  };
  updateSong(song, id) {
    return axios({
      method: "PUT",
      url: `/api/songs/${id}`,
      data: {
        title: song.title,
        artist: song.artist,
        added_by: song.added_by
      }
    })
  }
  deleteSong(id) {
    return axios({
      method: "DELETE",
      url: `/api/songs/${id}`
    })
  }
};

export default new Services();
