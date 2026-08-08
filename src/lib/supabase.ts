import { createClient } from '@supabase/supabase-js';

let rawSupabaseUrl = (import.meta.env.VITE_SUPABASE_URL || 'https://ibzfibfgywrprnmvzptn.supabase.co').trim();
if (rawSupabaseUrl.endsWith('/rest/v1/')) {
  rawSupabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/$/, '');
} else if (rawSupabaseUrl.endsWith('/rest/v1')) {
  rawSupabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1$/, '');
}

const supabaseUrl = rawSupabaseUrl;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_RXUCwg8zG2--VaDAqMQOCg__s6NdHr2').trim();

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Uploads an image file to Supabase Storage bucket 'student-photos',
 * or falls back to returning a compressed WebP base64 Data URL string.
 * Both formats store permanently in the database record and will never be wiped out on code commits.
 */
export async function uploadStudentPhotoToStorage(file: File, fallbackWebpDataUrl: string): Promise<string> {
  if (!supabase) {
    console.warn('Supabase env credentials not provided yet. Storing image as compressed cloud Data URL string in database record.');
    return fallbackWebpDataUrl;
  }

  try {
    const fileExt = file.name.split('.').pop() || 'webp';
    const fileName = `student_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `student-photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('student-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.warn('Supabase storage upload error, falling back to compressed Data URL:', uploadError.message);
      return fallbackWebpDataUrl;
    }

    const { data } = supabase.storage
      .from('student-photos')
      .getPublicUrl(filePath);

    if (data?.publicUrl) {
      return data.publicUrl;
    }

    return fallbackWebpDataUrl;
  } catch (err) {
    console.warn('Failed to upload to Supabase storage, using Data URL fallback:', err);
    return fallbackWebpDataUrl;
  }
}
