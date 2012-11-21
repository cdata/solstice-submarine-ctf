var express = require('express');
var app = express();

app.enable('trust proxy')
  .use(express.bodyParser())
  .use(express.cookieParser())
  .use(express.session({
    secret: 'solsticesub'
  }))
  .use(express.static('static'));

require('express-persona')(app, {
  audience: 'https://solsticesub.com'
});

app.listen(9001);
