import fs from "fs";
import path from "path";
import { errorLogger, infoLogger } from "../../config/logger/logConfig.js";

// Function to move file to specific folder
export const transferSingleFile = (filePath, destinationFolder) => {

    const fileName = path.basename(filePath);
    const newFilePath = path.join(__dirname, "../../public", destinationFolder, fileName);
    const fileUrl = `public/${destinationFolder}/${fileName}`; // the new url of the file

    // Check if the destination folder exists, if not, create it
    if (!fs.existsSync(path.dirname(newFilePath))) {
        fs.mkdirSync(path.dirname(newFilePath), { recursive: true });
    }

    // Move the file to the destination folder
    fs.rename(filePath, newFilePath, (err) => {
        if (err) {
            errorLogger.error(`Error moving file: ${err}`);
        } else {
            infoLogger.info(`File moved successfully to ${newFilePath}`);
        }
    });

    return fileUrl;
}

// Function to move files to specific folder
export const transferMultipleFile = async (imagePaths, destinationFolder) => {

    const paths = [];

    imagePaths.map((item) => {
        const newPath = singleTransfer(item, destinationFolder);
        paths.push(newPath);
    })

    return paths;
}

// single image file upload -> image path
export const getSingleFilePath = async (files) => {

    let filePath;

    if (files && Object.keys(files).length > 0) {
        if (Array.isArray(files)) {
            filePath = files[0].path;
        } else {
            filePath = files.single?.[0]?.path;
        }
    }

    return filePath;
}

// mutiple image file upload -> image paths
export const getMultipleFilePath = async (files) => {

    let imagesPaths = [];

    if (files && Object.keys(files).length > 0) {
        files.multiple.map((item) => {
            imagesPaths.push(item.path);
        })
    }

    return imagesPaths;
}

// Function to remove file
export const removeFile = async (imgPath) => {
    if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
        infoLogger.info(`File ${imgPath} deleted successfully`);
    } else {
        errorLogger.error(`File ${imgPath} does not exist`);
    }
}