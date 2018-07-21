const express = require('express');
const SearchkitExpress = require('searchkit-express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.static('build'));

const archiveDir = path.join(__dirname, '..', 'archive');

app.use('/api/archive', express.static(archiveDir));

app.get(
  '/api/channel-dates/:channel([\\w\\-]+)',
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
const searchkitRouter = SearchkitExpress.createRouter({
  host: process.env.ELASTIC_URL || 'http://localhost:9200',
  index: 'slack.messages',
  queryProcessor: function(query, req, res) {
    // do neccessery permissions, prefilters to query object
    // then return it
    return query;
  },
});
app.use("/api/search", searchkitRouter);

app.listen(8000, 'localhost', () => {
  console.log('Slack search is listening!');
});
