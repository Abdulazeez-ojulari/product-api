const config = require('config');
const express = require('express');
const bodyPaser = require('body-parser');
const cors = require('cors');

const app = express();

var corsOption = {
    origin: "http://localhost:3000"
};

app.use(cors(corsOption));

app.use(bodyPaser.json());
app.use(bodyPaser.urlencoded({extended: false}));

if(!config.get('jwtPrivateKey')) {
    console.log('Fatal Error jwt token ');
    process.exit(1)
}

//connecting to database

const db = require("./models/index.js");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });


//let router = express.Router();

app.get("/", (req, res) => {
  res.json({ message: "Welcome to product application." });
});

require("./routes/product.routes")(app);
require("./routes/user.routes")(app);
require("./routes/auth.routes")(app);
require("./middleware/prod.js")(app);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
