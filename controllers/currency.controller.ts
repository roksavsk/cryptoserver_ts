import { Request, Response } from 'express';

import Currency from '../models/currency.model'; 

exports.create = (req: Request, res: Response) => {
    if (!req.body) {
        res.status(400).send({
            message: 'Content can not be empty!',
        });
    }

    const currency = new Currency(
        req.body.cryptoName,
        req.body.coinbaseValue,
        req.body.coinstatsValue,
        req.body.coinmarketValue,
        req.body.coinpaprikaValue,
        req.body.kucoinValue,
        req.body.averagePrice,
    );

    Currency.create(currency.data, (err: Error, data: []) => {
        if (err)
            res.status(500).send({
                message:
          err.message || 'Some error occurred while creating the Currency.',
            });
        else res.send(data);
    });
};

exports.findAll = (req: Request, res: Response) => {
    const title = req.params.cryptoName;
    Currency.getAll(title, (err: Error, data: []) => {
        if (err)
            res.status(500).send({
                message:
          err.message || 'Some error occurred while retrieving currencies.',
            });
        else res.send(data);
    });
};

exports.findOne = (req: Request, res: Response) => {
    Currency.findByName(req.params.name, (err: Error, data: []) => {
        if (err) {
            if (err.message === 'not_found') {
                res.status(404).send({
                    message: `Not found Currency with name ${req.params.name}.`,
                });
            } else {
                res.status(500).send({
                    message: `Error retrieving Currency with name ${req.params.name}`,
                });
            }
        } else res.send(data);
    });
};

exports.recent = (req: Request, res: Response) => {
    Currency.recent((err: Error, data: []) => {
        if (err)
            res.status(500).send({
                message:
          err.message || 'Some error occurred while retrieving currencies.',
            });
        else res.send(data);
    });
};

exports.getInfo = (req: Request, res: Response) => {
    Currency.getInfo(
        req.params.name,
        req.params.market,
        req.params.date,
        (err: Error, data: []) => {
            if (err) {
                if (err.message === 'not_found') {
                    res.status(404).send({
                        message: `Not found Currency with name ${req.params.name}.`,
                    });
                } else {
                    res.status(500).send({
                        message: `Error retrieving Currency with name ${req.params.name}`,
                    });
                }
            } else res.send(data);
        },
    );
};

exports.update = (req: Request, res: Response) => {
    if (!req.body) {
        res.status(400).send({
            message: 'Content can not be empty!',
        });
    }
    console.log(req.body);
    Currency.updateById(
        Number(req.params.id),
        new Currency(
            req.body.cryptoName,
            req.body.coinbaseValue,
            req.body.coinstatsValue,
            req.body.coinmarketValue,
            req.body.coinpaprikaValue,
            req.body.kucoinValue,
            req.body.averagePrice,
        ),
        (err: Error, data: []) => {
            if (err) {
                if (err.message === 'not_found') {
                    res.status(404).send({
                        message: `Not found Currency with id ${req.params.id}.`,
                    });
                } else {
                    res.status(500).send({
                        message: `Error updating Currency with id ${req.params.id}`,
                    });
                }
            } else res.send(data);
        },
    );
};

exports.delete = (req: Request, res: Response) => {
    Currency.remove(Number(req.params.id), (err: Error) => {
        if (err) {
            if (err.message === 'not_found') {
                res.status(404).send({
                    message: `Not found Currency with id ${req.params.id}.`,
                });
            } else {
                res.status(500).send({
                    message: `Could not delete Currency with id ${req.params.id}`,
                });
            }
        } else res.send({ message: 'Currency was deleted successfully!' });
    });
};

exports.deleteAll = (req: Request, res: Response) => {
    Currency.removeAll((err: Error) => {
        if (err)
            res.status(500).send({
                message:
          err.message || 'Some error occurred while removing all currencies.',
            });
        else res.send({ message: 'All Currencies were deleted successfully!' });
    });
};

export default exports;
