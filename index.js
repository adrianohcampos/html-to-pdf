require('dotenv').config();
const express = require("express");
const puppeteer = require("puppeteer");
//const s3Client = require('./s3Client');
const fs = require('fs');
const app = express();
const time = new Date().getTime();

app.get("/pdf", async (req, res) => {

    const url = req.query.target;
    const key = req.query.target

    if (key != )
        // Create an instance of the chrome browser
        const browser = await puppeteer.launch({
            headless: true
        });

    // Create a new page
    const webPage = await browser.newPage();

    // Configure the navigation timeout
    await webPage.setDefaultNavigationTimeout(0);

    // Navigate to some website e.g Our Code World
    await webPage.goto(url, {
        waitUntil: "networkidle0"
    });

    // Set filename
    let pageTitle = await webPage.title();
    pageTitle = pageTitle.replace(/[^a-zA-Z0-9]/g, '_');
    pageTitle = pageTitle.toLowerCase();
    const filename = pageTitle + '_' + time + '.pdf';

    // Set pdf file name
    const pdfConfig = {
        path: filename, // Saves pdf to disk. 
        format: 'A4',
        printBackground: true,
        margin: { // Word's default A4 margins
            top: '1cm',
            bottom: '1cm',
            left: '1cm',
            right: '1cm'
        },
    };

    // Return the pdf buffer. Useful for saving the file not to disk. 
    await webPage.pdf(pdfConfig);

    await browser.close();

    // Upload pdf to AWS
    // const urlaws = await s3Client.uploadFile(newname, newname);

    const json = JSON.stringify({
        target: url,
        file: filename,
        // aws: urlaws
    });

    res.contentType("application/json");
    res.send(json);
})

app.listen(3000, () => {
    console.log("Server started");
});