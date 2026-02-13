import { useState } from 'react'

export type NodeType = 'START' | 'MOVE' | 'CONDITION'

export interface Node {
  id: string
  type: NodeType
  x: number
  y: number
  data: any
  next?: string
  yes?: string
  no?: string
}

function LogicBuilder() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: 'start', type: 'START', x: 50, y: 50, data: {} },
  ])

  return (
    <div className="relative w-full h-[500px] border border-terminal-fg/20 bg-terminal-bg overflow-hidden cursor-crosshair">
      <div className="absolute top-2 right-2 flex gap-2">
        <button className="bg-terminal-dim text-[10px] px-2 py-1 border border-terminal-fg/30 hover:bg-terminal-fg hover:text-terminal-bg">+ ACTION</button>
        <button className="bg-terminal-dim text-[10px] px-2 py-1 border border-terminal-fg/30 hover:bg-terminal-fg hover:text-terminal-bg">+ CONDITION</button>
      </div>
      
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
      </svg>

      {nodes.map(node => (
        <div 
          key={node.id}
          className="absolute border border-terminal-fg p-2 bg-terminal-bg min-w-[100px] text-xs select-none"
          style={{ left: node.x, top: node.y }}
        >
          <div className="border-b border-terminal-fg/30 mb-1 opacity-50">{node.type}</div>
          {node.type === 'START' && <div>ENTRY POINT</div>}
          {node.type === 'MOVE' && (
            <select className="bg-terminal-bg text-terminal-fg border-none outline-none w-full">
              <option>COOPERATE</option>
              <option>DEFECT</option>
            </select>
          )}
          {node.type === 'CONDITION' && (
            <div>
              <div className="mb-1">IF OPPONENT LAST == D</div>
              <div className="flex justify-between text-[10px]">
                <span>YES</span>
                <span>NO</span>
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="absolute bottom-2 left-2 text-[10px] opacity-40">
        DRAG TO REPOSITION | CLICK TO CONNECT
      </div>
    </div>
  )
}

export default LogicBuilder
