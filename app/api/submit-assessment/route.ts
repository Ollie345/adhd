import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calculateDomainScores, generateAssessment, questions, type DevelopmentalResponse } from "@/lib/assessment-bot"
import { odooAuthenticate, ensureTag, ensurePartner, createLead, /* postNote */ } from "@/lib/odoo"

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

    // Build rich HTML description for Odoo (Internal Notes)
    const valueToLabel: Record<string, string> = {
      "1": "Never/Rarely",
      "2": "Sometimes",
      "3": "Often",
      "4": "Always/Very Frequently",
    }

    const escapeHTML = (s: unknown) =>
      String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")

    const domainMax: Record<string, number> = {
      Behavioral: 24,
      "Cognitive/Attention": 24,
      "Motor Skills": 24,
      "Language/Academic": 24,
    }

    const scoreRow = (domain: string) => {
      const score = (domainScores as any)[domain] ?? 0
      const max = domainMax[domain] ?? 24
      const flagged = (result.flaggedDomains || []).includes(domain)
      const status = flagged ? "Needs attention" : "Within range"
      return `<tr>
    <td>${escapeHTML(domain)}</td>
    <td>${escapeHTML(score)}</td>
    <td>${escapeHTML(max)}</td>
    <td>${escapeHTML(status)}</td>
  </tr>`
    }

    const responsesHtml = Object.entries(developmentalResponses)
      .map(([key, val]) => {
        const q = (questions as any)[key]?.question || key
        const label = val ? (valueToLabel[String(val)] || String(val)) : "N/A"
        return `<li><b>${escapeHTML(q)}:</b> ${escapeHTML(label)}</li>`
      })
      .join("")

    const recommendationsHtml = (result.recommendations || [])
      .map((r) => `<li>${escapeHTML(r)}</li>`)
      .join("")

    const flaggedDomainsHtml = (result.flaggedDomains || []).length
      ? escapeHTML(result.flaggedDomains.join(", "))
      : "None"

    const descriptionHTML = `
<h3 style="margin:0 0 6px 0;">Developmental Screening</h3>
<p style="margin:0 0 12px 0;">
  <b>Overall Risk:</b> ${escapeHTML(result.overallRisk)}
</p>

<h4 style="margin:12px 0 6px 0;">Personal Info</h4>
<ul style="margin:0 0 12px 18px; padding:0;">
  <li><b>Name:</b> ${escapeHTML(body.name)}</li>
  <li><b>Email:</b> ${escapeHTML(body.email)}</li>
  <li><b>Age:</b> ${escapeHTML(body.age)}</li>
  <li><b>Marital Status:</b> ${escapeHTML(body.marital_status)}</li>
  ${body.phone ? `<li><b>Phone:</b> ${escapeHTML(body.phone)}</li>` : ""}
</ul>

<h4 style="margin:12px 0 6px 0;">Assessment Summary</h4>
<ul style="margin:0 0 12px 18px; padding:0;">
  <li><b>Flagged Domains:</b> ${flaggedDomainsHtml}</li>
  <li><b>Message:</b> ${escapeHTML(result.message)}</li>
  <li><b>Details:</b> ${escapeHTML(result.detailed_message)}</li>
  </ul>

<h4 style="margin:12px 0 6px 0;">Domain Scores</h4>
<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse; margin:0 0 12px 0;">
  <thead>
    <tr><th>Domain</th><th>Score</th><th>Maximum</th><th>Status</th></tr>
  </thead>
  <tbody>
    ${scoreRow("Behavioral")}
    ${scoreRow("Cognitive/Attention")}
    ${scoreRow("Motor Skills")}
    ${scoreRow("Language/Academic")}
  </tbody>
</table>

<h4 style="margin:12px 0 6px 0;">Recommendations</h4>
<ul style="margin:0 0 12px 18px; padding:0;">
  ${recommendationsHtml || "<li>None</li>"}
  </ul>

<h4 style="margin:12px 0 6px 0;">Responses</h4>
<ul style="margin:0 0 12px 18px; padding:0;">
  ${responsesHtml}
</ul>
`.trim()

    // Non-blocking Odoo sync
    ;(async () => {
      try {
        const uid = await odooAuthenticate()
        if (!uid) return

        // Ensure contact by email
        const partnerId = await ensurePartner(uid, body.email as string, body.name as string)

        // Ensure tags
        const defaultTagId = await ensureTag(uid, "adhd_assessment")
        const riskTagId = await ensureTag(uid, `risk_${String(result.overallRisk).toLowerCase()}`)
        const tagIds = [defaultTagId, riskTagId].filter(Boolean) as number[]

        // Create lead with description (Internal Notes)
        const leadId = await createLead(uid, {
          name: `Developmental Screening - ${body.name}`,
          contact_name: body.name,
          email_from: body.email,
          partner_id: partnerId || undefined,
          tag_ids: tagIds.length ? [[6, 0, tagIds]] : undefined,
          description: descriptionHTML,
        })

        // Optional: also post the HTML in chatter as a note
        // await postNote(uid, leadId, descriptionHTML)
      } catch (err) {
        console.error("Odoo sync error:", err)
      }
    })()

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
