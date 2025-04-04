import { ZohoCRM } from "../libs/helpers/zohocrm.js";

async function initialize() {
    await ZohoCRM.initializeTokens('','1000.d6b922e5997399fa41df37fe79e62b69.289c3db508c5cd123b5980aa1ec392c5');
    // refreshToken = '1000.c81313de48de9ccb08e33e23d30dd1b3.259b8b75a922de6645af60759b3188e9';
    console.log('Zoho tokens initialized');
}
initialize();