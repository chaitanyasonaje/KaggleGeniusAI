
export interface User {
  name: string;
  email: string;
}

export interface DatasetColumn {
  name: string;
  type: 'numeric' | 'categorical' | 'datetime' | 'text' | 'unknown';
  sampleValues: any[];
  stats?: {
    mean?: number;
    median?: number;
    std?: number;
    uniqueCount?: number;
    missingCount?: number;
    min?: number;
    max?: number;
  };
}

export interface TrainingLog {
  epoch: number;
  loss: number;
  val_loss: number;
  metric: number;
  val_metric: number;
}

export interface DatasetAnalysis {
  summary: string;
  problemType: 'classification' | 'regression' | 'clustering' | 'time-series' | 'unknown';
  targetSuggestion: string;
  featureEngineering: {
    title: string;
    description: string;
    reasoning: string;
  }[];
  modelRecommendations: {
    modelName: string;
    suitability: string;
    pros: string[];
    cons: string[];
    hyperparameters: {
      param: string;
      range: string;
      description: string;
    }[];
  }[];
  metricRationale: {
    recommendedMetric: string;
    why: string;
    alternatives: string[];
  };
  edaInsights: {
    observation: string;
    importance: 'high' | 'medium' | 'low';
  }[];
  baselineNotebook: string;
  simulatedTraining: {
    logs: TrainingLog[];
    finalMetricScore: number;
    featureImportance: { feature: string; importance: number }[];
    confusionMatrix?: number[][];
    residuals?: { predicted: number; actual: number }[];
  };
  correlations: {
    x: string;
    y: string;
    value: number;
  }[];
}

export interface ProcessingState {
  status: 'idle' | 'parsing' | 'analyzing' | 'completed' | 'error';
  progress: number;
  error?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
