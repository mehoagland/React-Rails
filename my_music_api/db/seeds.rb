# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

Song.create!([
  {
    title: "Freaky Friday",
    artist: "Lil Dicky feat. Chris Brown",
    added_by: "Jase"
  },
  {
    title: "Friday",
    artist: "Rebecca Black",
    added_by: "Bell"
  },
  {
    title: "A Walk",
    artist: "Tycho",
    added_by: "Master"
  },
  {
    title: "True Survivor",
    artist: "David Hasselhoff",
    added_by: "Taka"
  }
])
puts "Created #{Song.count} songs"

