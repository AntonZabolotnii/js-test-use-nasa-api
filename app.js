const app = require("express")();
const db = require("./utils/db");
const helper = require("./utils/helper");

app.get("/", (req, res) => {
    helper.sendFormattedResponse(res, {
        hello: "world!"
    });
});

app.get("/neos", (req, res, next) => {
    // helper route to view all collection entries
    db.models.Neo.find({}).exec((err, docs) => {
        if (err) {
            next();
        }
        helper.sendFormattedResponse(res, docs);
    });
});

app.get("/neo/hazardous", (req, res, next) => {
    db.models.Neo.find({
        isHazardous: true
    }).exec((err, docs) => {
        if (err) {
            next();
        }
        helper.sendFormattedResponse(res, docs);
    });
});

app.get("/neo/fastest", (req, res, next) => {
    let isHazardous = helper.isHazardous(req);
    // perhaps need separate module for this type of code (db queries)
    db.models.Neo.aggregate(
        [
            {
                $match: {isHazardous: isHazardous}
            },
            {
                $sort: {speed: -1}
            },
            {
                $limit: 1
            }
        ]
    ).exec((err, docs) => {
        if (err) {
            next();
        }
        helper.sendFormattedResponse(res, docs);
    });
});

app.get("/neo/best-year", (req, res, next) => {
    let isHazardous = helper.isHazardous(req);
    db.models.Neo.aggregate(
        [
            {
                $match: {isHazardous: isHazardous}
            },
            {
                $group: {
                    _id: {$year: "$date"},
                    count: {$sum: 1}
                }
            },
            {
                $sort: {count: -1}
            },
            {
                $limit: 1
            },
            {
                $project: {
                    _id: 0,
                    "best-year": "$_id"
                }
            }
        ]
    ).exec((err, docs) => {
        if (err) {
            next();
        }
        helper.sendFormattedResponse(res, docs);
    });
});

app.get("/neo/best-month", (req, res, next) => {
    // not sure what means "not a month in a year"
    let isHazardous = helper.isHazardous(req);
    db.models.Neo.aggregate(
        [
            {
                $match: {isHazardous: isHazardous}
            }, {
                $group: {
                    _id: {month: {$month: "$date"}, year: {$year: "$date"}},
                    count: {$sum: 1}
                }
            }, {
                $sort: {count: -1}
            }, {
                $limit: 1
            }, {
                $project: {
                    _id: 0,
                    // perhaps, need to merge month and year into single field...
                    "month": "$_id.month",
                    "year": "$_id.year",
                    count: 1
                }
            }

        ]
    ).exec((err, docs) => {
        if (err) {
            next();
        }
        helper.sendFormattedResponse(res, docs);
    });
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(3000, function () {
    console.log('App listening on port 3000!');
});