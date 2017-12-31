import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  playNext,
  setIsPlaying,
  setPlaylist,
  setShuffledMode,
  mergeNextPlaylist,
  togglePlayNextItem
} from "actions";
import Player from "./player";

function mapStateToProps(state) {
  return {
    playlist_backup: state.playlist_backup,
    active_song: state.active_song,
    is_playing: state.is_playing,
    playlist: state.playlist,
    shuffled_mode: state.shuffled_mode,
    no_songs: state.no_songs,
    play_next_list: state.play_next_list
  };
}

function matchDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      playNext: playNext,
      setIsPlaying: setIsPlaying,
      setPlaylist: setPlaylist,
      setShuffledMode: setShuffledMode,
      mergeNextPlaylist: mergeNextPlaylist,
      togglePlayNextItem: togglePlayNextItem
    },
    dispatch
  );
}

export default connect(mapStateToProps, matchDispatchToProps)(Player);
