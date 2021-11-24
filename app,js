require('dotenv').config();
const express = require("express");
const puppeteer = require("puppeteer");
const s3Client = require('./s3Client');
const fs = require('fs');
const app = express();

app.get("/pdf", async (req, res) => {
    const url = req.query.target;
    const time = new Date().getTime();
    const newname = time + '.pdf';

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

    const pdfConfig = {
        path: newname, // Saves pdf to disk. 
        format: 'A4',
        printBackground: true,
        margin: { // Word's default A4 margins
            top: '1cm',
            bottom: '1cm',
            left: '1cm',
            right: '1cm'
        },
        // displayHeaderFooter: true,
        // headerTemplate: ``,
        // footerTemplate: `
        //     <div style="border-top: solid 1px #bbb; width: 100%; font-size: 9px;
        //         padding: 5px 5px 0; color: #bbb; position: relative;">
        //         <div style="position: absolute; left: 5px; top: 5px;"><span class="date"></span></div>
        //         <div style="position: absolute; right: 5px; top: 5px;"><span class="pageNumber"></span>/<span class="totalPages"></span></div>
        //     </div>
        // `,
    };

    // await webPage.emulateMedia('screen');

    const pdf = await webPage.pdf(pdfConfig); // Return the pdf buffer. Useful for saving the file not to disk. 




    await browser.close();

    // const urlaws = await s3Client.uploadFile(newname, newname);

    const apostila = JSON.stringify({
        url: url,
        file: newname,
        // aws: urlaws
    });

    //fs.unlinkSync(newname);

    res.contentType("application/pdf");
    res.send(pdf);
})

app.listen(3000, () => {
    console.log("Server started");
});