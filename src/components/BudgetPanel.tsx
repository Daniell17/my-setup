import { useWorkspaceStore } from '@/store/workspaceStore';
import {  Calculator } from 'lucide-react';

export default function BudgetPanel() {
  const objects = useWorkspaceStore((state) => state.objects);
  const budget = useWorkspaceStore((state) => state.budget);
  const setBudget = useWorkspaceStore((state) => state.setBudget);

  const totalCost = objects.reduce((sum, obj) => sum + (obj.price || 0), 0);
  const remaining = budget - totalCost;
  const progress = budget > 0 ? Math.min((totalCost / budget) * 100, 100) : 0;

  return (
    <div className="fixed left-4 bottom-20 w-72 bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-800 p-4" style={{ pointerEvents: 'auto' }}>
      <div className="flex items-center gap-2 mb-4 text-white">
        <Calculator className="w-5 h-5 text-green-400" />
        <h2 className="font-semibold">Budget & Cost</h2>
      </div>

      {/* Summary */}
      <div className="bg-gray-800 rounded-lg p-3 mb-4">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-xs text-gray-400">Total Cost</span>
          <span className="text-xl font-bold text-white font-mono">
            ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        {budget > 0 && (
          <>
            <div className="flex justify-between items-baseline text-xs mb-2">
              <span className="text-gray-500">Budget: ${budget.toLocaleString()}</span>
              <span className={remaining >= 0 ? "text-green-400" : "text-red-400"}>
                {remaining >= 0 ? 'Remaining' : 'Over'}: ${Math.abs(remaining).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${remaining >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        )}
      </div>

      {/* Budget Input */}
      <div className="mb-4">
        <label className="text-xs text-gray-400 font-medium mb-1 block">Set Budget</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
          <input
            type="number"
            value={budget || ''}
            onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
            placeholder="Enter budget limit..."
            className="w-full pl-7 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-mono text-white"
          />
        </div>
      </div>

      {/* Item List */}
      <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {objects.map((obj) => (
          <div key={obj.id} className="flex justify-between items-center text-xs py-1 border-b border-gray-800 last:border-0">
            <span className="text-gray-300 truncate flex-1 mr-2">{obj.name}</span>
            <span className="text-gray-400 font-mono whitespace-nowrap">
              ${(obj.price || 0).toLocaleString()}
            </span>
          </div>
        ))}
        {objects.length === 0 && (
          <div className="text-center text-gray-500 py-2 text-xs">
            No items in workspace
          </div>
        )}
      </div>
    </div>
  );
}

