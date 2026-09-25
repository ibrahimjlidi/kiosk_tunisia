# KIOSK TUNISIA ERP - REQUIREMENTS GAP ANALYSIS

## Executive Summary

Your kiosk_tunisia project has implemented **Phase 1 & 2** of the comprehensive ERP requirements you've outlined, with good coverage of core station operations (POS, shifts, sales, payments). However, significant gaps exist in **Phase 3-7** features and several critical structural issues need addressing.

**Overall Status:**
- ✅ **Implemented (60%)**: Station management, POS, shifts, basic inventory, customer credit
- ⚠️ **Partially Implemented (25%)**: Pricing, taxes, accounting, reporting
- ❌ **Missing (15%)**: Multi-company hierarchy, fleet cards, advanced pricing, compliance framework

---

## DETAILED ANALYSIS BY REQUIREMENT AREA

### 1. MULTI-TENANT ARCHITECTURE
**Requirement:** Multi-société + multi-station + multi-caisse + multi-utilisateur

**Current State:**
- ✅ Station management exists
- ❌ Company/Société entity missing
- ❌ No company-level aggregation
- ❌ No multi-company dashboard/reporting
- ⚠️ Station assumed to be top-level entity

**What's Wrong:**
The system treats Station as the root entity, but should have:
```
Company
  ├── Station 1
  ├── Station 2
  └── Station N
```

**What's Missing:**
- Company model (raison_sociale, matricule_fiscal, registre_commerce, gouvernorat, régime_fiscal)
- Company-level configuration
- HQ dashboard with multi-station consolidation
- Company-level audit trail
- Company hierarchy enforcement

**Impact:** Critical. Cannot support group operations or regulatory compliance by company.

---

### 2. PRODUCT PRICING ARCHITECTURE
**Requirement:** Separate Product from ProductPrice with historical tracking

**Current State:**
- ❌ Product has hardcoded `purchasePrice` and `sellingPrice`
- ❌ No price history
- ❌ No `price_type` (PUBLIC_PRICE, PURCHASE_PRICE, WHOLESALE_PRICE)
- ❌ No price versioning
- ❌ No `valid_from`/`valid_to` dates
- ❌ No `approved_by` tracking

**What's Wrong:**
```typescript
// Current (WRONG)
Product {
  sellingPrice: 2.525,      // Hardcoded
  purchasePrice: 1.800
}

// Should be (RIGHT)
Product { id, code, name, ... }
ProductPrice {
  product_id,
  price: 2.525,
  price_type: "PUBLIC_PRICE",
  valid_from: "2026-09-25",
  valid_to: null,
  source: "MINISTRY_OF_ENERGY",
  approved_by: user_id
}
```

**What's Missing:**
- ProductPrice table/model
- Price history queries
- Automatic price activation/deactivation
- Price approval workflow
- Tax rate versioning (currently VAT is 19% hardcoded)

**Impact:** High. Cannot comply with Tunisian price regulation requirements or maintain historical accuracy.

---

### 3. TANK & INVENTORY MANAGEMENT
**Requirement:** Complex tank inventory with theoretical vs physical stock

**Current State:**
- ✅ Tank model exists with `currentStock`
- ❌ No distinction between theoretical and physical stock
- ❌ No tank gauging workflow (DipReading, calculatedVolume, waterLevel, temperature)
- ❌ No stock movement history
- ❌ No tank status management (ACTIVE, MAINTENANCE, etc.)
- ❌ No tolerance thresholds (Station/Product/Tank level)

**What's Wrong:**
```typescript
// Current
Tank {
  currentStock: 9970    // Single value, confusing
}

// Should be
Tank {
  theoretical_stock,    // Calculated from movements
  physical_stock,       // From gauging
  variance,             // physical - theoretical
  last_gauging_date
}

TankGauging {
  tank_id,
  dip_reading_mm,
  calculated_volume,
  water_level,
  temperature,
  variance_percent,
  operator,
  status: "OK" | "ALERT" | "CRITICAL"
}
```

**What's Missing:**
- TankGauging model and workflow
- Theoretical stock calculation engine
- Variance detection and alerts
- Tank tolerance configuration (StationTolerance, ProductTolerance, TankTolerance)
- Stock correction workflow (reason, approval)
- Tank maintenance scheduling

**Impact:** Critical. Cannot manage fuel inventory accurately or detect losses/leaks.

---

### 4. PUMP & NOZZLE ARCHITECTURE
**Requirement:** Pump → Nozzle → Product mapping with meter readings

**Current State:**
- ✅ Pump model exists
- ❌ Pump uses embedded "Pistols" array (not separate Nozzle entity)
- ❌ No proper Nozzle model with `pump_id`, `tank_id`, `product_id`
- ⚠️ Pump readings exist but structure unclear

**What's Wrong:**
```typescript
// Current
Pump {
  pistols: [
    { pistolNumber, product, currentClosingIndex }
  ]
}

// Should be
Pump { id, station_id, code, serial_number, status }
Nozzle {
  id,
  pump_id,
  tank_id,
  product_id,
  code,
  status
}

PumpReading {
  nozzle_id,
  opening_index,
  closing_index,
  volume_sold,    // closing - opening
  shift_id,
  created_at
}
```

**What's Missing:**
- Separate Nozzle model
- PumpReading history table
- Pump meter readings by shift
- Hardware integration layer (for pump data collection)
- Pump calibration tracking

**Impact:** High. Cannot accurately reconcile pump volume vs sales or detect meter tampering.

---

### 5. PRICING & TAX SYSTEM
**Requirement:** Parameterized, dated tax rates with consumption tax

**Current State:**
- ❌ VAT hardcoded as 19% in Product model
- ❌ No TaxRate model
- ❌ No tax history/versioning
- ❌ No ConsumptionTax (droit de consommation)
- ❌ No tax rate effective_from/effective_to
- ❌ No tax calculation engine

**What's Wrong:**
```typescript
// Current (WRONG)
Product { vatRate: 19 }

// Should be (RIGHT)
TaxRate {
  code: "VAT_FUEL",
  name: "TVA Carburant",
  rate: 0.19,
  product_category,
  effective_from: "2026-01-01",
  effective_to: null,
  tax_type: "VAT"
}

ConsumptionTax {
  code: "DROIT_CONSO",
  name: "Droit de Consommation",
  rate,
  effective_from,
  effective_to
}
```

**What's Missing:**
- TaxRate table with versioning
- ConsumptionTax model
- Tax calculation engine (PriceCalculator)
- Tax audit trail
- Multi-tax support (VAT + Consumption Tax + others)
- Tax-compliant invoice generation

**Impact:** Critical. Cannot comply with Tunisian tax requirements or maintain tax history.

---

### 6. INVOICE & FACTURATION
**Requirement:** Continuous invoice numbering, fiscal compliance

**Current State:**
- ❌ No Invoice model visible
- ❌ No invoice sequencing
- ❌ No gap detection (invoice 1001, 1002, 1004 → detect 1003)
- ❌ No CANCELLED vs DELETE distinction
- ❌ No invoice validation workflow

**What's Missing:**
- Invoice model with:
  - invoice_number (sequential)
  - seller info (tax_id, address, raison_sociale)
  - customer info (with tax_id)
  - lines (product, qty, HT, VAT, TTC)
  - HT, TVA, TTC totals
  - payment_status, payment_method
- InvoiceSequence tracking (to prevent gaps)
- Invoice cancellation workflow (CANCELLED, not DELETE)
- Invoice validation against regulatory requirements
- Invoice PDF generation with legal compliance

**Impact:** Critical. Cannot issue compliant invoices or maintain audit trail.

---

### 7. ACCOUNTING MODULE
**Requirement:** Separate accounting system with journal entries

**Current State:**
- ❌ No accounting module
- ❌ No Account (Compte Comptable) model
- ❌ No JournalEntry model
- ❌ No EntryLine model
- ❌ No FiscalPeriod model
- ⚠️ Sales and purchases tracked operationally, not accounting-wise

**What's Missing:**
- Account model (chart of accounts per company)
- JournalEntry model with entry date, journal code, description
- EntryLine model (account_id, debit, credit, description)
- FiscalPeriod model (year, start_date, end_date, status: OPEN/CLOSED)
- Automatic journal entry generation from:
  - Sales (Debit: Cash/Bank/Customer, Credit: Sales Revenue + VAT)
  - Purchases (Debit: Stock + VAT, Credit: Supplier)
  - Shifts (Cash reconciliation)
- Trial balance calculation
- Income statement/balance sheet generation
- Fiscal compliance reporting

**Impact:** Critical. Cannot produce compliant financial statements or maintain double-entry accounting.

---

### 8. FLEET CARDS & VEHICLES
**Requirement:** Fuel card management with vehicle tracking

**Current State:**
- ❌ No FuelCard model
- ❌ No Vehicle model
- ❌ No Driver model
- ❌ No fleet management features
- ⚠️ Customer credit exists but not vehicle-specific

**What's Missing:**
- FuelCard model:
  - customer_id, card_number, vehicle_id, driver_id
  - limit_daily, limit_monthly
  - restrictions (product_id, station_id, etc.)
- Vehicle model:
  - customer_id, registration_number, brand, model
  - fuel_type, tank_capacity, mileage
- Driver model:
  - customer_id, name, license_number, phone
- Fleet card transaction tracking
- Anomaly detection (vehicle tank capacity exceeded in one fill-up)
- Fleet reporting/analytics

**Impact:** Medium. Blocks fleet customers (important revenue channel).

---

### 9. KIOSK/BOUTIQUE
**Requirement:** Full retail POS with barcode, stock, promotions

**Current State:**
- ⚠️ Products exist with category (FUEL/KIOSK/SERVICE)
- ❌ No barcode/SKU system
- ❌ No kiosk-specific stock tracking
- ❌ No promotions/discount engine
- ❌ No kiosk POS workflow

**What's Missing:**
- SKU and barcode fields on products
- KioskProduct table with:
  - barcode, designation, category
  - unit (UNIT, KG, ML)
  - min_stock, max_stock
  - cost_price, selling_price, tax_rate
- KioskSale model (distinct from fuel sales)
- KioskStockMovement tracking
- Promotion model:
  - product_id, customer_type, station_id
  - quantity_min, discount_type, discount_value
  - start_date, end_date
- Barcode scanner integration
- Inventory alerts for kiosk items

**Impact:** Medium. Kiosk is separate revenue stream.

---

### 10. SHIFT & CASH RECONCILIATION
**Requirement:** Comprehensive shift closing with multi-level reconciliation

**Current State:**
- ✅ Shift model exists with status (OPEN, CLOSING, CLOSED, CANCELLED)
- ✅ Basic PumpReadings in shift
- ⚠️ DailyClosure model exists
- ❌ No comprehensive reconciliation logic
- ❌ No variance investigation workflow
- ❌ No reconciliation status tracking

**What's Wrong:**
The shift closing logic should validate:

```
Pumps:        Volume from meters
Sales:        Volume from transactions
Stock:        Stock movement log
Cash:         Expected vs actual
Payments:     Cash + Card + Credit breakdown
```

**What's Missing:**
- Comprehensive ReconciliationCalculator
- Variance thresholds and alerts
- Reconciliation workflow (PENDING_REVIEW → VALIDATED → CLOSED)
- CashDiscrepancy model (reason, investigation, resolution)
- StockDiscrepancy model
- Sign-off by manager/auditor
- Reconciliation report PDF

**Impact:** High. Shift reconciliation is the daily financial control mechanism.

---

### 11. CREDIT & CUSTOMER MANAGEMENT
**Requirement:** Multi-type customers with credit limits and account tracking

**Current State:**
- ✅ Customer model exists
- ✅ CreditTransaction model tracks credit movements
- ⚠️ Credit limit checking in sales
- ❌ No customer type distinction (PARTICULIER vs ENTREPRISE)
- ❌ No company details (raison_sociale, matricule_fiscal)
- ❌ No aging analysis
- ❌ No collections workflow

**What's Missing:**
- Customer type field (PARTICULIER, ENTREPRISE)
- Enterprise customer details:
  - raison_sociale, matricule_fiscal
  - contact_person, phone, email
- CreditAccount model:
  - customer_id, station_id
  - plafond_credit, solde_actuel
  - last_payment_date, days_overdue
- CreditAging report
- Collections workflow (escalation, communication)
- Payment plan management
- Bad debt provisioning

**Impact:** Medium-High. Credit management is critical for B2B customers.

---

### 12. PURCHASE & SUPPLIER MANAGEMENT
**Requirement:** 3-way match (PO ↔ Receipt ↔ Invoice)

**Current State:**
- ✅ Supplier model exists
- ✅ PurchaseOrder model exists
- ✅ ProductPurchase model exists
- ❌ No formal GoodsReceipt model (TankGauging used instead)
- ❌ No SupplierInvoice model
- ❌ No 3-way match workflow
- ❌ No purchase accounting integration

**What's Wrong:**
Missing the formal workflow:
```
PurchaseOrder (PENDING)
    ↓
GoodsReceipt (RECEIVED)
    ↓
SupplierInvoice (INVOICED)
    ↓
3-Way Match Validation
    ↓
AccountingEntry (GL posting)
    ↓
Payment
```

**What's Missing:**
- GoodsReceipt model (distinct from TankGauging)
- SupplierInvoice model:
  - supplier_id, invoice_number, invoice_date
  - po_id (reference), amount, tax
  - status (RECEIVED, VALIDATED, POSTED)
- ThreeWayMatch validation logic
- Purchase accounting entries
- Supplier performance metrics
- Invoice aging/payment tracking

**Impact:** Medium. Operational but missing compliance and reconciliation.

---

### 13. PERMISSIONS & RBAC
**Requirement:** 9 role types with specific permissions

**Current State:**
- ✅ User roles exist (ADMIN, MANAGER, SUPERVISOR, OPERATOR)
- ❌ Only 4 roles, need 9:
  - SUPER_ADMIN
  - COMPANY_ADMIN
  - STATION_MANAGER
  - SHIFT_MANAGER
  - CASHIER
  - PUMP_OPERATOR
  - STOCK_MANAGER
  - ACCOUNTANT
  - AUDITOR
- ❌ No permission matrix
- ❌ No resource-level access control (user can only see their station)

**What's Missing:**
- Permission model with granular access:
  - By action (create, read, update, delete)
  - By resource (Sale, Invoice, Price, etc.)
  - By scope (own shift, station, company, all)
- Role-permission mapping
- Dynamic permission checking in API
- Audit trail of permission usage
- Manager approval workflow for sensitive operations

**Impact:** Medium. Current RBAC is too coarse.

---

### 14. AUDIT & COMPLIANCE
**Requirement:** Comprehensive audit trail with regulatory compliance

**Current State:**
- ✅ AuditLog model exists
- ⚠️ Basic audit logging implemented
- ❌ No compliance matrix
- ❌ No regulatory requirement tracking
- ❌ No data retention policy
- ❌ No encryption at rest

**What's Missing:**
- Compliance matrix covering:
  - Hydrocarbon regulations (SONEDE, Ministry of Energy)
  - Price regulation (Ministry of Commerce)
  - Fiscal compliance (Ministry of Finance)
  - Data protection (INPDP Law 2004-63)
  - Equipment/metrological standards
- Data retention policies per entity
- Encryption for sensitive fields
- Audit report generation
- Regulatory change tracking
- Compliance sign-off workflows

**Impact:** Medium-High. Critical for regulatory certification.

---

### 15. CALCULATION ENGINE
**Requirement:** Centralized calculation engine

**Current State:**
- ❌ No centralized calculation engine
- ❌ Calculations scattered across controllers
- ⚠️ Sales calculation exists inline

**What's Missing:**
- PriceCalculator (HT, TVA, TTC, consumption tax)
- TaxCalculator (multiple tax types, versioned)
- InvoiceCalculator (totals, discounts)
- StockCalculator (theoretical, physical, variance)
- PumpCalculator (volume reconciliation)
- CashCalculator (expected vs actual)
- MarginCalculator (profit, margin %)
- CreditCalculator (available credit, aging)
- ReconciliationCalculator (shift reconciliation)

**Why:** Single source of truth for financial calculations ensures consistency.

**Impact:** High. Prevents calculation errors and ensures consistency.

---

### 16. OFFLINE MODE & SYNCHRONIZATION
**Requirement:** Offline capability with sync queue

**Current State:**
- ❌ No offline mode
- ❌ No sync queue
- ❌ No UUID for transactions
- ❌ No device_id tracking

**What's Missing:**
- Offline data persistence (local DB)
- Sync queue (pending operations)
- Transaction UUID for deduplication
- Conflict resolution
- Device identification
- Sync status tracking (PENDING, SYNCED, FAILED, RETRY)

**Impact:** Medium. Nice-to-have for resilience.

---

### 17. REPORTING & ANALYTICS
**Requirement:** Comprehensive reporting with KPIs

**Current State:**
- ✅ Basic reports exist (sales, analytics, credit aging)
- ⚠️ Dashboard with charts exists
- ❌ Missing many required reports
- ❌ No KPI calculation engine
- ❌ No drill-down capability

**What's Missing:**
- Sales Report (by product, customer, time)
- Analytics Dashboard (CA, volume, margin, stock, discrepancies)
- Daily Closure Report
- KIF Returns Report
- Audit Trail Report
- Credit Aging Report
- Pump/Nozzle Performance
- Tank Inventory Report
- Variance Analysis
- Profitability Analysis
- Customer Performance
- Supplier Performance
- Tax Compliance Report
- Inventory Valuation (CMP/CUMP)

**Impact:** Medium. Needed for management and compliance.

---

## STRUCTURAL ISSUES

### Issue 1: Database Schema Evolution
**Problem:** Product has `purchasePrice` and `sellingPrice` fields that should not exist. Price should be in separate ProductPrice table.

**Consequence:** Cannot maintain price history or comply with price regulation.

**Fix Required:** 
- Create ProductPrice model
- Migrate Product data to ProductPrice
- Create price versioning system

### Issue 2: Missing Company/Multi-Tenant
**Problem:** Station is root entity; Company should be.

**Consequence:** Cannot support group operations or company-level configuration.

**Fix Required:**
- Add Company model
- Add company_id foreign key to Station, User, etc.
- Create company hierarchy enforcement

### Issue 3: Tax System Hard-Coded
**Problem:** VAT hardcoded as 19% in Product.

**Consequence:** Cannot handle tax changes or multiple tax types.

**Fix Required:**
- Create TaxRate model
- Create ConsumptionTax model
- Build tax calculation engine
- Create tax versioning system

### Issue 4: Accounting Not Integrated
**Problem:** Sales/purchases tracked operationally, not accounting-wise.

**Consequence:** Cannot produce compliant financial statements.

**Fix Required:**
- Create accounting module (Account, JournalEntry, EntryLine, FiscalPeriod)
- Integrate with sales/purchases
- Auto-generate journal entries

### Issue 5: Invoice System Missing
**Problem:** No Invoice model or sequencing.

**Consequence:** Cannot issue compliant invoices or detect fraud (gap detection).

**Fix Required:**
- Create Invoice model
- Implement sequential numbering
- Gap detection logic
- Invoice lifecycle (DRAFT, VALIDATED, CANCELLED)

---

## PHASE MAPPING

### Currently Implemented:
- ✅ Phase 1: Station/POS (80% complete)
- ✅ Phase 2: Stock carburant (60% complete)

### Partially Implemented:
- ⚠️ Phase 3: Kiosque (10% complete - products exist, POS missing)
- ⚠️ Phase 4: Clients professionnels (30% complete - basic credit, no fleet)
- ⚠️ Phase 5: Finance (20% complete - sales tracked, accounting missing)

### Not Implemented:
- ❌ Phase 6: Multi-stations HQ (0%)
- ❌ Phase 7: Hardware integration (0%)

---

## PRIORITIZED ACTION ITEMS

### Critical (Blocking Compliance):
1. **Add Company model** - Multi-tenant foundation
2. **Implement ProductPrice versioning** - Price regulation compliance
3. **Create TaxRate/ConsumptionTax models** - Tax compliance
4. **Implement Invoice model with sequencing** - Fiscal compliance
5. **Create Accounting module** - Financial compliance

### High (Core Functionality):
6. Tank gauging workflow (theoretical vs physical stock)
7. Separate Nozzle model (proper pump/nozzle mapping)
8. Comprehensive shift reconciliation logic
9. Fleet cards and vehicles
10. 3-way match for purchases

### Medium (Important for Operations):
11. Kiosk POS workflow (boutique)
12. Barcode/SKU system
13. Promotions engine
14. Supplier invoice model
15. Enhanced RBAC (9 roles)

### Low (Nice-to-Have):
16. Offline mode and sync queue
17. Hardware integration layer
18. Advanced reporting
19. Anomaly detection rules
20. Compliance matrix documentation

---

## ESTIMATED EFFORT

- **Critical items (1-5):** 80-100 hours
- **High items (6-10):** 60-80 hours
- **Medium items (11-15):** 40-60 hours
- **Low items (16-20):** 40-60 hours

**Total:** ~220-300 hours to reach full compliance

---

## RECOMMENDATIONS

### Short Term (Next 2-3 Sprints):
1. Add Company model and refactor Station hierarchy
2. Implement ProductPrice versioning system
3. Add TaxRate and ConsumptionTax models
4. Create Invoice model with gap detection
5. Build basic Accounting module

### Medium Term (Next Quarter):
6. Tank gauging workflow
7. Nozzle model refactoring
8. Fleet cards implementation
9. Enhanced reconciliation logic
10. Supplier invoice model

### Long Term (Future):
- Hardware integration layer
- Multi-company dashboard
- Advanced reporting and analytics
- Offline mode
- Compliance automation

