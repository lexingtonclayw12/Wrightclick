# Instagram letterbox preset (horizontal sermon clip on a vertical canvas)

Notes for adding a third output preset to the sermon clipping skill, alongside
the existing 16:9 and full-bleed vertical presets.

Status: reviewed, **not executed** — ffmpeg was unavailable in the session where
this was written, so the filter chain has not been run against a real file.
Validate on one clip before wiring it into the skill.

## The idea

Instagram has no "horizontal Reel" mode. The Reels container is always 9:16;
you only choose what fills it. The letterbox look is a normal vertical Reel with
16:9 footage baked onto a 1080x1920 canvas over black bars.

The bars are the point, not a side effect: they are caption real estate. Captions
sit *below* the picture instead of on top of the speaker's face, which is the main
advantage over the full-bleed vertical preset.

## Two routes

**Native 1920x1080 upload.** Instagram accepts it and letterboxes it. You lose
control of the cover frame, and the profile grid center-crops a 9:16 slice, so
the clip shows up as a sliver.

**Pre-baked 1080x1920 canvas (use this).** Bars are real pixels. Nothing is
auto-cropped, the cover frame is yours, captions are positionable.

## Canvas math at 1080x1920

| Source treatment   | Content size | Bars if centered |
|--------------------|--------------|------------------|
| Native 16:9        | 1080x608     | 656 / 656        |
| Side-crop to 3:2   | 1080x720     | 600 / 600        |
| Side-crop to 4:3   | 1080x810     | 555 / 555        |

Prefer no side-crop for sermons, or keep it gentle. A crop to 3:2 removes ~16%
from each edge — acceptable on a tight shot of the speaker, destructive on a wide
stage shot with lyric screens, lower-thirds, or an off-center pulpit.

## Layout

Shift the content band up ~180px rather than centering it:

- Content band: y 470–1078 (1080x608, native 16:9)
- Title band:   y 150–440  (clear of Instagram's top chrome)
- Caption band: y 1110–1490

Instagram UI to stay clear of: bottom ~420px (caption, audio pill, profile row),
right rail ~200px (like / comment / share / more), top ~150px.

## ffmpeg

```bash
ffmpeg -ss 00:12:34 -to 00:13:10 -i sermon.mp4 \
  -vf "crop=ih*16/9:ih,scale=1080:-2,\
pad=1080:1920:(ow-iw)/2:470:black,setsar=1,\
subtitles=clip.srt:force_style='Fontsize=52,Alignment=2,MarginV=430',\
format=yuv420p" \
  -r 30 -c:v libx264 -preset slow -crf 19 -maxrate 10M -bufsize 20M \
  -c:a aac -b:a 192k -ar 48000 -ac 2 \
  -movflags +faststart clip.mp4
```

Filter order is load-bearing: `crop -> scale -> pad -> subtitles`. Running
`subtitles` after `pad` makes caption coordinates canvas coordinates, so
`MarginV=430` parks text in the lower bar instead of over the video.

`crop=ih*16/9:ih` is a no-op on an already-16:9 source; it normalizes odd source
aspects. Use `crop=ih*3/2:ih` for the tighter, more zoomed-in look.

## Publishing

Same Graph API flow as the existing vertical preset:

1. Create container: `media_type=REELS` with a public HTTPS `video_url`
2. Poll `status_code` until `FINISHED`
3. `media_publish`

Requires an Instagram Business/Creator account, a linked Facebook Page, and the
`instagram_business_content_publish` scope. Set the cover explicitly via
`cover_url` (or `thumb_offset`) — with a pre-baked canvas the bars read as
intentional design in the grid.

## Caveat

Worship music inside a clip can trip Instagram's audio fingerprinting and get the
Reel muted or blocked, even though the sermon itself is original content. Trim
music beds outside the clip boundaries where possible.
