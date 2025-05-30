const express = require("express");
const cors = require("cors");
const { addonBuilder } = require("stremio-addon-sdk");
const { searchMovies, getStreamingLink } = require("./scraper");

const manifest = require("./manifest.json");
const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(async ({ id, extra }) => {
  const searchTerm = extra?.search;
  if (id === "ibomma-telugu" && searchTerm) {
    const results = await searchMovies(searchTerm);
    return { metas: results };
  }
  return { metas: [] };
});

builder.defineStreamHandler(async ({ id }) => {
  if (id.startsWith("ibomma:")) {
    const streams = await getStreamingLink(id);
    return { streams };
  }
  return { streams: [] };
});

const app = express();
const PORT = process.env.PORT || 7000;

app.use(cors());
app.get("/manifest.json", (_, res) => {
  res.send(builder.getInterface().manifest);
});
app.get("/catalog/:type/:id/:extra?.json", async (req, res) => {
  const { type, id } = req.params;
  const extra = req.query;
  const result = await builder.getInterface().get("catalog")({ type, id, extra });
  res.send(result);
});
app.get("/stream/:type/:id.json", async (req, res) => {
  const { type, id } = req.params;
  const result = await builder.getInterface().get("stream")({ type, id });
  res.send(result);
});

app.listen(PORT, () => {
  console.log(`Addon running at http://localhost:${PORT}`);
});
