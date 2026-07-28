# Seed.ts Correction Progress

## Complete ✓

- [x] Plan approved by user
- [x] **Fix 1**: Import path `Tanks` → `Tank`
- [x] **Fix 2**: Station - added `code`, `city` fields
- [x] **Fix 3**: Products - added `category`, `vatRate`, `unitOfMeasure`, `minStockAlert`, `currentStock`
- [x] **Fix 4**: Pumps - replaced `reference` → `pumpNumber`, `status` → `active`, added `pistols` array
- [x] **Fix 5**: Added Tank seeding (2 tanks linked to products)
- [x] **Bug Fix**: Password - now passed as plain text (model handles hashing), fixing "Invalid email or password" login error
- [x] **Fix 7**: `catch(error)` → `catch(error: any)` for no-implicit-any TS strict mode
- [x] All changes verified against actual model schemas
