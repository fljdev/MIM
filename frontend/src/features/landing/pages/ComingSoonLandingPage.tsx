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
        background: 'linear-gradient(135deg, #17a398 0%, #14b8a6 100%)',
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
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
            }}>
              🌍
            </div>
            <span>Meet in Middle</span>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(to bottom right, #f0fdfa, #cffafe)',
        padding: '5rem 2rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: '900',
            marginBottom: '1.5rem',
            lineHeight: '1.2',
            color: '#1f2937',
          }}>
            Reducing Dublin's Carbon Footprint,<br />
            One Meetup at a Time
          </h1>
          
          <p style={{
            fontSize: '1.5rem',
            marginBottom: '2rem',
            color: '#374151',
            maxWidth: '900px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            The only Dublin app that calculates real travel time AND environmental impact to optimize urban mobility and reduce unnecessary emissions.
          </p>

          <button
            onClick={() => document.getElementById('join')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              padding: '1.25rem 3rem',
              background: 'linear-gradient(135deg, #17a398 0%, #14b8a6 100%)',
              color: 'white',
              fontSize: '1.25rem',
              borderRadius: '12px',
              border: 'none',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 10px 15px rgba(20, 184, 166, 0.3)',
            }}
          >
            🌱 Join the Waitlist
          </button>
          
          <p style={{
            marginTop: '1.5rem',
            color: '#6b7280',
            fontSize: '1.125rem',
          }}>
            Launching Q1 2026
          </p>
        </div>
      </section>

      {/* Climate Problem Section */}
      <section style={{ padding: '5rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '900',
              color: '#1f2937',
              marginBottom: '1rem',
            }}>
              The Climate Problem We're Solving
            </h2>
            <p style={{
              fontSize: '1.25rem',
              color: '#6b7280',
              maxWidth: '800px',
              margin: '0 auto',
            }}>
              Urban transport contributes significantly to Ireland's carbon emissions. Every unnecessary kilometer driven adds to climate change and traffic congestion in Dublin.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem',
          }}>
            {/* Old Way */}
            <div style={{
              background: '#fef2f2',
              border: '4px solid #fecaca',
              borderRadius: '24px',
              padding: '2rem',
            }}>
              <h3 style={{
                fontSize: '1.875rem',
                fontWeight: '900',
                color: '#dc2626',
                marginBottom: '1.5rem',
              }}>
                ❌ The Old Way
              </h3>
              <div style={{ fontSize: '1.125rem', color: '#374151' }}>
                <p style={{ marginBottom: '1rem' }}>🚗 Everyone drives to a central location, adding unnecessary vehicle-km to Dublin's roads</p>
                <p style={{ marginBottom: '1rem' }}>⏰ Some people travel 45 minutes while others travel 5 minutes - completely unfair</p>
                <p>💨 Higher emissions, increased traffic congestion, and wasted time</p>
              </div>
            </div>

            {/* MiM Way */}
            <div style={{
              background: '#f0fdf4',
              border: '4px solid #bbf7d0',
              borderRadius: '24px',
              padding: '2rem',
            }}>
              <h3 style={{
                fontSize: '1.875rem',
                fontWeight: '900',
                color: '#16a34a',
                marginBottom: '1.5rem',
              }}>
                ✓ The MiM Way
              </h3>
              <div style={{ fontSize: '1.125rem', color: '#374151' }}>
                <p style={{ marginBottom: '1rem' }}>🎯 Calculates the true middle point based on actual Luas, bus, cycling, and walking times</p>
                <p style={{ marginBottom: '1rem' }}>⚖️ Everyone has fair journey times - no one travels significantly further than others</p>
                <p style={{ marginBottom: '1rem' }}>🌱 Reduces vehicle-km, promotes sustainable transport modes, and lowers urban emissions</p>
                <p>📊 Track your personal climate impact with measurable CO₂ savings</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{
        padding: '5rem 2rem',
        background: 'linear-gradient(to bottom right, #f0fdfa, #cffafe)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            color: '#1f2937',
            textAlign: 'center',
            marginBottom: '3rem',
          }}>
            How MiM Works
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
          }}>
            {[
              { num: '1', title: 'Enter Locations', desc: 'Each person enters their starting point (home, work, gym, etc.)' },
              { num: '2', title: 'Choose Transit Mode', desc: 'Select your preferred transport: Luas, bus, bike, walk, or drive' },
              { num: '3', title: 'MiM Calculates', desc: 'We find venues with fair journey times AND lowest environmental impact' },
              { num: '4', title: 'Track Your Impact', desc: 'See exactly how much CO₂ you saved by choosing sustainable transport' },
            ].map((step) => (
              <div key={step.num} style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'center',
                border: '2px solid #99f6e4',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #17a398 0%, #14b8a6 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  fontSize: '2.5rem',
                  color: 'white',
                  fontWeight: '900',
                }}>
                  {step.num}
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '0.75rem',
                }}>
                  {step.title}
                </h3>
                <p style={{ color: '#6b7280' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '5rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            color: '#1f2937',
            textAlign: 'center',
            marginBottom: '3rem',
          }}>
            Why MiM Makes Meeting Easy
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
          }}>
            {[
              { icon: '⚖️', title: 'Fair Journeys for Everyone', desc: 'No more situations where one person travels 5 minutes and another travels an hour. Everyone gets a balanced journey time.' },
              { icon: '🚌', title: 'Budget-Friendly Venues', desc: 'Filter venues by price level and find options that work for everyone\'s budget. Sustainable transport = money saved too.' },
              { icon: '🔒', title: 'Zero Tracking, No Location History', desc: 'We only use your location for the current meetup calculation. No tracking, no history, no surveillance.' },
            ].map((feature) => (
              <div key={feature.title} style={{
                background: 'linear-gradient(to bottom right, #f0fdfa, #cffafe)',
                borderRadius: '16px',
                padding: '2rem',
                border: '2px solid #99f6e4',
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{feature.icon}</div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '0.75rem',
                }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#374151' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UN SDG Section */}
      <section style={{
        padding: '5rem 2rem',
        background: 'linear-gradient(to bottom right, #f0fdfa, #cffafe)',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '3rem',
            border: '4px solid #5eead4',
            boxShadow: '0 20px 25px rgba(0,0,0,0.1)',
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '2rem' }}>🏙️</div>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '900',
              color: '#1f2937',
              marginBottom: '1.5rem',
            }}>
              Aligned with UN SDG 11
            </h2>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#14b8a6',
              marginBottom: '1.5rem',
            }}>
              Sustainable Cities and Communities
            </h3>
            <p style={{
              fontSize: '1.25rem',
              color: '#374151',
              lineHeight: '1.75',
              marginBottom: '2rem',
            }}>
              MiM directly supports <strong>Target 11.2</strong>: "By 2030, provide access to safe, affordable, accessible and sustainable transport systems for all, improving road safety, notably by expanding public transport."
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              textAlign: 'left',
            }}>
              {[
                { icon: '🚌', title: 'Promote Public Transport', desc: 'Makes Luas, bus, and cycling the default choice for Dublin meetups' },
                { icon: '📊', title: 'Measurable Impact', desc: 'Track CO₂ reduction and sustainable transport adoption with real data' },
                { icon: '🎯', title: 'Dublin Climate Action', desc: 'Supports Dublin City\'s 2030 climate neutrality goals' },
              ].map((item) => (
                <div key={item.title} style={{
                  background: 'linear-gradient(to bottom right, #f0fdfa, #cffafe)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '2px solid #99f6e4',
                }}>
                  <div style={{ fontSize: '1.875rem', marginBottom: '0.75rem' }}>{item.icon}</div>
                  <h4 style={{
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '0.5rem',
                  }}>
                    {item.title}
                  </h4>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Backed By Section */}
      <section style={{ padding: '5rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            color: '#1f2937',
            marginBottom: '1rem',
          }}>
            Backed By Ireland's Leading Innovation Programs
          </h2>
          <p style={{
            fontSize: '1.25rem',
            color: '#6b7280',
            marginBottom: '3rem',
          }}>
            Supported by Enterprise Ireland and Climate Ready Academy
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
          }}>
            {[
              { icon: '🚀', title: 'Enterprise Ireland', desc: 'New Frontiers Programme Phase 1' },
              { icon: '🎓', title: 'SETU Carlow', desc: 'Innovation & Entrepreneurship Support' },
              { icon: '🌱', title: 'Climate Ready Academy', desc: 'Skillnet Climate Action Programme' },
            ].map((org) => (
              <div key={org.title} style={{
                background: 'linear-gradient(to bottom right, #f0fdfa, #cffafe)',
                borderRadius: '16px',
                padding: '2rem',
                border: '2px solid #99f6e4',
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{org.icon}</div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '0.5rem',
                }}>
                  {org.title}
                </h3>
                <p style={{ color: '#6b7280' }}>{org.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Waitlist CTA */}
      <section id="join" style={{
        padding: '5rem 2rem',
        background: 'linear-gradient(135deg, #17a398 0%, #14b8a6 100%)',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: '900',
            color: 'white',
            marginBottom: '1.5rem',
          }}>
            Join Dublin's Sustainable Transport Revolution
          </h2>
          <p style={{
            fontSize: '1.5rem',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '3rem',
          }}>
            Be part of the movement reducing urban emissions, one fair meetup at a time.
          </p>
          
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '3rem',
            boxShadow: '0 20px 25px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '1.5rem',
            }}>
              Be the first to know when we launch in Q1 2026
            </h3>

            {status === 'success' ? (
              <div style={{
                background: '#d1fae5',
                color: '#065f46',
                padding: '1.5rem',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '1.125rem',
              }}>
                ✅ {message}
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{
                display: 'flex',
                gap: '1rem',
                maxWidth: '600px',
                margin: '0 auto',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    flex: '1',
                    minWidth: '250px',
                    padding: '1rem 1.5rem',
                    fontSize: '1rem',
                    borderRadius: '12px',
                    border: status === 'error' ? '2px solid #ef4444' : '2px solid #d1d5db',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  style={{
                    padding: '1rem 2.5rem',
                    background: status === 'loading' ? '#9ca3af' : 'linear-gradient(135deg, #17a398 0%, #14b8a6 100%)',
                    color: 'white',
                    fontSize: '1rem',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                    fontWeight: '700',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  }}
                >
                  {status === 'loading' ? 'Joining...' : 'Join the Waitlist'}
                </button>
              </form>
            )}
            
            {status === 'error' && (
              <p style={{
                marginTop: '1rem',
                color: '#ef4444',
                fontSize: '0.875rem',
              }}>
                {message}
              </p>
            )}
            
            <p style={{
              marginTop: '1.5rem',
              color: '#6b7280',
              fontSize: '0.875rem',
            }}>
              🌍 Join Dubliners committed to reducing the city's carbon footprint
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#111827',
        color: '#d1d5db',
        padding: '3rem 2rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
          }}>
            <span style={{ fontSize: '2.5rem' }}>🌍</span>
            <span style={{
              fontSize: '1.5rem',
              fontWeight: '900',
              color: 'white',
            }}>
              Meet in Middle
            </span>
          </div>
          <p style={{ marginBottom: '1.5rem' }}>
            Reducing Dublin's carbon footprint, one fair meetup at a time.
          </p>
          <p style={{
            fontSize: '0.875rem',
            color: '#9ca3af',
          }}>
            © 2025 CasaFlynn. Part of Enterprise Ireland New Frontiers Programme.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ComingSoonLandingPage;