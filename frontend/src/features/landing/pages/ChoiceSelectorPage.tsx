export default function ChoiceSelectorPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #17a398 0%, #14b8a6 100%)',
      padding: '2rem',
    }}>
      {/* Logo/Title */}
      <div style={{
        marginBottom: '3rem',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '900',
          color: 'white',
          marginBottom: '1rem',
        }}>
          MiM
        </h1>
        <p style={{
          fontSize: '1.5rem',
          color: 'white',
          opacity: 0.9,
        }}>
          Meet in the Middle
        </p>
      </div>

      {/* Main Question */}
      <h2 style={{
        fontSize: '2rem',
        fontWeight: '700',
        color: 'white',
        marginBottom: '3rem',
        textAlign: 'center',
      }}>
        Who are you?
      </h2>

      {/* Two Big Buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        width: '100%',
        maxWidth: '500px',
      }}>
        {/* User Button */}
        <a
          href="/app"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: '2rem',
            background: 'white',
            color: '#1f2937',
            borderRadius: '16px',
            textDecoration: 'none',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
          }}
        >
          <span style={{ fontSize: '2.5rem' }}>🎯</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '0.25rem',
            }}>
              I'm Planning Meetups
            </div>
            <div style={{
              fontSize: '1rem',
              color: '#6b7280',
            }}>
              Find fair places to meet with friends
            </div>
          </div>
        </a>

        {/* Business Button */}
        <a
          href="/venues"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: '2rem',
            background: 'white',
            color: '#1f2937',
            borderRadius: '16px',
            textDecoration: 'none',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
          }}
        >
          <span style={{ fontSize: '2.5rem' }}>🏪</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '0.25rem',
            }}>
              I Own a Venue
            </div>
            <div style={{
              fontSize: '1rem',
              color: '#6b7280',
            }}>
              Get more customers for my business
            </div>
          </div>
        </a>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '4rem',
        textAlign: 'center',
        color: 'white',
        opacity: 0.8,
        fontSize: '0.875rem',
      }}>
        © 2025 CasaFlynn Ltd
      </div>
    </div>
  );
}
