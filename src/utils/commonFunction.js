import Job from "../models/Job.js";

export function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

export async function setParams(str) {
  return str.replace(/ /g, "+");
}


export const saveJobIfNotExists = async (jobData) => {
  try {
    const existingJob = await Job.findOne({ original_site_id: jobData.original_site_id });
    if (!existingJob) {
      const newJob = new Job(jobData);
      await newJob.save();
      // console.log('Job salvato:', jobData.original_site_id);
    } else {
      // console.log('Job già esistente:', jobData.original_site_id);
    }
  } catch (error) {
    console.error('Errore durante il salvataggio del lavoro:', error);
  }
};
