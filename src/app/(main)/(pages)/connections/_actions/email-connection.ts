'use server'

import nodemailer from 'nodemailer'

type EmailPayload = {
  to: string
  subject: string
  body: string
}

export async function sendEmail(data: EmailPayload) {
  try {
    // Create transporter using environment variables
    const transporter = nodemailer.createTransport({
        host: 'sandbox.smtp.mailtrap.io',
        port: 2525,
        auth: {
          user: '46d3ec599cd874',
          pass: '206d95fcd7d93f',
        },
    });
    // Send email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: data.to,
      subject: data.subject,
      html: data.body,
    })

    console.log('Message sent: %s', info.messageId)
    return {
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
    }
  } catch (error) {
    console.error('Error sending email:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send email',
    }
  }
} 