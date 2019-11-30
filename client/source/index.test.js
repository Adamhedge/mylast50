const puppeteer = require('puppeteer');
const keys = require('./../../server/helpers/keys.js');

const isDebugging = () => {
  const debugging_mode = {
    slowMo: 250,
    devtools: true,
  };
  return process.env.NODE_ENV === 'debug' ? debugging_mode : {};
};

describe('on page load', () => {
  let browser;
  let page;
  beforeAll(async() => {
    browser = await puppeteer.launch(isDebugging());
    page = await browser.newPage();
    page.emulate({
      viewport: {
        width: 800,
        height: 800,
      },
      userAgent: '',
    });
    await page.goto('http://localhost:5050/');
  });
  test('fiftyButton loads correctly', async() => {
    const instructions = await page.$eval('.instructions', e => e.innerHTML);
    expect(instructions).toBe('Push to make a playlist of your last 50 songs');
  }, 16000);

  test('fiftyButton creates a playlist and sends you to spotify.', async() => {
    await page.click('.button');
    await page.waitForNavigation();
    await page.tap('#login-username');
    await page.type('#login-username', keys.test_username);
    await page.tap('#login-password');
    await page.type('#login-password', keys.test_password);
    await page.click('#login-button');
    await page.waitForNavigation();
    expect(page.url()).toMatch('https://open.spotify.com/playlist/');

  }, 15000);

  afterAll(() => {
    browser.close();
  });
});
