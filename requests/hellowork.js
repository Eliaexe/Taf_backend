import fetch from "node-fetch";
import { setParams, delay } from "../utils/commonFunction.js";
import { standardizeObjects } from "../utils/dataStandardizer.js";

export default async function requestHellowork(job, location) {
  let results = [];
  
  async function fetchData(page) {
    const options = {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3",
        "Accept-Encoding": "gzip, deflate, br",
        "X-NewRelic-ID": "VgEFVVBbDBAEXFFWBggAXlA=",
        newrelic:
          "eyJ2IjpbMCwxXSwiZCI6eyJ0eSI6IkJyb3dzZXIiLCJhYyI6IjI3MjQ2ODQiLCJhcCI6IjUzNTg3OTc4OCIsImlkIjoiMWY4MWQ4ZWJiY2QwMGQ5YSIsInRyIjoiZTU3MzNmYjAxMGQyYmJiNTM5ZTg1Y2ZjOTJmNmI4ZTMiLCJ0aSI6MTcxMjY2ODI2NTMyNX19",
        traceparent: "00-e5733fb010d2bbb539e85cfc92f6b8e3-1f81d8ebbcd00d9a-01",
        tracestate:
          "2724684@nr=0-1-2724684-535879788-1f81d8ebbcd00d9a----1712668265325",
        "Proxy-Authorization":
          "Basic VHM1S1dYV0VTZGV6ckZnb0JVZkg1dHpaOlNRODVtMkdBWGdzUXp4YTlOSHJyTlBFdw==",
        Connection: "keep-alive",
        Referer: `https://www.hellowork.com/fr-fr/emploi/recherche.html?k=${await setParams(
          job,
          "+"
        )}&l=${await setParams(location, "+")}&p=${page}&mode=scroll`,
        Cookie:
          'hw-cc-gtm=%7B%22statistics%22%3Atrue%2C%22marketing%22%3Afalse%7D; hw-cc-first-party=%7B%22uuid%22%3A%22e9132c66-ebd8-42f2-bf9f-ed4354f88906%22%2C%22statistics%22%3Atrue%2C%22marketing%22%3Afalse%7D; informAboutInterim={"informAboutInterim": "undefined", "boxHasBeenDisplayed": "false"}; hw_custom_onetap=true; hw.emploi.web.session=CfDJ8Ot8cHXqmJRHjbH3O4UyLQqe5uipTL06TbsdhvyAQ7iU4Rk7McpnwKnEifUedIRKGI4kq45WSwFJktKIt%2B7ZE9ecZBg%2Fx3XstkDdJvu96VWYn%2BCHSoOv28w8KeZCARoyPDfNXpK2DST6zK1EsT857WJBmjlVTnxaJABSLqpmWA0z',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        TE: "trailers",
      },
    };

    const response = await fetch(
      `https://www.hellowork.com/searchoffers/getsearchfacets?k=${await setParams(
        job,
        "%20"
      )}&l=${await setParams(
        location,
        "%20"
      )}&p=${page}&mode=api&alert=%20&timestamp=1712668265324`,
      options
    );

    const responseData = await response.json();
    const newResults = responseData.Results;
    results.push(...newResults);    

    if (newResults.length > 0) {
      await delay(1000); 
      await fetchData(page + 1); 
    } else {
      return standardizeObjects('hellowork', results)
    }
  }
  
  await fetchData(1);
  return results
}
