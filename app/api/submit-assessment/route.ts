import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calculateDomainScores, generateAssessment, questions, type DevelopmentalResponse } from "@/lib/assessment-bot"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>

    // Basic validation
    const requiredFields = ["name", "email", "age", "marital_status"]
    for (const field of requiredFields) {
      if (!body[field] || typeof body[field] !== "string" || (body[field] as string).trim() === "") {
        return NextResponse.json({ detail: `Missing field: ${field}` }, { status: 400 })
      }
    }

    // Build responses object for scoring
    const developmentalResponses: Record<string, DevelopmentalResponse> = {}
    Object.keys(questions).forEach((key) => {
      const val = String(body[key] ?? "")
      developmentalResponses[key] = ["1", "2", "3", "4"].includes(val) ? (val as DevelopmentalResponse) : ""
    })

    const domainScores = calculateDomainScores(developmentalResponses)
    const result = generateAssessment(domainScores)

    // Save assessment to database
    try {
      const savedAssessment = await prisma.aDHDAssessment.create({
        data: {
          fullName: body.name as string,
          email: body.email as string,
          phone: (body.phone as string) || null,
          age: parseInt(body.age as string),
          maritalStatus: body.marital_status as string,
          medicalConditions: [], // Could be expanded if form includes this
          medications: (body.medications as string) || null,
          familyHistory: (body.family_history as string) || null,
          responses: developmentalResponses,
          behavioralScore: domainScores["Behavioral"],
          cognitiveScore: domainScores["Cognitive/Attention"],
          motorSkillsScore: domainScores["Motor Skills"],
          languageScore: domainScores["Language/Academic"],
          overallRisk: result.overallRisk as any,
          flaggedDomains: result.flaggedDomains,
          message: result.message,
          detailedMessage: result.detailed_message,
          recommendations: result.recommendations,
          completedAt: new Date(),
        },
      })

      console.log("Assessment saved to database:", savedAssessment.id)

    } catch (dbError) {
      console.error("Database save error:", dbError)
      // Continue with response even if database save fails
      // In production, you might want to handle this differently
    }

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      { status: 200 },
    )
  } catch (e) {
    console.error("API error:", e)
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 })
  }
}
