//['page','limit','sortBy','sortOrder']

const pick = (obj, keys) => {
    const resultAsObj = {};

    for (const key of keys) {
        if (obj && Object.hasOwnProperty.call(obj, key)) {
            resultAsObj[key] = obj[key];
        }
    }
    return resultAsObj;
};

export default pick;