const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');  // Import the body-parser middleware
const routerScreenshot = require('./routes/screenshot.routes');
const { connection } = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());

app.use(bodyParser.json({ limit: '50mb' }));

app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use("/screenshots", routerScreenshot);

const PORT = process.env.PORT || 7000;
app.listen(PORT, async () => {
    try {
        await connection;
        console.log(`Server is running at Port ${PORT} and also connected to DataBase`)
    } catch (error) {
        console.log(error.message)
    }
});
