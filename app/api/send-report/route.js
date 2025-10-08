import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import path from 'path'
import fs from 'fs'
import mustache from 'mustache'

export const runtime = 'nodejs'

const templatesDir = path.join(process.cwd(), 'templates')

// Email configuration - use environment variables only in production
const emailConfig = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
}

// Custom from address (optional)
const smtpFrom = process.env.SMTP_FROM

// For development/demo purposes, we'll log instead of sending real emails
const isDevelopment = process.env.NODE_ENV !== 'production'

export async function POST(req) {
    try {
        const body = await req.json()
        const {
            name,
            email,
            age,
            overallRisk,
            domainScores,
            flaggedDomains,
            detailed_message,
            recommendations
        } = body

        // Validate required fields
        if (!name || !email || !overallRisk || !domainScores) {
            return NextResponse.json(
                { success: false, error: 'Missing required data' },
                { status: 400 }
            )
        }

        // Prepare template data
        const templateData = {
            name,
            email,
            age,
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            overallRisk,
            domainScores,
            flaggedDomains: flaggedDomains || [],
            maxScores: {
                "Behavioral": 24,
                "Cognitive/Attention": 24,
                "Motor Skills": 24,
                "Language/Academic": 24
            },
            detailed_message,
            recommendations: recommendations || []
        }

        // Pre-process template data for mustache
        const processedData = {
            ...templateData,
            overallRiskLower: templateData.overallRisk?.toLowerCase() || 'unknown',
            overallRiskUpper: templateData.overallRisk?.toUpperCase() || 'UNKNOWN',
            domains: Object.entries(templateData.domainScores || {}).map(([domain, score]) => {
                const maxScore = templateData.maxScores?.[domain] || 24
                const percentage = Math.round((score / maxScore) * 100)
                const isFlagged = (templateData.flaggedDomains || []).includes(domain)
                return {
                    name: domain,
                    score: score,
                    maxScore: maxScore,
                    percentage: percentage,
                    isFlagged: isFlagged,
                    status: isFlagged ? '⚠️ Needs attention' : '✅ Within range',
                    barClass: isFlagged ? 'score-high' : 'score-low',
                    cardClass: isFlagged ? 'domain-flagged' : ''
                }
            }),
            hasFlaggedDomains: (templateData.flaggedDomains || []).length > 0,
            flaggedCount: (templateData.flaggedDomains || []).length
        }

// Read email template
const emailTemplatePath = path.join(templatesDir, 'report-email.html')
const emailTemplateSource = fs.readFileSync(emailTemplatePath, 'utf8')

        // Generate HTML for email
        const emailHtml = mustache.render(emailTemplateSource, processedData)

        // PDF generation removed: email-only flow

        // Send email
        if (isDevelopment) {
            // Development mode - just log the email
            console.log('📧 DEVELOPMENT MODE - Email would be sent:')
            console.log('To:', email)
            console.log('Subject: Your Child\'s Developmental Screening Results')
            // No PDF attachment in email-only mode
            console.log('Risk Level:', overallRisk)
            console.log('Flagged Domains:', flaggedDomains?.length || 0)

            return NextResponse.json({
                success: true,
                message: 'Email logged (development mode)',
                development: true,
                riskLevel: overallRisk,
                flaggedCount: flaggedDomains?.length || 0
            })
        }

        // Production email sending
        const transporter = nodemailer.createTransport(emailConfig)

        const mailOptions = {
            from: smtpFrom || `"Developmental Screening" <${emailConfig.auth.user}>`,
            to: email,
            subject: `Your Child's Developmental Screening Results - ${overallRisk} Risk Level`,
            html: emailHtml
        }

        const info = await transporter.sendMail(mailOptions)

        console.log('Email sent successfully:', info.messageId)

        return NextResponse.json({
            success: true,
            message: 'Report sent successfully',
            messageId: info.messageId,
            hasAttachment: false
        })

    } catch (error) {
        console.error('Email sending error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to send report',
                details: error.message
            },
            { status: 500 }
        )
    }
}
