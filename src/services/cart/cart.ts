import Dinero, { Dinero as DineroType } from 'dinero.js';
import { remove } from 'lodash';
import {
  CalculateHigherDiscount,
  CalculatePercentageDiscount,
  CalculateQuantityDiscount,
  DiscountCondition,
} from './discounts';

const Money = Dinero;

Money.defaultCurrency = 'BRL';
Money.defaultPrecision = 2;

export type Product = {
  title: string;
  price: number;
};

export type Item = {
  product: Product;
  quantity: number;
  condition?: DiscountCondition | Array<DiscountCondition>;
};

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
                  condition: Array<DiscountCondition>;
                },
              )
            : item.condition && item.condition?.percentage
            ? CalculatePercentageDiscount(
                amount,
                item as Omit<Item, 'condition'> & {
                  condition?: DiscountCondition;
                },
              )
            : item.condition && item.condition?.quantity
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
