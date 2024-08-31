const Job = require('../models/Job');

const searchJobs = async (req, res) => {
    try {
        const { keywords, page = 1, perPage = 10, jobTitle, jobLocation, minSalary } = req.query;

        const filter = {};

        if (keywords) {
            filter.$text = { $search: keywords };
        }

        if (jobTitle) {
            filter.title = new RegExp(jobTitle, 'i');
        }

        if (jobLocation) {
            filter['company.location'] = new RegExp(jobLocation, 'i');
        }

        if (minSalary) {
            filter['salary.min'] = { $gte: minSalary };
        }

        const skip = (page - 1) * perPage;

        const jobs = await Job.find(filter).skip(skip).limit(perPage);

        if (jobs.length === 0) {
            return res.status(204).json({ message: 'Nessuna offerta trovata per i criteri di ricerca forniti.' });
        }

        res.json(jobs);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Si è verificato un errore durante la ricerca delle offerte di lavoro.' });
    }
};

module.exports = { searchJobs };