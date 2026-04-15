import React from 'react';
export default function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
      <div className="bg-[#111] border border-red-500/20 rounded-2xl w-full max-w-sm p-6 text-center">
        <div className="text-4xl mb-4">🗑️</div>
        <h3 className="text-white font-bold text-lg mb-2">{title || 'Підтвердіть дію'}</h3>
        <p className="text-gray-500 text-sm mb-6">{message || 'Цю дію неможливо скасувати.'}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 bg-[#1a1a1a] text-gray-300 text-sm rounded-lg hover:bg-[#222]">Скасувати</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 text-white font-bold text-sm rounded-lg hover:bg-red-600">Видалити</button>
        </div>
      </div>
    </div>
  );
}
