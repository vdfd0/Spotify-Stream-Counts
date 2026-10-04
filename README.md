# Spotify Stream Counts

A Chrome/Edge extension that shows per-track stream counts in the Spotify Web Player, similar to the desktop app.

## Install

1. Download or clone this repo.
2. Open `chrome://extensions` (or `edge://extensions`) and enable **Developer mode**.
3. Click **Load unpacked** and select the folder that contains `manifest.json`.
4. Open an album page on [open.spotify.com](https://open.spotify.com). Reload the tab if it was already open.

## How it works

The web player already receives play counts in its own data requests. The extension reads those responses in the page and shows each count next to the matching track row. It needs no login, API key, or extra permissions.

## Limitations

- Counts appear on album pages. Artist pages already show play counts natively, so the extension does nothing there.
- Playlists don't include play counts in Spotify's data, so none are shown.
- It depends on Spotify's unofficial, undocumented data format and page layout, so it may break whenever Spotify changes them.
- If the count overlaps other controls on your screen, adjust the `gap` value in `content.js`.

## Disclaimer

This is an unofficial personal project. It is not affiliated with or endorsed by Spotify. Spotify is a trademark of Spotify AB.
