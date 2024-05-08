import Dinero, { Dinero as DineroType } from 'dinero.js';
import { remove } from 'lodash';

const Money = Dinero;

Money.defaultCurrency = 'BRL';
Money.defaultPrecision = 2;

export type Product = {
  title: string;
  price: number;
};

export type DiscountCondition = {
  percentage?: number;
  minimum?: number;
  quantity?: number;
};

export type Item = {
  product: Product;
  quantity: number;
  condition?: DiscountCondition | Array<DiscountCondition>;
};

export function CalculatePercentageDiscount(
  amount: DineroType,
  item: Omit<Item, 'condition'> & {
    condition?: DiscountCondition;
  },
): DineroType {
  if (
    item.condition?.percentage &&
    item.condition?.minimum &&
    item.quantity > item.condition?.minimum
  ) {
    return amount.percentage(item.condition.percentage);
  }

  return Money({ amount: 0 });
}

export function CalculateQuantityDiscount(
  amount: DineroType,
  item: Omit<Item, 'condition'> & {
    condition?: DiscountCondition;
  },
): DineroType {
  const isEven = item.quantity % 2 === 0;

  if (
    item.condition &&
    item.condition.quantity &&
    item.quantity > item.condition.quantity
  ) {
    return amount.percentage(isEven ? 50 : 40);
  }

  return Money({ amount: 0 });
}

export function CalculateHigherDiscount(
  amount: DineroType,
  item: Omit<Item, 'condition'> & {
    condition?: Array<DiscountCondition>;
  },
): DineroType {
  const { condition } = item;

  const [discount] = (condition ?? [])
    .map((cond: DiscountCondition) => {
      if (cond?.quantity) {
        return CalculateQuantityDiscount(amount, {
          ...item,
          condition: cond,
        }).getAmount();
      }

      if (cond?.percentage && cond?.minimum) {
        return CalculatePercentageDiscount(amount, {
          ...item,
          condition: cond,
        }).getAmount();
      }

      return Money({ amount: 0 });
    })
    .sort((a, b) => Number(b) - Number(a));

  return Money({ amount: discount as number });
}

export class Cart {
  private items: Array<Item> = [];

  addItem(item: Item): void {
    const productAlreadyExists: Product | undefined = this.items.find(
      (currentItem: Item) => currentItem.product.title === item.product.title,
    )?.product;

    if (productAlreadyExists) {
      this.removeProduct(productAlreadyExists);
    }

    this.items.push(item);
  }

  removeProduct(product: Product): void {
    remove(this.items, { product });
  }

  getTotal(): number {
    return this.items
      .reduce((acc: DineroType, item: Item) => {
        const amount: DineroType = Money({
          amount: item.quantity * item.product.price,
        });

        const discount: DineroType =
          item.condition instanceof Array
            ? CalculateHigherDiscount(
                amount,
                item as Omit<Item, 'condition'> & {
                  condition?: Array<DiscountCondition>;
                },
              )
            : item.condition && item.condition?.percentage
            ? CalculatePercentageDiscount(
                amount,
                item as Omit<Item, 'condition'> & {
                  condition?: DiscountCondition;
                },
              )
            : item.quantity
            ? CalculateQuantityDiscount(
                amount,
                item as Omit<Item, 'condition'> & {
                  condition?: DiscountCondition;
                },
              )
            : Money({ amount: 0 });

        return acc.add(amount).subtract(discount);
      }, Money({ amount: 0 }))
      .getAmount();
  }

  summary(): { total: number; items: Array<Item> } {
    const total: number = this.getTotal();
    const items: Array<Item> = this.items;

    return {
      total,
      items,
    };
  }

  checkout(): ReturnType<typeof this.summary> {
    this.items = [];

    return this.summary();
  }
}

export { Money };
