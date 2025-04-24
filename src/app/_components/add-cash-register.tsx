export default function AddCashRegister() {
  return (
    <div>
      <h1>Adicionar Caixa</h1>
      <form>
        <div>
          <label htmlFor="date">Data</label>
          <input type="date" id="date" />
        </div>
        <div>
          <label htmlFor="amount">Valor</label>
          <input type="number" id="amount" />
        </div>
        <button type="submit">Adicionar</button>
      </form>
    </div>
  );
}
