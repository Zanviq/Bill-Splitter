import React, { useState, useEffect } from 'react';
import { Person } from '../types';

interface InputBarProps {
  people: Person[];
  onAddItem: (name: string, price: number, sharedBy: string[]) => void;
}

const InputBar: React.FC<InputBarProps> = ({ people, onAddItem }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);

  // Default select all people when component mounts or people change
  useEffect(() => {
    setSelectedPeople(people.map(p => p.id));
  }, [people]);

  const togglePerson = (id: string) => {
    setSelectedPeople(prev => 
      prev.includes(id) 
        ? prev.filter(pId => pId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedPeople.length === people.length) {
      setSelectedPeople([]);
    } else {
      setSelectedPeople(people.map(p => p.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numPrice = parseInt(price.replace(/,/g, ''), 10);
    
    if (!name.trim() || isNaN(numPrice) || selectedPeople.length === 0) {
      return;
    }

    onAddItem(name, numPrice, selectedPeople);
    
    // Reset fields
    setName('');
    setPrice('');
    setSelectedPeople(people.map(p => p.id)); // Reset selection back to all
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
      <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-2xl p-4 md:p-6 transition-all ring-1 ring-slate-900/5 pointer-events-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Inputs Row */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">상품 이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 삼겹살, 소주"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors text-slate-900 placeholder-slate-400"
              />
            </div>
            
            <div className="w-full md:w-48">
              <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">가격 (₩)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors text-slate-900 placeholder-slate-400"
              />
            </div>

             <div className="hidden md:flex items-end">
                <button
                  type="submit"
                  disabled={!name || !price || selectedPeople.length === 0}
                  className="h-[50px] px-8 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                >
                  추가
                </button>
             </div>
          </div>

          {/* People Selection Row */}
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
             <div className="flex items-center gap-2 mb-1 md:mb-0">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">분담 대상:</span>
                <button 
                  type="button" 
                  onClick={handleSelectAll}
                  className="text-xs text-indigo-500 hover:text-indigo-700 underline font-medium"
                >
                  {selectedPeople.length === people.length ? '전체 해제' : '전체 선택'}
                </button>
             </div>

             <div className="flex flex-wrap gap-2 flex-1">
                {people.map(person => (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => togglePerson(person.id)}
                    className={`
                      px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border
                      ${selectedPeople.includes(person.id)
                        ? 'bg-indigo-100 border-indigo-200 text-indigo-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}
                    `}
                  >
                    {person.name}
                  </button>
                ))}
             </div>
          </div>

          {/* Mobile Submit Button (Visible only on small screens) */}
          <button
            type="submit"
            disabled={!name || !price || selectedPeople.length === 0}
            className="md:hidden w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
          >
            추가하기
          </button>

        </form>
      </div>
    </div>
  );
};

export default InputBar;