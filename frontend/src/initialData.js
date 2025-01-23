export const initialNodes = [
    {
      id: '1',
      position: { x: 200, y: 100 },
      data: {
        type: 'python-llm',
        inputText: 'Hello from the Python node',
        config: {}
      }
    },
    {
      id: '2',
      position: { x: 600, y: 100 },
      data: {
        type: 'node-llm',
        inputText: 'Previously we got: {PREV_RESULT}',
        config: {}
      }
    }
  ];
  
  export const initialEdges = [
    { id: 'e1-2', source: '1', target: '2' }
  ];