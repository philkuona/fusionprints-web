# FusionPrints Gemini Imagery Skill

## Trigger
Use this skill for every image needed anywhere on the FusionPrints website — homepage, product pages, about, how it works, future pages, everything. Gemini is the sole image source for this project.

## API key
Environment variable only — never hardcode:
import os; key = os.environ["GEMINI_API_KEY"]

## How to generate

```python
import google.generativeai as genai
import base64, pathlib, os

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
client = genai.Client()

response = client.models.generate_content(
    model="gemini-3-pro-image",
    contents=YOUR_PROMPT,
    config={"response_modalities": ["IMAGE", "TEXT"]}
)

for part in response.candidates[0].content.parts:
    if part.inline_data:
        img_data = base64.b64decode(part.inline_data.data)
        pathlib.Path("public/images/FILENAME.jpg").write_bytes(img_data)
        print("saved public/images/FILENAME.jpg")
```

## MASTER IMAGE PROMPT

Use this as the base for every image generated for FusionPrints. Append specific scene details for each image slot.

---

Generate a premium lifestyle photograph for a photo printing service website.

DIVERSITY — this is the most important rule. FusionPrints serves a Zimbabwean market, so imagery must reflect Zimbabwe's population — NOT a generic global rotation. Every image set must reflect genuine human diversity across ALL of these dimensions:

Race and ethnicity: Black African people are the majority and clearly dominate. Across a SET of images, also include — naturally and only occasionally — white, Indian, and Asian Zimbabweans, and (RARELY — at most once across a large set, and not in every set) a Black African person with albinism, shown with dignity and never as a focal statement. Do not default to a worldwide spread (Latin American, Middle Eastern, Caribbean, etc.) — keep it true to Zimbabwe.

CRITICAL — balance representation ACROSS the set, never within every frame. Each individual image is ONE authentic, spontaneous moment: usually a single person, couple, or family of ONE ethnicity, the way a real gathering actually looks. Do NOT try to fit several ethnicities — or a person with albinism — into every picture. Forcing representation into each frame reads as pushing an agenda and looks staged; let it emerge naturally and unevenly across the whole set, like real life. When generating a SINGLE image, commit to one believable scene for that slot and let the broader set carry the diversity.

Life occasions: FusionPrints serves every meaningful moment in life. Images across the site must cover: weddings, graduations, birthdays, newborn and baby moments, confirmations, baptisms, anniversaries, family reunions, everyday family life, couples, solo portraits, friendships, travel memories, and pet moments.

Age: spread across babies and toddlers, children, teenagers, young adults (20s), adults (30s–40s), middle-aged (50s), and older adults (60s+). Never default to young adults only.

Gender: natural mix of men, women, and mixed-gender groups. Avoid defaulting to women only.

Setting: vary across living rooms, bedrooms, kitchens, gardens, outdoor spaces, minimal studio-feel interiors, workspaces, celebration venues, and places of worship. Never repeat the same setting twice in a set.

Subject type: rotate across — hands only (close-up), solo person, couple, family group, flat lay of prints, prints displayed on a wall, prints being gifted.

BEFORE generating any set of images, plan the full matrix: write out each slot with its assigned occasion · race · age · gender · setting · subject type. Assign ONE ethnicity per slot (most slots Black African; spread the minority ethnicities thinly across different slots; albinism at most once, and only if the set is large). Confirm no two slots share more than two attributes. Then generate each slot as a single natural scene — do not re-introduce "include all ethnicities / albinism" into an individual image's prompt.

NEVER do this:
- All images showing only hands
- All images featuring the same racial group
- All images in the same setting or room
- All images of the same life occasion
- All close-ups with no environmental context
- All images featuring the same age group
- Forcing a person with albinism — or several ethnicities — into every (or most) images; representation is balanced across the set, never per-frame, or it reads as pushing an agenda
- Images that feel like generic stock photography

STYLE — every image must feel:
- Premium and editorial. Benchmark: Artifact Uprising, Mpix, Nations Photo Lab.
- Warm and human. Golden hour or warm interior light. Never cold, clinical, or studio-white.
- Candid, not posed. Real emotion — joy, tenderness, nostalgia, pride, love.
- Intentional. The kind of image that makes you feel something before you read a word.

TECHNICAL rules:
- No location identifiers — no landmarks, flags, street signs, recognisable skylines, or anything that places the scene in a specific country or city
- No text, watermarks, logos, or UI elements inside any image
- No printer equipment, cameras, or production machinery visible
- Print content when visible: abstract, landscape, or nature — never sharp identifiable faces on the prints themselves
- Clothing: casual-smart, warm tones, not branded

QUALITY CHECK before saving — every image must pass:
- Feels premium (would Mpix publish this?)
- Visually distinct from every other image in the set (different race, occasion, age, setting, subject type)
- No location identifiers
- Lighting is warm
- No text or logos inside the image
- Correct dimensions for its intended use
- Would not embarrass the FusionPrints brand if published
Fail any check — regenerate with a more specific prompt.

---

## Workflow for every image
1. Identify what the image is for and what dimensions the component needs
2. Plan the full set matrix before generating (occasion · race · age · gender · setting · subject type)
3. Append specific scene details to the master prompt above
4. Generate
5. Quality check — regenerate if anything fails
6. Save to public/images/[section]-[description].jpg
7. Use next/image in the component — never raw img tags

## Naming
public/images/[section]-[description].jpg
Examples: card-prints-4x6.jpg, card-wall-16x20.jpg, card-finish-guide.jpg, about-lifestyle.jpg, howitworks-upload.jpg

## next/image usage
```tsx
<div className="relative h-64 w-full overflow-hidden rounded-xl">
  <Image
    src="/images/card-prints-4x6.jpg"
    alt="A young couple laughing while looking at printed photos spread on a table"
    fill
    className="object-cover"
  />
</div>
```
Alt text must describe the actual scene — never generic placeholder text.
