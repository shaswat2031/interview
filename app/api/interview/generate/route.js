import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { GoogleGenerativeAI } from "@google/generative-ai";
import User from "../../../../models/User";
import dbConnect from "../../../lib/mongodb";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    // Get token from header
    const authorization = request.headers.get("authorization");
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authorization.split(" ")[1];

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    // Get user from database
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { interviewData, profile } = await request.json();

    // Validate required fields
    if (!interviewData.type || !interviewData.company) {
      return NextResponse.json(
        {
          error: "Interview type and company are required",
        },
        { status: 400 }
      );
    }

    // Build the prompt for Gemini
    const prompt = buildInterviewPrompt(interviewData, profile);

    // Generate questions using Gemini
    let model;
    let result;

    try {
      // Try with gemini-1.5-flash first
      model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      result = await model.generateContent(prompt);
    } catch (error) {
      console.log("Failed with gemini-1.5-flash, trying gemini-1.5-pro...");
      try {
        // Fallback to gemini-1.5-pro
        model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        result = await model.generateContent(prompt);
      } catch (error2) {
        console.log("All Gemini models failed, using fallback questions");
        // If all AI models fail, use fallback questions
        const questions = createFallbackQuestions(interviewData);
        return NextResponse.json({
          questions,
          message:
            "Generated using fallback questions due to AI service unavailability",
        });
      }
    }
    const response = await result.response;
    const text = response.text();

    // Parse the response to extract questions
    const questions = parseQuestionsFromResponse(text, interviewData);

    return NextResponse.json({
      questions,
      prompt: prompt, // Include for debugging (remove in production)
    });
  } catch (error) {
    console.error("Interview generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate interview questions",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

function buildInterviewPrompt(interviewData, profile) {
  const {
    type,
    company,
    jobTitle,
    difficulty,
    duration,
    focus,
    customRequirements,
  } = interviewData;

  const experienceLevel = profile?.experience?.level || "Intermediate";
  const primarySkills = profile?.techStack?.primary?.join(", ") || "";
  const secondarySkills = profile?.techStack?.secondary?.join(", ") || "";
  const frameworks = profile?.techStack?.frameworks?.join(", ") || "";
  const databases = profile?.techStack?.databases?.join(", ") || "";
  const tools = profile?.techStack?.tools?.join(", ") || "";
  const currentRole = profile?.jobRole?.current || "";
  const targetRole = profile?.jobRole?.target || jobTitle;
  const industry = profile?.jobRole?.industry || "";

  // Calculate number of questions based on duration
  const questionCount = Math.max(3, Math.floor(duration / 5));

  // Get company-specific context
  const companyContext = getCompanyContext(company);
  const industryTrends = getIndustryTrends(industry);
  const roleSpecificChallenges = getRoleSpecificChallenges(targetRole);

  let prompt = `You are a DISTINGUISHED Senior Technical Interviewer and Hiring Director with 20+ years of experience across Fortune 500 companies, unicorn startups, and top-tier tech giants. You have personally interviewed over 5,000 candidates and hired executives at Google, Microsoft, Meta, Apple, Netflix, and emerging unicorns.

🏢 COMPANY INTELLIGENCE: ${company}
${companyContext}

🎯 TARGET ROLE ANALYSIS: ${targetRole}
${roleSpecificChallenges}

📊 INDUSTRY LANDSCAPE: ${industry}
${industryTrends}

👤 CANDIDATE DEEP PROFILE:
- Identity: ${profile?.personalInfo?.name || "Senior Candidate"}
- Experience Tier: ${experienceLevel}
- Current Position: ${currentRole}
- Career Trajectory: ${targetRole}
- Industry Domain: ${industry}
- Core Technical Arsenal: ${primarySkills}
- Supporting Technologies: ${secondarySkills}
- Framework Expertise: ${frameworks}
- Data Layer Mastery: ${databases}
- DevOps & Toolchain: ${tools}

🎯 INTERVIEW PARAMETERS:
- Interview Format: ${type}
- Target Company: ${company}
- Role Focus: ${jobTitle || targetRole}
- Complexity Level: ${difficulty}
- Time Allocation: ${duration} minutes
- Question Count: ${questionCount} (strategically distributed)
- Assessment Dimensions: ${focus.join(" • ")}
${customRequirements ? `- Special Requirements: ${customRequirements}` : ""}

🚀 ADVANCED QUESTION GENERATION MANDATE:

Generate EXACTLY ${questionCount} interview questions that demonstrate MASTERY-LEVEL interviewing expertise:

1. **COMPANY-SPECIFIC INTELLIGENCE**: Each question must reflect deep knowledge of ${company}'s:
   - Business model and revenue streams
   - Technical challenges and scale
   - Engineering culture and values
   - Recent product launches and strategic initiatives
   - Competitive landscape and market position

2. **ROLE-PRECISION TARGETING**: Questions must be laser-focused on:
   - Day-1 responsibilities and expectations
   - 30-60-90 day success metrics
   - Team collaboration patterns
   - Technical decision-making authority
   - Growth trajectory and advancement paths

3. **EXPERIENCE-CALIBRATED COMPLEXITY**: 
   - ${experienceLevel} level appropriate scenarios
   - Real-world problem-solving contexts
   - Progressive difficulty scaling
   - Multi-dimensional assessment criteria

4. **INDUSTRY-FORWARD THINKING**: Include cutting-edge topics:
   - Emerging technology adoption
   - Market disruption scenarios
   - Innovation leadership
   - Strategic technical vision

5. **UNIQUENESS GUARANTEE**: 
   - Zero generic questions
   - Company-specific case studies
   - Role-specific scenarios
   - Industry-relevant challenges

**RESPONSE FORMAT** (JSON Array):
[
  {
    "question": "Sophisticated, company-specific question text",
    "category": "Strategic category alignment",
    "context": "Deep rationale for question relevance",
    "difficulty": "Precisely calibrated level",
    "estimatedTime": "Realistic time allocation",
    "assessmentCriteria": "What excellent responses demonstrate",
    "followUpTriggers": "Potential deep-dive opportunities",
    "companyRelevance": "Specific ${company} connection"
  }
]

🎯 **QUESTION SOPHISTICATION REQUIREMENTS**:
- Incorporate real ${company} scenarios and challenges
- Reference industry-specific trends and technologies
- Include strategic thinking components
- Test both technical depth AND business acumen
- Evaluate cultural alignment with ${company}'s values
- Assess innovation mindset and future-thinking
- Include collaborative problem-solving elements

**QUALITY BENCHMARKS**:
✅ Each question is company-specific and cannot be used generically
✅ Questions test multiple competency dimensions simultaneously
✅ Scenarios reflect actual ${targetRole} responsibilities at ${company}
✅ Progressive complexity creates natural interview flow
✅ Questions reveal candidate's strategic thinking capability
✅ Assessment criteria align with ${company}'s hiring standards`;

  if (type === "Technical") {
    prompt += `\n\n🔧 **TECHNICAL INTERVIEW SPECIALIZATION**:
- **Architecture & Scale**: ${company}-specific scaling challenges
- **Innovation Projects**: Recent tech initiatives at ${company}
- **Code Excellence**: Standards and practices at ${company}
- **System Reliability**: Mission-critical system scenarios
- **Technology Leadership**: Technical decision-making frameworks
- **Cross-functional Collaboration**: Engineering-product-design alignment
- **Performance Optimization**: Real ${company} performance challenges
- **Security & Compliance**: Industry-specific security requirements`;
  } else if (type === "Behavioral") {
    prompt += `\n\n🧠 **BEHAVIORAL INTERVIEW MASTERY**:
- **${company} Culture Alignment**: Values-based scenario questions
- **Leadership Philosophy**: Situational leadership challenges
- **Innovation Mindset**: Creative problem-solving in ${company} context
- **Stakeholder Management**: Cross-functional influence scenarios
- **Conflict Resolution**: Real workplace relationship challenges
- **Growth Trajectory**: Career development and mentoring
- **Change Management**: Adapting to ${company}'s rapid evolution
- **Impact Measurement**: Quantifiable achievement stories`;
  } else if (type === "System Design") {
    prompt += `\n\n🏗️ **SYSTEM DESIGN EXCELLENCE**:
- **${company} Scale Challenges**: Actual system architecture problems
- **Technology Strategy**: Platform and infrastructure decisions
- **Scalability Planning**: Growth projection scenarios
- **Reliability Engineering**: Mission-critical system design
- **Data Architecture**: ${company}-relevant data challenges
- **Microservices Strategy**: Service decomposition decisions
- **Performance Engineering**: Latency and throughput optimization
- **Cost Optimization**: Cloud infrastructure efficiency`;
  }

  prompt += `\n\n🎯 **FINAL MANDATE**: Create questions so compelling and company-specific that they could only be used for a ${targetRole} interview at ${company}. Each question should make the candidate think: "This interviewer really understands ${company} and this role."`;

  return prompt;
}

function getCompanyContext(company) {
  const companyProfiles = {
    Google: `
🌟 GOOGLE CONTEXT:
- Scale: 4+ billion users, 200+ petabytes daily data processing
- Culture: "10x thinking", innovation, data-driven decisions, psychological safety
- Technical Challenges: Global infrastructure, AI/ML at scale, privacy, multi-product ecosystem
- Recent Focus: AI-first transformation, cloud computing growth, quantum computing, sustainability
- Engineering Excellence: Code quality, testing culture, site reliability engineering (SRE)
- Business Model: Advertising revenue, cloud services, hardware, subscription services`,

    Microsoft: `
🌟 MICROSOFT CONTEXT:
- Scale: 1+ billion Windows users, 375M+ Office 365 users, Azure growth leader
- Culture: Growth mindset, inclusion, customer obsession, "One Microsoft"
- Technical Challenges: Hybrid cloud, enterprise security, productivity at scale
- Recent Focus: AI integration (Copilot), cloud-first strategy, gaming (Xbox), mixed reality
- Engineering Excellence: DevOps leadership, open source contribution, accessibility
- Business Model: Cloud services, productivity software, gaming, hardware`,

    Amazon: `
🌟 AMAZON CONTEXT:
- Scale: 200M+ Prime members, millions of transactions/second, global logistics
- Culture: Customer obsession, ownership, invent and simplify, bias for action
- Technical Challenges: E-commerce scale, AWS infrastructure, supply chain optimization
- Recent Focus: AI/ML services, sustainability, healthcare, space (Blue Origin)
- Engineering Excellence: Microservices architecture, continuous deployment, operational excellence
- Business Model: E-commerce, cloud services (AWS), advertising, Prime subscriptions`,

    Meta: `
🌟 META CONTEXT:
- Scale: 3+ billion users across platforms, real-time global connectivity
- Culture: Move fast, focus on impact, be bold, build social value
- Technical Challenges: Social platform scale, content moderation, AR/VR infrastructure
- Recent Focus: Metaverse development, AI advancement, privacy-focused communication
- Engineering Excellence: React ecosystem, GraphQL, large-scale system design
- Business Model: Advertising revenue, future metaverse economy`,

    Netflix: `
🌟 NETFLIX CONTEXT:
- Scale: 250M+ subscribers globally, 1B+ hours watched weekly
- Culture: Freedom and responsibility, high performance, context not control
- Technical Challenges: Global content delivery, personalization algorithms, streaming quality
- Recent Focus: Global expansion, original content production, gaming platform
- Engineering Excellence: Microservices, chaos engineering, A/B testing culture
- Business Model: Subscription streaming, international expansion`,

    Apple: `
🌟 APPLE CONTEXT:
- Scale: 1.8B+ active devices, $380B+ annual revenue, premium market leader
- Culture: Innovation, privacy, design excellence, "Think Different"
- Technical Challenges: Hardware-software integration, privacy at scale, ecosystem cohesion
- Recent Focus: Services growth, AR/VR development, autonomous systems, health technology
- Engineering Excellence: Performance optimization, security, user experience design
- Business Model: Hardware sales, services ecosystem, App Store revenue`,

    Tesla: `
🌟 TESLA CONTEXT:
- Scale: 1M+ vehicles produced annually, global charging network, energy solutions
- Culture: Mission-driven (sustainable transport), innovation, rapid iteration
- Technical Challenges: Autonomous driving, battery technology, manufacturing scale
- Recent Focus: FSD development, energy storage, AI/robotics, global expansion
- Engineering Excellence: Vertical integration, software-defined vehicles, over-the-air updates
- Business Model: Vehicle sales, energy solutions, software services`,

    Spotify: `
🌟 SPOTIFY CONTEXT:
- Scale: 500M+ users, 70M+ tracks, 4M+ podcasts, global music platform
- Culture: Innovation, agility, data-driven, "Spotify Model" (autonomous squads)
- Technical Challenges: Music recommendation algorithms, real-time streaming, global licensing
- Recent Focus: Podcast expansion, AI-driven personalization, creator tools
- Engineering Excellence: Microservices, experimentation platform, machine learning
- Business Model: Premium subscriptions, advertising, creator monetization`,
  };

  return (
    companyProfiles[company] ||
    `
🌟 ${company.toUpperCase()} CONTEXT:
- Innovative company in the ${company} sector
- Focus on cutting-edge technology and market leadership
- Culture of excellence and continuous improvement
- Technical challenges related to scale and innovation
- Recent focus on digital transformation and growth`
  );
}

function getIndustryTrends(industry) {
  const industryInsights = {
    Technology: `
📈 TECH INDUSTRY TRENDS 2024:
- AI/ML Integration: LLMs, generative AI, autonomous systems
- Cloud-Native Architecture: Kubernetes, serverless, edge computing
- Developer Experience: Platform engineering, DevOps automation
- Security: Zero-trust architecture, privacy by design
- Sustainability: Green computing, carbon-neutral operations`,

    Finance: `
📈 FINTECH TRENDS 2024:
- Digital Banking: Neobanks, embedded finance, API banking
- Blockchain: DeFi, central bank digital currencies (CBDCs)
- AI in Finance: Risk assessment, algorithmic trading, fraud detection
- RegTech: Compliance automation, regulatory reporting
- Open Banking: API standardization, ecosystem partnerships`,

    Healthcare: `
📈 HEALTHTECH TRENDS 2024:
- Digital Health: Telemedicine, remote monitoring, health apps
- AI Diagnostics: Medical imaging, predictive analytics
- Interoperability: FHIR standards, health data exchange
- Cybersecurity: Patient data protection, HIPAA compliance
- Personalized Medicine: Genomics, precision treatments`,

    "E-commerce": `
📈 E-COMMERCE TRENDS 2024:
- Social Commerce: Live streaming, influencer integration
- AI Personalization: Recommendation engines, dynamic pricing
- Omnichannel: Unified customer experience across platforms
- Sustainability: Eco-friendly packaging, carbon footprint tracking
- Mobile-First: Progressive web apps, mobile payments`,

    Gaming: `
📈 GAMING INDUSTRY TRENDS 2024:
- Cloud Gaming: Streaming services, cross-platform play
- Metaverse Gaming: Virtual worlds, NFT integration
- AI in Games: Procedural generation, intelligent NPCs
- Mobile Gaming: Hyper-casual games, mobile esports
- Developer Tools: No-code game development, analytics platforms`,
  };

  return (
    industryInsights[industry] ||
    `
📈 ${industry.toUpperCase()} INDUSTRY TRENDS:
- Digital transformation and innovation leadership
- Technology adoption and competitive advantage
- Customer experience optimization
- Data-driven decision making
- Sustainable business practices`
  );
}

function getRoleSpecificChallenges(role) {
  const roleInsights = {
    "Software Engineer": `
🎯 SOFTWARE ENGINEER CHALLENGES:
- Code Quality: Maintainable, scalable, testable code
- System Design: Microservices, distributed systems, data consistency
- Performance: Optimization, profiling, resource management
- Collaboration: Cross-functional teamwork, code reviews, mentoring
- Technology Evolution: Staying current with frameworks and best practices`,

    "Frontend Developer": `
🎯 FRONTEND DEVELOPER CHALLENGES:
- User Experience: Responsive design, accessibility, performance optimization
- Framework Mastery: React/Vue/Angular, state management, component architecture
- Browser Compatibility: Cross-browser testing, progressive enhancement
- Performance: Bundle optimization, lazy loading, Core Web Vitals
- Design Systems: Component libraries, consistent UI/UX patterns`,

    "Backend Developer": `
🎯 BACKEND DEVELOPER CHALLENGES:
- API Design: RESTful services, GraphQL, versioning strategies
- Database Optimization: Query performance, indexing, data modeling
- Scalability: Load balancing, caching, horizontal scaling
- Security: Authentication, authorization, data protection
- Monitoring: Logging, metrics, debugging distributed systems`,

    "Full Stack Developer": `
🎯 FULL STACK DEVELOPER CHALLENGES:
- Technology Integration: Frontend-backend communication, API design
- End-to-End Ownership: Feature development from UI to database
- Performance Optimization: Client and server-side optimization
- DevOps Skills: Deployment, CI/CD, infrastructure understanding
- Business Logic: Translating requirements into technical solutions`,

    "DevOps Engineer": `
🎯 DEVOPS ENGINEER CHALLENGES:
- Infrastructure as Code: Terraform, CloudFormation, automation
- CI/CD Pipelines: Build, test, deployment automation
- Monitoring & Observability: Metrics, logging, alerting systems
- Security: Compliance, vulnerability management, secure deployments
- Cost Optimization: Resource management, cloud cost control`,

    "Data Engineer": `
🎯 DATA ENGINEER CHALLENGES:
- Data Pipeline Architecture: ETL/ELT, stream processing, batch processing
- Data Quality: Validation, cleansing, monitoring, governance
- Scalability: Big data technologies, distributed computing
- Real-time Processing: Event streaming, low-latency requirements
- Data Modeling: Dimensional modeling, data warehouse design`,

    "Machine Learning Engineer": `
🎯 ML ENGINEER CHALLENGES:
- Model Deployment: MLOps, model serving, version control
- Data Pipeline: Feature engineering, data quality, automated retraining
- Performance: Model optimization, inference latency, resource efficiency
- Monitoring: Model drift detection, performance metrics, A/B testing
- Scalability: Distributed training, model serving at scale`,

    "Product Manager": `
🎯 PRODUCT MANAGER CHALLENGES:
- Strategy Development: Product vision, roadmap planning, market analysis
- Stakeholder Alignment: Cross-functional collaboration, communication
- Data-Driven Decisions: Metrics analysis, A/B testing, user research
- Technical Understanding: Architecture awareness, feasibility assessment
- Market Dynamics: Competitive analysis, customer needs, business impact`,
  };

  return (
    roleInsights[role] ||
    `
🎯 ${role.toUpperCase()} CHALLENGES:
- Strategic thinking and technical excellence
- Cross-functional collaboration and leadership
- Innovation and problem-solving capabilities
- Industry-specific expertise and adaptability
- Continuous learning and professional growth`
  );
}

function parseQuestionsFromResponse(text, interviewData) {
  try {
    // Try to parse as JSON first
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const questionsJson = JSON.parse(jsonMatch[0]);
      return questionsJson.map((q, index) => ({
        question: q.question,
        category: q.category || interviewData.type,
        context: q.context || "",
        difficulty: q.difficulty || interviewData.difficulty,
        estimatedTime:
          typeof q.estimatedTime === "string"
            ? parseInt(q.estimatedTime.replace(/\D/g, "")) ||
              Math.ceil(interviewData.duration / 4)
            : q.estimatedTime || Math.ceil(interviewData.duration / 4),
        order: index + 1,
      }));
    }
  } catch (error) {
    console.log("JSON parsing failed, trying text parsing");
  }

  // Fallback: Parse as text format
  const questions = [];
  const lines = text.split("\n").filter((line) => line.trim());

  let currentQuestion = null;

  for (const line of lines) {
    if (line.match(/^\d+\./)) {
      // New question found
      if (currentQuestion) {
        questions.push(currentQuestion);
      }
      currentQuestion = {
        question: line.replace(/^\d+\.\s*/, "").trim(),
        category: interviewData.type,
        context: "",
        difficulty: interviewData.difficulty,
        estimatedTime: Math.ceil(interviewData.duration / 4),
        order: questions.length + 1,
      };
    } else if (currentQuestion && line.includes(":")) {
      // Additional details
      if (line.toLowerCase().includes("category")) {
        currentQuestion.category = line.split(":")[1].trim();
      } else if (line.toLowerCase().includes("context")) {
        currentQuestion.context = line.split(":")[1].trim();
      }
    }
  }

  if (currentQuestion) {
    questions.push(currentQuestion);
  }

  // If no questions parsed, create fallback questions
  if (questions.length === 0) {
    return createFallbackQuestions(interviewData);
  }

  return questions;
}

function createFallbackQuestions(interviewData) {
  const { type, jobTitle, company, difficulty } = interviewData;

  const fallbackQuestions = {
    Technical: [
      {
        question: `Tell me about your experience with the technologies you'd use in this ${jobTitle} role at ${company}.`,
        category: "Technical Experience",
        context: "Assessing technical background and relevance to the role",
        difficulty: "Beginner",
        estimatedTime: 5,
      },
      {
        question:
          "Walk me through how you would approach debugging a performance issue in production.",
        category: "Problem Solving",
        context: "Testing systematic problem-solving skills",
        difficulty: "Intermediate",
        estimatedTime: 8,
      },
      {
        question:
          "Describe a challenging technical project you worked on and how you overcame the obstacles.",
        category: "Technical Leadership",
        context: "Understanding technical decision-making and resilience",
        difficulty: "Advanced",
        estimatedTime: 10,
      },
    ],
    Behavioral: [
      {
        question:
          "Tell me about a time when you had to work with a difficult team member.",
        category: "Team Collaboration",
        context: "Assessing interpersonal skills and conflict resolution",
        difficulty: "Intermediate",
        estimatedTime: 5,
      },
      {
        question:
          "Describe a situation where you had to learn something completely new quickly.",
        category: "Learning Agility",
        context: "Understanding adaptability and learning approach",
        difficulty: "Intermediate",
        estimatedTime: 6,
      },
      {
        question: `Why do you want to work at ${company} and how does this role align with your career goals?`,
        category: "Motivation",
        context: "Assessing genuine interest and cultural fit",
        difficulty: "Beginner",
        estimatedTime: 4,
      },
    ],
    "System Design": [
      {
        question:
          "Design a URL shortening service like bit.ly. What components would you include?",
        category: "System Architecture",
        context: "Testing system design fundamentals",
        difficulty: "Intermediate",
        estimatedTime: 15,
      },
      {
        question:
          "How would you handle database scaling for a rapidly growing application?",
        category: "Scalability",
        context: "Understanding database optimization strategies",
        difficulty: "Advanced",
        estimatedTime: 10,
      },
    ],
  };

  const questions = fallbackQuestions[type] || fallbackQuestions["Technical"];

  return questions.map((q, index) => ({
    ...q,
    order: index + 1,
    difficulty: difficulty,
  }));
}
