/** Standard Indian food marking: green square + dot for veg, brown/red square + triangle for non-veg. */
export default function VegMark({ isVeg, label, className = 'size-4' }) {
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={`inline-grid shrink-0 place-items-center rounded-[3px] border-[1.5px] bg-white ${isVeg ? 'border-leaf' : 'border-chili'} ${className}`}
    >
      {isVeg ? (
        <span className="size-[45%] rounded-full bg-leaf" />
      ) : (
        <span className="h-0 w-0 border-x-[4px] border-b-[7px] border-x-transparent border-b-chili" />
      )}
    </span>
  );
}
