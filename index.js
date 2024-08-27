import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './.db.js';
import requestTalent from './requests/talent.js';
// import requestMonster from './requests/monster.js';
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('files'));

const port = process.env.PORT || 3001;

// Funzione per salvare l'offerta di lavoro solo se non esiste già
const saveJobIfNotExists = async (jobData) => {
  try {
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

// Funzione per eseguire la ricerca e il salvataggio in background
const performSearchAndSave = async (jobTitle, jobLocation) => {
  try {
    let getOffersFn = [
      requestTalent(jobTitle, jobLocation),
      requestLinkedin(jobTitle, jobLocation),
      requestHellowork(jobTitle, jobLocation),
      // requestMonster(jobTitle, jobLocation)
    ];

    const results = await Promise.all(getOffersFn);
    const allJobs = results.flat();
    const standardizedJobs = standardizeObjects(allJobs);

    for (const job of standardizedJobs) {
      await saveJobIfNotExists(job);
    }

    console.log('Ricerca e salvataggio completati in background');
  } catch (error) {
    console.error('Errore durante la ricerca e il salvataggio in background:', error);
  }
};

// Route per la ricerca iniziale
app.post('/', async (req, res) => {
  const { jobTitle, jobLocation, page = 1 } = req.body;
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  try {
    // Avvia la ricerca e il salvataggio in background
    await performSearchAndSave(jobTitle, jobLocation);

    // Esegui la ricerca nel database
    const query = {
      $and: [
        { title: { $regex: jobTitle, $options: 'i' } },
        { location: { $regex: jobLocation, $options: 'i' } }
      ]
    };

    const totalJobs = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(pageSize);

    if (jobs.length === 0) {
      return res.status(404).json({ message: 'Nessuna offerta di lavoro trovata per questa ricerca.' });
    }

    res.status(200).json({
      jobs,
      currentPage: page,
      totalPages: Math.ceil(totalJobs / pageSize),
      totalJobs
    });
  } catch (error) {
    console.error('Errore durante la ricerca dei lavori:', error);
    res.status(500).json({ error: 'Si è verificato un errore durante la ricerca dei lavori.' });
  }
});

// Route per caricare più offerte di lavoro
app.post('/load-more', async (req, res) => {
  const { jobTitle, jobLocation, viewedJobs, page = 1 } = req.body;
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  try {
    const query = {
      $and: [
        { title: { $regex: jobTitle, $options: 'i' } },
        { location: { $regex: jobLocation, $options: 'i' } },
        { _id: { $nin: viewedJobs } }
      ]
    };

    const totalJobs = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(pageSize);

    if (jobs.length === 0) {
      return res.status(404).json({ message: 'Nessuna nuova offerta di lavoro disponibile.' });
    }

    res.status(200).json({
      jobs,
      currentPage: page,
      totalPages: Math.ceil(totalJobs / pageSize),
      totalJobs
    });
  } catch (error) {
    console.error('Errore durante il caricamento di più lavori:', error);
    res.status(500).json({ error: 'Si è verificato un errore durante il caricamento di più lavori.' });
  }
});

app.listen(port, () => {
  console.clear();
  console.log(`Server in ascolto sulla porta ${port}`);
});