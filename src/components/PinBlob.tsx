import React from 'react'
import type { Plant } from '../types'
import { cropState, type CropState } from '../util/weeks'

const INK = '#3a4232'

function foFor(st: CropState): number {
  return { empty: 0, sown: 0.34, full: 0.5, bloom: 0.62, harvest: 0.5 }[st]
}

function vegSym(kind: string): React.ReactNode[] {
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

  if (p.cat === 'Vegetable') {
    kids.push(<circle key="o" cx={cx} cy={cy} r={r} fill="none" stroke={INK} strokeWidth={1.6} />)
    kids.push(<g key="veg">{vegSym(p.veg ?? 'bean')}</g>)
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
