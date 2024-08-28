import { saveJobIfNotExists } from "./utilityFunctions.js";

// Funzione per standardizzare i lavori da Welcome to the Jungle
function standardizeWTTJJob(job) {
  return {
    id: job.reference || "",
    original_site_id: job.objectID || "",
    title: job.name || "",
    company: {
      name: job.organization?.name || "",
      location: job.offices?.[0]
        ? `${job.offices[0].city}, ${job.offices[0].district}, ${job.offices[0].state}, ${job.offices[0].country}`
        : "",
      description: job.organization?.description || "",
      industry: job.sectors?.map(sector => sector.name).join(", ") || "",
    },
    experience: {
      years_required: job.experience_level_minimum || "",
      education_required: job.education_level || "",
    },
    role_in_the_company: job.new_profession?.pivot_name || "",
    type_of_contract: job.contract_type || "",
    remote_work: job.remote || "",
    job_offer_body: job.profile
      ? job.profile
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/\s+/g, ' ')
          .trim()
      : "",
    benefits: job.benefits || [],
    date_posted: job.published_at_date || "",
    salary: {
      min: job.salary_minimum || "",
      max: job.salary_maximum || "",
      currency: job.salary_currency || "",
    },
    original_website: "Welcome to the Jungle",
    skills_required: {
      hard_skills: job.profile
        ? (job.profile.toLowerCase().match(/compétences[^:]*:([\s\S]*?)(?:\n\n|\Z)/i) || [])[1]?.split(',').map(skill => skill.trim()) || []
        : [],
      soft_skills: [],
    },
    languages: job.profile && job.profile.toLowerCase().includes("anglais") ? ["Anglais"] : [],
    notes: [],
  };
}

// Funzione per standardizzare i lavori da HelloWork
function standardizeHelloWorkJob(job) {
  return {
    id: job?.Ref || job?.Id || "",
    original_site_id: job?.Id || "",
    title: job?.OfferTitle || "",
    company: {
      name: job?.CompanyName || "",
      location: job?.Localisation || "",
    },
    type_of_contract: job?.ContractType || "",
    remote_work: job?.Telework || "",
    job_offer_body: job?.Description ? job.Description.replace(/\n/g, " ").trim() : "",
    date_posted: job?.PublishDate || "",
    original_job_url: job?.UrlOffre ? "https://www.hellowork.com" + job.UrlOffre : "",
    original_website: "HelloWork",
    salary: job?.DisplayedSalary ? {
      min: job.DisplayedSalary.split(" - ")[0] || "",
      max: job.DisplayedSalary.split(" - ")[1] || "",
      currency: "EUR",
    } : {},
    application_deadline: job?.PublishDate ? new Date(job.PublishDate).toISOString().split("T")[0] : "",
    notes: [
      ...(job?.Tags?.map(tag => tag.Label) || []),
      ...(job?.SeoTags?.map(seoTag => seoTag.Label) || []),
    ],
  };
}

// Funzione per standardizzare i lavori da LinkedIn
function standardizeLinkedInJob(job) {
  return {
    id: "",
    original_site_id: "",
    title: job?.title || "",
    company: {
      name: job?.company || "",
      location: job?.location || "",
    },
    job_offer_body: job?.description || "",
    date_posted: job?.date || "",
    original_job_url: job?.url || "",
    original_website: "LinkedIn",
    salary: {},
    notes: [],
  };
}

// Funzione per standardizzare i lavori da Talent
function standardizeTalentJob(job) {
  const dayFormatted = (str) => {
    const date = new Date();
    if (str.includes("Il y a plus de 30 jours")) {
      return new Date(date.setMonth(date.getMonth() - 1));
    }
    const matches = str.match(/\d+/g);
    if (matches) {
      const daysAgo = parseInt(matches[0], 10);
      return new Date(date.setDate(date.getDate() - daysAgo));
    }
    return date;
  };

  return {
    id: job?.id || "",
    original_site_id: job?.id || "",
    title: job?.title || "",
    company: {
      name: job?.companyName || "",
      location: job?.location || "",
    },
    job_offer_body: job?.description.replace(/\n/g, '<br>').trim() || "",
    date_posted: dayFormatted(job?.day)?.toISOString().split("T")[0] || "",
    original_job_url: job?.link || "",
    original_website: "Talent",
    salary: {},
    notes: [],
  };
}

// Funzione principale per standardizzare gli oggetti
export async function standardizeObjects(site, data) {
  if (!data || data.error) {
    return [];
  }

  console.log('Start processing data');

  const standardizedData = data.map((job) => {
    switch (site) {
      case "wttj":
        return standardizeWTTJJob(job);
      case "hellowork":
        return standardizeHelloWorkJob(job);
      case "linkedin":
        return standardizeLinkedInJob(job);
      case "talent":
        return standardizeTalentJob(job);
      default:
        console.error("Unsupported site:", site);
        return null;
    }
  }).filter(job => job !== null);

  for (const job of standardizedData) {
    await saveJobIfNotExists(job) 
  }

  return standardizedData;
}
