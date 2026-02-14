import { useState, useRef, useEffect } from 'react'
import { Plus, X, Play, ShieldAlert, GitBranch } from 'lucide-react'

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
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const node = nodes.find(n => n.id === id)
    if (!node) return

    setDraggingId(id)
    // Calculate offset from mouse to node top-left
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    // We can't easily get the node's rect here without a ref map, so we'll approximate 
    // or just use the mouse position relative to the node position we know.
    // Simpler: Just track the mouse movement delta.
    // Let's rely on the container relative coordinates.
  }
  
  // Better drag implementation
  const startDrag = (e: React.MouseEvent, node: Node) => {
    e.stopPropagation()
    setDraggingId(node.id)
    if (containerRef.current) {
        const bounds = containerRef.current.getBoundingClientRect()
        setDragOffset({
            x: e.clientX - bounds.left - node.x,
            y: e.clientY - bounds.top - node.y
        })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingId && containerRef.current) {
      const bounds = containerRef.current.getBoundingClientRect()
      const x = e.clientX - bounds.left - dragOffset.x
      const y = e.clientY - bounds.top - dragOffset.y
      
      setNodes(prev => prev.map(n => 
        n.id === draggingId ? { ...n, x, y } : n
      ))
    }
  }

  const handleMouseUp = () => {
    setDraggingId(null)
  }

  const addNode = (type: NodeType) => {
    const id = `node_${Date.now()}`
    setNodes(prev => [...prev, {
      id,
      type,
      x: 100 + Math.random() * 50,
      y: 100 + Math.random() * 50,
      data: {}
    }])
  }

  const deleteNode = (id: string) => {
    if (id === 'start') return // Protect start node
    setNodes(prev => prev.filter(n => n.id !== id))
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[500px] border border-terminal-fg/20 bg-terminal-bg overflow-hidden cursor-crosshair select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="absolute top-2 right-2 flex gap-2 z-10">
        <button 
            onClick={() => addNode('MOVE')}
            className="flex items-center gap-1 bg-terminal-dim text-[10px] px-2 py-1 border border-terminal-fg/30 hover:bg-terminal-fg hover:text-terminal-bg transition-colors"
        >
            <Play size={10} /> + ACTION
        </button>
        <button 
            onClick={() => addNode('CONDITION')}
            className="flex items-center gap-1 bg-terminal-dim text-[10px] px-2 py-1 border border-terminal-fg/30 hover:bg-terminal-fg hover:text-terminal-bg transition-colors"
        >
            <GitBranch size={10} /> + CONDITION
        </button>
      </div>
      
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {nodes.map(node => (
        <div 
          key={node.id}
          className={`absolute border p-2 min-w-[120px] text-xs shadow-lg transition-shadow
            ${draggingId === node.id ? 'border-terminal-accent shadow-terminal-accent/20 z-20' : 'border-terminal-fg bg-terminal-bg z-10'}
          `}
          style={{ left: node.x, top: node.y, cursor: 'grab' }}
          onMouseDown={(e) => startDrag(e, node)}
        >
          <div className="flex justify-between items-center border-b border-terminal-fg/30 mb-2 pb-1 opacity-50">
            <span className="font-bold">{node.type}</span>
            {node.type !== 'START' && (
                <button onClick={(e) => { e.stopPropagation(); deleteNode(node.id) }} className="hover:text-red-500">
                    <X size={10} />
                </button>
            )}
          </div>

          <div className="space-y-2">
            {node.type === 'START' && <div className="text-terminal-accent">ENTRY POINT</div>}
            
            {node.type === 'MOVE' && (
                <select 
                    className="bg-terminal-dim text-terminal-fg border border-terminal-fg/30 outline-none w-full p-1 text-[10px]"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                <option>COOPERATE</option>
                <option>DEFECT</option>
                </select>
            )}
            
            {node.type === 'CONDITION' && (
                <div className="space-y-1">
                <select 
                    className="bg-terminal-dim text-terminal-fg border border-terminal-fg/30 outline-none w-full p-1 text-[10px]"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <option>IF OPPONENT == COOPERATE</option>
                    <option>IF OPPONENT == DEFECT</option>
                    <option>IF MY LAST == COOPERATE</option>
                </select>
                <div className="flex justify-between text-[10px] pt-1">
                    <div className="w-3 h-3 bg-terminal-fg rounded-full mx-auto" title="True Output"></div>
                    <div className="w-3 h-3 bg-red-500/50 rounded-full mx-auto" title="False Output"></div>
                </div>
                </div>
            )}

            {/* Output Port */}
            {(node.type === 'START' || node.type === 'MOVE') && (
                 <div className="w-3 h-3 bg-terminal-fg rounded-full mx-auto mt-2 cursor-crosshair hover:scale-125 transition-transform" title="Output"></div>
            )}
          </div>
        </div>
      ))}

      <div className="absolute bottom-2 left-2 text-[10px] opacity-40 font-mono">
        COORD: {Math.round(dragOffset.x)}, {Math.round(dragOffset.y)} | NODES: {nodes.length}
      </div>
    </div>
  )
}

export default LogicBuilder
