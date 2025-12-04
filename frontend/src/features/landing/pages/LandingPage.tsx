import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  user: { id: number; email: string; name: string } | null;
  onLogout: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onOpenLogin,
  onOpenSignup,
  user,
  onLogout,
}) => {
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
          <div style={{ display: 'flex', gap: '1rem' }}>
            {user ? (
              <>
                <span style={{ color: 'white', alignSelf: 'center' }}>
                  Hi, {user.name}!
                </span>
                <button
                  onClick={onLogout}
                  style={{
                    padding: '0.6rem 1.5rem',
                    borderRadius: '8px',
                    border: '2px solid white',
                    background: 'transparent',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.color = '#14B8A6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'white';
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onOpenLogin}
                  style={{
                    padding: '0.6rem 1.5rem',
                    borderRadius: '8px',
                    border: '2px solid white',
                    background: 'transparent',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.color = '#14B8A6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'white';
                  }}
                >
                  Login
                </button>
                <button
                  onClick={onOpenSignup}
                  style={{
                    padding: '0.6rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'white',
                    color: '#14B8A6',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
                  }}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

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
          <button
            onClick={onGetStarted}
            style={{
              background: 'white',
              color: '#14B8A6',
              padding: '1rem 3rem',
              fontSize: '1.2rem',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
              transition: 'all 0.3s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(0,0,0,0.4)';
              e.currentTarget.style.background = '#FAF5F1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
              e.currentTarget.style.background = 'white';
            }}
          >
            ✨ Create Your First Meetup
          </button>
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
          Join Dublin's fairest way to meet up
        </p>
        <button
          onClick={onGetStarted}
          style={{
            background: 'white',
            color: '#14B8A6',
            padding: '1rem 3rem',
            fontSize: '1.2rem',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
            transition: 'all 0.3s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 12px 35px rgba(0,0,0,0.4)';
            e.currentTarget.style.background = '#FAF5F1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
            e.currentTarget.style.background = 'white';
          }}
        >
          ✨ Get Started Free
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

export default LandingPage;
