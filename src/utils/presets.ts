import { z } from 'zod';
import { PresetItem } from '../types';

// Define the schema for preset validation
const PresetItemSchema: z.ZodType<PresetItem> = z.lazy(() =>
  z.object({
    title: z.string().min(1, 'Title is required'),
    value: z.union([z.string(), z.array(z.string())]).optional(), // Support both string and string array
    children: z.array(PresetItemSchema).optional(), // Remove max(1) to allow multiple children
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