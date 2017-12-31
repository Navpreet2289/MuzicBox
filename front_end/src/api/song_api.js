class SongApi {
  static getNextSongs(page_url) {
    let fetch_url;
    if (page_url) {
      fetch_url = page_url;
    } else {
      fetch_url = "/api/v0/audio/";
    }
    return fetch(fetch_url, { credentials: "same-origin" })
      .then(response => response.json())
      .catch(error => {
        return error;
      });
  }

  static getSongDetails(song_id) {
    return fetch(`/api/v0/audio/${song_id}/`, {
      credentials: "same-origin"
    })
      .then(response => response.json())
      .catch(error => {
        return error;
      });
  }

  static getTags() {
    return fetch("/api/v0/tags/", { credentials: "same-origin" })
      .then(response => response.json())
      .catch(error => {
        return error;
      });
  }

  static fetchSongs(o_type, search_song_value, filter_tag_value_object) {
    let fetch_url = "/api/v0/audio/?";
    if (o_type) {
      fetch_url += "&o=" + o_type;
    }
    if (search_song_value) {
      fetch_url += "&search=" + search_song_value;
    }
    if (filter_tag_value_object) {
      fetch_url += "&tag=" + filter_tag_value_object.slug;
    }
    return fetch(fetch_url, { credentials: "same-origin" })
      .then(response => response.json())
      .catch(error => {
        return error;
      });
  }

  static getSongLyrics(song_id) {
    return fetch(`/api/v0/audio/${song_id}/lyrics/`, {
      credentials: "same-origin"
    })
      .then(response => response.json())
      .catch(error => {
        return error;
      });
  }
}

export default SongApi;
