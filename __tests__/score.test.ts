import { describe, it, expect } from 'vitest'
import { computeRoleMatchScore, salaryRange, getRelatedRoles, type RoleMatch } from '../lib/pipeline/score'

const mockRole = (id: string, salary: number, score: number): RoleMatch => ({
  id,
  occupation_title: `Role ${id}`,
  occupation_code: null,
  median_salary: salary,
  growth_rate: 10,
  ai_exposure_score: 3,
  match_score: score,
  salary_min: Math.round(salary * 0.85),
  salary_max: Math.round(salary * 1.15),
})

describe('computeRoleMatchScore', () => {
  it('returns 0 when no required skills', () => {
    expect(computeRoleMatchScore(['JavaScript'], [])).toBe(0)
  })

  it('returns 10.0 when all required skills matched', () => {
    const required = [
      { skill_name: 'JavaScript', importance_score: 'high' },
      { skill_name: 'React', importance_score: 'medium' },
    ]
    expect(computeRoleMatchScore(['JavaScript', 'React'], required)).toBe(10)
  })

  it('returns 0 when no user skills match', () => {
    const required = [{ skill_name: 'COBOL', importance_score: 'high' }]
    expect(computeRoleMatchScore(['JavaScript', 'Python'], required)).toBe(0)
  })

  it('weights high importance skills more than low', () => {
    const required = [
      { skill_name: 'Rust', importance_score: 'high' },
      { skill_name: 'Markdown', importance_score: 'low' },
    ]
    const highOnly = computeRoleMatchScore(['Rust'], required)
    const lowOnly = computeRoleMatchScore(['Markdown'], required)
    expect(highOnly).toBeGreaterThan(lowOnly)
  })

  it('is case-insensitive', () => {
    const required = [{ skill_name: 'python', importance_score: 'high' }]
    expect(computeRoleMatchScore(['Python'], required)).toBe(10)
  })

  it('matches partial skill names', () => {
    const required = [{ skill_name: 'machine learning', importance_score: 'medium' }]
    expect(computeRoleMatchScore(['machine learning'], required)).toBe(10)
  })

  it('returns score in 0-10 range', () => {
    const required = [
      { skill_name: 'Go', importance_score: 'high' },
      { skill_name: 'Kubernetes', importance_score: 'medium' },
      { skill_name: 'Docker', importance_score: 'low' },
    ]
    const score = computeRoleMatchScore(['Go', 'Docker'], required)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(10)
  })
})

describe('salaryRange', () => {
  it('returns 85%-115% band', () => {
    const { min, max } = salaryRange(100000)
    expect(min).toBe(85000)
    expect(max).toBe(115000)
  })
})

describe('getRelatedRoles', () => {
  it('excludes the current role', () => {
    const current = mockRole('a', 100000, 8)
    const all = [current, mockRole('b', 105000, 7), mockRole('c', 200000, 6)]
    const related = getRelatedRoles(current, all)
    expect(related).not.toContain('Role a')
  })

  it('only includes roles within $30k salary band', () => {
    const current = mockRole('a', 100000, 8)
    const all = [current, mockRole('b', 110000, 7), mockRole('c', 200000, 9)]
    const related = getRelatedRoles(current, all)
    expect(related).toContain('Role b')
    expect(related).not.toContain('Role c')
  })

  it('returns at most 3 roles', () => {
    const current = mockRole('a', 100000, 8)
    const others = ['b','c','d','e'].map(id => mockRole(id, 100000 + Math.random() * 20000, 5))
    const related = getRelatedRoles(current, [current, ...others])
    expect(related.length).toBeLessThanOrEqual(3)
  })
})