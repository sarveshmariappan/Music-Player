import { supabase } from './supabase';

const MUSIC_BUCKET = 'songs';
const IMAGES_BUCKET = 'song-images';

export async function uploadSong(file, filename) {
  try {
    const { data, error } = await supabase.storage
      .from(MUSIC_BUCKET)
      .upload(`public/${filename}`, file, { upsert: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

export async function uploadSongImage(file, filename) {
  try {
    const { data, error } = await supabase.storage
      .from(IMAGES_BUCKET)
      .upload(`public/${filename}`, file, { upsert: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

export function getSongUrl(path) {
  const { data } = supabase.storage
    .from(MUSIC_BUCKET)
    .getPublicUrl(path);
  return data?.publicUrl || '';
}

export function getImageUrl(path) {
  const { data } = supabase.storage
    .from(IMAGES_BUCKET)
    .getPublicUrl(path);
  return data?.publicUrl || '';
}

export async function deleteSong(path) {
  try {
    const { error } = await supabase.storage
      .from(MUSIC_BUCKET)
      .remove([path]);

    if (error) throw error;
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
}

export async function deleteSongImage(path) {
  try {
    const { error } = await supabase.storage
      .from(IMAGES_BUCKET)
      .remove([path]);

    if (error) throw error;
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
}
