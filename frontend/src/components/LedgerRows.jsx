// Label ........ value rows, like a line in an accounts book.
export default function LedgerRows({ rows }) {
  return (
    <dl className="ledger-rows">
      {rows.map((row) => (
        <div className="ledger-row" key={row.label}>
          <dt>{row.label}</dt>
          <span className="ledger-dots" aria-hidden="true" />
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
