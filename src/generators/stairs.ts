import { createCanvas } from 'canvas';

function drawStaircase(canvas: any, color: string, statusText: string) {
  const ctx = canvas.getContext('2d');

  // Black background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 64, 64);

  // Draw colored ring around edge
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 62, 62);

  // Draw staircase (5 steps)
  ctx.fillStyle = color;
  const stepHeight = 6;
  const stepDepth = 8;

  for (let i = 0; i < 5; i++) {
    const x = 12 + i * stepDepth;
    const y = 34 - i * stepHeight;
    const width = stepDepth * (5 - i);
    const height = stepHeight * (i + 1);

    ctx.fillRect(x, y, width, height);

    // Add step edge highlight
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.stroke();
  }

  // Draw status text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '8px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(statusText, 32, 58);
}

export async function generateStairsImage(entities: any[]) {
  const stairs = entities.filter(
    (e) =>
      e.entity_id === 'switch.smart_plug_3_socket_1' ||
      e.entity_id === 'switch.heated_stairs_3_socket_1'
  );
  const stairsOn = stairs.filter((s) => s.state === 'on').length;
  const color = stairsOn > 0 ? '#FF0000' : '#0000FF';
  const statusText = stairsOn === 0 ? 'STAIRS OFF' : stairsOn === 1 ? 'STAIRS 1 ON' : 'STAIRS 2 ON';

  const canvas = createCanvas(64, 64);
  drawStaircase(canvas, color, statusText);

  return canvas.toBuffer('image/jpeg');
}
