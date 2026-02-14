import { History, Move } from './logic';

export interface GraphNode {
  id: string;
  type: 'START' | 'MOVE' | 'CONDITION';
  data: {
    move?: Move;
    conditionType?: 'OPPONENT_LAST' | 'MY_LAST';
    expectedMove?: Move;
  };
}

export interface GraphEdge {
  from: string;
  to: string;
  type?: 'yes' | 'no';
}

export interface StrategyGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function compileGraphToFunction(graph: StrategyGraph): (history: History) => Move {
  return (history: History) => {
    let currentNode = graph.nodes.find(n => n.type === 'START');
    
    // Safety limit to prevent infinite loops in the graph
    let iterations = 0;
    const MAX_ITERATIONS = 100;

    while (currentNode && iterations < MAX_ITERATIONS) {
      iterations++;

      if (currentNode.type === 'MOVE') {
        return currentNode.data.move || 'cooperate';
      }

      if (currentNode.type === 'CONDITION') {
        const lastInteraction = history.length > 0 ? history[history.length - 1] : null;
        let conditionMet = false;

        if (lastInteraction) {
          const moveToCheck = currentNode.data.conditionType === 'MY_LAST' 
            ? lastInteraction.myMove 
            : lastInteraction.opponentMove;
          
          conditionMet = moveToCheck === currentNode.data.expectedMove;
        }

        const edgeType = conditionMet ? 'yes' : 'no';
        const nextEdge = graph.edges.find(e => e.from === currentNode?.id && e.type === edgeType);
        
        if (!nextEdge) {
          // If no specific branch, try to find a default 'next' or just stop
          const defaultEdge = graph.edges.find(e => e.from === currentNode?.id);
          currentNode = graph.nodes.find(n => n.id === defaultEdge?.to);
        } else {
          currentNode = graph.nodes.find(n => n.id === nextEdge.to);
        }
        continue;
      }

      // START node or fallthrough
      const edge = graph.edges.find(e => e.from === currentNode?.id);
      if (!edge) break;
      currentNode = graph.nodes.find(n => n.id === edge.to);
    }

    return 'cooperate'; // Fallback
  };
}
