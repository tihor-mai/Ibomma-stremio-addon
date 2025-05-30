const express = require("express");
const { addonBuilder } = require("stremio-addon-sdk");
const { searchMovies, getStreamingLink } = require("./scraper");
const manifest = require("./manifest.json");

const builder = new addonBuilder(manifest);

// Catalog Handler
builder.defineCatalogHandler(async ({ id, extra }) => {
  const searchTerm = extra?.search;
  if (id === "ibomma-telugu" && searchTerm) {
    const results = await searchMovies(searchTerm);
    return { metas: results };
  }
  return { metas: [] };
});

// Stream Handler
builder.defineStreamHandler(async ({ id }) => {
  if (id.startsWith("ibomma:")) {
    const streams = await getStreamingLink(id);
    return { streams };
  }
  return { streams: [] };
});

const app = express();
const port = process.env.PORT || 7000;
const addonInterface = builder.getInterface();

// Serve Stremio Resources
app.get("/manifest.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(addonInterface.manifest);
});

app.get("/catalog/:type/:id/:extra?.json?", async (req, res) => {
  try {
    const result = await addonInterface.get("catalog", req.params);
    res.setHeader("Content-Type", "application/json");
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.get("/stream/:type/:id.json", async (req, res) => {
  try {
    const result = await addonInterface.get("stream", req.params);
    res.setHeader("Content-Type", "application/json");
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// Root route (optional)
app.get("/", (_req, res) => {
  res.send("✅ iBOMMA Stremio Addon is running.");
});

app.listen(port, () => {
  console.log(`✅ Server listening on port ${port}`);
});
