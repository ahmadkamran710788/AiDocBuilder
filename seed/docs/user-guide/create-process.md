---
title: "Create a process"
description: "A process tells AIDocBuilder how to read and handle one type of document."
order: 1
updated: '2026-11-12T09:00:00.000Z'
updatedBy: Ahmad
---

A process tells AIDocBuilder how to read and handle one type of document. You set it up once; it is then used to match and process transactions.

## The process configuration tabs

A process is set up across these tabs (shown across the top of the process screen):

| **Tab**                | **What it is for**                                                                                   |
|------------------------|------------------------------------------------------------------------------------------------------|
| General                | The main process details — name, project, country and the on/off options (see the field list below). |
| Keys                   | The fields the process extracts (single keys, table columns and address blocks).                     |
| Parties                | The organisations (importer, supplier, consignee, etc.) used by the process.                         |
| Documents              | The document types the process expects, and their settings.                                          |
| Dictionaries           | Lookup tables that turn a code into a standard value before output.                                  |
| Logs                   | A history of changes made to the process.                                                            |
| AI Agents              | Extra checks and actions run by agents (classification, validation, copying, etc.).                  |
| Email Notifications    | Who is emailed on success or failure, and the email text.                                            |
| Preprocessing Agents   | Steps that prepare the incoming files before extraction (split, merge, etc.).                        |
| Agent Conversations    | The interactive agent instructions saved during training.                                            |
| Postprocessing Prompts | Prompts applied after extraction.                                                                    |
| System Prompt          | The system-level prompt for the process.                                                             |
| Master Data            | Reference data (such as parts data) used by the agents.                                              |

## Steps

**1.** From the top menu, open **Home** and click **Create Process**.

![Screenshot](/media/user-guide/image1.webp)

*Home menu → Create Process.*

**2.** Fill in the **General** tab (see the field list below), then click **Save** or **Next**.

![Screenshot](/media/user-guide/image2.webp)

![Screenshot](/media/user-guide/image3.webp)

*The General tab.*

**3.** Open the **Keys** tab and add the keys the process needs (see Section 2).

**4.** Continue through the other tabs as needed (Parties, Dictionaries, AI Agents, Preprocessing Agents…), then **Save** the process.

## General tab — what each field means

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Field</strong></th>
<th><strong>Type</strong></th>
<th><strong>What it accepts / does</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>1.Process Name</td>
<td>Text</td>
<td>The process's full name (usually built from the name, project and country).</td>
</tr>
<tr class="even">
<td>2.Name</td>
<td>Text</td>
<td>A short name for the process.</td>
</tr>
<tr class="odd">
<td>3.Project</td>
<td>Dropdown</td>
<td>The project this process belongs to (e.g. DGFCW1CustomsDeclaration(B+CIV)).</td>
</tr>
<tr class="even">
<td>4.Country Code</td>
<td>Dropdown</td>
<td>The country for this process (e.g. Costa Rica - CR).</td>
</tr>
<tr class="odd">
<td>5.Manual Validation</td>
<td>On / Off</td>
<td>On = results must be checked by a person before they are finalised.</td>
</tr>
<tr class="even">
<td>6.Send Time Stamp</td>
<td>On / Off</td>
<td>On = a timestamp update is sent for the transaction.</td>
</tr>
<tr class="odd">
<td>7.Auto Re Process</td>
<td>On / Off</td>
<td>On = the transaction is re-processed automatically when needed.</td>
</tr>
<tr class="even">
<td>8.Majority Voting</td>
<td>On / Off</td>
<td>On = the result is chosen by majority across multiple values/runs.</td>
</tr>
<tr class="odd">
<td>9.Auto Split</td>
<td>On / Off</td>
<td>On = the incoming file / batch is split automatically.</td>
</tr>
<tr class="even">
<td>10.Allow ZIP attachment processing</td>
<td>On / Off</td>
<td>On = .zip attachments are processed.</td>
</tr>
<tr class="odd">
<td>11.Email Domain(s)</td>
<td>Text</td>
<td>The email domain(s) that feed transactions into this process.</td>
</tr>
<tr class="even">
<td>12.Source</td>
<td>Text</td>
<td>The source of the transactions.</td>
</tr>
<tr class="odd">
<td>13.Description</td>
<td>Text / key</td>
<td>Free text (or a key such as ProcessId) describing the process.</td>
</tr>
<tr class="even">
<td>14. Model GX15</td>
<td>On/off</td>
<td><p>Enables the GX15 model variant for this agent’s LLM processing</p>
<p>When ON, the agent uses chain-of-thought reasoning before producing output. OFF = faster, direct output</p></td>
</tr>
<tr class="odd">
<td>15. Reasoning</td>
<td>OFF (toggle)</td>
<td>When ON, the agent uses chain-of-thought reasoning before producing output. OFF = faster, direct output</td>
</tr>
<tr class="even">
<td>16.Table Source</td>
<td>Main table</td>
<td>Selects which extracted table the agent uses as the source for data. “Main table” = the primary document table</td>
</tr>
<tr class="odd">
<td>17.Reasoning Token Budget</td>
<td>500</td>
<td>Maximum number of tokens allocated to the reasoning step when Reasoning is ON</td>
</tr>
<tr class="even">
<td>18.Processing</td>
<td>OFF (toggle)</td>
<td>When ON, skips certain validation or enrichment steps to reduce processing time</td>
</tr>
<tr class="odd">
<td>19.HG Service ID Lookup</td>
<td>fileNumber, billOfLadingNumber, bookingNumber</td>
<td>The reference field cascade used to call the Hillebrand-Gori service-ID API. Up/Down buttons control the priority order</td>
</tr>
</tbody>
</table>

:::note

**Note:** Fill the required fields first (Name, Project, Country Code). The on/off options can be changed later by editing the process.

:::
