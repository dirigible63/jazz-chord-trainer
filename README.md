# Jazz Chord Trainer

A small installable PWA for isolated jazz-chord recall.

## Current library
- Autumn Leaves · Current Voicings (default)
- Autumn Leaves · Foundation Voicings

## Run / host
Because the app uses a service worker and fetches its chord library, serve the folder over HTTPS (recommended) or localhost.
For GitHub Pages: create a repository, upload these files at the repository root, enable Pages from the main branch, then open the Pages URL in Chrome on Android and choose Add to Home screen / Install app.

## Expanding the library
Edit chord-library.json. Each practice set has an `items` array. An item can contain:
- symbol: prompt shown to the player
- lh: notes shown low-to-high for left hand
- rh: notes shown low-to-high for right hand
- promptDetail: optional instruction such as "2nd inversion"
- note: optional reveal note
- tags: optional metadata

This structure supports future repertoire, alternate voicings and inversion-specific prompts.
