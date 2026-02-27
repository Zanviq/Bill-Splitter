import React, { useState, useRef } from 'react';
import { ExpenseItem, Person } from '../types';
import { X, Receipt, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

interface TotalListModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ExpenseItem[];
  people: Person[];
  onDeleteItem: (id: string) => void;
}

const TotalListModal: React.FC<TotalListModalProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  people,
  onDeleteItem 
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

  // Helper to get person names from IDs
  const getSharerNames = (sharerIds: string[]) => {
    return sharerIds
      .map(id => people.find(p => p.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const handleSaveImage = async () => {
    if (!cardRef.current || isSaving) return;

    setIsSaving(true);
    try {
      // Clone the node to capture full height without scrollbars
      const element = cardRef.current;
      const clone = element.cloneNode(true) as HTMLElement;
      
      // Setup clone styles to expand full content
      clone.style.position = 'fixed';
      clone.style.top = '-10000px';
      clone.style.left = '-10000px';
      clone.style.maxHeight = 'none'; // Remove max-height constraint
      clone.style.height = 'auto';
      clone.style.overflow = 'visible'; // Show overflow
      clone.style.width = `${element.offsetWidth}px`;
      clone.style.transform = 'none'; // Clear any transforms
      clone.style.zIndex = '-1000';

      // Fix internal scrollable area in clone
      const scrollableContent = clone.querySelector('.overflow-y-auto') as HTMLElement;
      if (scrollableContent) {
        scrollableContent.style.overflow = 'visible';
        scrollableContent.style.height = 'auto';
        scrollableContent.style.flex = 'none';
        scrollableContent.classList.remove('overflow-y-auto');
      }

      // Hide close button and save button in capture
      const buttons = clone.querySelectorAll('button');
      buttons.forEach(btn => btn.style.display = 'none');

      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      });

      document.body.removeChild(clone);

      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      link.download = `total-list-${date}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to save total list:', err);
      alert('이미지 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div 
        ref={cardRef} 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2 text-slate-800">
            <Receipt className="text-indigo-600" size={20} />
            <h2 className="font-bold text-lg">전체 내역</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveImage}
              disabled={isSaving}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600 disabled:opacity-50"
              title="이미지로 저장"
            >
              {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
              title="닫기"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 space-y-3 flex-1">
          {items.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p>아직 추가된 항목이 없습니다.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow flex gap-3 group">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-slate-800 truncate">{item.name}</span>
                    <span className="font-bold text-indigo-600 whitespace-nowrap ml-2">
                      {item.price.toLocaleString()}원
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    분담: {getSharerNames(item.sharedBy)}
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteItem(item.id);
                  }}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-red-500 hover:text-white transition-all self-center flex-shrink-0"
                  title="항목 삭제"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50">
          <div className="flex justify-between items-end">
            <span className="text-slate-500 font-medium">총 합계</span>
            <span className="text-2xl font-black text-slate-900">
              {totalAmount.toLocaleString()}원
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalListModal;