import { createCanvas } from 'canvas';

const HOMIE_URL = 'https://homie.jpc.io';

interface CarData {
  battery: number;
  range: number;
  charging: string;
}

export async function generateTeslaBatteryImage(): Promise<Buffer> {
  const res = await fetch(`${HOMIE_URL}/api/car`);
  const data: CarData = await res.json();

  const canvas = createCanvas(64, 64);
  const ctx = canvas.getContext('2d');

  // Black background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 64, 64);

  // Color based on battery level
  const color = data.battery > 50 ? '#00FF00' : data.battery > 20 ? '#FFFF00' : '#FF0000';

  // Border
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 62, 62);

  // Tesla label
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚡TESLA⚡', 32, 10);

  // Battery percentage with %
  ctx.fillStyle = color;
  ctx.font = 'bold 24px Arial';
  ctx.fillText(`${Math.round(data.battery)}%`, 32, 32);

  // Range
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '9px Arial';
  ctx.fillText(`${Math.round(data.range)} mi`, 32, 50);

  // Charging status
  const isCharging = data.charging !== 'disconnected' && data.charging !== 'complete';
  if (isCharging) {
    ctx.fillStyle = '#00FF00';
    ctx.font = '8px Arial';
    ctx.fillText('charging', 32, 60);
  }

  return canvas.toBuffer('image/jpeg');
}
