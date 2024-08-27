import { JSDOM } from "jsdom";
import fetch from "node-fetch";

import { setParams, delay } from "../utils/commonFunction.js";
import { standardizeObjects } from "../utils/dataStandardizer.js";

let page = 1;

export default async function requestTalent(job, location) {
  
  const options = {
    method: "GET",
    headers: {
      cookie: "your_cookie_here",
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3",
      "Accept-Encoding": "gzip, deflate, br",
      Referer: `https://fr.talent.com/jobs?context=&k=${await setParams(
        job,
        "+"
      )}&l=${await setParams(location, "+")}+%2875%29&id=eb2343c6048b`,
      "Proxy-Authorization": "Basic your_proxy_authorization_here",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-User": "?1",
      TE: "trailers",
    },
  };

  let result = [];
  let baseUrl = `https://fr.talent.com`;

  try {
    const response = await fetch(
      `${baseUrl}/jobs?k=${await setParams(job, "%20")}&l=${await setParams(
        location,
        "%20"
      )}&p=${page}&context=serp_pagination`,
      options
    );
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const jobs = document.getElementById("nv-jobs").querySelectorAll("section");

    jobs.forEach(async (job) => {
      const id = job.getAttribute("data-id");
      const cardPosition = job.getAttribute("card-position");
      const titleElement = job.querySelector(
        "h2.card__job-title.card__job-link.gojob"
      );
      const companyNameElement = job.querySelector(
        "div.card__job-empname-label"
      );
      const locationElement = job.querySelector("div.card__job-location");
      const dayElement = job.querySelector("div.c-card__jobDatePosted");

      const title = titleElement ? titleElement.textContent.trim() : "";
      const companyName = companyNameElement
        ? companyNameElement.textContent.trim()
        : "";
      const jobLocation = locationElement
        ? locationElement.textContent.trim()
        : "";
      const day = dayElement ? dayElement.textContent.trim() : "";

      const linkElement = job.querySelector("div.c-card__viewMore a");
      const link = linkElement
        ? `${baseUrl}${linkElement.getAttribute("href")}`
        : "";
      const fullUrl = link ? new URL(link, baseUrl).href : "";

      let description = fullUrl ? await takeDataFromPost(fullUrl) : "No description";    
            
      result.push({
        id,
        cardPosition,
        title,
        companyName,
        location: jobLocation, 
        day,
        link: fullUrl,
        description,
      });      
    });

    const pagination = document.querySelector(".pagination");
    const nextPageButton = pagination
      ? pagination.querySelector(".page-next")
      : null;
    const hasNextPage =
      nextPageButton && !nextPageButton.classList.contains("disable-arrow");

    if (hasNextPage) {
      page++;
      await delay(500);
      await requestTalent(job, location);
    }
  } catch (err) {
    console.error("Error during fetching job data:", err);
  }

  return standardizeObjects(result) 
}

async function takeDataFromPost(link) {
  const options = {
    method: "GET",
    headers: {
      cookie: "your_cookie_here",
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
    },
  };

  try {
    await delay(500);
    const response = await fetch(link, options);
    const html = await response.text();

    const dom = new JSDOM(html);
    const document = dom.window.document;

    const descriptionElement = document.querySelector("div.job__description");
    const description = descriptionElement
      ? descriptionElement.textContent.trim()
      : "No description available";

    return description.replace(/\n\s*\n/g, " ");
  } catch (error) {
    console.error("Error during fetching job description:", error);
    return "err";
  }
}
