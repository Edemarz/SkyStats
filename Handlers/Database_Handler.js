const MongoDB = require("mongoose");

module.exports = () => {
    MongoDB.connect(process.env.DB_KEY, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).catch((err) => console.log(err));

    MongoDB.connection.on("connected", () => console.log("Connected to MongoDB!"))
};