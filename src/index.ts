import 'dotenv/config';
import { createCanvas } from 'canvas';
import { createHash } from 'crypto';

const DIVOOM_IP = process.env.DIVOOM_IP;
const HA_URL = process.env.HOME_ASSISTANT_URL;
const HA_TOKEN = process.env.HOME_ASSISTANT_TOKEN;
const ELECTRICITY_RATE = parseFloat(process.env.ELECTRICITY_RATE || '0.15'); // $/kWh

if (!DIVOOM_IP) {
  throw new Error('DIVOOM_IP not set in .env file');
}

if (!HA_URL || !HA_TOKEN) {
  throw new Error('HOME_ASSISTANT_URL and HOME_ASSISTANT_TOKEN must be set in .env file');
}

async function sendCommand(command: Record<string, unknown>) {
  const response = await fetch(`http://${DIVOOM_IP}/post`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  return response.json();
}

// Home Assistant API
export async function getEntityState(entityId: string) {
  const response = await fetch(`${HA_URL}/api/states/${entityId}`, {
    headers: { Authorization: `Bearer ${HA_TOKEN}` },
  });
  return response.json();
}

export async function listEntities() {
  const response = await fetch(`${HA_URL}/api/states`, {
    headers: { Authorization: `Bearer ${HA_TOKEN}` },
  });
  return response.json();
}

// Generate a 64x64 image with text
export function generateTextImage(
  line1: string,
  line2: string,
  line3 = '',
  color = '#FFFFFF',
  bgColor = '#000000'
) {
  const canvas = createCanvas(64, 64);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 64, 64);

  ctx.fillStyle = color;
  ctx.font = 'bold 10px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (line3) {
    ctx.fillText(line1, 32, 20);
    ctx.fillText(line2, 32, 32);
    ctx.fillText(line3, 32, 44);
  } else {
    ctx.fillText(line1, 32, 24);
    ctx.fillText(line2, 32, 40);
  }

  return canvas.toBuffer('image/jpeg');
}

// Send image to specific screen(s)
export async function sendImage(imageBuffer: Buffer, screens: number[]) {
  const base64 = imageBuffer.toString('base64');
  const lcdArray = [0, 0, 0, 0, 0];
  screens.forEach((s) => (lcdArray[s] = 1));

  // Use MD5 hash of image content + screen number + timestamp to force updates
  const screenId = screens[0]; // Use first screen in array
  const timestamp = Math.floor(Date.now() / 1000);
  const hash = createHash('md5')
    .update(imageBuffer)
    .update(`screen${screenId}`)
    .update(`${timestamp}`)
    .digest('hex');
  const picId = parseInt(hash.substring(0, 8), 16) % 10000;
  console.log(`Screen ${screenId} PicID: ${picId}`);

  return sendCommand({
    Command: 'Draw/SendHttpGif',
    LcdArray: lcdArray,
    PicNum: 1,
    PicOffset: 0,
    PicID: picId,
    PicSpeed: 1000,
    PicWidth: 64,
    PicData: base64,
  });
}

export const setBrightness = (brightness: number) =>
  sendCommand({ Command: 'Channel/SetBrightness', Brightness: brightness });

async function main() {
  console.log(`Connecting to Divoom Time Gate at ${DIVOOM_IP}`);
  console.log(`Connecting to Home Assistant at ${HA_URL}`);

  await setBrightness(100);

  // Reset GIF cache to ensure fresh images
  await sendCommand({ Command: 'Draw/ResetHttpGifId' });

  const entities = await listEntities();
  console.log(`Found ${entities.length} entities`);

  // Screen 1: Heated Stairs
  const stairs = entities.filter(
    (e: { entity_id: string }) =>
      e.entity_id === 'switch.smart_plug_3_socket_1' ||
      e.entity_id === 'switch.heated_stairs_3_socket_1'
  );
  console.log(
    'Stairs entities:',
    stairs.map((s: { entity_id: string }) => s.entity_id)
  );
  const stairsOn = stairs.filter((s: { state: string }) => s.state === 'on').length;
  const stairsColor = stairsOn === 0 ? '#888888' : stairsOn === 1 ? '#FFA500' : '#FF0000';
  const stairsText = stairsOn === 0 ? 'OFF' : stairsOn === 1 ? '1 ON' : '2 ON';
  const img1 = generateTextImage('STAIRS', stairsText, '', stairsColor);
  await sendImage(img1, [0]);
  console.log('Screen 1 sent');
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Screen 2: Smart Locks (only actual door locks)
  const locks = entities.filter((e: { entity_id: string }) =>
    ['lock.back_door', 'lock.front_door'].includes(e.entity_id)
  );
  console.log(
    'Lock entities:',
    locks.map((l: { entity_id: string; state: string }) => `${l.entity_id}: ${l.state}`)
  );
  const locksLocked = locks.filter((l: { state: string }) => l.state === 'locked').length;
  console.log(`Locks locked: ${locksLocked}/${locks.length}`);
  const locksColor = locksLocked === locks.length ? '#00FF00' : '#FF0000';
  const locksText =
    locksLocked === locks.length ? 'LOCKED' : `${locksLocked}/${locks.length} LOCKED`;
  const img2 = generateTextImage('LOCKS', locksText, '', locksColor);
  await sendImage(img2, [1]);
  console.log('Screen 2 sent');
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Screen 3: Garage Door
  const garage = entities.find((e: { entity_id: string }) => e.entity_id.startsWith('cover.'));
  console.log('Garage entity:', garage?.entity_id);
  const garageState = garage?.state || 'unknown';
  const garageTime = garage?.last_changed
    ? new Date(garage.last_changed).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/New_York',
      })
    : '';
  const garageColor = garageState === 'closed' ? '#00FF00' : '#FF0000';
  const img3 = generateTextImage('GARAGE', garageState.toUpperCase(), garageTime, garageColor);
  await sendImage(img3, [2]);
  console.log('Screen 3 sent');
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Screen 4: Power Usage
  const power = entities.find(
    (e: { entity_id: string }) => e.entity_id === 'sensor.dte_instantaneous_demand'
  );
  const monthlyEnergy = entities.find(
    (e: { entity_id: string }) => e.entity_id === 'sensor.monthly_energy'
  );
  console.log('Power entity:', power?.entity_id, power?.state);
  console.log('Monthly energy entity:', monthlyEnergy?.entity_id, monthlyEnergy?.state);
  const powerKw = (parseFloat(power?.state || '0') / 1000).toFixed(2);
  // Multiply by 60 to correct for unit conversion:
  // MQTT sends per-minute energy (kWh/min) which gets integrated over time,
  // creating kWhh (kWh-hours). Multiply by 60 (minutes/hour) to get back to kWh.
  const energyKwh = (parseFloat(monthlyEnergy?.state || '0') * 60).toFixed(2);
  const costDollars = (parseFloat(monthlyEnergy?.state || '0') * 60 * 0.17).toFixed(2);
  const img4 = generateTextImage(`${powerKw} kW`, `${energyKwh} kWh`, `$${costDollars}`, '#FFAA00');
  await sendImage(img4, [3]);
  console.log('Screen 4 sent');
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Screen 5: Lights On
  const lights = entities.filter(
    (e: { entity_id: string; state: string }) =>
      e.entity_id.startsWith('light.') && e.state === 'on'
  );
  const lightsColor = lights.length === 0 ? '#888888' : '#FFFF00';
  const img5 = generateTextImage('LIGHTS', `${lights.length} ON`, '', lightsColor);
  await sendImage(img5, [4]);
  console.log('Screen 5 sent');

  console.log('Done!');
}

main();
