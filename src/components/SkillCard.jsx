import { Link } from "react-router-dom";

export default function SkillCard({ skill }) {
  return (
    <div className="bg-white shadow-md p-4 rounded-xl">
      <img
        src={skill.image || "https://via.placeholder.com/150"}
        className="rounded-md w-full h-40 object-cover"
      />
      <h3 className="font-bold mt-3">{skill.title}</h3>
      <p className="text-gray-600 text-sm">{skill.category}</p>

      <Link
        to={`/skill/${skill.id}`}
        className="mt-3 inline-block text-blue-600"
      >
        View Details
      </Link>
    </div>
  );
}
