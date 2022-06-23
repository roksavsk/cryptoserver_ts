import sql from "./db"

class Currency {

  constructor (public cryptoName: string, public coinbaseValue: number, public coinstatsValue: number, public coinmarketValue: number, public coinpaprikaValue: number, public kucoinValue: number, public averagePrice: number,) {
  }

  data: any[] = [this.cryptoName, this.coinbaseValue, this.coinstatsValue, this.coinmarketValue, this.coinpaprikaValue, this.kucoinValue, this.averagePrice];

  static create (newCurrency: any[], result: any) {
    sql.query("INSERT INTO currencies SET ?", newCurrency, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      console.log("created currency: ", newCurrency);
      result(null, newCurrency);
    });
  };

  static createAll = (newCurrency: any[]) => {
    sql.query("INSERT INTO currencies (cryptoName, coinbaseValue, coinstatsValue, coinmarketValue, coinpaprikaValue, kucoinValue, averagePrice) VALUES ?", [newCurrency], (err, res) => {
      if (err) {
        console.log("error: ", err);
        return;
      }
      console.log("created currency: ", newCurrency);
    });
  };

  static findByName = (name: string, result:any ) => {
    sql.query(`SELECT * FROM currencies WHERE cryptoName = '${name}'`, (err, res: []) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      if (res.length) {
        console.log("found currency: ", res);
        result(null, res);
        return;
      }
      result({ kind: "not_found" }, null);
    });
  };

  static recent = (result: any) => {
    sql.query("SELECT cryptoName, averagePrice FROM currencies ORDER BY id DESC LIMIT 20", (err, res: []) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      if (res.length) {
        console.log("found currencies: ", res);
        result(null, res);
        return;
      }
      result({ kind: "not_found" }, null);
    });
  };

  static getInfo = (name: string, market: string, date: string, result: any) => {
    sql.query(`SELECT cryptoName, ${market}, averagePrice, date_time FROM currencies WHERE cryptoName = '${name}' AND date_time LIKE '${date}%'`, (err, res: []) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      if (res.length) {
        console.log("found currency: ", res);
        result(null, res);
        return;
      }
      result({ kind: "not_found" }, null);
    });
  };


  static getAll = (cryptoName: string, result: any) => {
    let query = "SELECT * FROM currencies";
    if (cryptoName) {
      query += ` WHERE cryptoName LIKE '%${cryptoName}%'`;
    }
    sql.query(query, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
      console.log("currencies: ", res);
      result(null, res);
    });
  };

  static updateById = (id: number, currency: Currency, result:any ) => {
    sql.query(
      "UPDATE currencies SET cryptoName = ?, coinbaseValue = ?, coinstatsValue = ?, coinmarketValue = ?, coinpaprikaValue = ?, kucoinValue = ?, averagePrice = ? WHERE id = ?",
      [currency.cryptoName, currency.coinbaseValue, currency.coinstatsValue, currency.coinmarketValue, currency.coinpaprikaValue, currency.kucoinValue, currency.averagePrice, id],
      (err, res: any) => {
        if (err) {
          console.log("error: ", err);
          result(null, err);
          return;
        }
        if (res.affectedRows === 0) {
          result({ kind: "not_found" }, null);
          return;
        }
        console.log("updated currency: ", { id, ...currency });
        result(null, { id, ...currency });
      }
    );
  };

  static remove = (id: number, result: any) => {
    sql.query("DELETE FROM currencies WHERE id = ?", id, (err, res: any) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
      if (res.affectedRows === 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      console.log("deleted currency with id: ", id);
      result(null, res);
    });
  };

  static removeAll = (result: any) => {
    sql.query("DELETE FROM currencies", (err, res: any) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
      console.log(`deleted ${res.affectedRows} currencies`);
      result(null, res);
    });
  };

}

export default Currency;