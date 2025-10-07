"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Mail, User, MessageSquare, AlertCircle, ArrowLeft } from "lucide-react"

const questions = {
  hot_flashes: "Have you been experiencing hot flashes or night sweats?",
  irregular_periods: "Have your menstrual periods become irregular or stopped?",
  sleep_issues: "Have you been having trouble sleeping through the night?",
  mood_changes: "Have you noticed significant mood swings or irritability?",
  vaginal_dryness: "Have you experienced vaginal dryness or discomfort during intercourse?",
  libido_changes: "Have you noticed changes in your sexual desire?",
  memory_focus: "Have you had problems with memory or concentration?",
  weight_changes: "Have you experienced unexplained weight gain?",
  hair_changes: "Have you noticed thinning hair or dry skin?",
  joint_pain: "Have you been experiencing joint pain or stiffness?",
}

const HealthAssessmentForm = ({ onBackToLanding }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    hot_flashes: "",
    irregular_periods: "",
    sleep_issues: "",
    mood_changes: "",
    vaginal_dryness: "",
    libido_changes: "",
    memory_focus: "",
    weight_changes: "",
    hair_changes: "",
    joint_pain: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    // Client-side validation
    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Please fill in your name and email")
      setIsSubmitting(false)
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch("http://localhost:8000/api/submit-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.detail || "Failed to submit assessment")
      }

      setSuccessMessage(result.message)
      setIsSubmitted(true)

      // Reset form
      setFormData({
        name: "",
        email: "",
        hot_flashes: "",
        irregular_periods: "",
        sleep_issues: "",
        mood_changes: "",
        vaginal_dryness: "",
        libido_changes: "",
        memory_focus: "",
        weight_changes: "",
        hair_changes: "",
        joint_pain: "",
      })
    } catch (err) {
      console.error("Submission error:", err)
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success state
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">Assessment Complete!</h2>
              <p className="text-gray-600">{successMessage}</p>
              <div className="space-y-2">
                <Button onClick={() => setIsSubmitted(false)} className="w-full">
                  Take Another Assessment
                </Button>
                <Button onClick={onBackToLanding} variant="outline" className="w-full">
                  Back to Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back Button */}
        <Button
          onClick={onBackToLanding}
          variant="ghost"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Information
        </Button>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Health Assessment</h1>
          <p className="text-gray-600">Complete this confidential questionnaire to get your personalized results.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Symptom Checker
            </CardTitle>
            <CardDescription>This will only take 3 minutes. Your information is completely private.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email (for your personalized report)
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Health Questions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Symptom Assessment</h3>
                <p className="text-sm text-gray-600">
                  Please answer honestly about your experiences in the past 3 months:
                </p>

                {Object.entries(questions).map(([key, question]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key} className="text-sm font-medium text-gray-700">
                      {question}
                    </Label>
                    <div className="flex gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={key}
                          value="yes"
                          checked={formData[key] === "yes"}
                          onChange={handleChange}
                          className="text-rose-600"
                        />
                        <span className="text-sm">Yes</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={key}
                          value="no"
                          checked={formData[key] === "no"}
                          onChange={handleChange}
                          className="text-rose-600"
                        />
                        <span className="text-sm">No</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={key}
                          value="sometimes"
                          checked={formData[key] === "sometimes"}
                          onChange={handleChange}
                          className="text-rose-600"
                        />
                        <span className="text-sm">Sometimes</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700" disabled={isSubmitting}>
                {isSubmitting ? "Getting Your Results…" : "Get My Personalized Results"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500">
          🔒 Your information is completely confidential and will never be shared.
        </p>
      </div>
    </div>
  )
}

export default HealthAssessmentForm
