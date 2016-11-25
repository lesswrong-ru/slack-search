var express = require('express');
var SearchkitExpress = require('searchkit-express');
var bodyParser = require('body-parser');

var app = express();
app.use(express.static('static'));

app.use(bodyParser.json());
SearchkitExpress({
    host: process.env.ELASTIC_URL || 'http://localhost:9200',
    index: 'slack',
    queryProcessor: function(query, req, res) {
        //do neccessery permissions, prefilters to query object
        //then return it
        return query;
    }
}, app);

app.listen(8000, function () {
    console.log('Slack search is listening!');
})
