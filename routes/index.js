const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const moment = require('moment');

router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

router.post('/screenshot', async (req, res, next) => {
  const { URI } = req.body;
  try {
    if (!URI) {
      return res.status(404).jsonp({
        status: 'error',
        message: 'URI, parameter is missing!'
      });
    }
    const myURL = new URL('', URI);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(myURL, { waitUntil: 'load', timeout: 0 });
    await page.screenshot({ path: __dirname + `/../public/images/${moment().unix()}.png`, fullPage: true });
    await browser.close();

    return res.status(200).jsonp({
      status: 'success',
      message: 'Success'
    });
  } catch (error) {
    console.log(error);
    return res.status(500).jsonp({
      status: 'error',
      message: 'Something broke!'
    });
  }
});

module.exports = router;
