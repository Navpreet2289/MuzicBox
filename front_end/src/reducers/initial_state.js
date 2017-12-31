export default {
  songs: {
    count: null,
    next: null,
    previous: null,
    results: []
  },
  playlist_backup: {
    count: null,
    next: null,
    previous: null,
    results: []
  },
  playlist: {
    count: null,
    next: null,
    previous: null,
    results: []
  },
  play_next_list: [],
  search_song_value: "",
  search_artist_value: "",
  artists: {
    count: null,
    next: null,
    previous: null,
    results: []
  },
  no_songs: false,
  filter_tag_value: null,
  ordering_type: null,
  shuffled_mode: false,
  song: {
    id: "",
    name: "",
    lyrics: "",
    audio_file: "",
    artist: { name: "" },
    large_image_thumbnail: "",
    extra_sm_image_thumbnail: ""
  },
  is_playing: false,
  is_menu_open: false
};
