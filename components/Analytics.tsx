import React, { useContext } from 'react';
import Header from './shared/Header';
import Card from './shared/Card';
import { AppContext } from '../App';
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
  const { t } = useContext(AppContext);

  const topicAccuracyData = [
    { topic: t('practice.categories.nursingCare.careBasics'), accuracy: 80, fullMark: 100 },
    { topic: t('practice.categories.nursingCare.commSkills'), accuracy: 90, fullMark: 100 },
    { topic: t('practice.categories.nursingCare.lifeSupport'), accuracy: 75, fullMark: 100 },
    { topic: t('practice.categories.mindBody.structure'), accuracy: 60, fullMark: 100 },
    { topic: t('practice.categories.mindBody.medicalCare'), accuracy: 85, fullMark: 100 },
    { topic: t('practice.categories.comprehensive.exercise'), accuracy: 95, fullMark: 100 },
  ];

  const scoreTrendData = [
    { name: 'Test 1', score: 65 },
    { name: 'Test 2', score: 72 },
    { name: 'Test 3', score: 70 },
    { name: 'Test 4', score: 81 },
    { name: 'Test 5', score: 85 },
  ];
  
  // A helper function to truncate long topic names for the radar chart
  const formatRadarLabel = (value: string) => {
    if (value.length > 15) {
      return value.substring(0, 12) + '...';
    }
    return value;
  };

  return (
    <div>
      <Header title={t('analytics.title')} />
      <div className="p-4 md:p-6 space-y-6">
        <Card>
          <h2 className="text-xl font-bold text-brand-text-primary mb-4">Accuracy by Topic</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={topicAccuracyData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="topic" tickFormatter={formatRadarLabel} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Accuracy" dataKey="accuracy" stroke="#00796B" fill="#4DB6AC" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card>
          <h2 className="text-xl font-bold text-brand-text-primary mb-4">Score Trend</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreTrendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#00796B" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
