const express = require('express');
const router = express.Router();
const knex = require('../db.js')

const {dateValid, symbolInvalid} = require("../helpers/validators");

const errorResponse = require('../responses/error.json')
const authorize = require('../helpers/auth')

router.get('/symbols', function(req, res, next) {
    let { industry } = req.query;

    if(industry == undefined){
        industry = '';
    }

    knex('stocks')
        .select(['name', 'symbol', 'industry'])
        .where('industry', 'like', '%'+industry+'%')
        .groupBy('name')
        .orderBy('symbol', 'asc')
        .then(rows => {
            if(rows.length == 0){
                res.status(400).json({
                    error: true,
                    message: errorResponse.industrySectorNotFound
                })
                return;
            } else {
                res.status(200).json(rows)
                return;
            }
        })
        .catch((e) => {
            // Error with knex/sql (internal server error)
            res.status(500).json(errorResponse.databaseError)
            return;
        })

    // Fallback response (should never reach here)
    res.status(500)
    return;
});

router.get('/authed/:symbol?', authorize , function(req, res, next) {
    const { symbol } = req.params;
    let { from, to } = req.query;

    console.log(from, to)

    // Check a proper symbol was given
    if(symbolInvalid(symbol)){
        res.status(400).json({
            error: true,
            message: errorResponse.incorrectSymbolFormat
        })
        return;
    } else if(from && !dateValid(from)){
        res.status(400).json({
            error: true,
            message: "From" + errorResponse.cannotParseDate
        })
        return;
    } else if(to && !dateValid(to)){
        res.status(400).json({
            error: true,
            message: "To" + errorResponse.cannotParseDate
        })
        return;
    } else {
        // Run the query
        query = knex('stocks')

        query.where({symbol: symbol})

        // Filter depending on args provided
        if(from && to){
            query.whereBetween('timestamp', [from, to])
        } else if(from && !to){
            query.where('timestamp', '>=', from)
        } else if(to && !from){
            query.where('timestamp', '<=', to)
        }

        // Return the results
        query.then(rows => {
                res.status(200).json(rows)
            })
            .catch(e => {
                // Throw err
                console.log(e)
                res.status(500).json(errorResponse.databaseError)
            })
    }

    // Fallback response (should never reach here)
    res.status(500)
    return;
});

router.get('/:symbol?', function(req, res, next) {
    const { symbol } = req.params;

    // 400 bad request - Invalid format of 1-5 capital letters
    if(symbolInvalid(symbol)){
        res.status(400).json({
            error: true,
            message: errorResponse.incorrectSymbolFormat
        })
        return;
    // 400 Bad Request (user using wrong route!)
    } else if(req.query.date !== undefined){
        res.status(400).json({
            error: true,
            message: errorResponse.dateParameterUnnecessary
        })
        return;
    } else {
        // Now search database for stock
        knex('stocks')
            .where({symbol: symbol})
            .orderBy('timestamp', 'desc')
            .then(rows => {
                if(rows.length == 0){
                    res.status(404).json({
                        error: true,
                        message: errorResponse.noSymbolFound
                    })
                    return;
                } else {
                    res.status(200).json(rows[0])
                    return;
                }
            })
            .catch((e) => {
                // Error with knex/sql (internal server error)
                res.status(500).json(errorResponse.databaseError)
                return;
            })
    }

    // Fallback response (should never reach here)
    res.status(500)
    return;
});


module.exports = router;