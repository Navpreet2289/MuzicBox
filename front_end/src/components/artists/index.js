import React, { Component } from "react";
import CSSModules from "react-css-modules";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Waypoint from "react-waypoint";
import { Link } from "react-router-dom";

import Highlighter from "utils/highlighter";
import { Loader, BottomLoader } from "components/common";
import { mergeNextArtists, searchArtists, setSearchArtistValue } from "actions";

import styles from "./artists.css";

class ArtistsPage extends Component {
  constructor(props) {
    super(props);
    this.search_value_local = "";
    this.timer = null;
  }

  componentDidMount() {
    if (
      this.props.artists.results.length === 0 &&
      !this.props.search_artist_value
    ) {
      // we need to load artists only once
      this.props.mergeNextArtists(this.props.artists.next);
    }
    // settings search value
    this.search_input.value = this.props.search_artist_value;
  }

  getNextArtists() {
    if (this.props.artists.next) {
      this.props.mergeNextArtists(this.props.artists.next);
    }
  }

  handleChange(evt) {
    clearTimeout(this.timer);
    this.search_value_local = evt.target.value;

    this.timer = setTimeout(() => {
      this.props.setSearchArtistValue(this.search_value_local);
      this.props.searchArtists(this.search_value_local);
    }, 300);
  }

  render() {
    return (
      <div className="app__container">
        <div styleName="container">
          <div styleName="search">
            <span styleName="search__span">
              <div styleName="search__form">
                <input
                  onChange={this.handleChange.bind(this)}
                  ref={input => {
                    this.search_input = input;
                  }}
                  spellCheck="false"
                  autoFocus={this.props.search_artist_value}
                  type="search"
                  className="content--truncate"
                  styleName="search__input"
                  placeholder="Start typing artist name"
                />
              </div>
            </span>
          </div>

          <ul className="list-nostyle">
            {!this.props.search_artist_value &&
            !this.props.no_songs &&
            this.props.artists.results.length === 0 ? (
              <Loader />
            ) : null}
            {this.props.no_songs ? (
              <h3 className="default-center">
                You&#39;ve got no artists yet, &nbsp;<Link
                  className="default-link"
                  to="/upload/"
                >
                  upload some songs
                </Link>
              </h3>
            ) : null}
            {this.props.artists.results.map(artist => (
              <li key={artist.id} styleName="item">
                <div styleName="item__inner">
                  <div styleName="artwork">
                    <Link to={`/artist/${artist.slug}/`}>
                      <div styleName="artwork__image">
                        <div styleName="image">
                          <img
                            styleName="image__span"
                            src={
                              artist.small_image_thumbnail ||
                              "/static/img/artist_default_small.png"
                            }
                          />
                        </div>
                      </div>
                    </Link>
                    <div styleName="artwork__play-button">
                      <Link
                        to={`/artist/${artist.slug}/`}
                        styleName="button__play button"
                        className="fa fa-play-circle"
                      />
                    </div>
                  </div>

                  <div styleName="description">
                    <Link
                      to={`/artist/${artist.slug}/`}
                      className="link-dark font-big font-light"
                      styleName="description__heading truncate"
                    >
                      {this.props.search_artist_value ? (
                        <Highlighter
                          highlightClassName="marked"
                          searchWords={this.props.search_artist_value.split(
                            /[, ]+/
                          )}
                          textToHighlight={artist.name}
                        />
                      ) : (
                        artist.name
                      )}
                    </Link>
                    <div styleName="artist__heading">
                      <Link
                        to={`/artist/${artist.slug}/`}
                        className="link-light font-small font-light"
                        styleName="truncate"
                      >
                        {artist.songs_count} songs
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))}
            {this.props.artists.next ? <BottomLoader /> : null}
            <div styleName="item">
              <Waypoint
                styleName="item"
                bottomOffset={"-250px"}
                onEnter={this.getNextArtists.bind(this)}
              />
            </div>
            {this.props.search_artist_value &&
            !this.props.artists.results.length ? (
              <p className="search-error-text">
                The search for <strong>
                  {this.props.search_artist_value}
                </strong>{" "}
                returned no matches in your artists
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
    artists: state.artists,
    search_artist_value: state.search_artist_value,
    no_songs: state.no_songs
  };
}

function matchDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      mergeNextArtists: mergeNextArtists,
      searchArtists: searchArtists,
      setSearchArtistValue: setSearchArtistValue
    },
    dispatch
  );
}

let ArtistsPageWithStyles = CSSModules(ArtistsPage, styles, {
  allowMultiple: true
});

export default connect(mapStateToProps, matchDispatchToProps)(
  ArtistsPageWithStyles
);
