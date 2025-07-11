import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Heart, User, Users } from 'lucide-react';
import { useParentChildAssessment } from '@/hooks/useParentChildAssessment';
import type { Profile, ParentChildAssessment } from '@/types/profile';

interface InsightViewerProps {
  child: Profile;
  familyId: string;
  onBack: () => void;
}

// Helper components
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading insights...</p>
    </div>
  </div>
);

const ErrorScreen = ({ error, onBack, childName }: { error: string, onBack: () => void, childName: string }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
    <div className="max-w-2xl mx-auto">
      <Button onClick={onBack} variant="ghost" className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
      </Button>
      <Alert variant="destructive">
        <AlertTitle>Error Loading Insights</AlertTitle>
        <AlertDescription>
          Failed to load insights for {childName}: {error}
        </AlertDescription>
      </Alert>
    </div>
  </div>
);

const IncompleteAssessmentScreen = ({ onBack, childName, onGenerateInsights, canGenerateInsights, isGenerating }: { 
  onBack: () => void, 
  childName: string,
  onGenerateInsights?: () => void,
  canGenerateInsights?: boolean,
  isGenerating?: boolean
}) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
    <div className="max-w-2xl mx-auto">
      <Button onClick={onBack} variant="ghost" className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
      </Button>
      <Card className="shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2 text-blue-600" />
            {canGenerateInsights ? 'Generate AI Insights' : 'Assessment Incomplete'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            {canGenerateInsights 
              ? `Both you and ${childName} have completed your assessments. Click below to generate personalized insights.`
              : `Both you and ${childName} need to complete your assessments before insights become available.`
            }
          </p>
          {canGenerateInsights && onGenerateInsights && (
            <Button 
              onClick={onGenerateInsights} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating insights...
                </>
              ) : (
                'Generate AI Insights'
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  </div>
);

const ProfileSection = ({ 
  title, 
  icon, 
  variant, 
  profile, 
  question, 
  conclusion 
}: {
  title: string;
  icon: React.ReactNode;
  variant: string;
  profile?: string;
  question?: string;
  conclusion?: string;
}) => (
  <Card className="shadow-lg bg-white/80 backdrop-blur-sm">
    <CardHeader>
      <CardTitle className="flex items-center text-lg text-gray-800">
        {icon}
        {title}
        <Badge variant="outline" className={`ml-2 ${variant}`}>{title.includes('Parent') ? 'Parent' : 'Child'}</Badge>
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {profile && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Profile</h3>
          <p className="text-gray-600 text-sm">{profile}</p>
        </div>
      )}
      
      {question && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Reflection Question</h3>
          <p className="text-gray-600 text-sm italic">{question}</p>
        </div>
      )}
      
      {conclusion && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Path Forward</h3>
          <p className="text-gray-600 text-sm">{conclusion}</p>
        </div>
      )}
    </CardContent>
  </Card>
);

export const InsightViewer = ({ child, familyId, onBack }: InsightViewerProps) => {
  const { getAssessment, analysisStatus, refreshAndLinkChildResponses } = useParentChildAssessment();
  const [assessment, setAssessment] = useState<ParentChildAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const loadAssessment = async () => {
      try {
        const data = await getAssessment(child.id);
        if (!mounted) return;
        
        if (!data) {
          setError('No assessment found');
          return;
        }
        
        console.log('Assessment data loaded for insights:', data);
        console.log('AI analysis exists:', !!data?.ai_analysis);
        
        setAssessment(data);
        
        if (data.ai_analysis?.error) {
          setError(data.ai_analysis.error);
        }
      } catch (err) {
        if (!mounted) return;
        console.error('Error loading assessment:', err);
        setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadAssessment();
    return () => { mounted = false; };
  }, [child.id, getAssessment]);

  const handleGenerateInsights = async () => {
    if (!assessment) return;
    
    setIsGeneratingInsights(true);
    try {
      console.log('Manually triggering AI analysis for child:', child.full_name);
      await refreshAndLinkChildResponses(child.id, familyId);
      
      // Wait for analysis to complete and reload assessment
      await new Promise(resolve => setTimeout(resolve, 3000));
      const updatedData = await getAssessment(child.id);
      if (updatedData) {
        setAssessment(updatedData);
        console.log('Updated assessment after manual analysis:', updatedData);
      }
    } catch (analysisError) {
      console.error('Error generating AI insights:', analysisError);
      setError('Failed to generate insights. Please try again later.');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <ErrorScreen 
        error={error}
        onBack={onBack}
        childName={child.full_name}
      />
    );
  }

  if (!assessment?.ai_analysis) {
    // Check if both parent and child have completed their responses
    const hasParentResponses = assessment?.parent_responses?.short?.length > 0;
    const hasChildResponses = assessment?.child_responses?.short?.length > 0;
    const canGenerateInsights = hasParentResponses && hasChildResponses;
    
    return (
      <IncompleteAssessmentScreen 
        onBack={onBack}
        childName={child.full_name}
        onGenerateInsights={canGenerateInsights ? handleGenerateInsights : undefined}
        canGenerateInsights={canGenerateInsights}
        isGenerating={isGeneratingInsights}
      />
    );
  }

  const { ai_analysis } = assessment;

  // Handle case where AI analysis has an error
  if (ai_analysis.error) {
    return (
      <ErrorScreen 
        error={ai_analysis.error}
        onBack={onBack}
        childName={child.full_name}
      />
    );
  }

  // Validate that we have meaningful content
  const hasValidContent = ai_analysis.childProfile || ai_analysis.parentProfile || 
                         ai_analysis.childQuestion || ai_analysis.parentQuestion ||
                         ai_analysis.childConclusion || ai_analysis.parentConclusion;

  if (!hasValidContent) {
    const hasParentResponses = assessment?.parent_responses?.short?.length > 0;
    const hasChildResponses = assessment?.child_responses?.short?.length > 0;
    const canGenerateInsights = hasParentResponses && hasChildResponses;
    
    return (
      <IncompleteAssessmentScreen 
        onBack={onBack}
        childName={child.full_name}
        onGenerateInsights={canGenerateInsights ? handleGenerateInsights : undefined}
        canGenerateInsights={canGenerateInsights}
        isGenerating={isGeneratingInsights}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-2">
            <Heart className="h-6 w-6 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">
              Insights for {child.full_name}
            </h1>
          </div>
          <p className="text-gray-600">
            AI-generated insights to help strengthen your relationship
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Parent Insights */}
          <ProfileSection 
            title="For You (Parent)"
            icon={<User className="h-5 w-5 mr-2 text-blue-600" />}
            variant=""
            profile={ai_analysis.parentProfile}
            question={ai_analysis.parentQuestion}
            conclusion={ai_analysis.parentConclusion}
          />

          {/* Child Insights */}
          <ProfileSection 
            title={`For ${child.full_name}`}
            icon={<Users className="h-5 w-5 mr-2 text-purple-600" />}
            variant="bg-purple-100 text-purple-800"
            profile={ai_analysis.childProfile}
            question={ai_analysis.childQuestion}
            conclusion={ai_analysis.childConclusion}
          />
        </div>

        {/* Debug Information (only show if needed) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="shadow-lg bg-white/80 backdrop-blur-sm mt-6">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">Debug: Raw Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                {JSON.stringify(ai_analysis, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Analysis Status Loading Indicator */}
        {analysisStatus === 'loading' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-center">Generating personalized insights...</p>
              <p className="text-sm text-gray-600 mt-2 text-center">This may take 20-30 seconds</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
