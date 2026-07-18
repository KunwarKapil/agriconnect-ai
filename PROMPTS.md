# Prompt Engineering Iterations - AI Farm Advisor

This document describes the prompt engineering process followed during the implementation of the Google Gemini AI Farm Advisor. It showcases three different prompt versions, sample inputs/outputs, and analyzes the performance of each.

---

## Prompt Versions

### Prompt Version 1 (Minimal)
> **Goal:** Create a simple prompt that just drops the variables into a query string.
```
You are an agricultural advisor. Please look at this issue:
Crop: {crop}
Problem: {problem}
Soil: {soil}
Temp: {temperature}
Humidity: {humidity}
Notes: {notes}
Tell me what to do.
```
- **Performance Evaluation:** Very basic response. Often generated verbose explanations with conversational fillers, occasionally failed to cover fertilizer suggestions, and structure was inconsistent across calls.

---

### Prompt Version 2 (Moderately Structured)
> **Goal:** Add simple instructions on sections and tone.
```
You are an experienced agricultural scientist.
A farmer provides these details:
Crop: {crop}
Problem: {problem}
Temperature: {temperature}
Humidity: {humidity}
Soil Type: {soil}
Additional Notes: {notes}

Analyze the issue and explain the cause, treatment, fertilizer suggestions, irrigation advice, and prevention. Keep the response simple and suitable for farmers.
```
- **Performance Evaluation:** Much better structure, but sometimes missed the disclaimer, and the length varied significantly (often exceeding 400 words or being too short). The formatting was inconsistent (sometimes using bullet points, other times long paragraphs).

---

### Prompt Version 3 (Highly Structured - Best Performer)
> **Goal:** Precise role adoption, strict structural format, and word count constraints.
```
You are an experienced agricultural scientist and expert helping farmers solve their crop cultivation challenges.

Here are the details provided by the farmer:
- Crop Name: {crop}
- Problem Observed: {problem}
- Soil Type: {soil}
- Temperature: {temperature}°C
- Humidity: {humidity}%
- Additional Notes: {notes}

Please analyze this issue and generate a structured response containing these exact sections:
1. Problem Analysis: A clear analysis of what is happening with the crop.
2. Possible Causes: Explain the most likely underlying causes (e.g., pests, disease, nutrient deficiencies, or environmental factors).
3. Recommended Actions: Detailed step-by-step treatment or immediate actions.
4. Fertilizer Suggestions: Recommendations for specific fertilizers, organic options, or nutrients.
5. Prevention Tips: Strategies, irrigation advice, or crop care methods to prevent future recurrence.
6. Disclaimer: A standard brief agricultural disclaimer that advice is for informational purposes.

Tone: Professional, supportive, clear, and easy for farmers to understand.
Constraints: Respond in clean Markdown. Keep the total word count strictly between 200 and 300 words. Do not include unnecessary conversational filler.
```
- **Performance Evaluation:** Outstanding performance. Consistent structure, strict adherence to the word count constraint (200-300 words), zero conversational filler, clear headings suitable for custom UI parsing, and provides high-value professional agronomic tips.

---

## Example Input & Output (Prompt Version 3)

### Input
- **Crop Name:** Wheat
- **Problem Observed:** Leaves turning yellow
- **Soil Type:** Clay Loam
- **Temperature:** 34°C
- **Humidity:** 58%
- **Additional Notes:** Started after heavy rainfall.

### Output
```markdown
## Problem Analysis
The wheat crop is exhibiting chlorosis (yellowing of leaves). Following heavy rainfall combined with high temperatures (34°C) and moderate humidity, the roots are likely experiencing oxygen deprivation due to waterlogging, disrupting normal nutrient uptake.

## Possible Causes
1. **Waterlogging/Anoxia:** Oversaturated soil blocks oxygen access to the roots.
2. **Nitrogen Leaching:** Heavy rain washes mobile nitrogen down below the root zone.
3. **Fungal Root Rot:** Warm, wet conditions favor soil-borne pathogens like *Pythium* or *Fusarium*.

## Recommended Actions
1. **Improve Drainage:** Immediately clear field channels or dig trenches to drain standing water.
2. **Soil Aeration:** Gently break the soil crust once surface moisture recedes to encourage aeration.
3. **Foliar Spray:** Apply a quick-acting nitrogen foliar spray (such as 1-2% Urea solution) to restore leaf color without overloading saturated roots.

## Fertilizer Suggestions
Apply Urea or Ammonium Nitrate once the soil has dried sufficiently. Organic options include spraying diluted liquid compost tea or seaweed extract to supply trace micronutrients and build root resilience.

## Prevention Tips
- Ensure proper field leveling and install efficient drainage systems before the planting season.
- Avoid excessive nitrogen fertilization before predicted heavy rains.
- Adopt crop rotation and maintain organic matter content to improve soil structure and permeability.

## Disclaimer
This advice is for informational purposes. Consult a local agricultural extension office or soil laboratory for onsite confirmation.
```

---

## Conclusion: Best Performing Prompt

**Prompt Version 3** performed best because:
1. **Explicit Persona:** Setting the role as an *"experienced agricultural scientist and expert"* forced a professional, focused tone.
2. **Explicit Sections:** Specifying the 6 exact headings prevented Gemini from omitting key details (like fertilizers or disclaimers).
3. **Word Count Constraints:** Enforcing the 200-300 word limit ensured that responses were concise and easily readable on mobile or web dashboards without overwhelming the farmer.
4. **Clean Markdown Constraint:** Prevented conversational filler ("Hello!", "Hope this helps!") and allowed seamless rendering using the frontend's custom Markdown component.
