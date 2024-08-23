import fetch from "node-fetch";
import { delay } from "../utils/commonFunction.js";

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
          "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0",
        Accept: "application/json",
        "Accept-Language": "it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3",
        "Accept-Encoding": "gzip, deflate, br",
        "Content-Type": "application/json; charset=utf-8",
        "request-starttime": "1712591782373",
        Origin: "https://www.monster.fr",
        "Proxy-Authorization":
          "Basic VHM1S1dYV0VTZGV6ckZnb0JVZkg1dHpaOlNRODVtMkdBWGdzUXp4YTlOSHJyTlBFdw==",
        Connection: "keep-alive",
        Referer: "https://www.monster.fr/",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
      },
      body: `{"jobQuery":{"query":"${job}","locations":[{"country":"fr","address":"${location}","radius":{"unit":"km","value":20}}]},"jobAdsRequest":{"position":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50],"placement":{"channel":"WEB","location":"JobSearchPage","property":"monster.fr","type":"JOB_SEARCH","view":"SPLIT"}},"fingerprintId":"68149b7bb879b0a3bee517f2492d26b5","offset":${offset},"pageSize":50,"includeJobs":[]}`,
    };

    try {
      const response = await fetch(
        "https://appsapi.monster.io/jobs-svx-service/v2/monster/search-jobs/samsearch/fr-FR?apikey=AE50QWejwK4J73X1y1uNqpWRr2PmKB3S",
        options
      );
      const data = await response.json();
      let jobResults = data.jobResults
      if (jobResults && jobResults?.length !== 50) {
        break;
      }

      if (prevData && JSON.stringify(prevData) === JSON.stringify(data.jobResults)) {
        sameDataCount++;
        if (sameDataCount >= 2) {
          break;
        }
      } else {
        sameDataCount = 0;
      }

      if (data.jobResults != undefined || null || '' ) {
        result.push(...data.jobResults);  
      }

      prevData = data.jobResults;
      offset += 50;

      await delay(500);
    } catch (err) {
      console.error(err);
      break;
    }
  }

  return result
}

