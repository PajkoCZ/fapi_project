import React, { useState, useEffect } from "react"
import "./OrderPage.css"
import { useNavigate } from "react-router"
import ProductSelector, { PRODUCTS } from "../../components/ProductSelector"
import type { SelectedMap } from "../../components/ProductSelector"

const VAT_RATE = 0.21 // DPH 21%

type OrderForm = {
    name: string
    email: string
    phone: string
    street: string
    city: string
    zip: string
    products: SelectedMap
}

function buildSelectedList(selectedMap?: SelectedMap) {
    if (!selectedMap) return []
    return Object.entries(selectedMap)
        .filter(([, v]) => v.checked)
        .map(([id, v]) => {
            const p = PRODUCTS.find(x => x.id === id)
            const price = p?.price ?? 0
            const name = p?.name ?? id
            const qty = Number(v.qty ?? 1)
            return { id, name, price, qty }
        })
}

const OrderPage: React.FC = () => {
    const navigate = useNavigate()
    const [form, setForm] = useState<OrderForm>(() => {
        try {
            const raw = localStorage.getItem('fapi_order')
            return raw ? JSON.parse(raw) : { name: '', email: '', phone: '', street: '', city: '', zip: '', products: {} }
        } catch {
            return { name: '', email: '', phone: '', products: {} }
        }
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        localStorage.setItem('fapi_order', JSON.stringify(form))
    }, [form])

    const selectedList = buildSelectedList(form.products)
    const subtotal = selectedList.reduce((s, p) => s + p.price * (p.qty ?? 1), 0)
    const vat = subtotal * VAT_RATE
    const total = subtotal + vat

    function validate() {
        const errs: Record<string, string> = {}
        if (!form.name || form.name.trim().length < 2) errs.name = 'Zadejte jméno (min. 2 znaky)'
        if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Zadejte platný email'
        if (!form.phone || !/^\+?[0-9 \-(\)]{6,}$/.test(form.phone)) errs.phone = 'Zadejte platné telefonní číslo'
        if (!form.street || form.street.trim().length < 3) errs.street = 'Zadejte ulici a číslo popisné'
        if (!form.city || form.city.trim().length < 2) errs.city = 'Zadejte město'
        if (!form.zip || !/^\d{3}\s?\d{2}$/.test(form.zip)) errs.zip = 'Zadejte platné PSČ (např. 12345 nebo 123 45)'
        if (selectedList.length === 0) errs.products = 'Vyberte alespoň jeden produkt'
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!validate()) return

        const order = {
            id: 'ord_' + Date.now(),
            createdAt: new Date().toISOString(),
            customer: { name: form.name, email: form.email, phone: form.phone, street: form.street, city: form.city, zip: form.zip },
            items: selectedList,
            subtotal, vat, total
        }
        const orders = JSON.parse(localStorage.getItem('fapi_orders') || '[]')
        orders.push(order)
        localStorage.setItem('fapi_orders', JSON.stringify(orders))

        navigate('/thankyou', { state: { orderId: order.id } })
    }

    return (
        <div className="order-page">
            <form className="order-form" onSubmit={handleSubmit} noValidate>
                <h2>Objednávka</h2>

                <div className="field field-custom-width">
                    <label htmlFor="name">Jméno a příjmení</label>
                    <input
                        id="name"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        required
                    />
                    {errors.name && <small className="error">{errors.name}</small>}
                </div>

                <div className="field field-custom-width">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        required
                    />
                    {errors.email && <small className="error">{errors.email}</small>}
                </div>

                <div className="field field-custom-width">
                    <label htmlFor="phone">Telefon</label>
                    <input
                        id="phone"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        required
                    />
                    {errors.phone && <small className="error">{errors.phone}</small>}
                </div>

                <div className="field field-custom-width">
                    <label htmlFor="street">Ulice a č.p.</label>
                    <input
                        id="street"
                        value={form.street}
                        onChange={e => setForm({ ...form, street: e.target.value })}
                        required
                    />
                    {errors.street && <small className="error">{errors.street}</small>}
                </div>

                <div className="field field-custom-width">
                    <label htmlFor="city">Město</label>
                    <input
                        id="city"
                        value={form.city}
                        onChange={e => setForm({ ...form, city: e.target.value })}
                        required
                    />
                    {errors.city && <small className="error">{errors.city}</small>}
                </div>

                <div className="field field-custom-width">
                    <label htmlFor="zip">PSČ</label>
                    <input
                        id="zip"
                        value={form.zip}
                        onChange={e => setForm({ ...form, zip: e.target.value })}
                        required
                    />
                    {errors.zip && <small className="error">{errors.zip}</small>}
                </div>

                <ProductSelector value={form.products} onChange={v => setForm({ ...form, products: v })} />
                {errors.products && <small className="error">{errors.products}</small>}

                <div className="summary">
                    <p>Mezisoučet: {subtotal.toFixed(2)} CZK</p>
                    <p>DPH ({(VAT_RATE * 100).toFixed(0)}%): {vat.toFixed(2)} CZK</p>
                    <p className="total-price">Celkem: {total.toFixed(2)} CZK</p>
                </div>

                <div className="actions-submit">
                    <button type="submit">Odeslat objednávku</button>
                </div>
            </form>
        </div>
    )
}

export default OrderPage
