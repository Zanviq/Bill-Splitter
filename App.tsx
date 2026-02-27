import React, { useState } from 'react';
import { Person, ExpenseItem, AppStep } from './types';
import ReceiptCard from './components/ReceiptCard';
import InputBar from './components/InputBar';
import TotalListModal from './components/TotalListModal';
import ResetConfirmModal from './components/ResetConfirmModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import { Download, ArrowLeft, Users, ReceiptText } from 'lucide-react';
import html2canvas from 'html2canvas';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.SETUP);
  const [personCount, setPersonCount] = useState<number>(2);
  const [people, setPeople] = useState<Person[]>([]);
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isTotalListOpen, setIsTotalListOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  // Bank Details State
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  // Setup Step Logic
  const handleSetupComplete = () => {
    const newPeople: Person[] = Array.from({ length: personCount }, (_, i) => ({
      id: String(i + 1),
      name: `사람 ${i + 1}`,
    }));
    setPeople(newPeople);
    setStep(AppStep.CALCULATOR);
  };

  const updatePersonName = (id: string, newName: string) => {
    setPeople(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
  };

  // Calculator Logic
  const addItem = (name: string, price: number, sharedBy: string[]) => {
    const newItem: ExpenseItem = {
      id: Date.now().toString(),
      name,
      price,
      sharedBy,
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleRequestDelete = (id: string) => {
    setItemToDelete(id);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      setItems(prev => prev.filter(item => item.id !== itemToDelete));
      setItemToDelete(null);
    }
  };

  const handleResetClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If items exist, show custom modal instead of native confirm
    if (items.length > 0) {
      setIsResetConfirmOpen(true);
    } else {
      performReset();
    }
  };

  const performReset = () => {
    setItems([]);
    setPeople([]);
    setPersonCount(2);
    setBankName('');
    setAccountNumber('');
    setIsTotalListOpen(false);
    setIsResetConfirmOpen(false);
    setStep(AppStep.SETUP);
  };

  const handleSaveImage = async () => {
    const element = document.getElementById('receipts-grid');
    if (!element) {
        alert('저장할 영수증이 없습니다.');
        return;
    }
    
    try {
      setIsSaving(true);
      // Add padding and background for the capture
      const originalStyle = element.style.cssText;
      element.style.padding = '60px';
      element.style.backgroundColor = '#f1f5f9';
      element.style.borderRadius = '20px'; // Optional: add rounded corners to the background itself if desired, but standard rectangular image is fine. Let's stick to padding.

      const canvas = await html2canvas(element, {
        backgroundColor: '#f1f5f9',
        scale: 2, // Higher resolution
        useCORS: true,
        logging: false
      });

      // Restore style
      element.style.cssText = originalStyle;

      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      link.download = `dutch-pay-receipts-${date}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Image save failed:', err);
      alert('이미지 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // --- RENDER ---

  if (step === AppStep.SETUP) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Dutch Pay Master</h1>
            <p className="text-slate-500">영수증을 나누는 가장 깔끔한 방법</p>
          </div>

          <div className="py-6 border-b border-dashed border-slate-200">
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">참여 인원 수</label>
            <div className="flex items-center justify-center gap-6">
              <button 
                onClick={() => setPersonCount(Math.max(2, personCount - 1))}
                className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-600 transition-colors"
              >-</button>
              <span className="text-6xl font-black text-indigo-600 w-24 tabular-nums">{personCount}</span>
              <button 
                 onClick={() => setPersonCount(Math.min(20, personCount + 1))}
                 className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-600 transition-colors"
              >+</button>
            </div>
          </div>

          <div className="space-y-3 text-left">
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider">정산 계좌 (선택)</label>
            <div className="flex flex-col gap-3">
              <input
                 type="text"
                 value={bankName}
                 onChange={(e) => setBankName(e.target.value)}
                 placeholder="은행명 (예: 카카오뱅크)"
                 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-slate-900 placeholder-slate-400"
              />
              <input
                 type="text"
                 value={accountNumber}
                 onChange={(e) => setAccountNumber(e.target.value)}
                 placeholder="계좌번호"
                 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors font-mono text-slate-900 placeholder-slate-400"
              />
            </div>
          </div>

          <button
            onClick={handleSetupComplete}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            시작하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-[350px] md:pb-[250px]">
      
      {/* Top Navbar: z-index increased to 100 to ensure it stays on top of receipt cards */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-[100] px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={handleResetClick} 
            className="p-2 hover:bg-slate-100 hover:text-red-500 rounded-full text-slate-500 transition-colors cursor-pointer" 
            aria-label="처음으로"
            title="처음으로 돌아가기 (초기화)"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => setIsTotalListOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-bold transition-colors ml-2"
          >
            <ReceiptText size={16} />
            전체 내역 ({items.length})
          </button>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={handleSaveImage}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <Download size={16} />
            {isSaving ? '저장 중...' : '전체 저장'}
          </button>
        </div>
      </nav>

      {/* Name Editing Area */}
      <div className="max-w-7xl mx-auto px-4 py-6 overflow-x-auto">
        <div className="flex gap-3 pb-2 items-center">
           <div className="flex items-center text-slate-400 mr-2 flex-shrink-0">
             <Users size={20} />
           </div>
           {people.map((person) => (
             <input
                key={person.id}
                value={person.name}
                onChange={(e) => updatePersonName(person.id, e.target.value)}
                placeholder="이름 입력"
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:text-indigo-600 w-24 focus:w-32 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
             />
           ))}
        </div>
      </div>

      {/* Receipt Grid */}
      <div id="receipts-grid" className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-start">
          {people.map((person) => (
            <ReceiptCard 
              key={person.id} 
              person={person} 
              items={items} 
              bankName={bankName}
              accountNumber={accountNumber}
            />
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <InputBar people={people} onAddItem={addItem} />

      {/* Total List Modal */}
      <TotalListModal 
        isOpen={isTotalListOpen}
        onClose={() => setIsTotalListOpen(false)}
        items={items}
        people={people}
        onDeleteItem={handleRequestDelete}
      />

      {/* Reset Confirmation Modal */}
      <ResetConfirmModal 
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={performReset}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default App;