import React, { useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const ComingSoonLandingPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch(`${API_BASE_URL}/api/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Could not connect to server. Please try again.');
    }
  };

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
      lineHeight: '1.6',
      color: '#44403C',
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
        padding: '1rem 2rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}>
        <nav style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
            }}>
              🎯
            </div>
            <span>Meet in Middle</span>
          </div>
        </nav>
      </header>

      {/* Coming Soon Banner */}
      <div style={{
        background: '#FEF3C7',
        borderBottom: '2px solid #F59E0B',
        padding: '1rem 2rem',
        textAlign: 'center',
      }}>
        <p style={{
          margin: 0,
          fontSize: '1.1rem',
          fontWeight: '600',
          color: '#92400E',
        }}>
          🚀 Coming Soon to Dublin! We're putting the finishing touches on MiM. Sign up below to be notified when we launch.
        </p>
      </div>

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
        color: 'white',
        padding: '5rem 2rem 4rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '3.5rem',
            marginBottom: '1.5rem',
            lineHeight: '1.2',
            fontWeight: '700',
          }}>
            Fair, Sustainable Meetups.<br />In Minutes.
          </h1>
          <p style={{
            fontSize: '1.5rem',
            marginBottom: '2rem',
            opacity: '0.95',
            fontWeight: '300',
          }}>
            Stop texting back and forth. Start meeting in the middle.
          </p>
          <p style={{
            fontSize: '1.1rem',
            marginBottom: '3rem',
            opacity: '0.9',
            maxWidth: '700px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            The only Dublin app that finds meeting spots based on each person's actual travel time.
            Whether you're driving, taking the Luas, or walking—everyone gets a fair journey.
          </p>
          
          {/* Email signup form */}
          <div style={{
            maxWidth: '500px',
            margin: '0 auto',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '16px',
            padding: '2rem',
          }}>
            <p style={{
              marginBottom: '1rem',
              fontSize: '1.1rem',
              fontWeight: '500',
            }}>
              Be the first to know when we launch:
            </p>
            
            {status === 'success' ? (
              <div style={{
                background: 'rgba(255,255,255,0.9)',
                color: '#065F46',
                padding: '1rem',
                borderRadius: '8px',
                fontWeight: '600',
              }}>
                ✅ {message}
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    padding: '1rem 1.5rem',
                    fontSize: '1rem',
                    borderRadius: '8px',
                    border: status === 'error' ? '2px solid #EF4444' : 'none',
                    flex: '1',
                    minWidth: '200px',
                  }}
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  style={{
                    background: status === 'loading' ? '#6B7280' : '#0D9488',
                    color: 'white',
                    padding: '1rem 2rem',
                    fontSize: '1rem',
                    borderRadius: '8px',
                    border: '2px solid white',
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    if (status !== 'loading') {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.color = '#0D9488';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (status !== 'loading') {
                      e.currentTarget.style.background = '#0D9488';
                      e.currentTarget.style.color = 'white';
                    }
                  }}
                >
                  {status === 'loading' ? 'Submitting...' : 'Notify Me'}
                </button>
              </form>
            )}
            
            {status === 'error' && (
              <p style={{
                marginTop: '0.5rem',
                color: '#FEE2E2',
                fontSize: '0.9rem',
              }}>
                {message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '5rem 2rem', background: '#FAF5F1' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: '2.5rem',
            marginBottom: '1rem',
            color: '#14B8A6',
          }}>
            Why MiM Makes Meeting Easy
          </h2>
          <p style={{
            textAlign: 'center',
            fontSize: '1.2rem',
            color: '#78350F',
            marginBottom: '4rem',
          }}>
            Built for Dublin. Built for fairness.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
          }}>
            {[
              {
                icon: '⚖️',
                title: 'Truly Fair',
                description: 'Each person picks their travel mode—walking, cycling, Luas, DART, or driving. We calculate actual travel times, not just distance.',
              },
              {
                icon: '🌱',
                title: 'Sustainable',
                description: 'Track your carbon footprint. Choose eco-friendly venues. Make sustainable choices without sacrificing convenience.',
              },
              {
                icon: '💰',
                title: 'Budget-Friendly',
                description: 'Filter venues by price range. Find amazing spots that work for everyone\'s wallet, from casual cafés to budget-conscious pubs.',
              },
              {
                icon: '⚡',
                title: 'Lightning Fast',
                description: 'No more 20-minute group chats. Get personalized venue recommendations in minutes, every time.',
              },
              {
                icon: '🚇',
                title: 'Dublin-Smart',
                description: 'Integrated with TFI, Luas, DART, and Dublin Bus. We know the city\'s transport like the back of our hand.',
              },
              {
                icon: '🏳️‍🌈',
                title: 'Inclusive',
                description: 'Filter for accessible venues, LGBTQ+ friendly spaces, and private meeting spots. Everyone should feel welcome.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: '12px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s',
                  border: '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(20, 184, 166, 0.15)';
                  e.currentTarget.style.borderColor = '#2DD4BF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  marginBottom: '1rem',
                  color: '#14B8A6',
                }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#78350F', lineHeight: '1.6' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '5rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: '2.5rem',
            marginBottom: '3rem',
            color: '#14B8A6',
          }}>
            How It Works
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
          }}>
            {[
              {
                number: '1',
                title: 'Add Locations',
                description: 'Your friends share where they\'re starting from anywhere in Dublin',
              },
              {
                number: '2',
                title: 'Choose Transport',
                description: 'Each person picks their mode—walking, cycling, public transport, or driving',
              },
              {
                number: '3',
                title: 'Get Venues',
                description: 'MiM instantly shows fair meeting spots based on real travel times',
              },
              {
                number: '4',
                title: 'Meet Up!',
                description: 'Pick your favorite spot and enjoy your time together',
              },
            ].map((step, index) => (
              <div key={index} style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  margin: '0 auto 1rem',
                }}>
                  {step.number}
                </div>
                <h3 style={{
                  fontSize: '1.3rem',
                  marginBottom: '0.5rem',
                  color: '#14B8A6',
                }}>
                  {step.title}
                </h3>
                <p style={{ color: '#78350F' }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
        color: 'white',
        padding: '4rem 2rem',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          Ready to revolutionize your social plans?
        </h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: '0.9' }}>
          Join Dublin's fairest way to meet up — launching soon!
        </p>
        <button
          disabled
          style={{
            background: 'rgba(255,255,255,0.5)',
            color: '#0D9488',
            padding: '1rem 3rem',
            fontSize: '1.2rem',
            borderRadius: '12px',
            border: 'none',
            cursor: 'not-allowed',
            fontWeight: '600',
            boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          🔒 Launching Soon
        </button>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#44403C',
        color: '#FAF5F1',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <p>© 2025 MiM - Meet in the Middle | Making Dublin meetups fair for everyone</p>
      </footer>
    </div>
  );
};

export default ComingSoonLandingPage;
