import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import ThemeToggle from '../../components/UI/ThemeToggle';
import Logo from '../../components/UI/Logo';
import Modal from '../../components/UI/Modal';
import { Leaf, ShieldCheck, ShoppingBag, ArrowRight, Scan, MapPin, BarChart3, Database, Users, Globe, Activity, Crosshair, Play, Apple, Wheat, Citrus, ChevronLeft, ChevronRight } from 'lucide-react';
import tomatoCropImg from '../../assets/tomato_crop.png';
import maizeCropImg from '../../assets/maize_crop.png';
import pineappleCropImg from '../../assets/pineapple_crop.png';


export default function LandingPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [activeCrop, setActiveCrop] = useState('tomato');

  useEffect(() => {
    const crops = ['tomato', 'maize', 'pineapple'];
    const timer = setInterval(() => {
      setActiveCrop(prev => {
        const nextIndex = (crops.indexOf(prev) + 1) % crops.length;
        return crops[nextIndex];
      });
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const demoScans = {
    tomato: {
      name: 'Tomato Crop Scan',
      condition: 'Late Blight Detected',
      status: 'warning',
      confidence: '97% Match',
      plantsCount: 18,
      healthyCount: 14,
      affectedCount: 4,
      advisory: 'Apply recommended copper fungicide and prune affected lower leaves to prevent spread.'
    },
    maize: {
      name: 'Maize Crop Scan',
      condition: 'Healthy Field Vigor',
      status: 'success',
      confidence: '99% Match',
      plantsCount: 32,
      healthyCount: 32,
      affectedCount: 0,
      advisory: 'Crop health is optimal. Continue regular watering and weed control schedule.'
    },
    pineapple: {
      name: 'Pineapple Crop Scan',
      condition: 'Mealybug Symptoms Spotted',
      status: 'warning',
      confidence: '94% Match',
      plantsCount: 24,
      healthyCount: 21,
      affectedCount: 3,
      advisory: 'Spray neem oil solution early morning to eradicate pests before flowering.'
    }
  };

  const currentScan = demoScans[activeCrop];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', overflowX: 'hidden' }}>
      {/* Navbar */}
      <nav style={{ 
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        background: 'var(--bg-base)',
        opacity: 0.95,
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: 'var(--sp-4) 0'
      }}>
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
      <section style={{ 
        position: 'relative', 
        padding: 'clamp(120px, 15vh, 180px) 0 clamp(60px, 10vh, 120px)', 
        background: 'radial-gradient(circle at top right, var(--accent-dim), transparent 50%), radial-gradient(circle at bottom left, var(--amber-dim), transparent 50%)'
      }}>
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

          {/* Interactive Scan Result Card Preview */}
          <div className="animate-float" style={{ position: 'relative' }}>
            <div style={{ 
              position: 'absolute', inset: '-25px', 
              background: 'linear-gradient(135deg, var(--accent) 0%, transparent 60%)', 
              borderRadius: 'var(--radius-xl)', opacity: 0.15, zIndex: 0 
            }} />
            
            <div className="glass-strong" style={{ 
              position: 'relative', 
              borderRadius: 'var(--radius-xl)', 
              border: '1px solid var(--border)', 
              boxShadow: 'var(--shadow-lg)',
              padding: 'var(--sp-6)',
              background: 'linear-gradient(145deg, var(--bg-surface), var(--bg-card))',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--sp-5)'
            }}>
              {/* Crop Selection Tabs */}
              <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-base)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <button 
                  onClick={() => setActiveCrop('tomato')} 
                  style={{ 
                    flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
                    fontSize: '0.85rem', fontWeight: 700, transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    background: activeCrop === 'tomato' ? 'var(--accent)' : 'transparent',
                    color: activeCrop === 'tomato' ? '#fff' : 'var(--text-secondary)'
                  }}>
                  <Apple size={14} /> Tomato
                </button>
                <button 
                  onClick={() => setActiveCrop('maize')} 
                  style={{ 
                    flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
                    fontSize: '0.85rem', fontWeight: 700, transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    background: activeCrop === 'maize' ? 'var(--accent)' : 'transparent',
                    color: activeCrop === 'maize' ? '#fff' : 'var(--text-secondary)'
                  }}>
                  <Wheat size={14} /> Maize
                </button>
                <button 
                  onClick={() => setActiveCrop('pineapple')} 
                  style={{ 
                    flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
                    fontSize: '0.85rem', fontWeight: 700, transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    background: activeCrop === 'pineapple' ? 'var(--accent)' : 'transparent',
                    color: activeCrop === 'pineapple' ? '#fff' : 'var(--text-secondary)'
                  }}>
                  <Citrus size={14} /> Pineapple
                </button>
              </div>

              {/* Scan Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                    <Scan size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{currentScan.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Diagnostic Result</div>
                  </div>
                </div>
                <Badge label="SCAN COMPLETE" variant="accent" />
              </div>

              {/* Plant Counts Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
                <div style={{ background: 'var(--bg-base)', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{currentScan.plantsCount}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PLANTS</div>
                </div>
                <div style={{ background: 'var(--bg-base)', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>{currentScan.healthyCount}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>HEALTHY</div>
                </div>
                <div style={{ background: 'var(--bg-base)', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: currentScan.affectedCount > 0 ? '#ef4444' : '#10b981' }}>{currentScan.affectedCount}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>AFFECTED</div>
                </div>
              </div>

              {/* Condition Result Banner */}
              <div style={{ 
                padding: '12px 14px', borderRadius: 'var(--radius-md)', 
                background: currentScan.status === 'warning' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                border: currentScan.status === 'warning' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={18} color={currentScan.status === 'warning' ? '#ef4444' : '#10b981'} />
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: currentScan.status === 'warning' ? '#ef4444' : '#10b981' }}>
                    {currentScan.condition}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{currentScan.confidence}</span>
              </div>

              {/* Advisory Box */}
              <div style={{ 
                padding: '12px 14px', borderRadius: 'var(--radius-md)', 
                background: 'var(--bg-base)', border: '1px solid var(--border)',
                fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5
              }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Leaf size={14} color="var(--accent)" /> Treatment Advice:
                </div>
                {currentScan.advisory}
              </div>

              {/* Card CTA */}
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Button variant="outline" style={{ width: '100%', justifyContent: 'center' }} iconRight={<ArrowRight size={16} />}>
                  Run Your Own Scan
                </Button>
              </Link>
            </div>

            {/* Status Floating Badge */}
            <div className="glass" style={{ 
              position: 'absolute', top: -14, right: 10, 
              padding: '8px 14px', 
              display: 'flex', alignItems: 'center', gap: 8, 
              zIndex: 10,
              border: '1px solid rgba(16, 185, 129, 0.3)',
              background: 'rgba(16, 185, 129, 0.08)',
              backdropFilter: 'blur(10px)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s infinite' }} />
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', letterSpacing: '0.05em' }}>CROP SCAN DEMO • AUTO SLIDE</div>
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
      <section id="features" style={{ padding: '100px 0', position: 'relative' }}>
        <div className="container grid-hero">
          <div style={{ position: 'relative' }}>
            <div className="glass-strong" style={{ padding: '40px', borderRadius: 'var(--radius-xl)' }}>
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
          
          <div>
            <Badge label="FEATURES" variant="info" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--sp-6)' }}>
              Simple & <span style={{ color: 'var(--accent)' }}>Actionable</span> Crop Insights
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: 'var(--sp-8)', lineHeight: 1.7 }}>
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
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" style={{ padding: '120px 0', background: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <Badge label="HOW IT WORKS" variant="info" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: '2.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>Four Simple Steps</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto', fontSize: '1.125rem' }}>From photo upload to disease treatment and selling your harvest.</p>
          </div>

          <div className="grid-steps">
            <Step number="01" icon={<Globe size={24} />} title="Upload Crop Photos" desc="Take and upload clear photos of your crops from your phone or computer." />
            <Step number="02" icon={<Database size={24} />} title="AI Plant Scanning" desc="Smart AI analyzes your photos to count plants and spot disease symptoms." />
            <Step number="03" icon={<ShieldCheck size={24} />} title="Treatment Advice" desc="Get clear recommendations on how to treat any identified plant diseases." />
            <Step number="04" icon={<ShoppingBag size={24} />} title="Sell Your Produce" desc="List your healthy crops on the marketplace to connect directly with buyers." />
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent)', opacity: 0.2 }}>{number}</div>
        <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>
      <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h4>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

function CropCard({ name, desc, benefits, icon, imgSrc }) {
  return (
    <div className="crop-card">
      <div className="crop-card__image-wrap">
        <img src={imgSrc} alt={name} className="crop-card__image" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-surface) 0%, transparent 35%)' }} />
        <div className="crop-card__badge">
          {icon} {name}
        </div>
      </div>
      <div className="crop-card__body">
        <h3 className="crop-card__title">{name}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>{desc}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', marginTop: 'auto', paddingTop: 'var(--sp-3)' }}>
          {benefits.map((b, i) => (
            <div key={i} className="crop-card__benefit">
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
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
