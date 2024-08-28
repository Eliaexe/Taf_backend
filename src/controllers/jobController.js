import { searchJobs, loadMoreJobs } from '../services/jobService.js';

export const searchJobsController = async (req, res, next) => {
  try {
    const { jobTitle, jobLocation } = req.body;
    const result = await searchJobs(jobTitle, jobLocation);
    res.status(result.status).json(result.data);
  } catch (error) {
    next(error);
  }
};

export const loadMoreJobsController = async (req, res, next) => {
  try {
    const { jobTitle, jobLocation, viewedJobs, page = 1 } = req.body;
    const result = await loadMoreJobs(jobTitle, jobLocation, viewedJobs, page);
    res.status(result.status).json(result.data);
  } catch (error) {
    next(error);
  }
};