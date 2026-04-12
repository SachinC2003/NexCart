import fs from 'fs';
import path from 'path';

export const ImageUploadService = (base64Image: string, userId?: number): string => {
    const fileName = `img_${userId}_${Date.now()}.png`;
    const uploadDirectory = path.join(process.cwd(), 'uploads', 'images');
    const uploadPath = path.join(uploadDirectory, fileName);

    if (!fs.existsSync(uploadDirectory)) {
        fs.mkdirSync(uploadDirectory, { recursive: true });
    }

    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

    fs.writeFileSync(uploadPath, base64Data, { encoding: 'base64' });

    return `/uploads/images/${fileName}`;
};

export const deleteImage = (image: string) =>{
    console.log("image deleted")
    const normalizedImagePath = image.replace(/^\/+/, '');
     console.log("image deleted", normalizedImagePath)
    const fullPath = path.join(process.cwd(), normalizedImagePath);
     console.log("image deleted", fullPath)
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
}

export const getImagePath = (imageName: string): string => {
    const imagesDir = path.join(process.cwd(), 'uploads', 'images');
    const fullPath = path.join(imagesDir, path.basename(imageName));
    const placeholderPath = path.join(imagesDir, 'placeholder.png');

    // Return the image if it exists, otherwise the placeholder
    if (fs.existsSync(fullPath)) {
        return fullPath;
    }
    
    return placeholderPath;
};