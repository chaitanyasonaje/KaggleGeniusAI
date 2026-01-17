
import { DatasetAnalysis, DatasetColumn } from '../types';

export const DEMO_DATASETS = {
  TITANIC: {
    name: 'Titanic Survival',
    type: 'Classification',
    columns: [
      { name: 'Survived', type: 'categorical', sampleValues: [0, 1, 1, 0], stats: { uniqueCount: 2, missingCount: 0 } },
      { name: 'Pclass', type: 'numeric', sampleValues: [3, 1, 3, 1], stats: { mean: 2.3, uniqueCount: 3, missingCount: 0 } },
      { name: 'Age', type: 'numeric', sampleValues: [22, 38, 26, 35], stats: { mean: 29.7, std: 14.5, uniqueCount: 88, missingCount: 177 } },
      { name: 'Fare', type: 'numeric', sampleValues: [7.25, 71.28, 7.92, 53.1], stats: { mean: 32.2, uniqueCount: 248, missingCount: 0 } },
      { name: 'Sex', type: 'categorical', sampleValues: ['male', 'female'], stats: { uniqueCount: 2, missingCount: 0 } }
    ] as DatasetColumn[],
    rowCount: 891,
    analysis: {
      summary: "A classic binary classification task. Signal is concentrated in demographic and socio-economic features.",
      problemType: 'classification',
      targetSuggestion: 'Survived',
      featureEngineering: [
        { title: "Title Extraction", description: "Mapping names to social status.", reasoning: "Captures age and rank nuances." },
        { title: "Family Grouping", description: "Aggregating SibSp and Parch.", reasoning: "Social survival dynamics." }
      ],
      modelRecommendations: [
        { modelName: "XGBoost", suitability: "High", pros: ["Non-linear", "Fast"], cons: ["Overfitting"], hyperparameters: [{param: "depth", range: "3-6", description: "Complexity"}] }
      ],
      metricRationale: { recommendedMetric: "Accuracy", why: "Balanced target distribution.", alternatives: ["F1"] },
      edaInsights: [{ observation: "Female survival rate is 3x higher.", importance: "high" }],
      baselineNotebook: "# Titanic Baseline Code\nimport pandas as pd...",
      simulatedTraining: {
        logs: Array.from({length: 5}, (_, i) => ({ epoch: i+1, loss: 0.5-i*0.05, val_loss: 0.52-i*0.04, metric: 0.7+i*0.02, val_metric: 0.68+i*0.02 })),
        finalMetricScore: 0.82,
        featureImportance: [{feature: 'Sex', importance: 0.5}, {feature: 'Pclass', importance: 0.3}]
      },
      correlations: [{x: 'Sex', y: 'Survived', value: 0.54}]
    } as DatasetAnalysis
  },
  HOUSING: {
    name: 'Ames Housing Prices',
    type: 'Regression',
    columns: [
      { name: 'SalePrice', type: 'numeric', sampleValues: [208500, 181500], stats: { mean: 180921, uniqueCount: 663, missingCount: 0 } },
      { name: 'GrLivArea', type: 'numeric', sampleValues: [1710, 1262], stats: { mean: 1515, uniqueCount: 861, missingCount: 0 } },
      { name: 'YearBuilt', type: 'numeric', sampleValues: [2003, 1976], stats: { mean: 1971, uniqueCount: 112, missingCount: 0 } },
      { name: 'TotalBsmtSF', type: 'numeric', sampleValues: [856, 1262], stats: { mean: 1057, uniqueCount: 721, missingCount: 0 } }
    ] as DatasetColumn[],
    rowCount: 1460,
    analysis: {
      summary: "High-dimensional regression problem. Focus on square footage and temporal features.",
      problemType: 'regression',
      targetSuggestion: 'SalePrice',
      featureEngineering: [
        { title: "Log Transformation", description: "Scaling the target variable.", reasoning: "Addresses right-skewness in price." },
        { title: "Total Square Feet", description: "Summing basement and living area.", reasoning: "Stronger linear correlation." }
      ],
      modelRecommendations: [
        { modelName: "Ridge Regression", suitability: "Solid Baseline", pros: ["Interpretability"], cons: ["Linear only"], hyperparameters: [{param: "alpha", range: "0.1-10", description: "Regularization"}] }
      ],
      metricRationale: { recommendedMetric: "RMSE", why: "Standard for price prediction.", alternatives: ["MAE"] },
      edaInsights: [{ observation: "Strong correlation between GrLivArea and SalePrice.", importance: "high" }],
      baselineNotebook: "# Housing Regression Code\nimport numpy as np...",
      simulatedTraining: {
        logs: Array.from({length: 5}, (_, i) => ({ epoch: i+1, loss: 100-i*10, val_loss: 110-i*9, metric: 0.2+i*0.1, val_metric: 0.18+i*0.08 })),
        finalMetricScore: 0.125, // Log RMSE
        featureImportance: [{feature: 'GrLivArea', importance: 0.6}, {feature: 'OverallQual', importance: 0.4}]
      },
      correlations: [{x: 'GrLivArea', y: 'SalePrice', value: 0.71}]
    } as DatasetAnalysis
  },
  FRAUD: {
    name: 'Credit Card Fraud',
    type: 'Imbalanced Tabular',
    columns: [
      { name: 'Class', type: 'categorical', sampleValues: [0, 0, 0, 1], stats: { uniqueCount: 2, missingCount: 0 } },
      { name: 'Amount', type: 'numeric', sampleValues: [149.62, 2.69], stats: { mean: 88.34, uniqueCount: 32767, missingCount: 0 } },
      { name: 'V1', type: 'numeric', sampleValues: [-1.35, 1.19], stats: { mean: 0, uniqueCount: 32767, missingCount: 0 } }
    ] as DatasetColumn[],
    rowCount: 284807,
    analysis: {
      summary: "Massively imbalanced fraud detection. 0.17% positive class. Requires precision-recall optimization.",
      problemType: 'classification',
      targetSuggestion: 'Class',
      featureEngineering: [
        { title: "Robust Scaling", description: "Handling outliers in V-features.", reasoning: "Standard scalers fail with extreme fraud patterns." },
        { title: "SMOTE Oversampling", description: "Synthetic minority class generation.", reasoning: "Addresses extreme imbalance." }
      ],
      modelRecommendations: [
        { modelName: "LightGBM", suitability: "Excellent", pros: ["Fast on large data"], cons: ["Memory intensive"], hyperparameters: [{param: "is_unbalance", range: "True", description: "Class weighting"}] }
      ],
      metricRationale: { recommendedMetric: "PR-AUC", why: "Accuracy is misleading for imbalanced data.", alternatives: ["AUPRC"] },
      edaInsights: [{ observation: "V17 and V14 show strongest separation for fraud.", importance: "high" }],
      baselineNotebook: "# Fraud Detection Code\nfrom lightgbm import LGBMClassifier...",
      simulatedTraining: {
        logs: Array.from({length: 5}, (_, i) => ({ epoch: i+1, loss: 0.1-i*0.01, val_loss: 0.12-i*0.008, metric: 0.9+i*0.01, val_metric: 0.88+i*0.01 })),
        finalMetricScore: 0.94,
        featureImportance: [{feature: 'V17', importance: 0.7}, {feature: 'Amount', importance: 0.1}]
      },
      correlations: [{x: 'V17', y: 'Class', value: -0.32}]
    } as DatasetAnalysis
  }
};
