import { createClient } from '@supabase/supabase-js';
import { Student, CommentItem } from '../types';
import { generatePublicShareSlug } from '../utils/slugUtils';
import { UserVotesMap } from '../utils/votingSystem';

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

// Data Normalization Helpers
export function normalizeStudentRow(row: any): Student {
  const fullName = row.fullName || row.full_name || '';
  const id = String(row.id || row.examNumber || row.exam_number || '');
  const slug = row.publicShareSlug || row.public_share_slug || generatePublicShareSlug(fullName, id);

  return {
    id,
    fullName,
    examNumber: row.examNumber || row.exam_number || id,
    publicShareSlug: slug,
    photoFilename: row.photoFilename || row.photo_filename || '',
    birthDate: row.birthDate || row.birth_date || '',
    votes: typeof row.votes === 'object' && row.votes !== null ? row.votes : {},
    quote: row.quote || "Excellence is not a destination, it's a way of life. GSS Kubwa Class of 2026!",
    hobbies: row.hobbies || '',
    careerPath: row.careerPath || row.career_path || '',
    email: row.email || '',
    phone: row.phone || '',
    featuredOnHome: Boolean(row.featuredOnHome ?? row.featured_on_home),
    pendingProfileUpdate: row.pendingProfileUpdate || row.pending_profile_update || undefined
  };
}

export function normalizeCommentRow(row: any): CommentItem {
  return {
    id: String(row.id || ''),
    studentId: String(row.studentId || row.student_id || ''),
    authorId: String(row.authorId || row.author_id || ''),
    authorName: row.authorName || row.author_name || row.author || 'Anonymous',
    authorRole: row.authorRole || row.author_role || 'student',
    text: row.text || '',
    createdAt: row.createdAt || row.created_at ? new Date(row.createdAt || row.created_at).toLocaleDateString() : 'Recently',
    status: row.status || 'approved'
  };
}

// -------------------------------------------------------------
// Core Database Queries (Supabase Backend)
// -------------------------------------------------------------

export async function fetchStudentsFromSupabase(): Promise<Student[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*');

    if (error) {
      console.warn('Supabase fetch students notice:', error.message);
      return null;
    }

    if (data && data.length > 0) {
      const studentList = data.map(normalizeStudentRow);
      // Sort alphabetically by full name
      studentList.sort((a, b) => a.fullName.localeCompare(b.fullName));
      return studentList;
    }
    return [];
  } catch (err) {
    console.warn('Supabase fetch students failed:', err);
    return null;
  }
}

export function subscribeToStudentsFromSupabase(onUpdate: () => void) {
  if (!supabase) return () => {};
  try {
    const channel = supabase
      .channel('public:students')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'students' },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Supabase realtime students subscription notice:', err);
    return () => {};
  }
}

export async function fetchCommentsFromSupabase(): Promise<CommentItem[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // Try fallback column name createdAt
      const { data: dataAlt, error: errorAlt } = await supabase
        .from('comments')
        .select('*');
      if (errorAlt) {
        console.warn('Supabase fetch comments notice:', errorAlt.message);
        return null;
      }
      return (dataAlt || []).map(normalizeCommentRow);
    }

    return (data || []).map(normalizeCommentRow);
  } catch (err) {
    console.warn('Supabase fetch comments failed:', err);
    return null;
  }
}

export function subscribeToCommentsFromSupabase(onUpdate: () => void) {
  if (!supabase) return () => {};
  try {
    const channel = supabase
      .channel('public:comments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments' },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Supabase realtime comments subscription notice:', err);
    return () => {};
  }
}

export async function fetchUserVotesFromSupabase(userId: string): Promise<UserVotesMap | null> {
  if (!supabase || !userId) return null;
  try {
    const { data, error } = await supabase
      .from('user_votes')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      if (error.code === 'PGRST301' || error.message?.includes('schema cache')) {
        console.warn('Supabase notice: Table "public.user_votes" does not exist in database schema yet. Please run supabase_schema.sql in Supabase SQL Editor.');
      } else {
        console.warn('Supabase fetch user_votes notice:', error.message);
      }
      return null;
    }

    if (data && data.length > 0) {
      const map: UserVotesMap = {};
      data.forEach((row: any) => {
        const catId = row.category_id || row.categoryId;
        if (catId) {
          map[catId] = {
            studentId: row.student_id || row.studentId,
            studentName: row.student_name || row.studentName || 'Graduate',
            timestamp: row.timestamp ? new Date(row.timestamp).getTime() : Date.now()
          };
        }
      });
      return map;
    }
    return {};
  } catch (err) {
    console.warn('Supabase fetch user_votes failed:', err);
    return null;
  }
}

export async function recordVoteInSupabase(
  userId: string,
  studentId: string,
  categoryId: string,
  studentName: string
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const id = `${userId}_${categoryId}`;
    const timestamp = new Date().toISOString();
    
    const payload = {
      id,
      user_id: userId,
      student_id: studentId,
      category_id: categoryId,
      student_name: studentName,
      timestamp
    };

    const { error } = await supabase
      .from('user_votes')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase record vote notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase record vote failed:', err);
    return false;
  }
}

export async function revokeVoteInSupabase(userId: string, categoryId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const id = `${userId}_${categoryId}`;
    const { error } = await supabase
      .from('user_votes')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('Supabase revoke vote notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase revoke vote failed:', err);
    return false;
  }
}

export async function updateStudentVotesInSupabase(
  studentId: string,
  categoryId: string,
  delta: number
): Promise<boolean> {
  if (!supabase) return false;
  try {
    // Try atomic RPC function first to avoid race conditions under concurrent votes
    const { error: rpcError } = await supabase.rpc('vote_for_student', {
      p_student_id: studentId,
      p_category_id: categoryId,
      p_delta: delta
    });

    if (!rpcError) {
      return true;
    }

    // Fallback if RPC function is not installed in database
    const { data, error } = await supabase
      .from('students')
      .select('votes')
      .or(`id.eq.${studentId},exam_number.eq.${studentId}`)
      .single();

    if (error || !data) {
      console.warn('Supabase fetch student votes notice:', error?.message);
      return false;
    }

    const votes = typeof data.votes === 'object' && data.votes !== null ? { ...data.votes } : {};
    const currentCount = Number(votes[categoryId] || 0);
    votes[categoryId] = Math.max(0, currentCount + delta);

    const { error: updateError } = await supabase
      .from('students')
      .update({ votes })
      .or(`id.eq.${studentId},exam_number.eq.${studentId}`);

    if (updateError) {
      console.warn('Supabase update student votes error:', updateError.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase update student votes failed:', err);
    return false;
  }
}

export async function addCommentToSupabase(comment: {
  studentId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  text: string;
  status: string;
}): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      student_id: comment.studentId,
      author_id: comment.authorId,
      author_name: comment.authorName,
      author_role: comment.authorRole,
      text: comment.text,
      status: comment.status,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('comments')
      .insert(payload);

    if (error) {
      console.warn('Supabase add comment notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase add comment failed:', err);
    return false;
  }
}

export async function approveCommentInSupabase(commentId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('comments')
      .update({ status: 'approved' })
      .eq('id', commentId);

    if (error) {
      console.warn('Supabase approve comment notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase approve comment failed:', err);
    return false;
  }
}

export async function deleteCommentFromSupabase(commentId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.warn('Supabase delete comment notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase delete comment failed:', err);
    return false;
  }
}

export async function updateStudentInSupabase(id: string, updatedData: Partial<Student>): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload: Record<string, any> = {};
    
    if (updatedData.fullName !== undefined) payload.full_name = updatedData.fullName;
    if (updatedData.photoFilename !== undefined) payload.photo_filename = updatedData.photoFilename;
    if (updatedData.birthDate !== undefined) payload.birth_date = updatedData.birthDate;
    if (updatedData.quote !== undefined) payload.quote = updatedData.quote;
    if (updatedData.hobbies !== undefined) payload.hobbies = updatedData.hobbies;
    if (updatedData.careerPath !== undefined) payload.career_path = updatedData.careerPath;
    if (updatedData.email !== undefined) payload.email = updatedData.email;
    if (updatedData.phone !== undefined) payload.phone = updatedData.phone;
    if (updatedData.votes !== undefined) payload.votes = updatedData.votes;
    if (updatedData.featuredOnHome !== undefined) payload.featured_on_home = updatedData.featuredOnHome;
    if ('pendingProfileUpdate' in updatedData) {
      payload.pending_profile_update = updatedData.pendingProfileUpdate || null;
    }

    let { error } = await supabase
      .from('students')
      .update(payload)
      .eq('id', id);

    if (error) {
      const { error: err2 } = await supabase
        .from('students')
        .update(payload)
        .eq('exam_number', id);
      if (err2) {
        console.warn('Supabase update student notice:', err2.message);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.warn('Supabase update student failed:', err);
    return false;
  }
}

export async function addStudentToSupabase(student: Student): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: student.id,
      full_name: student.fullName,
      exam_number: student.examNumber,
      public_share_slug: student.publicShareSlug || generatePublicShareSlug(student.fullName, student.id),
      photo_filename: student.photoFilename,
      birth_date: student.birthDate,
      votes: student.votes || {},
      quote: student.quote || '',
      hobbies: student.hobbies || '',
      career_path: student.careerPath || '',
      email: student.email || '',
      phone: student.phone || '',
      featured_on_home: Boolean(student.featuredOnHome),
      pending_profile_update: student.pendingProfileUpdate || null,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('students')
      .insert(payload);

    if (error) {
      console.warn('Supabase add student notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase add student failed:', err);
    return false;
  }
}

export async function deleteStudentFromSupabase(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('students')
      .delete()
      .or(`id.eq.${id},exam_number.eq.${id}`);

    if (error) {
      console.warn('Supabase delete student notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase delete student failed:', err);
    return false;
  }
}

export async function seedStudentsToSupabase(students: Student[]): Promise<number> {
  if (!supabase || !students.length) return 0;
  try {
    const records = students.map(s => ({
      id: s.id,
      full_name: s.fullName,
      exam_number: s.examNumber,
      public_share_slug: s.publicShareSlug || generatePublicShareSlug(s.fullName, s.id),
      photo_filename: s.photoFilename,
      birth_date: s.birthDate,
      votes: s.votes || {},
      quote: s.quote || "Excellence is not a destination, it's a way of life.",
      hobbies: s.hobbies || '',
      career_path: s.careerPath || '',
      email: s.email || '',
      phone: s.phone || '',
      featured_on_home: Boolean(s.featuredOnHome),
      created_at: new Date().toISOString()
    }));

    // Chunk in batches of 100
    const chunkSize = 100;
    let seeded = 0;
    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize);
      const { error } = await supabase
        .from('students')
        .upsert(chunk, { onConflict: 'id' });

      if (error) {
        if (error.message?.includes('row-level security policy') || error.code === '42501') {
          console.warn('Supabase RLS notice: Student seeding skipped. Please run supabase_schema.sql in your Supabase SQL Editor to enable public INSERT/UPDATE RLS policies.');
          break;
        } else {
          console.warn(`Supabase seed chunk error at ${i}:`, error.message);
        }
      } else {
        seeded += chunk.length;
      }
    }
    if (seeded > 0) {
      console.log(`✅ Successfully seeded ${seeded} students to Supabase database!`);
    }
    return seeded;
  } catch (err) {
    console.warn('Supabase seed students failed:', err);
    return 0;
  }
}

