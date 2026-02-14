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

interface LogicBuilderProps {
  onChange?: (graph: { nodes: Node[], edges: any[] }) => void
}

function LogicBuilder({ onChange }: LogicBuilderProps) {
  const [nodes, setNodes] = useState<Node[]>([
    { id: 'start', type: 'START', x: 50, y: 50, data: {} },
  ])
  const [edges, setEdges] = useState<{ id: string; from: string; to: string; type?: 'yes' | 'no' }[]>([])

  useEffect(() => {
    if (onChange) {
      onChange({ nodes, edges })
    }
  }, [nodes, edges, onChange])
  const [connecting, setConnecting] = useState<{ nodeId: string; type?: 'yes' | 'no' } | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

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
    setConnecting(null) // Cancel connection if dropped on nothing
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
    setEdges(prev => prev.filter(e => e.from !== id && e.to !== id))
  }

  const updateNodeData = (id: string, data: any) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n))
  }

  const startConnection = (e: React.MouseEvent, nodeId: string, type?: 'yes' | 'no') => {
    e.stopPropagation()
    setConnecting({ nodeId, type })
  }

  const completeConnection = (e: React.MouseEvent, targetNodeId: string) => {
    e.stopPropagation()
    if (!connecting) return
    if (connecting.nodeId === targetNodeId) return // No self-loops

    setEdges(prev => [
      ...prev.filter(edge => edge.from !== connecting.nodeId || edge.type !== connecting.type),
      { 
        id: `${connecting.nodeId}-${targetNodeId}-${Date.now()}`,
        from: connecting.nodeId,
        to: targetNodeId,
        type: connecting.type
      }
    ])
    setConnecting(null)
  }

  // Calculate connection lines
  const getPortPos = (node: Node, type?: 'yes' | 'no') => {
    // These offsets need to match where the DOM elements are rendered
    const width = 140 // Approx width
    if (node.type === 'CONDITION') {
        if (type === 'yes') return { x: node.x + 20, y: node.y + 75 }
        if (type === 'no') return { x: node.x + 120, y: node.y + 75 }
    }
    return { x: node.x + 70, y: node.y + (node.type === 'START' ? 45 : 75) }
  }

  const getTargetPos = (node: Node) => {
      return { x: node.x + 70, y: node.y }
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[500px] border border-terminal-fg/20 bg-terminal-bg overflow-hidden cursor-crosshair select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Controls */}
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
      
      {/* SVG Layer for Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-terminal-fg/10" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Drawn Edges */}
        {edges.map(edge => {
            const fromNode = nodes.find(n => n.id === edge.from)
            const toNode = nodes.find(n => n.id === edge.to)
            if (!fromNode || !toNode) return null
            
            const start = getPortPos(fromNode, edge.type)
            const end = getTargetPos(toNode)

            return (
                <path 
                    key={edge.id}
                    d={`M ${start.x} ${start.y} C ${start.x} ${start.y + 50}, ${end.x} ${end.y - 50}, ${end.x} ${end.y}`}
                    fill="none"
                    stroke={edge.type === 'no' ? '#ef4444' : 'currentColor'}
                    strokeWidth="2"
                    className="opacity-60"
                />
            )
        })}

        {/* Active Connection Line (Dragging) */}
        {connecting && (() => {
            const fromNode = nodes.find(n => n.id === connecting.nodeId)
            if (!fromNode || !containerRef.current) return null
            // We need current mouse pos, but that's in state/event... 
            // Simplified: Just draw a straight line to nowhere or skip for now
            return null
        })()}
      </svg>

      {/* Nodes */}
      {nodes.map(node => (
        <div 
          key={node.id}
          className={`absolute border p-2 min-w-[140px] text-xs shadow-lg transition-shadow bg-terminal-bg
            ${draggingId === node.id ? 'border-terminal-accent shadow-terminal-accent/20 z-20' : 'border-terminal-fg z-10'}
          `}
          style={{ left: node.x, top: node.y, cursor: 'grab' }}
          onMouseDown={(e) => startDrag(e, node)}
          onMouseUp={(e) => completeConnection(e, node.id)}
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-terminal-fg/30 mb-2 pb-1 opacity-50">
            <span className="font-bold">{node.type}</span>
            {node.type !== 'START' && (
                <button onClick={(e) => { e.stopPropagation(); deleteNode(node.id) }} className="hover:text-red-500">
                    <X size={10} />
                </button>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            {node.type === 'START' && <div className="text-terminal-accent text-center pb-2">ENTRY POINT</div>}
            
            {node.type === 'MOVE' && (
                <select 
                    value={node.data.move || 'cooperate'}
                    onChange={(e) => updateNodeData(node.id, { move: e.target.value.toLowerCase() })}
                    className="bg-terminal-dim text-terminal-fg border border-terminal-fg/30 outline-none w-full p-1 text-[10px]"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                <option value="cooperate">COOPERATE</option>
                <option value="defect">DEFECT</option>
                </select>
            )}
            
            {node.type === 'CONDITION' && (
                <div className="space-y-1">
                <select 
                    value={`${node.data.conditionType || 'OPPONENT_LAST'}_${node.data.expectedMove || 'defect'}`}
                    onChange={(e) => {
                        const [type, move] = e.target.value.split('_');
                        updateNodeData(node.id, { conditionType: type, expectedMove: move.toLowerCase() });
                    }}
                    className="bg-terminal-dim text-terminal-fg border border-terminal-fg/30 outline-none w-full p-1 text-[10px]"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <option value="OPPONENT_LAST_defect">OPPONENT LAST == D</option>
                    <option value="OPPONENT_LAST_cooperate">OPPONENT LAST == C</option>
                    <option value="MY_LAST_defect">MY LAST == D</option>
                    <option value="MY_LAST_cooperate">MY LAST == C</option>
                </select>
                </div>
            )}

            {/* Output Ports */}
            {node.type === 'CONDITION' ? (
                <div className="flex justify-between text-[10px] pt-2 px-2">
                    <div 
                        className="w-3 h-3 bg-terminal-fg rounded-full cursor-crosshair hover:scale-150 transition-transform" 
                        title="Connect True"
                        onMouseDown={(e) => startConnection(e, node.id, 'yes')}
                    ></div>
                    <div 
                        className="w-3 h-3 bg-red-500/50 rounded-full cursor-crosshair hover:scale-150 transition-transform" 
                        title="Connect False"
                        onMouseDown={(e) => startConnection(e, node.id, 'no')}
                    ></div>
                </div>
            ) : (
                 <div 
                    className="w-3 h-3 bg-terminal-fg rounded-full mx-auto mt-1 cursor-crosshair hover:scale-150 transition-transform" 
                    title="Connect Output"
                    onMouseDown={(e) => startConnection(e, node.id)}
                 ></div>
            )}
          </div>
        </div>
      ))}

      <div className="absolute bottom-2 left-2 text-[10px] opacity-40 font-mono">
        NODES: {nodes.length} | EDGES: {edges.length} {connecting ? '| CONNECTING...' : ''}
      </div>
    </div>
  )
}

export default LogicBuilder
