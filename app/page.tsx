// app/page.tsx
'use client'

import { useState } from 'react'
import RoadmapGenerator from './components/RoadmapGenerator'
import Header from './components/header'

export default function Home() {
  const [topic, setTopic] = useState('')
  const [showRoadmap, setShowRoadmap] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowRoadmap(true)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Roadmap Generator</h1>
      {!showRoadmap ? (
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a skill or topic"
            className="w-full px-4 py-2 text-gray-700 bg-white border rounded-md focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40"
            required
          />
          <button
            type="submit"
            className="mt-4 px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
          >
            Generate Roadmap
          </button>
        </form>
      ) : (
        <RoadmapGenerator topic={topic} />
      )}
    </main>
  )
}