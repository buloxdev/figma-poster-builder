const UI_HTML = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <style>
      :root {
        color-scheme: dark;
        --bg: #0f172a;
        --panel: #111827;
        --border: #243041;
        --text: #e5edf9;
        --muted: #94a3b8;
        --accent: #38bdf8;
        --danger: #f87171;
        --success: #4ade80;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 16px;
        background: linear-gradient(180deg, #0b1120 0%, var(--bg) 100%);
        color: var(--text);
        font: 13px/1.45 Inter, system-ui, sans-serif;
      }
      .panel {
        background: rgba(17, 24, 39, 0.96);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 14px;
      }
      h1 { margin: 0 0 6px; font-size: 18px; }
      p { margin: 0 0 12px; color: var(--muted); }
      textarea, input {
        width: 100%;
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 10px 12px;
        background: #020617;
        color: var(--text);
      }
      textarea {
        min-height: 290px;
        resize: vertical;
        font: 12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace;
      }
      .row, .actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
        flex-wrap: wrap;
      }
      button {
        appearance: none;
        border: 0;
        border-radius: 10px;
        padding: 10px 14px;
        font: inherit;
        font-weight: 600;
        cursor: pointer;
      }
      .primary { background: linear-gradient(135deg, #0ea5e9, var(--accent)); color: #03111d; }
      .secondary { background: #1e293b; color: var(--text); }
      .status { min-height: 20px; margin-top: 12px; color: var(--muted); }
      .status.error { color: var(--danger); }
      .status.success { color: var(--success); }
      .asset-list {
        margin-top: 12px;
        border: 1px solid var(--border);
        border-radius: 12px;
        background: rgba(2, 6, 23, 0.76);
        overflow: hidden;
      }
      .asset-header, .asset-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
      }
      .asset-header { border-bottom: 1px solid var(--border); }
      .asset-item + .asset-item { border-top: 1px solid rgba(36, 48, 65, 0.7); }
      .asset-meta { min-width: 0; }
      .asset-ref { font-weight: 700; }
      .asset-detail {
        color: var(--muted);
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    </style>
  </head>
  <body>
    <div class="panel">
      <h1>Poster Builder</h1>
      <p>Paste JSON and render editable Figma layers.</p>
      <div class="row">
        <input id="imageRef" type="text" placeholder="imageRef, e.g. hybrid_dashboard">
        <button class="secondary" id="registerAsset">Register Selection</button>
      </div>
      <div class="asset-list">
        <div class="asset-header">
          <strong>Registered Assets</strong>
          <button class="secondary" id="refreshAssets">Refresh</button>
        </div>
        <div id="assetItems"></div>
      </div>
      <textarea id="payload" spellcheck="false"></textarea>
      <div class="actions">
        <button class="primary" id="render">Render Poster</button>
        <button class="secondary" id="sample">Load Sample</button>
        <button class="secondary" id="cancel">Close</button>
      </div>
      <div class="status" id="status"></div>
    </div>
    <script>
      var samplePayload = {
        schemaVersion: 1,
        name: "Hybrid Build Story",
        canvas: {
          preset: "instagram_story",
          width: 1080,
          height: 1920,
          background: "#09111F"
        },
        safeAreas: {
          top: 140,
          right: 80,
          bottom: 180,
          left: 80
        },
        layers: [
          { type: "ellipse", name: "Ambient Blue Glow", x: 160, y: 120, width: 760, height: 760, color: "#2563EB", opacity: 0.18 },
          { type: "text", name: "Story Headline", content: "Train hard.\\nRecover better.\\nStay consistent.", font: "Inter", weight: "Bold", size: 94, color: "#F8FAFC", x: 80, y: 180, width: 860, align: "left", letterSpacing: -2, lineHeight: 100 },
          { type: "text", name: "Support Copy", content: "Hybrid Build helps you balance load, recovery, and progress without guessing.", font: "Inter", weight: "Regular", size: 32, color: "#9FB0D1", x: 80, y: 520, width: 840, align: "left", lineHeight: 46 },
          { type: "rect", name: "Bottom Card", x: 80, y: 1220, width: 920, height: 520, color: "#101A2B", opacity: 1, cornerRadius: 36 },
          { type: "text", name: "Card Title", content: "Built for real life", font: "Inter", weight: "SemiBold", size: 42, color: "#F8FAFC", x: 128, y: 1280, width: 760, align: "left" },
          { type: "line", name: "Card Divider", x: 128, y: 1360, width: 824, color: "#243247", strokeWeight: 2 }
        ]
      };

      var payload = document.getElementById("payload");
      var status = document.getElementById("status");
      var imageRefInput = document.getElementById("imageRef");
      var assetItems = document.getElementById("assetItems");

      document.getElementById("sample").addEventListener("click", function () {
        payload.value = JSON.stringify(samplePayload, null, 2);
        setStatus("Sample JSON loaded.", "success");
      });

      document.getElementById("render").addEventListener("click", function () {
        parent.postMessage({ pluginMessage: { type: "render-poster", payload: payload.value } }, "*");
        setStatus("Rendering...", "");
      });

      document.getElementById("registerAsset").addEventListener("click", function () {
        parent.postMessage({ pluginMessage: { type: "register-asset", imageRef: imageRefInput.value.trim() } }, "*");
      });

      document.getElementById("refreshAssets").addEventListener("click", function () {
        parent.postMessage({ pluginMessage: { type: "refresh-assets" } }, "*");
      });

      document.getElementById("cancel").addEventListener("click", function () {
        parent.postMessage({ pluginMessage: { type: "cancel" } }, "*");
      });

      window.onmessage = function (event) {
        var msg = event.data.pluginMessage;
        if (!msg) return;
        if (msg.type === "render-error") setStatus(msg.message, "error");
        if (msg.type === "render-success") setStatus(msg.message, "success");
        if (msg.type === "asset-registry") {
          renderAssetRegistry(msg.assets || {});
          if (msg.message) setStatus(msg.message, "success");
        }
      };

      payload.value = JSON.stringify(samplePayload, null, 2);
      parent.postMessage({ pluginMessage: { type: "ui-ready" } }, "*");

      function setStatus(message, kind) {
        status.textContent = message;
        status.className = "status" + (kind ? " " + kind : "");
      }

      function renderAssetRegistry(assets) {
        var entries = Object.entries(assets);
        if (!entries.length) {
          assetItems.innerHTML = '<div class="asset-item"><div class="asset-detail">No assets registered yet.</div></div>';
          return;
        }
        assetItems.innerHTML = "";
        entries.forEach(function (entry) {
          var ref = entry[0];
          var asset = entry[1];
          var row = document.createElement("div");
          row.className = "asset-item";
          var meta = document.createElement("div");
          meta.className = "asset-meta";
          var refEl = document.createElement("div");
          refEl.className = "asset-ref";
          refEl.textContent = ref;
          var detailEl = document.createElement("div");
          detailEl.className = "asset-detail";
          detailEl.textContent = asset.name + " · " + asset.type + " · " + asset.width + "x" + asset.height;
          meta.appendChild(refEl);
          meta.appendChild(detailEl);
          var removeButton = document.createElement("button");
          removeButton.className = "secondary";
          removeButton.textContent = "Remove";
          removeButton.addEventListener("click", function () {
            parent.postMessage({ pluginMessage: { type: "remove-asset", imageRef: ref } }, "*");
          });
          row.appendChild(meta);
          row.appendChild(removeButton);
          assetItems.appendChild(row);
        });
      }
    </script>
  </body>
</html>`;

figma.showUI(UI_HTML, { width: 420, height: 640 });

const CANVAS_PRESETS = {
  instagram_square: { width: 1080, height: 1080 },
  instagram_story: { width: 1080, height: 1920 },
  instagram_landscape: { width: 1080, height: 566 },
  app_store_iphone_15_pro_max: { width: 1290, height: 2796 },
  twitter_banner: { width: 1500, height: 500 },
  landscape_banner: { width: 1920, height: 1080 }
};
const ASSET_REGISTRY_KEY = "posterAssetRegistry";

figma.ui.onmessage = async (msg) => {
  if (msg.type === "ui-ready") {
    figma.ui.postMessage({
      type: "asset-registry",
      assets: loadAssetRegistry()
    });
  }

  if (msg.type === "render-poster") {
    try {
      const payload = JSON.parse(msg.payload);
      const spec = validatePosterSpec(payload);
      const frame = await renderPoster(spec);
      figma.currentPage.selection = [frame];
      figma.viewport.scrollAndZoomIntoView([frame]);
      figma.ui.postMessage({
        type: "render-success",
        message: `Rendered "${frame.name}" with ${frame.children.length} layers.`
      });
    } catch (error) {
      figma.ui.postMessage({
        type: "render-error",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  if (msg.type === "register-asset") {
    try {
      const registry = registerSelectedAsset(msg.imageRef);
      figma.ui.postMessage({
        type: "asset-registry",
        assets: registry,
        message: `Registered "${msg.imageRef}" from the current selection.`
      });
    } catch (error) {
      figma.ui.postMessage({
        type: "render-error",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  if (msg.type === "remove-asset") {
    try {
      const registry = removeRegisteredAsset(msg.imageRef);
      figma.ui.postMessage({
        type: "asset-registry",
        assets: registry,
        message: `Removed "${msg.imageRef}" from the asset registry.`
      });
    } catch (error) {
      figma.ui.postMessage({
        type: "render-error",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  if (msg.type === "refresh-assets") {
    figma.ui.postMessage({
      type: "asset-registry",
      assets: loadAssetRegistry()
    });
  }

  if (msg.type === "cancel") {
    figma.closePlugin();
  }
};

function validatePosterSpec(spec) {
  if (!spec || typeof spec !== "object" || Array.isArray(spec)) {
    throw new Error("Root payload must be a JSON object.");
  }

  if (spec.schemaVersion !== 1) {
    throw new Error("schemaVersion must be 1.");
  }

  if (!spec.name || typeof spec.name !== "string") {
    throw new Error("name is required.");
  }

  if (!spec.canvas || typeof spec.canvas !== "object") {
    throw new Error("canvas is required.");
  }

  const { preset, width, height, background } = spec.canvas;
  if (!preset || !CANVAS_PRESETS[preset]) {
    throw new Error("canvas.preset is missing or unsupported.");
  }

  const presetSize = CANVAS_PRESETS[preset];
  if (width !== presetSize.width || height !== presetSize.height) {
    throw new Error(
      `canvas width/height must match preset ${preset} (${presetSize.width}x${presetSize.height}).`
    );
  }

  if (!isHexColor(background)) {
    throw new Error("canvas.background must be a hex color.");
  }

  if (!spec.safeAreas || typeof spec.safeAreas !== "object") {
    throw new Error("safeAreas is required.");
  }

  for (const side of ["top", "right", "bottom", "left"]) {
    if (typeof spec.safeAreas[side] !== "number") {
      throw new Error(`safeAreas.${side} must be a number.`);
    }
  }

  if (!Array.isArray(spec.layers)) {
    throw new Error("layers must be an array.");
  }

  spec.layers.forEach((layer, index) => validateLayer(layer, index));
  return spec;
}

function validateLayer(layer, index) {
  if (!layer || typeof layer !== "object" || Array.isArray(layer)) {
    throw new Error(`Layer ${index + 1} must be an object.`);
  }

  if (!layer.type || typeof layer.type !== "string") {
    throw new Error(`Layer ${index + 1} is missing type.`);
  }

  if (!layer.name || typeof layer.name !== "string") {
    throw new Error(`Layer ${index + 1} is missing name.`);
  }

  const supportedTypes = ["text", "rect", "ellipse", "line", "image"];
  if (!supportedTypes.includes(layer.type)) {
    throw new Error(`Layer "${layer.name}" uses unsupported type "${layer.type}".`);
  }

  if (typeof layer.x !== "number" || typeof layer.y !== "number") {
    throw new Error(`Layer "${layer.name}" must include numeric x and y.`);
  }

  if (layer.type === "text") {
    for (const field of ["content", "font", "weight", "size", "color"]) {
      if (layer[field] === undefined || layer[field] === null || layer[field] === "") {
        throw new Error(`Text layer "${layer.name}" is missing ${field}.`);
      }
    }
    if (!isHexColor(layer.color)) {
      throw new Error(`Text layer "${layer.name}" color must be hex.`);
    }
  }

  if (layer.type === "rect" || layer.type === "ellipse") {
    for (const field of ["width", "height", "color"]) {
      if (typeof layer[field] !== "number" && field !== "color") {
        throw new Error(`Shape layer "${layer.name}" is missing ${field}.`);
      }
      if (field === "color" && !isHexColor(layer.color)) {
        throw new Error(`Shape layer "${layer.name}" color must be hex.`);
      }
    }
  }

  if (layer.type === "line") {
    if (typeof layer.width !== "number") {
      throw new Error(`Line layer "${layer.name}" is missing width.`);
    }
    if (!isHexColor(layer.color)) {
      throw new Error(`Line layer "${layer.name}" color must be hex.`);
    }
  }

  if (layer.type === "image" && typeof layer.imageRef !== "string") {
    throw new Error(`Image layer "${layer.name}" is missing imageRef.`);
  }

  if (layer.type === "image") {
    if (typeof layer.width !== "number" || typeof layer.height !== "number") {
      throw new Error(`Image layer "${layer.name}" must include width and height.`);
    }
  }
}

async function renderPoster(spec) {
  const frame = figma.createFrame();
  frame.name = spec.name;
  frame.resize(spec.canvas.width, spec.canvas.height);
  frame.fills = [solidPaint(spec.canvas.background, 1)];
  frame.clipsContent = false;

  for (const layer of spec.layers) {
    const node = await createLayerNode(layer);
    frame.appendChild(node);
  }

  return frame;
}

async function createLayerNode(layer) {
  switch (layer.type) {
    case "text":
      return createTextNode(layer);
    case "rect":
      return createRectNode(layer);
    case "ellipse":
      return createEllipseNode(layer);
    case "line":
      return createLineNode(layer);
    case "image":
      return createImageNode(layer);
    default:
      throw new Error(`Unsupported layer type "${layer.type}".`);
  }
}

async function createTextNode(layer) {
  await figma.loadFontAsync({ family: layer.font, style: layer.weight });

  const text = figma.createText();
  text.name = layer.name;
  text.fontName = { family: layer.font, style: layer.weight };
  text.characters = layer.content;
  text.fontSize = layer.size;
  text.fills = [solidPaint(layer.color, 1)];
  text.x = layer.x;
  text.y = layer.y;

  if (typeof layer.width === "number") {
    text.textAutoResize = "HEIGHT";
    text.resize(layer.width, text.height);
  } else {
    text.textAutoResize = "WIDTH_AND_HEIGHT";
  }

  if (typeof layer.letterSpacing === "number") {
    text.letterSpacing = { value: layer.letterSpacing, unit: "PIXELS" };
  }

  if (typeof layer.lineHeight === "number") {
    text.lineHeight = { value: layer.lineHeight, unit: "PIXELS" };
  }

  if (layer.align) {
    text.textAlignHorizontal = layer.align.toUpperCase();
  }

  return text;
}

function createRectNode(layer) {
  const rect = figma.createRectangle();
  rect.name = layer.name;
  rect.resize(layer.width, layer.height);
  rect.x = layer.x;
  rect.y = layer.y;
  rect.fills = [solidPaint(layer.color, layer.opacity)];
  if (typeof layer.cornerRadius === "number") {
    rect.cornerRadius = layer.cornerRadius;
  }
  return rect;
}

function createEllipseNode(layer) {
  const ellipse = figma.createEllipse();
  ellipse.name = layer.name;
  ellipse.resize(layer.width, layer.height);
  ellipse.x = layer.x;
  ellipse.y = layer.y;
  ellipse.fills = [solidPaint(layer.color, layer.opacity)];
  return ellipse;
}

function createLineNode(layer) {
  const line = figma.createRectangle();
  line.name = layer.name;
  line.resize(layer.width, typeof layer.strokeWeight === "number" ? layer.strokeWeight : 1);
  line.x = layer.x;
  line.y = layer.y;
  line.fills = [solidPaint(layer.color, 1)];
  return line;
}

function createImageNode(layer) {
  const registry = loadAssetRegistry();
  const asset = registry[layer.imageRef];

  if (!asset) {
    return createImagePlaceholderNode(layer, `Missing asset: ${layer.imageRef}`);
  }

  const sourceNode = figma.getNodeById(asset.nodeId);
  if (!sourceNode || !("clone" in sourceNode)) {
    return createImagePlaceholderNode(layer, `Asset not found: ${layer.imageRef}`);
  }

  const wrapper = figma.createFrame();
  wrapper.name = layer.name;
  wrapper.resize(layer.width, layer.height);
  wrapper.x = layer.x;
  wrapper.y = layer.y;
  wrapper.clipsContent = true;
  wrapper.fills = [];
  if (typeof layer.cornerRadius === "number") {
    wrapper.cornerRadius = layer.cornerRadius;
  }

  const clone = sourceNode.clone();
  wrapper.appendChild(clone);
  placeCloneInWrapper(clone, layer.width, layer.height);

  return wrapper;
}

function createImagePlaceholderNode(layer, reason) {
  const placeholder = figma.createRectangle();
  placeholder.name = `${layer.name} (image placeholder)`;
  placeholder.resize(layer.width, layer.height);
  placeholder.x = layer.x;
  placeholder.y = layer.y;
  placeholder.cornerRadius = typeof layer.cornerRadius === "number" ? layer.cornerRadius : 24;
  placeholder.fills = [solidPaint("#1F2937", 1)];
  placeholder.strokes = [solidPaint("#64748B", 1)];
  placeholder.strokeWeight = 2;
  placeholder.dashPattern = [12, 8];
  placeholder.setPluginData("imageRef", layer.imageRef);
  if (reason) {
    placeholder.setPluginData("assetError", reason);
  }
  return placeholder;
}

function placeCloneInWrapper(node, targetWidth, targetHeight) {
  if (!("width" in node) || !("height" in node)) {
    node.x = 0;
    node.y = 0;
    return;
  }

  const width = node.width || targetWidth;
  const height = node.height || targetHeight;
  const scale = Math.min(targetWidth / width, targetHeight / height);
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  resizeNode(node, scaledWidth, scaledHeight);
  node.x = (targetWidth - scaledWidth) / 2;
  node.y = (targetHeight - scaledHeight) / 2;
}

function resizeNode(node, width, height) {
  if ("resizeWithoutConstraints" in node) {
    node.resizeWithoutConstraints(width, height);
    return;
  }

  if ("resize" in node) {
    node.resize(width, height);
  }
}

function loadAssetRegistry() {
  const raw = figma.root.getPluginData(ASSET_REGISTRY_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return parsed;
  } catch (error) {
    return {};
  }
}

function saveAssetRegistry(registry) {
  figma.root.setPluginData(ASSET_REGISTRY_KEY, JSON.stringify(registry));
  return registry;
}

function registerSelectedAsset(imageRef) {
  if (typeof imageRef !== "string" || !/^[a-z0-9_-]+$/i.test(imageRef.trim())) {
    throw new Error("imageRef must use letters, numbers, dashes, or underscores.");
  }

  const selection = figma.currentPage.selection;
  if (selection.length !== 1) {
    throw new Error("Select exactly one node to register as an image asset.");
  }

  const [node] = selection;
  if (!("clone" in node) || !("width" in node) || !("height" in node)) {
    throw new Error("The selected node cannot be used as an image asset.");
  }

  const registry = loadAssetRegistry();
  registry[imageRef.trim()] = {
    nodeId: node.id,
    name: node.name,
    type: node.type,
    width: node.width,
    height: node.height
  };
  return saveAssetRegistry(registry);
}

function removeRegisteredAsset(imageRef) {
  const registry = loadAssetRegistry();
  delete registry[imageRef];
  return saveAssetRegistry(registry);
}

function solidPaint(hex, opacity) {
  const { r, g, b } = hexToRgb(hex);
  return {
    type: "SOLID",
    color: { r, g, b },
    opacity: typeof opacity === "number" ? opacity : 1
  };
}

function isHexColor(value) {
  return typeof value === "string" && /^#([0-9a-fA-F]{6})$/.test(value);
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  return {
    r: parseInt(normalized.slice(0, 2), 16) / 255,
    g: parseInt(normalized.slice(2, 4), 16) / 255,
    b: parseInt(normalized.slice(4, 6), 16) / 255
  };
}
