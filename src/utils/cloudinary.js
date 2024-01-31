import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from "dotenv";


dotenv.config({ path: ".env" });


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
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
    // console.log("FileUploaded Succesfully");
    // console.log(res.url);
    fs.unlinkSync(localFilePath);
    return res;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.log('error occure', error);
    return null;
  }
};


export { uploadonCloud };