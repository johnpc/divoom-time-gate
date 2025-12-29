export interface Entity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
}

export interface DashboardData {
  stairs: { on: number; total: number };
  locks: { locked: number; total: number };
  garage: { state: string; time: string };
  power: { kw: number; kwh: number; cost: number };
  lights: number;
}
