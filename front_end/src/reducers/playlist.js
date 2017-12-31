import * as types from "actions/action_types";
import initialState from "./initial_state";

export function setBackupPlaylistReducer(
  state = initialState.playlist_backup,
  action
) {
  switch (action.type) {
    case types.SET_PLAYLIST_BACKUP:
      return action.payload;
    default:
      return state;
  }
}

export function setPlaylistReducer(state = initialState.playlist, action) {
  switch (action.type) {
    case types.SET_PLAYLIST:
      return action.payload;
    case types.MERGE_PLAYLIST:
      action.playlist_object.results = action.old_playlist_object.results.concat(
        action.playlist_object.results
      );
      return action.playlist_object;
    default:
      return state;
  }
}

export function setSearchSongValueReducer(
  state = initialState.search_song_value,
  action
) {
  switch (action.type) {
    case types.SET_SEARCH_SONG_VALUE:
      return action.payload;
    default:
      return state;
  }
}

export function setFilterTagValueReducer(
  state = initialState.filter_tag_value,
  action
) {
  switch (action.type) {
    case types.SET_FILTER_TAG_VALUE:
      return action.payload;
    default:
      return state;
  }
}

export function setOrderingTypeReducer(
  state = initialState.ordering_type,
  action
) {
  switch (action.type) {
    case types.SET_ORDER_TYPE:
      return action.payload;
    default:
      return state;
  }
}

export function playNextListReducer(
  state = initialState.play_next_list,
  action
) {
  switch (action.type) {
    case types.TOGGLE_PLAYNEXT_ITEM: {
      let new_play_next = [...action.old_play_next];
      if (new_play_next.includes(action.song)) {
        // removing item if it present in play_next_list
        const index = new_play_next.indexOf(action.song);
        new_play_next.splice(index, 1);
      } else {
        // if no suck item in play_next_list then adding it
        new_play_next.push(action.song);
      }
      return new_play_next;
    }
    default:
      return state;
  }
}
