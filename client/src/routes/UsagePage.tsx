import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChartNoAxesColumnIncreasing, Download, ChevronDown } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { api } from '../lib/api';
import type { UsageResponse } from '../types';
import './UsagePage.css';

type TrafficSource = 'all' | 'playground' | 'api';
type Granularity = 'day' | 'week' | 'month';

const TRAFFIC_LABELS: Record<TrafficSource, string> = {
  all: 'All traffic',
  playground: 'Playground',
  api: 'API',
};

function dateRangeDays(value: string): number {
  if (value === '7') return 7;
  if (value === '90') return 90;
  return 30;
}

function useUsageQuery(params: { from: string; to: string; granularity: Granularity; traffic: TrafficSource }) {
  return useQuery({
    queryKey: ['usage', params],
    queryFn: () => {
      const qs: Record<string, string> = {
        granularity: params.granularity,
        trafficSource: params.traffic,
        from: params.from,
        to: params.to,
      };
      return api.getUsage(qs);
    },
  });
}

function SigFigs(n: number): string {
  if (n === 0) return '0';
  if (n < 10) {
    // Keep 2 significant decimals for tiny money values.
    return n.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
  }
  return n.toLocaleString();
}

let uid = 0;

export function UsagePage() {
  const [traffic, setTraffic] = useState<TrafficSource>('all');
  const [rangeDays, setRangeDays] = useState(30);
  const [granularity, setGranularity] = useState<Granularity>('day');

  const { to, from } = useMemo(() => {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - rangeDays);
    return { to: toDate.toISOString().slice(0, 10), from: fromDate.toISOString().slice(0, 10) };
  }, [rangeDays]);

  const query = useUsageQuery({ from, to, granularity, traffic });
  const usage: UsageResponse | undefined = query.data;

  const [menu, setMenu] = useState<string | null>(null);
  useEffect(() => {
    const close = () => setMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const downloadCsv = () => {
    if (!usage) return;
    const rows = [
      ['date', 'traffic', 'input_tokens', 'output_tokens', 'requests', 'spend_usd'],
      ...usage.series.map((s) => [
        s.date,
        traffic,
        String(s.inputTokens),
        String(s.outputTokens),
        String(s.requests),
        String(s.spendUsd),
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usage-${from}-to-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const granularityLabel = granularity === 'day' ? 'Daily' : granularity === 'week' ? 'Weekly' : 'Monthly';
  const rangeLabel = `Last ${rangeDays} days`;

  return (
    <div className="usage-page">
      <div className="usage-header" onClick={(e) => e.stopPropagation()}>
        <div className="usage-title">
          <ChartNoAxesColumnIncreasing size={22} strokeWidth={1.7} />
          <span>Usage</span>
        </div>
        <div className="usage-controls">
          <div className="us-control">
            <button className="us-trigger" onClick={() => setMenu((m) => (m === 'traffic' ? null : 'traffic'))}>
              {TRAFFIC_LABELS[traffic]} <ChevronDown size={16} strokeWidth={1.7} />
            </button>
            {menu === 'traffic' && (
              <div className="us-menu">
                {(Object.keys(TRAFFIC_LABELS) as TrafficSource[]).map((t) => (
                  <button key={t} className="us-item" onClick={() => { setTraffic(t); setMenu(null); }}>
                    {TRAFFIC_LABELS[t]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="us-control">
            <button className="us-trigger" onClick={() => setMenu((m) => (m === 'range' ? null : 'range'))}>
              {rangeLabel} <ChevronDown size={16} strokeWidth={1.7} />
            </button>
            {menu === 'range' && (
              <div className="us-menu">
                {[7, 30, 90].map((d) => (
                  <button key={d} className="us-item" onClick={() => { setRangeDays(d); setMenu(null); }}>
                    Last {d} days
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="us-control">
            <button className="us-trigger" onClick={() => setMenu((m) => (m === 'gran' ? null : 'gran'))}>
              {granularityLabel} <ChevronDown size={16} strokeWidth={1.7} />
            </button>
            {menu === 'gran' && (
              <div className="us-menu">
                {(['day', 'week', 'month'] as Granularity[]).map((g) => (
                  <button key={g} className="us-item" onClick={() => { setGranularity(g); setMenu(null); }}>
                    {g === 'day' ? 'Daily' : g === 'week' ? 'Weekly' : 'Monthly'}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="us-download" onClick={downloadCsv} aria-label="Download CSV">
            <Download size={20} strokeWidth={1.7} />
          </button>
        </div>
      </div>

      {query.isLoading && <div className="usage-loading">Loading usage…</div>}
      {query.isError && <div className="usage-error">Failed to load usage data.</div>}

      {usage && (
        <div className="usage-body">
          <ChartBlock
            title="Tokens"
            total={usage.totals.tokens}
            stacked
            data={usage.series}
          />
          <div className="chart-divider" />
          <ChartBlock title="Requests" total={usage.totals.requests} data={usage.series} metric="requests" />
          <div className="chart-divider" />
          <ChartBlock title="Spend*" total={usage.totals.spendUsd} money data={usage.series} metric="spendUsd" />
        </div>
      )}
    </div>
  );
}

function ChartBlock(props: {
  title: string;
  total: number;
  data: UsageResponse['series'];
  stacked?: boolean;
  metric?: 'requests' | 'spendUsd';
  money?: boolean;
}) {
  const chartData = props.data.map((d) => ({
    name: d.date,
    input: d.inputTokens,
    output: d.outputTokens,
    requests: d.requests,
    spend: d.spendUsd,
  }));

  const totalLabel = props.money
    ? Number(props.total) < 0.01 && Number(props.total) > 0
      ? '<$0.01'
      : `$${SigFigs(Number(props.total))}`
    : props.total.toLocaleString();

  return (
    <section className="chart-block">
      <div className="chart-head">
        <span className="chart-title">{props.title}</span>
        <span className="chart-total">{totalLabel}</span>
      </div>
      <div className="chart-body">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barCategoryGap="18%">
            <CartesianGrid vertical={false} stroke="#F0F0F0" strokeWidth={1} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8a8a8a' }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#8a8a8a' }}
              tickFormatter={(v) => (v >= 1000 ? `${v / 1000}K` : String(v))}
            />
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.03)' }}
              contentStyle={{ borderRadius: 8, border: '1px solid #eee', fontSize: 12 }}
            />
            {props.stacked ? (
              <>
                <Bar dataKey="output" stackId="a" fill="#98c868" name="Output" />
                <Bar dataKey="input" stackId="a" fill="#78a0f0" name="Input" />
              </>
            ) : (
              <Bar
                dataKey={props.metric === 'requests' ? 'requests' : 'spend'}
                fill="#78a0f0"
                radius={[2, 2, 0, 0]}
                name={props.metric === 'requests' ? 'Requests' : 'Spend'}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}