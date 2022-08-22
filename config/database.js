const mongoose = require('mongoose');
// const DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost:27017";

class Database{
    
    constructor(){
        this.connect();
    }
    
    connect(){

        const DB_OPTIONS = {
            dbName: 'shopbuzz',
        };

        // mongoose.connect(DATABASE_URL, DB_OPTIONS)
        mongoose.connect(process.env.DATABASE)
        .then(()=>{
            console.log("Connected Successfully..");          
        })
        .catch((err)=>{
                      console.log("Database Connection Error" + err);
        })
    }
}

module.exports = new Database();  // initializing it's instance so as of now by only including the file the connection will establish

