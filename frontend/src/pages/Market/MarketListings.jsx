import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBasket, Plus, MapPin, Tag, Calendar, MessageCircle, Filter } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import Badge from '../../components/UI/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { marketAPI, messagingAPI } from '../../services/api';
import { CROP_ICONS } from '../../data/constants';

export default function MarketListings() {
  const { isFarmer, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [filter, setFilter] = useState('all');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadListings() {
      setLoading(true);
      try {
        const filters = filter !== 'all' ? { crop_type: filter } : {};
        const results = await marketAPI.list(filters);
        let active = results.filter(l => l.listing_status === 'active');
        if (isFarmer && user) {
          active = active.filter(l => l.farmer === user.id || l.farmer_id === user.id || l.farmer_name === user.full_name);
        }
        setListings(active);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadListings();
  }, [filter, isFarmer, user]);

  const [contactModalListing, setContactModalListing] = useState(null);
  const [contactMessage, setContactMessage] = useState('');
  const [sending, setSending] = useState(false);

  const openContactModal = (listing) => {
    setContactModalListing(listing);
    setContactMessage('');
  };

  const handleSendContact = async () => {
    if (!contactMessage.trim() || !contactModalListing) return;
    setSending(true);
    try {
      const thread = await messagingAPI.startThread({
        seller: contactModalListing.farmer,
        listing: contactModalListing.id,
        initial_message: contactMessage,
      });
      addToast("Message sent! The seller has been notified.", 'success');
      setContactModalListing(null);
      navigate(`/messages?thread=${thread.id}`);
    } catch (err) {
      console.error(err);
      addToast("Failed to send message.", 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">{isFarmer ? 'My Market Listings' : 'Market Exchange'}</h1>
          <p className="page-subtitle">
            {isFarmer 
              ? 'Manage your active produce listings on the exchange.' 
              : 'Connect directly with verified farmers and purchase produce.'}
          </p>
        </div>
        {isFarmer && (
          <Link to="/market/new">
            <Button icon={<Plus size={18} />}>New Listing</Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="filter-scroll">
        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>All Crops</FilterButton>
        <FilterButton active={filter === 'tomato'} onClick={() => setFilter('tomato')}>Tomatoes</FilterButton>
        <FilterButton active={filter === 'maize'} onClick={() => setFilter('maize')}>Maize</FilterButton>
        <FilterButton active={filter === 'pineapple'} onClick={() => setFilter('pineapple')}>Pineapples</FilterButton>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid-3">
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)' }}></div>)}
        </div>
      ) : listings.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 'clamp(var(--sp-8), 6vw, var(--sp-12))' }}>
          <ShoppingBasket size={48} style={{ color: 'var(--text-muted)', margin: '0 auto var(--sp-4)' }} />
          <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--sp-2)' }}>
            {isFarmer ? 'No Products Listed' : 'No Listings Found'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: isFarmer ? 'var(--sp-4)' : 0 }}>
            {isFarmer 
              ? "You haven't listed any produce for sale yet." 
              : "There are currently no active listings for this category."}
          </p>
          {isFarmer && (
            <Link to="/market/new">
              <Button icon={<Plus size={16} />}>List Produce for Sale</Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid-auto">
          {listings.map(listing => (
            <Card key={listing.id} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', padding: 'var(--sp-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
                  <div style={{ 
                    width: 40, height: 40, borderRadius: 'var(--radius-md)', 
                    background: 'var(--accent-dim)', color: 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {CROP_ICONS[listing.crop_type]}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, textTransform: 'capitalize' }}>
                      {listing.crop_type}
                    </h3>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {listing.farmer_name} · {listing.farmer_phone}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent)' }}>
                    GH₵ {Number(listing.asking_price_ghs).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>per kg</div>
                </div>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1 }}>
                {listing.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', padding: 'var(--sp-3)', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                  <Tag size={14} className="text-muted" /> 
                  <span style={{ fontWeight: 600 }}>{listing.quantity_kg} kg</span> Available
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                  <Calendar size={14} className="text-muted" /> 
                  Harvest: <span style={{ fontWeight: 500 }}>{new Date(listing.harvest_date).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                  <MapPin size={14} className="text-muted" /> 
                  {listing.farmer_district}, {listing.farmer_region}
                </div>
              </div>

              <div style={{ marginTop: 'var(--sp-2)' }}>
                <Button 
                  fullWidth 
                  variant="primary" 
                  icon={<MessageCircle size={16} />}
                  onClick={() => openContactModal(listing)}
                >
                  Contact Seller
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Contact Seller Modal */}
      <Modal 
        open={!!contactModalListing} 
        onClose={() => setContactModalListing(null)}
        title="Contact Seller"
        width={400}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Send a message to <strong>{contactModalListing?.farmer_name}</strong> about their {contactModalListing?.crop_type} listing.
          </p>
          <textarea 
            value={contactMessage}
            onChange={e => setContactMessage(e.target.value)}
            style={{
              width: '100%', padding: 'var(--sp-3)',
              background: 'var(--bg-input)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
              outline: 'none', minHeight: 100, resize: 'vertical',
              fontFamily: 'inherit', fontSize: '0.875rem'
            }}
            placeholder="Type your message here..."
            autoFocus
          />
          <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'flex-end', marginTop: 'var(--sp-2)' }}>
            <Button variant="ghost" onClick={() => setContactModalListing(null)} disabled={sending}>Cancel</Button>
            <Button variant="primary" onClick={handleSendContact} loading={sending}>Send Message</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function FilterButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px',
        borderRadius: 'var(--radius-full)',
        background: active ? 'var(--accent)' : 'var(--bg-input)',
        color: active ? '#0a1410' : 'var(--text-secondary)',
        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
        fontSize: '0.875rem',
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s ease'
      }}
    >
      {children}
    </button>
  );
}
