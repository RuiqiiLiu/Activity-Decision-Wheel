# Decide For Me

A local spinning wheel for resolving small everyday choices. No external services or dependencies.

## Files

- `index.html` — page structure; links to the two files below.
- `style.css` — colors, layout, and responsive styling.
- `script.js` — option editing, browser-generated randomness, and animated spins.

Keep all three files in the same folder. Each spin gives every filled option an equal chance; repeats are possible. Editing is paused during a spin to keep the displayed wheel and result in sync.

## Run it

Open `index.html` directly in a modern browser, or serve this folder locally:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.

Enter or edit options, add more if needed, and select **Spin the wheel**. The result appears after the wheel finishes spinning.
