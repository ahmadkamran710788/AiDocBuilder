---
title: "Common mistakes and troubleshooting"
description: "Address keys — use the main field Adding address partial fields (Address Line 1/2, City, Postal Code) without the main address-block key can make the batch fail."
order: 1
updated: '2026-11-12T09:00:00.000Z'
updatedBy: Ahmad
---

## Address keys — use the main field

Adding address partial fields (Address Line 1/2, City, Postal Code) without the main address-block key can make the batch fail. Always include the main address key.

## Open a batch the right way (blank / missing tools)

Open the batch from the batch list by clicking **Expand** — not the direct link. Expanding opens the sub-batch, where you see all the tools and only the keys the document needs. If a batch looks blank or is missing tools, you opened it the wrong way — go back and expand it.

## Check whether an agent actually ran on a transaction

Sometimes an interactive agent conversation is done during training, but the values are not extracted in a real transaction. Open the transaction's timeline and look for the agent's entry (for example the agent's name, or “AI agent response received”). If there is no entry for the agent, it did not run on that transaction.

## Value not allowed (schema / 400 error)

Each project allows a fixed list of values for some keys (e.g. Mode of Transport: Air, Sea…). If extraction produces a value that is not in the allowed list, the transaction can fail with a 400 error. Check the extracted value matches one of the allowed values.

## Missing mandatory keys

Some components need their mandatory keys together. For example, a House Bill needs the House Bill Number together with House Bill Package Type and House Bill Total Packages. If a mandatory key is missing, the component may not be created and the transaction can fail.
