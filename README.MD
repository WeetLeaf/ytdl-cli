# CLI Youtuble download

Download youtube music or playlist in mp3 format.  
If the playlist is in private, it won’t work. But it will fallback to the single video of the link.  
If the URL contains the param "list" it will download the entire playlist.  

# Install

```bash
npm i -g ytdl-utils-cli
```

## Usage

```bash
# First time
ytdl https://www.youtube.com/watch?v=bM7SZ5SBzyY --config /User/[username]/Downloads

# Once the download path is configured
ytdl https://www.youtube.com/watch?v=uGKYFWBVxJY
```

## Install local

To test a development.

```bash
yarn
yarn local
ytdl https://www.youtube.com/watch?v=uGKYFWBVxJY
```
