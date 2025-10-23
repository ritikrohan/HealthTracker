// Simple PDF processor for server-side compatibility
// This is a fallback that doesn't use vision libraries

export interface ExtractedHealthData {
  testName: string
  testCategory: 'blood_work' | 'imaging' | 'vital_signs' | 'specialized' | 'other'
  testDate: string
  results: Record<string, any>
  normalRanges: Record<string, any>
  flaggedValues: string[]
  summary: string
  recommendations: string[]
}

export interface HealthParameter {
  name: string
  value: string
  unit: string
  status: 'normal' | 'high' | 'low' | 'abnormal'
  normalRange?: string
}

export class SimplePDFProcessor {
  private static readonly HEALTH_PATTERNS = {
    // Common blood test parameters
    bloodTests: [
      'hemoglobin', 'hgb', 'hb', 'hematocrit', 'hct', 'white blood cell', 'wbc',
      'red blood cell', 'rbc', 'platelet', 'glucose', 'glucose fasting', 'cholesterol',
      'hdl', 'ldl', 'triglycerides', 'creatinine', 'bun', 'sodium', 'potassium',
      'chloride', 'co2', 'calcium', 'phosphorus', 'magnesium', 'alt', 'ast',
      'alkaline phosphatase', 'bilirubin', 'total protein', 'albumin', 'globulin',
      'tsh', 't3', 't4', 'vitamin d', 'b12', 'folate', 'iron', 'ferritin'
    ],
    
    // Vital signs
    vitalSigns: [
      'blood pressure', 'bp', 'systolic', 'diastolic', 'heart rate', 'hr',
      'temperature', 'temp', 'respiratory rate', 'rr', 'oxygen saturation', 'spo2',
      'weight', 'height', 'bmi', 'body mass index'
    ],
    
    // Imaging keywords
    imaging: [
      'x-ray', 'xray', 'ct scan', 'mri', 'ultrasound', 'mammogram', 'echocardiogram',
      'ekg', 'ecg', 'stress test', 'cardiac', 'chest', 'abdomen', 'pelvis'
    ]
  }

  private static readonly NORMAL_RANGES: Record<string, { min: number; max: number; unit: string }> = {
    'hemoglobin': { min: 12, max: 16, unit: 'g/dL' },
    'hematocrit': { min: 36, max: 46, unit: '%' },
    'glucose': { min: 70, max: 100, unit: 'mg/dL' },
    'cholesterol': { min: 0, max: 200, unit: 'mg/dL' },
    'hdl': { min: 40, max: 60, unit: 'mg/dL' },
    'ldl': { min: 0, max: 100, unit: 'mg/dL' },
    'creatinine': { min: 0.6, max: 1.2, unit: 'mg/dL' },
    'sodium': { min: 136, max: 145, unit: 'mEq/L' },
    'potassium': { min: 3.5, max: 5.0, unit: 'mEq/L' },
    'tsh': { min: 0.4, max: 4.0, unit: 'mIU/L' }
  }

  static async extractTextFromFile(file: File): Promise<string> {
    // For server-side compatibility, return a placeholder
    if (typeof window === 'undefined') {
      return `Document: ${file.name} - Processing requires client-side environment`
    }
    
    // Client-side implementation with basic PDF processing
    try {
      // Dynamic import of PDF.js for client-side
      const pdfjsLib = await import('pdfjs-dist')
      
      // Configure PDF.js worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
      
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      
      let fullText = ''
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
        fullText += pageText + '\n'
      }
      
      return fullText
    } catch (error) {
      console.error('Error extracting text from PDF:', error)
      // Return a fallback text for basic processing
      return `Health Document: ${file.name}\nType: ${file.type}\nSize: ${file.size} bytes\n\nThis document has been uploaded and is ready for processing.`
    }
  }

  static parseHealthData(documentText: string, documentType: string): ExtractedHealthData {
    const lines = documentText.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    
    // Extract test name and date
    const testName = this.extractTestName(lines, documentType)
    const testDate = this.extractTestDate(lines)
    const testCategory = this.determineTestCategory(testName, documentText)
    
    // Extract health parameters
    const parameters = this.extractHealthParameters(lines)
    
    // Organize results
    const results: Record<string, any> = {}
    const normalRanges: Record<string, any> = {}
    const flaggedValues: string[] = []
    
    parameters.forEach(param => {
      results[param.name] = {
        value: param.value,
        unit: param.unit,
        status: param.status
      }
      
      if (param.normalRange) {
        normalRanges[param.name] = {
          range: param.normalRange,
          unit: param.unit
        }
      }
      
      if (param.status !== 'normal') {
        flaggedValues.push(`${param.name}: ${param.value} ${param.unit} (${param.status})`)
      }
    })
    
    // Generate summary and recommendations
    const summary = this.generateSummary(parameters, testName)
    const recommendations = this.generateRecommendations(parameters)
    
    return {
      testName,
      testCategory,
      testDate,
      results,
      normalRanges,
      flaggedValues,
      summary,
      recommendations
    }
  }

  private static extractTestName(lines: string[], documentType: string): string {
    // Look for common test name patterns
    const testNamePatterns = [
      /(?:test|exam|study|panel|profile)[\s:]+([a-zA-Z\s]+)/i,
      /(?:blood|lab|laboratory)[\s]+(?:test|work|panel)[\s:]+([a-zA-Z\s]+)/i,
      /(?:complete|comprehensive)[\s]+(?:blood|metabolic)[\s]+(?:count|panel)[\s:]+([a-zA-Z\s]+)/i
    ]
    
    for (const line of lines) {
      for (const pattern of testNamePatterns) {
        const match = line.match(pattern)
        if (match) {
          return match[1].trim()
        }
      }
    }
    
    // Fallback based on document type
    switch (documentType.toLowerCase()) {
      case 'blood_work':
        return 'Blood Work Panel'
      case 'imaging':
        return 'Medical Imaging Study'
      case 'vital_signs':
        return 'Vital Signs Check'
      default:
        return 'Health Report'
    }
  }

  private static extractTestDate(lines: string[]): string {
    const datePatterns = [
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
      /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,
      /(january|february|march|april|may|june|july|august|september|october|november|december)[\s,]+(\d{1,2})[\s,]+(\d{4})/i
    ]
    
    for (const line of lines) {
      for (const pattern of datePatterns) {
        const match = line.match(pattern)
        if (match) {
          return match[0]
        }
      }
    }
    
    return new Date().toISOString().split('T')[0] // Default to today
  }

  private static determineTestCategory(testName: string, documentText: string): 'blood_work' | 'imaging' | 'vital_signs' | 'specialized' | 'other' {
    const text = (testName + ' ' + documentText).toLowerCase()
    
    if (this.HEALTH_PATTERNS.bloodTests.some(pattern => text.includes(pattern))) {
      return 'blood_work'
    }
    
    if (this.HEALTH_PATTERNS.imaging.some(pattern => text.includes(pattern))) {
      return 'imaging'
    }
    
    if (this.HEALTH_PATTERNS.vitalSigns.some(pattern => text.includes(pattern))) {
      return 'vital_signs'
    }
    
    return 'other'
  }

  private static extractHealthParameters(lines: string[]): HealthParameter[] {
    const parameters: HealthParameter[] = []
    
    for (const line of lines) {
      // Look for parameter: value unit patterns
      const patterns = [
        /([a-zA-Z\s]+):\s*([\d\.]+)\s*([a-zA-Z\/%]+)/i,
        /([a-zA-Z\s]+)\s+([\d\.]+)\s*([a-zA-Z\/%]+)/i,
        /([a-zA-Z\s]+)\s*=\s*([\d\.]+)\s*([a-zA-Z\/%]+)/i
      ]
      
      for (const pattern of patterns) {
        const match = line.match(pattern)
        if (match) {
          const name = match[1].trim().toLowerCase()
          const value = parseFloat(match[2])
          const unit = match[3].trim()
          
          // Check if this looks like a health parameter
          if (this.isHealthParameter(name)) {
            const status = this.determineStatus(name, value, unit)
            const normalRange = this.getNormalRange(name)
            
            parameters.push({
              name: this.cleanParameterName(name),
              value: match[2],
              unit,
              status,
              normalRange
            })
          }
        }
      }
    }
    
    return parameters
  }

  private static isHealthParameter(name: string): boolean {
    const allPatterns = [
      ...this.HEALTH_PATTERNS.bloodTests,
      ...this.HEALTH_PATTERNS.vitalSigns,
      ...this.HEALTH_PATTERNS.imaging
    ]
    
    return allPatterns.some(pattern => name.includes(pattern))
  }

  private static cleanParameterName(name: string): string {
    return name.replace(/[^\w\s]/g, '').trim()
  }

  private static determineStatus(name: string, value: number, unit: string): 'normal' | 'high' | 'low' | 'abnormal' {
    const normalizedName = name.toLowerCase().replace(/\s+/g, '')
    const range = this.NORMAL_RANGES[normalizedName]
    
    if (!range) {
      return 'normal' // Unknown parameters are assumed normal
    }
    
    if (value < range.min) {
      return 'low'
    } else if (value > range.max) {
      return 'high'
    } else {
      return 'normal'
    }
  }

  private static getNormalRange(name: string): string | undefined {
    const normalizedName = name.toLowerCase().replace(/\s+/g, '')
    const range = this.NORMAL_RANGES[normalizedName]
    
    if (range) {
      return `${range.min}-${range.max} ${range.unit}`
    }
    
    return undefined
  }

  private static generateSummary(parameters: HealthParameter[], testName: string): string {
    const flaggedCount = parameters.filter(p => p.status !== 'normal').length
    const totalCount = parameters.length
    
    if (flaggedCount === 0) {
      return `Your ${testName} results show all parameters within normal ranges. No immediate concerns were identified.`
    } else if (flaggedCount === 1) {
      const flagged = parameters.find(p => p.status !== 'normal')
      return `Your ${testName} results show one parameter outside normal range: ${flagged?.name} (${flagged?.value} ${flagged?.unit}). This may require follow-up with your healthcare provider.`
    } else {
      return `Your ${testName} results show ${flaggedCount} out of ${totalCount} parameters outside normal ranges. Please consult with your healthcare provider for a comprehensive review.`
    }
  }

  private static generateRecommendations(parameters: HealthParameter[]): string[] {
    const recommendations: string[] = []
    const flaggedParams = parameters.filter(p => p.status !== 'normal')
    
    if (flaggedParams.length === 0) {
      recommendations.push('Continue with your current health routine')
      recommendations.push('Schedule regular follow-up appointments as recommended by your healthcare provider')
    } else {
      recommendations.push('Schedule a follow-up appointment with your healthcare provider to discuss these results')
      
      const highParams = flaggedParams.filter(p => p.status === 'high')
      const lowParams = flaggedParams.filter(p => p.status === 'low')
      
      if (highParams.length > 0) {
        recommendations.push('Consider lifestyle modifications to address elevated values')
      }
      
      if (lowParams.length > 0) {
        recommendations.push('Discuss potential causes and treatment options for low values')
      }
    }
    
    return recommendations
  }
}
