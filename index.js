import express from 'express';
import cors from 'cors';

import requestTalent from './requests/talent.js';
import requestMonster from './requests/monster.js';
import requestHellowork from './requests/hellowork.js';

import { standardizeObjects } from './utils/dataStandardizer.js';
import sortPertinentsJobs from './utils/mostPertinent.js';

const app = express();
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true,
};

app.use(cors(corsOptions));
const port = 3001;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/', async (req, res) => {
  console.log('Nuova ricerca avviata');

  const { jobTitle, jobLocation } = req.body;

  let totalRequests = []

  // Imposta gli headers per lo streaming
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Transfer-Encoding': 'chunked'
  });

  // Funzione per inviare i dati parziali
  const sendPartialResponse = (name, response) => {
    if (response == []) {
      res.write([])
    } else {

      let formattedData = standardizeObjects(name, response);
      totalRequests.push(...formattedData)
      let sortedJobs = sortPertinentsJobs(formattedData, jobTitle, jobLocation);
      res.write(JSON.stringify(sortedJobs));
    }
  };

  // Gestione indipendente delle richieste
  handleRequest('talent', () => requestTalent(jobTitle, jobLocation));
  handleRequest('monster', () => requestMonster(jobTitle, jobLocation));
  handleRequest('hellowork', () => requestHellowork(jobTitle, jobLocation));

  // Funzione per gestire le promesse e inviare i dati
  async function handleRequest(name, requestFn) {
    try {
      const response = await requestFn();
      console.log(`${name} risposta ricevuta`);
      sendPartialResponse(name, response);
    } catch (error) {
      console.error(`Errore nella richiesta ${name}:`, error);
      sendPartialResponse(name, { error: 'Si è verificato un errore' });
    }
  }


  // Non chiudere la risposta finché non sono terminate tutte le richieste
  res.on('close', () => {
    console.log(totalRequests);
    console.log('La connessione è stata chiusa dal client.');
    res.end();
  });
});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});