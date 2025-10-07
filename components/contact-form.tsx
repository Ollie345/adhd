"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Mail, User, MessageSquare } from "lucide-react"

interface FormDataState {
  name: string
  email: string
  hot_flashes: string
  irregular_periods: string
  sleep_issues: string
  mood_changes: string
  vaginal_dryness: string
  libido_changes: string
  memory_focus: string
  weight_changes: string
  hair_changes: string
  joint_pain: string
}

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

export default function ContactForm() {
  const [formData, setFormData] = useState<FormDataState>({
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

  /* ---------- Handlers ---------- */
  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError("")
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    // Validate required fields
    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Please fill in your name and email")
      setIsSubmitting(false)
      return
    }

    // Check if at least some questions are answered
    const answeredQuestions = Object.keys(questions).filter(
      (key) => formData[key as keyof typeof questions].trim() !== "",
    )
    if (answeredQuestions.length === 0) {
      setError("Please answer at least one health question")
      setIsSubmitting(false)
      return
    }

    try {
      // simulate network request
      await new Promise((r) => setTimeout(r, 1500))
      setIsSubmitted(true)
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
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  /* ---------- Success ---------- */
  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900">Assessment Complete!</h2>
            <p className="text-gray-600">
              Thank you for completing the health assessment. We'll review your responses and get back to you soon.
            </p>
            <Button onClick={() => setIsSubmitted(false)} className="w-full">
              Take Another Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  /* ---------- Form ---------- */
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Health Assessment</h1>
        <p className="text-gray-600">
          Take our confidential questionnaire to assess your symptoms and get personalized guidance.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Health Assessment Form
          </CardTitle>
          <CardDescription>
            Complete this confidential health questionnaire to help us understand your symptoms.
          </CardDescription>
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
                  Email
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
              <h3 className="text-lg font-semibold text-gray-900">Health Assessment</h3>
              <p className="text-sm text-gray-600">
                Please answer the following questions about your recent health experiences:
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
                        checked={formData[key as keyof FormDataState] === "yes"}
                        onChange={handleChange}
                        className="text-blue-600"
                      />
                      <span className="text-sm">Yes</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={key}
                        value="no"
                        checked={formData[key as keyof FormDataState] === "no"}
                        onChange={handleChange}
                        className="text-blue-600"
                      />
                      <span className="text-sm">No</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={key}
                        value="sometimes"
                        checked={formData[key as keyof FormDataState] === "sometimes"}
                        onChange={handleChange}
                        className="text-blue-600"
                      />
                      <span className="text-sm">Sometimes</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting Assessment…" : "Submit Health Assessment"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-gray-500">
        We respect your privacy and will never share your information.
      </p>
    </div>
  )
}
