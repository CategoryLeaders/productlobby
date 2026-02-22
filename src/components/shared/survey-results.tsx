'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Download, RefreshCw, Filter } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SurveyResultsProps {
  surveyId: string
  campaignId: string
  title: string
}

interface ResultsData {
  surveyId: string
  title: string
  totalResponses: number
  completionRate: number
  questionResults: any[]
}

export function SurveyResults({ surveyId, campaignId, title }: SurveyResultsProps) {
  const [results, setResults] = useState<ResultsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [lobbyFilter, setLobbyFilter] = useState<string>('all')

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/surveys/${surveyId}/results`)
      if (!response.ok) throw new Error('Failed to fetch results')
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: 'CSV' | 'JSON') => {
    setExporting(true)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/surveys/${surveyId}/results?format=${format}`)
      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `survey-results.${format.toLowerCase()}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      alert('Export failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  if (!results) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-800">Failed to load survey results</p>
        </CardContent>
      </Card>
    )
  }

  const COLORS = ['#7C3AED', '#84CC16', '#06B6D4', '#F59E0B', '#EF4444', '#8B5CF6']

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>Survey results and insights</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={fetchResults}
                variant="outline"
                size="sm"
                className="border-violet-300 text-violet-600 hover:bg-violet-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Select value={lobbyFilter} onValueChange={setLobbyFilter}>
                <SelectTrigger className="w-40 border-violet-200">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by intensity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Responses</SelectItem>
                  <SelectItem value="NEAT_IDEA">Neat Idea</SelectItem>
                  <SelectItem value="PROBABLY_BUY">Probably Buy</SelectItem>
                  <SelectItem value="TAKE_MY_MONEY">Take My Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-violet-50 p-4 rounded-lg border border-violet-200">
              <p className="text-sm text-gray-600 mb-1">Total Responses</p>
              <p className="text-3xl font-bold text-violet-600">{results.totalResponses}</p>
            </div>
            <div className="bg-lime-50 p-4 rounded-lg border border-lime-200">
              <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
              <p className="text-3xl font-bold text-lime-600">{results.completionRate.toFixed(1)}%</p>
            </div>
            <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
              <p className="text-sm text-gray-600 mb-1">Questions</p>
              <p className="text-3xl font-bold text-cyan-600">{results.questionResults.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {results.questionResults.map((qr, idx) => (
          <QuestionResultCard key={qr.questionId} questionResult={qr} index={idx} colors={COLORS} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export Results</CardTitle>
          <CardDescription>Download survey data in your preferred format</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button
            onClick={() => handleExport('CSV')}
            disabled={exporting}
            variant="outline"
            className="border-violet-300 text-violet-600 hover:bg-violet-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={() => handleExport('JSON')}
            disabled={exporting}
            className="bg-lime-500 hover:bg-lime-600 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

interface QuestionResultCardProps {
  questionResult: any
  index: number
  colors: string[]
}

function QuestionResultCard({ questionResult, index, colors }: QuestionResultCardProps) {
  const { question, questionType, responseCount, results } = questionResult

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {index + 1}. {question}
        </CardTitle>
        <CardDescription>{responseCount} responses</CardDescription>
      </CardHeader>
      <CardContent>
        {questionType === 'MULTIPLE_CHOICE' && results?.type === 'MULTIPLE_CHOICE' && (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={results.options}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="option" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="count" fill="#7C3AED" />
              </BarChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {results.options.map((opt: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{opt.option}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-600 transition-all"
                        style={{ width: `${opt.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{opt.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {questionType === 'RATING_SCALE' && results?.type === 'RATING_SCALE' && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-violet-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Average</p>
                <p className="text-2xl font-bold text-violet-600">{results.average.toFixed(1)}</p>
              </div>
              <div className="bg-lime-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Median</p>
                <p className="text-2xl font-bold text-lime-600">{results.median}</p>
              </div>
              <div className="bg-cyan-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Min</p>
                <p className="text-2xl font-bold text-cyan-600">{results.min}</p>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Max</p>
                <p className="text-2xl font-bold text-amber-600">{results.max}</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={results.distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="scale" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#84CC16" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {questionType === 'OPEN_TEXT' && results?.type === 'OPEN_TEXT' && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {results.responses.slice(0, 10).map((r: any, i: number) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700">{r.response}</p>
                <p className="text-xs text-gray-500 mt-1">{r.count} {r.count === 1 ? 'mention' : 'mentions'}</p>
              </div>
            ))}
            {results.responses.length > 10 && (
              <p className="text-sm text-gray-500 text-center py-2">
                +{results.responses.length - 10} more responses
              </p>
            )}
          </div>
        )}

        {questionType === 'RANKING' && results?.type === 'RANKING' && (
          <div className="space-y-3">
            {results.itemRankings.map((ir: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-violet-600 w-8 text-center">{i + 1}</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{ir.item}</p>
                  <p className="text-xs text-gray-500">
                    Avg rank: {ir.averageRank.toFixed(2)} ({ir.totalRanks} votes)
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {questionType === 'MATRIX' && results?.type === 'MATRIX' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left p-2 font-medium">Row</th>
                  {Object.keys(results.rows[0]?.columnAverages || {}).map((col) => (
                    <th key={col} className="text-center p-2 font-medium text-xs">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.rows.map((row: any, i: number) => (
                  <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-2 font-medium text-gray-700">{row.row}</td>
                    {Object.values(row.columnAverages || {}).map((avg: any, j: number) => (
                      <td key={j} className="text-center p-2">
                        <div className="inline-block px-2 py-1 bg-violet-100 rounded text-violet-700 font-medium">
                          {avg.toFixed(2)}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
