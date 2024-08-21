const jobObject = {
  id: "",
  original_site_id: "",
  title: "",
  company: {
    name: "",
    location: "",
    description: "",
    industry: "",
    website: "",
    contact: {
      email: "",
      phone: "",
    },
  },
  skills_required: {
    hard_skills: [""],
    soft_skills: [""],
  },
  experience: {
    years_required: "",
    education_required: "",
  },
  role_in_the_company: "",
  type_of_contract: "",
  remote_work: "",
  job_offer_body: "",
  benefits: [""],
  responsibilities: [""],
  application_deadline: "",
  date_posted: "",
  work_schedule: "",
  salary: {
    min: "",
    max: "",
    currency: "",
  },
  original_job_url: "",
  original_website: "",
  level: "",
  languages: [""],
  notes: [""],
};

export function standardizeObjects(site, data) {
  if (!data) { return []; }  
  console.log(typeof data)
  
  const standardizedData = data?.map((job) => {
    if (site === "figarojobs") {
      const standardizedJob = Object.assign({}, jobObject);

      standardizedJob.original_site_id = job?.id;
      standardizedJob.original_job_url =
        "https://emploi.lefigaro.fr" + job?.link;
      standardizedJob.title = job?.title;
      standardizedJob.company.name = job?.companyName;
      standardizedJob.date_posted = job?.publicationDate;
      standardizedJob.notes = job?.otherInfo;
      standardizedJob.job_offer_body = job?.description;
      standardizedJob.original_website = site;

      return standardizedJob;
    } else if (site === "hellowork") {
      const standardizedJob = Object.assign({}, jobObject);

      standardizedJob.original_site_id = job?.Id;
      standardizedJob.title = job?.OfferTitle;
      standardizedJob.company.name = job?.CompanyName;
      standardizedJob.company.location = job?.Localisation;
      standardizedJob.type_of_contract = job?.ContractType;
      standardizedJob.remote_work = job?.Telework;
      standardizedJob.date_posted = job?.PublishDate;
      standardizedJob.original_website = site;
      standardizedJob.original_job_url =
        "https://www.hellowork.com" + job?.UrlOffre;

      if (job?.Telework) {
        standardizedJob.remote_work = job.Telework.includes("Télétravail");
      }
      let description = job?.Description.replace(/\n/g, " ");

      standardizedJob.job_offer_body = description;

      if (job?.DisplayedSalary) {
        standardizedJob.salary.min = job?.DisplayedSalary.split(" - ")[0];
        standardizedJob.salary.max = job?.DisplayedSalary.split(" - ")[1];
        standardizedJob.salary.currency = job?.DisplayedSalary.split(" ")[3];
      }

      standardizedJob.application_deadline = job?.PublishDate
        ? new Date(job.PublishDate).toISOString().split("T")[0]
        : null;

      const notes = [];

      if (job?.Tags) {
        job.Tags.forEach((tag) => {
          notes.push(tag.Label);
        });
        job.Ctiterios.forEach((tag) => {
          notes.push(tag);
        });
      }
      if (job?.SeoTags) {
        job.SeoTags.forEach((seoTag) => {
          notes.push(seoTag.Label);
        });
      }
      standardizedJob.notes = notes;
      return standardizedJob;
    } else if (site == "indeed") {
      const standardizedJob = Object.assign({}, jobObject);
      standardizedJob.original_site_id = job?.id;
      standardizedJob.title = job?.title;
      standardizedJob.original_job_url = job.link;
      standardizedJob.company.name = job?.company?.name;
      standardizedJob.company.location = job?.company?.location;
      standardizedJob.salary.min = job?.salary;
      standardizedJob.notes = [job?.jk, job?.empn];
      // standardizedJob.date_posted = job?.PublishDate;
      standardizedJob.original_website = site;
      standardizedJob.job_offer_body = job?.job_offer_body.split("\n")[0];

      return standardizedJob;
    } else if (site == "jooble") {
      const standardizedJob = Object.assign({}, jobObject);
      standardizedJob.original_job_url = job.url;
      standardizedJob.original_site_id = job?.uid;
      standardizedJob.date_posted = job?.dateCaption;
      standardizedJob.job_offer_body = job?.fullContent
        ?.replace(/<[^>]*>/g, "")
        .replace(/&#[0-9]+;/g, (match) =>
          String.fromCharCode(match.match(/[0-9]+/))
        )
        .split("\n")
        .filter((line) => line.trim().startsWith("-"))
        .map((line) => line.trim().substring(1));
      standardizedJob.title = job?.position;
      standardizedJob.company.name = job?.company?.name;
      standardizedJob.company.location = job?.location?.name;
      standardizedJob.notes = [];
      if (job?.highlightTags) {
        standardizedJob.notes = standardizedJob.notes.concat(job.highlightTags);
      }
      if (job?.tags) {
        standardizedJob.notes = standardizedJob.notes.concat(job.tags);
      }
      standardizedJob.notes = standardizedJob.notes.filter(Boolean);
      standardizedJob.original_website = site;

      return standardizedJob;
    } else if (site == "meteojob") {
      const standardizedJob = Object.assign({}, jobObject);
      standardizedJob.original_site_id = job?.id;
      standardizedJob.title = job?.title;
      standardizedJob.original_job_url = job.url.jobOffer;
      standardizedJob.company.name = job?.company?.name;
      standardizedJob.company.location = job?.locality;
      standardizedJob.salary.min = job?.salary?.from;
      standardizedJob.salary.max = job?.salary?.to;
      standardizedJob.salary.currency = job?.salary?.currency;
      standardizedJob.date_posted = job?.publicationDate;
      standardizedJob.original_website = site;
      standardizedJob.job_offer_body = job?.description?.split("\n")[0];

      const notes = [];

      if (job?.labels) {
        notes.push(job?.labels);
      }

      if (job?.metaTags) {
        notes.push(...job?.metaTags.map((tag) => tag.Label));
      }

      standardizedJob.notes = notes;

      return standardizedJob;
    } else if (site == "linkedin") {
      const standardizedJob = Object.assign({}, jobObject);
      standardizedJob.original_job_url = job.link;
      standardizedJob.title = job?.title;
      standardizedJob.company.name = job?.company;
      standardizedJob.company.location = job?.location;
      standardizedJob.date_posted = job?.publication;
      standardizedJob.job_offer_body = job?.offerBody;
      return standardizedJob;
    } else if (site == "wttj") {
      const standardizedJob = Object.assign({}, jobObject);
      standardizedJob.title = job?.title;
      standardizedJob.original_job_url = job.link;
      standardizedJob.company.name = job?.company?.name;
      standardizedJob.company.location = job?.company?.location;
      standardizedJob.job_offer_body = job?.job_offer_body;
      standardizedJob.date_posted = job?.job_offer_publication;
      standardizedJob.notes = job?.job_offer_body_tags;
      standardizedJob.original_website = "Welcome to the jungle";

      return standardizedJob;
    } else if (site == "talent") {
      const standardizedJob = Object.assign({}, jobObject);
      standardizedJob.original_site_id = job?.id;
      standardizedJob.title = job?.title;
      standardizedJob.company.name = job?.companyName;
      standardizedJob.company.location = job?.location;
      standardizedJob.date_posted = job?.day;
      standardizedJob.job_offer_body = job?.description;
      standardizedJob.original_website = site;
      return standardizedJob;
    } else if(site == "monster") {
      standardizedJob.original_site_id = job?.jobId;
      standardizedJob.date_posted = job?.jobPosting?.url;
      standardizedJob.application_deadline = job?.jobPosting?.validThrough
      standardizedJob.title = job?.jobPosting?.title;
      standardizedJob.company.name = job?.jobPosting?.hiringOrganization?.name;
      standardizedJob.company.location = job?.jobPosting?.jobLocation[0].address.addressLocality;
      standardizedJob.original_job_url = job?.jobPosting?.link;
      standardizedJob.role_in_the_company = job?.normalizedJobPosting?.occupationalCategory

// searcing for big description

      standardizedJob.languages.push(job?.enrichments?.language?.languageCode)
      standardizedJob.original_website = site;
    } else {
      console.error("Sito non supportato:", site);
      return [];
    }
  });
  return standardizedData;
}
