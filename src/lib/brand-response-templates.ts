/**
 * Brand Response Templates
 * Pre-built response templates for brands responding to campaigns
 */

export interface ResponseTemplate {
  id: string
  name: string
  title: string
  description: string
  body: string
  suggestedActions: string[]
  category: 'acknowledgment' | 'investigation' | 'commitment' | 'decline' | 'partial_commitment'
  placeholders: string[]
}

const templates: Record<string, ResponseTemplate> = {
  acknowledgment: {
    id: 'acknowledgment',
    name: 'Acknowledgment',
    title: 'We Acknowledge Your Feedback',
    description: 'Confirm receipt of customer feedback and express appreciation',
    body: `Dear {{customer_name}},

Thank you for bringing this matter to our attention. We truly appreciate the {{campaign_topic}} campaign initiative and the passion our customers have shown.

We have received and reviewed the feedback from {{lobby_count}} community members regarding {{issue_description}}. Your voices matter to us, and we take all customer input seriously.

Our team is currently reviewing the suggestions and will provide a detailed response within {{response_timeline}}.

Best regards,
{{brand_name}} Team`,
    suggestedActions: [
      'Schedule internal review meeting',
      'Assign dedicated team to evaluate feedback',
      'Set timeline for next response',
      'Communicate timeline to customers',
    ],
    category: 'acknowledgment',
    placeholders: ['customer_name', 'campaign_topic', 'lobby_count', 'issue_description', 'response_timeline', 'brand_name'],
  },

  investigation: {
    id: 'investigation',
    name: 'Under Investigation',
    title: 'We Are Investigating Your Request',
    description: 'Indicate that the brand is actively investigating the campaign request',
    body: `Dear Community,

Thank you for the {{campaign_topic}} campaign. We are taking this opportunity seriously.

Our product development and {{relevant_department}} teams have begun investigating the feasibility of {{requested_feature}}. We are evaluating:

• Technical feasibility and resource requirements
• Customer demand and market fit
• Alignment with our {{product_category}} strategy
• Potential impact on existing features

We will provide an update on our findings by {{target_date}}. We may reach out to some community members for additional insights during this process.

Thank you for your patience as we work through this.

Best regards,
{{brand_name}} Team`,
    suggestedActions: [
      'Form cross-functional review committee',
      'Request technical feasibility assessment',
      'Conduct market research',
      'Survey interested customers for requirements',
    ],
    category: 'investigation',
    placeholders: ['campaign_topic', 'relevant_department', 'requested_feature', 'product_category', 'target_date', 'brand_name'],
  },

  commitment: {
    id: 'commitment',
    name: 'Commitment to Action',
    title: 'We Commit to Making This Change',
    description: 'Announce a firm commitment to implement the requested feature or change',
    body: `Dear Community,

We are thrilled to announce that we are moving forward with {{requested_feature}}!

Based on the overwhelming support from {{lobby_count}} community members and extensive review by our teams, we have decided to prioritize this initiative.

Here's what to expect:

Timeline:
• Design & Planning: {{phase_1_timeline}}
• Development: {{phase_2_timeline}}
• Beta Testing: {{phase_3_timeline}}
• Full Release: {{release_timeline}}

Next Steps:
We will be launching a beta program soon. Interested community members can sign up {{signup_link}} to participate and provide early feedback.

Thank you for helping shape {{brand_name}}'s future!

Best regards,
{{brand_name}} Team`,
    suggestedActions: [
      'Create project roadmap with timeline',
      'Establish beta testing program',
      'Set up regular community updates',
      'Allocate resources for development',
    ],
    category: 'commitment',
    placeholders: ['requested_feature', 'lobby_count', 'phase_1_timeline', 'phase_2_timeline', 'phase_3_timeline', 'release_timeline', 'signup_link', 'brand_name'],
  },

  decline: {
    id: 'decline',
    name: 'Unable to Proceed',
    title: 'We Cannot Pursue This Request',
    description: 'Respectfully decline the campaign request with clear reasoning',
    body: `Dear Community,

Thank you for the {{campaign_topic}} campaign and for your passionate feedback. We appreciate the {{lobby_count}} community members who supported this initiative.

After careful consideration and thorough evaluation, we have decided not to move forward with {{requested_feature}} at this time. Here's why:

{{decline_reason_1}}
{{decline_reason_2}}
{{decline_reason_3}}

What We're Doing Instead:
We remain committed to improving {{product_name}} and will focus on {{alternative_approach}}.

We truly value your input and encourage you to share any new ideas for how we can better serve you.

Best regards,
{{brand_name}} Team`,
    suggestedActions: [
      'Clearly communicate reasons to customers',
      'Suggest alternative solutions',
      'Stay open to future feedback',
      'Consider customer feedback for future product decisions',
    ],
    category: 'decline',
    placeholders: ['campaign_topic', 'lobby_count', 'requested_feature', 'decline_reason_1', 'decline_reason_2', 'decline_reason_3', 'product_name', 'alternative_approach', 'brand_name'],
  },

  partial_commitment: {
    id: 'partial_commitment',
    name: 'Partial Commitment',
    title: 'We Commit to a Modified Approach',
    description: 'Commit to a modified or phased approach to address customer requests',
    body: `Dear Community,

Thank you for the {{campaign_topic}} campaign and for helping us understand what matters to our customers.

We have decided to move forward with a modified approach to {{requested_feature}}.

What We'll Implement:
• {{implementation_1}}
• {{implementation_2}}
• {{implementation_3}}

What We're Considering for Phase 2:
• {{future_consideration_1}}
• {{future_consideration_2}}

Timeline:
Phase 1: {{phase_1_timeline}}
Phase 2: {{phase_2_timeline}} (pending Phase 1 feedback)

We believe this approach balances customer needs with technical and strategic considerations. We'd love your feedback on this plan.

Best regards,
{{brand_name}} Team`,
    suggestedActions: [
      'Define phased implementation plan',
      'Gather feedback on proposed modifications',
      'Set realistic timelines for each phase',
      'Plan community feedback sessions',
    ],
    category: 'partial_commitment',
    placeholders: ['campaign_topic', 'requested_feature', 'implementation_1', 'implementation_2', 'implementation_3', 'future_consideration_1', 'future_consideration_2', 'phase_1_timeline', 'phase_2_timeline', 'brand_name'],
  },
}

export function getAllTemplates(): ResponseTemplate[] {
  return Object.values(templates)
}

export function getTemplate(id: string): ResponseTemplate | undefined {
  return templates[id]
}

export function getTemplatesByCategory(
  category: 'acknowledgment' | 'investigation' | 'commitment' | 'decline' | 'partial_commitment'
): ResponseTemplate[] {
  return Object.values(templates).filter((t) => t.category === category)
}

export function fillTemplate(template: ResponseTemplate, values: Record<string, string>): string {
  let filledBody = template.body

  Object.entries(values).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`
    filledBody = filledBody.replace(new RegExp(placeholder, 'g'), value)
  })

  return filledBody
}

export function getPlaceholdersForTemplate(templateId: string): string[] {
  const template = templates[templateId]
  return template ? template.placeholders : []
}

export function validateTemplatePlaceholders(
  templateId: string,
  values: Record<string, string>
): { valid: boolean; missingPlaceholders: string[] } {
  const template = templates[templateId]
  if (!template) {
    return { valid: false, missingPlaceholders: [] }
  }

  const missingPlaceholders = template.placeholders.filter((p) => !values[p])

  return {
    valid: missingPlaceholders.length === 0,
    missingPlaceholders,
  }
}
