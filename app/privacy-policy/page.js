import React from "react";
import Head from "next/head";
import Link from "next/link";

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-red-100 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Privacy Policy - InterviewAI</title>
        <meta name="description" content="Our Privacy Policy" />
      </Head>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-2xl">IA</span>
            </div>
          </Link>
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900">
            Privacy Policy
          </h1>
          <p className="mt-2 text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="prose prose-indigo max-w-none text-gray-700">
              <p className="mb-4">
                Your privacy is important to us. This policy explains how we
                collect, use, and protect your personal information.
              </p>

              <h3 className="font-semibold mb-2 text-xl">
                1. Information We Collect
              </h3>
              <p className="mb-4">
                We collect personal information you provide to us, such as your
                name, email address, and other information you provide during
                registration. We also collect usage data, such as your
                interactions with our services and technical data about your
                device.
              </p>

              <h3 className="font-semibold mb-2 text-xl">
                2. How We Use Your Information
              </h3>
              <p className="mb-4">We use your information to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>
                  Send you technical notices, updates, and support messages
                </li>
                <li>Respond to your comments and questions</li>
                <li>Understand how users interact with our services</li>
                <li>Personalize and optimize your experience</li>
                <li>
                  Detect, investigate, and prevent fraudulent or unauthorized
                  activities
                </li>
              </ul>

              <h3 className="font-semibold mb-2 text-xl">
                3. Sharing Your Information
              </h3>
              <p className="mb-4">
                We do not sell your personal information. We may share your
                information with:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Service providers who perform services on our behalf</li>
                <li>
                  Partners with whom we offer co-branded services or promotional
                  offers
                </li>
                <li>
                  Law enforcement or other third parties in response to legal
                  processes or when necessary to protect our rights
                </li>
              </ul>

              <h3 className="font-semibold mb-2 text-xl">
                4. Your Rights and Choices
              </h3>
              <p className="mb-4">
                You have certain rights regarding your personal information,
                including:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>
                  Accessing, correcting, or deleting your personal information
                </li>
                <li>Withdrawing your consent at any time</li>
                <li>Opting out of marketing communications</li>
                <li>Requesting a copy of your personal information</li>
              </ul>

              <h3 className="font-semibold mb-2 text-xl">5. Data Security</h3>
              <p className="mb-4">
                We implement appropriate security measures to protect your
                personal information against unauthorized access, alteration,
                disclosure, or destruction.
              </p>

              <h3 className="font-semibold mb-2 text-xl">
                6. Children's Privacy
              </h3>
              <p className="mb-4">
                Our services are not directed to children under 13 years of age.
                We do not knowingly collect personal information from children
                under 13.
              </p>

              <h3 className="font-semibold mb-2 text-xl">
                7. International Data Transfers
              </h3>
              <p className="mb-4">
                Your information may be transferred to, and processed in,
                countries other than the country in which you reside. These
                countries may have different data protection laws.
              </p>

              <h3 className="font-semibold mb-2 text-xl">
                8. Changes to This Policy
              </h3>
              <p className="mb-4">
                We may update this privacy policy from time to time. We will
                notify you of any changes by posting the new policy on this
                page.
              </p>

              <h3 className="font-semibold mb-2 text-xl">9. Contact Us</h3>
              <p className="mb-4">
                If you have questions or concerns about this privacy policy or
                our practices, please contact us at{" "}
                <a
                  href="mailto:privacy@interviewai.com"
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  privacy@interviewai.com
                </a>
                .
              </p>

              <div className="mt-8 text-center">
                <p>
                  Thank you for trusting InterviewAI with your personal
                  information.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/terms-of-service"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Terms of Service
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

export default PrivacyPolicyPage;
