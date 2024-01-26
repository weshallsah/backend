import { error } from "console";
import connectDB from "./Db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config({ path: ".env" });

connectDB()
.then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`server is runing at port : ${process.env.PORT}`);
        });
    }
)
.catch((err) => {
        console.log("MongoDB conection Failded !!", error);
    }
);