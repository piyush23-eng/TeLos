const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--window-size=1920,1080', '--no-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://127.0.0.1:8787');
  await new Promise(r => setTimeout(r, 1500));

  // Inject mouse cursor and subtitle bar
  await page.evaluate(() => {
    const cursor = document.createElement('div');
    cursor.id = 'puppeteer-mouse-pointer';
    cursor.style.cssText = `
      position: fixed;
      top: 200px; left: 200px;
      width: 28px; height: 28px;
      background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="%23ffffff" stroke="%23000000" stroke-width="2" stroke-linejoin="round"><path d="M5 3L19 12L12 14L9 21L5 3Z"/></svg>') no-repeat;
      pointer-events: none;
      z-index: 999999;
      transition: transform 0.15s ease-out, top 0.4s cubic-bezier(0.25, 1, 0.5, 1), left 0.4s cubic-bezier(0.25, 1, 0.5, 1);
    `;
    document.body.appendChild(cursor);
    window.moveCursor = (x, y) => { cursor.style.left = x + 'px'; cursor.style.top = y + 'px'; };
    window.clickCursor = (x, y) => {
      cursor.style.left = x + 'px'; cursor.style.top = y + 'px';
      cursor.style.transform = 'scale(0.8)';
      setTimeout(() => cursor.style.transform = 'scale(1)', 150);
    };

    const sub = document.createElement('div');
    sub.id = 'telos-launch-subtitles';
    sub.style.cssText = `
      position: fixed;
      bottom: 38px;
      left: 50%;
      transform: translateX(-50%);
      width: 1380px;
      background: rgba(10, 9, 16, 0.92);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 18px;
      padding: 16px 32px 18px 32px;
      backdrop-filter: blur(20px);
      box-shadow: 0 20px 60px rgba(0,0,0,0.85);
      text-align: center;
      z-index: 999998;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;
    document.body.appendChild(sub);
    window.setSub = (stage, text) => {
      sub.innerHTML = `
        <div style="color: #6e54f6; font-size: 13px; font-weight: 800; letter-spacing: 0.08em; margin-bottom: 6px;">${stage}</div>
        <div style="font-size: 25px; line-height: 1.35; font-weight: 600; color: #ffffff; letter-spacing: -0.01em;">"${text}"</div>
      `;
    };
  });

  const ffmpeg = spawn('ffmpeg', [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-r', '30',
    '-i', '-',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-r', '30',
    '/tmp/test_live_act.mp4'
  ]);

  const client = await page.target().createCDPSession();
  let frameCount = 0;

  client.on('Page.screencastFrame', async ({ data, sessionId }) => {
    frameCount++;
    ffmpeg.stdin.write(Buffer.from(data, 'base64'));
    try {
      await client.send('Page.screencastFrameAck', { sessionId });
    } catch (e) {}
  });

  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 85,
    maxWidth: 1920,
    maxHeight: 1080,
    everyNthFrame: 1
  });

  // Action: update subtitle, move cursor to Sign in, click
  await page.evaluate(() => window.setSub('01 // SIGNUP', "First, let's open the registration modal to create an account."));
  await page.evaluate(() => window.moveCursor(1800, 35));
  await new Promise(r => setTimeout(r, 600));

  await page.evaluate(() => window.clickCursor(1820, 35));
  await page.click('.account-cta');
  await new Promise(r => setTimeout(r, 800));

  // Switch to signup
  await page.evaluate(() => window.moveCursor(1020, 680));
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => {
    const b = document.querySelector('.auth-switch button');
    if (b && b.innerText.includes('Create an account')) b.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Type name, email, pass
  const nameInput = await page.$('.auth-card input[placeholder*="Aarav"]') || await page.$('.auth-card input');
  if (nameInput) await nameInput.type('Aarav Sharma', { delay: 40 });
  const emailInput = await page.$('.auth-card input[type="email"]');
  if (emailInput) await emailInput.type('aarav.sharma@gmail.com', { delay: 40 });
  const passInput = await page.$('.auth-card input[type="password"]');
  if (passInput) await passInput.type('SuperSecurePass123!', { delay: 40 });

  await new Promise(r => setTimeout(r, 800));

  await client.send('Page.stopScreencast');
  ffmpeg.stdin.end();

  await new Promise(r => ffmpeg.on('close', r));
  console.log(`TEST LIVE RECORDER: ${frameCount} frames recorded! Size: ${fs.statSync('/tmp/test_live_act.mp4').size} bytes`);

  await browser.close();
})();
