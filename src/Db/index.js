import mongoose from "mongoose";

import { DB_Name } from "../constants.js";

const connectDB =async ()=>{
    try{
        
        const Instance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`);
        console.log(`\n mongoDB Connected`);
        // console.log(Instance);
    } catch(error){
        console.error('Failed to Connect MongoDB',error);
        process.exit(1);
    }
};

export default connectDB;
