import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

function PipContent({
  globalSeconds,
  activeNodes,
  taskTimers,
  onCompleteSuccess,
  onCompleteFail,
  isRunning,
  onToggleRunning
}) {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 480, height: 280 });

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setSize({ width, height });
        }
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const formatTime = (sec) => {
    const isNeg = sec < 0;
    const abs = Math.abs(sec);
    const m = Math.floor(abs / 60);
    const s = abs % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${isNeg ? '-' : ''}${pad(m)}:${pad(s)}`;
  };

  const taskCount = activeNodes.length;
  const isMultiTask = taskCount > 1;

  // Layout orientation: if window is landscape (aspect >= 1.25) -> row; else -> column
  const isRowLayout = isMultiTask ? (size.width / size.height >= 1.25) : false;

  // Header scaling
  const globalTimerFontSize = Math.max(16, Math.min(Math.round(size.height * 0.12), Math.round(size.width * 0.085), 44));
  const headerBadgeFontSize = Math.max(9, Math.min(Math.round(size.height * 0.055), 14));
  const buttonHeaderFontSize = Math.max(9, Math.min(Math.round(size.height * 0.05), 13));

  const padding = Math.max(4, Math.round(size.height * 0.025));
  const gap = Math.max(4, Math.round(size.height * 0.02));

  // Compute card dimensions
  const headerHeight = Math.max(28, Math.round(size.height * 0.14));
  const availableCardAreaHeight = size.height - (padding * 2) - headerHeight - gap;
  const availableCardAreaWidth = size.width - (padding * 2);

  const cardWidth = isMultiTask
    ? (isRowLayout ? (availableCardAreaWidth - (gap * (taskCount - 1))) / taskCount : availableCardAreaWidth)
    : availableCardAreaWidth;

  const cardHeight = isMultiTask
    ? (isRowLayout ? availableCardAreaHeight : (availableCardAreaHeight - (gap * (taskCount - 1))) / taskCount)
    : availableCardAreaHeight;

  // Decide if the card is wide & short or tall/square
  const isWideCard = (cardWidth / cardHeight) >= 2.1;

  // Card typography scales dynamically with card width and height to fill the space
  const taskTagFontSize = Math.max(8, Math.min(Math.round(cardHeight * 0.085), Math.round(cardWidth * 0.045), 13));
  const taskTitleFontSize = Math.max(11, Math.min(Math.round(cardHeight * 0.14), Math.round(cardWidth * 0.075), 24));
  const taskTimerFontSize = Math.max(20, Math.min(Math.round(cardHeight * 0.36), Math.round(cardWidth * 0.22), 68));
  const taskTimerLabelFontSize = Math.max(8, Math.min(Math.round(cardHeight * 0.075), Math.round(cardWidth * 0.04), 13));
  const actionButtonFontSize = Math.max(9, Math.min(Math.round(cardHeight * 0.11), Math.round(cardWidth * 0.05), 16));
  const actionButtonHeight = Math.max(24, Math.min(Math.round(cardHeight * 0.26), 48));

  const successBtnText = cardWidth < 210 ? '[ 達成主線 ]' : '[ 達成主線 (成功) ]';
  const failBtnText = cardWidth < 210 ? '[ 執行備援 ]' : '[ 執行備援 (失敗) ]';

  return (
    <div
      ref={containerRef}
      style={{
        padding: `${padding}px`,
        color: '#fff3e6',
        fontFamily: "'Chakra Petch', 'Zen Old Mincho', 'Noto Sans TC', sans-serif",
        background: '#040303',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: `${gap}px`,
        overflow: 'hidden'
      }}
    >
      {/* Header with Play/Pause and Global Timer */}
      <div style={{
        height: `${headerHeight}px`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,102,0,0.35)',
        paddingBottom: `${Math.max(2, Math.round(padding * 0.5))}px`,
        gap: `${gap}px`,
        flexShrink: 0,
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: `${gap}px`, minWidth: 0 }}>
          <img
            src="./icon.png"
            alt="WRO"
            style={{
              width: `${Math.max(12, Math.round(headerBadgeFontSize * 1.5))}px`,
              height: `${Math.max(12, Math.round(headerBadgeFontSize * 1.5))}px`,
              objectFit: 'contain',
              borderRadius: '3px',
              flexShrink: 0
            }}
          />
          <span style={{
            fontSize: `${headerBadgeFontSize}px`,
            color: '#ffaa00',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 800,
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}>
            [ WRO HUD ]
          </span>
          <button
            onClick={onToggleRunning}
            style={{
              background: isRunning ? 'rgba(255, 0, 51, 0.25)' : 'rgba(255, 170, 0, 0.25)',
              border: isRunning ? '1px solid #ff0033' : '1px solid #ffaa00',
              color: isRunning ? '#ff6677' : '#ffaa00',
              padding: `${Math.max(2, Math.round(padding * 0.4))}px ${Math.max(4, Math.round(padding * 0.8))}px`,
              fontSize: `${buttonHeaderFontSize}px`,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'Orbitron, sans-serif',
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            {isRunning ? '⏸ 暫停' : '▶ 開始'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: `${gap}px`, flexShrink: 0 }}>
          <span style={{
            fontSize: `${headerBadgeFontSize}px`,
            color: '#ffaa00',
            fontWeight: 700,
            letterSpacing: '1px',
            whiteSpace: 'nowrap'
          }}>
            總剩餘
          </span>
          <span className="display-time" style={{
            fontFamily: 'var(--font-family-digital), DS-Digital, Share Tech Mono, monospace',
            fontSize: `${globalTimerFontSize}px`,
            fontWeight: 700,
            letterSpacing: '1.5px',
            color: globalSeconds < 300 ? '#ff0033' : '#ffaa00',
            textShadow: globalSeconds < 300 ? '0 0 15px rgba(255, 0, 51, 0.8)' : '0 0 15px rgba(255, 170, 0, 0.5)',
            lineHeight: 1
          }}>
            {formatTime(globalSeconds)}
          </span>
        </div>
      </div>

      {/* Active Tasks Grid/Stack Area - Fills 100% Remaining Height & Width */}
      <div style={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        display: 'flex',
        flexDirection: isRowLayout ? 'row' : 'column',
        gap: `${gap}px`,
        alignItems: 'stretch',
        overflow: 'hidden'
      }}>
        {taskCount > 0 ? (
          activeNodes.map(node => {
            return (
              <div
                key={node.id}
                style={{
                  background: 'rgba(20, 10, 5, 0.95)',
                  border: '1px solid #ff5500',
                  boxShadow: '0 0 15px rgba(255, 85, 0, 0.3)',
                  padding: `${Math.max(4, Math.round(cardHeight * 0.04))}px ${Math.max(6, Math.round(cardWidth * 0.03))}px`,
                  flex: '1 1 0',
                  minHeight: 0,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: `${Math.max(2, Math.round(cardHeight * 0.02))}px`,
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                  boxSizing: 'border-box'
                }}
              >
                {isWideCard ? (
                  /* Wide Card Layout (Horizontal Split) */
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: `${gap}px`,
                    flex: 1,
                    minHeight: 0,
                    minWidth: 0
                  }}>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{
                        fontSize: `${taskTagFontSize}px`,
                        color: '#ffaa00',
                        fontWeight: 700,
                        fontFamily: 'Orbitron, sans-serif',
                        letterSpacing: '1px',
                        whiteSpace: 'nowrap'
                      }}>
                        [ 當前執行任務 ]
                      </div>
                      <div style={{
                        fontSize: `${taskTitleFontSize}px`,
                        fontWeight: 800,
                        color: '#fff',
                        lineHeight: 1.2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        wordBreak: 'break-word'
                      }}>
                        {node.name}
                      </div>
                      {node.description && cardHeight > 140 && (
                        <div style={{
                          fontSize: `${Math.max(8, taskTagFontSize)}px`,
                          color: '#d99b6c',
                          borderLeft: '2px solid #ff5500',
                          paddingLeft: '4px',
                          marginTop: '2px',
                          lineHeight: 1.2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {node.description}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{
                        fontSize: `${taskTimerLabelFontSize}px`,
                        color: '#ffaa00',
                        fontWeight: 700,
                        letterSpacing: '1px',
                        whiteSpace: 'nowrap'
                      }}>
                        任務剩餘時間
                      </span>
                      <div className="display-time" style={{
                        fontSize: `${taskTimerFontSize}px`,
                        fontFamily: 'var(--font-family-digital), DS-Digital, Share Tech Mono, monospace',
                        fontWeight: 700,
                        letterSpacing: '1.5px',
                        color: (taskTimers[node.id] || 0) < 0 ? '#ff0033' : '#ffaa00',
                        textShadow: (taskTimers[node.id] || 0) < 0 ? '0 0 15px rgba(255, 0, 51, 0.8)' : '0 0 15px rgba(255, 170, 0, 0.5)',
                        lineHeight: 1
                      }}>
                        {formatTime(taskTimers[node.id] !== undefined ? taskTimers[node.id] : node.allocatedMinutes * 60)}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard / Tall Card Layout (Stacked 3-Tier Space Filling) */
                  <>
                    {/* Tier 1: Task Header & Name */}
                    <div style={{ flexShrink: 0, minWidth: 0 }}>
                      <div style={{
                        fontSize: `${taskTagFontSize}px`,
                        color: '#ffaa00',
                        fontWeight: 700,
                        fontFamily: 'Orbitron, sans-serif',
                        letterSpacing: '1px',
                        whiteSpace: 'nowrap'
                      }}>
                        [ 當前執行任務 ]
                      </div>
                      <div style={{
                        fontSize: `${taskTitleFontSize}px`,
                        fontWeight: 800,
                        color: '#fff',
                        lineHeight: 1.2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        wordBreak: 'break-word'
                      }}>
                        {node.name}
                      </div>
                      {node.description && cardHeight > 160 && (
                        <div style={{
                          fontSize: `${Math.max(8, taskTagFontSize)}px`,
                          color: '#d99b6c',
                          borderLeft: '2px solid #ff5500',
                          paddingLeft: '4px',
                          marginTop: '2px',
                          lineHeight: 1.2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {node.description}
                        </div>
                      )}
                    </div>

                    {/* Tier 2: Big Countdown Timer Centered / Expanded */}
                    <div style={{
                      flex: 1,
                      minHeight: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '4px',
                      padding: '2px 0'
                    }}>
                      <span style={{
                        fontSize: `${taskTimerLabelFontSize}px`,
                        color: '#ffaa00',
                        fontWeight: 700,
                        letterSpacing: '1px',
                        whiteSpace: 'nowrap'
                      }}>
                        任務剩餘
                      </span>
                      <div className="display-time" style={{
                        fontSize: `${taskTimerFontSize}px`,
                        fontFamily: 'var(--font-family-digital), DS-Digital, Share Tech Mono, monospace',
                        fontWeight: 700,
                        letterSpacing: '1.5px',
                        color: (taskTimers[node.id] || 0) < 0 ? '#ff0033' : '#ffaa00',
                        textShadow: (taskTimers[node.id] || 0) < 0 ? '0 0 15px rgba(255, 0, 51, 0.8)' : '0 0 15px rgba(255, 170, 0, 0.5)',
                        lineHeight: 1
                      }}>
                        {formatTime(taskTimers[node.id] !== undefined ? taskTimers[node.id] : node.allocatedMinutes * 60)}
                      </div>
                    </div>
                  </>
                )}

                {/* Tier 3: Action Buttons (Fixed / Flex height filling the bottom) */}
                <div style={{
                  height: `${actionButtonHeight}px`,
                  display: 'flex',
                  gap: `${gap}px`,
                  flexShrink: 0,
                  minWidth: 0
                }}>
                  <button
                    style={{
                      flex: 1,
                      height: '100%',
                      minWidth: 0,
                      background: 'rgba(0, 255, 102, 0.2)',
                      border: '1px solid #00ff66',
                      color: '#00ff66',
                      padding: '0 4px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: `${actionButtonFontSize}px`,
                      fontFamily: 'Orbitron, sans-serif',
                      letterSpacing: '0.5px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxSizing: 'border-box'
                    }}
                    onClick={() => {
                      const remSec = taskTimers[node.id] !== undefined ? taskTimers[node.id] : node.allocatedMinutes * 60;
                      onCompleteSuccess(node.id, remSec);
                    }}
                  >
                    {successBtnText}
                  </button>
                  <button
                    style={{
                      flex: 1,
                      height: '100%',
                      minWidth: 0,
                      background: 'rgba(255, 0, 51, 0.2)',
                      border: '1px solid #ff0033',
                      color: '#ff0033',
                      padding: '0 4px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: `${actionButtonFontSize}px`,
                      fontFamily: 'Orbitron, sans-serif',
                      letterSpacing: '0.5px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxSizing: 'border-box'
                    }}
                    onClick={() => {
                      const remSec = taskTimers[node.id] !== undefined ? taskTimers[node.id] : node.allocatedMinutes * 60;
                      onCompleteFail(node.id, remSec);
                    }}
                  >
                    {failBtnText}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: `${padding}px`,
            textAlign: 'center',
            color: '#805633',
            fontSize: `${headerBadgeFontSize * 1.2}px`,
            fontFamily: 'Share Tech Mono, monospace'
          }}>
            [ 無執行中任務 ]
          </div>
        )}
      </div>
    </div>
  );
}

export default function PipWindow({
  isOpen,
  onClose,
  globalSeconds,
  activeNodes,
  taskTimers,
  onCompleteSuccess,
  onCompleteFail,
  isRunning,
  onToggleRunning
}) {
  const pipWindowRef = useRef(null);
  const pipRootRef = useRef(null);

  // Keep latest props in ref for render
  const propsRef = useRef({
    globalSeconds,
    activeNodes,
    taskTimers,
    onCompleteSuccess,
    onCompleteFail,
    isRunning,
    onToggleRunning
  });

  useEffect(() => {
    propsRef.current = {
      globalSeconds,
      activeNodes,
      taskTimers,
      onCompleteSuccess,
      onCompleteFail,
      isRunning,
      onToggleRunning
    };
  }, [globalSeconds, activeNodes, taskTimers, onCompleteSuccess, onCompleteFail, isRunning, onToggleRunning]);

  const renderPipContent = () => {
    if (pipRootRef.current) {
      pipRootRef.current.render(
        <PipContent
          globalSeconds={propsRef.current.globalSeconds}
          activeNodes={propsRef.current.activeNodes}
          taskTimers={propsRef.current.taskTimers}
          onCompleteSuccess={propsRef.current.onCompleteSuccess}
          onCompleteFail={propsRef.current.onCompleteFail}
          isRunning={propsRef.current.isRunning}
          onToggleRunning={propsRef.current.onToggleRunning}
        />
      );
    }
  };

  useEffect(() => {
    if (isOpen && 'documentPictureInPicture' in window) {
      const openPipWindow = async () => {
        try {
          const pipWin = await window.documentPictureInPicture.requestWindow({
            width: 480,
            height: 300
          });
          pipWindowRef.current = pipWin;

          const container = pipWin.document.createElement('div');
          pipWin.document.documentElement.style.width = '100%';
          pipWin.document.documentElement.style.height = '100%';
          pipWin.document.documentElement.style.margin = '0';
          pipWin.document.documentElement.style.padding = '0';
          pipWin.document.documentElement.style.overflow = 'hidden';

          pipWin.document.body.style.width = '100%';
          pipWin.document.body.style.height = '100%';
          pipWin.document.body.style.margin = '0';
          pipWin.document.body.style.padding = '0';
          pipWin.document.body.style.overflow = 'hidden';
          pipWin.document.body.style.background = '#040303';

          container.style.width = '100%';
          container.style.height = '100%';
          container.style.boxSizing = 'border-box';
          pipWin.document.body.appendChild(container);

          // Copy current document styles to PIP window
          [...document.styleSheets].forEach((styleSheet) => {
            try {
              const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
              const style = document.createElement('style');
              style.textContent = cssRules;
              pipWin.document.head.appendChild(style);
            } catch (e) {
              const link = document.createElement('link');
              link.rel = 'stylesheet';
              link.type = styleSheet.type;
              link.media = styleSheet.media;
              link.href = styleSheet.href;
              pipWin.document.head.appendChild(link);
            }
          });

          pipRootRef.current = createRoot(container);
          renderPipContent();

          pipWin.addEventListener('pagehide', () => {
            if (pipRootRef.current) {
              try {
                pipRootRef.current.unmount();
              } catch (e) {}
              pipRootRef.current = null;
            }
            onClose();
          });
        } catch (e) {
          console.error('Failed to open Document Picture-in-Picture window:', e);
          alert('開啟懸浮視窗失敗，請確認使用最新版 Chrome 瀏覽器。');
          onClose();
        }
      };

      openPipWindow();
    } else if (!isOpen && pipWindowRef.current) {
      if (pipRootRef.current) {
        try {
          pipRootRef.current.unmount();
        } catch (e) {}
        pipRootRef.current = null;
      }
      try {
        pipWindowRef.current.close();
      } catch (e) {}
      pipWindowRef.current = null;
    }

    return () => {
      if (pipRootRef.current) {
        try {
          pipRootRef.current.unmount();
        } catch (e) {}
        pipRootRef.current = null;
      }
      if (pipWindowRef.current) {
        try {
          pipWindowRef.current.close();
        } catch (e) {}
        pipWindowRef.current = null;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (pipRootRef.current) {
      renderPipContent();
    }
  }, [globalSeconds, activeNodes, taskTimers, onCompleteSuccess, onCompleteFail, isRunning, onToggleRunning]);

  return null;
}

