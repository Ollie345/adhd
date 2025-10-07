"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Mail, ArrowRight, BarChart3, AlertCircle, Loader2 } from "lucide-react"

const ResultsPage = ({ result, onEmailResults, onStartOver }) => {
  const [emailSending, setEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailError, setEmailError] = useState('')

  // Handle loading state or missing result
  if (!result) {
    return (
      <div className="w-full max-w-lg mx-auto space-y-4 sm:space-y-6 px-4">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Loading Results...</h1>
        </div>
      </div>
    )
  }

  const getRiskColor = (risk) => {
    if (risk === "Low") return "bg-green-100 text-green-800"
    if (risk === "Moderate") return "bg-yellow-100 text-yellow-800"
    if (risk === "High") return "bg-red-100 text-red-800"
    return "bg-gray-100 text-gray-800"
  }

  const getDomainColor = (domain, flaggedDomains) => {
    if (!flaggedDomains) return "text-gray-700"
    return flaggedDomains.includes(domain) ? "text-red-600 font-semibold" : "text-gray-700"
  }

  const handleSendReport = async () => {
    setEmailSending(true)
    setEmailError('')

    try {
      const response = await fetch('/api/send-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(result),
      })

      const data = await response.json()

      if (data.success) {
        setEmailSent(true)
        console.log('Report sent successfully:', data)
      } else {
        setEmailError(data.error || 'Failed to send report')
      }
    } catch (error) {
      console.error('Error sending report:', error)
      setEmailError('Network error - please try again')
    } finally {
      setEmailSending(false)
    }
  }

  const maxScores = {
    "Behavioral": 24,
    "Cognitive/Attention": 24,
    "Motor Skills": 24,
    "Language/Academic": 24
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-4 sm:space-y-6 px-4">
      <div className="text-center space-y-2">
        <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-blue-500 mx-auto" />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Screening Results Ready!</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Developmental Screening Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Overall Risk Display */}
          <div className="text-center space-y-4">
            <Badge className={`${getRiskColor(result.overallRisk)} text-sm sm:text-base px-4 py-2`} variant="secondary">
              {result.overallRisk || "Unknown"} Risk Level
            </Badge>
          </div>

          {/* Domain Scores */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Domain Scores:</h4>
            {result.domainScores && Object.entries(result.domainScores).map(([domain, score]) => (
              <div key={domain} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className={`text-sm sm:text-base ${getDomainColor(domain, result.flaggedDomains)}`}>
                  {domain}
                </span>
                <span className={`text-sm sm:text-base font-semibold ${getDomainColor(domain, result.flaggedDomains)}`}>
                  {score || 0}/{maxScores[domain] || 24}
                  {result.flaggedDomains && result.flaggedDomains.includes(domain) && " ⚠️"}
                </span>
              </div>
            ))}
          </div>

          {/* Main Message */}
          <div className="bg-blue-50 p-4 sm:p-6 rounded-lg text-center space-y-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">{result.message || "Results not available"}</h3>
            <p className="text-sm sm:text-base text-gray-700">{result.detailed_message || "Detailed results will be provided after analysis."}</p>
          </div>

          {/* Recommendations */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Recommended Next Steps:</h4>
            <div className="space-y-2">
              {result.recommendations && result.recommendations.length > 0 ? (
                result.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                    <span className="text-green-600 mt-1">•</span>
                    <span>{recommendation}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs sm:text-sm text-gray-700">
                  No specific recommendations available.
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {emailSent ? (
              <div className="w-full bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-semibold">Report Sent Successfully!</p>
                <p className="text-green-600 text-sm">Check your email for the detailed PDF report</p>
              </div>
            ) : (
              <Button
                onClick={handleSendReport}
                disabled={emailSending}
                className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 text-sm sm:text-base py-2 sm:py-3 disabled:opacity-50"
              >
                {emailSending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Email Detailed Report (PDF)
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}

            {emailError && (
              <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <AlertCircle className="h-5 w-5 text-red-600 mx-auto mb-1" />
                <p className="text-red-800 text-sm">{emailError}</p>
              </div>
            )}

            <Button onClick={onStartOver} variant="outline" className="w-full text-sm sm:text-base">
              Take Screening Again
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs sm:text-sm text-gray-500 px-4">
        📧 Click "Email Detailed Report" to receive a comprehensive PDF with all results and recommendations.
      </p>
    </div>
  )
}

export default ResultsPage
