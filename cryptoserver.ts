import express, { Request, Response } from "express";
import { json } from "body-parser";
import axios from "axios";
import cron from "node-cron";
import Currency from "./models/currency.model";
import router from "./routes/currency.routes";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 3000;

app.use(json());
app.use("/api/currencies", router);

app.get("/", (req, res) => {
  res.send("Welcome to Cryptocurrency commutator!");
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

app.get("/coins", async (req, res) => {
  const topcoins = await getCoins();
  res.send(topcoins);
});

let coinbase1: []; let coinmarket1: []; let coinstats1: []; let coinpaprika1: []; let kucoin1: [];
let common: string[];
interface Coins {
  [index: string]: string | number ;
}
const coindata = new Currency();

async function getCoins() {

  await axios.get("https://api.coinbase.com/v2/exchange-rates?currency=USD")
  .then(response => {
      coinbase1 = response.data.data.rates;
      console.log("Coinbase data is saved.");
  })
  .catch(error => {
      console.log("error", error);
  });

  await axios.get("https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest", {
      headers: {
          "X-CMC_PRO_API_KEY": process.env.COINMARKET_API_KEY,
      }
  })
  .then(response => {
      coinmarket1 = response.data.data;
      console.log("Coinmarket data is saved.");
  })
  .catch(error => {
      console.log("error", error);
  });

  await axios
  .get("https://api.coinstats.app/public/v1/coins?skip=0&limit=0&currency=USD")
  .then(response => {
      coinstats1 = response.data.coins;
      console.log("Coinstats data is saved.");
  })
  .catch(error => {
      console.log("error", error);
  });

  await axios
  .get("https://api.coinpaprika.com/v1/tickers")
  .then(response => {
      coinpaprika1 = response.data;
      console.log("Coinpaprika data is saved.");
  })
  .catch(error => {
      console.log("error", error);
  });

  await axios
  .get("https://api.kucoin.com/api/v1/prices")
  .then(response => {
      kucoin1 = response.data.data;
      console.log("Kucoin data is saved.");
  })
  .catch(error => {
      console.log("error", error);
  });
  
  
  const intersect = (a1?: string[], a2?: string[], ...rest: []): string[] => {
    const a12 = a1.filter(value => a2.includes(value));
    if (rest.length === 0) { return a12; }
    return intersect(a12, ...rest);
  };
  
  function existInAllFiles() {
    const coins1 = [coinstats1, coinmarket1, coinpaprika1];
    const coins2 = [coinbase1, kucoin1];
    let j = 0;
    const existAll = [[], [], [], [], []];
    coins1.forEach(item => {
      for (let i=0; i < item.length; i++) {
        existAll[j].push(item[i]['symbol']);
      };
      j++;
    });
    coins2.forEach(item => {
      for (let i=0; i < Object.keys(item).length; i++) {
        existAll[j].push(Object.keys(item)[i]);
      };
      j++;
    });
    common = intersect(...existAll);
    console.log(`Всего валют: ${common.length}`);
    return common;
  };
  // existInAllFiles();
  console.log(existInAllFiles());

  const i = common.indexOf("XRP");
  if(i >= 0) {
    common.splice(i,1);
  }
  const topcoins = common.slice(0, 20);
  
  console.log(topcoins);
  return topcoins;
};

async function getApi(){

  const topcoins = await getCoins();

  let coinbase: Coins = {};

  for (let topcoin of topcoins){
    await axios
    .get(`https://api.coinbase.com/v2/prices/${topcoin}-USD/buy`)
    .then(response => {
      const res = response.data;
      coinbase[topcoin] = res.data.amount;
    })
    .catch(error => {
        console.log("error", error);
    });
  };

  let coinstats: Coins = {};
  let coinmarket: Coins = {};
  let coinpaprika: Coins = {};
  let kucoin: Coins = {};
  
  function getPrice() {
    for (let i=0; i < Object.keys(kucoin1).length; i++) {
      for (const currency of topcoins) {
        if (currency === Object.entries(kucoin1)[i][0]) {
          kucoin[currency] = Object.entries(kucoin1)[i][1];
        };
      };
    };
  
    for (let i=0; i < coinstats1.length; i++) {
      for (const currency of topcoins) {
        if (currency === coinstats1[i]['symbol']) {
          coinstats[currency] = coinstats1[i]['price'];
        };
      };
    };
    for (let i=0; i < coinpaprika1.length; i++) {
      for (const currency of topcoins) {
        if (currency === coinpaprika1[i]['symbol']) {
          coinpaprika[currency] = coinpaprika1[i]['quotes']['USD']['price'];
        };
      };
    };
  
    for (let i=0; i < coinmarket1.length; i++) {
      for (const currency of topcoins) {
        if (currency === coinmarket1[i]['symbol']) {
          coinmarket[currency] = coinmarket1[i]['quote']['USD']['price'];
        };
      };
    };
    
    const sortObject = (obj: Coins) => Object.keys(obj).sort().reduce((res: Coins, key) => (res[key] = obj[key], res), {});
    coinbase = sortObject(coinbase);
    coinstats = sortObject(coinstats);
    coinmarket = sortObject(coinmarket);
    coinpaprika = sortObject(coinpaprika);
    kucoin = sortObject(kucoin);

    const arr = Object.entries(coinbase);
    for (let i=0; i < Object.entries(coinbase).length; i++){
      arr[i].push(Object.values(coinstats)[i]);
      arr[i].push(Object.values(coinmarket)[i]);
      arr[i].push(Object.values(coinpaprika)[i]);
      arr[i].push(Object.values(kucoin)[i]);
      arr[i].push(((Number(arr[i][1]) + arr[i][2] + arr[i][3] + arr[i][4] + Number(arr[i][5]))/5).toFixed(2));
    };
    
    coindata.createAll(arr);
    
  };
  getPrice();
};

const cronjob = cron.schedule("*/2 * * * *", () => {
  console.log("Running server every 5 minute");
  getApi();
});

cronjob.start();