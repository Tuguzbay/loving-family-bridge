import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useFamilyCodeCopy = () => {
  const [copiedCode, setCopiedCode] = useState(false);
  const { toast } = useToast();

  const handleCopyFamilyCode = async (familyCode?: string) => {
    if (familyCode) {
      try {
        await navigator.clipboard.writeText(familyCode);
        setCopiedCode(true);
        toast({
          title: "Family Code Copied!",
          description: "The family code has been copied to your clipboard.",
        });
        setTimeout(() => setCopiedCode(false), 2000);
      } catch (error) {
        toast({
          title: "Copy Failed",
          description: "Please manually copy the family code.",
          variant: "destructive"
        });
      }
    }
  };

  return { copiedCode, handleCopyFamilyCode };
};