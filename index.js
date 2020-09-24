var config = require('./config/config');
const puppeteer = require('puppeteer');
const $ = require('cheerio');
const CronJob = require('cron').CronJob;
const nodemailer = require('nodemailer');

const link = config.url;

async function configureBrowser() {
    //launch args only needed for heroku deployment. Also had to add build pack in heroku settings
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();

    await page.goto(link);
    return page;
}

async function checkPrice(page) {
    await page.reload();
    //evaluate function gets the page content
    let html = await page.evaluate(() => document.body.innerHTML);

    //this is cheerio logic - based on jquery
    $('#priceblock_ourprice', html).each(function() {
        let poundPrice = $(this).text();
        let currentPrice = Number(poundPrice.replace(/[^0-9.-]+/g,""));
        
        if (currentPrice < config.price) {
            console.log('BUY ' + currentPrice);
            sendNotification(currentPrice);
        }
    });
}

async function startTracking() {
    const page = await configureBrowser();

    let job = new CronJob('*/15 * * * * *', function() { 

        // every 15 seconds: */15 * * * * *
        // every 6 hours: 0 */6 * * *

        checkPrice(page);
    }, null, true, null, null, true);
    job.start();
    };

    async function sendNotification(price) {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            secure: false,
            auth: {
                user: config.sendUser,
                pass: config.sendPass
            }
        });

        let textToSend = 'Price dropped to ' + price;
        let htmlText = `<a href=\"${link}\">Link</a>`;

        let info = await transporter.sendMail({
            from: `"Price Tracker"`,
            to: config.receiver,
            subject: 'Price dropped to ' + price,
            text: textToSend,
            html: htmlText
        });

        console.log("Message sent: %s", info.messageId);
    }

    startTracking();


    //same as startTracking function, but just does immediately
// async function monitor() {
//     let page = await configureBrowser();
//     await checkPrice(page);
// }

// monitor();