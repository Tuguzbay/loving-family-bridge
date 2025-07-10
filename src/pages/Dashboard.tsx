import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, LogOut, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSimpleProfile } from "@/hooks/useSimpleProfile";
import { useFamily } from "@/contexts/FamilyContext";
import { useToast } from "@/hooks/use-toast";
import { ParentChildConversation } from "@/components/ParentChildConversation";
import { InsightViewer } from "@/components/InsightViewer";
import { useParentChildAssessment } from "@/hooks/useParentChildAssessment";
import { supabase } from "@/integrations/supabase/client";
import { FamilySetupCard } from "@/components/dashboard/FamilySetupCard";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ConversationsCard } from "@/components/dashboard/ConversationsCard";
import { FamilyMembersCard } from "@/components/dashboard/FamilyMembersCard";
import { ParentChildAssessmentsCard } from "@/components/dashboard/ParentChildAssessmentsCard";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";
import type { Profile } from "@/types/profile";
import { motion, useReducedMotion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } }
};

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading } = useSimpleProfile();
  const { 
    family, 
    familyMembers, 
    conversationCompletion, 
    loading: familyLoading, 
    createFamily, 
    joinFamily,
    refreshFamilyData
  } = useFamily();
  const navigate = useNavigate();
  const { toast } = useToast();
  const assessmentHook = useParentChildAssessment();
  const { getAssessment, refreshAndLinkChildResponses } = assessmentHook;
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedChild, setSelectedChild] = useState<Profile | null>(null);
  const [selectedInsightChild, setSelectedInsightChild] = useState<Profile | null>(null);
  const [childAssessments, setChildAssessments] = useState<Record<string, boolean>>({});
  const [childCompletions, setChildCompletions] = useState<Record<string, boolean>>({});

  const loading = profileLoading || familyLoading;

  useEffect(() => {
    if (!user && !loading) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Load parent-child assessment status and child conversation completions
  useEffect(() => {
    const loadCompletionData = async () => {
      if (!family || !profile) return;
      
      const children = familyMembers.filter(member => member.profiles.user_type === 'child');
      const assessmentStatus: Record<string, boolean> = {};
      const completionStatus: Record<string, boolean> = {};
      
      console.log('Loading completion data for children:', children.map(c => c.profiles.full_name));
      
      for (const child of children) {
        // Check parent-child assessment completion (check for ANY parent, not just current user)
        const assessment = await getAssessment(child.profiles.id);
        const hasParentResponses = !!assessment && 
          assessment.parent_responses.short.length > 0;
        assessmentStatus[child.profiles.id] = hasParentResponses;
        console.log(`Parent assessment for ${child.profiles.full_name}:`, hasParentResponses, assessment);
        
        // Check if child responses are missing but child has completed conversation
        if (assessment && hasParentResponses && 
            (!assessment.child_responses.short || assessment.child_responses.short.length === 0)) {
          console.log(`Child responses missing for ${child.profiles.full_name}, attempting to link...`);
          await refreshAndLinkChildResponses(child.profiles.id, family.id);
        }
        
        // If AI analysis is missing but we have both responses, trigger it
        if (assessment && hasParentResponses && 
            assessment.child_responses.short.length > 0 && 
            !assessment.ai_analysis) {
          console.log(`AI analysis missing for ${child.profiles.full_name}, triggering analysis...`);
          await refreshAndLinkChildResponses(child.profiles.id, family.id);
        }
        
        // Check child's conversation completion
        const { data: childCompletion } = await supabase
          .from('conversation_completions')
          .select('*')
          .eq('user_id', child.profiles.id)
          .eq('family_id', family.id)
          .maybeSingle();
        
        const hasChildCompletion = !!childCompletion;
        completionStatus[child.profiles.id] = hasChildCompletion;
        console.log(`Child completion for ${child.profiles.full_name}:`, hasChildCompletion, childCompletion);
      }
      
      console.log('Final assessment status:', assessmentStatus);
      console.log('Final completion status:', completionStatus);
      
      setChildAssessments(assessmentStatus);
      setChildCompletions(completionStatus);
    };

    loadCompletionData();
  }, [family, familyMembers, profile, getAssessment, refreshAndLinkChildResponses]);

  const handleParentChildComplete = () => {
    setSelectedChild(null);
    // Refresh assessment status
    if (family) {
      const children = familyMembers.filter(member => member.profiles.user_type === 'child');
      children.forEach(async (child) => {
        const assessment = await getAssessment(child.profiles.id);
        setChildAssessments(prev => ({
          ...prev,
          [child.profiles.id]: !!assessment && assessment.parent_responses.short.length > 0
        }));
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleCreateFamily = async () => {
    try {
      const { error } = await createFamily();
      
      if (error) {
        return { error };
      } else {
        return { data: 'success' };
      }
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const handleJoinFamily = async (familyCode: string) => {
    console.log('Dashboard: Starting join family process...');
    
    try {
      const result = await joinFamily(familyCode);
      
      if (result.error) {
        toast({
          title: "Failed to Join Family",
          description: result.error,
          variant: "destructive"
        });
        return { error: result.error };
      }

      console.log('Dashboard: Family joined successfully, showing success toast');
      toast({
        title: "Successfully Joined Family! 🎉",
        description: "Welcome to your family! You can now start the conversation.",
      });

      // Ensure UI updates by forcing a state refresh
      setRefreshKey(prev => prev + 1);
      
      return { data: result.data };
    } catch (error) {
      console.error('Error in handleJoinFamily:', error);
      toast({
        title: "Unexpected Error",
        description: "Something went wrong while joining the family.",
        variant: "destructive"
      });
      return { error: 'An unexpected error occurred' };
    }
  };

  const shouldReduceMotion = useReducedMotion();

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const isChild = profile.user_type === 'child';
  const isParent = profile.user_type === 'parent';
  const hasCompletedConversation = !!conversationCompletion;
  const conversationProgress = hasCompletedConversation ? 100 : 0;

  console.log('Dashboard render - Current state:', { 
    isChild, 
    family: family?.family_code, 
    familyMembers: familyMembers.length,
    hasCompletedConversation,
    refreshKey
  });

  // Show insight viewer if selected
  if (selectedInsightChild && family) {
    return (
      <InsightViewer 
        child={selectedInsightChild}
        familyId={family.id}
        onBack={() => setSelectedInsightChild(null)}
      />
    );
  }

  // Show parent-child conversation if selected
  if (selectedChild && family) {
    return (
      <ParentChildConversation 
        child={selectedChild}
        familyId={family.id}
        onComplete={handleParentChildComplete}
        onBack={() => setSelectedChild(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <motion.nav
        initial={shouldReduceMotion ? undefined : "hidden"}
        animate={shouldReduceMotion ? undefined : "visible"}
        variants={fadeUp}
        className="flex justify-between items-center p-6 bg-white/70 backdrop-blur-xl border-b border-blue-100 shadow-md z-10 relative"
      >
        <div className="flex items-center space-x-2">
          <Users className="h-8 w-8 text-blue-600 drop-shadow-lg" />
          <span className="text-2xl font-extrabold text-gray-900 tracking-tight">FamilyConnect</span>
          {isChild && (
            <Badge className="bg-purple-100 text-purple-800 ml-2">
              <Star className="h-3 w-3 mr-1" />
              Child
            </Badge>
          )}
        </div>
        <div className="space-x-4">
          <Button onClick={handleSignOut} className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white font-bold shadow-lg rounded-full px-6 py-2">
            <LogOut className="h-5 w-5 mr-2" /> Sign Out
          </Button>
        </div>
      </motion.nav>
      <motion.div
        initial={shouldReduceMotion ? undefined : "hidden"}
        animate={shouldReduceMotion ? undefined : "visible"}
        variants={fadeUp}
        className="container mx-auto px-6 py-10"
      >
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isChild ? `Hi ${profile.full_name.split(' ')[0]}! 🌟` : `Welcome back, ${profile.full_name.split(' ')[0]}! 👋`}
          </h1>
          <p className="text-gray-600">
            {isChild 
              ? "Let's continue building stronger connections with your family!"
              : "Continue building stronger connections with your family."
            }
          </p>
        </div>

        {/* Family Setup Section - Show only if user isn't in a family and not loading */}
        {!familyLoading && !family && (
          <div className="mb-8">
            <FamilySetupCard 
              isParent={isParent}
              onCreateFamily={handleCreateFamily}
              onJoinFamily={handleJoinFamily}
              familyLoading={familyLoading}
            />
          </div>
        )}

        {/* Stats Cards */}
        <StatsCards 
          family={family}
          familyMembers={familyMembers}
          conversationProgress={conversationProgress}
          isChild={isChild}
        />

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Active Conversations */}
          <ConversationsCard 
            isChild={isChild}
            hasCompletedConversation={hasCompletedConversation}
            conversationCompletion={conversationCompletion}
          />

          {/* Family Members */}
          <FamilyMembersCard 
            isChild={isChild}
            familyMembers={familyMembers}
            family={family}
            user={user}
          />
        </div>

        {/* Parent-Child Assessments - Show only for parents */}
        {isParent && family && familyMembers.some(member => member.profiles.user_type === 'child') && (
          <ParentChildAssessmentsCard 
            familyMembers={familyMembers}
            childAssessments={childAssessments}
            onSelectChild={setSelectedChild}
          />
        )}

        {/* Quick Actions */}
        <QuickActionsCard 
          isChild={isChild}
          isParent={isParent}
          hasCompletedConversation={hasCompletedConversation}
          family={family}
          familyMembers={familyMembers}
          childAssessments={childAssessments}
          childCompletions={childCompletions}
          onSelectInsightChild={setSelectedInsightChild}
          currentUserId={user?.id}
        />
      </motion.div>
    </div>
  );
};

export default Dashboard;