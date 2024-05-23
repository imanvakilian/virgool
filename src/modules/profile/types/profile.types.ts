import { multerFile } from "src/common/utils/multer.util";

export type TuploadProfileFile = { profile_image: multerFile[], background_image: multerFile[] };
