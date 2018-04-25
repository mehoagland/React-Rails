class SongsController < ApplicationController
  before_action :set_song, only: [:show, :update, :destroy]
  def index
    @songs = Song.all
    render json: {
      message: "Let's get it",
      songs: @songs
    }
  end
  def show
    render json: {
      message: "We got it",
      song: @song
    }
  end
  def create
    @song = Song.new(song_params)
    @song.save
    render json: {
      message: "gogogogo",
      song: @song
    }
  end

  def update
    @song.update(song_params)
    render json: {
      message: "updated",
      song: @song
    }
  end

  def destroy
    @song.delete
    render json: {
      message: "deleted a song"
    }
  end

  private

  def set_song
    @song = Song.find(params[:id])
  end

  def song_params
    params.permit(:title, :artist, :added_by)
  end
end
