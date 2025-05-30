const express = require("express");
const { addonBuilder } = require("stremio-addon-sdk");
const { searchMovies, getStreamingLink } = require("./scraper");
const manifest = require("./manifest.json");

const builder = new addonBuilder(manifest);

// Catalog handler
builder.defineCatalogHandler(async ({ id, extra }) => {
  const searchTerm = extra?.search;
  if (id === "ibomma-telugu" && searchTerm) {
    const results = await searchMovies(searchTerm);
    return { metas: results };
  }
  return { metas: [] };
});

// Stream handler
builder.defineStreamHandler(async ({ id }) => {
  if (id.startsWith("ibomma:")) {
    const streams = await getStreamingLink(id);
    return { streams };
  }
  return { streams: [] };
});

// 🔥 Start Express server
const app = express();
const port = process.env.PORT || 7000;

const addonInterface = builder.getInterface();

app.get("/manifest.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(addonInterface.manifest);
});

app.get("/catalog/:type/:id/:extra?.json?", async (req, res) => {
  try {
    const catalog = await addonInterface.get("catalog", req.params);
    res.setHeader("Content-Type", "application/json");
    res.send(catalog);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

app.get("/stream/:type/:id.json", async (req, res) => {
  try {
    const stream = await addonInterface.get("stream", req.params);
    res.setHeader("Content-Type", "application/json");
    res.send(stream);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

app.get("/", (_req, res) => {
  res.send("✅ iBOMMA Telugu Addon is running. Use it via Stremio.");
});

app.listen(port, () => {
  console.log(`✅ Addon running at http://localhost:${port}`);
});
