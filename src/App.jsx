import React, { useState, useEffect, useCallback, useRef } from 'react';
import GlobalTimerPanel from './components/GlobalTimerPanel';
import TimelineContainer from './components/TimelineContainer';
import TaskTreeEditor from './components/TaskTreeEditor';
import TemplateModal from './components/TemplateModal';
import PipWindow from './components/PipWindow';
import { DEFAULT_WRO_TEMPLATE } from './utils/defaultTemplate';
import { playBeep, getIsAudioMuted, setIsAudioMuted } from './utils/audio';
import { saveActiveSessionState, loadActiveSessionState, clearActiveSessionState } from './utils/storage';

// Dynamic Active Nodes Engine: Branch Outcome-Based Child Node Activation & Ticking
// A child node is activated (starts ticking and unlocks PASS/FAIL buttons) strictly based on completed parent's outcome:
// - Parent PASS ('success') -> activates parent.successNextId
// - Parent FAIL ('fail')    -> activates parent.failNextId
export function calculateActiveNodes(nodesList) {
  if (!nodesList || nodesList.length === 0) return [];

  const pendingNodes = nodesList.filter(n => n.status === 'pending');
  if (pendingNodes.length === 0) return [];

  const readyNodeIds = new Set();

  // 1. Root nodes (nodes with 0 incoming parent decision branches)
  const pendingRootNodes = pendingNodes.filter(n => {
    const hasParent = nodesList.some(p => p.successNextId === n.id || p.failNextId === n.id);
    return !hasParent;
  });

  if (pendingRootNodes.length > 0) {
    const minTier = Math.min(...pendingRootNodes.map(n => n.tier));
    pendingRootNodes.filter(n => n.tier === minTier).forEach(n => {
      readyNodeIds.add(n.id);
    });
  }

  // 2. Child nodes (activated strictly by completed parent's outcome branch)
  nodesList.forEach(p => {
    if (p.status === 'success' && p.successNextId) {
      const target = nodesList.find(n => n.id === p.successNextId);
      if (target && target.status === 'pending') {
        readyNodeIds.add(target.id);
      }
    } else if (p.status === 'fail' && p.failNextId) {
      const target = nodesList.find(n => n.id === p.failNextId);
      if (target && target.status === 'pending') {
        readyNodeIds.add(target.id);
      }
    }
  });

  return Array.from(readyNodeIds);
}

export default function App() {
  const savedSession = loadActiveSessionState();

  const [initialTotalSeconds, setInitialTotalSeconds] = useState(() => savedSession?.initialTotalSeconds || DEFAULT_WRO_TEMPLATE.totalDurationMinutes * 60);
  const [globalSeconds, setGlobalSeconds] = useState(() => savedSession?.globalSeconds !== undefined ? savedSession.globalSeconds : DEFAULT_WRO_TEMPLATE.totalDurationMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);

  const [nodes, setNodes] = useState(() => savedSession?.nodes || DEFAULT_WRO_TEMPLATE.nodes);
  const [activeNodeIds, setActiveNodeIds] = useState(() => calculateActiveNodes(savedSession?.nodes || DEFAULT_WRO_TEMPLATE.nodes));
  const [taskTimers, setTaskTimers] = useState(() => savedSession?.taskTimers || {});
  const [isMuted, setIsMuted] = useState(() => {
    const muted = savedSession?.isMuted || false;
    setIsAudioMuted(muted);
    return muted;
  });

  const [toastMessage, setToastMessage] = useState(null);
  const [recenterSignal, setRecenterSignal] = useState(0);

  // Modals & PIP
  const [isTreeEditorOpen, setIsTreeEditorOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isPipOpen, setIsPipOpen] = useState(false);

  const lastTickRef = useRef(Date.now());

  // Recalculate active nodes when nodes change
  useEffect(() => {
    const calculatedActive = calculateActiveNodes(nodes);
    setActiveNodeIds(calculatedActive);
  }, [nodes]);

  // Initialize task timers for new nodes
  useEffect(() => {
    setTaskTimers(prev => {
      const updated = { ...prev };
      nodes.forEach(n => {
        if (updated[n.id] === undefined) {
          updated[n.id] = n.allocatedMinutes * 60;
        }
      });
      return updated;
    });
  }, [nodes]);

  // Session Auto-Save: Persist state to prevent loss on unexpected refresh/crash
  useEffect(() => {
    saveActiveSessionState({
      initialTotalSeconds,
      globalSeconds,
      nodes,
      taskTimers,
      isMuted
    });
  }, [initialTotalSeconds, globalSeconds, nodes, taskTimers, isMuted]);

  // Main Ticking Engine: Precision Timestamp Anti-Drift Engine
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      lastTickRef.current = Date.now();
      interval = setInterval(() => {
        const now = Date.now();
        const elapsedSec = Math.max(1, Math.round((now - lastTickRef.current) / 1000));
        lastTickRef.current = now;

        // Decrement global timer with elapsed seconds
        setGlobalSeconds(prev => prev - elapsedSec);

        // Decrement task timers for active nodes currently running
        setTaskTimers(prev => {
          const updated = { ...prev };
          activeNodeIds.forEach(id => {
            if (updated[id] !== undefined) {
              updated[id] -= elapsedSec; // Can go negative for overtime
            }
          });
          return updated;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, activeNodeIds]);

  // Handle Task Completion & Branching + Direct Target Child Time Transfer
  const handleTaskComplete = useCallback((nodeId, branchType, remainingTaskSecs = 0) => {
    const currentNode = nodes.find(n => n.id === nodeId);
    if (!currentNode) return;

    const nextNodeId = branchType === 'success'
      ? currentNode.successNextId
      : currentNode.failNextId;

    // 1. Mark current node as completed ('success' or 'fail')
    const updatedNodes = nodes.map(n => {
      if (n.id === nodeId) {
        return { ...n, status: branchType };
      }
      return n;
    });

    // 2. Transfer parent's remaining time (or deduct overtime penalty) to the activated target child node
    if (nextNodeId && remainingTaskSecs !== 0) {
      const nextNode = updatedNodes.find(n => n.id === nextNodeId);
      if (nextNode) {
        const defaultSecs = nextNode.allocatedMinutes * 60;
        const currentRemaining = taskTimers[nextNodeId] !== undefined ? taskTimers[nextNodeId] : defaultSecs;
        const updatedTimer = Math.max(0, currentRemaining + remainingTaskSecs);

        setTaskTimers(prev => ({
          ...prev,
          [nextNodeId]: updatedTimer
        }));

        // Trigger toast feedback
        const formattedDiff = Math.abs(remainingTaskSecs);
        const m = Math.floor(formattedDiff / 60);
        const s = formattedDiff % 60;
        const pad = (v) => String(v).padStart(2, '0');
        const timeStr = `${pad(m)}:${pad(s)}`;

        if (remainingTaskSecs > 0) {
          setToastMessage(`主線提早完成！結餘 +${timeStr} 已加至下一任務可用時間`);
        } else {
          setToastMessage(`超時警報！超時 -${timeStr} 已自下一任務可用時間扣除`);
        }
        setTimeout(() => setToastMessage(null), 3500);
      }
    }

    // 3. Update nodes state and trigger active node recalculation
    setNodes(updatedNodes);
    playBeep(branchType === 'success' ? 800 : 350, 'sine', 0.15);
  }, [nodes, taskTimers]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toUpperCase() : '';
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag) || document.activeElement?.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsRunning(prev => {
          const next = !prev;
          playBeep(next ? 880 : 440, 'sine', 0.15);
          return next;
        });
      } else if (e.code === 'Digit1' || e.code === 'KeyY') {
        if (activeNodeIds.length > 0) {
          e.preventDefault();
          const targetId = activeNodeIds[0];
          const rem = taskTimers[targetId] !== undefined ? taskTimers[targetId] : 0;
          handleTaskComplete(targetId, 'success', rem);
        }
      } else if (e.code === 'Digit2' || e.code === 'KeyN') {
        if (activeNodeIds.length > 0) {
          e.preventDefault();
          const targetId = activeNodeIds[0];
          const rem = taskTimers[targetId] !== undefined ? taskTimers[targetId] : 0;
          handleTaskComplete(targetId, 'fail', rem);
        }
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        setRecenterSignal(Date.now());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeNodeIds, taskTimers, handleTaskComplete]);

  // Timer controls
  const handleStart = () => {
    if (activeNodeIds.length === 0) {
      setActiveNodeIds(calculateActiveNodes(nodes));
    }
    setIsRunning(true);
    playBeep(880, 'sine', 0.15);
  };

  const handlePause = () => {
    setIsRunning(false);
    playBeep(440, 'sine', 0.15);
  };

  const handleToggleRunning = () => {
    if (isRunning) {
      handlePause();
    } else {
      handleStart();
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setGlobalSeconds(initialTotalSeconds);
    const resetNodes = nodes.map(n => ({ ...n, status: 'pending' }));
    setNodes(resetNodes);
    setActiveNodeIds(calculateActiveNodes(resetNodes));

    // Reset task timers
    const resetTimers = {};
    nodes.forEach(n => {
      resetTimers[n.id] = n.allocatedMinutes * 60;
    });
    setTaskTimers(resetTimers);
    clearActiveSessionState();
    playBeep(400, 'sawtooth', 0.15);
  };

  const handleToggleMute = () => {
    setIsMuted(prev => {
      const next = !prev;
      setIsAudioMuted(next);
      return next;
    });
  };

  const handleUpdateTotalDuration = (newSecs) => {
    setInitialTotalSeconds(newSecs);
    setGlobalSeconds(newSecs);
  };

  const handleSaveTreeNodes = (newNodes) => {
    const resetNodes = newNodes.map(n => ({ ...n, status: 'pending' }));
    setNodes(resetNodes);
    setActiveNodeIds(calculateActiveNodes(resetNodes));

    const resetTimers = {};
    resetNodes.forEach(n => {
      resetTimers[n.id] = n.allocatedMinutes * 60;
    });
    setTaskTimers(resetTimers);
  };

  const handleLoadTemplate = (template) => {
    setIsRunning(false);
    const duration = (template.totalDurationMinutes || 60) * 60;
    setInitialTotalSeconds(duration);
    setGlobalSeconds(duration);

    if (template.nodes && template.nodes.length > 0) {
      const resetNodes = template.nodes.map(n => ({ ...n, status: 'pending' }));
      setNodes(resetNodes);
      setActiveNodeIds(calculateActiveNodes(resetNodes));
      const initialTimers = {};
      resetNodes.forEach(n => {
        initialTimers[n.id] = n.allocatedMinutes * 60;
      });
      setTaskTimers(initialTimers);
    }
    clearActiveSessionState();
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Left fixed panel */}
      <GlobalTimerPanel
        globalSeconds={globalSeconds}
        initialTotalSeconds={initialTotalSeconds}
        isRunning={isRunning}
        onStart={handleStart}
        onPause={handlePause}
        onReset={handleReset}
        onUpdateTotalDuration={handleUpdateTotalDuration}
        onOpenPip={() => setIsPipOpen(!isPipOpen)}
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
        onOpenTreeEditor={() => setIsTreeEditorOpen(true)}
        hasActivePip={isPipOpen}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main scrolling center timeline */}
      <TimelineContainer
        nodes={nodes}
        activeNodeIds={activeNodeIds}
        tickingNodeIds={activeNodeIds}
        taskTimers={taskTimers}
        onCompleteSuccess={(id, remainingSec) => handleTaskComplete(id, 'success', remainingSec)}
        onCompleteFail={(id, remainingSec) => handleTaskComplete(id, 'fail', remainingSec)}
        isRunning={isRunning}
        toastMessage={toastMessage}
        recenterSignal={recenterSignal}
      />

      {/* Modals */}
      {isTreeEditorOpen && (
        <TaskTreeEditor
          nodes={nodes}
          totalDurationMinutes={Math.floor(initialTotalSeconds / 60)}
          onSaveNodes={handleSaveTreeNodes}
          onClose={() => setIsTreeEditorOpen(false)}
        />
      )}

      {isTemplateModalOpen && (
        <TemplateModal
          currentNodes={nodes}
          currentTotalSeconds={initialTotalSeconds}
          onLoadTemplate={handleLoadTemplate}
          onClose={() => setIsTemplateModalOpen(false)}
        />
      )}

      {/* Document Picture-in-Picture Floating Window */}
      <PipWindow
        isOpen={isPipOpen}
        onClose={() => setIsPipOpen(false)}
        globalSeconds={globalSeconds}
        activeNodes={nodes.filter(n => activeNodeIds.includes(n.id))}
        tickingNodes={nodes.filter(n => activeNodeIds.includes(n.id))}
        taskTimers={taskTimers}
        onCompleteSuccess={(id, remainingSec) => handleTaskComplete(id, 'success', remainingSec)}
        onCompleteFail={(id, remainingSec) => handleTaskComplete(id, 'fail', remainingSec)}
        isRunning={isRunning}
        onToggleRunning={handleToggleRunning}
      />
    </div>
  );
}

