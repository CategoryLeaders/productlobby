import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.EMAIL_FROM || 'ProductLobby <noreply@productlobby.com>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

interface EmailResult {
  success: boolean
  error?: string
}

// Send magic link email
export async function sendMagicLinkEmail(
  email: string,
  token: string
): Promise<EmailResult> {
  const magicLink = `${APP_URL}/auth/verify?token=${token}`

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Sign in to ProductLobby',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0284c7; margin: 0;">ProductLobby</h1>
            </div>

            <h2 style="margin-bottom: 20px;">Sign in to your account</h2>

            <p>Click the button below to sign in to ProductLobby. This link will expire in 15 minutes.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${magicLink}" style="display: inline-block; background: #0284c7; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Sign In
              </a>
            </div>

            <p style="color: #666; font-size: 14px;">
              If you didn't request this email, you can safely ignore it.
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; text-align: center;">
              ProductLobby - Demand aggregation for the products you want
            </p>
          </body>
        </html>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to send magic link email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

// Send phone verification code via SMS (using Twilio)
export async function sendPhoneVerificationSMS(
  phone: string,
  code: string
): Promise<EmailResult> {
  // In production, use Twilio SDK
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !fromNumber) {
    console.error('Twilio credentials not configured')
    return { success: false, error: 'SMS service not configured' }
  }

  try {
    // Using fetch for simplicity (in production, use Twilio SDK)
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: phone,
          From: fromNumber,
          Body: `Your ProductLobby verification code is: ${code}. Valid for 10 minutes.`,
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Twilio request failed')
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to send SMS:', error)
    return { success: false, error: 'Failed to send SMS' }
  }
}

// Send offer success notification
export async function sendOfferSuccessEmail(
  email: string,
  data: {
    offerTitle: string
    campaignTitle: string
    orderAmount: number
    currency: string
  }
): Promise<EmailResult> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Great news! "${data.offerTitle}" was successful`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0284c7; margin: 0;">ProductLobby</h1>
            </div>

            <h2 style="color: #10b981;">🎉 The offer was successful!</h2>

            <p>The offer <strong>"${data.offerTitle}"</strong> for the campaign <strong>"${data.campaignTitle}"</strong> reached its goal!</p>

            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0;">
                <strong>Your order:</strong> ${new Intl.NumberFormat('en-GB', { style: 'currency', currency: data.currency }).format(data.orderAmount)}
              </p>
            </div>

            <p>The brand will begin fulfillment soon. You'll receive shipping updates when available.</p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; text-align: center;">
              ProductLobby - Your voice, their product
            </p>
          </body>
        </html>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to send offer success email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

// Send offer failed notification (with refund info)
export async function sendOfferFailedEmail(
  email: string,
  data: {
    offerTitle: string
    campaignTitle: string
    orderAmount: number
    currency: string
  }
): Promise<EmailResult> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Update: "${data.offerTitle}" did not reach its goal`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0284c7; margin: 0;">ProductLobby</h1>
            </div>

            <h2>Offer Update</h2>

            <p>Unfortunately, the offer <strong>"${data.offerTitle}"</strong> for <strong>"${data.campaignTitle}"</strong> did not reach its goal before the deadline.</p>

            <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0;">
                <strong>Refund:</strong> ${new Intl.NumberFormat('en-GB', { style: 'currency', currency: data.currency }).format(data.orderAmount)}
              </p>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
                Your payment will be refunded automatically. It may take 5-10 business days to appear on your statement.
              </p>
            </div>

            <p>Don't worry - your support still matters! The campaign remains active, and brands can see the demand you've helped create.</p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; text-align: center;">
              ProductLobby - Your voice, their product
            </p>
          </body>
        </html>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to send offer failed email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

// Send brand notification when campaign reaches threshold
export async function sendBrandNotificationEmail(
  email: string,
  data: {
    campaignTitle: string
    campaignUrl: string
    signalScore: number
    supportCount: number
    intentCount: number
    estimatedDemand: number
    currency: string
  }
): Promise<EmailResult> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `High demand campaign: "${data.campaignTitle}"`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0284c7; margin: 0;">ProductLobby</h1>
            </div>

            <h2>📊 High Demand Alert</h2>

            <p>A campaign targeting your brand has reached significant demand:</p>

            <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0;">${data.campaignTitle}</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li><strong>Signal Score:</strong> ${data.signalScore}/100</li>
                <li><strong>Support:</strong> ${data.supportCount} people</li>
                <li><strong>Buying Intent:</strong> ${data.intentCount} people</li>
                <li><strong>Estimated Demand:</strong> ${new Intl.NumberFormat('en-GB', { style: 'currency', currency: data.currency }).format(data.estimatedDemand)}</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.campaignUrl}" style="display: inline-block; background: #0284c7; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                View Campaign
              </a>
            </div>

            <p>You can respond to this campaign, run a poll to gather more feedback, or create a binding offer.</p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; text-align: center;">
              ProductLobby - Connecting brands with real demand
            </p>
          </body>
        </html>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to send brand notification email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}
