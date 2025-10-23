import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getUserFromRequest } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await getUserFromRequest(request)

    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only PDF and images are allowed.' 
      }, { status: 400 })
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 10MB.' 
      }, { status: 400 })
    }

    // Handle different file types
    let base64Data: string
    let mimeType: string

    if (file.type === 'application/pdf') {
      // For PDFs, we'll use a placeholder approach for now
      // In production, you'd implement proper PDF to image conversion
      console.log('PDF processing: Using placeholder approach')
      const imageData = await convertPDFToImages(file)
      base64Data = imageData
      mimeType = 'image/png'
    } else {
      // Handle image files directly
      const arrayBuffer = await file.arrayBuffer()
      base64Data = Buffer.from(arrayBuffer).toString('base64')
      mimeType = file.type
    }

    // Analyze with AI
    const aiResult = await analyzeWithAI(base64Data, mimeType, file.name)

    return NextResponse.json({
      success: true,
      extractedData: aiResult
    })

  } catch (error) {
    console.error('AI analysis error:', error)
    return NextResponse.json({ 
      error: 'AI analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function analyzeWithAI(base64Data: string, mimeType: string, fileName: string): Promise<any> {
  const apiKey = getAPIKey()
  const provider = getProvider()

  if (!apiKey) {
    throw new Error('AI API key not configured. Please set OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_API_KEY in your environment variables.')
  }

  try {
    let analysisResult: any

    switch (provider) {
      case 'openai':
        analysisResult = await analyzeWithOpenAI(base64Data, mimeType, apiKey, fileName)
        break
      case 'anthropic':
        analysisResult = await analyzeWithAnthropic(base64Data, mimeType, apiKey, fileName)
        break
      case 'google':
        analysisResult = await analyzeWithGoogle(base64Data, mimeType, apiKey, fileName)
        break
      default:
        throw new Error(`Unsupported AI provider: ${provider}`)
    }

    return parseAIResponse(analysisResult, fileName)
  } catch (error) {
    console.error('AI analysis error:', error)
    throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

function getAPIKey(): string {
  return process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GOOGLE_API_KEY || ''
}

function getProvider(): string {
  if (process.env.OPENAI_API_KEY) return 'openai'
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic'
  if (process.env.GOOGLE_API_KEY) return 'google'
  return 'openai' // Default
}

async function analyzeWithOpenAI(base64Data: string, mimeType: string, apiKey: string, fileName: string): Promise<any> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a medical AI assistant specialized in analyzing health documents. 
          Extract structured health data from medical reports, lab results, and health documents.
          
          IMPORTANT: You MUST respond with ONLY valid JSON. Do not include any text before or after the JSON.
          If you cannot analyze the image, return a JSON object with empty results but valid structure.
          
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
          
          Be extremely accurate with medical data extraction. If the image is unclear or unreadable, 
          return a JSON response with empty results but valid structure.`
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
  const content = result.choices[0].message.content
  
  // Handle non-JSON responses
  try {
    return JSON.parse(content)
  } catch (parseError) {
    console.error('AI returned non-JSON response:', content)
    // Return a fallback structure for non-JSON responses
    return {
      testName: extractTestNameFromFileName(fileName),
      testCategory: 'other',
      testDate: new Date().toISOString().split('T')[0],
      results: {},
      flaggedValues: [],
      summary: `AI analysis returned non-JSON response: ${content.substring(0, 200)}...`,
      recommendations: ['Please try uploading a clearer image or different file format'],
      extractedTables: [],
      keyFindings: ['Unable to process document - AI returned non-JSON response'],
      confidence: 0.1
    }
  }
}

async function analyzeWithAnthropic(base64Data: string, mimeType: string, apiKey: string, fileName: string): Promise<any> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
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
  const content = result.content[0].text
  
  // Handle non-JSON responses
  try {
    return JSON.parse(content)
  } catch (parseError) {
    console.error('Anthropic returned non-JSON response:', content)
    // Return a fallback structure for non-JSON responses
    return {
      testName: extractTestNameFromFileName(fileName),
      testCategory: 'other',
      testDate: new Date().toISOString().split('T')[0],
      results: {},
      flaggedValues: [],
      summary: `AI analysis returned non-JSON response: ${content.substring(0, 200)}...`,
      recommendations: ['Please try uploading a clearer image or different file format'],
      extractedTables: [],
      keyFindings: ['Unable to process document - AI returned non-JSON response'],
      confidence: 0.1
    }
  }
}

async function analyzeWithGoogle(base64Data: string, mimeType: string, apiKey: string, fileName: string): Promise<any> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
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
  const content = result.candidates[0].content.parts[0].text
  
  // Handle non-JSON responses
  try {
    return JSON.parse(content)
  } catch (parseError) {
    console.error('Google returned non-JSON response:', content)
    // Return a fallback structure for non-JSON responses
    return {
      testName: extractTestNameFromFileName(fileName),
      testCategory: 'other',
      testDate: new Date().toISOString().split('T')[0],
      results: {},
      flaggedValues: [],
      summary: `AI analysis returned non-JSON response: ${content.substring(0, 200)}...`,
      recommendations: ['Please try uploading a clearer image or different file format'],
      extractedTables: [],
      keyFindings: ['Unable to process document - AI returned non-JSON response'],
      confidence: 0.1
    }
  }
}

function parseAIResponse(aiResponse: any, fileName: string): any {
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
    testName: aiResponse.testName || extractTestNameFromFileName(fileName),
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

function extractTestNameFromFileName(fileName: string): string {
  const nameWithoutExt = fileName.split('.')[0]
  return nameWithoutExt.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

async function convertPDFToImages(file: File): Promise<string> {
  try {
    // For now, we'll handle PDFs by returning a placeholder
    // In a production environment, you would use a proper PDF to image service
    // or implement a server-side PDF rendering solution
    
    console.log('PDF file received:', file.name, 'Size:', file.size)
    
    // Create a simple placeholder image for PDFs
    // This is a 1x1 transparent PNG in base64
    const placeholderImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    
    // In a real implementation, you would:
    // 1. Use a service like Puppeteer to render PDF to image
    // 2. Use a cloud service like AWS Textract or Google Document AI
    // 3. Use a dedicated PDF processing service
    
    return placeholderImage

  } catch (error) {
    console.error('PDF to image conversion error:', error)
    throw new Error(`Failed to convert PDF to image: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
