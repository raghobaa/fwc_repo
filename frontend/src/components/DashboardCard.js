export default function DashboardCard({ title, description, buttonText, onClick }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-all cursor-pointer h-[160px]">
      <div>
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
      <button
        onClick={onClick}
        className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg py-2 transition-all w-full shadow-sm hover:shadow-md"
      >
        {buttonText}
      </button>
    </div>
  );
}
