# AI Token Visualizer

A local-first Next.js app for exploring how text is split into tokens by popular OpenAI-compatible encodings. It runs entirely in the browser, shows exact token IDs and byte boundaries, and helps you inspect Unicode edge cases without sending text to a remote API.

## Overview

This project is a browser-based tokenization playground that lets you:

- paste or type text and inspect token breakdowns in real time
- switch between supported OpenAI-style tokenizer models
- view token text, token IDs, byte offsets, and Unicode-aware boundaries
- search within token output
- export token data as JSON or CSV
- work entirely locally with no API key required

## Features

- Local tokenizer execution in a Web Worker
- OpenAI-compatible model selection for supported encodings
- Token inspector with byte offsets and partial UTF-8 handling
- Search and filtering across token output
- Export to JSON and CSV
- Responsive UI with a polished glassmorphism-inspired design
- No backend or external tokenization service required

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Vitest
- js-tiktoken for local tokenizer compatibility

## Requirements

- Node.js 20.9+ recommended
- npm

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Start the app in development mode:

```bash
npm run dev
```

3. Open the app in your browser:

```text
http://localhost:3000
```

## Production Build

```bash
npm run build
npm run start
```

## Available Scripts

```bash
npm run dev      # start the Next.js development server
npm run build    # create a production build
npm run start    # run the production build locally
npm run test     # run the test suite
npm run typecheck # run TypeScript type checks
```

## Supported Tokenizer Models

The app includes locally supported OpenAI-style tokenizers, including:

- GPT-5
- GPT-4.1
- GPT-4o
- o1
- o3
- o4-mini
- GPT-4 / GPT-3.5 compatible encoding set

This project intentionally does not claim support for every model family or vendor. It only exposes verified local tokenizer mappings and avoids fabricating counts for unsupported encodings.

## Project Structure

```text
.
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── token-inspector.tsx
│   │   ├── token-visualizer.tsx
│   │   ├── token-workbench.tsx
│   │   └── ui/
│   ├── hooks/
│   │   └── use-tokenizer.ts
│   ├── lib/
│   │   ├── export.ts
│   │   ├── tokenizers/
│   │   └── utils.ts
│   └── tests/
│       ├── setup.ts
│       ├── tokenizer.test.ts
│       ├── use-tokenizer.test.tsx
│       └── workbench.test.tsx
├── public/
├── components.json
├── next.config.ts
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── README.md
└── postcss.config.mjs
```

## Notes

- The app is designed for local experimentation and educational use.
- It does not require an LLM API key or paid service.
- Tokenization is done client-side and respects the current browser environment.
- Unicode and byte-level token splitting are surfaced in the inspector to help explain edge cases such as partial UTF-8 sequences.

## License

This project is for local development and educational experimentation. Please check the repository or package metadata for any licensing details on included libraries and assets.

## References

- OpenAI tiktoken: https://github.com/openai/tiktoken
- js-tiktoken: https://github.com/dqbd/tiktoken/tree/main/js
- Next.js: https://nextjs.org/
- Tailwind CSS: https://tailwindcss.com/
