import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, FileText, CheckCircle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6 text-text">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
            Privacy Policy & Data Subject Rights
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Compliance with GDPR, CCPA, and Global Esports Telemetry Standards · Version 1.0
          </p>
        </div>
        <Link to="/">
          <Button variant="outline" size="sm">
            <ArrowLeft size={14} className="mr-1.5" /> Return to Platform
          </Button>
        </Link>
      </div>

      <Card title="1. Information We Collect">
        <ul className="list-disc list-inside space-y-2 text-xs text-text-muted leading-relaxed">
          <li>
            <strong className="text-text">Account Information:</strong> Username, display name, hashed salted passwords, organization name, and assigned role.
          </li>
          <li>
            <strong className="text-text">Public Competitive Telemetry:</strong> Public game handles, account identifiers (e.g. PUUID, SteamID64), tournament match statistics, ACS, KAST, and ADR imported via authorized APIs.
          </li>
          <li>
            <strong className="text-text">Platform Activity:</strong> User-created watchlists, scouting notes, certified annotations, and verification claims.
          </li>
        </ul>
      </Card>

      <Card title="2. Purpose & Lawful Basis of Processing">
        <p className="text-xs text-text-muted leading-relaxed">
          We process competitive data under the legitimate interest of facilitating professional talent discovery and roster optimization. Private scouting notes and annotations are strictly scoped to the creator or their organization and are never exposed publicly or shared with competitors.
        </p>
      </Card>

      <Card title="3. Data Subject Rights (GDPR / CCPA)">
        <div className="space-y-3 text-xs text-text-muted leading-relaxed">
          <p>
            Every registered user and verified player has immediate self-service access to the following rights via their Account Settings page:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-void border border-border rounded-control">
              <strong className="text-lilac block mb-1">Right of Access & Portability</strong>
              <span>Download an immediate machine-readable JSON archive containing all user profile details, watchlist entries, annotations, and claims.</span>
            </div>
            <div className="p-3 bg-void border border-border rounded-control">
              <strong className="text-danger block mb-1">Right to Erasure (Deletion)</strong>
              <span>Permanently delete user credentials, active sessions, and personal watchlists from the database with immediate cascade cleanup.</span>
            </div>
          </div>
        </div>
      </Card>

      <Card title="4. Cookies & Session Storage">
        <p className="text-xs text-text-muted leading-relaxed">
          Golden Snitch uses strictly necessary cryptographic session tokens for authentication and CSRF protection. We do not use third-party behavioral advertising cookies or sell user information to data brokers.
        </p>
      </Card>

      <Card title="5. Data Retention & Security Architecture">
        <p className="text-xs text-text-muted leading-relaxed">
          All password hashes use PBKDF2-HMAC-SHA256 with cryptographically random per-user salts. Token revocation is enforced in real-time. Inactive session tokens expire after 24 hours. Backups are encrypted at rest and sanitized in accordance with our operations runbook.
        </p>
      </Card>
    </div>
  );
};
