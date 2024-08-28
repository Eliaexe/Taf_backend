import got from 'got';
import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';
import { delay } from '../utils/commonFunction.js';
import { standardizeObjects } from '../utils/dataStandardizer.js';

const options = {
    method: 'GET',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.google.com/'
    }
};

let numberRequests = 0;  // Counter for the number of requests made

async function getOffers(title, location, count) {
    let response;
    try {
        response = await got(`https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${title}&location=${location}&trk=public_jobs_jobs-search-bar_search-submit&position=0&pageNum=0&start=${count}`, options);
        numberRequests++;  // Increment request counter
    } catch (error) {
        console.error('Error fetching offers:', error);
        return [];
    }

    // const html = await response.text();
    const dom = new JSDOM(response.body);
    const document = dom.window.document;

    const jobCards = document.querySelectorAll('li');

    const results = await Promise.all(Array.from(jobCards).map(async (card) => {
        try {
            let url = card.querySelector('a')?.href;
            let title = card.getElementsByClassName('base-search-card__title')[0]?.textContent.trim() || 'No title';
            let company = card.getElementsByClassName('base-search-card__subtitle')[0]?.textContent.trim() || 'No company';
            let location = card.getElementsByClassName('job-search-card__location')[0]?.textContent.trim() || 'No location';
            let date = card.querySelector('time')?.dateTime || 'No date';
            let description = url ? await getDescription(url) : 'No description available';
            
            return { url, title, company, location, date, description };
        } catch (error) {
            console.error('Error processing card:', error);
            return null;
        }
    }));

    return results.filter(result => result !== null);
}

async function getDescription(url) {
    if (!url) {
        return 'No URL provided';
    }

    let description = '';
    let attempts = 0;
    const maxAttempts = 2;  // Maximum number of attempts to avoid infinite loops

    while (!description && attempts < maxAttempts) {
        await delay(500);  // Delay before each attempt
        attempts++;

        try {
            numberRequests++;  // Increment request counter
            const response = got(url, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:129.0) Gecko/20100101 Firefox/129.0',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/svg+xml,*/*;q=0.8',
                    'Accept-Language': 'it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3',
                    'Accept-Encoding': 'gzip, deflate, br, zstd',
                    'DNT': '1',
                    'Sec-GPC': '1',
                    'Connection': 'keep-alive',
                    'Cookie': 'lang=v=2&lang=it-it; bcookie="v=2&13d2e2be-4574-461b-82bc-b52fb890a646"; li_gc=MTswOzE3MjQ4Mzg2MTM7MjswMjGA1VXK0P+04ZuSVPTUhV/WSL/MVZFhO0Lt77ELRa+cTQ==; lidc="b=TGST01:s=T:r=T:a=T:p=T:g=3410:u=1:x=1:i=1724838613:t=1724925013:v=2:sig=AQFWYcCy2rAwTRKBpMEQfRBanFeyN8xY"; JSESSIONID=ajax:7308501004595486929; bscookie="v=1&20240828095027e1a727e8-4b14-40a3-8c0f-2f88e7779668AQHEjMUx-WochfK_BjkT79dqbStl_uPs"; li_alerts=e30=',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Sec-Fetch-User': '?1',
                    'Priority': 'u=0, i',
                    'TE': 'trailers'
                }
            });

            // const html = await response.text();
            const dom = new JSDOM(response.body, {
                runScripts: 'dangerously',
                // resources: 'usable'
              });
            const document = dom.window.document;

            const descriptionElements = document.getElementsByClassName('show-more-less-html__markup');
            
            // Aggregate the description from all relevant elements
            description = Array.from(descriptionElements).map(element => element.innerHTML).join('');

            if (description) {
                console.log("Description fetched successfully.");
                return description.trim();
            }

        } catch (error) {
            console.error(`Error fetching description on attempt ${attempts}:`, error);
        }

        console.log(`Attempt ${attempts} failed. Retrying...`);
    }

    return description || 'Error fetching description after multiple attempts';
}

export default async function requestLinkedin(title, location) {
    const results = [];

    const startTime = Date.now();  // Start time for tracking
    for (let i = 0; i <= 5; i++) {
        await delay(1000);
        let jobs = await getOffers(title, location, i * 10);
        results.push(...jobs);
    }
    const endTime = Date.now();  // End time for tracking

    const totalTime = endTime - startTime;  // Total time taken
    const averageTimePerRequest = totalTime / numberRequests;  // Average time per request

    console.log("Total number of requests made:", numberRequests);
    console.log("Total time taken (ms):", totalTime);
    console.log("Average time per request (ms):", averageTimePerRequest);
    console.log(standardizeObjects('linkedin', results).map(job => job.job_offer_body !== 'Error fetching description after multiple attempts'));
    
    return standardizeObjects('linkedin', results);
}
