// Pre-configured Default WRO Competition Tactical Task Tree Template

export const DEFAULT_WRO_TEMPLATE = {
  id: 'wro-60min-standard',
  name: 'WRO 機器人競賽 60分鐘標準戰術流程',
  totalDurationMinutes: 60,
  createdAt: new Date().toISOString(),
  description: '適用於 WRO 競賽測試時間（1~2小時），具備失敗備援分歧與併行測試測試點。',
  nodes: [
    {
      id: 'node-root',
      name: '場地硬體檢查與車體歸零 (Inspection)',
      allocatedMinutes: 5,
      description: '檢查馬達齒輪隙縫、顏色感測器白平衡校正、確認輪胎清潔。',
      status: 'pending',
      tier: 0,
      column: 0,
      successNextId: 'node-run1',
      failNextId: 'node-emergency-adjust'
    },
    {
      id: 'node-run1',
      name: '任務一：自動循線與地圖定位測試',
      allocatedMinutes: 10,
      description: '測試地圖 A 區到 B 區底盤 PID 循線精準度與轉彎陀螺儀角度。',
      status: 'pending',
      tier: 1,
      column: 0,
      successNextId: 'node-full-run',
      failNextId: 'node-sensor-recal'
    },
    {
      id: 'node-arm-tuning',
      name: '任務二：機械手臂抓取物體穩定度',
      allocatedMinutes: 10,
      description: '測試伺服馬達夾取方塊力道與舉升速度。與循線平行測試。',
      status: 'pending',
      tier: 1,
      column: 1,
      successNextId: 'node-full-run',
      failNextId: 'node-sensor-recal'
    },
    {
      id: 'node-sensor-recal',
      name: '【備援】顏色感測器閾值重新校減',
      allocatedMinutes: 8,
      description: '環境光變化導致循線偏移，重新採樣黑白與色彩數值。',
      status: 'pending',
      tier: 2,
      column: 0,
      successNextId: 'node-full-run',
      failNextId: 'node-backup-route'
    },
    {
      id: 'node-full-run',
      name: '滿分挑戰：全任務連貫試跑 (Run 1)',
      allocatedMinutes: 15,
      description: '發射計時！從基地出發完成第一階段所有得分點並返回基地。',
      status: 'pending',
      tier: 2,
      column: 1,
      successNextId: 'node-battery-swap',
      failNextId: 'node-backup-route'
    },
    {
      id: 'node-backup-route',
      name: '【備援】保守戰術路線程式切換',
      allocatedMinutes: 7,
      description: '捨棄高風險得分點，切換至穩定得分之備用路線程式。',
      status: 'pending',
      tier: 3,
      column: 0,
      successNextId: 'node-final-check',
      failNextId: 'node-final-check'
    },
    {
      id: 'node-battery-swap',
      name: '電池更換與輪胎清潔',
      allocatedMinutes: 5,
      description: '更換飽電鋰電池，使用去漬油清潔輪胎表面確保最佳抓地力。',
      status: 'pending',
      tier: 3,
      column: 1,
      successNextId: 'node-final-check',
      failNextId: 'node-final-check'
    },
    {
      id: 'node-final-check',
      name: '檢錄前最終車體檢查與程式封裝',
      allocatedMinutes: 5,
      description: '確認車體尺寸不超規、上傳最終版程式，準備進場檢錄。',
      status: 'pending',
      tier: 4,
      column: 0,
      successNextId: null,
      failNextId: null
    }
  ]
};
