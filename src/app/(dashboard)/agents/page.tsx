"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Sparkles,
  RefreshCw,
  Play,
  CheckCircle2,
  Clock,
  Send,
  Warehouse,
  DollarSign,
  FileText,
  Truck,
  TrendingUp,
  Cpu,
  Check,
  X,
  Copy,
  Zap,
  Activity,
  Layers,
  ArrowRight,
  Megaphone,
  Share2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  AgentProfile,
  AgentAction,
  AgentLogEntry,
  AgentRunResult,
  AgentId,
} from "@/services/ai/agents/types";

const AGENT_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Cpu,
  Warehouse,
  DollarSign,
  FileText,
  Truck,
  TrendingUp,
  Megaphone,
  Share2,
  Bot,
};

export default function AgentsPage() {
  const [activeTab, setActiveTab] = useState<"fleet" | "approvals" | "copilot" | "logs">("fleet");
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [pendingActions, setPendingActions] = useState<AgentAction[]>([]);
  const [logs, setLogs] = useState<AgentLogEntry[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentProfile | null>(null);
  const [agentResult, setAgentResult] = useState<AgentRunResult | null>(null);
  const [runningAgentId, setRunningAgentId] = useState<string | null>(null);
  const [customAgentPrompt, setCustomAgentPrompt] = useState("");
  const [copied, setCopied] = useState(false);

  // Chat Co-pilot state
  const [chatMessages, setChatMessages] = useState<
    { id: string; sender: "user" | "copilot"; text: string; source?: string }[]
  >([
    {
      id: "msg-welcome",
      sender: "copilot",
      text: "Hello. I am the **KDOS Master Orchestrator** for NEXUS. I continuously monitor stock levels, pricing elasticity, SARS accounts receivable, logistics transfers, and contractor sales deals across your business. How can I assist your operations today?",
      source: "KDOS Master Orchestration Engine",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/v1/agents")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success) {
          setAgents(data.agents || []);
          setPendingActions(data.pendingActions || []);
          setLogs(data.recentLogs || []);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const loadFleetData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/agents");
      const data = await res.json();
      if (data.success) {
        setAgents(data.agents || []);
        setPendingActions(data.pendingActions || []);
        setLogs(data.recentLogs || []);
      }
    } catch {
      // Ignore network errors
    } finally {
      setLoading(false);
    }
  };

  // Run specific agent
  const handleRunAgent = async (agent: AgentProfile, customPrompt?: string) => {
    setRunningAgentId(agent.id);
    setSelectedAgent(agent);
    setAgentResult(null);

    try {
      const res = await fetch(`/api/v1/agents/${agent.id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: customPrompt || customAgentPrompt }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setAgentResult(data.result);
        loadFleetData();
      }
    } catch {
      // Error handling
    } finally {
      setRunningAgentId(null);
    }
  };

  // Run Master Orchestrator Full Sweep
  const handleRunFullSweep = async () => {
    const orch = agents.find((a) => a.id === "orchestrator") || {
      id: "orchestrator" as AgentId,
      name: "KDOS Master Orchestrator",
      code: "KDOS-ORCH-01",
      title: "Autonomous Enterprise Operations Director",
      description: "Master Orchestrator",
      specialization: "Multi-Agent Coordination",
      iconName: "Cpu",
      accentColor: "text-indigo-400 border-indigo-500/30",
      badgeBg: "bg-indigo-500/10 text-indigo-400",
      status: "active",
      capabilities: [],
      schedule: "Continuous",
      pendingActionsCount: 0,
    };
    handleRunAgent(orch, "Synthesize complete multi-agent enterprise operational audit");
  };

  // Approve / Dismiss Action
  const handleActionDecision = async (actionId: string, decision: "approve" | "dismiss") => {
    try {
      const res = await fetch("/api/v1/agents/actions/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionId, decision }),
      });
      const data = await res.json();
      if (data.success) {
        setPendingActions((prev) => prev.filter((a) => a.id !== actionId));
        loadFleetData();
      }
    } catch {
      // Error handling
    }
  };

  // Send Chat message to KDOS Co-pilot
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    setChatInput("");
    const newMsgId = "msg-" + Date.now();

    setChatMessages((prev) => [
      ...prev,
      { id: newMsgId, sender: "user", text: userText },
    ]);
    setChatLoading(true);

    try {
      const res = await fetch("/api/v1/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: "msg-reply-" + Date.now(),
            sender: "copilot",
            text: data.reply,
            source: data.source,
          },
        ]);
        loadFleetData();
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: "msg-err-" + Date.now(),
          sender: "copilot",
          text: "I encountered an error connecting to the neural reasoning core. Please try again.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (agentResult?.rawInsightsMarkdown) {
      navigator.clipboard.writeText(agentResult.rawInsightsMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="page pb-12">
      {/* Header */}
      <header className="page-header">
        <div className="page-header__text">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="page-header__title">KDOS Autonomous Agent Fleet</h1>
            <Badge variant="info" className="gap-1 bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
              <Sparkles size={11} />
              Multi-Agent Mesh Active
            </Badge>
          </div>
          <p className="page-header__sub">
            Autonomous multi-agent orchestration for inventory replenishment, dynamic pricing, SARS debtors, and logistics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={loadFleetData}
            disabled={loading}
            className="gap-1.5 text-xs"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Sync Fleet
          </Button>
          <Button
            size="sm"
            onClick={handleRunFullSweep}
            disabled={runningAgentId !== null}
            className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
          >
            <Zap size={14} />
            {runningAgentId === "orchestrator" ? "Orchestrating..." : "Run Enterprise Sweep"}
          </Button>
        </div>
      </header>

      {/* Fleet KPI Banner */}
      <dl className="summary-stats">
        <div className="summary-stats__item">
          <dt>Active Agents</dt>
          <dd className="text-emerald-400 font-bold flex items-center gap-1.5">
            <Activity size={16} className="text-emerald-400" />
            6 / 6 Operational
          </dd>
        </div>
        <div className="summary-stats__item">
          <dt>Pending Approvals</dt>
          <dd className={pendingActions.length > 0 ? "text-amber-400 font-bold" : "text-white"}>
            {pendingActions.length} Decisions
          </dd>
        </div>
        <div className="summary-stats__item">
          <dt>Autonomous Mesh</dt>
          <dd className="text-indigo-300 font-mono text-sm">Continuous (15m)</dd>
        </div>
        <div className="summary-stats__item">
          <dt>Engine Backbone</dt>
          <dd className="text-cyan-400 text-sm font-semibold">Gemini 3.7 Flash</dd>
        </div>
      </dl>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("fleet")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === "fleet"
              ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <Layers size={14} />
          Agent Fleet ({agents.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("approvals")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === "approvals"
              ? "bg-amber-600/20 text-amber-300 border border-amber-500/30"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <CheckCircle2 size={14} />
          Pending Approvals
          {pendingActions.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
              {pendingActions.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("copilot")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === "copilot"
              ? "bg-cyan-600/20 text-cyan-300 border border-cyan-500/30"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <Bot size={14} />
          KDOS Co-Pilot Terminal
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("logs")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === "logs"
              ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <Clock size={14} />
          Audit & Event Logs
        </button>
      </div>

      {/* TAB 1: AGENT FLEET */}
      {activeTab === "fleet" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => {
              const IconComp = AGENT_ICONS[agent.iconName] || Bot;
              const isRunning = runningAgentId === agent.id;

              return (
                <Card
                  key={agent.id}
                  className="p-5 flex flex-col justify-between bg-[#11161d] border-white/10 hover:border-indigo-500/40 transition-all shadow-md group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg border ${agent.badgeBg} flex items-center justify-center`}>
                          <IconComp size={20} className={agent.accentColor.split(" ")[0]} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-sm">{agent.name}</h3>
                          </div>
                          <span className="text-[11px] font-mono text-white/40">{agent.code}</span>
                        </div>
                      </div>
                      <Badge variant="success" className="text-[10px] uppercase font-mono">
                        {agent.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-white/70 leading-relaxed min-h-[36px]">
                      {agent.description}
                    </p>

                    <div className="pt-2 border-t border-white/5 space-y-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold block">
                        Capabilities
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {agent.capabilities.map((cap, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-white/60 border border-white/5"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="text-[11px] text-white/40 flex items-center gap-1">
                      <Clock size={12} />
                      <span>{agent.schedule}</span>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleRunAgent(agent)}
                      disabled={runningAgentId !== null}
                      className="gap-1.5 text-xs bg-white/5 hover:bg-indigo-600 hover:text-white border border-white/10 transition-colors"
                    >
                      {isRunning ? (
                        <>
                          <RefreshCw size={12} className="animate-spin text-indigo-400" />
                          <span>Running...</span>
                        </>
                      ) : (
                        <>
                          <Play size={12} className="text-indigo-400" />
                          <span>Run Agent</span>
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Active Agent Report Modal / Drawer */}
          {selectedAgent && (
            <Card className="p-6 bg-[#11161d] border-indigo-500/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${selectedAgent.badgeBg}`}>
                    {(() => {
                      const IconComp = AGENT_ICONS[selectedAgent.iconName] || Bot;
                      return <IconComp size={18} className={selectedAgent.accentColor.split(" ")[0]} />;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      {selectedAgent.name}
                      <span className="text-xs font-mono text-white/40">[{selectedAgent.code}]</span>
                    </h2>
                    <p className="text-xs text-white/60">{selectedAgent.specialization}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {agentResult && (
                    <Button variant="outline" size="sm" onClick={handleCopyReport} className="text-xs gap-1.5">
                      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAgent(null);
                      setAgentResult(null);
                    }}
                    className="p-1 text-white/40 hover:text-white rounded-lg hover:bg-white/10"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Custom Prompt Input for Selected Agent */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Command ${selectedAgent.name} with specific focus or question...`}
                  value={customAgentPrompt}
                  onChange={(e) => setCustomAgentPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRunAgent(selectedAgent, customAgentPrompt)}
                  className="flex-1 bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/40 focus:border-indigo-500 focus:outline-none"
                />
                <Button
                  size="sm"
                  onClick={() => handleRunAgent(selectedAgent, customAgentPrompt)}
                  disabled={runningAgentId !== null}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1"
                >
                  <Play size={12} />
                  Execute Analysis
                </Button>
              </div>

              {/* Report Display */}
              {runningAgentId === selectedAgent.id ? (
                <div className="py-12 text-center space-y-3">
                  <RefreshCw size={28} className="mx-auto text-indigo-400 animate-spin" />
                  <p className="text-xs text-white/80 font-medium">
                    {selectedAgent.name} is inspecting ERP database tables and evaluating heuristics...
                  </p>
                </div>
              ) : agentResult ? (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                    <div>
                      <span className="text-[10px] uppercase text-white/40 font-bold block">Summary Verdict</span>
                      <p className="text-xs text-white/90 font-medium">{agentResult.summary}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] uppercase text-white/40 font-bold block">Confidence</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {(agentResult.confidenceScore * 100).toFixed(0)}%
                        </span>
                      </div>
                      <Badge
                        variant={
                          agentResult.healthStatus === "critical"
                            ? "danger"
                            : agentResult.healthStatus === "warning"
                            ? "warning"
                            : "success"
                        }
                      >
                        {agentResult.healthStatus}
                      </Badge>
                    </div>
                  </div>

                  <div className="prose prose-invert max-w-none text-white/90 text-xs leading-relaxed space-y-3 p-4 bg-[#141a22] rounded-lg border border-white/5">
                    <div className="markdown-body">
                      <ReactMarkdown>{agentResult.rawInsightsMarkdown}</ReactMarkdown>
                    </div>
                  </div>

                  {agentResult.suggestedActions.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Zap size={14} className="text-amber-400" />
                        Proposed Autonomous Actions ({agentResult.suggestedActions.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {agentResult.suggestedActions.map((act) => (
                          <div
                            key={act.id}
                            className="p-3 rounded-lg bg-[#18202b] border border-amber-500/20 flex flex-col justify-between space-y-2"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-xs text-white">{act.title}</span>
                                <Badge variant="warning" className="text-[9px] uppercase">
                                  {act.severity}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-white/70">{act.description}</p>
                              <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">
                                Impact: {act.estimatedImpact}
                              </span>
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                              <Button
                                size="sm"
                                onClick={() => handleActionDecision(act.id, "approve")}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-7 px-2.5 gap-1"
                              >
                                <Check size={11} /> Approve & Execute
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </Card>
          )}
        </div>
      )}

      {/* TAB 2: PENDING APPROVALS */}
      {activeTab === "approvals" && (
        <Card className="p-6 bg-[#11161d] border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Autonomous Action Approval Queue
              </h2>
              <p className="text-xs text-white/50">
                High-confidence actions staged by agents awaiting executive confirmation.
              </p>
            </div>
            <Badge variant="warning" className="text-xs">
              {pendingActions.length} Pending Actions
            </Badge>
          </div>

          {pendingActions.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
              <p className="text-sm text-white/80 font-medium">All agent recommendations have been processed</p>
              <p className="text-xs text-white/40">No pending operational actions awaiting approval.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingActions.map((action) => (
                <div
                  key={action.id}
                  className="p-4 rounded-lg bg-[#161d26] border border-white/10 hover:border-amber-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{action.title}</span>
                      <Badge
                        variant={
                          action.severity === "critical"
                            ? "danger"
                            : action.severity === "high"
                            ? "warning"
                            : "info"
                        }
                        className="text-[10px] uppercase font-mono"
                      >
                        {action.severity}
                      </Badge>
                      <span className="text-[10px] font-mono text-white/40">[{action.category}]</span>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed">{action.description}</p>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-emerald-400 font-semibold">
                        Estimated Impact: {action.estimatedImpact}
                      </span>
                      <span className="text-white/30">•</span>
                      <span className="text-white/40">
                        Generated: {new Date(action.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleActionDecision(action.id, "dismiss")}
                      className="text-xs h-8 px-3 border-white/10 text-white/60 hover:text-white"
                    >
                      <X size={13} className="mr-1" /> Dismiss
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleActionDecision(action.id, "approve")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3 font-semibold gap-1"
                    >
                      <Check size={13} /> Approve & Execute
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* TAB 3: KDOS CO-PILOT TERMINAL */}
      {activeTab === "copilot" && (
        <Card className="p-6 bg-[#11161d] border-white/10 flex flex-col h-[650px]">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-cyan-400" />
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  KDOS Master Orchestrator Terminal
                </h2>
                <p className="text-[11px] text-white/50">
                  Conversational intelligence across inventory, pricing, debtors, and logistics
                </p>
              </div>
            </div>
            <Badge variant="info" className="text-[10px] bg-cyan-500/20 text-cyan-300">
              Gemini 3.7 Flash
            </Badge>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 select-text">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "copilot" && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={14} className="text-indigo-300" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl p-3.5 text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-[#18202c] border border-white/10 text-white/90"
                  }`}
                >
                  <div className="markdown-body">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                  {msg.source && (
                    <span className="text-[9px] text-white/40 block mt-2 pt-1 border-t border-white/5">
                      Source: {msg.source}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
                  <RefreshCw size={12} className="text-indigo-300 animate-spin" />
                </div>
                <div className="bg-[#18202c] border border-white/10 rounded-xl p-3 text-xs text-white/60 flex items-center gap-2">
                  <span>KDOS Orchestrator is synthesizing operational data...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Quick Prompts */}
          <div className="flex flex-wrap gap-1.5 pt-3 pb-2 border-t border-white/10">
            {[
              "What are our top 3 stockout risks right now?",
              "Summarize overdue debtors and recommend credit actions",
              "How can we optimize inter-branch transfers to Durban?",
              "Recommend clearance pricing on slow-moving inventory",
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setChatInput(preset);
                }}
                className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-white/70 hover:text-cyan-300 border border-white/5 flex items-center gap-1 transition-colors"
              >
                <span>{preset}</span>
                <ArrowRight size={9} className="text-white/40" />
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Ask KDOS Co-pilot to query inventory, dispatch transfers, or draft debtor statements..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
              className="flex-1 bg-[#161c24] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:border-cyan-500 focus:outline-none"
            />
            <Button
              size="sm"
              onClick={handleSendChatMessage}
              disabled={chatLoading || !chatInput.trim()}
              className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs px-4 gap-1.5"
            >
              <Send size={13} />
              Send
            </Button>
          </div>
        </Card>
      )}

      {/* TAB 4: AUDIT & EVENT LOGS */}
      {activeTab === "logs" && (
        <Card className="p-6 bg-[#11161d] border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Autonomous Event & Decision Audit Trail
              </h2>
              <p className="text-xs text-white/50">
                Immutable event stream of agent actions, system heuristics, and executive approvals.
              </p>
            </div>
            <Badge variant="muted" className="text-xs font-mono">
              {logs.length} Log Entries
            </Badge>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {logs.map((entry) => (
              <div
                key={entry.id}
                className="p-3 rounded bg-[#161c24] border border-white/5 flex items-start gap-3"
              >
                <span className="text-[10px] text-white/40 shrink-0 mt-0.5">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
                <Badge
                  variant={
                    entry.level === "action"
                      ? "success"
                      : entry.level === "warning"
                      ? "warning"
                      : entry.level === "error"
                      ? "danger"
                      : "info"
                  }
                  className="text-[9px] uppercase px-1.5 py-0 shrink-0 font-bold"
                >
                  {entry.level}
                </Badge>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-300 font-semibold">{entry.agentName}</span>
                  </div>
                  <p className="text-white/80 font-sans text-xs">{entry.message}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
