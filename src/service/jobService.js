import Job from '../models/Job.js';
import requestHellowork from '../requests/hellowork.js';

export const searchJobs = async (jobTitle, jobLocation) => {
  try {
    // Avvia la ricerca Hellowork in background
    requestHellowork(jobTitle, jobLocation).catch(error => {
      console.error('Errore in requestHellowork:', error);
    });

    // Aspetta 5 secondi
    await new Promise(resolve => setTimeout(resolve, 5000));

    const jobs = await Job.aggregate([
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
        $limit: 20
      }
    ]);

    if (jobs.length > 0) {
      const totalJobs = await Job.countDocuments({ 
        $text: { $search: jobTitle, $caseSensitive: false, $diacriticSensitive: false }
      });

      return {
        status: 200,
        data: {
          jobs,
          currentPage: 1,
          totalPages: Math.ceil(totalJobs / 20),
          totalJobs,
        }
      };
    } else {
      return {
        status: 404,
        data: { message: 'Nessuna offerta di lavoro trovata per questa ricerca.' }
      };
    }
  } catch (error) {
    console.error('Errore durante la ricerca dei lavori:', error);
    throw error;
  }
};

export const loadMoreJobs = async (jobTitle, jobLocation, viewedJobs, page) => {
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  try {
    const query = {
      $and: [
        { $text: { $search: jobTitle, $caseSensitive: false, $diacriticSensitive: false } },
        { _id: { $nin: viewedJobs } }
      ]
    };

    const totalJobs = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(pageSize);

    if (jobs.length === 0) {
      return {
        status: 404,
        data: { message: 'Nessuna nuova offerta di lavoro disponibile.' }
      };
    }

    return {
      status: 200,
      data: {
        jobs,
        currentPage: page,
        totalPages: Math.ceil(totalJobs / pageSize),
        totalJobs
      }
    };
  } catch (error) {
    console.error('Errore durante il caricamento di più lavori:', error);
    throw error;
  }
};