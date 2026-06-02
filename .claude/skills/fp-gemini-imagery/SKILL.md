# FusionPrints Gemini Imagery Skill

## Trigger
Use this skill whenever any page, section, or component needs an image.
This is the sole image source for the entire FusionPrints project.
Read fully before generating anything.

## API key
Environment variable only — never hardcode or commit:
import os; key = os.environ["GEMINI_API_KEY"]

## How to generate

```python
import google.generativeai as genai
import base64, pathlib, os

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.0-flash-preview-image-generation",
    contents=YOUR_PROMPT,
    config={"response_modalities": ["IMAGE", "TEXT"]}
)

for part in response.candidates[0].content.parts:
    if part.inline_data:
        img_data = base64.b64decode(part.inline_data.data)
        pathlib.Path("public/images/FILENAME.jpg").write_bytes(img_data)
        print("saved public/images/FILENAME.jpg")
```

## Workflow
1. Understand what the image is for
2. Determine correct dimensions from the component
3. Write prompt using brand rules below
4. Generate
5. Quality check — if fails, regenerate
6. Save to public/images/[section]-[description].jpg
7. Use next/image with proper alt text

## Brand rules — every prompt

People:
- Diversity non-negotiable. African descent prominently represented across full image set.
- Mix of ages, genders, family structures
- Real moments — genuine emotion, not posed
- Never staring at camera holding a product

Environment:
- No location identifiers — no landmarks, flags, street signs, skylines
- Warm natural light — golden hour tones
- Premium interiors — clean, minimal, warm textures

Content:
- No text, watermarks, logos or UI elements in any image
- No printer equipment visible
- Print content: abstract, landscape or nature — never sharp identifiable faces

Style benchmark: Artifact Uprising · Mpix · Nations Photo Lab

## Quality checklist
- Feels premium (would Mpix use this?)
- Diversity represented
- No location identifiers
- Warm lighting
- No text or logos
- Correct dimensions
- Brand-safe
Fail any — regenerate.

## Naming
public/images/[section]-[description].jpg

## next/image — always
```tsx
<div className="relative h-64 w-full overflow-hidden rounded-xl">
  <Image src="/images/FILENAME.jpg" alt="description" fill className="object-cover" />
</div>
```
