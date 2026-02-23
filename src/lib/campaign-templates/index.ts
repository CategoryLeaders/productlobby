export interface CampaignTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: string
  coverGradient: string
  structure: {
    titlePattern: string
    descriptionTemplate: string
    problemStatement: string
    idealOutcome: string
  }
  preferenceFields: Array<{
    fieldName: string
    fieldType: 'text' | 'rating' | 'choice'
    placeholder?: string
    options?: string[]
  }>
  tips: string[]
}

export const campaignTemplates: CampaignTemplate[] = [
  {
    id: 'tech-enhancement',
    name: 'Tech Product Enhancement',
    description: 'Build demand for software features, hardware improvements, or digital innovations',
    category: 'Technology',
    icon: 'Cpu',
    coverGradient: 'from-violet-500 to-purple-600',
    structure: {
      titlePattern: '[Product] needs [Feature/Improvement]',
      descriptionTemplate: 'Describe the current limitation and how this enhancement would improve the user experience',
      problemStatement: 'Today, users struggle with...',
      idealOutcome: 'With this improvement, we could...',
    },
    preferenceFields: [
      {
        fieldName: 'Product Type',
        fieldType: 'choice',
        options: ['Mobile App', 'Web Application', 'Desktop Software', 'Cloud Service', 'Hardware Device'],
      },
      {
        fieldName: 'Priority Level',
        fieldType: 'rating',
        placeholder: 'How critical is this improvement?',
      },
      {
        fieldName: 'Target Users',
        fieldType: 'text',
        placeholder: 'Who would benefit most? (e.g., "Remote teams", "Content creators")',
      },
      {
        fieldName: 'Integration Concerns',
        fieldType: 'text',
        placeholder: 'Any specific integrations or compatibility needs?',
      },
    ],
    tips: [
      'Use specific, measurable metrics to demonstrate the impact (time saved, efficiency gains)',
      'Include competitor analysis to show how this feature exists elsewhere',
      'Focus on user pain points rather than technical implementation details',
      'Create mockups or wireframes to visualize the proposed solution',
      'Include use cases and user stories from your community',
    ],
  },
  {
    id: 'fashion-apparel',
    name: 'Fashion & Apparel',
    description: 'Rally support for new clothing lines, styles, or sustainable fashion initiatives',
    category: 'Fashion',
    icon: 'Shirt',
    coverGradient: 'from-pink-500 to-rose-600',
    structure: {
      titlePattern: "We need [Style/Design] in [Size/Fit] category",
      descriptionTemplate: 'Explain the style, materials, and inclusive sizing approach you envision',
      problemStatement: 'Current options lack...',
      idealOutcome: 'We would love to see clothing that...',
    },
    preferenceFields: [
      {
        fieldName: 'Style Category',
        fieldType: 'choice',
        options: ['Activewear', 'Casual', 'Professional', 'Formal', 'Sustainable', 'Limited Edition'],
      },
      {
        fieldName: 'Size Range Priority',
        fieldType: 'choice',
        options: ['Extended XS-XXXL', 'Tall Sizes', 'Petite Sizes', 'Plus Size Focus', 'Standard Range'],
      },
      {
        fieldName: 'Material Preferences',
        fieldType: 'text',
        placeholder: 'e.g., "Organic cotton", "Recycled polyester", "Bamboo blend"',
      },
      {
        fieldName: 'Occasion/Use Case',
        fieldType: 'text',
        placeholder: 'When and where would you wear this?',
      },
    ],
    tips: [
      'Highlight underrepresented body types and sizes in current offerings',
      'Discuss sustainability and ethical manufacturing practices',
      'Include style inspiration boards or mood boards',
      'Specify price point expectations and willingness to pay premium for sustainability',
      'Share stories about why this clothing would matter to your life',
    ],
  },
  {
    id: 'food-drink',
    name: 'Food & Drink Innovation',
    description: 'Drive demand for new menu items, dietary options, or beverage innovations',
    category: 'Food & Drink',
    icon: 'UtensilsCrossed',
    coverGradient: 'from-orange-500 to-amber-600',
    structure: {
      titlePattern: "[Restaurant/Brand] should create [Dish/Beverage] for [Dietary/Preference] customers",
      descriptionTemplate: 'Describe the product concept, key ingredients, and why your community needs it',
      problemStatement: 'Currently, there are no good options for...',
      idealOutcome: 'We would be thrilled to order...',
    },
    preferenceFields: [
      {
        fieldName: 'Dietary Category',
        fieldType: 'choice',
        options: ['Vegan/Plant-Based', 'Gluten-Free', 'Keto-Friendly', 'Low-Calorie', 'High-Protein', 'Allergen-Free'],
      },
      {
        fieldName: 'Cuisine/Style',
        fieldType: 'text',
        placeholder: 'e.g., "Asian fusion", "Mediterranean", "Comfort food"',
      },
      {
        fieldName: 'Flavor Profile',
        fieldType: 'text',
        placeholder: 'e.g., "Spicy", "Sweet and savory", "Umami-forward"',
      },
      {
        fieldName: 'Occasion',
        fieldType: 'choice',
        options: ['Daily Meal', 'Special Occasion', 'Quick Snack', 'Dessert', 'Beverage Only'],
      },
    ],
    tips: [
      'Reference popular food trends and similar successful menu items',
      'Explain the dietary/health benefits and market demand',
      'Include detailed flavor descriptions and ingredient inspiration',
      'Mention how often you would purchase this item',
      'Share the story of why this product matters to your lifestyle',
    ],
  },
  {
    id: 'sustainability',
    name: 'Sustainability Initiative',
    description: 'Advocate for eco-friendly practices, carbon reduction, or circular economy products',
    category: 'Environment',
    icon: 'Leaf',
    coverGradient: 'from-green-500 to-emerald-600',
    structure: {
      titlePattern: '[Brand] should [Sustainable Action] to reduce [Environmental Impact]',
      descriptionTemplate: 'Outline the environmental benefits, implementation feasibility, and business case for sustainability',
      problemStatement: 'The current production/operation causes...',
      idealOutcome: 'By implementing this, we could achieve...',
    },
    preferenceFields: [
      {
        fieldName: 'Environmental Focus',
        fieldType: 'choice',
        options: ['Carbon Reduction', 'Waste Minimization', 'Water Conservation', 'Renewable Energy', 'Circular Economy'],
      },
      {
        fieldName: 'Your Commitment Level',
        fieldType: 'rating',
        placeholder: 'How important is this issue to you?',
      },
      {
        fieldName: 'Preferred Implementation',
        fieldType: 'text',
        placeholder: 'e.g., "Plastic-free packaging", "Solar-powered operations"',
      },
      {
        fieldName: 'Cost Sensitivity',
        fieldType: 'text',
        placeholder: 'Would you pay more for sustainable options? If so, how much?',
      },
    ],
    tips: [
      'Cite credible environmental studies and statistics',
      'Highlight successful examples from competitors or similar industries',
      'Calculate and share concrete environmental impact metrics',
      'Address concerns about higher costs or reduced convenience',
      'Share your personal environmental values and why this matters',
    ],
  },
  {
    id: 'accessibility',
    name: 'Accessibility Improvement',
    description: 'Campaign for inclusive design, disability accommodations, and universal access features',
    category: 'Social Impact',
    icon: 'Accessibility',
    coverGradient: 'from-blue-500 to-cyan-600',
    structure: {
      titlePattern: '[Product/Service] needs better [Accessibility Feature] for [User Group]',
      descriptionTemplate: 'Explain how lack of accessibility excludes users and the impact of this improvement',
      problemStatement: 'Currently, [user group] struggle because...',
      idealOutcome: 'With these changes, everyone could...',
    },
    preferenceFields: [
      {
        fieldName: 'Accessibility Type',
        fieldType: 'choice',
        options: ['Visual Impairment', 'Hearing Impairment', 'Mobility Issues', 'Cognitive Disabilities', 'General Inclusive Design'],
      },
      {
        fieldName: 'Affected User Groups',
        fieldType: 'text',
        placeholder: 'Who is currently excluded or underserved?',
      },
      {
        fieldName: 'Specific Feature Needed',
        fieldType: 'text',
        placeholder: 'e.g., "Screen reader compatibility", "Closed captions", "Voice controls"',
      },
      {
        fieldName: 'Personal Connection',
        fieldType: 'text',
        placeholder: 'Do you have personal experience with this accessibility need?',
      },
    ],
    tips: [
      'Share personal stories and real-world impact narratives',
      'Reference accessibility standards (WCAG, ADA, etc.)',
      'Highlight the business case and market size for accessible products',
      'Provide specific technical recommendations when possible',
      'Emphasize that accessibility benefits everyone, not just disabled users',
    ],
  },
  {
    id: 'price-value',
    name: 'Price & Value',
    description: 'Advocate for pricing changes, value additions, or better pricing tiers and options',
    category: 'Consumer Advocacy',
    icon: 'PiggyBank',
    coverGradient: 'from-yellow-500 to-amber-600',
    structure: {
      titlePattern: '[Product] should [Price Change] to [Value Proposition]',
      descriptionTemplate: 'Make the case for pricing adjustments or value additions based on market demand',
      problemStatement: 'The current pricing model is problematic because...',
      idealOutcome: 'Ideally, [product] would offer...',
    },
    preferenceFields: [
      {
        fieldName: 'Price Issue',
        fieldType: 'choice',
        options: ['Too Expensive', 'Poor Value', 'Unfair Pricing Model', 'Hidden Fees', 'Limited Options'],
      },
      {
        fieldName: 'Target Price Point',
        fieldType: 'text',
        placeholder: 'What would be fair? (e.g., "$50-75", "50% cheaper")',
      },
      {
        fieldName: 'Value Additions Wanted',
        fieldType: 'text',
        placeholder: 'What features or benefits would justify the cost?',
      },
      {
        fieldName: 'Willingness to Pay',
        fieldType: 'rating',
        placeholder: 'How much would you pay for an improved version?',
      },
    ],
    tips: [
      'Research and compare competitor pricing in the market',
      'Quantify the value proposition and ROI for the consumer',
      'Explain how pricing affects product adoption and accessibility',
      'Consider subscription vs. one-time purchase models',
      'Share how pricing impacts your purchasing decisions',
    ],
  },
  {
    id: 'health-wellness',
    name: 'Health & Wellness',
    description: 'Build support for health-focused products, wellness features, or medical innovations',
    category: 'Health',
    icon: 'Heart',
    coverGradient: 'from-red-500 to-rose-600',
    structure: {
      titlePattern: '[Brand] should create [Health/Wellness Product] for [Health Goal]',
      descriptionTemplate: 'Describe the health benefits, target audience, and how this improves wellbeing',
      problemStatement: 'People struggle with [health challenge] because...',
      idealOutcome: 'This product would help us achieve...',
    },
    preferenceFields: [
      {
        fieldName: 'Health Category',
        fieldType: 'choice',
        options: ['Mental Health', 'Physical Fitness', 'Nutrition', 'Sleep Quality', 'Stress Management', 'Disease Prevention'],
      },
      {
        fieldName: 'Health Goal',
        fieldType: 'text',
        placeholder: 'What health outcome are you seeking?',
      },
      {
        fieldName: 'Evidence/Research',
        fieldType: 'text',
        placeholder: 'Any scientific studies or data supporting this?',
      },
      {
        fieldName: 'Personal Health Story',
        fieldType: 'text',
        placeholder: 'How has this health issue affected your life?',
      },
    ],
    tips: [
      'Reference peer-reviewed research and clinical studies',
      'Share personal transformation stories and testimonials',
      'Discuss how this improves quality of life and longevity',
      'Address safety and efficacy concerns with evidence',
      'Highlight how mental and physical health intersect',
    ],
  },
  {
    id: 'size-inclusivity',
    name: 'Size Inclusivity',
    description: 'Advocate for expanded size ranges, better fit options, and inclusive product sizing',
    category: 'Inclusivity',
    icon: 'Maximize2',
    coverGradient: 'from-purple-500 to-pink-600',
    structure: {
      titlePattern: '[Brand] should offer [Size Range] to serve [Customer Group]',
      descriptionTemplate: 'Make the case for inclusive sizing based on market demand and customer needs',
      problemStatement: 'Currently, [customer group] are excluded because...',
      idealOutcome: 'We would love to shop at [brand] if they offered...',
    },
    preferenceFields: [
      {
        fieldName: 'Product Category',
        fieldType: 'choice',
        options: ['Clothing', 'Shoes', 'Accessories', 'Activewear', 'Swimwear', 'Intimate Apparel'],
      },
      {
        fieldName: 'Missing Size Range',
        fieldType: 'text',
        placeholder: 'e.g., "Extended plus sizes", "Tall options", "Petite lengths"',
      },
      {
        fieldName: 'Fit Preferences',
        fieldType: 'text',
        placeholder: 'e.g., "Curvy cuts", "Straight sizes", "Gender-neutral"',
      },
      {
        fieldName: 'How Often You Shop',
        fieldType: 'choice',
        options: ['Weekly', 'Monthly', 'Quarterly', 'Seasonally', 'Rarely'],
      },
    ],
    tips: [
      'Share the market data on size diversity demand',
      'Explain how excluding sizes loses significant revenue',
      'Highlight successful brands with inclusive sizing',
      'Discuss how sizing exclusion affects mental health and body image',
      'Include testimonials from customers who stopped shopping due to size gaps',
    ],
  },
]

export function getTemplateById(id: string): CampaignTemplate | undefined {
  return campaignTemplates.find((t) => t.id === id)
}

export function getTemplatesByCategory(category: string): CampaignTemplate[] {
  return campaignTemplates.filter((t) => t.category === category)
}

export function getAllCategories(): string[] {
  return Array.from(new Set(campaignTemplates.map((t) => t.category)))
}
