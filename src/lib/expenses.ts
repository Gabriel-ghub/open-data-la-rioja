import database from './shared/database'
import { config } from '@/config'
import { type ChartData } from '@/types'

interface ExpenseDTO {
  DESC_FUNCIONAL_3: string
  DESC_FUNCIONAL_2: string
  DESC_FUNCIONAL_4: string
  MODIFICACION: number
  DESC_FUNCIONAL_1: string
  DISPUESTO: number
  REINTEGRO: number
  DESC_ECONOMICO_1: string
  DESC_ECONOMICO_2: string
  ID_FUNCIONAL_1: string
  ID_FUNCIONAL_2: string
  ID_FUNCIONAL_3: string
  ORDENPAGO: number
  CREDITO_INICIAL: number
  OBLIGADO: number
  ID_ORGANICO_2: string
  ID_ORGANICO_1: string
  DEFINITIVO: number
  DESC_ORGANICO_2: string
  EJERCICIO: string
  DESC_ORGANICO_1: string
  ID_ECONOMICO_2: string
  ID_FUNCIONAL_4: string
  ID_ECONOMICO_1: string
  DESC_ECONOMICO_3: string
  ID_ECONOMICO_4: string
  ID_ECONOMICO_3: string
  DESC_ECONOMICO_4?: string
  AUTORIZADO: number
  PAGO: number
  PAGOS_NETOS: number
}

export interface Expense {
  description: string
  category: string
  amount: number
  title: string
  id: string
  year: number
}

function mapDtoToExpense(expense: ExpenseDTO): Expense {
  return {
    id: `${expense.ID_FUNCIONAL_1}-${expense.ID_FUNCIONAL_2}-${expense.ID_FUNCIONAL_3}-${expense.ID_FUNCIONAL_4}`,
    category: expense.DESC_ORGANICO_1,
    title: `${expense.DESC_ECONOMICO_1} - ${expense.DESC_ECONOMICO_2}`,
    description: `${expense.DESC_ECONOMICO_3} - ${expense.DESC_ECONOMICO_4}`,
    amount: expense.PAGOS_NETOS,
    year: parseInt(expense.EJERCICIO)
  }
}

export async function getExpenses(): Promise<ChartData> {
  const reponse = await database.get<ExpenseDTO>(config.expenses.fileName)
  const expenses = reponse.map(mapDtoToExpense)

  const years = Array.from(new Set(expenses.map(d => d.year)))

  const data = years.map(year => {
    const yearExpenses = expenses.filter(d => d.year === year)
    const amount = yearExpenses.reduce((acc, d) => acc + d.amount, 0)
    return {
      Gastos: amount,
      year
    }
  })

  return {
    index: 'year',
    categories: ['Gastos'],
    data
  }
}

export async function getExpensesByCategory(): Promise<ChartData> {
  const response = await database.get<ExpenseDTO>(config.expenses.fileName)
  const expenses = response.map(mapDtoToExpense)

  const years = Array.from(new Set(expenses.map(d => d.year)))
  const categories = Array.from(new Set(expenses.map(d => d.category)))

  const data = years.map(year => {
    const amounts = categories.map(category => {
      const categoryAmount = expenses.reduce((acc, d) => {
        if (d.year === year && d.category === category) {
          return acc + d.amount
        }
        return acc
      }, 0)
      return categoryAmount
    })

    return {
      year,
      ...Object.fromEntries(
        categories
          .map((c, i) => [c, amounts[i]])
          .filter(([, amount]) => amount !== 0)
      )
    }
  })

  return {
    index: 'year',
    categories,
    data
  }
}
