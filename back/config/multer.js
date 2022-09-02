import {diskStorage} from "multer";
import {randomBytes} from "crypto";
import {mkdirSync, existsSync} from "fs";

export const storage = diskStorage({
    destination: (req, file, cb) => {
        const {id_turma: class_id, id_escola: school_id } = JSON.parse(req.body.dataObject);

        if(!school_id || !class_id) {
            return cb('Missing school or class id');
        }

        const dir = `./uploads/${school_id}/${class_id}`;
        
        if(!existsSync(dir)){
            mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
    },
    filename: (req, file, cb) => {
        randomBytes(16, (err, hash) => {
            if (err) cb(err);
    
            file.key = `${hash.toString("hex")}-${file.originalname}`;
    
            cb(null, file.key);
        });
    },
});

export const limits = {
    fileSize: 1024 * 1024 * 5
};

export const fileFilter = (req, file, cb) => {
    checkFileType(file, cb);
};

const checkFileType = (file, cb) => {
    const allowedMimes = [
        "image/jpeg",
        "image/pjpeg",
        "image/png",
        "image/gif",
        "application/pdf",
    ];
  
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb('Invalid file type.');
    }
}
