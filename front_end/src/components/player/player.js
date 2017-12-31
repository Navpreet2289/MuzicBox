import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { Link } from "react-router-dom";
import NotificationSystem from "react-notification-system";
import CSSModules from "react-css-modules";

import { roundUp, formatTime, offsetLeft, shuffle } from "utils/misc";

import styles from "./player.css";

let cx = classNames.bind(styles);

class Player extends Component {
  constructor(props) {
    super(props);
    this.state = {
      progress: 0, // progress of the playback
      volume: 1,
      in_set_progress_mode: false,
      in_set_volume_mode: false,
      is_loading: this.props.no_songs,
      play: this.props.autoplay || false,
      repeat: false,
      is_muted: false,
      current_time: 0,
      totalTime: 0
    };
    this._notificationSystem = null;
    this.is_progress_mouse = false;
  }

  componentDidMount() {
    // capturing mouse up everywhere and stopping setting song progress
    document.addEventListener("mouseup", e => this.stopSetProgress(e, true));
    document.addEventListener("mouseup", e => this.stopSetVolume(e, true));
  }

  componentWillUnmount() {
    document.removeEventListener("mouseup", e => this.stopSetProgress(e, true));
    document.removeEventListener("mouseup", e => this.stopSetVolume(e, true));
  }

  componentWillReceiveProps(nextProps) {
    // checking for first load and loading first song
    if (this.props.active_song.id !== nextProps.active_song.id) {
      this.songEnded();
      this._player.load();
    }

    // toggling play/pause based on props.is_playing
    // this also allows to control player outside of this component
    if (this.props.is_playing !== nextProps.is_playing) {
      if (!this.state.is_loading) {
        if (nextProps.is_playing) {
          this.safePlay();
        } else {
          this._player.pause();
        }
      }
    }
  }

  safePlay() {
    // method for handling Safari 11 blocking with message
    let play_promise = this._player.play();
    // In browsers that don’t yet support this functionality,
    // play_promise won’t be defined.
    if (play_promise !== undefined) {
      play_promise.catch(error => {
        if (error.name == "NotAllowedError") {
          // Automatic playback failed.
          // Show a UI element to let the user manually start playback.
          if (this._notificationSystem) {
            this._notificationSystem.addNotification({
              message: "Allow autoplay functionality for better support",
              level: "error",
              autoDismiss: 0,
              action: {
                label: "Learn more",
                callback: function() {
                  window.open(
                    "https://reduxblog.com/post/how-enable-autoplay-safari-11/",
                    "_blank",
                    "noopener"
                  );
                }
              }
            });
          }
        }
      });
    }
  }

  onCanPlay() {
    this.setState({
      totalTime: this.props.active_song.length,
      current_time: this._player.currentTime,
      is_loading: false
    });
    if (this.props.is_playing) {
      // this fires when we set progress or load song
      this.safePlay();
    }
  }

  handlePlayNextList() {
    // checking if play_next_list isn't empty and picking up songs from it
    if (this.props.play_next_list.length > 0) {
      let next_id = this.props.play_next_list[0];
      this.props.playNext(next_id);
      this.props.togglePlayNextItem(next_id);
      return true;
    } else {
      return false;
    }
  }

  next(evt, force = false) {
    // force is used when we need to ignore repeat mode
    if (!this.props.no_songs) {
      // we need to manually load song when repeat mode is on
      if (!force && this.state.repeat) {
        this._player.load();
      }
      // here we will handle play_next_list
      if (this.handlePlayNextList()) {
        // here we're skipping further action because of higher priority of play_next_list
        return;
      }
      let total = this.props.playlist.results.length;
      let current = this.props.playlist.results.findIndex(
        song => song.id === this.props.active_song.id
      );
      // checking if playlist is at nearly end
      // because we'll load pagination and use it for next life cycle
      if (current + 2 === total) {
        // checking if playlist has next pagination
        if (this.props.playlist.next) {
          this.props.mergeNextPlaylist(this.props.playlist.next);
        }
      }
      let next_playlist_id =
        !force && this.state.repeat
          ? current
          : current < total - 1 ? current + 1 : 0;
      // when we have only 1 song in playlist we'll pause and not use loader
      if (total === 1) {
        this.props.setIsPlaying(false);
      } else {
        this.songEnded();
      }
      let next_song = this.props.playlist.results[next_playlist_id];
      this.props.playNext(next_song.id);
    }
  }

  prev() {
    if (!this.props.no_songs) {
      let total = this.props.playlist.results.length;
      let current = this.props.playlist.results.findIndex(
        song => song.id === this.props.active_song.id
      );
      let prev_id = current > 0 ? current - 1 : total - 1;
      let previous = this.props.playlist.results[prev_id];
      // checking if song is single in playlist and ignoring action
      if (total == 1) {
        return;
      } else {
        this.songEnded();
        this.props.playNext(previous.id);
      }
    }
  }

  randomize() {
    // this method is different from backend random
    // because here we're randomising current playlist
    let copy_playlist = JSON.parse(JSON.stringify(this.props.playlist));
    copy_playlist.results = shuffle(copy_playlist.results);
    !this.props.shuffled_mode
      ? this.props.setPlaylist(copy_playlist)
      : this.props.setPlaylist(this.props.playlist_backup);
    this.props.setShuffledMode(!this.props.shuffled_mode);
  }

  songEnded() {
    this._player.pause();
    this.setState({
      progress: 0,
      current_time: 0,
      is_loading: true
    });
  }

  togglePlay() {
    if (!this.props.no_songs) {
      this.props.setIsPlaying(!this.props.is_playing);
    }
  }

  onPause() {
    // used when Safari uses pause from touchbar
    // here we need to ignore onEnded callback and state is_loading
    if (this.state.progress < 1 && !this.state.is_loading) {
      this.props.setIsPlaying(false);
    }
  }

  onPlay() {
    // used when Safari uses play from touchbar
    this.props.setIsPlaying(true);
  }

  toggleMute() {
    let is_muted = this.state.is_muted;
    let new_volume = is_muted ? this.state.volume : 0;
    this._player.volume = new_volume;
    this.setState({ is_muted: !this.state.is_muted });
  }

  listenProgress() {
    if (!this.state.is_loading) {
      this.setState({
        progress: this._player.currentTime / this.props.active_song.length,
        current_time: this._player.currentTime
      });
    }
  }

  startSetProgress(evt) {
    if (!this.state.is_loading) {
      this.is_progress_mouse = false;
      this.setProgress(evt);
      this.setState({
        in_set_progress_mode: true
      });
    }
  }

  setProgress(evt) {
    if (
      this.state.in_set_progress_mode &&
      !this.props.no_songs &&
      !this.state.is_loading
    ) {
      let elem = evt.target;
      let progress = (evt.clientX - offsetLeft(elem)) / elem.clientWidth;
      this._player.currentTime = this._player.duration * progress;
      this.setState({
        progress: progress
      });
      this.is_progress_mouse = true;
    }
  }

  stopSetProgress = (evt, force = false) => {
    if (!this.state.is_loading) {
      if (!force && this.is_progress_mouse !== true) {
        this.setProgress(evt);
      }
      this.setState({
        in_set_progress_mode: false
      });
    }
  };

  startSetVolume(evt) {
    this.setVolume(evt);
    this.setState({
      in_set_volume_mode: true
    });
  }

  setVolume(evt) {
    if (this.state.in_set_volume_mode) {
      let elem = evt.target;
      let is_muted = this.state.is_muted;
      let new_volume = (evt.clientX - offsetLeft(elem)) / elem.clientWidth;
      if (new_volume <= 0.05) {
        new_volume = 0;
        is_muted = true;
      } else {
        is_muted = false;
      }
      this._player.volume = new_volume;
      this.setState({
        volume: new_volume,
        is_muted: is_muted
      });
    }
  }

  listenWheelVolume(evt) {
    let new_volume = 0;
    let change_speed = 0.1;
    let is_muted = this.state.is_muted;
    let old_volume = this._player.volume;

    if (evt.deltaY > 0) {
      new_volume = old_volume - change_speed;
    } else {
      new_volume = old_volume + change_speed;
    }

    if (new_volume > 1) {
      new_volume = 1;
    } else if (1 >= new_volume && new_volume >= 0.05) {
      this._player.volume = new_volume;
      is_muted = false;
    } else {
      new_volume = 0;
      is_muted = true;
    }
    this._player.volume = new_volume;

    this.setState({
      volume: new_volume,
      is_muted: is_muted
    });
  }

  stopSetVolume = (evt, force = false) => {
    if (!force) {
      this.setVolume(evt);
    }
    this.setState({
      in_set_volume_mode: false
    });
  };

  repeat() {
    this.setState({ repeat: !this.state.repeat });
  }

  render() {
    let playerClsName = cx({
      fa: true,
      "fa-play-circle-o": !this.props.is_playing && !this.state.is_loading,
      "fa-pause-circle-o": this.props.is_playing && !this.state.is_loading,
      "fa-circle-o-notch fa-spin": this.state.is_loading
    });
    let randomClass = cx({
      "control-button": true,
      active: this.props.shuffled_mode
    });
    let repeatClass = cx({
      "control-button": true,
      active: this.state.repeat
    });
    let volumeClass = cx({
      fa: true,
      "fa-volume-up": !this.state.is_muted,
      "fa-volume-off": this.state.is_muted
    });
    return (
      <footer styleName="player">
        <NotificationSystem ref={n => (this._notificationSystem = n)} />
        <div styleName="player__bar">
          <div styleName="player__bar__left">
            <div styleName="now-playing">
              <Link to={`/artist/${this.props.active_song.artist.slug}/`}>
                <div styleName="cover-art shadow now-playing__cover-art">
                  <div>
                    <img
                      styleName="cover-art-image cover-art-image-loaded"
                      src={
                        this.props.active_song.small_image_thumbnail ||
                        "/static/img/song_default_small.png"
                      }
                    />
                  </div>
                </div>
              </Link>

              <div styleName="track-info ellipsis-one-line">
                <div styleName="track-info__name ellipsis-one-line">
                  <div styleName="track-info__name ellipsis-one-line">
                    <div styleName="react-contextmenu-wrapper">
                      {this.props.active_song.album ? (
                        <Link
                          to={`/artist/${this.props.active_song.artist
                            .slug}/${this.props.active_song.album.slug}/`}
                          className="a-underlined"
                        >
                          {this.props.active_song.name}
                        </Link>
                      ) : (
                        <Link
                          to={`/artist/${this.props.active_song.artist.slug}/`}
                          className="a-underlined"
                        >
                          {this.props.active_song.name}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
                <div
                  className="link-subtle"
                  styleName="track-info__artists ellipsis-one-line"
                >
                  <span>
                    <span styleName="react-contextmenu-wrapper">
                      <Link
                        to={`/artist/${this.props.active_song.artist.slug}/`}
                        className="a-underlined"
                      >
                        {this.props.active_song.artist.name}
                      </Link>
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div styleName="player__bar__center">
            <div styleName="player-controls">
              <div styleName="player-controls__buttons">
                <button
                  onClick={this.randomize.bind(this)}
                  className="fa fa-random"
                  styleName={randomClass}
                  title="Enable shuffle"
                />
                <button
                  onClick={this.prev.bind(this)}
                  className="fa fa-backward"
                  styleName="control-button"
                  title="Previous"
                />
                <button
                  onClick={this.togglePlay.bind(this)}
                  className={playerClsName}
                  styleName="control-button control-button--circled"
                  title="Play"
                />
                <button
                  onClick={e => this.next(e, true)}
                  className="fa fa-forward"
                  styleName="control-button"
                  title="Next"
                />
                <button
                  onClick={this.repeat.bind(this)}
                  className="fa fa-repeat"
                  styleName={repeatClass}
                  title="Enable repeat"
                />
              </div>

              <div styleName="playback-bar">
                <div styleName="playback-bar__progress-time">
                  {formatTime(this.state.current_time)}
                </div>
                <div
                  onMouseDown={this.startSetProgress.bind(this)}
                  onMouseMove={this.setProgress.bind(this)}
                  onMouseUp={this.stopSetProgress}
                  styleName="progress-bar"
                >
                  <div styleName="middle-align progress-bar__bg">
                    <div
                      styleName="progress-bar__fg"
                      style={{
                        width: roundUp(this.state.progress * 100, 100) + "%"
                      }}
                    />
                    <div
                      styleName="middle-align progress-bar__slider"
                      style={{
                        left: roundUp(this.state.progress * 100, 100) + "%"
                      }}
                    />
                  </div>
                </div>
                <div styleName="playback-bar__progress-time">
                  {formatTime(this.state.totalTime)}
                </div>
              </div>
            </div>
          </div>

          <audio
            ref={ref => (this._player = ref)}
            onEnded={() => this.next()}
            onCanPlay={this.onCanPlay.bind(this)}
            onTimeUpdate={this.listenProgress.bind(this)}
            onPause={this.onPause.bind(this)}
            onPlay={this.onPlay.bind(this)}
            autoPlay={this.state.play}
            preload="none"
          >
            <source src={this.props.active_song.audio_file} type="audio/mp3" />
          </audio>

          <div styleName="player__bar__right">
            <div styleName="now-playing-bar__right__inner">
              <div styleName="extra-controls">
                <span
                  styleName="connect-device-picker"
                  style={{ display: "none" }}
                >
                  <button className="fa fa-heart" styleName="control-button" />
                </span>

                <div
                  onWheel={this.listenWheelVolume.bind(this)}
                  styleName="volume-bar"
                >
                  <button
                    onClick={this.toggleMute.bind(this)}
                    className={volumeClass}
                    styleName="control-button volume-bar__icon"
                  />

                  <div
                    onMouseDown={this.startSetVolume.bind(this)}
                    onMouseMove={this.setVolume.bind(this)}
                    onMouseUp={this.stopSetVolume}
                    styleName="progress-bar"
                  >
                    <div styleName="middle-align progress-bar__bg">
                      <div
                        styleName="progress-bar__fg"
                        style={{
                          width:
                            this.state.is_muted > 0
                              ? 0
                              : roundUp(this.state.volume * 100, 100) + "%"
                        }}
                      />
                      <div
                        styleName="middle-align progress-bar__slider"
                        style={{
                          left:
                            this.state.is_muted > 0
                              ? 0
                              : roundUp(this.state.volume * 100, 100) + "%"
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }
}

Player.propTypes = {
  playlist: PropTypes.object,
  song: PropTypes.object
};

export default CSSModules(Player, styles, { allowMultiple: true });
