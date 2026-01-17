
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { DatasetAnalysis, DatasetColumn } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;
  private chatInstance: Chat | null = null;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  async analyzeDataset(
    columns: DatasetColumn[],
    rowCount: number,
    sampleRows: any[]
  ): Promise<DatasetAnalysis> {
    // Using gemini-3-flash-preview for significantly lower latency
    const prompt = `
      You are a world-class Kaggle Grandmaster AI Assistant. 
      Analyze the following dataset metadata and suggest the best ML strategy.
      
      Dataset Metadata:
      - Total Rows: ${rowCount}
      - Columns: ${JSON.stringify(columns)}
      - Sample Rows: ${JSON.stringify(sampleRows)}

      Provide a comprehensive report strictly in JSON format including:
      1. summary: A concise dataset summary.
      2. problemType: classification, regression, clustering, or time-series.
      3. targetSuggestion: The recommended target column name.
      4. featureEngineering: Array of objects with title, description, reasoning.
      5. modelRecommendations: Array of objects with modelName, suitability, pros, cons, and hyperparameters (param, range, description).
      6. metricRationale: Object with recommendedMetric, why, alternatives (array).
      7. edaInsights: Array of objects with observation, importance (high, medium, low).
      8. baselineNotebook: A full Python script using pandas, sklearn, and a boosting library.
      9. simulatedTraining: 
         - logs: Array of 10 objects (epoch 1-10) with loss, val_loss, metric, val_metric.
         - finalMetricScore: The best validation score achieved.
         - featureImportance: Array of top 8 objects (feature, importance value 0-1).
         - confusionMatrix: 2x2 normalized array (if classification).
         - residuals: Array of 20 objects with predicted and actual values (if regression).
      10. correlations: Array of objects (x, y, value) showing relationships between important features.
    `;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        // Disabling thinking to prioritize speed/latency as requested
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            problemType: { type: Type.STRING },
            targetSuggestion: { type: Type.STRING },
            featureEngineering: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  reasoning: { type: Type.STRING }
                },
                required: ["title", "description", "reasoning"]
              }
            },
            modelRecommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  modelName: { type: Type.STRING },
                  suitability: { type: Type.STRING },
                  pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                  cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                  hyperparameters: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        param: { type: Type.STRING },
                        range: { type: Type.STRING },
                        description: { type: Type.STRING }
                      }
                    }
                  }
                },
                required: ["modelName", "suitability", "pros", "cons", "hyperparameters"]
              }
            },
            metricRationale: {
              type: Type.OBJECT,
              properties: {
                recommendedMetric: { type: Type.STRING },
                why: { type: Type.STRING },
                alternatives: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["recommendedMetric", "why", "alternatives"]
            },
            edaInsights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  observation: { type: Type.STRING },
                  importance: { type: Type.STRING }
                }
              }
            },
            baselineNotebook: { type: Type.STRING },
            simulatedTraining: {
              type: Type.OBJECT,
              properties: {
                logs: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      epoch: { type: Type.NUMBER },
                      loss: { type: Type.NUMBER },
                      val_loss: { type: Type.NUMBER },
                      metric: { type: Type.NUMBER },
                      val_metric: { type: Type.NUMBER }
                    }
                  }
                },
                finalMetricScore: { type: Type.NUMBER },
                featureImportance: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      feature: { type: Type.STRING },
                      importance: { type: Type.NUMBER }
                    }
                  }
                },
                confusionMatrix: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.NUMBER } } },
                residuals: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      predicted: { type: Type.NUMBER },
                      actual: { type: Type.NUMBER }
                    }
                  }
                }
              },
              required: ["logs", "finalMetricScore", "featureImportance"]
            },
            correlations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  x: { type: Type.STRING },
                  y: { type: Type.STRING },
                  value: { type: Type.NUMBER }
                }
              }
            }
          },
          required: ["summary", "problemType", "targetSuggestion", "featureEngineering", "modelRecommendations", "metricRationale", "edaInsights", "baselineNotebook", "simulatedTraining", "correlations"]
        }
      }
    });

    try {
      const data = JSON.parse(response.text) as DatasetAnalysis;
      this.chatInstance = this.ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: `You are a Kaggle Grandmaster assistant. You have already analyzed the user's dataset and provided a report. 
          Context of dataset: ${data.summary}. Problem: ${data.problemType}. 
          Answer follow-up questions about feature engineering, model selection, or implementation details.`,
        }
      });
      return data;
    } catch (e) {
      console.error("Failed to parse Gemini response:", response.text);
      throw new Error("Invalid response format from AI. Please try again.");
    }
  }

  async askAssistant(message: string): Promise<string> {
    if (!this.chatInstance) {
      throw new Error("Analysis must be performed before chatting.");
    }
    const response = await this.chatInstance.sendMessage({ message });
    return response.text || "I'm sorry, I couldn't generate a response.";
  }
}
