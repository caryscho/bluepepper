interface ContollerProps {
  is2D: boolean;
  onToggleDimension: () => void;
}
export default function Contoller({ is2D, onToggleDimension }: ContollerProps) {
  return (
    <>
      <div className="absolute top-8 left-8 z-10 p-2 border shadow-md">
        <button onClick={onToggleDimension}>{is2D ? '3D' : '2D'}</button>
      </div>
    </>
  );
}
