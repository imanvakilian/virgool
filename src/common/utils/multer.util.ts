// ((
//     req: Request<ParamsDictionary, any, any, QueryString.ParsedQs, Record<string, any>>,
//     file: Express.Multer.File,
//     callback: (error: Error, destination: string) => void
// ) => void)

import { BadRequestException } from "@nestjs/common";
import { Request } from "express";
import { mkdirSync } from "fs";
import { diskStorage } from "multer";
import { extname, join } from "path";

export type multerFile = Express.Multer.File;
export type destinationMulerCallback = (error: Error, destination: string) => void;
export type filenameMulterCallback = (error: Error, filename: string) => void;

export function multerDestination(folderName: string) {
    return function (req: Request, file: multerFile, callback: destinationMulerCallback) {
        const path = join("public", "uploads", folderName);
        mkdirSync(path, { recursive: true });
        callback(null, path);
    }
}

export function multerFilename(req: Request, file: multerFile, callback: filenameMulterCallback) {
    const extName = extname(file.originalname).toLocaleLowerCase();
    if (!["jpg", "png", "jpeg".includes(extName)]) {
        callback(new BadRequestException("Invalid format image"), null);
    } else {
        const filename = `${Date.now()}${extName}`;
        callback(null, filename)
    }
}

export function multerStorage(folderName: string) {
    return diskStorage({
        destination: multerDestination(folderName),
        filename: multerFilename,
    })
}

