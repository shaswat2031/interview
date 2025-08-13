const loadTemplateData = () => {
  try {
    const templateData = localStorage.getItem("interviewTemplate");
    if (templateData) {
      const template = JSON.parse(templateData);

      // Pre-fill the form with template data
      setInterviewData({
        type: template.type || "",
        company: template.company || "",
        jobTitle: template.jobTitle || "",
        difficulty: template.difficulty || "Intermediate",
        duration: template.duration || 30,
        focus: template.focus || [],
        customRequirements: template.customRequirements || "",
      });

      // Clear the template data from localStorage after using it
      localStorage.removeItem("interviewTemplate");

      // Auto-advance to step 2 since template is pre-filled
      setStep(2);
    }
  } catch (err) {
    console.error("Error loading template data:", err);
  }
};
