import mongoose from 'mongoose';

// Definisci lo schema per l'offerta di lavoro
const jobSchema = new mongoose.Schema({
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
    application_deadline: String,
    date_posted: String,
    work_schedule: String,
    salary: {
        min: String,
        max: String,
        currency: String,
    },
    original_job_url: String,
    original_website: String,
    level: String,
    languages: [String],
    notes: [String],
});

// Crea un modello Mongoose basato sullo schema
const Job = mongoose.model('Job', jobSchema);

export default Job;
