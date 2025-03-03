import puppeteer from "puppeteer";
import { catchAsync, sendResponse } from "../../../libs/helpers/global.js";
import prisma from "../../../prisma/client.js";




export const downloadQrCode = catchAsync(async (req, res) => {

    const data = req.user;
    // res.send(data);
    // get the affiliate data from the data?.id
    const affiliate = await prisma.affiliate.findUnique({
        where: { id: data?.id },
    });

    if (!affiliate) {
        sendResponse(res, {
            statusCode: httpStatus.NOT_FOUND,
            success: false,
            message: "Affiliate not found",
        });
    }

    const { name, qrCodeUrl } = affiliate; // qrData should be Base64 encoded

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const htmlContent = `
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; }
            .container { width: 100%; max-width: 600px; margin: auto; border: 2px solid #ccc; padding: 20px; }
            .qr-code { margin: 20px 0; width: 150px; height: 150px; }
            .footer { margin-top: 20px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>YOlast</h1>
            <p>Last Minute Travel Deals & Bookings</p>
            <img class="qr-code" src="${qrCodeUrl}" alt="QR Code">
            <h2>${name}</h2>
            <p>Homestay, Hotels, Travel Guide, Tour Packages, and More!</p>
            <div class="footer">We make it fast! Or your money back!</div>
        </div>
    </body>
    </html>`;

    await page.setContent(htmlContent, { waitUntil: "load" }); // Ensure full load
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

    await browser.close();

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=YOlast_QR.pdf",
    });

    res.send(pdfBuffer);

});