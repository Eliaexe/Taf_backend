import fetch from "node-fetch";
import { setParams, delay } from "../utils/commonFunction.js";

export default async function requestHellowork(job, location) {
    let page = 1;
    let results = [];

    async function fetchData(page) {
        const options = {
            method: "GET",
            headers: {
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0",
                Accept: "application/json, text/plain, */*",
                "Accept-Language": "it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3",
                "Accept-Encoding": "gzip, deflate, br",
                "X-NewRelic-ID": "VgEFVVBbDBAEXFFWBggAXlA=",
                "Proxy-Authorization": "Basic VHM1S1dYV0VTZGV6ckZnb0JVZkg1dHpaOlNRODVtMkdBWGdzUXp4YTlOSHJyTlBFdw==",
                Connection: "keep-alive",
                Referer: `https://www.hellowork.com/fr-fr/emploi/recherche.html?k=${await setParams(
                    job,
                    "+"
                )}&l=${await setParams(location, "+")}&p=${page}&mode=scroll`,
                Cookie: 'hw-cc-gtm=%7B%22statistics%22%3Atrue%2C%22marketing%22%3Afalse%7D; hw-cc-first-party=%7B%22uuid%22%3A%22e9132c66-ebd8-42f2-bf9f-ed4354f88906%22%2C%22statistics%22%3Atrue%2C%22marketing%22%3Afalse%7D;',
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin",
                TE: "trailers",
            },
        };

        try {
            const response = await fetch(
                `https://www.hellowork.com/searchoffers/getsearchfacets?k=${await setParams(
                    job,
                    "%20"
                )}&l=${await setParams(location, "%20")}&p=${page}&mode=api&alert=%20&timestamp=1712668265324`,
                options
            );

            const responseData = await response.json();
            const newResults = responseData.Results || [];
            results.push(...newResults);

            if (newResults.length > 0) {
                await delay(1000); // Aspetta un secondo prima di chiamare la prossima pagina
                await fetchData(page + 1); // Ricorsione per la prossima pagina
            }
        } catch (error) {
            console.error('Errore durante il fetch dei dati:', error);
        }
    }

    // Avvia la ricorsione con la prima pagina
    await fetchData(page);

    console.log('hellowork ok');
    
    return results;
}
