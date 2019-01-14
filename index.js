const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const request = require("request-promise");
const Timeout = require("await-timeout");

const cheerio = require("cheerio");

let $;
let lastGET;
let loading = false;

const updateData = async () => {
  loading = true;
  console.log("LOADING");
  const body = await request("https://coinmarketcap.com/all/views/all/");
  console.log("LOADED");
  $ = cheerio.load(body);
  lastGET = Date.now();
  loading = false;
};

const ensureData = async () => {
  console.log("Testing. Is loading?", loading);
  if (loading) {
    while (loading) {
      console.log("Already loading, waiting");
      await Timeout.set(100);
    }
    return;
  }

  if (!$ || Date.now() - lastGET > 60000) await updateData();
};

app.get("/historical/:name", async (req, res) => {
  await ensureData();

  const hour = parseFloat(
    $(`#id-${req.params.name} td[data-timespan='1h']`).attr("data-percentusd")
  );
  const day = parseFloat(
    $(`#id-${req.params.name} td[data-timespan='24h']`).attr("data-percentusd")
  );
  const week = parseFloat(
    $(`#id-${req.params.name} td[data-timespan='7d']`).attr("data-percentusd")
  );

  res.send({ day, hour, week });
});

app.get("/price/:name", async (req, res) => {
  await ensureData();

  const price = $(`#id-${req.params.name} .price`).attr("data-usd");

  res.send({ price });
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
