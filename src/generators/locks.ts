import { createCanvas } from 'canvas';

function drawPadlock(canvas: any, isLocked: boolean, statusText: string) {
  const ctx = canvas.getContext('2d');

  // Black background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 64, 64);

  const color = isLocked ? '#00FF00' : '#FF0000';

  // Draw colored ring around edge
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  if (!isLocked) {
    ctx.setLineDash([4, 4]); // Dashed for unlocked
  }
  ctx.strokeRect(1, 1, 62, 62);
  ctx.setLineDash([]); // Reset to solid

  // Draw shackle (top curved part)
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();

  if (isLocked) {
    // Closed shackle
    ctx.arc(32, 22, 10, Math.PI, 0, false);
  } else {
    // Open shackle (only left side)
    ctx.arc(32, 22, 10, Math.PI, Math.PI * 0.5, false);
  }
  ctx.stroke();

  // Draw lock body (rectangle with rounded bottom)
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(20, 28, 24, 20, [0, 0, 4, 4]);
  ctx.fill();

  // Draw keyhole
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(32, 36, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(30, 36, 4, 6);

  // Draw status text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '8px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(statusText, 32, 58);
}

export async function generateLocksImage(entities: any[]) {
  const locks = entities.filter((e) => ['lock.back_door', 'lock.front_door'].includes(e.entity_id));
  const locksLocked = locks.filter((l) => l.state === 'locked').length;
  const isLocked = locksLocked === locks.length;
  const statusText = `${locksLocked}/${locks.length} LOCKED`;

  const canvas = createCanvas(64, 64);
  drawPadlock(canvas, isLocked, statusText);

  return canvas.toBuffer('image/jpeg');
}
