import React, { Component } from "react";
import CSSModules from "react-css-modules";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import classNames from "classnames";
import Waypoint from "react-waypoint";
import { Link } from "react-router-dom";

import { formatTime, roundDown } from "utils/misc";
import Highlighter from "utils/highlighter";
import SongApi from "api/song_api";
import { Loader, BottomLoader } from "components/common";
import {
  setIsPlaying,
  playNext,
  searchSong,
  setPlaylistBackup,
  setPlaylist,
  mergeNextSongs,
  setShuffledMode,
  filterSongByTag,
  orderSongByValue,
  togglePlayNextItem
} from "actions";

import styles from "./playlist.css";

let cx = classNames.bind(styles);

class Song extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lyrics: null,
      is_lyrics_open: false
    };
  }

  handleClickAuthor(name) {
    this.props.setLocalSearch(name);
    this.props.searchSong(name);
  }

  handleClickName() {
    if (!this.state.lyrics && this.props.song.has_lyrics) {
      SongApi.getSongLyrics(this.props.song.id).then(song_object => {
        this.setState({
          lyrics: song_object.lyrics,
          is_lyrics_open: !this.state.is_lyrics_open
        });
      });
    } else if (this.props.song.has_lyrics) {
      this.setState({
        is_lyrics_open: !this.state.is_lyrics_open
      });
    } else {
      this.handlePlay();
    }
  }

  handlePlay() {
    this.props.setPlaylistBackup(this.props.songs); // setting new playlist to keep sync search with playlist
    this.props.setPlaylist(this.props.songs); // setting new playlist to keep sync search with playlist
    // if clicked song isn't active then switch to next song
    if (this.props.song.id !== this.props.active_song.id) {
      this.props.playNext(this.props.song.id, true);
      // if song is active then toggle is_playing
    } else {
      this.props.setIsPlaying(!this.props.is_playing);
    }
    // disable shuffled mode on player because we just set new playlist
    if (this.props.shuffled_mode) {
      this.props.setShuffledMode(!this.props.shuffled_mode);
    }
    // remove item from play_next_list if we clicked on it
    if (this.props.play_next_list.includes(this.props.song.id)) {
      this.props.togglePlayNextItem(this.props.song.id);
    }
  }

  handleClick(evt) {
    let target = evt.target;
    if (target.tagName.toLowerCase() == "span") {
      // checking if target isn't span or a because we have different listener for them
      return;
    } else if (target.className == "fa fa-indent") {
      // checking if target isn't play next and ignoring click and handling it manually
      this.props.togglePlayNextItem(this.props.song.id);
      return;
    }
    this.handlePlay();
  }

  playClass() {
    if (
      this.props.song.id === this.props.active_song.id &&
      this.props.is_playing
    ) {
      return "fa fa-pause-circle playlist__song__overlay";
    } else {
      return "fa fa-play-circle playlist__song__overlay";
    }
  }

  render() {
    let listClass = cx({
      pointer: true,
      "playlist--border": true,
      "playlist--hover": true,
      "playlist--active": this.props.song.id === this.props.active_song.id
    });
    let lyricsCls = cx({
      playlist__lyrics: true,
      hidden: !this.state.is_lyrics_open
    });
    let songNameCls = cx({
      "font-medium": true,
      "link-dark": true,
      "a-underlined": this.props.song.has_lyrics
    });
    let playNextCls = cx({
      playlist__right__play_next: true,
      "playlist__right__play_next--active": this.props.play_next_list.includes(
        this.props.song.id
      )
    });
    return (
      <li onClick={this.handleClick.bind(this)} className={listClass}>
        <div className="font-small playlist__song">
          <div className="playlist__song__image">
            <div className="playlist__song__image__container">
              <i
                className={this.playClass(this.props.song)}
                aria-hidden="true"
              />
              <img
                className="playlist__song__artist__image playlist__song__artist__image--full playlist__song__artwork"
                src={
                  this.props.song.extra_sm_image_thumbnail ||
                  "/static/img/song_default.png"
                }
              />
            </div>
          </div>

          <div className="content--truncate playlist__song__content">
            <span
              onClick={this.handleClickAuthor.bind(
                this,
                this.props.song.artist.name
              )}
              className="link-light a-underlined"
            >
              {this.props.search_song_value ? (
                <Highlighter
                  highlightClassName="marked"
                  searchWords={this.props.search_song_value.split(/[, ]+/)}
                  textToHighlight={this.props.song.artist.name}
                />
              ) : (
                this.props.song.artist.name
              )}
            </span>
            <span className="playlist__separator">•</span>
            <span
              onClick={this.handleClickName.bind(this)}
              className={songNameCls}
            >
              {this.props.search_song_value ? (
                <Highlighter
                  highlightClassName="marked"
                  searchWords={this.props.search_song_value.split(/[, ]+/)}
                  textToHighlight={this.props.song.name}
                />
              ) : (
                this.props.song.name
              )}
            </span>
          </div>

          <div className="playlist__right">
            <div className="playlist__right__kbs">
              <span title="Song bitrate" className="playlist__right__kbs--span">
                {roundDown(this.props.song.bitrate / 1000)}/kbps
              </span>
            </div>

            <div className={playNextCls}>
              <span
                title="Add to Play next queue"
                className="playlist__right__play_next--span"
              >
                <i className="fa fa-indent" aria-hidden="true" />
              </span>
            </div>

            <div className="playlist__right__time">
              <span title="Song length" className="playlist__right__time--span">
                {formatTime(this.props.song.length)}
              </span>
            </div>
          </div>
        </div>

        <div className={lyricsCls}>
          <div
            className="playlist__lyrics__inner scrollbar-custom"
            dangerouslySetInnerHTML={{
              __html: this.state.lyrics
            }}
          />
        </div>
      </li>
    );
  }
}

class Playlist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      is_filter_open: false,
      tags: []
    };
    this.timer = null;
    this.search_value_local = ""; // for temp storage of search text when using timer
  }

  componentDidMount() {
    this.search_input_ref.value = this.props.search_song_value;
  }

  handleChange(evt) {
    clearTimeout(this.timer);
    this.search_value_local = evt.target.value;

    this.timer = setTimeout(() => {
      this.props.searchSong(this.search_value_local);
    }, 300);
  }

  loadTags() {
    if (this.state.tags.length === 0) {
      SongApi.getTags().then(tags_object => {
        this.setState({
          tags: tags_object
        });
      });
    }
  }

  getNextSongs() {
    if (this.props.songs.next) {
      this.props.mergeNextSongs(this.props.songs.next);
    }
  }

  setLocalSearch(value) {
    this.search_input_ref.value = value;
  }

  toggleFilter() {
    this.setState({
      is_filter_open: !this.state.is_filter_open
    });
    this.loadTags();
  }

  handleTagClick(evt, tag) {
    this.setState({
      is_filter_open: !this.state.is_filter_open
    });
    this.props.filterSongByTag(tag);
  }

  handleOrderingClick(evt, ordering_value) {
    this.setState({
      is_filter_open: !this.state.is_filter_open
    });
    this.props.orderSongByValue(ordering_value);
  }

  activeTagClass(tag, initial = null) {
    if (
      this.props.filter_tag_value &&
      tag &&
      this.props.filter_tag_value.slug === tag.slug
    ) {
      return "playlist__controls__options__item playlist__controls__options__item--active";
    } else if (!this.props.filter_tag_value && initial) {
      return "playlist__controls__options__item playlist__controls__options__item--active";
    } else {
      return "playlist__controls__options__item";
    }
  }

  activeOrderingClass(o_type) {
    if (this.props.ordering_type === o_type) {
      return "playlist__controls__options__item playlist__controls__options__item--active";
    } else {
      return "playlist__controls__options__item";
    }
  }

  render() {
    let filterButtonCls = cx({
      playlist__controls__button: true,
      "playlist__controls__button--active": this.state.is_filter_open
    });
    let filterDivCls = cx({
      "scrollbar-custom": true,
      hidden: !this.state.is_filter_open
    });
    return (
      <div className="app__container">
        <div styleName="playlist__controls">
          <div styleName="playlist__controls__search">
            <input
              onChange={this.handleChange.bind(this)}
              ref={input => {
                this.search_input_ref = input;
              }}
              className="content--truncate"
              spellCheck="false"
              styleName="playlist__controls__search__input"
              placeholder="Search for artists, bands, tracks"
              autoFocus={this.props.search_song_value}
              type="search"
            />
          </div>

          <div styleName="playlist__controls__right">
            <button
              onClick={this.toggleFilter.bind(this)}
              className="content--truncate"
              styleName={filterButtonCls}
            >
              {this.props.filter_tag_value
                ? this.props.filter_tag_value.name
                : "All music genres"}
            </button>
            <div
              className={filterDivCls}
              styleName="playlist__controls__options"
            >
              <div styleName="playlist__controls__options__headline">
                Ordering:
              </div>
              <div styleName="playlist__controls__options__inner first">
                <div
                  onClick={e => this.handleOrderingClick(e, "popularity")}
                  styleName={this.activeOrderingClass("popularity")}
                >
                  Popularity
                </div>
                <div
                  onClick={e => this.handleOrderingClick(e, "random")}
                  styleName={this.activeOrderingClass("random")}
                >
                  Random
                </div>
                <div
                  onClick={e => this.handleOrderingClick(e, null)}
                  styleName={this.activeOrderingClass(null)}
                >
                  Uploaded date
                </div>
              </div>
              <div styleName="playlist__controls__options__headline">
                Genres:
              </div>
              <div styleName="playlist__controls__options__inner">
                {this.state.tags.length === 0 && !this.props.no_songs ? (
                  <Loader />
                ) : (
                  <div
                    onClick={e => this.handleTagClick(e, null)}
                    styleName={this.activeTagClass(null, true)}
                  >
                    All music genres
                  </div>
                )}

                {this.state.tags.map(tag => (
                  <div
                    onClick={e => this.handleTagClick(e, tag)}
                    styleName={this.activeTagClass(tag)}
                    key={tag.id}
                  >
                    {tag.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="m-3vh" styleName="playlist">
          {this.props.no_songs ? (
            <h3 className="default-center">
              You&#39;ve got no songs yet, &nbsp;<Link
                className="default-link"
                to="/upload/"
              >
                upload some
              </Link>
            </h3>
          ) : null}
          <ul styleName="playlist--nostyle">
            {this.props.songs.results.map(song => (
              <Song
                key={song.id}
                song={song}
                songs={this.props.songs}
                play_next_list={this.props.play_next_list}
                is_playing={this.props.is_playing}
                active_song={this.props.active_song}
                shuffled_mode={this.props.shuffled_mode}
                search_song_value={this.props.search_song_value}
                setLocalSearch={this.setLocalSearch.bind(this)}
                playNext={this.props.playNext.bind(this)}
                searchSong={this.props.searchSong.bind(this)}
                setPlaylist={this.props.setPlaylist.bind(this)}
                setIsPlaying={this.props.setIsPlaying.bind(this)}
                setShuffledMode={this.props.setShuffledMode.bind(this)}
                setPlaylistBackup={this.props.setPlaylistBackup.bind(this)}
                togglePlayNextItem={this.props.togglePlayNextItem.bind(this)}
              />
            ))}
            {this.props.songs.next ? <BottomLoader /> : null}
            <Waypoint
              bottomOffset={"-200px"}
              onEnter={this.getNextSongs.bind(this)}
            />
            {this.props.search_song_value &&
            !this.props.songs.results.length ? (
              <p className="search-error-text">
                The search for <strong>
                  {this.props.search_song_value}
                </strong>{" "}
                returned no matches in{" "}
                <strong>
                  {this.props.filter_tag_value
                    ? this.props.filter_tag_value.name
                    : "your audios"}
                </strong>
              </p>
            ) : null}
          </ul>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    songs: state.songs,
    active_song: state.active_song,
    is_playing: state.is_playing,
    search_song_value: state.search_song_value,
    shuffled_mode: state.shuffled_mode,
    filter_tag_value: state.filter_tag_value,
    no_songs: state.no_songs,
    ordering_type: state.ordering_type,
    play_next_list: state.play_next_list
  };
}

function matchDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      setIsPlaying: setIsPlaying,
      playNext: playNext,
      searchSong: searchSong,
      setPlaylistBackup: setPlaylistBackup,
      setPlaylist: setPlaylist,
      mergeNextSongs: mergeNextSongs,
      setShuffledMode: setShuffledMode,
      filterSongByTag: filterSongByTag,
      orderSongByValue: orderSongByValue,
      togglePlayNextItem: togglePlayNextItem
    },
    dispatch
  );
}

let PlaylistWithStyles = CSSModules(Playlist, styles, { allowMultiple: true });

export default connect(mapStateToProps, matchDispatchToProps)(
  PlaylistWithStyles
);
