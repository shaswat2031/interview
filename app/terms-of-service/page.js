import React from "react";
import Head from "next/head";
import Link from "next/link";

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-red-100 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Terms of Service - InterviewAI</title>
        <meta name="description" content="Our Terms of Service" />
      </Head>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-2xl">IA</span>
            </div>
          </Link>
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900">
            Terms of Service
          </h1>
          <p className="mt-2 text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="prose prose-indigo max-w-none text-gray-700">
              <p className="mb-4">
                Welcome to InterviewAI! These terms of service govern your use
                of our website and services.
              </p>

              <h3 className="font-semibold mb-2 text-xl">
                1. Acceptance of Terms
              </h3>
              <p className="mb-4">
                By accessing or using our services, you agree to be bound by
                these terms. If you do not agree to all the terms and conditions
                of this agreement, you may not access or use our services.
              </p>

              <h3 className="font-semibold mb-2 text-xl">
                2. Description of Service
              </h3>
              <p className="mb-4">
                InterviewAI provides AI-powered interview preparation tools,
                including but not limited to mock interviews, feedback analysis,
                and practice sessions. We reserve the right to modify, suspend,
                or discontinue any aspect of our services at any time.
              </p>

              <h3 className="font-semibold mb-2 text-xl">3. User Accounts</h3>
              <p className="mb-4">
                You may need to create an account to use certain features of our
                services. You are responsible for maintaining the
                confidentiality of your account information and for all
                activities that occur under your account.
              </p>

              <h3 className="font-semibold mb-2 text-xl">4. User Content</h3>
              <p className="mb-4">
                You retain ownership of any content you submit to our services.
                By submitting content, you grant us a worldwide, non-exclusive,
                royalty-free license to use, reproduce, modify, adapt, publish,
                and display such content.
              </p>

              <h3 className="font-semibold mb-2 text-xl">5. Prohibited Uses</h3>
              <p className="mb-4">
                You agree not to use our services for any unlawful purpose or in
                any way that could damage, disable, or impair our services.
              </p>

              <h3 className="font-semibold mb-2 text-xl">6. Termination</h3>
              <p className="mb-4">
                We may terminate or suspend your account and access to our
                services at our sole discretion, without notice, for conduct
                that we believe violates these Terms of Service or is harmful to
                other users, us, or third parties.
              </p>

              <h3 className="font-semibold mb-2 text-xl">7. Disclaimers</h3>
              <p className="mb-4">
                Our services are provided "as is" without any warranties,
                expressed or implied. We do not guarantee that our services will
                be error-free or uninterrupted.
              </p>

              <h3 className="font-semibold mb-2 text-xl">
                8. Limitation of Liability
              </h3>
              <p className="mb-4">
                In no event shall InterviewAI be liable for any indirect,
                incidental, special, consequential, or punitive damages
                resulting from your use of or inability to use our services.
              </p>

              <h3 className="font-semibold mb-2 text-xl">
                9. Changes to Terms
              </h3>
              <p className="mb-4">
                We reserve the right to modify these terms at any time. It is
                your responsibility to review these terms periodically for
                changes.
              </p>

              <h3 className="font-semibold mb-2 text-xl">
                10. Contact Information
              </h3>
              <p className="mb-4">
                If you have any questions about these terms, please contact us
                at support@interviewai.com.
              </p>

              <div className="mt-8 text-center">
                <p>Thank you for using InterviewAI!</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/privacy-policy"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Privacy Policy
          </Link>
          {" | "}
          <Link href="/" className="text-indigo-600 hover:text-indigo-500">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
