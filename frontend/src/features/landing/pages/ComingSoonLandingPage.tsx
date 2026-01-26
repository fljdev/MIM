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
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {/* Logo Section - Centered */}
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
              📍
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
            Meet in the Middle.<br />
            Save Time, Money, Carbon.
          </h1>
          
          <p style={{
            fontSize: '1.5rem',
            marginBottom: '2rem',
            color: '#374151',
            maxWidth: '900px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Whose side of town? Nobody's. MiM finds the fairest middle ground for everyone. Less travel, less hassle, better meetups.
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
            📍 Join the Waitlist
          </button>
          
          <p style={{
            marginTop: '1.5rem',
            color: '#6b7280',
            fontSize: '1.125rem',
          }}>
            Launching 2026 • 100% Free Forever
          </p>
        </div>
      </section>

      {/* Values Badges Section */}
      <section style={{
        padding: '2rem',
        background: 'white',
        borderBottom: '2px solid #e5e7eb',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'center',
          gap: '3rem',
          flexWrap: 'wrap',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <div style={{
              fontSize: '2rem',
              background: 'linear-gradient(135deg, #f0fdfa 0%, #cffafe 100%)',
              padding: '0.75rem',
              borderRadius: '12px',
              border: '2px solid #99f6e4',
            }}>
              ⚖️
            </div>
            <div>
              <div style={{
                fontSize: '1rem',
                fontWeight: '700',
                color: '#1f2937',
              }}>
                Actually Fair
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
              }}>
                Real travel times for everyone
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <div style={{
              fontSize: '2rem',
              background: 'linear-gradient(135deg, #f0fdfa 0%, #cffafe 100%)',
              padding: '0.75rem',
              borderRadius: '12px',
              border: '2px solid #99f6e4',
            }}>
              🏳️‍🌈
            </div>
            <div>
              <div style={{
                fontSize: '1rem',
                fontWeight: '700',
                color: '#1f2937',
              }}>
                LGBTQ+ Friendly
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
              }}>
                Safe spaces & inclusivity
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <div style={{
              fontSize: '2rem',
              background: 'linear-gradient(135deg, #f0fdfa 0%, #cffafe 100%)',
              padding: '0.75rem',
              borderRadius: '12px',
              border: '2px solid #99f6e4',
            }}>
              🔒
            </div>
            <div>
              <div style={{
                fontSize: '1rem',
                fontWeight: '700',
                color: '#1f2937',
              }}>
                Privacy First
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
              }}>
                Your location stays private
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why It Matters Section */}
      <section style={{
        padding: '5rem 2rem',
        background: 'linear-gradient(to bottom right, #f0fdfa, #cffafe)',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            color: '#1f2937',
            marginBottom: '1.5rem',
          }}>
            Why Meeting in the Middle Matters
          </h2>
          <p style={{
            fontSize: '1.25rem',
            color: '#374151',
            marginBottom: '3rem',
            lineHeight: '1.7',
          }}>
            When everyone travels less, everyone wins. Shorter journeys mean less time wasted, lower costs, and yes—less environmental impact too. Fair for people, better for the planet.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
          }}>
            {[
              { icon: '⏱️', title: 'Save Time', desc: 'Less travel means more time actually meeting' },
              { icon: '💰', title: 'Save Money', desc: 'Shorter journeys = lower transport costs' },
              { icon: '🌱', title: 'Lower Impact', desc: 'Naturally reduce your carbon footprint' },
            ].map((item) => (
              <div key={item.title} style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                border: '2px solid #99f6e4',
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{item.icon}</div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '0.75rem',
                }}>
                  {item.title}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '1rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{
        padding: '5rem 2rem',
        background: 'white',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: '900',
            textAlign: 'center',
            marginBottom: '1rem',
            color: '#1f2937',
          }}>
            How MiM Works
          </h2>
          <p style={{
            textAlign: 'center',
            fontSize: '1.25rem',
            color: '#6b7280',
            marginBottom: '4rem',
            maxWidth: '800px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Fair meetups in three simple steps. No downloads. No complicated math. Just fairness.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '3rem',
          }}>
            {[
              {
                step: '1',
                icon: '👥',
                title: 'Create a Meetup',
                desc: 'Add your friends, pick your vibe: sustainable, LGBTQ+ friendly, accessible, or private.',
              },
              {
                step: '2',
                icon: '📍',
                title: 'Everyone Checks In',
                desc: 'Friends share their starting points. MiM calculates the fairest middle using real transport data.',
              },
              {
                step: '3',
                icon: '✨',
                title: 'Pick Your Spot & Earn',
                desc: 'Choose from top venues. Vote, check in, earn points. Unlock exclusive discounts.',
              },
            ].map((item) => (
              <div key={item.step} style={{
                textAlign: 'center',
                position: 'relative',
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #17a398 0%, #14b8a6 100%)',
                  color: 'white',
                  fontSize: '2rem',
                  fontWeight: '900',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  boxShadow: '0 10px 25px rgba(20, 184, 166, 0.3)',
                }}>
                  {item.step}
                </div>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem',
                }}>
                  {item.icon}
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '1rem',
                }}>
                  {item.title}
                </h3>
                <p style={{
                  color: '#6b7280',
                  fontSize: '1.125rem',
                  lineHeight: '1.7',
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '5rem 2rem',
        background: 'linear-gradient(to bottom right, #f0fdfa, #cffafe)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: '900',
            textAlign: 'center',
            marginBottom: '1rem',
            color: '#1f2937',
          }}>
            What Makes MiM Different
          </h2>
          <p style={{
            textAlign: 'center',
            fontSize: '1.25rem',
            color: '#6b7280',
            marginBottom: '4rem',
            maxWidth: '800px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Fair, fast, and rewarding—every time
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
          }}>
            {[
              {
                icon: '🎯',
                title: 'Real Travel Times',
                desc: 'Live Luas, bus, walking, and cycling data. Weather conditions. Real fairness.',
              },
              {
                icon: '🏆',
                title: 'Points & Rewards',
                desc: 'Earn points for every check-in. Unlock exclusive discounts at partner venues.',
              },
              {
                icon: '🔐',
                title: 'Total Privacy',
                desc: 'Your exact location stays private. MiM only calculates fair travel times.',
              },
              {
                icon: '🌍',
                title: 'Choose Your Mode',
                desc: 'Sustainable (public transport), Accessible, LGBTQ+ Friendly, or Private modes.',
              },
              {
                icon: '⚡',
                title: 'Lightning Fast',
                desc: 'No app downloads. No sign-ups required. Just click, share, and meet.',
              },
              {
                icon: '🎉',
                title: 'Real Dublin Venues',
                desc: 'Coffee shops, pubs, restaurants, and more—all verified and ready to welcome your group.',
              },
            ].map((feature) => (
              <div key={feature.title} style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                border: '2px solid #99f6e4',
                transition: 'transform 0.2s',
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{feature.icon}</div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '0.75rem',
                }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '1rem', lineHeight: '1.6' }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perfect For Section */}
      <section style={{
        padding: '5rem 2rem',
        background: 'white',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: '900',
            textAlign: 'center',
            marginBottom: '1rem',
            color: '#1f2937',
          }}>
            Perfect For
          </h2>
          <p style={{
            textAlign: 'center',
            fontSize: '1.25rem',
            color: '#6b7280',
            marginBottom: '4rem',
          }}>
            Any group. Any occasion. Always fair.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
          }}>
            {[
              { icon: '☕', title: 'Coffee Dates', desc: 'Find the fairest Third Space between home and work' },
              { icon: '🍺', title: 'After Work Drinks', desc: 'No more "your side of town" arguments' },
              { icon: '🤝', title: 'Client Meetings', desc: 'Show respect by meeting in the middle' },
              { icon: '👨‍👩‍👧‍👦', title: 'Family Gatherings', desc: 'Fair travel time for everyone across Dublin' },
              { icon: '🎂', title: 'Celebrations', desc: 'Birthday drinks where everyone can actually make it' },
              { icon: '📚', title: 'Book Clubs', desc: 'Fair rotation of venues across Dublin' },
            ].map((use) => (
              <div key={use.title} style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                border: '2px solid #99f6e4',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{use.icon}</div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '0.75rem',
                }}>
                  {use.title}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '1rem' }}>{use.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for Your City Section */}
      <section style={{
        padding: '5rem 2rem',
        background: 'linear-gradient(to bottom right, #f0fdfa, #cffafe)',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            color: '#1f2937',
            marginBottom: '1rem',
          }}>
            Built for Your City
          </h2>
          <p style={{
            fontSize: '1.25rem',
            color: '#6b7280',
            marginBottom: '3rem',
          }}>
            Starting in Dublin. Expanding to Cork, Galway, and beyond.<br />
            Supported by Enterprise Ireland's New Frontiers Programme
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
          }}>
            {[
              { icon: '🚀', title: 'Enterprise Ireland', desc: 'New Frontiers Programme Phase 1' },
              { icon: '🎓', title: 'SETU Carlow', desc: 'Innovation & Entrepreneurship Support' },
              { icon: '🌍', title: 'City-First Design', desc: 'Built to work with any city\'s transport infrastructure' },
            ].map((org) => (
              <div key={org.title} style={{
                background: 'white',
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
            Fair Meetups. Real Rewards.
          </h2>
          <p style={{
            fontSize: '1.5rem',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '3rem',
          }}>
            Be the first to know when MiM launches in 2026. Earn points, unlock discounts, meet in the middle.
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
              Join the waitlist - it's free!
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
              📍 Join Dubliners ready for fair meetups and real rewards
            </p>
          </div>
        </div>
      </section>

      {/* Venue Owner Link Section */}
      <section style={{
        padding: '2rem',
        textAlign: 'center',
        background: '#f0fdfa',
      }}>
        <p style={{
          fontSize: '0.875rem',
          color: '#6b7280',
        }}>
          Venue owner?{' '}
          <a
            href="/venues"
            style={{
              color: '#14b8a6',
              textDecoration: 'underline',
            }}
          >
            Learn more about partnerships →
          </a>
        </p>
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
            <span style={{ fontSize: '2.5rem' }}>📍</span>
            <span style={{
              fontSize: '1.5rem',
              fontWeight: '900',
              color: 'white',
            }}>
              Meet in Middle
            </span>
          </div>
          <p style={{ marginBottom: '1.5rem' }}>
            Fair meetups for everyone. Earn rewards along the way.
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