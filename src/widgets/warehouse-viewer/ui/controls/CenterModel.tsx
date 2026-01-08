import { LocateIcon } from "lucide-react";

interface CenterModelProps {
    onResetCamera: () => void;
}

export default function CenterModel({ onResetCamera }: CenterModelProps) {
    return (
        <button className="hover:bg-blue-200" onClick={onResetCamera}>
            <LocateIcon className="w-4 h-4" />
        </button>
    );
}