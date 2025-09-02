// app/components/RoadmapGenerator.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import ReactFlow, {
  Node,
  Edge,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import Header from "./header";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface RoadmapItem {
  id: string;
  type: "main" | "sub" | "skill";
  label: string;
  children?: RoadmapItem[];
}

interface RoadmapGeneratorProps {
  topic: string;
}

const RoadmapGenerator: React.FC<RoadmapGeneratorProps> = ({ topic }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const processRoadmapData = (
    data: RoadmapItem[],
    parentId: string | null = null,
    level = 0,
    parentY = 0
  ): { nodes: Node[]; edges: Edge[] } => {
    let nodes: Node[] = [];
    let edges: Edge[] = [];
    
    const levelWidth = 400; // Horizontal spacing between levels
    const nodeSpacing = 100; // Vertical spacing between sibling nodes
    const topMargin = 50;
    
    data.forEach((item, index) => {
      const nodeId = item.id;
      
      // Calculate x position based on level (moving right)
      const xPos = level * levelWidth + 50;
      
      // Calculate y position based on index within current level
      const yPos = index * nodeSpacing + topMargin;
      
      // Create node with enhanced styling
      const node: Node = {
        id: nodeId,
        position: { x: xPos, y: yPos },
        data: { label: item.label },
        style: {
          backgroundColor: getNodeColor(level, item.type),
          color: "white",
          border: "2px solid #333",
          borderRadius: "8px",
          padding: "12px",
          fontSize: getNodeFontSize(level),
          fontWeight: level === 0 ? "bold" : "normal",
          width: getNodeWidth(level),
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
        type: "default",
      };
      nodes.push(node);

      // Create edge from parent if it exists
      if (parentId) {
        edges.push({
          id: `e${parentId}-${nodeId}`,
          source: parentId,
          target: nodeId,
          type: ConnectionLineType.SmoothStep,
          style: {
            stroke: "#666",
            strokeWidth: 2,
          },
        });
      }

      // Process children recursively
      if (item.children && item.children.length > 0) {
        const { nodes: childNodes, edges: childEdges } = processRoadmapData(
          item.children,
          nodeId,
          level + 1,
          yPos
        );
        nodes = nodes.concat(childNodes);
        edges = edges.concat(childEdges);
      }
    });

    return { nodes, edges };
  };

  // Helper functions for node styling
  const getNodeColor = (level: number, type: string): string => {
    switch (type) {
      case "main":
        return "#ff6b6b";
      case "sub":
        return "#4dabf7";
      case "skill":
        return "#37b24d";
      default:
        return level === 0 ? "#ff6b6b" : "#4dabf7";
    }
  };

  const getNodeFontSize = (level: number): string => {
    switch (level) {
      case 0:
        return "18px";
      case 1:
        return "16px";
      default:
        return "14px";
    }
  };

  const getNodeWidth = (level: number): number => {
    switch (level) {
      case 0:
        return 200;
      case 1:
        return 180;
      default:
        return 160;
    }
  };

  const createRequestLog = useMutation(api.RoadMapRequest.addItem);

  useEffect(() => {

    // Create root node for the main topic
    const rootNode: Node = {
      id: "root",
      position: { x: 0, y: 0 },
      data: { label: topic },
      type: "input",
      style: { backgroundColor: "rgba(255, 0, 0, 0.2)" }
    };


    const fetchRoadmap = async () => {
      setLoading(true);
      setError(null);


      try {
        const response = await fetch("/api/generate-roadmap", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ topic }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate roadmap");
        }

        const responseText = await response.text();
        const data = JSON.parse(responseText);
        
        if (data.error) {
          throw new Error(data.error);
        }

        // Log the request to Convex only after validating the data
        await createRequestLog({
          topic: topic,
          apiResponse: responseText
        });
        
        console.log("API response data:", data);

        const { nodes: childNodes, edges: childEdges } = processRoadmapData(
          data.roadmap,
          "root", // Connect to root node
          0 // Initial level
        );
        // Combine root node with child nodes
        setNodes([rootNode, ...childNodes]);
        setEdges(childEdges);
      } catch (err) {
        setError(
          `An error occurred while generating the roadmap: ${err.message}`,
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [topic, setNodes, setEdges]);

  if (loading) {
    return <div className="text-center">Generating roadmap...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="relative" style={{ width: "100%", height: "800px" }}>
      <Link 
        href="/#" 
        className="absolute top-4 left-4 z-10 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
      >
        <span>←</span> Back to Home
      </Link>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        connectionLineType={ConnectionLineType.SmoothStep}
        className="react-flow-subflows-example"
        fitView
      ></ReactFlow>
    </div>
  );
};

export default RoadmapGenerator;
