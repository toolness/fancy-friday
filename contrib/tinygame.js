var Tinygame = (function() {
  var DEFAULTS = {playTime: 5, endingTime: 2};

  var Tinygame = {};
  var queryArgs = getQueryArgs(window.location.search);
  var inDevelopmentMode = !('playTime' in queryArgs) || queryArgs.dev == '1';
  var metagame = inDevelopmentMode ? window : window.parent;

  function getTimeArg(name) {
    value = parseFloat(queryArgs[name]);
    return (isNaN(value) || value <= 0) ? DEFAULTS[name] : value;
  }

  // This is based on http://stackoverflow.com/a/2091331/2422398.
  function getQueryArgs(searchString) {
    var args = {};
    var query = searchString.substring(1);
    var pairs = query.split('&');
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split('=');
      args[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }
    return args;
  }

  function startDevelopmentMode() {
    var timeBar = document.createElement('div');
    var timeRemaining = document.createElement('div');
    var outOfTimeTimeout;

    function cleanup() {
      clearTimeout(outOfTimeTimeout);
      if (timeBar) {
        timeBar.parentNode.removeChild(timeBar);
        timeBar = null;
        timeRemaining = null;
      }
    }

    timeBar.style.position = "absolute";
    timeBar.style.top = "0";
    timeBar.style.left = "0";
    timeBar.style.width = "100%";
    timeBar.style.height = "8px";
    timeBar.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
    timeBar.style.zIndex = "100000";

    timeRemaining.style.width = "100%";
    timeRemaining.style.height = "100%";
    timeRemaining.style.transition = "width " + Tinygame.playTime + "s";
    timeRemaining.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

    timeBar.appendChild(timeRemaining);
    document.body.appendChild(timeBar);

    window.addEventListener("load", function() {
      timeRemaining.style.width = "0";
      window.postMessage({type: "play"}, "*");
      outOfTimeTimeout = setTimeout(function() {
        cleanup();
        window.postMessage({type: "outoftime"}, "*");
      }, Tinygame.playTime * 1000);
    }, false);

    window.addEventListener("message", function(event) {
      var data = event.data;

      if (!data) return;
      if (data.type == 'end') cleanup();
    });
  }

  Tinygame.playTime = getTimeArg('playTime');
  Tinygame.endingTime = getTimeArg('endingTime');
  Tinygame.end = function(score) {
    metagame.postMessage({type: 'end', score: score}, "*");
  };
  Tinygame.win = Tinygame.end.bind(Tinygame, 1.0);
  Tinygame.lose = Tinygame.end.bind(Tinygame, 0);

  window.addEventListener("message", function(event) {
    if (!event.data || typeof(event.data) != "object") return;
    var handler = Tinygame['on' + event.data.type];
    if (typeof(handler) == 'function') handler(event.data);
  }, false);

  if (inDevelopmentMode) startDevelopmentMode();

  return Tinygame;
})();
