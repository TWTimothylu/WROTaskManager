import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { Target, Zap } from 'lucide-react';
import TaskCard from './TaskCard';
import { scrollToNonLinear } from '../utils/scroll';

function TimelineContainer({
  nodes,
  activeNodeIds,
  taskTimers,
  onCompleteSuccess,
  onCompleteFail,
  isRunning,
  toastMessage,
  recenterSignal
}) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [svgConnections, setSvgConnections] = useState([]);
  const [showRecenterBtn, setShowRecenterBtn] = useState(false);
  const isUpdatingRef = useRef(false);


  // Group nodes by tier
  const tiers = Array.from(new Set(nodes.map(n => n.tier))).sort((a, b) => a - b);

  const getNodesInTier = (tier) => {
    return nodes
      .filter(n => n.tier === tier)
      .sort((a, b) => (a.column || 0) - (b.column || 0));
  };

  // Compute SVG arrow lines using throttled RAF to prevent Layout Thrashing
  const updateSvgConnections = useCallback(() => {
    if (isUpdatingRef.current || !contentRef.current) return;
    isUpdatingRef.current = true;

    requestAnimationFrame(() => {
      if (!contentRef.current) {
        isUpdatingRef.current = false;
        return;
      }

      const contentRect = contentRef.current.getBoundingClientRect();
      const connections = [];

      nodes.forEach(parent => {
        const parentEl = document.getElementById(`task-node-${parent.id}`);
        if (!parentEl) return;
        const parentRect = parentEl.getBoundingClientRect();

        const x1 = parentRect.left + parentRect.width / 2 - contentRect.left;
        const y1 = parentRect.bottom - contentRect.top;

        // Success Branch Arrow (Y)
        if (parent.successNextId) {
          const childEl = document.getElementById(`task-node-${parent.successNextId}`);
          if (childEl) {
            const childRect = childEl.getBoundingClientRect();
            const x2 = childRect.left + childRect.width / 2 - contentRect.left;
            const y2 = childRect.top - contentRect.top;

            connections.push({
              id: `${parent.id}-success-${parent.successNextId}`,
              x1, y1, x2, y2,
              type: 'Y',
              label: 'Y (成功)',
              color: 'var(--color-accent-emerald)'
            });
          }
        }

        // Fail Branch Arrow (N)
        if (parent.failNextId) {
          const childEl = document.getElementById(`task-node-${parent.failNextId}`);
          if (childEl) {
            const childRect = childEl.getBoundingClientRect();
            const x2 = childRect.left + childRect.width / 2 - contentRect.left;
            const y2 = childRect.top - contentRect.top;

            connections.push({
              id: `${parent.id}-fail-${parent.failNextId}`,
              x1, y1, x2, y2,
              type: 'N',
              label: 'N (失敗)',
              color: 'var(--color-accent-rose)'
            });
          }
        }
      });

      setSvgConnections(connections);
      isUpdatingRef.current = false;
    });
  }, [nodes]);

  // Center active task(s) in focus zone
  const scrollToActiveCenter = useCallback(() => {
    if (!containerRef.current || !activeNodeIds || activeNodeIds.length === 0) return;

    const firstActiveId = activeNodeIds[0];
    const activeEl = document.getElementById(`task-node-${firstActiveId}`);
    if (!activeEl) return;

    const container = containerRef.current;
    const containerHeight = container.clientHeight;

    const containerRect = container.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();
    
    const relativeTop = activeRect.top - containerRect.top + container.scrollTop;
    const elementHeight = activeEl.offsetHeight;
    const elementCenterY = relativeTop + elementHeight / 2;

    const targetScrollY = Math.max(0, elementCenterY - containerHeight / 2);

    scrollToNonLinear(container, targetScrollY, () => {
      setShowRecenterBtn(false);
    });
  }, [activeNodeIds]);

  // Smooth center scroll on active node changes or recenterSignal
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToActiveCenter();
      updateSvgConnections();
    }, 100);
    return () => clearTimeout(timer);
  }, [activeNodeIds.join(','), isRunning, recenterSignal, scrollToActiveCenter, updateSvgConnections]);

  // Recenter button detection on scroll (Throttled with RAF)
  const isScrollTickingRef = useRef(false);
  const handleScroll = () => {
    if (!isScrollTickingRef.current) {
      isScrollTickingRef.current = true;
      requestAnimationFrame(() => {
        updateSvgConnections();

        if (containerRef.current && activeNodeIds && activeNodeIds.length > 0) {
          const firstActiveId = activeNodeIds[0];
          const activeEl = document.getElementById(`task-node-${firstActiveId}`);
          if (activeEl) {
            const container = containerRef.current;
            const containerCenterY = container.scrollTop + container.clientHeight / 2;
            const activeCenterY = activeEl.offsetTop + activeEl.offsetHeight / 2;

            if (Math.abs(containerCenterY - activeCenterY) > 100) {
              setShowRecenterBtn(true);
            } else {
              setShowRecenterBtn(false);
            }
          }
        }
        isScrollTickingRef.current = false;
      });
    }
  };

  useEffect(() => {
    window.addEventListener('resize', updateSvgConnections);
    return () => window.removeEventListener('resize', updateSvgConnections);
  }, [updateSvgConnections]);

  return (
    <main
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        flex: 1,
        height: '100vh',
        overflowY: 'auto',
        position: 'relative',
        padding: '50vh 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        willChange: 'scroll-position'
      }}
    >
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            left: 'calc(var(--timeline-left-width) + 20px)',
            right: '20px',
            margin: '0 auto',
            maxWidth: '520px',
            background: 'rgba(20, 10, 5, 0.95)',
            border: '1px solid var(--color-nerv-amber)',
            boxShadow: '0 0 25px rgba(255, 170, 0, 0.5)',
            padding: '10px 18px',
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            color: '#fff',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-family-display)',
            letterSpacing: '1px',
            animation: 'pulseGlow 1.5s infinite ease-in-out'
          }}
        >
          <Zap size={16} color="var(--color-nerv-amber)" className="pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Fixed Sticky Center Focus Band */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: 'var(--timeline-left-width)',
          right: 0,
          transform: 'translateY(-50%)',
          height: '240px',
          borderTop: '2px dashed rgba(56, 189, 248, 0.35)',
          borderBottom: '2px dashed rgba(56, 189, 248, 0.35)',
          background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.02) 0%, rgba(56, 189, 248, 0.08) 50%, rgba(56, 189, 248, 0.02) 100%)',
          pointerEvents: 'none',
          zIndex: 5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px'
        }}
      >
        <span style={{
          fontSize: '0.75rem',
          color: 'var(--color-accent-cyan)',
          letterSpacing: '1px',
          fontWeight: 700,
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Zap size={14} className="pulse" /> 焦點區域 (ACTIVE FOCUS ZONE)
        </span>

        <span style={{
          fontSize: '0.75rem',
          color: 'var(--color-accent-cyan)',
          letterSpacing: '1px',
          fontWeight: 700,
          textTransform: 'uppercase'
        }}>
          焦點區域 ◀
        </span>
      </div>

      {/* Recenter Target Button */}
      {showRecenterBtn && (
        <button
          className="btn-glass btn-primary"
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            zIndex: 30,
            boxShadow: '0 8px 30px rgba(56, 189, 248, 0.4)',
            animation: 'floatBounce 2s infinite ease-in-out'
          }}
          onClick={scrollToActiveCenter}
        >
          <Target size={18} /> 回到當前任務 (Recenter Target)
        </button>
      )}

      {/* Content wrapper with SVG connection overlay */}
      <div
        ref={contentRef}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '80px',
          width: '100%',
          maxWidth: '1000px',
          zIndex: 10
        }}
      >
        {/* SVG Arrow Overlay */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 2
          }}
        >
          <defs>
            <marker id="arrow-y" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-accent-emerald)" />
            </marker>
            <marker id="arrow-n" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-accent-rose)" />
            </marker>
          </defs>

          {svgConnections.map(conn => {
            const { id, x1, y1, x2, y2, type, color } = conn;
            const midY = (y1 + y2) / 2;
            const pathD = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2 - 6}`;
            const labelX = (x1 + x2) / 2 + (type === 'Y' ? -18 : 18);
            const labelY = midY;

            return (
              <g key={id}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={color}
                  strokeWidth="2.5"
                  strokeDasharray={type === 'N' ? '6 4' : 'none'}
                  markerEnd={`url(#arrow-${type.toLowerCase()})`}
                  style={{ filter: `drop-shadow(0 0 6px ${color})` }}
                />
                <rect
                  x={labelX - 18}
                  y={labelY - 10}
                  width="36"
                  height="20"
                  rx="6"
                  fill="rgba(7, 10, 18, 0.9)"
                  stroke={color}
                  strokeWidth="1"
                />
                <text
                  x={labelX}
                  y={labelY + 4}
                  fill={color}
                  fontSize="11"
                  fontWeight="700"
                  textAnchor="middle"
                  fontFamily="var(--font-family-mono)"
                >
                  {type}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Render Tier Rows & Parallel Independent Columns */}
        {tiers.map((tierIndex) => {
          const tierNodes = getNodesInTier(tierIndex);
          const isMultiParallel = tierNodes.length > 1;

          return (
            <div
              key={`tier-${tierIndex}`}
              style={{
                display: 'flex',
                gap: '30px',
                justify: 'center',
                alignItems: 'stretch',
                width: '100%',
                zIndex: 4
              }}
            >
              {tierNodes.map((node) => {
                const isActive = activeNodeIds.includes(node.id);
                const isPast = node.status === 'success' || node.status === 'fail';
                const isFuture = !isActive && !isPast;
                const secRemaining = taskTimers[node.id] !== undefined
                  ? taskTimers[node.id]
                  : node.allocatedMinutes * 60;

                // Parent status counts for multi-parent convergence UI indicator
                const parentNodes = nodes.filter(p => p.successNextId === node.id || p.failNextId === node.id);
                const totalParentsCount = parentNodes.length;
                const completedParentsCount = parentNodes.filter(p => p.status === 'success' || p.status === 'fail').length;

                return (
                  <div
                    key={node.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      flex: isMultiParallel ? '1 1 0' : '0 0 auto',
                      maxWidth: isMultiParallel ? '400px' : '480px',
                      maxHeight: isMultiParallel ? '320px' : 'auto',
                      overflowY: isMultiParallel ? 'auto' : 'visible',
                      padding: '4px'
                    }}
                  >
                    <TaskCard
                      node={node}
                      isActive={isActive}
                      isTicking={isActive}
                      isPast={isPast}
                      isFuture={isFuture}
                      taskSecondsRemaining={secRemaining}
                      onCompleteSuccess={onCompleteSuccess}
                      onCompleteFail={onCompleteFail}
                      isParallel={isMultiParallel}
                      isRunning={isRunning}
                      totalParentsCount={totalParentsCount}
                      completedParentsCount={completedParentsCount}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </main>
  );
}

export default memo(TimelineContainer);
