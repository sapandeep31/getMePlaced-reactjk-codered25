import { type FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { useEffect, useState, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { ToolCall } from "../../multimodal-live-types";

interface FeedbackType {
  text: string;
  score: number;
  strengths: string[];
  improvements: string[];
}

const declaration: FunctionDeclaration = {
  name: "generate_feedback",
  description: "Displays interview feedback with detailed analysis",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      text: {
        type: SchemaType.STRING,
        description: "Detailed interview feedback",
      },
      score: {
        type: SchemaType.NUMBER,
        description: "Interview performance score (0-100)",
      },
      strengths: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
        description: "Key strengths demonstrated",
      },
      improvements: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
        description: "Areas for improvement",
      },
    },
    required: ["text", "score", "strengths", "improvements"],
  },
};

function InterviewAssistantComponent() {
  const navigate = useNavigate();
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackType | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const { client, setConfig, disconnect } = useLiveAPIContext();

  const handleDisconnect = useCallback(() => {
    setIsDisconnecting(true);
    disconnect();
    setTimeout(() => {
      navigate("/");
    }, 2000);
  }, [disconnect, navigate]);

  useEffect(() => {
    const resumeText = localStorage.getItem("candidateResume");
    if (!resumeText) {
      navigate("/");
      return;
    }

    setConfig({
      model: "models/gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: "audio",
      },
      systemInstruction: {
        parts: [
          {
            text: `You are a seasoned and cool technical interviewer evaluating candidates for a software engineering position. Your goal is to create an engaging, insightful, and professional interview experience, assessing candidates' technical skills, problem-solving abilities, and their overall potential as team contributors. Balance rigor with encouragement to help the candidate perform at their best.

INTERVIEW STRUCTURE:
1. Introduction (2-3 minutes)
   - Welcome the candidate warmly and set a positive tone.
   - Briefly review their background, referencing their resume.
   - Start with a relaxed, non-technical question to ease them in.

2. Technical Assessment (15-20 minutes)
   - Begin with foundational technical concepts or basic Data Structures and Algorithms (DSA) questions.
   - Gradually progress to medium or advanced levels based on their responses, tailoring questions to their skill level but keeping it appropriate for freshers.
   - Explore areas like:
     - Data Structures & Algorithms
     - Programming Languages
     - Operating Systems
     - Databases
     - Computer Networks (focus on skills and topics highlighted in their resume).
   - Include coding problems, design scenarios, and logical problem-solving tasks.

3. Project Deep Dive (5-10 minutes)
   - Discuss specific projects they've listed in their resume.
   - Ask about technical decisions, challenges faced, and solutions implemented.
   - Probe to understand the candidate's depth of knowledge and personal contribution to these projects.

4. Extracurriculars and HR Perspective (5-10 minutes)
   - Inquire about extracurricular activities, hobbies, or experiences in college clubs.
   - Pose simple workplace scenarios, puzzles, or behavioral questions to evaluate their mindset, values, and interpersonal skills.
   - Keep the tone light, friendly, and conversational to build rapport.

CANDIDATE RESUME DETAILS:
${resumeText}

FEEDBACK GENERATION:
Evaluate the candidate holistically across the following categories:
1. Technical knowledge (40%)
2. Problem-solving skills (20%)
3. Project understanding (20%)
4. Personal values and mindset (10%)
5. Communication skills (10%)`,
          },
        ],
      },
      tools: [{ functionDeclarations: [declaration] }],
    });
  }, [setConfig, navigate]);

  useEffect(() => {
    const onToolCall = (toolCall: ToolCall) => {
      console.log(`got toolcall`, toolCall);
      const fc = toolCall.functionCalls.find(
        (fc) => fc.name === declaration.name
      );
      if (fc) {
        const args = fc.args as FeedbackType;
        setFeedback(args);
        setIsInterviewActive(false);
      }

      if (toolCall.functionCalls.length) {
        setTimeout(
          () =>
            client.sendToolResponse({
              functionResponses: toolCall.functionCalls.map((fc) => ({
                response: { output: { success: true } },
                id: fc.id,
              })),
            }),
          200
        );
      }
    };
    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg mb-6 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Technical Interview Assistant</h2>
          <div className="flex items-center gap-4">
            {isInterviewActive && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Interview in Progress
              </span>
            )}
          </div>
        </div>
        <p className="text-gray-600 mb-4">
          Say "start interview" to begin and "finish interview" when you're
          done.
        </p>
        {isDisconnecting && (
          <div className="bg-blue-50 text-blue-700 p-4 rounded-lg mt-4">
            Disconnecting from the interview session...
          </div>
        )}
      </div>

      {feedback && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Interview Feedback</h2>
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Overall Score</span>
              <span className="text-lg font-medium">{feedback.score}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000"
                style={{ width: `${feedback.score}%` }}
              ></div>
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 mb-6">{feedback.text}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-green-700 mb-3">
                  Key Strengths
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  {feedback.strengths.map((strength, idx) => (
                    <li key={idx} className="text-gray-700">
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-orange-700 mb-3">
                  Areas for Improvement
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  {feedback.improvements.map((improvement, idx) => (
                    <li key={idx} className="text-gray-700">
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const InterviewAssistant = memo(InterviewAssistantComponent);
