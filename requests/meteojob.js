import { setParams } from "../utils/commonFunction.js";

function stripHtml(html) {
  return html.replace(/<[^>]*>?/gm, "");
}

export async function requestMeteojob(job, location) {
  try {
    const jobTitle = await setParams(job, "%20");
    const locationTitle = await setParams(location, "%20");

    const options = {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64; rv:129.0) Gecko/20100101 Firefox/129.0",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/svg+xml,*/*;q=0.8",
        "Accept-Language": "it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        Referer: `https://www.meteojob.com/`,
        Connection: "keep-alive",
        Cookie:
          "has_js=1; tracking_adsource=google.com; OptanonConsent=isGpcEnabled=0&datestamp=Sat+Aug+17+2024+13%3A08%3A41+GMT%2B0200+(Ora+legale+dell%E2%80%99Europa+centrale)&version=202402.1.0&browserGpcFlag=0&isIABGlobal=false&hosts=&consentId=e45bd8ca-3f59-420c-96ba-8d13cd4b002c&interactionCount=1&isAnonUser=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CC0005%3A0%2CC0007%3A0&geolocation=%3B&AwaitingReconsent=false; OptanonAlertBoxClosed=2024-08-17T11:08:27.890Z; autocomplete_history_job=[{%22type%22:%22JOB%22%2C%22id%22:6152%2C%22label%22:%22D%C3%A9veloppeur%20web%22%2C%22count%22:40946%2C%22ambiguous%22:false}]; autocomplete_history_geocode=[{%22id%22:%22geonameid:6446106%22%2C%22highlightedLabel%22:%2291220%20Br%C3%A9tigny-sur-Orge%22%2C%22preferredLabel%22:%22Br%C3%A9tigny-sur-Orge%20(91)%22%2C%22matchedName%22:%2291220%20Br%C3%A9tigny-sur-Orge%22%2C%22woeType%22:10%2C%22name%22:%22Br%C3%A9tigny-sur-Orge%22%2C%22cc%22:%22FR%22%2C%22parents%22:[{%22name%22:%22Essonne%22%2C%22woeType%22:9}%2C{%22name%22:%22%C3%8Ele-de-France%22%2C%22woeType%22:8}%2C{%22name%22:%22France%22%2C%22woeType%22:12}]}]; _sp_ses.1842=*; _sp_id.1842=03c6e024-38cf-4248-8982-0af4712f1af8.1723892921.1.1723892921..feeee15b-b846-4a80-a762-b0a1f0ca6d39....0",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
        "Priority": "u=0, i",
        TE: "trailers",
      },
    };

    const response = await fetch(
      `https://www.meteojob.com/api/joboffers/search?serjobsearch=true&scoringVersion=SERJOBSEARCH&what=${jobTitle}&where=${locationTitle}&sorting=SCORING&page=1&limit=10000&expandLocations=true&facet=cities&facet=date&facet=company&facet=industry&facet=contract&facet=job&facet=macroJob&facet=jobType&facet=content_language&facet=license&facet=degree&facet=experienceLevel`,
      options
    );

    const data = await response.json();
    console.log(data);

    // Modifica le descrizioni
    for (const element of data.content) {
      let desc = await stripHtml(element.description);
      let theDescription = desc.replace(/<br \/>/g, "");
      element.description = theDescription;
    }

    return data;
  } catch (err) {
    console.error(err);
    return {
      jobCount: 0,
      jobOffers: [],
    };
  }
}
