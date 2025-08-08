"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

const ResourcesPage = () => {
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      window.location.href = "/login";
    }
  };

  const resourceCategories = [
    { value: "all", label: "All Resources", icon: "📚" },
    { value: "technical", label: "Technical", icon: "💻" },
    { value: "behavioral", label: "Behavioral", icon: "🗣️" },
    { value: "system-design", label: "System Design", icon: "🏗️" },
    { value: "tips", label: "Interview Tips", icon: "💡" },
    { value: "tools", label: "Tools & Prep", icon: "🛠️" },
  ];

  const resources = [
    // Technical Resources
    {
      category: "technical",
      title: "Data Structures & Algorithms Guide",
      description:
        "Comprehensive guide covering all essential data structures and algorithms for technical interviews.",
      type: "Guide",
      difficulty: "Intermediate",
      readTime: "45 min",
      tags: ["algorithms", "data-structures", "coding"],
      featured: true,
      content: `
# Data Structures & Algorithms Guide

## Essential Data Structures

### Arrays and Strings
- Time complexity analysis
- Two-pointer technique
- Sliding window problems
- Common algorithms and patterns

### Linked Lists
- Singly and doubly linked lists
- Cycle detection
- Reversal algorithms
- Merge operations

### Trees and Graphs
- Binary trees and BST
- Tree traversals (DFS, BFS)
- Graph algorithms
- Shortest path problems

## Algorithm Patterns

### Dynamic Programming
- Memoization vs tabulation
- Common DP patterns
- Practice problems

### Greedy Algorithms
- When to use greedy approach
- Proof techniques
- Classic problems

## Practice Strategy
1. Start with easy problems
2. Focus on understanding patterns
3. Practice time complexity analysis
4. Mock interviews with peers
      `,
    },
    {
      category: "technical",
      title: "System Design Fundamentals",
      description:
        "Learn the basics of system design interviews including scalability, databases, and architecture patterns.",
      type: "Course",
      difficulty: "Advanced",
      readTime: "2 hours",
      tags: ["system-design", "scalability", "architecture"],
      featured: true,
      content: `
# System Design Fundamentals

## Core Concepts

### Scalability
- Horizontal vs Vertical scaling
- Load balancing strategies
- Caching mechanisms
- Database sharding

### Reliability & Availability
- Fault tolerance
- Redundancy
- Disaster recovery
- Monitoring and alerting

### Performance
- Latency vs throughput
- CDN usage
- Database optimization
- Caching strategies

## Common System Design Questions
1. Design a URL shortener
2. Design a social media feed
3. Design a chat system
4. Design a video streaming service

## Architecture Patterns
- Microservices vs Monolith
- Event-driven architecture
- API Gateway patterns
- Service mesh
      `,
    },
    {
      category: "technical",
      title: "JavaScript Interview Questions",
      description:
        "Most commonly asked JavaScript questions with detailed explanations and examples.",
      type: "Q&A",
      difficulty: "Intermediate",
      readTime: "30 min",
      tags: ["javascript", "frontend", "web-development"],
      featured: false,
      content: `
# JavaScript Interview Questions

## Core JavaScript Concepts

### Closures
- Definition and examples
- Practical use cases
- Common pitfalls

### Promises and Async/Await
- Promise states
- Error handling
- Async patterns
- Event loop understanding

### Prototypes and Inheritance
- Prototype chain
- Constructor functions
- ES6 classes
- Inheritance patterns

## Common Questions
1. Explain event delegation
2. What is hoisting?
3. Difference between let, const, and var
4. How does 'this' work in JavaScript?
5. Explain async/await vs Promises

## ES6+ Features
- Arrow functions
- Destructuring
- Template literals
- Modules
- Spread operator
      `,
    },

    // Behavioral Resources
    {
      category: "behavioral",
      title: "STAR Method Mastery",
      description:
        "Master the STAR (Situation, Task, Action, Result) method for behavioral interviews.",
      type: "Guide",
      difficulty: "Beginner",
      readTime: "20 min",
      tags: ["star-method", "storytelling", "behavioral"],
      featured: true,
      content: `
# STAR Method Mastery

## What is the STAR Method?

**S**ituation - Set the context
**T**ask - Describe what needed to be done
**A**ction - Explain what you did
**R**esult - Share the outcome

## How to Use STAR

### Situation
- Provide relevant context
- Keep it concise
- Focus on the challenge

### Task
- Clearly define your responsibility
- Explain the goal or objective
- Highlight the stakes

### Action
- Detail the specific steps you took
- Focus on YOUR actions
- Explain your thought process

### Result
- Quantify the outcome when possible
- Highlight the positive impact
- Include what you learned

## Common Behavioral Questions
1. Tell me about a time you faced a conflict
2. Describe a challenging project
3. How do you handle pressure?
4. Tell me about a failure
5. Describe your leadership style

## Tips for Success
- Prepare 5-7 stories covering different scenarios
- Practice out loud
- Focus on your specific contributions
- End with lessons learned
      `,
    },
    {
      category: "behavioral",
      title: "Leadership & Teamwork Stories",
      description:
        "Prepare compelling stories about leadership experiences and teamwork challenges.",
      type: "Template",
      difficulty: "Intermediate",
      readTime: "25 min",
      tags: ["leadership", "teamwork", "management"],
      featured: false,
      content: `
# Leadership & Teamwork Stories

## Leadership Story Framework

### Leading Without Authority
- Situation where you led without formal authority
- How you gained buy-in
- Strategies for influence
- Results achieved

### Conflict Resolution
- Describe a team conflict
- Your role in resolution
- Communication strategies used
- Long-term improvements

### Mentoring & Development
- Experience mentoring others
- Approach to development
- Challenges faced
- Success stories

## Teamwork Scenarios

### Cross-functional Collaboration
- Working with different departments
- Communication challenges
- Alignment strategies
- Successful outcomes

### Remote Team Management
- Managing distributed teams
- Maintaining culture
- Communication tools
- Productivity strategies

## Story Templates
1. The difficult team member
2. Missed deadline crisis
3. Resource constraints
4. Stakeholder management
5. Cultural change initiative
      `,
    },

    // System Design Resources
    {
      category: "system-design",
      title: "Microservices Architecture",
      description:
        "Deep dive into microservices design patterns, benefits, and challenges.",
      type: "Guide",
      difficulty: "Advanced",
      readTime: "60 min",
      tags: ["microservices", "architecture", "distributed-systems"],
      featured: false,
      content: `
# Microservices Architecture

## What are Microservices?

Microservices are an architectural pattern where applications are built as a collection of small, independent services that communicate over well-defined APIs.

## Key Principles

### Single Responsibility
- Each service has one business capability
- Clear boundaries and interfaces
- Independent development and deployment

### Decentralized
- Service owns its data
- Autonomous teams
- Technology diversity

## Design Patterns

### API Gateway
- Single entry point
- Request routing
- Authentication/authorization
- Rate limiting

### Service Discovery
- Dynamic service registration
- Health checks
- Load balancing
- Failover mechanisms

### Circuit Breaker
- Fault tolerance
- Graceful degradation
- Recovery mechanisms

## Communication Patterns
- Synchronous (REST, GraphQL)
- Asynchronous (Message queues)
- Event-driven architecture
- Saga patterns for transactions

## Challenges
- Distributed system complexity
- Data consistency
- Service coordination
- Monitoring and debugging
      `,
    },

    // Interview Tips
    {
      category: "tips",
      title: "First 30 Days Interview Prep Plan",
      description:
        "Structured 30-day plan to prepare for technical and behavioral interviews.",
      type: "Plan",
      difficulty: "Beginner",
      readTime: "15 min",
      tags: ["preparation", "study-plan", "strategy"],
      featured: true,
      content: `
# 30-Day Interview Prep Plan

## Week 1: Foundation
- Day 1-2: Resume review and optimization
- Day 3-4: Research target companies
- Day 5-7: Basic algorithm practice

## Week 2: Technical Skills
- Day 8-10: Data structures review
- Day 11-12: System design basics
- Day 13-14: Mock technical interviews

## Week 3: Behavioral Prep
- Day 15-17: STAR method practice
- Day 18-19: Story preparation
- Day 20-21: Mock behavioral interviews

## Week 4: Final Preparation
- Day 22-24: Company-specific research
- Day 25-26: Final mock interviews
- Day 27-28: Review and relaxation

## Daily Routine
- 2 hours focused study
- 1 coding problem
- 30 minutes reading
- Review and notes

## Resources Needed
- LeetCode/HackerRank account
- System design book
- Mock interview platform
- Note-taking system
      `,
    },
    {
      category: "tips",
      title: "Interview Day Checklist",
      description:
        "Complete checklist for the day of your interview to ensure you're fully prepared.",
      type: "Checklist",
      difficulty: "Beginner",
      readTime: "10 min",
      tags: ["checklist", "interview-day", "preparation"],
      featured: false,
      content: `
# Interview Day Checklist

## Night Before
- [ ] Review company research notes
- [ ] Prepare questions to ask
- [ ] Set out professional attire
- [ ] Get 7-8 hours of sleep
- [ ] Charge devices and test video setup

## Morning Of
- [ ] Eat a healthy breakfast
- [ ] Review your resume
- [ ] Practice elevator pitch
- [ ] Arrive 10-15 minutes early
- [ ] Bring extra copies of resume

## During Interview
- [ ] Make eye contact
- [ ] Ask clarifying questions
- [ ] Think out loud during technical problems
- [ ] Take notes
- [ ] Show enthusiasm

## After Interview
- [ ] Send thank you email within 24 hours
- [ ] Document key points discussed
- [ ] Note any follow-up items
- [ ] Reflect on performance
- [ ] Continue job search process
      `,
    },

    // Tools & Prep
    {
      category: "tools",
      title: "Essential Interview Tools",
      description:
        "List of tools and platforms to help you prepare for technical interviews.",
      type: "Resource List",
      difficulty: "Beginner",
      readTime: "15 min",
      tags: ["tools", "platforms", "preparation"],
      featured: false,
      content: `
# Essential Interview Tools

## Coding Practice Platforms
- **LeetCode**: Best for algorithm practice
- **HackerRank**: Good for beginners
- **CodeSignal**: Real interview environment
- **Pramp**: Free mock interviews

## System Design Resources
- **Grokking the System Design Interview**: Comprehensive course
- **High Scalability**: Real-world examples
- **System Design Primer**: GitHub resource
- **Designing Data-Intensive Applications**: Advanced book

## Mock Interview Platforms
- **InterviewBit**: Technical interviews
- **Pramp**: Peer-to-peer practice
- **Interviewing.io**: Anonymous practice
- **CodeSignal**: Company-specific prep

## Resume & Career Tools
- **LinkedIn**: Professional networking
- **Glassdoor**: Company insights
- **AngelList**: Startup opportunities
- **Indeed**: Job search

## Communication Tools
- **Zoom**: Video interviews
- **CodePen**: Live coding demos
- **GitHub**: Portfolio showcase
- **Notion**: Note organization
      `,
    },
  ];

  const filteredResources =
    selectedCategory === "all"
      ? resources
      : resources.filter((resource) => resource.category === selectedCategory);

  const featuredResources = resources.filter((resource) => resource.featured);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "Advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Guide":
        return "bg-blue-100 text-blue-800";
      case "Course":
        return "bg-purple-100 text-purple-800";
      case "Q&A":
        return "bg-green-100 text-green-800";
      case "Template":
        return "bg-orange-100 text-orange-800";
      case "Plan":
        return "bg-indigo-100 text-indigo-800";
      case "Checklist":
        return "bg-pink-100 text-pink-800";
      case "Resource List":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Resources - InterviewAI</title>
        <meta
          name="description"
          content="Interview preparation resources, guides, and study materials"
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
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
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
                  className="text-blue-600 border-b-2 border-blue-600 px-3 py-2 text-sm font-medium"
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
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <h1 className="text-3xl font-bold mb-2">Learning Resources 📚</h1>
              <p className="text-green-100">
                Comprehensive guides, tips, and materials to ace your interviews
              </p>
            </div>
          </div>

          {/* Featured Resources */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Featured Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredResources.map((resource, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                          resource.type
                        )}`}
                      >
                        {resource.type}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                          resource.difficulty
                        )}`}
                      >
                        {resource.difficulty}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {resource.readTime}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {resource.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {resource.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Read Resource
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Browse by Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {resourceCategories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    selectedCategory === category.value
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"
                  }`}
                >
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <div className="text-sm font-medium">{category.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* All Resources */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {selectedCategory === "all"
                ? "All Resources"
                : resourceCategories.find((c) => c.value === selectedCategory)
                    ?.label}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredResources.length} resources)
              </span>
            </h2>

            <div className="space-y-6">
              {filteredResources.map((resource, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                            resource.type
                          )}`}
                        >
                          {resource.type}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                            resource.difficulty
                          )}`}
                        >
                          {resource.difficulty}
                        </span>
                        {resource.featured && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {resource.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {resource.description}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      <div>{resource.readTime}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {resource.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Read Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResourcesPage;
