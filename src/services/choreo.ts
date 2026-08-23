import { supabase, isSupabaseConfigured } from './supabase';
import type { EventItem } from './events';

export interface ChoreoProfileData {
  stageName: string;
  bio: string;
  yearsExperience: number;
  signatureStyles: string[];
  instagramHandle: string;
  videoReelUrl: string;
  credentials: string;
}

export interface ChoreoKPIs {
  upcomingClassesCount: number;
  totalStudentsEnrolled: number;
  estimatedEarnings: number;
  averageFillRate: number; // percentage 0-100
  nextClass: EventItem | null;
}

export const DANCE_STYLE_OPTIONS = [
  'Hip Hop',
  'Urban Choreo',
  'Heels',
  'Contemporary',
  'Afrobeats',
  'Bolly-Hop',
  'Waacking',
  'House Dance',
  'Jazz Funk',
  'Locking',
  'Krump',
  'Commercial Choreo',
];

export const SKILL_LEVELS = [
  'All Levels (Open)',
  'Beginner Friendly',
  'Intermediate',
  'Advanced Masterclass',
];

const CHOREO_STORAGE_KEY_PREFIX = 'dancehut.choreo_profile.';

export async function getChoreoProfile(userId: string): Promise<ChoreoProfileData> {
  const defaultProfile: ChoreoProfileData = {
    stageName: '',
    bio: 'Passionate dancer & choreographer creating high-energy masterclasses and choreography routines in Bengaluru.',
    yearsExperience: 5,
    signatureStyles: ['Hip Hop', 'Urban Choreo', 'Heels'],
    instagramHandle: '@ananya_roy_dance',
    videoReelUrl: 'https://youtube.com/shorts/demo-dance-reel',
    credentials: 'Ex-Crew Captain & Dance Educator • Taught 50+ Masterclasses',
  };

  try {
    const cached = localStorage.getItem(`${CHOREO_STORAGE_KEY_PREFIX}${userId}`);
    if (cached) {
      return { ...defaultProfile, ...JSON.parse(cached) };
    }
  } catch {
    // Ignore localStorage read errors
  }

  if (!isSupabaseConfigured) {
    return defaultProfile;
  }

  try {
    const { data } = await supabase
      .from('profiles')
      .select('display_name, bio')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      return {
        ...defaultProfile,
        stageName: data.display_name || defaultProfile.stageName,
        bio: data.bio || defaultProfile.bio,
      };
    }
  } catch {
    // Fallback to default
  }

  return defaultProfile;
}

export async function saveChoreoProfile(
  userId: string,
  profile: ChoreoProfileData
): Promise<{ success: boolean; error: Error | null }> {
  try {
    localStorage.setItem(
      `${CHOREO_STORAGE_KEY_PREFIX}${userId}`,
      JSON.stringify(profile)
    );
  } catch (err) {
    console.error('Failed to save choreo profile in localStorage', err);
  }

  if (!isSupabaseConfigured) {
    return { success: true, error: null };
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: profile.stageName.trim() || undefined,
        bio: profile.bio.trim() || undefined,
      })
      .eq('id', userId);

    if (error) {
      return { success: false, error: new Error(error.message) };
    }
  } catch (err) {
    return { success: false, error: err as Error };
  }

  return { success: true, error: null };
}

export function computeChoreoKPIs(events: EventItem[], choreoName?: string): ChoreoKPIs {
  const normalizedName = (choreoName || '').trim().toLowerCase();
  
  // Filter events where host matches the choreo name or if none match, consider all active events
  let choreoEvents = events;
  if (normalizedName && normalizedName !== 'dancer' && normalizedName !== 'choreographer') {
    const matched = events.filter((e) => e.host.toLowerCase().includes(normalizedName));
    if (matched.length > 0) {
      choreoEvents = matched;
    }
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const upcomingEvents = choreoEvents.filter((e) => e.dateKey >= todayStr);

  let totalCapacity = 0;
  let totalSpotsRemaining = 0;
  let estimatedEarnings = 0;

  choreoEvents.forEach((ev) => {
    const spotsLeft = ev.spots;
    const estimatedCapacity = Math.max(25, spotsLeft + 5);
    const booked = Math.max(0, estimatedCapacity - spotsLeft);
    const priceNum = parseInt(ev.price.replace(/[^\d]/g, ''), 10) || 850;

    totalCapacity += estimatedCapacity;
    totalSpotsRemaining += spotsLeft;
    estimatedEarnings += booked * priceNum;
  });

  const totalStudentsEnrolled = Math.max(0, totalCapacity - totalSpotsRemaining);
  const averageFillRate =
    totalCapacity > 0
      ? Math.min(100, Math.round((totalStudentsEnrolled / totalCapacity) * 100))
      : 85;

  const nextClass = upcomingEvents.length > 0 ? upcomingEvents[0] : choreoEvents[0] || null;

  return {
    upcomingClassesCount: upcomingEvents.length > 0 ? upcomingEvents.length : choreoEvents.length,
    totalStudentsEnrolled,
    estimatedEarnings,
    averageFillRate,
    nextClass,
  };
}
