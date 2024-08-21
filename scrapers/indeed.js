import puppeteer from "puppeteer";
import { Cluster } from "puppeteer-cluster";
import {
    getTotalPages,
    findJobDescription,
} from "../utils/scraperFunctions.js";
import { delay } from "../utils/utilityFunctions.js";
import { setParams } from "../utils/commonFunction.js";

import * as dotenv from 'dotenv';
dotenv.config();

export default async function scrapeIndeedJobs(job, location) {
    const browser = await puppeteer.launch({
        // args: [
        //     "--disable-setuid-sandbox",
        //     "--no-sandbox",
        //     "--single-process",
        //     "--no-zygote",
        // ],
        headless: false,
        ignoreHTTPSErrors: true,
        executablePath:
            process.env.NODE_ENV === 'production' ?
                process.env.PUPPETEER_EXECUTABLE_PATH :
                puppeteer.executablePath()
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1000 });

    let jobString = await setParams(job, '+');
    let localtionString = await setParams(location, '+');

    let numberOfPages = await getTotalPages(page, job, location);

    if (numberOfPages === null) {
        console.error("No job offer on Indeed for this job");
        await browser.close();
        return;
    }

    let baseUrl = `https://fr.indeed.com/jobs?q=${jobString}&l=${localtionString}`;

    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 5,
        puppeteerOptions: {
            headless: false,
            ignoreHTTPSErrors: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        },
    });

    for (let i = 0; i < numberOfPages[0]; i++) {
        let index;
        if (i == 0) {
            index = "";
        } else {
            index = `&start=${i * 10}`;
        }

        let pageLink = baseUrl + index;
        cluster.queue(pageLink);
    }

    let dataToSave = [];

    await cluster.task(async ({ page, data: url }) => {
        await page.goto(url);
        await page.setViewport({ width: 1200, height: 1000 });
        await delay(2000);
        let data = await findJobDescription(page, cluster);

        dataToSave.push(data);
    });

    await cluster.idle();
    await cluster.close();
    await browser.close();

    return dataToSave.flat()
}
