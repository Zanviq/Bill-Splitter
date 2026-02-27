import React, { useMemo, useRef, useState } from 'react';
import { Person, ExpenseItem, ReceiptItem } from '../types';
import { Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ReceiptCardProps {
  person: Person;
  items: ExpenseItem[];
  bankName?: string;
  accountNumber?: string;
}

const ReceiptCard: React.FC<ReceiptCardProps> = ({ person, items, bankName, accountNumber }) => {
  const [isSaving, setIsSaving] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const myItems: ReceiptItem[] = useMemo(() => {
    return items
      .filter((item) => item.sharedBy.includes(person.id))
      .map((item) => ({
        name: item.name,
        originalPrice: item.price,
        sharerCount: item.sharedBy.length,
        amount: item.price / item.sharedBy.length,
      }));
  }, [items, person.id]);

  const total = myItems.reduce((sum, item) => sum + item.amount, 0);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cardRef.current || isSaving) return;

    setIsSaving(true);
    try {
      // Add padding and background for the capture
      const originalStyle = cardRef.current.style.cssText;
      cardRef.current.style.padding = '40px';
      cardRef.current.style.backgroundColor = '#f1f5f9';
      cardRef.current.style.borderRadius = '16px';

      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: '#f1f5f9',
        logging: false,
        useCORS: true,
      });

      // Restore style
      cardRef.current.style.cssText = originalStyle;

      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      link.download = `${person.name}_receipt_${date}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to save individual receipt:', err);
      alert('영수증 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div ref={cardRef} className="group relative w-full max-w-sm mx-auto transition-transform duration-300 hover:-translate-y-1 p-4 rounded-xl">
      {/* Individual Download Button - z-index lowered to 20 to avoid covering navbar */}
      <button 
        data-html2canvas-ignore="true"
        onClick={handleSave}
        disabled={isSaving}
        className="absolute top-0 right-0 z-20 p-2 bg-slate-800 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-90 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
        title={`${person.name} 영수증 저장`}
      >
        {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Download className="w-4 h-4" />}
      </button>

      {/* Capture Target - Inner Card */}
      <div className="relative bg-white drop-shadow-xl">
        {/* Receipt Paper Effect */}
        <div className="p-6 pb-8 bg-white text-slate-800 relative z-10">
          
          {/* Header */}
          <div className="text-center border-b-2 border-dashed border-slate-300 pb-4 mb-4">
            <h3 className="font-bold text-xl uppercase tracking-widest text-slate-900">{person.name}</h3>
            <p className="text-xs text-slate-500 font-mono mt-1">
              {new Date().toLocaleDateString()} • #USER-{person.id}
            </p>
          </div>

          {/* Items List */}
          <div className="font-mono text-sm space-y-3 min-h-[150px] pr-2">
            {myItems.length === 0 ? (
              <div className="text-center text-slate-400 italic py-10">
                항목 없음
              </div>
            ) : (
              myItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start group">
                  <div className="flex-1 pr-2 min-w-0">
                    <div className="font-medium text-slate-700 break-words leading-tight">{item.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {item.originalPrice.toLocaleString()} / {item.sharerCount}명
                    </div>
                  </div>
                  <div className="font-bold text-slate-800 whitespace-nowrap ml-2">
                    {Math.round(item.amount).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Total */}
          <div className="border-t-2 border-dashed border-slate-300 pt-4 mt-4">
            <div className="flex justify-between items-end">
              <span className="font-bold text-lg">TOTAL</span>
              <span className="font-mono font-black text-2xl text-indigo-600">
                ₩{Math.round(total).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Bank Details */}
          {(bankName || accountNumber) && (
            <div className="mt-6 pt-4 border-t-2 border-dashed border-slate-300 text-center">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1.5">Transfer to</div>
              <div className="bg-slate-50 rounded-lg p-2">
                  {bankName && <div className="text-sm font-bold text-slate-700">{bankName}</div>}
                  {accountNumber && <div className="font-mono text-sm text-slate-900 tracking-tight">{accountNumber}</div>}
              </div>
            </div>
          )}

          {/* Barcode Deco */}
          {(!bankName && !accountNumber) && (
            <div className="mt-6 flex justify-center opacity-40">
              <div className="h-8 w-full bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#000_2px,#000_4px)]"></div>
            </div>
          )}
        </div>

        {/* Jagged Bottom Edge */}
        <div 
          className="absolute bottom-[-10px] left-0 right-0 h-[20px] bg-white z-10"
          style={{
            maskImage: 'radial-gradient(circle at 10px 16px, transparent 10px, black 11px)',
            maskSize: '20px 20px',
            maskPosition: '0 0',
            WebkitMaskImage: 'radial-gradient(circle at 10px 16px, transparent 10px, black 11px)',
            WebkitMaskSize: '20px 20px',
            WebkitMaskPosition: '0px -10px',
            maskRepeat: 'repeat-x',
            WebkitMaskRepeat: 'repeat-x',
          }}
        />
      </div>
    </div>
  );
};

export default ReceiptCard;