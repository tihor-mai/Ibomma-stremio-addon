const express = require("express");
const cors = require("cors");
const { addonBuilder } = require("stremio-addon-sdk");
const { searchMovies, getStreamingLink } = require("./scraper");
const manifest = require("./manifest.json");

const app = express();
app.use(cors());

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

const addonInterface = builder.getInterface();
app.use("/", addonInterface.middleware());

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`🚀 iBOMMA Telugu Addon running on port ${PORT}`));