// Creator Weekly Digest Email Template
// Specialized template for creators to view their campaign performance

export interface DigestStats {
  newLobbies: number
  newComments: number
  totalCampaigns: number
  totalLobbies: number
}

export interface TopCampaignHighlight {
  title: string
  slug: string
  lobbyCount: number
  commentCount: number
  signalScore: number | null
}

export function creatorDigestTemplate({
  creatorName,
  stats,
  topCampaign,
}: {
  creatorName: string
  stats: DigestStats
  topCampaign: TopCampaignHighlight | null
}): string {
  const firstName = creatorName.split(' ')[0]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Stats cards HTML
  const statsHtml = `
    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
      <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 16px; font-weight: 600;">Your Weekly Stats</h3>
      <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
        <tr>
          <td width="25%" style="text-align: center; padding: 12px 0; border-right: 1px solid #e5e7eb;">
            <div style="font-size: 28px; font-weight: 700; color: #84cc16; margin-bottom: 4px;">${stats.newLobbies}</div>
            <div style="font-size: 12px; color: #6b7280; font-weight: 500;">New Lobbies</div>
          </td>
          <td width="25%" style="text-align: center; padding: 12px 12px; border-right: 1px solid #e5e7eb;">
            <div style="font-size: 28px; font-weight: 700; color: #7c3aed; margin-bottom: 4px;">${stats.newComments}</div>
            <div style="font-size: 12px; color: #6b7280; font-weight: 500;">New Comments</div>
          </td>
          <td width="25%" style="text-align: center; padding: 12px 12px; border-right: 1px solid #e5e7eb;">
            <div style="font-size: 28px; font-weight: 700; color: #06b6d4; margin-bottom: 4px;">${stats.totalLobbies}</div>
            <div style="font-size: 12px; color: #6b7280; font-weight: 500;">Total Lobbies</div>
          </td>
          <td width="25%" style="text-align: center; padding: 12px 12px;">
            <div style="font-size: 28px; font-weight: 700; color: #f59e0b; margin-bottom: 4px;">${stats.totalCampaigns}</div>
            <div style="font-size: 12px; color: #6b7280; font-weight: 500;">Active Campaigns</div>
          </td>
        </tr>
      </table>
    </div>
  `

  // Top campaign highlight
  const topCampaignHtml = topCampaign
    ? `
    <div style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); border-radius: 8px; padding: 24px; margin-bottom: 24px; color: white;">
      <h3 style="color: #ffffff; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">Top Performing Campaign</h3>
      <h2 style="color: #ffffff; margin: 0 0 12px 0; font-size: 20px; font-weight: 700;">${topCampaign.title}</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
        <div>
          <div style="font-size: 12px; color: rgba(255, 255, 255, 0.8); margin-bottom: 4px;">Lobbies</div>
          <div style="font-size: 24px; font-weight: 700; color: #84cc16;">${topCampaign.lobbyCount}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: rgba(255, 255, 255, 0.8); margin-bottom: 4px;">Comments</div>
          <div style="font-size: 24px; font-weight: 700; color: #84cc16;">${topCampaign.commentCount}</div>
        </div>
      </div>
      ${
        topCampaign.signalScore !== null
          ? `<div style="font-size: 13px; color: rgba(255, 255, 255, 0.9); margin-bottom: 16px;">Signal Score: <strong style="color: #84cc16;">${topCampaign.signalScore.toFixed(0)}/100</strong></div>`
          : ''
      }
      <a href="${appUrl}/campaigns/${topCampaign.slug}" style="display: inline-block; background-color: #84cc16; color: #1f2937; padding: 10px 16px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 13px;">View Campaign</a>
    </div>
  `
    : ''

  // Main content
  const content = `
    <h2 style="color: #1f2937; margin: 0 0 12px 0;">Your Weekly Summary</h2>

    <p style="color: #6b7280; margin: 0 0 24px 0; font-size: 15px;">
      Hi ${firstName}, here's what happened with your campaigns this week.
    </p>

    ${statsHtml}

    ${topCampaignHtml}

    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <h3 style="color: #15803d; margin: 0 0 12px 0; font-size: 15px; font-weight: 600;">Quick Actions</h3>
      <ul style="margin: 0; padding-left: 20px; color: #166534;">
        <li style="margin-bottom: 8px;">Review new lobbies to understand audience preferences</li>
        <li style="margin-bottom: 8px;">Respond to comments to boost engagement</li>
        <li style="margin-bottom: 8px;">Analyze feedback to refine your product vision</li>
        <li>Share progress updates to keep your community engaged</li>
      </ul>
    </div>

    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${appUrl}/dashboard" style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">View Dashboard</a>
    </div>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

    <p style="font-size: 13px; color: #6b7280; margin: 0;">
      You're receiving this because you have active campaigns on ProductLobby. Manage your notification preferences in your <a href="${appUrl}/settings/notifications" style="color: #7c3aed; text-decoration: none; font-weight: 600;">account settings</a>.
    </p>
  `

  // Base template wrapper
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Your Weekly Summary - ProductLobby</title>
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
      .header-subtitle {
        color: rgba(255, 255, 255, 0.9);
        font-size: 14px;
        margin-top: 8px;
        font-weight: 500;
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
      a {
        color: #7c3aed;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
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
          <div class="header-subtitle">Creator Weekly Digest</div>
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
            <span class="footer-brand">ProductLobby</span> - Where demand creates products
          </p>
          <p class="footer-text">
            Questions? Reply to this email or visit our <a href="https://productlobby.com/support" style="color: #7c3aed; text-decoration: none;">support center</a>
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`
}
