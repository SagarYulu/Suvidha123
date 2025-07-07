import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import authenticatedAxios from '@/services/authenticatedAxios';
import { 
  analyzeSentiment, 
  submitSentiment, 
  fetchSentimentTags,
  SentimentRating,
  SentimentTag,
  SentimentAnalysisResult
} from '@/services/sentimentService';

export const useSentiment = () => {
  const [rating, setRating] = useState<number>(3);
  const [feedback, setFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [tags, setTags] = useState<SentimentTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<SentimentAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const { authState } = useAuth();

  // Improved tag loading with better error handling
  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    
    const loadTags = async () => {
      try {
        console.log("Attempting to load sentiment tags...");
        const sentimentTags = await fetchSentimentTags();
        
        if (!mounted) return;
        
        if (sentimentTags && sentimentTags.length > 0) {
          console.log(`Successfully loaded ${sentimentTags.length} sentiment tags:`, sentimentTags);
          setTags(sentimentTags);
        } else {
          // If we got an empty array, we should retry
          console.warn("Received empty tags array, will retry...");
          retryTag();
        }
      } catch (error) {
        console.error("Error loading sentiment tags:", error);
        retryTag();
      }
    };
    
    const retryTag = () => {
      if (retryCount < maxRetries && mounted) {
        retryCount++;
        const delay = 1000 * retryCount; // Exponential backoff
        console.log(`Retrying tag load (${retryCount}/${maxRetries}) in ${delay}ms...`);
        setTimeout(loadTags, delay);
      } else {
        // Fallback tags after all retries fail
        setFallbackTags();
      }
    };
    
    const setFallbackTags = () => {
      if (mounted && (!tags || tags.length === 0)) {
        console.log("Using fallback tags as loading from API failed");
        setTags([
          { id: 'fb-1', name: 'Work-Life Balance', category: 'Wellness' },
          { id: 'fb-2', name: 'Career Growth', category: 'Development' },
          { id: 'fb-3', name: 'Salary', category: 'Benefits' },
          { id: 'fb-4', name: 'Manager', category: 'Leadership' },
          { id: 'fb-5', name: 'Team', category: 'Work Environment' },
          { id: 'fb-6', name: 'Workload', category: 'Wellness' },
          { id: 'fb-7', name: 'Communication', category: 'Leadership' },
          { id: 'fb-8', name: 'Work Place', category: 'Infrastructure' },
          { id: 'fb-9', name: 'Training', category: 'Guiding' }
        ]);
      }
    };
    
    // Load tags on mount
    loadTags();
    
    return () => {
      mounted = false;
    };
  }, []);

  const handleRatingChange = (value: number) => {
    setRating(value);
    
    // Update suggested tags based on rating
    const emotionBasedTags = getEmotionBasedTags(value);
    if (emotionBasedTags.length > 0) {
      setSuggestedTags(prev => {
        // Combine AI suggested tags with emotion-based tags
        const uniqueTags = new Set<string>();
        prev.forEach(tag => uniqueTags.add(tag));
        emotionBasedTags.forEach(tag => uniqueTags.add(tag));
        return Array.from(uniqueTags);
      });
    }
  };
  
  // Get suggested tags based on emotion rating
  const getEmotionBasedTags = (value: number): string[] => {
    switch (value) {
      case 5: // Motivated
        return ["Career Growth", "Team"];
      case 4: // Happy
        return ["Work-Life Balance"];
      case 3: // Neutral
        return [];
      case 2: // Frustrated
        return ["Workload", "Communication"];
      case 1: // Angry
        return ["Manager"];
      default:
        return [];
    }
  };

  const handleFeedbackChange = (value: string) => {
    setFeedback(value);
    
    // Reset analysis if feedback is cleared
    if (!value.trim()) {
      setAnalysisResult(null);
      setSuggestedTags([]);
    }
  };

  const handleTagToggle = (tag: string) => {
    console.log("Toggling tag:", tag);
    
    setSelectedTags(prevTags => {
      const isSelected = prevTags.includes(tag);
      
      if (isSelected) {
        // Remove tag
        return prevTags.filter(t => t !== tag);
      } else {
        // Add tag
        return [...prevTags, tag];
      }
    });
  };

  const handleAnalyzeFeedback = async () => {
    if (!feedback.trim() || feedback.trim().length < 10) return;
    
    setIsAnalyzing(true);
    
    try {
      const result = await analyzeSentiment(feedback);
      setAnalysisResult(result);
      
      // Include AI suggested tags
      if (result.suggested_tags && result.suggested_tags.length > 0) {
        setSuggestedTags(prev => {
          // Get emotion-based tags for current rating
          const emotionTags = getEmotionBasedTags(rating);
          
          // Combine all suggested tags without duplicates
          const uniqueTags = new Set<string>();
          emotionTags.forEach(tag => uniqueTags.add(tag));
          result.suggested_tags.forEach(tag => uniqueTags.add(tag));
          return Array.from(uniqueTags);
        });
        
        // Auto-select suggested tags
        setSelectedTags(prev => {
          // Keep existing selections and add new ones without duplication
          const uniqueTags = new Set<string>();
          prev.forEach(tag => uniqueTags.add(tag));
          result.suggested_tags.forEach(tag => uniqueTags.add(tag));
          return Array.from(uniqueTags);
        });
      }
      
      // If AI provides a rating suggestion, adjust rating
      if (result.rating) {
        setRating(result.rating);
      }
      
      // Alert about urgent issues
      if (result.flag_urgent) {
        toast({
          title: "Urgent Issue Detected",
          description: "This feedback appears to contain an urgent issue that may require immediate attention.",
          variant: "destructive"
        });
      }
      
      // Alert about abusive language
      if (result.flag_abusive) {
        toast({
          title: "Potential Inappropriate Content",
          description: "This feedback may contain inappropriate or abusive language.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error analyzing feedback:", error);
      // Don't show the toast for analysis failure as it's not critical
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!authState.user?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to submit feedback.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Map rating to sentiment label and score
      let sentiment_label: string;
      let sentiment_score: number;
      
      switch (rating) {
        case 5: // Motivated
          sentiment_label = "very positive";
          sentiment_score = 1.0;
          break;
        case 4: // Happy
          sentiment_label = "positive";
          sentiment_score = 0.5;
          break;
        case 3: // Neutral
          sentiment_label = "neutral";
          sentiment_score = 0.0;
          break;
        case 2: // Frustrated
          sentiment_label = "negative";
          sentiment_score = -0.5;
          break;
        case 1: // Angry
          sentiment_label = "very negative";
          sentiment_score = -1.0;
          break;
        default:
          sentiment_label = "neutral";
          sentiment_score = 0.0;
      }
      
      // Check if user is defined and is an object (defensive programming)
      if (!authState.user || typeof authState.user !== 'object') {
        console.error("Invalid user data:", authState.user);
        throw new Error("Invalid user data");
      }
      
      console.log("Auth state user data:", authState.user);
      
      // Extract user metadata from multiple possible locations
      const user = authState.user;
      let city: string | undefined = undefined;
      let cluster: string | undefined = undefined;
      
      // Try to extract from all possible locations in the user object
      // 1. Try direct properties on user object
      if ('city' in user) {
        city = (user as any).city;
      }
      
      if ('cluster' in user) {
        cluster = (user as any).cluster;
      }
      
      // 2. Try user_metadata if available
      if (city === undefined && 'user_metadata' in user && user.user_metadata) {
        city = (user.user_metadata as any).city;
      }
      
      if (cluster === undefined && 'user_metadata' in user && user.user_metadata) {
        cluster = (user.user_metadata as any).cluster;
      }
      
      // 3. Try app_metadata if available
      if (city === undefined && 'app_metadata' in user && user.app_metadata) {
        city = (user.app_metadata as any).city;
      }
      
      if (cluster === undefined && 'app_metadata' in user && user.app_metadata) {
        cluster = (user.app_metadata as any).cluster;
      }
      
      // 4. Final fallback - try to extract from other user properties
      if (city === undefined && 'raw_user_meta_data' in user) {
        city = (user.raw_user_meta_data as any)?.city;
      }
      
      if (cluster === undefined && 'raw_user_meta_data' in user) {
        cluster = (user.raw_user_meta_data as any)?.cluster;
      }
      
      console.log("Final extracted user data for sentiment:", { 
        city, 
        cluster, 
        role: authState.role,
        userId: authState.user.id 
      });
      
      // If still no city/cluster, try to retrieve from employee data
      if (!city || !cluster) {
        try {
          console.log("Attempting to fetch city/cluster from employees table for user:", authState.user.id);
          const { data: employeeData, error } = await fetchEmployeeData(authState.user.id);
          
          if (!error && employeeData) {
            console.log("Retrieved employee data:", employeeData);
            city = city || employeeData.city;
            cluster = cluster || employeeData.cluster;
          } else if (error) {
            console.error("Error fetching employee data:", error);
          }
        } catch (err) {
          console.error("Exception fetching employee data:", err);
        }
      }
      
      const sentimentData: SentimentRating = {
        employee_id: authState.user.id,
        rating,
        feedback: feedback.trim() || undefined,
        city,
        cluster,
        role: authState.role || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        sentiment_score: sentiment_score,
        sentiment_label: sentiment_label
      };
      
      console.log("Submitting sentiment data:", sentimentData);
      
      const { success, error } = await submitSentiment(sentimentData);
      
      if (success) {
        toast({
          title: "Thank You",
          description: "Your feedback has been submitted successfully!",
          variant: "default"
        });
        
        // Reset form
        setRating(3);
        setFeedback('');
        setSelectedTags([]);
        setSuggestedTags([]);
        setAnalysisResult(null);
      } else {
        throw new Error(error || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting sentiment:", error);
      toast({
        title: "Submission Failed",
        description: "Unable to submit your feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to fetch employee data when city/cluster is not available
  const fetchEmployeeData = async (userId: string) => {
    try {
      const response = await authenticatedAxios.get(`/api/employees/${userId}`);
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error("Error in fetchEmployeeData:", error);
      return { data: null, error };
    }
  };

  return {
    rating,
    feedback,
    isSubmitting,
    tags,
    selectedTags,
    suggestedTags,
    isAnalyzing,
    handleRatingChange,
    handleFeedbackChange,
    handleTagToggle,
    handleAnalyzeFeedback,
    handleSubmit
  };
};
