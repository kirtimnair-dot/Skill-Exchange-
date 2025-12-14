export default function CategoryCard({ title }) {
  return (
    <div className="p-6 bg-white shadow-md rounded-xl text-center hover:shadow-lg transition">
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
  );
}
