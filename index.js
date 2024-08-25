import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose'; // Importa Mongoose
import dotenv from 'dotenv'; // Importa dotenv
import connectDB from './.db.js';// Importa la funzione di connessione al DB
import requestTalent from './requests/talent.js';
import requestMonster from './requests/monster.js';
import requestHellowork from './requests/hellowork.js';
import requestLinkedin from './requests/linkedin.js';
import { standardizeObjects } from './utils/dataStandardizer.js';
import sortPertinentsJobs from './utils/mostPertinent.js';
import Job from './models/Job.js';
dotenv.config();

connectDB();

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

app.use(express.static('files'));

// Route per caricare più offerte di lavoro
app.post('/load-more', async (req, res) => {
    const { jobTitle, jobLocation, viewedJobs } = req.body;

    try {
        // Filtra le offerte che l'utente ha già visto
        const unseenJobs = await Job.find({
            _id: { $nin: viewedJobs }
        }).limit(10);

        res.status(200).json(unseenJobs);
    } catch (error) {
        console.error(`Errore nella richiesta di lavori:`, error);
        res.status(500).json({ error: 'Si è verificato un errore durante la richiesta di lavori.' });
    }
});

// Funzione per salvare l'offerta di lavoro solo se non esiste già
const saveJobIfNotExists = async (jobData) => {
  try {
    console.log('Salvando job:', jobData);
    const existingJob = await Job.findOne({ original_site_id: jobData.original_site_id });
    if (!existingJob) {
      const newJob = new Job(jobData);
      await newJob.save();
      console.log('Job salvato:', jobData.original_site_id);
    } else {
      console.log('Job già esistente:', jobData.original_site_id);
    }
  } catch (error) {
    console.error('Errore durante il salvataggio del lavoro:', error);
  }
};


// Route per la ricerca iniziale
app.post('/', async (req, res) => {
  const { jobTitle, jobLocation } = req.body;
  const testRequests = async () => {
    console.log('Start', jobTitle, jobLocation)
    try {
      const talentJobs = await requestTalent(jobTitle, jobLocation);
      // const monsterJobs = await requestMonster('Developer', 'bretigny sur orge');
      // const helloworkJobs = await requestHellowork('Developer', 'bretigny sur orge');
      // const linkedinJobs = await requestLinkedin('Developer', 'bretigny sur orge');
  
      console.log('Talent:', talentJobs);
      // console.log('Monster:', monsterJobs);
      // console.log('Hellowork:', helloworkJobs);
      // console.log('Linkedin:', linkedinJobs);
    } catch (error) {
      console.error('Errore nelle richieste:', error);
    }
  };

  let data = await testRequests()
  
  // await testRequests();
  res.status(200).json(JSON.stringify(data));
  
  // console.log('Nuova ricerca avviata');

  // const { jobTitle, jobLocation } = req.body;

  // if (!jobTitle || !jobLocation) {
  //   return res.status(400).json({ error: 'jobTitle e jobLocation sono richiesti.' });
  // }

  // try {
  //   const requestFunctions = [
  //     requestTalent(jobTitle, jobLocation),
  //     requestMonster(jobTitle, jobLocation),
  //     requestHellowork(jobTitle, jobLocation),
  //     requestLinkedin(jobTitle, jobLocation)
  //   ];

  //   const responses = await Promise.all(requestFunctions);
  //   const jobs = responses.flat();

  //   console.log('Jobs ricevuti:', jobs);

  //   // Salva i lavori nel database solo se non esistono già
  //   await Promise.all(jobs.map(saveJobIfNotExists));

  //   // Ordina i risultati per pertinenza e prendi i primi 10
  //   const sortedJobs = sortPertinentsJobs(jobs, jobTitle, jobLocation);
  //   const top10Jobs = sortedJobs.slice(0, 10);

  //   console.log('Top 10 Jobs:', top10Jobs);

  //   res.status(200).json(top10Jobs);
  // } catch (error) {
  //   console.error('Errore durante l\'elaborazione delle richieste:', error);
  //   res.status(500).json({ error: 'Si è verificato un errore durante l\'elaborazione delle richieste.' });
  // }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
