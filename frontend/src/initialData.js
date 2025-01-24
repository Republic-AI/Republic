export const initialNodes = [
  {
    id: '1',
    position: { x: 100, y: 100 },
    data: {
      type: 'input',
      framework: 'input',
      inputText: '',
      config: {
        inputType: 'text'
      }
    }
  },
  {
    id: '2',
    position: { x: 700, y: 100 },
    data: {
      type: 'output',
      framework: 'output',
      inputText: '',
      config: {
        outputType: 'display'
      }
    }
  }
];

export const initialEdges = [];