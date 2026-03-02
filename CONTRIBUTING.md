# Contributing

## Development Notes

- This plugin is intended for the Figma desktop app.
- The runtime entrypoint is [code.js](/Users/anthonyaguilar/Documents/figma_plugin/code.js).
- The plugin currently uses an embedded UI string in `code.js` for compatibility with raw manifest imports.
- [ui.html](/Users/anthonyaguilar/Documents/figma_plugin/ui.html) is kept as a standalone UI reference/prototype.

## Local Testing

1. Open Figma desktop.
2. Import the plugin from [manifest.json](/Users/anthonyaguilar/Documents/figma_plugin/manifest.json).
3. Run the plugin from `Plugins -> Development`.
4. Test both:
   - text-and-shape rendering
   - screenshot registration with `imageRef`

## Contribution Areas

Useful improvements include:

- stronger layout templates
- App Store-specific composition presets
- direct image file import
- re-render/update behavior
- richer style support such as gradients, shadows, and strokes
- better schema validation and error messages

## Pull Requests

- Keep the JSON contract stable unless the change is intentional and documented.
- Update [README.md](/Users/anthonyaguilar/Documents/figma_plugin/README.md) if the workflow changes.
- Update [codex-poster-prompt.md](/Users/anthonyaguilar/Documents/figma_plugin/codex-poster-prompt.md) if schema fields change.
