import { combineReducers } from "redux";
import { songReducer, activeSongReducer, noSongsReducer } from "./song";
import { isPlayingReducer, shuffledMode } from "./player";
import {
  setBackupPlaylistReducer,
  setPlaylistReducer,
  setSearchSongValueReducer,
  setFilterTagValueReducer,
  setOrderingTypeReducer,
  playNextListReducer
} from "./playlist";
import { menuOpenReducer } from "./menu";
import { artistReducer, setSearchArtistValueReducer } from "./artist";

const rootReducer = combineReducers({
  filter_tag_value: setFilterTagValueReducer,
  play_next_list: playNextListReducer,
  ordering_type: setOrderingTypeReducer,
  artists: artistReducer,
  no_songs: noSongsReducer,
  songs: songReducer,
  search_artist_value: setSearchArtistValueReducer,
  shuffled_mode: shuffledMode,
  search_song_value: setSearchSongValueReducer,
  playlist_backup: setBackupPlaylistReducer,
  playlist: setPlaylistReducer,
  active_song: activeSongReducer,
  is_playing: isPlayingReducer,
  is_menu_open: menuOpenReducer
});

export default rootReducer;
