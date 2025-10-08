import React from 'react'
import type { ChangeEvent } from 'react'

export interface Product {
  id: string
  name: string
  price: number
}

export const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Tričko FAPI', price: 299.0 },
  { id: 'p2', name: 'Hrnek FAPI', price: 149.0 },
  { id: 'p3', name: 'Pivní podtácek (paleta)', price: 89.0 }
]

export type SelectedItem = {
  checked: boolean
  qty: number
}

export type SelectedMap = Record<string, SelectedItem>

type Props = {
  value?: SelectedMap
  onChange: (v: SelectedMap) => void
}

/**
 * ProductSelector
 * - value: mapa { [productId]: { checked, qty } }
 * - onChange: new map
 */
const ProductSelector: React.FC<Props> = ({ value = {}, onChange }) => {
  const setChecked = (id: string, checked: boolean) => {
    const current = value[id] ?? { checked: false, qty: 1 }
    const next: SelectedMap = { ...value, [id]: { ...current, checked } }
    onChange(next)
  }

  const setQty = (id: string, qty: number) => {
    const current = value[id] ?? { checked: false, qty: 1 }
    const safeQty = Math.max(1, Math.floor(Number(qty) || 1))
    const next: SelectedMap = { ...value, [id]: { ...current, qty: safeQty } }
    onChange(next)
  }

  const onCheckboxChange = (id: string) => (e: ChangeEvent<HTMLInputElement>) =>
    setChecked(id, e.target.checked)

  const onQtyChange = (id: string) => (e: ChangeEvent<HTMLInputElement>) =>
    setQty(id, Number(e.target.value))

  return (
    <fieldset className="field products">
      <legend>Produkty (vyberte jeden nebo více)</legend>

      {PRODUCTS.map((p) => {
        const state = value[p.id] ?? { checked: false, qty: 1 }
        return (
          <label key={p.id} className="product-row" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={state.checked}
              onChange={onCheckboxChange(p.id)}
            />
            <span className="product-name" style={{ flex: 1 }}>
              {p.name} — {p.price.toFixed(2)} CZK
            </span>

            <input
              aria-label={`Počet kusů ${p.name}`}
              type="number"
              min={1}
              value={state.qty}
              onChange={onQtyChange(p.id)}
              disabled={!state.checked}
              style={{ width: 80 }}
            />
          </label>
        )
      })}
    </fieldset>
  )
}

export default ProductSelector
