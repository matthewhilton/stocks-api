const express = require('express');
const router = express.Router();
const knex = require('../db.js')

const {dateValid, symbolInvalid, onlyHas} = require("../helpers/validators");

const errorResponse = require('../responses/error.json')
const authorize = require('../helpers/auth')

router.get('/symbols', function(req, res, next) {
    // Ensure query parameters only has 'industry' or nothing at all
    if(!onlyHas(Object.keys(req.query), ['industry'])){
        res.status(400).json({
            error: true,
            message: errorResponse.invalidQueryParameters
        })
        return;
    }

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
                res.status(404).json({
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
            res.status(500).json({
                error: errorResponse.databaseError,
                stacktrace: e
            })
            return;
        })

    // Fallback response (should never reach here)
    res.status(500)
    return;
});

router.get('/authed/:symbol?', authorize , function(req, res, next) {
    // Ensure no other query elements other than 'to' and 'from'
    if(!onlyHas(Object.keys(req.query), ['to', 'from'])){
        res.status(400).json({
            error: true,
            message: errorResponse.invalidQueryParameters
        })
        return;
    }

    const { symbol } = req.params;
    let { from, to } = req.query;

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
                if(rows.length == 0){
                    res.status(404).json({
                        error: true,
                        message: errorResponse.notFound
                    })
                    return;
                } else {
                    res.status(200).json(rows)
                    return;
                }
            })
            .catch(e => {
                res.status(500).json({
                    error: errorResponse.databaseError,
                    stacktrace: e
                })
                return;
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
    } else if(req.query['to'] !== undefined || req.query['from'] !== undefined){
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
                res.status(500).json({
                    error: errorResponse.databaseError,
                    stacktrace: e
                })
                return;
            })
    }

    // Fallback response (should never reach here)
    res.status(500)
    return;
});


module.exports = router;