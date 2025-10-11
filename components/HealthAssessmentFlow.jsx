"use client"

import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import LandingPage from "./LandingPage"
import QuestionPage from "./QuestionPage"
import PersonalInfoPage from "./PersonalInfoPage"
import ResultsPage from "./ResultsPage"
import DomainProgress from "./DomainProgress"
import LoadingCube from "./LoadingCube"

const questions = {
  // Behavioral (Autism Spectrum)
  eye_contact: "During a conversation, does your child naturally make and hold eye contact without you reminding them?",
  literal_understanding: "Does your child take things very literally and have trouble understanding jokes, sarcasm, or phrases like 'break a leg'?",
  repetitive_behaviors: "When excited or upset, does your child repeat body movements like flapping their hands, rocking, or spinning?",
  intense_interests: "Does your child become extremely focused on one specific topic (e.g., dinosaurs, trains, a specific video game) and talk about it constantly?",
  change_upset: "Does your child get very upset by small changes, like a different brand of cereal or taking a new route to school?",
  social_difficulty: "Does your child struggle to make friends their own age and prefer to play alone or interact much more with adults?",

  // Cognitive/Attention (ADHD)
  seated_difficulty: "Does your child have great difficulty remaining seated during meals, homework, or in classroom settings?",
  forgetful: "Is your child unusually forgetful in daily activities, often losing track of toys, homework, jackets, or water bottles?",
  sidetracked: "Is your child easily sidetracked by background noises or things they see out the window, making it hard to finish tasks?",
  blurting: "Does your child frequently blurt out answers before questions are finished or have trouble waiting for their turn in games?",
  task_avoidance: "Does your child avoid or strongly dislike tasks that require sustained mental effort, like homework or lengthy puzzles?",
  constant_motion: "Would you describe your child as constantly 'on the go,' as if driven by a motor, often running or climbing in inappropriate situations?",

  // Motor Skills (Cerebral Palsy / Dyspraxia)
  clumsy: "Compared to other children the same age, does your child seem unusually clumsy, frequently tripping or bumping into things?",
  fine_motor_tasks: "Does your child struggle with fine motor tasks like buttoning a shirt, using a fork and spoon correctly, or writing neatly?",
  muscle_tone: "When you pick your child up, do their muscles feel unusually stiff and rigid, or unusually floppy and loose?",
  hand_preference: "Before the age of 4, does your child strongly prefer using one hand for all tasks like drawing and eating?",
  coordination_issues: "Does your child have trouble with coordinated movements like jumping with both feet, skipping, or catching a ball with two hands?",
  crawling_abnormal: "Did your child have an unusual way of crawling (e.g., using one leg, scooting on their bottom) or skip crawling altogether?",

  // Language/Academic (Dyslexia / Language Disorder)
  letter_mixing: "Does your child consistently mix up letters that look similar (like 'b' and 'd') or numbers (like '6' and '9')?",
  phonics_struggle: "When reading, does your child struggle to 'sound out' a new word, even after being shown the phonics rules multiple times?",
  reading_avoidance: "Does your child read slowly, guess words based on the first letter, or avoid reading for fun because it is so difficult?",
  multi_step_instructions: "Does your child have trouble remembering and following multi-step instructions, like 'Please go upstairs, get your shoes, and put them by the door'?",
  word_finding: "Does your child frequently mispronounce long words (e.g., saying 'aminal' for 'animal') or have trouble finding the right word when speaking?",
  verbal_writing_gap: "Is there a major difference between your child's verbal skills and their writing? (e.g., They can tell a great story but can't write it down).",
}

const HealthAssessmentFlow = () => {
  const [currentStep, setCurrentStep] = useState("landing") // landing, questions, personal, results
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState({})
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    age: "",
    marital_status: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [results, setResults] = useState(null)

  const questionKeys = Object.keys(questions)
  const totalQuestions = questionKeys.length

  // Domain mapping for each question key
  const questionKeyToDomain = useMemo(() => {
    const map = {}
    const assign = (keys, domain) => keys.forEach((k) => (map[k] = domain))
    assign([
      "eye_contact",
      "literal_understanding",
      "repetitive_behaviors",
      "intense_interests",
      "change_upset",
      "social_difficulty",
    ], "Behavioral")
    assign([
      "seated_difficulty",
      "forgetful",
      "sidetracked",
      "blurting",
      "task_avoidance",
      "constant_motion",
    ], "Cognitive/Attention")
    assign([
      "clumsy",
      "fine_motor_tasks",
      "muscle_tone",
      "hand_preference",
      "coordination_issues",
      "crawling_abnormal",
    ], "Motor Skills")
    assign([
      "letter_mixing",
      "phonics_struggle",
      "reading_avoidance",
      "multi_step_instructions",
      "word_finding",
      "verbal_writing_gap",
    ], "Language/Academic")
    return map
  }, [])

  const domains = [
    { id: "behavioral", label: "Behavioral" },
    { id: "cognitive", label: "Cognitive/Attention" },
    { id: "motor", label: "Motor Skills" },
    { id: "language", label: "Language/Academic" },
  ]

  const domainToKeys = useMemo(() => {
    const groups = {
      Behavioral: [],
      "Cognitive/Attention": [],
      "Motor Skills": [],
      "Language/Academic": [],
    }
    questionKeys.forEach((k) => {
      const d = questionKeyToDomain[k]
      if (d && groups[d]) groups[d].push(k)
    })
    return groups
  }, [questionKeys, questionKeyToDomain])

  const currentQuestionKey = questionKeys[currentQuestionIndex]
  const currentDomain = questionKeyToDomain[currentQuestionKey]

  const steps = useMemo(() => {
    const buildStep = (label) => {
      const keys = domainToKeys[label] || []
      const answered = keys.reduce((acc, k) => acc + (responses[k] ? 1 : 0), 0)
      return { label, total: keys.length, answered }
    }
    const raw = domains.map((d) => ({ id: d.id, ...buildStep(d.label) }))
    let stateAssigned = false
    return raw.map((s) => {
      if (s.label === currentDomain) {
        stateAssigned = true
        return { ...s, state: "current" }
      }
      if (!stateAssigned) return { ...s, state: s.answered === s.total && s.total > 0 ? "completed" : "pending" }
      return { ...s, state: "pending" }
    })
  }, [domains, domainToKeys, responses, currentDomain])

  const handleStartAssessment = () => {
    setCurrentStep("questions")
  }

  const handleQuestionResponse = (response) => {
    const currentQuestionKey = questionKeys[currentQuestionIndex]
    setResponses((prev) => ({
      ...prev,
      [currentQuestionKey]: response,
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      setCurrentStep("personal")
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    } else {
      setCurrentStep("landing")
    }
  }

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target
    setPersonalInfo((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (error) setError("")
  }

  const handleSubmitAssessment = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    // Validation
    if (!personalInfo.name.trim() || !personalInfo.email.trim() || !personalInfo.age || !personalInfo.marital_status) {
      setError("Please fill in all fields")
      setIsSubmitting(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(personalInfo.email)) {
      setError("Please enter a valid email address")
      setIsSubmitting(false)
      return
    }

    try {
      const assessmentData = {
        ...personalInfo,
        ...responses,
      }

      const response = await fetch("/api/submit-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assessmentData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.detail || "Failed to submit assessment")
      }

      setResults(result)
      setCurrentStep("loading")
      setTimeout(() => {
        setCurrentStep("results")
      }, 15000)
    } catch (err) {
      console.error("Submission error:", err)
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEmailResults = () => {
    // In a real app, this would trigger an email
    alert("Detailed results have been sent to your email!")
  }

  const handleStartOver = () => {
    setCurrentStep("landing")
    setCurrentQuestionIndex(0)
    setResponses({})
    setPersonalInfo({ name: "", email: "", age: "", marital_status: "" })
    setResults(null)
    setError("")
  }

  const handleBackToQuestions = () => {
    setCurrentStep("questions")
    setCurrentQuestionIndex(totalQuestions - 1)
  }

  // Render current step
  if (currentStep === "landing") {
    return <LandingPage onStartAssessment={handleStartAssessment} />
  }

  if (currentStep === "questions") {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-4 sm:space-y-6 px-4">
        <DomainProgress steps={steps} />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentQuestionKey}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <QuestionPage
              question={questions[currentQuestionKey]}
              questionKey={currentQuestionKey}
              currentIndex={currentQuestionIndex}
              totalQuestions={totalQuestions}
              response={responses[currentQuestionKey] || ""}
              onResponse={handleQuestionResponse}
              onNext={handleNextQuestion}
              onPrevious={handlePreviousQuestion}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }
  if (currentStep === "loading") {
    return (
      <div className="w-full max-w-2xl mx-auto px-4">
        <LoadingCube />
      </div>
    )
  }

  if (currentStep === "personal") {
    return (
      <PersonalInfoPage
        personalInfo={personalInfo}
        onPersonalInfoChange={handlePersonalInfoChange}
        onSubmit={handleSubmitAssessment}
        onPrevious={handleBackToQuestions}
        isSubmitting={isSubmitting}
        error={error}
      />
    )
  }

  if (currentStep === "results") {
    return <ResultsPage result={results} onEmailResults={handleEmailResults} onStartOver={handleStartOver} />
  }

  return null
}

export default HealthAssessmentFlow
