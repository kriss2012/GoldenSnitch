import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Scale, AlertCircle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6 text-text">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
            Terms of Service & Data Usage Policy
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Effective Date: October 2026 · Version 1.0 (Production Release)
          </p>
        </div>
        <Link to="/">
          <Button variant="outline" size="sm">
            <ArrowLeft size={14} className="mr-1.5" /> Return to Platform
          </Button>
        </Link>
      </div>

      <Card title="1. Platform Identity & Scope of Service">
        <p className="text-xs text-text-muted leading-relaxed">
          Golden Snitch ("we", "us", or "the Platform") provides competitive esports scouting, talent indexing, multi-roster simulation, and verified identity dossiers. By accessing or using Golden Snitch, organizations, coaches, scouts, and players agree to be bound by these Terms of Service.
        </p>
      </Card>

      <Card title="2. Telemetry Sources, Attribution & No Guarantee of Success">
        <div className="space-y-3 text-xs text-text-muted leading-relaxed">
          <p>
            Competitive statistics, player performance metrics, and match histories are imported from authorized third-party telemetry providers, including the Riot Games Developer API, HenrikDev Valorant API, Valve Steam Web API, and official tournament records.
          </p>
          <div className="p-3 bg-void border border-warning/30 rounded-control text-warning flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>
              <strong>No Predictive Guarantee:</strong> The Golden Snitch Talent Index (GTI), Role-Specific Fit scores, and Synergistic Simulations are analytical benchmarks based on past empirical performance. They do not guarantee future tournament outcomes, professional contract offers, or competitive success.
            </span>
          </div>
        </div>
      </Card>

      <Card title="3. Account Ownership, Verification & Claims">
        <p className="text-xs text-text-muted leading-relaxed">
          Players may claim their public identity dossier via OAuth verification, Steam OpenID, or verified match key codes. Attempting to impersonate other competitors, submit falsified credentials, or manipulate scouting evaluations is strictly prohibited and results in immediate account revocation.
        </p>
      </Card>

      <Card title="4. Shared Reports & Confidentiality">
        <p className="text-xs text-text-muted leading-relaxed">
          Scouting reports, internal annotations, and prospective roster evaluations marked as Organization-Only are proprietary to the respective organization. Shared tokenized URLs may be revoked at any time by the generating organization.
        </p>
      </Card>

      <Card title="5. Data Disputes & Corrections">
        <p className="text-xs text-text-muted leading-relaxed">
          If any player or organization discovers inaccurate telemetry, outdated affiliations, or identity conflicts, they may submit a formal dispute using the platform's Data Dispute workflow. Corrections are investigated and processed within 5 business days.
        </p>
      </Card>
    </div>
  );
};
