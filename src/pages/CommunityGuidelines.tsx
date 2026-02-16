import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { updatePageTitle } from '../utils/seo';
import Footer from '../components/Footer';

export default function CommunityGuidelines() {
  useEffect(() => {
    updatePageTitle('Community Guidelines');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/" className="text-gray-600 hover:text-gray-900 mb-8 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Community Guidelines</h1>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6 text-gray-700">
          <p className="text-lg">
            OnlyThais is committed to maintaining a safe, respectful, and welcoming community. These guidelines help
            ensure a positive experience for all users.
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Respect and Safety</h2>
            <p className="mb-3">All users must:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Treat others with respect and dignity</li>
              <li>Refrain from harassment, bullying, or threatening behavior</li>
              <li>Not engage in hate speech or discrimination based on race, ethnicity, religion, gender, sexual orientation, or any other protected characteristic</li>
              <li>Respect boundaries and consent in all interactions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Content Standards</h2>
            <p className="mb-3">All content must:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Be your own original content or content you have rights to share</li>
              <li>Not depict or involve minors in any way</li>
              <li>Not contain illegal activities or promote violence</li>
              <li>Be accurately represented in your profile and descriptions</li>
              <li>Not contain spam, scams, or misleading information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Prohibited Content</h2>
            <p className="mb-3">The following content is strictly prohibited:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Content involving minors or appearing to involve minors</li>
              <li>Non-consensual content or revenge content</li>
              <li>Content promoting self-harm or suicide</li>
              <li>Graphic violence or gore</li>
              <li>Content that violates intellectual property rights</li>
              <li>Illegal services or activities</li>
              <li>Impersonation of others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Creator Responsibilities</h2>
            <p className="mb-3">Creators must:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Be at least 18 years old and verify their identity</li>
              <li>Use recent, accurate photos in their profile</li>
              <li>Clearly communicate their services and boundaries</li>
              <li>Respond to messages professionally and respectfully</li>
              <li>Honor any commitments made to subscribers</li>
              <li>Report any abusive or inappropriate behavior</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Subscriber Responsibilities</h2>
            <p className="mb-3">Subscribers must:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Respect creators' boundaries and pricing</li>
              <li>Not share, distribute, or resell creator content</li>
              <li>Communicate respectfully at all times</li>
              <li>Not request illegal services or content</li>
              <li>Honor subscription commitments and payment obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Privacy and Security</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Do not share personal information of other users without consent</li>
              <li>Use secure passwords and protect your account</li>
              <li>Report security vulnerabilities to our team</li>
              <li>Do not attempt to access accounts or data you're not authorized to access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Reporting Violations</h2>
            <p className="mb-3">
              If you encounter content or behavior that violates these guidelines, please report it immediately using the
              report feature or by contacting our support team. All reports are reviewed promptly and kept confidential.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Enforcement</h2>
            <p className="mb-3">Violations of these guidelines may result in:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Content removal</li>
              <li>Warning or restriction of account features</li>
              <li>Temporary or permanent account suspension</li>
              <li>Reporting to law enforcement when appropriate</li>
            </ul>
            <p className="mt-3">
              We review each case individually and consider context, severity, and repeat offenses when determining appropriate action.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Appeals</h2>
            <p>
              If you believe your content or account was actioned in error, you may appeal by contacting our support team
              at <a href="mailto:support@onlythais.club" className="text-blue-600 hover:text-blue-700">support@onlythais.club</a>
            </p>
          </section>

          <p className="text-sm text-gray-500 mt-8">Last updated: February 16, 2026</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
