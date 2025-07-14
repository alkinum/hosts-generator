import { describe, it, expect } from 'vitest'
import { validatePresets } from '../utils/presets'

describe('Presets with String Arrays', () => {
  it('should validate presets with string array values', () => {
    const testPresets = [
      {
        title: 'Microsoft Services',
        value: ['microsoft.com', 'office.com', 'xbox.com']
      },
      {
        title: 'GitHub Services',
        value: ['github.com', 'github.io', 'api.github.com']
      }
    ]

    const result = validatePresets(testPresets)
    expect(result).toEqual(testPresets)
  })

  it('should validate presets with mixed string and string array values', () => {
    const testPresets = [
      {
        title: 'String Format',
        value: 'microsoft.com\noffice.com\nxbox.com'
      },
      {
        title: 'Array Format',
        value: ['github.com', 'github.io', 'api.github.com']
      }
    ]

    const result = validatePresets(testPresets)
    expect(result).toEqual(testPresets)
  })

  it('should validate nested presets with string arrays', () => {
    const testPresets = [
      {
        title: 'Microsoft Services',
        children: [
          {
            title: 'Office 365',
            value: ['office.com', 'outlook.com', 'hotmail.com']
          },
          {
            title: 'Xbox',
            value: ['xbox.com', 'xboxlive.com']
          }
        ]
      }
    ]

    const result = validatePresets(testPresets)
    expect(result).toEqual(testPresets)
  })

  it('should handle empty arrays', () => {
    const testPresets = [
      {
        title: 'Empty Array',
        value: []
      }
    ]

    const result = validatePresets(testPresets)
    expect(result).toEqual(testPresets)
  })

  it('should reject invalid preset format', () => {
    const invalidPresets = [
      {
        title: 'Invalid',
        value: 123 // Invalid type
      }
    ]

    expect(() => validatePresets(invalidPresets)).toThrow('Invalid preset format')
  })
})