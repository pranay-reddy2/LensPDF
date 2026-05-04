# LensPDF Technical Architecture & Decisions

## 1. High-Level Architecture
LensPDF is built as a highly-responsive Single Page Application (SPA) leveraging **React 18+**, **Vite**, and **Tailwind CSS 4**. The core intelligence layer is powered by the **Gemini 1.5 Flash** model, specifically chosen for its native multimodal capabilities.

### Key Components:
- **UI Layer**: React-based functional components with `framer-motion` for transitions.
- **Analysis Engine**: Uses the `@google/genai` SDK to process PDF buffers directly.
- **PDF Rendering**: `pdfjs-dist` handles client-side rendering of the document buffer for visual verification.

---

## 2. Technical Decisions

### Native PDF Processing vs. Traditional RAG
- **Decision**: Unlike traditional RAG (which chunks text and searches a vector DB), LensPDF passes the **entire PDF buffer** as a multimodal part to Gemini 1.5 Flash.
- **Why**: Gemini's 1-million+ token context window allows it to "see" the entire document natively (including tables, layout, and cross-references). This results in significantly higher accuracy and better grounding compared to text-only retrieval from a broken-up document.

### Strict Grounding Reinforcement
- **Decision**: Implementation of a "Strict Mode" system instruction and a low temperature (0.1).
- **Why**: PDF-constrained agents must prioritize truth over creativity. Low temperature reduces variance, while the system prompt explicitly forbids using external knowledge.

### Sleek/Minimal Aesthetic
- **Decision**: A dark-themed "Sleek Interface" with high contrast and mono-spaced accents.
- **Why**: The design reinforces a "Technical/Medical/Legal" utility vibe, aiming for perceived reliability.

---

## 3. Trade-offs & Limitations

### Token Consumption
- **Trade-off**: Native PDF injection is more token-intensive than RAG for repeated queries on very large files (e.g., 500+ page documents).
- **Reasoning**: For the standard documents (1-50 pages) expected in this use case, the accuracy gain of native processing outweighs the marginal token cost.

### Client-Side Execution
- **Trade-off**: All processing (including PDF rendering and binary-to-base64 conversion) happens in the browser. 
- **Reasoning**: This provides instant feedback and reduces server load, though it relies on the user's local hardware for the initial PDF parsing.

### First-Page Preview
- **Trade-off**: The PDF previewer only renders the first page.
- **Reasoning**: To maintain performance and "Sleek" UI constraints. The agent analyzes the *entire* document regardless of what is shown in the preview window.
