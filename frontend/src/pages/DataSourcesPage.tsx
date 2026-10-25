import React, { useEffect, useState } from 'react';
import {
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  Shield,
  Layers,
  Loader2,
  Info,
} from 'lucide-react';
import { esportsIntelligenceService, DataSourceStatus } from '../services/esportsIntelligenceService';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

export const DataSourcesPage: React.FC = () => {
  const [sources, setSources] = useState<DataSourceStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setIsLoading(true);
    try {
      const data = await esportsIntelligenceService.getDataSourcesStatus();
      setSources(data.sources || []);
    } catch (e: any) {
      console.error('Failed to load data sources status', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async (providerId: string) => {
    setSyncingId(providerId);
    setSyncFeedback(null);
    try {
      const res = await esportsIntelligenceService.syncDataSource(providerId);
      setSyncFeedback(`Successfully synchronized telemetry indexes for ${providerId}.`);
      await loadStatus();
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch (e: any) {
      alert(e?.message || `Failed to sync provider ${providerId}`);
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="violet" className="font-mono text-[10px]">
              DATA RELIABILITY
            </Badge>
            <Badge variant="emerald" className="text-[10px]">
              Real Esports Feeds
            </Badge>
          </div>
          <h1 className="text-2xl font-black text-text tracking-tight flex items-center gap-2.5">
            <Database size={24} className="text-electric" />
            Live Data Providers & Provenance
          </h1>
          <p className="text-xs text-text-muted mt-1 max-w-xl">
            Audit live telemetry sources, rate-limit allocations, ingestion health, and provenance guarantees.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadStatus} disabled={isLoading} className="gap-2 shrink-0">
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh Status</span>
        </Button>
      </div>

      {syncFeedback && (
        <div className="p-3 bg-emerald/15 border border-emerald/30 rounded-lg text-emerald text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Provider Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((src) => (
          <Card key={src.provider} className="p-5 border-violet/20 bg-surface/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-surface-elevated border border-border text-electric">
                    <Zap size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text capitalize">
                      {src.provider.replace('_', ' ')}
                    </h3>
                    <div className="text-[11px] font-mono text-text-muted">ID: {src.provider}</div>
                  </div>
                </div>

                <Badge
                  variant={src.status === 'healthy' || src.status === 'operational' ? 'emerald' : 'crimson'}
                  className="gap-1 capitalize text-xs"
                >
                  <CheckCircle2 size={12} />
                  {src.status}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 my-4 text-center">
                <div className="p-2 rounded bg-surface-elevated/70 border border-border">
                  <div className="text-[10px] uppercase text-text-muted">Rate Limit</div>
                  <div className="font-mono text-xs font-bold text-text mt-0.5">{src.rate_limit_rpm} RPM</div>
                </div>

                <div className="p-2 rounded bg-surface-elevated/70 border border-border">
                  <div className="text-[10px] uppercase text-text-muted">Latency</div>
                  <div className="font-mono text-xs font-bold text-emerald mt-0.5">{src.latency_ms} ms</div>
                </div>

                <div className="p-2 rounded bg-surface-elevated/70 border border-border">
                  <div className="text-[10px] uppercase text-text-muted">Auth Status</div>
                  <div className="font-mono text-[11px] font-bold text-lilac mt-0.5">
                    {src.api_key_configured ? 'Key Bound' : 'Community Mode'}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-text-muted border-t border-border pt-3">
                <div className="flex justify-between">
                  <span>Supported Games:</span>
                  <span className="font-mono text-lilac uppercase font-semibold">
                    {src.supported_titles?.join(', ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Provenance Level:</span>
                  <span className="text-text font-medium">{src.provenance}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Verified:</span>
                  <span className="font-mono text-[11px] text-text-muted/70">{src.last_verified}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
              <span className="text-[11px] text-text-muted flex items-center gap-1">
                <Clock size={13} className="text-electric" /> Auto-sync: every 15m
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSync(src.provider)}
                disabled={syncingId === src.provider}
                className="gap-1.5"
              >
                {syncingId === src.provider ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw size={13} /> Sync Now
                  </>
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Honest Limitations Callout */}
      <Card className="p-5 border-violet/20 bg-surface-elevated/40">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-electric shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-text-muted leading-relaxed">
            <h4 className="text-xs font-bold text-text uppercase tracking-wider">
              Data Quality & Transparency Standard (PRD §4.2)
            </h4>
            <p>
              Golden Snitch connects directly to publisher endpoints (Riot Games via HenrikDev API, Valve Steam Web API,
              and verified tournament records). All missing or unmeasurable metrics (such as unstreamed scrims or raw voice
              comms) are strictly disclosed and never fabricated as zeroes.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
