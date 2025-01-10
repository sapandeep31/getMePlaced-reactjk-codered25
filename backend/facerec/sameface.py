import cv2
import numpy as np
import mediapipe as mp

class HeadPoseDetector:
    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
    def detect_pose(self, frame):
        # Convert BGR to RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_frame)
        
        if results.multi_face_landmarks:
            face_landmarks = results.multi_face_landmarks[0]
            
            # Get key facial points
            nose_tip = face_landmarks.landmark[4]
            left_cheek = face_landmarks.landmark[234]
            right_cheek = face_landmarks.landmark[454]
            forehead = face_landmarks.landmark[10]
            chin = face_landmarks.landmark[152]
            
            # Convert normalized coordinates to pixel coordinates
            h, w, _ = frame.shape
            nose_pos = (int(nose_tip.x * w), int(nose_tip.y * h))
            left_cheek_pos = (int(left_cheek.x * w), int(left_cheek.y * h))
            right_cheek_pos = (int(right_cheek.x * w), int(right_cheek.y * h))
            forehead_pos = (int(forehead.x * w), int(forehead.y * h))
            chin_pos = (int(chin.x * w), int(chin.y * h))
            
            # Calculate horizontal head turn
            left_dist = abs(nose_pos[0] - left_cheek_pos[0])
            right_dist = abs(nose_pos[0] - right_cheek_pos[0])
            turn_ratio = left_dist / right_dist if right_dist != 0 else float('inf')
            
            # Calculate vertical head tilt
            vertical_dist = abs(forehead_pos[1] - chin_pos[1])
            nose_relative_pos = (nose_pos[1] - forehead_pos[1]) / vertical_dist if vertical_dist != 0 else 0.5
            
            # Determine head pose with wider center range
            # Using 0.7 to 1.3 instead of 0.8 to 1.2 for a more lenient center zone
            horizontal_pose = "center"
            if turn_ratio > 1.5:
                horizontal_pose = "turning right"
            elif turn_ratio < 0.7:
                horizontal_pose = "turning left"
                
            # Add ratio indicator to help with calibration
            ratio_text = f"Ratio: {turn_ratio:.2f}"
            
            vertical_pose = "center"
            if nose_relative_pos > 0.6:
                vertical_pose = "looking down"
            elif nose_relative_pos < 0.4:
                vertical_pose = "looking up"
            
            # Draw visualization
            cv2.circle(frame, nose_pos, 3, (0, 255, 0), -1)
            cv2.circle(frame, left_cheek_pos, 3, (0, 255, 0), -1)
            cv2.circle(frame, right_cheek_pos, 3, (0, 255, 0), -1)
            cv2.circle(frame, forehead_pos, 3, (0, 255, 0), -1)
            cv2.circle(frame, chin_pos, 3, (0, 255, 0), -1)
            
            # Draw lines between points
            cv2.line(frame, nose_pos, left_cheek_pos, (255, 0, 0), 1)
            cv2.line(frame, nose_pos, right_cheek_pos, (255, 0, 0), 1)
            cv2.line(frame, forehead_pos, chin_pos, (255, 0, 0), 1)
            
            # Add text showing pose and measurements
            cv2.putText(frame, f"Horizontal: {horizontal_pose}", (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            cv2.putText(frame, f"Vertical: {vertical_pose}", (10, 60),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            
            return frame, horizontal_pose, vertical_pose
        
        return frame, "no face detected", "no face detected"

def main():
    cap = cv2.VideoCapture(0)
    detector = HeadPoseDetector()
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        frame, h_pose, v_pose = detector.detect_pose(frame)
        
        cv2.imshow('Head Pose Detection', frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()