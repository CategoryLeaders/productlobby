import { prisma } from '@/lib/db'
import { formatDate, formatNumber } from '@/lib/utils'
import { notFound } from 'next/navigation'

interface PrintPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PrintPageProps) {
  const campaign = await prisma.campaign.findFirst({
    where: { slug: params.slug },
    select: { title: true, description: true },
  })

  if (!campaign) {
    return { title: 'Campaign Not Found' }
  }

  return {
    title: `Print: ${campaign.title}`,
    description: campaign.description,
  }
}

export default async function PrintPage({ params }: PrintPageProps) {
  const campaign = await prisma.campaign.findFirst({
    where: { slug: params.slug },
    include: {
      creator: {
        select: {
          id: true,
          displayName: true,
          handle: true,
          avatar: true,
        },
      },
      targetedBrand: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      media: {
        orderBy: { order: 'asc' },
      },
      _count: {
        select: {
          lobbies: true,
          follows: true,
          pledges: true,
          comments: true,
        },
      },
    },
  })

  if (!campaign) {
    notFound()
  }

  const baseUrl = 'http://localhost:3000' // Will be replaced with actual base URL

  return (
    <html>
      <head>
        <title>{campaign.title} - ProductLobby</title>
        <meta name="description" content={campaign.description} />
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
              'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
              'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: white;
            padding: 40px;
          }

          .print-container {
            max-width: 800px;
            margin: 0 auto;
          }

          .header {
            margin-bottom: 40px;
            border-bottom: 3px solid #7c3aed;
            padding-bottom: 30px;
          }

          h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 16px;
            color: #111827;
            line-height: 1.3;
          }

          .campaign-meta {
            display: flex;
            gap: 24px;
            margin-bottom: 16px;
            flex-wrap: wrap;
          }

          .meta-item {
            display: flex;
            flex-direction: column;
          }

          .meta-label {
            font-size: 12px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }

          .meta-value {
            font-size: 16px;
            font-weight: 500;
            color: #111827;
          }

          .creator-info {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
          }

          .creator-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #e5e7eb;
            object-fit: cover;
          }

          .creator-details h3 {
            font-size: 14px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 2px;
          }

          .creator-details p {
            font-size: 12px;
            color: #6b7280;
          }

          .media-section {
            margin-bottom: 40px;
          }

          .media-image {
            width: 100%;
            height: auto;
            margin-bottom: 12px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }

          section {
            margin-bottom: 40px;
          }

          h2 {
            font-size: 20px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 12px;
            border-bottom: 2px solid #84cc16;
            padding-bottom: 8px;
          }

          .description {
            font-size: 16px;
            line-height: 1.7;
            color: #374151;
            white-space: pre-wrap;
            word-wrap: break-word;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-bottom: 16px;
          }

          .stat-card {
            padding: 16px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            background: #f9fafb;
          }

          .stat-label {
            font-size: 12px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            margin-bottom: 4px;
          }

          .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: #7c3aed;
          }

          .timeline {
            list-style: none;
            padding-left: 0;
          }

          .timeline-item {
            display: flex;
            gap: 16px;
            margin-bottom: 20px;
            padding-left: 32px;
            position: relative;
          }

          .timeline-item::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            width: 8px;
            height: 8px;
            background: #7c3aed;
            border-radius: 50%;
            margin-top: 8px;
          }

          .timeline-item h3 {
            font-size: 14px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 4px;
          }

          .timeline-item p {
            font-size: 14px;
            color: #6b7280;
          }

          .brand-section {
            padding: 16px;
            background: #f3f4f6;
            border-radius: 6px;
            margin-bottom: 16px;
          }

          .brand-label {
            font-size: 12px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            margin-bottom: 4px;
          }

          .brand-name {
            font-size: 18px;
            font-weight: 700;
            color: #111827;
          }

          .footer {
            margin-top: 60px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
          }

          .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 16px;
            background: #7c3aed;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
          }

          .print-button:hover {
            background: #6d28d9;
          }

          @media (max-width: 640px) {
            body {
              padding: 20px;
            }

            h1 {
              font-size: 24px;
            }

            h2 {
              font-size: 18px;
            }

            .campaign-meta {
              flex-direction: column;
              gap: 16px;
            }

            .stats-grid {
              grid-template-columns: 1fr;
            }

            .print-button {
              position: static;
              width: 100%;
              margin-bottom: 20px;
            }
          }

          @media print {
            body {
              padding: 0;
            }

            .print-button {
              display: none;
            }

            .print-container {
              max-width: 100%;
            }

            a {
              text-decoration: none;
              color: #111827;
            }
          }
        `}</style>
      </head>
      <body>
        <button
          className="print-button"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.print()
            }
          }}
        >
          Print this page
        </button>

        <div className="print-container">
          <div className="header">
            <h1>{campaign.title}</h1>

            <div className="campaign-meta">
              <div className="meta-item">
                <span className="meta-label">Category</span>
                <span className="meta-value">{campaign.category}</span>
              </div>

              <div className="meta-item">
                <span className="meta-label">Status</span>
                <span className="meta-value">{campaign.status}</span>
              </div>

              <div className="meta-item">
                <span className="meta-label">Published</span>
                <span className="meta-value">
                  {formatDate(campaign.createdAt)}
                </span>
              </div>

              {campaign.signalScore && (
                <div className="meta-item">
                  <span className="meta-label">Signal Score</span>
                  <span className="meta-value">
                    {campaign.signalScore.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="creator-info">
              {campaign.creator.avatar && (
                <img
                  src={campaign.creator.avatar}
                  alt={campaign.creator.displayName}
                  className="creator-avatar"
                />
              )}
              <div className="creator-details">
                <h3>{campaign.creator.displayName}</h3>
                {campaign.creator.handle && <p>@{campaign.creator.handle}</p>}
              </div>
            </div>
          </div>

          {campaign.media.length > 0 && (
            <div className="media-section">
              {campaign.media.map((medium) => (
                <img
                  key={medium.id}
                  src={medium.url}
                  alt={medium.altText || 'Campaign media'}
                  className="media-image"
                />
              ))}
            </div>
          )}

          <section>
            <h2>Overview</h2>
            <div className="description">{campaign.description}</div>
          </section>

          {campaign.targetedBrand && (
            <section>
              <h2>Targeted Brand</h2>
              <div className="brand-section">
                <div className="brand-label">Company</div>
                <div className="brand-name">{campaign.targetedBrand.name}</div>
              </div>
            </section>
          )}

          <section>
            <h2>Campaign Statistics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Lobbies</div>
                <div className="stat-value">
                  {formatNumber(campaign._count.lobbies)}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Followers</div>
                <div className="stat-value">
                  {formatNumber(campaign._count.follows)}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Pledges</div>
                <div className="stat-value">
                  {formatNumber(campaign._count.pledges)}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Comments</div>
                <div className="stat-value">
                  {formatNumber(campaign._count.comments)}
                </div>
              </div>
            </div>
          </section>

          {campaign.problemSolved && (
            <section>
              <h2>Problem Solved</h2>
              <p className="description">{campaign.problemSolved}</p>
            </section>
          )}

          {campaign.originStory && (
            <section>
              <h2>Origin Story</h2>
              <p className="description">{campaign.originStory}</p>
            </section>
          )}

          {campaign.milestones && Array.isArray(campaign.milestones) && campaign.milestones.length > 0 && (
            <section>
              <h2>Timeline & Milestones</h2>
              <ul className="timeline">
                {(campaign.milestones as Array<{ title: string; description?: string; date?: string }>).map(
                  (milestone, index) => (
                    <li key={index} className="timeline-item">
                      <div>
                        <h3>{milestone.title}</h3>
                        {milestone.description && <p>{milestone.description}</p>}
                        {milestone.date && (
                          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                            {formatDate(milestone.date)}
                          </p>
                        )}
                      </div>
                    </li>
                  )
                )}
              </ul>
            </section>
          )}

          <div className="footer">
            <p>
              Printed from ProductLobby on {formatDate(new Date())}
            </p>
            <p style={{ marginTop: '8px' }}>
              View this campaign online at:{' '}
              {`${baseUrl}/campaigns/${campaign.slug}`}
            </p>
          </div>
        </div>

        <script dangerouslySetInnerHTML={{__html: `
          document.querySelector('.print-button').addEventListener('click', function() {
            window.print();
          });
        `}} />
      </body>
    </html>
  )
}
