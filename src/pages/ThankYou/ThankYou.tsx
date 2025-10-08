// src/pages/ThankYou/ThankYou.tsx
import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import './ThankYou.css'

const VAT_RATE = 0.21

type OrderItem = {
  id: string
  name: string
  price: number
  qty: number
}

type Order = {
  id: string
  createdAt: string
  customer: {
    name: string
    email: string
    phone?: string
    street?: string
    city?: string
    zip?: string
  }
  items: OrderItem[]
  subtotal: number
  vat: number
  total: number
}

//Statické hodnoty kurzu, kvůli CORS problému
const HARDCODED_RATES: Record<string, number> = {
  EUR: 24.50, // 1 EUR = 24.50 CZK 
  USD: 22.00, // 1 USD = 22.00 CZK
  GBP: 29.00, // 1 GBP = 29.00 CZK
  CHF: 25.50  // 1 CHF = 25.50 CZK
}

const ThankYou: React.FC = () => {
  const loc = useLocation()
  const navigate = useNavigate()
  const orderId = (loc.state as any)?.orderId as string | undefined

  const [order, setOrder] = useState<Order | null>(null)


  const [currency, setCurrency] = useState<'EUR' | 'USD' | 'GBP' | 'CHF'>('EUR')
  const [manualRate, setManualRate] = useState<string>('')
  const [useManualRate, setUseManualRate] = useState(false)

  useEffect(() => {
    const orders: Order[] = JSON.parse(localStorage.getItem('fapi_orders') || '[]')
    if (orderId) {
      setOrder(orders.find(o => o.id === orderId) ?? null)
    } else {
      setOrder(orders.length ? orders[orders.length - 1] : null)
    }
  }, [orderId])

 
  const numericRate = useMemo(() => {
    if (useManualRate) {
      const parsed = Number(manualRate.toString().replace(',', '.'))
      return parsed > 0 ? parsed : null
    }
    return HARDCODED_RATES[currency] ?? null
  }, [useManualRate, manualRate, currency])

  
  const converted = useMemo(() => {
    if (!order) return null
    if (!numericRate || numericRate <= 0) return null
    return (order.total / numericRate)
  }, [order, numericRate])

  if (!order) {
    return (
      <div>
        <h2>Objednávka nenalezena</h2>
        <p>
          Nemohu najít objednávku. Vraťte se na{' '}
          <button onClick={() => navigate('/')}>objednávku</button>.
        </p>
      </div>
    )
  }

  return (
    <div className="thankyou">
      <h2>Děkujeme za objednávku!</h2>

      <section className="order-recap">
        <h3>Rekapitulace</h3>
        <p>
          Číslo objednávky: <strong>{order.id}</strong>
        </p>
        <p>Vytvořeno: {new Date(order.createdAt).toLocaleString()}</p>

        <div className='section-customer'>
          <h4>Zákazník</h4>
          <p>{order.customer.name}</p>
          <p>
            {order.customer.street ?? ''}{order.customer.street ? ', ' : ''}
            {order.customer.city ?? ''} {order.customer.zip ?? ''}
          </p>
          <p>{order.customer.email}{order.customer.phone ? `, ${order.customer.phone}` : ''}</p>
        </div>

        <div className='section-items'>
          <h4>Položky</h4>
          <ul>
            {order.items.map((it) => (
              <li key={it.id}>
                {it.name} — {it.qty} × {it.price.toFixed(2)} Kč = {(it.qty * it.price).toFixed(2)} Kč
              </li>
            ))}
          </ul>
        </div>

        <p>Mezisoučet: {order.subtotal.toFixed(2)} CZK</p>
        <p>DPH ({(VAT_RATE * 100).toFixed(0)}%): {order.vat.toFixed(2)} CZK</p>
        <p>
          <strong>Celkem: {order.total.toFixed(2)} CZK</strong>
        </p>
      </section>

      <section className="conversion" style={{ marginTop: 12 }}>
        <h3>Přepočet do jiné měny (lokální způsob bez API kvůli CORS)</h3>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label>
            Vyberte měnu:{' '}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              disabled={useManualRate}
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
              <option value="CHF">CHF</option>
            </select>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={useManualRate}
              onChange={(e) => setUseManualRate(e.target.checked)}
            />
            Použít vlastní kurz (CZK za 1 jednotku měny)
          </label>

          {useManualRate ? (
            <label>
              Vlastní kurz (CZK = 1 jednotka):{' '}
              <input
                value={manualRate}
                onChange={(e) => setManualRate(e.target.value)}
                placeholder="např. 24.5"
                style={{ width: 100 }}
              />
            </label>
          ) : (
            <div>
              <small>Používá se statický kurz z aplikace:</small>
              <div>
                1 {currency} = {HARDCODED_RATES[currency].toFixed(2)} CZK
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: 12 }}>
          {!numericRate && <p className="error">Neplatný kurz — zadej kladné číslo.</p>}

          {numericRate && (
            <div>
              <p>Kurz: 1 {currency} = {numericRate.toFixed(4)} CZK</p>
              <p>Po přepočtu: {converted ? converted.toFixed(2) : '—'} {currency}</p>
            </div>
          )}
        </div>
      </section>

      <div className="actions" style={{ marginTop: 12 }}>
        <button onClick={() => navigate('/')}>Zpět na objednávku</button>
      </div>
    </div>
  )
}

export default ThankYou
