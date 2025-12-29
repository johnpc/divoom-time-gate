import { NextResponse } from 'next/server';
import type { Entity, DashboardData } from '@/types';

export async function GET() {
  const response = await fetch(`${process.env.HOME_ASSISTANT_URL}/api/states`, {
    headers: { Authorization: `Bearer ${process.env.HOME_ASSISTANT_TOKEN}` },
  });

  const entities: Entity[] = await response.json();

  // Stairs
  const stairs = entities.filter(
    (e) =>
      e.entity_id === 'switch.smart_plug_3_socket_1' ||
      e.entity_id === 'switch.heated_stairs_3_socket_1'
  );
  const stairsOn = stairs.filter((s) => s.state === 'on').length;

  // Locks
  const locks = entities.filter((e) => ['lock.back_door', 'lock.front_door'].includes(e.entity_id));
  const locksLocked = locks.filter((l) => l.state === 'locked').length;

  // Garage
  const garage = entities.find((e) => e.entity_id.startsWith('cover.'));
  const garageTime = garage?.last_changed
    ? new Date(garage.last_changed).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/New_York',
      })
    : '';

  // Power
  const power = entities.find((e) => e.entity_id === 'sensor.dte_instantaneous_demand');
  const monthlyEnergy = entities.find((e) => e.entity_id === 'sensor.monthly_energy');
  const powerKw = parseFloat(power?.state || '0') / 1000;
  const energyKwh = parseFloat(monthlyEnergy?.state || '0') * 60;
  const costDollars = energyKwh * 0.17;

  // Lights
  const lights = entities.filter(
    (e) => e.entity_id.startsWith('light.') && e.state === 'on'
  ).length;

  const data: DashboardData = {
    stairs: { on: stairsOn, total: stairs.length },
    locks: { locked: locksLocked, total: locks.length },
    garage: { state: garage?.state || 'unknown', time: garageTime },
    power: { kw: powerKw, kwh: energyKwh, cost: costDollars },
    lights,
  };

  return NextResponse.json(data);
}
