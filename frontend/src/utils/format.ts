import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

export class Format {
  static date(date: string | Date, format = 'YYYY-MM-DD HH:mm:ss'): string {
    return dayjs(date).format(format)
  }

  static relativeTime(date: string | Date): string {
    return dayjs(date).fromNow()
  }

  static phone(phone: string): string {
    if (!phone || phone.length !== 11) {
      return phone
    }
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  }

  static idCard(idCard: string): string {
    if (!idCard || idCard.length < 15) {
      return idCard
    }
    return idCard.replace(/(\d{6})\d+(\d{4})/, '$1********$2')
  }

  static money(amount: number, decimals = 2): string {
    return `¥${amount.toFixed(decimals)}`
  }

  static number(num: number): string {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}万`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return String(num)
  }

  static fileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }

  static truncate(text: string, maxLength: number, suffix = '...'): string {
    if (text.length <= maxLength) {
      return text
    }
    return text.substring(0, maxLength - suffix.length) + suffix
  }
}
