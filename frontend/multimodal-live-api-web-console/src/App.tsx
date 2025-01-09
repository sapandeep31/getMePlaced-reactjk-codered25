import { useRef, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.scss";
import { LiveAPIProvider } from "./contexts/LiveAPIContext";
import SidePanel from "./components/side-panel/SidePanel";
import { InterviewAssistant } from "./components/interview/Interview";
import ResumeUpload from "./components/resume-upload/ResumeUpload";
import { DSAPracticeCompanion } from "./components/dsacompanion/dsacompanion";
import ControlTray from "./components/control-tray/ControlTray";
import cn from "classnames";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY as string;
if (typeof API_KEY !== "string") {
  throw new Error("set REACT_APP_GEMINI_API_KEY in .env");
}

const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  return (
    <Router>
      <div className="App">
        <LiveAPIProvider url={uri} apiKey={API_KEY}>
          <div className="streaming-console">
            <SidePanel />
            <main>
              <div className="main-app-area">
                <Routes>
                  <Route path="/resupload" element={<ResumeUpload />} />
                  <Route path="/interview" element={<InterviewAssistant />} />
                  <Route path="/dsa" element={<DSAPracticeCompanion />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <video
                  className={cn("stream", {
                    hidden: !videoRef.current || !videoStream,
                  })}
                  ref={videoRef}
                  autoPlay
                  playsInline
                />
              </div>

              <ControlTray
                videoRef={videoRef}
                supportsVideo={true}
                onVideoStreamChange={setVideoStream}
              >
                {/* put your own buttons here */}
              </ControlTray>
            </main>
          </div>
        </LiveAPIProvider>
      </div>
    </Router>
  );
}

export default App;
