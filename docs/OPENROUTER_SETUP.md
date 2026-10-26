# OpenRouter AI Planning Provider Setup Guide

Creator Studio uses OpenRouter as its default AI provider for transforming creative prompts into structured scripts, scene breakdowns, kinetic captions, and motion-graphics specifications.

---

## 1. Create an OpenRouter Account

1. Visit [https://openrouter.ai/](https://openrouter.ai/) and click **Sign In** (supports Google or GitHub authentication).
2. Navigate to **Keys**: [https://openrouter.ai/keys](https://openrouter.ai/keys).
3. Click **Create Key**.
4. Name: `Creator Studio Client`.
5. Credit Limit: Leave blank or set a safety cap.
6. Copy the key (starts with `sk-or-v1-...`).

---

## 2. Recommended Free-Tier Models (Zero Cost)

Creator Studio supports free-tier models that incur **\$0.00** charges:
- `google/gemini-2.0-flash-exp:free` (Default: exceptional speed and structured JSON capabilities)
- `meta-llama/llama-3.3-70b-instruct:free` (Superb narrative depth and creative scriptwriting)
- `deepseek/deepseek-r1:free` (Deep reasoning & structured scene planning)
- `qwen/qwen-2.5-coder-32b-instruct:free` (Precise code generation)

---

## 3. Cost Safeguard: "Free-Only Mode"

In the Creator Studio **Settings Modal > OpenRouter AI**:
- Toggle **Enforce Free-Only Mode**: When turned **ON**, Creator Studio will automatically reject calls to paid models (e.g. `anthropic/claude-3.5-sonnet`, `openai/gpt-4o`) to ensure zero unexpected credit deductions.
- If no API key is provided, Creator Studio seamlessly runs in **Offline Template Mode** with rich deterministic storyboards (Diwali, SaaS, Compounding Interest, Corporate).
