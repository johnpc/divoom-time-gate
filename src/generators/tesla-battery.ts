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

  // Color based on charging state
  const colorMap: Record<string, string> = {
    charging: '#FACC15', // yellow - actively charging
    starting: '#FACC15', // yellow - starting to charge
    complete: '#22C55E', // green - fully charged
    stopped: '#F97316', // orange - plugged in, not charging
    nopower: '#EF4444', // red - plugged in, no power
    disconnected: '#60A5FA', // blue - not plugged in
  };
  const color = colorMap[data.charging] ?? '#60A5FA';

  // Border
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 62, 62);

  // Range number (big)
  ctx.fillStyle = color;
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${Math.round(data.range)}`, 32, 20);

  // "miles" label
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '10px Arial';
  ctx.fillText('miles', 32, 38);

  // Tesla + battery percentage
  ctx.font = '10px Arial';
  ctx.fillText(`TESLA: ${Math.round(data.battery)}%`, 32, 54);

  return canvas.toBuffer('image/jpeg');
}
