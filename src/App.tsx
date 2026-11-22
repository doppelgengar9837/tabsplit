import { useState, type FormEvent } from "react";
import { addExpense, addMember, deleteMember, viewLedger, type Ledger } from "./ledger";
import { formatMoney } from "./money";
import { load, save } from "./storage";
import type { Result } from "./domain";

function netLine(memberId: string, net: number): string {
  if (net === 0) return `${memberId} is settled up`;
  if (net > 0) return `${memberId} is owed ${formatMoney(net, "USD")}`;
  return `${memberId} owes ${formatMoney(-net, "USD")}`;
}

export function App() {
  const [ledger, setLedger] = useState<Ledger>(() => load());
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [payer, setPayer] = useState("");
  const [amount, setAmount] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);

  const payerId = ledger.members.includes(payer) ? payer : (ledger.members[0] ?? "");
  const view = viewLedger(ledger);

  function apply(result: Result<Ledger, string>): boolean {
    if (!result.ok) {
      setMessage(result.error);
      return false;
    }
    save(result.value);
    setLedger(result.value);
    setMessage("");
    return true;
  }

  function onAddMember(e: FormEvent) {
    e.preventDefault();
    if (apply(addMember(ledger, name))) setName("");
  }

  function onAddExpense(e: FormEvent) {
    e.preventDefault();
    const chosen = ledger.members.filter((m) => participants.includes(m));
    if (apply(addExpense(ledger, { payerId, amountText: amount, participantIds: chosen }))) {
      setAmount("");
      setParticipants([]);
    }
  }

  return (
    <main>
      <h1>tabsplit</h1>
      {message !== "" && <p role="alert">{message}</p>}

      <section>
        <h2>Members</h2>
        <form onSubmit={onAddMember}>
          <label>
            Member name
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <button type="submit">Add member</button>
        </form>
        <ul>
          {ledger.members.map((m) => (
            <li key={m}>
              {m}{" "}
              <button type="button" onClick={() => apply(deleteMember(ledger, m))}>
                Delete {m}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Expenses</h2>
        <form onSubmit={onAddExpense}>
          <label>
            Payer
            <select value={payerId} onChange={(e) => setPayer(e.target.value)}>
              {ledger.members.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <label>
            Amount
            <input value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
          <fieldset>
            <legend>Participants</legend>
            {ledger.members.map((m) => (
              <label key={m}>
                <input
                  type="checkbox"
                  checked={participants.includes(m)}
                  onChange={(e) =>
                    setParticipants(
                      e.target.checked ? [...participants, m] : participants.filter((p) => p !== m),
                    )
                  }
                />
                {m}
              </label>
            ))}
          </fieldset>
          <button type="submit">Add expense</button>
        </form>
        <ul>
          {ledger.expenses.map((x) => (
            <li key={x.id}>
              {x.payerId} paid {formatMoney(x.amount, "USD")} for {x.participantIds.join(", ")}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Balances</h2>
        <ul>
          {view.ok &&
            view.value.nets.map(({ memberId, net }) => (
              <li key={memberId}>{netLine(memberId, net)}</li>
            ))}
        </ul>
      </section>

      <section>
        <h2>Settlement</h2>
        <ul>
          {view.ok &&
            view.value.transfers.map((t, i) => (
              <li key={i}>
                {t.from} pays {t.to} {formatMoney(t.amount, "USD")}
              </li>
            ))}
        </ul>
      </section>
    </main>
  );
}
