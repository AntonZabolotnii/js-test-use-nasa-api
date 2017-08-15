exports.sendFormattedResponse = function (response, data) {
    response.header("Content-Type", "application/json");
    response.send(JSON.stringify(data, null, 4));
};

exports.isHazardous = function(req) {
    return req.query.hazardous === "true" || false;
};