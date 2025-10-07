"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

const LandingPage = ({ onStartAssessment }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8">
          {/* Header Badge */}
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-4 py-2 text-sm">
            👶 Free 5-Minute Developmental Screening
          </Badge>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Concerned About Your Child's <span className="text-blue-600">Development?</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              This screening tool can help identify potential developmental concerns in behavioral, cognitive, motor, and language areas.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-sm sm:text-base text-blue-800 font-medium text-center">
                💭 Please think about your child's behavior over the last 6 months when answering questions.
              </p>
            </div>
          </div>

          {/* Simple Benefits */}
          <Card className="max-w-2xl mx-auto mx-4 sm:mx-auto">
            <CardContent className="p-6 sm:p-8 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Get insights in 5 minutes:</h2>
              <div className="space-y-2 text-gray-700">
                <p>✅ Screen across 4 developmental domains</p>
                <p>✅ Identify potential areas of concern</p>
                <p>✅ Get personalized next steps</p>
              </div>
            </CardContent>
          </Card>

          {/* Single Testimonial */}
          <div className="bg-blue-50 p-4 sm:p-6 rounded-lg max-w-2xl mx-auto mx-4 sm:mx-auto">
            <p className="text-gray-700 italic mb-3">
              "The screening helped us understand our concerns and know when to seek professional evaluation."
            </p>
            <p className="text-blue-700 font-semibold">— Maria, Parent</p>
          </div>

          {/* CTA */}
          <Card className="max-w-xl mx-auto bg-gradient-to-r from-blue-500 to-indigo-500 text-white mx-4 sm:mx-auto">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-bold mb-3">Ready to get insights?</h2>
              <Button
                onClick={onStartAssessment}
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 text-lg w-full sm:w-auto"
              >
                Start Free Screening
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>

          {/* Trust Line */}
          <p className="text-sm text-gray-600">🔒 Completely private • 💯 Free • ⚡ Takes 5 minutes</p>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
