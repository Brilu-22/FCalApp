// MyFitnessBackend/Models/ApiRequestModels.cs
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace MyFitnessBackend.Models
{
    public class GenerateAiPlanRequest
    {
        public required string Prompt { get; set; }
        // You could pass the user's UID to the backend here if you needed to log who called the AI
        // public string UserUid { get; set; }
    }

    public class AnalyzeNutritionRequest
    {
        public required List<string> Ingredients { get; set; }
    }

    // --- Gemini API Response Models (simplified for extracting text) ---
    public class GeminiResponsePart
    {
        [JsonPropertyName("text")]
        public string? Text { get; set; }
    }

    public class GeminiResponseContent
    {
        [JsonPropertyName("parts")]
        public List<GeminiResponsePart>? Parts { get; set; }
    }

    public class GeminiResponseCandidate
    {
        [JsonPropertyName("content")]
        public GeminiResponseContent? Content { get; set; }
    }

    public class GeminiApiResponse
    {
        [JsonPropertyName("candidates")]
        public List<GeminiResponseCandidate>? Candidates { get; set; }
    }

    // Edamam response structure is more complex, we'll return it as raw JSON.
}