import { AlertCircle, CheckCircle } from "lucide-react";

interface StatusMessageProps {
  status: "idle" | "success" | "error";
}

export default function StatusMessage({ status }: StatusMessageProps) {
  if (status === "idle") return null;

  return (
    <div className={`p-4 rounded-md ${status === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
      <div className="flex items-center">
        {status === "success" ? <CheckCircle className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
        <p>
          {status === "success" ? "Pitch submitted successfully!" : "Please ensure your pitch is at least 1 character."}
        </p>
      </div>
    </div>
  );
}
