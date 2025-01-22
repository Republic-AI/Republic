import React from 'react';

export default function NodeConfigPanel({ nodes, setNodes }) {

  // 选择某个节点来编辑
  const handleTypeChange = (nodeId, newType) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, type: newType } }
          : node
      )
    );
  };

  const handleInputChange = (nodeId, newInput) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, inputText: newInput } }
          : node
      )
    );
  };

  return (
    <div style={{ backgroundColor: '#eee', padding: 10, width: 300 }}>
      <h4>Node Config Panel</h4>
      {nodes.map((node) => (
        <div key={node.id} style={{ border: '1px solid #ccc', marginBottom: 8, padding: 8 }}>
          <div>Node ID: {node.id}</div>
          <select
            value={node.data.type}
            onChange={(e) => handleTypeChange(node.id, e.target.value)}
          >
            <option value="python-llm">Python LLM</option>
            <option value="node-llm">Node LLM</option>
          </select>
          <br />
          <textarea
            rows="2"
            cols="30"
            value={node.data.inputText}
            onChange={(e) => handleInputChange(node.id, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}