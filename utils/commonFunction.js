export async function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}

export async function setParams(str, separator) {   
    if (str) {
        return str.replace(/ /g, separator);
    } else { return str }
}


