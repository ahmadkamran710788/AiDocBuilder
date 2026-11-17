---
title: "AI agents"
description: "AI Agents run extra checks and actions on a process (classification, validation, copying values, and so on)."
order: 1
updated: '2026-11-12T09:00:00.000Z'
updatedBy: Ahmad
---

AI Agents run extra checks and actions on a process (classification, validation, copying values, and so on).

**1.** Open the **AI Agents** tab. Each agent is a card. Click a card to **select** it, use the **Enabled** toggle to turn it on/off, and **Configure** to set it up.

![Screenshot](/media/ai-agents/image30.webp)

![Screenshot](/media/ai-agents/image31.webp)

*The AI Agents tab — agent cards with Enabled and Configure.*

**2.** Click **Advanced settings** to set the order the agents run in. Agents run top to bottom and each can use the output of the agents above it — place an agent **below** any agent whose result it needs. **Save** the process.

![Screenshot](/media/ai-agents/image32.webp)

## What each agent does

| **Agent (code)**                           | **Type**    | **What it does**                                                                                                      |
|--------------------------------------------|-------------|-----------------------------------------------------------------------------------------------------------------------|
| HBL MBL Classification Agent (A001)        | static      | Determines if a sea waybill is HBL or MBL by matching issuer, consignee and shipper.                                  |
| CIV Interactive Table Agent (A005)         | interactive | Interactive table management for CIV data with dynamic row-level controls.                                            |
| Commodity Code Resolver Agent (A006)       | static      | Resolves and maps commodity codes to the correct classification based on shipment data.                               |
| Interactive Exception Agent (A007)         | interactive | Handles exception cases interactively, letting users review and resolve flagged records.                              |
| Dynamic Content Creation Agent (A009)      | static      | Dynamically generates and structures content output based on input data and templates.                                |
| Customer Validation Agent (A010)           | static      | Matches the customer, identifies the IOR, and flags related buyer/seller.                                             |
| Information Completeness Agent (A011)      | static      | Verifies required documents and fields are complete before the job proceeds.                                          |
| Cross Document Data Checker (A012)         | static      | Runs your plain-language checks across the job's documents; a failed mandatory check holds the job.                   |
| Doc Cross Validator Agent (A013)           | static      | Compares selected fields between user-defined document-type pairs.                                                    |
| Cross Document Field Copy Agent (A014)     | static      | Copies a field value from one document to another based on configured rules.                                          |
| Product Description & HS Code Agent (A015) | static      | Looks up each line item's product number in the parts data, returns description / HS code, and validates the HS code. |
| Customs Trade Content Agent (A016)         | static      | For each HS code + origin country, determines the required authorisations and verifies the documents satisfy them.    |

:::note

**Note:** The agents available depend on the project, so you may see more or fewer than the list above.

:::
