import { Tag } from 'lucide-react';
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Panel } from '../../components/AdminUI.jsx';

const AdminCategoriesTab = () => {
  const { categories } = useOutletContext();
  const [search, setSearch] = useState('');

  const filtered = categories.filter((category) => category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <Panel title={`Categories (${categories.length})`} icon={<Tag />}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search categories"
          className="mb-4 w-full rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {filtered.map((category) => (
            <span key={category} className="rounded-full bg-limewash px-4 py-2 text-sm font-bold text-leaf">
              {category}
            </span>
          ))}
          {!filtered.length && <p className="text-slate-500">No categories found. Categories are derived from active products.</p>}
        </div>
      </Panel>
    </div>
  );
};

export default AdminCategoriesTab;
