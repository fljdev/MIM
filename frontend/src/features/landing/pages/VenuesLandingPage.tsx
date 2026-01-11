import React from 'react';

// Design Tokens
const colors = {
  tealGradient: 'linear-gradient(135deg, #17a398 0%, #14b8a6 100%)',
  lightCyan: '#f0fdfa',
  lightCyanAlt: '#cffafe',
  border: '#99f6e4',
  textDark: '#1f2937',
  textLight: '#6b7280',
  white: '#ffffff',
};

export default function VenuesLandingPage() {
  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
        lineHeight: '1.6',
        color: colors.textDark,
      }}
    >
      {/* Hero Section */}
      <section
        style={{
          background: colors.tealGradient,
          color: colors.white,
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '4rem 2rem',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            lineHeight: '1.2',
          }}
        >
          Get Discovered By Groups Planning Meetups Right Now
        </h1>
        <h2
          style={{
            fontSize: '24px',
            marginBottom: '2rem',
            fontWeight: '400',
            lineHeight: '1.4',
          }}
        >
          Connect with customers actively choosing where to go. Pay only for verified visits. No upfront costs.
        </h2>
        <button
          onClick={scrollToPricing}
          style={{
            padding: '1rem 2.5rem',
            background: colors.white,
            color: '#14b8a6',
            fontSize: '1.125rem',
            borderRadius: '12px',
            border: 'none',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
          }}
        >
          See How It Works ↓
        </button>
      </section>

      {/* Problem Section */}
      <section
        style={{
          background: colors.white,
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '4rem 2rem',
        }}
      >
        <h2
          style={{
            fontSize: '36px',
            fontWeight: 'bold',
            marginBottom: '2rem',
            textAlign: 'center',
          }}
        >
          Getting New Customers Shouldn't Be a Guessing Game
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
          }}
        >
          <div
            style={{
              background: colors.lightCyan,
              border: `2px solid ${colors.border}`,
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📱</div>
            <p style={{ fontSize: '1.125rem', color: colors.textDark }}>
              You post on Instagram hoping someone sees it
            </p>
          </div>
          <div
            style={{
              background: colors.lightCyan,
              border: `2px solid ${colors.border}`,
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💸</div>
            <p style={{ fontSize: '1.125rem', color: colors.textDark }}>
              You pay for ads with unclear ROI
            </p>
          </div>
          <div
            style={{
              background: colors.lightCyan,
              border: `2px solid ${colors.border}`,
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📅</div>
            <p style={{ fontSize: '1.125rem', color: colors.textDark }}>
              Group bookings are unpredictable
            </p>
          </div>
        </div>
      </section>

      {/* Value Props Section */}
      <section
        style={{
          background: colors.lightCyan,
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '4rem 2rem',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
          }}
        >
          <div
            style={{
              background: colors.white,
              border: `2px solid ${colors.border}`,
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
            <h3
              style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '1rem',
                color: colors.textDark,
              }}
            >
              100% Trackable ROI
            </h3>
            <p style={{ fontSize: '1.125rem', color: colors.textLight }}>
              Every customer who visits through MiM is verified and attributed. You know exactly what you're paying for.
            </p>
          </div>
          <div
            style={{
              background: colors.white,
              border: `2px solid ${colors.border}`,
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💰</div>
            <h3
              style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '1rem',
                color: colors.textDark,
              }}
            >
              Performance-Based Pricing
            </h3>
            <p style={{ fontSize: '1.125rem', color: colors.textLight }}>
              Pay per check-in, not per impression. No customers, no cost. Simple.
            </p>
          </div>
          <div
            style={{
              background: colors.white,
              border: `2px solid ${colors.border}`,
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎯</div>
            <h3
              style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '1rem',
                color: colors.textDark,
              }}
            >
              Active Intent
            </h3>
            <p style={{ fontSize: '1.125rem', color: colors.textLight }}>
              These aren't random impressions. These are groups actively deciding where to meet right now.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        style={{
          background: colors.white,
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '4rem 2rem',
        }}
      >
        <h2
          style={{
            fontSize: '36px',
            fontWeight: 'bold',
            marginBottom: '3rem',
            textAlign: 'center',
          }}
        >
          How It Works
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
          }}
        >
          {[
            {
              icon: '📝',
              title: 'List Your Venue (Free)',
              description: 'Create your profile. Add photos, location, basic details. No cost to be on the platform.',
            },
            {
              icon: '✨',
              title: 'Highlight What Makes You Special',
              description: 'Post your happy hours, quiz nights, live music, vegan menu, LGBTQ+ friendly status. Keep it updated.',
            },
            {
              icon: '🔍',
              title: 'Get Discovered',
              description: 'When groups coordinate meetups, MiM suggests venues based on travel fairness. You appear when you\'re actually convenient.',
            },
            {
              icon: '💳',
              title: 'Track & Pay for Results',
              description: 'Customers check in via MiM. You see verified visits in your dashboard. Pay only for those check-ins.',
            },
          ].map((step, index) => (
            <div
              key={index}
              style={{
                background: colors.lightCyan,
                border: `2px solid ${colors.border}`,
                borderRadius: '12px',
                padding: '2rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{step.icon}</div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  marginBottom: '1rem',
                  color: colors.textDark,
                }}
              >
                {step.title}
              </h3>
              <p style={{ fontSize: '1rem', color: colors.textLight }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        style={{
          background: colors.lightCyan,
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '4rem 2rem',
        }}
      >
        <h2
          style={{
            fontSize: '36px',
            fontWeight: 'bold',
            marginBottom: '3rem',
            textAlign: 'center',
          }}
        >
          Simple, Performance-Based Pricing
        </h2>
        
        {/* Pricing Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem',
          }}
        >
          {/* Free Tier */}
          <div
            style={{
              background: colors.white,
              border: `2px solid ${colors.border}`,
              borderRadius: '12px',
              padding: '2rem',
            }}
          >
            <h3
              style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '0.5rem',
                color: colors.textDark,
              }}
            >
              Free
            </h3>
            <div
              style={{
                fontSize: '2.5rem',
                fontWeight: '900',
                marginBottom: '1.5rem',
                color: colors.textDark,
              }}
            >
              €0<span style={{ fontSize: '1rem', fontWeight: '400' }}>/month</span>
            </div>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '1.5rem',
                fontSize: '1rem',
                color: colors.textLight,
              }}
            >
              <li style={{ marginBottom: '0.75rem' }}>✓ Up to 20 check-ins/month</li>
              <li style={{ marginBottom: '0.75rem' }}>✓ Basic venue listing</li>
              <li style={{ marginBottom: '0.75rem' }}>✓ Add promos & events</li>
              <li style={{ marginBottom: '0.75rem' }}>✓ Dashboard access</li>
            </ul>
            <p
              style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: colors.textDark,
              }}
            >
              Best for: Testing the platform
            </p>
          </div>

          {/* Growth Tier - MOST POPULAR */}
          <div
            style={{
              background: colors.white,
              border: '3px solid #14b8a6',
              borderRadius: '12px',
              padding: '2rem',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#14b8a6',
                color: colors.white,
                padding: '0.5rem 1.5rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '700',
                letterSpacing: '0.05em',
              }}
            >
              MOST POPULAR
            </div>
            <h3
              style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '0.5rem',
                marginTop: '1rem',
                color: colors.textDark,
              }}
            >
              Growth
            </h3>
            <div
              style={{
                fontSize: '2.5rem',
                fontWeight: '900',
                marginBottom: '1.5rem',
                color: colors.textDark,
              }}
            >
              €29<span style={{ fontSize: '1rem', fontWeight: '400' }}>/month</span>
            </div>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '1.5rem',
                fontSize: '1rem',
                color: colors.textLight,
              }}
            >
              <li style={{ marginBottom: '0.75rem' }}>✓ Up to 100 check-ins/month</li>
              <li style={{ marginBottom: '0.75rem' }}>✓ Everything in Free</li>
              <li style={{ marginBottom: '0.75rem' }}>✓ Analytics dashboard</li>
              <li style={{ marginBottom: '0.75rem' }}>✓ LGBTQ+ friendly badge</li>
              <li style={{ marginBottom: '0.75rem' }}>✓ Priority support</li>
            </ul>
            <p
              style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: colors.textDark,
              }}
            >
              Best for: Active venues
            </p>
          </div>

          {/* Pro Tier */}
          <div
            style={{
              background: colors.white,
              border: `2px solid ${colors.border}`,
              borderRadius: '12px',
              padding: '2rem',
            }}
          >
            <h3
              style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '0.5rem',
                color: colors.textDark,
              }}
            >
              Pro
            </h3>
            <div
              style={{
                fontSize: '2.5rem',
                fontWeight: '900',
                marginBottom: '1.5rem',
                color: colors.textDark,
              }}
            >
              €79<span style={{ fontSize: '1rem', fontWeight: '400' }}>/month</span>
            </div>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '1.5rem',
                fontSize: '1rem',
                color: colors.textLight,
              }}
            >
              <li style={{ marginBottom: '0.75rem' }}>✓ Up to 300 check-ins/month</li>
              <li style={{ marginBottom: '0.75rem' }}>✓ Everything in Growth</li>
              <li style={{ marginBottom: '0.75rem' }}>✓ Featured placement in app</li>
              <li style={{ marginBottom: '0.75rem' }}>✓ Dedicated account manager</li>
              <li style={{ marginBottom: '0.75rem' }}>✓ Early access to new features</li>
            </ul>
            <p
              style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: colors.textDark,
              }}
            >
              Best for: High-traffic venues
            </p>
          </div>
        </div>

        {/* Pay-As-You-Go Option */}
        <div
          style={{
            background: colors.lightCyan,
            border: `2px solid ${colors.border}`,
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            marginBottom: '3rem',
          }}
        >
          <p style={{ fontSize: '1.125rem', color: colors.textDark, fontWeight: '600' }}>
            OR Pay-As-You-Go: €0.50 per verified check-in, no monthly fee. Perfect for seasonal venues or testing.
          </p>
        </div>

        {/* ROI Comparison Box */}
        <div
          style={{
            background: colors.white,
            border: '3px solid #14b8a6',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '800px',
            margin: '0 auto',
          }}
        >
          <h3
            style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              marginBottom: '2rem',
              textAlign: 'center',
              color: colors.textDark,
            }}
          >
            Replace Your Existing Marketing Spend
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
              marginBottom: '1.5rem',
            }}
          >
            {/* LEFT COLUMN - Current Costs */}
            <div>
              <h4
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  marginBottom: '1rem',
                  color: colors.textDark,
                }}
              >
                Current Costs (Monthly):
              </h4>
              <div style={{ fontSize: '1rem', color: colors.textLight, lineHeight: '1.8' }}>
                <p style={{ marginBottom: '0.5rem' }}>❌ Instagram ads: €300-500 (unclear results)</p>
                <p style={{ marginBottom: '0.5rem' }}>❌ Google ads: €200-400 (clicks, not customers)</p>
                <p style={{ marginBottom: '0.5rem' }}>❌ Flyers/posters: €100-200 (impossible to track)</p>
                <hr style={{ border: 'none', borderTop: '2px solid #e5e7eb', margin: '1rem 0' }} />
                <p style={{ fontWeight: '700', color: colors.textDark }}>Total: €600-1,100/month</p>
              </div>
            </div>

            {/* RIGHT COLUMN - MiM */}
            <div>
              <h4
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  marginBottom: '1rem',
                  color: colors.textDark,
                }}
              >
                MiM:
              </h4>
              <div style={{ fontSize: '1rem', color: colors.textLight, lineHeight: '1.8' }}>
                <p style={{ marginBottom: '0.5rem' }}>✅ €29/month for 100 verified customers</p>
                <p style={{ marginBottom: '0.5rem' }}>✅ 100% trackable attribution</p>
                <p style={{ marginBottom: '0.5rem' }}>✅ Pay only for people who actually show up</p>
                <p style={{ marginBottom: '0.5rem' }}>✅ Cancel anytime, no contracts</p>
                <hr style={{ border: 'none', borderTop: '2px solid #e5e7eb', margin: '1rem 0' }} />
                <p style={{ fontWeight: '700', color: colors.textDark }}>Savings: €570-1,070/month</p>
              </div>
            </div>
          </div>
          <p
            style={{
              fontSize: '1.125rem',
              fontWeight: '700',
              color: '#14b8a6',
              textAlign: 'center',
            }}
          >
            Stop guessing if your marketing works. See exactly who MiM brings you.
          </p>
        </div>
      </section>

      {/* Features Grid Section */}
      <section
        style={{
          background: colors.white,
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '4rem 2rem',
        }}
      >
        <h2
          style={{
            fontSize: '36px',
            fontWeight: 'bold',
            marginBottom: '3rem',
            textAlign: 'center',
          }}
        >
          What You Can Highlight
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {[
            { icon: '✅', text: 'Current specials & promos' },
            { icon: '🎵', text: 'Events & live music' },
            { icon: '🏳️‍🌈', text: 'LGBTQ+ friendly spaces' },
            { icon: '📊', text: 'Real-time capacity status' },
            { icon: '🌱', text: 'Dietary options (vegan, halal, gluten-free)' },
            { icon: '📲', text: 'Direct booking integration (coming soon)' },
          ].map((feature, index) => (
            <div
              key={index}
              style={{
                background: colors.lightCyan,
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div style={{ fontSize: '2rem' }}>{feature.icon}</div>
              <p style={{ fontSize: '1.125rem', fontWeight: '700', color: colors.textDark }}>
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section
        style={{
          background: colors.lightCyan,
          maxWidth: '800px',
          margin: '0 auto',
          padding: '4rem 2rem',
        }}
      >
        <h2
          style={{
            fontSize: '36px',
            fontWeight: 'bold',
            marginBottom: '2rem',
            textAlign: 'center',
          }}
        >
          Frequently Asked Questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            {
              question: 'How do you verify check-ins?',
              answer: 'Users check in via the MiM app at your venue. GPS + manual verification. No gaming the system.',
            },
            {
              question: 'What if I don\'t get any customers?',
              answer: 'You don\'t pay. Performance-based pricing means zero risk.',
            },
            {
              question: 'Can I cancel anytime?',
              answer: 'Yes. Month-to-month, no long-term contracts.',
            },
            {
              question: 'Do customers see my pricing tier?',
              answer: 'No. All venues appear equal in search. Pricing only affects your dashboard features and check-in limits.',
            },
            {
              question: 'What about MiM Points and discounts?',
              answer: 'MiM Points are earned across all venues. You choose if/how customers redeem them at your venue (future feature).',
            },
          ].map((faq, index) => (
            <details
              key={index}
              style={{
                background: colors.white,
                borderRadius: '12px',
                padding: '1.5rem',
                cursor: 'pointer',
                border: `1px solid ${colors.border}`,
              }}
            >
              <summary
                style={{
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  color: colors.textDark,
                  cursor: 'pointer',
                }}
              >
                {faq.question}
              </summary>
              <p
                style={{
                  marginTop: '1rem',
                  fontSize: '1rem',
                  color: colors.textLight,
                  lineHeight: '1.6',
                }}
              >
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA Section */}
      <section
        style={{
          background: colors.tealGradient,
          color: colors.white,
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '4rem 2rem',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: '36px',
            fontWeight: 'bold',
            marginBottom: '1rem',
          }}
        >
          Ready to Get Started?
        </h2>
        <h3
          style={{
            fontSize: '24px',
            fontWeight: '400',
            marginBottom: '2rem',
          }}
        >
          Join Dublin venues getting discovered by groups planning meetups right now.
        </h3>
        <a
          href="https://form.jotform.com/253327911890360"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '1.25rem 2.5rem',
            background: colors.white,
            color: '#14b8a6',
            fontSize: '1.25rem',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: '700',
            boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
            marginBottom: '1.5rem',
          }}
        >
          Fill Out Quick Survey (5 mins)
        </a>
        <div style={{ marginBottom: '1.5rem' }}>
          <a
            href="mailto:jlflynn@mimtown.com"
            style={{
              color: colors.white,
              fontSize: '1.125rem',
              textDecoration: 'underline',
            }}
          >
            Or email us: jlflynn@mimtown.com
          </a>
        </div>
        <p
          style={{
            fontSize: '0.875rem',
            opacity: 0.9,
          }}
        >
          We're working with a limited number of venues during our pilot phase. Apply now to secure your spot.
        </p>
      </section>

      {/* Footer */}
      <footer
        style={{
          background: colors.textDark,
          color: '#9ca3af',
          padding: '2rem',
          textAlign: 'center',
          fontSize: '0.875rem',
        }}
      >
        <p style={{ marginBottom: '0.5rem' }}>
          © 2025 CasaFlynn Ltd. Enterprise Ireland New Frontiers Programme Phase 1.
        </p>
        <a
          href="https://mim.town/app"
          style={{
            color: '#14b8a6',
            textDecoration: 'none',
          }}
        >
          For users: mim.town/app
        </a>
      </footer>
    </div>
  );
}
