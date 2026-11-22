# ADR 0003: Domain rules (equal split, nets, greedy settlement)

Status: accepted (Phase 3)

Builds on ADR 0002 (integer money). Code: `src/domain/`.

## Decision
1. **Model.** Members are string ids. `Expense = { id, payerId, amount, participantIds }`. `amount` is a safe integer greater than 0, `participantIds` is non-empty, and the payer and every participant must be existing members. Single currency. Only equal split exists.
2. **Equal split and the remainder rule.** With `n` participants: `base = floor(amount / n)`, `r = amount - base * n`. Sort participant ids ascending (UTF-16 code-unit order, not `localeCompare`, so it does not depend on the locale). The first `r` ids get `base + 1`, the rest get `base`. Deterministic, never random. Shares always sum to `amount` and differ by at most one unit.
3. **Net.** Net per member = total paid minus total owed. Nets of all members sum to 0.
4. **Settlement (greedy).** Repeat: take the creditor with the largest net and the debtor with the most negative net, ties broken by member id ascending. The transfer is `min(|a|, |b|)`. Stop when no net is non-zero.
   - **Bound.** At most `k - 1` transfers, where `k` is the number of members with a non-zero net. Each transfer zeroes at least one of the two members, and the last transfer zeroes both because the nets sum to 0.
   - After applying every transfer, each net is 0.
   - **Not minimal.** The result is not guaranteed to have the fewest possible transfers. Finding the minimum is NP-hard (it is a partition problem into zero-sum groups). Example in the tests: nets `a +4, b +3, c +3, d -6, e -4` give 4 transfers, while 3 suffice (`e` pays `a` 4, `d` pays `b` and `c` 3 each). We accept this: the bound is good enough for a small app and the output is deterministic.
5. **Removing a member** is allowed only if no expense references them as payer or participant. Otherwise the result is a `MemberInUse` error.
6. **Errors.** Expected failures are returned as `Result<T, DomainError>` (`InvalidAmount`, `NoParticipants`, `UnknownMember`, `MemberInUse`). Code throws only when an invariant is broken (for example `equalSplit` called with an invalid amount, nets that do not sum to 0, or a sum leaving the safe integer range).

## Gaps in the spec, resolved literally
- The payer must be an existing member; otherwise `UnknownMember`.
- Duplicate ids in `participantIds` are not rejected. Each entry counts toward `n` and gets its own share.
- Removing an id that is not a member returns `UnknownMember`.

## Consequences
The domain is pure: no storage, no UI, no clock. Property tests (shares sum to amount, nets sum to 0, settlement zeroes nets) arrive in the next task.
