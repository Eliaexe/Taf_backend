import express from 'express';
import Job from '../models/Job.js';

const router = express.Router();

// Endpoint per la ricerca delle offerte di lavoro
router.get('/search', async (req, res) => {
  console.log(req.query);  // Changed from req.body to req.query
  try {
    const { keywords, page = 1, perPage = 10, jobTitle, jobLocation, minSalary } = req.query;
    // Crea un filtro di ricerca basato sui parametri forniti
    const filter = {};
    if (keywords) {
      filter.$text = { $search: keywords }; // Assuming text index is created on relevant fields
    }
    if (jobTitle) {
      filter.title = new RegExp(jobTitle, 'i');
    }
    if (jobLocation) {
      filter['company.location'] = new RegExp(jobLocation, 'i');
    }
    if (minSalary) {
      filter['salary.min'] = { $gte: parseInt(minSalary) };
    }
    // Calcolo per paginazione
    const skip = (parseInt(page) - 1) * parseInt(perPage);
    // Query al database
    const jobs = await Job.find(filter).skip(skip).limit(parseInt(perPage));
    console.log(jobs);
    // Verifica se sono stati trovati risultati
    if (jobs.length === 0) {
      return res.status(204).json({ message: 'Nessuna offerta trovata per i criteri di ricerca forniti.' });
    }
    // Restituisci i risultati
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Si è verificato un errore durante la ricerca delle offerte di lavoro.' });
  }
});

router.post('/load-more', async (req, res) => {
  try {
    const { viewedJobs, filters, page = 1, perPage = 10 } = req.body;

    // Create a filter to exclude already viewed jobs
    const filter = {
      _id: { $nin: viewedJobs },
      ...filters  // Apply any additional filters from the original search
    };

    // Calculate how many jobs to skip
    const skip = (page - 1) * perPage;

    // Query the database for new jobs
    let newJobs = await Job.find(filter)
      .skip(skip)
      .limit(perPage * 2);  // Fetch double the amount to ensure we have enough

    // If we don't have at least 10 new jobs, fetch more without skip
    if (newJobs.length < 10) {
      newJobs = await Job.find(filter).limit(10);
    }

    // Slice to return only 10 jobs (or all if less than 10)
    const jobsToReturn = newJobs.slice(0, 10);

    if (jobsToReturn.length === 0) {
      return res.status(204).json({ message: 'Nessuna nuova offerta trovata.' });
    }

    res.json(jobsToReturn);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Si è verificato un errore durante il caricamento di più offerte di lavoro.' });
  }
});


export default router;
