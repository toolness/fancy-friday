**Fancy Friday** is a simple library for creating a metagame that consists of
any number of time-limited microgames, similar to the [WarioWare][] series
of games.

Each micrograme is contained in an `<iframe>` element which can communicate
with the parent game via a simple `postMessage`-based API.

## Metagame API

The metagame should include the `fancy-friday.css` stylesheet and the
`fancy-friday.js` script. There are no other dependencies.

### **FancyFriday.Microgame(url, [options])**

Instantiates a microgame. This is actually a `<div>` containing a time bar
(indicating the amount of time the player has left) and an `<iframe>` pointing
at `url`. `options` is an optional object containing any of the following
keys:

* `sandbox` - The value of the [sandbox][] attribute given to the iframe.
  Defaults to `allow-same-origin allow-scripts allow-pointer-lock`, which
  prevents the microgames from frame-busting and opening pop-ups. However,
  it also prevents plug-ins from being used; set this option to `null`
  to disable sandboxing entirely.

* `secondsPerPlay` - The amount of time, in seconds, the player has to
  complete the microgame. Defaults to 5.

* `secondsPerEnding` - The amount of time, in seconds, the microgame has
  to show an ending sequence. Defaults to 2.

This constructor returns a microgame instance, which is really just the
parent `<div>` element with some additional properties and methods
(enumerated below). This element must be attached to the DOM before it
can be used.

### Microgame Properties

#### **Microgame::microgameState**

This is a number corresponding to any one of the following values:

* `Microgame::MICROGAME_LOADING` - The microgame's resources are still
  loading.

* `Microgame::MICROGAME_READY` - The microgame is ready to be played, but
  has not started yet.

* `Microgame::MICROGAME_PLAYING` - The microgame is being played.

* `Microgame::MICROGAME_ENDING` - The microgame's play phase has ended, and
  it is currently showing an ending sequence. The ending sequence can be
  anything from a fancy animation to static text that the user has a few
  seconds to read; in any case, it's non-interactive.

* `Microgame::MICROGAME_ENDED` - The microgame has finished showing its ending
  sequence, and is ready to be disposed of. At this point, it is the
  client's responsibility to remove the microgame element from the DOM.

#### **Microgame::score**

The current score the player has achieved in the microgame. This starts at 0,
but the microgame can set it to any floating-point number between 0 and 1.0.
This is intended to be a percentage of the maximum points possible in a
play session: the metagame can scale it as needed.

### Microgame Methods

#### **Microgame::play()**

Starts the play phase of the microgame. This can only be used when 
`microgameState` is `MICROGAME_READY`; otherwise, it does nothing.

Immediately after calling this method, `microgameState` becomes
`MICROGAME_PLAYING`.

### Microgame Events

All events dispatched from microgame elements are instances of
[CustomEvent][].

#### microgameready

This event is emitted when `microgameState` reaches `MICROGAME_READY` and
the microgame is ready to be played.

#### microgameending

This event is emitted when `microgameState` reaches `MICROGAME_ENDING` and
the microgame's play phase is over.

#### microgameended

This event is emitted when `microgameState` reaches `MICROGAME_ENDED` and
the microgame's ending sequence is over.

## Embedded Microgame API

Embedded microgames communicate with their parent metagame entirely through
DOM primitives; there is no hard requirement for client-side stylesheets or
JS, though such assets can certainly be created for convenience purposes.

The parent metagame is accessible via [window.parent][].

### Querystring Arguments

When a microgame is embedded, the following querystring arguments are passed
in, and can be accessed by parsing the value of [location.search][]:

* `playTime` is the number of seconds the player has to play the game.

* `endingTime` is the number of seconds the microgame has to show an
  ending sequence.

### Received Events

The parent metagame sends a variety of [MessageEvent][] instances
to a microgame. Each event's data is an object consisting, at the very
least, of a `type` property that can have any of the following values:

* `play` - The player has started playing the microgame.

* `outoftime` - The player has run out of time to play the microgame. The
  microgame should now display an ending sequence and inform the metagame
  of the player's final score.

### Sent Events

The microgame can send events to its metagame via
[window.parent.postMessage][postMessage].

If the message is an object containing a `score` property, the microgame's
score is updated in the metagame.

If the message is an object containing a `type` property with the value
`end`, the metagame will set its corresponding microgame instance's
`microgameState` property to `MICROGAME_ENDING`.

The microgame can also simply send the text message `win`, which is
shorthand for `{type: 'end', score: 1}`.

  [WarioWare]: http://en.wikipedia.org/wiki/Wario_%28franchise%29#WarioWare_series
  [sandbox]: http://www.html5rocks.com/en/tutorials/security/sandboxed-iframes/
  [CustomEvent]: https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
  [MessageEvent]: https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent
  [window.parent]: https://developer.mozilla.org/en-US/docs/Web/API/Window.parent
  [location.search]: https://developer.mozilla.org/en-US/docs/Web/API/Window.location#Example_.236.3A_Get_the_value_of_a_single_window.location.search_key.3A
  [postMessage]: https://developer.mozilla.org/en-US/docs/Web/API/Window.postMessage
