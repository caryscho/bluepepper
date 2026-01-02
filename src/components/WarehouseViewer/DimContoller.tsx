interface ContollerProps {
    is2D: boolean;
    onToggleDimension: () => void;
}
export default function Contoller({ is2D, onToggleDimension }: ContollerProps) {
    return (
        <>
            <div className="absolute top-8 left-8 z-10 p-2">
                <button
                    onClick={onToggleDimension}
                    className="px-4 py-2 text-white bg-blue-500 rounded-lg"
                >
                    {is2D ? "2D -> 3D" : "3D -> 2D"}
                </button>
            </div>
        </>
    );
}
