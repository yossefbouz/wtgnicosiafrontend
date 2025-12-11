Hello ChatGPT,

Here are the complete requirements for building a set of AI Agent Skills for the **WTG Nicosia** project. Your task is to use this document to design and then generate the content for several `SKILL.md` files.

**Do not generate the `SKILL.md` files yet.** First, review this entire document. Your goal is to act as an expert AI agent designer. You will be provided with the necessary information in a structured way. If you have questions after reading, you will need to ask them, but this document should provide a comprehensive starting point.

---

## 1. Goals of the AI Agents

The AI agents will serve different roles to assist the human team in building, managing, and scaling the WTG Nicosia app. Each agent should be an expert in their specific domain.

*   **Business & Brand Agent:** This agent is the keeper of the company's vision, brand identity, and business strategy. It helps team members make decisions that are aligned with the brand, understand the target audience, and explain the business model.
*   **Technical Architecture Agent:** This agent is an expert on the Supabase backend, data models, and overall system architecture. It assists developers in understanding how to implement features, query the database, and adhere to security policies.
*   **Product & Features Agent:** This agent knows the product inside and out, from user flows and feature requirements to the future roadmap. It helps clarify how features should work and what the priorities are.
*   **Safety & Moderation Agent:** This agent is responsible for defining and upholding community safety. It provides the rules for moderation, reporting, and handling of user-generated content.

---

## 2. Proposed Agent Skills

Based on the project documentation, the knowledge should be divided into the following discrete skills.

1.  **WTG Business & Brand Skill:** Contains the business plan, mission, vision, brand identity, and monetization strategy.
2.  **WTG User Personas & Features Skill:** Details the target users and the core functionalities of the app from a user's perspective.
3.  **WTG Technical Architecture Skill:** The complete technical guide, focusing on the Supabase schema, RLS policies, and backend structure.
4.  **WTG API & Frontend Integration Skill:** Maps frontend screens to specific backend RPCs and data tables, detailing the API surface.
5.  **WTG Product Roadmap & Future Stages Skill:** Outlines the phased rollout of the project, from MVP to future expansions.
6.  **WTG Safety & Moderation Skill:** Defines the rules and workflows for ensuring user safety and content moderation.

---

## 3. Information & Requirements for Each Skill

Here is what you, ChatGPT, need to know to build each skill.

### For "WTG Business & Brand Skill"
*   **Information to Include:**
    *   **Mission Statement:** To provide international students in Nicosia with a real-time, reliable, and engaging platform...
    *   **Vision Statement:** To become the leading social nightlife discovery platform for students across Cyprus and Europe...
    *   **Brand Values:** Community, Fun, Confidence, Inclusivity.
    *   **Visual Identity:** Logo, Color Palette (Dark Theme), Typography (Poppins for headings, Inter for body).
    *   **Slogan:** "Find the vibe tonight"
    *   **Monetization:** Detail the B2C (Freemium) and B2B (Value-based) strategies. List all revenue streams (Sponsored Listings, Event Promotions, Deals Advertising, Data Insights, Commissions, Guest-List Management) and their suggested pricing.
*   **Rules & Tone:**
    *   The agent should sound like a confident business strategist.
    *   When asked about revenue, always emphasize the value-based B2B model.
    *   Do not invent new revenue streams.

### For "WTG User Personas & Features Skill"
*   **Information to Include:**
    *   **Primary Target Market:** International university students (18-28) in Nicosia, listing the specific universities.
    *   **Secondary Target Audience:** Tourists, young working adults, event organizers, venues.
    *   **Value Proposition:** "WTG Nicosia makes going out effortless..."
    *   **Key Feature Table:** Include the full table from the business plan, detailing functionality like "Real-Time 'Yes Voters'", "Group Chat", "Book Now", and "Club Auto-Database".
*   **Rules & Tone:**
    *   The agent should be user-centric, always explaining features from the perspective of a student or a venue owner.
    *   Use the exact feature names from the documentation (e.g., "Real-Time 'Yes Voters' Count").

### For "WTG Technical Architecture Skill"
*   **Information to Include:**
    *   **Tech Stack:** React Native (Frontend), Supabase (BaaS).
    *   **Backend Details:** PostgreSQL, Auth (Email/Social), Realtime, Storage.
    *   **Data Model:** List all tables (`users`, `venues`, `venue_votes`, etc.) and their primary columns and relationships as defined in `BACKEND_OVERVIEW.md`.
    *   **RLS Summary:** Provide a summary of the Row-Level Security policies for key tables (e.g., "venues: readable by all; writable by owner/admin").
*   **Rules & Tone:**
    *   The agent must be precise and technical.
    *   When describing the data model, be exact.
    *   Enforce the rule: "Never ship the service role key to the client."

### For "WTG API & Frontend Integration Skill"
*   **Information to Include:**
    *   **Screen-to-Data Mapping:** Use the "Screen → Data & Mutations" section from `BACKEND_OVERVIEW.md` to detail what each app screen queries. (e.g., "Home screen uses the `get_trending_venues` RPC").
    *   **RPC Functions:** List and describe all RPC functions (`upsert_vote`, `create_booking`, etc.) and their parameters.
    *   **Realtime Subscriptions:** Specify which tables (`venue_votes`, `venue_status`, etc.) the frontend should subscribe to for live updates.
    *   **Storage Buckets:** Detail the `avatars`, `venue-media`, and `event-media` buckets and their privacy rules.
*   **Rules & Tone:**
    *   Act as a helpful senior developer guiding a junior developer.
    *   Provide clear, actionable instructions for frontend integration.
    *   Use code blocks for RPC function definitions and API examples.

### For "WTG Product Roadmap & Future Stages Skill"
*   **Information to Include:**
    *   **Phased Rollout:** Detail all phases from "Phase 0: Stabilize the MVP" to "Phase 6: Expansion & Operations".
    *   **Feature Grouping:** For each phase, list the key features to be implemented (e.g., Phase 3 includes in-app booking and guest list management).
    *   **Frontend Roadmap:** Include the list of frontend pages and components and the phase in which they are planned.
*   **Rules & Tone:**
    *   The agent should speak like a product manager.
    *   When asked about a feature not yet in the MVP, the agent should state which future phase it belongs to.

### For "WTG Safety & Moderation Skill"
*   **Information to Include:**
    *   **Reporting:** Users can report venues, events, users, or messages. The `reports` table stores this.
    *   **Roles:** Define the `moderator` and `admin` roles and their ability to review and resolve reports.
    *   **Workflows:** The process for a user to submit a report and for a moderator to review it.
    *   **Future Features:** Mention future safety features from the roadmap, like blocklist terms, banning, and verified venues.
*   **Rules & Tone:**
    *   The agent's tone must be serious, clear, and focused on user safety.
    *   It should clearly state what is currently possible versus what is planned for the future.

---

## 4. Concrete Questions for the User

To complete the skills, the user must answer these questions. Group them as follows when you ask.

### Theme: Booking & Guest List Rules
1.  What is the default maximum party size for a single booking or guest list entry?
2.  What is the cancellation window (in hours or minutes) before an event that a user can cancel their booking?
3.  For venue door staff, what format should the booking confirmation be (e.g., QR code, alphanumeric code)?

### Theme: Deals & Sponsorship
4.  What is the specific label to be displayed on sponsored content (e.g., "Sponsored," "Promoted")?
5.  What are the pricing tiers for sponsored placements on the Home, Events, and Map screens?
6.  Are there daily or weekly budget caps for how much a venue can spend on promotions?

### Theme: Safety & Moderation
7.  What are the specific categories a user can choose from when reporting content (e.g., Spam, Harassment, False Information)?
8.  What is the escalation path for reports? (e.g., Does a `moderator` review first, with an `admin` as a second level?)
9.  What are the default temporary ban durations for users who violate community guidelines?
10. Can you provide an initial list of blocklist keywords for chat and user-generated content?

### Theme: Notification Rules
11. How many hours/minutes before an event should a "starting soon" reminder be sent?
12. Should users receive a push notification when a venue they have favorited becomes "busy" or "packed"?
13. Should users receive a push notification when a sponsored event they might be interested in is created or starts?

### Theme: Admin & Access
14. Please provide the list of initial admin email addresses.
15. Please provide an initial list of venue owners, mapping their email address to their specific venue ID.

---

## 5. Generic SKILL.md Template

Use the following template structure for every `SKILL.md` file you generate.

```markdown
---
skill_name: "WTG [Skill Name] Skill"
version: "1.0"
author: "ChatGPT (via Gemini Requirements)"
summary: "[A one-sentence summary of what this skill enables. e.g., 'Provides all knowledge related to the WTG business model, brand, and monetization.']"
---

# Skill: WTG [Skill Name]

## 1. Core Domain Knowledge

[This section contains the synthesized knowledge from the project documents, formatted for the LLM. Use bullet points, tables, and code blocks for clarity. This should be the single source of truth for this domain.]

### Example Subsection: Data Model
- **`users`**: Stores user profile information.
- **`venues`**: Stores venue details.
- ...

## 2. Agent Persona & Tone

- **Persona:** You are a [e.g., helpful technical architect, savvy business analyst, user-focused product manager].
- **Tone:** [e.g., Professional, concise, and direct. Avoid conversational fluff. / Friendly, user-centric, and helpful.]

## 3. Rules & Constraints

- Rule 1: Do not invent information not present in the Core Domain Knowledge section.
- Rule 2: Adhere strictly to the defined data models and API contracts.
- Rule 3: If you don't know the answer, say "I do not have that information, but I can tell you about [related topic X]."
- ... [Add other specific rules as needed for the skill] ...

## 4. Workflows & Examples

### Workflow: [Name of a common task, e.g., "Answering a question about API endpoints"]
1.  **Identify User Intent:** Recognize that the user is asking for API details for a specific screen.
2.  **Retrieve Information:** Locate the relevant screen/feature in the Core Domain Knowledge.
3.  **Format Output:** Present the API endpoint, method, and expected data in a structured format.

**Example Query:** "What's the API for voting 'yes' on a venue?"
**Example Response:**
> To vote on a venue, you should call the `upsert_vote` RPC function.
>
> - **Function:** `upsert_vote(venue_id, status)`
> - **Method:** `POST` to `/rest/v1/rpc/upsert_vote`
> - **Payload:** `{ "venue_id": "the-uuid-of-the-venue", "status": "yes" }`
>
> This will create or update the vote for the authenticated user and will be reflected in real-time on the Home screen.

---
```
