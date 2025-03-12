import { ZohoCRM } from "../libs/helpers/zohocrm.js";

async function initialize() {
    await ZohoCRM.initializeTokens('1000.7faccb8790a56f619f201f4d8eab5fdf.e153f2cf462b72d501b039a07401e401');
    console.log('Zoho tokens initialized');
}
initialize();