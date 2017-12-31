import SongApi from "api/song_api";
import * as types from "./action_types";
import { loadSongDetailsSuccess } from "./song";

export const setIsPlaying = bool => {
  return {
    type: types.SET_IS_PLAYING,
    payload: bool
  };
};

export function playNext(song_id, playing = false) {
  return dispatch => {
    SongApi.getSongDetails(song_id)
      .then(song => {
        dispatch(loadSongDetailsSuccess(song));
      })
      .then(() => {
        if (playing) {
          dispatch(setIsPlaying(true));
        }
      })
      .catch(error => {
        throw error;
      });
  };
}

export const setShuffledMode = bool => {
  return {
    type: types.TOGGLE_SHUFFLED_MODE,
    payload: bool
  };
};
