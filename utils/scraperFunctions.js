import fs from "fs";
import {
  nextPage,
  verifyModal,
  cookies,
  getTheData,
  getTheDetails,
  delay,
} from "./utilityFunctions.js";

export async function setParams(str) {
  return str.replace(/ /g, "+");
}

export async function findJobDescription(page, cluster) {
  let returnData = [];
  await cookies(page, cluster);

  const jobsContainer = await page.$$(".job_seen_beacon");
  const jobDataPromises = jobsContainer.map(
    async (e) => await getTheData(page, e)
  );
  
  const jobsMetadata = await Promise.all(jobDataPromises);

  for (let i = 0; i < jobsContainer.length; i++) {
    const element = jobsContainer[i];
    let result = {};

    if (element) {
      let titleElement = await element.waitForSelector(".jobTitle");
      if (titleElement) {
        
        if (i == 0) {
          result = await getTheDetails(page, jobsMetadata[i].title);
        } else if (i > 0) {
          await titleElement.click();
          result = await getTheDetails(page, jobsMetadata[i].title);
        }
      } else {
        result = { error: "title is undefined" };
      }
    } else {
      result = { error: "" };
    }

    let mergedData = {
      ...jobsMetadata[i],
      ...result,
    };
    returnData.push(mergedData);
  }

  for (const metadata of jobsMetadata) {
    const found = returnData.find((data) => data.title === metadata.title);
    if (!found) {
      returnData.push({ error: "missing in returnData" });
    }
  }
  return returnData;
}

export async function saveData(data, job, location, site) {
  try {
    const filePath = `./data/raw_data/${job}_${location}_data_${site}.json`;

    // Scrivi i dati nel file
    fs.writeFileSync(filePath, JSON.stringify(data));
    console.log(`Sono stati salvati ${data.length} annunci dal sito ${site}.`);
  } catch (error) {
    console.error(
      "Si è verificato un errore durante il salvataggio dei dati:",
      error
    );
  }
}

export async function scrapeNextPage(page) {
  const nextPageStatus = await nextPage(page);
  if (nextPageStatus === "stop") {
    console.log(
      "Non c'è più il pulsante per andare avanti. Termine dello scraping."
    );
    // start ia fetching
    return;
  }
  await verifyModal(page);
  const jobsDescription = await findJobDescription(page);
  if (jobsDescription[0] === "next") {
    return job
    await scrapeNextPage(page);
  }
}

export async function getTotalPages(page, job, location) {
  let url = `https://fr.indeed.com/jobs?q=${await setParams(
    job
  )}&l=${await setParams(location)}`;
  await page.goto(url);
  await delay(3000);
  const hasOffers = await noOffers(page);
  if (!hasOffers) {
    let quantities = await page.$$(".jobsearch-JobCountAndSortPane-jobCount");
    const text = await quantities[0].$eval("span", (e) => e.innerText);
    const howMany = text.match(/\d+/g).join("");
    let numberOfJobs = howMany.replace("offres", "");
    let jobsContainer = await page.$$(".job_seen_beacon");
    let numberOfPages = Math.ceil(
      Number(howMany) / jobsContainer.length
    );
    return [numberOfPages, numberOfJobs];
  } else {
    console.log("Non ci sono offerte disponibili.");
    return null;
  }
}

export async function noOffers(page) {
  await delay(1500);
  const noResultContainers = await page.$$(
    ".jobsearch-NoResult-messageContainer"
  );
  return noResultContainers.length > 0;
}
