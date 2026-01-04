import { createCanvas } from 'canvas';

function drawLightBulb(canvas: any, count: number, statusText: string) {
  const ctx = canvas.getContext('2d');

  // Black background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 64, 64);

  const color = count === 0 ? '#888888' : '#FFFF00';

  // Draw yellow ring around edge
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 62, 62);

  // Draw bulb outline (teardrop/classic bulb shape)
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(32, 22, 12, Math.PI, 0, false);
  ctx.lineTo(38, 34);
  ctx.lineTo(26, 34);
  ctx.closePath();
  ctx.stroke();

  // Fill bulb
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.3;
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // Draw base (metal screw part)
  ctx.fillStyle = '#AAAAAA';
  ctx.fillRect(28, 34, 8, 2);
  ctx.fillRect(28, 37, 8, 2);
  ctx.fillRect(28, 40, 8, 2);
  ctx.fillRect(29, 43, 6, 3);

  // Draw count inside bulb
  ctx.fillStyle = color;
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(count.toString(), 32, 22);

  // Draw status text at bottom
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '8px Arial';
  ctx.fillText(statusText, 32, 58);
}

export async function generateLightsImage(entities: any[]) {
  const lights = entities.filter((e) => e.entity_id.startsWith('light.') && e.state === 'on');
  const count = lights.length;
  const statusText = `${count} ON`;

  const canvas = createCanvas(64, 64);
  drawLightBulb(canvas, count, statusText);

  return canvas.toBuffer('image/jpeg');
}
