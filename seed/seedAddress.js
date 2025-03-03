import prisma from "../prisma/client.js";


async function seedAddresses() {
    const addresses = [
        { street: "101 MG Road", city: "Mumbai", state: "Maharashtra", country: "India", zipCode: "400001" },
        { street: "202 Brigade Road", city: "Bangalore", state: "Karnataka", country: "India", zipCode: "560001" },
        { street: "303 Park Street", city: "Kolkata", state: "West Bengal", country: "India", zipCode: "700016" },
        { street: "404 Sansad Marg", city: "New Delhi", state: "Delhi", country: "India", zipCode: "110001" },
        { street: "505 Mirza Ghalib Street", city: "Kolkata", state: "West Bengal", country: "India", zipCode: "700017" },
        { street: "606 Laxmi Road", city: "Pune", state: "Maharashtra", country: "India", zipCode: "411030" },
        { street: "707 Anna Salai", city: "Chennai", state: "Tamil Nadu", country: "India", zipCode: "600002" },
        { street: "808 MG Road", city: "Kochi", state: "Kerala", country: "India", zipCode: "682035" },
        { street: "909 Cyber City", city: "Hyderabad", state: "Telangana", country: "India", zipCode: "500081" },
        { street: "1010 Ashram Road", city: "Ahmedabad", state: "Gujarat", country: "India", zipCode: "380009" }
    ];

    for (const address of addresses) {
        await prisma.address.create({
            data: address
        });
    }

    console.log('Address data seeded');
}

seedAddresses()
    .catch(e => {
        console.error('Error seeding addresses:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
