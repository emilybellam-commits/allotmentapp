import React from 'react'
import type { Plant } from '../types'
import { cropState, type CropState } from '../util/weeks'

const INK = '#3a4232'

function foFor(st: CropState): number {
  return { empty: 0, sown: 0.34, full: 0.5, bloom: 0.62, harvest: 0.5 }[st]
}

function vegSym(kind: string, col?: string): React.ReactNode[] {
  switch (kind) {
    case 'carrot':
      return [
        <polygon key="c" points="50,74 41,40 59,40" fill="#e8923f" stroke={INK} strokeWidth={1.5} />,
        <path key="t" d="M44 40 L40 26 M50 40 L50 24 M56 40 L60 27" stroke="#5f8a3a" strokeWidth={3} strokeLinecap="round" fill="none" />,
      ]
    case 'leek':
      return [
        <rect key="b" x={42} y={40} width={16} height={34} rx={7} fill="#eef0e2" stroke={INK} strokeWidth={1.5} />,
        <path key="t" d="M44 40 L40 22 M50 40 L50 20 M56 40 L60 23" stroke="#5f9a6f" strokeWidth={3} strokeLinecap="round" fill="none" />,
      ]
    case 'kale':
      return [
        <circle key="1" cx={38} cy={52} r={13} fill="#3f6f33" stroke={INK} strokeWidth={1.2} />,
        <circle key="2" cx={62} cy={52} r={13} fill="#4b7d3a" stroke={INK} strokeWidth={1.2} />,
        <circle key="3" cx={50} cy={42} r={15} fill="#56853f" stroke={INK} strokeWidth={1.2} />,
      ]
    case 'chard':
      return [
        <path key="s" d="M44 72 L44 46 M50 72 L50 44 M56 72 L56 46" stroke="#cf5a72" strokeWidth={3.5} strokeLinecap="round" fill="none" />,
        <circle key="a" cx={44} cy={40} r={9} fill="#4b7d3a" stroke={INK} strokeWidth={1} />,
        <circle key="b" cx={56} cy={40} r={9} fill="#4b7d3a" stroke={INK} strokeWidth={1} />,
        <circle key="c" cx={50} cy={34} r={9} fill="#56853f" stroke={INK} strokeWidth={1} />,
      ]
    case 'courgette':
      return [
        <ellipse key="f" cx={52} cy={58} rx={24} ry={11} fill="#5f8a3a" stroke={INK} strokeWidth={1.5} transform="rotate(-18 52 58)" />,
        <circle key="fl" cx={32} cy={44} r={6} fill="#f0c23c" stroke={INK} strokeWidth={1} />,
      ]
    case 'beetroot':
      return [
        <circle key="r" cx={50} cy={58} r={16} fill="#9a3a55" stroke={INK} strokeWidth={1.5} />,
        <path key="t" d="M44 44 L40 26 M50 42 L50 24 M56 44 L60 27" stroke="#4b7d3a" strokeWidth={3} strokeLinecap="round" fill="none" />,
      ]
    case 'pea':
      return [
        <ellipse key="p" cx={50} cy={54} rx={22} ry={12} fill="#b6d98a" stroke={INK} strokeWidth={1.5} />,
        <circle key="1" cx={40} cy={54} r={5} fill="#7faf52" />,
        <circle key="2" cx={50} cy={54} r={5} fill="#7faf52" />,
        <circle key="3" cx={60} cy={54} r={5} fill="#7faf52" />,
      ]
    case 'squash':
      return [
        <ellipse key="b" cx={50} cy={56} rx={21} ry={16} fill="#d9832e" stroke={INK} strokeWidth={1.5} />,
        <path key="seg" d="M42 41.5 C38 50 38 62 42 70.5 M58 41.5 C62 50 62 62 58 70.5 M50 40 L50 72" stroke={INK} strokeWidth={1} fill="none" opacity={0.55} />,
        <path key="st" d="M50 40 C50 34 46 32 43 30" stroke="#5f8a3a" strokeWidth={3.5} strokeLinecap="round" fill="none" />,
      ]
    case 'radish':
      return [
        <circle key="r" cx={50} cy={54} r={13} fill="#c43a5a" stroke={INK} strokeWidth={1.5} />,
        <path key="tip" d="M50 67 L50 75" stroke="#efe9dc" strokeWidth={3} strokeLinecap="round" fill="none" />,
        <path key="t" d="M45 42 L42 30 M50 41 L50 28 M55 42 L58 30" stroke="#5f8a3a" strokeWidth={3} strokeLinecap="round" fill="none" />,
      ]
    case 'garlic':
      return [
        <path key="b" d="M50 38 C41 45 35 52 36 61 C37 71 47 74 50 74 C53 74 63 71 64 61 C65 52 59 45 50 38 Z" fill="#ece4dc" stroke={INK} strokeWidth={1.5} />,
        <path key="cl" d="M44 50 C42 58 43 66 45 72 M56 50 C58 58 57 66 55 72 M50 44 L50 73" stroke={INK} strokeWidth={1} fill="none" opacity={0.5} />,
        <path key="n" d="M48 38 C48 32 49 28 50 25 M52 38 C52 32 51 28 50 25" stroke="#9db08a" strokeWidth={2.2} strokeLinecap="round" fill="none" />,
      ]
    case 'potato':
      return [
        <ellipse key="1" cx={41} cy={50} rx={13} ry={10} fill={col ?? '#c9a86a'} stroke={INK} strokeWidth={1.4} transform="rotate(-14 41 50)" />,
        <ellipse key="2" cx={59} cy={56} rx={14} ry={10.5} fill={col ?? '#c9a86a'} stroke={INK} strokeWidth={1.4} transform="rotate(10 59 56)" />,
        <ellipse key="3" cx={46} cy={66} rx={12} ry={9} fill={col ?? '#c9a86a'} stroke={INK} strokeWidth={1.4} transform="rotate(-6 46 66)" />,
        <circle key="e1" cx={39} cy={48} r={1.4} fill={INK} opacity={0.55} />,
        <circle key="e2" cx={61} cy={54} r={1.4} fill={INK} opacity={0.55} />,
        <circle key="e3" cx={47} cy={66} r={1.4} fill={INK} opacity={0.55} />,
      ]
    case 'broccoli':
      return [
        <rect key="s" x={46} y={54} width={8} height={20} rx={3.5} fill="#9db06a" stroke={INK} strokeWidth={1.3} />,
        <circle key="1" cx={39} cy={49} r={10} fill="#4a7a4a" stroke={INK} strokeWidth={1.2} />,
        <circle key="2" cx={61} cy={49} r={10} fill="#4a7a4a" stroke={INK} strokeWidth={1.2} />,
        <circle key="3" cx={50} cy={40} r={12} fill="#568a52" stroke={INK} strokeWidth={1.2} />,
        <circle key="d1" cx={44} cy={44} r={1.6} fill={INK} opacity={0.4} />,
        <circle key="d2" cx={56} cy={45} r={1.6} fill={INK} opacity={0.4} />,
        <circle key="d3" cx={50} cy={37} r={1.6} fill={INK} opacity={0.4} />,
      ]
    case 'psb':
      return [
        <path key="s" d="M40 74 L43 52 M50 74 L50 48 M60 74 L57 52" stroke="#7a8a5a" strokeWidth={3.2} strokeLinecap="round" fill="none" />,
        <circle key="1" cx={42} cy={46} r={8} fill="#6a4a7a" stroke={INK} strokeWidth={1.2} />,
        <circle key="2" cx={50} cy={40} r={9} fill="#7a568a" stroke={INK} strokeWidth={1.2} />,
        <circle key="3" cx={58} cy={46} r={8} fill="#6a4a7a" stroke={INK} strokeWidth={1.2} />,
      ]
    case 'artichoke':
      return [
        <path key="s" d="M50 74 L50 62" stroke="#7a8a5a" strokeWidth={3.5} strokeLinecap="round" fill="none" />,
        <path key="o" d="M50 28 C62 34 67 44 64 54 C61 62 55 65 50 65 C45 65 39 62 36 54 C33 44 38 34 50 28 Z" fill="#8aa08a" stroke={INK} strokeWidth={1.5} />,
        <path key="sc1" d="M50 30 C56 38 58 48 54 62 M50 30 C44 38 42 48 46 62" stroke={INK} strokeWidth={1.1} fill="none" opacity={0.55} />,
        <path key="sc2" d="M39 42 C44 46 56 46 61 42 M37 52 C44 57 56 57 63 52" stroke={INK} strokeWidth={1.1} fill="none" opacity={0.55} />,
      ]
    case 'rhubarb':
      return [
        <path key="s" d="M42 74 L45 48 M51 75 L51 46 M60 74 L57 48" stroke="#b03a4a" strokeWidth={4.5} strokeLinecap="round" fill="none" />,
        <path key="l" d="M50 46 C34 46 28 36 32 28 C42 24 58 26 64 34 C66 42 60 47 50 46 Z" fill="#568a52" stroke={INK} strokeWidth={1.4} />,
        <path key="v" d="M36 32 C44 36 54 38 61 38" stroke={INK} strokeWidth={1} fill="none" opacity={0.45} />,
      ]
    case 'onion': // spring onion
      return [
        <ellipse key="b" cx={50} cy={64} rx={8} ry={10} fill="#eef0e2" stroke={INK} strokeWidth={1.5} />,
        <path key="r" d="M46 73 L45 77 M50 74 L50 78 M54 73 L55 77" stroke={INK} strokeWidth={1} strokeLinecap="round" fill="none" opacity={0.5} />,
        <path key="t" d="M46 56 L42 26 M50 55 L50 24 M54 56 L58 26" stroke="#5f9a6f" strokeWidth={3} strokeLinecap="round" fill="none" />,
      ]
    case 'leaf': // loose rosette of pointed leaves, tinted to the plant's colour
      return [
        <ellipse key="1" cx={42} cy={50} rx={7} ry={16} fill={col ?? '#568a52'} stroke={INK} strokeWidth={1.3} transform="rotate(-24 42 50)" />,
        <ellipse key="2" cx={58} cy={50} rx={7} ry={16} fill={col ?? '#568a52'} stroke={INK} strokeWidth={1.3} transform="rotate(24 58 50)" />,
        <ellipse key="3" cx={50} cy={44} rx={7.5} ry={18} fill={col ?? '#568a52'} stroke={INK} strokeWidth={1.3} />,
        <path key="v" d="M50 30 L50 60" stroke={INK} strokeWidth={1} opacity={0.4} />,
      ]
    case 'strawberry':
      return [
        <path key="b" d="M50 72 C40 66 34 58 36 49 C38 42 45 40 50 42 C55 40 62 42 64 49 C66 58 60 66 50 72 Z" fill="#c43a4a" stroke={INK} strokeWidth={1.5} />,
        <circle key="s1" cx={45} cy={52} r={1.3} fill="#f5e9c8" />,
        <circle key="s2" cx={55} cy={52} r={1.3} fill="#f5e9c8" />,
        <circle key="s3" cx={50} cy={60} r={1.3} fill="#f5e9c8" />,
        <circle key="s4" cx={44} cy={60} r={1.3} fill="#f5e9c8" />,
        <circle key="s5" cx={56} cy={60} r={1.3} fill="#f5e9c8" />,
        <path key="c" d="M42 42 L50 38 L58 42 M50 42 L50 32" stroke="#5f8a3a" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />,
      ]
    case 'berry': // raspberry / blackberry cluster, tinted to the plant's colour
      return [
        <circle key="1" cx={44} cy={48} r={7} fill={col ?? '#b0384a'} stroke={INK} strokeWidth={1.3} />,
        <circle key="2" cx={56} cy={48} r={7} fill={col ?? '#b0384a'} stroke={INK} strokeWidth={1.3} />,
        <circle key="3" cx={44} cy={60} r={7} fill={col ?? '#b0384a'} stroke={INK} strokeWidth={1.3} />,
        <circle key="4" cx={56} cy={60} r={7} fill={col ?? '#b0384a'} stroke={INK} strokeWidth={1.3} />,
        <circle key="5" cx={50} cy={54} r={7} fill={col ?? '#b0384a'} stroke={INK} strokeWidth={1.3} />,
        <path key="st" d="M50 42 C50 36 46 32 42 30 M50 42 L56 34" stroke="#5f8a3a" strokeWidth={2.4} strokeLinecap="round" fill="none" />,
      ]
    default: // bean
      return [
        <ellipse key="p" cx={50} cy={54} rx={11} ry={24} fill="#9ec46a" stroke={INK} strokeWidth={1.5} transform="rotate(20 50 54)" />,
        <circle key="1" cx={48} cy={46} r={4} fill="#5f8a3a" />,
        <circle key="2" cx={50} cy={56} r={4} fill="#5f8a3a" />,
      ]
  }
}

export interface PinBlobProps {
  plant: Plant
  px: number
  /** week for live state; omit + set inspector for the always-in-bloom form */
  week?: number
  inspector?: boolean
}

/** The hand-inked plant pin: circle wash + veg pictogram / flower edge decoration. */
export function PinBlob({ plant: p, px, week, inspector }: PinBlobProps) {
  const st: CropState = inspector ? (p.bloom ? 'bloom' : 'full') : cropState(p, week ?? 1)
  const ghost = st === 'empty'
  const flower = p.cat === 'Flower'
  // flowers render a leaf rosette whenever present but not in bloom (matches reference)
  const young = ghost ? false : flower ? st !== 'bloom' : st === 'sown'
  const fo = foFor(st)
  const r = 42, cx = 50, cy = 50
  const kids: React.ReactNode[] = []

  const svgProps = {
    width: px, height: px, viewBox: '0 0 100 100',
    style: { filter: 'url(#sk2)', overflow: 'visible' as const, display: 'block' as const },
  }

  if (ghost) {
    const gc = flower ? p.col : '#8a9a6a'
    return (
      <svg {...svgProps}>
        <circle cx={cx} cy={cy} r={r * 0.46} fill={gc} fillOpacity={0.12} />
        <circle cx={cx} cy={cy} r={r * 0.46} fill="none" stroke={INK} strokeWidth={1.3} strokeDasharray="3 4" opacity={0.55} />
      </svg>
    )
  }

  if (young) {
    if (flower) {
      const n = 8
      const leaves = []
      for (let i = 0; i < n; i++) {
        const a = (i / n) * 2 * Math.PI
        leaves.push(
          <circle key={'lf' + i} cx={cx + (r - 20) * Math.cos(a)} cy={cy + (r - 20) * Math.sin(a)} r={9} fill="#8fb45a" fillOpacity={0.55} stroke={INK} strokeWidth={1.1} />,
        )
      }
      return (
        <svg {...svgProps}>
          {leaves}
          <circle cx={cx} cy={cy} r={r - 22} fill="#9cc26b" fillOpacity={0.55} />
        </svg>
      )
    }
    return (
      <svg {...svgProps}>
        <path d="M50 72 L50 50" stroke="#5f8a3a" strokeWidth={2.4} strokeLinecap="round" fill="none" />
        <ellipse cx={43} cy={51} rx={8} ry={4.5} fill="#8fb45a" stroke={INK} strokeWidth={1} transform="rotate(-28 43 51)" />
        <ellipse cx={57} cy={51} rx={8} ry={4.5} fill="#8fb45a" stroke={INK} strokeWidth={1} transform="rotate(28 57 51)" />
        <circle cx={44} cy={73} r={1.6} fill="#7a5a3c" />
        <circle cx={56} cy={73} r={1.6} fill="#7a5a3c" />
      </svg>
    )
  }

  kids.push(<circle key="wash" cx={cx} cy={cy} r={r} fill={p.col} fillOpacity={fo} />)
  kids.push(<circle key="hl" cx={44} cy={42} r={r * 0.6} fill="#ffffff" fillOpacity={0.18} />)

  if (p.cat === 'Vegetable' || (p.veg && !flower)) {
    kids.push(<circle key="o" cx={cx} cy={cy} r={r} fill="none" stroke={INK} strokeWidth={1.6} />)
    kids.push(<g key="veg">{vegSym(p.veg ?? 'bean', p.col)}</g>)
  } else if (p.sketch === 'spiky') {
    kids.push(<circle key="o" cx={cx} cy={cy} r={r} fill="none" stroke={INK} strokeWidth={1.4} />)
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * 2 * Math.PI
      kids.push(
        <line key={'s' + i} x1={cx + r * Math.cos(a)} y1={cy + r * Math.sin(a)} x2={cx + (r + 7) * Math.cos(a)} y2={cy + (r + 7) * Math.sin(a)} stroke={INK} strokeWidth={1} opacity={0.9} />,
      )
    }
  } else if (p.sketch === 'cross') {
    kids.push(<circle key="o" cx={cx} cy={cy} r={r} fill="none" stroke={INK} strokeWidth={1.4} />)
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * 2 * Math.PI
      const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a)
      kids.push(<line key={'a' + i} x1={x - 3} y1={y - 3} x2={x + 3} y2={y + 3} stroke={INK} strokeWidth={1} opacity={0.85} />)
      kids.push(<line key={'b' + i} x1={x - 3} y1={y + 3} x2={x + 3} y2={y - 3} stroke={INK} strokeWidth={1} opacity={0.85} />)
    }
  } else if (p.sketch === 'dotted') {
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * 2 * Math.PI
      kids.push(<circle key={'d' + i} cx={cx + r * Math.cos(a)} cy={cy + r * Math.sin(a)} r={1.7} fill={INK} opacity={0.9} />)
    }
  } else if (p.sketch === 'cloud') {
    for (let i = 0; i < 11; i++) {
      const a = (i / 11) * 2 * Math.PI
      kids.push(<circle key={'c' + i} cx={cx + (r - 6) * Math.cos(a)} cy={cy + (r - 6) * Math.sin(a)} r={8} fill={p.col} fillOpacity={fo} stroke={INK} strokeWidth={1.1} />)
    }
    kids.push(<circle key="cc" cx={cx} cy={cy} r={r - 7} fill={p.col} fillOpacity={fo} />)
  } else {
    kids.push(<circle key="o" cx={cx} cy={cy} r={r} fill="none" stroke={INK} strokeWidth={1.8} />)
  }

  return <svg {...svgProps}>{kids}</svg>
}
