var FancyFriday = (function() {
  var ARBITRARY_DELAY = 100;
  var SECONDS_PER_PLAY = 5;
  var SECONDS_PER_ENDING = 2;
  var SANDBOX_PERMISSIONS = [
    'allow-same-origin',
    'allow-scripts',
    'allow-pointer-lock',
  ];

  var FancyFriday = {};
  var CustomEvent = function CustomEvent(type, params) {
    params = params || {bubbles: false, cancelable: false};
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent(type, params.bubbles, params.cancelable,
                          params.detail);
    return event;
  };

  FancyFriday.Minigame = function Minigame(url, options) {
    options = options || {};

    var minigame = document.createElement('div');
    var timeBar = document.createElement('div');
    var time = document.createElement('div');
    var iframe = document.createElement('iframe');
    var secondsPerPlay = options.secondsPerPlay || SECONDS_PER_PLAY;
    var secondsPerEnding = options.secondsPerEnding || SECONDS_PER_ENDING;
    var outOfTimeTimeout;

    if (typeof(options.sandbox) == 'undefined')
      options.sandbox = SANDBOX_PERMISSIONS;

    if (Array.isArray(options.sandbox))
      options.sandbox = options.sandbox.join(' ');

    if (options.sandbox)
      iframe.sandbox = options.sandbox;

    iframe.src = url;
    minigame.classList.add('minigame');
    minigame.classList.add('loading');
    timeBar.classList.add('time-bar');
    timeBar.appendChild(time);
    time.classList.add('time');
    minigame.appendChild(timeBar);
    minigame.appendChild(iframe);

    minigame.MINIGAME_LOADING = 0;
    minigame.MINIGAME_READY = 1;
    minigame.MINIGAME_PLAYING = 2;
    minigame.MINIGAME_ENDING = 3;
    minigame.MINIGAME_ENDED = 4;

    minigame.minigameState = minigame.MINIGAME_LOADING;
    minigame.score = 0;

    minigame.handleMessage = function(data) {
      data = typeof(data) == 'string' ? {type: data} : data;

      if (!data) return;
      if (data.score >= 0 && data.score <= 1) minigame.score = data.score;

      if (data.type == "end")
        minigame.dispatchEvent(new CustomEvent("minigameending"));
    };

    minigame.send = function(message) {
      if (typeof(message) == "string") message = {type: message};
      iframe.contentWindow.postMessage(message, "*");
    };

    minigame.play = function() {
      if (minigame.minigameState != minigame.MINIGAME_READY) return;

      minigame.minigameState = minigame.MINIGAME_PLAYING;
      minigame.classList.remove("loading");
      setTimeout(function() {
        time.style.transition = "width " + secondsPerPlay + "s";
        time.style.width = "0%";
        outOfTimeTimeout = setTimeout(function() {
          minigame.dispatchEvent(new CustomEvent("minigameending"));
          minigame.send("outoftime");
        }, secondsPerPlay * 1000);
        iframe.contentWindow.focus();
        minigame.send({
          type: "play",
          playTime: secondsPerPlay,
          endingTime: secondsPerEnding
        });
      }, ARBITRARY_DELAY);
    };

    iframe.addEventListener("load", function() {
      if (minigame.minigameState != minigame.MINIGAME_LOADING) return;

      minigame.minigameState = minigame.MINIGAME_READY;
      minigame.dispatchEvent(new CustomEvent("minigameready"));
    });

    minigame.addEventListener("minigameending", function(e) {
      if (minigame.minigameState != minigame.MINIGAME_PLAYING) return;

      minigame.minigameState = minigame.MINIGAME_ENDING;
      clearTimeout(outOfTimeTimeout);
      timeBar.parentNode.removeChild(timeBar);
      setTimeout(function() {
        minigame.minigameState = minigame.MINIGAME_ENDED;
        minigame.dispatchEvent(new CustomEvent("minigameended"));
      }, secondsPerEnding * 1000);
    });

    return minigame;
  }

  window.addEventListener("message", function(e) {
    var minigames = document.querySelectorAll(".minigame > iframe");

    for (var i = 0; i < minigames.length; i++)
      if (e.source === minigames[i].contentWindow)
        minigames[i].parentNode.handleMessage(e.data);
  }, false);

  return FancyFriday;
})();
