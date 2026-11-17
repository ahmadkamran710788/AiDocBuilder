---
title: "Reprocess and test a batch"
description: "Use these steps when a transaction needs to run again, or when you want to check how the process extracts fields and documents before you reprocess."
order: 6
updated: '2026-11-12T09:00:00.000Z'
updatedBy: Ahmad
---

Use these steps when a transaction needs to run again, or when you want to check how the process extracts fields and documents before you reprocess.

## Process Management

Open **Home → Process Management** to see every process. From here you can create, import, export and open a process.

![Screenshot](/media/user-guide/image38.webp)

*Process Management.*

## Open a transaction and its batches

**1.** On the **Transactions** screen, find the transaction.

![Screenshot](/media/user-guide/image39.webp)

**2.** Expand the transaction to see its **Batches**: one row per document (Commercial Invoice, Packing List, House Waybill…) and per agent.

![Screenshot](/media/user-guide/image40.webp)

**3.** Open a batch to see the document beside the extracted keys.

![Screenshot](/media/user-guide/image41.webp)

*The batch view — extracted keys on the left, the document on the right.*

The toolbar above the document holds the batch tools (zoom, crop, test, download and more). The status is shown on the right.

![Screenshot](/media/user-guide/image42.webp)

## Teach a key with a prompt

Use **Teach** to tell AIDocBuilder how to find a value. Choose the **Process Key**, optionally select the area on the image, enter the **Expected Output** and a **Prompt** (for example "always below the INVOICE NO label"), then click **Save**.

![Screenshot](/media/user-guide/image43.webp)

*Teach — prompt for one key.*

![Screenshot](/media/user-guide/image49.webp)

## Check table columns

Open the main table below the document to check the extracted columns and rows.

![Screenshot](/media/user-guide/image44.webp)

## Reprocess a transaction

On the **Transactions** screen, select the transaction, open **Actions** and click **Re-Process**.

![Screenshot](/media/user-guide/image45.webp)

*Re-process a transaction.*

## Reprocess sub-batches

To run only some documents again, select the batches in the **Batches** list, open **Actions** and click **Re-Process**.

![Screenshot](/media/user-guide/image46.webp)

*Re-process selected sub-batches.*

## Test the fields within a batch

Click **Test** on the batch and pick a field from the list to extract only that field on the next test run. Clear the selection to extract all fields.

![Screenshot](/media/user-guide/image47.webp)

*Test a single field.*

## Test the documents within a batch

Use **Test → Document** to run the whole document again, with options such as Only Auto Extraction or Reasoning.

![Screenshot](/media/user-guide/image48.webp)

*Test a document.*
