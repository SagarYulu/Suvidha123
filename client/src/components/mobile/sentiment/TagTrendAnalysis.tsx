
import React, { useState, useEffect } from 'react';
import { Loader2, BarChart2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MobileTopicRadarChart from './MobileTopicRadarChart';
import MobileTopicBarChart from './MobileTopicBarChart';
import MobileSentimentPieChart from './MobileSentimentPieChart';
import AboutDataCard from './AboutDataCard';
import { EmptyDataState } from '@/components/charts/EmptyDataState';

interface TagTrendAnalysisProps {
  data: any[];
  isLoading: boolean;
}

// Safe formatter for label lists
const safeFormatLabel = (value: any): string | number => {
  if (Array.isArray(value)) {
    return value && value.length > 0 ? String(value[0] || 0) : '0';
  }
  return typeof value === 'string' || typeof value === 'number' ? value : String(value);
};

const TagTrendAnalysis: React.FC<TagTrendAnalysisProps> = ({ data, isLoading }) => {
  const [activeTab, setActiveTab] = useState('tags');
  const [tagDistribution, setTagDistribution] = useState<any[]>([]);
  const [topTags, setTopTags] = useState<any[]>([]);
  const [sentimentDistribution, setSentimentDistribution] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && data && data.length > 0) {
      processData();
    }
  }, [data, isLoading]);

  const processData = () => {
    // Process tag distribution
    const tagCounts: Record<string, number> = {};
    
    // Count all tags
    data.forEach(item => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((tag: string) => {
          if (tag) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        });
      }
    });
    
    // Convert to array for charts
    const tagArray = Object.keys(tagCounts).map(tag => ({
      name: tag,
      value: tagCounts[tag]
    }));
    
    // Sort by frequency
    const sortedTags = [...tagArray].sort((a, b) => b.value - a.value);
    
    // Set top 5 tags for pie chart
    setTagDistribution(sortedTags.slice(0, 5));
    
    // Set top 10 tags for bar chart
    setTopTags(sortedTags.slice(0, 10).map(item => ({
      name: item.name,
      count: item.value
    })));
    
    // Create radar data for top 5 tags
    setRadarData(sortedTags.slice(0, 5).map(item => ({
      subject: item.name,
      count: item.value,
      fullMark: Math.max(...sortedTags.map(t => t.value)) + 2
    })));
    
    // Process sentiment distribution
    const sentimentCounts: Record<string, number> = {};
    
    data.forEach(item => {
      let label = item.sentiment_label?.toLowerCase() || 'unknown';
      // Simplify to positive, negative, neutral
      if (label.includes('positive')) label = 'positive';
      if (label.includes('negative')) label = 'negative';
      if (label.includes('neutral')) label = 'neutral';
      
      sentimentCounts[label] = (sentimentCounts[label] || 0) + 1;
    });
    
    // Convert to array for charts
    const sentimentArray = Object.keys(sentimentCounts).map(label => ({
      name: label.charAt(0).toUpperCase() + label.slice(1),
      value: sentimentCounts[label]
    }));
    
    setSentimentDistribution(sentimentArray);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full">
        <Loader2 className="h-8 w-8 animate-spin text-white mb-4" />
        <p className="text-white text-center">Loading trend analysis data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full text-white text-center">
        <BarChart2 className="h-12 w-12 mb-4 opacity-50" />
        <h3 className="text-xl font-medium mb-2">No Data Available</h3>
        <p>There is no feedback data available for trend analysis.</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-32">
      <h2 className="text-xl font-semibold mb-4 text-white text-center">Feedback Analysis</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-white/25 p-1 mb-4">
          <TabsTrigger value="tags" className="flex-1 text-white data-[state=active]:bg-white data-[state=active]:text-blue-700">
            Topic Analysis
          </TabsTrigger>
          <TabsTrigger value="sentiment" className="flex-1 text-white data-[state=active]:bg-white data-[state=active]:text-blue-700">
            Sentiment Analysis
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tags" className="space-y-4">
          <MobileTopicRadarChart data={radarData} />
          <MobileTopicBarChart data={topTags} />
        </TabsContent>
        
        <TabsContent value="sentiment" className="space-y-4">
          <MobileSentimentPieChart data={sentimentDistribution} />
          <AboutDataCard dataCount={data.length} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TagTrendAnalysis;
