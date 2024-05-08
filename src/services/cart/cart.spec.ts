import { Cart, DiscountCondition, Item, Product } from './cart';

describe('Cart', () => {
  let cart: Cart;

  const product: Product = {
    title: 'Nike Jordan Masc',
    price: 400,
  };

  const product2: Product = {
    title: 'Nike Jordan Fem',
    price: 300,
  };

  beforeEach(() => {
    cart = new Cart();
  });

  describe('addItem()', () => {
    it('should ensure no more than one product exists at a time', () => {
      cart.addItem({
        product,
        quantity: 1,
      });

      cart.addItem({
        product,
        quantity: 2,
      });

      expect(cart.getTotal()).toEqual(800);
    });
  });

  describe('getTotal()', () => {
    it('should return 0 when getTotal is called first time', () => {
      expect(cart.getTotal()).toBe(0);
    });

    it('should multiply quantity and price and receive the total amount', () => {
      const item: Item = {
        product,
        quantity: 2,
      };

      cart.addItem(item);

      expect(cart.getTotal()).toEqual(item.quantity * item.product.price);
    });

    it('should update total when a product gets included and then removeItemd', () => {
      cart.addItem({
        product,
        quantity: 2,
      });

      cart.addItem({
        product: product2,
        quantity: 1,
      });

      cart.removeProduct(product);

      expect(cart.getTotal()).toEqual(300);
    });
  });

  describe('summary()', () => {
    it('should return the total and the list of items when summary() is called', () => {
      cart.addItem({
        product,
        quantity: 5,
      });

      cart.addItem({
        product: product2,
        quantity: 3,
      });

      expect(cart.summary()).toMatchSnapshot();
      expect(cart.getTotal()).toBeGreaterThan(0);
    });
  });

  describe('checkout()', () => {
    it('should return an object with the total and the list of items', () => {
      cart.addItem({
        product,
        quantity: 5,
      });

      cart.addItem({
        product: product2,
        quantity: 3,
      });

      expect(cart.checkout()).toMatchSnapshot();
    });

    it('should reset the cart when checkout() is called', () => {
      cart.addItem({
        product: product2,
        quantity: 3,
      });

      cart.checkout();

      expect(cart.getTotal()).toEqual(0);
    });
  });

  describe('removeItem()', () => {
    it('should removeItem an product succesfully', () => {
      cart.addItem({
        product,
        quantity: 2,
      });

      cart.removeProduct(product);

      expect(cart.getTotal()).toBe(0);
    });
  });

  describe('special conditions', () => {
    it('should apply percentage discount when quantity above minimum is passed', () => {
      const condition = {
        percentage: 5,
        minimum: 3,
      };

      const item = {
        product,
        condition,
        quantity: 4,
      };

      cart.addItem(item);

      expect(cart.getTotal()).toBe(
        item.product.price * item.quantity -
          (item.product.price * item.quantity * condition.percentage) / 100,
      );
    });

    it('should NOT apply percentage discount when item quantity is below or equals condition minimum', () => {
      const condition: DiscountCondition = {
        minimum: 3,
        percentage: 10,
      };

      const item = {
        product,
        condition,
        quantity: 2,
      };

      cart.addItem(item);

      expect(cart.getTotal()).toBe(item.product.price * item.quantity);
    });

    it('should NOT apply quantity discount when item quantity is below or equals condition quantity', () => {
      const condition: DiscountCondition = {
        quantity: 3,
      };

      const item = {
        product,
        condition,
        quantity: 2,
      };

      cart.addItem(item);

      expect(cart.getTotal()).toBe(item.product.price * item.quantity);
    });

    it('should apply quantity discount for even quantities', () => {
      const condition = {
        quantity: 2,
      };

      const item = {
        product,
        condition,
        quantity: 4,
      };

      cart.addItem(item);

      expect(cart.getTotal()).toBe(
        (item.product.price * item.quantity) / condition.quantity,
      );
    });

    it('should apply quantity discount for odd quantities', () => {
      const condition = {
        quantity: 2,
      };

      const item = {
        product,
        condition,
        quantity: 5,
      };

      cart.addItem(item);

      expect(cart.getTotal()).toBe(
        item.product.price * item.quantity -
          item.product.price * item.quantity * 0.4,
      );
    });

    it('should apply the higher discount when 2 or more discount conditions is given', () => {
      const firstCondition: DiscountCondition = {
        quantity: 2,
      };

      const secondCondition: DiscountCondition = {
        percentage: 20,
        minimum: 2,
      };

      const item: Item = {
        product,
        condition: [firstCondition, secondCondition],
        quantity: 3,
      };

      cart.addItem(item);

      expect(cart.getTotal()).toBe(720);
    });

    it('should not apply discount when condition array is empty', () => {
      const item: Item = {
        product,
        condition: [],
        quantity: 3,
      };

      cart.addItem(item);

      expect(cart.getTotal()).toBe(item.product.price * item.quantity);
    });
  });
});
