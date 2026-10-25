import React, { useEffect, useState } from 'react';
import {
  Building2,
  Users,
  UserPlus,
  Shield,
  Copy,
  CheckCircle2,
  Mail,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { esportsIntelligenceService, Organization } from '../services/esportsIntelligenceService';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

export const OrganizationPage: React.FC = () => {
  const [org, setOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('scout');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<{ token: string; invite_url: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchOrganization();
  }, []);

  const fetchOrganization = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Default to Sentinels Operations
      const data = await esportsIntelligenceService.getOrganization('sentinels');
      setOrg(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load organization details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;
    setInviteLoading(true);
    try {
      const res = await esportsIntelligenceService.inviteToOrganization(org.id, {
        email: inviteEmail,
        role: inviteRole,
      });
      setInviteSuccess({ token: res.token, invite_url: res.invite_url });
    } catch (err: any) {
      alert(err?.message || 'Failed to generate invitation.');
    } finally {
      setInviteLoading(false);
    }
  };

  const copyInviteLink = async () => {
    if (!inviteSuccess) return;
    const fullUrl = `${window.location.origin}${inviteSuccess.invite_url}`;
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-text-muted gap-3">
        <Loader2 size={32} className="animate-spin text-violet" />
        <span className="font-mono text-xs text-lilac">Loading Organization Structure...</span>
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="p-8 text-center">
        <AlertCircle size={32} className="text-crimson mx-auto mb-3" />
        <p className="text-sm text-text-muted mb-4">{error || 'Organization not found'}</p>
        <Button variant="primary" onClick={fetchOrganization}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="violet" className="font-mono text-[10px]">
              ORG PORTAL
            </Badge>
            <Badge variant="emerald" className="text-[10px]">
              Verified Pro Org
            </Badge>
          </div>
          <h1 className="text-2xl font-black text-text tracking-tight flex items-center gap-2.5">
            <Building2 size={24} className="text-electric" />
            {org.name}
            <span className="font-mono text-sm text-lilac font-normal">[{org.tag}]</span>
          </h1>
          <p className="text-xs text-text-muted mt-1 max-w-xl">{org.description}</p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setShowInviteModal(true)} className="gap-2 shrink-0">
          <UserPlus size={16} />
          <span>Invite Staff</span>
        </Button>
      </div>

      {/* Roster & Squad Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-violet/20 bg-surface/70">
          <div className="text-xs text-text-muted uppercase font-semibold">Active Titles</div>
          <div className="text-2xl font-black text-text mt-1">2 Games</div>
          <div className="text-xs text-lilac mt-1">VCT Americas (Valorant) & CS2</div>
        </Card>

        <Card className="p-5 border-violet/20 bg-surface/70">
          <div className="text-xs text-text-muted uppercase font-semibold">Organization Staff</div>
          <div className="text-2xl font-black text-electric mt-1">{org.members?.length || 3} Members</div>
          <div className="text-xs text-text-muted mt-1">Owner, Head Coach, Senior Scout</div>
        </Card>

        <Card className="p-5 border-violet/20 bg-surface/70">
          <div className="text-xs text-text-muted uppercase font-semibold">Recruitment Status</div>
          <div className="text-2xl font-black text-emerald mt-1">1 Open Vacancy</div>
          <div className="text-xs text-text-muted mt-1">Priority: High (Sentinels Controller)</div>
        </Card>
      </div>

      {/* Staff & Members Directory */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
          <Users size={16} className="text-electric" /> Organization Roster & RBAC Permissions
        </h2>

        <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-elevated/80 border-b border-border text-[11px] uppercase tracking-wider text-text-muted">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Permissions Scope</th>
                <th className="py-3 px-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {org.members.map((m) => (
                <tr key={m.membership_id} className="hover:bg-surface-elevated/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-text flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-violet/30 border border-violet/50 flex items-center justify-center text-xs font-bold text-electric">
                      {m.name.slice(0, 1)}
                    </div>
                    <div>
                      <div>{m.name}</div>
                      <div className="text-[11px] font-mono text-text-muted">@{m.username}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        m.role === 'owner'
                          ? 'violet'
                          : m.role === 'coach'
                          ? 'emerald'
                          : m.role === 'manager'
                          ? 'amber'
                          : 'outline'
                      }
                      className="uppercase font-mono text-[10px]"
                    >
                      {m.role}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-text-muted text-[11px]">
                    {m.role === 'owner' && 'Full Org Ownership & Billing'}
                    {m.role === 'coach' && 'Tactical Rosters & Evaluations'}
                    {m.role === 'scout' && 'Candidate Scouting & Notes'}
                    {m.role === 'manager' && 'Contracts & Roster Operations'}
                  </td>
                  <td className="py-3 px-4 font-mono text-text-muted text-[11px]">
                    {new Date(m.joined_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-surface border border-violet/30 rounded-xl shadow-2xl p-6 text-text animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-text mb-1">Invite Organization Staff</h3>
            <p className="text-xs text-text-muted mb-4">
              Send a cryptographically signed invitation to onboard a coach, scout, or analyst.
            </p>

            {inviteSuccess ? (
              <div className="space-y-4">
                <div className="p-3 bg-emerald/15 border border-emerald/30 rounded-lg text-emerald text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>Invitation link generated successfully!</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-text-muted uppercase mb-1">
                    Secure Onboarding Link
                  </label>
                  <div className="p-2.5 rounded-lg bg-surface-elevated border border-border font-mono text-xs text-electric break-all">
                    {window.location.origin}
                    {inviteSuccess.invite_url}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setShowInviteModal(false)}>
                    Close
                  </Button>
                  <Button variant="primary" size="sm" onClick={copyInviteLink} className="gap-1.5">
                    {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                    <span>{copied ? 'Copied' : 'Copy Link'}</span>
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="analyst@sentinels.gg"
                    className="w-full bg-surface-elevated border border-border rounded-lg p-2.5 text-xs text-text focus:outline-none focus:border-violet"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Role & Permissions</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full bg-surface-elevated border border-border rounded-lg p-2.5 text-xs text-text focus:outline-none focus:border-violet"
                  >
                    <option value="manager">Manager (Roster & Financials)</option>
                    <option value="coach">Coach (Tactical & Synergy)</option>
                    <option value="scout">Scout / Analyst (Candidate Discovery)</option>
                    <option value="viewer">Viewer (Read-only)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowInviteModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" disabled={inviteLoading}>
                    {inviteLoading ? <Loader2 size={14} className="animate-spin" /> : 'Generate Invitation'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
