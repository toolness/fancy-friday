**Fancy Friday** is a simple library for creating a metagame that consists of
any number of time-limited microgames, similar to the [WarioWare][] series
of games.

Each micrograme is contained in an `<iframe>` element which can communicate
with the parent game via a simple `postMessage`-based API.

Only recent versions of modern browsers are currently supported; the
library is currently being tested on Firefox 25, Chrome 30,
Safari 6 (Desktop and iOS), Internet Explorer 10, and Opera 17.

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

* `maxLoadTime` - The amount of time, in seconds, the iframe has to load
  before it's forcibly regarded as being ready to play.

* `playTime` - The amount of time, in seconds, the player has to
  complete the microgame. Defaults to 5.

* `endingTime` - The amount of time, in seconds, the microgame has
  to show an ending sequence. Defaults to 2.

* `difficulty` - The difficulty of the microgame, as a string. Can be
  `easy`, `medium`, or `hard`. Defaults to `easy`.

* `autoplay` - Whether to start playing the microgame once it's done
  loading. Defaults to `false`.

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

#### **Microgame::autoplay**

This boolean property determines whether the microgame starts playing
immediately after it is finished loading.

### Microgame Methods

#### **Microgame::play()**

If the microgame is still loading, this has the same effect as setting
`autoplay` to `true`.

If used when `microgameState` is `MICROGAME_READY`, this starts the play
phase of the microgame.

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

### Microgame Styling

`ff-microgame` is the class given to the top-level microgame element.
Its background will show through on any microgames with a transparent
background.

`ff-time-bar` is the class given to the entire time bar. Changing its
background will give a different style to the unfilled area of the time
bar. Its height can also be changed.

`ff-time-remaining` is the class given to the filled area of the time
bar. Its background can be changed.

## Embedded Microgame API

Embedded microgames communicate with their parent metagame entirely through
DOM primitives; there is no hard requirement for client-side stylesheets or
JS, though such assets can certainly be created for convenience purposes (see
the Tinygame API below for an example of this).

The parent metagame is accessible via [window.parent][].

### Querystring Arguments

When a microgame is embedded, the following querystring arguments are passed
in, and can be accessed by parsing the value of [location.search][]:

* `playTime` is the number of seconds the player has to play the game.

* `endingTime` is the number of seconds the microgame has to show an
  ending sequence.

* `difficulty` is the difficulty level, as a string. Possible values are
  `easy`, `medium`, and `hard`.

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
[window.parent.postMessage][postMessage]. All messages should be objects.

If the message has a `score` property, the microgame's score is updated
in the metagame.

The message can also have a `type` property corresponding to one of the
following strings:

* `ready` - The metagame will set its corresponding microgame
  instance's `microgameState` property to `MICROGAME_READY`. This
  *must* be sent by the microgame.

* `end` - The metagame will set its corresponding microgame instance's
  `microgameState` property to `MICROGAME_ENDING`.

### Styling

While there are no hard styling requirements for an embedded microgame, the
top few pixels of its content will be obscured by the time bar that
the metagame overlays atop it. The default height of this time bar is
8 pixels.

## Tinygame API

`contrib/tinygame.js` is a standalone library with no dependencies that
wraps the Embedded Microgame API in an easy-to-use interface, while
providing some development affordances that make it easier to develop
microgames.

If the page using `tinygame.js` either doesn't set a `playTime` querystring
argument or has the `dev` querystring argument set to `1`, then Tinygame
enables development mode, which displays a time bar at the top of the
page and simulates the major events that are sent to microgames by
a metagame. This allows microgames to be developed without a parent
metagame.

### Tinygame properties

#### Tinygame.playTime

The number of seconds the player has to play the microgame. Read-only.

If this isn't passed through the querystring, this value is taken
from the `data-playtime` attribute of the script tag that includes
`tinygame.js`. If that isn't provided, a default value of 5 is used.

#### Tinygame.endingTime

The number of seconds the microgame has to show an ending sequence.
Read-only.

If this isn't passed through the querystring, this value is taken
from the `data-endingtime` attribute of the script tag that includes
`tinygame.js`. If that isn't provided, a default value of 2 is used.

#### Tinygame.difficulty

The difficulty level of the microgame, as a string. Possible values are
`easy`, `medium`, and `hard`.

If this isn't passed through the querystring, this value is taken
from the `data-difficulty` attribute of the script tag that includes
`tinygame.js`. If that isn't provided, a default value of `easy` is used.

#### Tinygame.onplay

Assign a function to this property, and it will be called when the player
has started playing the microgame.

#### Tinygame.onoutoftime

Assign a function to this property, and it will be called when the player
runs out of time.

### Tinygame methods

#### Tinygame.end([score])

This will end the microgame, optionally setting the player's score.

#### Tinygame.win()

Shorthand for `Tinygame.end(1)`.

#### Tinygame.lose()

Shorthand for `Tinygame.end(0)`.

#### Tinygame.loading()

Ordinarily, Tinygame will send a `ready` event to the parent metagame
when the page's `load` event fires. This function can be called before
that time to prevent this default behavior, which is useful if e.g. the
microgame needs extra time to load additional assets via JavaScript.

Once the microgame is ready, it is responsible for calling
`Tinygame.loaded()` to indicate that it is ready to play.

Note also that the game can't take forever to load. After a maximum
loading period has elapsed, the parent metagame may forcibly regard the
microgame as being "ready to play" and make the player play your half-ready
game, which will hopefully result in hilarity.

#### Tinygame.loaded()

This will send a `ready` event to the parent metagame, which will
tell it that your game is ready to play. Use this only if you called
`Tinygame.loading()` before page load, or else the parent metagame will
assume the game is ready to play upon page load.

  [WarioWare]: http://en.wikipedia.org/wiki/Wario_%28franchise%29#WarioWare_series
  [sandbox]: http://www.html5rocks.com/en/tutorials/security/sandboxed-iframes/
  [CustomEvent]: https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
  [MessageEvent]: https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent
  [window.parent]: https://developer.mozilla.org/en-US/docs/Web/API/Window.parent
  [location.search]: https://developer.mozilla.org/en-US/docs/Web/API/Window.location#Example_.236.3A_Get_the_value_of_a_single_window.location.search_key.3A
  [postMessage]: https://developer.mozilla.org/en-US/docs/Web/API/Window.postMessage
