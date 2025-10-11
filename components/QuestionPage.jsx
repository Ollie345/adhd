"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

const QuestionPage = ({
  question,
  questionKey,
  currentIndex,
  totalQuestions,
  response,
  onResponse,
  onNext,
  onPrevious,
}) => {
  const progress = ((currentIndex + 1) / totalQuestions) * 100

  return (
    <div className="w-full max-w-lg mx-auto space-y-4 sm:space-y-6 px-4">
      {/* Progress Header (text only) */}
      <div className="flex justify-between text-xs sm:text-sm text-gray-600">
        <span>
          Question {currentIndex + 1} of {totalQuestions}
        </span>
        <span>{Math.round(progress)}% complete</span>
      </div>

      {/* Animated Progress Bar */}
      <div className="h-2 bg-gray-200 rounded">
        <motion.div
          className="h-2 bg-blue-600 rounded"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl text-gray-900 leading-tight">{question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Answer Options */}
          <div className="space-y-3">
            {[
              { value: "1", label: "Never/Rarely" },
              { value: "2", label: "Sometimes" },
              { value: "3", label: "Often" },
              { value: "4", label: "Always/Very Frequently" }
            ].map((option) => (
              <motion.label
                key={option.value}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`flex items-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${response === option.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                <input
                  type="radio"
                  name={questionKey}
                  value={option.value}
                  checked={response === option.value}
                  onChange={(e) => onResponse(e.target.value)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded-full border-2 mr-3 flex-shrink-0 ${response === option.value ? "border-blue-500 bg-blue-500" : "border-gray-300"
                    }`}
                >
                  {response === option.value && <div className="w-full h-full rounded-full bg-white scale-50"></div>}
                </div>
                <span className="text-base sm:text-lg font-medium">
                  {option.value} - {option.label}
                </span>
              </motion.label>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-4">
            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={onPrevious}
                variant="outline"
                disabled={currentIndex === 0}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
            </motion.div>

            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={onNext}
                disabled={!response}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              >
                {currentIndex === totalQuestions - 1 ? "Continue to Results" : "Next"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default QuestionPage
