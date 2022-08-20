const mongoose = require('mongoose');
// const DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost:27017";
const DATABASE_URL = process.env.DATABASE_URL || `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@shopbuzz.96bsnfo.mongodb.net/shopbuzz?retryWrites=true&w=majority`;
class Database{
    
    constructor(){
        this.connect();
    }
    
    connect(){

        const DB_OPTIONS = {
            dbName: 'shopbuzz',
        };

        // mongoose.connect(DATABASE_URL, DB_OPTIONS)
        mongoose.connect(DATABASE_URL)
        .then(()=>{
            console.log("Connected Successfully..");          
        })
        .catch((err)=>{
                      console.log("Database Connection Error" + err);
        })
    }
}

module.exports = new Database();  // initializing it's instance so as of now by only including the file the connection will establish

