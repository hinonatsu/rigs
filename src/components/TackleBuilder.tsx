import React, { useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronUp,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  X,
} from 'lucide-react';

// ============================================================================
// Types & Data Models
// ============================================================================

export type PartCategory = 'reel' | 'rod' | 'line' | 'lure';

export interface ReelPart {
  id: string;
  category: 'reel';
  brand: string;
  name: string;
  subCode: string;
  price: number;
  image: string;
  sizeClass: 14000 | 18000 | 20000;
  dragMaxKg: number;
  peCapacityNum: number;
  peCapacityMeter: number;
  weightG: number;
  gearRatio: string;
  specs: { label: string; value: string }[];
}

export interface RodPart {
  id: string;
  category: 'rod';
  brand: string;
  name: string;
  subCode: string;
  price: number;
  image: string;
  compatibleReelSizes: number[];
  maxPe: number;
  minPe: number;
  lureMinG: number;
  lureMaxG: number;
  dragMaxKg: number;
  lengthFt: string;
  weightG: number;
  specs: { label: string; value: string }[];
}

export interface LinePart {
  id: string;
  category: 'line';
  brand: string;
  name: string;
  subCode: string;
  price: number;
  image: string;
  peNumber: number;
  lengthM: number;
  strengthLb: number;
  pairedLeaderSpec: string;
  specs: { label: string; value: string }[];
}

export interface LurePart {
  id: string;
  category: 'lure';
  brand: string;
  name: string;
  subCode: string;
  price: number;
  image: string;
  bodyWeightG: number;
  hookRingWeightG: number;
  totalWeightG: number;
  minPe: number;
  lengthMm: number;
  hookSpec: string;
  specs: { label: string; value: string }[];
}

export type AnyRigPart = ReelPart | RodPart | LinePart | LurePart;

export interface RigState {
  reel: ReelPart | null;
  rod: RodPart | null;
  line: LinePart | null;
  lure: LurePart | null;
}

// ============================================================================
// Master Curated Gear Data (Placeholder Images: #222222 / #00E5FF)
// ============================================================================

const REEL_CATALOG: ReelPart[] = [
  {
    id: 'reel-stella-14000xg',
    category: 'reel',
    brand: 'SHIMANO',
    name: '19 STELLA SW 14000XG',
    subCode: 'SPOOL #14000 // HIGH SPEED',
    price: 119300,
    image: 'https://placehold.co/400x400/222222/00E5FF?text=STELLA+SW+14000XG',
    sizeClass: 14000,
    dragMaxKg: 25,
    peCapacityNum: 6,
    peCapacityMeter: 300,
    weightG: 675,
    gearRatio: '6.2:1 (134cm)',
    specs: [
      { label: 'Drag Max', value: '25kg' },
      { label: 'PE Line', value: '#6-300m' },
      { label: 'Retrieve', value: '134cm / rev' },
      { label: 'Weight', value: '675g' },
    ],
  },
  {
    id: 'reel-saltiga-14000xh',
    category: 'reel',
    brand: 'DAIWA',
    name: '20 SALTIGA 14000-XH',
    subCode: 'MONOCOQUE // #14000',
    price: 119900,
    image: 'https://placehold.co/400x400/222222/00E5FF?text=SALTIGA+14000-XH',
    sizeClass: 14000,
    dragMaxKg: 25,
    peCapacityNum: 6,
    peCapacityMeter: 300,
    weightG: 665,
    gearRatio: '6.2:1 (134cm)',
    specs: [
      { label: 'Drag Max', value: '25kg' },
      { label: 'PE Line', value: '#6-300m' },
      { label: 'Retrieve', value: '134cm / rev' },
      { label: 'Weight', value: '665g' },
    ],
  },
  {
    id: 'reel-stella-18000hg',
    category: 'reel',
    brand: 'SHIMANO',
    name: '20 STELLA SW 18000HG',
    subCode: 'HEAVY TUNA // #18000',
    price: 130900,
    image: 'https://placehold.co/400x400/222222/00E5FF?text=STELLA+SW+18000HG',
    sizeClass: 18000,
    dragMaxKg: 28,
    peCapacityNum: 8,
    peCapacityMeter: 300,
    weightG: 875,
    gearRatio: '5.7:1 (129cm)',
    specs: [
      { label: 'Drag Max', value: '28kg' },
      { label: 'PE Line', value: '#8-300m' },
      { label: 'Retrieve', value: '129cm / rev' },
      { label: 'Weight', value: '875g' },
    ],
  },
  {
    id: 'reel-saltiga-20000h',
    category: 'reel',
    brand: 'DAIWA',
    name: '20 SALTIGA 20000-H',
    subCode: 'EXPEDITION MONSTER // #20000',
    price: 141900,
    image: 'https://placehold.co/400x400/222222/00E5FF?text=SALTIGA+20000-H',
    sizeClass: 20000,
    dragMaxKg: 30,
    peCapacityNum: 10,
    peCapacityMeter: 300,
    weightG: 890,
    gearRatio: '5.8:1 (143cm)',
    specs: [
      { label: 'Drag Max', value: '30kg' },
      { label: 'PE Line', value: '#10-300m' },
      { label: 'Retrieve', value: '143cm / rev' },
      { label: 'Weight', value: '890g' },
    ],
  },
];

const ROD_CATALOG: RodPart[] = [
  {
    id: 'rod-aquila-82-36',
    category: 'rod',
    brand: 'RIPPLE FISHER',
    name: 'Aquila MLT 82-3/6',
    subCode: 'TECHNICAL CAST // PE #3-6',
    price: 78100,
    image: 'https://placehold.co/400x400/222222/00E5FF?text=Aquila+MLT+82-3/6',
    compatibleReelSizes: [14000],
    minPe: 3,
    maxPe: 6,
    lureMinG: 40,
    lureMaxG: 110,
    dragMaxKg: 11,
    lengthFt: '8\'2"',
    weightG: 346,
    specs: [
      { label: 'PE Line', value: '#3-6 Max' },
      { label: 'Lure Wt', value: '40-110g' },
      { label: 'Drag Max', value: '11kg (45°)' },
      { label: 'Reel Fit', value: '#14000' },
    ],
  },
  {
    id: 'rod-explosion-865hf',
    category: 'rod',
    brand: "MC WORKS'",
    name: 'EXPLOSION 865HF',
    subCode: 'FULL CONTACT // PE #5-8',
    price: 69300,
    image: 'https://placehold.co/400x400/222222/00E5FF?text=EXPLOSION+865HF',
    compatibleReelSizes: [14000, 18000],
    minPe: 5,
    maxPe: 8,
    lureMinG: 60,
    lureMaxG: 130,
    dragMaxKg: 15,
    lengthFt: '8\'6"',
    weightG: 375,
    specs: [
      { label: 'PE Line', value: '#5-8 Max' },
      { label: 'Lure Wt', value: '60-130g' },
      { label: 'Drag Max', value: '15kg (45°)' },
      { label: 'Reel Fit', value: '#14000 / #18000' },
    ],
  },
  {
    id: 'rod-ultimo-83m',
    category: 'rod',
    brand: 'RIPPLE FISHER',
    name: 'Ultimo 83M Nano',
    subCode: 'OFFSHORE KINGFISH // PE #6-8',
    price: 83600,
    image: 'https://placehold.co/400x400/222222/00E5FF?text=Ultimo+83M+Nano',
    compatibleReelSizes: [14000, 18000],
    minPe: 6,
    maxPe: 8,
    lureMinG: 70,
    lureMaxG: 150,
    dragMaxKg: 16,
    lengthFt: '8\'3"',
    weightG: 388,
    specs: [
      { label: 'PE Line', value: '#6-8 Max' },
      { label: 'Lure Wt', value: '70-150g' },
      { label: 'Drag Max', value: '16kg (45°)' },
      { label: 'Reel Fit', value: '#14000 / #18000' },
    ],
  },
  {
    id: 'rod-bigtuna-83',
    category: 'rod',
    brand: 'RIPPLE FISHER',
    name: 'BIG TUNA 83 Japan Special',
    subCode: 'BLUEFIN STAND-UP // PE #8-12',
    price: 86900,
    image: 'https://placehold.co/400x400/222222/00E5FF?text=BIG+TUNA+83',
    compatibleReelSizes: [18000, 20000],
    minPe: 8,
    maxPe: 12,
    lureMinG: 70,
    lureMaxG: 180,
    dragMaxKg: 18,
    lengthFt: '8\'3"',
    weightG: 440,
    specs: [
      { label: 'PE Line', value: '#8-12 Max' },
      { label: 'Lure Wt', value: '70-180g' },
      { label: 'Drag Max', value: '18kg (45°)' },
      { label: 'Reel Fit', value: '#18000 / #20000' },
    ],
  },
];

const LINE_CATALOG: LinePart[] = [
  {
    id: 'line-varivas-smp-pe6',
    category: 'line',
    brand: 'VARIVAS',
    name: 'Avani Casting PE SMP #6 (300m)',
    subCode: 'AUTO-BOUND: 130lb NYLON LEADER',
    price: 16830,
    image: 'https://placehold.co/400x400/222222/00E5FF?text=PE+SMP+%236-300m',
    peNumber: 6,
    lengthM: 300,
    strengthLb: 90,
    pairedLeaderSpec: 'Ocean Record 130lb (Included)',
    specs: [
      { label: 'PE Line', value: '#6-300m' },
      { label: 'Max Test', value: '90lb (40.8kg)' },
      { label: 'Leader', value: '130lb Auto-Pair' },
      { label: 'Spool Match', value: '#14000 (100%)' },
    ],
  },
  {
    id: 'line-ygk-oddport-pe8',
    category: 'line',
    brand: 'YGK X-BRAID',
    name: 'ODDPORT WXP1 #8 (300m)',
    subCode: 'AUTO-BOUND: 170lb NYLON LEADER',
    price: 18920,
    image: 'https://placehold.co/400x400/222222/00E5FF?text=ODDPORT+%238-300m',
    peNumber: 8,
    lengthM: 300,
    strengthLb: 120,
    pairedLeaderSpec: 'Ocean Record 170lb (Included)',
    specs: [
      { label: 'PE Line', value: '#8-300m' },
      { label: 'Max Test', value: '120lb (54.4kg)' },
      { label: 'Leader', value: '170lb Auto-Pair' },
      { label: 'Spool Match', value: '#18000 (100%)' },
    ],
  },
  {
    id: 'line-varivas-six-pe10',
    category: 'line',
    brand: 'VARIVAS',
    name: 'Avani Casting PE Si-X #10 (300m)',
    subCode: 'AUTO-BOUND: 220lb NYLON LEADER',
    price: 20460,
    image: 'https://placehold.co/400x400/222222/00E5FF?text=PE+Si-X+%2310-300m',
    peNumber: 10,
    lengthM: 300,
    strengthLb: 140,
    pairedLeaderSpec: 'Ocean Record 220lb (Included)',
    specs: [
      { label: 'PE Line', value: '#10-300m' },
      { label: 'Max Test', value: '140lb (63.5kg)' },
      { label: 'Leader', value: '220lb Auto-Pair' },
      { label: 'Spool Match', value: '#20000 (100%)' },
    ],
  },
];

const LURE_CATALOG: LurePart[] = [
  {
    id: 'lure-cbone-ryan-200',
    category: 'lure',
    brand: 'CB ONE',
    name: 'RYAN 200 (With #3/0 Heavy Hook)',
    subCode: 'BODY 85g + HOOK/RING 11.5g',
    price: 13860,
    image: 'https://placehold.co/400x400/222222/00E5FF?text=CB+ONE+RYAN+200',
    bodyWeightG: 85,
    hookRingWeightG: 11.5,
    totalWeightG: 96.5,
    minPe: 5,
    lengthMm: 200,
    hookSpec: 'ST-66 #3/0 + #9 Ring',
    specs: [
      { label: 'Total Wt', value: '96.5g (Hook In)' },
      { label: 'Body Wt', value: '85.0g (200mm)' },
      { label: 'Hook Set', value: '#3/0 (+11.5g)' },
      { label: 'Min PE', value: '#5.0+' },
    ],
  },
  {
    id: 'lure-carpenter-gamma-90',
    category: 'lure',
    brand: 'CARPENTER',
    name: 'γ (Gamma) 90-Super L',
    subCode: 'BODY 75g + HOOK/RING 11.5g',
    price: 15400,
    image: 'https://placehold.co/400x400/222222/00E5FF?text=GAMMA+90-Super+L',
    bodyWeightG: 75,
    hookRingWeightG: 11.5,
    totalWeightG: 86.5,
    minPe: 5,
    lengthMm: 200,
    hookSpec: 'ST-66 #3/0 + #9 Ring',
    specs: [
      { label: 'Total Wt', value: '86.5g (Hook In)' },
      { label: 'Body Wt', value: '75.0g (200mm)' },
      { label: 'Hook Set', value: '#3/0 (+11.5g)' },
      { label: 'Min PE', value: '#5.0+' },
    ],
  },
  {
    id: 'lure-cbone-bazoo-200',
    category: 'lure',
    brand: 'CB ONE',
    name: 'BAZOO 200 (With #4/0 Heavy Hook)',
    subCode: 'BODY 96g + HOOK/RING 16.0g',
    price: 14960,
    image: 'https://placehold.co/400x400/222222/00E5FF?text=CB+ONE+BAZOO+200',
    bodyWeightG: 96,
    hookRingWeightG: 16.0,
    totalWeightG: 112.0,
    minPe: 6,
    lengthMm: 200,
    hookSpec: 'ST-66 #4/0 + #10 Ring',
    specs: [
      { label: 'Total Wt', value: '112.0g (Hook In)' },
      { label: 'Body Wt', value: '96.0g (200mm)' },
      { label: 'Hook Set', value: '#4/0 (+16.0g)' },
      { label: 'Min PE', value: '#6.0+' },
    ],
  },
  {
    id: 'lure-cbone-zorro-240',
    category: 'lure',
    brand: 'CB ONE',
    name: 'ZORRO 240 Monster Spec',
    subCode: 'BODY 120g + HOOK/RING 21.0g',
    price: 16720,
    image: 'https://placehold.co/400x400/222222/00E5FF?text=CB+ONE+ZORRO+240',
    bodyWeightG: 120,
    hookRingWeightG: 21.0,
    totalWeightG: 141.0,
    minPe: 8,
    lengthMm: 240,
    hookSpec: 'ST-66 #5/0 + #11 Ring',
    specs: [
      { label: 'Total Wt', value: '141.0g (Hook In)' },
      { label: 'Body Wt', value: '120.0g (240mm)' },
      { label: 'Hook Set', value: '#5/0 (+21.0g)' },
      { label: 'Min PE', value: '#8.0+' },
    ],
  },
];

// ============================================================================
// Physical Compatibility Engine
// ============================================================================

function checkPartCompatibility(
  part: AnyRigPart,
  rig: RigState
): { compatible: boolean; reason: string } {
  if (part.category === 'reel') {
    if (rig.rod && !rig.rod.compatibleReelSizes.includes(part.sizeClass)) {
      return {
        compatible: false,
        reason: `Rod requires #${rig.rod.compatibleReelSizes.join('/')} size reel`,
      };
    }
    if (rig.line && part.peCapacityNum !== rig.line.peNumber) {
      return {
        compatible: false,
        reason: `Spool capacity mismatch for PE #${rig.line.peNumber}-300m`,
      };
    }
    return {
      compatible: true,
      reason: '100% Spool & Reel Seat Verified',
    };
  }

  if (part.category === 'rod') {
    if (rig.reel && !part.compatibleReelSizes.includes(rig.reel.sizeClass)) {
      return {
        compatible: false,
        reason: `Incompatible with #${rig.reel.sizeClass} Reel Foot & Guide Line Angle`,
      };
    }
    if (rig.line && (rig.line.peNumber < part.minPe || rig.line.peNumber > part.maxPe)) {
      return {
        compatible: false,
        reason: `PE #${rig.line.peNumber} exceeds Rod rating (PE #${part.minPe}-${part.maxPe})`,
      };
    }
    if (
      rig.lure &&
      (rig.lure.totalWeightG < part.lureMinG || rig.lure.totalWeightG > part.lureMaxG)
    ) {
      return {
        compatible: false,
        reason: `Hooked Lure (${rig.lure.totalWeightG}g) exceeds Rod Max (${part.lureMaxG}g)`,
      };
    }
    return {
      compatible: true,
      reason: '100% Blank Load & Guide System Verified',
    };
  }

  if (part.category === 'line') {
    if (rig.reel && rig.reel.peCapacityNum !== part.peNumber) {
      return {
        compatible: false,
        reason: `Overflows/Underfills #${rig.reel.sizeClass} Spool (Designed for PE #${rig.reel.peCapacityNum}-300m)`,
      };
    }
    if (rig.rod && (part.peNumber < rig.rod.minPe || part.peNumber > rig.rod.maxPe)) {
      return {
        compatible: false,
        reason: `Outside Rod PE rating (#${rig.rod.minPe}-#${rig.rod.maxPe})`,
      };
    }
    if (rig.lure && part.peNumber < rig.lure.minPe) {
      return {
        compatible: false,
        reason: `Below minimum PE (#${rig.lure.minPe}) required for heavy plug`,
      };
    }
    return {
      compatible: true,
      reason: '100% Spool Fill Ratio (No Backing Required)',
    };
  }

  // Lure
  if (rig.rod && (part.totalWeightG < rig.rod.lureMinG || part.totalWeightG > rig.rod.lureMaxG)) {
    return {
      compatible: false,
      reason: `Total Hooked Wt ${part.totalWeightG}g exceeds Rod limit (${rig.rod.lureMinG}-${rig.rod.lureMaxG}g)`,
    };
  }
  if (rig.line && rig.line.peNumber < part.minPe) {
    return {
      compatible: false,
      reason: `Requires PE #${part.minPe}+ line to prevent cast-off`,
    };
  }
  return {
    compatible: true,
    reason: `Sweet Spot Verified (Total ${part.totalWeightG}g w/ Hook)`,
  };
}

// ============================================================================
// Main Component: TackleBuilder (Tesla × Razer/ROG × Apple/Veilance)
// ============================================================================

interface TackleBuilderProps {
  onOpenAdvancedConsole?: () => void;
}

export const TackleBuilder: React.FC<TackleBuilderProps> = ({ onOpenAdvancedConsole }) => {
  // Default initial rig: 100% compatible Hiramasa / Tuna PE6 setup
  const [rig, setRig] = useState<RigState>({
    reel: REEL_CATALOG[0],
    rod: ROD_CATALOG[0],
    line: LINE_CATALOG[0],
    lure: LURE_CATALOG[0],
  });

  const [cartAdded, setCartAdded] = useState<boolean>(false);
  const [mobileRigExpanded, setMobileRigExpanded] = useState<boolean>(false);

  const reelSectionRef = useRef<HTMLElement>(null);
  const rodSectionRef = useRef<HTMLElement>(null);
  const lineSectionRef = useRef<HTMLElement>(null);
  const lureSectionRef = useRef<HTMLElement>(null);

  // Real-time Total Value calculation
  const totalValue = useMemo(() => {
    return (
      (rig.reel?.price ?? 0) +
      (rig.rod?.price ?? 0) +
      (rig.line?.price ?? 0) +
      (rig.lure?.price ?? 0)
    );
  }, [rig]);

  // Real-time Total Rig Weight
  const totalWeightG = useMemo(() => {
    return (
      (rig.reel?.weightG ?? 0) +
      (rig.rod?.weightG ?? 0) +
      Math.round(rig.lure?.totalWeightG ?? 0)
    );
  }, [rig]);

  // Overall Compatibility Check
  const isAllSelectedCompatible = useMemo(() => {
    const items = [rig.reel, rig.rod, rig.line, rig.lure].filter(
      (i): i is AnyRigPart => i !== null
    );
    return items.every((item) => checkPartCompatibility(item, rig).compatible);
  }, [rig]);

  const selectedCount = [rig.reel, rig.rod, rig.line, rig.lure].filter(Boolean).length;

  const handleSelectPart = (part: AnyRigPart) => {
    setCartAdded(false);
    setRig((prev) => {
      const isSame = prev[part.category]?.id === part.id;
      return {
        ...prev,
        [part.category]: isSame ? null : part,
      };
    });
  };

  const handleResetRig = () => {
    setCartAdded(false);
    setRig({
      reel: null,
      rod: null,
      line: null,
      lure: null,
    });
  };

  const handleApplyPreset = (presetType: 'pe6' | 'pe8' | 'pe10') => {
    setCartAdded(false);
    if (presetType === 'pe6') {
      setRig({
        reel: REEL_CATALOG[0],
        rod: ROD_CATALOG[0],
        line: LINE_CATALOG[0],
        lure: LURE_CATALOG[0],
      });
    } else if (presetType === 'pe8') {
      setRig({
        reel: REEL_CATALOG[2],
        rod: ROD_CATALOG[2],
        line: LINE_CATALOG[1],
        lure: LURE_CATALOG[2],
      });
    } else {
      setRig({
        reel: REEL_CATALOG[3],
        rod: ROD_CATALOG[3],
        line: LINE_CATALOG[2],
        lure: LURE_CATALOG[3],
      });
    }
  };

  const scrollToSection = (cat: PartCategory) => {
    const map = {
      reel: reelSectionRef,
      rod: rodSectionRef,
      line: lineSectionRef,
      lure: lureSectionRef,
    };
    map[cat].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderPartCard = (part: AnyRigPart) => {
    const isSelected = rig[part.category]?.id === part.id;
    const { compatible, reason } = checkPartCompatibility(part, rig);

    return (
      <article
        key={part.id}
        role="button"
        tabIndex={0}
        onClick={() => handleSelectPart(part)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelectPart(part);
          }
        }}
        className={`group relative rounded-2xl bg-[#222222] p-6 cursor-pointer select-none transition-all duration-300 ease-out hover:scale-105 flex flex-col justify-between ${
          isSelected
            ? 'border border-[#00E5FF] shadow-[0_0_22px_rgba(0,229,255,0.5)] opacity-100'
            : compatible
            ? 'border border-[#00E5FF]/50 shadow-[0_0_15px_rgba(0,229,255,0.4)] hover:border-[#00E5FF] hover:shadow-[0_0_24px_rgba(0,229,255,0.55)] opacity-100'
            : 'border border-white/5 opacity-30 hover:opacity-55 shadow-none'
        }`}
      >
        {/* Top Minimal Header */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className="text-[11px] font-light tracking-[0.22em] uppercase text-[#A0A0A0]">
              {part.brand}
            </span>
            {isSelected ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00E5FF] text-[#151515] text-[10px] font-semibold tracking-[0.15em] uppercase shadow-[0_0_12px_rgba(0,229,255,0.6)]">
                <Check className="w-3 h-3 stroke-[2.5]" />
                SELECTED
              </span>
            ) : compatible ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[#00E5FF]/60 bg-[#00E5FF]/10 text-[#00E5FF] text-[10px] font-normal tracking-[0.15em] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
                COMPATIBLE
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-white/15 text-[#A0A0A0] text-[10px] font-light tracking-[0.15em] uppercase">
                INCOMPATIBLE
              </span>
            )}
          </div>

          {/* Product Image Stage */}
          <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-[#151515] border border-white/5 mb-5">
            <img
              src={part.image}
              alt={`${part.brand} ${part.name}`}
              loading="lazy"
              className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#151515]/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
              <span className="text-[10px] font-light tracking-[0.18em] text-[#A0A0A0] uppercase">
                {part.subCode}
              </span>
            </div>
          </div>

          {/* Model Name & Price */}
          <div className="flex items-baseline justify-between gap-3 mb-5">
            <h3 className="text-lg font-normal tracking-tight text-[#FFFFFF] leading-snug">
              {part.name}
            </h3>
            <span className="text-lg font-light tracking-wider text-[#FFFFFF] tabular-nums shrink-0">
              ¥{part.price.toLocaleString()}
            </span>
          </div>

          {/* Apple / Veilance Style Ultra-Clean Spec List */}
          <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 pt-4 border-t border-white/10">
            {part.specs.map((spec) => (
              <div key={spec.label} className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] font-light tracking-wider text-[#A0A0A0]">
                  {spec.label}:
                </span>
                <span className="text-xs font-light tracking-wide text-[#FFFFFF] tabular-nums">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Minimal Telemetry Reason Footer */}
        <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-between gap-2">
          <span
            className={`text-[11px] font-light tracking-wide truncate ${
              compatible ? 'text-[#00E5FF]' : 'text-[#A0A0A0]'
            }`}
          >
            {reason}
          </span>
          <span
            className={`text-[11px] font-normal tracking-[0.14em] uppercase shrink-0 ${
              isSelected
                ? 'text-[#00E5FF]'
                : compatible
                ? 'text-[#FFFFFF] group-hover:text-[#00E5FF]'
                : 'text-[#A0A0A0]'
            }`}
          >
            {isSelected ? 'REMOVE' : 'CONFIGURE →'}
          </span>
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-screen bg-[#151515] text-[#FFFFFF] font-sans antialiased selection:bg-[#00E5FF] selection:text-[#151515] pb-28 lg:pb-16">
      {/* ==================== MINIMAL TOP NAVIGATION BAR ==================== */}
      <header className="sticky top-0 z-40 bg-[#151515]/85 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_12px_#00E5FF]" />
            <span className="text-lg font-medium tracking-[0.28em] uppercase text-[#FFFFFF]">
              RIGs
            </span>
            <span className="hidden sm:inline-block text-xs font-light tracking-[0.2em] text-[#A0A0A0] uppercase">
              // TACKLE CONFIGURATOR
            </span>
          </div>

          {/* Quick Spec Class Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center gap-1.5 mr-2">
              {(
                [
                  { id: 'pe6', label: 'PE #6 CLASS' },
                  { id: 'pe8', label: 'PE #8 TUNA' },
                  { id: 'pe10', label: 'PE #10 MONSTER' },
                ] as const
              ).map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset.id)}
                  className="px-3 py-1.5 rounded-full bg-[#222222] border border-white/10 text-[11px] font-light tracking-[0.15em] text-[#A0A0A0] hover:text-[#FFFFFF] hover:border-[#00E5FF] hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all duration-300 ease-out hover:scale-105"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {onOpenAdvancedConsole && (
              <button
                type="button"
                onClick={onOpenAdvancedConsole}
                className="px-3.5 py-1.5 rounded-full bg-[#222222] border border-[#00E5FF]/50 text-[11px] font-light tracking-[0.14em] text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all duration-300 ease-out hover:scale-105"
              >
                SPEC SHEET / AI JSON
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ==================== TESLA-STYLE SPLIT CONFIGURATOR ==================== */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 pt-8 lg:pt-12">
        <div className="flex flex-col lg:flex-row items-start gap-10 xl:gap-16">
          {/* =================================================================
              LEFT COLUMN (STICKY ON PC): "MY RIG" CURRENT SETTING & TOTAL VALUE
             ================================================================= */}
          <aside
            aria-label="MY RIG 現在のセッティング"
            className="w-full lg:w-[420px] xl:w-[460px] shrink-0 lg:sticky lg:top-24"
          >
            <div className="rounded-3xl bg-[#222222] border border-white/10 p-7 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.65)] flex flex-col justify-between">
              {/* MY RIG Header */}
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-light tracking-[0.25em] text-[#00E5FF] uppercase">
                        CURRENT CONFIGURATION
                      </span>
                    </div>
                    <h1 className="text-2xl font-light tracking-[0.14em] text-[#FFFFFF] uppercase mt-1">
                      MY RIG
                    </h1>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetRig}
                    className="px-3 py-1.5 rounded-full bg-[#151515] border border-white/10 text-[11px] font-light tracking-[0.14em] text-[#A0A0A0] hover:text-[#FFFFFF] hover:border-[#00E5FF] transition-all duration-300 ease-out hover:scale-105 flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3 h-3 text-[#00E5FF]" />
                    <span>RESET</span>
                  </button>
                </div>

                {/* Compatibility Telemetry Badge */}
                <div
                  className={`mt-6 p-4 rounded-2xl bg-[#151515] border flex items-center justify-between ${
                    isAllSelectedCompatible && selectedCount > 0
                      ? 'border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                      : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#00E5FF] shrink-0" />
                    <div>
                      <div className="text-xs font-normal tracking-[0.15em] uppercase text-[#FFFFFF]">
                        {selectedCount === 0
                          ? 'AWAITING SELECTION'
                          : isAllSelectedCompatible
                          ? '100% PHYSICAL MATCH'
                          : 'COMPATIBILITY WARNING'}
                      </div>
                      <div className="text-[11px] font-light tracking-wide text-[#A0A0A0] mt-0.5">
                        Rig Weight: {totalWeightG}g · Slots: {selectedCount}/4
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-light tracking-[0.18em] text-[#00E5FF] uppercase">
                    VERIFIED
                  </span>
                </div>

                {/* 4 Configured Slots List */}
                <div className="mt-6 space-y-3">
                  {(
                    [
                      {
                        key: 'reel',
                        step: '01',
                        label: 'REEL',
                        item: rig.reel,
                        specSummary: rig.reel
                          ? `Drag Max: ${rig.reel.dragMaxKg}kg · PE #${rig.reel.peCapacityNum}-${rig.reel.peCapacityMeter}m`
                          : 'Select Spinning Reel',
                      },
                      {
                        key: 'rod',
                        step: '02',
                        label: 'ROD',
                        item: rig.rod,
                        specSummary: rig.rod
                          ? `PE #${rig.rod.minPe}-${rig.rod.maxPe} · Lure ${rig.rod.lureMinG}-${rig.rod.lureMaxG}g`
                          : 'Select Casting Rod',
                      },
                      {
                        key: 'line',
                        step: '03',
                        label: 'LINE',
                        item: rig.line,
                        specSummary: rig.line
                          ? `PE #${rig.line.peNumber}-${rig.line.lengthM}m · ${rig.line.strengthLb}lb`
                          : 'Select PE Line & Leader',
                      },
                      {
                        key: 'lure',
                        step: '04',
                        label: 'PLUG',
                        item: rig.lure,
                        specSummary: rig.lure
                          ? `Total Wt: ${rig.lure.totalWeightG}g (Hook In)`
                          : 'Select Offshore Plug',
                      },
                    ] as const
                  ).map((slot) => (
                    <div
                      key={slot.key}
                      onClick={() => scrollToSection(slot.key)}
                      className={`group rounded-2xl p-4 bg-[#151515] border cursor-pointer transition-all duration-300 ease-out hover:scale-105 ${
                        slot.item
                          ? 'border-[#00E5FF]/50 shadow-[0_0_15px_rgba(0,229,255,0.22)]'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {slot.item ? (
                            <img
                              src={slot.item.image}
                              alt={slot.item.name}
                              className="w-11 h-11 rounded-lg object-cover bg-[#222222] border border-[#00E5FF]/40 shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-lg bg-[#222222] border border-white/10 flex items-center justify-center text-xs font-light text-[#A0A0A0] shrink-0">
                              {slot.step}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-light tracking-[0.2em] text-[#00E5FF] uppercase">
                                {slot.step} {slot.label}
                              </span>
                              {slot.item && (
                                <span className="text-[10px] font-light tracking-wider text-[#A0A0A0]">
                                  // {slot.item.brand}
                                </span>
                              )}
                            </div>
                            <div className="text-sm font-normal text-[#FFFFFF] truncate mt-0.5">
                              {slot.item ? slot.item.name : 'Not Configured'}
                            </div>
                            <div className="text-[11px] font-light text-[#A0A0A0] truncate mt-0.5">
                              {slot.specSummary}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {slot.item ? (
                            <span className="text-sm font-light tracking-wider text-[#FFFFFF] tabular-nums">
                              ¥{slot.item.price.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-[11px] font-light tracking-widest text-[#A0A0A0]">
                              SELECT
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Value & Primary CTA */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-baseline justify-between mb-6">
                  <div>
                    <span className="text-[11px] font-light tracking-[0.24em] text-[#A0A0A0] uppercase block">
                      TOTAL VALUE
                    </span>
                    <span className="text-[11px] font-light text-[#A0A0A0]">
                      Tax & Auto-Leader / Heavy Hooks Included
                    </span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-light tracking-tight text-[#FFFFFF] tabular-nums">
                    ¥{totalValue.toLocaleString()}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={selectedCount === 0}
                  onClick={() => setCartAdded(true)}
                  className="w-full py-4 px-6 rounded-2xl bg-[#00E5FF] text-[#151515] text-xs font-semibold tracking-[0.22em] uppercase shadow-[0_0_20px_rgba(0,229,255,0.5)] hover:shadow-[0_0_30px_rgba(0,229,255,0.75)] transition-all duration-300 ease-out hover:scale-105 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2.5"
                >
                  {cartAdded ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>ADDED TO RIG CART — READY</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>ADD TO CART</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </aside>

          {/* =================================================================
              RIGHT COLUMN (SCROLLABLE): PART SELECTOR SECTIONS
             ================================================================= */}
          <main className="flex-1 min-w-0 space-y-16 lg:space-y-20">
            {/* Minimalist Intro Banner */}
            <div className="border-b border-white/10 pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-light tracking-[0.28em] text-[#00E5FF] uppercase">
                  PRECISION COMPATIBILITY ENGINE
                </p>
                <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight text-[#FFFFFF] mt-2">
                  Build Your Offshore Rig.
                </h2>
              </div>
              <p className="text-xs font-light text-[#A0A0A0] max-w-md leading-relaxed">
                Select any component below. Compatible parts illuminate with{' '}
                <span className="text-[#00E5FF]">#00E5FF Electric Glow</span>; physically
                incompatible parts automatically dim to prevent spool overflow or blank overload.
              </p>
            </div>

            {/* -------------------- 01. SPINNING REEL -------------------- */}
            <section ref={reelSectionRef} className="scroll-mt-24 space-y-6">
              <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[11px] font-light tracking-[0.25em] text-[#00E5FF] uppercase">
                    STEP 01 // CORE POWERTRAIN
                  </span>
                  <h3 className="text-2xl font-light tracking-wide text-[#FFFFFF] mt-1">
                    Spinning Reel
                  </h3>
                </div>
                <span className="text-xs font-light tracking-widest text-[#A0A0A0]">
                  #14000 – #20000 CLASS
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                {REEL_CATALOG.map((reel) => renderPartCard(reel))}
              </div>
            </section>

            {/* -------------------- 02. CASTING ROD -------------------- */}
            <section ref={rodSectionRef} className="scroll-mt-24 space-y-6">
              <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[11px] font-light tracking-[0.25em] text-[#00E5FF] uppercase">
                    STEP 02 // BLANK & GUIDE ARCHITECTURE
                  </span>
                  <h3 className="text-2xl font-light tracking-wide text-[#FFFFFF] mt-1">
                    Offshore Casting Rod
                  </h3>
                </div>
                <span className="text-xs font-light tracking-widest text-[#A0A0A0]">
                  MATCHED BY REEL FOOT & LURE LOAD
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                {ROD_CATALOG.map((rod) => renderPartCard(rod))}
              </div>
            </section>

            {/* -------------------- 03. PE LINE & SHOCK LEADER -------------------- */}
            <section ref={lineSectionRef} className="scroll-mt-24 space-y-6">
              <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[11px] font-light tracking-[0.25em] text-[#00E5FF] uppercase">
                    STEP 03 // SPOOL CAPACITY MATCH
                  </span>
                  <h3 className="text-2xl font-light tracking-wide text-[#FFFFFF] mt-1">
                    PE Mainline & Auto-Paired Leader
                  </h3>
                </div>
                <span className="text-xs font-light tracking-widest text-[#A0A0A0]">
                  100% SPOOL FILL · ZERO BACKING
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                {LINE_CATALOG.map((line) => renderPartCard(line))}
              </div>
            </section>

            {/* -------------------- 04. OFFSHORE PLUG & HEAVY HOOK -------------------- */}
            <section ref={lureSectionRef} className="scroll-mt-24 space-y-6">
              <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[11px] font-light tracking-[0.25em] text-[#00E5FF] uppercase">
                    STEP 04 // TERMINAL PAYLOAD (HOOK WEIGHT INCLUDED)
                  </span>
                  <h3 className="text-2xl font-light tracking-wide text-[#FFFFFF] mt-1">
                    Offshore Plug & Heavy Wire Hook
                  </h3>
                </div>
                <span className="text-xs font-light tracking-widest text-[#A0A0A0]">
                  BODY + SPLIT RING + TREBLE/SINGLE WT
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                {LURE_CATALOG.map((lure) => renderPartCard(lure))}
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* ==================== MOBILE (375px+) FIXED BOTTOM BAR ==================== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#151515]/95 backdrop-blur-xl border-t border-white/15">
        {/* Expandable Mobile Rig Drawer */}
        {mobileRigExpanded && (
          <div className="px-5 pt-4 pb-3 border-b border-white/10 bg-[#222222] space-y-2.5 max-h-[55vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-light tracking-[0.22em] text-[#00E5FF] uppercase">
                MY RIG SUMMARY ({selectedCount}/4)
              </span>
              <button
                type="button"
                onClick={() => setMobileRigExpanded(false)}
                className="p-1 text-[#A0A0A0] hover:text-[#FFFFFF]"
                aria-label="Close summary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {(
              [
                { label: '01 REEL', item: rig.reel },
                { label: '02 ROD', item: rig.rod },
                { label: '03 LINE', item: rig.line },
                { label: '04 PLUG', item: rig.lure },
              ] as const
            ).map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-none"
              >
                <span className="text-[#A0A0A0] font-light tracking-wider">{s.label}</span>
                <span className="text-[#FFFFFF] font-light truncate max-w-[200px]">
                  {s.item ? s.item.name : 'Not Selected'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Fixed Bottom Bar Content */}
        <div className="px-5 py-3.5 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setMobileRigExpanded((prev) => !prev)}
            className="text-left min-w-0 flex-1"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
              <span className="text-[10px] font-light tracking-[0.2em] text-[#A0A0A0] uppercase">
                MY RIG ({selectedCount}/4)
              </span>
              <ChevronUp
                className={`w-3.5 h-3.5 text-[#00E5FF] transition-transform duration-300 ${
                  mobileRigExpanded ? 'rotate-180' : ''
                }`}
              />
            </div>
            <div className="text-xl font-light tracking-tight text-[#FFFFFF] tabular-nums mt-0.5">
              ¥{totalValue.toLocaleString()}
            </div>
          </button>

          <button
            type="button"
            disabled={selectedCount === 0}
            onClick={() => setCartAdded(true)}
            className="px-6 py-3.5 rounded-xl bg-[#00E5FF] text-[#151515] text-xs font-semibold tracking-[0.18em] uppercase shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all duration-300 ease-out hover:scale-105 disabled:opacity-30 shrink-0"
          >
            {cartAdded ? 'ADDED ✓' : 'ADD TO CART'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TackleBuilder;
