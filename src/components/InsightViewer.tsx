import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Heart, User, Users } from 'lucide-react';
import { useParentChildAssessment } from '@/hooks/useParentChildAssessment';
import type { Profile } from '@/types/profile';

interface InsightViewerProps {
  child: Profile;
  familyId: string;
  onBack: () => void;
}

export const InsightViewer = ({ child, familyId, onBack }: InsightViewerProps) => {
  const { getAssessment } = useParentChildAssessment();
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAssessment = async () => {
      setLoading(true);
      try {
        const data = await getAssessment(child.id);
        console.log('Assessment data loaded for insights:', data);
        console.log('AI analysis exists:', !!data?.ai_analysis);
        console.log('AI analysis content:', data?.ai_analysis);
        setAssessment(data);
      } catch (error) {
        console.error('Error loading assessment:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, [child.id, getAssessment]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading insights...</p>
        </div>
      </div>
    );
  }

  if (!assessment || (!assessment.ai_analysis && !assessment.ai_analysis?.analysis)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <Card className="shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center p-8">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Insights Not Available Yet
              </h2>
              <p className="text-gray-600">
                Both you and {child.full_name} need to complete your assessments before insights become available.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Parse the AI analysis to extract sections for parent and child
  const analysisText = typeof assessment.ai_analysis === 'string' 
    ? assessment.ai_analysis 
    : assessment.ai_analysis?.analysis || assessment.ai_analysis;
  const sections = parseAnalysis(analysisText);

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
          <Card className="shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg text-gray-800">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                For You (Parent)
                <Badge variant="outline" className="ml-2">Parent</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sections.parentProfile && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Your Profile</h3>
                  <p className="text-gray-600 text-sm">{sections.parentProfile}</p>
                </div>
              )}
              
              {sections.parentQuestion && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Reflection Question</h3>
                  <p className="text-gray-600 text-sm italic">{sections.parentQuestion}</p>
                </div>
              )}
              
              {sections.parentConclusion && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Your Path Forward</h3>
                  <p className="text-gray-600 text-sm">{sections.parentConclusion}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Child Insights */}
          <Card className="shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg text-gray-800">
                <Users className="h-5 w-5 mr-2 text-purple-600" />
                For {child.full_name}
                <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-800">Child</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sections.childProfile && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Their Profile</h3>
                  <p className="text-gray-600 text-sm">{sections.childProfile}</p>
                </div>
              )}
              
              {sections.childQuestion && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Their Reflection Question</h3>
                  <p className="text-gray-600 text-sm italic">{sections.childQuestion}</p>
                </div>
              )}
              
              {sections.childConclusion && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Their Path Forward</h3>
                  <p className="text-gray-600 text-sm">{sections.childConclusion}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Full Analysis (Optional) */}
        <Card className="shadow-lg bg-white/80 backdrop-blur-sm mt-6">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">Complete Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-gray-600">
              {analysisText.split('\n').map((line: string, index: number) => (
                <p key={index} className="mb-2">{line}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Helper function to parse the AI analysis into sections
function parseAnalysis(text: string) {
  const sections: {
    childProfile?: string;
    parentProfile?: string;
    childQuestion?: string;
    parentQuestion?: string;
    childConclusion?: string;
    parentConclusion?: string;
  } = {};

  // Split by common markers and extract sections
  const lines = text.split('\n');
  let currentSection = '';
  let currentContent = '';

  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.toLowerCase().includes('child profile')) {
      if (currentSection && currentContent) {
        sections[currentSection as keyof typeof sections] = currentContent.trim();
      }
      currentSection = 'childProfile';
      currentContent = '';
    } else if (trimmed.toLowerCase().includes('parent profile')) {
      if (currentSection && currentContent) {
        sections[currentSection as keyof typeof sections] = currentContent.trim();
      }
      currentSection = 'parentProfile';
      currentContent = '';
    } else if (trimmed.toLowerCase().includes('question for child')) {
      if (currentSection && currentContent) {
        sections[currentSection as keyof typeof sections] = currentContent.trim();
      }
      currentSection = 'childQuestion';
      currentContent = '';
    } else if (trimmed.toLowerCase().includes('question for parent')) {
      if (currentSection && currentContent) {
        sections[currentSection as keyof typeof sections] = currentContent.trim();
      }
      currentSection = 'parentQuestion';
      currentContent = '';
    } else if (trimmed.toLowerCase().includes('conclusion for child')) {
      if (currentSection && currentContent) {
        sections[currentSection as keyof typeof sections] = currentContent.trim();
      }
      currentSection = 'childConclusion';
      currentContent = '';
    } else if (trimmed.toLowerCase().includes('conclusion for parent')) {
      if (currentSection && currentContent) {
        sections[currentSection as keyof typeof sections] = currentContent.trim();
      }
      currentSection = 'parentConclusion';
      currentContent = '';
    } else if (trimmed && !trimmed.startsWith('*') && currentSection) {
      currentContent += (currentContent ? '\n' : '') + trimmed;
    }
  }

  // Don't forget the last section
  if (currentSection && currentContent) {
    sections[currentSection as keyof typeof sections] = currentContent.trim();
  }

  return sections;
}