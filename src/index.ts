import 'dotenv/config';
import { listEntities, sendImage, setBrightness, resetGifCache } from './utils';
import { generateStairsImage } from './generators/stairs';
import { generateLocksImage } from './generators/locks';
import { generateGarageImage } from './generators/garage';
import { generatePowerImage } from './generators/power';
import { generatePhonesImage } from './generators/phones';
import { generateJohnStepsImage } from './generators/john-steps';
import { generateEmilyStepsImage } from './generators/emily-steps';
import { generateTeslaBatteryImage } from './generators/tesla-battery';

const DIVOOM_IP = process.env.DIVOOM_IP;
const HA_URL = process.env.HOME_ASSISTANT_URL;
const HA_TOKEN = process.env.HOME_ASSISTANT_TOKEN;

if (!DIVOOM_IP) {
  throw new Error('DIVOOM_IP not set in .env file');
}

if (!HA_URL || !HA_TOKEN) {
  throw new Error('HOME_ASSISTANT_URL and HOME_ASSISTANT_TOKEN must be set in .env file');
}

const screens: Record<number, { name: string; generate: (entities: any[]) => Promise<Buffer> }> = {
  0: { name: 'emily-steps', generate: () => generateEmilyStepsImage() },
  1: { name: 'locks', generate: generateLocksImage },
  2: { name: 'garage', generate: generateGarageImage },
  3: { name: 'power', generate: generatePowerImage },
  4: { name: 'tesla-battery', generate: () => generateTeslaBatteryImage() },
};

// Available but not currently assigned:
// generateJohnStepsImage, generateEmilyStepsImage

async function main() {
  console.log(`Connecting to Divoom Time Gate at ${DIVOOM_IP}`);
  console.log(`Connecting to Home Assistant at ${HA_URL}`);

  await setBrightness(100);
  await resetGifCache();

  const entities = await listEntities();
  console.log(`Found ${entities.length} entities`);

  for (const [screenId, { name, generate }] of Object.entries(screens)) {
    const img = await generate(entities);
    await sendImage(img, [Number(screenId)], name);
    console.log(`Screen ${Number(screenId) + 1} (${name}) sent`);
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log('Done!');
}

main();
