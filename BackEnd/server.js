const app = require("./app");
const dotenv = require("dotenv");
const connectDatabase = require("./config/database")

//Handling Uncaught Exception

process.on("uncaughtException",(err)=>{
    console.log("error",err.message);
    console.log("shutting down the server due to uncaughtException");
    server.close(()=>{
        process.exit(1);
    })
})
 
//config

dotenv.config({path:"BackEnd/config/config.env"});

//Connectinf to database
connectDatabase()



const server = app.listen(process.env.PORT,()=>{

    console.log(`Server is working on port= ${process.env.PORT}`)
})
// Unhandled Promise Rejection
process.on("unhandledRejection",(err)=>{
    console.log("error",err.message);
    console.log("shutting down the server due to Unhandled Promise Rejection");
    server.close(()=>{
        process.exit(1);
    })
})