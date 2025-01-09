import { useEffect, useState, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";

function DSAPracticeCompanionComponent() {
  const navigate = useNavigate();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const { client, setConfig, disconnect } = useLiveAPIContext();

  const dsaResources = [
    {
      title: "Blind 75 LeetCode Questions",
      description:
        "Must-do list of coding interview questions covering various DSA topics",
      url: "https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions",
    },
    {
      title: "LeetCode Top 150",
      description:
        "Essential interview preparation questions curated by LeetCode",
      url: "https://leetcode.com/studyplan/top-interview-150/",
    },
    {
      title: "Love Babbar DSA Sheet",
      description: "Comprehensive DSA problems from GeeksforGeeks",
      url: "https://www.geeksforgeeks.org/dsa-sheet-by-love-babbar/",
    },
  ];

  const handleDisconnect = useCallback(() => {
    setIsDisconnecting(true);
    disconnect();
    setTimeout(() => {
      navigate("/");
    }, 2000);
  }, [disconnect, navigate]);

  useEffect(() => {
    setConfig({
      model: "models/gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: "audio",
      },
      systemInstruction: {
        parts: [
          {
            text: `You are an expert DSA mentor helping users solve coding problems. Your role is to guide them through problem-solving while promoting learning and understanding, not just providing solutions Ask the user to share their screen and help them solve questions.

MENTORING APPROACH:
1. Problem Analysis (2-3 minutes)
   - Help break down the problem statement
   - Guide in identifying constraints and edge cases
   - Assist with developing test cases
   - Encourage users to think about input/output examples

2. Solution Development (5-10 minutes)
   - Start with brute force approach discussion
   - Guide towards optimization through leading questions
   - Help identify relevant data structures and algorithms
   - Discuss time and space complexity trade-offs
   - Encourage pattern recognition with similar problems

3. Implementation Support
   - Provide syntax guidance when needed
   - Help with debugging
   - Suggest coding best practices
   - Point out common pitfalls to avoid
   - Review and optimize code

4. Learning Reinforcement
   - Explain core concepts and principles
   - Connect current problem to similar patterns
   - Suggest related problems for practice
   - Share helpful resources and tips
   - Encourage good problem-solving habits

Remember to:
- Ask clarifying questions
- Give hints instead of direct solutions
- Be patient and supportive
- Focus on understanding over memorization
- Maintain an encouraging tone throughout`,
          },
        ],
      },
    });
  }, [setConfig]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              DSA Practice Companion
            </h2>
            <div className="flex items-center gap-4">
              {isSessionActive && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Session Active
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">
              Get help solving DSA problems with our AI mentor. Follow these
              steps:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Open a DSA problem in a new tab from the resources below</li>
              <li>Share your screen with the problem visible</li>
              <li>Say "start session" to begin getting help</li>
              <li>Discuss your approach and ask questions</li>
              <li>Say "end session" when you're finished</li>
            </ol>
          </div>

          {isDisconnecting && (
            <div className="bg-blue-50 text-blue-700 p-4 rounded-lg mt-4">
              Ending practice session...
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Popular DSA Problem Sets
          </h2>
          <div className="space-y-4">
            {dsaResources.map((resource, idx) => (
              <a
                key={idx}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {resource.title}
                    </h3>
                    <p className="mt-1 text-gray-600">{resource.description}</p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export const DSAPracticeCompanion = memo(DSAPracticeCompanionComponent);
