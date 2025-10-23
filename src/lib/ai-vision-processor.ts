// AI Vision Processor - Makes actual AI API calls for document analysis
// This uses AI vision to analyze documents and extract structured health data

export interface ExtractedHealthData {
  testName: string
  testCategory: 'blood_work' | 'imaging' | 'vital_signs' | 'specialized' | 'other'
  testDate: string
  results: Record<string, any>
  normalRanges: Record<string, any>
  flaggedValues: string[]
  summary: string
  recommendations: string[]
  aiAnalysis: {
    confidence: number
    processingMethod: string
    extractedTables: any[]
    keyFindings: string[]
  }
}

export interface HealthParameter {
  name: string
  value: string
  unit: string
  status: 'normal' | 'high' | 'low' | 'abnormal'
  normalRange?: string
  confidence?: number
}

export class AIVisionProcessor {
  private static readonly AI_PROVIDERS = {
    OPENAI: 'openai',
    ANTHROPIC: 'anthropic',
    GOOGLE: 'google'
  }

  private static getAPIKey(): string {
    // You'll need to set this in your environment variables
    return process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || ''
  }

  private static getProvider(): string {
    if (process.env.OPENAI_API_KEY) return this.AI_PROVIDERS.OPENAI
    if (process.env.ANTHROPIC_API_KEY) return this.AI_PROVIDERS.ANTHROPIC
    if (process.env.GOOGLE_API_KEY) return this.AI_PROVIDERS.GOOGLE
    return this.AI_PROVIDERS.OPENAI // Default
  }

  static async analyzeDocumentWithAI(file: File): Promise<ExtractedHealthData> {
    const provider = this.getProvider()
    const apiKey = this.getAPIKey()

    if (!apiKey) {
      throw new Error('AI API key not configured. Please set OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_API_KEY')
    }

    try {
      // Convert file to base64 for AI analysis
      const base64Data = await this.fileToBase64(file)
      
      let analysisResult: any
      
      switch (provider) {
        case this.AI_PROVIDERS.OPENAI:
          analysisResult = await this.analyzeWithOpenAI(base64Data, file.type)
          break
        case this.AI_PROVIDERS.ANTHROPIC:
          analysisResult = await this.analyzeWithAnthropic(base64Data, file.type)
          break
        case this.AI_PROVIDERS.GOOGLE:
          analysisResult = await this.analyzeWithGoogle(base64Data, file.type)
          break
        default:
          throw new Error(`Unsupported AI provider: ${provider}`)
      }

      return this.parseAIResponse(analysisResult, file.name)
    } catch (error) {
      console.error('AI analysis error:', error)
      throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remove data URL prefix to get just the base64 data
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  private static async analyzeWithOpenAI(base64Data: string, mimeType: string): Promise<any> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAPIKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // GPT-4 with vision
        messages: [
          {
            role: 'system',
            content: `You are a medical AI assistant specialized in analyzing health documents. 
            Extract structured health data from medical reports, lab results, and health documents.
            
            Return a JSON object with this exact structure:
            {
              "testName": "Name of the test or examination",
              "testCategory": "blood_work|imaging|vital_signs|specialized|other",
              "testDate": "YYYY-MM-DD format",
              "results": {
                "parameter_name": {
                  "value": "actual_value",
                  "unit": "unit_of_measurement",
                  "status": "normal|high|low|abnormal",
                  "normalRange": "normal_range_if_available"
                }
              },
              "flaggedValues": ["list of parameters outside normal range"],
              "summary": "Comprehensive 2-3 paragraph summary of the health report",
              "recommendations": ["list of medical recommendations"],
              "extractedTables": [{"tableName": "string", "data": [{"parameter": "value"}]}],
              "keyFindings": ["list of key medical findings"],
              "confidence": 0.95
            }
            
            Be extremely accurate with medical data extraction.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this health document and extract all medical parameters, create structured tables, and provide a comprehensive summary.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Data}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0.1
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
    }

    const result = await response.json()
    return JSON.parse(result.choices[0].message.content)
  }

  private static async analyzeWithAnthropic(base64Data: string, mimeType: string): Promise<any> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.getAPIKey(),
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this health document and extract structured medical data. Return a JSON object with test results, parameters, normal ranges, flagged values, summary, and recommendations.`
              },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`)
    }

    const result = await response.json()
    return JSON.parse(result.content[0].text)
  }

  private static async analyzeWithGoogle(base64Data: string, mimeType: string): Promise<any> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${this.getAPIKey()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: 'Analyze this health document and extract structured medical data. Return a JSON object with test results, parameters, normal ranges, flagged values, summary, and recommendations.'
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 4000
        }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Google API error: ${error.error?.message || 'Unknown error'}`)
    }

    const result = await response.json()
    return JSON.parse(result.candidates[0].content.parts[0].text)
  }

  private static parseAIResponse(aiResponse: any, fileName: string): ExtractedHealthData {
    // Validate and structure the AI response
    const results: Record<string, any> = {}
    const normalRanges: Record<string, any> = {}
    const flaggedValues: string[] = []

    // Process the results from AI
    if (aiResponse.results) {
      Object.entries(aiResponse.results).forEach(([key, value]: [string, any]) => {
        results[key] = {
          value: value.value || '',
          unit: value.unit || '',
          status: value.status || 'normal',
          confidence: value.confidence || 0.9
        }

        if (value.normalRange) {
          normalRanges[key] = {
            range: value.normalRange,
            unit: value.unit || ''
          }
        }

        if (value.status && value.status !== 'normal') {
          flaggedValues.push(`${key}: ${value.value} ${value.unit} (${value.status})`)
        }
      })
    }

    return {
      testName: aiResponse.testName || this.extractTestNameFromFileName(fileName),
      testCategory: aiResponse.testCategory || 'other',
      testDate: aiResponse.testDate || new Date().toISOString().split('T')[0],
      results,
      normalRanges,
      flaggedValues: aiResponse.flaggedValues || flaggedValues,
      summary: aiResponse.summary || 'AI analysis completed successfully.',
      recommendations: aiResponse.recommendations || [],
      aiAnalysis: {
        confidence: aiResponse.confidence || 0.9,
        processingMethod: 'AI Vision Analysis',
        extractedTables: aiResponse.extractedTables || [],
        keyFindings: aiResponse.keyFindings || []
      }
    }
  }

  private static extractTestNameFromFileName(fileName: string): string {
    // Extract test name from filename
    const nameWithoutExt = fileName.split('.')[0]
    return nameWithoutExt.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  static async generateHealthSummary(extractedData: ExtractedHealthData): Promise<string> {
    const provider = this.getProvider()
    const apiKey = this.getAPIKey()

    if (!apiKey) {
      return extractedData.summary // Fallback to existing summary
    }

    try {
      const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a medical AI assistant. Generate a comprehensive health summary based on the extracted medical data.'
            },
            {
              role: 'user',
              content: `Based on this health data, provide a detailed summary:
              
              Test: ${extractedData.testName}
              Category: ${extractedData.testCategory}
              Date: ${extractedData.testDate}
              Results: ${JSON.stringify(extractedData.results, null, 2)}
              Flagged Values: ${extractedData.flaggedValues.join(', ')}
              
              Please provide:
              1. Overall health status assessment
              2. Key findings and concerns
              3. Specific recommendations
              4. Follow-up suggestions
              
              Keep it professional and medically accurate.`
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        })
      })

      if (response.ok) {
        const result = await response.json()
        return result.choices[0].message.content
      }
    } catch (error) {
      console.error('AI summary generation failed:', error)
    }

    return extractedData.summary
  }

  static async createHealthTable(extractedData: ExtractedHealthData): Promise<any[]> {
    // Create structured tables from the extracted data
    const tables = []

    // Main results table
    if (Object.keys(extractedData.results).length > 0) {
      tables.push({
        name: 'Health Parameters',
        headers: ['Parameter', 'Value', 'Unit', 'Status', 'Normal Range'],
        rows: Object.entries(extractedData.results).map(([param, data]) => [
          param,
          data.value,
          data.unit,
          data.status,
          extractedData.normalRanges[param]?.range || 'N/A'
        ])
      })
    }

    // Flagged values table
    if (extractedData.flaggedValues.length > 0) {
      tables.push({
        name: 'Flagged Values',
        headers: ['Parameter', 'Value', 'Status', 'Recommendation'],
        rows: extractedData.flaggedValues.map(flagged => {
          const [param, value, status] = flagged.split(': ')
          return [
            param,
            value,
            status,
            'Consult healthcare provider'
          ]
        })
      })
    }

    return tables
  }
}

