import { createCanvas } from 'canvas';
import { createHash } from 'crypto';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const DIVOOM_IP = process.env.DIVOOM_IP;
const HA_URL = process.env.HOME_ASSISTANT_URL;
const HA_TOKEN = process.env.HOME_ASSISTANT_TOKEN;
const DRY_RUN = process.argv.includes('--dry-run');

async function sendCommand(command: Record<string, unknown>) {
  const response = await fetch(`http://${DIVOOM_IP}/post`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  return response.json();
}

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

export async function sendImage(imageBuffer: Buffer, screens: number[], name: string) {
  const screenId = screens[0];

  // Save to generated directory
  mkdirSync('generated', { recursive: true });
  const filename = join('generated', `screen${screenId}-${name}.jpg`);
  writeFileSync(filename, imageBuffer);
  console.log(`Saved: ${filename}`);

  if (DRY_RUN) {
    console.log(`[DRY RUN] Would send to screen ${screenId}`);
    return;
  }

  const base64 = imageBuffer.toString('base64');
  const lcdArray = [0, 0, 0, 0, 0];
  screens.forEach((s) => (lcdArray[s] = 1));

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

export const setBrightness = (brightness: number) => {
  if (DRY_RUN) {
    console.log(`[DRY RUN] Would set brightness to ${brightness}`);
    return;
  }
  return sendCommand({ Command: 'Channel/SetBrightness', Brightness: brightness });
};

export const resetGifCache = () => {
  if (DRY_RUN) {
    console.log('[DRY RUN] Would reset GIF cache');
    return;
  }
  return sendCommand({ Command: 'Draw/ResetHttpGifId' });
};
