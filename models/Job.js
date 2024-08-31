import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  id: String,
  original_site_id: String,
  title: String,
  company: {
    name: String,
    location: String,
    description: String,
    industry: String,
    website: String,
    contact: {
      email: String,
      phone: String,
    },
  },
  skills_required: {
    hard_skills: [String],
    soft_skills: [String],
  },
  experience: {
    years_required: String,
    education_required: String,
  },
  role_in_the_company: String,
  type_of_contract: String,
  remote_work: String,
  job_offer_body: String,
  benefits: [String],
  responsibilities: [String],
  application_deadline: Date,
  date_posted: Date,
  work_schedule: String,
  salary: {
    min: Number,
    max: Number,
    currency: String,
  },
  original_job_url: String,
  original_website: String,
  level: String,
  languages: [String],
  notes: [String],
});

// Creazione dell'indice full-text
JobSchema.index({ title: 'text', job_offer_body: 'text' });

const Job = mongoose.model('Job', JobSchema);

export default Job;
