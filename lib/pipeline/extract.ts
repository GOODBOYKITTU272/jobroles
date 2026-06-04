import mammoth from 'mammoth'

export async function extractText(buffer: Buffer, fileType: 'pdf' | 'docx'): Promise<string> {
  if (fileType === 'pdf') {
    // pdf-parse is CJS with module.exports = fn; require() bypasses ESM interop wrapping
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>
    const data = await pdfParse(buffer)
    return data.text
  }
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

export function smartTruncate(text: string, maxTokens = 8000): string {
  const maxChars = maxTokens * 4
  if (text.length <= maxChars) return text

  const sectionPatterns = [/SKILLS?[\s:]/i, /EXPERIENCE[\s:]/i, /EDUCATION[\s:]/i, /CERTIFICATIONS?[\s:]/i, /PROJECTS?[\s:]/i]
  const lines = text.split('\n')
  let result = ''
  let inSection = false

  for (const line of lines) {
    if (sectionPatterns.some((p) => p.test(line))) inSection = true
    if (inSection) result += line + '\n'
    if (result.length >= maxChars) break
  }

  return result.length > maxChars * 0.4 ? result.slice(0, maxChars) : text.slice(0, maxChars)
}