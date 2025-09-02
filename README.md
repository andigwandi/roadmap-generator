# Roadmap Generator

This is a Roadmap Generator application that utilizes Gemini, a large language model from Google AI, to dynamically generate roadmaps based on a user-provided topic.

## Features

- Dynamic roadmap generation based on user input
- Interactive visualization using React Flow
- Real-time updates and responsive design
- Backed by Google's Gemini AI model

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start generating roadmaps by entering a topic in the input field on the home page.

## Project Structure

The `app/api` directory contains our API routes:
- `api/generate-roadmap`: Handles roadmap generation using Gemini AI
- `api/hello`: Example route handler

## Technical Stack

- Next.js 13 with TypeScript
- React Flow for roadmap visualization
- Convex for backend data management
- Tailwind CSS for styling
- Google Gemini AI API for content generation

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [React Flow Documentation](https://reactflow.dev/) - learn about React Flow
- [Convex Documentation](https://docs.convex.dev/) - learn about Convex
- [Google Gemini AI](https://deepmind.google/technologies/gemini/) - learn about Gemini AI

## Development

This project uses TypeScript for type safety and better developer experience. The application is structured using the Next.js 13 App Router pattern.

## Production Deployment

To deploy this application:

1. Build the production version:
```bash
npm run build
```

2. Start the production server:
```bash
npm run start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
