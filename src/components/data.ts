export type ResultRecord = Record<string, { sum: number; source: ReturnType<typeof stateInputInit> }>

const offset = (new Date().getFullYear() % 12) - 3
export const zodiacs = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
export const numbers = Array.from({ length: 49 }, (_, i) => String(i + 1))
export const numbersOptsInit = () => numbers.map((i) => ({ value: i, disabled: false }))
export const quickAmountInit = () => [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500, 1000]
export const pageTabOptsInit = () => [
  { id: 'zodiac', name: '生肖' },
  { id: 'number', name: '数字' },
  { id: 'mixed', name: '混合' },
]
export const zodiacAge = zodiacs.reduce(
  (acc, cur, index) => {
    const n = offset - index
    acc[cur] = [n - 12, n, n + 12, n + 24, n + 36, n + 48].filter((i) => i >= 1 && i <= 49)
    return acc
  },
  <Record<string, number[]>>{},
)
export const stateInputInit = () => ({ amount: <number | null>null, zodiacs: <string[]>[], numbers: <string[]>[] })

// 将下面 编码和解码过程封装成 编码和解码的函数
export function encodeData(data: unknown): string {
  return encodeURIComponent(JSON.stringify(data))
}
export function decodeData(encodedData: string) {
  return JSON.parse(decodeURIComponent(encodedData))
}
