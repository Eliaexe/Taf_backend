import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './.db.js';
// import jobRoutes from '../src/routes/jobRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

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
// routes
import { searchJobsController, loadMoreJobsController } from './controllers/jobController.js';

const router = express.Router();

router.post('/search', searchJobsController);
router.post('/load-more', loadMoreJobsController);

// export default router;

app.use('/api/jobs', jobRoutes);

app.use(errorHandler);

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.clear();
  console.log(`Server in ascolto sulla porta ${port}`);
});