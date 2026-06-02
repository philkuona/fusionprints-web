# FusionPrints Gemini Imagery Skill

## Trigger
Use this skill whenever any page, section, or component needs an image.
Read fully before generating anything.

## API key
Set via environment variable only — never hardcoded:
GEMINI_API_KEY (read from os.environ)

## How to generate an image

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
        pathlib.Path("public/images/YOUR_FILENAME.jpg").write_bytes(img_data)
        print("saved public/images/YOUR_FILENAME.jpg")
```

## Workflow — always follow this order
1. Understand what the image is for (hero, card, section background, accent)
2. Determine the right dimensions for that use (do not guess — check the component)
3. Write a prompt using the brand rules below
4. Generate the image
5. Quality check against the checklist below
6. If it fails any check — regenerate with a refined prompt
7. Save to public/images/ with a descriptive filename (e.g. card-wall-art-16x20.jpg)
8. Reference in the component using next/image with proper alt text

## Brand rules — apply to every prompt

### People
- Diversity is non-negotiable. People of African descent must be prominently represented across all images as a set
- Mix of ages, genders, family structures
- No images that are exclusively white or Western-presenting
- Real moments — genuine emotion, not posed stock photography
- Never staring directly at camera holding a product

### Environment
- No location identifiers — no landmarks, flags, street signs, recognisable skylines
- Warm natural light — golden hour tones preferred
- Never cold, clinical, or studio-white lighting
- Premium interiors — clean, minimal, warm textures

### Image content
- No text, watermarks, logos, or UI elements in any image
- No printer equipment, cameras, or production machinery visible
- No FusionPrints branding inside the image itself
- Print content (when prints appear) should be abstract, landscape, or nature — never sharp faces

### Style benchmark
Artifact Uprising · Chatbooks · Mpix · Nations Photo Lab
Premium lifestyle photography. Intentional, quiet, warm.
The kind of image that makes you feel something before you read a word.

## Quality checklist — must pass before saving
- [ ] Feels premium (benchmark: would Mpix use this?)
- [ ] Diversity represented (African descent prominent)
- [ ] No location identifiers
- [ ] Lighting is warm
- [ ] No text or logos in image
- [ ] Correct dimensions for its use case
- [ ] Would not embarrass the brand if published

## Naming convention
public/images/[section]-[description]-[variant].jpg
Examples:
  public/images/hero-background.jpg
  public/images/card-prints-4x6.jpg
  public/images/card-wall-art-16x20.jpg
  public/images/section-promise-lifestyle.jpg
  public/images/about-team-warmth.jpg

## next/image usage
Always use next/image — never raw img tags:
```tsx
import Image from "next/image";

<Image
  src="/images/card-prints-4x6.jpg"
  alt="Hands holding a printed family photo"
  width={800}
  height={600}
  className="object-cover"
/>
```

For fill mode (card backgrounds):
```tsx
<div className="relative h-64 w-full overflow-hidden rounded-xl">
  <Image
    src="/images/card-wall-art-16x20.jpg"
    alt="Large framed print on a warm interior wall"
    fill
    className="object-cover"
  />
</div>
```
