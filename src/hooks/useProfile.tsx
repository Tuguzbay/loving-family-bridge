
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useProfileData } from './useProfileData';
import { useFamilyOperations } from './useFamilyOperations';
import { useFamilySetup } from './useFamilySetup';

export const useProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  const { profile, setProfile, fetchProfile } = useProfileData();
  const { 
    family, 
    familyMembers, 
    conversationCompletion,
    setFamily,
    setFamilyMembers,
    setConversationCompletion,
    fetchFamilyData, 
    createFamily, 
    joinFamily 
  } = useFamilyOperations();
  
  const { handleFamilyOperations } = useFamilySetup({ 
    profile, 
    fetchFamilyData, 
    joinFamily 
  });

  useEffect(() => {
    if (user) {
      console.log('User logged in, starting profile fetch for:', user.id);
      console.log('User metadata:', user.user_metadata);
      fetchProfile();
    } else {
      console.log('No user, resetting state');
      setProfile(null);
      setFamily(null);
      setFamilyMembers([]);
      setConversationCompletion(null);
      setLoading(false);
    }
  }, [user]);

  // Handle family operations after profile is loaded
  useEffect(() => {
    if (user && profile) {
      console.log('Profile loaded, starting family operations for:', profile.user_type);
      handleFamilyOperations().finally(() => setLoading(false));
    }
  }, [user, profile]);

  return {
    profile,
    family,
    familyMembers,
    conversationCompletion,
    loading,
    createFamily,
    joinFamily,
    refetch: fetchFamilyData
  };
};
