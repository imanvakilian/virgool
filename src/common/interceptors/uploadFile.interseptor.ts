import { FileInterceptor } from "@nestjs/platform-express";
import { multerStorage } from "../utils/multer.util";

export function uploadFile(fieldname: string, foldername: string = "images") {
    return class UploadFile extends FileInterceptor(fieldname, {
        storage: multerStorage(foldername)
    }) {}
}