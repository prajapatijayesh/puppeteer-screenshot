const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const moment = require('moment');
const async = require('async');
const path = require('path');
var zl = require("zip-lib");

router.get('/', async (req, res, next) => {
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
    const findTag = await page.$$('a');
    const getProperty = await Promise.all(
      findTag.map(handle => handle.getProperty('href'))
    );
    const pageList = await Promise.all(
      getProperty.map(x => x.jsonValue())
    );
    console.log(pageList.length);
    //
    res.status(200).jsonp({
      status: 'success',
      message: 'Process has been started!',
      data: {
        pages: pageList.length
      }
    });
    //
    for (const pg of pageList) {
      if (pg.indexOf(URI) > -1) {
        console.log('started page', pg);
        await page.goto(pg, { waitUntil: 'load', timeout: 0 });
        await page.screenshot({ path: __dirname + `/../public/img/${moment().unix()}.png`, fullPage: true });
      }
    }

    await browser.close();
    // archive the directory
    const source_path = path.join(__dirname, '..', '/public/img/');
    const zip_path = path.join(__dirname, '..', `/public/img/archiver.zip`);
    console.log('preparing zip');

    zl.archiveFolder(source_path, zip_path).then(function () {
      console.log("done");
    }, function (err) {
      console.log(err);
    });

    console.log('--- END ---');
  } catch (error) {
    console.log(error);
    return res.status(500).jsonp({
      status: 'error',
      message: 'Something broke!'
    });
  }
});

module.exports = router;
