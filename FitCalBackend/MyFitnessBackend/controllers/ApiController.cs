using Microsoft.AspNetCore.Mvc;
using MyFitnessBackend.Models;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization; // Make sure this is included for JsonIgnoreCondition
using Microsoft.Extensions.Configuration; // Make sure this is included

namespace MyFitnessBackend.Controllers
{
    [ApiController]
    [Route("api")]
    public class ApiController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly string? _geminiApiKey;
        private readonly string? _edamamAppId;
        private readonly string? _edamamAppKey;
        private readonly string? _gcpProjectId; // Added for clarity, though _configuration["GCPProjectID"] also works

        public ApiController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;

            _geminiApiKey = _configuration["ApiKeys:Gemini"];
            _edamamAppId = _configuration["ApiKeys:EdamamAppId"];
            _edamamAppKey = _configuration["ApiKeys:EdamamAppKey"];
            _gcpProjectId = _configuration["GCPProjectID"]; // Assign GCP Project ID

            if (string.IsNullOrEmpty(_geminiApiKey) || string.IsNullOrEmpty(_edamamAppId) || string.IsNullOrEmpty(_edamamAppKey) || string.IsNullOrEmpty(_gcpProjectId))
            {
                Console.WriteLine("WARNING: One or more API keys or GCP Project ID are missing in configuration. Check appsettings.json or environment variables.");
            }
        }

        // --- Gemini Proxy Endpoint ---
        [HttpPost("generate_ai_plan")]
        public async Task<IActionResult> GenerateAiPlan([FromBody] GenerateAiPlanRequest request)
        {
            if (string.IsNullOrEmpty(request.Prompt))
            {
                return BadRequest("Prompt is required.");
            }
            if (string.IsNullOrEmpty(_geminiApiKey))
            {
                return StatusCode(503, "Gemini API key is not configured on the backend.");
            }
            // No need to check _gcpProjectId here, as it's not used in this specific Gemini API endpoint URL anymore

            try
            {
                var httpClient = _httpClientFactory.CreateClient();

                // *** CORRECTED GEMINI API URL WITH THE FOUND MODEL NAME ***
                // Use a model from your ListModels output that supports "generateContent"
                // "models/gemini-2.5-pro" is a good stable choice.
                var geminiApiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key={_geminiApiKey}";
                // If you prefer a "flash" model for speed:
                // var geminiApiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={_geminiApiKey}";

                var geminiRequestPayload = new
                {
                    contents = new[] { new { parts = new[] { new { text = request.Prompt } } } }
                };

                var content = new StringContent(
                    JsonSerializer.Serialize(geminiRequestPayload, new JsonSerializerOptions { DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull }),
                    Encoding.UTF8,
                    "application/json"
                );

                var geminiResponse = await httpClient.PostAsync(geminiApiUrl, content);

                // Read response content even if status is not success, for better error logging
                var responseBody = await geminiResponse.Content.ReadAsStringAsync();

                if (!geminiResponse.IsSuccessStatusCode)
                {
                    Console.WriteLine($"Gemini API error status: {geminiResponse.StatusCode}, response: {responseBody}");
                    return StatusCode((int)geminiResponse.StatusCode, $"Gemini API returned an error: {responseBody}");
                }

                GeminiApiResponse? geminiApiResponse = null;
                try
                {
                    // Attempt to deserialize the successful response
                    geminiApiResponse = JsonSerializer.Deserialize<GeminiApiResponse>(responseBody, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                }
                catch (JsonException ex)
                {
                    Console.WriteLine($"JSON Deserialization error from successful Gemini response: {ex.Message}. Response Body: {responseBody}");
                    return StatusCode(500, $"Failed to parse successful Gemini API response: {ex.Message}");
                }


                var aiTextResponse = geminiApiResponse?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;

                if (string.IsNullOrEmpty(aiTextResponse))
                {
                    // This could happen if Gemini didn't provide a text part, but no error status
                    Console.WriteLine($"Gemini API returned success, but no text was extracted. Response Body: {responseBody}");
                    return StatusCode(500, "Could not extract AI response text from Gemini. Response might be empty or malformed.");
                }

                return Ok(new { aiResponse = aiTextResponse });
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"Gemini API HTTP error: {ex.Message}");
                return StatusCode(502, $"Error calling Gemini API: {ex.Message}");
            }
            // Removed general JsonException here, as it's now handled specifically for successful responses.
            catch (Exception ex)
            {
                Console.WriteLine($"An unexpected error occurred in GenerateAiPlan: {ex.Message}");
                return StatusCode(500, $"An unexpected error occurred: {ex.Message}");
            }
        }

        // --- Edamam Proxy Endpoint ---
        [HttpPost("analyze_nutrition")]
        public async Task<IActionResult> AnalyzeNutrition([FromBody] AnalyzeNutritionRequest request)
        {
            if (request.Ingredients == null || !request.Ingredients.Any())
            {
                return BadRequest("An array of ingredients is required.");
            }
            if (string.IsNullOrEmpty(_edamamAppId) || string.IsNullOrEmpty(_edamamAppKey))
            {
                return StatusCode(503, "Edamam API keys are not configured on the backend.");
            }

            try
            {
                var httpClient = _httpClientFactory.CreateClient();
                var edamamApiUrl = $"https://api.edamam.com/api/nutrition-details?app_id={_edamamAppId}&app_key={_edamamAppKey}";

                var edamamRequestPayload = new { ingredients = request.Ingredients };

                var content = new StringContent(
                    JsonSerializer.Serialize(edamamRequestPayload),
                    Encoding.UTF8,
                    "application/json"
                );

                var edamamResponse = await httpClient.PostAsync(edamamApiUrl, content);

                var responseBody = await edamamResponse.Content.ReadAsStringAsync();

                if (!edamamResponse.IsSuccessStatusCode)
                {
                    Console.WriteLine($"Edamam API error status: {edamamResponse.StatusCode}, response: {responseBody}");
                    return StatusCode((int)edamamResponse.StatusCode, $"Edamam API returned an error: {responseBody}");
                }

                return Ok(JsonDocument.Parse(responseBody)); // Return Edamam's raw JSON response
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"Edamam API HTTP error: {ex.Message}");
                return StatusCode(502, $"Error calling Edamam API: {ex.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An unexpected error occurred in AnalyzeNutrition: {ex.Message}");
                return StatusCode(500, $"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}