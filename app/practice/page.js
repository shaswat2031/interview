"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

const PracticePage = () => {
  const [user, setUser] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchUserData();
    fetchInterviews();
  }, []);

  const fetchUserData = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      window.location.href = "/login";
    }
  };

  const fetchInterviews = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch("/api/interviews?limit=5", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch interviews");
      }

      const data = await response.json();
      setInterviews(data.interviews || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const interviewTypes = [
    { value: "all", label: "All Types", icon: "🎯" },
    { value: "technical", label: "Technical", icon: "💻" },
    { value: "behavioral", label: "Behavioral", icon: "🗣️" },
    { value: "system-design", label: "System Design", icon: "🏗️" },
    { value: "coding", label: "Coding", icon: "⚡" },
    { value: "leadership", label: "Leadership", icon: "👑" },
  ];

  // Function to start template interview with pre-filled data
  const startTemplateInterview = (templateType) => {
    const templates = {
      frontend: {
        type: "Technical",
        company: "Tech Startup",
        jobTitle: "Frontend Developer",
        difficulty: "Intermediate",
        duration: 45,
        focus: ["Problem Solving", "Technical Knowledge", "Code Quality"],
        customRequirements:
          "Focus on React, JavaScript, CSS, and modern frontend development practices",
      },
      software: {
        type: "Technical",
        company: "FAANG",
        jobTitle: "Software Engineer",
        difficulty: "Advanced",
        duration: 60,
        focus: [
          "Data Structures",
          "Algorithms",
          "System Architecture",
          "Problem Solving",
        ],
        customRequirements:
          "Focus on data structures, algorithms, system design, and coding best practices",
      },
      product: {
        type: "Behavioral",
        company: "Fortune 500",
        jobTitle: "Product Manager",
        difficulty: "Intermediate",
        duration: 30,
        focus: ["Leadership", "Communication", "Project Management"],
        customRequirements:
          "Focus on product strategy, leadership skills, and stakeholder communication",
      },
      devops: {
        type: "Technical",
        company: "Cloud Company",
        jobTitle: "DevOps Engineer",
        difficulty: "Advanced",
        duration: 50,
        focus: [
          "System Architecture",
          "Technical Knowledge",
          "Problem Solving",
        ],
        customRequirements:
          "Focus on AWS, Docker, Kubernetes, CI/CD pipelines, and cloud infrastructure",
      },
      datascience: {
        type: "Technical",
        company: "Tech Giant",
        jobTitle: "Data Scientist",
        difficulty: "Advanced",
        duration: 45,
        focus: ["Technical Knowledge", "Problem Solving", "Data Structures"],
        customRequirements:
          "Focus on Python, machine learning, statistics, SQL, and data analysis",
      },
      ux: {
        type: "Behavioral",
        company: "Design Agency",
        jobTitle: "UX Designer",
        difficulty: "Intermediate",
        duration: 40,
        focus: ["Communication", "Problem Solving", "Team Collaboration"],
        customRequirements:
          "Focus on design thinking, prototyping, user research, and design processes",
      },
      fullstack: {
        type: "Technical",
        company: "TCS",
        jobTitle: "Full Stack Developer",
        difficulty: "Intermediate",
        duration: 50,
        focus: [
          "Technical Knowledge",
          "Problem Solving",
          "System Architecture",
        ],
        customRequirements:
          "Focus on full stack development, databases, APIs, and web technologies",
      },
      systemadmin: {
        type: "Technical",
        company: "Wipro",
        jobTitle: "System Administrator",
        difficulty: "Intermediate",
        duration: 35,
        focus: ["Technical Knowledge", "Problem Solving", "System Management"],
        customRequirements:
          "Focus on server management, networking, security, and system troubleshooting",
      },
      qa: {
        type: "Technical",
        company: "Microsoft",
        jobTitle: "QA Engineer",
        difficulty: "Intermediate",
        duration: 40,
        focus: ["Technical Knowledge", "Problem Solving", "Quality Assurance"],
        customRequirements:
          "Focus on test automation, manual testing, bug tracking, and quality processes",
      },
      mobile: {
        type: "Technical",
        company: "Google",
        jobTitle: "Mobile Developer",
        difficulty: "Advanced",
        duration: 55,
        focus: ["Technical Knowledge", "Problem Solving", "Mobile Development"],
        customRequirements:
          "Focus on iOS/Android development, mobile UI/UX, and app optimization",
      },
      cybersecurity: {
        type: "Technical",
        company: "IBM",
        jobTitle: "Cybersecurity Analyst",
        difficulty: "Advanced",
        duration: 45,
        focus: ["Technical Knowledge", "Problem Solving", "Security Analysis"],
        customRequirements:
          "Focus on threat analysis, security protocols, incident response, and risk assessment",
      },
    };

    const selectedTemplate = templates[templateType];
    if (selectedTemplate) {
      // Store template data in localStorage to be picked up by interview-setup page
      localStorage.setItem(
        "interviewTemplate",
        JSON.stringify(selectedTemplate)
      );
      // Redirect to interview setup page
      window.location.href = "/interview-setup";
    }
  };

  const practiceTemplates = [
    {
      title: "Frontend Developer",
      company: "Tech Startup",
      type: "Technical",
      difficulty: "Intermediate",
      duration: "45 min",
      topics: ["React", "JavaScript", "CSS", "Git"],
      icon: "🌐",
      templateKey: "frontend",
    },
    {
      title: "Software Engineer",
      company: "FAANG",
      type: "Technical",
      difficulty: "Advanced",
      duration: "60 min",
      topics: ["Data Structures", "Algorithms", "System Design"],
      icon: "⚙️",
      templateKey: "software",
    },
    {
      title: "Product Manager",
      company: "Fortune 500",
      type: "Behavioral",
      difficulty: "Intermediate",
      duration: "30 min",
      topics: ["Leadership", "Strategy", "Communication"],
      icon: "📊",
      templateKey: "product",
    },
    {
      title: "DevOps Engineer",
      company: "Cloud Company",
      type: "Technical",
      difficulty: "Advanced",
      duration: "50 min",
      topics: ["AWS", "Docker", "Kubernetes", "CI/CD"],
      icon: "☁️",
      templateKey: "devops",
    },
    {
      title: "Data Scientist",
      company: "Tech Giant",
      type: "Technical",
      difficulty: "Advanced",
      duration: "45 min",
      topics: ["Python", "ML", "Statistics", "SQL"],
      icon: "🔬",
      templateKey: "datascience",
    },
    {
      title: "UX Designer",
      company: "Design Agency",
      type: "Behavioral",
      difficulty: "Intermediate",
      duration: "40 min",
      topics: ["Design Thinking", "Prototyping", "User Research"],
      icon: "🎨",
      templateKey: "ux",
    },
    {
      title: "Full Stack Developer",
      company: "TCS",
      type: "Technical",
      difficulty: "Intermediate",
      duration: "50 min",
      topics: ["React", "Node.js", "MongoDB", "APIs"],
      icon: "🔧",
      templateKey: "fullstack",
    },
    {
      title: "System Administrator",
      company: "Wipro",
      type: "Technical",
      difficulty: "Intermediate",
      duration: "35 min",
      topics: ["Linux", "Networking", "Security", "Troubleshooting"],
      icon: "🖥️",
      templateKey: "systemadmin",
    },
    {
      title: "QA Engineer",
      company: "Microsoft",
      type: "Technical",
      difficulty: "Intermediate",
      duration: "40 min",
      topics: ["Test Automation", "Selenium", "Bug Tracking", "Quality"],
      icon: "🔍",
      templateKey: "qa",
    },
    {
      title: "Mobile Developer",
      company: "Google",
      type: "Technical",
      difficulty: "Advanced",
      duration: "55 min",
      topics: ["React Native", "iOS", "Android", "Mobile UI"],
      icon: "📱",
      templateKey: "mobile",
    },
    {
      title: "Cybersecurity Analyst",
      company: "IBM",
      type: "Technical",
      difficulty: "Advanced",
      duration: "45 min",
      topics: [
        "Threat Analysis",
        "Security",
        "Risk Assessment",
        "Incident Response",
      ],
      icon: "🔒",
      templateKey: "cybersecurity",
    },
  ];

  const filteredInterviews =
    selectedCategory === "all"
      ? interviews
      : interviews.filter(
          (interview) =>
            interview.type.toLowerCase() ===
            selectedCategory.replace("-", " ").toLowerCase()
        );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading practice sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Practice - InterviewAI</title>
        <meta
          name="description"
          content="Practice interviews with AI-powered feedback"
        />
      </Head>

      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <span className="text-2xl font-bold text-blue-600">
                  InterviewAI
                </span>
              </Link>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/practice"
                  className="text-blue-600 border-b-2 border-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Practice
                </Link>
                <Link
                  href="/analytics"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Analytics
                </Link>
                <Link
                  href="/resources"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Resources
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                👨‍💼 {user?.firstName} {user?.lastName}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg p-6 text-white mb-8">
            <h1 className="text-3xl font-bold mb-2">Interview Practice 🎯</h1>
            <p className="text-blue-100">
              Sharpen your skills with AI-powered interview sessions
            </p>
            <div className="mt-4">
              <Link href="/interview-setup">
                <button className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium">
                  Start Custom Interview
                </button>
              </Link>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Interview Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {interviewTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedCategory(type.value)}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    selectedCategory === type.value
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"
                  }`}
                >
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <div className="text-sm font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Practice Templates */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Practice Templates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {practiceTemplates.map((template, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl">{template.icon}</div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        template.difficulty === "Advanced"
                          ? "bg-red-100 text-red-800"
                          : template.difficulty === "Intermediate"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {template.difficulty}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {template.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {template.company}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span className="mr-4">{template.type}</span>
                    <span>{template.duration}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.topics.slice(0, 3).map((topic, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                      >
                        {topic}
                      </span>
                    ))}
                    {template.topics.length > 3 && (
                      <span className="text-gray-500 text-xs">
                        +{template.topics.length - 3} more
                      </span>
                    )}
                  </div>
                  <button
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => startTemplateInterview(template.templateKey)}
                  >
                    Start Practice
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Practice Sessions */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Recent Practice Sessions
            </h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {filteredInterviews.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No practice sessions yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start your first interview practice to see your progress
                    here.
                  </p>
                  <Link href="/interview-setup">
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                      Start First Practice
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Interview
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredInterviews.map((interview) => (
                        <tr key={interview._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {interview.type}
                            </div>
                            <div className="text-sm text-gray-500">
                              {interview.duration} minutes
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {interview.company}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {interview.score ? `${interview.score}/10` : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(interview.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                interview.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : interview.status === "scheduled"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {interview.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Link href={`/interview-details/${interview._id}`}>
                              <button className="text-blue-600 hover:text-blue-900">
                                View Details
                              </button>
                            </Link>
                            {interview.status === "scheduled" && (
                              <>
                                <span className="text-gray-300">|</span>
                                <Link href={`/interview/${interview._id}`}>
                                  <button className="text-green-600 hover:text-green-900">
                                    Continue
                                  </button>
                                </Link>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {interviews.length > 0 && (
              <div className="mt-4 text-center">
                <Link href="/all-interviews">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All Interviews →
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PracticePage;
