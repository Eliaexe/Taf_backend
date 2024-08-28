import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import natural from 'natural';
import connectDB from './.db.js';
import { updateJobsWithDistance } from './utils/geocoding.js';
import Job from './models/Job.js';
import { calculateDistance } from './utils/distanceCalculator.js';

const { WordTokenizer, TfIdf } = natural;
const tokenizer = new WordTokenizer();
const tfidf = new TfIdf();

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

const performSearchAndSave = async (jobTitle, jobLocation) => {
  try {
    // Placeholder for background job search and save
  } catch (error) {
    console.error('Errore durante la ricerca e il salvataggio in background:', error);
  }
};

function cosineSimilarity(vec1, vec2) {
  const dotProduct = Object.keys(vec1).reduce((sum, key) => sum + vec1[key] * (vec2[key] || 0), 0);
  const mag1 = Math.sqrt(Object.values(vec1).reduce((sum, val) => sum + val * val, 0));
  const mag2 = Math.sqrt(Object.values(vec2).reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (mag1 * mag2);
}

app.post('/api/jobs/search', async (req, res) => {
  const { jobTitle, jobLocation, page = 1 } = req.body;
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  try {
    performSearchAndSave(jobTitle, jobLocation).catch(error => {
      console.error('Errore in performSearchAndSave:', error);
    });

    await new Promise(resolve => setTimeout(resolve, 5000));

    const referenceTokens = tokenizer.tokenize(jobTitle.toLowerCase());
    tfidf.addDocument(referenceTokens);

    const allJobs = await Job.aggregate([
      {
        $match: {
          $text: {
            $search: jobTitle,
            $caseSensitive: false,
            $diacriticSensitive: false
          }
        }
      },
      {
        $addFields: {
          score: { $meta: "textScore" }
        }
      },
      {
        $match: {
          score: { $gt: 0.5 }
        }
      },
      {
        $sort: { score: -1 }
      },
      {
        $limit: 100 // Fai in modo che la query restituisca un numero maggiore di lavori per il successivo filtraggio
      }
    ]);

    const jobsWithSimilarity = allJobs.map(job => {
      const jobTokens = tokenizer.tokenize(job.title.toLowerCase());
      tfidf.addDocument(jobTokens);

      const referenceVector = {};
      const jobVector = {};

      referenceTokens.forEach(token => {
        referenceVector[token] = tfidf.tfidf(token, 0);
      });

      jobTokens.forEach(token => {
        jobVector[token] = tfidf.tfidf(token, 1);
      });

      const similarity = cosineSimilarity(referenceVector, jobVector);

      return { ...job.toObject(), similarity }; // Convert to plain object
    });

    const filteredJobs = jobsWithSimilarity.map(async job => {
      if (!job.company.location || !job.company.location.lat || !job.company.location.lon) {
        const { latitude, longitude } = await updateJobsWithDistance(resolvedJobs, coordinates);
(job.company.location);
        job.company.location = { lat: latitude, lon: longitude };
        await Job.updateOne({ _id: job._id }, { $set: { 'company.location': job.company.location } });
      }
      return job;
    });

    const resolvedJobs = await Promise.all(filteredJobs);
    let coordinates = await getCoordinates(jobLocation);

    const jobsWithDistance = resolvedJobs.map(job => {
      const jobLat = parseFloat(job.company.location.lat || 0);
      const jobLon = parseFloat(job.company.location.lon || 0);
      const userLat = parseFloat(coordinates.latitude);
      const userLon = parseFloat(coordinates.longitude);
      const distance = calculateDistance(userLat, userLon, jobLat, jobLon);

      return { ...job, distance };
    });

    const sortedJobs = jobsWithDistance
      .sort((a, b) => a.distance - b.distance || b.similarity - a.similarity);

    const paginatedJobs = sortedJobs.slice(skip, skip + pageSize);

    if (paginatedJobs.length > 0) {
      const totalJobs = sortedJobs.length;

      res.status(200).json({
        jobs: paginatedJobs,
        currentPage: page,
        totalPages: Math.ceil(totalJobs / pageSize),
        totalJobs,
      });
    } else {
      res.status(404).json({ message: 'Nessuna offerta di lavoro trovata per questa ricerca.' });
    }
  } catch (error) {
    console.error('Errore durante la ricerca dei lavori:', error);
    res.status(500).json({ error: 'Si è verificato un errore durante la ricerca dei lavori.' });
  }
});

app.listen(port, () => {
  console.clear();
  console.log(`Server in ascolto sulla porta ${port}`);
});
