function offsetLeft(el) {
  let left = 0;
  while (el && el !== document) {
    left += el.offsetLeft;
    el = el.offsetParent;
  }
  return left;
}
function format2Number(num) {
  let str = num + "";
  if (str.length === 1) {
    return "0" + str;
  }
  if (str.length === 0) {
    return "00";
  }
  return str;
}

function roundUp(num, precision) {
  return Math.ceil(num * precision) / precision;
}

function roundDown(num) {
  return Math.floor(num);
}

function shuffle(arr, options) {
  if (!Array.isArray(arr)) {
    throw new Error("shuffle expect an array as parameter.");
  }

  options = options || {};

  let collection = arr,
    len = arr.length,
    rng = options.rng || Math.random,
    random,
    temp;

  if (options.copy === true) {
    collection = [...arr];
  }

  while (len) {
    random = Math.floor(rng() * len);
    len -= 1;
    temp = collection[len];
    collection[len] = collection[random];
    collection[random] = temp;
  }

  return collection;
}

shuffle.pick = function(arr, options) {
  if (!Array.isArray(arr)) {
    throw new Error("shuffle.pick() expect an array as parameter.");
  }

  options = options || {};

  let rng = options.rng || Math.random,
    picks = options.picks || 1;

  if (typeof picks === "number" && picks !== 1) {
    let len = arr.length,
      collection = [...arr],
      random = [],
      index;

    while (picks && len) {
      index = Math.floor(rng() * len);
      random.push(collection[index]);
      collection.splice(index, 1);
      len -= 1;
      picks -= 1;
    }

    return random;
  }

  return arr[Math.floor(rng() * arr.length)];
};

function formatTime(s) {
  if (!s) {
    return "00:00";
  }
  let total_seconds = Math.floor(s);
  let hours = Math.floor(total_seconds / 3600);
  let minutes = Math.floor(total_seconds / 60) - hours * 60;
  let seconds = total_seconds - minutes * 60 - hours * 3600;

  if (hours) {
    return hours + ":" + format2Number(minutes) + ":" + format2Number(seconds);
  }

  return format2Number(minutes) + ":" + format2Number(seconds);
}

function shadeColor(color, percent) {
  var R = parseInt(color.substring(1, 3), 16);
  var G = parseInt(color.substring(3, 5), 16);
  var B = parseInt(color.substring(5, 7), 16);
  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);
  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;
  var RR = R.toString(16).length == 1 ? "0" + R.toString(16) : R.toString(16);
  var GG = G.toString(16).length == 1 ? "0" + G.toString(16) : G.toString(16);
  var BB = B.toString(16).length == 1 ? "0" + B.toString(16) : B.toString(16);
  return "#" + RR + GG + BB;
}

export {
  offsetLeft,
  format2Number,
  roundUp,
  formatTime,
  roundDown,
  shuffle,
  shadeColor
};
