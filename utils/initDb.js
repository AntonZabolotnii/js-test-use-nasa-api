const request = require("request");
const qs = require("qs");

const config = require("./config");
const db = require("./db");

db.removeCollection()
.then( () => {
    // get data from the API and process response to necessary format
    return getApiRequestPromise();
})
.then( data => {
    // save prepared data to db
    return db.insertData(data);
})
.then( docs => {
    console.log(`${docs.length} data items has been saved to db.`);
    process.exit(0);
}).catch( err => {
    console.log(`Error: ${err}`);
    process.exit(1);
});

function processResponseBody(body) {
    let neos = Object.keys(body.near_earth_objects).map( (dateKey) => {
        return body.near_earth_objects[dateKey].map( (neo) => {
            return {
                date: dateKey,
                neoReferenceId: neo.neo_reference_id,
                name: neo.name,
                speed: neo.close_approach_data[0].relative_velocity.kilometers_per_hour,
                isHazardous: neo.is_potentially_hazardous_asteroid
            };
        });
    });

    // "flatten" array of arrays
    return [].concat.apply([], neos);
}

function constructApiUrl() {
    let basicDate = new Date();
    let endDate = basicDate.toISOString().slice(0, 10);
    let startDate = (new Date(basicDate - 3*24*60*60*1000)).toISOString().slice(0, 10);

    let query = qs.stringify({
        api_key: config.api_key,
        start_date: startDate,
        end_date: endDate,
        detailed: false
    });

    return `${config.baseApiUrl}?${query}`;
}

function getApiRequestPromise() {
    return new Promise( (resolve, reject) => {
        let url = constructApiUrl();

        request({url: url}, (err, res, body) => {
            if (err) {
                reject(`Request to NASA API failed: ${err}`);
            }
            if (res.statusCode !== 200) {
                reject(`Cannot get data from NASA API,
                    - status code ${res.statusCode},
                    - status message ${res.statusMessage}`);
            }
            console.log(`Processing NASA API response...`);
            let parsedBody;
            try {
                parsedBody = JSON.parse(body);
                resolve(processResponseBody(parsedBody));
            } catch (e) {
                reject(`Error parsing response body: ${e}`);
            }
        });
    });
}
