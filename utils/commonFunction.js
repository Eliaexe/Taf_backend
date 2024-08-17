import fs from 'fs'

export async function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}

export async function setParams(str, separator) {   
    return str.replace(/ /g, separator);
}

export async function saveData(data, job, location, site) {
    let j = await setParams(job, "+");
    let l = await setParams(location, "+");
    try {
        const filePath = `./data/raw_data/${j}_${l}_data_${site}.json`;
        fs.writeFileSync(filePath, JSON.stringify(data));
        console.log(`Sono stati salvati ${data.length} annunci dal sito ${site}.`);
    } catch (error) {
        console.error(
            "Si è verificato un errore durante il salvataggio dei dati:",
            error
        );
    }
}
