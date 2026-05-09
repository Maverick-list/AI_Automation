"use client";

import { useState, useCallback } from "react";
import { 
  ReactFlow, 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  addEdge, 
  Handle, 
  Position 
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Play, Zap, FileText, Mail } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";

// ── Custom Node Components ──────────────────────────────────────

const TriggerNode = ({ data }: { data: any }) => (
  <div className="bg-zinc-950 border-2 border-indigo-500 rounded-xl shadow-xl w-[250px] overflow-hidden">
    <div className="bg-indigo-500/20 p-3 flex items-center gap-2 border-b border-indigo-500/30">
      <Zap className="h-4 w-4 text-indigo-400" />
      <span className="font-semibold text-white text-sm">Trigger</span>
    </div>
    <div className="p-4">
      <p className="text-sm text-zinc-300">{data.label}</p>
      <p className="text-xs text-zinc-500 mt-1">{data.sublabel}</p>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-indigo-500 border-none" />
  </div>
);

const ActionNode = ({ data }: { data: any }) => (
  <div className="bg-zinc-950 border border-white/20 rounded-xl shadow-xl w-[250px] overflow-hidden">
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-zinc-500 border-none" />
    <div className="bg-white/5 p-3 flex items-center gap-2 border-b border-white/10">
      {data.icon || <div className="h-4 w-4 rounded-sm bg-zinc-700" />}
      <span className="font-semibold text-white text-sm">Action</span>
    </div>
    <div className="p-4">
      <p className="text-sm text-zinc-300">{data.label}</p>
      <p className="text-xs text-zinc-500 mt-1">{data.sublabel}</p>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-zinc-500 border-none" />
  </div>
);

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
};

// ── Default Graph Data ──────────────────────────────────────────

const initialNodes = [
  {
    id: "1",
    type: "trigger",
    position: { x: 250, y: 50 },
    data: { label: "When New Email Arrives", sublabel: "Gmail: Query 'subject:invoice'" },
  },
  {
    id: "2",
    type: "action",
    position: { x: 250, y: 250 },
    data: { 
      label: "Ask OpenClaw AI", 
      sublabel: "Extract invoice amount and due date",
      icon: <div className="h-4 w-4 rounded-sm bg-indigo-500" />
    },
  },
  {
    id: "3",
    type: "action",
    position: { x: 250, y: 450 },
    data: { 
      label: "Update Google Sheets", 
      sublabel: "Append row to Finance Tracker",
      icon: <FileText className="h-4 w-4 text-emerald-400" />
    },
  },
];

const initialEdges = [
  { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
  { id: "e2-3", source: "2", target: "3", animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
];

// ── Main Page Component ─────────────────────────────────────────

export default function VisualBuilderPage({ params }: { params: { id: string } }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }, eds)), [setEdges]);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Toolbar */}
      <div className="flex items-center justify-between mb-4 bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/automations">
            <Button variant="ghost" size="icon" className="hover:bg-white/10 text-zinc-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="h-6 w-px bg-white/10" />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-white">Auto Reply to Invoices</h1>
              <StatusBadge status="ACTIVE" />
            </div>
            <p className="text-xs text-zinc-500">Last saved: 2 mins ago</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
            <Play className="mr-2 h-4 w-4" /> Test Workflow
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>
      </div>

      {/* Visual Canvas Area */}
      <div className="flex-1 rounded-xl border border-white/10 overflow-hidden relative bg-zinc-950">
        
        {/* Sidebar panel for components */}
        <div className="absolute top-4 left-4 z-10 w-64 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl">
          <h3 className="text-sm font-semibold text-white mb-4">Add Node</h3>
          
          <div className="space-y-2">
            <div className="p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 cursor-grab transition-colors flex items-center gap-3">
              <Mail className="h-4 w-4 text-amber-400" />
              <span className="text-sm text-zinc-300">Send Email</span>
            </div>
            <div className="p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 cursor-grab transition-colors flex items-center gap-3">
              <FileText className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-zinc-300">Update Sheet</span>
            </div>
            <div className="p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 cursor-grab transition-colors flex items-center gap-3">
              <div className="h-4 w-4 rounded-sm bg-indigo-500" />
              <span className="text-sm text-zinc-300">Ask OpenClaw AI</span>
            </div>
          </div>
        </div>

        {/* React Flow Canvas */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-zinc-950"
          minZoom={0.2}
        >
          <Background color="#ffffff" gap={16} size={1} opacity={0.05} />
          <Controls className="bg-black/50 border-white/10 fill-white" />
          <MiniMap 
            nodeColor={(n) => {
              if (n.type === 'trigger') return '#6366f1';
              return '#3f3f46';
            }}
            maskColor="rgba(0, 0, 0, 0.8)"
            className="bg-zinc-950 border-white/10 rounded-lg overflow-hidden"
          />
        </ReactFlow>
      </div>

    </div>
  );
}
