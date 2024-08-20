function calculateJobScore(job, userTitle, userLocation) {

    let score = 0;

    const jobTitle = job.title.toLowerCase();
    const userTitleLower = userTitle.toLowerCase();

    if (jobTitle === userTitleLower) {
        score += 30;
    } else if (jobTitle.includes(userTitleLower)) {
        score += 20;
    } else {
        score += 10;
    }

    const jobLocation = job.company.location.toLowerCase();
    const userLocationLower = userLocation.toLowerCase();

    if (jobLocation === userLocationLower) {
        score += 30;
    } else if (jobLocation.includes(userLocationLower)) {
        score += 20;
    } else {
        score += 10;
    }

    return score;
}

export default function sortPertinentsJobs(jobs, userTitle, userLocation) {    
    const scoredJobs = jobs
        .filter(job => job.title && job.company && job.company.location)
        .map(job => ({
            ...job,
            score: calculateJobScore(job, userTitle, userLocation),
        }));

    return scoredJobs.sort((a, b) => b.score - a.score);
}

