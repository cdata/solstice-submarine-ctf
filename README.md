![Solstice Submarine: Capture the Fork][20]

Solstice Submarine: Capture the Fork is a simultaneous-turn-based CTF (capture the flag) game. You will play as one of the characters from the [Solstice Submarine][17] universe in a thrilling competition of strategy and guile. Make your best attempt to steal the fork of the other team while defending your fork from being stolen by your opponent and his clone!

![Live Gameplay][26]

## Game Design Notes

When I started putting together Solstice Sub: CTF, I had a few design goals in mind. I wanted to make a game that was:

  - Playable in a web browser on any device, whether it be desktop, tablet or phone.
  - Multiplayer across any permutation of devices.
  - Architected to share as much code across singleplayer and multiplayer as possible.
  - Part of the [Solstice Submarine][17] universe, which I contribute to with [Donna Almendrala][19] every holiday season.

I quickly settled on the idea of a turn-based game, as that seemed to lend itself to the simplest multiplayer architecture. After spending some time thinking about turn-based multiplayer games that I admire, I decided that the experience should be similar to the multiplayer of one of my favorite games, ["Legend of Zelda: Phantom Hourglass."][18] I figured that gameplay would be symmetrical for the first playable version. I had a mind to add random powerups, but felt that it would be best to stick to shooting for a basic game first.


## Technical Highlights

Solstice Submarine: CTF is nearing completion of basic game play. Here are some technical achievements that I am proud of:

  - Viewport scales responsively to accomodate for both pixel density and screen size.
  - Renderer only redraws regions of the scene graph that have actually changed.
  - Singleplayer is structured identically to multiplayer, thanks to a client class stubbed out with AI logic.
  - Picking, pathing, fog of war, sprite animation, scene graph and other engine features all written from scratch.
  - Game maps are generated from an interpreted JSON configuration.

## Art Direction

The Solstice Submarine is a yearly comic / digital experience that [Donna Almendrala][19] and I work on together, but Donna is the true artist between the two of us. She draws and screen prints the entire comic herself, and is also responsible for the amazing artistic panels on the left, right and bottom sides of the game viewport. [A digital copy of this year's Soltice Submarine mini-comic][22] has been included in this repository courtesy of Donna.

All of the sprites used in the game are original artwork by both Donna and me:

![Solstice Submarine Sprite Sheet][25]

## Running Locally

Currently the only server dependency is [Node.js][21]. After you have installed Node.js, clone this repository and run the following command in the repository root:

```sh
npm install
```

If you are hacking on the code, you might also want to install grunt.js and run:

```sh
grunt watch
```

Which will automatically handle compiling JavaScript and templates. To start the server, run:

```sh
node ./lib/server.js
```

## Supporting Technologies

This project wouldn't be possible without the following supporting code, assets, tools and frameworks:

  - [Three.js][0]
  - [Backbone.js][1]
  - [Underscore.js][2]
  - [Lodash.js][3]
  - [Require.js][4]
  - [jQuery][5]
  - [Modernizr][6]
  - [Handlebars][7]
  - [Q][8]
  - [Tween.js][9]
  - [Stats.js][10]
  - Bitmap font from [Spicypixel.net][11]
  - [Express][12]
  - [Express Persona][13]
  - [Grunt][14]
  - [Socket.io][15]
  - [AMDefine][16]
  - [Normalize.css][23]
  - [HTML5 Boilerplate][24]

I would like to make a special call out to Three.js. I ended up not using Three.js for this game, but I spent a while trying to come up with a good approach to a 2D / 3D hybrid engine. Three.js is a really cool library, and even though I ended up not using it, I adapted the vector, rectangle and clock classes for use in my own code base.

[0]: http://mrdoob.github.com/three.js/ "Three.js"
[1]: http://documentcloud.github.com/backbone/ "Backbone.js"
[2]: http://documentcloud.github.com/underscore/ "Underscore.js"
[3]: http://lodash.com/ "Lo-dash"
[4]: http://requirejs.org/ "Require.js"
[5]: http://jquery.com/ "jQuery"
[6]: http://modernizr.com/ "Modernizr"
[7]: http://handlebarsjs.com/ "Handlebars"
[8]: http://documentup.com/kriskowal/q/ "Q"
[9]: https://github.com/sole/tween.js/ "Tween.js"
[10]: https://github.com/mrdoob/stats.js "Stats.js"
[11]: http://www.spicypixel.net/2008/01/16/fontpack-royalty-free-bitmap-fonts/ "Spicypixel.net Free Bitmap Fonts"
[12]: http://expressjs.com/ "Express: Web Application Framework"
[13]: https://github.com/jbuck/express-persona "Express Persona"
[14]: http://gruntjs.com/ "Grunt"
[15]: http://socket.io/ "Socket.io"
[16]: https://github.com/jrburke/amdefine "AMDefine"
[17]: http://solsticesub.com/ "Solstice Submarine"
[18]: http://en.wikipedia.org/wiki/Phantom_Hourglass#Gameplay "Wikipedia: Phantom Hourglass Gameplay"
[19]: http://donnaalmendrala.name/ "Donna Alamendrala: Cartoonist Extraordinaire"
[20]: https://raw.github.com/cdata/solstice-submarine-ctf/master/static/assets/images/logo.png "Solstice Submarine: Capture the Fork"
[21]: http://nodejs.org/ "Node.js"
[22]: https://raw.github.com/cdata/solstice-submarine-ctf/master/solstice-submarine-3-digital-comic.pdf "Solstice Submarine 3 Digital Comic"
[23]: http://necolas.github.com/normalize.css/ "Normalize.css"
[24]: http://html5boilerplate.com/ "HTML5 Boilerplate"
[25]: https://raw.github.com/cdata/solstice-submarine-ctf/master/static/assets/images/all-sprites.png "Solstice Submarine Sprite Sheet"
[26]: https://raw.github.com/cdata/solstice-submarine-ctf/master/static/assets/images/screenshot.png "Live Gameplay"
