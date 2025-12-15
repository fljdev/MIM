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
      {/* Header with Logos */}
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
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          {/* Logo Section */}
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

          {/* Partner Logos */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            {/* Enterprise Ireland Logo */}
            <div style={{
              background: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <img 
                src="https://www.enterprise-ireland.com/images/default-source/header-images/ei_horizontal_logo_rgb.svg" 
                alt="Enterprise Ireland"
                style={{ height: '32px' }}
              />
            </div>

            {/* New Frontiers Logo */}
            <div style={{
              background: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <img 
                src="https://www.newfrontiers.ie/wp-content/uploads/2021/03/NF_Logo_Horizontal.png" 
                alt="New Frontiers"
                style={{ height: '32px' }}
              />
            </div>
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

          {/* SDG Badges */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1.5rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
          }}>
            {/* SDG 11 Badge */}
            <div style={{
              background: 'linear-gradient(135deg, #FF9B00 0%, #FD9D24 100%)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '1rem',
              boxShadow: '0 4px 6px rgba(255, 155, 0, 0.3)',
            }}>
              🏙️ UN SDG 11: Sustainable Cities
            </div>

            {/* SDG 13 Badge */}
            <div style={{
              background: 'linear-gradient(135deg, #3F7E44 0%, #48773C 100%)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '1rem',
              boxShadow: '0 4px 6px rgba(63, 126, 68, 0.3)',
            }}>
              🌍 UN SDG 13: Climate Action
            </div>
          </div>

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
            Launching 2026
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

      {/* Carbon Karma Feature Section - NEW */}
      <section style={{
        padding: '5rem 2rem',
        background: 'linear-gradient(135deg, #3F7E44 0%, #48773C 100%)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: '900',
            color: 'white',
            marginBottom: '1.5rem',
          }}>
            ✨ Introducing Carbon Karma
          </h2>
          <p style={{
            fontSize: '1.5rem',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '3rem',
            maxWidth: '800px',
            margin: '0 auto 3rem',
          }}>
            See the real impact of your sustainable choices. Every fair meetup earns you Carbon Karma - track your CO₂ savings and unlock badges for consistent sustainable transport use.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            marginTop: '3rem',
          }}>
            {/* Monthly Savings */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: '20px',
              padding: '2rem',
              color: 'white',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                Monthly CO₂ Savings
              </h3>
              <p style={{ fontSize: '1rem', opacity: 0.9 }}>
                Track your carbon footprint reduction each month
              </p>
            </div>

            {/* Achievement Badges */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: '20px',
              padding: '2rem',
              color: 'white',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                Sustainability Badges
              </h3>
              <p style={{ fontSize: '1rem', opacity: 0.9 }}>
                Earn badges for consistent green transport choices
              </p>
            </div>

            {/* Impact Leaderboard */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: '20px',
              padding: '2rem',
              color: 'white',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌟</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                Community Impact
              </h3>
              <p style={{ fontSize: '1rem', opacity: 0.9 }}>
                See Dublin's collective carbon reduction in real-time
              </p>
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '16px',
            padding: '2rem',
            marginTop: '3rem',
            border: '2px solid rgba(255,255,255,0.3)',
          }}>
            <p style={{
              fontSize: '1.25rem',
              color: 'white',
              fontWeight: '600',
              marginBottom: '1rem',
            }}>
              🎯 Example Impact
            </p>
            <p style={{
              fontSize: '1.125rem',
              color: 'rgba(255,255,255,0.95)',
            }}>
              If you prevent just 2 unnecessary car journeys per month (10km each), you'll save approximately <strong>4.8kg of CO₂</strong> - that's <strong>57.6kg per year</strong>, equivalent to planting 3 trees annually!
            </p>
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
              { num: '1', icon: '📍', title: 'Enter Locations', desc: 'Everyone adds their starting point in Dublin' },
              { num: '2', icon: '🚇', title: 'Choose Transport Mode', desc: 'Each person selects: Luas, Bus, Cycling, Walking, or Driving' },
              { num: '3', icon: '🎯', title: 'Find Fair Midpoint', desc: 'MiM calculates the optimal location using real Dublin transport data' },
              { num: '4', icon: '🌱', title: 'Earn Carbon Karma', desc: 'Track your CO₂ savings and build your sustainability profile' },
            ].map((step) => (
              <div key={step.num} style={{
                background: 'white',
                borderRadius: '20px',
                padding: '2rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                textAlign: 'center',
                border: '2px solid #99f6e4',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #17a398 0%, #14b8a6 100%)',
                  color: 'white',
                  fontWeight: '900',
                  fontSize: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}>
                  {step.num}
                </div>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{step.icon}</div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '0.5rem',
                }}>
                  {step.title}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '1rem' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact on Dublin Section */}
      <section style={{ padding: '5rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '900',
              color: '#1f2937',
              marginBottom: '1rem',
            }}>
              Our Impact on Dublin's Climate Goals
            </h2>
            <p style={{
              fontSize: '1.25rem',
              color: '#6b7280',
              maxWidth: '800px',
              margin: '0 auto',
            }}>
              Aligned with Dublin City Council's EarthCheck Programme and Tourism Strategy 2023-2028
            </p>
          </div>

          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
            }}>
              {[
                { icon: '🚌', title: 'Promote Public Transport', desc: 'Makes Luas, bus, and cycling the default choice for Dublin meetups' },
                { icon: '📊', title: 'Measurable Impact', desc: 'Track CO₂ reduction and sustainable transport adoption with real data' },
                { icon: '🎯', title: 'Dublin Climate Action', desc: 'Supports Dublin City\'s 2030 climate neutrality goals and UN SDG commitments' },
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
            Supported by Enterprise Ireland New Frontiers Programme
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
          }}>
            {[
              { title: 'Enterprise Ireland', desc: 'New Frontiers Programme Phase 1', logo: '🚀' },
              { title: 'SETU Carlow', desc: 'Innovation & Entrepreneurship Support', logo: '🎓' },
              { title: 'Dublin City Council', desc: 'EarthCheck Sustainable Destinations Partner', logo: '🌱' },
            ].map((org) => (
              <div key={org.title} style={{
                background: 'linear-gradient(to bottom right, #f0fdfa, #cffafe)',
                borderRadius: '16px',
                padding: '2rem',
                border: '2px solid #99f6e4',
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{org.logo}</div>
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
              Be the first to know when we launch in 2026
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
          <p style={{ marginBottom: '1rem' }}>
            Reducing Dublin's carbon footprint, one fair meetup at a time.
          </p>
          <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Aligned with UN SDG 11 (Sustainable Cities) & SDG 13 (Climate Action)
          </p>
          <p style={{
            fontSize: '0.875rem',
            color: '#9ca3af',
          }}>
            © 2025 CasaFlynn Ltd. Enterprise Ireland New Frontiers Programme Phase 1.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ComingSoonLandingPage;