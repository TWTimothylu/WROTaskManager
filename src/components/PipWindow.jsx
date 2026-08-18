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

  // Window aspect ratio determines whether multiple tasks are placed side-by-side or stacked
  // Wide window (aspect ratio >= 1.25) -> row layout; Square / tall window -> column layout
  const isRowLayout = isMultiTask ? (size.width / size.height >= 1.25) : false;

  // Global header scaling
  const headerScale = Math.max(0.65, Math.min(size.width / 420, size.height / 260, 2.0));
  const hs = (base, min = 0) => Math.max(min, Math.round(base * headerScale));

  // Compute available space per task card
  const headerHeightApprox = hs(42, 32);
  const containerPadding = Math.max(6, Math.round(10 * headerScale));
  const cardGap = Math.max(6, Math.round(8 * headerScale));

  const availableWidth = size.width - (containerPadding * 2);
  const availableHeight = size.height - (containerPadding * 2) - headerHeightApprox - cardGap;

  const cardWidth = isMultiTask
    ? (isRowLayout ? (availableWidth - (cardGap * (taskCount - 1))) / taskCount : availableWidth)
    : availableWidth;

  const cardHeight = isMultiTask
    ? (isRowLayout ? availableHeight : (availableHeight - (cardGap * (taskCount - 1))) / taskCount)
    : availableHeight;

  // Card internal scaling factor based on actual card dimensions
  const cardScale = Math.max(0.65, Math.min(cardWidth / 250, cardHeight / 130, 2.0));
  const cs = (base, min = 0) => Math.max(min, Math.round(base * cardScale));

  // Decide if card internal elements should use stacked or horizontal layout
  const isCardNarrow = cardWidth < 220;

  return (
    <div
      ref={containerRef}
      style={{
        padding: `${containerPadding}px`,
        color: '#fff3e6',
        fontFamily: "'Chakra Petch', 'Zen Old Mincho', 'Noto Sans TC', sans-serif",
        background: '#040303',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: `${cardGap}px`,
        overflow: 'hidden'
      }}
    >
      {/* Header with Play/Pause and Global Timer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,102,0,0.35)',
        paddingBottom: `${hs(6, 3)}px`,
        gap: `${hs(6, 3)}px`,
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: `${hs(6, 3)}px`, minWidth: 0 }}>
          <img
            src="./icon.png"
            alt="WRO"
            style={{
              width: `${hs(18, 12)}px`,
              height: `${hs(18, 12)}px`,
              objectFit: 'contain',
              borderRadius: '3px',
              flexShrink: 0
            }}
          />
          <span style={{
            fontSize: `${hs(12, 9)}px`,
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
              padding: `${hs(3, 2)}px ${hs(8, 4)}px`,
              fontSize: `${hs(11, 8)}px`,
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

        <div style={{ display: 'flex', alignItems: 'center', gap: `${hs(6, 3)}px`, flexShrink: 0 }}>
          <span style={{
            fontSize: `${hs(11, 8)}px`,
            color: '#ffaa00',
            fontWeight: 700,
            letterSpacing: '1px',
            whiteSpace: 'nowrap'
          }}>
            總剩餘
          </span>
          <span className="display-time" style={{
            fontFamily: 'var(--font-family-digital), DS-Digital, Share Tech Mono, monospace',
            fontSize: `${hs(28, 16)}px`,
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

      {/* Active Tasks Grid/Stack Area */}
      <div style={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        display: 'flex',
        flexDirection: isRowLayout ? 'row' : 'column',
        gap: `${cardGap}px`,
        alignItems: 'stretch',
        overflow: 'hidden'
      }}>
        {taskCount > 0 ? (
          activeNodes.map(node => {
            const nameLen = (node.name || '').length;
            const taskTitleFontSize = nameLen > 12 ? cs(13, 9) : cs(15, 10);
            const buttonFontSize = isCardNarrow ? cs(10, 8) : cs(11, 8);
            const successBtnText = isCardNarrow ? '[ 達成主線 ]' : '[ 達成主線 (成功) ]';
            const failBtnText = isCardNarrow ? '[ 執行備援 ]' : '[ 執行備援 (失敗) ]';

            return (
              <div
                key={node.id}
                style={{
                  background: 'rgba(20, 10, 5, 0.95)',
                  border: '1px solid #ff5500',
                  boxShadow: '0 0 15px rgba(255, 85, 0, 0.3)',
                  padding: `${cs(8, 4)}px`,
                  flex: '1 1 0',
                  minHeight: 0,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: `${cs(4, 2)}px`,
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                  boxSizing: 'border-box'
                }}
              >
                {/* Main Content Area */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: `${cs(8, 4)}px`,
                  flex: 1,
                  minHeight: 0,
                  minWidth: 0
                }}>
                  {/* Left: Task Header & Name */}
                  <div style={{
                    flex: 1,
                    minWidth: 0,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      fontSize: `${cs(10, 7)}px`,
                      color: '#ffaa00',
                      fontWeight: 700,
                      marginBottom: `${cs(2, 1)}px`,
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

                    {node.description && cardHeight > 130 && (
                      <div style={{
                        fontSize: `${cs(10, 7)}px`,
                        color: '#d99b6c',
                        borderLeft: '2px solid #ff5500',
                        paddingLeft: `${cs(4, 2)}px`,
                        marginTop: `${cs(2, 1)}px`,
                        lineHeight: 1.2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        wordBreak: 'break-word'
                      }}>
                        {node.description}
                      </div>
                    )}
                  </div>

                  {/* Right: Task Timer */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    flexShrink: 0,
                    paddingLeft: `${cs(6, 2)}px`
                  }}>
                    <span style={{
                      fontSize: `${cs(10, 7)}px`,
                      color: '#ffaa00',
                      fontWeight: 700,
                      letterSpacing: '1px',
                      marginBottom: `${cs(2, 1)}px`,
                      whiteSpace: 'nowrap'
                    }}>
                      任務剩餘時間
                    </span>
                    <div className="display-time" style={{
                      fontSize: `${cs(30, 16)}px`,
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

                {/* Bottom Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: `${cs(6, 3)}px`,
                  marginTop: `${cs(4, 2)}px`,
                  flexShrink: 0,
                  minWidth: 0
                }}>
                  <button
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: 'rgba(0, 255, 102, 0.2)',
                      border: '1px solid #00ff66',
                      color: '#00ff66',
                      padding: `${cs(5, 2)}px ${cs(4, 2)}px`,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: `${buttonFontSize}px`,
                      fontFamily: 'Orbitron, sans-serif',
                      letterSpacing: '0.5px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
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
                      minWidth: 0,
                      background: 'rgba(255, 0, 51, 0.2)',
                      border: '1px solid #ff0033',
                      color: '#ff0033',
                      padding: `${cs(5, 2)}px ${cs(4, 2)}px`,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: `${buttonFontSize}px`,
                      fontFamily: 'Orbitron, sans-serif',
                      letterSpacing: '0.5px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
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
            padding: `${hs(10, 4)}px`,
            textAlign: 'center',
            color: '#805633',
            fontSize: `${hs(13, 9)}px`,
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

