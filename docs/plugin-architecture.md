# Plugin Architecture

## Objective

Render a constrained JSON poster spec into native Figma nodes so the result remains editable.

## Core Decision

Do not translate from HTML. Do not import screenshots of layouts. The plugin should create Figma frames, text nodes, shapes, and later image fills directly with the Plugin API.

## Data Flow

1. User asks Codex for a poster or screenshot.
2. Codex returns JSON that matches `codex-poster-prompt.md`.
3. User pastes JSON into the plugin UI.
4. The plugin validates the payload.
5. The runtime creates a frame and appends native child nodes in layer order.
6. The user edits the result manually in Figma.

## Runtime Note

The current plugin uses an embedded HTML UI string inside `code.js` so it can run directly from a raw manifest import without a bundling step.

The standalone `ui.html` file is kept as a reference UI and can be restored later if the project moves to a build step.

## Renderer Boundaries

### Implemented in MVP

- Root payload validation
- Canvas frame creation
- Background fill
- Text rendering
- Rectangle rendering
- Ellipse rendering
- Line rendering
- `imageRef` registry backed by selected Figma nodes
- Error reporting to the UI

### Deferred

- Direct file import for screenshots and logos
- Gradient fills
- Group and nested frame support
- Region-based layout
- Template-aware composition helpers
- Incremental re-render and diffing

## Why The Schema Is Constrained

The model needs a narrow output target. If the schema is too loose, the plugin becomes a partial design engine and reliability collapses.

The first schema intentionally favors:

- deterministic coordinates
- a short allowed type list
- explicit naming
- limited typography variation

## Next Step Priorities

1. Add `imageRef` resolution through selected nodes or plugin-managed assets.
2. Add optional `rotation`, `stroke`, and `shadow`.
3. Add preset-aware safe area helpers.
4. Add template modes for:
   - App Store screenshot
   - Instagram story
   - Instagram square
5. Add update behavior so re-renders replace previous output instead of duplicating it.
