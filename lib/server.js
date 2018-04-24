import config from './config';
import express from 'express';
import serverRenderer from './renderers/server';
import { data } from './testData';

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
  const initialContent = serverRenderer();
  res.render('index', { initialContent });
});

app.get('/data', (req, res) => {
  res.send(data);
});

app.listen(config.port, function listenHandler() {
  console.info(`Running on ${config.port}...`);
});