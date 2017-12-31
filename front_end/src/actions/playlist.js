import SongApi from "api/song_api";
import * as types from "./action_types";
import { setSongs } from "./song";

export const setPlaylistBackup = songs => {
  return {
    type: types.SET_PLAYLIST_BACKUP,
    payload: songs
  };
};

export const setPlaylist = songs => {
  return {
    type: types.SET_PLAYLIST,
    payload: songs
  };
};

export const setSearchSongValue = value => {
  return {
    type: types.SET_SEARCH_SONG_VALUE,
    payload: value
  };
};

export const setFilterTagValue = value => {
  return {
    type: types.SET_FILTER_TAG_VALUE,
    payload: value
  };
};

export const setOrderingType = value => {
  return {
    type: types.SET_ORDER_TYPE,
    payload: value
  };
};

export const togglePlayNextItemAction = (song, old_play_next) => {
  return {
    type: types.TOGGLE_PLAYNEXT_ITEM,
    song: song,
    old_play_next: old_play_next
  };
};

export function togglePlayNextItem(song) {
  return (dispatch, getState) => {
    const old_play_next = getState().play_next_list;
    dispatch(togglePlayNextItemAction(song, old_play_next));
  };
}

export function orderSongByValue(ordering_type) {
  return (dispatch, getState) => {
    const search_song_value = getState().search_song_value;
    const filter_tag_value_object = getState().filter_tag_value;
    dispatch(setOrderingType(ordering_type));
    SongApi.fetchSongs(
      ordering_type,
      search_song_value,
      filter_tag_value_object
    )
      .then(songs => {
        dispatch(setSongs(songs));
      })
      .catch(error => {
        throw error;
      });
  };
}

export function searchSong(song) {
  return (dispatch, getState) => {
    const filter_tag_value_object = getState().filter_tag_value;
    const ordering_type = getState().ordering_type;
    dispatch(setSearchSongValue(song));
    SongApi.fetchSongs(ordering_type, song, filter_tag_value_object)
      .then(songs => {
        dispatch(setSongs(songs));
      })
      .catch(error => {
        throw error;
      });
  };
}

export function filterSongByTag(filter_tag_value_object) {
  return (dispatch, getState) => {
    const search_song_value = getState().search_song_value;
    const ordering_type = getState().ordering_type;
    dispatch(setFilterTagValue(filter_tag_value_object));
    SongApi.fetchSongs(
      ordering_type,
      search_song_value,
      filter_tag_value_object
    )
      .then(songs => {
        dispatch(setSongs(songs));
      })
      .catch(error => {
        throw error;
      });
  };
}

export const mergePlaylist = (playlist_object, old_playlist_object) => {
  return {
    type: types.MERGE_PLAYLIST,
    playlist_object: playlist_object,
    old_playlist_object: old_playlist_object
  };
};

export function mergeNextPlaylist(page_url) {
  return (dispatch, getState) => {
    const old_playlist_object = getState().playlist;
    SongApi.getNextSongs(page_url)
      .then(playlist_object => {
        dispatch(mergePlaylist(playlist_object, old_playlist_object));
      })
      .catch(error => {
        throw error;
      });
  };
}
