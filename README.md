# PetroKnow Platform | Manufacturing Knowledge Hub
**PT Chandra Asri Pacific Tbk — CALIBER 2026 Innovation Challenge (Case 1)**

PetroKnow is an AI-powered manufacturing knowledge management and digital twin platform built for petrochemical plant operations. It unifies engineering documentation (Datasheets, GA Drawings, Interlock Logic Diagrams, P&ID, Plot Plans), standard operating procedures, One Point Lessons (OPLs), and historical maintenance records into a centralized, verifiable knowledge hub.

---

## 🏭 Plant Overview & Technical Assets (Linear Low-Density Polyethylene - LLDPE Unit)
The platform integrates real plant engineering sets and 56 One Point Lessons across 8 core equipment units:

1. **GA-1201A**: Hexane Feed Pump (Canned Motor Pump, Area 1200 - Feed Purification)
2. **YD-2301**: Pellet Dryer / Spin Dryer (Centrifugal Dewatering Unit, Area 2300 - Pelletizing & Finishing)
3. **DC-3401A**: Purge Column Bag Filter / Dust Collector (Pulse Jet Filter, Area 3400 - Degassing & Purging)
4. **KC-4501**: Cycle Gas Compressor (Centrifugal Recycle Compressor, Area 4500 - Reaction System)
5. **EA-5601**: Reaction Loop Heat Exchanger (Shell & Tube Exchanger, Area 5600 - Heat Recovery & Cooling)
6. **LV-6701**: Reactor Loop Product Discharge Level Control Valve (Globe Control Valve, Area 6700 - Reaction Control)
7. **CT-7801**: Cooling Tower Induced Draft Fan (Axial Fan, Area 7800 - Utility & Cooling System)
8. **FA-8901**: Flare Knockout Drum (Horizontal Vapor-Liquid Separator, Area 8900 - Safety & Flare Relief System)

---

## 🚀 Key Features

- **Interactive 2D Digital Twin Map**: Grounded in the official LLDPE Plot Plan and Process Flow (Battery limits, central 6-meter pipe rack, safety interlocks, and real-time sensor telemetry).
- **56 Verified One Point Lessons (OPLs)**: Direct access to standardized SOPs, root cause failure lessons, and step-by-step operating guidelines.
- **211 Maintenance Work Orders Integrated**: Comprehensive historical failure logs, MTBF/MTTR metrics, downtime analysis, and component wear tracking.
- **Physical QR & Barcode Scanner**: Scan equipment QR tags or spare part Code128 barcodes to instantly access engineering datasheets, interlock sequences, and inventory levels.
- **Industrial AI Knowledge Assistant**: Multi-turn operational troubleshooting with verifiable document citations, SME review workflows, and hallucination safeguards.
- **Knowledge Freshness & Retirement Wisdom**: Prevent institutional knowledge loss with retirement campaign modules and automated documentation freshness scoring.

---

## 🛠️ Tech Stack & Local Execution

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion
- **Deployment**: Vercel Serverless Platform

### Local Development:
```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Build for production
npm run build
```
