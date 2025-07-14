import { describe, it, expect, beforeEach } from 'vitest'
import { historyDB } from '../utils/indexedDB'

describe('IndexedDB History', () => {
  beforeEach(async () => {
    // Clear all records before each test
    await historyDB.clearAllRecords()
  })

  it('should save and retrieve history records', async () => {
    // Add a test record
    const testRecord = {
      inputContent: 'example.com\ntest.com',
      outputContent: '127.0.0.1 example.com\n127.0.0.1 test.com',
      timestamp: Date.now(),
      successCount: 2,
      totalCount: 2,
      provider: 'Cloudflare'
    }

    const recordId = await historyDB.addRecord(testRecord)
    expect(recordId).toBeDefined()

    // Retrieve records
    const records = await historyDB.getRecords(0, 10)
    expect(records).toHaveLength(1)
    expect(records[0]).toMatchObject(testRecord)
    expect(records[0].id).toBe(recordId)
  })

  it('should handle multiple records with pagination', async () => {
    // Add multiple records
    const records = []
    for (let i = 0; i < 25; i++) {
      records.push({
        inputContent: `domain${i}.com`,
        outputContent: `127.0.0.1 domain${i}.com`,
        timestamp: Date.now() + i,
        successCount: 1,
        totalCount: 1,
        provider: 'Cloudflare'
      })
    }

    // Add all records
    for (const record of records) {
      await historyDB.addRecord(record)
    }

    // Test pagination
    const page1 = await historyDB.getRecords(0, 20)
    expect(page1).toHaveLength(20)

    const page2 = await historyDB.getRecords(1, 20)
    expect(page2).toHaveLength(5)

    // Records should be sorted by timestamp in descending order
    expect(page1[0].timestamp).toBeGreaterThan(page1[1].timestamp)
  })

  it('should delete records', async () => {
    const testRecord = {
      inputContent: 'example.com',
      outputContent: '127.0.0.1 example.com',
      timestamp: Date.now(),
      successCount: 1,
      totalCount: 1,
      provider: 'Cloudflare'
    }

    const recordId = await historyDB.addRecord(testRecord)
    
    // Verify record exists
    let records = await historyDB.getRecords(0, 10)
    expect(records).toHaveLength(1)

    // Delete record
    await historyDB.deleteRecord(recordId)

    // Verify record is deleted
    records = await historyDB.getRecords(0, 10)
    expect(records).toHaveLength(0)
  })

  it('should clear all records', async () => {
    // Add multiple records
    for (let i = 0; i < 5; i++) {
      await historyDB.addRecord({
        inputContent: `domain${i}.com`,
        outputContent: `127.0.0.1 domain${i}.com`,
        timestamp: Date.now() + i,
        successCount: 1,
        totalCount: 1,
        provider: 'Cloudflare'
      })
    }

    // Verify records exist
    let records = await historyDB.getRecords(0, 10)
    expect(records).toHaveLength(5)

    // Clear all records
    await historyDB.clearAllRecords()

    // Verify all records are deleted
    records = await historyDB.getRecords(0, 10)
    expect(records).toHaveLength(0)
  })

  it('should get record count', async () => {
    expect(await historyDB.getRecordCount()).toBe(0)

    // Add records
    for (let i = 0; i < 3; i++) {
      await historyDB.addRecord({
        inputContent: `domain${i}.com`,
        outputContent: `127.0.0.1 domain${i}.com`,
        timestamp: Date.now() + i,
        successCount: 1,
        totalCount: 1,
        provider: 'Cloudflare'
      })
    }

    expect(await historyDB.getRecordCount()).toBe(3)
  })
})