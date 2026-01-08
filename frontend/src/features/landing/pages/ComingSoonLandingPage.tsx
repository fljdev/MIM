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
            Fair Meetups.<br />
            Finally.
          </h1>
          
          <p style={{
            fontSize: '1.5rem',
            marginBottom: '2rem',
            color: '#374151',
            maxWidth: '900px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            MiM finds the perfect middle ground for your group. Check in to earn points. Unlock exclusive venue discounts. Everyone wins.
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

      {/* Problem vs Solution Section */}
      <section style={{ padding: '5rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '900',
              color: '#1f2937',
              marginBottom: '1rem',
            }}>
              Sound Familiar?
            </h2>
            <p style={{
              fontSize: '1.25rem',
              color: '#6b7280',
              maxWidth: '800px',
              margin: '0 auto',
            }}>
              We've all been stuck in the endless "where should we meet?" group chat. There's a better way.
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
                <p style={{ marginBottom: '1rem' }}>💬 12 messages in the group chat, still no decision</p>
                <p style={{ marginBottom: '1rem' }}>⏰ Someone always gets stuck with a 45-minute journey while others walk 5 minutes</p>
                <p style={{ marginBottom: '1rem' }}>😤 "Anywhere central works" doesn't actually work for anyone</p>
                <p>🤷 Eventually just pick Temple Bar because... Dublin?</p>
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
                <p style={{ marginBottom: '1rem' }}>🎯 Everyone inputs their location once</p>
                <p style={{ marginBottom: '1rem' }}>⚖️ MiM calculates fair meeting spots based on actual travel time (Luas, bus, cycling, walking)</p>
                <p style={{ marginBottom: '1rem' }}>☕ See venues with current promos, events, and specials</p>
                <p>✅ Decided in 2 minutes. Everyone's happy.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{
        padding: '5rem 2rem',
        background: 'linear-gradient(to bottom right, #f0fdfa, #cffafe)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: '900',
            color: '#1f2937',
            marginBottom: '1.5rem',
          }}>
            Here's How It Works
          </h2>
          <p style={{
            fontSize: '1.5rem',
            color: '#374151',
            marginBottom: '3rem',
            maxWidth: '800px',
            margin: '0 auto 3rem',
          }}>
            Dead simple. No app download required. Works on any device.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
          }}>
            {[
              {
                icon: '📍',
                step: 'Step 1',
                title: 'Share Your Locations',
                desc: 'Each person drops a pin where they\'re coming from. MiM calculates real travel times.',
              },
              {
                icon: '☕',
                step: 'Step 2',
                title: 'Pick Your Vibe',
                desc: 'Coffee? Drinks? Food? Filter by what you\'re in the mood for.',
              },
              {
                icon: '🎯',
                step: 'Step 3',
                title: 'Get Fair Suggestions',
                desc: 'MiM suggests venues that are genuinely fair for everyone - not just geographic "middle".',
              },
              {
                icon: '✨',
                step: 'Step 4',
                title: 'Choose Your Spot',
                desc: 'See current specials, events, and what makes each venue special. Support local.',
              },
              {
                icon: '📲',
                step: 'Step 5',
                title: 'Check In & Earn Points',
                desc: 'Check in at the venue via MiM. Every check-in earns you MiM Points.',
              },
              {
                icon: '💎',
                step: 'Step 6',
                title: 'Unlock Discounts',
                desc: 'Redeem your MiM Points for exclusive venue discounts and perks. The more you meet, the more you save.',
              },
            ].map((item) => (
              <div key={item.step} style={{
                background: 'white',
                borderRadius: '24px',
                padding: '2rem',
                border: '2px solid #99f6e4',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{item.icon}</div>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  color: '#14b8a6',
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {item.step}
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '900',
                  color: '#1f2937',
                  marginBottom: '1rem',
                }}>
                  {item.title}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why You'll Love MiM Section */}
      <section style={{ padding: '5rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: '900',
              color: '#1f2937',
              marginBottom: '1rem',
            }}>
              Why Your Group Will Love MiM
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
          }}>
            {[
              {
                icon: '⚖️',
                title: 'Fair for Everyone',
                desc: 'Based on actual travel time, not just distance. Nobody gets stuck with the 45-minute commute.',
              },
              {
                icon: '🚇',
                title: 'Works for Any Transport',
                desc: 'Walking, cycling, Luas, DART, bus, driving - everyone picks their own mode.',
              },
              {
                icon: '✨',
                title: 'Real-Time Venue Info',
                desc: 'See current promos, happy hours, events, and live music. Know before you go.',
              },
              {
                icon: '💎',
                title: 'Earn Rewards',
                desc: 'Check in at venues to earn MiM Points. Redeem for exclusive discounts and perks.',
              },
              {
                icon: '🎯',
                title: 'Discover Hidden Gems',
                desc: 'Find great local spots you\'ve never tried. Support Dublin\'s independent venues.',
              },
              {
                icon: '💬',
                title: 'No More Group Chat Chaos',
                desc: 'One link. Everyone inputs. Done in 2 minutes. No more "anyone? anyone?" messages.',
              },
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
                  fontWeight: '900',
                  color: '#1f2937',
                  marginBottom: '1rem',
                }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#374151', fontSize: '1.125rem' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perfect For Section */}
      <section style={{
        padding: '5rem 2rem',
        background: 'linear-gradient(to bottom right, #f0fdfa, #cffafe)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: '900',
              color: '#1f2937',
              marginBottom: '1rem',
            }}>
              Perfect For...
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
          }}>
            {[
              { icon: '👥', title: 'Friend Groups', desc: '"Let\'s meet for brunch" - sorted in 2 minutes' },
              { icon: '📚', title: 'Book Clubs', desc: 'Fair rotation of venues across Dublin' },
              { icon: '🏃', title: 'Running Clubs', desc: 'Post-run coffee that works for everyone' },
              { icon: '💼', title: 'Casual Work Meetings', desc: '"Let\'s grab coffee" - no email tennis' },
              { icon: '🎂', title: 'Celebrations', desc: 'Birthday drinks where everyone can actually make it' },
              { icon: '👨‍👩‍👧‍👦', title: 'Family Meetups', desc: 'Fair for all generations and mobilities' },
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

      {/* MiM Points Rewards Section */}
      <section style={{ padding: '5rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: '900',
              color: '#1f2937',
              marginBottom: '1rem',
            }}>
              💎 Earn MiM Points, Get Real Rewards
            </h2>
            <p style={{
              fontSize: '1.5rem',
              color: '#374151',
              maxWidth: '800px',
              margin: '0 auto',
            }}>
              The more you use MiM, the more you save. Check in at venues to earn points, redeem for exclusive discounts.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem',
          }}>
            <div style={{
              background: 'linear-gradient(to bottom right, #f0fdfa, #cffafe)',
              borderRadius: '24px',
              padding: '2rem',
              border: '2px solid #99f6e4',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📲</div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '900',
                color: '#1f2937',
                marginBottom: '1rem',
              }}>
                Check In to Earn
              </h3>
              <p style={{ color: '#374151', fontSize: '1.125rem' }}>
                When you arrive at a venue via MiM, check in with a tap. Each check-in earns you MiM Points automatically.
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(to bottom right, #f0fdfa, #cffafe)',
              borderRadius: '24px',
              padding: '2rem',
              border: '2px solid #99f6e4',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '900',
                color: '#1f2937',
                marginBottom: '1rem',
              }}>
                Redeem for Discounts
              </h3>
              <p style={{ color: '#374151', fontSize: '1.125rem' }}>
                Use your points for exclusive venue discounts - 10% off, free desserts, priority seating, and more.
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(to bottom right, #f0fdfa, #cffafe)',
              borderRadius: '24px',
              padding: '2rem',
              border: '2px solid #99f6e4',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎁</div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '900',
                color: '#1f2937',
                marginBottom: '1rem',
              }}>
                Unlock Perks
              </h3>
              <p style={{ color: '#374151', fontSize: '1.125rem' }}>
                Hit milestones to unlock VIP perks - early event access, exclusive promos, and surprise rewards.
              </p>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #17a398 0%, #14b8a6 100%)',
            borderRadius: '16px',
            padding: '2rem',
            textAlign: 'center',
            color: 'white',
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '1rem',
            }}>
              Free to Use. Rewards to Earn.
            </h3>
            <p style={{ fontSize: '1.125rem', opacity: 0.95 }}>
              MiM is 100% free for users. No subscription. No hidden fees. Just fair meetups and real rewards.
            </p>
          </div>
        </div>
      </section>

      {/* For Venues Section */}
      <section style={{ padding: '5rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, #17a398 0%, #14b8a6 100%)',
            borderRadius: '24px',
            padding: '4rem 2rem',
            color: 'white',
          }}>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: '900',
              marginBottom: '1.5rem',
            }}>
              Own a Café, Bar, or Restaurant?
            </h2>
            <p style={{
              fontSize: '1.5rem',
              marginBottom: '2rem',
              opacity: 0.95,
            }}>
              Get discovered by groups actively planning to meet right now. Only pay for verified new customers.
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
              textAlign: 'left',
              marginBottom: '2.5rem',
            }}>
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>Highlight specials & promos</div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎵</div>
                <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>Promote events & live music</div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📲</div>
                <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>Track real customer check-ins</div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>Pay per verified customer only</div>
              </div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '16px',
              padding: '2rem',
              marginBottom: '2rem',
              textAlign: 'left',
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '1rem',
              }}>
                How It Works for Venues:
              </h3>
              <div style={{ fontSize: '1.125rem', lineHeight: '1.8' }}>
                <p style={{ marginBottom: '0.75rem' }}>📍 Your venue appears in MiM's fair meetup suggestions</p>
                <p style={{ marginBottom: '0.75rem' }}>📲 Users check in via MiM when they arrive (earning them MiM Points)</p>
                <p style={{ marginBottom: '0.75rem' }}>💎 Users redeem points for your exclusive in-venue discounts</p>
                <p>📊 You only pay based on verified new customer check-ins - 100% trackable ROI</p>
              </div>
            </div>

            <button
              onClick={() => window.location.href = 'mailto:hello@mim.town?subject=Venue Partnership Inquiry'}
              style={{
                padding: '1.25rem 2.5rem',
                background: 'white',
                color: '#14b8a6',
                fontSize: '1.25rem',
                borderRadius: '12px',
                border: 'none',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 10px 15px rgba(0,0,0,0.2)',
              }}
            >
              Partner With MiM
            </button>
          </div>
        </div>
      </section>

      {/* Backed By Section */}
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
          
          <div style={{
            marginBottom: '1.5rem',
          }}>
            <a
              href="mailto:hello@mim.town"
              style={{
                color: '#14b8a6',
                textDecoration: 'none',
                fontSize: '1.125rem',
                fontWeight: '600',
              }}
            >
              hello@mim.town
            </a>
          </div>
          
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