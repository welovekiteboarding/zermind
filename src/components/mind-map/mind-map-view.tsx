"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Background,
  Controls,
  MiniMap,
  Panel,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConversationNode, ConversationNodeData } from "./mind-map-node";
import { Brain, GitBranch, Plus } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  parentId?: string;
  branchName?: string;
  xPosition?: number;
  yPosition?: number;
}

interface MindMapViewProps {
  messages: Message[];
  onResumeConversation: (nodeId: string) => void;
  onCreateBranch: (parentNodeId: string) => void;
}

// Define custom node types
const nodeTypes = {
  conversationNode: ConversationNode,
};

export function MindMapView({
  messages,
  onResumeConversation,
  onCreateBranch,
}: MindMapViewProps) {
  // Convert messages to React Flow nodes
  const nodes: Node<ConversationNodeData>[] = useMemo(() => {
    return messages.map((message, index) => ({
      id: message.id,
      type: "conversationNode",
      position: {
        x: message.xPosition || (index % 3) * 400,
        y: message.yPosition || Math.floor(index / 3) * 250,
      },
      data: {
        id: message.id,
        role: message.role,
        content: message.content,
        model: message.model,
        branchName: message.branchName,
        nodeType: "conversation",
        onResumeConversation,
        onCreateBranch,
      },
    }));
  }, [messages, onResumeConversation, onCreateBranch]);

  // Convert parent-child relationships to React Flow edges
  const edges: Edge[] = useMemo(() => {
    return messages
      .filter((message) => message.parentId)
      .map((message) => ({
        id: `${message.parentId}-${message.id}`,
        source: message.parentId!,
        target: message.id,
        type: "smoothstep",
        animated: true,
        style: { stroke: "#8b5cf6", strokeWidth: 2 },
      }));
  }, [messages]);

  const [reactFlowNodes, setNodes, onNodesChange] = useNodesState(nodes);
  const [reactFlowEdges, setEdges, onEdgesChange] = useEdgesState(edges);

  // Update nodes when messages change - preserve user-dragged positions
  React.useEffect(() => {
    const currentNodeIds = new Set(reactFlowNodes.map(node => node.id));
    const newNodeIds = new Set(nodes.map(node => node.id));
    
    // Check if there are actual changes (additions or removals)
    const hasChanges = 
      currentNodeIds.size !== newNodeIds.size ||
      [...currentNodeIds].some(id => !newNodeIds.has(id)) ||
      [...newNodeIds].some(id => !currentNodeIds.has(id));
    
    if (hasChanges) {
      // Merge new nodes with existing positions to preserve user-dragged positions
      const updatedNodes = nodes.map(newNode => {
        const existingNode = reactFlowNodes.find(n => n.id === newNode.id);
        return existingNode 
          ? { ...newNode, position: existingNode.position }
          : newNode;
      });
      setNodes(updatedNodes);
    }
  }, [nodes, reactFlowNodes, setNodes]);

  // Update edges when messages change - only update if there are actual changes
  React.useEffect(() => {
    const currentEdgeIds = new Set(reactFlowEdges.map(edge => edge.id));
    const newEdgeIds = new Set(edges.map(edge => edge.id));
    
    // Check if there are actual changes (additions or removals)
    const hasChanges = 
      currentEdgeIds.size !== newEdgeIds.size ||
      [...currentEdgeIds].some(id => !newEdgeIds.has(id)) ||
      [...newEdgeIds].some(id => !currentEdgeIds.has(id));
    
    if (hasChanges) {
      setEdges(edges);
    }
  }, [edges, reactFlowEdges, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const totalNodes = messages.length;
  const userNodes = messages.filter((m) => m.role === "user").length;
  const assistantNodes = messages.filter((m) => m.role === "assistant").length;

  return (
    <div className="w-full h-full bg-background">
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 100 }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        minZoom={0.2}
        maxZoom={2}
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap nodeColor="#8b5cf6" nodeStrokeWidth={3} pannable zoomable />

        {/* Info Panel */}
        <Panel
          position="top-left"
          className="bg-background/80 backdrop-blur-sm rounded-lg border p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold">Mind Map View</h3>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="text-xs">
              {totalNodes} nodes
            </Badge>
            <Badge variant="outline" className="text-xs">
              {userNodes} user
            </Badge>
            <Badge variant="outline" className="text-xs">
              {assistantNodes} AI
            </Badge>
          </div>

          {selectedNodeId && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Selected: {selectedNodeId}
              </p>
            </div>
          )}
        </Panel>

        {/* Action Panel */}
        <Panel
          position="top-right"
          className="bg-background/80 backdrop-blur-sm rounded-lg border p-4"
        >
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => selectedNodeId && onCreateBranch(selectedNodeId)}
              disabled={!selectedNodeId}
              className="w-full"
            >
              <GitBranch className="h-4 w-4 mr-2" />
              Create Branch
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                selectedNodeId && onResumeConversation(selectedNodeId)
              }
              disabled={!selectedNodeId}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Continue Chat
            </Button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
