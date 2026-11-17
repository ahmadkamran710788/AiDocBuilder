---
title: "Preprocessing agents"
description: "Preprocessing agents prepare the incoming files before extraction — for example splitting emails or merging documents."
order: 1
updated: '2026-11-12T09:00:00.000Z'
updatedBy: Ahmad
---

Preprocessing agents prepare the incoming files before extraction — for example splitting emails or merging documents.

**1.** Open the **Preprocessing Agents** tab. Each agent is a card. Turn on the one you need with its **Enabled** toggle, then click **Configure** to set its options.

![Screenshot](/media/preprocessing-agents/image33.webp)

*The Preprocessing Agents tab.*

**2.** Save the process to keep your changes.

## What each preprocessing agent does

| **Agent**                        | **What it does**                                                                                     |
|----------------------------------|------------------------------------------------------------------------------------------------------|
| Merge Documents                  | Merge multiple documents into one PDF, then classify.                                                |
| Merge Same Type Documents        | Merge PDFs with the same EDOC type before upload.                                                    |
| Split Transaction                | Split multi-attachment transactions into separate transactions.                                      |
| Nested Emails                    | Split attached .eml/.msg emails into their own transactions, or add their files to this transaction. |
| Pair Documents                   | Pair a primary PDF with an auxiliary Excel; enrich the Main Table from Excel + reference data.       |
| Split Email Body                 | Split the email body into a separate transaction per paragraph.                                      |
| Goods Description – Subject Code | Enrich the CIV goods description using a phrase from the email subject code.                         |
| Process Excel Files              | Route .xlsx attachments into their own batch, forced to a target document type.                      |
| Excel WID Split                  | Group Excel rows by WID and create one child transaction per WID, linked to the parent.              |
| Match Shipment Data              | Build Main Table rows from shipment + enrichment Excel workbooks.                                    |
