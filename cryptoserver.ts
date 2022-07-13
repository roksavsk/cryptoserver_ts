import express from 'express';
import { json } from 'body-parser';
import axios from 'axios';
import cron from 'node-cron';
import dotenv from 'dotenv';

import Currency from './models/currency.model';
import routes from './routes/currency.routes';

dotenv.config();

const app = express();
const port = 3000;

let coinbase1: Coins;
let coinmarket1: Coins;
let coinstats1: Coins;
let coinpaprika1: Coins;
let kucoin1: Coins;
let common: string[];
interface Coins {
    [index: string]: string | number;
}

app.use(json());
app.use('/api/currencies', routes);

app.get('/', (req, res) => {
    res.send('Welcome to Cryptocurrency commutator!');
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

async function getCoins() {
    try {
        const response = await axios.get(
            'https://api.coinbase.com/v2/exchange-rates?currency=USD',
        );
        coinbase1 = await response.data.data.rates;
        console.log('Coinbase data is saved.');
    } catch (err) {
        console.log('error', err);
    }

    try {
        const response = await axios.get(
            'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
            {
                headers: {
                    'X-CMC_PRO_API_KEY': process.env.COINMARKET_API_KEY,
                },
            },
        );
        coinmarket1 = Object.fromEntries(response.data.data.map(({ symbol, quote.USD.price}) => ([ symbol, quote.USD.price ])));
        console.log('Coinmarket data is saved.');
    } catch (err) {
        console.log('error', err);
    }

    try {
        const response = await axios.get(
            'https://api.coinstats.app/public/v1/coins?skip=0&limit=0&currency=USD',
        );
        coinstats1 = Object.fromEntries(response.data.coins.map(({ symbol, price}) => ([ symbol, price ])));
        console.log('Coinstats data is saved.');
    } catch (err) {
        console.log('error', err);
    }

    try {
        const response = await axios.get('https://api.coinpaprika.com/v1/tickers');
        coinpaprika1 = Object.fromEntries(response.data.map(({ symbol, quotes.USD.price}) => ([ symbol, quotes.USD.price ])));
        console.log('Coinpaprika data is saved.');
    } catch (err) {
        console.log('error', err);
    }

    try {
        const response = await axios.get('https://api.kucoin.com/api/v1/prices');
        kucoin1 = response.data.data;
        Object.keys(kucoin1).forEach((key: string) => { kucoin1[key] = Number(kucoin1[key]); });
        console.log('Kucoin data is saved.');
    } catch (err) {
        console.log('error', err);
    }

    const intersect = (a1?: string[], a2?: string[], ...rest: []): string[] => {
        const a12 = a1.filter((value) => a2.includes(value));
        if (rest.length === 0) {
            return a12;
        }
        return intersect(a12, ...rest);
    };

    function existInAllFiles() {
        const coins = [Object.keys(coinbase1), Object.keys(kucoin1), Object.keys(coinstats1), Object.keys(coinmarket1), Object.keys(coinpaprika1)];
        common = intersect(...coins);
        console.log(`Всего валют: ${common.length}`);
        return common;
    }
    // existInAllFiles();
    console.log(existInAllFiles());

    const i = common.indexOf('XRP');
    if (i >= 0) {
        common.splice(i, 1);
    }
    const topcoins = common.slice(0, 20);

    console.log(topcoins);
    return topcoins;
}

async function getApi() {
    const topcoins = await getCoins();

    let coinbase: Coins = {};

    for (const topcoin of topcoins) {
        try {
            const response = await axios.get(
                `https://api.coinbase.com/v2/prices/${topcoin}-USD/buy`,
            );
            const res = response.data;
            coinbase[topcoin] = Number(res.data.amount);
        } catch (err) {
            console.log('error', err);
        }
    }

    let coinstats: Coins = {};
    let coinmarket: Coins = {};
    let coinpaprika: Coins = {};
    let kucoin: Coins = {};

    function getPrice() {

        const topcoinData = (currencyMarket: Coins) => 
            Object.fromEntries(Object.entries(currencyMarket)
                .filter(([k, v]) => { if (topcoins.includes(k)) return [k, Number(v)]; }));
        
        const sortObject = (obj: Coins) =>
            Object.keys(obj)
                .sort()
                .reduce((res: Coins, key) => ((res[key] = obj[key]), res), {});
        
        coinbase = sortObject(coinbase);        
        coinstats = sortObject(topcoinData(coinstats1));
        coinmarket = sortObject(topcoinData(coinmarket1));
        coinpaprika = sortObject(topcoinData(coinpaprika1));
        kucoin = sortObject(topcoinData(kucoin1));

        const arr: any[] = Object.entries(coinbase);
        for (let i = 0; i < Object.entries(coinbase).length; i++) {
            arr[i].push(Object.values(coinstats)[i]);
            arr[i].push(Object.values(coinmarket)[i]);
            arr[i].push(Object.values(coinpaprika)[i]);
            arr[i].push(Object.values(kucoin)[i]);
            arr[i].push(Number(((arr[i][1] +
                arr[i][2] +
                arr[i][3] +
                arr[i][4] +
                arr[i][5]) / 5).toFixed(2)));
        }

        Currency.createAll(arr);
    }
    getPrice();
}

app.get('/coins', async (req, res) => {
    const topcoins = await getCoins();
    res.send(topcoins);
});

const cronjob = cron.schedule('*/5 * * * *', () => {
    console.log('Running server every 5 minute');
    getApi();
});
cronjob.start();
