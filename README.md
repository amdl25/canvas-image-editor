# Canvas Image Editor

Browser-based image editor built with plain HTML5, CSS and JavaScript on top of the `<canvas>` element. No build step and no dependencies.

## Features
- Load an image by dragging and dropping it onto the page
- Select an area with the mouse and preview the selection on a second canvas, with a button to clear it
- Add text on the image, choosing the text, size, color and position
- Resize the image to a new width and height
- Effects: grayscale, sepia and threshold, applied pixel by pixel
- Live histogram of the image, drawn on its own canvas

## Getting started

Open `index.html` in a modern browser, then drag an image onto the page. The `media` folder contains a few sample images to try.

```
index.html   page structure
style.css    layout
script.js    canvas logic: drag and drop, selection, text, resize, effects, histogram
media/       sample images
```

## Notes
- The interface labels are in Romanian.
- The sample images in `media` come from third-party sources and are not covered by any license of this project.
