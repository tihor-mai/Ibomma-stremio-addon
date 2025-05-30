const axios = require("axios");
const cheerio = require("cheerio");

const BASE_URL = "https://ww1.ibomma.gay";

async function searchMovies(query) {
  const url = `${BASE_URL}/?s=${encodeURIComponent(query)}`;
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const results = [];

  $("article").each((_, element) => {
    const title = $(element).find("h3").text().trim();
    const poster = $(element).find("img").attr("src");
    const link = $(element).find("a").attr("href");

    if (title && poster && link) {
      results.push({
        id: `ibomma:${Buffer.from(link).toString("base64")}`,
        name: title,
        type: "movie",
        poster: poster
      });
    }
  });

  return results;
}

async function getStreamingLink(id) {
  const url = Buffer.from(id.split(":")[1], "base64").toString("utf-8");
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const iframe = $("iframe").attr("src");
  return iframe ? [{ url: iframe }] : [];
}

module.exports = { searchMovies, getStreamingLink };