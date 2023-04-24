'use strict';

const { program } = require('commander');
const puppeteer = require('puppeteer');

const _url = '-u, --url <URL>';
const URL = 'https://dev.amidstyle.com/';

program
  .option(_url, 'dev URL', URL)
  .parse();

if (program.opts().url !== URL) {
  throw new Error('URL not allowed');
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });

  try {
    const page = await browser.newPage();

    // await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64; rv:108.0) Gecko/20100101 Firefox/108.0');

    await page.evaluateOnNewDocument(() => {
      // Pass webdriver check
      Object.defineProperty(navigator, 'webdriver', {
          get: () => false,
      });
    });

    // Need for old Headless
    // await page.evaluateOnNewDocument(() => {
    //   // Overwrite the `plugins` property to use a custom getter.
    //   Object.defineProperty(navigator, 'plugins', {
    //     // This just needs to have `length > 0` for the current test,
    //     // but we could mock the plugins too if necessary.
    //     get: () => [1, 2, 3, 4, 5],
    //   });
    // });

    await page.goto(URL);

    const res = await page.waitForResponse('https://dev.amidstyle.com/api.php');    
    const resJson = await res.json();
    const resString = JSON.stringify(resJson);

    if (!resJson.sign) {
      throw new Error(`Bad Request -- ${resString}`)
    }

    console.log(`Done -- ${resString}`);
  } finally {
    await browser.close();
  }
})();
