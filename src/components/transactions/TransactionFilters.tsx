import { Search } from 'lucide-react';
import { Input } from '../ui/Input';
import { Combobox } from '../ui/Combobox';
import { useFinanceStore } from '../../stores/financeStore';

export function TransactionFilters() {
  const { searchQuery, selectedCategoryId, setSearchQuery, setSelectedCategoryId, categories } = useFinanceStore();

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="flex flex-col md:flex-row gap-3">
      <div className="flex-1">
        <Input
          id="search"
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search size={16} />}
        />
      </div>
      <div className="w-full md:w-60">
        <Combobox
          value={selectedCategoryId}
          onChange={setSelectedCategoryId}
          options={categoryOptions}
          placeholder="Filter by category"
          searchable
        />
      </div>
    </div>
  );
}
