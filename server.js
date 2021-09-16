const express = require('express');
const Ably = require('ably');
const app = express();

let ably = new Ably.Realtime(process.env.API_KEY);

app.use(express.static('public'));

app.set('view engine', 'ejs');

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.render('index');
})

app.get('/game', function(req, res) {
  res.redirect('/game/' + randomInt(0, 1000000));
});

app.get('/game/:id', function(req, res) {
  res.render('game', { 'id': req.params.id });
});

app.get('/token', function(req, res) {
  ably.auth.createTokenRequest({ clientId: '*' }, function(err, tokenRequest) {
    if(err) {
      console.log('An error occurred; err = ' + err.message);
    } 
    res.send(tokenRequest);
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}