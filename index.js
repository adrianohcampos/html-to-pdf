require('dotenv').config();
const express = require("express");
const puppeteer = require("puppeteer");
const s3Client = require('./s3Client');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.get("/", async (req, res) => {
    console.log("GET '/' - Function not found");
    json = JSON.stringify({
        error: 'Function not found'
    });

    res.contentType("application/json");
    res.send(json);
})

app.get("/pdf", async (req, res) => {

    try {


        console.log("GET", "/pdf - Start");
        const url = req.query.target;
        const key = req.query.key
        const path = "class-studio/pdf/";
        let json = '';

        if (url && url != '' && key == process.env.KEY) {
            console.log("KEY", "ok");
            // Create an instance of the chrome browser
            console.log("browser", "launch");
            const browser = await puppeteer.launch({
                headless: true,
                executablePath: '/usr/bin/chromium-browser',
                args: ["--no-sandbox"]
            });


            // Create a new page
            console.log("browser", "newPage");
            const webPage = await browser.newPage();


            // Configure the navigation timeout
            console.log("webPage", "setDefaultNavigationTimeout");
            await webPage.setDefaultNavigationTimeout(0);

            // Navigate to some website e.g Our Code World
            console.log("webPage", "goto: " + url);
            await webPage.goto(url, {
                waitUntil: "networkidle0"
            });

            // Set filename   
            console.log("filename", "init");
            const filename = uuidv4() + '.pdf';
            console.log("filename", filename);

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

            console.log("webPage", "pdf");
            // Return the pdf buffer. Useful for saving the file not to disk. 
            const pdf = await webPage.pdf(pdfConfig);

            console.log("browser", "close");
            await browser.close();

            // Upload pdf to AWS
            console.log("s3Client", "uploadFile");
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

    } catch (error) {

        json = JSON.stringify({
            target: url,
            error: error
        });

        res.contentType("application/json");
        res.send(json);
    }
})

app.get("/pdf-merge", async (req, res) => {

    json = JSON.stringify({
        error: 'Function not implemented'
    });

    res.contentType("application/json");
    res.send(json);
})

app.listen(3000, () => {
    console.log("Server started");
});