"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfileSetup() {
  const [profile, setProfile] = useState({
    fullName: "",
    jobProfile: "",
    experienceLevel: "",
    experienceYears: 0,
    experienceDescription: "",
    primaryTech: [],
    secondaryTech: [],
    frameworks: [],
    databases: [],
    tools: [],
    currentRole: "",
    targetRole: "",
    industry: "Technology",
    companySize: "Startup (1-50)",
    interviewTypes: [],
    difficulty: "Intermediate",
    duration: 30,
    strengths: [],
    weaknesses: [],
    goals: [],
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [skillCategory, setSkillCategory] = useState("primaryTech");
  const router = useRouter();

  const totalSteps = 4;

  useEffect(() => {
    initializeProfile();
  }, []);

  const initializeProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      if (userData) {
        setProfile((prev) => ({
          ...prev,
          fullName: `${userData.firstName || ""} ${
            userData.lastName || ""
          }`.trim(),
        }));
      }

      // Try to fetch existing profile
      const response = await fetch("/api/profile/setup", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile({
          fullName:
            data.fullName ||
            `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
          jobProfile: data.jobProfile || "",
          experienceLevel: data.experience?.level || "",
          experienceYears: data.experience?.years || 0,
          experienceDescription: data.experience?.description || "",
          primaryTech: data.techStack?.primary || [],
          secondaryTech: data.techStack?.secondary || [],
          frameworks: data.techStack?.frameworks || [],
          databases: data.techStack?.databases || [],
          tools: data.techStack?.tools || [],
          currentRole: data.jobRole?.current || "",
          targetRole: data.jobRole?.target || "",
          industry: data.jobRole?.industry || "Technology",
          companySize: data.jobRole?.companySize || "Startup (1-50)",
          interviewTypes: data.preferences?.interviewTypes || [],
          difficulty: data.preferences?.difficulty || "Intermediate",
          duration: data.preferences?.duration || 30,
          strengths: data.strengths || [],
          weaknesses: data.weaknesses || [],
          goals: data.goals || [],
        });
      }
    } catch (err) {
      console.error("Error initializing profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setProfile((prev) => ({
        ...prev,
        [skillCategory]: [...prev[skillCategory], newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (category, index) => {
    setProfile((prev) => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index),
    }));
  };

  const addToList = (field, value) => {
    if (value.trim() && !profile[field].includes(value.trim())) {
      setProfile((prev) => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
    }
  };

  const removeFromList = (field, index) => {
    setProfile((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const profileData = {
        fullName: profile.fullName,
        jobProfile: profile.jobProfile,
        experience: {
          level: profile.experienceLevel,
          years: profile.experienceYears,
          description: profile.experienceDescription,
        },
        techStack: {
          primary: profile.primaryTech,
          secondary: profile.secondaryTech,
          frameworks: profile.frameworks,
          databases: profile.databases,
          tools: profile.tools,
        },
        jobRole: {
          current: profile.currentRole,
          target: profile.targetRole,
          industry: profile.industry,
          companySize: profile.companySize,
        },
        preferences: {
          interviewTypes: profile.interviewTypes,
          difficulty: profile.difficulty,
          duration: profile.duration,
        },
        strengths: profile.strengths,
        weaknesses: profile.weaknesses,
        goals: profile.goals,
      };

      const response = await fetch("/api/profile/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to save profile");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile setup...</p>
        </div>
      </div>
    );
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Personal Information
        </h2>
        <p className="text-gray-600">Let's start with your basic information</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name *
        </label>
        <input
          type="text"
          value={profile.fullName}
          onChange={(e) => handleInputChange("fullName", e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          placeholder="Enter your full name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Profile / Title *
        </label>
        <input
          type="text"
          value={profile.jobProfile}
          onChange={(e) => handleInputChange("jobProfile", e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          placeholder="e.g., Software Engineer, Product Manager, Data Scientist"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience Level *
          </label>
          <select
            value={profile.experienceLevel}
            onChange={(e) =>
              handleInputChange("experienceLevel", e.target.value)
            }
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          >
            <option value="">Select experience level</option>
            <option value="Entry Level (0-2 years)">
              Entry Level (0-2 years)
            </option>
            <option value="Mid Level (2-5 years)">Mid Level (2-5 years)</option>
            <option value="Senior Level (5-8 years)">
              Senior Level (5-8 years)
            </option>
            <option value="Lead/Principal (8+ years)">
              Lead/Principal (8+ years)
            </option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience *
          </label>
          <input
            type="number"
            value={profile.experienceYears}
            onChange={(e) =>
              handleInputChange(
                "experienceYears",
                parseInt(e.target.value) || 0
              )
            }
            min="0"
            max="50"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="Years"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Experience Description
        </label>
        <textarea
          value={profile.experienceDescription}
          onChange={(e) =>
            handleInputChange("experienceDescription", e.target.value)
          }
          rows="3"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          placeholder="Briefly describe your professional experience and key achievements..."
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Technical Skills
        </h2>
        <p className="text-gray-600">Add your technical skills and expertise</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4">Add Skills</h3>
        <div className="flex gap-2 mb-4">
          <select
            value={skillCategory}
            onChange={(e) => setSkillCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="primaryTech">Primary Technologies</option>
            <option value="secondaryTech">Secondary Technologies</option>
            <option value="frameworks">Frameworks</option>
            <option value="databases">Databases</option>
            <option value="tools">Tools</option>
          </select>
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addSkill()}
            placeholder="Enter skill name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={addSkill}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Skills Display */}
      {[
        { key: "primaryTech", label: "Primary Technologies" },
        { key: "secondaryTech", label: "Secondary Technologies" },
        { key: "frameworks", label: "Frameworks" },
        { key: "databases", label: "Databases" },
        { key: "tools", label: "Tools" },
      ].map(({ key, label }) => (
        <div key={key}>
          <h4 className="font-medium text-gray-900 mb-2">{label}</h4>
          <div className="flex flex-wrap gap-2">
            {profile[key].map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(key, index)}
                  className="ml-2 text-indigo-600 hover:text-indigo-800"
                >
                  ×
                </button>
              </span>
            ))}
            {profile[key].length === 0 && (
              <span className="text-gray-500 text-sm">No skills added yet</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Career Information
        </h2>
        <p className="text-gray-600">
          Tell us about your career goals and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Role
          </label>
          <input
            type="text"
            value={profile.currentRole}
            onChange={(e) => handleInputChange("currentRole", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="Your current job title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Role *
          </label>
          <input
            type="text"
            value={profile.targetRole}
            onChange={(e) => handleInputChange("targetRole", e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="Your desired job title"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Industry *
          </label>
          <select
            value={profile.industry}
            onChange={(e) => handleInputChange("industry", e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          >
            <option value="Technology">Technology</option>
            <option value="Finance">Finance</option>
            <option value="Healthcare">Healthcare</option>
            <option value="E-commerce">E-commerce</option>
            <option value="Consulting">Consulting</option>
            <option value="Startup">Startup</option>
            <option value="Enterprise">Enterprise</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Size
          </label>
          <select
            value={profile.companySize}
            onChange={(e) => handleInputChange("companySize", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          >
            <option value="Startup (1-50)">Startup (1-50)</option>
            <option value="Small (51-200)">Small (51-200)</option>
            <option value="Medium (201-1000)">Medium (201-1000)</option>
            <option value="Large (1000+)">Large (1000+)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Interview Types (Select all that apply)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            "Technical",
            "Behavioral",
            "System Design",
            "Coding",
            "Leadership",
            "Product Management",
          ].map((type) => (
            <label key={type} className="flex items-center">
              <input
                type="checkbox"
                checked={profile.interviewTypes.includes(type)}
                onChange={(e) => {
                  if (e.target.checked) {
                    addToList("interviewTypes", type);
                  } else {
                    const index = profile.interviewTypes.indexOf(type);
                    if (index > -1) {
                      removeFromList("interviewTypes", index);
                    }
                  }
                }}
                className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level
          </label>
          <select
            value={profile.difficulty}
            onChange={(e) => handleInputChange("difficulty", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Duration (minutes)
          </label>
          <select
            value={profile.duration}
            onChange={(e) =>
              handleInputChange("duration", parseInt(e.target.value))
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Personal Development
        </h2>
        <p className="text-gray-600">
          Help us understand your strengths, areas for improvement, and goals
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Strengths
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Add a strength"
            onKeyPress={(e) => {
              if (e.key === "Enter" && e.target.value.trim()) {
                addToList("strengths", e.target.value);
                e.target.value = "";
              }
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.strengths.map((strength, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
            >
              {strength}
              <button
                type="button"
                onClick={() => removeFromList("strengths", index)}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Areas for Improvement
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Add an area to improve"
            onKeyPress={(e) => {
              if (e.key === "Enter" && e.target.value.trim()) {
                addToList("weaknesses", e.target.value);
                e.target.value = "";
              }
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.weaknesses.map((weakness, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
            >
              {weakness}
              <button
                type="button"
                onClick={() => removeFromList("weaknesses", index)}
                className="ml-2 text-orange-600 hover:text-orange-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Career Goals
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Add a career goal"
            onKeyPress={(e) => {
              if (e.key === "Enter" && e.target.value.trim()) {
                addToList("goals", e.target.value);
                e.target.value = "";
              }
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.goals.map((goal, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {goal}
              <button
                type="button"
                onClick={() => removeFromList("goals", index)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Progress Bar */}
          <div className="bg-gray-50 px-8 py-4">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Profile Setup
              </h1>
              <span className="text-sm text-gray-600">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Step Content */}
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors font-medium"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Complete Setup"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
