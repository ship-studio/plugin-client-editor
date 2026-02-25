import { useEffect } from 'react';

const STYLE_ID = 'ce-plugin-styles';

const pluginCSS = `
.ce-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}
.ce-modal {
  width: 480px;
  max-height: 80vh;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.ce-header {
  padding: 16px 20px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ce-tabs {
  display: flex;
  gap: 0;
}
.ce-tab {
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.15s;
}
.ce-tab:hover {
  opacity: 0.8;
}
.ce-body {
  padding: 20px;
  overflow-y: auto;
  font-size: 13px;
  line-height: 1.5;
  display: flex;
  flex-direction: column;
}
.ce-section {
  margin-bottom: 16px;
}
.ce-section-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}
.ce-input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
}
.ce-input:focus {
  border-color: var(--accent);
}
.ce-select {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
}
.ce-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: opacity 0.15s;
}
.ce-btn:hover {
  opacity: 0.85;
}
.ce-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.ce-error {
  font-size: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  margin-top: 8px;
}
.ce-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
}
.ce-row + .ce-row {
  margin-top: 4px;
}
.ce-badge {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
}
.ce-form-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.ce-radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ce-radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  cursor: pointer;
}
.ce-divider {
  height: 1px;
  background: var(--border);
  margin: 16px 0;
}
.ce-empty {
  font-size: 12px;
  padding: 12px;
  text-align: center;
  border-radius: 6px;
}
`;

export function useInjectStyles() {
  useEffect(() => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = pluginCSS;
    document.head.appendChild(style);
    return () => {
      document.getElementById(STYLE_ID)?.remove();
    };
  }, []);
}
