import { z } from 'zod';
import { PresetItem } from '../types';

// Define the schema for preset validation
const PresetItemSchema: z.ZodType<PresetItem> = z.lazy(() =>
  z.object({
    title: z.string().min(1, 'Title is required'),
    value: z.string().optional(),
    children: z.array(PresetItemSchema).max(1).optional(), // Only one level of nesting allowed
  })
);

export const PresetListSchema = z.array(PresetItemSchema);

export const validatePresets = (data: unknown): PresetItem[] => {
  try {
    return PresetListSchema.parse(data);
  } catch (error) {
    throw new Error('Invalid preset format');
  }
};

export const fetchPresets = async (url: string): Promise<PresetItem[]> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return validatePresets(data);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch presets');
  }
};