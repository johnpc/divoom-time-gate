'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDashboard } from '@/hooks/use-dashboard';

export function Dashboard() {
  const { data, isLoading } = useDashboard();

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {/* Stairs */}
      <Card>
        <CardHeader>
          <CardTitle>Heated Stairs</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant={data.stairs.on === 0 ? 'secondary' : 'destructive'}>
            {data.stairs.on === 0 ? 'OFF' : `${data.stairs.on}/${data.stairs.total} ON`}
          </Badge>
        </CardContent>
      </Card>

      {/* Locks */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Locks</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant={data.locks.locked === data.locks.total ? 'default' : 'destructive'}>
            {data.locks.locked === data.locks.total
              ? 'LOCKED'
              : `${data.locks.locked}/${data.locks.total} LOCKED`}
          </Badge>
        </CardContent>
      </Card>

      {/* Garage */}
      <Card>
        <CardHeader>
          <CardTitle>Garage Door</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant={data.garage.state === 'closed' ? 'default' : 'destructive'}>
            {data.garage.state.toUpperCase()}
          </Badge>
          <p className="text-sm text-muted-foreground mt-2">{data.garage.time}</p>
        </CardContent>
      </Card>

      {/* Power */}
      <Card>
        <CardHeader>
          <CardTitle>Energy Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{data.power.kw.toFixed(2)} kW</p>
            <p className="text-sm">{data.power.kwh.toFixed(2)} kWh</p>
            <p className="text-sm text-muted-foreground">${data.power.cost.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Lights */}
      <Card>
        <CardHeader>
          <CardTitle>Lights</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant={data.lights === 0 ? 'secondary' : 'default'}>
            {data.lights} ON
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
