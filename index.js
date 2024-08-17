import express from 'express';
import requestHellowork from './requests/hellowork.js';
import requestTalent from './requests/talent.js';
// import requestJooble from './requests/jooble.js';
import { requestMeteojob } from './requests/meteojob.js';

import { standardizeObjects } from './utils/dataStandardizer.js';

const app = express();
const port = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/', async (req, res) => {
  const { jobTitle, jobLocation } = req.body;

  // Imposta gli headers per lo streaming
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Transfer-Encoding': 'chunked'
  });

  // Funzione per inviare i dati al client
  const sendData = (name, data) => {
    console.log(data);
    
    let dataToSend = standardizeObjects(name, data);
        
    res.write(JSON.stringify(dataToSend) + '\n');
  };

  // Array di promesse per tutte le richieste
  const requests = [
    { name: 'hellowork', promise: requestHellowork(jobTitle, jobLocation) },
    { name: 'talent', promise: requestTalent(jobTitle, jobLocation) },
    // { name: 'Jooble', promise: requestJooble(jobTitle, jobLocation) },
    // { name: 'Meteojob', promise: requestMeteojob(jobTitle, jobLocation) }
  ];

  // Funzione per gestire ogni richiesta individualmente
  const handleRequest = async (request) => {
    try {
      const data = await request.promise;
      if (data !== undefined || null) {
        sendData(request.name, data);
      }
    } catch (error) {
      console.error(`Error fetching ${request.name}:`, error);
      sendData(request.name, { error: error.message });
    }
  };

  // Avvia tutte le richieste in parallelo
  for (const request of requests) {
    handleRequest(request);
  }

  // Non chiudere la connessione fino a quando tutte le richieste non sono state completate
  await Promise.all(requests.map(r => r.promise));

  // Chiudi la connessione
  res.end();
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
