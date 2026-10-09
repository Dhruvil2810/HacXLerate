import React, { useState } from 'react';
import { RoleType } from '../types/auth';
import { CreatorDiscovery } from './CreatorDiscovery';
import { CampaignDiscovery } from './CampaignDiscovery';
import { 
  Sparkles, 
  ArrowRight, 
  Briefcase, 
  Video, 
  ShieldCheck, 
  Youtube, 
  CheckCircle2, 
  Wrench, 
  FileText, 
  HelpCircle,
  Eye,
  Sliders,
  Award
} from 'lucide-react';

interface PublicShowcaseProps {
  onOpenAuth: (mode: 'login' | 'register', role?: RoleType) => void;
}

export const PublicShowcase: React.FC<PublicShowcaseProps> = ({ onOpenAuth }) => {
  const [activeExploreTab, setActiveExploreTab] = useState<'none' | 'creators' | 'briefs'>('none');
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setFaqOpenIndex(faqOpenIndex === index ? null : index);
  };

  const aiToolsList = [
    { name: 'Runway Gen-3', category: 'Cinematic AI Video', badge: 'Video' },
    { name: 'OpenAI Sora', category: 'High-Fidelity Diffusion', badge: 'Video' },
    { name: 'Kling AI', category: 'Motion Dynamics', badge: 'Video' },
    { name: 'Midjourney v6', category: 'Concept & Art Direction', badge: 'Image' },
    { name: 'Flux.1 Pro', category: 'Photorealistic Imagery', badge: 'Image' },
    { name: 'ComfyUI', category: 'Custom Node Pipelines', badge: 'Workflow' },
    { name: 'ElevenLabs', category: 'Synthetic Voice & Audio', badge: 'Audio' },
    { name: 'Luma Dream Machine', category: 'Camera Movement & Physics', badge: '3D/Video' },
  ];

  const faqs = [
    {
      q: 'How does CreatorOS verify AI tools and workflow evidence?',
      a: 'Creators declare specific AI models and upload prompt pipelines, project node files (e.g. ComfyUI), and raw timeline evidence. Each profile item clearly displays whether it is Platform Verified (via direct platform integrations), Evidence Reviewed (authorized manual review), or Creator Declared.',
    },
    {
      q: 'What commercial rights and licensing terms are supported?',
      a: 'Brands specify explicit licensing terms in their briefs—including commercial advertising rights, geographic exclusivity, licensing duration, and derivative usage. Creators agree to these terms before submission, ensuring full copyright transparency for client campaigns.',
    },
    {
      q: 'How do performance-based YouTube CPM rewards work?',
      a: 'For performance campaigns, creators connect their YouTube channel via Google OAuth. The platform captures verified time-series analytics snapshots, calculates incremental view velocity over baseline, and deterministically allocates internal credits per 1,000 verified views based on the campaign’s configured CPM rate.',
    },
    {
      q: 'Can brands commission fixed-price creative projects instead of CPM?',
      a: 'Yes. CreatorOS supports two distinct engagement models: Creative Services (fixed milestone fee for AI commercials, animations, and visualizations with defined revision limits) and Performance Campaigns (performance rewards tied to published reach).',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
      {/* Hero Section */}
      <section style={{ maxWidth: '880px', margin: '1rem auto 0', textAlign: 'center' }}>
        <div className="badge badge-verified" style={{ margin: '0 auto 1.5rem', display: 'inline-flex' }}>
          <Sparkles size={13} /> The AI-Native Creative & Performance Marketplace
        </div>

        <h1 style={{ fontSize: '3rem', lineHeight: '1.15', fontWeight: 800, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
          Connect brands with vetted AI creators through <span style={{ color: 'var(--color-brand)' }}>verified craft</span> and measurable reach.
        </h1>

        <p style={{ fontSize: '1.15rem', lineHeight: '1.6', color: 'var(--text-secondary)', maxWidth: '720px', margin: '0 auto 2.25rem' }}>
          Discover AI filmmakers, animators, and generative artists with tool-level workflow transparency. 
          Commission premium AI creative assets or deploy verified YouTube CPM performance campaigns.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => onOpenAuth('register', 'BRAND')}
            className="btn btn-primary"
            style={{ padding: '0.85rem 1.75rem', fontSize: '0.95rem' }}
            id="hero-brand-cta-btn"
          >
            <Briefcase size={16} /> Commission AI Creators <ArrowRight size={16} />
          </button>

          <button 
            onClick={() => onOpenAuth('register', 'CREATOR')}
            className="btn btn-secondary"
            style={{ padding: '0.85rem 1.75rem', fontSize: '0.95rem' }}
            id="hero-creator-cta-btn"
          >
            <Video size={16} color="var(--color-brand)" /> Join as AI Creator
          </button>
        </div>

        {/* Live Marketplace Preview Triggers */}
        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button
            onClick={() => setActiveExploreTab(activeExploreTab === 'creators' ? 'none' : 'creators')}
            className={`btn ${activeExploreTab === 'creators' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.825rem', padding: '0.45rem 1rem' }}
          >
            <Eye size={14} /> {activeExploreTab === 'creators' ? 'Close Creator Directory' : 'Explore Verified AI Creators'}
          </button>
          <button
            onClick={() => setActiveExploreTab(activeExploreTab === 'briefs' ? 'none' : 'briefs')}
            className={`btn ${activeExploreTab === 'briefs' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.825rem', padding: '0.45rem 1rem' }}
          >
            <Sliders size={14} /> {activeExploreTab === 'briefs' ? 'Close Briefs' : 'Explore Active Campaign Briefs'}
          </button>
        </div>
      </section>

      {/* Interactive Public Preview Container */}
      {activeExploreTab === 'creators' && (
        <section className="card" style={{ border: '2px solid var(--color-brand-light)', padding: '2rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h3>Verified AI Creator Directory</h3>
              <p style={{ fontSize: '0.875rem' }}>Live database search with AI tool, model, and category filters.</p>
            </div>
            <button onClick={() => setActiveExploreTab('none')} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
              Close Preview
            </button>
          </div>
          <CreatorDiscovery />
        </section>
      )}

      {activeExploreTab === 'briefs' && (
        <section className="card" style={{ border: '2px solid var(--color-brand-light)', padding: '2rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h3>Active Creative Briefs & Performance Campaigns</h3>
              <p style={{ fontSize: '0.875rem' }}>Explore open opportunities with commercial usage requirements.</p>
            </div>
            <button onClick={() => setActiveExploreTab('none')} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
              Close Preview
            </button>
          </div>
          <CampaignDiscovery />
        </section>
      )}

      {/* Dual Engagement Model */}
      <section>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem' }}>
          <h2>Two Unified Marketplace Capabilities</h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Whether you need bespoke AI creative deliverables or analytics-backed creator campaigns, 
            CreatorOS provides structured, audit-ready workflows.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="card" style={{ borderTop: '4px solid var(--color-brand)' }}>
            <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
              <div style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-brand-light)',
                color: 'var(--color-brand)',
              }}>
                <Briefcase size={22} />
              </div>
              <div>
                <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>ENGAGEMENT TYPE A</span>
                <h3 style={{ fontSize: '1.25rem', marginTop: '0.2rem' }}>AI Creative Services</h3>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              Brands commission custom AI-generated media with clearly defined scope, deliverables, 
              revision limits, and commercial advertising licenses.
            </p>
            <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingLeft: '1.2rem' }}>
              <li><strong>AI Video & Commercials:</strong> Cinematic advertisements, social spots, and short films.</li>
              <li><strong>Product Visualization:</strong> 3D renders, photorealistic lifestyle shots, and motion graphics.</li>
              <li><strong>AI Assisted Brief Builder:</strong> Convert rough concepts into structured briefs via OpenRouter AI.</li>
              <li><strong>Commercial Licensing:</strong> Explicit rights declaration, geographic scope, and usage windows.</li>
            </ul>
          </div>

          <div className="card" style={{ borderTop: '4px solid var(--color-success)' }}>
            <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
              <div style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-success-light)',
                color: 'var(--color-success)',
              }}>
                <Youtube size={22} />
              </div>
              <div>
                <span className="badge badge-verified" style={{ fontSize: '0.7rem' }}>ENGAGEMENT TYPE B</span>
                <h3 style={{ fontSize: '1.25rem', marginTop: '0.2rem' }}>Performance-Based Campaigns</h3>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              Brands deploy campaigns where creators publish verified video content and earn internal credit rewards 
              calculated deterministically on incremental YouTube views.
            </p>
            <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingLeft: '1.2rem' }}>
              <li><strong>OAuth Analytics Snapshots:</strong> Time-series view ingestion via direct Google OAuth.</li>
              <li><strong>Deterministic CPM Rewards:</strong> Reward = (Eligible Incremental Views / 1,000) × CPM Rate.</li>
              <li><strong>Immutable Credit Ledger:</strong> Double-entry escrow reservations, disbursements, and refunds.</li>
              <li><strong>Fraud & Baseline Protection:</strong> Views prior to publication are excluded from reward payout.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* AI Tools & Generative Stack Supported */}
      <section className="card" style={{ backgroundColor: 'var(--bg-subtle)' }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2rem' }}>
          <div className="badge badge-verified" style={{ margin: '0 auto 0.75rem', display: 'inline-flex' }}>
            <Wrench size={12} /> Tool-Level Transparency
          </div>
          <h3>Supported AI Models & Creative Workflows</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Every creator portfolio item specifies the exact generative foundation models, custom nodes, and software pipelines utilized.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {aiToolsList.map((tool) => (
            <div key={tool.name} style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div>
                <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                  <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{tool.badge}</span>
                  <CheckCircle2 size={14} color="var(--color-brand)" />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{tool.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {tool.category}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Verification Standard Tiers */}
      <section>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2rem' }}>
          <div className="badge badge-verified" style={{ margin: '0 auto 0.75rem', display: 'inline-flex' }}>
            <Award size={12} /> Truth In Advertising
          </div>
          <h2>Evidence-Based Verification Standards</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            We do not assume creator claims are verified merely because they are written in a profile. 
            CreatorOS maintains strict, evidence-based data segregation.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="card">
            <div style={{ marginBottom: '0.75rem' }}>
              <span className="badge badge-verified">
                <CheckCircle2 size={12} /> Platform Verified
              </span>
            </div>
            <h4 style={{ marginBottom: '0.5rem' }}>Authorized API Integrations</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Metrics, channels, and watch times retrieved directly through authorized Google OAuth 2.0 connections. 
              Cannot be manually altered or forged.
            </p>
          </div>

          <div className="card">
            <div style={{ marginBottom: '0.75rem' }}>
              <span className="badge badge-uploaded">
                <FileText size={12} /> Evidence Reviewed
              </span>
            </div>
            <h4 style={{ marginBottom: '0.5rem' }}>Audited Workflow Documentation</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Workflow screenshots, ComfyUI node graphs, prompt pipelines, and source files submitted by creators 
              and verified against review criteria.
            </p>
          </div>

          <div className="card">
            <div style={{ marginBottom: '0.75rem' }}>
              <span className="badge badge-selfreported">
                ⚠ Creator Declared
              </span>
            </div>
            <h4 style={{ marginBottom: '0.5rem' }}>Self-Reported Information</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Information supplied directly by the creator during onboarding without independent external evidence. 
              Clearly distinguished across search and profiles.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works (Step-by-Step Workflow) */}
      <section className="card" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem' }}>
          <h2>How CreatorOS Works</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            End-to-end execution from structured brief creation to approved deliverable and performance rewards.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-brand)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.9rem',
              marginBottom: '0.5rem',
            }}>
              1
            </div>
            <h4>Define Brief or Opportunity</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Brands publish structured creative briefs with explicit deliverable specs, aspect ratios, tools, 
              and commercial licensing. OpenRouter AI can extract hooks from raw product descriptions.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-brand)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.9rem',
              marginBottom: '0.5rem',
            }}>
              2
            </div>
            <h4>Match & Collaborate</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Filter AI creators by specialized models, format compatibility, and audience category. 
              Review applicants, agree on milestones, and coordinate via in-app collaboration.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-brand)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.9rem',
              marginBottom: '0.5rem',
            }}>
              3
            </div>
            <h4>Approve & Reward</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Review deliverables against brief criteria with structured revision cycles. 
              Escrowed credits are disbursed to the creator wallet automatically upon approval or verified view milestones.
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section style={{ maxWidth: '780px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2>Frequently Asked Questions</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Common questions about AI creator workflows, licensing, and performance tracking.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {faqs.map((faq, idx) => {
            const isOpen = faqOpenIndex === idx;
            return (
              <div 
                key={idx}
                className="card"
                style={{ 
                  cursor: 'pointer',
                  border: isOpen ? '1px solid var(--color-brand)' : '1px solid var(--border-default)',
                  padding: '1.25rem',
                }}
                onClick={() => toggleFaq(idx)}
              >
                <div className="flex items-center justify-between">
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{faq.q}</div>
                  <HelpCircle size={16} color={isOpen ? 'var(--color-brand)' : 'var(--text-muted)'} />
                </div>
                {isOpen && (
                  <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="card text-center" style={{ 
        padding: '3.5rem 2rem', 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid var(--border-default)',
      }}>
        <div className="badge badge-verified" style={{ margin: '0 auto 1rem', display: 'inline-flex' }}>
          <ShieldCheck size={13} /> Production Ready Platform
        </div>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
          Ready to experience the AI creative marketplace?
        </h2>
        <p style={{ maxWidth: '520px', margin: '0 auto 2rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Sign in or register a free workspace account to launch your first creative brief or showcase your AI portfolio.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={() => onOpenAuth('register', 'BRAND')}
            className="btn btn-primary"
            style={{ padding: '0.8rem 1.75rem' }}
          >
            Start as Brand
          </button>
          <button 
            onClick={() => onOpenAuth('register', 'CREATOR')}
            className="btn btn-secondary"
            style={{ padding: '0.8rem 1.75rem' }}
          >
            Start as Creator
          </button>
        </div>
      </section>
    </div>
  );
};
