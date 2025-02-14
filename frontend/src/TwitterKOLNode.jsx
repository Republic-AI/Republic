import React, { useState } from 'react';
import { Handle } from 'reactflow';

export default function TwitterKOLNode({ data }) {
  const [kols, setKols] = useState(data.kolList || []);
  const [newKOL, setNewKOL] = useState('');
  const [isConfigOpen, setIsConfigOpen] = useState(true);

  const handleAddKOL = () => {
    if (newKOL && !kols.includes(newKOL)) {
      const updatedKOLs = [...kols, newKOL];
      setKols(updatedKOLs);
      data.onChange({
        ...data,
        kolList: updatedKOLs
      });
      setNewKOL('');
    }
  };

  const handleRemoveKOL = (kol) => {
    const updatedKOLs = kols.filter(k => k !== kol);
    setKols(updatedKOLs);
    data.onChange({
      ...data,
      kolList: updatedKOLs
    });
  };

  return (
    <div className={`custom-node ${isConfigOpen ? 'expanded' : ''}`}>
      <Handle type="target" position="left" />

      <div className="node-header">
        <select className="node-type-select" value="twitterKOL" disabled>
          <option value="twitterKOL">Twitter KOL List</option>
        </select>
        <button
          className="config-toggle"
          onClick={() => setIsConfigOpen(!isConfigOpen)}
        >
          {isConfigOpen ? '▼' : '▲'}
        </button>
      </div>

      {isConfigOpen && (
        <div className="node-config">
          <div className="config-section">
            <h4>Twitter KOLs</h4>
            <div className="kol-input-container">
              <input
                type="text"
                value={newKOL}
                onChange={(e) => setNewKOL(e.target.value)}
                placeholder="Enter Twitter handle (without @)"
                className="node-input"
              />
              <button
                onClick={handleAddKOL}
                className="add-kol-btn"
              >
                Add
              </button>
            </div>

            <ul className="kol-list">
              {kols.map((kol, index) => (
                <li key={index} className="kol-item">
                  @{kol}
                  <button
                    onClick={() => handleRemoveKOL(kol)}
                    className="remove-kol-btn"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <Handle type="source" position="right" />
    </div>
  );
} 