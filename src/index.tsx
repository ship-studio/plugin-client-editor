import { useState } from 'react';
import { usePluginContext } from './context';
import { useInjectStyles } from './styles';
import { Modal } from './Modal';

function ToolbarButton() {
  const [modalOpen, setModalOpen] = useState(false);
  const ctx = usePluginContext();
  useInjectStyles();

  if (!ctx) return <span />;

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        title="Client Editor"
        className="toolbar-icon-btn"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </button>
      {modalOpen && <Modal onClose={() => setModalOpen(false)} />}
    </>
  );
}

export const name = 'Client Editor';

export const slots = {
  toolbar: ToolbarButton,
};

export function onActivate() {
  console.log('[client-editor] Plugin activated');
}

export function onDeactivate() {
  console.log('[client-editor] Plugin deactivated');
}
