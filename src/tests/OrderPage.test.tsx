// src/tests/OrderPage.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, beforeEach, expect } from 'vitest'
import "@testing-library/jest-dom/vitest"
import { validatePhone, validateEmail, validateName } from '../utils/validation'


const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router')>('react-router')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

// Importování komponenty
import OrderPage from '../pages/OrderPage/OrderPage'
import { MemoryRouter } from 'react-router'

beforeEach(() => {
    mockNavigate.mockClear()
    localStorage.clear()
})

describe('OrderPage - validace formuláře', () => {
    it('Validace telefonního čísla, emailu a jména', async () => {
        const user = userEvent.setup()
        render(
            <MemoryRouter>
                <OrderPage />
            </MemoryRouter>
        )

        const submitButton = screen.getByRole('button', { name: /odeslat objednávku/i })
        await user.click(submitButton)

        // Jméno a příjmení
        expect(validateName('Pavel Mančík')).toBe(true)
        expect(validateName('A')).toBe(false)
        expect(validateName('')).toBe(false)

        // telefonní číslo
        expect(validatePhone('+420 123 456 789')).toBe(true)
        expect(validatePhone('test@gmail.com')).toBe(false)
        expect(validatePhone('123456789')).toBe(true)
        expect(validatePhone('(555) 123-456')).toBe(true)

        // Email
        expect(validateEmail('test@example.com')).toBe(true)
        expect(validateEmail('not-an-email')).toBe(false)
        expect(validateEmail('')).toBe(false)
        expect(validateEmail('+420 123 456 789')).toBe(false)

        expect(await screen.findByText(/Zadejte jméno \(min\. 2 znaky\)/i)).toBeInTheDocument()
        expect(screen.getByText(/Zadejte platný email/i)).toBeInTheDocument()
        expect(screen.getByText(/Zadejte platné telefonní číslo/i)).toBeInTheDocument()
    })
})