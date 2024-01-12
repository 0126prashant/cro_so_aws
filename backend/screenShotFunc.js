const puppeteer = require('puppeteer');
const fs = require('fs/promises');
const path = require('path');
const { S3 } = require('aws-sdk');
const s3 = new S3();

const S3_BUCKET_NAME = 'crow.so.admin';

async function captureScreenshots(inputUrl, screenshotPath) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    let screenshotsData = [];
    
    try {
        await page.goto(inputUrl, { waitUntil: 'networkidle0' });
        await page.waitForTimeout(5000);
        
        const { width: totalWidth, height: totalHeight } = await page.evaluate(() => ({
            width: document.body.scrollWidth,
            height: document.body.scrollHeight,
        }));
        
        for (let x = 0; x < totalWidth; x += 1920) {
            for (let y = 0; y < totalHeight; y += 1080) {
                await page.setViewport({ width: 1920, height: 1080 });
                await page.evaluate((x, y) => window.scrollTo(x, y), x, y);
                await page.waitForTimeout(2000);
                
                const screenshotImageData = await page.screenshot({
                    encoding: 'base64',
                    type: 'jpeg',
                    // quality: 90,
                });
                
                const fileName = `${Date.now()}_${x}_${y}.jpg`;
                
                const s3Params = {
                    Bucket: S3_BUCKET_NAME,
                    Key: `${screenshotPath}/${fileName}`,
                    Body: Buffer.from(screenshotImageData, 'base64'),
                    ContentType: 'image/jpeg',
                };
                
                const imageUrl = await uploadToS3(s3Params);
                console.log("imageUrl",imageUrl)
                screenshotsData.push({ key: `${x}_${y}`, imageUrl });
            }
        }
    } catch (error) {
        console.error(`An error occurred while capturing screenshots: ${error.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
    
    return screenshotsData;
}

async function uploadToS3(s3Params) {
    return new Promise((resolve, reject) => {
        s3.upload(s3Params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                // console.log("datalocation",data.Location)
                resolve(data.Location);
            }
        });
    });
}


async function screenShotFunc(inputUrl, websiteName, res) {
    const screenshotsParentPath = 'screenshots';

    try {
        await fs.mkdir(screenshotsParentPath, { recursive: true });
        const baseFolderName = inputUrl.replace(/[^a-zA-Z0-9]/g, '_');
        let folderName = baseFolderName;

        let folderCount = 1;
        while (await fs.access(path.join(screenshotsParentPath, folderName)).then(() => true).catch(() => false)) {
            folderCount++;
            folderName = `${baseFolderName}${folderCount}`;
        }

        const screenshotsData = await captureScreenshots(inputUrl, path.join(screenshotsParentPath, folderName));
        // await saveImageDataToMongoDB(websiteName, screenshotsData);
// -------imageurlextractingand savibngto json--------->>>>>>
        const imageUrls = screenshotsData.map(item => item.imageUrl);
        const jsonFilePath = path.join(__dirname, 'db.json');

        await fs.writeFile(jsonFilePath, JSON.stringify({ websiteName, imageUrls }, null, 2));
        
        res.status(200).json({ message: "Screenshots taken successfully!", screenshots: screenshotsData, websiteName });
    } catch (error) {
        console.error(`An error occurred: ${error.message}`);
        res.status(400).json({ error: error.message });
    }
}

module.exports = { screenShotFunc };
