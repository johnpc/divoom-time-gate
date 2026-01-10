import { createCanvas } from 'canvas';

function drawPhoneCount(canvas: any, count: number, statusText: string) {
  const ctx = canvas.getContext('2d');

  // Black background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 64, 64);

  // Draw blue ring around edge
  ctx.strokeStyle = '#0000FF';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 62, 62);

  // Draw count in yellow
  ctx.fillStyle = '#FFFF00';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(count.toString(), 32, 28);

  // Draw status text at bottom
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '8px Arial';
  ctx.fillText(statusText, 32, 58);
}

export async function generatePhonesImage() {
  const HOMIE_URL = process.env.HOMIE_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${HOMIE_URL}/api/phones`);
    const phones = await response.json();
    const connectedCount = phones.filter((p: any) => p.connected).length;
    const statusText = 'PHONES';

    const canvas = createCanvas(64, 64);
    drawPhoneCount(canvas, connectedCount, statusText);

    return canvas.toBuffer('image/jpeg');
  } catch (error) {
    console.error('Error fetching phones:', error);
    // Return error image
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 64, 64);
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 62, 62);
    ctx.fillStyle = '#FF0000';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ERR', 32, 32);
    return canvas.toBuffer('image/jpeg');
  }
}
