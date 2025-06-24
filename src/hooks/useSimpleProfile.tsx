
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Profile } from '@/types/profile';

export const useSimpleProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    
    console.log('Fetching profile for user:', user.id);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
      return;
    }

    if (!data) {
      console.log('No profile found, creating one from user metadata');
      await createProfileFromMetadata();
      return;
    }

    console.log('Profile fetched successfully:', data);
    setProfile(data);
    setLoading(false);
  };

  const createProfileFromMetadata = async () => {
    if (!user) return;

    console.log('Creating profile from user metadata:', user.user_metadata);
    
    const profileData = {
      id: user.id,
      full_name: user.user_metadata?.full_name || user.email || 'User',
      user_type: (user.user_metadata?.user_type as 'parent' | 'child') || 'parent',
      age: user.user_metadata?.age ? parseInt(user.user_metadata.age) : null,
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      setLoading(false);
      return;
    }

    console.log('Profile created successfully:', data);
    setProfile(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading
  };
};
