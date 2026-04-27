import React from 'react';

const SecurityPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Section 1 — Hero */}
      <section className="bg-gray-900 py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-teal-500 mb-6 leading-tight">
            Your Keys. Your Data.<br />Full Stop.
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            MiM is built on zero trust architecture. Here's exactly how it works — and why it matters.
          </p>
        </div>
      </section>

      {/* Section 2 — How It Works (step-by-step flow) */}
      <section className="bg-gray-800 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-teal-400 mb-16">
            How Your Data Is Protected
          </h2>

          {/* Horizontal flow on desktop, vertical on mobile */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-center gap-0">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="bg-gray-900 border-2 border-teal-500 rounded-xl p-6 w-56 text-center">
                <div className="text-4xl mb-3">🔑</div>
                <h3 className="text-lg font-bold text-teal-400 mb-2">You set your password</h3>
                <p className="text-sm text-gray-400">
                  Your password never leaves your device. It is used locally to derive your unique encryption key using Argon2.
                </p>
              </div>
              {/* Arrow (desktop: right, mobile: down) */}
              <div className="hidden md:flex items-center justify-center w-12 h-full">
                <svg className="w-8 h-8 text-teal-500 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className="md:hidden flex items-center justify-center py-2">
                <svg className="w-8 h-8 text-teal-500 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="bg-gray-900 border-2 border-teal-500 rounded-xl p-6 w-56 text-center">
                <div className="text-4xl mb-3">🔒</div>
                <h3 className="text-lg font-bold text-teal-400 mb-2">Your data is encrypted</h3>
                <p className="text-sm text-gray-400">
                  Every holding is encrypted on your device using AES-256-GCM before being sent anywhere.
                </p>
              </div>
              <div className="hidden md:flex items-center justify-center w-12 h-full">
                <svg className="w-8 h-8 text-teal-500 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className="md:hidden flex items-center justify-center py-2">
                <svg className="w-8 h-8 text-teal-500 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="bg-gray-900 border-2 border-teal-500 rounded-xl p-6 w-56 text-center">
                <div className="text-4xl mb-3">📡</div>
                <h3 className="text-lg font-bold text-teal-400 mb-2">Encrypted data transmitted</h3>
                <p className="text-sm text-gray-400">
                  Only the encrypted blob travels over HTTPS to MiM servers. We never see plaintext.
                </p>
              </div>
              <div className="hidden md:flex items-center justify-center w-12 h-full">
                <svg className="w-8 h-8 text-teal-500 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className="md:hidden flex items-center justify-center py-2">
                <svg className="w-8 h-8 text-teal-500 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center">
              <div className="bg-gray-900 border-2 border-teal-500 rounded-xl p-6 w-56 text-center">
                <div className="text-4xl mb-3">🗄️</div>
                <h3 className="text-lg font-bold text-teal-400 mb-2">Encrypted storage</h3>
                <p className="text-sm text-gray-400">
                  MiM stores only the encrypted blob in the database. No key. No plaintext. Nothing readable.
                </p>
              </div>
              <div className="hidden md:flex items-center justify-center w-12 h-full">
                <svg className="w-8 h-8 text-teal-500 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className="md:hidden flex items-center justify-center py-2">
                <svg className="w-8 h-8 text-teal-500 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex flex-col items-center">
              <div className="bg-gray-900 border-2 border-teal-500 rounded-xl p-6 w-56 text-center">
                <div className="text-4xl mb-3">🔓</div>
                <h3 className="text-lg font-bold text-teal-400 mb-2">Only you can decrypt</h3>
                <p className="text-sm text-gray-400">
                  When you log in, your key is re-derived locally from your password and used to decrypt your data in your browser. The server is never involved in decryption.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — What Zero Trust Means */}
      <section className="bg-gray-900 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-teal-400 mb-16">
            What Zero Trust Actually Means
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-gray-800 border border-teal-500/30 rounded-xl p-8 text-center hover:border-teal-500 transition-colors">
              <div className="text-5xl mb-5">🏛️</div>
              <h3 className="text-xl font-bold text-teal-400 mb-4">We can't read your data</h3>
              <p className="text-gray-400 leading-relaxed">
                Even as the people who built MiM, we have no access to your holdings. The architecture makes it technically impossible.
              </p>
            </div>
            {/* Card 2 */}
            <div className="bg-gray-800 border border-teal-500/30 rounded-xl p-8 text-center hover:border-teal-500 transition-colors">
              <div className="text-5xl mb-5">⚖️</div>
              <h3 className="text-xl font-bold text-teal-400 mb-4">Court orders get nothing</h3>
              <p className="text-gray-400 leading-relaxed">
                If a government agency compels us to hand over user data, all we can provide is encrypted noise. Without your key, it is meaningless.
              </p>
            </div>
            {/* Card 3 */}
            <div className="bg-gray-800 border border-teal-500/30 rounded-xl p-8 text-center hover:border-teal-500 transition-colors">
              <div className="text-5xl mb-5">💥</div>
              <h3 className="text-xl font-bold text-teal-400 mb-4">Breaches expose nothing</h3>
              <p className="text-gray-400 leading-relaxed">
                If our database is ever compromised, attackers get encrypted blobs they cannot decrypt without your password.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 — Encryption Standards */}
      <section className="bg-gray-800 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-teal-400 mb-16">
            Military-Grade Encryption Standards
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-teal-500">
                  <th className="text-left py-4 px-6 text-teal-400 font-bold text-lg">Standard</th>
                  <th className="text-left py-4 px-6 text-teal-400 font-bold text-lg">What It Means</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                  <td className="py-5 px-6 font-semibold text-teal-300 text-base">AES-256-GCM</td>
                  <td className="py-5 px-6 text-gray-300 leading-relaxed">
                    The global standard for symmetric encryption. Used by NATO, intelligence agencies, and financial institutions worldwide.
                  </td>
                </tr>
                <tr className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                  <td className="py-5 px-6 font-semibold text-teal-300 text-base">Argon2 Key Derivation</td>
                  <td className="py-5 px-6 text-gray-300 leading-relaxed">
                    The winner of the Password Hashing Competition. Designed to be resistant to brute-force and hardware attacks.
                  </td>
                </tr>
                <tr className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                  <td className="py-5 px-6 font-semibold text-teal-300 text-base">HTTPS / TLS 1.3</td>
                  <td className="py-5 px-6 text-gray-300 leading-relaxed">
                    All data in transit is encrypted. No exceptions.
                  </td>
                </tr>
                <tr className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                  <td className="py-5 px-6 font-semibold text-teal-300 text-base">Zero Knowledge Architecture</td>
                  <td className="py-5 px-6 text-gray-300 leading-relaxed">
                    MiM has zero knowledge of your holdings. We cannot see, sell, or surrender your data.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 5 — Tagline Closer */}
      <section className="bg-teal-900 py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-4xl md:text-6xl font-bold text-white leading-tight">
            Track your stack.<br />Never be tracked.
          </p>
        </div>
      </section>
    </div>
  );
};

export default SecurityPage;
