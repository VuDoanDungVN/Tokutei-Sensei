import React, { useContext, useState, useEffect } from 'react';
import Header from './shared/Header';
import Card from './shared/Card';
import { AppContext } from '../App';
import { progressService } from '../services/progressService';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
} from 'recharts';

const Analytics: React.FC = () => {
  const { t, user } = useContext(AppContext);
  const [topicAccuracyData, setTopicAccuracyData] = useState<any[]>([]);
  const [examProgressData, setExamProgressData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load real analytics data
  useEffect(() => {
    const loadAnalyticsData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Load all user progress
        const allProgress = await progressService.getAllUserProgress(user.uid);
        
        // Prepare exam progress data for line chart
        const examData = [];
        for (const [examNumber, progress] of Object.entries(allProgress)) {
          if (progress.completedQuestions > 0) {
            const progressPercentage = await progressService.calculateProgressPercentage(progress, parseInt(examNumber));
            examData.push({
              name: `Kỳ thi ${examNumber}`,
              score: progressPercentage,
              examNumber: parseInt(examNumber)
            });
          }
        }
        
        // Sort by exam number
        examData.sort((a, b) => a.examNumber - b.examNumber);
        setExamProgressData(examData);

        // Prepare topic accuracy data from actual progress
        const topicMap = new Map();
        
        // Aggregate progress by topic across all exams
        for (const [examNumber, progress] of Object.entries(allProgress)) {
          if (progress.topics) {
            for (const [topicId, topicProgress] of Object.entries(progress.topics)) {
              if (!topicMap.has(topicId)) {
                topicMap.set(topicId, {
                  topic: topicId,
                  totalCompleted: 0,
                  totalCorrect: 0,
                  totalQuestions: 0
                });
              }
              
              const existing = topicMap.get(topicId);
              existing.totalCompleted += topicProgress.completed;
              existing.totalCorrect += topicProgress.correct;
              existing.totalQuestions = Math.max(existing.totalQuestions, topicProgress.total);
            }
          }
        }
        
        // Convert to chart data format
        const topicData = Array.from(topicMap.values()).map(topic => {
          const accuracy = topic.totalCompleted > 0 ? Math.round((topic.totalCorrect / topic.totalCompleted) * 100) : 0;
          return {
            topic: topic.topic,
            accuracy: accuracy,
            fullMark: 100
          };
        });
        
        setTopicAccuracyData(topicData);
        
      } catch (error) {
        console.error('❌ Error loading analytics data:', error);
        
        // Fallback to empty data
        setTopicAccuracyData([]);
        setExamProgressData([]);
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, [user]);
  
  // A helper function to truncate long topic names for the radar chart
  const formatRadarLabel = (value: string) => {
    if (value.length > 15) {
      return value.substring(0, 12) + '...';
    }
    return value;
  };

  if (loading) {
    return (
      <div>
        <Header title={t('analytics.title')} />
        <div className="p-4 md:p-6 space-y-6">
          <Card>
            <div className="flex items-center justify-center h-80">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
                <p className="text-brand-text-secondary">Đang tải dữ liệu phân tích...</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title={t('analytics.title')} />
      <div className="p-4 md:p-6 space-y-6">
        <Card>
          <h2 className="text-xl font-bold text-brand-text-primary mb-4">Tiến độ theo kỳ thi</h2>
          <div className="h-80">
            {examProgressData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={examProgressData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" tickFormatter={formatRadarLabel} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Tiến độ (%)" dataKey="score" stroke="#00796B" fill="#4DB6AC" fillOpacity={0.6} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Tiến độ']} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-gray-500">Chưa có dữ liệu tiến độ</p>
                  <p className="text-sm text-gray-400">Hãy làm bài luyện tập để xem biểu đồ</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {topicAccuracyData.length > 0 && (
          <Card>
            <h2 className="text-xl font-bold text-brand-text-primary mb-4">Độ chính xác theo chủ đề</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={topicAccuracyData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="topic" tickFormatter={formatRadarLabel} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Độ chính xác (%)" dataKey="accuracy" stroke="#00796B" fill="#4DB6AC" fillOpacity={0.6} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Độ chính xác']} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
        
        <Card>
          <h2 className="text-xl font-bold text-brand-text-primary mb-4">Xu hướng tiến độ</h2>
          <div className="h-80">
            {examProgressData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={examProgressData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Tiến độ']} />
                  <Legend />
                  <Line type="monotone" dataKey="score" stroke="#00796B" activeDot={{ r: 8 }} name="Tiến độ (%)" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <p className="text-gray-500">Chưa có dữ liệu xu hướng</p>
                  <p className="text-sm text-gray-400">Hãy làm bài luyện tập để xem biểu đồ</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
