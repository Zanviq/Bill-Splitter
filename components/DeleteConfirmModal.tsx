import React from 'react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full transform transition-all scale-100">
        <h3 className="text-lg font-bold text-slate-900 mb-2">항목 삭제</h3>
        <p className="text-slate-500 mb-6 text-sm leading-relaxed">
          선택한 항목을 내역에서 삭제하시겠습니까?
        </p>
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
          >
            취소
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-md shadow-red-200 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;