'use server'

import nodemailer from 'nodemailer'

type EmailPayload = {
  to: string
  subject: string
  body: string
}

const generateEmailTemplate = (data: EmailPayload) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.subject}</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
          }
          .email-container {
            max-width: 600px;
            margin: 40px auto;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            background: #ffffff;
          }
          .email-header {
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
            padding: 32px 24px;
            text-align: center;
          }
          .email-header h2 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .email-content {
            padding: 40px 24px;
            background: #ffffff;
            color: #374151;
            font-size: 16px;
          }
          .email-footer {
            background: #f9fafb;
            padding: 24px;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
          }
          .email-footer p {
            margin: 4px 0;
          }
          @media (max-width: 600px) {
            .email-container {
              margin: 0;
              border-radius: 0;
            }
            .email-content {
              padding: 24px 16px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <img src="/fuzzie-logo.png" alt="Fuzzie Logo" style="width: 120px; margin-bottom: 16px;" />
            <h2 style="margin-bottom: 8px;">${data.subject}</h2>
            <p style="color: #e5e7eb; font-size: 14px; margin: 0;">Sent via Fuzzie Workflow</p>
          </div>
          <div class="email-content">
            <div style="white-space: pre-line; line-height: 1.8;">
              ${data.body}
            </div>
          </div>
          <div class="email-footer">
            <div style="margin-bottom: 16px;">
              <a href="https://twitter.com/fuzzie" style="color: #6b7280; text-decoration: none; margin: 0 8px;">Twitter</a>
              <a href="https://linkedin.com/company/fuzzie" style="color: #6b7280; text-decoration: none; margin: 0 8px;">LinkedIn</a>
              <a href="https://fuzzie.com" style="color: #6b7280; text-decoration: none; margin: 0 8px;">Website</a>
            </div>
            <p style="color: #9ca3af; font-size: 12px; margin: 4px 0;">© ${new Date().getFullYear()} Fuzzie. All rights reserved.</p>
            <p style="color: #9ca3af; font-size: 12px; margin: 4px 0;">123 Business Street, Suite 100, City, Country</p>
          </div>
        </div>
      </body>
    </html>
  `
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

    const htmlContent = generateEmailTemplate(data)

    // Send email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: data.to,
      subject: data.subject,
      html: htmlContent,
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