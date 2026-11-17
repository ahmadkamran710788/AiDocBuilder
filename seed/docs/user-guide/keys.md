---
title: "Add and edit keys"
description: "Keys are the fields the process extracts from documents."
order: 2
updated: '2026-11-12T09:00:00.000Z'
updatedBy: Ahmad
---

Keys are the fields the process extracts from documents. You add them on the Keys tab, then adjust each one if needed.

## Key types

When you add keys you can filter by type:

- **Key** — a single value (for example a number or a name).
- **Table** — a column inside a table (line items).
- **Address** — a full address block (name, address lines, city, country, etc.).

## Add keys

**1.** On the **Keys** tab, click **Add Keys**.

![Screenshot](/media/user-guide/image4.webp)

*The Keys tab — click Add Keys.*

**2.** Use the filter (**All / Keys / Table / Address**), search and select the keys you need, then click **Add**.

![Screenshot](/media/user-guide/image5.webp)

*Add Keys — filter, select, then Add.*

How the filter works:

- **All** is selected by default and shows every key (Keys + Table + Address) in one list.
- **Keys / Table / Address** narrow the list to that type. Your current selections are kept when you switch filters.
- **Search** works across all types when All is active, or within the type when Keys / Table / Address is active.
- **Select All** selects every key in the current view; the counter shows “X keys selected out of Y keys”.
- **Clear** removes all selections. Click **Add** to add every selected key at once.

| **Filter** | **Keys shown**                                 | **Default?** |
|------------|------------------------------------------------|--------------|
| All        | All key types combined (key + table + address) | Yes          |
| Keys       | Standard single-value fields only              | No           |
| Table      | Table / line-item fields only                  | No           |
| Address    | Address block and address-block-partial fields | No           |

:::note

**If a key is not visible:** Switch to Keys, Table or Address — it may be a different type.

If it is in no filter, it may not be in this project’s key library (check Admin → Projects → Keys).

:::

:::warning

**Common mistake — address keys:** For an address, add the main address-block key (type Address), not only the partial fields (Address Line 1/2, City, Postal Code…). Using partial address fields without the main field can cause the batch to fail.

:::

## Edit a key

Click a key in the list to open it (for example **Filing Branch Code**). The edit window has these settings:

![Screenshot](/media/user-guide/image6.webp)

![Screenshot](/media/user-guide/image7.webp)

*Editing a key.*

| **Setting**                       | **What it means**                                                                                                                                                                                                                                              |
|-----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Key Label (read-only)             | The key's display label. It cannot be changed here.                                                                                                                                                                                                            |
| Key Value (read-only)             | The key's internal name. It cannot be changed here.                                                                                                                                                                                                            |
| Selected Translation Dictionary   | The dictionary used to translate this key's value (if any).                                                                                                                                                                                                    |
| DocClass (select one or multiple) | The document type(s) this key is taken from (e.g. Commercial Invoice, House Waybill, Packing List).                                                                                                                                                            |
| Static Value                      | A fixed value always used for this key. For complex / conditional cases, use Field Descriptions instead.                                                                                                                                                       |
| Override Project Normalization    | On = the options below replace the project's normalization for this key: Remove whitespace, Uppercase, Lowercase.                                                                                                                                              |
| Python code                       | Runs on each extracted value (each cell for table keys) after extraction. raw_value = the extracted value; set new_value to change it. Leave empty to use the project code. An error adds a timeline warning and keeps the value. (Tab / Shift+Tab to indent.) |

## Key precedence

When the same key can come from more than one document, set which document is used first. Open the key's precedence (Doc Types) and order the documents with the up/down arrows.

![Screenshot](/media/user-guide/image8.webp)

*Precedence (Doc Types) for a key.*
