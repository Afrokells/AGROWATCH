import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import ThemeToggle from '../../components/UI/ThemeToggle';
import Logo from '../../components/UI/Logo';
import Modal from '../../components/UI/Modal';
import { Leaf, ShieldCheck, ShoppingBag, ArrowRight, Scan, MapPin, BarChart3, Database, Users, Globe, Activity, Crosshair, Play, Apple, Wheat, Citrus, ChevronLeft, ChevronRight } from 'lucide-react';
import heroDroneImg from '../../assets/hero_drone.png';
import tomatoCropImg from '../../assets/tomato_crop.png';
import maizeCropImg from '../../assets/maize_crop.png';
import pineappleCropImg from '../../assets/pineapple_crop.png';

export default function LandingPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('drone');

  useEffect(() => {
    const tabs = ['drone', 'tomato', 'maize', 'pineapple'];
    const timer = setInterval(() => {
      setActiveTab(prev => {
        const nextIndex = (tabs.indexOf(prev) + 1) % tabs.length;
        return tabs[nextIndex];
      });
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const showcaseData = {
    drone: {
      id: 'drone',
      label: 'Drone Flight',
      name: 'Autonomous Drone Orthomosaic',
      tag: 'AERIAL RECONNAISSANCE',
      img: heroDroneImg,
      alt: 'AgroWatch Multispectral Drone Surveying Ghana Farm Plot',
      telemetry: 'RTK GPS • 4K MULTISPECTRAL',
      boxLabel: 'YOLOv8 Aerial Crop Grid',
      boxConfidence: '99.4% Precision',
      statsCount: '400 Plants Mapped',
      statsMetric: '12.4m Alt · 3.2m/s',
      statusText: 'Optimal Field Vigor & Grid Alignment',
      statusType: 'success',
      advisory: 'Automated flight path completed. Field boundaries and canopy indices synced.'
    },
    tomato: {
      id: 'tomato',
      label: 'Tomato Scan',
      name: 'Tomato Foliar Disease Diagnostic',
      tag: 'AI CROP DIAGNOSIS',
      img: tomatoCropImg,
      alt: 'Tomato Crop Disease Detection',
      telemetry: 'YOLOv8 DETECTED',
      boxLabel: 'Late Blight Identified',
      boxConfidence: '97.2% Match',
      statsCount: '300 Healthy / 100 Flagged',
      statsMetric: '97.2% Accuracy',
      statusText: 'Late Blight Detected on Lower Foliage',
      statusType: 'warning',
      advisory: 'Apply copper hydroxide fungicide spray and isolate affected plot sector.'
    },
    maize: {
      id: 'maize',
      label: 'Maize Vigor',
      name: 'Maize Field Canopy Vigor',
      tag: 'LEAF CANOPY VIGOR',
      img: maizeCropImg,
      alt: 'Maize Crop Growth Tracking',
      telemetry: 'ZERO PESTS SPOTTED',
      boxLabel: 'Healthy Foliage Vigor',
      boxConfidence: '99.1% Vigor',
      statsCount: '400 Healthy Plants',
      statsMetric: '100% Vigor',
      statusText: 'Optimal Growth & Zero Fall Armyworm',
      statusType: 'success',
      advisory: 'Growth vigor is optimal. Maintain current irrigation and organic fertilizer cycle.'
    },
    pineapple: {
      id: 'pineapple',
      label: 'Pineapple Plot',
      name: 'Pineapple Export Quality Check',
      tag: 'EXPORT SCREENING',
      img: pineappleCropImg,
      alt: 'Pineapple Plot Quality Verification',
      telemetry: 'EXPORT VERIFICATION',
      boxLabel: 'Mealybug Symptom Spotted',
      boxConfidence: '94.8% Match',
      statsCount: '397 Healthy / 3 Isolated',
      statsMetric: '94.8% Grade',
      statusText: 'Mild Mealybug Symptoms Detected',
      statusType: 'warning',
      advisory: 'Apply organic neem oil solution in early morning hours before flowering.'
    }
  };

  const currentShowcase = showcaseData[activeTab] || showcaseData.drone;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', overflowX: 'hidden' }}>
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" aria-label="Go to AgroWatch home" style={{ display: 'inline-flex' }}>
            <Logo size={40} iconSize={24} />
          </Link>
          
          <div className="desktop-only" style={{ display: 'flex', gap: 'var(--sp-8)', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 'var(--sp-6)', alignItems: 'center' }}>
              <a href="#crops" style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Crops</a>
              <a href="#features" style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Features</a>
              <a href="#how-it-works" style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-secondary)' }}>How it Works</a>
            </div>
            <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
            <ThemeToggle />
            <div style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'center' }}>
              <Link to="/login" style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Login</Link>
              <Link to="/register"><Button>Get Started</Button></Link>
            </div>
          </div>

          <div className="mobile-only" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
            <ThemeToggle />
            <Link to="/login"><Button size="sm">Login</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="container grid-hero">
          <div className="animate-fade-in" style={{ textAlign: 'left' }}>
            <Badge label="SMART AGRICULTURAL SYSTEM" variant="accent" style={{ marginBottom: 'var(--sp-6)' }} />
            <h1 style={{ 
              fontSize: 'clamp(2rem, 4vw, 3.5rem)', 
              lineHeight: 1.15,
              marginBottom: 'var(--sp-6)', 
              fontWeight: 800,
              fontFamily: 'Plus Jakarta Sans',
              color: 'var(--text-primary)'
            }}>
              An Integrated <span className="gradient-text">Multi-Crop Monitoring</span>, Pest & Disease Detection, and Market Linkage System
            </h1>
            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginBottom: 'var(--sp-10)', lineHeight: 1.6, maxWidth: 580 }}>
              An AI-powered platform designed to detect plant diseases early, provide treatment recommendations, and connect farmers directly with buyers for Tomato, Maize, and Pineapple.
            </p>
            <div style={{ display: 'flex', gap: 'var(--sp-4)' }}>
              <Link to="/register">
                <Button size="lg" iconRight={<ArrowRight size={20} />}>Start Monitoring Now</Button>
              </Link>
            </div>
            
            <div style={{ marginTop: 'var(--sp-12)', display: 'flex', gap: 'var(--sp-8)', flexWrap: 'wrap' }}>
              <Stat label="Target Crops" value="3" />
              <Stat label="Model Accuracy" value="98%" />
              <Stat label="Detectable Conditions" value="12+" />
            </div>
          </div>

          {/* Visual Showcase: Agricultural Drone & Multi-Crop AI HUD */}
          <div className="animate-float" style={{ position: 'relative' }}>
            {/* Ambient Backlight Glow */}
            <div style={{ 
              position: 'absolute', inset: '-24px', 
              background: 'radial-gradient(circle, rgba(34, 197, 94, 0.28) 0%, rgba(217, 119, 6, 0.18) 50%, transparent 75%)', 
              borderRadius: 'var(--radius-xl)', 
              filter: 'blur(32px)',
              zIndex: 0 
            }} />

            <div className="glass-strong" style={{ 
              position: 'relative', 
              borderRadius: 'var(--radius-xl)', 
              border: '1px solid var(--border)', 
              boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              background: 'linear-gradient(145deg, var(--bg-surface), var(--bg-card))',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1
            }}>
              {/* Tab Selector Header */}
              <div style={{ 
                display: 'flex', 
                gap: '6px', 
                background: 'var(--bg-base)', 
                padding: '6px', 
                borderBottom: '1px solid var(--border)',
                overflowX: 'auto',
                scrollbarWidth: 'none'
              }}>
                {[
                  { id: 'drone', label: 'Drone Flight', icon: <Scan size={14} /> },
                  { id: 'tomato', label: 'Tomato', icon: <Apple size={14} /> },
                  { id: 'maize', label: 'Maize', icon: <Wheat size={14} /> },
                  { id: 'pineapple', label: 'Pineapple', icon: <Citrus size={14} /> },
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      flex: 1, padding: '8px 10px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                      fontSize: '0.8rem', fontWeight: 700, transition: 'all 0.2s ease', whiteSpace: 'nowrap',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                      background: activeTab === tab.id ? 'var(--accent)' : 'transparent',
                      color: activeTab === tab.id ? '#0a1410' : 'var(--text-secondary)'
                    }}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Main Viewport with Image & AI HUD */}
              <div style={{ position: 'relative', width: '100%', height: 'clamp(270px, 34vw, 350px)', overflow: 'hidden', background: '#050a08' }}>
                <img 
                  key={currentShowcase.id}
                  src={currentShowcase.img} 
                  alt={currentShowcase.alt} 
                  style={{ 
                    width: '100%', height: '100%', objectFit: 'cover', 
                    animation: 'fadeIn 0.35s ease'
                  }} 
                />
                
                {/* Vignette & Contrast Overlay */}
                <div style={{ 
                  position: 'absolute', inset: 0, 
                  background: 'linear-gradient(to top, rgba(10, 20, 16, 0.88) 0%, rgba(10, 20, 16, 0.25) 50%, rgba(10, 20, 16, 0.55) 100%)' 
                }} />

                {/* Animated Laser Scanning Line */}
                <div 
                  className="animate-scan-laser"
                  style={{
                    position: 'absolute', left: 0, right: 0, height: '3px',
                    background: 'linear-gradient(90deg, transparent 0%, var(--accent) 50%, transparent 100%)',
                    boxShadow: '0 0 16px var(--accent), 0 0 32px var(--accent)',
                    pointerEvents: 'none', zIndex: 4
                  }} 
                />

                {/* Top Telemetry Overlay */}
                <div style={{
                  position: 'absolute', top: 12, left: 12, right: 12,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  zIndex: 5
                }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '4px 10px', borderRadius: 'var(--radius-full)',
                    background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em'
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                    {currentShowcase.telemetry}
                  </div>

                  <div style={{
                    padding: '4px 10px', borderRadius: 'var(--radius-full)',
                    background: 'rgba(34, 197, 94, 0.2)', backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(74, 222, 128, 0.4)',
                    color: '#4ade80', fontSize: '0.72rem', fontWeight: 800
                  }}>
                    LIVE AI INFERENCE
                  </div>
                </div>

                {/* Computer Vision AI Target Reticle / Bounding Box */}
                <div style={{
                  position: 'absolute',
                  top: '20%', left: '22%', width: '56%', height: '50%',
                  border: '2px solid rgba(74, 222, 128, 0.75)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 0 20px rgba(74, 222, 128, 0.25), inset 0 0 15px rgba(74, 222, 128, 0.15)',
                  pointerEvents: 'none',
                  zIndex: 5,
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  padding: 8
                }}>
                  {/* Corner Reticle Markers */}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ width: 12, height: 12, borderTop: '3px solid #4ade80', borderLeft: '3px solid #4ade80' }} />
                    <div style={{ width: 12, height: 12, borderTop: '3px solid #4ade80', borderRight: '3px solid #4ade80' }} />
                  </div>

                  {/* Centered Detection Pill */}
                  <div style={{
                    margin: 'auto',
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: currentShowcase.statusType === 'warning' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(34, 197, 94, 0.9)',
                    backdropFilter: 'blur(4px)',
                    color: '#fff',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', gap: 5
                  }}>
                    <Crosshair size={12} />
                    {currentShowcase.boxLabel} • {currentShowcase.boxConfidence}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ width: 12, height: 12, borderBottom: '3px solid #4ade80', borderLeft: '3px solid #4ade80' }} />
                    <div style={{ width: 12, height: 12, borderBottom: '3px solid #4ade80', borderRight: '3px solid #4ade80' }} />
                  </div>
                </div>

                {/* Bottom Overlay Info Banner inside Viewport */}
                <div style={{
                  position: 'absolute', bottom: 12, left: 12, right: 12,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(10, 20, 16, 0.88)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  zIndex: 5
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                    <div style={{ 
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: currentShowcase.statusType === 'warning' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: currentShowcase.statusType === 'warning' ? '#ef4444' : '#22c55e'
                    }}>
                      <ShieldCheck size={16} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: '#fff', fontSize: '0.8125rem', fontWeight: 700 }} className="truncate">
                        {currentShowcase.name}
                      </div>
                      <div style={{ color: '#a3b899', fontSize: '0.7rem' }} className="truncate">
                        {currentShowcase.statusText}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: 8 }}>
                    <div style={{ color: '#22c55e', fontSize: '0.85rem', fontWeight: 800 }}>
                      {currentShowcase.statsCount}
                    </div>
                    <div style={{ color: '#94a39a', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700 }}>
                      {currentShowcase.statsMetric}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action Card Footer */}
              <div style={{ 
                padding: 'var(--sp-4)', 
                background: 'var(--bg-surface)', 
                borderTop: '1px solid var(--border)',
                display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  <Leaf size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
                  <span><strong>Treatment:</strong> {currentShowcase.advisory}</span>
                </div>
                <Link to="/register" style={{ textDecoration: 'none', width: '100%' }}>
                  <Button variant="outline" style={{ width: '100%', justifyContent: 'center' }} iconRight={<ArrowRight size={16} />}>
                    Launch Live Crop Diagnostic
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Crops Section */}
      <section id="crops" style={{ padding: '100px 0', background: 'var(--bg-base)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <Badge label="PRECISION TARGETING" variant="accent" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Supported Value Chains</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto', fontSize: '1.1rem' }}>
              Our AI models are specifically trained for the unique agricultural landscape of Ghana.
            </p>
          </div>

          <div className="grid-3">
            <CropCard 
              name="Tomato" 
              desc="Early detection of Late Blight, Bacterial Spot, and Leaf Curl Virus to prevent crop loss." 
              benefits={['Early Diagnosis', 'Treatment Advisory', 'Yield Optimization']}
              icon={<Apple size={20} color="var(--accent)" />}
              imgSrc={tomatoCropImg}
            />
            <CropCard 
              name="Maize" 
              desc="Monitoring growth vigor, fall armyworm symptoms, and nutrient deficiencies in real-time." 
              benefits={['Growth Tracking', 'Pest Identification', 'Harvest Timing']}
              icon={<Wheat size={20} color="var(--amber)" />}
              imgSrc={maizeCropImg}
            />
            <CropCard 
              name="Pineapple" 
              desc="Detecting mealybug wilt and heart rot symptoms for export-grade fruit management." 
              benefits={['Mealybug Control', 'Plot Mapping', 'Export Verification']}
              icon={<Citrus size={20} color="var(--info)" />}
              imgSrc={pineappleCropImg}
            />
          </div>
        </div>
      </section>

      {/* Features Detail Section */}
      <section id="features" style={{ padding: 'clamp(60px, 8vh, 100px) 0', position: 'relative' }}>
        <div className="container grid-hero">
          <div>
            <Badge label="FEATURES" variant="info" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--sp-6)' }}>
              Simple & <span style={{ color: 'var(--accent)' }}>Actionable</span> Crop Insights
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(1rem, 2vw, 1.2rem)', marginBottom: 'var(--sp-8)', lineHeight: 1.7 }}>
              AgroWatch turns crop photos into clear decisions. Upload your plant images to get instant diagnoses, health statistics, and direct access to produce buyers.
            </p>
            <div className="grid-features-box">
              <div className="glass" style={{ padding: '20px' }}>
                <h4 style={{ color: 'var(--accent)', marginBottom: 8 }}>Targeted AI Models</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Trained specifically for Tomato, Maize, and Pineapple.</p>
              </div>
              <div className="glass" style={{ padding: '20px' }}>
                <h4 style={{ color: 'var(--info)', marginBottom: 8 }}>Direct Market Linkage</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Connect healthy harvests directly with buyers.</p>
              </div>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div className="glass-strong" style={{ padding: 'clamp(24px, 4vw, 40px)', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)' }}>
                <FeatureItem 
                  icon={<Activity size={24} />} 
                  title="Instant Plant Detection" 
                  desc="Automated computer vision to count plants and detect disease symptoms quickly from your uploaded photos."
                />
                <FeatureItem 
                  icon={<ShieldCheck size={24} />} 
                  title="Smart Advisory System" 
                  desc="Combines AI disease identification with established agricultural recommendations for treatment."
                />
                <FeatureItem 
                  icon={<BarChart3 size={24} />} 
                  title="Crop Health Summaries" 
                  desc="Track plant counts, disease frequency, and crop status across all your farm scans."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" style={{ padding: 'clamp(60px, 8vh, 100px) 0', background: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'clamp(36px, 5vh, 60px)' }}>
            <Badge label="HOW IT WORKS" variant="info" style={{ marginBottom: 14 }} />
            <h2 style={{ fontSize: 'clamp(1.85rem, 4vw, 2.75rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Four Simple Steps</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto', fontSize: 'clamp(0.95rem, 2vw, 1.125rem)' }}>From photo upload to disease treatment and selling your harvest.</p>
          </div>

          <div className="grid-steps">
            <Step number="01" icon={<Globe size={20} />} title="Upload Crop Photos" desc="Take and upload clear photos of your crops from your phone or computer." />
            <Step number="02" icon={<Database size={20} />} title="AI Plant Scanning" desc="Smart AI analyzes your photos to count plants and spot disease symptoms." />
            <Step number="03" icon={<ShieldCheck size={20} />} title="Treatment Advice" desc="Get clear recommendations on how to treat any identified plant diseases." />
            <Step number="04" icon={<ShoppingBag size={20} />} title="Sell Your Produce" desc="List your healthy crops on the marketplace to connect directly with buyers." />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container" style={{ padding: '120px 0' }}>
        <div className="glass-strong" style={{ 
          padding: 'clamp(40px, 8vw, 100px) var(--container-px)', 
          textAlign: 'center', 
          borderRadius: 'var(--radius-xl)', 
          background: 'linear-gradient(135deg, var(--bg-card), var(--bg-surface))',
          border: '1px solid var(--border)'
        }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, marginBottom: 'var(--sp-6)', color: 'var(--text-primary)' }}>Ready to scale your farm?</h2>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: 'var(--sp-10)', maxWidth: 640, margin: '0 auto var(--sp-10)' }}>
            Join the agricultural revolution today. Register your farm and get your first field scan processed for free.
          </p>
          <div style={{ display: 'flex', gap: 'var(--sp-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register"><Button size="lg">Create Your Account</Button></Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '80px 0', background: 'var(--bg-surface)' }}>
        <div className="container">
          <div className="grid-footer">
            <div>
              <Link to="/" aria-label="Go to AgroWatch home" style={{ display: 'inline-flex', marginBottom: 'var(--sp-6)' }}>
                <Logo size={40} iconSize={24} />
              </Link>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: 'var(--sp-4)', maxWidth: 300 }}>
                Revolutionizing agricultural monitoring through computer vision and expert systems.
              </p>
            </div>
            <div>
              <h4 style={{ marginBottom: 'var(--sp-4)' }}>Platform</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <a href="#features">Features</a>
                <a href="#crops">Crops</a>
                <a href="#how-it-works">How it Works</a>
                <Link to="/market">Marketplace</Link>
              </div>
            </div>
            <div>
              <h4 style={{ marginBottom: 'var(--sp-4)' }}>Research</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <span>Ho Technical University</span>
                <span>Computer Science Dept</span>
                <span>Dissertation Project</span>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--sp-8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-6)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              © 2026 AgroWatch. 
            </div>
            <div style={{ display: 'flex', gap: 'var(--sp-6)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <Link to="/login">Farmer Portal</Link>
              <Link to="/login">Buyer Portal</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>{value}</div>
      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>{label}</div>
    </div>
  );
}

function Step({ number, icon, title, desc }) {
  return (
    <div className="glass" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 'var(--sp-3)',
      padding: 'clamp(var(--sp-3), 3vw, var(--sp-5))',
      borderRadius: 'var(--radius-lg)',
      height: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', fontWeight: 900, color: 'var(--accent)', opacity: 0.35, lineHeight: 1 }}>{number}</div>
        <div style={{ 
          width: 38, height: 38, borderRadius: 'var(--radius-md)', 
          background: 'var(--accent-dim)', color: 'var(--accent)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          flexShrink: 0 
        }}>
          {icon}
        </div>
      </div>
      <h4 style={{ fontSize: 'clamp(0.95rem, 2.2vw, 1.15rem)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.25 }}>{title}</h4>
      <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.78rem, 1.8vw, 0.875rem)', lineHeight: 1.45 }}>{desc}</p>
    </div>
  );
}

function CropCard({ name, desc, benefits, icon, imgSrc }) {
  return (
    <div className="glass-strong" style={{ overflow: 'hidden', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)' }}>
      <div style={{ position: 'relative', height: 210, overflow: 'hidden' }}>
        <img src={imgSrc} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-surface) 0%, transparent 35%)' }} />
        <div style={{ 
          position: 'absolute', top: 12, right: 12, 
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)', 
          padding: '6px 12px', borderRadius: 'var(--radius-md)', 
          display: 'flex', alignItems: 'center', gap: 6, 
          color: '#fff', fontSize: '0.8rem', fontWeight: 700,
          border: '1px solid rgba(255,255,255,0.15)'
        }}>
          {icon} {name}
        </div>
      </div>
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', flex: 1 }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{name}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>{desc}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', marginTop: 'auto', paddingTop: 'var(--sp-3)' }}>
          {benefits.map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--accent)' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
              {b}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, desc }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--sp-5)' }}>
      <div style={{ 
        width: 48, height: 48, borderRadius: 'var(--radius-md)', 
        background: 'var(--accent-dim)', color: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <h4 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 4 }}>{title}</h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.5 }}>{desc}</p>
      </div>
    </div>
  );
}
