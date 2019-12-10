const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const request = require("request-promise");

const CoinGecko = require("coingecko-api");
const CoinGeckoClient = new CoinGecko();

const getCoinData = async name => {
  const {
    data: { market_data: marketData },
  } = await CoinGeckoClient.coins.fetch(name, {
    community_data: false,
    developer_data: false,
    localization: false,
  });

  const price = marketData.current_price["usd"];

  const hour = marketData.price_change_percentage_1h_in_currency["usd"];
  const day = marketData.price_change_percentage_24h_in_currency["usd"];
  const week = marketData.price_change_percentage_7d_in_currency["usd"];

  const marketcap = marketData.market_cap["usd"];

  return { price, historical: { hour, day, week }, marketcap };
};

app.get("/:prop/:name", async (req, res) => {
  const data = await getCoinData(req.params.name).catch(err =>
    res.status(404).send({ error: err || `Unable to find ${req.params.name}` })
  );

  if (data) res.json(data[req.params.prop]);
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
