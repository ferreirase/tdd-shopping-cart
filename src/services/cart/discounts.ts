import Dinero, { Dinero as DineroType } from 'dinero.js';
import { Item } from './cart';

export type DiscountCondition = {
  percentage?: number;
  minimum?: number;
  quantity?: number;
};

const Money = Dinero;

Money.defaultCurrency = 'BRL';
Money.defaultPrecision = 2;

export function CalculatePercentageDiscount(
  amount: DineroType,
  {
    condition,
    quantity,
  }: Omit<Item, 'condition'> & {
    condition?: DiscountCondition;
  },
): DineroType {
  if (
    condition?.percentage &&
    condition?.minimum &&
    quantity > condition?.minimum
  ) {
    return amount.percentage(condition.percentage);
  }

  return Money({ amount: 0 });
}

export function CalculateQuantityDiscount(
  amount: DineroType,
  {
    condition,
    quantity,
  }: Omit<Item, 'condition'> & {
    condition?: DiscountCondition;
  },
): DineroType {
  const isEven = quantity % 2 === 0;

  if (condition && condition.quantity && quantity > condition.quantity) {
    return amount.percentage(isEven ? 50 : 40);
  }

  return Money({ amount: 0 });
}

export function CalculateHigherDiscount(
  amount: DineroType,
  item: Omit<Item, 'condition'> & {
    condition: Array<DiscountCondition>;
  },
): DineroType {
  const { condition } = item;

  if (condition?.length === 0) {
    return Money({ amount: 0 });
  }

  const [discount] = condition
    .map((cond: DiscountCondition) => {
      return cond?.quantity
        ? CalculateQuantityDiscount(amount, {
            ...item,
            condition: cond,
          }).getAmount()
        : CalculatePercentageDiscount(amount, {
            ...item,
            condition: cond,
          }).getAmount();
    })
    .sort((a, b) => Number(b) - Number(a));

  return Money({ amount: discount as number });
}
