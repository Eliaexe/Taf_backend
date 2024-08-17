import fetch from "node-fetch";
import { setParams, delay } from "../utils/commonFunction.js";

export default async function requestJooble(job, location) {
  const maxPages = 100; // Numero massimo di pagine da esaminare
  let allJobs = [];
  let previousJobsContent = null;

  for (let page = 1; page <= maxPages; page++) {
    const options = {
      method: "POST",
      headers: {
        cookie: "SessionCookie.fr=...",
        "User-Agent": "Mozilla/5.0 ...",
        Accept: "*/*",
        "Accept-Language": "it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3",
        "Accept-Encoding": "gzip, deflate, br",
        Referer: `https://fr.jooble.org/SearchResult?p=1&rgns=${location}&ukw=${job}`,
        "content-type": "application/json",
        "trace-id": "a650c887-a877-4886-975a-3c7c3b645a99",
        Origin: "https://fr.jooble.org",
        Connection: "keep-alive",
        Cookie: '...',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        TE: "trailers",
      },
      body: JSON.stringify({
        search: job,
        region: location,
        regionId: 12,
        isCityRegion: false,
        jobTypes: [],
        coords: null,
        page: page,
        isRemoteItSerp: false,
        workTitle: null,
      }),
    };

    try {
      const response = await fetch("https://fr.jooble.org/api/serp/jobs", options);

      // Controlla se il tipo di contenuto è JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();

        // Esci dal ciclo se non ci sono più lavori o i dati si ripetono
        if (data.jobs.length === 0 || JSON.stringify(data.jobs) === JSON.stringify(previousJobsContent)) {
          break;
        }

        allJobs.push(...data.jobs);
        previousJobsContent = data.jobs; // Memorizza i lavori per il controllo nella prossima iterazione

        await delay(2000); // Ritardo di 0.5 secondi per evitare sovraccarico del server
      } else {
        const text = await response.text(); // Prendi il contenuto come testo
        console.error("Unexpected response format:", text);
        break; // Esci dal ciclo in caso di risposta inattesa
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      break; // Esci dal ciclo in caso di errore
    }
  }

  // Restituisci tutti i lavori raccolti
  return allJobs;
}
