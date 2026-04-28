# Manual Data Import Format

All admin-imported CSVs live in `data/uploads/` (gitignored). Sample CSVs in
`data/samples/` are committed and demonstrate the schema. Every column listed
as **required** must be present; missing optional columns become `null`.

A row is rejected if `source_url`, `last_verified_at`, or any required field
is missing. Rejected rows are written back as `*-rejected.csv` with a `reason`
column.

---

## 1. `apartments.csv`

| Column | Required | Type | Notes |
| --- | --- | --- | --- |
| `external_id` | ✅ | string | Unique within source |
| `property_name` | ✅ | string | |
| `unit_type` | ✅ | enum | `apartment` |
| `address_line` | ✅ | string | |
| `city` | ✅ | string | Must be in SoCal allow-list |
| `county` | ✅ | string | |
| `state` | ✅ | string | Must be `CA` |
| `zip` | ✅ | string | |
| `lat` | ✅ | number | |
| `lng` | ✅ | number | |
| `manager` | ✅ | string | e.g. `Greystar` |
| `application_platform` | ⛔️ | enum | `RentCafe` / `Entrata` / `AppFolio` / `RealPage` / `Knock` / `Other` |
| `application_url` | ✅ | url | |
| `official_property_url` | ✅ | url | |
| `min_rent` | ✅ | number | USD |
| `max_rent` | ✅ | number | USD |
| `beds_min` / `beds_max` | ✅ | number | |
| `baths_min` / `baths_max` | ✅ | number | |
| `sqft_min` / `sqft_max` | ⛔️ | number | |
| `deposit` | ⛔️ | number | |
| `application_fee` | ⛔️ | number | |
| `admin_fee` | ⛔️ | number | |
| `pet_policy` | ⛔️ | string | |
| `pet_fee` | ⛔️ | number | |
| `parking_type` | ⛔️ | string | |
| `parking_fee` | ⛔️ | number | |
| `accessibility_features` | ⛔️ | csv | semicolon-separated |
| `amenities` | ⛔️ | csv | semicolon-separated |
| `income_multiplier` | ⛔️ | number | e.g. `2.5` or `3` |
| `screening_vendor` | ⛔️ | string | only when publicly disclosed |
| `move_in_specials` | ⛔️ | string | |
| `source` | ✅ | enum | see DATA_SOURCES.md §5 |
| `source_url` | ✅ | url | |
| `last_seen_at` | ✅ | iso-8601 | |
| `last_verified_at` | ✅ | iso-8601 | |
| `trust_label` | ✅ | enum | see DATA_SOURCES.md §5 |
| `confidence_score` | ✅ | number | 0–100 |

## 2. `townhomes.csv`

Identical to `apartments.csv` plus:

| Column | Required | Type | Notes |
| --- | --- | --- | --- |
| `unit_type` | ✅ | enum | `townhouse` or `townhome-style-apartment` |
| `levels` | ⛔️ | number | |
| `private_entrance` | ⛔️ | boolean | |
| `attached_garage` | ⛔️ | boolean | |
| `yard_or_patio` | ⛔️ | boolean | |
| `lower_density_community` | ⛔️ | boolean | |

## 3. `dealers.csv`

| Column | Required | Type | Notes |
| --- | --- | --- | --- |
| `external_id` | ✅ | string | |
| `dealer_name` | ✅ | string | Public name |
| `legal_name` | ⛔️ | string | LLC / corp name if publicly known |
| `address_line` / `city` / `county` / `state` / `zip` | ✅ | | SoCal only |
| `lat` / `lng` | ✅ | number | |
| `phone` | ✅ | string | |
| `website` | ✅ | url | |
| `dealer_license_number` | ⛔️ | string | |
| `inventory_count` | ⛔️ | number | |
| `financing_application_url` | ⛔️ | url | |
| `lender_partners` | ⛔️ | csv | only when publicly listed |
| `public_promos` | ⛔️ | json | array of `{label, url, expires_at?}` |
| `source` / `source_url` / `last_seen_at` / `last_verified_at` / `trust_label` / `confidence_score` | ✅ | | Same as above |

## 4. `vehicles.csv`

| Column | Required | Type |
| --- | --- | --- |
| `vin` | ✅ | string (17) |
| `dealer_external_id` | ✅ | string |
| `year` / `make` / `model` / `trim` | ✅ | |
| `mileage` | ✅ | number |
| `price` | ✅ | number |
| `down_payment_estimate` | ⛔️ | number |
| `apr_estimate` | ⛔️ | number |
| `term_months` | ⛔️ | number |
| `tax_title_license_estimate` | ⛔️ | number |
| `dealer_fees_disclosed` | ⛔️ | number |
| `fuel_type` / `drive` / `transmission` / `body_type` | ⛔️ | |
| `condition` | ✅ | enum | `new` / `used` / `cpo` |
| `availability_status` | ✅ | enum | `available` / `pending` / `sold` |
| `listing_url` | ✅ | url |
| `source` / `source_url` / `last_seen_at` / `last_verified_at` / `trust_label` / `confidence_score` | ✅ | |

## 5. `work-vehicle-rentals.csv`

| Column | Required | Type |
| --- | --- | --- |
| `external_id` | ✅ | string |
| `provider_name` | ✅ | string |
| `legal_name` | ⛔️ | string |
| `branch_address` / `city` / `county` / `state` / `zip` | ✅ | |
| `lat` / `lng` | ✅ | number |
| `phone` | ✅ | string |
| `website` | ✅ | url |
| `vehicle_type` | ✅ | enum | `cargo-van` / `box-truck` / `pickup` / `stake-bed` / `flatbed` / `passenger-van` / `refrigerated` |
| `daily_rate` / `weekly_rate` / `monthly_rate` | ⛔️ | number | at least one required |
| `mileage_fee_per_mile` | ⛔️ | number |
| `included_miles_per_day` | ⛔️ | number |
| `deposit` | ⛔️ | number |
| `insurance_per_day_estimate` | ⛔️ | number |
| `business_account_available` | ⛔️ | boolean |
| `min_age` | ⛔️ | number |
| `license_required` | ⛔️ | string |
| `payment_required` | ⛔️ | string | "credit card", "credit or debit", etc. |
| `one_way_available` | ⛔️ | boolean |
| `after_hours_pickup` | ⛔️ | boolean |
| `availability_status` | ⛔️ | enum |
| `source` / `source_url` / `last_seen_at` / `last_verified_at` / `trust_label` / `confidence_score` | ✅ | |
