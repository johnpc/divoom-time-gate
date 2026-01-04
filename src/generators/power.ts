import { createCanvas } from 'canvas';

function drawPowerUsage(
  canvas: any,
  powerKw: string,
  energyKwh: string,
  costDollars: string,
  isHighUsage: boolean
) {
  const ctx = canvas.getContext('2d');

  // Black background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 64, 64);

  const color = isHighUsage ? '#FF0000' : '#00FF00';

  // Draw colored ring around edge
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 62, 62);

  // Draw large power text
  ctx.fillStyle = color;
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${powerKw} kW`, 32, 24);

  // Draw small details below (separate lines)
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '8px Arial';
  ctx.fillText(`$${costDollars}`, 32, 44);
  ctx.fillText(`${energyKwh} kWh`, 32, 54);
}

export async function generatePowerImage(entities: any[]) {
  const power = entities.find((e) => e.entity_id === 'sensor.dte_instantaneous_demand');
  const monthlyEnergy = entities.find((e) => e.entity_id === 'sensor.monthly_energy');
  const powerKw = (parseFloat(power?.state || '0') / 1000).toFixed(1);
  const energyKwh = (parseFloat(monthlyEnergy?.state || '0') * 60).toFixed(2);
  const costDollars = (parseFloat(monthlyEnergy?.state || '0') * 60 * 0.17).toFixed(2);
  const isHighUsage = parseFloat(powerKw) >= 3.0;

  const canvas = createCanvas(64, 64);
  drawPowerUsage(canvas, powerKw, energyKwh, costDollars, isHighUsage);

  return canvas.toBuffer('image/jpeg');
}
