from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
import uvicorn
from datetime import datetime
from assessment_logic import DevelopmentalScreeningBot

app = FastAPI(title="Health Assessment API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class DevelopmentalAssessment(BaseModel):
    name: str  # Parent/Guardian name
    email: EmailStr
    age: int  # Child's age
    marital_status: str  # Relationship to child

    # Behavioral Domain
    eye_contact: Optional[str] = ""
    literal_understanding: Optional[str] = ""
    repetitive_behaviors: Optional[str] = ""
    intense_interests: Optional[str] = ""
    change_upset: Optional[str] = ""
    social_difficulty: Optional[str] = ""

    # Cognitive/Attention Domain
    seated_difficulty: Optional[str] = ""
    forgetful: Optional[str] = ""
    sidetracked: Optional[str] = ""
    blurting: Optional[str] = ""
    task_avoidance: Optional[str] = ""
    constant_motion: Optional[str] = ""

    # Motor Skills Domain
    clumsy: Optional[str] = ""
    fine_motor_tasks: Optional[str] = ""
    muscle_tone: Optional[str] = ""
    hand_preference: Optional[str] = ""
    coordination_issues: Optional[str] = ""
    crawling_abnormal: Optional[str] = ""

    # Language/Academic Domain
    letter_mixing: Optional[str] = ""
    phonics_struggle: Optional[str] = ""
    reading_avoidance: Optional[str] = ""
    multi_step_instructions: Optional[str] = ""
    word_finding: Optional[str] = ""
    verbal_writing_gap: Optional[str] = ""

class AssessmentResponse(BaseModel):
    success: bool
    message: str
    overall_risk: str
    domain_scores: dict
    flagged_domains: list
    detailed_message: str
    recommendations: list
    assessment_id: Optional[str] = None

# In-memory storage
assessments_db = []
assessment_bot = DevelopmentalScreeningBot()

@app.get("/")
async def root():
    return {"message": "Health Assessment API is running"}

@app.post("/api/submit-assessment", response_model=AssessmentResponse)
async def submit_assessment(assessment: DevelopmentalAssessment):
    try:
        # Validate that at least one developmental question is answered
        developmental_responses = {
            # Behavioral
            "eye_contact": assessment.eye_contact,
            "literal_understanding": assessment.literal_understanding,
            "repetitive_behaviors": assessment.repetitive_behaviors,
            "intense_interests": assessment.intense_interests,
            "change_upset": assessment.change_upset,
            "social_difficulty": assessment.social_difficulty,

            # Cognitive/Attention
            "seated_difficulty": assessment.seated_difficulty,
            "forgetful": assessment.forgetful,
            "sidetracked": assessment.sidetracked,
            "blurting": assessment.blurting,
            "task_avoidance": assessment.task_avoidance,
            "constant_motion": assessment.constant_motion,

            # Motor Skills
            "clumsy": assessment.clumsy,
            "fine_motor_tasks": assessment.fine_motor_tasks,
            "muscle_tone": assessment.muscle_tone,
            "hand_preference": assessment.hand_preference,
            "coordination_issues": assessment.coordination_issues,
            "crawling_abnormal": assessment.crawling_abnormal,

            # Language/Academic
            "letter_mixing": assessment.letter_mixing,
            "phonics_struggle": assessment.phonics_struggle,
            "reading_avoidance": assessment.reading_avoidance,
            "multi_step_instructions": assessment.multi_step_instructions,
            "word_finding": assessment.word_finding,
            "verbal_writing_gap": assessment.verbal_writing_gap,
        }

        answered_questions = [q for q in developmental_responses.values() if q and q.strip()]

        if len(answered_questions) == 0:
            raise HTTPException(
                status_code=400,
                detail="Please answer at least one developmental question"
            )

        # Calculate domain scores using the assessment bot
        domain_scores = assessment_bot.calculate_domain_scores(developmental_responses)
        assessment_result = assessment_bot.generate_assessment(domain_scores, assessment.age)

        # Create assessment record
        assessment_record = {
            "id": f"assessment_{len(assessments_db) + 1}",
            "timestamp": datetime.now().isoformat(),
            "data": assessment.dict(),
            "domain_scores": domain_scores,
            "result": assessment_result
        }

        # Store assessment
        assessments_db.append(assessment_record)

        print(f"New developmental screening submitted:")
        print(f"  Parent/Guardian: {assessment.name}")
        print(f"  Child Age: {assessment.age}")
        print(f"  Domain Scores: {domain_scores}")
        print(f"  Overall Risk: {assessment_result['overall_risk']}")
        print(f"  Flagged Domains: {assessment_result['flagged_domains']}")

        return AssessmentResponse(
            success=True,
            message=assessment_result['message'],
            overall_risk=assessment_result['overall_risk'],
            domain_scores=assessment_result['domain_scores'],
            flagged_domains=assessment_result['flagged_domains'],
            detailed_message=assessment_result['detailed_message'],
            recommendations=assessment_result['recommendations'],
            assessment_id=assessment_record['id']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error processing assessment: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/assessments")
async def get_assessments():
    """Get all assessments (for admin purposes)"""
    return {
        "total_assessments": len(assessments_db),
        "assessments": assessments_db
    }

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    print("Starting Health Assessment API server...")
    print("API will be available at: http://localhost:8000")
    print("API docs available at: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
