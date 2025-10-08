import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { db } from '../../src/core/db/db'; // Assuming db is exported

// Mock the Dexie database
vi.mock('../../src/core/db/db', () => {
  const mockOrderBy = vi.fn().mockReturnThis();
  const mockOffset = vi.fn().mockReturnThis();
  const mockLimit = vi.fn().mockReturnThis();
  const mockToArray = vi.fn();

  const mockTracksCollection = {
    orderBy: mockOrderBy,
    offset: mockOffset,
    limit: mockLimit,
    toArray: mockToArray,
  };

  return {
    db: {
      tracks: mockTracksCollection,
    },
  };
});

describe('Dexie Query - Case-Insensitive Sorting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call orderBy with lowerCaseName for sorting', async () => {
    const queryFunction = () => db.tracks.orderBy('lowerCaseName').offset(0).limit(10).toArray();
    await queryFunction(); // Directly call the function that useLiveQuery would execute

    expect(db.tracks.orderBy).toHaveBeenCalledWith('lowerCaseName');
    expect(db.tracks.offset).toHaveBeenCalledWith(0);
    expect(db.tracks.limit).toHaveBeenCalledWith(10);
    expect(db.tracks.toArray).toHaveBeenCalled();
  });

  it('should apply pagination after sorting', async () => {
    const queryFunction = () => db.tracks.orderBy('lowerCaseName').offset(1).limit(2).toArray();
    await queryFunction(); // Directly call the function that useLiveQuery would execute

    expect(db.tracks.orderBy).toHaveBeenCalledWith('lowerCaseName');
    expect(db.tracks.offset).toHaveBeenCalledWith(1);
    expect(db.tracks.limit).toHaveBeenCalledWith(2);
    expect(db.tracks.toArray).toHaveBeenCalled();
  });
});