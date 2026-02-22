// ProductLobby Email Templates with Branding
// Uses inline CSS for email client compatibility
// Brand colors: Violet (#7C3AED) primary, Lime (#84CC16) accents

// Base template wrapper with header and footer
export function baseTemplate(content: string, preheader?: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>ProductLobby</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
        line-height: 1.6;
        color: #1f2937;
        background-color: #f9fafb;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-collapse: collapse;
      }
      .header {
        background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
        padding: 32px 20px;
        text-align: center;
      }
      .logo {
        font-size: 24px;
        font-weight: 700;
        letter-spacing: -0.5px;
      }
      .logo-product {
        font-weight: 700;
        color: #f3f4f6;
      }
      .logo-lobby {
        font-weight: 700;
        color: #84cc16;
      }
      .content {
        padding: 32px 20px;
      }
      .footer {
        background-color: #f3f4f6;
        padding: 20px;
        text-align: center;
        border-top: 1px solid #e5e7eb;
      }
      .button {
        display: inline-block;
        background-color: #7c3aed;
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
        font-size: 14px;
        border: none;
        cursor: pointer;
        margin: 20px 0;
      }
      .button:hover {
        background-color: #6d28d9;
      }
      .highlight-box {
        background-color: #f0f9ff;
        border: 1px solid #bae6fd;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }
      .success-box {
        background-color: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }
      .warning-box {
        background-color: #fef3c7;
        border: 1px solid #fde68a;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }
      h1 {
        margin: 0;
        color: #ffffff;
        font-size: 28px;
        line-height: 1.2;
      }
      h2 {
        color: #1f2937;
        margin-top: 0;
        margin-bottom: 16px;
        font-size: 20px;
      }
      h3 {
        color: #374151;
        margin: 0 0 12px 0;
        font-size: 16px;
      }
      p {
        margin: 12px 0;
        color: #4b5563;
      }
      ul {
        margin: 12px 0;
        padding-left: 20px;
        color: #4b5563;
      }
      li {
        margin: 8px 0;
      }
      .divider {
        border: none;
        border-top: 1px solid #e5e7eb;
        margin: 24px 0;
      }
      .footer-text {
        color: #6b7280;
        font-size: 12px;
        margin: 0;
      }
      .footer-brand {
        color: #7c3aed;
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <table class="container" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td class="header">
          <h1>
            <span class="logo-product">product</span><span class="logo-lobby">lobby</span>
          </h1>
        </td>
      </tr>
      <tr>
        <td class="content">
          ${content}
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p class="footer-text">
            <span class="footer-brand">ProductLobby</span> - Demand aggregation for the products you want
          </p>
          <p class="footer-text">
            Questions? Reply to this email or visit our <a href="https://productlobby.com" style="color: #7c3aed; text-decoration: none;">help center</a>
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

// Welcome email template
export function welcomeTemplate(displayName: string): string {
  const name = displayName.split(' ')[0] // Get first name
  const content = `
    <h2>Welcome to ProductLobby, ${name}!</h2>

    <p>
      You've just joined a community of thousands of people who demand the products they want to exist.
    </p>

    <p>
      Here's what you can do on ProductLobby:
    </p>

    <ul>
      <li><strong>Create campaigns</strong> to show brands there's real demand for your ideas</li>
      <li><strong>Support campaigns</strong> that align with what you want to buy</li>
      <li><strong>Commit your buying intent</strong> on offers to help brands make products real</li>
      <li><strong>Track progress</strong> on campaigns and get notified when offers launch</li>
    </ul>

    <p>
      Let's build the future together. What would you lobby for?
    </p>

    <div style="text-align: center;">
      <a href="https://productlobby.com/campaigns" class="button">Explore Campaigns</a>
    </div>

    <hr class="divider">

    <p style="font-size: 14px; color: #6b7280;">
      <strong>Need help?</strong> Check out our <a href="https://productlobby.com/how-it-works" style="color: #7c3aed; text-decoration: none;">how it works</a> guide.
    </p>
  `

  return baseTemplate(content, 'Welcome to ProductLobby')
}

// Magic link login email template
export function magicLinkTemplate(magicLinkUrl: string): string {
  const content = `
    <h2>Sign in to your account</h2>

    <p>
      Click the button below to sign in to ProductLobby. This link will expire in 24 hours.
    </p>

    <div style="text-align: center;">
      <a href="${magicLinkUrl}" class="button">Sign In</a>
    </div>

    <p style="font-size: 13px; color: #6b7280;">
      Or copy and paste this link into your browser:<br>
      <code style="word-break: break-all; background-color: #f3f4f6; padding: 8px 12px; border-radius: 4px; font-size: 12px;">${magicLinkUrl}</code>
    </p>

    <hr class="divider">

    <p style="font-size: 13px; color: #6b7280;">
      If you didn't request this email, you can safely ignore it. This link is unique to your account and can only be used once.
    </p>
  `

  return baseTemplate(content, 'Sign in to ProductLobby')
}

// Brand signal notification template
export function brandSignalTemplate({
  campaignTitle,
  signalScore,
  projectedRevenue,
  campaignUrl,
}: {
  campaignTitle: string
  signalScore: number
  projectedRevenue: number
  campaignUrl: string
}): string {
  const content = `
    <h2>High Demand Alert</h2>

    <p>
      A campaign targeting your brand has reached significant demand. Consumers are actively signaling their willingness to buy.
    </p>

    <div class="highlight-box">
      <h3>${campaignTitle}</h3>
      <ul style="margin: 12px 0; padding-left: 20px;">
        <li><strong>Signal Score:</strong> <span style="color: #7c3aed; font-weight: 600;">${signalScore}/100</span></li>
        <li><strong>Projected Revenue:</strong> <span style="color: #84cc16; font-weight: 600;">£${projectedRevenue.toLocaleString()}</span></li>
      </ul>
    </div>

    <p>
      This is an opportunity to:
    </p>

    <ul>
      <li>Gauge real market demand before full production</li>
      <li>Validate product concepts with your target audience</li>
      <li>Create a pre-launch buzz and secure committed customers</li>
      <li>Reduce business risk with demand validation</li>
    </ul>

    <div style="text-align: center;">
      <a href="${campaignUrl}" class="button">View Campaign</a>
    </div>

    <p style="font-size: 13px; color: #6b7280;">
      You can respond to the campaign, run a poll to gather feedback, or create a binding offer. The more you engage, the better the data you'll get.
    </p>
  `

  return baseTemplate(content, `High demand campaign: ${campaignTitle}`)
}

// Campaign update notification template
export function campaignUpdateTemplate({
  campaignTitle,
  updateTitle,
  updateExcerpt,
  campaignUrl,
}: {
  campaignTitle: string
  updateTitle: string
  updateExcerpt: string
  campaignUrl: string
}): string {
  const content = `
    <h2>${updateTitle}</h2>

    <p style="font-size: 13px; color: #6b7280; margin-bottom: 20px;">
      Update on <strong>${campaignTitle}</strong>
    </p>

    <div class="highlight-box">
      <p style="margin: 0;">
        ${updateExcerpt}
      </p>
    </div>

    <div style="text-align: center;">
      <a href="${campaignUrl}" class="button">Read Full Update</a>
    </div>

    <p style="font-size: 13px; color: #6b7280;">
      You're receiving this because you're following this campaign. You can manage your notification preferences in your account settings.
    </p>
  `

  return baseTemplate(
    content,
    `Update: ${campaignTitle} - ${updateTitle}`
  )
}
