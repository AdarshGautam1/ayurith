from app.services.llm import get_genai_client
from app.config import settings

class TranslationService:
    def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        if source_lang == target_lang or not text:
            return text
            
        if not settings.gemini_api_key or "your_gemini_api_key" in settings.gemini_api_key.lower():
            return text
            
        target_name = "Hindi (हिन्दी, Devanagari script)" if target_lang == "hi" else target_lang
        prompt = (
            f"Translate the following legal and regulatory text from {source_lang} to {target_name}.\n"
            f"Rules:\n"
            f"1. Accurately translate statutory analysis and regulatory principles.\n"
            f"2. Keep section numbers and citation brackets like [1], [2] intact and in the same positions.\n"
            f"3. Return ONLY the translated text without conversational filler or notes.\n\n"
            f"Text:\n{text}"
        )
        
        candidate_models = list(dict.fromkeys([
            settings.gemini_model,
            "gemini-3-flash-preview",
            "gemini-3.8-flash"
        ]))
        
        import time
        for model_name in candidate_models:
            for attempt in range(2):
                try:
                    client = get_genai_client()
                    response = client.models.generate_content(
                        model=model_name,
                        contents=prompt
                    )
                    translated = response.text.strip()
                    if translated:
                        return translated
                except Exception as e:
                    err_str = str(e).lower()
                    if ("503" in err_str or "unavailable" in err_str or "429" in err_str) and attempt == 0:
                        time.sleep(1.0)
                        continue
                    break
                    
        return text

# Singleton instance
translator = TranslationService()
