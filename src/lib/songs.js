import { supabase } from './supabase';

export async function createSong(songData) {
  try {
    const { data, error } = await supabase
      .from('songs')
      .insert([songData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

export async function getAllSongs() {
  try {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

export async function getUserSongs(userId) {
  try {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

export async function updateSong(id, songData) {
  try {
    const { data, error } = await supabase
      .from('songs')
      .update(songData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

export async function deleteSong(id) {
  try {
    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
}
