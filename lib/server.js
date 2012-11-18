var express = require('express');
var app = express();

app.use(express.bodyParser())
  .use(express.cookieParser())
  .use(express.session({
    secret: 'solsticesub'
  }))
  .use(express.static('www'));

require('express-persona')(app, {
  audience: "http://shipyard.solsticesub.com:9001"
});

app.listen(9001);
