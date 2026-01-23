import React from 'react';

// Design Tokens
const colors = {
  tealGradient: 'linear-gradient(135deg, #17a398 0%, #14b8a6 100%)',
  greenGradient: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
  lightCyan: '#f0fdfa',
  lightCyanAlt: '#cffafe',
  lightGreen: '#ecfdf5',
  border: '#99f6e4',
  greenBorder: '#6ee7b7',
  textDark: '#1f2937',
  textLight: '#6b7280',
  greenText: '#047857',
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
          Get Discovered By Eco-Conscious Groups Planning Meetups Right Now
        </h1>
        <h2
          style={{
            fontSize: '24px',
            marginBottom: '2rem',
            fontWeight: '400',
            lineHeight: '1.4',
          }}
        >
          Connect with sustainable customers actively choosing where to go. Boost your ESG credentials with verified carbon reduction data. Pay only for visits.
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

      {/* ESG & Sustainability Benefits Section - NEW */}
      <section
        style={{
          background: colors.greenGradient,
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '4rem 2rem',
        }}
      >
        <h2
          style={{
            fontSize: '36px',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            textAlign: 'center',
            color: colors.textDark,
          }}
        >
          🌱 Strengthen Your Sustainability Profile
        </h2>
        <p
          style={{
            fontSize: '1.25rem',
            marginBottom: '3rem',
            textAlign: 'center',
            color: colors.textLight,
            maxWidth: '900px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          MiM customers travel by public transport, bike, or on foot—95%+ lower emissions than car travel. Every visit to your venue through MiM generates verified carbon reduction data for your ESG reporting.
        </p>
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
              border: `3px solid ${colors.greenBorder}`,
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📊</div>
            <h3
              style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '1rem',
                color: colors.textDark,
              }}
            >
              Verified Carbon Data
            </h3>
            <p style={{ fontSize: '1.125rem', color: colors.textLight, lineHeight: '1.6' }}>
              Get detailed carbon reduction metrics from every MiM visit. Export data for your annual sustainability reports, ESG frameworks, and climate compliance requirements.
            </p>
          </div>
          <div
            style={{
              background: colors.white,
              border: `3px solid ${colors.greenBorder}`,
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎯</div>
            <h3
              style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '1rem',
                color: colors.textDark,
              }}
            >
              UN SDG Alignment
            </h3>
            <p style={{ fontSize: '1.125rem', color: colors.textLight, lineHeight: '1.6' }}>
              Being on MiM aligns your venue with UN Sustainable Development Goals 11 (Sustainable Cities) and 13 (Climate Action). Perfect for grant applications and corporate partnerships.
            </p>
          </div>
          <div
            style={{
              background: colors.white,
              border: `3px solid ${colors.greenBorder}`,
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏛️</div>
            <h3
              style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '1rem',
                color: colors.textDark,
              }}
            >
              Dublin Climate Action
            </h3>
            <p style={{ fontSize: '1.125rem', color: colors.textLight, lineHeight: '1.6' }}>
              Support Dublin City Council's Climate Action Plan by promoting sustainable transport. Show your commitment to local climate goals with real data.
            </p>
          </div>
        </div>

        {/* ESG Reporting Callout */}
        <div
          style={{
            background: colors.white,
            border: `3px solid ${colors.greenBorder}`,
            borderRadius: '20px',
            padding: '2.5rem',
            marginTop: '2rem',
            textAlign: 'center',
          }}
        >
          <h3
            style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: colors.textDark,
              marginBottom: '1rem',
            }}
          >
            ESG Reporting Made Easy
          </h3>
          <p
            style={{
              fontSize: '1.125rem',
              color: colors.textLight,
              marginBottom: '1.5rem',
              maxWidth: '800px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: '1.7',
            }}
          >
            Every MiM customer visit generates quantifiable carbon reduction data that you can include in your Scope 3 emissions reporting, B Corp certification, and sustainability statements.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {['ESG Frameworks', 'B Corp Certification', 'GRI Standards', 'CSRD Compliance'].map((item) => (
              <div
                key={item}
                style={{
                  background: colors.greenGradient,
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  border: `2px solid ${colors.greenBorder}`,
                  fontWeight: '700',
                  color: colors.greenText,
                  fontSize: '1rem',
                }}
              >
                ✓ {item}
              </div>
            ))}
          </div>
        </div>
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
              Organic reach on social media keeps declining
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
              Ad spend doesn't guarantee customers walk through the door
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
              Group bookings are hard to predict and track
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
              Every customer who visits through MiM is verified and attributed. You know exactly what you're paying for—plus bonus carbon data for your reports.
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
              Sustainable, Active Intent
            </h3>
            <p style={{ fontSize: '1.125rem', color: colors.textLight }}>
              These aren't random impressions. These are eco-conscious groups actively deciding where to meet right now using sustainable transport.
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '3rem',
          }}
        >
          {[
            {
              step: '1',
              icon: '🏢',
              title: 'Claim Your Listing',
              desc: 'Already on the map. Free verification. Add photos, hours, specials.',
            },
            {
              step: '2',
              icon: '🎯',
              title: 'Groups Discover You',
              desc: 'MiM recommends your venue to groups meeting in your area via sustainable transport.',
            },
            {
              step: '3',
              icon: '✅',
              title: 'Customers Check In',
              desc: 'Groups choose your venue, visit, check in. You get verified foot traffic + carbon data.',
            },
            {
              step: '4',
              icon: '📈',
              title: 'Track Everything',
              desc: 'Dashboard shows visits, revenue attribution, and carbon reduction metrics for ESG reporting.',
            },
          ].map((item) => (
            <div key={item.step} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: colors.tealGradient,
                  color: colors.white,
                  fontSize: '1.5rem',
                  fontWeight: '900',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}
              >
                {item.step}
              </div>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{item.icon}</div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: colors.textDark,
                  marginBottom: '0.75rem',
                }}
              >
                {item.title}
              </h3>
              <p style={{ fontSize: '1.125rem', color: colors.textLight }}>
                {item.desc}
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
            marginBottom: '2rem',
            textAlign: 'center',
          }}
        >
          Transparent Pricing
        </h2>
        <p
          style={{
            fontSize: '1.25rem',
            color: colors.textLight,
            textAlign: 'center',
            marginBottom: '3rem',
          }}
        >
          Choose the plan that fits your business. Cancel anytime.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem',
          }}
        >
          {[
            {
              name: 'Starter',
              price: '€19/month',
              checkins: 'Up to 200 check-ins/month',
              features: ['Basic listing', 'Performance dashboard', 'Carbon reduction data', 'Email support'],
            },
            {
              name: 'Growth',
              price: '€49/month',
              checkins: 'Up to 600 check-ins/month',
              features: ['Priority listing', 'Advanced analytics', 'Detailed ESG metrics', 'Priority support'],
              popular: true,
            },
            {
              name: 'Premium',
              price: '€99/month',
              checkins: 'Up to 1,500 check-ins/month',
              features: ['Featured placement', 'API access', 'Full ESG reporting suite', 'Dedicated account manager'],
            },
          ].map((tier) => (
            <div
              key={tier.name}
              style={{
                background: colors.white,
                border: tier.popular ? `3px solid ${colors.greenBorder}` : `2px solid ${colors.border}`,
                borderRadius: '16px',
                padding: '2.5rem',
                position: 'relative',
                boxShadow: tier.popular ? '0 10px 20px rgba(0,0,0,0.15)' : '0 4px 6px rgba(0,0,0,0.1)',
              }}
            >
              {tier.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: colors.greenGradient,
                    padding: '0.5rem 1.5rem',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    color: colors.greenText,
                    border: `2px solid ${colors.greenBorder}`,
                  }}
                >
                  🌱 Most Popular
                </div>
              )}
              <h3
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: colors.textDark,
                  marginBottom: '0.5rem',
                }}
              >
                {tier.name}
              </h3>
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: '900',
                  color: '#14b8a6',
                  marginBottom: '0.5rem',
                }}
              >
                {tier.price}
              </div>
              <p
                style={{
                  fontSize: '1rem',
                  color: colors.textLight,
                  marginBottom: '1.5rem',
                }}
              >
                {tier.checkins}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                {tier.features.map((feature, idx) => (
                  <li
                    key={idx}
                    style={{
                      fontSize: '1rem',
                      color: colors.textDark,
                      marginBottom: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span style={{ color: '#14b8a6', fontWeight: '700' }}>✓</span> {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Pricing Comparison */}
        <div style={{ marginBottom: '3rem' }}>
          <h3
            style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '2rem',
              textAlign: 'center',
              color: colors.textDark,
            }}
          >
            Compare to Traditional Marketing
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
            }}
          >
            <div
              style={{
                background: colors.white,
                borderRadius: '12px',
                padding: '2rem',
                border: `2px solid ${colors.border}`,
              }}
            >
              <h4
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  marginBottom: '1rem',
                  color: colors.textDark,
                }}
              >
                Instagram/Facebook Ads:
              </h4>
              <div style={{ fontSize: '1rem', color: colors.textLight, lineHeight: '1.8' }}>
                <p style={{ marginBottom: '0.5rem' }}>💸 €500-1,000/month for 20,000 impressions</p>
                <p style={{ marginBottom: '0.5rem' }}>❓ 1-2% typical conversion to actual visits (200-400 customers)</p>
                <p style={{ marginBottom: '0.5rem' }}>❌ Most arrive by car (high carbon footprint)</p>
                <p style={{ marginBottom: '0.5rem' }}>❌ Impossible to verify actual visits</p>
                <p style={{ marginBottom: '0.5rem' }}>❌ No ESG data for reporting</p>
              </div>
            </div>
            <div
              style={{
                background: colors.white,
                borderRadius: '12px',
                padding: '2rem',
                border: `3px solid ${colors.greenBorder}`,
              }}
            >
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
                <p style={{ marginBottom: '0.5rem' }}>✅ €19/month for 200 verified customers</p>
                <p style={{ marginBottom: '0.5rem' }}>✅ 100% trackable attribution</p>
                <p style={{ marginBottom: '0.5rem' }}>✅ 95%+ arrive via sustainable transport</p>
                <p style={{ marginBottom: '0.5rem' }}>✅ Verified carbon reduction data for ESG</p>
                <p style={{ marginBottom: '0.5rem' }}>✅ Cancel anytime, no contracts</p>
                <hr style={{ border: 'none', borderTop: '2px solid #e5e7eb', margin: '1rem 0' }} />
                <p style={{ fontWeight: '700', color: colors.greenText }}>Savings: €570-1,070/month + ESG value</p>
              </div>
            </div>
          </div>
          <p
            style={{
              fontSize: '1.125rem',
              fontWeight: '700',
              color: '#14b8a6',
              textAlign: 'center',
              marginTop: '2rem',
            }}
          >
            Stop guessing if your marketing works. Get verified visits + sustainability credentials.
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
            { icon: '🌱', text: 'Sustainability credentials & green certifications' },
            { icon: '♻️', text: 'Zero-waste initiatives & eco-friendly practices' },
            { icon: '✅', text: 'Current specials & promos' },
            { icon: '🎵', text: 'Events & live music' },
            { icon: '🏳️‍🌈', text: 'LGBTQ+ friendly spaces' },
            { icon: '📊', text: 'Real-time capacity status' },
            { icon: '🍃', text: 'Dietary options (vegan, halal, gluten-free)' },
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
              question: 'How accurate is the carbon reduction data?',
              answer: 'We calculate emissions based on actual transport modes and distances traveled. Data is verified and suitable for ESG reporting frameworks including GRI, CSRD, and B Corp certification.',
            },
            {
              question: 'Can I use MiM data in my sustainability reports?',
              answer: 'Yes. You get exportable carbon reduction metrics, transport mode breakdowns, and customer journey data. Perfect for annual reports, ESG frameworks, and grant applications.',
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
          Join Dublin venues attracting eco-conscious customers and building stronger ESG profiles.
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