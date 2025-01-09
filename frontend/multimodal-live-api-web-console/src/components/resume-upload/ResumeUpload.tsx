import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ResumeUpload = () => {
  const [resumeText, setResumeText] = useState("");
  const navigate = useNavigate();

  const handleStartInterview = () => {
    if (!resumeText.trim()) {
      alert("Please paste your resume first");
      return;
    }
    localStorage.setItem("candidateResume", resumeText);
    navigate("/interview");
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            Technical Interview Preparation
          </h2>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div>
              <p className="text-gray-600 mb-4">
                Paste your resume below to begin the technical interview
                process. We'll analyze your background to provide a personalized
                interview experience.
              </p>
            </div>

            <div className="space-y-4">
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here..."
                className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />

              <button
                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors
                  ${
                    resumeText.trim()
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                onClick={handleStartInterview}
                disabled={!resumeText.trim()}
              >
                Start Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
