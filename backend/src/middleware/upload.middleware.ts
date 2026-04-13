import fs from 'fs';
import multer from 'multer';
import path from 'path';

const uploadDirectory = path.join(process.cwd(), 'uploads', 'images');

const ensureUploadDirectory = () => {
    if (!fs.existsSync(uploadDirectory)) {
        fs.mkdirSync(uploadDirectory, { recursive: true });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        ensureUploadDirectory();
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${req.userId ?? 'guest'}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueSuffix);
    }
});

const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
        return;
    }

    cb(new Error('Only image uploads are allowed'));
};

export const getImagePublicPath = (fileName: string) => `/uploads/images/${fileName}`;

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});
