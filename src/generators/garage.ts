import { createCanvas } from 'canvas';

function drawGarageDoor(canvas: any, isClosed: boolean, timeText: string, statusText: string) {
  const ctx = canvas.getContext('2d');

  // Black background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 64, 64);

  const color = isClosed ? '#00FF00' : '#FF0000';

  // Draw colored ring around edge
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  if (!isClosed) {
    ctx.setLineDash([4, 4]); // Dashed for open
  }
  ctx.strokeRect(1, 1, 62, 62);
  ctx.setLineDash([]); // Reset to solid

  // Draw time at top
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '8px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(timeText, 32, 8);

  // Draw garage frame
  ctx.strokeStyle = '#888888';
  ctx.lineWidth = 2;
  ctx.strokeRect(14, 16, 36, 32);

  // Draw garage door panels
  ctx.fillStyle = color;

  if (isClosed) {
    // Closed door - horizontal panels
    for (let i = 0; i < 5; i++) {
      const y = 18 + i * 6;
      ctx.fillRect(16, y, 32, 5);
    }
  } else {
    // Open door - panels at top (rolled up)
    for (let i = 0; i < 3; i++) {
      const y = 18 + i * 3;
      ctx.fillRect(16, y, 32, 2);
    }
  }

  // Draw handle (only visible when closed)
  if (isClosed) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(30, 36, 4, 2);
  }

  // Draw status text at bottom
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(statusText, 32, 58);
}

export async function generateGarageImage(entities: any[]) {
  const garage = entities.find((e) => e.entity_id.startsWith('cover.'));
  const garageState = garage?.state || 'unknown';
  const garageTime = garage?.last_changed
    ? new Date(garage.last_changed).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/New_York',
      })
    : '';
  const isClosed = garageState === 'closed';
  const statusText = isClosed ? 'CLOSED' : 'OPEN';

  const canvas = createCanvas(64, 64);
  drawGarageDoor(canvas, isClosed, garageTime, statusText);

  return canvas.toBuffer('image/jpeg');
}
