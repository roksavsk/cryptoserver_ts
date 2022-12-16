# Crypto Rest API  [Backend] TS

---

У нас есть пять бирж, список которых представлен ниже. У каждой биржи своя API. Раз в пять минут делаем запросы на все API с целью **получить актуальную цену криптовалют и сохраняем в базу по каждому маркету.**

Создать эндпоинт, которые возвращают данные по криптовалютам. В параметрах запроса должна быть возможность:

- указать какую-то конкретную крипту;
- конкретный маркет (внешнюю API), если маркет в параметрах запроса не передан - вернуть СРЕДНЮЮ цену по рынку, высчитанную со всех пяти маркетов;
- за какой период возвращать данные о крипте (за последние 15 минут, 1 час, 4 часа, 24 часа);

<aside>
💡 Обратите внимание — это первая таска, которая ОБЯЗАТЕЛЬНО должна быть написана на TypeScript. В связи с этим не забудьте настроить Eslint и tsconfig.

</aside>

# Технологии

---

- Node.js;
- Express.js;
- DataBase (MySQL);
- CRON;
- Cryptocurrency APIs.
- Heroku;
- NgRok.

# Cryptocurrency API list

---

- [CoinMarketCap](https://coinmarketcap.com/api/documentation/v1/#operation/getV1CryptocurrencyListingsLatest);
- [CoinBase](https://developers.coinbase.com/api/v2?javascript#introduction);
- [CoinStats](https://documenter.getpostman.com/view/5734027/RzZ6Hzr3);
- [Kucoin](https://docs.kucoin.com/#general);
- [CoinPaprika](https://api.coinpaprika.com/);

<aside>
💡 При разработке API учитывайте, что в одной из последующих тасок вам предстоит использовать её функциональность в качестве информационной базы для написания Telegram-бота.

</aside>
