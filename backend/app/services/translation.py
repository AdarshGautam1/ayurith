from app.services.llm import get_genai_client
from app.config import settings

class TranslationService:
    def __init__(self):
        self.client = get_genai_client()
        
    def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        if source_lang == target_lang or not text:
            return text
            
        if not settings.gemini_api_key or "your_gemini_api_key" in settings.gemini_api_key.lower():
            return text
            
        prompt = f"Translate the following text from {source_lang} to {target_lang}. Preserve all technical and legal terminology accurately. Return only the translated text without any conversational filler.\n\nText: {text}"
        
        candidate_models = list(dict.fromkeys([settings.gemini_model, "gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash"]))
        for model_name in candidate_models:
            try:
                client = get_genai_client()
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt
                )
                return response.text.strip()
            except Exception as e:
                continue
                
        return text

# Singleton instance
translator = TranslationService()
