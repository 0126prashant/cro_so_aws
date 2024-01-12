const express = require('express');
const routerScreenshot = express.Router();
const { screenShotFunc } = require('../screenShotFunc');
const path = require('path');
const fs = require('fs/promises')
const parseUrl = require('url-parse');
const axios = require("axios");
const { Image } = require('../models/image.model');
const { clearS3Bucket } = require('../functions/clearBucket');
let globalWebsiteName; 
const S3_BUCKET_NAME = 'crow.so.admin';


routerScreenshot.post("/", async (req, res) => {
    const { url: inputUrl } = req.body;

    if (!inputUrl) {
        return res.status(400).json({ error: "URL is required in the request body." });
    }

    const parsedUrl = parseUrl(inputUrl);
    let websiteName = parsedUrl.hostname;
    globalWebsiteName = websiteName;

    if (!websiteName) {
        return res.status(400).json({ error: "Invalid URL. Unable to extract the website name." });
    }

    try {
        await clearS3Bucket(S3_BUCKET_NAME);
        await screenShotFunc(inputUrl, websiteName, res);
    } catch (error) {
        console.error(`An error occurred: ${error.message}`);
        res.status(500).json({ error: "Internal server error." });
    }
});



module.exports = routerScreenshot;