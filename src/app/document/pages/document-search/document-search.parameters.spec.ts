import { documentSearchCriteriasSchema } from './document-search.parameters'

describe('documentSearchCriteriasSchema', () => {
  it('should parse a valid object with known fields', () => {
    const input = {
      name: 'Invoice',
      id: '42',
      channelName: 'email',
      pageNumber: 1,
      pageSize: 20
    }
    const result = documentSearchCriteriasSchema.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Invoice')
      expect(result.data.pageNumber).toBe(1)
    }
  })

  it('should parse successfully when object is empty (all fields optional)', () => {
    const result = documentSearchCriteriasSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('should strip unknown keys when using strict mode', () => {
    const result = documentSearchCriteriasSchema.safeParse({
      name: 'Doc',
      unknownField: 'should-be-stripped'
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect((result.data as any).unknownField).toBeUndefined()
    }
  })

  it('should fail when pageNumber is a string instead of number', () => {
    const result = documentSearchCriteriasSchema.safeParse({
      pageNumber: 'not-a-number'
    })
    expect(result.success).toBe(false)
  })

  it('should fail when pageSize is a string instead of number', () => {
    const result = documentSearchCriteriasSchema.safeParse({
      pageSize: 'twenty'
    })
    expect(result.success).toBe(false)
  })

  it('should preprocess lifeCycleState from string to array', () => {
    const result = documentSearchCriteriasSchema.safeParse({
      lifeCycleState: 'DRAFT'
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.lifeCycleState).toEqual(['DRAFT'])
    }
  })

  it('should parse lifeCycleState as an array of strings', () => {
    const result = documentSearchCriteriasSchema.safeParse({
      lifeCycleState: ['DRAFT', 'REVIEW']
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.lifeCycleState).toEqual(['DRAFT', 'REVIEW'])
    }
  })

  it('should preprocess documentTypeId from string to array', () => {
    const result = documentSearchCriteriasSchema.safeParse({
      documentTypeId: 'type-1'
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.documentTypeId).toEqual(['type-1'])
    }
  })

  it('should parse documentTypeId as an array of strings', () => {
    const result = documentSearchCriteriasSchema.safeParse({
      documentTypeId: ['type-1', 'type-2']
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.documentTypeId).toEqual(['type-1', 'type-2'])
    }
  })
})
