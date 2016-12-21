var express = require('express');
var SearchkitExpress = require('searchkit-express');
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');

var app = express();
app.use(express.static('static'));

var archiveDir = path.join(__dirname, '..', 'archive');

app.use('/archive-data', express.static(archiveDir));

app.get('/archive-data/:channel/dates', function(req, res) {
  fs.readdir(
    path.join(archiveDir, req.params.channel),
    (err, files) => {
      res.send(
        files.map(function (filename) {
            return filename.replace(RegExp('\.json$'), '');
        })
      );
    }
  );
});

app.get('/*', function(req, res) {
  res.sendFile(__dirname + '/static/index.html');
});

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

app.listen(8000, 'localhost', function () {
    console.log('Slack search is listening!');
})
