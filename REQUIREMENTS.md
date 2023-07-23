# Assessment 2

# Overview

For this assessment, students are tasked with developing a front-end Angular application that interfaces with [Spotify's API](https://developer.spotify.com/) in order to get genres, artists, and **sample** songs. The user will then be able to listen to songs and guess which artist created it.

## Requirements

##### The _Business Requirements_ are located in the [REQUIREMENTS.md](REQUIREMENTS.md) file.

The specification for this assessment is written in a way that resembles the kind of informal requirements document you may recieve on a client site or the level of detail you may have after a few meetings with stakeholders/product owners. It is written from a non-technical viewpoint with no regards for the technical requirements that the project may incur.

When given large problems like this, it is easy to try to start coding immediately. This may not be the best approach to solving large problems - it can often make you waste a lot of time because you'll start solving problems before you really know what problems you need to solve. In order to get a sense for what is required technically, it is recommended that you first go through the **_Business Requirements_** thoroughly and try to envision the end goal from a business point of view. After that, go through it again from a technical perspective and begin mapping out mentally and physically (on paper if you'd like) the things you'll need to use and understand. For this project, these things may include: Missing requirements that you need to clarify, Spotify endpoints, A skeleton/wireframe of your components, routes, required business logic for selecting random artists within a genre, how to play a song in the browser, and so on. Note that these things don't require you to start coding - they require you to **research** and **read documentation**.

---

## Technical Guidance

##### The following will be an unorganized collection of technical information that could be helpful for this assessment.

When debugging or trying to solve problems within the `Angular` and `TypeScript` ecosystem, it will be helpful to include `angular` or `typescript` in your google searches. For example, searching for `web playback typescript` gives me [`howler.js`](https://howlerjs.com/) which seems useful for playing audio. Learning how to _google well_ is one of the most important skills to hone as a developer - especially when dealing with a quickly changing ecosystem.

When getting a `track` from Spotify's API, it gives you a `preview_url` which will be needed to play a **sample** for a given song.

To simplify authenticating with Spotify's API, a skeleton is given which calls a service in the cloud to get a `spotify_access_token`. An example request using this token is provided in the project.

`services/api.ts` has been provided as a convenience wrapper around `fetch`

The code in the `services/api.ts` file should not need modification. If you feel that you need to modify it, please speak with an instructor about it first.

URL encoding converts characters into a format that can be transmitted over the Internet. The url encoding for a 'space' character is '%20'.

This assessment is large and you should use your time wisely. UI design and styling should be your LAST priority. Get the majority of the functionality in the application built along with a basic minimal wireframe of your components. Once you've done that and it _works_, begin thinking about a minimal and clean UI. A business/product owner/stakeholder would much rather have something that doesn't look pretty, but works, than have something that looks great but doesn't do anything.

# Business Requirements for Who's Who

**_These requirements are subject to change_**

---

## Requirements Overview

The business would like for you to build a prototype 'game' idea that we had. It's basically a music/artist guessing game. The user will be displayed with 1-3 songs and 2-4 artists pictures/names. The user will be able to play the songs and then they'll have to guess which single artist the song or songs belong to. Don't worry to much about a fancy design. Make it look _good enough_ for a demo. We have designers that we can bring in later once you create the prototype.

The 'landing' page should probably be a 'configuration' page which lets them pick a genre, the number of songs per guess, and the number of artists to guess from. Once they select their game settings/configuration, it should then take them to the 'game' page. I'll leave it up to you to decide how many 'guesses' the user gets before they lose. If you have time, try to make it mobile friendly for the demo. Also, as a final touch, save their settings that they select on the configuration page so if they leave the page and come back, they won't have to reselect everything. By default, select 1 song and 2 artists.

We don't have the money to pay for any premium music service, so just use Spotify. I believe they have a free/open API. Just use the server that other guy set up that authenticates with Spotify and gives you the token.
