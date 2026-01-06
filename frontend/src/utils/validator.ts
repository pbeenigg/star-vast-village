export class Validator {
  static isPhone(phone: string): boolean {
    const phoneReg = /^1[3-9]\d{9}$/
    return phoneReg.test(phone)
  }

  static isIdCard(idCard: string): boolean {
    const idCardReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    return idCardReg.test(idCard)
  }

  static isEmail(email: string): boolean {
    const emailReg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
    return emailReg.test(email)
  }

  static isEmpty(value: any): boolean {
    if (value === null || value === undefined) {
      return true
    }
    if (typeof value === 'string') {
      return value.trim().length === 0
    }
    if (Array.isArray(value)) {
      return value.length === 0
    }
    if (typeof value === 'object') {
      return Object.keys(value).length === 0
    }
    return false
  }

  static isUrl(url: string): boolean {
    const urlReg = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
    return urlReg.test(url)
  }

  static isNumber(value: any): boolean {
    return !isNaN(parseFloat(value)) && isFinite(value)
  }

  static isInteger(value: any): boolean {
    return Number.isInteger(Number(value))
  }

  static isPositive(value: number): boolean {
    return value > 0
  }

  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max
  }

  static minLength(value: string, min: number): boolean {
    return value.length >= min
  }

  static maxLength(value: string, max: number): boolean {
    return value.length <= max
  }
}
