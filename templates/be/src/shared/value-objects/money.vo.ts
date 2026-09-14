export class MoneyVO {
  private constructor(private readonly _cents: number) {
    if (!Number.isInteger(_cents)) {
      throw new Error(`MoneyVO: cents must be an integer, got ${_cents}`);
    }
  }

  static fromFloat(amount: number): MoneyVO {
    return new MoneyVO(Math.round(amount * 100));
  }

  static fromCents(cents: number): MoneyVO {
    return new MoneyVO(cents);
  }

  static zero(): MoneyVO {
    return new MoneyVO(0);
  }

  get cents(): number {
    return this._cents;
  }

  toFloat(): number {
    return this._cents / 100;
  }

  add(other: MoneyVO): MoneyVO {
    return new MoneyVO(this._cents + other._cents);
  }

  subtract(other: MoneyVO): MoneyVO {
    return new MoneyVO(this._cents - other._cents);
  }

  multiply(factor: number): MoneyVO {
    return new MoneyVO(Math.round(this._cents * factor));
  }

  equals(other: MoneyVO): boolean {
    return this._cents === other._cents;
  }

  isGreaterThan(other: MoneyVO): boolean {
    return this._cents > other._cents;
  }

  isZero(): boolean {
    return this._cents === 0;
  }

  isNegative(): boolean {
    return this._cents < 0;
  }

  format(currency: string = 'USD', locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(this.toFloat());
  }

  toString(): string {
    return `MoneyVO(${this._cents} cents)`;
  }
}
