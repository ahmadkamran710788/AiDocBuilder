---
title: "Parties, documents and dictionaries"
description: "Add a party 1 Open the Parties tab."
order: 4
updated: '2026-11-12T09:00:00.000Z'
updatedBy: Ahmad
---

## Add a party

**1.** Open the **Parties** tab. Use **Search Organizations** to find an existing organisation, or click **Create New Party**.

![Screenshot](/media/user-guide/image14.webp)

*Parties → Search Organizations.*

**2.** In **Create New Party**, select the entity (for example Importer), then click **Create**.

![Screenshot](/media/user-guide/image15.webp)

![Screenshot](/media/user-guide/image16.webp)

The new party list opens:

![Screenshot](/media/user-guide/image17.webp)

**3.** Click **Add New**, fill in the record (required fields are marked \*), then click **Create**.

![Screenshot](/media/user-guide/image18.webp)

![Screenshot](/media/user-guide/image19.webp)

![Screenshot](/media/user-guide/image20.webp)

*The party record — required fields are marked \*.*

## Manage columns

On a party list, click **Columns** to choose which columns are shown and which are mandatory. Use **Add New** to add a record.

![Screenshot](/media/user-guide/image21.webp)

*A party list — Add New, Import, Export, Columns.*

In the **Columns** window you can edit or delete columns.

![Screenshot](/media/user-guide/image22.webp)

![Screenshot](/media/user-guide/image23.webp)

*Edit Columns.*

## Import / Export parties

**1.** Click **Import**. Choose **Append Data** (add to what is there) or **Replace Data** (replace everything), browse to the Excel file (.xlsx / .xls), then **Upload**.

![Screenshot](/media/user-guide/image24.webp)

*Import Party — Append or Replace, then upload.*

**2.** Click **Export All** to download the current records.

## How party matching works

AIDocBuilder matches each party in the document against a vector database of known organisations. It fetches the account number and matches on the company name, account number and short address found in the document. The result is shown on the party block (and beside it), colour-coded:

| **Colour (in the app)** | **What it means**                                                        |
|-------------------------|--------------------------------------------------------------------------|
| **Green**               | Perfect match — the organisation was found and the checked values agree. |
| **Yellow**              | Matched, but with a difference (for example a different account number). |
| **Red**                 | Not available — no matching organisation was found.                      |

**Standard matching (global).** A match is made when all of these are true:

- **Company name** matches at least 90%;
- **Other properties** (excluding the name) have an average match above 85%; and
- **At least 2 columns** match, not counting the company name.

:::note

**NL bypass (NL process only):** If nothing matches globally, the NL process uses a relaxed rule: the company name must match at least 51% (the name is matched in two ways), and at least 1 additional column (excluding the name) must match. NL works at a 90% name match, otherwise between 50% and 89%.

**Match → Green; different account number → Yellow; no match → Red.**

:::

## Documents — add document types & translate

The Documents tab lists the document types the process expects. You add each type and, if needed, map one type to another (translate).

**1.** Open the **Documents** tab, then click **Add Document Types**.

![Screenshot](/media/user-guide/image25.webp)

*The Documents tab — Add Document Types, Import, Export, Translate Document.*

**2.** In the **Add Document** window, fill in the fields (below), then click **Add**.

![Screenshot](/media/user-guide/image26.webp)

*Add Document.*

| **Field**                     | **What it means**                                                          |
|-------------------------------|----------------------------------------------------------------------------|
| Document Type                 | The type of document (e.g. Commercial Invoice).                            |
| Content Location              | Where the document comes from (e.g. Email Attachment).                     |
| Name Matching / Matching text | How the document is recognised by name (Auto, or matching text you enter). |
| Category                      | The processing category (e.g. Processing).                                 |
| Language                      | The document language (e.g. English).                                      |
| OCR Engine                    | The OCR engine used to read the document.                                  |
| Template                      | An optional template for the document.                                     |
| Page Rotate                   | On / Off — rotate the pages if needed.                                     |
| Barcode                       | On / Off — read a barcode on the document.                                 |

**3.** To map one document type to another, click **Translate Document**, choose the **Document Type** and the **Translated Doc Type**, then click **Translate**.

![Screenshot](/media/user-guide/image27.webp)

*Translate Document — map one document type to another.*

Use **Import / Export** to load or download the document-type list, then **Save**.

## Dictionaries

A dictionary turns a raw value (a code) into a standard value before output — for example a carrier code into the full name.

**1.** Open the **Dictionaries** tab. Click **Create New Dictionary**, or use **Import All / Export All**.

![Screenshot](/media/user-guide/image28.webp)

*The Dictionaries tab.*

**2.** Select the entity, add a short **Description**, then click **Create**.

![Screenshot](/media/user-guide/image29.webp)

*Create New Dictionary.*

:::note

**Dictionary colours (in the app): Green** = optional (not mandatory). **Red** = mandatory.

:::
