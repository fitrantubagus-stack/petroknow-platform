import { KnowledgeEntry, EquipmentNode, SparePart, DocumentItem, KnowledgeGap, ActivityItem, User, RetirementCampaign } from '../types';

export const INITIAL_USERS: Record<string, User> = {
  operator: {
    id: 'usr-op-01',
    name: 'Bayu Pratama',
    email: 'b.pratama@petroknow.internal',
    role: 'operator',
    title: 'Senior Field Operator',
    department: 'Olefins & Cracker Unit A',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  sme: {
    id: 'usr-sme-02',
    name: 'Dr. Irwan Santoso',
    email: 'i.santoso@petroknow.internal',
    role: 'sme',
    title: 'Principal Rotating Equipment SME',
    department: 'Reliability & Asset Integrity',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  supervisor: {
    id: 'usr-sup-03',
    name: 'Siti Rahmawati',
    email: 's.rahmawati@petroknow.internal',
    role: 'supervisor',
    title: 'Plant Operations & Knowledge Supervisor',
    department: 'Manufacturing Operations Management',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  }
};

export const INITIAL_EQUIPMENT: EquipmentNode[] = [
  {
    id: 'EQ-REC-101',
    code: 'EQ-REC-101',
    name: 'Catalytic Polymerization Loop Reactor',
    area: 'Zone A - Polymerization Unit',
    category: 'Reactor',
    description: 'High-pressure continuous loop tubular reactor for ethylene-hexene copolymerization with dual impeller circulation.',
    status: 'operational',
    x: 24,
    y: 35,
    temp: '88.4 °C',
    pressure: '38.2 bar',
    flowRate: '1,420 m³/h',
    linkedKnowledgeIds: ['KB-SOP-001', 'KB-TAC-002', 'KB-EMG-006'],
    linkedPartNumbers: ['PRT-GSK-8812', 'PRT-SEN-9901', 'PRT-ORP-5520'],
    lastInspected: '2026-07-15'
  },
  {
    id: 'EQ-CMP-204',
    code: 'EQ-CMP-204',
    name: 'Wet Gas Multi-Stage Reciprocating Compressor',
    area: 'Zone B - Gas Compression & Fractionation',
    category: 'Compressor',
    description: 'Critical 4-stage cracked gas compressor driven by a 6.2 MW synchronous motor with automated interstage cooling.',
    status: 'warning',
    x: 48,
    y: 28,
    temp: '112.8 °C',
    pressure: '24.5 bar',
    flowRate: '28,500 Nm³/h',
    linkedKnowledgeIds: ['KB-TRB-003', 'KB-SOP-004', 'KB-TAC-008'],
    linkedPartNumbers: ['PRT-MEC-3112', 'PRT-BRG-7731', 'PRT-FLT-2045'],
    lastInspected: '2026-06-10'
  },
  {
    id: 'EQ-VLV-302',
    code: 'EQ-VLV-302',
    name: 'High-Pressure Safety Relief & Quench Valve',
    area: 'Zone A - Reactor Safety Overpressure',
    category: 'Valve',
    description: 'Pilot-operated rapid depressurization emergency quench valve routed directly to the low-pressure flare header.',
    status: 'operational',
    x: 28,
    y: 62,
    temp: '42.1 °C',
    pressure: '41.0 bar (Set: 45 bar)',
    flowRate: '0 m³/h (Standby)',
    linkedKnowledgeIds: ['KB-EMG-006', 'KB-SOP-011'],
    linkedPartNumbers: ['PRT-VLV-4490', 'PRT-ORP-5520'],
    lastInspected: '2026-08-01'
  },
  {
    id: 'EQ-PMP-405',
    code: 'EQ-PMP-405',
    name: 'Heavy Hydrocarbon Slurry Circulation Pump',
    area: 'Zone C - Heavy Ends & Slurry Treatment',
    category: 'Pump',
    description: 'Heavy-duty centrifugal slurry pump with dual pressurized mechanical seal and Plan 53B barrier fluid reservoir.',
    status: 'operational',
    x: 68,
    y: 52,
    temp: '64.5 °C',
    pressure: '14.8 bar',
    flowRate: '380 m³/h',
    linkedKnowledgeIds: ['KB-SOP-007', 'KB-TAC-009'],
    linkedPartNumbers: ['PRT-IMP-1022', 'PRT-MEC-3112', 'PRT-GSK-8812'],
    lastInspected: '2026-05-20'
  },
  {
    id: 'EQ-TNK-501',
    code: 'EQ-TNK-501',
    name: 'Cryogenic Liquid Ethylene Storage Tank',
    area: 'Zone D - Tank Farm & Offsites',
    category: 'Storage Tank',
    description: 'Double-walled refrigerated cryogenic tank (15,000 m³) with vacuum perlite insulation and Boil-Off Gas recondensation.',
    status: 'operational',
    x: 82,
    y: 30,
    temp: '-103.2 °C',
    pressure: '1.18 bar',
    flowRate: '120 t/h',
    linkedKnowledgeIds: ['KB-SOP-005', 'KB-TRB-012'],
    linkedPartNumbers: ['PRT-SEN-9901', 'PRT-GSK-8812'],
    lastInspected: '2026-04-12'
  },
  {
    id: 'EQ-HEX-602',
    code: 'EQ-HEX-602',
    name: 'Shell & Tube High-Flux Feed Preheater',
    area: 'Zone B - Furnace Convection Section',
    category: 'Heat Exchanger',
    description: 'TEMA type AES counter-flow heat exchanger transferring heat from cracked effluent to incoming naphtha feed.',
    status: 'operational',
    x: 42,
    y: 70,
    temp: '245.0 °C',
    pressure: '18.4 bar',
    flowRate: '850 m³/h',
    linkedKnowledgeIds: ['KB-MNT-010', 'KB-TAC-013'],
    linkedPartNumbers: ['PRT-GSK-8812'],
    lastInspected: '2026-07-28'
  },
  {
    id: 'EQ-COL-701',
    code: 'EQ-COL-701',
    name: 'Primary Fractionation & Demethanizer Column',
    area: 'Zone B - Gas Separation Train',
    category: 'Column',
    description: '80-tray high-vacuum distillation column separating methane and hydrogen off-gas from C2+ hydrocarbon fractions.',
    status: 'operational',
    x: 60,
    y: 78,
    temp: '-85.0 °C (Top) / 78 °C (Btm)',
    pressure: '31.5 bar',
    flowRate: '210 t/h',
    linkedKnowledgeIds: ['KB-SOP-014', 'KB-TRB-015'],
    linkedPartNumbers: ['PRT-VLV-4490', 'PRT-SEN-9901'],
    lastInspected: '2026-06-25'
  }
];

export const INITIAL_SPARE_PARTS: SparePart[] = [
  {
    id: 'PRT-MEC-3112',
    partNumber: 'PRT-MEC-3112',
    name: 'Double Cartridge Mechanical Seal 85mm (SiC/TC)',
    category: 'Mechanical Seal',
    compatibleEquipmentIds: ['EQ-CMP-204', 'EQ-PMP-405'],
    currentStock: 1,
    minThreshold: 3,
    unit: 'sets',
    binLocation: 'Warehouse A, Rack 04-B',
    leadTimeDays: 28,
    lastRestocked: '2026-04-10',
    costUsd: 4200,
    specifications: 'API 682 Category 2/3 Arrangement 2/3 dual pressurized liquid barrier seal with silicon carbide vs tungsten carbide faces.'
  },
  {
    id: 'PRT-GSK-8812',
    partNumber: 'PRT-GSK-8812',
    name: 'Spiral Wound 316SS Flexible Graphite Gasket 6" Class 600',
    category: 'Gasket',
    compatibleEquipmentIds: ['EQ-REC-101', 'EQ-PMP-405', 'EQ-HEX-602', 'EQ-TNK-501'],
    currentStock: 14,
    minThreshold: 8,
    unit: 'pcs',
    binLocation: 'Warehouse B, Bin 12-01',
    leadTimeDays: 7,
    lastRestocked: '2026-07-02',
    costUsd: 65,
    specifications: 'ASME B16.20 Style CGI inner & outer ring, 316L winding with high-purity exfoliated flexible graphite filler.'
  },
  {
    id: 'PRT-VLV-4490',
    partNumber: 'PRT-VLV-4490',
    name: 'Reinforced Carbon-PTFE Ball Valve Seat Seal Ring Kit',
    category: 'Valve Trim',
    compatibleEquipmentIds: ['EQ-VLV-302', 'EQ-COL-701'],
    currentStock: 2,
    minThreshold: 4,
    unit: 'kits',
    binLocation: 'Warehouse A, Drawer 09-C',
    leadTimeDays: 14,
    lastRestocked: '2026-05-18',
    costUsd: 380,
    specifications: 'Cryo-tested Virgin PTFE reinforced with 15% glass fiber + 5% MoS2, firesafe certified to API 607.'
  },
  {
    id: 'PRT-IMP-1022',
    partNumber: 'PRT-IMP-1022',
    name: 'Enclosed Cast Duplex SS2205 Pump Impeller (320mm)',
    category: 'Impeller',
    compatibleEquipmentIds: ['EQ-PMP-405'],
    currentStock: 1,
    minThreshold: 2,
    unit: 'units',
    binLocation: 'Heavy Parts Bay 02',
    leadTimeDays: 45,
    lastRestocked: '2026-02-14',
    costUsd: 2850,
    specifications: 'Dynamically balanced to ISO 1940 Grade G2.5 with tungsten carbide hard-facing on leading vane edges.'
  },
  {
    id: 'PRT-BRG-7731',
    partNumber: 'PRT-BRG-7731',
    name: 'High-Precision Angular Contact Ceramic Hybrid Bearing 7314',
    category: 'Bearing',
    compatibleEquipmentIds: ['EQ-CMP-204'],
    currentStock: 4,
    minThreshold: 4,
    unit: 'pairs',
    binLocation: 'Cleanroom Shelf C-01',
    leadTimeDays: 21,
    lastRestocked: '2026-06-30',
    costUsd: 1150,
    specifications: 'Silicon Nitride (Si3N4) balls with brass cage, P4 precision class, ISO 492 vibration tested.'
  },
  {
    id: 'PRT-FLT-2045',
    partNumber: 'PRT-FLT-2045',
    name: 'Micro-Fiberglass Coalescing Lube Oil Filter Cartridge 5µm',
    category: 'Filter Cartridge',
    compatibleEquipmentIds: ['EQ-CMP-204'],
    currentStock: 18,
    minThreshold: 6,
    unit: 'pcs',
    binLocation: 'Warehouse B, Bin 03-A',
    leadTimeDays: 5,
    lastRestocked: '2026-08-10',
    costUsd: 120,
    specifications: 'Beta ratio β5 ≥ 200, synthetic coreless construction with fluorocarbon elastomer seals.'
  },
  {
    id: 'PRT-SEN-9901',
    partNumber: 'PRT-SEN-9901',
    name: 'Duplex RTD Pt100 4-Wire Class A Thermowell Sensor',
    category: 'Sensor',
    compatibleEquipmentIds: ['EQ-REC-101', 'EQ-TNK-501', 'EQ-COL-701'],
    currentStock: 6,
    minThreshold: 3,
    unit: 'units',
    binLocation: 'Instrumentation Locker 01',
    leadTimeDays: 10,
    lastRestocked: '2026-07-22',
    costUsd: 290,
    specifications: 'Operating range -200°C to +450°C, Hastelloy C-276 sheath, ATEX Zone 0 Ex ia IIC T6 intrinsically safe.'
  },
  {
    id: 'PRT-ORP-5520',
    partNumber: 'PRT-ORP-5520',
    name: 'High-Temperature Fluoroelastomer (Viton 90) O-Ring Kit #224',
    category: 'O-Ring Kit',
    compatibleEquipmentIds: ['EQ-REC-101', 'EQ-VLV-302'],
    currentStock: 25,
    minThreshold: 10,
    unit: 'boxes',
    binLocation: 'Warehouse A, Bin 15-E',
    leadTimeDays: 4,
    lastRestocked: '2026-08-05',
    costUsd: 45,
    specifications: '90 Shore A Durometer, continuous service from -20°C to +205°C, high resistance to aromatic hydrocarbons.'
  }
];

export const INITIAL_KNOWLEDGE_ENTRIES: KnowledgeEntry[] = [
  {
    id: 'KB-SOP-001',
    title: 'Loop Reactor Catalyst Injection Rate Adjustment During Grade Transitions',
    category: 'SOP',
    situation: 'When transitioning polymerization grade from High-Density Polyethylene (HDPE) Blow Molding to Film Grade (LLDPE), catalyst feed rate must be stepped down incrementally to prevent thermal runaway.',
    content: `### Objective
Safely modulate Ziegler-Natta / Metallocene catalyst feed rate to maintain reactor loop temperature at exactly 88.0 ± 1.5°C without triggering the high differential pressure trip.

### Pre-Transition Checks
1. Verify Triethylaluminum (TEAL) co-catalyst flow ratio is stabilized at 1:12 mole ratio.
2. Confirm secondary jacket cooling water recirculation pump P-102B is on auto-standby.
3. Review hexene comonomer feed purity analyzer reading (>99.5% purity required).

### Execution Sequence
- **Step 1:** Lower primary catalyst dosing pump stroke by 5% every 4 minutes.
- **Step 2:** Monitor reactor skin thermocouple delta T; if skin temperature exceeds 92°C, pause stroke reduction and increase cooling jacket flow by 12%.
- **Step 3:** Introduce hexene trim valve incrementally until target density reaches 0.918 g/cm³.
- **Step 4:** Take manual slurry flash sample after 45 minutes to verify Melt Flow Index (MFI).`,
    keySteps: [
      'Lower catalyst dosing pump stroke by 5% every 4 minutes',
      'Monitor reactor skin thermocouples (keep delta T < 4°C)',
      'Adjust hexene co-monomer ratio to match target density',
      'Sample product at flash tank after 45 min for Melt Index'
    ],
    author: 'Irwan Santoso',
    authorRole: 'Principal Process SME',
    submitDate: '2026-07-10',
    verifier: 'Siti Rahmawati (Operations Supervisor)',
    lastVerifiedDate: '2026-08-01',
    decayDaysThreshold: 90,
    status: 'verified',
    linkedEquipmentIds: ['EQ-REC-101'],
    linkedPartNumbers: ['PRT-GSK-8812', 'PRT-SEN-9901'],
    tags: ['catalyst', 'reactor', 'grade transition', 'polyethylene', 'temperature control'],
    sourceDocId: 'DOC-001',
    isTacit: false,
    viewsCount: 142,
    helpfulCount: 38,
    notHelpfulCount: 1
  },
  {
    id: 'KB-TAC-002',
    title: 'Tacit Tip: Detecting Micro-Fouling in Reactor Loop Before Thermocouple Lag',
    category: 'Tacit Experience',
    situation: 'During prolonged high-conversion copolymer runs, polymer film can build up on the inner tube walls before thermocouples register a thermal shift.',
    content: `### Experienced Operator Observation
Thermocouples have a 4-7 minute thermal inertia delay through the thick reactor wall. An experienced field operator can detect polymer crusting 15 minutes before DCS alarms sound by watching the circulation pump motor amperage signature.

### Field Heuristic
- When pump motor amperage exhibits rhythmic ±4.5 Amp hunting while loop density is steady, polymer sheeting is beginning to accumulate at the bottom return bend.
- **Immediate action:** Bump secondary antisolvent flush pulse (0.8 kg/s for 90 seconds) immediately. Do not wait for DCS high-temperature alarm.
- Inspect the pump discharge pressure gauge needle — vibration jitter > 0.4 bar is a secondary confirmation.`,
    keySteps: [
      'Observe circulation pump motor amperage for ±4.5 Amp cyclic fluctuations',
      'Check pump discharge pressure gauge needle for high-frequency jitter',
      'Trigger 90-second antisolvent pulse before thermal alarms sound',
      'Log observation in shift turnover note for next turnaround inspection'
    ],
    author: 'Bayu Pratama',
    authorRole: 'Senior Field Operator (18 yrs exp)',
    submitDate: '2026-07-20',
    verifier: 'Dr. Irwan Santoso (Rotating Equipment SME)',
    lastVerifiedDate: '2026-08-05',
    decayDaysThreshold: 120,
    status: 'verified',
    linkedEquipmentIds: ['EQ-REC-101'],
    linkedPartNumbers: ['PRT-SEN-9901'],
    tags: ['tacit knowledge', 'reactor fouling', 'pump amperage', 'troubleshooting', 'early detection'],
    sourceDocId: 'DOC-003',
    isTacit: true,
    viewsCount: 96,
    helpfulCount: 29,
    notHelpfulCount: 0
  },
  {
    id: 'KB-TRB-003',
    title: 'Reciprocating Compressor Stage 2 Discharge High Temperature & Valve Flutter Troubleshooting',
    category: 'Troubleshooting',
    situation: 'Compressor C-204 Stage 2 discharge temperature spikes above 120°C with audible high-frequency fluttering sound near cylinder head.',
    content: `### Root Cause Analysis
Discharge temperature rise (>115°C) combined with valve fluttering indicates either suction valve spring fatigue or plate valve debris entrapment, resulting in re-compression of hot gas.

### Diagnostic & Recovery Workflow
1. Check Stage 2 intercooler inlet/outlet differential temperature on DCS.
2. Use an infrared thermography gun on individual valve caps:
   - If one valve cap is >15°C hotter than adjacent caps on the same cylinder, that specific valve is leaking/broken.
3. Switch compressor cylinder pocket clearance unloader to 50% load to reduce thermal stress.
4. Prepare replacement valve assembly (Part # PRT-VLV-4490) and schedule offline swap if temperature exceeds 128°C.`,
    keySteps: [
      'Perform thermographic scan across all cylinder valve caps',
      'Identify hot valve cap (>15°C delta against neighboring caps)',
      'Unload cylinder pocket clearance to 50% to ease discharge temp',
      'Verify lube oil filter differential pressure (< 0.8 bar)'
    ],
    author: 'Dr. Irwan Santoso',
    authorRole: 'Rotating Equipment SME',
    submitDate: '2026-06-15',
    verifier: 'Siti Rahmawati',
    lastVerifiedDate: '2026-06-15', // Older date to demonstrate aging
    decayDaysThreshold: 60, // Stale! (Over 60 days)
    status: 'verified',
    linkedEquipmentIds: ['EQ-CMP-204'],
    linkedPartNumbers: ['PRT-MEC-3112', 'PRT-BRG-7731', 'PRT-FLT-2045'],
    tags: ['compressor', 'valve flutter', 'high temperature', 'troubleshooting', 'reciprocating'],
    sourceDocId: 'DOC-002',
    isTacit: false,
    viewsCount: 180,
    helpfulCount: 45,
    notHelpfulCount: 2
  },
  {
    id: 'KB-SOP-004',
    title: 'Wet Gas Compressor C-204 Lube Oil System Switching & Filter Replacement',
    category: 'Maintenance Guide',
    situation: 'Routine online changeover of duplex lube oil filters when differential pressure (DP) across active cartridge reaches 0.75 bar.',
    content: `### Required PPE & Prerequisites
- Chemical splash goggles, nitrile inner gloves with leather outer gloves.
- Spare filter cartridge: PRT-FLT-2045 (5µm Micro-Fiberglass).

### Step-by-Step Changeover Procedure
1. Open equalizing balance valve on the standby filter housing by 2 full turns to fill with warm lube oil slowly.
2. Bleed air from the standby housing air vent until a continuous, bubble-free stream of oil emerges into the drain bucket.
3. Smoothly rotate the 6-way continuous transfer changeover handle in one firm 180° motion. **Never stop mid-stroke** to prevent lube oil header pressure dip.
4. Confirm DCS lube oil header pressure remains steady at 3.2 ± 0.1 bar.
5. Depressurize and drain the isolated housing before unbolting the top cover to replace the clogged cartridge.`,
    keySteps: [
      'Slowly fill standby filter housing via balance line',
      'Bleed air completely until oil flow is solid & bubble-free',
      'Execute continuous 180° handle throw without hesitation',
      'Monitor header pressure on DCS throughout the stroke'
    ],
    author: 'Bayu Pratama',
    authorRole: 'Senior Field Operator',
    submitDate: '2026-08-02',
    verifier: 'Dr. Irwan Santoso',
    lastVerifiedDate: '2026-08-12',
    decayDaysThreshold: 180,
    status: 'verified',
    linkedEquipmentIds: ['EQ-CMP-204'],
    linkedPartNumbers: ['PRT-FLT-2045'],
    tags: ['lube oil', 'filter changeover', 'compressor maintenance', 'SOP', 'duplex filter'],
    sourceDocId: 'DOC-004',
    isTacit: false,
    viewsCount: 65,
    helpfulCount: 18,
    notHelpfulCount: 0
  },
  {
    id: 'KB-SOP-005',
    title: 'Cryogenic Liquid Ethylene Storage Tank Boil-Off Gas (BOG) Compressor Balancing',
    category: 'SOP',
    situation: 'Balancing vapor pressure inside cryogenic tank TK-501 during high atmospheric ambient temperature days or ship unloading.',
    content: `### Process Description
Ethylene boils at -103.7°C at atmospheric pressure. Heat ingress through tank insulation generates Boil-Off Gas (BOG) that must be continuously compressed and re-liquefied or routed to the ethylene cracker fuel gas system.

### Operating Rules
- Maintain tank vapor space pressure between 1.08 bar and 1.22 bar absolute.
- If pressure climbs past 1.25 bar, step start the secondary BOG reciprocating compressor.
- Ensure compressor suction temperature stays above -110°C to avoid liquid droplet carryover.`,
    keySteps: [
      'Monitor tank vapor space pressure transmitter PT-501A/B',
      'Check suction superheat on BOG compressor inlet',
      'Engage secondary stage recycle valve on auto-cascade mode',
      'Verify tank relief pilot valve seals are frost-free'
    ],
    author: 'Dr. Irwan Santoso',
    authorRole: 'Rotating Equipment SME',
    submitDate: '2026-03-10',
    verifier: 'Siti Rahmawati',
    lastVerifiedDate: '2026-03-15', // Stale entry (over 160 days)
    decayDaysThreshold: 90,
    status: 'verified',
    linkedEquipmentIds: ['EQ-TNK-501'],
    linkedPartNumbers: ['PRT-SEN-9901'],
    tags: ['cryogenic', 'ethylene', 'BOG compressor', 'tank farm', 'pressure safety'],
    sourceDocId: 'DOC-005',
    isTacit: false,
    viewsCount: 88,
    helpfulCount: 22,
    notHelpfulCount: 1
  },
  {
    id: 'KB-EMG-006',
    title: 'High-Pressure Reactor Thermal Runaway Emergency Quench Procedure',
    category: 'Emergency Procedure',
    situation: 'When polymerization reactor temperature exceeds 102°C or rate of temperature rise exceeds 1.8°C/minute despite maximum cooling jacket water flow.',
    content: `### CRITICAL SAFETY INTERVENTION
**DO NOT DELAY QUENCH INJECTION.** A thermal runaway can reach rupture disk burst pressure in under 90 seconds.

### Automated and Manual Steps
1. **Immediate Action:** Hit physical emergency red push-button (HS-101) in DCS control room or field console to trigger automated carbon monoxide (CO) catalyst poison injection into reactor inlet.
2. Verify emergency valve **EQ-VLV-302** opens immediately (100% stroke in < 1.2 seconds).
3. Switch off main catalyst feed pump P-101A/B electrical breakers.
4. Divert reactor effluent directly to Emergency Blowdown Vessel & Flare Header.
5. Sound plant Tier-1 Evacuation Siren for Zone A.`,
    keySteps: [
      'Press emergency kill button HS-101 for CO catalyst poison injection',
      'Confirm EQ-VLV-302 quench valve full stroke to flare header',
      'Kill catalyst feed pump main breakers',
      'Monitor reactor pressure bleed-down on DCS graphic'
    ],
    author: 'Siti Rahmawati',
    authorRole: 'Operations Supervisor',
    submitDate: '2026-08-01',
    verifier: 'Dr. Irwan Santoso',
    lastVerifiedDate: '2026-08-18',
    decayDaysThreshold: 60,
    status: 'verified',
    linkedEquipmentIds: ['EQ-REC-101', 'EQ-VLV-302'],
    linkedPartNumbers: ['PRT-VLV-4490', 'PRT-ORP-5520'],
    tags: ['emergency', 'thermal runaway', 'quench', 'catalyst kill', 'safety relief'],
    sourceDocId: 'DOC-006',
    isTacit: false,
    viewsCount: 310,
    helpfulCount: 89,
    notHelpfulCount: 0
  },
  {
    id: 'KB-SOP-007',
    title: 'Slurry Circulation Pump P-405 Mechanical Seal Barrier Fluid (Plan 53B) Servicing',
    category: 'Maintenance Guide',
    situation: 'Refilling and pre-charging the nitrogen accumulator on API Plan 53B pressurized barrier fluid system when reservoir level dips below 25%.',
    content: `### Equipment & Barrier Fluid
- Synthetic polyalphaolefin (PAO) ISO VG 32 barrier fluid.
- Mechanical seal assembly: PRT-MEC-3112.

### Procedure
1. Confirm nitrogen supply bottle pressure is minimum 20 bar above system operating pressure.
2. Isolate barrier fluid circulating loop top block valve.
3. Top up oil using manual hydraulic hand pump to 80% sight glass level.
4. Set nitrogen blanket regulator to 4.5 bar above seal chamber pressure (total 19.3 bar).
5. Open loop valves and inspect cooling coil finned tubing for debris or leaks.`,
    keySteps: [
      'Check nitrogen pre-charge pressure with bladder tester',
      'Pump ISO VG 32 PAO fluid until level reaches 80% mark on sight glass',
      'Adjust N2 regulator to exactly seal chamber pressure + 4.5 bar',
      'Verify zero bubble formation at seal pot drain plug'
    ],
    author: 'Bayu Pratama',
    authorRole: 'Senior Field Operator',
    submitDate: '2026-07-25',
    verifier: 'Dr. Irwan Santoso',
    lastVerifiedDate: '2026-07-28',
    decayDaysThreshold: 180,
    status: 'verified',
    linkedEquipmentIds: ['EQ-PMP-405'],
    linkedPartNumbers: ['PRT-MEC-3112', 'PRT-IMP-1022'],
    tags: ['slurry pump', 'mechanical seal', 'Plan 53B', 'barrier fluid', 'maintenance'],
    sourceDocId: 'DOC-007',
    isTacit: false,
    viewsCount: 52,
    helpfulCount: 14,
    notHelpfulCount: 0
  },
  {
    id: 'KB-TAC-008',
    title: 'Tacit Tip: Clearing Wax Solidification on Gas Compressor Unloader Piston',
    category: 'Tacit Experience',
    situation: 'Heavy polymer wax aerosols can solidify in compressor clearance pocket unloader stems during cold night shifts.',
    content: `### Field Veteran Solution
When the pneumatic actuator fails to stroke the unloader valve on C-204 Stage 3, do NOT use a hammer on the stem. This bends the titanium rod and ruins the dynamic seal.

### Verified Safe Technique
1. Direct a 2.5 bar low-pressure steam tracing hose onto the unloader bonnet casting for exactly 8 minutes.
2. Apply 3 squirts of synthetic high-flash hydrocarbon solvent (Solvesso 150) through the lubrication port.
3. Stroke the manual override handwheel back and forth twice. The wax dissolves instantly and the unloader frees up smoothly.`,
    keySteps: [
      'Never strike the unloader stem with tools or impact force',
      'Apply steam lance to outer casting bonnet for 8 minutes',
      'Inject 30 ml Solvesso 150 into lube port',
      'Exercise manual handwheel to verify smooth travel'
    ],
    author: 'Bayu Pratama',
    authorRole: 'Senior Field Operator (18 yrs exp)',
    submitDate: '2026-08-15',
    verifier: 'Dr. Irwan Santoso',
    lastVerifiedDate: '2026-08-16',
    decayDaysThreshold: 120,
    status: 'verified',
    linkedEquipmentIds: ['EQ-CMP-204'],
    linkedPartNumbers: ['PRT-VLV-4490'],
    tags: ['tacit knowledge', 'compressor unloader', 'wax removal', 'field tricks', 'actuator'],
    sourceDocId: 'DOC-008',
    isTacit: true,
    viewsCount: 110,
    helpfulCount: 41,
    notHelpfulCount: 0
  },
  {
    id: 'KB-PEN-009',
    title: 'Draft: Flange Torque Specification for Cryogenic Piping Lines (Scanned from Paper SOP)',
    category: 'SOP',
    situation: 'Extracted via OCR scan from paper archive folder "Piping Maintenance Spec 2018". Pending formal engineer sign-off.',
    content: `### Draft OCR Ingested Content
*Note: Scanned from hardcopy SOP-PIP-2018-092. Verify bolt tightening torque sequence.*

### Specified Torque Values (B7M / L7M Cryo Studs)
- **4" Class 300 Flange:** 165 Nm cross-pattern star sequence.
- **6" Class 600 Flange:** 340 Nm 4-stage torque sequence (30%, 60%, 100%, +1 round at 100%).
- **Gasket Spec:** PRT-GSK-8812 (Spiral wound 316SS with graphite).
- **Post-Cooldown Hot-Bolting Rule:** Never re-torque cryogenic flanges while at -100°C under pressure!`,
    keySteps: [
      'Clean flange faces with brass wire brush (zero radial scratches)',
      'Apply Molykote paste only to bolt threads and nut face',
      'Torque in 4 distinct passes in star sequence (30%, 60%, 100%, final check)',
      'Inspect outer ring centering gap before system pressurization'
    ],
    author: 'Scanned Document OCR (Auto-Ingested)',
    authorRole: 'Document Digitizer System',
    submitDate: '2026-08-20',
    decayDaysThreshold: 90,
    status: 'pending',
    linkedEquipmentIds: ['EQ-TNK-501', 'EQ-HEX-602'],
    linkedPartNumbers: ['PRT-GSK-8812'],
    tags: ['flange', 'torque', 'bolting', 'cryogenic', 'scanned document', 'pending review'],
    sourceDocId: 'DOC-009',
    isTacit: false,
    viewsCount: 12,
    helpfulCount: 0,
    notHelpfulCount: 0
  },
  {
    id: 'KB-PEN-010',
    title: 'Draft Tacit Knowledge: Avoiding Cavitation Noise on Slurry Booster Pump P-405',
    category: 'Tacit Experience',
    situation: 'Submitted by Junior Technician Rudi Setiawan for review by SME.',
    content: `When slurry tank level is below 35%, P-405 starts vibrating with gravel-like noise. We found that throttling the suction valve slightly reduces the noise.

*SME Review Note needed: Throttling suction valve on slurry pumps is dangerous and can cause severe cavitation damage to impeller (PRT-IMP-1022). Need to amend procedure to throttle discharge or adjust tank recycle.*`,
    keySteps: [
      'Observe tank level threshold (<35%)',
      'Check NPSH available on suction pressure transmitter',
      'Adjust tank return recycle line rather than throttling suction'
    ],
    author: 'Rudi Setiawan',
    authorRole: 'Junior Field Technician',
    submitDate: '2026-08-21',
    decayDaysThreshold: 90,
    status: 'pending',
    linkedEquipmentIds: ['EQ-PMP-405'],
    linkedPartNumbers: ['PRT-IMP-1022'],
    tags: ['tacit knowledge', 'pump cavitation', 'slurry pump', 'pending review'],
    isTacit: true,
    viewsCount: 8,
    helpfulCount: 0,
    notHelpfulCount: 0
  }
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'DOC-001',
    title: 'SOP-POLY-042: Catalytic Loop Reactor Operational Operating Limits and Grade Transition Guidelines',
    docNumber: 'SOP-POLY-042',
    category: 'Process SOP',
    source: 'Uploaded',
    status: 'Indexed',
    uploadDate: '2026-07-10',
    fileType: 'PDF',
    fileSize: '3.4 MB',
    extractedSnippet: 'Standard operating boundaries for Ziegler-Natta polymerization loop reactors with temperature trip limits at 96°C.',
    linkedKnowledgeId: 'KB-SOP-001',
    uploader: 'Dr. Irwan Santoso'
  },
  {
    id: 'DOC-002',
    title: 'MNT-CMP-204-REV4: Reciprocating Compressor Cylinder & Valve Maintenance Manual',
    docNumber: 'MNT-CMP-204',
    category: 'Equipment Manual',
    source: 'Uploaded',
    status: 'Indexed',
    uploadDate: '2026-06-15',
    fileType: 'PDF',
    fileSize: '8.1 MB',
    extractedSnippet: 'Thermographic inspection criteria for plate and poppet valves on 4-stage wet gas reciprocating compression trains.',
    linkedKnowledgeId: 'KB-TRB-003',
    uploader: 'Siti Rahmawati'
  },
  {
    id: 'DOC-003',
    title: 'TACIT-MEMO-2026-07: Field Heuristics on Early Reactor Fouling Detection via Motor Current Draw',
    docNumber: 'TACIT-MEMO-07',
    category: 'Tacit Log',
    source: 'Manual Entry',
    status: 'Indexed',
    uploadDate: '2026-07-20',
    fileType: 'DOCX',
    fileSize: '0.8 MB',
    extractedSnippet: 'Documented field wisdom from 18 years operating the loop reactor line during high hexene copolymerization campaigns.',
    linkedKnowledgeId: 'KB-TAC-002',
    uploader: 'Bayu Pratama'
  },
  {
    id: 'DOC-004',
    title: 'SOP-LUB-018: Duplex Lube Oil Filter Online Changeover and Cartridge Replacement Protocol',
    docNumber: 'SOP-LUB-018',
    category: 'Maintenance SOP',
    source: 'Uploaded',
    status: 'Indexed',
    uploadDate: '2026-08-02',
    fileType: 'PDF',
    fileSize: '2.1 MB',
    extractedSnippet: 'Step-by-step 180 degree handle throw procedure ensuring zero pressure dip in critical rotating equipment bearings.',
    linkedKnowledgeId: 'KB-SOP-004',
    uploader: 'Bayu Pratama'
  },
  {
    id: 'DOC-006',
    title: 'EMG-SOP-001: Loop Reactor Emergency Carbon Monoxide Poison Quench Sequence',
    docNumber: 'EMG-SOP-001',
    category: 'Emergency Protocol',
    source: 'Uploaded',
    status: 'Indexed',
    uploadDate: '2026-08-01',
    fileType: 'PDF',
    fileSize: '1.9 MB',
    extractedSnippet: 'Critical Tier-1 safety response protocol for loop reactor thermal runaway with automatic overpressure relief routing.',
    linkedKnowledgeId: 'KB-EMG-006',
    uploader: 'Siti Rahmawati'
  },
  {
    id: 'DOC-009',
    title: 'SCANNED-SOP-PIP-2018-092: Cryogenic Piping Flange Torque & Star Pattern Tightening Specifications',
    docNumber: 'SOP-PIP-2018-092',
    category: 'Scanned Paper SOP',
    source: 'Scanned',
    status: 'Needs Review',
    uploadDate: '2026-08-20',
    fileType: 'IMAGE',
    fileSize: '4.7 MB',
    extractedSnippet: 'Scanned archival document for B7M cryogenic stud torque tightening passes with spiral wound gasket specs.',
    linkedKnowledgeId: 'KB-PEN-009',
    uploader: 'Document Scanner OCR'
  }
];

export const INITIAL_KNOWLEDGE_GAPS: KnowledgeGap[] = [
  {
    id: 'GAP-001',
    question: 'What is the maximum allowable differential pressure across the Demethanizer Column COL-701 top demister pad before shutdown is mandatory?',
    askedBy: 'Bayu Pratama',
    askedDate: '2026-08-22',
    category: 'Process Safety',
    relatedEquipmentId: 'EQ-COL-701',
    status: 'unassigned',
    impact: 'High'
  },
  {
    id: 'GAP-002',
    question: 'How to safely purge hydrocarbon gas from cryogenic ethylene storage tank vacuum insulation jacket without losing insulating vacuum?',
    askedBy: 'Agus Wijaya',
    askedDate: '2026-08-21',
    category: 'Cryogenic Maintenance',
    relatedEquipmentId: 'EQ-TNK-501',
    status: 'assigned',
    assignedTo: 'Dr. Irwan Santoso',
    impact: 'Medium'
  }
];

export const INITIAL_ACTIVITY_FEED: ActivityItem[] = [
  {
    id: 'ACT-001',
    timestamp: '10 mins ago',
    user: 'Siti Rahmawati',
    role: 'supervisor',
    actionType: 'verify',
    title: 'Approved Knowledge Entry',
    detail: 'Verified and approved "Loop Reactor Catalyst Injection Rate Adjustment" (KB-SOP-001) for active AI citation.',
    targetId: 'KB-SOP-001'
  },
  {
    id: 'ACT-002',
    timestamp: '42 mins ago',
    user: 'Bayu Pratama',
    role: 'operator',
    actionType: 'scan_qr',
    title: 'Equipment QR Code Scanned',
    detail: 'Scanned QR code for Wet Gas Reciprocating Compressor (EQ-CMP-204) at Zone B.',
    targetId: 'EQ-CMP-204'
  },
  {
    id: 'ACT-003',
    timestamp: '2 hours ago',
    user: 'Document Scanner OCR',
    role: 'sme',
    actionType: 'scan_ocr',
    title: 'New Scanned SOP Ingested',
    detail: 'Digitized paper document "SOP-PIP-2018-092" into draft entry KB-PEN-009 for expert review.',
    targetId: 'KB-PEN-009'
  },
  {
    id: 'ACT-004',
    timestamp: '3 hours ago',
    user: 'AI Assistant',
    role: 'operator',
    actionType: 'gap_logged',
    title: 'New Knowledge Gap Logged',
    detail: 'Logged unanswered question regarding Demethanizer COL-701 top demister delta P limit.',
    targetId: 'GAP-001'
  },
  {
    id: 'ACT-005',
    timestamp: '5 hours ago',
    user: 'Bayu Pratama',
    role: 'operator',
    actionType: 'scan_barcode',
    title: 'Spare Part Barcode Scanned',
    detail: 'Scanned linear barcode for PRT-MEC-3112 (Double Cartridge Mechanical Seal). Stock low warning triggered.',
    targetId: 'PRT-MEC-3112'
  }
];

export const INITIAL_RETIREMENT_CAMPAIGNS: RetirementCampaign[] = [
  {
    id: 'CAMP-2026-001',
    smeName: 'Dr. Irwan Santoso',
    smeEmail: 'i.santoso@petroknow.internal',
    smeRoleTitle: 'Principal Rotating Equipment SME (32 Yrs Service)',
    department: 'Reliability & Asset Integrity',
    targetDepartureDate: '2026-09-12', // ~20 days left
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    notes: 'Prioritized capture of reciprocating compressor acoustic diagnosis heuristics and high-pressure mechanical seal barrier fluid leak troubleshooting.',
    createdAt: '2026-08-01',
    status: 'Active',
    criticalTopics: [
      {
        topicId: 'TOPIC-001',
        topicTitle: 'Reciprocating Compressor Stage 2 Flutter & High Temp Recovery',
        category: 'Troubleshooting',
        equipmentId: 'EQ-CMP-204',
        importance: 'Critical',
        notes: 'Sound acoustic signature changes preceding plate valve failure'
      },
      {
        topicId: 'TOPIC-002',
        topicTitle: 'Plan 53B Barrier Fluid Micro-Leak Detection in Slurry Pumps',
        category: 'Tacit Experience',
        equipmentId: 'EQ-PMP-405',
        importance: 'Critical',
        notes: 'Differential pressure drop subtleties under heavy catalyst polymer slurry load'
      },
      {
        topicId: 'TOPIC-003',
        topicTitle: 'Cryogenic Tank Boil-Off Gas Recondensation Compressor Emergency Bypass',
        category: 'Emergency Procedure',
        equipmentId: 'EQ-TNK-501',
        importance: 'High',
        notes: 'Flare header balancing during cryogenic tank surge'
      },
      {
        topicId: 'TOPIC-004',
        topicTitle: 'Demethanizer Vacuum Column Bottom Level Oscillations Suppression',
        category: 'Tacit Experience',
        equipmentId: 'EQ-COL-701',
        importance: 'High',
        notes: 'Manual reflux trimming during sudden cold weather ambient temperature drops'
      }
    ]
  },
  {
    id: 'CAMP-2026-002',
    smeName: 'Rudi Gunawan',
    smeEmail: 'r.gunawan@petroknow.internal',
    smeRoleTitle: 'Lead Olefins Cracking Furnace Specialist (28 Yrs Service)',
    department: 'Furnace & Pyrolysis Train A',
    targetDepartureDate: '2026-08-31', // ~8 days left (< 14 days, low progress -> URGENT!)
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    notes: 'Urgent campaign: Rudi retires at the end of the month. Critical furnace decoking flame pattern heuristics must be documented before handoff.',
    createdAt: '2026-08-10',
    status: 'Active',
    criticalTopics: [
      {
        topicId: 'TOPIC-005',
        topicTitle: 'Pyrolysis Furnace Tube Hotspot Identification via Optical Pyrometer',
        category: 'Tacit Experience',
        equipmentId: 'EQ-HEX-602',
        importance: 'Critical',
        notes: 'Distinguishing coking hotspots from refractory reflections'
      },
      {
        topicId: 'TOPIC-006',
        topicTitle: 'Emergency Hydrocarbon Feed Trip steam-purge sequencing',
        category: 'Emergency Procedure',
        equipmentId: 'EQ-REC-101',
        importance: 'Critical',
        notes: 'Preventing tube carburization during sudden power trips'
      },
      {
        topicId: 'TOPIC-007',
        topicTitle: 'Convection Section Draft Fan Damper Calibration Tuning',
        category: 'Maintenance Guide',
        equipmentId: 'EQ-HEX-602',
        importance: 'Medium',
        notes: 'Negative furnace draft stabilization under monsoon cross-winds'
      }
    ]
  },
  {
    id: 'CAMP-2026-003',
    smeName: 'Hendra Wijaya',
    smeEmail: 'h.wijaya@petroknow.internal',
    smeRoleTitle: 'Chief Instrumentation & SIS Architect (30 Yrs Service)',
    department: 'Plant Automation & Safety Systems',
    targetDepartureDate: '2026-10-15',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    notes: 'Safety Instrumented Systems (SIS) logic interlock bypass protocol knowledge capture.',
    createdAt: '2026-08-15',
    status: 'Active',
    criticalTopics: [
      {
        topicId: 'TOPIC-008',
        topicTitle: 'SIL-3 Emergency Shutdown (ESD) Solenoid Partial Stroke Testing Protocol',
        category: 'Safety Protocol',
        equipmentId: 'EQ-VLV-302',
        importance: 'Critical',
        notes: 'Online proof test without initiating nuisance reactor trips'
      },
      {
        topicId: 'TOPIC-009',
        topicTitle: 'Field RTD 4-Wire Signal Drift Diagnostics in High RF Environments',
        category: 'Troubleshooting',
        equipmentId: 'EQ-REC-101',
        importance: 'High',
        notes: 'Ground loop identification in polymer reactor VFD cabinets'
      }
    ]
  }
];

