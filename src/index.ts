import 'dotenv/config';
import { listEntities, sendImage, setBrightness, resetGifCache } from './utils';
import { generateStairsImage } from './generators/stairs';
import { generateLocksImage } from './generators/locks';
import { generateGarageImage } from './generators/garage';
import { generatePowerImage } from './generators/power';
import { generatePhonesImage } from './generators/phones';

const DIVOOM_IP = process.env.DIVOOM_IP;
const HA_URL = process.env.HOME_ASSISTANT_URL;
const HA_TOKEN = process.env.HOME_ASSISTANT_TOKEN;

if (!DIVOOM_IP) {
  throw new Error('DIVOOM_IP not set in .env file');
}

if (!HA_URL || !HA_TOKEN) {
  throw new Error('HOME_ASSISTANT_URL and HOME_ASSISTANT_TOKEN must be set in .env file');
}

async function main() {
  console.log(`Connecting to Divoom Time Gate at ${DIVOOM_IP}`);
  console.log(`Connecting to Home Assistant at ${HA_URL}`);

  await setBrightness(100);
  await resetGifCache();

  const entities = await listEntities();
  console.log(`Found ${entities.length} entities`);

  const img1 = await generateStairsImage(entities);
  await sendImage(img1, [0], 'stairs');
  console.log('Screen 1 sent');
  await new Promise((resolve) => setTimeout(resolve, 200));

  const img2 = await generateLocksImage(entities);
  await sendImage(img2, [1], 'locks');
  console.log('Screen 2 sent');
  await new Promise((resolve) => setTimeout(resolve, 200));

  const img3 = await generateGarageImage(entities);
  await sendImage(img3, [2], 'garage');
  console.log('Screen 3 sent');
  await new Promise((resolve) => setTimeout(resolve, 200));

  const img4 = await generatePowerImage(entities);
  await sendImage(img4, [3], 'power');
  console.log('Screen 4 sent');
  await new Promise((resolve) => setTimeout(resolve, 200));

  const img5 = await generatePhonesImage();
  await sendImage(img5, [4], 'phones');
  console.log('Screen 5 sent');

  console.log('Done!');
}

main();
