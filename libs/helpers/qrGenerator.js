// Function to generate QR code with logo
import QRCode from 'qrcode';

async function generateQRCode(url) {
    try {
        const qrCodeDataURL = await QRCode.toDataURL(url);
        return qrCodeDataURL;
    } catch (error) {
        console.error('Failed to generate QR code:', error);
        throw new Error('Failed to generate QR code');
    }
}

// Route handler to download the QR code

const downloadQRCode = async (affiliateId) => {
    try {
        const affiliateId = req.params.affiliateId;
        const affiliate = await prisma.affiliate.findUnique({
            where: { id: affiliateId },
        });

        // Generate the referral link URL
        const referralURL = `${process.env.BASE_URL}/affiliate/${affiliate.uniqueCode}`;

        // Path to your logo file (you can adjust the path as per your requirements)
        const logoPath = './path/to/your/logo.png';

        // Generate the QR code with the logo
        const qrImageBuffer = await generateQRCodeWithLogo(referralURL);

        // Send the QR code image as a downloadable file
        res.set('Content-Type', 'image/png');
        res.set('Content-Disposition', 'attachment; filename="affiliate-qr.png"');
        res.send(qrImageBuffer);
    } catch (error) {
        res.status(500).json({
            message: 'Error generating QR code with logo',
        });
    }
};


export { generateQRCode, downloadQRCode };