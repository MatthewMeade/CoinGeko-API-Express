const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
var request = require("request-promise");

const cheerio = require("cheerio");

let $;
let lastGET;

const updateData = async () => {
  loading = true;
  const body = await request("https://coinmarketcap.com/all/views/all/");
  $ = cheerio.load(body);
  lastGET = Date.now();
};

const ensureData = async () => {
  if (!$ || Date.now() - lastGET > 60000) await updateData();
};

app.get("/historical/:name", async (req, res) => {
  await ensureData();

  const hour = $(`#id-${req.params.name} td[data-timespan='1h']`).attr(
    "data-percentusd"
  );
  const day = $(`#id-${req.params.name} td[data-timespan='24h']`).attr(
    "data-percentusd"
  );
  const week = $(`#id-${req.params.name} td[data-timespan='7d']`).attr(
    "data-percentusd"
  );

  res.send({ data: [hour, day, week].map(parseFloat) });
});

app.get("/price/:name", async (req, res) => {
  await ensureData();

  const price = $(`#id-${req.params.name} .price`).attr("data-usd");

  res.send({ price });
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
