import multer from 'multer'
import path from 'path'
import fs from 'fs'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "../../public/files/");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, "public/files");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    },
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const supportedFile = /jpg|jpeg|png|webp|svg|pdf/;
        const extension = path.extname(file.originalname);

        if (supportedFile.test(extension)) {
            cb(null, true);
        } else {
            cb(new Error('Must be a jpg/png/jpeg/webp/svg file'), false);
        }
    },
});


export default upload;