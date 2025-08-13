import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TestingTools from "./components/TestingTools";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Interview AI Platform",
  description: "Practice for interviews with AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full bg-gradient-to-br from-yellow-50 to-red-50`}
      >
        <div className="min-h-screen flex flex-col">
          {children}
          <TestingTools />

          <footer className="mt-auto pt-10 pb-6 px-4 sm:px-6 md:px-8 border-t border-gray-200">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div className="col-span-1 md:col-span-1">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center mr-2">
                      <span className="text-white font-bold">IA</span>
                    </div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                      InterviewAI
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Elevate your interview skills with AI-powered practice and
                    personalized feedback.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    Product
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a
                        href="/features"
                        className="text-gray-600 hover:text-pink-600 transition-colors"
                      >
                        Features
                      </a>
                    </li>
                    <li>
                      <a
                        href="/pricing"
                        className="text-gray-600 hover:text-pink-600 transition-colors"
                      >
                        Pricing
                      </a>
                    </li>
                    <li>
                      <a
                        href="/testimonials"
                        className="text-gray-600 hover:text-pink-600 transition-colors"
                      >
                        Testimonials
                      </a>
                    </li>
                    <li>
                      <a
                        href="/resources"
                        className="text-gray-600 hover:text-pink-600 transition-colors"
                      >
                        Resources
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    Support
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a
                        href="/faq"
                        className="text-gray-600 hover:text-pink-600 transition-colors"
                      >
                        FAQ
                      </a>
                    </li>
                    <li>
                      <a
                        href="/help"
                        className="text-gray-600 hover:text-pink-600 transition-colors"
                      >
                        Help Center
                      </a>
                    </li>
                    <li>
                      <a
                        href="/contact"
                        className="text-gray-600 hover:text-pink-600 transition-colors"
                      >
                        Contact Us
                      </a>
                    </li>
                    <li>
                      <a
                        href="/feedback"
                        className="text-gray-600 hover:text-pink-600 transition-colors"
                      >
                        Submit Feedback
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    Legal
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a
                        href="/terms-of-service"
                        className="text-gray-600 hover:text-pink-600 transition-colors"
                      >
                        Terms of Service
                      </a>
                    </li>
                    <li>
                      <a
                        href="/privacy-policy"
                        className="text-gray-600 hover:text-pink-600 transition-colors"
                      >
                        Privacy Policy
                      </a>
                    </li>
                    <li>
                      <a
                        href="/cookie-policy"
                        className="text-gray-600 hover:text-pink-600 transition-colors"
                      >
                        Cookie Policy
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0 text-sm text-gray-500">
                  © {new Date().getFullYear()} InterviewAI. All rights reserved.
                </div>

                <div className="flex space-x-4 mb-4 md:mb-0">
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-pink-600 transition-colors"
                    aria-label="Twitter"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-pink-600 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-pink-600 transition-colors"
                    aria-label="GitHub"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      />
                    </svg>
                  </a>
                </div>

                <div className="text-sm text-gray-500">
                  <a href="#" className="hover:text-pink-600 transition-colors">
                    Language: <span className="font-medium">English</span>
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
