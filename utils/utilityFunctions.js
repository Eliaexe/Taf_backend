export function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

export async function notARobot(page) {
  await new Promise(async (resolve) => {
    let controllerContainer = await page.$$("#challenge-stage");
    if (controllerContainer[0]) {
      let closeButton = await page.$$(".ctp-checkbox-label");
      console.log(closeButton);
      resolve();
    } else {
      resolve();
    }
  });
}

export async function nextPage(page) {
  let nextButton = await page.$$('a[data-testid="pagination-page-next"]');
  if (nextButton.length > 0) {
    await nextButton[0].click();
  } else {
    return "stop";
  }
}

export async function verifyModal(page) {
  await page.waitForNavigation({ waitUntil: "load" });
  await new Promise((resolve) => {
    setTimeout(async () => {
      let closeModal = await page.$$("#mosaic-desktopserpjapopup");
      if (closeModal[0] !== undefined) {
        let closeButton = await closeModal[0].$$("button.css-yi9ndv.e8ju0x51");
        await closeButton[0].click();
      }
      resolve();
    }, 2000);
  });
}

export async function cookies(page) {
  await delay(1000);
  const cookiesButtonGroup = await page.$("#onetrust-button-group-parent");
  if (!cookiesButtonGroup) {
    console.log("Elemento per i cookie non trovato. Uscita dalla funzione.");
    return;
  }

  await page.waitForSelector("#onetrust-reject-all-handler");
  const declineCookiesBTN = await page.$$("#onetrust-reject-all-handler");

  if (declineCookiesBTN.length > 0) {
    await declineCookiesBTN[0].click();
    await delay(1000);
  } else {
    console.log("Pulsante per rifiutare i cookie non trovato.");
  }
}

export async function getTheData(page, element) {
  // Ottieni il titolo del lavoro
  const titleElement = await element.$(".jobTitle");
  const title = await titleElement.evaluate((node) => node.innerText);

  // Ottieni il nome dell'azienda
  const companyNameContainer = await element.$('[data-testid="company-name"]');
  const companyName = await companyNameContainer.evaluate(
    (node) => node.innerText
  );

  // Ottieni la posizione dell'azienda
  const companyLocationContainer = await element.$(".css-1p0sjhy.eu4oa1w0");
  const companyLocation = await companyLocationContainer.evaluate(
    (node) => node.innerText
  );

  // Ottieni il salario, se disponibile
  const pay = await element.$$(".metadata.salary-snippet-container");
  let salary = "";
  if (pay.length > 0) {
    salary = await pay[0].evaluate((element) => element.innerText);
  }

  // Ottieni i dati del dataset
  const dataset = await element.$eval("a", (el) => {
    return {
      id: el.id,
      link: el.href,
      jk: el.getAttribute("data-jk"),
      empn: el.getAttribute("data-empn"),
    };
  });

  // Costruisci l'oggetto company
  const company = { name: companyName, location: companyLocation };

  // Restituisci i dati raccolti
  const result = { title, salary, ...dataset, company };
  return result;
}

export async function getTheDetails(page, metadata) {
  let result = {};

  await delay(1500);
  const jobTextElement = await page.$("#jobDescriptionText");
  const jobText = await page.evaluate(
    (element) => element.innerText,
    jobTextElement
  );
  const cleanedJobText = jobText.replace(/\n/g, " ");

  result = { title: metadata, job_offer_body: cleanedJobText };
  return result;
}

export function formatElapsedTime(elapsedTime) {
  // Calcola il numero di ore
  const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
  // Rimuovi le ore dal tempo totale
  let remainingTime = elapsedTime - hours * (1000 * 60 * 60);

  // Calcola il numero di minuti
  const minutes = Math.floor(remainingTime / (1000 * 60));
  // Rimuovi i minuti dal tempo totale
  remainingTime -= minutes * (1000 * 60);

  // Calcola il numero di secondi
  const seconds = Math.floor(remainingTime / 1000);

  // Restituisci una stringa formattata con ore, minuti e secondi
  return `${hours} ore, ${minutes} minuti, ${seconds} secondi`;
}

