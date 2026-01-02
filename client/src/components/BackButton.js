import { useNavigate } from "react-router-dom";

export default function BackButton({ className = "" }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className={`bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300 ${className}`}
    >
      ← Back
    </button>
  );
}
