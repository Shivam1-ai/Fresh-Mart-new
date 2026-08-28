export const Metric = ({ icon, label, value }) => (
  <section className="rounded-lg bg-white p-5 shadow-sm">
    <div className="mb-4 grid h-11 w-11 place-items-center rounded-full bg-limewash text-leaf">
      {icon}
    </div>
    <p className="text-sm font-bold uppercase text-slate-500">{label}</p>
    <p className="mt-1 text-2xl font-black">{value}</p>
  </section>
);

export const Panel = ({ title, icon, children }) => (
  <section className="rounded-lg bg-white p-5 shadow-sm">
    <div className="flex items-center gap-2">
      <span className="text-leaf">{icon}</span>
      <h2 className="text-xl font-black">{title}</h2>
    </div>
    <div className="mt-4">{children}</div>
  </section>
);
