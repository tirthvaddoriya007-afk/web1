"use client";

import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { brand } from "@/lib/brand";
import { formatPrice } from "@/lib/data";
import { ANALYTICS_RANGES, type AnalyticsRange } from "@/lib/analytics";

export interface AnalyticsStats {
  window: string;
  totals: { views: number; visitors: number };
  today: { views: number; visitors: number };
  live: { visitors: number };
  series: Array<{ day: string; views: number; visitors: number }>;
  top_pages: Array<{ path: string; views: number }>;
  top_referrers: Array<{ referrer: string | null; views: number }>;
  top_sources: Array<{ source: string | null; views: number }>;
  clients: Array<{ client: string | null; views: number }>;
  devices: Array<{ device: string | null; views: number }>;
  recent: Array<{
    path: string;
    referrer: string;
    client: string;
    device: string;
    created_at: string;
  }>;
}

export interface PayClickStats {
  total: number;
  today: number;
  total_amount: number;
  by_method: Array<{ method: string; clicks: number; amount: number }>;
  recent: Array<{ method: string; amount: number; created_at: string }>;
}

export interface WelcomeClickStats {
  total: number;
  today: number;
  recent: Array<{ created_at: string }>;
}

const METHOD_LABELS: Record<string, string> = {
  gpay: "Google Pay",
  phonepe: "PhonePe",
  paytm: "Paytm",
  cod: "Cash on Delivery",
};

const PIE_COLORS = ["#9f2089", "#570b47", "#c2410c", "#0e7490", "#65a30d", "#7c3aed"];

const WEBVIEWS = new Set([
  "Facebook",
  "Instagram",
  "WhatsApp",
  "Telegram",
  "WeChat",
  "Snapchat",
  "In-app browser (Android)",
  "In-app browser (iOS)",
]);

const istTime = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
});

const nf = new Intl.NumberFormat("en-IN");

export default function AnalyticsDashboard({
  stats,
  payClicks,
  welcomeClicks,
  range,
}: {
  stats: AnalyticsStats | null;
  payClicks: PayClickStats | null;
  welcomeClicks: WelcomeClickStats | null;
  range: AnalyticsRange;
}) {
  if (!stats || stats.totals.views === 0) {
    return (
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Traffic analytics</h1>
        <p className="mt-1 mb-4 text-sm text-gray-500">
          Live storefront traffic, referrers and top pages.
        </p>
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-500">
            No visits recorded yet. Traffic appears here as soon as someone opens
            the storefront — including Facebook/Instagram in-app browsers.
          </p>
        </div>
      </div>
    );
  }

  const rangeLabel = ANALYTICS_RANGES.find((r) => r.key === range)?.label ?? "7d";

  const series = stats.series.map((d) => ({
    day: d.day.slice(5), // "MM-DD"
    views: d.views,
    visitors: d.visitors,
  }));

  const pieData = stats.clients.map((c) => ({
    name: c.client || "Other",
    views: c.views,
    webview: c.client !== null && WEBVIEWS.has(c.client),
  }));

  const webviewViews = pieData
    .filter((c) => c.webview)
    .reduce((sum, c) => sum + c.views, 0);
  const webviewShare = stats.totals.views
    ? Math.round((webviewViews / stats.totals.views) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Traffic analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Live storefront traffic, referrers and top pages.
          </p>
        </div>
        <div className="flex rounded-lg border border-gray-200 text-sm">
          {ANALYTICS_RANGES.map((r) => (
            <Link
              key={r.key}
              href={`/admin/analytics?range=${r.key}`}
              className={`px-3 py-1.5 first:rounded-l-lg last:rounded-r-lg ${
                range === r.key
                  ? "bg-white font-medium text-gray-900"
                  : "bg-gray-50 text-gray-500 hover:text-gray-700"
              }`}
            >
              {r.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Live now"
          value={nf.format(stats.live.visitors)}
          hint="last 5 minutes"
          accent
        />
        <StatCard
          label={`Views · ${rangeLabel}`}
          value={nf.format(stats.totals.views)}
          hint={`${nf.format(stats.totals.visitors)} visitors`}
        />
        <StatCard
          label={`Visitors · ${rangeLabel}`}
          value={nf.format(stats.totals.visitors)}
          hint="unique"
        />
        <StatCard
          label="From webviews"
          value={`${webviewShare}%`}
          hint="FB / IG / WhatsApp in-app"
        />
      </div>

      {/* Pay Now clicks */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-gray-700">Pay Now button</h2>
            <p className="text-xs text-gray-400">
              Taps on the payment page&apos;s Pay Now / Place Order button
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold text-gray-900">
              {nf.format(payClicks?.total ?? 0)}
            </div>
            <div className="text-xs text-gray-400">
              total · {nf.format(payClicks?.today ?? 0)} today
            </div>
          </div>
        </div>

        {(payClicks?.by_method.length ?? 0) > 0 ? (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {payClicks!.by_method.map((m) => {
              const pct = payClicks!.total
                ? Math.round((m.clicks / payClicks!.total) * 100)
                : 0;
              return (
                <div
                  key={m.method}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-3"
                >
                  <div className="text-xs text-gray-500">
                    {METHOD_LABELS[m.method] ?? m.method}
                  </div>
                  <div className="mt-1 text-lg font-semibold text-gray-900">
                    {nf.format(m.clicks)}
                    <span className="ml-1 text-xs font-normal text-gray-400">
                      {pct}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatPrice(m.amount)} attempted
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 text-xs text-gray-400">
            No Pay Now taps recorded yet.
          </p>
        )}

        {(payClicks?.recent.length ?? 0) > 0 && (
          <div className="mt-3 border-t border-gray-50 pt-3">
            <ul className="space-y-1.5 text-xs">
              {payClicks!.recent.slice(0, 5).map((r, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="w-14 shrink-0 text-gray-400">
                    {istTime.format(new Date(r.created_at))}
                  </span>
                  <span className="font-medium text-gray-700">
                    {METHOD_LABELS[r.method] ?? r.method}
                  </span>
                  <span className="ml-auto shrink-0 text-gray-500">
                    {formatPrice(r.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Welcome page taps */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-gray-700">Welcome page taps</h2>
            <p className="text-xs text-gray-400">
              Taps anywhere on the welcome landing — every tap sends the visitor
              to the home screen (auto-redirects are not counted)
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold text-gray-900">
              {nf.format(welcomeClicks?.total ?? 0)}
            </div>
            <div className="text-xs text-gray-400">
              total · {nf.format(welcomeClicks?.today ?? 0)} today
            </div>
          </div>
        </div>

        {(welcomeClicks?.recent.length ?? 0) > 0 ? (
          <div className="mt-3 border-t border-gray-50 pt-3">
            <ul className="space-y-1.5 text-xs">
              {welcomeClicks!.recent.slice(0, 5).map((r, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="w-14 shrink-0 text-gray-400">
                    {istTime.format(new Date(r.created_at))}
                  </span>
                  <span className="font-medium text-gray-700">
                    Tap → home screen
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-3 text-xs text-gray-400">
            No welcome taps recorded yet.
          </p>
        )}
      </div>

      {/* Visits over time */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-sm font-medium text-gray-700">Visits over time</h2>
        <p className="text-xs text-gray-400">Daily page views and unique visitors</p>
        <div className="mt-3 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={brand.colors.primary} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={brand.colors.primary} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
              <Area type="monotone" dataKey="views" name="Views" stroke={brand.colors.primary} strokeWidth={2} fill="url(#viewsGradient)" />
              <Area type="monotone" dataKey="visitors" name="Visitors" stroke={brand.colors.primaryDark} strokeWidth={2} fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top pages + client split */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="text-sm font-medium text-gray-700">Top pages</h2>
          <ul className="mt-3 space-y-2">
            {stats.top_pages.map((p) => {
              const pct = Math.round((p.views / stats.totals.views) * 100);
              return (
                <li key={p.path}>
                  <div className="flex justify-between text-xs">
                    <span className="truncate pr-2 font-medium text-gray-700" title={p.path}>
                      {p.path}
                    </span>
                    <span className="shrink-0 text-gray-500">{nf.format(p.views)}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-gray-100">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${pct}%`, background: brand.colors.primary }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="text-sm font-medium text-gray-700">Where visitors come from</h2>
          <div className="mt-2 flex items-center gap-4">
            <div className="h-40 w-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="views" nameKey="name" innerRadius={38} outerRadius={64} paddingAngle={2} strokeWidth={0}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 space-y-1.5 text-xs">
              {stats.clients.map((c, i) => {
                const name = c.client || "Other";
                const pct = Math.round((c.views / stats.totals.views) * 100);
                return (
                  <li key={i} className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="truncate text-gray-700">
                      {name}
                      {c.client && WEBVIEWS.has(c.client) ? " (webview)" : ""}
                    </span>
                    <span className="ml-auto shrink-0 text-gray-500">{pct}%</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Referrers + UTM sources */}
      <div className="grid gap-4 sm:grid-cols-2">
        <BarList
          title="Top referrers"
          empty="No external referrers yet"
          items={stats.top_referrers.map((r) => ({
            label: r.referrer || "Direct",
            value: r.views,
          }))}
          total={stats.totals.views}
        />
        <BarList
          title="Top UTM sources"
          empty="No campaign traffic yet"
          items={stats.top_sources.map((s) => ({
            label: s.source || "None",
            value: s.views,
          }))}
          total={stats.totals.views}
        />
      </div>

      {/* Device split */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-sm font-medium text-gray-700">Devices</h2>
        <div className="mt-3 flex gap-6 text-sm">
          {stats.devices.map((d) => {
            const label = d.device || "unknown";
            const pct = stats.totals.views
              ? Math.round((d.views / stats.totals.views) * 100)
              : 0;
            return (
              <div key={label}>
                <div className="font-semibold text-gray-900">{nf.format(d.views)}</div>
                <div className="text-xs capitalize text-gray-500">
                  {label} · {pct}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-sm font-medium text-gray-700">Recent activity</h2>
        <ul className="mt-3 divide-y divide-gray-50">
          {stats.recent.map((r, i) => (
            <li key={i} className="flex items-center gap-3 py-2 text-xs">
              <span className="w-14 shrink-0 text-gray-400">
                {istTime.format(new Date(r.created_at))}
              </span>
              <span className="truncate font-medium text-gray-700" title={r.path}>
                {r.path}
              </span>
              <span className="ml-auto flex shrink-0 items-center gap-2 text-gray-400">
                {r.referrer && <span className="hidden sm:inline">{r.referrer}</span>}
                <span
                  className={`rounded px-1.5 py-0.5 ${
                    r.client && WEBVIEWS.has(r.client)
                      ? "bg-purple-50 text-purple-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {r.client || "?"}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className={`text-xs ${accent ? "text-green-600" : "text-gray-500"}`}>{label}</div>
      <div className="mt-1 text-xl font-semibold text-gray-900">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-gray-400">{hint}</div>}
    </div>
  );
}

function BarList({
  title,
  empty,
  items,
  total,
}: {
  title: string;
  empty: string;
  items: Array<{ label: string; value: number }>;
  total: number;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-sm font-medium text-gray-700">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-3 text-xs text-gray-400">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((it) => {
            const pct = total ? Math.round((it.value / total) * 100) : 0;
            return (
              <li key={it.label}>
                <div className="flex justify-between text-xs">
                  <span className="truncate pr-2 text-gray-700" title={it.label}>
                    {it.label}
                  </span>
                  <span className="shrink-0 text-gray-500">{nf.format(it.value)}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-gray-100">
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${pct}%`, background: brand.colors.primaryDark }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
