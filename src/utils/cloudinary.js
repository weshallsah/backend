import { v2 as cloudinary } from 'cloudinary';
import { log } from 'console';
import fs from 'fs';





cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY
});


const uploadonCloud = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null;
    }
    const res = await cloudinary.uploader.upload(localFilePath,
      {
        resource_type: 'auto',
      }
    );
    console.log("FileUploaded Succesfully");
    console.log(res.url);
    return res;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.log('error occure');
    return null;
  }
};


export { uploadonCloud };