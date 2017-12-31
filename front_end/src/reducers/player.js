import * as types from "actions/action_types";
import initialState from "./initial_state";

export function isPlayingReducer(state = initialState.is_playing, action) {
  switch (action.type) {
    case types.SET_IS_PLAYING:
      return action.payload;
    default:
      return state;
  }
}

export function shuffledMode(state = initialState.shuffled_mode, action) {
  switch (action.type) {
    case types.TOGGLE_SHUFFLED_MODE:
      return action.payload;
    default:
      return state;
  }
}
