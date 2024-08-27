import fetch from "node-fetch";
import { delay } from "../utils/commonFunction.js";

// Funzione per ottenere il timestamp in millisecondi
function getTimestampInMilliseconds(dateObj) {
  return dateObj.getTime().toString();
}

export default async function requestMonster(job, location) {
  let offset = 0;
  let prevData = null;
  let sameDataCount = 0;
  let result = [];

  while (true) {
    const options = {
      method: "POST",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64; rv:129.0) Gecko/20100101 Firefox/129.0",
        Accept: "application/json",
        "Accept-Language": "it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Content-Type": "application/json; charset=utf-8",
        "request-starttime": getTimestampInMilliseconds(new Date()),  // Usa la funzione per ottenere il timestamp
        Origin: "https://www.monster.fr",
        Connection: "keep-alive",
        Referer: "https://www.monster.fr/",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        TE: "trailers",
      },
      body: JSON.stringify({
        jobQuery: {
          query: job,
          locations: [
            {
              country: "fr",
              address: location,
              radius: {
                unit: "km",
                value: 20,
              },
            },
          ],
        },
        jobAdsRequest: {
          position: Array.from({ length: 50 }, (_, i) => i + 1),  // Posizioni da 1 a 50
          providerType: "MSEARCH_NO_AUCTION",
          placement: {
            channel: "WEB",
            location: "JobSearchPage",
            property: "monster.fr",
            type: "JOB_SEARCH",
            view: "SPLIT",
          },
        },
        fingerprintId: "z5732b8a1d0c7b57cc26e80e78acdd0bd",
        offset: offset,
        pageSize: 50,
        searchId: "68c7dd6f-8bdc-4576-a6f6-2547269ed538",
      }),
    };

    try {
      const response = await fetch(
        "https://appsapi.monster.io/jobs-svx-service/v2/monster/search-jobs/samsearch/fr-FR?apikey=AE50QWejwK4J73X1y1uNqpWRr2PmKB3S",
        options
      );
      const data = await response.json();

      console.log(data);
      

      const jobResults = data.jobResults;
      if (jobResults && jobResults.length !== 50) {
        break;
      }

      if (prevData && JSON.stringify(prevData) === JSON.stringify(jobResults)) {
        sameDataCount++;
        if (sameDataCount >= 2) {
          break;
        }
      } else {
        sameDataCount = 0;
      }

      if (jobResults && jobResults.length > 0) {
        result.push(...jobResults);
      }

      prevData = jobResults;
      offset += 50;

      await delay(500);
    } catch (err) {
      console.error("Errore durante la richiesta:", err);
      break;
    }
  }

  return result;
}
