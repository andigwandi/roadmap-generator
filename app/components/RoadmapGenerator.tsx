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
    xOffset = 0,
    yOffset = 0,
    parentYOffset = 0 // New variable to track parent's y-offset
  ): { nodes: Node[]; edges: Edge[] } => {
    let nodes: Node[] = [];
    let edges: Edge[] = [];
    let childYOffset = yOffset;

    data.forEach((item, index) => {
      const nodeId = item.id;
      const node: Node = {
        id: nodeId,
        position: { x: xOffset, y: childYOffset },
        data: { label: item.label },
        style: {
          backgroundColor: "rgba(255, 0, 0, 0.2)",
        },
        type: item.type === "main" ? "input" : "default",
      };
      nodes.push(node);

      // Maintain parent's y-offset for child positioning
      childYOffset = Math.max(childYOffset, parentYOffset);

      if (parentId) {
        edges.push({
          id: `e${parentId}-${nodeId}`,
          source: parentId,
          target: nodeId,
          type: ConnectionLineType.SmoothStep,
        });
      }

      if (item.children) {
        const childResults = processRoadmapData(
          item.children,
          nodeId,
          xOffset + 300,
          yOffset, // Use original yOffset for children
          childYOffset // Use childYOffset for child positioning
        );
        nodes = nodes.concat(childResults.nodes);
        edges = edges.concat(childResults.edges);
        childYOffset += childResults.nodes.length * 100; // Update childYOffset for next siblings
      } else {
        // Update parentYOffset only if there are no children (leaf node)
        parentYOffset = childYOffset;
      }
    });

    return { nodes, edges };
  };

  useEffect(() => {
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

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        const { nodes: newNodes, edges: newEdges } = processRoadmapData(
          data.roadmap,
        );
        setNodes(newNodes);
        setEdges(newEdges);
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
    <div style={{ width: "100%", height: "800px" }}>
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
