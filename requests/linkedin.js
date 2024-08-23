import { JSDOM } from "jsdom";
import { delay } from "../utils/commonFunction.js";

let options = {
    method: 'GET',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.google.com/'
    }
}

async function getOffers(title, location, count) {
    let response = await fetch(`https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${title}&location=${location}&trk=public_jobs_jobs-search-bar_search-submit&position=0&pageNum=0&start=${count}`,
        options);

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const jobCards = document.querySelectorAll('li')

    let results = [];

    jobCards.forEach(async (card) => {

        let url = card.querySelector('a').href
        let title = card.getElementsByClassName('base-search-card__title')[0].textContent.trim();
        let company = card.getElementsByClassName('base-search-card__subtitle')[0].textContent.trim();
        let location = card.getElementsByClassName('job-search-card__location')[0].textContent.trim();
        let date = card.querySelector('time').dateTime
        results.push({ url, title, company, location, date })
    })

    return results
}

async function getDescription(url) {
    await delay(500)
    let response = await fetch(url, options);
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;
    try {
        const description = document.getElementsByClassName('show-more-less-html__markup show-more-less-html__markup--clamp-after-5 relative overflow-hidden')[0].innerHTML.trim()
        return description
    } catch (error) {
        console.log('Error description not found')

        return 'Error description not found'
    }

}

export default async function requestLinkedin(title, location) {
    let results = [];

    for (let i = 0; i <= 5; i++) {
        await delay(1000)
        let jobs = await getOffers(title, location, i * 10)
        for (let i = 0; i < jobs.length; i++) {
            const job = jobs[i];
            let description = await getDescription(job.url)
            job.description = description
        }
        results.push(...jobs)
    }
    
    return results
}