require('dotenv').config();
const express = require("express");
const puppeteer = require("puppeteer");
const s3Client = require('./s3Client');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.get("/pdf", async (req, res) => {

    const time = new Date().getTime();
    const url = req.query.target;
    const key = req.query.key
    const path = "class-studio/pdf/";
    let json = '';

    if (key == process.env.KEY) {

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
        const filename = uuidv4() + '.pdf';

        // declare html markup for footer
        html = `<div style="font-size: 13px; padding-top: 8px; text-align: center; width: 100%;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>`;

        // Set pdf file name
        const pdfConfig = {
            format: 'A4',
            displayHeaderFooter: true,
            printBackground: true,
            headerTemplate: '<div></div>',
            footerTemplate: html,
            margin: { // Word's default A4 margins
                top: '15mm',
                bottom: '17mm',
                left: '15mm',
                right: '15mm'
            },
        };

        // Return the pdf buffer. Useful for saving the file not to disk. 
        const pdf = await webPage.pdf(pdfConfig);

        await browser.close();

        // Upload pdf to AWS
        const urlaws = await s3Client.uploadFile(path + filename, pdf, "application/pdf");

        json = JSON.stringify({
            target: url,
            file: filename,
            aws: urlaws
        });

    } else {

        json = JSON.stringify({
            target: url,
            error: 'Key invalid'
        });

    }

    res.contentType("application/json");
    res.send(json);
})

app.get("/pdf-merge", async (req, res) => {

    json = JSON.stringify({
        target: url,
        error: 'Function not implemented'
    });

    res.contentType("application/json");
    res.send(json);
})

app.listen(3000, () => {
    console.log("Server started");
});