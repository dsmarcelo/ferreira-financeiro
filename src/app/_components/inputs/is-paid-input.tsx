export function IsPaidCheckbox({ isPaid }: { isPaid?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id="isPaid"
        name="isPaid"
        className="h-6 w-6"
        defaultChecked={isPaid}
      />
      <label htmlFor="isPaid" className="font-medium">
        Pago
      </label>
    </div>
  );
}
