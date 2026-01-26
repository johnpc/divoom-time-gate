import { createCanvas } from 'canvas';

const API_URL = process.env.STEPS_API_URL!;
const API_KEY = process.env.STEPS_API_KEY!;
const AUTH_KEY = process.env.STEPS_AUTH_KEY!;
const USER_ID = process.env.JOHN_USER_ID!;

function formatSteps(steps: number): string {
  return steps >= 1000 ? `${(steps / 1000).toFixed(1)}k` : steps.toString();
}

export async function generateJohnStepsImage() {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: JSON.stringify({
      query: `query { getSteps(apiKey: "${AUTH_KEY}", userId: "${USER_ID}") { value } }`,
    }),
  });
  const data = await res.json();
  const steps = JSON.parse(data?.data?.getSteps?.value || '{}').steps || 0;

  const canvas = createCanvas(64, 64);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 64, 64);

  // Cyan border
  ctx.strokeStyle = '#00FFFF';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 62, 62);

  // Cyan name
  ctx.fillStyle = '#00FFFF';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('JOHN', 32, 16);

  // Yellow number
  ctx.fillStyle = '#FFFF00';
  ctx.font = 'bold 23.9px Arial';
  ctx.fillText(formatSteps(steps), 32, 40);

  // Cyan "steps"
  ctx.fillStyle = '#00FFFF';
  ctx.font = '10px Arial';
  ctx.fillText('steps', 32, 56);

  return canvas.toBuffer('image/jpeg');
}
