import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import ThemeToggle from '../../components/UI/ThemeToggle';
import Logo from '../../components/UI/Logo';
import Modal from '../../components/UI/Modal';
import { Leaf, ShieldCheck, ShoppingBag, ArrowRight, Scan, MapPin, BarChart3, Database, Users, Globe, Activity, Crosshair, Play, Apple, Wheat, Citrus, ChevronLeft, ChevronRight, Radio, Eye, Sparkles, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';
import tomatoCropImg from '../../assets/tomato_crop.png';
import maizeCropImg from '../../assets/maize_crop.png';
import pineappleCropImg from '../../assets/pineapple_crop.png';
import heroDroneImg from '../../assets/hero_drone.png';


export default function LandingPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [activeFeed, setActiveFeed] = useState('drone');

  useEffect(() => {
    const feedKeys = ['drone', 'tomato', 'maize', 'pineapple'];
    const timer = setInterval(() => {
      setActiveFeed(prev => {
        const nextIndex = (feedKeys.indexOf(prev) + 1) % feedKeys.length;
        return feedKeys[nextIndex];
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const heroFeeds = {
    drone: {
      id: 'drone',
      label: 'Drone Survey',
      icon: Radio,
      tag: 'AERIAL NDVI TELEMETRY',
      title: 'Autonomous Crop Scan Drone',
      image: heroDroneImg,
      location: 'Ho, Volta Region (Plot 4B)',
      status: 'OPTIMAL SURVEY',
      stats: [
        { label: 'Field Area', value: '14.2 Ha' },
        { label: 'Plant Count', value: '1,240' },
        { label: 'Field Vigor', value: '98.5%' }
      ],
      advisory: 'Multispectral sensor active. 4K optical tracking plant density and vigor across all grids.',
      targetBox: { top: '34%', left: '30%', width: '40%', height: '36%', label: 'AI TARGET: X4 DRONE SCANNER' }
    },
    tomato: {
      id: 'tomato',
      label: 'Tomato',
      icon: Apple,
      tag: 'COMPUTER VISION PATHOLOGY',
      title: 'Tomato Foliage Scan',
      image: tomatoCropImg,
      location: 'Akatsi South, Volta Region',
      status: 'DIAGNOSIS COMPLETE',
      stats: [
        { label: 'Scanned', value: '380 Plants' },
        { label: 'Confidence', value: '97.8%' },
        { label: 'Condition', value: 'Optimal Vigor' }
      ],
      advisory: 'High foliar health index. Fruit ripening stage optimal with zero active late blight detected.',
      targetBox: { top: '30%', left: '32%', width: '42%', height: '42%', label: 'AI RETICLE: HEALTHY VINES • 98%' }
    },
    maize: {
      id: 'maize',
      label: 'Maize',
      icon: Wheat,
      tag: 'PEST & GROWTH ANALYSIS',
      title: 'Maize Canopy Scan',
      image: maizeCropImg,
      location: 'Hohoe Municipal, Ghana',
      status: 'STAND OPTIMAL',
      stats: [
        { label: 'Canopy Index', value: '99.2%' },
        { label: 'Pest Infest', value: '0.0%' },
        { label: 'Harvest Stage', value: 'R4 Dough' }
      ],
      advisory: 'Zero Fall Armyworm damage detected. Chlorophyll levels strong across all planted rows.',
      targetBox: { top: '24%', left: '26%', width: '48%', height: '48%', label: 'AI RETICLE: MAIZE CANOPY • 99%' }
    },
    pineapple: {
      id: 'pineapple',
      label: 'Pineapple',
      icon: Citrus,
      tag: 'EXPORT GRADE CHECK',
      title: 'Pineapple Plot Scan',
      image: pineappleCropImg,
      location: 'Suhum District, Eastern Region',
      status: 'EXPORT READY',
      stats: [
        { label: 'Sugar Brix', value: '14.5°' },
        { label: 'Wilt Check', value: 'Clear' },
        { label: 'Market Grade', value: 'Grade A' }
      ],
      advisory: 'Crown development verified. Sugar brix content qualifies for premium commercial export.',
      targetBox: { top: '28%', left: '28%', width: '44%', height: '46%', label: 'AI RETICLE: CROWN HEALTH • 96%' }
    }
  };

  const currentFeed = heroFeeds[activeFeed];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', overflowX: 'hidden', width: '100%', maxWidth: '100vw' }}>
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" aria-label="Go to AgroWatch home" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <Logo size={36} iconSize={22} />
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

          <div className="mobile-only" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <ThemeToggle compact={true} />
            <Link to="/login"><Button size="sm">Login</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="container grid-hero">
          <div className="animate-fade-in" style={{ textAlign: 'left', width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
            <Badge label="SMART AGRICULTURAL SYSTEM" variant="accent" style={{ marginBottom: 'var(--sp-5)' }} />
            <h1 style={{ 
              fontSize: 'clamp(1.45rem, 4.8vw, 3.25rem)', 
              lineHeight: 1.2,
              marginBottom: 'var(--sp-5)', 
              fontWeight: 800,
              fontFamily: 'Plus Jakarta Sans',
              color: 'var(--text-primary)',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              maxWidth: '100%'
            }}>
              An Integrated <span className="gradient-text">Multi-Crop Monitoring</span>, Pest &amp; Disease Detection, and Market Linkage System
            </h1>
            <p style={{ 
              fontSize: 'clamp(0.92rem, 2.3vw, 1.15rem)', 
              color: 'var(--text-secondary)', 
              marginBottom: 'var(--sp-8)', 
              lineHeight: 1.6, 
              maxWidth: '100%',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              An AI-powered platform designed to detect plant diseases early, provide treatment recommendations, and connect farmers directly with buyers for Tomato, Maize, and Pineapple.
            </p>
            <div style={{ display: 'flex', gap: 'var(--sp-4)' }}>
              <Link to="/register">
                <Button size="lg" iconRight={<ArrowRight size={20} />}>Start Monitoring Now</Button>
              </Link>
            </div>
            
            <div className="hero-stats-row">
              <Stat label="Target Crops" value="3" />
              <Stat label="Model Accuracy" value="98%" />
              <Stat label="Conditions" value="12+" />
            </div>
          </div>

          {/* Interactive Agricultural Drone & Multi-Crop AI HUD */}
          <div className="animate-float" style={{ position: 'relative', width: '100%', maxWidth: 'min(520px, 100%)', minWidth: 0, margin: '0 auto', boxSizing: 'border-box' }}>
            {/* Ambient Background Glow */}
            <div style={{ 
              position: 'absolute', inset: 0, 
              borderRadius: 'var(--radius-xl)',
              background: 'radial-gradient(circle at center, rgba(74, 222, 128, 0.2) 0%, transparent 70%)', 
              filter: 'blur(20px)', opacity: 0.8, zIndex: 0, pointerEvents: 'none'
            }} />

            {/* Main HUD Card */}
            <div className="glass-strong" style={{ 
              position: 'relative', 
              borderRadius: 'var(--radius-xl)', 
              border: '1px solid var(--border-hover)', 
              boxShadow: '0 20px 40px -15px rgba(0,0,0,0.35)',
              overflow: 'hidden',
              background: 'linear-gradient(160deg, var(--bg-surface), var(--bg-card))',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1,
              width: '100%',
              maxWidth: '100%',
              minWidth: 0,
              boxSizing: 'border-box'
            }}>
              
              {/* Header Feed Selector Bar */}
              <div style={{ 
                padding: '10px 12px', 
                borderBottom: '1px solid var(--border)', 
                background: 'rgba(0,0,0,0.12)',
                display: 'flex', 
                gap: 6, 
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                width: '100%',
                maxWidth: '100%',
                minWidth: 0,
                boxSizing: 'border-box'
              }} className="no-scrollbar">
                {Object.values(heroFeeds).map((feed) => {
                  const FeedIcon = feed.icon;
                  const isActive = activeFeed === feed.id;
                  return (
                    <button
                      key={feed.id}
                      onClick={() => setActiveFeed(feed.id)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-md)',
                        border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
                        background: isActive ? 'var(--accent)' : 'var(--bg-base)',
                        color: isActive ? '#fff' : 'var(--text-secondary)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                        boxShadow: isActive ? '0 2px 10px rgba(74, 222, 128, 0.35)' : 'none'
                      }}
                    >
                      <FeedIcon size={13} />
                      <span>{feed.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Viewport Image with Laser Scanning & CV Reticles */}
              <div style={{ position: 'relative', height: 'clamp(240px, 45vw, 310px)', overflow: 'hidden', background: '#0a0f0d' }}>
                <img 
                  src={currentFeed.image} 
                  alt={currentFeed.title}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    transition: 'opacity 0.4s ease',
                    display: 'block'
                  }} 
                />

                {/* Grid Overlay Texture */}
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
                  backgroundSize: '22px 22px',
                  pointerEvents: 'none'
                }} />

                {/* Laser Scanning Line */}
                <div className="animate-scan-laser" />

                {/* Top Telemetry Pills */}
                <div style={{ 
                  position: 'absolute', top: 10, left: 10, right: 10,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  gap: 6, zIndex: 6, pointerEvents: 'none'
                }}>
                  <div style={{ 
                    padding: '3px 8px', borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(74, 222, 128, 0.4)',
                    display: 'flex', alignItems: 'center', gap: 5,
                    color: '#4ade80', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.03em',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', flexShrink: 0, animation: 'pulse 1.2s infinite' }} />
                    <span>AI SCANNER</span>
                  </div>

                  <div style={{ 
                    padding: '3px 8px', borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff', fontSize: '0.65rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 4,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>
                    <Activity size={11} color="var(--accent)" style={{ flexShrink: 0 }} />
                    <span>4K MULTISPECTRAL</span>
                  </div>
                </div>

                {/* Computer Vision Target Box & Reticle */}
                <div style={{
                  position: 'absolute',
                  top: currentFeed.targetBox.top,
                  left: currentFeed.targetBox.left,
                  width: currentFeed.targetBox.width,
                  height: currentFeed.targetBox.height,
                  border: '2px dashed rgba(74, 222, 128, 0.85)',
                  borderRadius: 6,
                  boxShadow: '0 0 15px rgba(74, 222, 128, 0.25)',
                  zIndex: 4,
                  pointerEvents: 'none',
                  transition: 'all 0.5s ease'
                }}>
                  {/* Corner Accent Brackets */}
                  <div style={{ position: 'absolute', top: -3, left: -3, width: 8, height: 8, borderTop: '3px solid #4ade80', borderLeft: '3px solid #4ade80' }} />
                  <div style={{ position: 'absolute', top: -3, right: -3, width: 8, height: 8, borderTop: '3px solid #4ade80', borderRight: '3px solid #4ade80' }} />
                  <div style={{ position: 'absolute', bottom: -3, left: -3, width: 8, height: 8, borderBottom: '3px solid #4ade80', borderLeft: '3px solid #4ade80' }} />
                  <div style={{ position: 'absolute', bottom: -3, right: -3, width: 8, height: 8, borderBottom: '3px solid #4ade80', borderRight: '3px solid #4ade80' }} />
                  
                  {/* Center Crosshair */}
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.85, color: '#4ade80' }}>
                    <Crosshair size={18} />
                  </div>

                  {/* Target Identification Label */}
                  <div style={{ 
                    position: 'absolute', bottom: -24, left: 0,
                    background: 'rgba(0,0,0,0.85)', padding: '2px 8px', borderRadius: 4,
                    border: '1px solid rgba(74, 222, 128, 0.5)',
                    color: '#4ade80', fontSize: '0.65rem', fontWeight: 800,
                    whiteSpace: 'nowrap', letterSpacing: '0.04em',
                    maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>
                    {currentFeed.targetBox.label}
                  </div>
                </div>

                {/* Bottom Overlay Gradient & GPS Tag */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: 50,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
                  display: 'flex', alignItems: 'flex-end', padding: '8px 10px',
                  justifyContent: 'space-between', gap: 6, zIndex: 5, pointerEvents: 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.9)', fontSize: '0.7rem', fontWeight: 600, minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    <MapPin size={12} color="var(--accent)" style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentFeed.location}</span>
                  </div>
                  <span style={{ fontSize: '0.65rem', color: '#4ade80', fontWeight: 800, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '45%' }}>{currentFeed.tag}</span>
                </div>
              </div>

              {/* Bottom Telemetry & Diagnostics Panel */}
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                
                {/* 3 Metric Badges */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6 }}>
                  {currentFeed.stats.map((st, idx) => (
                    <div key={idx} style={{ 
                      background: 'var(--bg-base)', 
                      padding: '8px 6px', 
                      borderRadius: 'var(--radius-md)', 
                      border: '1px solid var(--border)',
                      textAlign: 'center',
                      minWidth: 0,
                      overflow: 'hidden'
                    }}>
                      <div style={{ fontSize: 'clamp(0.85rem, 3.2vw, 1rem)', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{st.value}</div>
                      <div style={{ fontSize: 'clamp(0.58rem, 1.8vw, 0.68rem)', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', marginTop: 2 }}>{st.label}</div>
                    </div>
                  ))}
                </div>

                {/* Advisory & Status Banner */}
                <div style={{ 
                  background: 'var(--bg-base)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '10px 12px',
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45
                }}>
                  <Sparkles size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>AI Advisory: </strong>
                    {currentFeed.advisory}
                  </div>
                </div>

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
      <section id="features" style={{ padding: '100px 0', position: 'relative' }}>
        <div className="container grid-hero">
          <div style={{ position: 'relative' }} className="features-detail-col">
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
          
          <div className="features-intro-col">
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
            <div className="footer-links-group">
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
                </div>
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
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 800, color: 'var(--accent)', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 'clamp(0.68rem, 2vw, 0.8125rem)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, marginTop: 4 }}>{label}</div>
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
