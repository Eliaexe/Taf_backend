import puppeteer from "puppeteer";
import { delay } from "../utils/commonFunction.js";

async function getMetadata(page) {
  const jobUl = await page.$(".jobs-search__results-list");
  const jobCards = await jobUl.$$eval("li", (elements) => {
    const jobs = [];

    elements.forEach((li) => {
      const link = li.querySelector("a").href;
      const title = li
        .querySelector("h3.base-search-card__title")
        .textContent.trim();
      const company = li
        .querySelector("h4.base-search-card__subtitle")
        .textContent.trim();
      const location = li
        .querySelector("span.job-search-card__location")
        .textContent.trim();
      const publication = li.querySelector("time").getAttribute("datetime");

      jobs.push({ link, title, company, location, publication });
    });

    return jobs;
  });
  return jobCards;
}

async function gettingTheData(page) {
  await delay(100)
  const jobUl = await page.$(".jobs-search__results-list");

  let jobData = [];

  const jobCards = await jobUl.$$("li");

  for (const jobCard of jobCards) {
    const link = await jobCard.$eval("a", (element) => element.href);
    const title = await jobCard.$eval("h3.base-search-card__title", (element) =>
      element.textContent.trim()
    );
    const company = await jobCard.$eval(
      "h4.base-search-card__subtitle",
      (element) => element.textContent.trim()
    );
    const location = await jobCard.$eval(
      "span.job-search-card__location",
      (element) => element.textContent.trim()
    );
    const publication = await jobCard.$eval("time", (element) =>
      element.getAttribute("datetime")
    );

    await jobCard.click();
    await jobCard.click();
    await delay(1000);

    let showMoreBtn = await page.$('[aria-label="i18n_show_more"]');
    let offerBodyElement = await page.$(
      ".show-more-less-html__markup.relative.overflow-hidden"
    );

    // Se il pulsante "Show More" o l'elemento offerBody non esistono, torna indietro
    if (!showMoreBtn || !offerBodyElement) {
      await page.goBack();
      await delay(1000);
    }
    if (showMoreBtn) {
      await showMoreBtn.scrollIntoView(); // Assicura che il pulsante sia visibile
      // await showMoreBtn.click();
      await delay(500);
    } else {
      console.log("Show more button not found.");
    }

    let offerBody = "";
    if (offerBodyElement) {
      offerBody = await page.evaluate(
        (element) => element.textContent,
        offerBodyElement
      );
    }

    // Costruisci l'oggetto dell'offerta di lavoro
    const jobDetails = {
      link,
      title,
      company,
      location,
      publication,
      offerBody,
    };

    // Aggiungi l'oggetto dell'offerta di lavoro all'array jobData
    jobData.push(jobDetails);

    await delay(750); // Attendi 1 secondo
  }

  return jobData;
}

let consecutiveSameResultCount = 0;
let previousJobCount = 0;

async function scrollUntilButtonVisible(page) {
  // Scorrere la pagina per far apparire il bottone
  for (let i = 0; i < 14; i++) {
    await delay(1000);
    await page.keyboard.press("End");
    delay(500)
    await page.keyboard.press("PageUp");
    delay(500)
    await page.keyboard.press("End");
    await delay(500);
  }

  let btn;
  let metadata;

  while (consecutiveSameResultCount < 4) {
    await page.evaluate(() => {
      window.scrollBy(0, 100);
    });

    try {
      btn = await page.waitForSelector(".infinite-scroller__show-more-button", {
        visible: true,
        timeout: 5000, // Tempo massimo di attesa in millisecondi
      });
    } catch (error) {
      console.log("Bottone non trovato. Interrompo il ciclo.");
      return metadata;
    }

    metadata = await getMetadata(page);

    await delay(1000);
    await btn.click();
    await delay(500);
    await btn.click();
    await delay(500);

    if (metadata.length === previousJobCount) {
      consecutiveSameResultCount++;
    } else {
      consecutiveSameResultCount = 0;
      previousJobCount = metadata.length;
    }
  }

  return metadata;
}

export default async function scrapeLinkcedinJobs(job, location) {
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    headless: true,
    ignoreHTTPSErrors: true,
    executablePath:
      process.env.NODE_ENV === 'production' ?
        process.env.PUPPETEER_EXECUTABLE_PATH :
        puppeteer.executablePath()
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1000 });

  let homeUrl = "https://www.linkedin.com/jobs/search?trk=guest_homepage-basic_guest_nav_menu_jobs&position=1&pageNum=0"

  const encodedJob = encodeURIComponent(job);
  const encodedLocation = encodeURIComponent(location);

  const baseUrl = `https://fr.linkedin.com/jobs/search?keywords=${encodedJob}&location=${encodedLocation}&trk=public_jobs_jobs-search-bar_search-submit&position=1&pageNum=0`;

  await page.goto(homeUrl);
  await delay(4000);
  await goToSearch(page, job, location)
  await delay(1500)
  await scrollUntilButtonVisible(page)
  let data = await gettingTheData(page)
  await browser.close();
  return data;
}

async function goToSearch(page, job, location) {
  await delay(2000);

  const jobInput = await page.$("#job-search-bar-keywords");
  await jobInput.click({ clickCount: 3 });
  await jobInput.press("Backspace");

  await jobInput.type(job);

  const locationInput = await page.$("#job-search-bar-location");
  await locationInput.click({ clickCount: 3 });
  await locationInput.press("Backspace");

  await locationInput.type(location);
  await delay(1500);
  await page.keyboard.press("Enter");
}
