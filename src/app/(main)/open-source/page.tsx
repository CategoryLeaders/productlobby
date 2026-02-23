import { Metadata } from "next";
import { Code, Github, Star, ExternalLink, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Open Source | ProductLobby",
};

const openSourceProjects = [
  {
    id: 1,
    name: "API Client Library",
    description: "A comprehensive REST API client library with built-in retry logic, caching, and TypeScript support for seamless integration.",
    language: "TypeScript",
    stars: 2847,
    githubUrl: "https://github.com/productlobby/api-client",
  },
  {
    id: 2,
    name: "UI Component Library",
    description: "Reusable React components with Tailwind CSS styling, accessibility features, and comprehensive documentation.",
    language: "React",
    stars: 3421,
    githubUrl: "https://github.com/productlobby/ui-components",
  },
  {
    id: 3,
    name: "Analytics SDK",
    description: "Lightweight analytics tracking SDK for web and mobile applications with privacy-first approach and batch processing.",
    language: "TypeScript",
    stars: 1956,
    githubUrl: "https://github.com/productlobby/analytics-sdk",
  },
  {
    id: 4,
    name: "CLI Tool",
    description: "Command-line interface tool for developers to scaffold projects, manage configurations, and automate common workflows.",
    language: "Rust",
    stars: 2134,
    githubUrl: "https://github.com/productlobby/cli-tool",
  },
  {
    id: 5,
    name: "Webhook Handler",
    description: "Robust webhook handler with retry mechanisms, signature verification, and delivery tracking for reliable event processing.",
    language: "Go",
    stars: 1543,
    githubUrl: "https://github.com/productlobby/webhook-handler",
  },
  {
    id: 6,
    name: "Documentation Generator",
    description: "Automated documentation generator that transforms code comments and JSDoc into beautiful, interactive documentation sites.",
    language: "JavaScript",
    stars: 1867,
    githubUrl: "https://github.com/productlobby/docs-generator",
  },
  {
    id: 7,
    name: "Testing Framework",
    description: "Unified testing framework combining unit, integration, and E2E testing capabilities with intuitive API and excellent DX.",
    language: "TypeScript",
    stars: 2456,
    githubUrl: "https://github.com/productlobby/testing-framework",
  },
  {
    id: 8,
    name: "Performance Monitor",
    description: "Real-time performance monitoring library for tracking metrics, identifying bottlenecks, and optimizing application performance.",
    language: "JavaScript",
    stars: 1789,
    githubUrl: "https://github.com/productlobby/perf-monitor",
  },
];

export default function OpenSourcePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-violet-500/20 rounded-lg border border-violet-500/30">
              <Code className="w-12 h-12 text-violet-400" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
            Open Source at<br />
            <span className="bg-gradient-to-r from-violet-400 via-lime-400 to-violet-400 bg-clip-text text-transparent">
              ProductLobby
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Building the future of product management with open source tools and libraries that empower developers worldwide.
          </p>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <GitBranch className="w-8 h-8 text-lime-400" />
              Our Philosophy
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-4">
              We believe in the power of open source to transform how teams build and collaborate. Our commitment is to create
              tools that solve real problems, are well-documented, actively maintained, and welcome contributions from the community.
            </p>
            <p className="text-slate-300 text-lg leading-relaxed">
              Every project we open source is backed by our core team and thousands of users in production, ensuring quality,
              reliability, and continuous improvement. We're not just sharing code—we're building a community of developers
              passionate about creating exceptional products.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12 text-center">
            Featured Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {openSourceProjects.map((project) => (
              <div
                key={project.id}
                className="bg-slate-800/50 border border-slate-700 hover:border-violet-500/50 rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10 flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-white pr-2">{project.name}</h3>
                  <Github className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
                </div>
                <p className="text-slate-300 text-sm mb-4 flex-grow">
                  {project.description}
                </p>
                <div className="flex items-center justify-between mb-4 pt-4 border-t border-slate-700">
                  <span className="inline-block px-3 py-1 bg-lime-500/20 text-lime-300 text-xs font-medium rounded-full border border-lime-500/30">
                    {project.language}
                  </span>
                  <div className="flex items-center gap-1 text-slate-300">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium">{project.stars.toLocaleString()}</span>
                  </div>
                </div>
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    className="w-full border-violet-500/50 text-violet-400 hover:bg-violet-500/10 hover:border-violet-400"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    View on GitHub
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contribute CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-violet-600/20 to-lime-600/20 border border-violet-500/50 rounded-lg p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Contribute?
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
              We welcome contributions of all kinds—bug fixes, features, documentation, and translations. Check out our
              contribution guidelines and join thousands of developers improving ProductLobby.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://github.com/productlobby" target="_blank" rel="noopener noreferrer">
                <Button
                  className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white"
                >
                  <Github className="w-4 h-4 mr-2" />
                  Explore on GitHub
                </Button>
              </a>
              <a href="/docs/contributing" >
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-lime-500/50 text-lime-400 hover:bg-lime-500/10 hover:border-lime-400"
                >
                  <GitBranch className="w-4 h-4 mr-2" />
                  Contribution Guide
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
