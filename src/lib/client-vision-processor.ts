// Client-side wrapper for vision processing
// This dynamically loads the vision processor only in browser environment

import { SimplePDFProcessor, ExtractedHealthData } from './simple-pdf-processor'

export class ClientVisionProcessor {
  private static visionProcessor: any = null

  static async initializeVisionProcessor() {
    if (typeof window === 'undefined') {
      return null
    }

    if (!this.visionProcessor) {
      try {
        const { VisionPDFProcessor } = await import('./vision-pdf-processor')
        this.visionProcessor = VisionPDFProcessor
      } catch (error) {
        console.warn('Vision processor not available, falling back to simple processor')
        return null
      }
    }

    return this.visionProcessor
  }

  static async extractTextFromFile(file: File, useOCR: boolean = false): Promise<string> {
    // Try to use vision processor if available
    const visionProcessor = await this.initializeVisionProcessor()
    
    if (visionProcessor) {
      try {
        return await visionProcessor.extractTextFromFile(file, useOCR)
      } catch (error) {
        console.warn('Vision processing failed, falling back to simple processor:', error)
      }
    }

    // Fallback to simple processor
    try {
      return await SimplePDFProcessor.extractTextFromFile(file)
    } catch (error) {
      console.warn('Simple processor failed, using fallback text:', error)
      // Ultimate fallback
      return `Health Document: ${file.name}\nType: ${file.type}\nSize: ${file.size} bytes\n\nThis document has been uploaded and is ready for processing.`
    }
  }

  static async detectHandwriting(file: File): Promise<boolean> {
    // Try to use vision processor if available
    const visionProcessor = await this.initializeVisionProcessor()
    
    if (visionProcessor) {
      try {
        return await visionProcessor.detectHandwriting(file)
      } catch (error) {
        console.warn('Handwriting detection failed, assuming typed:', error)
      }
    }

    // Fallback - assume typed for simple processor
    // For images, assume they might be handwritten
    if (file.type.startsWith('image/')) {
      return true
    }
    
    return false
  }

  static parseHealthData(documentText: string, documentType: string): ExtractedHealthData {
    // Use simple processor for parsing (same logic)
    return SimplePDFProcessor.parseHealthData(documentText, documentType)
  }
}
