const express = require('express');
const SearchkitExpress = require('searchkit-express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.static('build'));

const archiveDir = path.join(__dirname, '..', 'archive');

app.use('/archive-data', express.static(archiveDir));

app.get(
  '/archive-data/:channel([\w-]+)/dates',
  (req, res) => {
    fs.readdir(
      path.join(archiveDir, req.params.channel),
      (err, files) => {
        res.send(
          files ? files.map(filename => filename.replace(RegExp('\.json$'), '')) : []
        );
      }
    );
  }
);

app.get(
  '/*',
  (req, res) => {
    res.sendFile(`${__dirname}/build/index.html`);
  }
);

app.use(bodyParser.json());
SearchkitExpress({
  host: process.env.ELASTIC_URL || 'http://localhost:9200',
  index: 'slack',
  queryProcessor: function(query, req, res) {
    // do neccessery permissions, prefilters to query object
    // then return it
    return query;
  },
}, app);

app.listen(8000, 'localhost', () => {
  console.log('Slack search is listening!');
});
