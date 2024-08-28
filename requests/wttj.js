import fetch from 'node-fetch';
import { standardizeObjects } from '../utils/dataStandardizer.js';

const url = 'https://csekhvms53-dsn.algolia.net/1/indexes/*/queries';

const headers = {
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:129.0) Gecko/20100101 Firefox/129.0',
  'Accept': '*/*',
  'Accept-Language': 'it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3',
  'Accept-Encoding': 'gzip, deflate, br, zstd',
  'Referer': 'https://www.welcometothejungle.com/',
  'x-algolia-api-key': '4bd8f6215d0cc52b26430765769e65a0',
  'x-algolia-application-id': 'CSEKHVMS53',
  'content-type': 'application/x-www-form-urlencoded',
  'Origin': 'https://www.welcometothejungle.com',
  'Connection': 'keep-alive',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'cross-site',
};

const baseParams = {
  attributesToHighlight: ['name'],
  attributesToRetrieve: ['*'],
  clickAnalytics: true,
  hitsPerPage: 30,
  maxValuesPerFacet: 999,
  analytics: true,
  enableABTest: true,
  userToken: '026189b8-5052-49af-90fc-396d77a43d99',
  analyticsTags: ['page:jobs_index', 'language:fr'],
};

const facets = [
  'benefits', 'organization.commitments', 'contract_type', 'contract_duration_minimum',
  'contract_duration_maximum', 'has_contract_duration', 'education_level', 'has_education_level',
  'experience_level_minimum', 'has_experience_level_minimum', 'organization.nb_employees',
  'organization.labels', 'salary_yearly_minimum', 'has_salary_yearly_minimum', 'salary_currency',
  'followedCompanies', 'language', 'new_profession.category_reference',
  'new_profession.sub_category_reference', 'remote', 'sectors.parent_reference', 'sectors.reference'
];

const filters = (jobLocation) => `("offices.country_code":"FR" AND "offices.state":"${jobLocation}")`;

function createRequest(indexName, params, jobLocation) {
  return {
    indexName,
    params: new URLSearchParams({
      ...baseParams,
      ...params,
      facets: JSON.stringify(facets),
      filters: filters(jobLocation),
    }).toString(),
  };
}

function generateRequests(jobTitle, jobLocation) {
  return [
    createRequest('wttj_jobs_production_fr', { page: 0, query: jobTitle }, jobLocation),
    createRequest('wttj_jobs_production_fr_promoted', {
      hitsPerPage: 200,
      filters: `${filters(jobLocation)} AND is_boosted:true`,
      facets: '[]',
      page: 0,
      query: jobTitle,
    }, jobLocation),
    // Altri eventuali richieste...
  ];
}

async function sendRequest(requestBody) {
  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: requestBody,
  });

  if (!response.ok) {
    return 
  }

  return await response.json();
}

export default async function requestWTTJ(jobTitle, jobLocation) {
  try {
    let formattedLocation = jobLocation.replace(" ", '-')
    const requests = generateRequests(jobTitle, formattedLocation);
    const requestBody = JSON.stringify({ requests });
    const data = await sendRequest(requestBody);
    if (!data) {
      return { msg: 'No job in Welcome to the Jungle'};
    }
    const jobs = standardizeObjects('wttj', data.results[1].hits);    
    return jobs;
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}
