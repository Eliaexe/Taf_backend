import express from 'express';
import { searchJobsController, loadMoreJobsController } from '../controllers/jobController.js';

const router = express.Router();

router.post('/search', searchJobsController);
router.post('/load-more', loadMoreJobsController);

export default router;